# Ratio 開發交接 — 2026-07-05 Session（Phase 3 + Orders 2.0）

## 〇、補記 — 同日晚間 Claude Code session（首次改用 Claude Code）
- **待辦 2 完成：付款連結自動標 paid**（全在 Supabase 端，index.html 沒動）：
  - orders 加 `square_order_id` 欄（migration `add_square_order_id_to_orders`）— 付款連結背後其實有一張 Square quick_pay 訂單，這欄存它的 id
  - **sync-to-square v14**：`payment_link` 建連結時把 `link.order_id` 存進 `square_order_id`；重用舊連結時若缺這欄會自動回 Square 補查
  - **square-webhook v9**：收到 payment COMPLETED 先比對 `square_order_id` → 命中就標 `payment_status='paid'`（冪等，重複事件不會重寄）+ 客人收 payment_received 信（service-role 呼叫 send-email，模板同手動 Mark as received）+ 老闆收通知信 + app 訊息一則；沒命中才走原本網店訂單匯入
  - 順便修掉隱藏 bug：以前客人刷付款連結，webhook 會把 quick_pay 訂單誤認成網店新訂單**再插一張重複訂單**
  - ⚠ 未經真實刷卡驗證 — 下一筆真單付款後到 edge logs（square-webhook）確認 `matched: payment_link`
- **Beans 2.0 G1 生豆帳完成**（index.html + DB，待 push 部署）：
  - **低庫存警戒**：beans 加 `low_stock_kg`（預設警戒線 `GREEN_LOW_KG=5`kg，逐豆可覆蓋；**設 0 = 該豆不警示**，賣完不補的豆用這個關）；Inventory 總覽亮警示條、清單紅字、詳情頁提醒
  - **盤點**：豆子詳情頁 Stocktake 按鈕 → 輸入實秤 kg → 自動算差異、更新庫存、記流水帳
  - **流水帳**：新表 `stock_moves`（kind: roast/stocktake/receive/adjust + delta_kg/after_kg/note）；烘豆扣豆、烘豆改量/刪除（adjustStock 加 note 參數）、盤點、採購入庫全部留痕；詳情頁顯示最近 8 筆 Stock history
  - **採購鏈**：新表 `purchases`（ordered/received/cancelled + sample_ref/bean_id）；Green → Trade → Buy 佔位頁變 Purchasing 頁：杯測標 Buy 的樣品出現在 Cupping shortlist → 一鍵帶入採購單 → Received 時輸實收 kg → 自動併入同名+同 process 的生豆批（更新 cost/supplier）或建新豆 + stock_move 'receive'
  - 驗證：osascript 語法檢查 OK + 本機 ruby 靜態伺服器 + preview eval 灌假資料跑遍 countries/beans/detail/buy 渲染路徑（防陷阱 3 未定義變數），全過；**登入後的實際操作待 boss 部署後點一遍**
  - migrations：`add_square_order_id_to_orders` / `g1_low_stock_and_stock_moves` / `g1_purchases_table`
- **Beans 2.0 G2 烘焙站完成**（index.html + DB，待 push 部署）：
  - **訂單需求接進烘豆頁**：`loadRoastDemand()` 撈 Confirmed/Roasting 單品項加總 → Production 頁新「Needed for orders」區（生豆 = 熟豆 ×1.15），一鍵帶進購物車、公斤數自動帶入；庫存不夠紅字 not enough、blend 顯示 no green lot、購物車行也顯示 orders need ~X kg
  - **開烘前庫存檢查**：購物車輸入超過帳面庫存 → 行內紅字 exceeds stock；存檔時列清單 confirm 才放行（庫存照舊 floor 0，事後用 Stocktake 修正）
  - **產出寫熟豆批次**：roasts 加 `roasted_kg`（migration `g2_roasted_kg_on_roasts`）；記錄時每行可選填 Roasted out kg；烘豆編輯視窗新增 Roasted output 欄 + 自動顯示失重率（loss %）——G3 熟豆倉的資料基礎
  - 驗證：語法檢查 + preview 假資料跑 renderRoast（需求區/入車/超量警告/產出欄）與 renderRoastEdit（loss 13% 顯示、值帶入），全過
- **「全部」總覽分頁已上線**：ORD_TABS 加 `['all','全部']`、ordTabCount 回 ORDERS.length、renderOrders 加不篩選分支（commit 2270d97，已部署驗證）
- **測試單 #0001 + 客戶 Dan 已刪**（orders 表清空、customers 剩 2 位真實客戶）
- **sync-to-square 升 v13**：新增 `payment_link_delete` action（body.link_id → Square DELETE /v2/online-checkout/payment-links）；測試連結 iQjObl89 已刪、回 404
- **訂單品項改下拉選**（待辦 4 完成）：`ordItemRowHTML` 的品項欄改 `<select>`，選項來自 `ordBeanSelectOptions()`（BEANS + blendNames，舊草稿的未知名稱會保留顯示）；datalist 已移除（commit 3c4466a）
- **UI 全面英文化**：訂單分頁改 New/Roast/Pack/Ship/Pay/History/All、所有 alert/confirm/空狀態/角色顯示名（Director 等）改英文；程式註解和利潤計算機（CALC_HTML）保留中文（commit 5e7b481）
- push 流程：終端機無 GitHub 認證，**push 要用 GitHub Desktop**；本機無 Node，JS 語法檢查改用 `osascript -l JavaScript`（有抓到一次 can't 撇號截斷字串的 bug）

## 一、本次完成

### 1. Phase 3 信件系統（send-email v12，全上線）
- Actions：`notify` / `order_confirmation` / `payment_received` / `payment_reminder` / `order_cancelled` / `dispatch_notice`
- 寄送蓋章：確認信 → `orders.confirm_email_at`、出貨信 → `orders.dispatch_email_at`（edge 寄成功後自動寫）
- **確認信**：Accept 觸發（不再存單即寄），含品項表 + 「Pay online by card」按鈕（有 payment_link 且未付時）+ 銀行轉帳資訊（"Or pay by bank transfer"）
- **收款信**：Mark as received 自動寄（失敗不擋標記，只 console）
- **催款信**：手動，同樣帶付款按鈕
- **取消信**：Decline 觸發；已付款的會提「安排退款」
- **出貨信**：資訊卡（同 Square v3 圖卡）+ 各沖煮法參數 + tracking；卡片存在時取代文字行（Roasted/Flavour 已在卡上）
- 出貨信資料源：brew jsonb（beans/blends）、烘焙日 roasts → samples.roast_date fallback、風味 blend note||comment / sample comment
- 資訊卡管線：app 寄信時 `ordUploadCards()` 用 `squareCardDataFor()` + `makeSquareCard` 畫 1200×1200 PNG → 上傳 `mail-assets` bucket（public）`card-<slug>.png` upsert + cache-bust → edge 用 body.cards map，headless fallback 慣例路徑 HEAD-check

### 2. Brew guide（Retail Info 卡片內）
- 4 tabs：**Espresso / Infusion / Immersion / Ice Filter**（此順序、此命名）
- 欄位：Temp（全）、PPM（除 Espresso）、Grind（全）、Dose g（全）、**Yield g（僅 Espresso）**、Water g（除 Espresso）、Ice Ratio（僅 Ice）、Time（全）
- Ratio 自動算：Espresso=Dose/Yield、Filter=Dose/Water；出貨信同步顯示
- 存放：單品 → `beans.brew` jsonb、blend → `blends.brew` jsonb（keyed by method：espresso/infusion/immersion/ice）
- blends push/pull/canon 已含 brew（canon 用 stable stringify 防 jsonb key 重排誤判）
- 切 tab 不掉未存輸入（DOM toggle）；Dark Knight 四法已填好

### 3. Square 付款連結（sync-to-square v12）
- 新 action `payment_link`：body.order_id → Square Payment Links API（quick_pay、訂單金額、首個 ACTIVE location）→ 存 `orders.payment_link` / `payment_link_id`；重複呼叫回傳既有（body.force 重建）
- Accept 流程自動建連結；#0001 測試連結 https://square.link/u/iQjObl89

### 4. Orders 2.0 — 角色分頁（B1+B2 已部署上線）
六分頁：**接單 / 烘豆 / 備貨 / 出貨 / 收款 / 歷史**（帶數字）
- **接單**（New）：精簡卡 + Accept（付款連結→Confirmed→確認信→checkOrderStock）/ Decline（confirm→Cancelled→取消信）；無 email 警示
- **烘豆**（Confirmed+Roasting）：唯讀加總 — 同名合併、熟豆 g + 生豆 g（`ORDER_GREEN_FACTOR=1.15`，本次才真正定義，之前記憶有誤）+ 筆數 + 合計，需求量排序，不碰狀態
- **備貨**（Confirmed+Roasting）：品項打勾清單存 `orders.pack_state` jsonb（跨裝置）；未收款紅字；**全勾自動 → Ready**
- **出貨**（Ready）：現有卡 + Dispatched 彈窗（tracking + 寄信/不寄/取消；未收款顯示「⚠ 此單尚未收款」不擋）
- **收款**：All/Awaiting/Overdue/Paid 子篩選；Mark as received / Send reminder / Resend email
- **歷史**：Dispatched + Cancelled
- 訂單卡顯示 Emails 行（Confirmation sent ✓）+ Dispatch 區（tracking + Email sent ✓）+ Resend email 按鈕（依狀態寄確認信或出貨信）

### 5. 修掉的舊 bug
- **orders_status_check 約束**：DB 原本只收小寫，app 一直寫大寫 → 以前所有狀態變更靜默失敗沒存 DB。已改為大寫六態（New/Confirmed/Roasting/Ready/Dispatched/Cancelled）+ 既有資料正規化 + default 'New'
- **存單重複寄信**：saveOrder 自動寄確認信已移除（Accept 才寄）

### 6. DB / 基礎設施變更
- orders 新欄位：`tracking_no` `dispatch_email_at` `confirm_email_at` `payment_link` `payment_link_id` `pack_state`（jsonb）
- beans：舊 5 個 brew 文字欄已 drop，改 `brew` jsonb；blends 加 `brew` jsonb
- Storage：`mail-assets` bucket（public read、staff insert/update）；出貨信卡片 `card-<slug>.png`
- Edge 版本：**send-email v12**、**sync-to-square v12**（verify_jwt 皆 true）、square-webhook 不動
- 客戶 Dan (`cf2fabb6-...`) email 已填 getratiocoffee@gmail.com（測試用）

## 二、關鍵陷阱（新增）

1. 訂單品項名是**自由輸入** — 打錯字（例 "Dark Knight v"）配不到 blend/beans，出貨信沖煮段整段消失。之後可改下拉選 Retail 清單
2. blend 常常 **roasts 表沒有列**，烘焙日只在 `samples.roast_date` — 任何要烘焙日的功能都要做 fallback（出貨信 v7 起已做）
3. `ORDER_GREEN_FACTOR` 在本次之前**從未定義**（記憶第一次寫錯）— 引用未定義常數 `node --check`/`new Function` 都抓不到（runtime 才炸），驗證管線有盲區
4. 收款頁預設**不顯示已付款**（要點 Paid）；Confirmed 單只在烘豆/備貨頁 — 使用者找不到單多半是分頁邏輯，考慮加「全部」總覽分頁
5. 部署驗證直接 fetch `https://ratio-theta.vercel.app/?nocache=<rand>` 搜函式名 + 比 size — 本次抓到「B2 沒上傳、GitHub 還是 B1」

## 三、待辦

**Orders 2.0 收尾**
1. ~~「全部」總覽分頁（防找不到單）~~ ✅ 完成（見〇補記）
2. ~~square-webhook 接 payment_link 付款事件 → 自動標 paid~~ ✅ 完成（見〇補記；待首筆真實付款驗證）
3. ~~測試單 #0001 + 客戶 Dan 刪除（記得清 payment link）~~ ✅ 完成（見〇補記）
4. ~~訂單品項改下拉選（防打錯字）~~ ✅ 完成（見〇補記）

**Beans 2.0（已規劃，未開工）— 職位產線 G1–G7**
- ~~G1 生豆帳：庫存扣除、盤點、低庫存警戒、採購紀錄鏈（樣品杯測結論→採購單→到貨入庫）~~ ✅ 完成（見〇補記）
- ~~G2 烘焙站：烘焙扣生豆（×1.15）、開烘前庫存檢查（接 Orders 烘豆需求頁）、產出寫熟豆批次~~ ✅ 完成（見〇補記）
- G3 熟豆倉+拼配：批次表（烘焙日/克數/狀態）、賞味期 >30 天標色、FIFO、blend 消耗批次
- G4 QC：杯測結果狀態 Pass / Re-roast（退 G2）/ Downgrade；風味描述鎖定後才進資訊卡
- G5 上架：僅 QC Pass 可上架；Retail+Square push 集中；新豆通知信群發；下家 wholesale
- G6 印製中心：資訊卡/.lbx 貼紙/選單/PDF 集中一頁（純重組，可隨時插隊）
- G7 客戶回饋：出貨信回饋連結（QR 可印）→ feedback 表 → app 回覆 → 摘要回 QC
- **順序：G1 → G2 → G6 → G3 → G4 → G5 → G7**，每 phase 分批交付
- 跨線：上架→接單（供貨）、Orders 烘豆需求→烘焙站（唯讀）、出貨→回饋→QC

**社群曝光規劃（已定案）**
- 優先序：Google 商家檔案（評論 QR 進出貨信/貼紙）> IG（v3 資訊卡 1200×1200 直接當貼文）> 小紅書（中文+北岸華人，高 ROI）> TikTok/Reels（有餘力）
- 四內容支柱：新豆上市 / 過程隨手拍 / 沖煮教學（Brew guide 現成）/ 選豆思路
- 頻率：IG 週 2 貼+3-4 限動、小紅書週 1-2、Google Post 週 1
- 在地：包裹小卡 QR、供豆下家立牌、季度市集
- **Phase 4 新增規格**：上架自動產 IG/小紅書素材（資訊卡+中英文案草稿）、新豆通知一份內容三發、回購提醒附評論連結

**資料收集小工具（Beans 2.0 各站的資料入口，待排期）**
- 烘焙師：T1 烘焙快錄（生豆投入/出豆 g 自動失重率、入豆溫、一爆、出豆溫/時長 → roasts 擴充）；T2 烘焙 profile 文字筆記（延後）
- 咖啡師：T3 Dial-in 日誌（研磨/dose/yield/時間/評語 → 新表 dialins；累積後一鍵套用到 Brew guide）；T4 每日出杯品質快記（延後）
- 杯測師：T5 多樣品同場快評（一場 5-8 杯排排打分、一次存多筆 samples）；T6 風味輪快選（延後）
- 生豆管理員：T7 到貨簽收（供應商/kg/批號/照片入庫）；T8 盤點快錄（逐豆實際 kg、差異自動記調整）
- 共同設計：走現有 dock、單手完成、離線 localStorage 先存再同步；建議首波 T1+T3+T5
- 待確認：是否開給 staff 角色（接 is_staff() 權限）

**分享平台（新方向，收集的 database 對外輸出）**
- 概念：上述工具收進來的 roasts / dialins / samples / beans 資料，長出可分享的頁面
- 可能形態（範圍待定）：a) 每支豆公開頁（雷達圖+風味+沖煮參數，QR 印貼紙）b) 烘豆師社群互通（生豆買賣/交換、杯測紀錄互看）c) 內部跨店/跨職位看板
- 依賴：資料工具先行（T1/T3/T5），平台屬 Beans 2.0 之後的新 phase

**長期方向（備注，非優先）**
- 賣生豆：對其他烘豆師/玩家零售生豆（接 G1 生豆帳 + 分享平台 b 社群線；Green Trade 的 Sell 佔位就是為這個留的）
- 教學：杯測體驗/沖煮課/烘豆課（報名+收款可走現有 Square 付款連結；教材可從 Brew guide / 杯測資料長出來）
- Square 磨豆 Modifier（Whole Bean/Filter/Espresso）+ 多規格 Variations（250g/500g/1kg）— 動 sync-to-square
- Square token 輪替（曾貼在對話）
- 資料補齊：7 筆杯測 comment、April/May/June Project blend note、4 支上架（Dancer/Dreamer/April/May/June Project）、Dancer 烘焙日 15/06 確認

## 四、基礎設施速查
- Supabase kjhudxzvidhynpabnalp（Sydney）；Edge：send-email **v12** / sync-to-square **v14**（+payment_link_delete、payment_link 存 square_order_id）/ square-webhook **v9**（payment_link 自動標 paid）
- orders 欄位新增：tracking_no, dispatch_email_at, confirm_email_at, payment_link, payment_link_id, pack_state, square_order_id
- beans.brew / blends.brew jsonb（method-keyed）；mail-assets bucket
- Square item ids：Alo Village=CFGKRBQ5EAWGB5UAUV35NOP5、Dark Knight=JZVP5ICULJ7TQJGL7VWW6XE2；ratio_ref 定義=MV5EOCK2W3XXFQPHILKQWKOQ
- Chrome MCP：Ratio tab id 1489018982
- 開場模板：先抓 https://raw.githubusercontent.com/getratiocoffee/Ratio/main/index.html + 讀本檔
