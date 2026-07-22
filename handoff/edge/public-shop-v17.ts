// public-shop v17 — off-shelf beans stay on the menu as Sold out (2026-07-22 boss):
//   paused rows are no longer dropped from the GET payload; they come back with
//   sold_out:true so the storefront shows the Sold out stamp instead of the coffee
//   vanishing. Rows that never reached Square (no variation_id) stay hidden — there is
//   no price or size to render. Checkout was already safe: allowedVarIds excludes every
//   paused item's variations, so a stale cart line is rejected with "unknown item in cart".
// v16 — Card on File binding page backend (2026-07-21 boss: auto-charge subscriptions):
//   GET ?card=<bind_token>  -> { ok, name, plan, price, bound, app_id, location_id }  (no cache)
//   POST {action:'save_card', token, card_token} -> ensure Square customer -> CreateCard -> store card_id.
//   Card numbers never touch our servers — the Web Payments SDK tokenises in the browser, Square vaults the card.
// v15 — Buy 3 get 1 free (cart checkout, cheapest bag free, once per order; POS mirror).
// v14 — read-only shop window + Square checkout (no login).
// GET  -> { ok, beans:[...], subs:[...] }, cached 5 min.
// POST {action:'checkout', items:[{id:<variation_id>, qty}]} -> multi-line payment link (cart).
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (b: unknown, s = 200, cacheSecs = 0) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json", ...(cacheSecs ? { "Cache-Control": "public, max-age=" + cacheSecs } : {}) } });

const SQUARE_BASE = (Deno.env.get("SQUARE_ENV") || "production") === "sandbox"
  ? "https://connect.squareupsandbox.com"
  : "https://connect.squareup.com";
const SQ_VER = Deno.env.get("SQUARE_API_VERSION") || "2025-01-23";
const APP_URL = (Deno.env.get("APP_URL") || "https://ratio-theta.vercel.app").replace(/\/+$/, "");

function sqHeaders() {
  const token = Deno.env.get("SQUARE_ACCESS_TOKEN");
  if (!token) throw new Error("SQUARE_ACCESS_TOKEN secret not set");
  return { "Authorization": `Bearer ${token}`, "Square-Version": SQ_VER, "Content-Type": "application/json" };
}
async function sqFetch(path: string, init?: RequestInit) {
  const r = await fetch(SQUARE_BASE + path, { ...init, headers: { ...sqHeaders(), ...(init?.headers as Record<string, string> || {}) } });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = (body?.errors || []).map((e: { detail?: string; code?: string }) => e.detail || e.code).join("; ") || `Square HTTP ${r.status}`;
    throw new Error(msg);
  }
  return body;
}
let _locationId: string | null = null;
async function ensureLocationId(): Promise<string> {
  if (_locationId) return _locationId;
  const forced = (Deno.env.get("SQUARE_LOCATION_ID") || "").trim();
  if (forced) { _locationId = forced; return _locationId; }
  const res = await sqFetch("/v2/locations");
  const locs = (res.locations || []).filter((l: { status?: string }) => l.status === "ACTIVE");
  if (!locs.length) throw new Error("no active Square location");
  const online = locs.find((l: { name?: string }) => /online/i.test(String(l.name || "")));
  _locationId = (online || locs[0]).id;
  return _locationId!;
}
const slug = (n: string) => n.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const procKeyOf = (p: unknown) => String(p || "").trim().toLowerCase();
const SUB_RE = /^subscription\s*[—-]/i; // v15: hoisted — checkout needs it too (subs never count toward the free bag)
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// v16: bind-token lookup shared by card_info GET and save_card POST
async function subByToken(admin: ReturnType<typeof createClient>, token: string) {
  if (!UUID_RE.test(token)) return null;
  const { data } = await admin.from("subscriptions")
    .select("id,plan,price,status,card_id,sq_customer_id,customer_id,customers(name,email)")
    .eq("bind_token", token).maybeSingle();
  return data || null;
}

// synced + paused beans' catalog walk — shared by GET (sizes) and POST (validation).
async function catalogForSynced(admin: ReturnType<typeof createClient>) {
  const { data: sync } = await admin.from("product_sync").select("bean_id,variation_id,price,grams,status,process").eq("channel", "square").in("status", ["synced", "paused"]);
  const rows = sync || [];
  const varIds = rows.map((r: { variation_id: string | null }) => r.variation_id).filter(Boolean);
  const itemOfVar = new Map<string, string>();
  const livePrice = new Map<string, number>();
  const imageIdsOfItem = new Map<string, string[]>();
  const sizesOfItem = new Map<string, Array<{ id: string; label: string; price: number | null }>>();
  const allowedVarIds = new Set<string>();
  if (varIds.length) {
    const br = await sqFetch("/v2/catalog/batch-retrieve", {
      method: "POST",
      body: JSON.stringify({ object_ids: varIds, include_related_objects: true }),
    });
    (br.objects || []).forEach((o: Record<string, any>) => {
      if (o.type !== "ITEM_VARIATION") return;
      const amt = o.item_variation_data?.price_money?.amount;
      if (typeof amt === "number") livePrice.set(o.id, amt / 100);
      const itemId = o.item_variation_data?.item_id;
      if (itemId) itemOfVar.set(o.id, itemId);
    });
    const pausedItemIds = new Set<string>();
    rows.forEach((r: { variation_id: string | null; status: string }) => {
      if (r.status !== "paused" || !r.variation_id) return;
      const iid = itemOfVar.get(r.variation_id);
      if (iid) pausedItemIds.add(iid);
    });
    (br.related_objects || []).forEach((o: Record<string, any>) => {
      if (o.type !== "ITEM") return;
      if (Array.isArray(o.item_data?.image_ids)) imageIdsOfItem.set(o.id, o.item_data.image_ids);
      const sizes = (o.item_data?.variations || []).map((v: Record<string, any>) => {
        if (!pausedItemIds.has(o.id)) allowedVarIds.add(v.id);
        const amt = v.item_variation_data?.price_money?.amount;
        return { id: v.id, label: String(v.item_variation_data?.name || ""), price: typeof amt === "number" ? amt / 100 : null };
      });
      sizesOfItem.set(o.id, sizes);
    });
  }
  return { rows, itemOfVar, livePrice, imageIdsOfItem, sizesOfItem, allowedVarIds };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  try {
    if (req.method === "GET") {
      // v16: card binding info — no cache (bound state must be live)
      const cardToken = new URL(req.url).searchParams.get("card");
      if (cardToken) {
        const sub = await subByToken(admin, cardToken.trim());
        if (!sub) return json({ error: "invalid link" }, 404);
        const cust = (sub as Record<string, any>).customers || {};
        return json({
          ok: true,
          name: cust.name || "",
          plan: sub.plan,
          price: sub.price != null ? Number(sub.price) : 25,
          status: sub.status,
          bound: !!sub.card_id,
          app_id: (Deno.env.get("SQUARE_APPLICATION_ID") || "").trim() || null,
          location_id: await ensureLocationId(),
        });
      }
      const { rows, itemOfVar, livePrice, imageIdsOfItem, sizesOfItem } = await catalogForSynced(admin);
      if (!rows.length) return json({ ok: true, beans: [], subs: [] }, 200, 300);
      const names = rows.map((r: { bean_id: string }) => r.bean_id);
      const { data: smps } = await admin.from("samples")
        .select("sample_id,process,features,comment,flavour_locked,cupping_date,bean_id")
        .eq("supplier", "Ratio Coffee").eq("flavour_locked", true).in("sample_id", names)
        .order("cupping_date", { ascending: false });
      const flav = new Map<string, Record<string, unknown>>();
      const flavNP = new Map<string, Record<string, unknown>>();
      (smps || []).forEach((s: { sample_id?: string; process?: string }) => {
        const k = String(s.sample_id || "").trim().toLowerCase();
        if (!k) return;
        if (!flav.has(k)) flav.set(k, s as Record<string, unknown>);
        const kp = k + "|" + procKeyOf(s.process);
        if (!flavNP.has(kp)) flavNP.set(kp, s as Record<string, unknown>);
      });
      const blendMap = new Map<string, Array<{ bean: string; pct: number }>>();
      try {
        const { data: bls } = await admin.from("blends").select("name,parts");
        (bls || []).forEach((b: { name?: string; parts?: Array<{ bean?: string; pct?: string | number }> }) => {
          if (!b.name) return;
          const parts = (Array.isArray(b.parts) ? b.parts : [])
            .filter((p) => p && p.bean && parseFloat(String(p.pct)) > 0)
            .map((p) => ({ bean: String(p.bean), pct: parseFloat(String(p.pct)) }));
          blendMap.set(b.name.trim().toLowerCase(), parts);
        });
      } catch (_e) { /* blends optional */ }
      const originOf = new Map<string, { origin: string; variety: string }>();
      const beanIds = [...new Set([...flav.values()].map((s: Record<string, unknown>) => s.bean_id).filter(Boolean))] as string[];
      if (beanIds.length) {
        try {
          const { data: bs } = await admin.from("beans").select("id,country,region,variety").in("id", beanIds);
          (bs || []).forEach((b: { id: string; country?: string; region?: string; variety?: string }) => {
            originOf.set(b.id, { origin: [b.region, b.country].filter(Boolean).join(", "), variety: b.variety || "" });
          });
        } catch (_e) { /* origin optional */ }
      }
      const latestRoastById = new Map<string, string>();
      const latestRoastByName = new Map<string, string>();
      const latestRoastByNameProc = new Map<string, string>();
      try {
        const { data: rst } = await admin.from("roasts").select("bean_id,bean_name,roast_date,process").in("bean_name", names);
        (rst || []).forEach((r: { bean_id?: string; bean_name?: string; roast_date?: string; process?: string }) => {
          if (!r.roast_date) return;
          if (r.bean_id) {
            const cur = latestRoastById.get(r.bean_id);
            if (!cur || r.roast_date > cur) latestRoastById.set(r.bean_id, r.roast_date);
          }
          const nk = String(r.bean_name || "").trim().toLowerCase();
          if (nk) {
            const cur = latestRoastByName.get(nk);
            if (!cur || r.roast_date > cur) latestRoastByName.set(nk, r.roast_date);
            const nkp = nk + "|" + procKeyOf(r.process);
            const curP = latestRoastByNameProc.get(nkp);
            if (!curP || r.roast_date > curP) latestRoastByNameProc.set(nkp, r.roast_date);
          }
        });
      } catch (_e) { /* roast date optional */ }
      const imgsOf = new Map<string, string[]>();
      try {
        const allImageIds = [...new Set([...imageIdsOfItem.values()].flat())];
        if (allImageIds.length) {
          const ir = await sqFetch("/v2/catalog/batch-retrieve", {
            method: "POST",
            body: JSON.stringify({ object_ids: allImageIds }),
          });
          const urlOfImage = new Map<string, string>();
          (ir.objects || []).forEach((o: Record<string, any>) => {
            if (o.type === "IMAGE" && o.image_data?.url) urlOfImage.set(o.id, o.image_data.url);
          });
          itemOfVar.forEach((itemId, varId) => {
            const ids = imageIdsOfItem.get(itemId) || [];
            const urls = ids.map((iid) => urlOfImage.get(iid)).filter((u): u is string => !!u);
            if (urls.length) imgsOf.set(varId, urls);
          });
        }
      } catch (_e) { /* images are best-effort */ }
      const beans = rows.map((r: { bean_id: string; variation_id: string | null; price: string | number | null; grams: number | null; status: string; process: string | null }) => {
        // v17: paused = off shelf. It stays on the menu as Sold out so customers see the shelf
        // moving rather than the coffee disappearing — but only if it ever reached Square;
        // a row with no variation_id has no live price, sizes or photos to show.
        const off = r.status === "paused";
        if (off && !r.variation_id) return null;
        if (SUB_RE.test(String(r.bean_id || ""))) return null;
        const k = r.bean_id.trim().toLowerCase();
        const s = (r.process != null ? flavNP.get(k + "|" + procKeyOf(r.process)) : flav.get(k)) as { process?: string; features?: string[]; comment?: string; bean_id?: string } | undefined;
        if (!s) return null; // QC gate
        const live = r.variation_id ? livePrice.get(r.variation_id) : undefined;
        const og = s.bean_id ? originOf.get(s.bean_id) : undefined;
        const rd = (r.process != null ? latestRoastByNameProc.get(k + "|" + procKeyOf(r.process)) : null)
          || (s.bean_id && latestRoastById.get(s.bean_id)) || latestRoastByName.get(k) || null;
        const itemId = r.variation_id ? itemOfVar.get(r.variation_id) : undefined;
        const mainPrice = live != null ? live : (r.price != null ? Number(r.price) : null);
        let sizes = (itemId ? sizesOfItem.get(itemId) : undefined) || [];
        if (!sizes.length && r.variation_id) sizes = [{ id: r.variation_id, label: (r.grams || 250) + "g", price: mainPrice }];
        const imgs = (r.variation_id && imgsOf.get(r.variation_id)) || [];
        return {
          name: r.bean_id,
          slug: slug(r.bean_id + (r.process ? " " + r.process : "")),
          process: s.process || r.process || "",
          recipe: blendMap.get(k) || [],
          flavour: (s.features || []).slice(0, 3),
          comment: s.comment || "",
          price: mainPrice,
          grams: r.grams || 250,
          image: imgs[0] || null,
          images: imgs,
          origin: og?.origin || "",
          variety: og?.variety || "",
          roast_date: rd,
          sizes,
          sold_out: off,
        };
      }).filter(Boolean) as Array<Record<string, unknown>>;
      // v17: sold-out beans sink to the bottom of the shelf — the carousel should open on
      // something the customer can actually buy. Stable sort keeps the in-stock order intact.
      beans.sort((a, b) => Number(!!a.sold_out) - Number(!!b.sold_out));
      const subs = rows
        .filter((r: { bean_id: string; status: string; variation_id: string | null }) =>
          SUB_RE.test(String(r.bean_id || "")) && r.status === "synced" && r.variation_id)
        .map((r: { bean_id: string; variation_id: string | null; price: string | number | null; grams: number | null }) => {
          const lp = r.variation_id ? livePrice.get(r.variation_id) : undefined;
          return {
            plan: /blend/i.test(r.bean_id) ? "blend" : "single",
            name: r.bean_id,
            vid: r.variation_id,
            price: lp != null ? lp : (r.price != null ? Number(r.price) : 25),
            grams: r.grams || 150,
          };
        });
      return json({ ok: true, beans, subs }, 200, 300);
    }

    if (req.method !== "POST") return json({ error: "GET or POST only" }, 405);
    const body = await req.json().catch(() => ({}));

    // v16: save a card against a subscription (bind_token authorises — the link IS the key)
    if (String(body.action || "") === "save_card") {
      const token = String(body.token || "").trim();
      const cardToken = String(body.card_token || "").trim();
      if (!token || !cardToken) return json({ error: "token and card_token required" }, 400);
      const sub = await subByToken(admin, token);
      if (!sub) return json({ error: "invalid link" }, 404);
      if (sub.status === "cancelled") return json({ error: "this subscription is cancelled" }, 400);
      const cust = (sub as Record<string, any>).customers || {};
      let sqCust = String(sub.sq_customer_id || "");
      if (!sqCust) {
        const cr = await sqFetch("/v2/customers", {
          method: "POST",
          body: JSON.stringify({
            idempotency_key: crypto.randomUUID(),
            given_name: cust.name || "Ratio subscriber",
            email_address: cust.email || undefined,
            reference_id: "ratio-sub-" + sub.id,
          }),
        });
        sqCust = cr.customer?.id || "";
        if (!sqCust) return json({ error: "could not create Square customer" }, 500);
        await admin.from("subscriptions").update({ sq_customer_id: sqCust }).eq("id", sub.id);
      }
      const oldCard = String(sub.card_id || "");
      const cr2 = await sqFetch("/v2/cards", {
        method: "POST",
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          source_id: cardToken,
          card: { customer_id: sqCust },
        }),
      });
      const card = cr2.card || {};
      if (!card.id) return json({ error: "Square returned no card id" }, 500);
      await admin.from("subscriptions").update({ card_id: card.id, updated_at: new Date().toISOString() }).eq("id", sub.id);
      if (oldCard && oldCard !== card.id) {
        try { await sqFetch(`/v2/cards/${oldCard}/disable`, { method: "POST" }); } catch (_e) { /* old card cleanup is best-effort */ }
      }
      return json({ ok: true, brand: card.card_brand || "", last4: card.last_4 || "" });
    }

    if (String(body.action || "") === "checkout") {
      let lines: Array<{ catalog_object_id: string; quantity: string }> = [];
      const bagPrices: number[] = []; // v15: non-subscription bag prices, one entry per bag — feeds Buy 3 get 1 free
      if (Array.isArray(body.items) && body.items.length) {
        if (body.items.length > 6) return json({ error: "too many lines (max 6)" }, 400);
        const { rows, livePrice, sizesOfItem, allowedVarIds } = await catalogForSynced(admin);
        // every purchasable variation's live price (sync-row mains + 500g/1kg size add-ons)
        const priceOfVar = new Map<string, number>();
        livePrice.forEach((v, k) => priceOfVar.set(k, v));
        sizesOfItem.forEach((sizes) => sizes.forEach((s) => { if (s.price != null) priceOfVar.set(s.id, s.price); }));
        const subVids = new Set<string>(rows.filter((r: { bean_id: string }) => SUB_RE.test(String(r.bean_id || ""))).map((r: { variation_id: string | null }) => r.variation_id || "").filter(Boolean));
        for (const it of body.items) {
          const id = String(it?.id || "").trim();
          let q = parseInt(String(it?.qty || "1"), 10);
          if (isNaN(q) || q < 1) q = 1;
          if (q > 9) q = 9;
          if (!id || !allowedVarIds.has(id)) return json({ error: "unknown item in cart" }, 400);
          lines.push({ catalog_object_id: id, quantity: String(q) });
          if (!subVids.has(id)) {
            const p = priceOfVar.get(id);
            if (typeof p === "number" && p > 0) for (let i = 0; i < q; i++) bagPrices.push(p);
          }
        }
      } else {
        const bean = String(body.bean || "").trim();
        if (!bean) return json({ error: "bean required" }, 400);
        let qty = parseInt(String(body.qty || "1"), 10);
        if (isNaN(qty) || qty < 1) qty = 1;
        if (qty > 5) qty = 5;
        const { data: rowsB } = await admin.from("product_sync").select("bean_id,variation_id,status")
          .eq("channel", "square").eq("bean_id", bean).eq("status", "synced").limit(1);
        const row = (rowsB || [])[0];
        if (!row || !row.variation_id) return json({ error: "this coffee is not available right now" }, 400);
        lines = [{ catalog_object_id: row.variation_id, quantity: String(qty) }];
      }
      const locationId = await ensureLocationId();
      const pctRaw = Number(Deno.env.get("SURCHARGE_PCT") ?? "2.2");
      const pct = (isFinite(pctRaw) && pctRaw > 0 && pctRaw <= 10) ? pctRaw : 0;
      const order: Record<string, unknown> = {
        location_id: locationId,
        line_items: lines,
      };
      // v15: Buy 3 get 1 free — 4+ bags, cheapest bag free, once per order (mirrors POS discount).
      // Fixed order-level discount; SUBTOTAL_PHASE surcharge below is calculated after discounts.
      let bogoOff = 0;
      if (bagPrices.length >= 4) bogoOff = Math.min(...bagPrices);
      if (bogoOff > 0) {
        order.discounts = [{
          name: "Buy 3 get 1 free — cheapest bag",
          amount_money: { amount: Math.round(bogoOff * 100), currency: "AUD" },
          scope: "ORDER",
        }];
      }
      if (pct > 0) {
        order.service_charges = [{
          name: `Card surcharge ${pct}%`,
          percentage: String(pct),
          calculation_phase: "SUBTOTAL_PHASE",
        }];
      }
      const res = await sqFetch("/v2/online-checkout/payment-links", {
        method: "POST",
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          order,
          checkout_options: {
            allow_tipping: false,
            ask_for_shipping_address: true,
            redirect_url: APP_URL + "/new/?checkout=done",
          },
        }),
      });
      const link = res.payment_link || {};
      if (!link.url) return json({ error: "Square returned no link" }, 500);
      const ordTotal = res.related_resources?.orders?.[0]?.total_money?.amount;
      return json({ ok: true, url: link.url, id: link.id || null, total: typeof ordTotal === "number" ? ordTotal / 100 : null, surcharge_pct: pct, bogo_off: bogoOff || 0 });
    }
    return json({ error: "unknown action" }, 400);
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
