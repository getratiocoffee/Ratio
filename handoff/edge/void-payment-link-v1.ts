// void-payment-link v1 — 作廢一張訂單的 Square 付款連結（2026-07-22 補洞）
//
// 為什麼是獨立函式而不是加進 sync-to-square：那支管上架／訂閱扣款／建付款連結，600 行動不得；
// 這件事只有一個動作、破壞力低（最壞是客人暫時付不了款，重開一條就好），拆開來壞了也不會波及營運。
//
// POST {order_id}
//   → 已付款：拒絕（那是退款的事，退款一律去 Square 後台做）
//   → 沒連結：ok:true, voided:false
//   → 有連結：DELETE Square payment-link，然後清掉 orders.payment_link / payment_link_id
//
// 權限：取消訂單本來就開放給店裡的人（今日流 Cancel order roles=director/retail/staff），
// 所以這裡放行同一批；wholesale／customer 一律擋。
import { createClient } from "npm:@supabase/supabase-js@2";

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

const STAFF_ROLES = ["director", "staff", "retail", "roaster"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  try {
    const auth = req.headers.get("Authorization") || "";
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);
    const { data: prof } = await admin.from("profiles").select("role").eq("id", user.id).single();
    const role = String(prof?.role || "");
    if (!STAFF_ROLES.includes(role)) return json({ error: "staff only" }, 403);

    const body = await req.json().catch(() => ({}));
    const orderId = String(body.order_id || "").trim();
    if (!orderId) return json({ error: "order_id required" }, 400);

    const { data: o } = await admin.from("orders")
      .select("id,order_no,payment_link,payment_link_id,payment_status").eq("id", orderId).single();
    if (!o) return json({ error: "order not found" }, 404);
    if (o.payment_status === "paid") {
      return json({ error: "order is already paid — refund it in Square instead of voiding the link" }, 400);
    }
    if (!o.payment_link && !o.payment_link_id) {
      return json({ ok: true, voided: false, reason: "no link on this order" });
    }

    let gone = false, err = "";
    if (o.payment_link_id) {
      const token = Deno.env.get("SQUARE_ACCESS_TOKEN");
      if (!token) return json({ error: "SQUARE_ACCESS_TOKEN secret not set" }, 500);
      const r = await fetch(`${SQUARE_BASE}/v2/online-checkout/payment-links/${o.payment_link_id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}`, "Square-Version": SQ_VER, "Content-Type": "application/json" },
      });
      if (r.ok) gone = true;
      else {
        const b = await r.json().catch(() => ({}));
        const msg = (b?.errors || []).map((e: { detail?: string; code?: string }) => e.detail || e.code).join("; ")
          || `Square HTTP ${r.status}`;
        // 連結早就不在 Square 了＝目的已達成，照樣清 DB 這一側
        if (r.status === 404 || /not found/i.test(msg)) gone = true; else err = msg;
      }
    } else {
      gone = true; // 只有 url 沒有 id（很舊的資料）：Square 那條無從刪起，至少把 DB 這側清乾淨
    }
    if (!gone) return json({ error: err || "could not void the link" }, 500);

    await admin.from("orders").update({ payment_link: null, payment_link_id: null }).eq("id", orderId);
    try {
      await admin.from("activity_log").insert({
        action: "voided payment link",
        ref: "#" + String(o.order_no ?? "").padStart(4, "0"),
        note: null,
      });
    } catch (_e) { /* 記不到帳不影響作廢本身 */ }
    return json({ ok: true, voided: true, order_no: o.order_no });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
