# Ratio 開發交接 — 2026-07-05/06 Session（Phase 3 + Orders 2.0 + Beans 2.0 全線）

## ⚡ 當前狀態速覽（2026-07-06 收工時，新 session 先讀這段）
- **全部完工且上線**：Orders 2.0（含付款連結自動確認收款）、Beans 2.0 G1–G7、小工具 T1/T2/T3/T5/T7/T8、Square Grind modifier+多規格、公開豆頁（?bean=）、回饋系統（?fb=）、Google 評論管線（連結已設好）、Print Centre、Retail Info 分頁改版、安全+效能掃描全清
- **重大修復**：square-webhook secrets 曾設反（金鑰在 URL 欄）→ v12 自我修復 + 老闆已改正 secrets（簽名測試 200 驗證）；v13 加 POS 防洪閘（店內刷卡不匯入）
- **Edge 版本**：send-email v15 / sync-to-square v15 / square-webhook v13 / public-bean v1
- **等老闆做**：4 支上架（Dancer/Dreamer/April/May/June Project：QC Pass→Lock flavour→Push to Square，順便驗 Grind/規格）、Leaked password protection（Supabase Auth 後台）、印 QR、工具實戰
- **等老闆拍板**：分享平台 b/c、staff 角色開放、賣生豆/教學/wholesale
- **已知限制**：Chrome MCP 網域白名單不含 ratio-theta.vercel.app（無法代測登入後功能）；Claude 記憶檔在 ~/.claude/.../memory/（驗證流程、工作模式都記了）

## 〇、補記 — 2026-07-06 早上 session（QC 帶跑 + 補烘豆紀錄 + Re-analyse 防呆）
- **QC 按鈕看不到的根因**：6 支 blend（Dreamer/Dancer/Dark Knight/April/May/June Project）只有杯測紀錄、roasts 表沒有批次 → `qcRoastForSample` 找不到對象，QC 列不渲染。**已補 6 筆 roast rows**（照 + Add Coffee 格式：green_kg null、不動庫存、recipe 快照自 blends 表），QC 列全部長出來了
- **June Project 已 QC Pass + 風味鎖定**（老闆本人按的）；其餘 5 支 QC 還空著等老闆按 → 按完去 Retail Info push
- **抓到複本 bug**：submitCupping（熟豆 Analyse/Re-analyse）每次 Submit 都 insert 新 sample、無防呆（saveSample 有、這條漏了）→ June Project 曾冒出 3 筆。已刪 2 筆孤兒複本（07-06、roast_date null），並在 submitCupping 加同豆同日警告（再按一次才存）+ openCupping/openBlendCupping 重置 smpDupConfirm。**已 commit 待 push 部署**；部署後驗法：對已有今日紀錄的豆按 Re-analyse → Submit 應先跳 ⚠ 警告不寫入
- Chrome MCP 網域白名單**現在已含 ratio-theta.vercel.app**（本次成功代跑 app；登入仍請老闆自己按；mail.google.com 仍不行）
- **Announce「沒收到信」破案**：管線沒壞（Resend 兩封都 Delivered）。orders@coffeeratio.com.au 是 getratiocoffee@gmail.com 的 send-as alias → Gmail 視為「自己寄自己」**跳過收件匣**（只在所有郵件/寄件備份）。已把測試客人 email 改成 ratiocoffee2473@gmail.com（另一帳號、正常進收件匣）；真實客人不受影響

## 〇之二、補記 — 同日晚間 Claude Code session（首次改用 Claude Code）
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
- **Beans 2.0 G6 印製中心完成**（index.html only，純重組）：
  - More 資料夾的 Generate Label / Tin Label / Generate Menu / Generate Invoice **四個圖示併成一個 Print Centre**（新 printer 圖示；資料夾剩 5 個：Print/Post/File/Account/Admin）
  - 新 `screen-print` 頁四區：Labels（Bag/Tin .lbx）、Menus（Blend/Take Away/Dine In/Special 四 PDF）、Documents（Invoice）、**Info card 下載**（新增：挑 retail 咖啡 → makeSquareCard 1200×1200 PNG 直接下載，IG 貼文/印刷用，管線同 Square/出貨信卡片）
  - 返回鍵路由：label/tinlabel/invoice 返回 → Print Centre；menu hub 返回 → Print Centre（這四頁現在只從 Print Centre 進）
  - 驗證：preview 實測資料夾圖示、四區渲染、進出導覽（label→back→print、menu→hub→print）、卡片清單三態訊息，全過
- **Beans 2.0 G3 熟豆倉+拼配完成**（index.html + DB）：
  - roasts 加 `remaining_kg`（migration `g3_remaining_kg_on_roasts`）：烘豆記了 Roasted out kg → remaining_kg 同額起跳，成為熟豆批次庫存（舊資料不回填，避免幽靈庫存）
  - **批次表**：Roast → History 加「All roasts / Batch stock」分頁；批次按豆分組、最舊在上（**FIFO** + use first 徽章）、**烘超過 30 天紅框 + >30d 徽章**；剩 0 的自動隱藏；點批次 → 記「用掉/賣掉 kg」直接扣
  - **blend 消耗批次**：Add Coffee 加「Roasted kg」欄（單品=純記錄；blend=照配方快照比例 **FIFO 扣成分批次**，不夠扣會 alert 短缺清單）
  - 編輯視窗改產出 kg → remaining 連動（扣掉已消耗量再算）；清空產出 = 退出批次庫存
  - 驗證：preview 假資料實測分頁切換、FIFO 排序、>30d 標色、扣量表單、blend 表單欄位，全過；**FIFO 實際扣帳需登入後測**（DB 寫入路徑）
- **Beans 2.0 G4 QC 完成**（index.html + DB）：
  - roasts 加 `qc`（pass/reroast/downgrade）、samples 加 `flavour_locked` boolean（migration `g4_qc_and_flavour_lock`）
  - **杯測卡（rtSampleCard）加 QC 列**：Pass / Re-roast / Downgrade 三鍵打在對應烘豆批次上（`qcRoastForSample`：bean_id 優先→豆名，同烘焙日優先→最新；再點一次=取消）
  - **Re-roast 退 G2**：Production 頁新「QC re-roast queue」區，一鍵帶回購物車（kg 預設帶原批 green_kg）
  - **風味鎖定**：杯測卡「Lock flavour」鍵；出貨信卡片管線（ordUploadCards）與 Print Centre 卡片下載改為 `.order('flavour_locked',desc)` **鎖定紀錄優先上卡**；下載未鎖定的會提示 ⚠ flavour not locked yet
  - 熟豆倉批次掛 QC 徽章（QC ✓ / re-roast / downgraded）
  - 驗證：preview 假資料實測配對邏輯、三鍵狀態、鎖定切換、重烘佇列、批次徽章，全過
- **Beans 2.0 G5 上架完成**（index.html + send-email v13；wholesale 下家未做，留給長期方向）：
  - **上架閘門 `listingGate()`**：Push to Square / Announce 前檢查——最新批次 QC 是 Re-roast/Downgrade **硬擋**；沒 QC 紀錄或風味未鎖 **confirm 提醒可續行**（遷就舊資料全 null，不然全部被鎖死）
  - **Listing 狀態集中**：Retail Info 卡的 Square 列加第二行「QC Pass ✓ / pending / Re-roast · flavour locked ✓ / unlocked」，一眼看出能不能上架
  - **新豆通知信群發**：Retail 卡新「Announce」鍵 → 閘門檢查 → 顯示收件人數 confirm → 生成資訊卡上傳 mail-assets → **send-email v13 新 action `announce_coffee`**（撈全部有 email 客戶去重逐一寄，600ms 間隔防 Resend 限流，回 sent/failed/total）
  - send-email v13 順便讓 dispatch_notice 的風味抓取也 flavour_locked 優先
  - 驗證：preview 實測閘門六種情境矩陣 + 卡片狀態列 + Announce 按鈕渲染，全過；**實際群發要登入後測**（目前客戶 2 位，風險低）
- **Beans 2.0 G7 客戶回饋完成 — G1–G7 全線完工** 🎉（index.html + DB + send-email v14）：
  - **feedback 表**（migration `g7_feedback_table`）：RLS 匿名**只能寫入**、員工讀/改/刪
  - **公開回饋表單**：`?fb=<order id|store>` 免登入模式，overlay 蓋在登入牆上（五星 + 評語 + 選填姓名/email）→ 匿名寫進 feedback；**已在 preview 真實 E2E 測過**（送出 → 感謝頁 → DB 有列 → 測試資料已清）
  - **出貨信帶回饋連結**：send-email v14 dispatch_notice 加「How was your coffee?」按鈕 → `APP_URL/?fb=<order id>`（APP_URL secret 可覆蓋，預設 ratio-theta.vercel.app）
  - **QR 可印**：Print Centre 新「Feedback QR」區（qrserver API 產圖，`?fb=store`）→ 包裹小卡/櫃檯立牌
  - **app 回覆**：More 資料夾新 Feedback 圖示 → 回饋列表（星等/評語/客名）；有 email 的可寫回覆 → send-email v14 新 action `feedback_reply`（寄信 + 蓋 reply/replied_at）
  - **摘要回 QC**：回饋帶 order id → 對回訂單品項 → 頁面頂部「Summary by coffee」按豆平均星等
  - 驗證：公開表單全流程 E2E（preview_click 有工具派發問題，程式 .click() 全通）+ 管理頁渲染（摘要/星等/單號/QR 標記/已回覆狀態/回覆表單）+ QR 顯示，全過
- **資料收集小工具首波 T1+T3+T5 完成**（migration `t1_t3_roast_log_and_dialins`）：
  - **T1 烘焙快錄**：roasts 加 `charge_temp`/`first_crack`/`drop_temp`/`duration`；烘豆編輯視窗的「coming soon」佔位換成 Roast log 四欄（全選填），與 green/roasted kg 同視窗一次填完
  - **T3 Dial-in 日誌**：新表 `dialins`（coffee/grind/dose/yield/time_s/note/barista，staff RLS）；**Recipe dock 從佔位變真功能**（左 Dial-in 開表單、右 History 看紀錄）；快錄表單（咖啡下拉防錯字、連續調同支豆不用重選）+ 每支豆最新一筆卡片 + **Apply to Brew guide**（只覆蓋 espresso 分頁有填的欄位，單品寫 beans.brew、blend 走 saveBlendDefs 自動同步）+ Recent 20 筆流水
  - **T5 多樣品同場快評**：Analyse 多頁模式新增「Submit all N samples」一鍵存整場（空白頁自動跳過、No. 依日期連號、批次 insert 一次寫入）
  - 未做：離線 localStorage 佇列（設計較大，延後）；T2/T4/T6（原計畫就延後）；staff 角色開放與否待老闆決定（現況跟著 dock 權限走：誰看得到 Recipe/Roast dock 誰就能用）
  - 驗證：preview 假資料實測三工具渲染與行為（T3 最新批次判定/單一 Apply 鍵/ratio 計算/歷史模式、T5 按鈕與計數、T1 欄位帶值與佔位移除），全過；部署驗證 Beans 2.0 全上線（615,348 bytes 與本機一致）
- **小工具第二波 T7+T8 完成**：
  - **T8 盤點快錄**：Inventory 首頁新「Stocktake all beans」→ 一頁列出全部生豆（按產地分組、帳面數帶入），輸實秤 kg → **只存有改動的**，每筆差異記 stock_moves 'stocktake'（note: Bulk stocktake），存完回總覽 + alert 摘要
  - **T7 到貨簽收補強**：purchases 加 `lot_no`（migration `t7_lot_no_on_purchases`）；Received 表單加 Lot/batch no 欄，存單上顯示 Lot 標記、stock_moves 備註帶批號；**照片入庫未做**（要開 storage bucket + 相機流程，延後）
  - 驗證：preview 實測入口/分組/帶值/差異判定（只挑有改的）/返回重置/批號顯示，全過
- **Square 磨豆 Modifier + 多規格 Variations 完成**（sync-to-square **v15** + app）：
  - **Grind modifier**：共用 MODIFIER_LIST「Grind」（Whole Bean / Filter Grind / Espresso Grind，皆 $0，SINGLE 選擇）——`ensureGrindModifier()` 找不到才建；**created 和 linked 兩種模式都掛**（linked 只加不覆蓋老闆手動設定），不會重複掛
  - **多規格**：push 可帶 `variations:[{grams,price}]`；app 端 push 時多兩個 prompt 問 500g / 1kg 價格（**留空 = 不上架該規格**，價格記在 `ratio_rtl_sizes` localStorage + app_state 跨裝置同步，已註冊 APP_STATE_KEYS）；規格名稱比對保留既有 variation id（銷售紀錄不斷）；product_sync 仍記基本規格（250g）的 variation_id
  - 注意：webhook 匯入網店訂單時 500g/1kg 行沒有 product_sync 映射 → fallback 用 Square 名稱 + variation 名（名稱已同步所以能對上，grams 為 null）——之後有需要再擴 product_sync
  - ⚠ **Square API 實際呼叫未測**（要 director 登入 + 真實 catalog）：挑一支豆（建議 Dark Knight，linked 模式最安全）Re-sync——價格照舊 25、500g/1kg 留空跳過——再去 Square 後台看 Grind modifier 有沒有掛上。**Chrome MCP 幫不上**：擴充功能網域白名單不含 ratio-theta.vercel.app，Claude 開不了 app（想授權的話去 Claude 擴充功能設定加網域）
  - 驗證：preview 實測函式存在、sizes 記憶 roundtrip、同步 key 註冊、variations 組裝邏輯，全過
- **分享平台 a) 每支豆公開頁完成（MVP）**（新 edge `public-bean` v1 + index.html；b 社群 / c 看板方向仍待老闆拍板）：
  - **edge `public-bean`**（verify_jwt false、CORS 開、快取 5 分鐘）：`?name=<slug>` → **只回風味已鎖定**（samples.flavour_locked，QC 閘門一路貫穿）豆的白名單欄位：名稱/配方或產地/風味 3 個/comment/雷達五項分數/烘焙日（roasts→samples fallback）/四法沖煮參數（blend 用 blends.brew、單品用 beans.brew）
  - **公開頁**：`ratio-theta.vercel.app/?bean=<slug>` 免登入 overlay——品牌字、配方比例、風味膠囊、雷達圖（重用 sampleRadarSVG）、How to brew it（含 ratio 自動算）、產地資訊，頁尾連到 ?fb=store 回饋表單（兩個公開頁互相導流）；未鎖定/不存在顯示「not available」
  - **Print Centre**：資訊卡區加「Bean page QR」鍵——選豆 → 產 QR（連 ?bean=<slug>），印貼紙/包裝用
  - 驗證：curl 三態（鎖定=完整 JSON、未鎖=404、缺參數=400）+ preview 實測 Dark Knight 頁完整渲染（截圖確認）+ not-available 畫面 + QR 產生，全過；測試用的鎖定已還原
  - ⚠ 上線後要公開哪支豆：杯測卡按 **Lock flavour** 就會出現在公開頁（同一顆鍵同時管資訊卡）
- **🔥 重大修復：square-webhook 簽章全掛（可能掛了很久）**：
  - 營運健康檢查發現 webhook 被 Square 打了**上百發全部 401**（每幾分鐘一波、持續數小時 = 很可能是店裡 POS 刷卡事件在重試）
  - 診斷（v10/v11 把失敗線索寫進 app_state）揪出病因：**兩個 secret 設反了**——`SQUARE_WEBHOOK_SIGNATURE_KEY` 是空的、簽章金鑰被塞在 `SQUARE_WEBHOOK_URL` 欄位裡 → 驗證永遠失敗 → **付款連結自動確認收款、網店訂單匯入其實一直是斷的**
  - **v12 自我修復**：偵測到「金鑰欄空 + URL 欄裝著非網址」就自動對調，URL 用寫死的正確函式網址；正確設定的 secret 永遠優先。部署後 Square 投遞**立刻全數 200**、積壓佇列開始消化、診斷區歸零
  - **v13 加 POS 防洪閘**：沒有配送/自取收件人資訊的 Square 訂單（= 店內 POS 快速結帳）直接跳過不匯入——防止門衛修好後明天營業的每杯咖啡都變成 app 訂單；網店訂單（帶 fulfillment）照常匯入
  - ~~建議老闆把兩個 secret 正式改對~~ ✅ **老闆已改對**（第一次金鑰貼短 18 字診斷抓到 → 重貼 22 字全串）；用金鑰自簽測試請求驗證 **200 通過**，自我修復邏輯已自動退位純備援。診斷殘留已清
- **收尾打磨**（migration `feedback_notify_trigger_and_t2_profile_note`）：
  - **修 bug：blends 未登入無限重試**——RLS 把 anon select 過濾成空（不報錯），被誤判成「空表」→ 觸發本機上傳 → 被 RLS 擋 → 洗版重試。blendsPull / blendsPushNow 加 session 檢查，未登入直接 return（preview 實測 guard 後零新增錯誤）
  - **G7 補強：新回饋自動通知**——`notify_feedback()` security definer trigger：feedback insert → messages 一則「New feedback ★★★★ + 摘要」（匿名寫不了 messages 所以用 trigger 代打；已 E2E 測過並清理）
  - **T2 烘焙 profile 筆記**：roasts 加 `profile_note`；烘豆編輯視窗 Roast log 下加 Profile notes textarea
  - 部署驗證：公開豆頁 + Square 規格已上線（639,243 bytes 與本機一致）
- **Google 商家評論管線完成**（社群曝光第一優先；send-email **v15**）：
  - Print Centre 新「Google review」區：貼上 Google 評論連結（Business Profile → Ask for reviews）→ 存 app_state `google_review_url` → **評論 QR 立即可印** + **出貨信自動加「Leave us a Google review ⭐」CTA**（沒設定就整段略過，不影響現有信）
  - ~~⚠ 等老闆貼連結~~ ✅ **連結已設定**：用 Chrome MCP 從老闆登入的 Google Business Profile「Ask for reviews」對話框取得官方連結 `https://g.page/r/CUJCO0Gxva_VEBM/review`，直接寫入 app_state（驗證 302 有效）——**下一封出貨信就會帶評論 CTA**，Print Centre 打開就有評論 QR 可印
  - 驗證：preview 實測三態（未設定/已設定+QR/壞網址防呆）；實際存檔與信件 CTA 需登入+真實出貨驗證
- **全 session 自我代碼審查**（1219 行 diff 重讀高風險區）：
  - **修一個真 bug**：Add Coffee 建的烘豆列（green_kg 本來就是 null）在編輯視窗填 T1/T2 烘焙記錄時，被「Enter a valid quantity」擋住存不了 → 改成 green_kg 原本為 null 的列允許生豆欄留空（只存其他欄位）；**原本有生豆量的列留空仍然擋**（防誤清庫存連動）。preview 兩路徑實測通過
  - 其餘重讀（pushToSquare 多規格、saveRoastEdit 剩餘量連動、consumeBlendComponents FIFO、feedback/print 各處）沒發現新問題
- **Supabase 安全掃描 + 加固**（migration `security_hardening_advisors`，全部 anon key 實測）：
  - `notify_feedback()` 收回 RPC 執行權（原本任何人可直呼刷爆訊息中心；trigger 照常運作）→ 匿名直呼現在 404
  - **messages 表堵洞**：原政策連 anon 都能 insert/update/delete（拿網頁公開金鑰就能清空訊息）→ 改 authenticated only；實測匿名刪除撲空、trigger 訊息存活
  - feedback 匿名寫入加長度限制（comment≤2000/name≤120/email≤200/order_ref≤100）→ 實測正常寫入 201、超長 401
  - **留給老闆的**：① Auth 後台開「Leaked password protection」（dashboard 設定，SQL 動不了）② mail-assets bucket 可被列目錄（只有卡片 PNG，低風險）③ app_state/contacts/rosters 的 always-true 政策是現行「員工共用」信任模型，未動
  - Chrome MCP 網域仍未開，Square Re-sync 實測續掛（同上一條）
- **效能掃描 + 加固**（migrations `performance_hardening_advisors` / `profiles_merge_policies`）：
  - profiles 政策 `auth.uid()` 包 `(select …)` 防逐列重算；own/staff 兩對政策合併成單一 or 條件（行為等價）
  - 六張表（beans/roasts/samples/stock_moves/purchases/dialins）移除多餘的「staff read」政策——FOR ALL 寫入政策本就涵蓋 SELECT，同動作跑兩條純浪費
  - roasts.bean_id 外鍵補索引
  - 結果：performance advisor **WARN 全清零**（剩 4 條 INFO 是新索引未用過，正常）；匿名讀 beans/purchases/dialins/profiles 實測仍為空（沒開洞）
  - ⚠ 老闆下次登入若一切正常（能看到自己名字/角色）= profiles 合併政策實證通過；異常立刻回報
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
- ~~G3 熟豆倉+拼配：批次表（烘焙日/克數/狀態）、賞味期 >30 天標色、FIFO、blend 消耗批次~~ ✅ 完成（見〇補記）
- ~~G4 QC：杯測結果狀態 Pass / Re-roast（退 G2）/ Downgrade；風味描述鎖定後才進資訊卡~~ ✅ 完成（見〇補記）
- ~~G5 上架：僅 QC Pass 可上架；Retail+Square push 集中；新豆通知信群發~~ ✅ 完成（見〇補記；下家 wholesale 未做 → 長期方向）
- ~~G6 印製中心：資訊卡/.lbx 貼紙/選單/PDF 集中一頁（純重組，可隨時插隊）~~ ✅ 完成（見〇補記）
- ~~G7 客戶回饋：出貨信回饋連結（QR 可印）→ feedback 表 → app 回覆 → 摘要回 QC~~ ✅ 完成（見〇補記）— **Beans 2.0 G1–G7 全部完工**
- **順序：G1 → G2 → G6 → G3 → G4 → G5 → G7**，每 phase 分批交付
- 跨線：上架→接單（供貨）、Orders 烘豆需求→烘焙站（唯讀）、出貨→回饋→QC

**社群曝光規劃（已定案）**
- 優先序：~~Google 商家檔案（評論 QR 進出貨信/貼紙）~~ ✅ 管線完成，等老闆貼評論連結（見〇補記）> IG（v3 資訊卡 1200×1200 直接當貼文，Print Centre 已可下載）> 小紅書（中文+北岸華人，高 ROI）> TikTok/Reels（有餘力）
- 四內容支柱：新豆上市 / 過程隨手拍 / 沖煮教學（Brew guide 現成）/ 選豆思路
- 頻率：IG 週 2 貼+3-4 限動、小紅書週 1-2、Google Post 週 1
- 在地：包裹小卡 QR、供豆下家立牌、季度市集
- **Phase 4 新增規格**：上架自動產 IG/小紅書素材（資訊卡+中英文案草稿）、新豆通知一份內容三發、回購提醒附評論連結

**資料收集小工具（Beans 2.0 各站的資料入口，待排期）**
- ~~烘焙師：T1 烘焙快錄；T2 烘焙 profile 文字筆記~~ ✅ T1、T2 都完成（見〇補記）
- 咖啡師：T3 Dial-in 日誌（研磨/dose/yield/時間/評語 → 新表 dialins；累積後一鍵套用到 Brew guide）；T4 每日出杯品質快記（延後）
- 杯測師：T5 多樣品同場快評（一場 5-8 杯排排打分、一次存多筆 samples）；T6 風味輪快選（延後）
- ~~生豆管理員：T7 到貨簽收（供應商/kg/批號）；T8 盤點快錄（逐豆實際 kg、差異自動記調整）~~ ✅ 完成（見〇補記；T7 照片入庫延後）
- 共同設計：走現有 dock、單手完成、離線 localStorage 先存再同步；~~建議首波 T1+T3+T5~~ ✅ T1+T3+T5 完成（見〇補記；離線佇列延後）
- 待確認：是否開給 staff 角色（接 is_staff() 權限）

**分享平台（新方向，收集的 database 對外輸出）**
- 概念：上述工具收進來的 roasts / dialins / samples / beans 資料，長出可分享的頁面
- 可能形態：~~a) 每支豆公開頁（雷達圖+風味+沖煮參數，QR 印貼紙）~~ ✅ MVP 完成（見〇補記）；b) 烘豆師社群互通（生豆買賣/交換、杯測紀錄互看）c) 內部跨店/跨職位看板 — b/c 待拍板
- 依賴：資料工具先行（T1/T3/T5），平台屬 Beans 2.0 之後的新 phase

**長期方向（備注，非優先）**
- 賣生豆：對其他烘豆師/玩家零售生豆（接 G1 生豆帳 + 分享平台 b 社群線；Green Trade 的 Sell 佔位就是為這個留的）
- 教學：杯測體驗/沖煮課/烘豆課（報名+收款可走現有 Square 付款連結；教材可從 Brew guide / 杯測資料長出來）
- ~~Square 磨豆 Modifier（Whole Bean/Filter/Espresso）+ 多規格 Variations（250g/500g/1kg）~~ ✅ 完成（見〇補記；待真實 push 驗證）
- Square token 輪替（曾貼在對話）
- ~~資料補齊：杯測 comment、blend note、Dancer 烘焙日~~ ✅ 完成（2026-07-06：7 筆 comment 由 Claude 起草＋老闆核准寫入；April/May Project note 補上；重複的 Dreamer 無烘焙日列已刪、留 06/08 那筆；Dancer 15/06 老闆確認無誤）
- **杯測卡＋Retail Info 卡加「Analysed by」**（老闆需求 2026-07-06）：rtSampleCard 副標、retailCard 的 Roasted 行下方各顯示 `Analysed by <cupper>`（samples.cupper = 登入者名字，沒記錄就不顯示）
- 剩：4 支上架（Dancer/Dreamer/April/May/June Project — 現在資料齊了，QC Pass + Lock flavour + Push to Square 即可）
- **Retail Info 改版**（老闆需求 2026-07-06）：
  - **Blends / Single Origin 分頁**（lbl-seg 樣式，預設 Blends；以 blendDefByName 判定歸屬）；Blend 泡泡（rtl-blend-tag）移除
  - **收合列右側顯示 Square 狀態膠囊**（Live 綠 / Error 紅 / Not listed 灰）+ **迷你 Announce 鍵**（喇叭圖示，走原 announceCoffee 含上架閘門與人數確認）；展開後兩者隱藏（body 本來就有完整 Square/Announce 列）
  - 驗證：preview 假資料實測兩分頁篩選/計數、泡泡移除、三態膠囊、迷你鍵數量與綁定、展開收合切換，全過

## 四、基礎設施速查
- Supabase kjhudxzvidhynpabnalp（Sydney）；Edge：send-email **v12** / sync-to-square **v14**（+payment_link_delete、payment_link 存 square_order_id）/ square-webhook **v9**（payment_link 自動標 paid）
- orders 欄位新增：tracking_no, dispatch_email_at, confirm_email_at, payment_link, payment_link_id, pack_state, square_order_id
- beans.brew / blends.brew jsonb（method-keyed）；mail-assets bucket
- Square item ids：Alo Village=CFGKRBQ5EAWGB5UAUV35NOP5、Dark Knight=JZVP5ICULJ7TQJGL7VWW6XE2；ratio_ref 定義=MV5EOCK2W3XXFQPHILKQWKOQ
- Chrome MCP：Ratio tab id 1489018982
- 開場模板：先抓 https://raw.githubusercontent.com/getratiocoffee/Ratio/main/index.html + 讀本檔
