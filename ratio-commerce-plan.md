# Ratio Commerce Extension — Project Brief

## Context
Ratio is a single-file PWA (`index.html` + `theme.css` + `logo.png`) for Ratio Coffee,
a specialty roaster in Crows Nest, Sydney. Backend: Supabase (ref: `kjhudxzvidhynpabnalp`).
Deployed at ratio-theta.vercel.app via GitHub → Vercel auto-deploy.

Owner: Daniel. Two director users: Wu (getratiocoffee@gmail.com) and Yi (yi.create.y@gmail.com).

## Daniel's Role
Daniel only does three things: **Roast → Confirm → Dispatch**
Everything else must be handled by the system.

## Customer Types
- Coffee shop owners (regular bulk replenishment, subscription)
- Home users (retail small packs, subscription)
- Event groups (rare, one-off large orders)
- Overseas customers (occasional)

## Sales Channels
| Channel | Audience | Priority |
|---------|----------|----------|
| Square Online Store | All | Primary |
| Instagram Shop | Home users, new customers | Secondary |
| Subscription (recurring) | Shops + loyal home users | Secondary |

---

## Core Workflow

```
客人下單
   ↓
系統自動發確認信給客人（正在處理）
系統即時通知 Daniel 新訂單
   ↓
系統檢查生豆庫存是否足夠
   ↓
┌─ 足夠 ──────────────────────────────┐
│                                      │
│  計算所需生豆量                       │
│  ├── 拼配：按 recipe 比例換算          │
│  └── 單品：直接換算                   │
│         ↓                            │
│  合併當天所有訂單 → 總烘焙排程         │
│         ↓                            │
│  Daniel：烘豆                         │
│         ↓                            │
│  Fulfill Orders（訂單優先出貨）        │
│         ↓                            │
│  剩餘 → Ratio Crows Nest 店面         │
│         ↓                            │
│  扣減生豆庫存                         │
│         ↓                            │
│  庫存警訊                             │
│  ├── 拼配：剩幾週的量                  │
│  └── 單品：running low 提醒           │
└──────────────────────────────────────┘

└─ 不夠 ──────────────────────────────┐
│                                      │
│  系統即時通知 Daniel：                 │
│  「庫存不足，Ratio Crows Nest          │
│   店面有現貨，要調貨嗎？」             │
│         ↓                            │
│  Daniel 決定                          │
│  ├── 確認調貨                         │
│  │    ↓                              │
│  │   繼續烘焙流程（店面庫存人工處理）   │
│  │                                   │
│  └── 拒絕調貨                         │
│       ↓                              │
│      暫停該品項接單                    │
│      自動回覆客人（缺貨）              │
└──────────────────────────────────────┘
```

## System Responsibilities
| Step | What the system does |
|------|----------------------|
| Order received | Instant notification to Daniel + confirmation email to customer |
| Inventory check | Auto-compare order needs vs current green bean stock |
| Stock insufficient | Instant notification to Daniel asking about store transfer |
| Transfer rejected | Pause item listings + auto-reply to customer (out of stock) |
| Roast scheduling | Merge all orders for the day, calculate total green bean kg needed |
| Fulfillment | Orders first, remainder goes to Ratio Crows Nest |
| Inventory deduction | Auto-update Green after dispatch |
| Inventory alerts | Low stock instant notification to Daniel |

## Store Transfer Logic
- Store inventory (Ratio Crows Nest) is managed manually — system does NOT track it
- When green bean stock is insufficient, system checks if store has finished product
- System sends Daniel an instant transfer request notice:
  - Bean name + quantity needed
  - Confirmation: transfer from store OR reject
- If confirmed: fulfillment continues, store inventory adjusted manually
- If rejected: item paused, customer notified of out-of-stock
- Transfer unit: finished roasted product (not green beans)

## Future (noted, not building now)
- Packaging / label integration (Generate Label module already has foundation)
- Store inventory system (currently manual)

---

## Subscription Logic
- Customer chooses plan: weekly / fortnightly / monthly
- Bean: fixed selection OR curator's pick each cycle
- Supabase auto-creates order before cycle expires
- Notifies Daniel to roast
- Auto-dispatches → deducts Green inventory → sends confirmation email

## Security Requirements (NON-NEGOTIABLE)
1. ALL platform API keys (Square, Instagram) must live in Supabase Edge Functions — NEVER in index.html
2. Square Webhook must verify signature before accepting orders
3. Customer order data must be RLS-isolated (Directors see all, customers see own only)

---

## Existing Ratio Architecture (must be preserved)
- Single `index.html` — all JS/CSS in one file, no build step
- Supabase anon key in frontend is safe because RLS is enforced
- Brand: Fraunces (display), Inter (UI), Space Mono (data). Colors: blush #F4ECEA, berry #B25E6A, ink #322B2A
- Dock architecture: two clusters (Shop/Roastery) flanking center folder
- `Order` dock node already exists in DOCK_NODES but is unbuilt (soon:true → shows "開發中")
- Existing tables: profiles, app_state, beans, roasts, samples, timesheets, messages

## New Supabase Tables Needed
```sql
-- Orders (all channels)
orders (id, channel, status, customer_id, items jsonb, total, currency,
        shipping_address jsonb, notes, created_at, dispatched_at)

-- Customers
customers (id, name, email, phone, type [shop|home|event|overseas],
           address jsonb, notes, created_at)

-- Subscriptions
subscriptions (id, customer_id, bean_id, quantity_g, frequency [weekly|fortnightly|monthly],
               next_order_date, status [active|paused|cancelled], created_at)

-- Platform sync state
product_sync (id, bean_id, channel, external_id, last_synced_at, status)
```

## Supabase Edge Functions Needed
- `sync-to-square` — push Retail Info product to Square Catalog API
- `sync-to-instagram` — push product to Meta Commerce API
- `square-webhook` — receive Square orders, verify signature, write to orders table
- `subscription-cron` — daily check, auto-create orders for due subscriptions
- `send-email` — confirmation emails, subscription renewal reminders, Daniel notifications

---

## Development Phases

### Phase 1 — Order Module (index.html only, no external APIs)
**Goal:** Daniel can see and manage orders inside Ratio
- Add `orders` + `customers` tables to Supabase
- Build Order module in index.html (replaces "開發中" placeholder)
- Views: order list → order detail, filter by status / channel / customer type
- Statuses: New → Confirmed → Roasting → Ready → Dispatched
- Overseas orders flagged with a label
- Transfer request notice UI (store transfer decision)
- Inventory check logic (compare order needs vs Green stock)

### Phase 2 — Square Sync (Edge Functions)
**Goal:** Retail Info beans auto-publish to Square
- Square Developer account + API key stored in Supabase secrets
- Edge Function: `sync-to-square`
- Trigger: button in Retail Info card ("Push to Square")
- Add `product_sync` table
- Square Webhook Edge Function → receive orders → write to orders table
- Webhook signature verification
- Auto-pause listing when out of stock

### Phase 3 — Email & Notifications
**Goal:** Automated communications
- Edge Function: `send-email` (Resend or Supabase SMTP)
- Instant order confirmation to customer
- Instant new order notification to Daniel
- Instant low-stock alert to Daniel
- Instant transfer request notification to Daniel
- Out-of-stock auto-reply to customer
- Bean info email generator (Daniel selects beans → generates draft)

### Phase 4 — Instagram Shop Sync
**Goal:** Same products auto-sync to Instagram
- Meta Commerce API
- Edge Function: `sync-to-instagram`
- Reuse product layer from Phase 2

### Phase 5 — Subscription Module
**Goal:** Recurring order management
- Add `subscriptions` table
- Subscription management UI in Order module
- Edge Function: `subscription-cron` (daily, auto-create orders)
- Renewal reminder emails

### Phase 6 — Roast & Inventory Integration
**Goal:** Orders drive roasting and inventory
- Order → auto-calculate green bean kg needed (blend recipe + single origin)
- Merge same-day orders into one roast batch
- Dispatch → auto-deduct Green inventory
- Link Order detail to Roast record
- Inventory alert thresholds (weeks remaining for blends, kg threshold for singles)

---

## How to Start Each Conversation

### Phase 1:
```
我要開始 Ratio Commerce Phase 1 — Order Module。
請先從 GitHub 抓最新的 index.html：
https://raw.githubusercontent.com/getratiocoffee/Ratio/main/index.html

任務：
1. 在 Supabase 建立 orders 和 customers 表
2. 在 index.html 建立 Order 模組（取代目前的 soon:true 佔位符）
3. 訂單列表、狀態流程、海外標記、調貨通知單
```

### Phase 2:
```
我要開始 Ratio Commerce Phase 2 — Square Sync。
Phase 1 已完成。
請先從 GitHub 抓最新的 index.html：
https://raw.githubusercontent.com/getratiocoffee/Ratio/main/index.html

我的 Square API Key 是：[貼上]
任務：建立 Square 同步 Edge Function + Webhook 接收訂單
```

### Phase 3:
```
我要開始 Ratio Commerce Phase 3 — Email & Notifications。
Phase 1 + 2 已完成。
請先從 GitHub 抓最新的 index.html：
https://raw.githubusercontent.com/getratiocoffee/Ratio/main/index.html

我的 Email 服務 API Key 是：[貼上]
任務：建立 send-email Edge Function，接通所有自動通知
```

### Phase 4–6:
Same pattern — fetch latest index.html from GitHub, state which phase, paste required API keys.

---

## Key Technical Notes for Claude
- Always fetch live source from GitHub before editing (local may be stale)
- Validation pipeline before every delivery:
  1. Python regex extract largest `<script>` block → main.js
  2. `node --check main.js`
  3. `node -e "new Function(...)"` constructor test
  4. Both pass → cp to outputs → present_files
- Use str_replace for surgical edits, never rewrite whole file
- jsPDF is ASCII/Helvetica only — no CJK in PDFs
- `supplier = 'Ratio Coffee'` discriminates internal roasts from external samples
- Blend data: bean_id=null, kind='blend', recipes in localStorage ratio_blends
- Color lookups must be live via beanColorFor(), never cached
- present_files after every index.html change without being asked
- Reply in Traditional Chinese, terse and direct

---

## Payment Handling

### Platform Payments (Square / Instagram)
- Auto-confirmed by platform
- Order status automatically advances

### Bank Transfer
- Customer receives confirmation email with:
  - Order number (e.g. #0042)
  - Exact amount
  - Bank details
  - Instruction to use order number as transfer reference
- Order status set to `pending_payment`
- Daniel sees "待確認付款" list in Order module

**Pending Payment Card UI:**
```
訂單 #0042 — Alo Village 250g × 2
客人：Peter Chan
金額：$42.00
付款方式：銀行轉帳
狀態：等待確認
[標記已收款]  [傳送提醒]
```

- [標記已收款] → order advances to next step (inventory check → roast)
- [傳送提醒] → auto-send reminder email to customer

### Order Payment Statuses
| Status | Meaning |
|--------|---------|
| `pending_payment` | Bank transfer, awaiting Daniel confirmation |
| `paid` | Platform payment confirmed OR Daniel marked as received |
| `overdue` | No payment after X days (configurable) |

### Orders Table Addition
```sql
-- add to orders table
payment_method  text,   -- 'platform' | 'bank_transfer'
payment_status  text,   -- 'pending_payment' | 'paid' | 'overdue'
payment_note    text    -- optional (e.g. transfer reference)
```

### Included in Phase 1
- Payment method field on order
- Pending payment list view
- Mark as received button
- Send reminder button
- Bank transfer instructions auto-included in confirmation email

---

## After-Sales & Customer Engagement

### 1. New Bean Arrival Notification
- Triggered when Daniel marks a bean as "notify" in Retail Info
- System sends email to all subscribed customers
- Content: bean name, origin, process, flavour notes (auto-pulled from cupping data)
- Subscribers get 24-hour early access before general public

### 2. Brew Parameters + Flavour Description
- Each bean in Retail Info has configurable brew parameters:
  - Water temperature
  - Brew ratio
  - Grind size
  - Recommended method (pour over / espresso / batch)
- Flavour description auto-pulled from cupping radar data
- Used in: new arrival emails, order confirmation emails, dispatch emails

### 3. Repurchase Reminder
- Based on quantity purchased, system estimates when customer runs out:
  - 250g ≈ 2–3 weeks
  - 500g ≈ 4–6 weeks
  - 1kg ≈ 8–10 weeks (configurable)
- System auto-sends reminder email when estimated empty date approaches
- Email content: "你的 Danche 快喝完了，要補貨嗎？" + direct reorder link

### 4. Subscribers 24-Hour Early Access
- When new bean is marked ready, subscribers notified 24hrs before public listing
- Creates exclusivity and increases subscription value

### 5. Dispatch Email Auto-includes Brew Parameters
- Every dispatch confirmation email automatically includes:
  - Bean name + origin
  - Flavour notes
  - Recommended brew parameters
  - Roast date
- No extra work for Daniel — pulled automatically from bean data

### Beans Table Additions (brew parameters)
```sql
-- add to beans or retail info
brew_temp        text,   -- e.g. "93°C"
brew_ratio       text,   -- e.g. "1:15"
grind_size       text,   -- e.g. "Medium-Fine"
brew_method      text,   -- e.g. "Pour Over / Espresso"
flavour_desc     text    -- curated description, can auto-pull from cupping
```

### Included in Phase 3 (Email & Notifications)
- New arrival email with early access logic
- Repurchase reminder scheduler
- Dispatch email template with brew parameters
- Brew parameter fields added to Retail Info UI
