# Ratio 開發交接總結 — 2026-07-04/05 Session

## 一、本次完成

### 1. Blend 上雲（原 localStorage → Supabase）
- 新表 `blends`：`id uuid, name, hname, parts jsonb, note, comment, pos, active, updated_at` + is_staff RLS + realtime
- localStorage `ratio_blends` 降級為離線快取/同步讀取層；`ratio_blends` 已從 APP_STATE_KEYS 移除
- 同步機制：開機 `blendsPull()` + realtime 訂閱 + `visibilitychange` 回前景重拉 + `openBlending()` 開畫面即拉
- `roasts.recipe` jsonb 新欄位：blend 烘焙記錄時快照當下配方（改配方不影響歷史）
- 改名連動改用 `hname`（資料庫欄位，不靠 DOM）：cascade 範圍 = roasts.bean_name + samples.sample_id + **product_sync.bean_id**；Square 端商品名要另按 Re-sync

### 2. Phase 2 Square 完工
- Secrets 已設：SQUARE_ACCESS_TOKEN / SQUARE_WEBHOOK_SIGNATURE_KEY / SQUARE_WEBHOOK_URL / RESEND_API_KEY
- `sync-to-square` v9 actions：`push` / `availability` / `inspect` / `delete` / `sites`
- **Linked 模式（重要）**：推送時先比對商店既有手動商品（命名慣例「產地 | 豆名 | 處理法」分段比對），找到就接管 — 保留商品名/規格/價格/優惠/channel，只更新描述+主圖。找不到才建新商品（此時才用 app 輸入的價格）
- Alo Village → 已連結「Ethiopia | Alo Village | Cold Fermentation」；Dark Knight Testing → 「Blend | Dark Knight」；先前 API 建的重複商品已刪
- Webhook 收單：驗簽 → orders upsert → messages 通知 → email 通知 Daniel + 客人確認信

### 3. Phase 3 Email 核心完工
- Resend：網域 coffeeratio.com.au 已驗證（Tokyo region），寄件人 `Ratio Coffee <orders@coffeeratio.com.au>`，通知信箱 getratiocoffee@gmail.com
- `send-email` Edge Function actions：`notify` / `order_confirmation` / `payment_reminder`（品牌 email 模板）
- 銀行轉帳資料存 `app_state.bank_details`（Ratio Coffee Pty Ltd / 062-151 / 10497845），轉帳單自動附帳戶+訂單編號
- 前端：手動建單新增 Email 欄位、建單自動寄確認信、Send reminder 按鈕啟用、`callEmailFn()` helper

### 4. Square 商品圖卡自動生成
- `makeSquareCard()`：1200×1200 PNG，canvas 生成，推送時經 `image_b64` 上傳設為主圖
- 版型複刻印刷菜單：Blend = Blend Menu 卡片版（色橫幅+note條+FLAVOUR+RECIPE左欄+雷達右欄+Roasted日期）；Single = Special Menu 左欄版（色TAB+ORIGIN表含Roasted+雷達右欄+FLAVOUR底部）
- 顏色 = Retail Info 顏色圈圈（`beanColorFor()`，同菜單）
- **安全邊距：左右 150px、上下 64px** — 因商品頁直式圖框會裁左右各約 150px

## 二、關鍵陷阱（之後必看）

1. **欄位契約**：sync-to-square 後端收 `sample_id`（前端曾誤送 `bean_id` → "sample_id required"）。狀態值是 `synced/paused/error`（前端曾誤用 `live` 導致永遠顯示 Not listed）
2. **product_sync.bean_id 存的是豆名字串**（= samples.sample_id），不是 uuid；已納入改名 cascade
3. **卡片資料組裝不要用 `menuInfoFor()`** — 它依賴 Label 模組快取（RETAIL_BEANS），在 Retail Info 推送時是空的。正確做法：直接用 sample row（fragrance/acidity/sweetness/body/aftertaste + features）+ `beanByNameProcess()` 查生豆 + `roastDateForSample()`；推送前 `ensureBeansForInvoice()` + `loadRoasts()`
4. **PWA 快取害了三次**：每次部署後手機/瀏覽器必須用全新 `?nocache=XXX`，否則跑舊程式（症狀：函數 undefined、功能沒反應、圖沒上傳）
5. **Blend 同步 race**：推送飛行中繼續打字 → 舊版會用回拉資料蓋掉輸入。已修：`_blendsRev` 計數器（推送後僅在無新編輯時清 dirty）+ echo 正規化比對（**jsonb 會重排物件 key**，raw JSON 字串比對永遠不相等）
6. **Square Online 怪癖**：`ecom_visibility` 讀回 HIDDEN 是舊欄位殘留，實際可見性由 channels 控制；API 建的新商品缺 fulfillment 設定（Dashboard → Items → 勾選 → Actions 批次補）；商店網址 coffeeratio.com.au，商品列表在 `/s/shop`（`/shop` 是 404）
7. **jsPDF 不受影響**（canvas 圖卡走瀏覽器字型：Fraunces/Inter/Space Mono 可用；jsPDF 仍然 ASCII/Helvetica only）

## 三、待辦

### 立即小事
- [ ] `blends` 表有一筆空白 blend（pos 2）待在 Blending 刪除
- [ ] 「Dark Knight Testing」改回正式名稱（Blending 改名 → Save 會自動 cascade）
- [ ] 部署最新 index.html（150px 安全邊版本）→ 兩支豆 Re-sync → 商品頁確認不裁字
- [ ] Square token 曾貼在對話中，介意可去 Square Replace token 並更新 secret

### Phase 3 剩餘（Email 延伸）
- [ ] `beans` 加沖煮參數欄位：brew_temp / brew_ratio / grind_size / brew_method / flavour_desc + Retail Info UI
- [ ] 出貨通知信（含沖煮參數+烘焙日期）— 訂單 Dispatched 時觸發
- [ ] 新豆上架通知 email（訂閱者 24hr 早鳥）
- [ ] 回購提醒 scheduler（250g≈2-3週 / 500g≈4-6週 / 1kg≈8-10週）

### Phase 4-6
- Phase 4：Instagram Shop（Meta Commerce API + sync-to-instagram）
- Phase 5：訂閱模組（subscriptions 表 + subscription-cron）
- Phase 6：烘焙庫存整合（blend recipe 已上雲 → 已解鎖；訂單自動算生豆量、同日合併排程、出貨扣庫存）

## 四、新對話開場模板

```
我要繼續 Ratio 開發 — [任務名稱]。
請先從 GitHub 抓最新 index.html：
https://raw.githubusercontent.com/getratiocoffee/Ratio/main/index.html
並讀專案裡的 ratio-session-handoff.md 了解現狀與陷阱。

任務：[描述]
```

## 五、基礎設施速查
- Supabase：kjhudxzvidhynpabnalp（Sydney）
- Edge Functions：sync-to-square v9 / square-webhook v8 / send-email v2
- 新表：blends；roasts 加 recipe jsonb；blends 加 hname
- app_state 新 key：bank_details
- Resend：coffeeratio.com.au verified（Tokyo）；寄件 orders@coffeeratio.com.au
- Square site：coffeeratio.com.au（site_663735904217790904）
