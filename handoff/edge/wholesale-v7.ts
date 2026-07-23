// wholesale v7 — self-service ordering for wholesale accounts (JWT required).
// v7 (2026-07-23): the menu now returns images[] (every photo of the item), not just image.
//     v6 kept only the first photo, so a wholesale login saw the old single brand card —
//     different crop (790×1096 portrait) and no four-photo swipe, while the retail shop
//     (public-shop v18) showed the square four-image carousel. Same field name/shape as
//     public-shop so the shared card renderer (shopIsPhotoSet -> images.length > 1) matches.
// POST {action:'menu'}     -> { ok, discount_pct, moq:{threshold,delivery_fee}, bank, beans:[...] }
//                             beans same shape as public-shop GET, but price/sizes[].price are
//                             wholesale (retail × (1−pct/100)); sizes[].retail keeps the shelf price.
// POST {action:'checkout', items:[{id:<variation_id>, qty}]} -> creates an app order directly
//                             (channel 'wholesale', bank_transfer, pending_payment), Square quick_pay
//                             link for optional card payment (surcharge disclosed), confirmation
//                             email (bank block comes free from send-email), push + messages note.
// Pricing is ALWAYS recomputed server-side from the live Square catalog — client sends no prices.
// Discount lives in app_state 'ws_discount' {pct, overrides}; staff-locked by RLS (wholesale_lane_rls).
// Catalog walk copied from public-shop v8; quick_pay + location + surcharge copied from
// sync-to-square v19; callSendEmail/callPush copied from square-webhook v18.
// v2: menu response also carries bank (portal 'Payment details' drawer needs it).
// v3: sold-out beans (product_sync status 'paused') stay ON the wholesale menu with sold_out:true
//     (boss rule 2026-07-08 — keep the range visible, e.g. the only co-ferment). Their variations
//     are excluded from allowedVarIds so checkout rejects them. Mirrors public-shop v8.
// v4: per-coffee discount overrides (boss 2026-07-17, plan B). ws_discount value grows an optional
//     overrides map {"<bean name lowercase>": pct}. pctFor(bean) = override ?? default pct — applied
//     in BOTH menu pricing and checkout repricing. beans[] carries discount_pct actually used.
//     No overrides key -> identical behaviour to v3.
// v5: per-ACCOUNT discount (boss 2026-07-22). customers.ws_pct (0–90, null = not negotiated) is the
//     rate agreed with that one cafe and beats everything else: pctFor = ws_pct ?? (override ?? default).
//     The login is matched to a customer row by email — same rule checkout already used, now lifted
//     into resolveCustomer() so the MENU knows who is looking too (v4 priced the menu blind).
//     discount_pct in the menu response is the account rate when there is one. A caller with no
//     customer row (the director looking at the lane) falls back to the shop-wide default = v4 behaviour.
// v6: real stock decides sold out, same gate public-shop v18 got (2026-07-22, hole ③). A bean with
//     nothing left in the roastery AND nothing at Crows Nest comes back sold_out:true and its
//     variations leave allowedVarIds, so a wholesale cart line for it is rejected. Keyed by bean
//     NAME only and fail-open on a query error — see public-shop v18 for the reasoning.
import { createClient } from "npm:@supabase/supabase-js@2";

const SUB_RE = /^subscription\s*[—-]/i;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

const SQUARE_BASE = (Deno.env.get("SQUARE_ENV") || "production") === "sandbox"
  ? "https://connect.squareupsandbox.com"
  : "https://connect.squareup.com";
const SQ_VER = Deno.env.get("SQUARE_API_VERSION") || "2025-01-23";

const MOQ_THRESHOLD = 150; // AUD — cart subtotal at or over this ships free (boss: compare subtotal directly)
const DELIVERY_FEE = 20;   // AUD — added as an items line under the threshold

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
  if (forced) { _locationId = forced; return _locationId!; }
  const res = await sqFetch("/v2/locations");
  const locs = (res.locations || []).filter((l: { status?: string }) => l.status === "ACTIVE");
  if (!locs.length) throw new Error("no active Square location");
  const online = locs.find((l: { name?: string }) => /online/i.test(String(l.name || "")));
  _locationId = (online || locs[0]).id;
  return _locationId!;
}
const slug = (n: string) => n.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const wsPrice = (retail: number, pct: number) => Math.round(retail * (1 - pct / 100) * 100) / 100;
const gramsOfLabel = (label: string): number | null => {
  const m = String(label || "").trim().toLowerCase().match(/^([\d.]+)\s*(g|kg)$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return isFinite(n) ? Math.round(m[2] === "kg" ? n * 1000 : n) : null;
};

// v5: login -> customer row, by email. Prefer the shop-type row (a cafe owner may also have a home
// account under the same address). Returns null when nothing matches — menu still works on the
// shop-wide default, checkout refuses (it needs a customer_id to file the order against).
type WsCustomer = { id: string; name: string | null; type: string | null; ws_pct: number | null };
async function resolveCustomer(admin: ReturnType<typeof createClient>, email: string): Promise<WsCustomer | null> {
  const e = String(email || "").trim().toLowerCase();
  if (!e) return null;
  const { data } = await admin.from("customers").select("id,name,type,ws_pct").ilike("email", e);
  const rows = (data || []) as WsCustomer[];
  return rows.find((c) => c.type === "shop") || rows[0] || null;
}

// catalog walk (public-shop v8: synced + paused) + varInfo: EVERY variation of a listed item -> label/price/bean.
// Paused (sold-out) items ride along for display; their variations are NOT added to allowedVarIds.
// v6: kg on hand per bean name (roastery batches + Crows Nest shelf). null = query failed -> gate off.
async function stockByName(admin: ReturnType<typeof createClient>, names: string[]): Promise<Map<string, number> | null> {
  if (!names.length) return new Map();
  try {
    const [rq, tq] = await Promise.all([
      admin.from("roasts").select("bean_name,remaining_kg,qc").in("bean_name", names),
      admin.from("transfers").select("name,kg,status").in("status", ["pool", "settled"]),
    ]);
    if (rq.error || tq.error) return null;
    const kg = new Map<string, number>();
    const add = (n: unknown, v: unknown) => {
      const k = String(n || "").trim().toLowerCase();
      const num = Number(v);
      if (!k || !isFinite(num) || num <= 0) return;
      kg.set(k, (kg.get(k) || 0) + num);
    };
    (rq.data || []).forEach((r: { bean_name?: string; remaining_kg?: number; qc?: string | null }) => {
      if (r.qc && r.qc !== "pass") return;
      add(r.bean_name, r.remaining_kg);
    });
    (tq.data || []).forEach((t: { name?: string; kg?: number }) => add(t.name, t.kg));
    return kg;
  } catch (_e) {
    return null;
  }
}

async function catalogForSynced(admin: ReturnType<typeof createClient>) {
  const { data: sync } = await admin.from("product_sync").select("bean_id,variation_id,price,grams,status").eq("channel", "square").in("status", ["synced", "paused"]);
  const rows = sync || [];
  const stock = await stockByName(admin, [...new Set(rows.map((r: { bean_id: string }) => r.bean_id).filter(Boolean))]);
  const outOfStock = (bean: unknown) => {
    if (!stock) return false;
    const b = String(bean || "");
    if (SUB_RE.test(b)) return false;
    return (stock.get(b.trim().toLowerCase()) || 0) <= 0;
  };
  const varIds = rows.map((r: { variation_id: string | null }) => r.variation_id).filter(Boolean);
  const itemOfVar = new Map<string, string>();
  const livePrice = new Map<string, number>();
  const imageIdsOfItem = new Map<string, string[]>();
  const sizesOfItem = new Map<string, Array<{ id: string; label: string; price: number | null }>>();
  const allowedVarIds = new Set<string>();
  const varInfo = new Map<string, { label: string; price: number | null; itemId: string }>();
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
    // paused OR nothing left anywhere (v6) — visible on the menu but not purchasable
    const pausedItemIds = new Set<string>();
    rows.forEach((r: { variation_id: string | null; status: string; bean_id: string }) => {
      if (!r.variation_id) return;
      if (r.status !== "paused" && !outOfStock(r.bean_id)) return;
      const iid = itemOfVar.get(r.variation_id);
      if (iid) pausedItemIds.add(iid);
    });
    (br.related_objects || []).forEach((o: Record<string, any>) => {
      if (o.type !== "ITEM") return;
      if (Array.isArray(o.item_data?.image_ids)) imageIdsOfItem.set(o.id, o.item_data.image_ids);
      const sizes = (o.item_data?.variations || []).map((v: Record<string, any>) => {
        if (!pausedItemIds.has(o.id)) allowedVarIds.add(v.id);
        const amt = v.item_variation_data?.price_money?.amount;
        const entry = { id: v.id, label: String(v.item_variation_data?.name || ""), price: typeof amt === "number" ? amt / 100 : null };
        varInfo.set(v.id, { label: entry.label, price: entry.price, itemId: o.id });
        return entry;
      });
      sizesOfItem.set(o.id, sizes);
    });
  }
  // itemId -> bean name (via the synced main variation)
  const beanOfItem = new Map<string, string>();
  rows.forEach((r: { bean_id: string; variation_id: string | null }) => {
    if (!r.variation_id) return;
    const it = itemOfVar.get(r.variation_id);
    if (it) beanOfItem.set(it, r.bean_id);
  });
  return { rows, itemOfVar, livePrice, imageIdsOfItem, sizesOfItem, allowedVarIds, varInfo, beanOfItem, outOfStock };
}

async function readState(admin: ReturnType<typeof createClient>, keys: string[]) {
  const { data } = await admin.from("app_state").select("key,value").in("key", keys);
  const out: Record<string, unknown> = {};
  (data || []).forEach((r: { key: string; value: unknown }) => { out[r.key] = r.value; });
  return out;
}

async function callSendEmail(payload: Record<string, unknown>) {
  const url = Deno.env.get("SUPABASE_URL") + "/functions/v1/send-email";
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body?.error || `send-email HTTP ${r.status}`);
  return body;
}
async function callPush(title: string, body: string) {
  try {
    await fetch(Deno.env.get("SUPABASE_URL") + "/functions/v1/push-send", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body, url: "/new/" }),
    });
  } catch (e) { console.error("push-send:", e); }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  try {
    // --- who is calling (same pattern as sync-to-square) ---
    const auth = req.headers.get("Authorization") || "";
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);
    const { data: prof } = await admin.from("profiles").select("role").eq("id", user.id).single();
    const role = prof?.role || "";
    if (role !== "wholesale" && role !== "director") return json({ error: "wholesale accounts only" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");

    const state = await readState(admin, ["ws_discount", "bank_details"]);
    const pctRaw = Number((state.ws_discount as { pct?: number } | undefined)?.pct);
    const pct = (isFinite(pctRaw) && pctRaw > 0 && pctRaw <= 90) ? pctRaw : 0;
    // v4: per-coffee overrides — key is the bean name trimmed + lowercased (same key rule as the flavour map)
    const ovRaw = (state.ws_discount as { overrides?: Record<string, unknown> } | undefined)?.overrides || {};
    const overrides = new Map<string, number>();
    Object.entries(ovRaw).forEach(([k, v]) => {
      const n = Number(v);
      if (isFinite(n) && n >= 0 && n <= 90) overrides.set(String(k).trim().toLowerCase(), n);
    });
    // v5: the rate agreed with THIS cafe wins over the per-coffee overrides and the shop-wide default
    const cust = await resolveCustomer(admin, user.email || "");
    const acctRaw = Number(cust?.ws_pct);
    const acctPct = (cust && cust.ws_pct != null && isFinite(acctRaw) && acctRaw >= 0 && acctRaw <= 90) ? acctRaw : null;
    const pctFor = (bean: string): number => {
      if (acctPct != null) return acctPct;
      const o = overrides.get(String(bean || "").trim().toLowerCase());
      return o != null ? o : pct;
    };
    const shownPct = acctPct != null ? acctPct : pct; // what the portal prints as "your pricing"
    const bank = (state.bank_details as { name?: string; bsb?: string; account?: string } | undefined) || null;
    const bankOut = bank ? { name: bank.name || "", bsb: bank.bsb || "", account: bank.account || "" } : null;

    if (action === "menu") {
      // same shelf as the public shop (QC gate: flavour-locked samples), wholesale prices applied
      const { rows, itemOfVar, livePrice, imageIdsOfItem, sizesOfItem, outOfStock } = await catalogForSynced(admin);
      if (!rows.length) return json({ ok: true, discount_pct: shownPct, moq: { threshold: MOQ_THRESHOLD, delivery_fee: DELIVERY_FEE }, bank: bankOut, beans: [] });
      const names = rows.map((r: { bean_id: string }) => r.bean_id);
      const { data: smps } = await admin.from("samples")
        .select("sample_id,process,features,comment,flavour_locked,cupping_date,bean_id")
        .eq("supplier", "Ratio Coffee").eq("flavour_locked", true).in("sample_id", names)
        .order("cupping_date", { ascending: false });
      const flav = new Map<string, Record<string, unknown>>();
      (smps || []).forEach((s: { sample_id?: string }) => {
        const k = String(s.sample_id || "").trim().toLowerCase();
        if (k && !flav.has(k)) flav.set(k, s as Record<string, unknown>);
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
      // v7: keep EVERY photo of the item, not just the first one — the storefront card renders the
      // four-image swipe only when images.length > 1 (shopIsPhotoSet). Same shape as public-shop v18.
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
      } catch (_e) { /* images best-effort */ }
      const beans = rows.map((r: { bean_id: string; variation_id: string | null; price: string | number | null; grams: number | null; status: string }) => {
        const k = r.bean_id.trim().toLowerCase();
        const s = flav.get(k) as { process?: string; features?: string[]; comment?: string } | undefined;
        if (!s) return null; // QC gate
        const bp = pctFor(r.bean_id); // v5: account rate ?? per-coffee override ?? default
        const live = r.variation_id ? livePrice.get(r.variation_id) : undefined;
        const retailMain = live != null ? live : (r.price != null ? Number(r.price) : null);
        const itemId = r.variation_id ? itemOfVar.get(r.variation_id) : undefined;
        const imgs = (r.variation_id && imgsOf.get(r.variation_id)) || [];
        let sizes = (itemId ? sizesOfItem.get(itemId) : undefined) || [];
        if (!sizes.length && r.variation_id) sizes = [{ id: r.variation_id, label: (r.grams || 250) + "g", price: retailMain }];
        const wsSizes = sizes.map((v) => ({
          id: v.id, label: v.label,
          retail: v.price,
          price: v.price != null ? wsPrice(v.price, bp) : null,
        }));
        return {
          name: r.bean_id,
          slug: slug(r.bean_id),
          process: s.process || "",
          recipe: blendMap.get(k) || [],
          flavour: (s.features || []).slice(0, 3),
          comment: s.comment || "",
          price: retailMain != null ? wsPrice(retailMain, bp) : null,
          retail: retailMain,
          discount_pct: bp,
          grams: r.grams || 250,
          image: imgs[0] || null,
          images: imgs, // v7: four-image swipe on the wholesale card, same as the retail shop
          sizes: wsSizes,
          sold_out: r.status === "paused" || outOfStock(r.bean_id), // v6: empty shelves count as sold out
        };
      }).filter(Boolean);
      return json({ ok: true, discount_pct: shownPct, moq: { threshold: MOQ_THRESHOLD, delivery_fee: DELIVERY_FEE }, bank: bankOut, beans });
    }

    if (action === "checkout") {
      if (!Array.isArray(body.items) || !body.items.length) return json({ error: "cart is empty" }, 400);
      if (body.items.length > 12) return json({ error: "too many lines (max 12)" }, 400);
      // the login was already mapped to a customer record above (v5: resolveCustomer)
      if (!String(user.email || "")) return json({ error: "account has no email" }, 403);
      if (!cust) return json({ error: "no customer record matches this login email — ask Ratio to link your account" }, 403);

      const { allowedVarIds, varInfo, beanOfItem } = await catalogForSynced(admin);
      const items: Array<{ name: string; grams: number | null; qty: number; price: number }> = [];
      let subtotal = 0;
      for (const it of body.items) {
        const id = String(it?.id || "").trim();
        let q = parseInt(String(it?.qty || "1"), 10);
        if (isNaN(q) || q < 1) q = 1;
        if (q > 40) q = 40;
        const info = id ? varInfo.get(id) : undefined;
        if (!id || !allowedVarIds.has(id) || !info) return json({ error: "unknown item in cart" }, 400);
        if (info.price == null) return json({ error: "an item in the cart has no price" }, 400);
        const bean = beanOfItem.get(info.itemId) || "Coffee";
        const unit = wsPrice(info.price, pctFor(bean)); // v5: account rate ?? per-coffee pct
        items.push({ name: bean, grams: gramsOfLabel(info.label), qty: q, price: unit });
        subtotal += unit * q;
      }
      subtotal = Math.round(subtotal * 100) / 100;
      const deliveryFee = subtotal >= MOQ_THRESHOLD ? 0 : DELIVERY_FEE;
      if (deliveryFee) items.push({ name: "Delivery fee", grams: null, qty: 1, price: DELIVERY_FEE });
      const total = Math.round((subtotal + deliveryFee) * 100) / 100;

      const { data: inserted, error: insErr } = await admin.from("orders").insert({
        channel: "wholesale",
        status: "New",
        customer_id: cust.id,
        items,
        total,
        currency: "AUD",
        payment_method: "bank_transfer",
        payment_status: "pending_payment",
        notes: "Wholesale self-service order",
      }).select("id,order_no").single();
      if (insErr) throw insErr;
      const orderId = inserted.id;
      const no = "#" + String(inserted.order_no).padStart(4, "0");

      // Square quick_pay link (sync-to-square v19 pattern) — non-fatal, bank transfer still works
      let payUrl: string | null = null;
      try {
        const scRaw = Number(Deno.env.get("SURCHARGE_PCT") ?? "2.2");
        const sc = (isFinite(scRaw) && scRaw > 0 && scRaw <= 10) ? scRaw : 0;
        const charged = Math.round(total * 100 * (1 + sc / 100));
        const label = sc > 0 ? ` (incl ${sc}% card surcharge)` : "";
        const locationId = await ensureLocationId();
        const res = await sqFetch("/v2/online-checkout/payment-links", {
          method: "POST",
          body: JSON.stringify({
            idempotency_key: crypto.randomUUID(),
            quick_pay: {
              name: `Ratio Coffee Wholesale ${no}${label}`.trim(),
              price_money: { amount: charged, currency: "AUD" },
              location_id: locationId,
            },
            checkout_options: { allow_tipping: false },
          }),
        });
        const link = res.payment_link || {};
        if (link.url) {
          payUrl = link.url;
          await admin.from("orders").update({ payment_link: link.url, payment_link_id: link.id || null, square_order_id: link.order_id || null }).eq("id", orderId);
        }
      } catch (e) { console.error("wholesale payment link:", e); }

      const summary = items.map((i) => i.name + (i.grams ? " " + i.grams + "g" : "") + " × " + i.qty).join(", ");
      try {
        await admin.from("messages").insert({
          title: "新訂單 " + no + " · Wholesale",
          preview: (cust.name ? cust.name + " · " : "") + summary + " · A$" + total.toFixed(2),
          channel: "general",
          unread: true,
        });
      } catch (_e) { /* non-fatal */ }
      await callPush(`New wholesale order ${no} · $${total.toFixed(2)}`, (cust.name ? cust.name + " — " : "") + (summary || "open Ratio to accept it"));
      try { await callSendEmail({ action: "order_confirmation", order_id: orderId }); }
      catch (e) { console.error("wholesale confirmation mail:", e); }

      return json({
        ok: true,
        order_id: orderId,
        order_no: inserted.order_no,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        pay_url: payUrl,
        bank: bankOut ? { ...bankOut, reference: no } : null,
      });
    }

    return json({ error: "unknown action" }, 400);
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
