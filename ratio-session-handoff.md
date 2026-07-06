# Ratio 開發交接 — 2026-07-05/06 Session（Phase 3 + Orders 2.0 + Beans 2.0 全線）

## ⚡ 當前狀態速覽（2026-07-06 收工時，新 session 先讀這段）
- **全部完工且上線**：Orders 2.0（含付款連結自動確認收款）、Beans 2.0 G1–G7、小工具 T1/T2/T3/T5/T7/T8、Square Grind modifier+多規格、公開豆頁（?bean=）、回饋系統（?fb=）、Google 評論管線（連結已設好）、Print Centre、Retail Info 分頁改版、安全+效能掃描全清
- **重大修復**：square-webhook secrets 曾設反（金鑰在 URL 欄）→ v12 自我修復 + 老闆已改正 secrets（簽名測試 200 驗證）；v13 加 POS 防洪閘（店內刷卡不匯入）
- **Edge 版本**：send-email v15 / sync-to-square v15 / square-webhook v13 / public-bean v1
- **等老闆做**：4 支上架（Dancer/Dreamer/April/May/June Project：QC Pass→Lock flavour→Push to Square，順便驗 Grind/規格）、Leaked password protection（Supabase Auth 後台）、印 QR、工具實戰
- **等老闆拍板**：分享平台 b/c、staff 角色開放、賣生豆/教學/wholesale
- **已知限制**：Chrome MCP 網域白名單不含 ratio-theta.vercel.app（無法代測登入後功能）；Claude 記憶檔在 ~/.claude/.../memory/（驗證流程、工作模式都記了）

## 〇、補記 — 2026-07-06 下午 session（訂單站泡泡面板）
- **站台改造第 8 站：訂單站完成**（index.html，待 push 部署）：點 dock 的 Order 圖示不再只顯示訊息 feed，改顯示 `renderOrderStation()` 泡泡面板（樣式全沿用 .gs-*，只新增 .gs-badge.od 逾期紅膠囊）——
  ①**New orders**（黃框，Accept/Decline 直接長在列上，重用 ordAccept/ordDecline）②**Roast queue**（Confirmed+Roasting 同名合併彙總，熟豆 g＋生豆 g ×1.15，總生豆量掛徽章；「Open production」一鍵去烘豆頁）③**Pack queue**（每單 n/m packed 進度＋unpaid 紅字；Pack 鍵跳訂單頁備貨分頁）④**Ready to ship**（黃框，Dispatch 鍵直接開原 tracking+email 彈窗 ordDispatchAsk）⑤**Payments owing**（**排除 New 單**——付款連結 Accept 才生成，接單卡已涵蓋；金額＋天數＋overdue 紅字，Paid ✓ = markOrderPaid、Remind = payment_reminder 信）⑥All orders 入口列＋流程頁尾。空佇列縮 quiet 卡
  - **關鍵接線**：`renderOrders()` 開頭加轉接——訂單頁沒開＋dockStack 在 order 時改呼叫 renderOrderStation()，所以現成動作函式（Accept/收款/出貨彈窗關閉）完成後自動回流刷新面板，一行都不用改
  - 驗證：jscheck ＋ preview 假資料實測全過（滿載 5 卡數字全對 2013g green、空狀態 6 quiet 卡、Dispatch 彈窗開關＋回流重畫、Pack/All 導覽跳對分頁、截圖上下半部確認）；⚠ 登入後實按 Accept/Paid/Dispatch 待 boss 部署後點一遍
  - 註：本機預覽伺服器讀不到 Documents（macOS 權限），launch.json 指向 scratchpad/serve 複本——改完 index.html 要 cp 過去才會生效
- **Accept 後可取消（老闆需求，已部署 673,736 bytes 驗證）**：原本單子一 Accept 就沒有反悔的路（Decline 只在新單卡、狀態列無 Cancelled）→ 新增 `ordCancel()`（confirm → status Cancelled → order_cancelled 取消信；**已付款單 confirm 多提醒「信裡會提退款」**）。入口三處：站面板 Pack/Ship 列上 Cancel 鍵（.gs-act.danger 紅框）＋ 訂單頁展開卡片「Cancel order」（Dispatched/Cancelled 不顯示）。preview 假資料全流程實測過（confirm 文字/DB 寫入/寄信/取消後掉出佇列）；commit 6f22fcf
- **站台改造第 4 站：QC 站完成**（index.html，待 push 部署）：點 dock 的 **Beans 圖示**改顯示 `renderQCStation()` 泡泡面板（樣式沿用 .gs-*）——①**Awaiting QC**（黃框，有批次但沒判定：Pass/Re-roast/Down 三鍵直接長在列上，寫 roasts.qc）②**Lock flavour**（QC Pass 但未鎖：列上 Lock 鍵寫 samples.flavour_locked，風味預覽 3 顆、沒風味紀錄紅字提醒重杯）③**Ready to list**（Pass+鎖定+Square 未 Live：List › 跳 Retail Info 按 Push）④**Re-roast queue**（黃框＋一鍵去 Production）⑤**No roast batch — cannot QC**（防老陷阱：杯測有紀錄但 roasts 沒列 → 點去 QC 頁 Add Coffee）⑥Live on Square / QC 頁入口列。資料同 Retail Info 去重規則（bean_id 優先）＋qcRoastForSample 配對＋PROD_SYNC 判 Live
  - 驗證：jscheck＋preview 假資料六佇列全對＋實按流水線（Pass → 掉進 Lock 佇列 → Lock → 掉進 Ready to list，DB 寫入與重繪皆對）＋截圖確認；⚠ 登入後實按待 boss 部署後點一遍。**直接服務老闆待辦**：Dancer/Dreamer/April/May 四支上架，開 Beans 站照佇列按下去就完成
- **站台改造第 3 站：烘焙站完成**（index.html，待 push 部署）：點 dock 的 **Roaster 圖示**改顯示 `renderRoastStation()` 泡泡面板——①**Needed for orders**（黃框，ROAST_DEMAND 換算生豆 ×1.15、比對 beans 庫存不夠紅字、blend 標「no green lot」；一鍵去 Production 帶購物車）②**QC re-roast queue**（黃框＋一鍵去 Production）③**Ageing batches**（remaining_kg>0 且烘超過 30 天：天數紅字＋剩量；點卡跳 Batch stock 分頁 histView='stock'）④Batch stock（N batches · X kg）⑤Roast history 入口。驗證：jscheck＋preview 假資料（不夠/`blend`/夠三態、老批次篩選排除剩 0 與新鮮批、批次加總 7.3kg）＋截圖，全過
- **站台改造第 5 站：萃取站完成**（index.html，待 push 部署）：點 dock 的 **Recipe 圖示**改顯示 `renderEspressoStation()` 泡泡面板——①**On the bar — dial-in freshness**（在賣的豆＝PROD_SYNC synced，逐支顯示最新 dial-in 摘要＋幾天前；`ESP_STALE_DAYS=7` 超過或從沒調過紅字＋卡片轉黃框、徽章顯示 N stale；列上 **Dial in** 鍵帶入豆名開表單、**Apply** 鍵把最新數字寫進 espresso Brew guide＝重用 applyDialin）②**Other coffees dialled in**（非在賣但有紀錄，最多 6 支）③Log a dial-in / Dial-in history 入口。驗證：jscheck＋preview 假資料（today/10d 過期/never 三態、Apply 只給有紀錄的、stale 計數）＋Dial in 實按跳轉帶入豆名＋截圖，全過
- **抽屜手風琴（老闆需求）**：全 app 抽屜/收合卡一次只開一個——新增 `accToggle(st,k)`（開新自動收其他、再點=收合）/`accOpen(st,k)`（程式主動開也先清場）。改了 12 個點：訂單卡 ordExpanded、Retail 卡 rtlOpen、烘豆日期 roastedOpen（兩處）、杯測日期 cupDateOpen、杯測卡 cuppedOpen、樣品歷史 historyOpen/sampleOpen（兩處）、Production 產地 roastAddOpen、Blending blOpen、Timesheet 歷史 tsHistOpen ＋ 4 個程式主動開的點（存單展開/查庫存展開/Add Coffee 開日期/新增 blend）。**排班表 planOpen 刻意不動**（表單預設開有班的日子，手風琴會壞 UX）。preview 實測訂單卡三步驟＋日期抽屜切換，全過
- **聊天訊息刪除加警告（老闆需求）**：訊息中心 ✕ 鍵原本一按直刪（realtime 同步刪掉所有人的）→ `delMessage()` 加 confirm（顯示訊息前 60 字＋「刪了大家都看不到、無法復原」）。唯一刪除入口就這個。⚠ 點按路徑在 closure 裡、匿名又看不到訊息，只驗了語法＋頁面啟動零錯誤——部署後老闆自己刪一條測試訊息驗一次
- **站台改造第 0 站：總覽首頁完成（MVP＝站台脈搏）**（index.html，待 push 部署）：首頁訊息 feed 上方新增 `#pulse` 藥丸條（`loadStationPulse()`）——五站各一顆：Orders N new / Roast N to roast（Confirmed+Roasting 單＋重烘批次）/ QC N waiting（有批次沒判定）/ Espresso N stale（在賣超過 7 天沒調）/ Green N low（低於警戒線）。**只亮有事的站**（計 0 不顯示），全部沒事顯示「All stations clear ✓」；點藥丸 dockTo 直達該站。時機：登入後抓一次、goHome 刷新（60 秒節流）、開任何 cpanel 自動藏。驗證：preview 假資料五藥丸計數（含排除規則）＋點跳站＋回首頁復現＋全清空狀態＋截圖，全過
  - ~~⚠ RLS 漏洞：anon 可讀 messages~~ ✅ **已修**（老闆拍板）：migration `messages_select_authenticated_only`（drop「read for all」→ authenticated only）＋ applyRole 登入後補 `loadMessages()` 重載 feed。驗證：anon REST 讀 messages 回 `[]`、feedback 匿名寫入照常 201（測試列已清）、老闆登入中的 Chrome feed 正常顯示＋站台脈搏跑真資料（Espresso 10 stale / Green 4 low）
- **Task 模組完成（dock「Coming soon」轉正）**（index.html ＋ migration `tasks_table`，待 push 部署）：新表 `tasks`（title≤300/done/done_by/done_at/created_by，RLS authenticated 全可讀寫＝messages 信任模型）。點 dock **Task 圖示** → `renderTaskStation()`：①Add a task（輸入框＋Enter 或 Add 鍵，記 created_by）②**To do**（黃框，列上 Done 鍵→記 done_by/done_at）③**Recently done**（劃線＋Undo 鍵，最多 8 筆）④Task notes 入口（原 task 訊息頻道 feed 保留）。dock 兩鍵：Tasks（板）/ Notes（feed）。**站台脈搏加第六顆藥丸** `Tasks N open`。驗證：preview 假資料（載入/按 Done 移區/Enter 新增置頂）＋截圖，全過；⚠ 登入後首筆真 task 寫入待 boss 部署後試
- **站台改造第 7 站：Marketing 集中頁完成**（index.html，待 push 部署）：More 資料夾新增 **Marketing** 圖示（喇叭）→ `screen-mkt` 頁：①**New coffee announcement**（挑豆下拉標 live、Send announcement 走原 announceCoffee 含 QC 閘門/人數確認——不用再進 Retail Info 找喇叭）②**Online shop**（?shop 連結 Copy 鍵＋QR 產生）③**Assets and links** 四列跳 Print Centre（IG 卡片/豆頁 QR/Google review 顯示 ✓ set 狀態/Feedback QR）。資料載入 `mktEnsureRetail()`（同 Retail 資料源但不碰 beans 畫面）。驗證：preview 假資料（選項 live 標記/沒選豆擋/announce 派發正確 key/QR/跳轉 Print）＋截圖，全過；⚠ 真實群發待老闆部署後用（客戶 2 位風險低）
- **站台改造第 2 站：研發站完成**（index.html，待 push 部署；老闆指示「先把部門一個一個做好，再來設定」——權限等設定延後）：點 dock 的 **Blender 圖示**改顯示 `renderRnDStation()` 泡泡面板——①**Blends in development**（配方有定義但 Square 未 Live：**體檢列**＝parts 數／比例不到 100% 紅字／成本 $X/kg（blendCostPerKg 加權）／最後杯測日（沒杯測過或 >30 天紅字）；Edit 鍵 → Blending 工作台）②**Live blends — health check**（在賣配方同樣體檢，無按鈕）③Blending workbench / Retail calculator 入口。驗證：preview 假資料（成本加權 16.4/14.2 正確、pct 90% 警告、45d/never cupped 紅字、Edit 只在開發中列）＋截圖，全過
- **站台改造第 6 站：Retail 貨架卡完成（整合進 QC 站面板）**（index.html，待 push 部署）：Beans 站原「Live on Square 計數列」升級成 **Shelf 貨架卡**——每支在賣的豆一列：價格＋規格（loadRtlPrice/loadGrams，沒記價格紅字）＋Available/**Sold Out**（loadSold，賣完 ✕ gap 紅字＋卡片轉黃框＋徽章「N sold out」＋輪替提示「去 Green Buyer 杯測補位」）；列點擊與「Open Retail Info」寬鍵都跳 Retail Info。空貨架縮 quiet 列。驗證：preview 假資料三態（有價/沒記價/賣完）＋截圖，全過。**設計註**：貨架與 QC 同住 Beans 圖示面板（同一實體站），板上 6Retail 記「貨架卡入 QC 站」
- **站台改造第 9 站：客戶站完成——主線九站全亮** 🎉（index.html，待 push 部署）：More 資料夾新增 **Customers** 圖示（雙人）→ `screen-cust` 頁：①**Feedback awaiting reply**（reply 為空的回饋卡：星等/客名/日期/評語 120 字，有 email 顯示 Reply、沒有顯示 View，都跳 Feedback 頁）②**Customer book**（每位客戶：類型/單數/最後下單/累計金額（Cancelled 不計）/聯絡方式，照最後下單排序、沒單的標 new 沉底）③Feedback 頁入口。**站台脈搏第七顆藥丸** `Customers N to reply`（點了 openCustomers，dockTo 特例處理）。驗證：preview 假資料（去重/取消單不計/排序/Reply vs View）＋截圖，全過
- **站台 10 文件＋11 人事點亮（後勤收尾）**：**10 文件**認定為既有三件套即站——Print Centre（產文件）＋File（文件庫：合約/SCA 表/烘焙手冊）＋Post（寄件折扣碼），無新程式。**11 人事**補「**Today on shift**」卡（index.html，待 push 部署）：Timesheet 面板頂上顯示今天誰當班＋時段＋時數（用整週資料算今天、不受名字篩選影響；沒人排班縮 quiet 卡）。驗證：preview 假班表兩態（2 人當班/空班）＋截圖，全過
- **站台改造第 12 站：財務站 MVP 完成——16 格只剩黃色設定類** 🎉（index.html，待 push 部署）：More 資料夾新增 **Finance** 圖示（$）→ `screen-fin` 唯讀儀表板（不動任何規則，等老闆聊完記帳需求再擴）：①**Money in**（已收款訂單照下單月份分桶：本月大字＋上月對照）②**Outstanding**（未收款總額＋逐單列表照天數排序、overdue 紅字；寬鍵跳 Pay 分頁）③**Stock and buying**（生豆庫存價值 Σ qty×cost_per_kg，沒單價的列出支數不計入；本月採購花費 kg×cost_per_kg，cancelled 不計）④Retail calculator 入口＋頁尾聲明「卡費雜支未追蹤」。驗證：preview 假資料全數字驗算（246/180/285/250/540 含各排除規則）＋截圖，全過
- **Ratio 設計系統元件庫建立（`design-system/` 資料夾，待 push 部署）**：老闆問能不能連 Claude Design → 可以（DesignSync 工具），但**本 session 沒有 design 授權**（要老闆在互動終端機跑 `claude` → `/design-login` 授權一次）。已先把元件庫本體做好：index（總覽）＋colors（15 色票含 warn 黃三色）＋type（Fraunces/Inter/Space Mono 三字體分工）＋buttons（gbtn/gs-act/gs-wide/tf-chip/pulse-chip）＋cards（gs-card warn/quiet、po-card）＋badges＋station-panel（全 app 泡泡面板模式規則文件化）。每頁自足 HTML、首行帶 `@dsCard group` 標記。**部署後直接可看：https://ratio-theta.vercel.app/design-system/**。preview 實測 index 與 station-panel 渲染與 app 一致。✅ **已推上 claude.ai/design**（2026-07-06 晚）：桌面 session 拿不到 design 授權（授權綁終端機 CLI）→ 幫老闆裝了 Claude Code CLI 2.1.201（官方 install.sh，~/.local/bin 已加 PATH）→ 老闆在終端機跑 `/design-login` → 終端機 Claude 用 DesignSync 建「Ratio Design System」專案、7 檔全上、6 張卡自動歸類。**之後改設計系統的流程**：改 design-system/*.html → 終端機 claude 說「re-push 某檔到 Ratio Design System」
- **新殼互動原型完成（`design-system/prototype.html`，待 push 部署）**：老闆要求全面改版設計提案（手機優先/單手/大字/細節收抽屜/全按鈕操作），出了 A 今日流／B 大格子／C 拇指工作台三方案 → 按生產線與角色分析拍板 **A＋C 混搭**：老闆（跨站游走）用今日流全店待辦混排、員工（定點作業）看角色過濾後的清單＋底部拇指按鈕區。**這個設計同時解掉黃色設定類的權限地基**（角色過濾＝權限）。原型內容：今日流（黃框急件卡＋一卡一大鍵＋details 抽屜＋分站籌碼）、QC 站拇指工作台（上面選批次、底部固定 Pass/Re-roast/Down 大鍵、判完自動跳下一批）、右下角色切換（Wu Director／Sam Roaster／Dani Barista 看到不同的事）。假資料、純前端、**不碰現有 app**。preview 實測全互動（過濾/掉卡/抽屜/角色/工作台連判）＋截圖。**網址（push 後）：ratio-theta.vercel.app/design-system/prototype.html** — 老闆手機實測後拍板要不要全面換裝
  - **老闆看過方案說不錯 → 追加 Tools 分頁**（pull 式功能的家）：頂部大搜尋框跨生豆/客戶/訂單（命中開抽屜：庫存/客戶訂單史/聯絡方式），下面 Make（Invoice/資訊卡/標籤/菜單/QR/群發）＋ Look up（生豆/熟豆批次/客戶/訂單史/調參/財務）分組大按鈕。新殼＝三個世界：Today 事情找你／Tools 你找東西／角色鍵過濾
  - **進階第一級三件套已加進原型**（老闆點名做）：①**滑卡**（右滑=執行、左滑=貪睡到明天＋底部 undo 列；pointer events、touch-action:pan-y 不擋直捲）②**時段感知排序**（morning bar 優先/day 訂單優先/payday 錢優先，點排序說明線可切換試玩）③**晨報卡**（深色置頂：今日班表/待出訂單/QC/低庫存，details 開完整清單）。preview 全互動實測過。**進階路線圖已跟老闆講**：第二級 PWA＋推播（新單手機叮）＋離線佇列、第三級語音快錄／BOOKOO 秤藍牙／掃碼——換裝時做一級、緊接二級
  - **視覺定裝（老闆拍板）**：出過兩輪造型（奶茶/深焙/紙白/工裝 → 老闆選 3 紙白再延伸玫瑰/墨綠/雜誌襯線/炭紙）→ 定案 **3A 紙白＋玫瑰點綴＋Fraunces 標題，深色模式自動切炭紙夜版**（prefers-color-scheme，CSS 變數 --inv/--inv-t 反白件）。原則：黑白灰為底、**玫瑰只給可以按的東西**、晨報與 active 導覽用反白、細線 12px 圓角、tag 改大寫字距。已整套套進 prototype.html（preview 雙模式截圖驗證）。**若全面換裝，index.html 也照這套語言走**
- 開工檢查：上一 session 全部已 push 已部署（線上 662,628 bytes 同步）；「Analysed by」確認早已上線（杯測卡/Retail 卡/詳情頁三處）

## 〇之零、補記 — 2026-07-06 早上 session（QC 帶跑 + 補烘豆紀錄 + Re-analyse 防呆）
- **QC 按鈕看不到的根因**：6 支 blend（Dreamer/Dancer/Dark Knight/April/May/June Project）只有杯測紀錄、roasts 表沒有批次 → `qcRoastForSample` 找不到對象，QC 列不渲染。**已補 6 筆 roast rows**（照 + Add Coffee 格式：green_kg null、不動庫存、recipe 快照自 blends 表），QC 列全部長出來了
- **June Project 已 QC Pass + 風味鎖定**（老闆本人按的）；其餘 5 支 QC 還空著等老闆按 → 按完去 Retail Info push
- **抓到複本 bug**：submitCupping（熟豆 Analyse/Re-analyse）每次 Submit 都 insert 新 sample、無防呆（saveSample 有、這條漏了）→ June Project 曾冒出 3 筆。已刪 2 筆孤兒複本（07-06、roast_date null），並在 submitCupping 加同豆同日警告（再按一次才存）+ openCupping/openBlendCupping 重置 smpDupConfirm。**已 commit 待 push 部署**；部署後驗法：對已有今日紀錄的豆按 Re-analyse → Submit 應先跳 ⚠ 警告不寫入
- Chrome MCP 網域白名單**現在已含 ratio-theta.vercel.app**（本次成功代跑 app；登入仍請老闆自己按；mail.google.com 仍不行）
- **UI 小改**：杯測表單 Comment 欄改「Description · max 30 characters」（maxlength=30，舊長資料不動）；Beans 的 Pending 頁＋dock 按鈕改名「QC」（roastedTitle 旗標值同步改 'QC'）
- **介面改造方向拍板**：以工作崗位分功能——崗位首頁每站一顆泡泡（狀態藥丸＋一行預告），action 直接長在佇列列上，參考資訊收抽屜。細節見 Claude 記憶檔 ui-redesign-station-based.md
- **Green Station 第一站完成**（index.html，待 push 部署）：點 Green Buyer 不再直接跳 Inventory，改顯示 cpanel 泡泡面板 `renderGreenStation()`（樣式 .gs-*）——①Running out（黃框，quantity≤警戒線且警戒線>0；輪替制所以**不放補訂鍵**，底部一鍵跳杯測找新豆）②Cupping picks（決策 buy/maybe、排除已下單和 Ratio Coffee 自家，顯示供應商供老闆決定要不要聯繫；Order 鍵預填採購單）③On order（Received 鍵跳收貨表單）④Inventory 入口列。空佇列縮成灰字 quiet 卡。驗證：jscheck + 本機假資料實測（滿載/全空/警戒線0排除），⚠ 登入後 Order/Received 實跳採購頁待 boss 部署後點一遍
- **Green dock 攤平**（index.html，待 push 部署）：DOCK_NODES.green 改 `grid` 型節點（dockTo 新支援 + `dockGridHTML()` + .gridpill/.dock-mini 樣式）——底部 dock 左格 TRADE（C Market/Inventory/Buy/Sell）右格 SAMPLE（Analyse/History），全部一按直達，不再經 Trade/Sample 兩層；新 act `green:cmarket`（cpanel 顯示 C 市場圖）、`green:inv`（開庫存頁）。green.trade/green.sample 節點留著但已無入口。⚠ 看完 C Market 要回泡泡面板得 Home→Green Buyer 兩下，之後可優化
- **12 部門藍圖定案（老闆拍板，站台改造的底圖）**：主線九站＝1 生豆（✅已改造）→2 研發（app 支援最薄）→3 烘焙→4 QC→5 萃取→6 Retail→7 Marketing（功能散在 Retail 裡待集中：公告信/IG 素材/Google 評論/公開豆頁）→8 訂單（含出貨物流）→9 客戶；後勤三站＝10 文件（Print Centre）11 人事（Timesheet）12 財務（最零散：付款/對帳/利潤計算/雜支）。迴圈：客戶回饋→QC+研發、貨架空位→生豆。工作計劃待老闆排優先序
- **站台改造進度板**（一站一燈、可不照順序做；每完成一站把該格改 ✅ 加日期，重畫板子照這行。**老闆定的畫法（2026-07-06）**：綠=完成、米白=部門待蓋、**黃=設定類先擱置**——部門全蓋完才回頭做設定）：
  ✅ 1生豆(2026-07-06) ✅ 13網店櫥窗(2026-07-06 老闆實付驗證全通：?shop→Square 結帳→webhook 匯入 #0015→信件；**遺留小修**：櫥窗價格讀 product_sync 快取（$25）但 Square 連結模式商品實收自家價（$30）→ 菜單應改讀 Square 現價。**public-shop v2**：結帳地點改優先挑名字含 Online 的 location（舊版拿第一個=Crows Nest；可用 SQUARE_LOCATION_ID secret 強制指定）；⚠ sync-to-square 的 payment_link 仍走第一個地點，老闆還沒決定要不要跟進)｜ ✅ 8訂單(2026-07-06 泡泡面板，見補記) ✅ 4QC(2026-07-06 泡泡面板，見補記) ✅ 3烘焙(2026-07-06 泡泡面板，見補記) ✅ 5萃取(2026-07-06 泡泡面板，見補記) ✅ 0總覽首頁(2026-07-06 站台脈搏 MVP，見補記) ✅ Task模組(2026-07-06 待辦板＋脈搏藥丸，見補記) ✅ 2研發(2026-07-06 泡泡面板，見補記) ✅ 6Retail(2026-07-06 貨架卡入 QC 站，見補記) ✅ 7Marketing(2026-07-06 集中頁，見補記) ✅ 9客戶(2026-07-06 回饋佇列＋客戶名冊，見補記) ✅ 10文件(2026-07-06 既有 Print+File+Post 認站) ✅ 11人事(2026-07-06 Today on shift 卡) ✅ 12財務(2026-07-06 唯讀儀表板 MVP，見補記；記帳規則待老闆聊完再擴) ｜ 🟡設定類（先擱置）：權限地基（staff 角色開放）／Leaked password protection（Supabase Auth 後台）／sync-to-square 付款連結地點跟進 Online ｜ 停車場（不排程）：wholesale／賣生豆／教學
- **13 網店櫥窗主體完工**（index.html 待 push；edge 已部署）：
  - **`?shop` 公開菜單頁**（免登入，樣式沿用 ?bean= 公開頁 .pb-*，新 .ps-*）：列「Square synced ∧ 風味已鎖」的豆（QC 閘門同 public-bean），卡片＝名稱/配方或處理法/風味 3 顆/描述/價格規格 + Brew guide 連到 ?bean= + Order 鍵
  - **edge `public-shop` v1**（verify_jwt false）：GET=菜單 JSON（白名單欄位、快取 5 分）；POST checkout={bean,qty(1-5)} → 每次**新開** Square payment link（order-based link 綁單一訂單不能共用，所以不快取）帶 variation_id、要求寄送地址、關小費
  - 驗證：GET 回 June Project+Alo Village（其餘 5 支等鎖風味自動出現）、checkout 真的生出 square.link、本機 ?shop 渲染+Order 按鈕 POST 200；跳轉外域被預覽沙盒擋（真瀏覽器正常）
  - **老闆實測抓到兩顆震撼彈（都已修）**：①手動訂單 400——payment_method 表單是自由填空但 DB check 只收 bank_transfer/platform → 已改二選一下拉（index.html，已部署）②**webhook 匯入網店單從未成功過**——insert status:'new' 小寫違反 orders_status_check（六態大寫）→ **square-webhook v17** 改 'New' 已部署。老闆實測證實：地址有收、POS 閘有放行（fulfillment recipient 存在）、品項對得上，只差這個字
  - 老闆的 $25 測試單（June Project）付款成功但卡在 v16 的匯入牆；webhook 回 200 Square 不重送 → 要嘛 Square Developer 後台 Webhooks→Event Log 手動 Resend、要嘛再下一單驗 v17 後兩筆一起退款
  - **另注意 orders 表曾被整個清空**（連 #0001）：app 沒有刪訂單功能、老闆說不是他 → 疑似另一個 Claude session 或 Supabase 後台清測試資料；損失僅測試單。附帶發現店內 POS 刷卡（9:29 那筆）webhook 正確跳過 ✓
  - 客人網址：https://ratio-theta.vercel.app/?shop
- **首批真實批發單進場**（Happy Sip #0001 已出貨、Thirty 7even #0002）；順出三修：①訂單品項克數改固定下拉 100/150/200/250g/1kg（自由輸入打錯過 120g；舊資料非標準值會多列一項保留）②#0001 的 120g 已 SQL 修回 150g ③markOrderPaid 靜默失敗地雷待修（supabase update 不 throw、UI 卻顯示成功）。**客人「沒收到資訊卡」破案**：信 Resend 確認 delivered、卡有生成，是 Hotmail/Outlook 預設擋外部圖片 → 請客人按顯示圖片/加安全寄件人；治本已做：**訂單卡新增「Send info cards」按鈕**（index.html 待 push）→ 現場重生卡片 → send-email 新 action `info_cards`（**v16 已部署**，resend() 支援 attachments）把每支豆的資訊卡**當 PNG 附件**寄給客人，Outlook 擋外圖也看得到；沒杯測資料的豆（如 Gatitu AA）自動跳過
- **開車時段自主 bug 掃描（2026-07-06 下午）**：①訂單三個靜默失敗修掉（setOrderStatus/markOrderPaid/setTransfer 原本 try/catch 吞掉 supabase error、UI 假裝成功 → 改驗 u.error+alert+loadOrders 回滾；index.html 待 push）②**public-shop v3**：菜單價格改 Square catalog batch-retrieve 現價（驗證 Alo $30 正確），快取價僅作 fallback ③migration `tighten_contacts_rosters_rls_to_authenticated`：contacts/rosters 寫刪原本匿名可打 → 鎖 authenticated；revoke handle_new_user execute ④advisors 剩餘：app_state/messages 全登入者可寫（小團隊先接受）、mail-assets bucket 可列目錄（低風險）、is_staff anon 可執行（動了怕破 RLS 評估，留觀）、**Leaked password protection 仍未開（老闆 Auth 後台一鍵）**
- **老闆輪替制豆單重要背景**：豆子賣完就換新豆、不回購同一支 → 低庫存＝「貨架空位」訊號要接到找新豆流程，不是 reorder；警戒線設 0 = 該豆不警示
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
