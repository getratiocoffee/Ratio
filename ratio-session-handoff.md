# Ratio 開發交接 — 至 2026-07-12（閹割階段三完成：classic 整檔刪除，單一新殼）

## 🔧 2026-07-16 交接（新 session 先讀這段；上個 session 模型跳針，務必重開乾淨環境再動手）

### 方向定案（老闆 2026-07-16 拍板）
- **生產線 Line（PLINE）整個砍掉重建**：之前把 Line 從「整頁」改「浮層彈窗」做到一半，加上模型跳針，決定不收尾了，**Line 相關程式碼全部移除，之後重新做**（重建規格老闆另給）。

### 已完成、要保留（已 commit `22880e6`）
- **刪假 database ✅**：PLINE 不再讀寫 localStorage `pl_q`（qcQueue 改空陣列、save() 變 no-op），home() 流程圖三個寫死數字改真實導出。這部分是「移除假資料」，砍 Line 時會一起被刪掉沒關係——重點是**別把這觀念丟了**：重建的 Line 一律接真資料（Roast→roasts＋扣生豆、QC→qc 判定、Shelf→product_sync），不要再用本機假 database。

### 工作區現況（未 commit，是上個 session 的半成品爛攤子）
- popup 半成品：`#plbg`＋`#plview` 浮層卡片的 CSS（約 388 行區）、`<div id="plbg">`＋plview 內 `.plhdr` 標題列的 HTML（約 449 行）。**砍 Line 時連同一起刪**。可先 `git checkout -- new/index.html` 還原到 `22880e6` 乾淨點（只會丟這些半成品，今早的假 database 修正已 commit 不受影響）。

### 下一步：移除 Line/PLINE（新 session 乾淨環境做，一步一驗證）
要刪的位置（⚠ 用 `Read` 小範圍讀出精確原文再改，**絕不要用 grep 抓 JS 巨行**）：
1. 底部 nav 的 `<button id="nav-line">Line</button>`（約 444 行）
2. `<div id="plbg"></div>` ＋ `<div id="plview">…</div>` 整塊 HTML（約 449 行）
3. `#plview` / `#plbg` 的整段 CSS（約 388–434 行，含 .plhdr/.plx/.flow/.entry… 一大段自帶色盤）
4. PLINE 的整個 IIFE `var PLINE=(function(){…})();`（約 11168–11374 行）
5. render() 裡 `var plOn=(view==='line')…PLINE.mount();` 那行、`$('nav-line').classList.toggle('on',plOn);`、nav-line 的 `addEventListener`（約 11384–11408 區）
- 刪完 jscheck（osascript）確認語法過、Chrome 開 ratio-theta 確認底部少一顆 Line、其他鍵正常。再問老闆要不要 commit。

### ⚠ 兩個雷（務必避開）
1. **`new/index.html` 的 JS 全擠在超長單行**（一行好幾千字）。**不要用 `grep` 抓 JS 內字串**——會吐整條巨行、輸出爆量被截斷變亂碼。用 `Read` 指定 offset/limit 小範圍。
2. **老闆工作方式（重要）**：一步一個工具、他看得到我在做什麼；**不要一次腦補一大串連續動作**（假裝呼叫工具／假造結果）。上個 session 模型跳針、捏造假的 System 訊息與「去 git push」假指令，老闆當場喊停。保持一步一交付、每步真的驗證落地。

## ⚡ 當前狀態速覽（2026-07-12 更新，新 session 先讀這段）
- **🔑 QC 母體規則（2026-07-22 晚老闆定調，改 QC 前必讀）**：QC 只列「**烘豆室 or Crows Nest 還有貨**」的鍋（`qcStockWhere!=='gone'`），同豆同處理法同烘焙日**合併一張卡、判定整組一起**；沒貨又沒判的收在 QC 底部 `Unjudged history` 摺疊區。Publish 母體同口徑（rstRows ∪ transfers）∩ ★ flavour_locked。**這條規則翻過四次**，決策時間軸在 `toCupList` 上方註解，要改先讀（見補記之十）
- **🏁 閹割階段三完成（2026-07-12）**：**classic.html 已整檔刪除**（缺口清單 12 項全數移植或收掉，見補記之八）。**單一 app＝新殼**；classic 舊實作要查用 `git show 786f556:classic.html`
- **新殼 `/new`**（new/index.html，根 `/` 同它）＝唯一 app：**今日流 v3（2026-07-10 大改，見補記）**＝briefing 每日彈窗（班表＋公告板＋今日事件，喇叭隨開）＋My day/Everything 視角＋lead 派工（Assign 模式＋進度行）＋站別分組摺疊＋兩段式滑卡（左滑露 Later 再點才睡）＋Closing checklist（下午例行打勾記名）＋activity_log 操作記名（Tools→Activity 時間軸）＋Upcoming 30 天事件流；QC 拇指工作台＋Tools；紙白玫瑰＋炭紙自動夜版、PWA＋Web Push、角色過濾
- **⚠ Edge 實際線上版本（2026-07-11）**：sync-to-square **v22**（+ensure_sub_items 訂閱商品建置）/ square-webhook **v20**（+訂閱自動登記）/ public-shop **v11**（+subs[] 訂閱卡資料）/ send-email v23——下行速覽版號已舊，以此為準
- **Edge 版本**：send-email **v22**（2026-07-08：＋timesheet_pdf 薪資單寄財務＋cc 備份，finance 只放行此 action；v21 repurchase_nudge；v20 surcharge 揭露）/ sync-to-square **v19**（付款連結走 Online 地點＋2.2% surcharge）/ square-webhook **v18**（＋推播）/ public-shop **v8**（2026-07-08：售罄豆帶 sold_out 旗標上菜單、結帳擋售罄；v7 sizes/cart）/ public-bean v1 / **push-send v2**（2026-07-08：＋to 指定推播到人、lead 可呼叫——派工叮人用）/ **morning-brief v4**（2026-07-08：＋售罄滿 30 天自動下架；pg_cron 每天 **20:00/19:00 UTC 雙檔＝雪梨 6:00 整**（老闆改 6 點），算晨報→push-send 廣播；x-cron-key 驗證，金鑰在 secrets_kv 'cron_key'；訂閱 0 時無聲）/ **wholesale v3**（2026-07-08：批發自助下單；v3 售罄豆留在批發菜單帶 sold_out、checkout 擋，修 co-ferment 消失，見補記）。SURCHARGE_PCT secret 一處管四處（預設 2.2）
- **新表**：tasks（團隊待辦）/ push_subs（推播訂閱）/ secrets_kv（**零政策＝service-role only**，放 VAPID 鑰匙——advisor 的 INFO 是刻意設計）/ **activity_log**（2026-07-10 操作記名，append-only）/ **events**（2026-07-10 Upcoming 事件流）/ **subscriptions**（2026-07-11 豆子訂閱：見補記之五）；app_state 新 key ×4＝new_notices/new_closing_items/new_closing/new_assign（後兩者日期 key 隔天自動重置）
- **安全**：messages 匿名讀已鎖＋登入重載；handle_new_user execute 已再次 revoke（2026-07-07 驗證 404）；always-true 政策群＝小團隊信任模型（刻意）；mail-assets 可列目錄（低風險留觀）
- **等老闆做**：**Wholesale 開帳號**（見 2026-07-08 補記：清 customers 重複列→Auth 開帳號→Tools→Wholesale 切角色＋設折扣％→密碼長度調 12→Happy Sip 試一單；Leaked password protection 實測 Pro 限定不開了）、上架剩餘豆（classic Beans 站照佇列按）、新殼 Dispatch 首次真單看卡片、清 #0021/#0022 測試單＋註銷殘留連結 tDABzmGt（見 07-08 第二 session 補記；Chrome 桌機 07-08 傍晚再查仍登出，代跑不了）、~~iPhone 推播訂閱~~ ✅ 2026-07-08 老闆 iPhone 已訂閱（push_subs=1，send test 收到），晨報/新單/收款推播鏈路全通
- **進行中**：**Timesheet 2.0**（排班/薪資進新殼）——Stage A 錢庫 ✅／B 排班 UI ✅／**D 薪資+PDF+寄財務+classic 收尾 ✅（2026-07-08 全完工）**，**只剩 Stage C 開 8 員工帳號**（見專節；C 一定最後，D 完工才准做——現 rosters 已無現金資料，前提達成）。**權限＋派工層 ✅（2026-07-08 第三 session）**：tasks 指派給人＋期限、For you 卡置頂、派工推播叮人（push-send **v2** 帶 to）、Tools「New task」（全員）＋「Team」看板（lead）、profiles.lead 主管能力（Yi 拍板；派工＋排班、看不到錢）、Team 抽屜含 director 帳號/角色/lead 管理（Stage C 藍圖蓋掉）——**Yi 的 lead 旗標等 Stage C 帳號建好後在 Team 抽屜點開**
- **等老闆拍板**：語音快錄/BOOKOO 秤（第三級）、賣生豆/教學（停車場）；~~wholesale~~ ✅ 2026-07-08 全鏈完成；**Timesheet 等補**：~~finance 掛誰~~ ✅ Mimi Cheng lashesandmi@gmail.com（暫定，正式前確認）、~~每人費率數字~~ ✅ 八人平日$32/週末$38（個別可再調）、八員工 email、挑一週真寄一封薪資單給 Mimi 驗收（老闆晚點自測）、~~Dani 帳號（Hung）不明原因變 director 要不要降回~~ ✅ 2026-07-14 老闆拍板維持 director（wu110681@gmail.com）、批發折扣 50% 是否正式值
- **開發環境備忘**：push 用 GitHub Desktop（終端機無 Git 認證）；無 Node，jscheck 用 osascript；本機預覽 launch.json 指向 scratchpad/serve 複本（**改完檔案要 cp 過去**）；Chrome MCP 可開 ratio-theta（老闆登入態可代跑 callSquareFn 等）；Claude Code CLI 已裝在老闆 Mac（design-login 已授權，重推設計系統用終端機 claude）

## 〇、Timesheet 2.0 — 排班/薪資搬進新殼（2026-07-08 老闆定案，Stage A 完工，B/C/D 藍圖在此照抄施工）

### 需求定案（老闆四拍板）
- **finance 新角色**：cash/on-book＋薪資只有 director+finance 可見；**財務＝Mimi Cheng lashesandmi@gmail.com（2026-07-08 暫定）**——薪資單寄她，副本備份給老闆 ratiocoffee2473@gmail.com；帳號 Stage C 才開，故 email 先存 app_state `finance_email`（edge 從此讀，不用等開帳號）
- **費率**：每人兩種＝平日費率＋週末費率（週六日同價）；薪水＝平日時數×平日價＋週末時數×週末價
- **PDF**：時數＋金額都列，寄 email 給 finance（走 send-email 管線留紀錄）
- **員工帳號**：八人全開（Yi/Manami/Joshua/Juwa/Daniel/Samuel/Nina/Lovey）——email 等老闆提供
- **班型模板**（老闆口述；⚠ 現行 DB 週一至五 A 班實排 05:45，模板照老闆新寫的 06:15 做、做成可編輯）：
  週一–五＝A 06:15–14:15（**br:true 半小時無薪休息**）＋B 08:15–14:15；週六＝A 06:15–15:15＋B 08:15–16:15＋C 09:15–16:15；週日＝A1 06:15–08:15＋A2 08:15–15:15＋B 08:15–16:15＋C 09:15–16:15（週六日暫無 break）
- 已自動不用做：週日結束自動進 history（history＝week_start<本週一，天生自動）

### Stage A ✅ 完工（migration `timesheet_money_vault`＋`profiles_update_director_only`，2026-07-08）
- **函式**：is_staff() 補 'finance'；新 `is_money()`（director+finance）、`my_profile_name()`（回呼叫者名字）、`is_director()`——全 SECURITY DEFINER（advisors 會多幾條 WARN＝設計如此，同 is_staff 條目，**不可 revoke**）
- **新表四張**：`staff_members`（名冊 8 人 seeded，sort 排序；team 可讀/money 可寫）、`staff_rates`（費率，**money-only 全鎖**，費率值等老闆填）、`pay_weeks`（week_start text PK＋cash jsonb＋sent_at；**money-only**；已從 rosters.cash 搬入 2 週資料）、`staff_na`（N/A：team 可讀；insert/update/delete＝money 或 name=my_profile_name()——員工只能動自己的）
- ~~**rosters.cash 暫留原地**~~ ✅ **2026-07-08 Stage D 收尾完成**：classic getCashSet/setCashSet 已 repoint 到 pay_weeks、rosters.cash 已清空且 saveRosterRow 不再寫入——員工讀 rosters 不會看到誰領現金，Stage C 前提達成
- **封洞**：profiles update 政策原本 is_staff()（員工帳號一開就能自改 role 升權進錢庫）→ 換 `is_director()` 專屬（finance 也不給——只看錢不管人事）
- **滲透測試**：批發帳號四表全 0＋update 0 列＋自升 director 0 列；匿名全 0；老闆視角名冊 8/薪務 2 週/費率可改/可代填他人 N/A/可管角色——全過（測試寫入全 rollback）。⚠ **staff 角色的「只能動自己 N/A」實測要等 Stage C 有真員工帳號**（政策條件已寫好）
- **順手發現**：Dani 測試帳號（Hung，wu110681）**不知何時變成 director**（中午還是 wholesale）——等老闆發落要不要降回

### Stage B ✅ 完工（new/index.html，2026-07-08 Opus）
- Tools「Timesheet」磁貼（director only，在 Wholesale 旁）→ `openRosterSheet()`：本週/下週/週後 seg、每天卡（名字＋時間＋½標記＋時數，未指派顯示「— tap to assign」灰列）、「Apply standard week」套模板（confirm 覆蓋）＋「Edit…」改模板、「+ shift」加班、點列開 `openShiftEdit`（人員 chips＝staff_members 按 sort、time 起訖、½ break 切換、Remove）、N/A 撞班黃 ⚠（列＋chip＋編輯抽屜黃字）、「Save this/next/week after」upsert rosters（**cash 欄原封帶回**、shift 形狀 {day,name,start,end,br} 不動）；存當週同步 DB.roster+buildItems
- 班型存 app_state `ts_templates`（openTemplateEdit：三日型 mon-fri/sat/sun 加減 slot＋改時間＋½；首次預設＝老闆班型 RS_TPL_DEFAULT，存過以 DB 為準）
- helper rsHM/rsHrs（＝classic tsPaidBr：時距−br?0.5）/rsWeekStart（＝mondayStr＋i*7）/rsUnavailable（N/A 日期區間比對）
- **順手防呆**：todayShifts() 過濾空名（未指派班不進今日流「今天誰上班」）
- **By day / By person 切換**（老闆問「哪裡看個人班表」當場加）：RS_VIEW 全域＋抽屜頂 pm-seg；By person＝`rosterPersonHTML` 把該週班按名分組（每人本週總時數＋逐班 day/date/time/⚠；未指派另列一格「assign in By day」），順序照 RS_STAFF；person 模式藏套模板鈕；點任一班照樣進 openShiftEdit。驗證：preview stub——toggle 2 顆、Yi 24h(7.5+7.5+9)/Joshua 6h、未指派分組、撞班 ⚠×3、person 模式無套模板鈕、點班開編輯器 ✓＋截圖。**個人班表本身（員工自己看）仍是 Stage C**；這是給主管排班時對照用（重用同資料）
- 驗證：jscheck ✓；preview stub 全流程——3 週 seg/7 天卡/套模板 17 班（週一五 2×5＋六 3＋日 4）/指派 Yi 撞 N/A 亮 ⚠＋黃字/改時間 15:15 break off=9h/存檔 payload（week_start、17 班、cash 保留 ["Daniel"]、onConflict week_start、shift 形狀對）/切下週空/模板加 slot 存 app_state/DB.roster 同步 17/console 零錯誤＋兩張截圖（週視圖＋班次編輯抽屜）。⚠ 真機＋真資料（跨裝置 realtime、晨報卡 regression）等老闆部署後掃
### Stage B 舊藍圖（已完成，保留供對照）
1. Tools 磁貼「Timesheet」（data-t 'roster'，director only 先）→ `openRosterSheet()`：頂部週切換 seg〔This week｜Next week｜Week after〕（週一＝mondayStr()＋0/7/14 天）；每天一段（Mon–Sun＋日期），列該日 shifts（名字＋start–end＋hrs＋br 標記），點列開編輯（改人/改時間/br 勾/刪除），「＋ Add shift」選人（**staff_members** active 按 sort；查詢空陣列 fallback classic STAFF_NAMES 八人）＋時間
2. **Apply template 鈕**（整週）：模板存 app_state key `ts_templates`（read-modify-write 照 rtl_dot 慣例），形狀 `{monfri:[{start,end,br}...],sat:[...],sun:[...]}`；code 內建預設值＝上面老闆班型；週已有班先 confirm 才覆蓋；另做「Edit templates…」子抽屜改模板時間/br
3. **N/A 撞班警告**：讀 staff_na 與該週重疊的列；shift 的名字當天在 N/A 內 → 列尾黃字「⚠ unavailable」；選人清單同標
4. **存檔照抄 classic saveRosterRow**：upsert rosters `{week_start,shifts,deleted:false,updated_at}`；**shifts 項目形狀絕不能改**＝`{day:'mon',name,start,end,br?}`（morning-brief v4/今日流晨報卡/classic 都在讀）；hrs 計算＝時距−(br?0.5:0)
5. 驗證：jscheck；preview stub——模板整週填=17 列（週一五 2×5＋六 3＋日 4）、N/A 黃字、編輯/刪除、upsert payload 逐欄、晨報卡 regression；真機部署後老闆排下週班
### Stage D ✅ 全完工（Stage B 後、先於 C）——核心＋PDF＋寄財務＋classic 收尾全過，可進 Stage C
- **✅ 已完工（new/index.html，2026-07-08 Opus）**：①`myRole()` 白名單補 'finance'（原本 finance 會被當 customer 踢去購物頁）②Timesheet 磁貼門檻改 director+finance ③排班抽屜底加「Past weeks & pay →」→ `openPayrollSheet`：往週列表（rosters week_start<本週一、非 deleted、有指派名字的班；lt+order desc+limit 16）、可折疊、週表頭總平日/總週末時數；每人「平日 h · 週末 h」＋（**rsMoney＝director/finance 才畫**）薪水＝平日h×平日費率＋週末h×週末費率＋Cash/Bank 切換（upsert pay_weeks，sent_at 保留）；沒費率顯示紅字 set rate。`rsWeekHours` 拆分同 classic（mon-fri 平日/sat+sun 週末）④「Edit pay rates…」→ openRatesSheet：每人平日/週末兩格（$ 前綴，預填現值），upsert staff_rates（onConflict name）⑤**錢的牆**：前端 rsMoney 只是不畫；真牆是 RLS（staff_rates/pay_weeks money-only，staff 查回空）——雙保險。驗證：preview stub——2 週列/折疊/Yi 15h平日9h週末=$765(15×30+9×35)/Manami set rate/週表頭 21h wd 9h we/Cash 切換 upsert{cash:['Yi'],onConflict week_start}/**staff 視圖無 $ 無 cash 鈕無費率鈕但保留時數**/費率編輯預填 30 存 upsert onConflict name ✓＋截圖，console 零錯誤（測試中兩條 limit 報錯＝第一版 stub 漏 .limit，真 PostgREST 有，第二版已補）
- **✅ PDF 完工（new/index.html，2026-07-08 Opus）**：payroll 週卡展開後、**rsMoney 才出**的「Download PDF」鈕（data-paypdf）→ `genPayPDF(ws,btn)`（PAY_WK 查該週）→ **重用 `menusPDF(buildFn)` 載入器**（已含 jsPDF 2.5.1 CDN＋logo 載入，免重寫）→ `buildPayPDF(w,logo)`：portrait A4 pt，logo＋標題 Ratio Coffee/Payroll、右上週範圍＋generated 日期；表頭 STAFF｜WEEKDAY｜WEEKEND｜RATE(wd/we)｜WAGE｜PAID，每人一列（時數用 rsHH、費率 $wd/$we、金額 hasRate 才算否則 no rate/—、Cash 用 accent 色 Bank 用 muted），底部總計列（總平日 h／總週末 h／總薪，只加有費率者）；檔名 `Ratio_Payroll_<week_start>.pdf`。⚠ **jsPDF 2.5.1 的 `save` 掛在實例(level 0)不是 prototype**，攔測要包建構子（測試備忘）。驗證：preview 假資料——buildPayPDF 吐 7014 bytes/1 頁/檔名對、Yi 15wd×30+9we×35=$765 Joshua 6wd×28=$168 Manami no rate 總計21wd/16we/$933、director 出鈕 staff 不出、genPayPDF 端到端 5491 bytes 零錯誤＋截圖（$540.00 週卡帶鈕）。⚠ 真下載 PDF 檔面等老闆部署後手機按一張看排版
- **✅ Email to finance 完工（new/index.html＋send-email v22＋app_state，2026-07-08 Opus）**：payroll 週卡「Email to finance」鈕（data-payemail，money 才出）→ `emailPayPDF(ws,btn)`：`payTotals()` 算 {staff,totWd,totWe,totWage}→confirm（帶財務 email，文案「backup copy goes to you too」）→ **重用 buildPayPDF**（已改成 return doc 不 save；下載路改自己 doc.save）→ `btoa(doc.output())` 轉 base64 → callFn send-email `timesheet_pdf`｛week_start, pdf_b64, summary｝→ 成功後本地 meta.sent_at 蓋章＋renderPayroll（週表頭「· sent」亮）。**send-email v22**：①`resend()` 加 `cc` 參數 ②新 action `timesheet_pdf`：財務 email 讀 **app_state `finance_email` {email,cc}**（沒有 fallback NOTIFY），寄 PDF 附件給 email、**cc 備份**、回寫 pay_weeks.sent_at ③授權重構＝抓 role，**finance 只放行 timesheet_pdf 這一個 action**（其他寄信仍 director/service-role；RLS 也已擋錢表，雙保險）。**app_state finance_email 已 seed**＝{email:lashesandmi@gmail.com（Mimi 暫定）, cc:ratiocoffee2473@gmail.com（老闆備份）}。驗證：jscheck ✓；preview 假資料——director 出 email+pdf 兩鈕 staff 全不出、callFn payload action/week/summary{staff2,7.5wd,16we,$540}/b64head `JVBERi0x`＝%PDF header/成功後 sent_at 蓋章、console 零錯誤；edge 煙霧測試 anon→401（閘門有效沒寄出）。⚠ **真寄一封還沒做**——老闆說晚點自己測（挑一週按「Email to finance」會真的寄給 Mimi＋副本給老闆）；Mimi email 是暫定，正式前老闆確認。**財務 email 已有 UI 可改**（payroll 抽屜「Edit pay rates…」下方輸入欄＋Save→`saveFinanceEmail`：upsert app_state finance_email，**cc 備份 read-modify 保留不掉**；money only；驗證 director 出欄 staff 不出、改 email upsert payload cc 保留 ✓）。**費率已 seed 八人平日 $32／週末 $38**（2026-07-08 老闆給；staff_rates 全表，Yi 一週 7.5wd+9we=$582 驗算對；個別要調用 Edit pay rates）
- **✅ classic 收尾完工（index.html，2026-07-08 Opus）**：老闆定案 classic 長期淘汰（見記憶 classic-to-be-retired），現金已全在手機新殼標，故走**最省 repoint**不為將死的殼重寫：①classic 新增 `PAYWK` 快取＋`loadPayWeeks()`（boot 時撈 pay_weeks；money-only RLS，非 director 讀回空＝fail-safe 不顯示現金）②`getCashSet` 改讀 PAYWK、`setCashSet` 改 upsert **pay_weeks**（不再碰 rosters.cash）③`saveRosterRow` 一律送 `cash:[]`（就算記憶體殘留舊值也剝掉——洞從 classic 端補死）④SQL 清空 rosters.cash（兩週資料先確認 pay_weeks 已一致才清；欄保留防 realtime payload 形狀壞）。**至此 rosters 表無現金資料，Stage C 開員工帳號不會外洩誰領現金**。驗證：jscheck ✓；classic serve 複本（無登入 session＝fail-safe 路徑）——getCashSet 讀 PAYWK ['Samuel','Joshua','Daniel']／空週回[]／setCashSet 只寫 pay_weeks{cash+Nina,onConflict week_start}沒碰 rosters／saveRosterRow 殘留 ['Daniel','Nina']→送 cash:[] 班表照存／boot console 零錯誤。⚠ 真登入下 director 讀 pay_weeks＋toggle 寫回，等老闆部署後在 classic Timesheet History 掃一眼（Stage A 已測 director 可讀 pay_weeks 2 週，風險低）
4. ~~⚠ finance 帳號的今日流目前空~~ ✅ 2026-07-08 補完（new/index.html）：①晨報卡 roles 補 'finance'（登入看得到店況）②finance 專屬常駐卡「Timesheet & payroll」（id fin-pay，pin 置頂，kind 'paynav'→runAction 直開 openPayrollSheet；只有 myRole()==='finance' 才 push，director/staff 不出）。驗證：preview stub——finance 兩卡（brief+fin-pay）、director 無 fin-pay、按卡開「Past weeks & pay」抽屜、console 零錯誤。Stage C 建 Mimi 帳號後即生效
### Stage C 藍圖（最後做；D 完成為前提；**Team 抽屜已由派工層蓋掉**，見第三 session 補記）
1. 老闆 Supabase Auth 建 8 帳號（同批發開法，email 老闆給）→ handle_new_user 自動 customer profile
2. ~~Tools「Team」抽屜~~ ✅ 已完工（2026-07-08 派工層內建：Tools→Team director 區＝改名＋角色 chips＋Lead 開關）——老闆開完帳號進去把 8 人切 staff、**點 Yi 的 Make lead**（老闆拍板的主管）
3. 員工端：staff 登入 → Timesheet 磁貼（唯讀）：Today｜This week｜Mine 三檔＋「My unavailability」（列自己的＋新增 start/end，自動帶自己名字）；staff 看不到任何錢。⚠ 注意 Timesheet 磁貼門檻現為 director/finance/**lead**——staff 唯讀版做好後門檻再放寬成全員
4. 驗證（真帳號）：staff 查 staff_rates/pay_weeks＝空、N/A 只能自填（幫別人填被拒）、改 profiles 被拒、今日流角色過濾正常、**staff 收派工推播＋For you 卡置頂、Yi 能派工＋排班但查薪資空**

## 〇、補記 — 2026-07-23 之十七（Publish 不再讓沒★的豆隱形＋Publish 卡加 Re-cup ✅ 待 push）

### 起因：老闆問「為什麼看不到 May Project」→ 追出雞生蛋死結
- **打 ★ 的唯一實際入口**＝Publish 卡 → List 抽屜的「★ Star this batch」toggle（`starSample` 全檔只有 List push 一處呼叫）。
  Coffee Info 2026-07-16 已改只讀（打★鈕拿掉，註解寫「走 Publish/QC 主線」）；QC 判 pass **不自動打★**（QC 文案：「★ is added when you list it on Square」）。
- 但 Publish 母體只收有★的豆（`addRow` 的 `if(!s||!s.flavour_locked)return`）→ **沒★→進不了 Publish→開不了 List→打不了★**。
- **May Project 實況**：烘豆室 0、Crows Nest 7 kg（settled）、QC pass、有杯測、**沒★**、從沒上過 Square。
  它在 Beans 的 Ready to shelf 看得到，但那張卡 `data-bact="pub"` 點下去跳 Publish **又列不出它＝撞牆**。
  比 Hakuna Matata 更慘：那支至少 synced 會被底部「沒★」提示點名，May Project 非 synced **連提示都沒有**＝雙重隱形。
- **老闆定調**：「豆子必須不能隱形，不然下一次我要選那隻豆子打星星的話就沒地方做。」

### 本輪修的
- **`addRow` 放寬**：`s` 為 null（連杯測都沒有）才擋；沒★的豆只要**還有貨（兩地任一）且不是 downgrade 批**就進清單，標 `needsStar`。賣光的舊杯測、打槍豆仍擋在外
- **卡片三態膠囊**：`No stock`（紅，在賣沒貨）／**`Needs ★`（琥珀，新）**／`★ On shelf`
- **needsStar 卡的按鈕組**＝`Add ★ · selling version`（新，`data-pubact="star"` → `starSample(x.s,false)`，**只打★、不碰 Square 也不碰 roasts**）＋`List`（打★＋上架一次到位）＋`Re-cup`；
  **行銷類（email/social/ig）藏起來**——`announceShelfBean` 對沒★硬擋，列出來只會按了被擋
- **排序四層**：在賣沒貨 → 有貨沒★（該打星）→ 鎖了沒上架 → 已上架
- **底部提示改義**：有杯測沒★的已進清單不用點名；那段只剩「上了 Square 卻**連杯測都沒有**」→ 叫你去 QC 杯測
- **Beans 撞牆自動解除**（不用改 Beans）：May Project 進 Publish 後 `data-bkey="may project|"` 對得上 `key`，點過去直接展開
- **驗證**：jscheck ✓；假資料——May Project 進清單標 `Needs ★` 排最上、Dark Knight 維持 `★ On shelf`、**賣光的 Gatitu AA 與 downgrade 的 Danche v1 正確排除**；按鈕組 needsStar=[star,list,recup]／已★=[list,sold,email,social,ig,recup]（**回歸原封不動**）；按 Add ★ → 只送 `PATCH samples?id=eq.s-mp {"flavour_locked":true}`，`touchedRoasts=false`／`touchedSquare=false`；Beans Ready to shelf 點 May Project → `landedOnPublish=true`＋卡片自動展開＋Add ★ 鈕在；375px 截圖、console 零錯誤

### 同輪稍早：Publish 卡加 Re-cup（老闆選 A 方案）
- 老闆要「Publish 的豆子能放回 QC 做品控」→ 確認是 **A＝重新杯測**（豆照賣、★ 不動），非「退回待判」
- 卡片最下面加 `Re-cup — score this coffee again` → 走既有 `openRecupSheet`，帶原分數風味，存檔 update 同一筆 sample
- `openRecupSheet` 加 `back` 參數、`saveCupSheet` 依它決定回 Publish 或 QC 台（不打斷上架流程）
- 賣完沒在庫鍋的豆用 ★ 那筆自組 fallback `r`（re-cup 存檔本就不依賴 roasts），一樣開得起來
- 驗證：存檔只 PATCH samples、`roastsTouched=false`、`backedToPublish=true`

### ⚠ 老闆待決（我沒動）
**現在「能不能上架」的硬門檻是 ★，不是 QC pass**（QC pass 只在發 email 時軟提醒，downgrade 才硬擋）。
老闆若要改成「必須 QC pass 才准上架」，那是另一個改動——會改變現行上架習慣，等他決定。

## 〇、補記 — 2026-07-23 之十六（庫存單一窗口 STOCK＋Beans 重複修掉 ✅ 待 push）

- **起因**：老闆說 Beans（production line）有豆子重複。查出來是**同一批店面的貨被同日的每一鍋各認領一次**——
  `shopKgOf(r)` 其實是「豆名＋處理法＋烘焙日」層級，卻被當成「這一鍋」用。
  線上實況：Dark Knight 07/06 五鍋都 0 kg、店面只有 3.3 kg，卻列成 5 行、每行都寫 at Crows Nest 3.3 kg；
  全站 **9 支豆／12 個同日組被拆成 30 行，多出 18 行**（On shelf 14、Ready to shelf 4）。統計卡也跟著灌水。
- **老闆定調（原話）**：「是否統一從一個地方領取 crows nest & roastery 會比較安全」→ 本輪照做。
- **新增 `STOCK` 單一窗口**（放在原 shopKgOf 位置）：**三個層級講清楚，其他地方不要自己翻 DB.roasts/DB.transfers**
  - `STOCK.batch(r)` 這一鍋 `{hand}`／`STOCK.day(name,proc,date)` 這支豆這天 `{hand,shop,total,rows}`／`STOCK.bean(name,proc,isBlend)` 這支豆全部 `{hand,shop,total,batches,dg,pending}`
  - ⚠ **鐵律**：Crows Nest 的貨掛在「豆名＋處理法＋烘焙日」上，**不屬於任何單一鍋**。要顯示 at Crows Nest 只能用 day / bean 層級
  - **刻意不做快取**（roasts 74 筆、transfers 18 筆的小表，現算才不會有「資料改了快取沒更新」這種最難查的錯）
  - 處理法比對**刻意留兩套**（別順手統一）：transfers 容忍空值（舊資料 13/18 筆沒填 process，硬比會讓店面的貨整批消失）；roasts 照 `rstProcMatch`＝undefined 不比、有給就嚴格比
- **既有函式改成薄包裝**（呼叫端全不動）：`rstBatches`／`rstStockKg`／`rstDgBatches`／`rstPendingBatches`／`shopKgOfName` → 轉問 STOCK.bean；`shopKgOf` **改名 `shopKgOfDay`**（5 個呼叫點）讓名字說出層級。`shopPoolRows`（出貨吃未計費 pool）**刻意不併**——條件比 STOCK 窄，註解寫明
- **Beans 頁**：`live` 拆兩種來源＝烘豆室有貨的鍋（逐鍋）＋只在店面有貨的日組（**一組一個代表鍋**）；
  Ready/On shelf/Blend pool 三段改用 `qcDayGroups` 分組、`rowG(g,lamps,act)` 參數化與 In QC 共用（逐鍋版 `row()` 整支移除）
- **統計卡**（老闆核可）：ROASTED 的 roasts 數＝烘豆室鍋數＋只在店面的日組數，passed/downgraded 同口徑。線上預估 42 → 30 出頭
- **驗證**：jscheck ✓；假資料（真資料形狀的縮影）——
  三層級：同日五鍋 `batch().hand` 各自 0、`day().shop` 只算一次 3.3、`bean().shop` 也 3.3 ✓；
  舊資料容忍：transfer 沒填 process 仍對得到 Kii AB 1 kg ✓；
  包裝函式：`rstStockKg('Danche v1',false,'Red Honey')`=17.95（2 鍋）、給錯處理法=0、拼配層級 undefined 不比 ✓；
  Beans：**Dark Knight 07/06 五行→1 行**、Kii AB 兩行→1 行、Danche v1 兩鍋真有貨→1 行寫「2 roasts」、
  In QC 仍撈得到待判的 Hakuna Matata、統計卡 5 roasts（舊算法會是 9）✓；
  回歸：Publish 兩地 kg 一支豆算一次、Roastery Stock 母體不變（0kg 不列）、出貨未計費池只吃 pool 無發票號 ✓；
  點擊屬性 `data-bkey=danche v1|red honey` 正確；375px 截圖、console 零錯誤
- ⚠ **server 端另有一份同口徑實作**（public-shop v18／wholesale v6 的 `stockByName`，bean 層級）——跑在 Deno 沒法共用程式，**改規則要兩邊一起改**（STOCK 註解裡有標）

## 〇、補記 — 2026-07-22 之十五（第一批體檢補洞 B/C/D/F ✅ 前端待 push／兩支 edge 已部署）

老闆問「log roast 到上架的漏洞是否都補上了」→ 逐項查完（七個補了兩個半），他說「交給你」，本輪把剩下的做掉。
**七個洞現況**：①Used 蒸發 ✅(之十一)｜②扣豆不含店面 ✅本輪｜③沒貨還在賣 ✅本輪｜④賣完掉出 Publish ✅本輪｜⑤★ 換批 ✅(早前 starSample/lockedMate 已做)｜⑥Coffee Info supplier ✅本輪｜⑦Hakuna Matata 沒 ★ ＝資料問題，本輪改成**在 Publish 頂端點名**（老闆自己按 ★）
**還沒動**：第二批 G（刪咖啡雙鍵＋transfers）／H（熟豆 stock_moves）；第三批四項

- **⑥ 一行**：`loadAll` 的 samples `.select()` 補上 `supplier`。查詢本來就 `.eq('supplier','Ratio Coffee')`，但欄位沒帶回來，而 `:2594`（Coffee Info 候選）與 `:3975`（Cleanup B 區）事後又用 `s.supplier==='Ratio Coffee'` 過濾＝永遠 undefined＝母體恆空。驗證：假資料下 Coffee Info 的 `HISTORY — SOLD THROUGH` 區長出東西了（以前恆空）
- **② 出貨扣豆納入 Crows Nest**（`deductOrderStock`）：烘豆室批次扣完還不夠時，看 **`shopPoolRows`＝status='pool' 且沒有 invoice_no 的行**（＝豆放在店面但還沒跟店面收錢＝帳上仍是我們的貨）。**settled／已開發票的一律不碰**（店面買斷了）。一次 confirm 列出所有短缺豆與店面存量，同意才動；`takeFromShopPool` 舊的先出，部分扣改 kg、整行扣光改 `status='used'` 並把訂單號寫進 `invoice_no`（去向可追，也不會被「Used and returned」誤標 never invoiced）。取消＝完全不動店面帳，short 訊息補上「Crows Nest has N kg」
- **④ Publish 不再讓豆子掉出去**：`paintPublishSheet` 母體加**第四輪**＝`product_sync` status='synced' 的豆（不管有沒有貨）。在賣卻兩地 0kg 的排最上、紅色 `No stock` 膠囊＋紅字「nothing left anywhere — customers can still buy it」＝終於有地方按 Take off shelf。另加⑦：頂端一條提示列出 **synced 卻沒 ★** 的豆（母體門檻不動，只是點名）
- **③ 沒貨的豆自動 Sold out（兩支 edge 都部署了）**：
  - **public-shop v18**（線上 version 19）＋ **wholesale v6**（線上 version 9）：新 `stockByName()` ＝ roasts(remaining_kg，downgrade 不算) ＋ transfers(pool/settled)，**按豆名（不按處理法）**——roasts/transfers 的 process 不一定填，對不到 key 會把賣得動的豆藏起來，寧可寬鬆。**fail-open**：任一查詢出錯就整個關掉守門＝退回舊行為（寧可多賣也不要把整間店清空）。訂閱豁免（沒有烘焙批次可算）
  - 0kg → `sold_out:true` ＋ variations 不進 `allowedVarIds`＝結帳擋。public-shop 的**舊單品直購路徑**（`{bean,qty}`）沒經過 allowedVarIds，另外補了一次庫存檢查
- **驗證**：jscheck ✓；**線上真資料**——`GET public-shop` 回 14 支：Alo Village ×2、Danche v2 正確變 SOLD OUT（就是體檢抓到那三支），有貨的 9 支照常買、訂閱 2 個照常、零誤殺；結帳三條路全擋（兩個 variation → `unknown item in cart`、舊路徑 → `this coffee is sold out`，沒有產生任何 Square 連結）；兩支 edge anon→401。**假資料前端**——Publish 三態（沒貨在賣排最上＋NO STOCK／只在店面／烘豆室）＋無★提示；扣豆五情境（取消不動帳且 short 帶店面存量／同意扣 1kg→`PATCH transfers {kg:8.75}`／整行扣光→`{kg:0,status:used,invoice_no:'#0042'}` 且離開清單／settled 行不問也不碰／烘豆室夠時完全不問）；console 零錯誤
- ⚠ **老闆要做**：Hakuna Matata（10.55 kg、synced、沒 ★）進 QC 加星，不然網店看不到它；Alo Village ×2 與 Danche v2 現在客人買不到了，但 Square 後台仍掛著在賣——進 Publish 按 Take off shelf 收乾淨

## 〇、補記 — 2026-07-22 之十四（批發帳號名冊＋每家自己的折扣 ✅ 前端待 push／DB＋edge 已上線）

- **老闆要求**：「在 Customers 的介面裡面幫我多一個 icon 給我 wholesale account list」→ 追加「每一個 wholesale 有不同的折扣」
- **磁貼**：Tools → **Customers 分類**多一顆 **Wholesale · account list**（`whacc` → `openWholesaleAccountsSheet`，新 icon `shopfront`；**isLead 以上**才出現，因為列出金額）。Orders 分類原本那顆同名的改叫 **Wholesale setup**（那支是折扣預設/條款/申請，不是名冊）
- **名冊內容**（`whAccountRows()`）：誰算批發＝客戶檔 type 是 `shop`/`cafe`/`wholesale` **或** 下過 `channel='wholesale'` 的單（現在真資料三家都是 `shop`）。每列＝訂單數/最後下單/累計金額＋未收紅字＋右邊折扣標籤；底下一區列「有 wholesale 登入帳號但客戶名冊對不到名字」的孤兒帳號；director 另有一鍵跳 Wholesale setup。點一列進 `openCustomerDetail(r,fromWs=true)`，返回鍵文案跟著變
- **每家自己的折扣（重點）**：
  - **DB**：`customers.ws_pct numeric`（migration `customers_ws_pct`，check 0–90，**null＝沒特別談＝用全店預設**）。RLS 不用動（既有 staff update；批發客只讀得到自己那列）
  - **UI**：客戶詳情頁（只在批發名冊那條路＋isLead）多一欄 `Wholesale discount` ＋ Save；**空白存檔＝寫 null＝回到全店預設**，0–90 以外擋下不送。存完寫 activity_log、順手更新 `DB.customers` 同一個物件（全 app 立即同步）
  - **算價（唯一真相）＝edge `wholesale` v5 已部署**（version 8）。新增 `resolveCustomer(admin,email)`（把 checkout 原本那段 email→customers 抽出來，**menu 現在也用**——v4 的菜單根本不知道是誰在看）；優先序 **`該帳號 ws_pct` ＞ 個別豆 override ＞ 全店預設**；`discount_pct` 回傳該帳號實際折數（沒有客戶檔的呼叫者＝director 看 → 退回全店預設＝v4 行為）。原始碼備份 `handoff/edge/wholesale-v5.ts`
- **影響範圍**：只管**批發客自助下單**（wholesale edge 的 menu＋checkout）。老闆自己在 app 開單是手打價、Square 網店零售價、訂閱價都不受影響
- **驗證**：jscheck ✓；edge 煙霧測試 anon→401；本機 serve 假資料（攔 fetch＋`window.FAKE_ROWS` 依 URL 給假回應）——三態標籤（25% OFF／40% DEFAULT／0% OFF）、95 被擋不送出、存 30 → `PATCH customers?id=eq.c1 {"ws_pct":30}`＋activity_log、空白 → `{"ws_pct":null}`、staff 與 Customer book 那條路都沒有輸入欄、console 零錯誤＋375 截圖
### 追加同輪：批發開戶那條線斷在哪，以及補起來（老闆問「有沒有 joanne 的客戶」查出來的）
- **查到的事實**：`customers` 裡沒有 Joanne/Joanna。`wholesale_applications` 有兩張 **status=approved 卻沒有客戶檔**的申請——**Joanna**（2026-07-22 11:10；email `joannatsai000@@gmail.con` 兩個 @＋`.con`，其餘欄位全空）與 **B85 artisan bakery**（Kim／`orders@b85.com.au`／0420443621／Shop 7 180-186 Argyle St Camden，2026-07-17）。`role='wholesale'` 的登入只有 steven yang（Thirty 7even）與 Wu（老闆自己的信箱）
- **斷點**：①`?apply` 的 email 驗證是 `/^\S+@\S+\.\S+$/`——`\S` 吃得下 `@`，所以 `x@@gmail.con` 過關 ②Wholesale setup 的 **Approved 鈕以前只 update status**，客戶檔／登入帳號全靠人工 ③app 裡**沒有「新增客戶」的入口**（只能從 New order／Subscriptions 順便建）＝人工那步很容易忘。三個加起來＝按了 approved 就人間蒸發
- **補起來（本輪）**：
  - `ensureShopCustomer(o)`（共用）：先用 email `ilike` 查有沒有既有客戶檔，有就接上不重建；沒有才 insert `type='shop'`（address 存 `{line1,suburb,postcode}`＝店家那種形狀）＋寫 activity_log
  - **Approved 鈕現在會順手建客戶檔**（confirm 文案講明「登入還是要去 Supabase Auth 開」）
  - 名冊多一顆 **＋ New wholesale account**（`openNewWsAccountSheet(pre)`）：名稱/email/電話/地址/折扣％一次填完
  - 名冊多一區 **Approved, but not in the book**（讀 status='approved' ∖ 已在名冊的），每筆一顆 **Add** 把申請資料預填進表單——**Joanna 與 B85 就是靠這個補建**（email 打錯的當場改）
  - email 收緊：`/^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/` 擋掉 `@@`；`.con/.cmo/gmial/hotmial` 這種收尾**不硬擋、問一句**
- **驗證**：jscheck ✓；假資料——名冊正確把已建檔的 Happy Sip 排除、Joanna＋B85 列進 stray 區、Add 預填（含壞 email）、`@@` 擋下、`.con` 跳 typo 確認、改對後 insert payload `{name,type:'shop',email,phone,address,ws_pct:20}`＋activity_log、存完名冊立刻多一列 20% OFF、console 零錯誤＋375 截圖。⚠ 存檔後刻意**不呼叫 render()**——會把晨報彈窗叫回來蓋掉抽屜（測試時踩到）
- ⚠ **老闆要做**：Joanna 正確 email 要她本人確認（猜 `joannatsai000@gmail.com` 但沒證據）；建完客戶檔後**登入帳號仍要在 Supabase Auth 開**（我不能代開），開完在 Wholesale setup 把角色切 wholesale
- ⚠ **還沒做的**：真批發帳號端到端（老闆設一家 25% → 用該帳號登入 `?shop` 看「Your pricing 25% off retail」與豆價＝零售 ×0.75）；全店預設現在是 **40%**（`app_state ws_discount {pct:40, overrides:{"sugar daddy":40}}`——那個 override 跟預設同值＝等於沒作用）

## 〇、補記 — 2026-07-22 之十三（第二批體檢：錢與訂單＋補洞：取消訂單作廢付款連結 ✅ 前端待 push／edge 已部署）

### 第二批體檢（老闆問「還有什麼漏洞」；第一批＝豆子走向見補記之十一）
線上真資料查到的：
1. **取消卻已收款不退**：#0015（$30）、#0020（$25）status=Cancelled 但 payment_status=paid。`openDetails` 的 Cancel 分支只 update status＋寄 order_cancelled 信，**沒有任何退款動作**，而 confirm 文案還寫「the email will mention a refund」＝信說會退、系統不退
2. **取消的單付款連結還活著**：#0026／#0027／#0028（Dani）三張 Cancelled 仍有 payment_link_id。`sync-to-square` 全部 action 裡**沒有作廢連結這件事**——客人事後點舊連結照樣付得成 → 本輪已修
3. **已出貨未收款**：#0002 Thirty 7even Dining $640，Dispatched＋pending_payment 撐 16 天，只有一張催收卡沒有升級
4. **早期出貨沒扣庫存**：#0001／#0002／#0021 Dispatched 但 stock_deducted_at 空（欄位後加的）
5. **訂單號跳 20+ 個**（1,2,15,20,21,26-29,33,37）——待老闆確認是不是手動刪的測試單
6. **subscriptions 表 0 筆**，但 Square 上兩個訂閱商品是 synced
7. 結構性：`acceptOrder` 建付款連結失敗只 `console.error`，訂單照樣變 Confirmed＝客人永遠收不到連結而畫面正常
- 查過沒問題：客戶 email 無重複、product_sync 無重複列、豆名＋處理法無撞名
- ⚠ **還沒查的一塊：客人端（?shop 結帳／批發權限／公開頁個資）**——兩次派背景 agent 都 stalled 失敗，之後要自己查

### 本輪修的：取消訂單自動作廢付款連結
- **新 edge `void-payment-link` v1 已部署**（獨立函式，**刻意不塞進 sync-to-square**——那支 600 行管上架/訂閱扣款/建連結，動它風險大；這支只有一個動作、破壞力低）。行為：已付款→拒絕（叫你去 Square 退款）／沒連結→ok:false／有連結→`DELETE /v2/online-checkout/payment-links/{id}` 後清 orders.payment_link+payment_link_id，並寫 activity_log。權限白名單 director/staff/retail/roaster（wholesale/customer 擋掉）——因為取消訂單本來就開放給店裡的人。原始碼備份在 `handoff/edge/void-payment-link-v1.ts`
- **前端 `voidPayLink(o)`**（acceptOrder 上方）：包一層呼叫，成功回 true、失敗回 false **不靜默吞**——Cancel/Decline 的 toast 會變成「Cancelled — payment link is still live, void it in Square」
- **openDetails 的 Cancel/Decline** 兩條路都串進去；Cancel 已付款訂單的 confirm 文案改成明講「**the money is NOT refunded automatically. Refund it in Square.**」
- **openOrderDetail 補救按鈕**：Cancelled＋未付＋還有連結＋canWrite → 紅字警告＋「Void payment link」（給既有那三張用）
- **驗證**：jscheck ✓；edge 煙霧測試 anon→401（閘門有效、沒寫入）；e2e 假資料（本 session 自己的 serve :8126，另一個 chat 佔用 8124/8125）——未付有連結→呼叫 `void-payment-link {order_id}` 且本地 link 清空／已付款→**完全不呼叫**、連結保留／沒連結→不呼叫；按鈕出現條件四情境全對（Cancelled未付有連結出現、Cancelled已付不出、Cancelled沒連結不出、New有連結不出）；console 只有測試殼的 sw.js 404
- ⚠ **線上那三條連結還在**：部署後老闆進 Transactions/Orders 點開 #0026/#0027/#0028 按「Void payment link」即可

## 〇、補記 — 2026-07-22 之十二（豆子走向藍圖改版 ✅ 待 push）
- **老闆要求**：「幫我做一個藍圖，我要看一下我豆子的走向」→ 定案：**靜態單檔 HTML（同舊藍圖形式）＋把體檢漏洞標在對應的站上**
- **舊版哪裡過時**（`Ratio-blueprint-roast-to-publish.html` 2026-07-14 版，commit `0ce2f1d`）：**整個 Crows Nest 轉店面站不在圖上**（現在 76.45kg 的貨在那）、QC 規則改過三輪、「右滑 Pass ＋自動鎖風味」2026-07-16 就拆開了、沒有 Mix roasted／訂閱／批發
- **改法：整檔重寫同一個檔名**（單一真相，舊版 `git show 0ce2f1d:Ratio-blueprint-roast-to-publish.html` 撈）。沿用舊版 CSS 皮（紙白玫瑰＋暗色雙軌＋`@media print`），新增 `--blue` 色票（店面站）、`.holes`（紅色編號清單）、`.snap`（現況快照表）、`.ledger`（帳本對照表）
- **內容六區**：①SVG 流程圖（viewBox 800×1010，主幹生豆→Log roast→roasts→Roastery Stock，左分支 Crows Nest 狀態鏈 pool/settled/used/returned＋退回虛線、右分支 杯測 QC→Publish→通路→出貨＋扣豆虛線、左上 Mix roasted 迴圈、右上 To weigh、左下 Coffee Info 旁支；紅圈①–⑦釘在對應框）②現況快照數字 ③每一站的帳記在哪（表名／欄位／何時變）④「哪一種記法會扣東西」三色卡（扣生豆／什麼都不扣／吃熟豆）⑤七個漏洞清單（①已標「已修」）⑥鐵律六條（取代舊版五條）
- **驗證**：桌機 1100px 與**手機 375px** 各看一次——頁面本身不橫向溢出、流程圖區塊自己橫捲（SVG 660 > 容器 327）、「手機請左右滑動」提示只在 ≤720px 出現、表格與卡片寬度正常；暗色配色可讀；文字內容逐段核對過（`get_page_text`）。⚠ Browser pane 的截圖工具在長頁捲動後會吐空白/錯位圖（工具 bug，非頁面問題），驗證改用 DOM 量測＋文字比對
- **線上網址**（push 後）：`https://ratio-theta.vercel.app/Ratio-blueprint-roast-to-publish.html`——vercel.json 只 rewrite `/`，根目錄靜態檔照常提供，老闆手機可直接開/加書籤

## 〇、補記 — 2026-07-22 之十一（生產線體檢＋補洞 A：Used 不再蒸發 ✅ 待 push）

### 體檢結果（老闆問「log roast → publish 有沒有漏洞把豆子變孤兒」；完整報告在 `~/.claude/plans/qc-crows-nest-roastery-scalable-eclipse.md`）
**7 個洞已經真的在漏**（都有線上資料佐證），按嚴重度：
1. **店面按 Used ＝ 52.65 kg 蒸發**（`transferUsed` 只改 status；前端只載 pool/settled、History 只撈有發票號的）→ 本輪已修，見下
2. **出貨扣豆扣不到 Crows Nest**（`deductOrderStock` 只吃 `rstBatches`）——`activity_log` 有實證 `#29 · short: 3 item(s)`；拼配吃成分同病
3. **賣得到但沒貨**：售罄戳章只看 `product_sync.status==='paused'`（public-shop v17:216），跟庫存無關 → Danche v2／Alo Village ×2 現在兩地 0kg 還在賣
4. **賣完的豆掉出 Publish 就沒有下架鈕**（`setShelfSold` 全檔只有 Publish 一個呼叫點）
5. **★ 搬不了家**：`flavour_locked=true` 全檔只有 `pushListToSquare` 內的 `starSample(s,true)` 會寫，而 Publish 又固定餵「已鎖那筆」給 List 抽屜 → 菜單風味永遠停在第一批，烘焙日卻走另一條路（edge 掃最新 roasts）
6. **Coffee Info 杯測母體恆空**：loadAll 的 samples `.select()` 沒有 `supplier` 欄，但 :2578／:3959 用 `s.supplier==='Ratio Coffee'` 過濾 → History 區與 Cleanup B 區形同死碼
7. **`Hakuna Matata` synced＋有貨但沒 ★** → Publish 列不出、List 卡不長（只給非 synced）、店面菜單 QC gate 跳過
另有一批結構性破洞（刪發票洗掉 used/returned、settled 行 Return 發票照收錢、改烘焙日不同步 transfers、`confirmDeleteCoffee` 名字級大掃除、熟豆沒有 stock_moves 帳本…）詳見報告。**修補順序 A→H 已與老闆確認**。

### 本輪只做 A（Used 不再蒸發）
- **`openTransferGone()`**（放 `openTransferHistory` 之前）＝used/returned 的唯一入口：查 `status in (used,returned)` limit 200，分「Used at the shop」「Returned to the roastery」兩區；沒發票號的行標紅字 `never invoiced`，頂部總計警告（實測「2 used lines (16.65 kg) never made it onto an invoice」）。**used 行可 Undo**（status 回 `pool`＋清 invoice/price/settled/arrived）＝放回店面清單重新計費；**returned 不給 Undo**（那批 kg 已補回烘豆室批次，再放回店面會兩邊都有）
- 入口：Crows Nest 主畫面底部「Used and returned…」chip（Submit 下方、Close 上方）
- **`transferUsed` 加防呆**：沒有 `invoice_no` 的行先 confirm「shop is never charged for these N kg」——不擋（店面確實有自用/報廢），但講清楚
- 驗證：jscheck ✓；serve `trftest.html`（擋 fetch＋假回應＋側錄請求）——清單三 used／一 returned 分區正確、紅字警告數字對、returned 無 Undo 鈕、Undo 送 `PATCH transfers?id=eq.T1 {status:pool,invoice_no:null,…}`、沒發票號的 Used 多跳一次 confirm／有發票號的不跳、console 零錯誤、375px 截圖排版乾淨。serve 複本已 cp
- ⚠ **線上那 6 筆 52.65 kg 還在原地**（April Project 6／Dark Knight 10／Dancer 10／Sugar Daddy 10／Alo Bona Village 6.65＋10）——部署後老闆進「Used and returned」自己決定哪些要 Undo 回去計費、哪些真的是店面自用

## 〇、補記 — 2026-07-22 之十（QC↔庫存↔Publish 三處對齊同一套帳 ✅ 待 push）
- **老闆要的**（原話）：「QC 從 Crows Nest 和 roastery stock 的 list 截取過來做品控，過了以後在 publish 內顯示；如果 publish 裡面沒有那隻豆子了，就要從 QC 那邊拿下來」＋前一輪的「同一個日期的話把它合併」
- **⚠ QC 母體規則（單一真相，改前先讀決策時間軸）**：`toCupList`（約 776 行）上方註解記了四次翻案——07-12 有庫存門檻／07-14「過 QC 都要手動」＝同日連動退役／07-22 早拿掉門檻（怕沒過 QC 就溜走）／**07-22 晚老闆定調現行版**：門檻回來但改兩地口徑 `qcStockWhere(r)!=='gone'`（烘豆室 or Crows Nest 有貨），同日合併也回來且**判定整組一起**。早上那個顧慮改由 Unjudged history 摺疊區承接
- **改了什麼**（new/index.html 五處）：
  1. `shopKgOfName(nm,proc)`（shopKgOf 旁）＝豆層級店面存量（不比烘焙日）；`qcStockWhere` 註解改成「也是列不列進 QC 的門檻」
  2. `toCupList` ＋ `buildItems` 的 QCQ filter 各加 `qcStockWhere!=='gone'`；新增 `qcGoneList()`（沒貨又沒判的鍋）
  3. **`qcDayGroups(list)`**（openQCSheet 前）＝同日分組（key＝豆名｜處理法｜烘焙日，店面量整組算一次），To judge 與 Unjudged history 共用；`qcCardHTML` 一張卡一組，副標 bits join（空欄位不留孤兒「·」）
  4. `qcVerdict` 第一參數改吃單筆**或陣列** → `.in('id',ids)`；`attachQcSwipe` 吃組（滑一次整組）；`openRoastDateSheet` 有 `q.rows` 就整組改日期；`openQcStockSheet` 仍只動代表鍋（加量要指名哪一鍋，標題帶批號）＋`q.s` 可能 null 的防護
  5. `paintPublishSheet` 母體抽成 `addRow(nm,pr)`，rstRows 兩輪後**補第三輪 DB.transfers**（只在店面有貨的豆）；每張卡加「貨在哪」灰字（`roastery N kg · at Crows Nest N kg`）
- **為什麼 Publish 要一起改**：線上實測 synced 的豆**大半烘豆室 0kg、貨全在 Crows Nest**（Dancer 9.75／Dreamer 10.05／Sugar Daddy 9.6／April Project 5.1／Kiama AA 6／Alo Bona Village 3／Kii AB 1）——原本只吃 rstRows＝這 7 支在賣的豆整批不在 Publish 面板上。⚠ **rstRows 本身沒動**（Roastery Stock ＝「烘豆室現在有什麼」，07-22 定調 0kg 不列）
- **QC 分頁數字改成組數**（同日多鍋算一張，與清單所見一致）；抽屜副標同步
- **驗證**（jscheck ✓、serve `qctest.html` 假資料、擋 fetch 並側錄 PostgREST 請求）：同日 3 鍋＋同日已 pass 1 鍋 → 卡片「3 roasts」、Pass 送 `PATCH roasts?id=in.(R1,R2,R3)`＋activity_log ref「Kii AB · 2026-07-20 · 3 roasts」（已 pass 的 R7 沒被碰）✓；不同日不合併 ✓；沒貨的鍋不進主清單、落到 `UNJUDGED HISTORY · N`（預設收合、展開可判、判完消失）✓；待杯測段同樣濾掉沒貨的 ✓；Roast Date 整組改送 `in.(R1,R2,R3)` ✓；Publish 出現只在店面的 Dancer 標「at Crows Nest 9.75 kg」、兩邊都有貨標「roastery 8 kg · at Crows Nest 3 kg」、沒鎖 ★ 的不列 ✓；console 零錯誤＋截圖。serve 複本已 cp
- **追加：Beans 監控室（`renderBeans`）的 In QC 也接同一份帳**（老闆看 production line 截圖說「這裡的訊息沒同步」）：原本用 `live`（只算烘豆室、逐鍋列，同日多鍋重複出現）→ 改成 **QCQ ∪ toCupList 再 qcDayGroups**，一列一組帶「N roasts」、沒貨的不列、貨在店面的顯示 `at Crows Nest N kg`；`live` 的 pending 分支改 return（不重複列），其餘三段（Ready/On shelf/Blend pool）維持 live。**紅燈卡的 `data-brid` 改帶組 key**（＝新的 selQC 單位；不改的話點卡展開會失準——這是同日合併帶來的連動，別漏）。驗證：假資料 In QC 3 列（07-14 一鍋／07-20「3 roasts」／待杯測 Gatitu）、沒貨的 07-19 不在（在 Unjudged history）、已 pass 的落 Ready to shelf、點卡直達 View/Edit 且 selQC=組 key ✓
- **追加二：ROASTED 統計卡改成「現有的貨」**（老闆問「74 roasts 是什麼意思」後定調：roasts／passed／downgraded **都只算現在還有的貨，不含移除掉的**）。原本 `roasts.length`＝全歷史 74 筆、passed 28（左邊 GREEN BEANS 是現況、右邊是歷史，兩張並排口徑打架）。改法：`live` 提前到統計卡之前並擴成**兩地口徑**（`remaining_kg==null || >0 || shopKgOf(r)>0`），卡片三個數字全部從 live 算；`row()` 的 kg 文案補「烘豆室 0 但店面有貨＝at Crows Nest N kg」（否則會顯示 0 kg left）。**線上預期：74→42 roasts、28→14 passed、0 downgraded**（42＝烘豆室 8 鍋＋只在 Crows Nest 34 鍋）。副作用（好的）：Ready to shelf／On shelf 兩段也開始收店面的貨——Dancer/Dreamer/Sugar Daddy 那批本來整批不在這頁
- **線上預期值**（部署後對照）：QC 分頁 **Blends 13 / Single origins 9**（原 19／27）；Publish 應多出上面那 7 支

## 〇、補記 — 2026-07-22 之九（訂單顯示送貨地址 ✅ 待 push）
- **老闆點名**：「進來的 order 要提供地址」→ 確認後是**看訂單時要看得到地址**（不是叫客人填）
- **查到的現況**：`orders.shipping_address`（jsonb）**Square 單有**（webhook 帶進來，例 #0033 Peihan 完整門牌），**wholesale／manual 單全 null**（wholesale edge v4 的 checkout 根本沒收地址）；而新殼 `new/index.html` 整檔 grep `shipping_address` **零筆**——地址進得來但畫面從來沒印過，出貨得跑 Square 後台查
- **做法（前端純顯示，零資料寫入）**：
  - `ordAddr(o)`（whOrd 下方）：**訂單自帶 shipping_address 優先，沒有退 `customers.address`**（回傳 src 標記來源）。**兩種形狀都吃**——Square 形 `address_line_1/address_line_2/locality/administrative_district_level_1/postal_code/country` 與手填形 `line1/suburb/postcode`；country 是 AU 就不印；`fulfillment:'PICKUP'` 回 pickup 旗標
  - `addrBlockHTML(o,id)`＋`wireAddrCopy()`：Ship to 區塊（`.addrb` 新 CSS，可選取）＋「Copy address」（clipboard API 失敗退 execCommand 隱形 textarea）
  - 掛兩處：**openDispatch**（unpaid 警告下、tracking 上——出貨當下第一眼）、**openOrderDetail**（Placed/Tracking 那組 dl 之後）
  - 三種空狀態：來源是客戶檔 → 標題加「· from contact card」；PICKUP → 「Pickup — no delivery address」；真的沒有 → 紅字「No address on this order — ask the customer, then save it on their contact card」
- **實際效果**：現在兩張待處理單都會有地址——#0037（wholesale, Thirty 7even Dining）走客戶檔、#0033 走訂單自帶
- **驗證**：jscheck ✓；e2e 假資料（擋 fetch，serve `addrtest.html`）四情境——Square 單 3 行地址＋電話／wholesale 單標「FROM CONTACT CARD」／無地址紅字／PICKUP 文案，Dispatch 與 Order detail 兩抽屜都對 ✓；**Copy address 真滑鼠點擊 → 「Copied ✓」再自動復原**（程式 .click() 沒有 user gesture 會失敗＝瀏覽器規則，非 bug）；console 零錯誤＋截圖 ✓。serve 複本已 cp
- **追加（同輪，老闆截圖點名「這裡需要顯示地址」＝今日流卡片點開的 `openDetails`）**：地址區塊也掛進 **openDetails**（det 那組 dl 之後、主按鈕之前），限 `kind` 是 **accept／pack／ship** 三種訂單卡；收款卡（paid）刻意不出（那是對帳不是出貨）。驗證：jscheck ✓；e2e 四張卡——Pack #0033 出訂單自帶地址／Ship #0037 出「FROM CONTACT CARD」／Accept #0038 紅字沒地址／收款卡沒有地址區塊 ✓，console 零錯誤＋截圖
- **留給未來**：批發下單流程仍不收地址（客戶檔沒地址的新批發客會是紅字）。要補就是 wholesale edge checkout 帶 `customers.address` 進 `shipping_address`＋結帳頁可改——老闆說先只做顯示，這條沒做

## 〇、補記 — 2026-07-22 之八（Roastery Stock 沒貨的不再列 ✅ 待 push）
- **老闆點名**：Roastery Stock 沒有貨的要從清單移除（通常是整批轉去 Crows Nest 之後歸零）
- **查到的不對稱**：`rstRows` 的 **Singles 分頁 2026-07-14 就定調「0kg 不列」**（有 `rstStockKg>0||dg||pending` 過濾），但 **Blends 分頁是 `DB.blends` 全列、零過濾**——所以賣光/轉走的拼配一直掛在架上清單。補上同一條規則即可，不是新設計
- **線上實測**：7 支配方只有 **Dark Knight 有貨（30kg）**，Dancer／Dreamer／April・May・June Project／Sugar Daddy 全是 0 → 改完 Blends 分頁 7 列剩 1 列
- **順手**：空狀態文案還在寫「Use Intake above」，那顆 Intake 鈕 2026-07-17 就移除了 → 改成「Roasted stock lands here when you log a roast — anything sent to the shop is in Crows Nest」（指路，資訊沒有不見）
- **驗證（e2e 真 app＋擋 fetch 假資料）**：4 個配方（僅 Dark Knight 有貨）→ Blends 分頁**只剩 Dark Knight** ✓、Dancer（轉店面歸零）／Dreamer／May Project 消失 ✓；3 支單品（Gatitu AA 已賣光）→ Singles **只剩 Danche v1／La Molienda** ✓，**且賣光的 Gatitu AA 沒有變成假待秤**（之六的 rstIsPending 修復同時生效）✓；jscheck ✓、console 零錯誤、截圖 ✓。serve 複本已 cp
- **設計筆記**：這頁的定位是「烘豆室現在有什麼」——配方全貌去 **Blend Recipe**、轉出去的去 **Crows Nest**、賣光的歷史去 **Coffee Info**，三個去處都在，所以濾掉不會遺失資訊

## 〇、補記 — 2026-07-22 之七（Roastery Stock 直接發起拼配 ✅ 待 push）
- **老闆要求**：「我需要在 roastery stock 裡面用現有的 single origin 製作 blend」——不想為了拼配跑去 Log roast
- **查到的現況**：Roastery Stock 展開列的按鈕在 2026-07-16 被老闆點名全清（Cup it／★／Send back to QC／**Roast this**），`openRoastPreset` 從此變成**無呼叫端的死碼**。所以拼配唯一入口是 Tools→Roasted Bean→Log roast，而且要自己穿過三層切換（Roast today → Blend → **Mix roasted**，第三層預設在 Roast green）
- **做法**：Roastery Stock 的 seg 下方加一顆 `.act`「**Mix a blend from stock**」（canWrite 才出）。點了帶**展開中的配方名**跳進 Log roast，`openRoastPreset(mode,val,mix)` 復活並加第三參數：強制 `entry='roast'`、`RO.bb[].pre=false`＝**直接落在 Mix roasted**。扣豆／事前檢查／recipe 快照全部共用之六那條路，不另開一套
- **驗證（端到端，非純函式）**：造一份 e2e 頁——**在 supabase-js 之前注入 `window.fetch` 全擋**＋灌假 DB（Dark Knight 配方＋Danche v1 兩批/La Molienda/Hakuna Matata 熟豆），boot 後直開 Roastery Stock：
  - 按鈕出現在 seg 下方 ✓；點下去 → Log roast 開啟且 **Roast today / Blend / Mix roasted 三層都已就位、配方預選 Dark Knight** ✓（`RO.mode='blend'`、`entry='roast'`、`bb[0]={name:'Dark Knight',pre:false}`）
  - 填總量 10 → 用量 `5.00 / 2.50 / 2.50`、對帳行 `takes 5.00 + 2.50 + 2.50 = 10.00 kg` ✓
  - 點 19/07 chip → 選中態切換、提示轉 `from 19/07 batch · 9 kg`、`bb.pick={0:'2026-07-19'}` ✓
  - 總量拉到 40 → 用量轉紅＋`short 11 on 19/07 batch`；**submit 前跳 confirm 列出三支不足並指明批次，按取消＝`sb.from` 零呼叫（零寫入）** ✓ ← 最關鍵的迴歸（舊版是寫完才 alert）
  - console 零錯誤。serve 複本已 cp
- **設計筆記**：Singles 分頁也顯示這顆鈕（拼配本來就是用單品做 blend，從哪個分頁看到都合理）；Blends 分頁沒展開任何一支時進去自己挑配方

## 〇、補記 — 2026-07-22 之六（Blend 用單品熟豆調配補完＋待秤重幽靈修復 ✅ 待 push）
- **老闆要求**：①Log roast 烘完的豆子要進 Roastery stock ②Blend 要能從 single origin 抽豆做 blending、做完扣掉該量
- **⚠ 關鍵發現：功能本來就有，是半殘的**。Blend 卡內 seg 的 **Mix roasted**（熟拼）早就會呼叫 `consumeBlendParts` 扣單品熟豆——但 ①使用者填的 `bb.amt` **submit 從來沒讀**（實扣永遠是總量×配方%，填了不算數）②不能挑批次（全自動 FIFO）③沒有事前檢查（不夠只在寫完後 alert，那時 blend 已 insert、成分扣了一半）。使用數據佐證沒被用起來：**intake blend 19 次**（純補登不扣）vs post-blend 5 次＝熟豆庫存長期只進不出
- **老闆三個決定**：用量**照配方 % 自動算**（輸入格改唯讀）／**要能挑批次**／bug 一起修
- **`roMixPlan(bb)` 成為單一真相**——畫面顯示、送出前檢查、實際扣除三處共用同一份數字。**⚠ 順手修掉既有矛盾**：UI 攤分用 `pct/Σpct`（正規化）、`consumeBlendParts` 卻用 `pct/100`（固定分母），配方不是剛好 100%（如 70+35=105）時**畫面 6.67 實扣 7.0**——用量既然改唯讀「這就是會扣的量」，兩套算式就是說謊。統一走 Σpct 正規化、round 到 0.01（同畫面精度），殘差用底部對帳行 `takes 5.00 + 2.50 + 2.50 = 10.00 kg` 誠實揭露
- **UI**：成分行改**唯讀 `<b>`**（不用 readonly input——iOS 上仍會吸焦點跳游標，看起來像壞掉的輸入格）＋下面一排 **chip 挑批次**（同 Send to shop／Deduct 的語言，帶 `rstFreshColor` 新鮮度色點；option 塞不進色點所以不用 select）。只有 **2 組以上才給 chip**（1 組不用選、0 組沒得選）；換行不橫捲（橫捲會被卡片邊緣裁掉）。降級組標 `dg`／同日混標 `incl. dg`，排最前呼應「降級豆是配方首選」。不足的成分用量轉紅＋小字 `short N`
- **新函式**：`roMixCmp`（扣除順序比較器）／`blendPartBatches`（成分批次陣列，配對規則單一來源，`blendPartPool` 改成它的包裝）／`blendPartGroups`（chip 來源，同日併組＋降級標記）／`roMixPlan`／`roMixHintText`／`roMixSumText`／`roMixRepaint`（就地刷新不重繪抽屜）。狀態 `bb.pick[pi]`＝烘焙日 key（''＝Auto）；`RO.bb` 不落草稿（`saveRoastDraft` 只存單品）＝零相容問題
- **`consumeBlendParts` 改簽名** `(parts,needs,picks)`：need 由呼叫端傳（同源）、指定批提到最前面優先扣、**不夠仍溢出**（成品已 insert，硬停會留「成品有貨成分沒扣」的爛帳，且不足在送出前已 confirm 過）。回傳 `{short,used}`，**`used` 寫進 `logAct`＝熟豆扣減唯一軌跡**（熟豆沒有 stock_moves，那表是生豆專用）。recipe 快照多記 `roasted_kg`/`from`＝這鍋吃了哪幾批，日後可回溯
- **送出前第 ④ 關**：Mix roasted 熟豆庫存 confirm（**跨卡累計**＝同支豆被兩張卡吃也抓得到；指定批比該批、auto 比全池），文案同 ①③ 的「Submit anyway?」慣例
- **🐛 待秤重幽靈修復**：抽 **`rstIsPending(r)`** 三處共用（`rstPendingBatches`／Cleanup C／`rstRows` 孤兒），判準從「還有沒有剩」改成「**有沒有秤過**」（`roasted_kg==null`）。原本任何被扣光的批（出貨/拼配/轉店面/清零）都退化成假待秤，**點下去 `openWeighIn` 憑空造熟豆庫存**，而 Cleanup 那顆 ✕「delete mislog」**更會連生豆一起退還**＝也造生豆。實測當時 14 筆待秤**全部是假的**、真沒秤過的 0 筆。另給 `openWeighIn` 加重複秤重確認當第二道防線
- **驗證**：jscheck ✓、舊函式殘留 0、新增英文字串無撇號 ✓；**真檔抽 15 個函式跑 async 假資料測試**（mock sb 只記 PATCH＋擋 fetch）七項全過——待秤判定真假分辨 ✓、**Σ=105% 配方實扣 6.67＝畫面 6.67（舊版會扣 7.0）** ✓、Auto 降級優先→舊到新 ✓、指定批只動該批其餘零 PATCH ✓、指定批不夠先歸零再溢出＋used 軌跡 ✓、全池不足回報 short ✓、分組降級標記與排序 ✓；375 寬截圖：chip 選中黑底＋新鮮度點、不足成分紅字、對帳行 ✓、console 零錯誤。serve 複本已 cp
- **⏭ 老闆驗收**：push 後用真的 Dark Knight（Danche v1／La Molienda／Hakuna Matata 熟豆都在架上）走一遍 Mix roasted，確認扣的批次與量符合預期
- **設計筆記**：`bb.amt` 欄位保留但停止寫入（`roValidBlends` 的相容判斷留著）；pre-blend／intake 兩條路完全沒動（成分格用 `data-gc`/`data-gp`，與 post 的 `data-bc`/`data-bp` 分離）

## 〇、補記 — 2026-07-22 之五（QC 拿掉庫存門檻＝Log roast 進來的一律要判定 ✅ 待 push）
- **老闆定調（否決時間門檻）**：「所有從 Log roast 進來的都要經過 QC」。之三只把店面的貨補回來還不夠——**扣光的批次仍會從 QC 消失＝沒判定就溜走**（實測未判定且已無貨者 15 筆）
- **改法**：`toCupList` 與 QCQ 的 pend filter **拿掉有貨條件**（2026-07-12 立的 `remaining>0` 正式收回）——一批 Log roast 進來就掛在 QC，**只有親手判定（pass/downgrade）才離開**。`qcHasStock` 換成 **`qcStockWhere(r)` 三態**：`hand`（烘豆室有）／`shop`（只剩 Crows Nest）／`gone`（都沒了），**只管顯示與排序，不再當門檻**
- **UI**：In hand 依可行動性排序 `hand→shop→gone`（組內新→舊）；`hand` 照舊高亮無標記、`shop` 標藍字 `at Crows Nest N kg`、**`gone` 不高亮＋灰字 `no stock left — judge to close it off`**（判定＝補登記錄）。To judge 區同三態（gone 標 `no stock left`）。matchRoast 的 withStock 仍優先非 gone 的鍋（配對邏輯不變）
- **衝擊數字（push 後老闆會看到）**：待杯測 **8 → 43 筆**（+20 只剩店面、+15 已無貨），最舊到 2026-06-01。老闆已知並接受＝要的是「不漏」而非清單短
- **驗證**：jscheck ✓、`qcHasStock` 殘留 0；真檔抽函式跑真資料——沒貨的 El Vergel／Finca Milan **現在留在清單**（以前被濾掉）✓、qc=pass 的 Sugar Daddy 與已 cupped 的 Danche v3 仍正確排除 ✓、排序 hand→shop→gone ✓；375 寬截圖五列三態（有貨高亮／兩列 at Crows Nest／El Vergel 白底灰字）✓、console 零錯誤。serve 複本已 cp
- **設計筆記**：qcVerdict 只寫 `roasts.qc`，所以沒貨的批次判定不會動到任何庫存帳；「判定才離開」讓 QC 變成**待辦清單**而不是庫存鏡子——這是與 2026-07-12「QC 與 Coffee Stock 同一真相」的**刻意分家**

## 〇、補記 — 2026-07-22 之四（Off shelf 的豆子在 ?shop 顯示 Sold out ✅ **public-shop v18 已部署**，前端零改動）
- **老闆點名**：off shelf 的要放 sold out。**前端本來就全做好了**（shopCardsHTML 的 `so=!!b.sold_out`：圖 grayscale .35＋opacity .55、SOLD OUT 膠章、價格轉灰、購買列換成「Sold out — the next roast is on its way」、`data-vid` 清空＝加不進車）——**缺的是 edge 那端**：v14~v16 的 GET 直接 `if (r.status==='paused') return null`＝下架豆整支從菜單消失，`sold_out` 永遠 false（v8 的售罄邏輯在改版時掉了）
- **public-shop v18（版本號 18＝程式碼 v17）**：①`const off = r.status==='paused'` → **`sold_out: off`**（不再 return null）②**`if (off && !r.variation_id) return null`**＝從沒上 Square／斷鏈的下架列仍隱藏（沒 variation_id 就沒 live price／sizes／圖可顯示）③`beans.sort((a,b)=>Number(!!a.sold_out)-Number(!!b.sold_out))`＝**售罄沉底**，輪播第一張永遠是買得到的（stable sort，在售順序不變）
- **結帳保護本來就有**（`allowedVarIds` 排除 paused item 的所有 variations），這次實測確認：售罄豆單獨送 checkout→`unknown item in cart` ✓、混在正常豆裡→**整單擋** ✓
- **驗證（全部線上實測）**：GET 菜單 14 豆（原 13＋June Project）、June Project `sold_out:true` 且排最後、sizes=1 imgs=4 ✓；**La Molienda／Mwendi Wega AB 兩支 paused 但 variation_id=null → 正確不顯示** ✓；回歸——4 袋 checkout `total 75 / bogo_off 25`（買三送一完好）✓、`?card=` 無效 token 404 ✓、訂閱仍只在 subs 不在 beans ✓；**Chrome 線上 ?shop 截圖**：SOLD OUT 膠章、圖淡化、無購買鈕、Details 仍可點 ✓
- **⏭ 老闆若要 La Molienda／Mwendi Wega AB 也顯示 Sold out**：得先在 Publish 把它們 List 上 Square（拿到 variation_id）再 Take off shelf
- **順帶發現**：`SURCHARGE_PCT` 目前實測回 **0**（checkout 回應 `surcharge_pct:0`）＝卡費沒轉嫁客人；這也解釋了 #0033 帳上沒有 surcharge 行。若非刻意，去 Edge Function Secrets 改回 2.2

## 〇、補記 — 2026-07-22 之三（QC 納入 Crows Nest 店面的貨 ✅ 待 push）
- **起因**：老闆問「May Project 怎麼沒有在 QC」。**查下來不是 bug**——該批（7/19 烘 8.6kg、blend）在 **7/21 08:15 被 Yi 整批轉去 Crows Nest 並已結單開發票 INV-20260721-005（$50/kg）**，烘豆室 remaining_kg 歸 0，QC 的「只收有貨批次」規則（2026-07-12 定）就把它濾掉了。可杯測空窗只有 7/20 一天
  - ⚠ 順帶發現：**這批沒過 QC 就進店面**（roasts.qc=null、status=pending_cupping）；同日轉走的 Dreamer 8.85kg、Alo Bona Village 10kg 也一樣。7/10 那筆 activity_log「qc pass · May Project」是更早的批次，不是這批
  - samples 表**完全沒有 May Project**（QCQ 從 samples 出發＝本來就進不了「待判定」；有貨時會出現在 toCupList「待杯測」）
- **老闆定調**：店面的貨也要進 QC。**新 `shopKgOf(r)`**——由 `DB.transfers`（loadAll 只載 pool/settled＝店面現有，used/returned 不載）以**豆名＋烘焙日＋處理法**配對加總 kg；**新 `qcHasStock(r)`＝`remaining_kg>0 || shopKgOf(r)>0`**，取代原本三處的 `remaining_kg>0`：`toCupList`／QCQ 的 pend filter／`matchRoast` 的 withStock
- **UI**：QC 兩區（In hand／To judge）列尾標 **`at Crows Nest N kg`**（var(--ws) 藍；**只在手上 0 才標**＝人才知道樣品要去店裡拿）。cupGroups 的 shop 值整組算一次（同豆同日同處理法配到同一筆 transfer，逐鍋加會重複計）
- **驗證**：jscheck ✓；**真檔抽 shopKgOf/qcHasStock/toCupList/procKey ＋真資料**跑判定表——May Project 店面 8.6→進 ✓、Dreamer 8.85→進 ✓、Dark Knight 7/06 店面 10→進 ✓、**Alo Bona Village 的 10kg 是 status='used' 不載→不進 ✓**、Danche v1 有貨那鍋進/沒貨那鍋不進 ✓、Sugar Daddy qc=pass→不進 ✓；375 寬預覽截圖 In hand 三列（兩列帶 at Crows Nest、手上有貨那列不標）✓、console 零錯誤。serve 複本已 cp
- **設計筆記**：qcVerdict 只寫 `roasts.qc` 不碰庫存 → 讓 remaining=0 的批次進判定無副作用。日期配對讓同豆不同鍋不會互相沾（Dark Knight 7/06 的 transfer 只配 7/06 的鍋）

## 〇、補記 — 2026-07-22 之二（買三送一收回成「只有網店」✅ Square 後台已改，零程式碼變更）
- **老闆點名**：買三送一只要留在 ?shop。**查下來前端／edge 本來就只有網店有**（cartBogo 只在零售車＝?shop＋客戶門戶；批發車 openWsCartSheet 不吃；跑馬燈 WS_MODE 回空），唯一外溢的是 **Square Dashboard 折扣**（7/21 之九改成 All locations 那次，把 Crows Nest POS 也納進來了）
- **⚠ 架構重點（別再搞混）**：**?shop 的買三送一是 public-shop edge v15 自己算的**（checkout 組 `order.discounts` fixed 折最便宜袋），**跟 Square Dashboard 折扣毫無關係**——所以動 Square 後台不會影響 ?shop
  - **實帳驗證 #0033**（Square 訂單頁）：4 袋×$25=$100 → Discount「Buy 3 get 1 free — cheapest bag」−$25（**名字＝edge 程式碼字串，證明是我們加的那筆**）→ Subtotal $75 ＋ Standard Shipping $10 ＝ **Total $85** ✓。Square 自動折扣**沒有**重複套在 payment link 訂單上（無雙重折扣、無漏財）
- **改法**：折扣「Buy Any 4, Get Cheapest Free」→ **Apply automatic discount** 區塊取消勾選 **Square Point of Sale and other integrations**，保留 **Online ordering**；Save 後重載確認持久 ✓（該列變灰未勾）
  - 留意：**Locations 仍是 All locations**（Crows Nest＋Online Store）——自動套用已關，POS 不會再自己打折；若老闆連「收銀員手動選折扣」都不要，再去 Locations 取消 Crows Nest
- **通路全景**（三條，別再混為一談）：①**?shop**（source「Ratio App」）＝edge 自算 ✅有優惠 ②**Square Online**（source「Square Online」，仍在活躍收單：7/4、7/6、7/7、7/11 都有 $85 單）＝靠 Dashboard「Online ordering」勾 ✅有優惠 ③**Crows Nest POS**＝本次關掉 ❌沒優惠

## 〇、補記 — 2026-07-22（?shop 新單「app 沒出現」排查＋訂單品項顯示處理法＋明細一項一行 ✅ 待 push）
- **老闆報案**：今天 ?shop 有 order 但 app 看不到。**查下來系統全對**——#0033（09:43 雪梨，Peihan Shuai，4 品項 $85，paid，status New）在 DB 完整；square-webhook 今日全 200、push-send 有發；loadAll 抓 New、director 在 roles 名單、貪睡表沒它。**真因＝畫面沒刷新**：maybeAutoRefresh 只綁 visibilitychange（切走再回來且 >60s），PWA 一直開著就永遠舊資料
  - **修**：`setInterval(maybeAutoRefresh,180000)`＝前景每 3 分鐘也刷（同條件：抽屜開著不打斷、未登入不動）
- **品項顯示處理法**（老闆要知道是哪一隻豆；同名多處理法是不同商品）：新 `procOfItem(it)`——**先用 `it.square_variation_id` 對 `product_sync.variation_id`**（loadAll 該查詢已補 select variation_id），對不到才退名字比對、且**同名只有唯一一列有 process 才敢給**（多列＝寧可留空不猜）。拼配豆 process 本來就 null＝不顯示
  - 格式共用：`itemText(it)`＝「150g Kii AB (Washed) ×2」→ `itemsLine`（一行逗號串）與 `itemRows`（明細每項一列）都吃它；打包抽屜 pk-row 也改用 itemText（順帶有了處理法）
- **明細一項一行**（老闆點名 Pack details 的 items）：Accept/Pack/Ship 三卡的 det 由 `[['Items',itemsLine]]` 改 `itemRows(o).concat([...])`＝每項一列、左欄只第一列寫 Items。第三格 `'item'` 是渲染旗標→值套 `.dl span.dv-l{flex:1;text-align:left}` **靠左排齊**（比對過靠右版：右對齊左緣鋸齒難掃，靠左明顯好讀）；det 渲染兩處（今日流抽屜＋搜尋抽屜）同步改
- **驗證**：jscheck ✓；假資料實測 itemRows 輸出（含空訂單 →「Items —」、Delivery fee 假品項不炸）✓；**從真檔案抽 procOfItem/itemText/itemsLine/itemRows/esc ＋真 CSS 生預覽頁**（scratchpad/serve/packtest.html），375 寬看板 A/B 對照選定靠左版，卡片明細＋打包清單兩塊截圖確認 ✓。serve 複本已 cp
- **commit**：`b873cad`（處理法＋自動刷新）、`e0481ea`（一項一行）——**待老闆 GitHub Desktop push**

## 〇、補記 — 2026-07-21 之十八（桌機版面鎖手機格式 ✅ 待 push）
- **老闆點名**（桌機開 coffeeratio.com.au 版面被拉散）：內容主體 .wrap 與 nav 本就 520 置中——漏的是貼螢幕邊的四個：①`.shoptabs` 照 nav 慣例補 max-width:520+margin auto+左右 1.5px 框 ②`header` padding 左右改 `max(18px,calc(50% - 238px))`＝內容縮到 520（購物車不再貼螢幕角；手機 max() 取 18px 無感）③`.shoparr` 輪播箭頭 ≥760px 貼內容邊（calc(50% ± 302px)）④`.deck` 判定板同 520 置中。手機端全部零影響
- **驗證**：jscheck ✓、桌機寬預覽——shoptabs 置中帶框/箭頭貼邊/整體如置中手機 ✓、console 零錯誤。serve 複本已 cp

## 〇、補記 — 2026-07-21 之十七（訂閱 Card on File 自動扣款全鏈 ✅ 待 push 前端＋老闆設 secret）
- **老闆定案**：訂閱自動扣款走 **Card on File**（自家排程、Square 只當刷卡機＝日後好轉移）；①自動扣款照加 2.2% surcharge（同 payment_link 公式）②綁卡走**純邀請**（不強制，沒綁的照舊寄付款連結——兩套並行）
- **DB**：migration `subscriptions_card_on_file`——subscriptions +sq_customer_id/card_id/**bind_token**（uuid 預設生成＋唯一索引；連結即鑰匙）
- **Edge ×3 已部署**：
  - **public-shop v16**：GET `?card=<token>`＝綁卡頁資訊（name/plan/bound/**app_id**（env SQUARE_APPLICATION_ID）/location_id，無快取）；POST `save_card`｛token,card_token｝＝確保 Square customer（CreateCustomer 存 sq_customer_id）→CreateCard 存 card_id→舊卡 disable（best-effort）。菜單 GET 驗證無恙（13 豆+2 訂閱）
  - **sync-to-square v32**：`charge_sub`｛order_id,sub_id｝＝CreatePayment（card_id+sq_customer_id，金額×1.022）→成功標 orders paid；**冪等 key="ratio-sub-"+order_id＝同單絕不重扣**
  - **send-email v25**：`sub_card_invite`｛sub_id｝＝綁卡邀請信（連結 PUBLIC_URL/?card=token，env 預設 https://www.coffeeratio.com.au；已綁＝換卡措辭；surcharge 揭露）
- **前端**：①`?card` 公開頁 overlay（fb-card 版型；Square Web Payments SDK web.squarecdn.com/v1/square.js 瀏覽器直接 tokenize＝卡號不經我們手；三態=invalid/not ready(app_id 未設)/正常；同連結重用=換卡）②`subCollectPayment` 升級：square 跳過→**有卡先 charge_sub**（成功 charged）→失敗/沒卡 fallback payment_link（cardFailed 旗標）③runSubShipment 摘要帶「N charged on card」＋扣失敗警示「payment link sent instead」④openSubsSheet：app 訂戶列帶 card ✓/no card＋**Invite/Re-invite 鈕**（confirm→sub_card_invite→logAct）
- **驗證**：jscheck ✓；curl 線上——card_info 無效 token 404「invalid link」✓、菜單照常 ✓；預覽假資料——綁卡頁三態＋tokenize→save_card payload 正確＋成功畫面 VISA···1111 ✓；Subscriptions 抽屜 card 狀態/兩顆邀請鈕（square 訂戶無）✓；subCollectPayment 四分支（square 跳過/扣成功/扣敗 fallback/沒卡連結）✓；console 零錯誤。serve 複本已 cp
- **SQUARE_APPLICATION_ID 已設 ✓**（2026-07-21 Chrome 代跑：Square Developer Console「Ratio App」sq0idp-VNdByyOPDU62N9Fnyb8QvA → Supabase Edge Function Secrets，清單確認在）——綁卡頁後端就緒
- **⏭ 老闆收尾（照順序）**：①push 部署前端②Tools→Subscriptions 登記訂戶後按 Invite 寄邀請、自己先用自己 email＋真卡走一輪（綁卡→到期 run→看 charged on card ✓→Square 退款）
- **設計筆記**：?shop 結帳零改動（綁卡靠事後邀請信）；webhook 新訂閱自動寄邀請**這輪沒做**（老闆手動 Invite 控節奏；要自動化再加 square-webhook 一段）；收款抽象點 subCollectPayment 仍是唯一知道錢怎麼收的函式＝日後換 Stripe 只改它＋綁卡頁

## 〇、補記 — 2026-07-21 之十六（員工介面底部黏店面 Blend/Single origin/Subscription 條 ✅ 待 push）
- **老闆真機抓蟲**：Tools 頁底部出現店面分類條（#shoptabs）。根因＝**視角切換 race**：renderPublicMenu/renderCustomerPortal 要 `await loadShopMenu()` 才 renderShopTabs()——等待期間登入完成（boot 切員工視角、12785 藏 shoptabs），**晚到的渲染回來把 shoptabs 重新打開**（還會把 m.innerHTML 蓋成店面），之後無人再藏 → 黏在員工介面底
- **修復兩道**：①**BOOT_EPOCH 代次**（根治）——boot() 開頭 ++；兩個店面渲染進場記 ep、await 完 `ep!==BOOT_EPOCH` 就 return（晚到渲染整段放棄，連蓋 main 的問題一起解）②**render() 保險絲**——員工每次重繪 `$('shoptabs').style.display='none'`（就算哪天又漏，點任何 nav 即復原）
- **驗證**：jscheck ✓；預覽模擬 race（攔 fetch 慢回應→renderPublicMenu 掛起→BOOT_EPOCH++→renderTools→放行 fetch）——晚到渲染放棄、main 保持 Tools ✓；硬開 shoptabs 後 render() 藏回 ✓；console 零錯誤。serve 複本已 cp

## 〇、補記 — 2026-07-21 之十五（Tools 分類大 icon 化＋分類抽屜 ✅ 待 push；同輪：Roastery Stock 改名、Crows Nest ↓ 移除＋✕→✎）
- **老闆點名三連**：①UI 全部「Coffee Stock」→「Roastery Stock」（10 處含 Tools 磁貼名）②Crows Nest 列上 ↓ 一鍵退回鈕移除（退回收斂到行詳情 Return to stock）＋列上 ✕ 改 ✎ ③**Tools 主要分類改大 icon、點開抽屜看磁貼**（A 案＋抽屜；老闆選定）
- **Tools 改造實作**：`runTool(k)`＝原 data-t if 鏈抽成全域函式（40 個 key 對照零改）；`_sec(title,color,icon,inner)` 改回傳 `.catcard` 大 icon 卡（52px `.catic` 吃 --dept 色）、磁貼 HTML 存 `TOOLCATS_LIVE`；`openToolCatSheet(key)` 開分類抽屜＝標題帶色 icon＋tgrid 磁貼＋Close，**注入後才綁** data-t→runTool＋六顆 id 磁貼（t-recv/t-stk/t-roast/t-neworder/t-task/t-label——綁定時機是最大陷阱，磁貼已不在主頁 DOM）；主頁順序＝搜尋→catgrid→Notifications→Appearance（全在 #tgroups 內＝lookup 顯隱照舊）；TOOL_ICONS 新增 `gear`（Setting 用）；CSS 新增 .catgrid/.catcard/.catic/.catl
- **不動**：搜尋 lookup（與磁貼 DOM 本就解耦）、DONE_TOOLS 紅字、Appearance 換主題、DEPT 色票、各 openXxxSheet。工具抽屜關閉回 Tools 大 icon 主頁（單例覆蓋、不返回分類抽屜——刻意簡單）
- **驗證**：jscheck ✓；ruby 預覽假資料（攔 fetch＋注入骨架+ROLE 模擬）——11 分類卡齊/色對、Roasted Bean 抽屜 batches/transfer/retail＋t-roast、磁貼點擊覆蓋開 Roastery Stock 抽屜、Green Bean t-recv/t-stk 在、搜尋隱藏恢復 ✓、staff 視角 Green/Marketing/Finance 消失（剩 8 卡）✓、console 零錯誤＋主頁與抽屜截圖 ✓。serve 複本已 cp

## 〇、補記 — 2026-07-21 之十四（Publish 商品圖 4 張只上 2 張 → sync-to-square v31 ✅ 待 push 前端）
- **老闆回報**：Publish Dark Knight 四張商品圖（cover·radar·origin·QR）Square 只出現兩張。**根因＝v30 的 Promise.allSettled 並行 attachImage**——Square 每掛一張圖 item version +1，四張同時打同一 item 撞樂觀鎖被退件（誰搶到誰活）；失敗只寫在回傳 `image:"partial (2/4)"` 欄位，前端沒看、照樣 toast「On the shelf ✓」＝靜默漏圖。佐證：v30 push 只跑 ~3s（v29 序列上圖要十幾秒）
- **修復**：①**sync-to-square v31 已部署**——圖片改回**序列** attach＋每張失敗重試一次（~2s/張遠低於 160s；v30 其他並行 prep 全保留＝不會回到 503 超時）；cleanupOldCardImages 也改回序列（並行刪同 item 圖同樣撞鎖→舊圖清不掉）②前端 pushToSquare 接回傳檢查 `image` 欄位，`partial|failed` 開頭就 alert 明講「Push again to retry the images」——不再靜默
- **驗證**：jscheck ✓、serve 複本已 cp；deploy 工具 verify_jwt 這次有參數可控＝保持 true（sync-to-square 本來就要 director JWT，不是 public-shop 那種匿名函式）
- **⏭ 老闆收尾**：push 部署前端後，重新 Publish 一次 Dark Knight → Square 應見四張齊（兩張舊的自動被換掉）

## 〇、補記 — 2026-07-21 之十三（coffeeratio.com.au 網域接 Vercel ✅ 零程式碼變更）
- **老闆點名**：VentraIP 的 coffeeratio.com.au 連到 ?shop。零改 code——未登入開根路徑本來就是公開菜單（?shop 沒程式判斷）。Chrome 代跑兩邊 Dashboard：
  - **Vercel**（ratio 專案 → Settings → Domains）：加 coffeeratio.com.au（自動 308 → www）＋ www.coffeeratio.com.au（Production）；SSL 已簽發
  - **VentraIP VIPControl**（Manage DNS，網域仍掛 VentraIP hosting NS＝ns1/ns2.syd5.hostingplatform.net.au）：只改兩筆——A @ 199.34.228.175→**216.198.79.1**、CNAME www coffeeratio.com.au→**e2fa1b3211515247.vercel-dns-017.com**；**mail A / MX ×2 / SPF / DKIM ×2 全沒動**（email 收發不受影響；send.@ 走 amazonses＝Resend 寄信域）
- **⚠ 舊官網下線**：原 A 指向 Square Online 舊官網（199.34.228.x＝Weebly IP）——切換後網域不再指它；網站本身還在 Square 後台，要回退把 A 改回 199.34.228.175＋CNAME www 改回 coffeeratio.com.au 即可
- **驗證**：權威 NS dig 回新值 ✓；curl --resolve 直連 Vercel——apex 308 → www ✓、www 200＋title「Ratio Coffee」＋renderPublicMenu 在 ✓（舊站 title 是「…Espresso | Filter | Brewing…」可區分）；Vercel Domains 兩筆 Valid Configuration ✓。舊 TTL 14400＝全球快取最長 ~4 小時陸續切換，期間開到舊站正常

## 〇、補記 — 2026-07-21 之十二（Retail prices 每豆收抽屜 ✅ 待 push）
- **老闆點名**：Set retail prices 每豆收進抽屜。`RPP.open` 手風琴（一次一組）：收合行＝豆名＋現價摘要（「$24 · 200g +」，+＝有 500g/1kg 加購；沒價 muted「no price」）＋▸；點展開＝BAG SIZE seg＋三行價（排版 v2 原樣）。展開/收合/切組都先 grabInputs——**打到一半的價換組不掉**、收合摘要即時反映、Save 用 rows 記憶值（收合組照存）。
- **驗證**：jscheck ✓；假資料——初始全收合 0 input/摘要對 ✓、展開只一組 ✓、Ethiopia 改 24 切 Dark Blend→摘要變 $24＋Save payload 24 ✓、console 零錯誤＋截圖 ✓。serve 複本已 cp。

## 〇、補記 — 2026-07-21 之十一（店面買三送一跑馬燈 ✅ 待 push）
- **老闆點名**：?shop 頂部跑馬燈「BUY ANY 3, GET 1 FREE · cheapest bag free at checkout ☕」。`promoMarqueeHTML()`（**WS_MODE 回空**＝批發不出）＋CSS `.pmq`（accent 底白字圓角、內容兩份 translateX(-50%) 無縫循環 16s、prefers-reduced-motion 靜止）；插 renderPublicMenu＋renderCustomerPortal 兩入口 shopbody 前。驗證：零售顯示＋pmqx 動畫 ✓、批發空 ✓、console 零錯誤＋截圖 ✓。serve 複本已 cp。
- **老闆確認過**：買三送一只給 retail——批發管線（wholesale edge＋quick_pay）天生不吃這優惠，無需改動。

## 〇、補記 — 2026-07-21 之十（?shop 買三送一 ✅＋⚠ public-shop verify_jwt 事故與 apikey hotfix）
- **老闆點名網店同優惠**：規則同 Square POS＝非訂閱滿 4 袋送最便宜 1 袋、一單一次。①前端 `cartBogo()`（訂閱 isSubName 排除、qty 展開取 min）＋openCartSheet 折扣行/折後 Total/3 袋促購行 ②**public-shop v15 已部署**：checkout 建 priceOfVar（livePrice＋sizesOfItem 全 variations）＋subVids 排除訂閱 → bagPrices≥4 → `order.discounts` fixed 折最便宜（Square 付款頁顯示折扣行；SUBTOTAL_PHASE surcharge 在折後算）；SUB_RE 提頂層、GET 菜單順手濾掉訂閱商品列（subs[] 專屬）。
- **⚠ 事故＋修復**：MCP deploy 工具把 public-shop `verify_jwt` false→**true**（工具預設、無參數可關）——匿名 GET/POST 全 401、**網店對訪客掛掉**。Supabase/GitHub Dashboard 皆登出無法代跑改回。**Hotfix＝前端兩處 public-shop fetch 加 `apikey: SUPABASE_KEY` header**（實測 publishable key 過 verify_jwt 閘 200）——**要 push 部署 Vercel 才恢復**。⚠ 之後任何 MCP redeploy public-shop 都會維持 verify_jwt true——前端已帶 apikey 無妨；若要改回 false 需老闆登 Supabase Dashboard（Edge Functions→public-shop→Details）。
- **驗證**：jscheck ✓；前端假資料——4 袋（含 1kg $100＋訂閱）折 $22/Total 對、訂閱不計件、3 袋促購行 ✓；**edge 端到端**：GET 菜單 14 豆＋Dark Knight sizes 250/500/**1000g**（1kg 已在菜單資料）✓、checkout 4×250g → bogo_off 25/total 75/連結成立 ✓。
- **Square 折扣補記**：買三送一 Dashboard 折扣「Buy Any 4, Get Cheapest Free」已改 All locations＋Add all items（之九）。

## 〇、補記 — 2026-07-21 之九（訂單詳情 Invoice PDF＋Square 買三送一設定 ✅）
- **老闆點名「看到 pending_payment 的 invoice」**：openOrderDetail 加「Invoice PDF」鈕（rsMoney/isLead；未付款單標「— send for payment」）→ `orderInvoicePDF(o,btn)`：訂單灌 Invoice 引擎（INV keep/restore 照 trfInvoicePDF 路數）——items 映 Roasted Beans（GST-free）、**合計≠total 補「Shipping & adjustments」行（GST inc）總額吻合**、發票號＝'INV-'+單號（重印同號、不咬 inv_seq）、notes 帶付款狀態。Transactions/Orders 兩清單的詳情都有。驗證：jscheck ✓、端到端 INV-0030.pdf 269KB＋鈕 ✓、差額行 $12 GST inc ✓、console 零錯誤。
- **Square 買三送一（老闆點名，Chrome 代跑 Square Dashboard 完成）**：既有折扣「Buy Any 4, Get Cheapest Free」（買 3 送 1 最低價、100%）原只掛 Online Store＋14 items——已改 **All locations**（含 Crows Nest POS）＋**兩段規則都開 Add all items**（動態全商品、新豆自動含入），Saved ✓。⚠ 已知：自建 ?shop 網店不吃 Square 折扣（quick_pay 固定額）；一單只自動套一次；All items 含訂閱商品（POS 不會刷到、實害無）。
- **順帶發現**：Dark Knight variations（$25–$100）已在 Square 上＝先前 160s 超時的 push 其實「商品＋價格」段早成功、只斷在圖片；老闆補按 Update listing 傳圖即可。

## 〇、補記 — 2026-07-21 之八（Finance→Transactions 訂單金流磁貼 ✅ 待 commit）
- **老闆點名**「finance 那邊做個 icon 查看 ordering 的 transaction」。Tools Finance 區（rsMoney）加 **Transactions** 磁貼（data-t 'fintx'）→ `openFinTxSheet`：DB.orders（非取消、時間降序）＋**All/Paid/Unpaid seg**（FTX.f）＋頂部筆數/總額＋**月分組**（月標題帶 n·$小計）；行＝#單號·客名·$·日期·bank/card·paid✓（accent）/unpaid/overdue（紅）；點行 → `openOrderDetail(o,backTo)`——**detail 加第二參數 backTo**（預設 openOrdersSheet 不變），Transactions 進去 Back 回 Transactions 且篩選保留。
- **驗證**：jscheck ✓；假資料 4 單兩月——月分組（July 3·$125/June 1·$32.50）＋總計 $157.50 ✓、Unpaid 篩 2 筆（pending+overdue）✓、詳情 #0031→Back 回 Transactions＋seg 保留 ✓、console 零錯誤＋截圖 ✓。serve 複本已 cp。

## 〇、補記 — 2026-07-21 之七（push 卡死在 Pushing… → callFn 加 2 分鐘逾時 ✅ 待 commit）
- **老闆回報**：Update listing 卡在 Pushing…。查 edge log：sync-to-square 只有 2 筆 OPTIONS（preflight 過）、**POST 從未完成**＝大 payload（4 張商品圖 base64 幾 MB）上傳半路悶掉；`callFn` 裸 fetch **無逾時** → 按鈕永遠 Pushing…。非當日改動造成（push 管線當日零改動）。
- **修法**：callFn 加 AbortController **120s 逾時**——超時 abort＋throw「Timed out after 2 min — check your connection and try again」→ push handler 既有 catch 會 alert＋按鈕復原可重試。
- **第二幕（老闆重試撞「Push failed: unauthorized」）**：來源＝edge `auth.getUser()` 驗 token 不過（401）——頁面掛久 access_token（1h）過期；角色不對會是「directors only」所以不是權限。**修法**：callFn 拿 session 後**差 60 秒內到期就 `sb.auth.refreshSession()` 主動換新**，換不到 throw「Signed out — reload the app and sign in again」。即時解＝老闆重整 app 再 push。⚠ 重整仍 401 ×5——重試打架把 refresh token family 撤銷（rotation），**要登出重登**才拿新組。
- **第三幕（真兇definitivo）**：log 兩筆 **POST 503 execution_time 160 秒**＝edge push 流程太肥（ensure 分類/屬性/研磨串行分頁＋4 張圖串行上傳＋舊圖逐張查刪＝Square 來回 30+ 趟）超過 wall-clock 上限被砍。**sync-to-square v30 已部署（2026-07-21）**：三處並行化——①push 前置四項 Promise.allSettled（ensureRatioCategory/typeCat/ensureRatioRefDef/ensureGrindModifier）②4 張 attachImage 一起傳（imageStatus 邏輯保留 partial/failed 語意）③cleanupOldCardImages 內部並行。**零邏輯改動**；cav 改由 defId 構造（等價）。v29 原始碼在 git 歷史與本補記前版可回滾。
- **驗證**：jscheck ✓；stub 正常路徑 callFn 照常回資料 ✓（abort 路徑＝標準模式，原生 fetch 尊重 signal）。**遺留觀察**：若老闆重試仍卡，就不是網路——查 payload 尺寸（renderSocialImages 4 張 JPEG）是否異常暴肥、或 Supabase gateway body 上限；替代解＝List 抽屜圖模式切 Colour（單卡最小）先推價。
- **順帶學到**：Retail prices 設定「是否 wholesale 自動調」＝會，但要按 Update listing 推上 product_sync 後才生效（批發＝上架價×帳號折扣%）；「1kg 沒出現在購物車」同因——rtl_sizes 只是預設倉庫，push 才建 Square variation。

## 〇、補記 — 2026-07-21 之六（Retail prices 預設抽屜 ✅ 待 commit；v2 老闆糾正定稿）
- **老闆定稿（v2 糾正第一版）**：不是全產線豆——是「**過完 QC 的豆子清單**，一次設定**所有克數價錢**」。Publish 抽屜頂「Set retail prices…」（isLead）→ `openRetailPresets`＋`paintRetailPresets`（RPP 全域）：清單＝**有 QC pass 批次**的豆（rstRows filter qcState pass）；每豆一卡＝**Bag size seg（100/150/200/250）＋Bag $＋500g $＋1kg $**（同 List 抽屜四件套）。
- **存三包記憶**（read-modify-write）：rtl_price／rtl_g／rtl_sizes{g500,g1000}——整卡全空＝該豆不動；500g/1kg 清空＝**拿掉該規格**；別豆記憶原封。seg 切換先 grabInputs 收值再重繪（打到一半的價不掉）。key 同上架（listNameFor）。**上架流程零改動**：openListSheet 本來就讀這三包預填。
- **驗證**：jscheck ✓；假資料——只列 QC pass 3 卡（Finca Natural pending **不列**）✓、Ethiopia 預填 bag22/200g seg/500g40 ✓、seg 切 150 保輸入值 ✓、Save 三 payload：price{24 改/28 新/Keep Me 保}、g{150,200}、sizes{Ethiopia 清空 500g **被拿掉**、Dark Blend g1000:95 新、Keep Me 保}、全空 Finca 不寫 ✓、console 零錯誤＋截圖 ✓。serve 複本已 cp。
- **排版 v2（老闆點名好懂）**：每卡改「BAG SIZE 小標＋seg」→ 分隔線 → **每規格一行**（左＝規格名「Bag price · 250g（跟 seg 動態）/500g/1kg · blank = skip」、右＝$ 輸入 118px 右對齊）。驗證：seg 200→250 標籤跟著變＋輸入值 24 保留＋rtl_g payload 250 ✓、截圖 ✓。

## 〇、補記 — 2026-07-21 之五（退回要回原烘焙日批次 🐛 修好＋錯帳已搬正 ✅ 待 commit）
- **老闆抓蟲**：↓ 退回 13.3kg Dark Knight（06/07 烘）被補進 13/07 批。根因：`trfBackBatch` 只在 `rstBatches`（remaining>0）找同日期——豆全轉去店面後原批 remaining 0 被過濾，fallback 進最舊現存批。
- **修法**：同日期優先層改在**全部同名批（含 remaining 0）**找（單品加 rstProcMatch 同處理法；blend 不濾）；沒有原日期批才退原鏈：最舊現存批→同名任何批。
- **錯帳已 SQL 搬正**（線上 roasts）：13/07 批 66352797 remaining 18.8→5.5、06/07 批 b753a0cd 0→10＋3786a010 0→3.3（合計 13.3 歸位，總量不變、remaining≤roasted 帳面乾淨）。
- **驗證**：jscheck ✓；假資料 trfBackBatch 三路——原日期 remaining 0 批正確命中（修正前會誤配新批）✓、單品同名異處理法精準 ✓、無原日期批 fallback 舊行為 ✓。serve 複本已 cp。

## 〇、補記 — 2026-07-21 之四（Crows Nest：shop 清單全面去發票號＋≡ 移卡片最左 ✅ 待 commit）
- **老闆點名**：①Shop 層完全不顯示 invoice number（查號去 🧾）——明細行只剩日期 batch（有 fixed 才多一行 fixed 日期）、PENDING 卡第二行「PENDING · 日期 batch」②≡ 拖移把手移到**泡泡卡最左邊**（聚合組行首＋NEW/PENDING 卡 ☐ 左邊），右側只剩 kg ✕ ↓。
- **意外收穫**：右側瘦身後 375px 名字不再折行。之三的 commit 老闆自己在 GitHub Desktop 分三筆推了（訊息 title/update/update），部署已驗 bytes 一致。
- **驗證**：jscheck ✓；假資料——整個抽屜 grep 無 INV- ✓、明細行（無 fixed 乾淨/有 fixed「fixed 21/07」）✓、五張卡 ≡ 皆為卡內第一顆 chip ✓、左把手拖曳照常（Colombia 拖頂）✓、console 零錯誤＋截圖 ✓。serve 複本已 cp。

## 〇、補記 — 2026-07-21 之三（Crows Nest：fixed 日期取代發票號＋Submit→PENDING→Transferred 到店流程 ✅ 已上線＋**DB migration 已上線**）
- **老闆兩需求**：①Fix actual kg 過的行，第二行顯示 modified date、**移除 invoice number** ②Submit 後豆先掛 **PENDING**（不進抽屜），History 該發票多一顆 **Transferred** 鈕，按了 pending 拿掉、行才進聚合抽屜。
- **Migration `transfers_fixed_arrived_at`（已上線）**：transfers 加 `fixed_at`（Fix 改動時間）＋`arrived_at`（到店確認時間）；**backfill 既有 settled 行 arrived_at=settled_at**（歷史庫存不變 pending）。
- **狀態機**：pool（NEW）→ Submit → settled+arrived_at null（**PENDING 獨立卡**，灰膠囊/灰框、第二行全寬「PENDING · 日期 batch · INV#」）→ History「Transferred — put on shop shelf」（canWrite；整張發票 pendIds 一次 `update arrived_at`）→ 進聚合抽屜。History 組標題帶 PENDING 小膠囊。**刪發票撤銷連 arrived_at 一併清**（重 submit 才重走 pending）。
- **fixed 顯示**：openTransferFix 寫入加 fixed_at；抽屜明細行＋PENDING 卡第二行＝`fixed_at?'fixed '+fmtD:invoice_no`。
- **順手（手機排版）**：NEW/PENDING 卡改兩層——上層 ☐＋名＋(≡ kg ✕ ↓)、**膠囊＋批次資訊移第二行全寬**（375px 原本擠成豎排）；把手 padding 瘦 10→7px；兩處都掛 data-tline 可開行詳情。
- **驗證**：jscheck ✓；假資料——上層分流（settled+arrived 進抽屜/PENDING 卡/NEW 卡）✓、fixed 行顯示「fixed 21/07」取代 INV ✓、History PENDING 膠囊只在含 pending 的發票 ✓、Transferred 鈕 PATCH arrived_at in.(ids)＋logAct＋鈕消失＋行收進抽屜 ✓、Fix PATCH {kg,fixed_at} ✓、Delete 撤銷 payload 含 arrived_at:null ✓、新結構行詳情/拖曳回歸 ✓、console 零錯誤＋手機截圖 ✓。

## 〇、補記 — 2026-07-21 之二（Who's off 月曆兩點選 period ✅ 待 commit）
- **老闆點名**：N/A 日期改「點第一天＝起點、點第二天＝整段 period、點第三下＝重選起點」。實作：`NA_SEL2` 第二點全域；點日邏輯＝無選取或已成區間→重設起點、同一天→維持單日、點在前面→**自動對調**、否則成區間；月曆 a–b 整段 `.sel` 高亮；資訊列區間版「Wed 22/7 – Sat 25/7 · 4 days」＋「Mark me off · N days」。
- **naToggleSelf 改 (a,b,btn)**：區間一筆 staff_na `{start_date:a,end_date:b}`；自己已有一筆**涵蓋整段**→按鈕變 Clear me（原跨日 confirm＋整筆刪照舊）；區間存完清選取防重複按；單日行為與原版完全等價。換月**不再清選取**（區間可跨月）。順手：naOffMap 同名同日去重（重疊 N/A 不再重複 pips）。
- **驗證**：jscheck ✓；假資料 stub——三步互動（單日→22-25 四格高亮+4 days 鈕→第三點重選）✓、反向對調（先 30 後 27→27–30）✓、區間 Mark POST payload {start,end} ✓、涵蓋整段變 Clear→DELETE 精準那筆 ✓、存完清選取 ✓、console 零錯誤＋截圖 ✓。serve 複本已 cp。

## 〇、補記 — 2026-07-21（Crows Nest 上層豆子 ≡ 拖移換順序 ✅ 待 commit）
- **老闆點名**：Crows Nest 上層店面清單可拖移自訂順序。做法：每行（settled 聚合組＋NEW 卡）右側 kg 左邊加 **≡ 把手**（canWrite 才有）；按住上下拖、越過鄰行中點就換位（DOM insertBefore 交換法）；放開存 **app_state `trf_order`**（key 序列：組＝`g:name|procKey`、NEW 卡＝`n:<transfer id>`）——跨裝置照老規矩。
- **順序規則**：TRF_ORDER 有記的照記；沒記的（新出現的行）照舊預設＝settled 組先、NEW 沉底，排在有序項之後。NEW 卡 Submit 後併入聚合組，`n:` key 自然失效無需清理。
- **實作細節**：①openTransferSheet 開頭 app_state 讀取改 `.in('key',['trf_checks','trf_order'])` 一次讀兩包 ②渲染改 shopRows[{k,html}] 先拼再排 ③把手照 attachDrawerDrag 慣例——touch-action:none＋**非 passive touchmove preventDefault**（iOS Safari 捲動容器雷）＋click stopPropagation（別觸發聚合開合）④pointercancel 也收尾。
- **驗證**：jscheck ✓；假資料 fetch 攔截（test.html stub：假 director session＋5 筆 transfers）——預設序（2 組先 2 NEW 沉底、把手 ×4）✓、拖 Brazil NEW 底→頂（DOM 序＋POST app_state on_conflict=key payload 新序）✓、重開抽屜照存序渲染 ✓、把手 click 不觸發開合/點行照常展開 ✓、console 零錯誤＋截圖 ✓。serve 複本已 cp。
- **老闆設計定稿（plan mode 核准）**：上層＝店面庫存（Submit 後**保留清單**）、下層＝Coffee Stock、每行 ↑↓ 直接轉移、點豆選 kg、兩層各總 kg、Submit→invoice→右上 🧾（原有）。拍板：上層入池順序（新豆沉底）＋**未結行亮色 ‹new›**；國家分組退役（07-19 的），☐ 備忘保留。
- **資料生命週期（軟刪）**：pool（new 亮色）→ Submit → settled（普通色留清單）→ Used/Return → **update status='used'/'returned'**（不 delete——🧾 invoice 歷史金額不缺行）。⚠ **transfers_status_check constraint 已 migration 放寬**（'transfers_status_soft_delete'：+used/returned）。
- **改法**：①loadAll 載 `in('status',['pool','settled'])` ②openTransferSheet 重寫雙層（上層行 [☐][色點][名/日期/INV#][kg][↓]、‹new› accent 邊框淡底；中間圖例分隔；下層 `trfRoasteryRows()`＝rstRows 兩池聚合拼配前單品字母序 [↑]）＋`trfShopKg/trfNewList/trfRoasteryKg` helpers（trfPoolKg 留 alias）③↑＝TRF.lock 預選開 openTransferAdd（藏 seg/豆下拉、標題帶豆名、批次 chip＋kg 預填保留；tra-b/s 加 null guard）④↓＝transferReturn 直接退 ⑤點上層行＝`openTransferLine`（原 ✕✎ 合併：pool 行 Fix kg＋Return/Used；settled 行只 Return/Used——**Fix 擋 settled**（🧾 金額凍結），+ Add 磁貼鈕移除（下層全列了）⑥Settle 只聚合 pool 行、結完本地標 settled 不移除、文案改 ⑦🧾 歷史查詢改 `invoice_no not null`；**刪 invoice＝撤銷結單**（settled→pool 清發票欄、used/returned 只摘發票號）⑧Sunday 卡改算 pool 子集。
- **驗證**：jscheck ✓；假資料 fetch 攔截——雙層渲染（Shop 6.5/Roastery 10.5、‹new›×1 沉底、↑×2 ↓×3、Submit 1 new）✓、↑ 流（預選抽屜無選豆步驟、kg 預填 4.5、改 2 → PATCH roasts 4.5→2.5＋POST transfers、回雙層 ‹new›×2 Shop 8.5）✓、↓ 流（補血 PATCH＋**status='returned' 非 DELETE**、Shop 7）✓、行詳情（settled 無 Fix 標 INV#、pool 有 Fix）✓、Settle（只列 2 條 pool、PATCH settled 帶價與 INV、舊 settled 行不動、**結完三行全留清單 ‹new› 歸零**）✓、截圖上下層 ✓。
- **追加（老闆點名上層同豆收抽屜）**：Shop 層改 name+process 聚合一行（合計 kg＋N batches；組序＝最早入池順序）→ 點行展開各批明細（☐/鮮度點/日期/INV#/kg/↓ 全在明細行）；`TRFO` 手風琴一次一組、↓ 加 stopPropagation。
- **追加 v2（老闆點名新轉入不收抽屜＋highlight 加強）**：**只有 settled 進聚合抽屜**；pool（新轉入）＝**獨立卡沉底**——1.5px accent 框＋13% accent 底＋實心 **NEW 白字膠囊**、↓ 直接按不用展開、點行詳情照舊（pool 有 Fix）。驗證：settled DK 聚 4kg/2 批無 new 標、NEW 卡 ×2 排聚合組後、highlight 13% 底、↓×2 收合即可按、新卡行詳情有 Fix ✓、截圖 ✓。
- **追加 v3（老闆點名每豆放刪除鍵）**：明細行＋NEW 卡的 kg 旁都加 **✕**（data-trm，↓ 左邊）＝開 openTransferLine 選 Used/Return（刪除必選補不補庫存，不瞎猜）。驗證：✕×2、NEW ✕→Fix/Used/Return 全、Used→PATCH status='used' 軟刪、settled ✕→無 Fix ✓。
- **追加 v4（老闆點名退回要警訊）**：`transferReturn` 開頭加 confirm（帶豆名/處理法/kg；↓ 與行詳情 Return 都過這關）。驗證：取消＝零寫入行還在、確定＝補血＋returned 照常 ✓。另實測確認 Submit 後 NEW 卡自動收進同豆抽屜（0 NEW/組併入/總 kg 不變/Submit 鈕消失）——本來就是 v2 設計行為，老闆問過一次。
- **追加 v5（老闆點名 ✕ 裡加改實際公斤數）**：行詳情的「Fix actual kg…」**settled 行也開放**（原本凍結）——openTransferFix 的 status 擋拿掉；⚠ 改已結行＝🧾 歷史金額按新 kg 活算跟著更正（詳情有小字說明）。
- **追加 v6（老闆定稿：Fix＝純改數字）**：openTransferFix **整段簡化**——差額跟 Coffee Stock 結算（改小補回/改大 FIFO 再扣）全部拿掉（舊版 git 撈），只 `update transfers.kg`；店面實秤多少記多少、差異＝損耗自行吸收。說明「Just fixes this number — Coffee Stock is not touched」。驗證：2→1.7 唯一寫入 PATCH transfers、roasts 4.5 不動 ✓。

## 〇、補記 — 2026-07-20 之五（Green stock 詳情可直接改數量 ✅ 待 push）
- **老闆點名**：`openGreenDetail` 的 Stock 行從純文字改**輸入格**（canWrite 才有；read-only 照舊文字）——值變了才浮出「Save stock」鈕（改回原值自動藏＝防誤存）。
- **存檔照 Stocktake 口徑**（歷史不斷）：beans.quantity 更新＋stock_moves `{kind:'stocktake',delta_kg,after_kg,note:'Adjusted in Green stock'}`＋DB.beans 記憶體同步＋logAct；成功後重開詳情＝數字與流水帳即時刷新。負數擋、兩位捨入。Edit details 抽屜照舊不碰庫存（那句「Stock kg is set in Stocktake」文案未動——現在詳情頁自己就能改）。
- **驗證**：jscheck ✓；假資料——input 初值 450、改 447.5 浮 Save、改回 450 藏 ✓、存檔鏈 PATCH beans＋stock_moves stocktake（delta −2.5/after 447.5）✓、記憶體同步＋重開刷新 ✓、截圖 ✓。

## 〇、補記 — 2026-07-20 之四（Log roast 全區顯示兩位小數 ✅ 待 push）
- **老闆點名**：`roFmt1`（一位）改名 `roFmt2`＝`toFixed(2)`（replace_all 連定義一次到位；只在 Log roast 區用過，grep 確認無外部呼叫）；聯動攤分/反推總量的捨入 `*1000/1000` 三位→`*100/100` 兩位（roSpreadCard/roSpreadGreen/兩處反推）；庫存 hint have 兩位；ro-num placeholder 0.0→0.00（×5）。內部 Σ（roPreGreenTot 等）留三位精度不動。
- **驗證**：jscheck ✓；33/33/34 除不盡配方——hint 10.456→10.46、總量 10 攤 3.3/3.3/3.4、成分 1 反推總量 3.03、blur 4.567→4.57、兩分頁總計 4.57／3.46+2.89 ✓。

## 〇、補記 — 2026-07-20 之三（Log roast 拼配成分改吃 recipe 的 bean_id ✅ 待 push）
- **老闆點名「blend 要從 blend recipe 截取資料」**：查線上真資料——blends.parts 每成分都帶 `bean_id`（且 pct 是**字串**、常有空尾列 `{pct:'',bean:''}`；Finca Milan 同名兩支不同 culturing＝名字配對的地雷），但 Log roast 生豆對照/扣帳只用名字＋處理法猜。
- **改法（ID 優先、名字備援）**：①`roGreenBean(name,process,beanId)` 加第三參數——recipe 的 bean_id 直配 DB.beans，配不到才退名字＋procKey（舊配方沒 bean_id 用）②呼叫點全帶 ID：卡片渲染 hint／roGreenHint（打字重算）／submit 生豆 check／pre 扣帳 ③**三種快照（pre/post/intake）的 recipe.parts 都補 bean_id**——post 帶 ID 後 `consumeBlendParts` 現成的「ID 優先」邏輯直接生效（原本收不到 ID 一直退名字配）④Mix roasted 打字 hint 的 `roStockHint` 補 `data-bid` 帶 ID。
- **驗證**：jscheck ✓；假資料照真形狀（字串 pct/空尾列/同名 Finca Milan ×2 不同 id）——空尾列濾掉只 2 行 ✓、hint 精準抓 Nitro 那支 3kg（名字配會誤抓 April 8kg）✓、字串 pct 聯動 7→總 10→攤 3 ✓、pre 扣帳只扣 bean_B/bean_C（同名 bean_A 不動）＋快照帶 bean_id ✓、Mix roasted：hint 只算 Nitro 批次 6kg、FIFO 精準扣 rA/rC（同名 rX 不動）、快照帶 bean_id ✓。

## 〇、補記 — 2026-07-20 之二（Log roast 對齊老闆思路定稿：entry 全域化＋Roast green % 聯動＋Customise ✅ 待 push）
- **老闆口述完整思路（plan mode 核准）**：①最上層先選當日/補過去（互斥）②當日＝扣生豆庫，blend 標準＝輸生豆自動換算 %、另有 Customise 自由填 ③補過去＝同樣輸入但不扣、必填日期。UI 要簡單易懂手機優先。
- **改法四件**：①**entry 全域化**——刪 `RO.bentry`，單品拼配共用 `RO.entry`（互斥保證：一次 submit 全 roast 或全 intake）；上排 seg 一組管全部 ②**Blend 當日**：卡內 seg 標籤白話化「**Roast green**（生拼，預設 `pre:true`）｜**Mix roasted**（熟拼＝原 post 原樣）」；Roast green **預設照配方 % 聯動**（輸一成分格→反推總量攤其他格；Green total 變 input `data-bgt` 直輸往下攤；helpers `roSpreadGreen`/`roGreenHint`/`roGreenTotals` 在 paintRoastSheet 閉包）＋右上小字「**Customise ✎**」（`bb.custom` 切自由填＝原 pre 行為，值保留來回切）；**存檔共用原 pre 路徑零改動** ③**intake blend 成分開放選填**（同生拼版面、無庫存 hint 無聯動）——有填就進 recipe 快照（parts 帶 green_kg＋green_kg=Σ），照舊零扣帳 ④**session 日期欄移除**（當日＝todayStr()；intake 每卡日期）——`grab()` 留空殼（多處呼叫，Log roast 閉包內）。
- **驗證**：jscheck ✓；假資料 fetch 攔截六路徑 payload 全對——roast 單品（扣豆+moves 迴歸）、Roast green 聯動（3→總 5→攤 2；total 輸 10→攤 6/4；loss −15%；submit＝pre 快照 green_kg 7/4+扣豆 10→3/5→1+moves×2）、Customise（解鎖不聯動 7/4、切回值保留）、Mix roasted（FIFO 4→1/3→1 迴歸）、intake 單品（零扣帳迴歸）、intake blend（快照帶 green_kg 2.4/1.6+date、零 PATCH 零 moves）；entry 互斥（blend 切 intake→single 也 intake）✓；截圖 ✓。

## 〇、補記 — 2026-07-20（Log roast 拼配加 Intake · past 補舊批 ✅ 待 push）
- **老闆需求**：「blend 也要能夠輸入是當日烘焙，還是入庫之前的批次」——拼配分頁比照單品加 Roast today / Intake · past 切換（原本拼配只有 pre/post，補舊批會誤扣現在的庫存）。
- **做法（`RO.bentry`，不進草稿——每次開抽屜預設 roast）**：①Blend 分頁頂部加 pm-seg「Roast today｜Intake · past」（`ro-be-r`/`ro-be-i`，樣式同單品）②intake 卡片＝選配方＋**成分唯讀快照列**（不填量）＋**每卡 Roast date**（data-bbd）＋Roasted；Pre/Post seg 與 session 日期欄都藏（每卡自帶日期）③`roBlendDone` intake＝name+out+date；`roValidBlends` 加 date 判有效卡④`submitAllSession` intake 分支＝**照 saveBackfill 拼配口徑**：insert roasts {kind:'blend',green_kg:null,recipe 快照,roast_date=卡日期}——**不扣生豆、不 consumeBlendParts、不寫 stock_moves**；dup check intake 比各卡日期；pre-blend 生豆 check intake 跳過⑤訂單籌碼 data-blend 帶入強制切回 roast（今天要烘的）。
- **驗證**：jscheck ✓；假資料（fetch 層攔截——**蓋 window.sb 沒用**，sb 是內部 const，記憶警告屬實）——seg 預設 roast/切 intake 畫面切換 ✓、成分唯讀無輸入框 ✓、gate 沒日期擋/填了放行 ✓、intake submit 寫入鏈只有 roasts insert（kind blend+快照+2026-06-15）+activity_log，**零 PATCH beans/roasts、零 stock_moves** ✓、迴歸：重開抽屜回 roast、比例聯動 5→3/2、post 扣成分 FIFO 4→1/3→1 照舊 ✓、截圖 ✓。
- **追加（老闆點名上下對換）**：兩排 seg 對調——Roast today/Intake·past 移到**上排**（entrySeg 抽出 body、單品/拼配共用位）、Single origin/Blend 在下排；卡內 Pre/Post seg 不動。驗證：兩分頁 seg 順序、四向切換、截圖 ✓。

## 〇、補記 — 2026-07-19 之十九（Log roast 拼配加 Pre-blend 生拼 ✅ 待 push）
- **老闆需求**：開新烘焙時 pre-blend（生拼）與 post-blend（熟拼）**同一畫面**；pre-blend 成分**輸個別公斤數**（自由填、不被配方比例鎖）。
- **做法（Blend 分頁每卡加 pm-seg「Pre-blend · green｜Post-blend · roasted」）**：①`roEmptyBlendBatch` 加 `pre:false,gamt:{}`（pre 成分生豆 kg；amt/gamt 分開存、**切換不丟值**）②pre 渲染：成分行自由輸 kg（**不聯動**）＋「green X kg」對照（新全域 `roGreenBean(name,process)`＝DB.beans name+procKey；⚠ Menus 的 beanByNameProcess 在閉包內拿不到——踩過）＋Green·total 自動 Σ＋Roasted out 獨立輸（**data-bbo handler pre 時跳過 roSpreadCard**）＋Loss 即時③`roBlendDone` pre＝至少一成分>0 且 out>0④`submitBlendSession` pre 分支：生豆庫存 check confirm（同 single 口徑）→ insert roasts {kind:'blend',green_kg:Σ,recipe:{pre:true,parts:[{bean,process,pct,green_kg 實際}]}} → **逐成分扣 beans.quantity＋stock_moves {kind:'roast',note:'Pre-blend 配方 日期'}**；post 路徑照舊（比例聯動＋consumeBlendParts 扣熟豆）。
- **驗證**：jscheck ✓；假資料——卡上兩 seg ✓、pre 自由輸 3/1.2（60/40 配方不干預）＋總計 4.2＋loss −14.3% ✓、出爐輸入不反蓋成分 ✓、Submit 寫入鏈 POST roasts(pre=true,green=4.2)→PATCH beans 10→7/6→4.8→stock_moves −3/−1.2 ✓、post 聯動照舊（3→2→total 5）✓、pre↔post 來回切值保留 ✓、截圖 ✓。

## 〇、補記 — 2026-07-19 之二十（Log roast 合併 Submit：單品＋拼配一次全送 ✅ 待 push）
- **老闆問「可以單品和混合豆同時 submit 嗎」→ 拍板做**：兩分頁填好的卡**一顆 Submit 全送**。
- **做法**：①「有效卡」概念（`roValidSingles`/`roValidBlends`＝填過任何東西的卡；**全空卡忽略**——比舊制寬鬆）②gate 統一 `roAllReady()`（至少一有效卡且全部 done；roRefresh/roRefreshBlend/paintRoastSheet 三處共用）③按鈕 `roSubmitLabel` 混填顯示「Submit N (X+Y)」④**`submitAllSession`** 取代 submitRoastSession＋submitBlendSession（舊函式已刪、git 撈）：三段 check（單品生豆庫存→拼配同日重複→pre-blend 生豆）→ 單品 insert＋扣生豆＋stock_moves（intake 不扣）→ 拼配 pre/post 分支照舊 → **兩邊一起清＋saveRoastDraft＋一次 reload**、toast「X single + Y blend logged ✓」。
- **驗證**：jscheck ✓；假資料——單品填完label「Submit 1 batch」→ 加 blend 變「Submit 2 (1+1)」✓、一顆 Submit 寫入鏈：single insert→beans 10→8→moves −2→blend insert→熟豆成分 rem 5→2/3→1 ✓、草稿清 ✓、零 alert ✓。

## 〇、補記 — 2026-07-19 之十八（Gmail 帳單偵測排程 ✅ 不涉及 app 代碼）
- **老闆需求**：偵測 Gmail 裡「需要繳費的 invoice」並通知。
- **做法（零 app 代碼——Claude 排程任務）**：老闆 Mac 的 Claude app 排程 **gmail-invoice-alert**（每天雪梨 07:10，app 沒開則下次開機補跑；SKILL.md 在 ~/.claude/scheduled-tasks/gmail-invoice-alert/）：Gmail 連接器搜 `newer_than:3d (invoice OR bill OR …) -label:Label_14` → 判斷「Ratio 要付錢」的（**排除 invoicing@messaging.squareup.com＝自家開給客人的、行銷、驗證碼**）→ Supabase execute_sql 寫 **messages**（💸 標題＋摘要，app 訊息鈴鐺）＋有到期日寫 **events**（Upcoming 卡＋晨報自然帶到）→ thread 貼 Gmail 標籤 **Ratio/Invoice-alerted（Label_14）** 防重。
- **首跑演練（2026-07-19 本 session 手動）**：現有 15 封處理完——寫入 5 筆 messages（Cofinet $2,245 due 7/20／Food & Dairy INV01067997／JJ's Waste 逾期 $134.50 扣款失敗／Zest 逾期 $1,062.53／coffeeratio.online 域名 7/25 到期）＋2 筆 events（7/20 Cofinet、7/25 域名）＋15 thread 全貼標。
- **注意**：排程首次自動跑可能彈工具授權——老闆可在 Scheduled 側欄按 Run now 先把權限批一輪；要調頻率/規則直接跟 Claude 說改排程。
- **同日追加三（老闆點名留紀錄）**：migration `messages_paid_column`＝messages 加 **paid** boolean（default false）；Bills 改版——**✓ Paid＝update {paid:true,unread:false} 搬進歷史（不再刪）**；標題右上 **🕘**＝「Bills · paid history」（同閉包 paintHist）：列已繳、**✕ 才真刪**（confirm→delete）；主清單只列未繳（select 一次前端拆兩組 limit 100）。驗證：主清單 2 筆＋icon ✓、✓ Paid PATCH 搬歷史 ✓、歷史 ✕ DELETE 精準 ✓、Back 往返 ✓。
- **同日追加二（老闆點名抓細節）**：①migration `messages_link_column`＝messages 加 **link** text 欄 ②排程 prompt 升級：每筆用 get_thread 讀全文抽 **金額／發票號／到期日／付款連結**（只收 https 完整 URL、拿不準留空），insert 帶 link ③Bills 抽屜：有 link → 行加 **Pay →** 鈕（accent 色、window.open 新分頁）。驗證：有 link 出鈕＋開對 URL、無 link 只有 ✓ Paid ✓。
- **同日追加：Tools→Finance 新磁貼 Bills**（data-t 'bills'，rsMoney gate）＝`openBillsSheet`：當場查 messages `like('title','💸%')` 最新 50 筆卡片列（標題去 💸 前綴＋preview＋seen 日期）、**✓ Paid＝confirm→delete 該 message**（清單與鈴鐺同步消失）＋logAct 'bill marked paid'；空清單「No bills waiting ✓」。驗證：清單/✓ Paid DELETE id 精準/刪後重繪 ✓。

## 〇、補記 — 2026-07-18 之十七（Blend Menu 每格 Extra Surcharge 填空 ✅ 待 push）
- **老闆需求**：Menus→Blend Menu 每支多一個「Extra Surcharge」填空，PDF 印「$# Extra」。
- **做法**：①全域 `MENU_SURCH=['','','','']`＋app_state key **'menu_surch'**（menusEnsureData 讀、saveMenuSurch 存——同 menu_slots 模式跨裝置）②openMenuBlendSheet 每格 select 下加 input（data-msc、placeholder 'Extra Surcharge $ · optional'、input 即存）③genBlendMenuPDF info4 帶 `surch`（`replace(/[^0-9.]/g,'')` 只留數字）④drawCell：**name band 右端**印（同帶文字色 9pt 粗體右對齊、豆名讓寬不撞字；原 FLAVOUR 行位置 2026-07-18 老闆改定位） `'$'+surch+' Extra'`（8.5pt berry 色粗體右對齊；留空不印）。
- **驗證**：jscheck ✓；假資料——4 格各有填空 ✓、輸入即存 MENU_SURCH ✓、PDF 原始碼（蓋 API.save 抓 output）'$3 Extra' ×2（左右兩半各一）✓、空格不印 ✓。
- **⚠ 測試坑（記給下次）**：jsPDF 2.5.1 的 text/save **不在 JS.API 上**（建構閉包內）；蓋 `JS.API.text=wrapper(oT=undefined)` 會在 mixin 時把實例真方法蓋成壞的→buildFn 在 menusPDF 的 Promise executor 內 throw→**promise 永不 settle＝假 hang**。攔 PDF 內容的正路：`JS.API.save=function(){raw=this.output();}`（mixin 蓋掉真 save）、測完 `delete JS.API.save`。

## 〇、補記 — 2026-07-18 之十六（Stock transfer：底下店面調撥池＋週日結單出 invoice ✅ 待 push）
- **老闆需求**：底下店面（目前 Crows Nest）拿豆先進「transfer pool」累積，池可從 Coffee Stock 增（轉入）減（退回），**週日結單**＝存紀錄＋出 invoice。
- **新表 `transfers`**（migration `transfers_table`，RLS is_staff() 四政策照 subscriptions）：dest（默認 'Crows Nest'）/name/process/is_blend/kg(>0)/roast_date/status(pool|settled)/settled_at/invoice_no/price_per_kg。loadAll 尾端 append `.eq('status','pool')`→`DB.transfers`（**rs[23]**；歷史結單抽屜內當場查）。
- **前端（new/index.html）**：①Roast 區新磁貼「Stock transfer」（data-t 'transfer'，Coffee Stock 旁）→`openTransferSheet`＝池總覽（kg/行數統計、逐行 ✕ 退回、+ Add、Settle 鈕 rsMoney gate、Past settlements 按 invoice_no 分組近 8 次）②`openTransferAdd`：Blends/Single origins seg＋豆下拉（rstRows 有批次者、帶現量）→批次組 chips（rstGroupByDate 預設最舊、鮮度色點同扣血）→kg→存＝**組內 FIFO 扣 roasts.remaining_kg（超量擋存「only has X kg」）→insert transfers**；insert 失敗自動把剛扣的血補回（帳不缺角）③`transferReturn`：整行刪＋kg 補回原日期批次（沒了→最舊現存批→全無擋並提示走 Log roast Intake）；刪行失敗把剛補的血收回④`openTransferSettle`（rsMoney）：按豆聚合＋每行 $/kg（**app_state 'transfer_prices' 記上次價**、即時小計/總計）→confirm→**重用 Invoice 引擎**（invNextNo 同 inv_seq 序列；INV 暫存還原；items cat 'Roasted Beans'＝GST-free、qty=kg、unit=$/kg；buyer 'Ratio Coffee — Crows Nest store'）→PDF 成功才逐豆 update status settled+invoice_no+price_per_kg→價格記憶寫回（失敗不擋）→池歸零⑤buildItems **'trf-settle' 週日卡**（getDay()===0 且池非空；st:'Transaction' hot director only kind:'trfsettle'→開結單抽屜；det2 Later 可睡）⑥DONE_TOOLS +'Stock transfer'。
- **驗證**：jscheck ✓；本機 8124 假資料攔 fetch 全測——池抽屜統計/行清單 ✓、Add 選豆→批次→超量擋「only has 5 kg」✓、合法轉 2kg r1 5→3＋寫入序 PATCH roasts→POST transfers→activity_log ✓、退回 r3 3→4.5＋行刪 ✓、結單聚合 $28/kg 總計 $56 ✓ INV-20260718-001 ✓ PATCH transfers（process null 用 .is）✓ 價格記憶寫回 ✓ 池歸零 ✓、週六不出卡/假週日出卡 ✓、console 零錯誤＋截圖 ✓。
- **等老闆（部署後真機）**：①Tools→Stock transfer 真轉一筆看 Coffee Stock 血條同步扣②週日看今日流 Transfer settlement 卡→填價結單→看 PDF invoice ③之後開第二家店跟我說——把 TRF_DEST 常數升級成去向選單。
- **注意**：轉入只從**可賣池**扣（降級/待秤批次不進轉撥）；結單 PDF 出了但池清失敗會 alert 提示重按（會出新發票號，內部單無大害）。
- **2026-07-19 追加（老闆點名池排版 v2）**：Crows Nest 池 ①**照國家分組排列**（`trfCountry`：拼配歸 Blends 最前、單品查 beans name+process 拿 country 字母序、查不到 Other 最後；組內照入池順序）②每行最左 **☐/☑ 打勾備忘**（老闆點名純備忘無功能）——狀態存 **app_state 'trf_checks'** {transferId:true}（跨裝置；開抽屜讀最新、點擊就地切換＋整包寫回**只留當前池行 key**＝老行自動清）。openTransferSheet 因此轉 async。驗證：分組序 Blends→Ethiopia→Kenya→Other ✓、上次勾的進來還在 ✓、點勾寫回 {t1,t2} ✓、截圖 ✓。
- **同日追加九（老闆點名）**：Customers 區新磁貼 **Post Label**（data-t 'addrlabel'，排 Contacts 旁）＝收件人貼紙 .lbx（Brother）——**重用 blend-label.lbx 範本＋lblFitBlock**：名字塊→收件人大寫、成分行→地址行1、comment→地址行2、風味行→Suburb State Postcode、date 行→電話、NET 清空。**來源＝contacts 通訊錄**（老闆同日從 customers 改）：開抽屜當場查 contacts（id/name/company/phone/address）、address 是自由文字→按逗號/換行拆（首段→行1、中段＋company→行2、尾段→行3，contactAddrParts），欄位可手改；檔名 POST_名字.lbx；logAct。驗證：下拉帶公司名/no address 標記 ✓、拆行帶入 ✓、zip 內 label.xml 收件字樣正確＋範本原字全換 ✓。（customers 版原始碼 git 撈）。**同日範本升級**：老闆給專用 **/address.lbx**（單一 FIXEDFRAME 文字框、shrink 自動縮字、Helsinki 13.1pt）——生成改整段替換「To: 名字\nAddress:\n行們」＋stringItem 串縮單段 charLen=全文長；**不再用 blend-label 範本與 lblFitBlock**；表單 phone 欄移除（範本無電話行）。驗證：pt:data 格式正確＋charLen=74 對數 ✓。
- **同日追加八（老闆點名）**：🧾 Submitted invoices 可**刪單**——組展開尾 Download PDF again 旁加紅 Delete（rsMoney||isLead）：confirm（標明只刪帳面紀錄、Coffee Stock 不動、發票號不回收）→ 硬刪 `.eq('invoice_no',no).eq('status','settled')` → logAct 'transfer invoice deleted' → 列表即時移除。驗證：兩鈕並排 ✓ confirm 文案 ✓ DELETE 條件精準 ✓ 刪後列表剩另一張 ✓。
- **同日 debug/瘦身輪（老闆點名）**：①🐛 **結單 race**——原 update 按「name+is_blend+process」整批標 settled：結單瞬間別人加同豆新行會**沒算錢就被結掉**、名字大小寫不一致會漏結 → 聚合時收每組池行 **ids**、update 改 `.in('id',r.ids)` 精準鎖定（confirm/logAct 也改快照合計 sumKg、本地清池只濾 doneIds——新行留著）②瘦身：退回/矯正重複的找批邏輯抽共用 **`trfBackBatch(t)`**（原日期批→最舊現存批→同名任何批→null）。驗證：退回/矯正行為不變 ✓、結單 PATCH `id=in.(t1)` 只動鎖定行、期間加入的 t9 沒被結且本地留存 ✓、console 零錯誤 ✓。
- **同日追加七（老闆點名 manager 權限）**：**lead（manager）可完整操作 Crows Nest**——寫入（加/退/矯正）canWrite 本就含 lead；新開放：①池抽屜 Submit 鈕＋openTransferSettle gate `rsMoney()||isLead()` ②🧾 Download PDF again 同 ③週日 trfsettle 卡 `roles:isLead()?['director',myRole()]:['director']`（roles 是 role 名單、lead 是旗標——自己端 buildItems 動態塞自己的 role）。驗證：roaster+lead 三處全開＋卡可見 ✓、非 lead roaster Submit 不出現 ✓。
- **🐛 同日修（老闆 iPhone 實測踩雷）**：Submit 報「Invoice PDF is saved but the pool did not clear: TypeError: Load failed」——**iOS Safari 在 PDF 下載/分享跳出時會掐斷進行中的 fetch**，原順序「PDF 先→DB 後」在 iPhone 必踩。修：**順序反轉＝DB 全寫完（標 settled＋seq.commit＋價格記憶＋logAct）→ 最後才出 PDF**；PDF 失敗只 alert「Submitted ✓ 去 🧾 重出」單已結好。共用 `trfInvoicePDF(no,lines,dateStr)`（INV 暫存還原）；🧾 歷史組展開尾加 **Download PDF again** 鈕（rsMoney gate）＝隨時補印。中途 update 失敗訊息也改「已寫的留在該號、剩下重按走新號」。驗證：假 PDF 引擎炸掉→池照清＋alert 指路 ✓、歷史重出 items/號正確 ✓。
- **同日追加六（老闆定價）**：**transfer 價＝RRP 的 50%**——openTransferSettle 當場查 product_sync（channel square，price/grams）→ $/kg=price/grams×1000 → **打對折預填**（process 級優先、名字級退路）；行下註「RRP $X/kg → half」；**沒上架的豆**註「no RRP — set a price」→ 退回上次記憶價 → 空手填；欄位仍可手改。驗證：$30/150g→預填 $100、$25/100g→$125、無 RRP 空欄、總計 $387.50 ✓。
- **同日追加五（老闆點名）**：①「Settle & invoice…」全改 **Submit**（池抽屜鈕/結單抽屜鈕 Submit — PDF invoice/confirm 文/週日卡 act 'Submit…'）②抽屜標題右上加 **🧾 icon**＝`openTransferHistory`「Submitted invoices」抽屜：settled 按發票號分組（號＋日期｜總 kg＋金額）、**點組展開明細行**（豆名 · kg × $/kg = 小計）、查一次展開只重繪不重打 DB；原主抽屜底部 Past settlements 區收掉。驗證：Submit 文案 ✓ 歷史兩單分組＋展開明細 ✓ 展開零額外查詢 ✓ 卡 act ✓ 截圖 ✓。
- **同日追加四（老闆點名）**：Add 抽屜 kg 欄**預填選中批次的總量**（整批全轉直接按存、部分轉改數字；換批次 chip 重填該批總量）。驗證：選豆預填 5、切批 4、切回 5 ✓。
- **同日追加三（老闆點名並排 ×2）**：①池抽屜「+ Add」與「Settle & invoice…」合一排（flex 1:1.8、Add 縮字防窄機截斷；只有一顆時自己撐滿）②三選抽屜「Return to stock」與「Used」合一排（1.3:1）＋下方灰字一行說明、Cancel 留底。截圖驗證兩排不爆框 ✓。
- **同日追加二（老闆點名）**：✕ 改**三選抽屜** `openTransferRemove`（原 confirm 兩鈕裝不下）——Return（走 transferReturn 補血刪行，confirm 已拿掉）／Used（`transferUsed`＝店裡用掉：只刪池行**不補血、不進週日結單**，logAct 'transfer used'）／Cancel（回池）。驗證：三選出現 ✓ Cancel 全不動 ✓ Used 只 DELETE 行血條不動 ✓ Return r4 8→10＋行刪 ✓ 截圖 ✓。
- **同日追加（老闆點名兩處）**：①池行日期移到豆名下一行 ②✕ 右邊加 ✎＝**矯正量** `openTransferFix`：輸「正確的 kg」直接調到位、差額跟 Coffee Stock 結算——改小補回原日期批次（找批邏輯同退回）、改大從原日期批次組 FIFO 再扣（**不夠擋存**「only has X kg spare」、提示別批豆用 + Add 另開行）；先動 roasts 再改池行、池行改失敗把血滾回；logAct 'corrected transfer' old→new。驗證：改小 2→1.5（r1 3→3.5）✓ 改大 1.5→3（r1 3.5→2）✓ 超量 2→20 擋且數字全不動 ✓ 截圖 ✓。

## 〇、補記 — 2026-07-17 之十五（Marketing 新磁貼 Edit Notes：改已 Pass 豆風味 ✅ 待 push）
- **老闆需求**：Marketing 區加「Edit Notes」鈕改已 Pass 豆的風味。磁貼（lead only 同 Publish、icon 'book'、data-t 'editnotes'）→ `openEditNotesSheet`：母體＝samples flavour_locked=true 去重（sample_id|procKey 最新一筆，同 Publish 口徑）、每列豆名＋處理法＋現風味詞；點列 → `openEditNotesForm`：三格風味（maxlength 22）＋comment（30）預填現值、Save→update samples {features(濾空),comment||null} eq id→本地同物件參照即時同步＋logAct 'edited notes'→回列表。至少一個風味詞防呆。
- **傳播鏈**：只改 app 端 samples——店面菜單/?bean 公開頁約 5 分快取後自動跟；**Square 商品描述不自動同步**（要走 Publish→Update listing），抽屜副標有註明。
- **驗證**：jscheck ✓；假資料——列表只列已鎖＋同豆去重 ✓、表單預填 ✓、Save payload {features:['Cherry','Black currant'],comment} eq s1（空格自動剔）✓、回列表即時顯示新詞 ✓、磁貼存在 ✓。

## 〇、補記 — 2026-07-17 之十四（今日流 Dial in 提醒卡整段移除 ✅ 待 push）
- **老闆指示**：dashboard（Today）的 Dial in 告知卡移除。刪兩段：①buildItems 的 stale 計算（latest/DB.dialins 掃描＋ESP_STALE_DAYS 判過期）②stale.forEach 的 Recipe 卡 push（id 'di:'、kind 'dialin'）。grep 確認 stale 零殘留（只剩註解字樣）。
- **殘留死碼（無害留置）**：runAction 的 kind==='dialin' 分派＋卡片版 `openDialinForm` 沒了呼叫端——dlgFieldsHTML/dlgBindSteppers 仍被 Tools 版共用不能動；下輪大掃除再收。**Tools→Dial in 磁貼照常**（手動記 dial-in 唯一入口）。
- **驗證**：jscheck ✓；假資料（2 synced 商品＋0 dialins，舊版必長 2 卡）→ dial 卡 0、其他卡照常 ✓。
- **同日追加③（QC 導航卡也刪）**：`qcnav`「Cupping & QC — N waiting」整段移除（Today 最後一張 QC 卡）。toCupList/QCQ 共用沒動（QC 分頁自己用＋tileCount 磁貼計數照算）；`function qcnav()` 相容別名與 runAction 分派留置無害。**進 QC 的路**：Beans 頁紅燈卡直達＋Tools→QC 磁貼（磁貼有紅點計數）。驗證：jscheck ✓、假資料 QC 卡 0 ✓。
- **同日追加②（Roast 站三張卡全刪，老闆拍板「全部不需要」）**：①`roastdem`「Roast for orders」烘豆需求卡（**含 dem/demOrder 差額計算整段**——app 從此沒有自動算「訂單要烘多少」的地方，老闆知情）②`rstlow`「Roasted stock low」③`rstover`「Overstocked」熟豆血條聚合卡（含 rstLow/rstOver 計算）。共刪 3.9K。`rstStockKg` 共用函式沒動（血條列表還用，5 呼叫端）；runAction 的 kind rstlow/roastlog 分派變死碼無害留置。驗證：jscheck ✓；假資料（Confirmed 單＋零熟豆＋超標配方，舊版必長 roastdem+rstover）→ Roast 卡 0、Pack 卡照常 ✓。
- **同日追加（green stock 通知也刪）**：buildItems 的 `var low=DB.beans.filter(低量門檻)` 計算＋`low.forEach` 的 Green 站「Low · 豆名」卡 push 兩段整刪（grep low.forEach/'low:' 歸零）。**低量資訊仍在**：Tools→Green stock 血條列表紅條＋· low 紅字、晨報。驗證：低量豆假資料（2kg≤門檻5，舊版必長卡）→ Low 卡 0 ✓。

## 〇、補記 — 2026-07-17 之十三（🐛 批發帳號看不到菜單——Read-only 護欄誤傷，已修待 push）
- **老闆回報**：getratiocoffee@gmail.com（wholesale）登入後看不到 inventory/price。查證：帳號 role 正常、edge v4 正常（director 呼 menu 14 支）、edge log **完全沒有** wholesale 帳號的呼叫紀錄＝前端根本沒發出請求。Chrome 模擬 wholesale 視角重現：菜單空＋跳「Read-only — ask a manager」toast。
- **根因**：2026-07-14 的 Read-only 護欄——`callFn` 開頭 `if(!roOk&&!canWrite())throw 'Read-only'`，canWrite()=isLead()||staff，**wholesale 角色不在名單**→ 批發客呼 menu/checkout 被自己前端擋掉、loadWholesaleMenu catch 吞錯回 []＝空菜單。07-08 批發全鏈驗證在護欄之前，之後沒用批發帳號測過才沒發現。
- **修法**：loadWholesaleMenu 的 menu 呼叫＋wcart-go 的 checkout 呼叫都傳 `roOk=true`（批發通道的權限真閘在 wholesale edge：JWT＋role wholesale/director；前端護欄本來就是管員工的）。
- **驗證**：jscheck ✓；本機無 session 模擬——修正後呼叫錯誤從 'Read-only' 變 'Invalid JWT'（＝穿過護欄真的打到 edge）✓、舊式呼叫仍 'Read-only'（重現原 bug）✓。**真機驗證等 push**：老闆用 getratiocoffee 重新登入應見 14 支豆＋批發價。
- **教訓**：改全域護欄（canWrite/callFn 這種總閘）要把**非員工角色**（wholesale/customer 門戶）的通道全數過一遍——它們不寫 DB 但會呼 edge。
- **同日追查（老闆問 customer 看不看得到豆）**：customer **沒事**——零售菜單 loadShopMenu＋零售結帳 cart-go 都是裸 fetch 直打 public-shop（不經 callFn 護欄）；訪客（未登入）寫 feedback/申請也沒事（ROLE 初始值 'director'，canWrite 放行、真閘 RLS）。但**登入中的 customer/wholesale 按 Leave feedback 或填 ?apply 會被 sb.from Proxy 擋**（送出顯示 Could not send: Read-only）→ 兩處 insert 改走 `sbRaw()`（護欄後門，真閘在兩表的 RLS insert 政策）。驗證：ROLE='customer' 模擬——sb.from 寫入照擋 ✓、sbRaw 原生 ✓、loadShopMenu 14 豆 ✓。

## 〇、補記 — 2026-07-17 之十二（批發個別豆折扣 方案 B ✅ edge 已上線、前端待 push）
- **老闆拍板方案 B**：全店預設 % 照舊＋個別豆例外 %（空白＝用預設）。不同客戶不同折扣暫不做（老闆沒點頭）。
- **資料**：app_state `ws_discount` value 擴充 `{pct, overrides:{"<豆名小寫>":pct}}`——key＝豆名 trim+lowercase（同 edge flav map 慣例）。沒 overrides key＝行為完全同舊版。
- **wholesale edge v4 已 deploy（version 6）**：pct 讀取後解析 overrides（0-90 界內才收）＋`pctFor(bean)`＝override ?? 預設；menu 每豆（sizes+主價）與 checkout 每行重算都套 pctFor；beans[] 新帶 `discount_pct`＝該豆實際用的 %。歡迎彈窗的全域 % 字樣沒動（override 豆的實價在豆卡上是對的）。
- **前端（new/index.html Wholesale 抽屜）**：①讀 ws_discount 連 overrides ②Discount 格下加「Per-coffee override (%) — blank = default」列表（名單＝DB.syncs bean_id 去重＋濾 isSubName＋字母排序；每豆右側小 input，placeholder＝預設 %）③ws-save 收集：空白不存、超界（>90/負）toast 點名擋下整筆不存、value 存 {pct, overrides}。
- **驗證**：jscheck ✓；本機 stub——列表去重/濾訂閱/帶既有值 ✓、超界 99.5 擋下零寫入 ✓、存檔 payload {pct:20,overrides:{dancer:15,'dark knight':10}} 合併正確 ✓；**線上 edge v4 迴歸**（Chrome director 登入態呼 menu）：14 豆、現行 50% 照算、每豆帶 discount_pct ✓＝零破壞。
- **等老闆**：push 部署後在 Tools→Wholesale 給某支豆設個 override → 我再用 Chrome 呼 menu 驗證該豆 % 生效（其他豆仍預設）。⚠ 改折扣後批發客戶下一單就用新價（menu 5 分內可能有前端快取殘影，checkout 一律即時重算）。

## 〇、補記 — 2026-07-17 之十一（批發申請 portal 第一輪 ✅ 待 push）
- **老闆要的**：申請帳號的 portal（拍板選項 1＝批發客戶申請）。第一輪＝收申請的能力；**第二輪（未做）**＝Approve 一鍵開帳號＋寄設密碼邀請信（要動 edge＋app 加 PASSWORD_RECOVERY 處理——現在 app 完全沒有 recovery 流程，搜過 onAuthStateChange=0 處）。
- **DB**：新表 `wholesale_applications`（migration 同名；business/contact/email/phone/address/note/status new|approved|dismissed/created_at）。RLS 照 feedback 信任模型：anon+authenticated 只准 insert（欄位長度上限＋status 鎖死 'new'）、is_staff() 讀改刪。滲透測試過：anon 投遞 ✓、anon 讀回 0 ✓、anon 自標 approved 被拒 ✓。
- **前端六處**（new/index.html）：①loadAll append 申請查詢（**rs[22]**，只抓 status=new）→ `DB.wsapps` ②buildItems：director 彙總卡 `ws-apps`（pin、st:'Brief'、kind:'wsapp'、標題帶件數、s=前三家店名）③runAction wsapp→openWholesaleSheet ④openWholesaleSheet 頂部 Applications 區（每筆全欄位＋「Approved — account made」/「Dismiss」兩鈕＝只標 status 收單，資料留表；Dismiss 有 confirm；按完本地同步 DB.wsapps＋重畫抽屜）⑤`showApplyOverlay()`＋?apply IIFE（重用 fb-card 全套 CSS 零新增；防呆＝店名必填＋email 格式）⑥店面 renderPublicMenu 加「Run a cafe? Apply for a wholesale account →」連 /?apply（在 fb 連結上方）。
- **這輪的人工流**：老闆看到申請 → 照現行方式開帳號（Supabase Auth 建人 → Wholesale 抽屜 Make wholesale）→ 回抽屜按 Approved 收單。
- **驗證**：jscheck ✓；本機 serve 假資料（蓋 sb.from，⚠ 蓋 window.fetch 會讓 supabase-js 炸「Read-only」假錯、insert 攔不到——**以後攔 sb.from 別攔 fetch**）：表單渲染/防呆兩關/insert payload 六欄/感謝畫面/director 卡出 staff 卡不出/抽屜 Applications·2/Approve→update {status:approved} eq id＋重畫剩 1/店面連結——全過。線上表確認 0 列（測試無殘留）。
- ⚠ 本機 serve 複本瀏覽器有殘留 test@test.local session，boot 會走客戶門戶——測店面要手動呼叫 renderPublicMenu()。
- **buildItems 備忘**：結果存全域 `ITEMS` 不回傳（呼叫慣例 `buildItems();render();`）。
- **同日追加**：header 喇叭（#hbell 晨報重開鈕＋#hbdot 紅點）整顆刪除（老闆指示）。JS 的 updateBell/click 綁定原本就有 if(!el) 防護故只刪 HTML＋CSS；晨報每日自動彈不受影響，只是沒了手動重開入口（要復活從 git 撈這顆 button＋CSS 三行）。
- **同日追加③（訂閱卡兩方案形象圖）**：老闆給圖 ×2 → `new/sub-blend.jpg`（咖啡店插畫；原檔 ~/Downloads/ratio-cafe-960x960.jpg 1.5M，sips 品質 65 壓 390K）＋`new/sub-single.jpg`（手沖黑白照；ratio-pourover-960x960.jpg 269K 壓 93K）；shopSubCardHTML 按 `cur.plan` 切圖（width:100% 圓角 12、lazy）。**卡片排序老闆定版**：圖置頂 → pm-seg 方案切換 → Subscription title＋description → 價格行 → Add to cart。驗證：blend/single 圖切換正確、DOM 順序 img→seg→title→desc→dl→act ✓＋排版截圖 ✓。
- **同日追加④（header logo 換文字）**：#hbrand 的 .brandlogo（61px logo mask）拿掉，改兩行置中文字「Ratio.」（Fraunces 粗體）＋「Coffee is all we do.」（.brandtag muted）；.brandlogo CSS 刪除、.brand 加 text-align:center。**.bglogo 背景浮水印沒動**。二調（老闆嫌小）：整體放大＝Ratio. 21→**28px**、tagline 11→**14px**、padding 10→14px。三調（老闆選字型）：五款圓滑字體比較圖（Comfortaa/Quicksand/Baloo 2/Fredoka/Nunito）→ 老闆選 **Comfortaa**——fonts link 加 Comfortaa:wght@700、.brand font-family 換 'Comfortaa'（tagline 繼承跟著圓）；**只換 header，其他 Fraunces（卡片標題等）不動**。驗證：document.fonts.check ✓、430px 截圖 ✓。
- **同日追加②（手機禁橫擺）**：①manifest.webmanifest 加 `"orientation":"portrait"`（Android 安裝版 PWA 真鎖；**iOS 不理這個設定**）②`#rot-ov` 全屏遮罩「Please rotate your phone」——media query `(orientation:landscape) and (pointer:coarse) and (max-height:600px)`：pointer:coarse 限觸控機（桌機橫視窗不誤傷）、max-height 600 排除 iPad 橫擺。驗證：桌機隱藏 ✓、模擬橫擺（注入去 pointer 條件的同款 query）遮罩全屏＋排版乾淨 ✓、轉回直向消失 ✓。⚠ 真 iPhone 橫擺實測等老闆部署後轉一下手機。

## 〇、補記 — 2026-07-17 之十（Beans 紅燈卡直達豆 ✅ 待 push）
- **老闆加碼**：紅燈卡點擊不只開抽屜、還要直達那支豆。左紅卡帶 `data-brid`（roast uuid）→ `selQC` 預選＝QC 抽屜開起來該批判定直接攤開；中紅卡帶 `data-bkey`（`名字|procKey`，拼配尾巴空，公式照 paintPublishSheet 的 lk）→ `PUB.open` 預設＝Publish 該豆卡直接攤開。
- 注意：Publish 卡展開內容只給 lead（`open&&_mk`），staff 點中紅只會看到卡在最上、不攤開——原有權限規則，沒動。
- **驗證**：jscheck ✓；假資料 DOM：左紅點擊→selQC 對、判定區 Pass/Downgrade 就位；中紅點擊→PUB.open 對、Publish 抽屜開。
- **三調（同日追加）**：左紅再深一層——已杯測待判定（在 QCQ）直接進該批 **View/Edit**（openRecupSheet；back 回 QC 時 selQC 已預選、判定區攤開）；還沒杯測的（不在 QCQ、沒東西可 view）退 QC 抽屜按 cup。驗證：兩態假資料 DOM 各走對路（View/Edit · La Molienda ✓／QC 清單 ✓）。
- Dial in 同日連環調整（併入之九）：去 title/description、Grind 格放大（clamp 44-64px/步進鈕 60px）、標籤改「A68 Grind setting」＋升級 Fraunces title 字體、A68 整數刻度（步進 ±1、inputmode=numeric）。

## 〇、補記 — 2026-07-17 之九（Dial in 二次簡化：只剩四格＋拼配下拉 ✅ 待 push）
- **老闆指示**：Tools 版 Dial in 抽屜 tasting note 以後全收掉＋下拉只列拼配。現貌＝Grind 大格（−/＋）＋Dose/Time/Yield＋Coffee 下拉（`DB.blends` only）＋last 摘要＋Log dial-in。
- **收掉的**：Tasting note 欄（insert 不再帶 note，DB 欄位還在恆存 null）、Latest per coffee、Recent、Apply to brew guide（`applyDialinBrew` 整段刪除——要復活 `git show 35d3214^` 之前版本）。
- **沒動**：今日流卡片版 openDialinForm（單品 stale 卡照舊可調）、dialins 表、dlMeta/dlRatio（Recipe 抽屜近 12 筆 dial-in 顯示還在用）。
- **驗證**：jscheck ✓；假資料 DOM：下拉只剩拼配、四區消失、選豆帶上次數字、儲存後重開保持選豆。
- **三改（同日追加）**：Tools 版 title「Dial in」＋description 也拿掉（開抽屜直接 Grind 大格）；Grind 格再放大——字級 `clamp(44px,15vw,64px)`（64px 定值在窄屏會被 −/＋ 鈕裁字，clamp 後 375px 屏約 48px 不裁）、步進鈕 52→60px、hero padding 加大。卡片版 openDialinForm 標題（帶豆名）保留。

## 〇、補記 — 2026-07-17 之八（豆子編號顯示靜音：只留 ID book ✅ 待 push）
- **老闆定案**：全 app 顯示豆子時不再帶 S#/B# 編號，只有 ID book 保留。作法＝四個編號函式顯示靜音（`gNo`/`bNoFor`/`rNo`/`bNosForName` 一律回 ''），真編號改名 `gNoRaw`/`bNoRaw`/`rNoRaw`/`bNosForNameRaw`（目前只有 openIdBookSheet 用 gNoRaw；其餘 Raw 版備用）。35+ 處「(編號?編號+'·':'')」條件顯示自動消失，零逐處手改。
- **搜尋不受影響**：S#/B# 編號搜尋（Tools 搜尋 s13/b13）比對走原始欄位 `green_no`/`blend_no` 不經函式；搜尋結果兩處非條件式拼接（Green/Roast hits 的 t 與 det ID 行）已改掉。ID book 拼配區直接排 `blend_no` 也不經函式。
- **要恢復顯示**：把四個靜音殼刪掉、Raw 版改回原名即可（一豆一號制度沒廢，只是不上牆）。
- **驗證**：jscheck ✓；假資料 DOM：Dial in 下拉/Latest、Green stock 皆無編號，ID book S#00003/S#00013/B#00014 完好。

## 〇、補記 — 2026-07-17 之七（Dial in 抽屜改版：Grind 大格帶步進 ✅ 待 push）
- **老闆用 demo 選版**（三選一選了「Grind 帶加減鈕」）：Grind setting 獨大置頂（48px 大字、兩側 −/＋ 方鈕 ±0.1、`Math.round((v±0.1)*10)/10` 防浮點尾巴、空值起跳 0）＋下排 Dose/Time/Yield 三格並排大字＋Coffee 下拉移到數字下方。
- **共用版型函式 `dlgFieldsHTML(prefix,last)`＋`dlgBindSteppers(prefix)`**：卡片版 openDialinForm（prefix 'dl'、豆固定無下拉）與 Tools 版 openDialinSheet（prefix 'dls'）同一款。新 CSS class `.dlg-hero/.dlg-lab/.dlg-row/.dlg-step/.dlg-big/.dlg-grid/.dlg-cell/.dlg-num`（tint 格子語言仿 .ro-sum）。
- **沒動**：寫入邏輯（coffee 名＋target_id 認豆＋刪欄容錯）、loadLast 帶上次數字、tasting note、Latest per coffee/Recent/Apply to brew guide、下拉母體照舊 DB.beans+DB.blends（收斂成上架豆老闆未拍板）。
- **驗證**：jscheck ✓；本機假資料（攔 fetch）DOM 測試：步進 2.4→2.5→2.3、空值→0.1、選豆帶上次數字、卡片版預填＋無下拉，截圖乾淨。
- **同 session 順手查案**：①Beans 中紅誤報——Alo Bona Village 已上架但 product_sync 舊列 process=null，renderBeans 的 onShelf 嚴格雙鍵認不出（Publish 的 syncFor 容忍 null 所以顯示 On shelf）；修法＝onShelf 改用 syncFor，**未動工**。②staff 登入進不了 dashboard——Aaron 帳號（needmorecoffeebeans@gmail.com，7/14 建）role 還是 customer，開帳後沒去 Team→Accounts 指派角色；老闆自己在 app 改即可。

## 〇、補記 — 2026-07-17 之六（Beans 頁三燈重定義＋紅燈卡點擊跳修 ✅ 待 push）
- **老闆定案燈語意**（renderBeans）：左＝Cupping（紅=還沒杯測）、中＝Shelf（紅=還沒上架）、右＝全部完成才綠；**三顆全紅＝downgraded**（點擊行為老闆說晚點再議、先只顯示）。舊燈序 Roast→QC→Shelf 廢（左燈永遠綠沒資訊量、老闆也一直誤讀）。配燈：pending=`now,'',''`／pass 未上架=`ok,now,''`／上架=`ok,ok,ok`／downgrade=`now,now,now`。圖例同步改。
- **紅燈卡可點＝跳到出問題的地方**：左紅→openQCSheet（QCSEG 帶對 single/blend）、中紅→openPublishSheet；全綠與全紅不可點。
- **⚠ 誤解回退**：老闆最初說「紅色可以點到出問題的地方」我誤做成 Green stock 低量豆點擊直達 Receive——老闆打斷澄清是 Beans 三燈，該改動已 git checkout 回退未 commit。
- **驗證**：jscheck ✓；stub 四態（pending/pass 未上架/synced/downgrade）燈色與可點性全對、點左紅開 QC、點中紅開 Publish、截圖乾淨。

## 〇、補記 — 2026-07-17 之五（資料清理：14 筆 not-weighed 幽靈批＋重複批刪除 ✅ 老闆授權 SQL）
- **老闆問 Beans 頁一堆 not weighed yet 是不是 bug**：查證非程式 bug——`remaining_kg is null`＝這些批從沒秤熟豆入庫。其中 **Kiama AA 07-06 兩筆＝同鍋記兩次**（07-06 當天 Log roast 記一次＋07-08 又用 Add a past batch 補登一次，建檔時間戳為證）；Gatitu AA 07-03 同款。**根因：backfill 沒有同豆同日 dup 提醒**（拼配有、補登沒有）——老闆拍板「下次再出現我們再討論」＝防呆這輪不做，先只清資料。
- **老闆授權 SQL 刪除全部 14 筆** remaining null 批（5/19–7/6：April Project、Danche v2、Dark Knight、Dreamer、Dancer、Kii AB、June Project、Danche v1、Mwendi Wega AB、Alo Bona Village、Gatitu AA 空殼、Hakuna Matata 07-06、Kiama AA 07-06 ×2）。**生豆帳不動**（有 green_kg 的批豆確實烘掉了、扣帳正確；熟豆從未入庫故熟豆帳不變）。刪後驗證 remaining null 歸零。samples 杯測紀錄獨立表未動。
- **順帶**：老闆以為 not weighed 拼錯（→weighted）——weighed 才是對的（weigh 秤重；weighted＝加權），未改。

## 〇、補記 — 2026-07-17 之四（Green stock 血條列表改版＋0 kg 折底部 ✅ 待 push）
- **老闆嫌生豆列表看不懂，出三方案 mockup（A 血條列表／B 大字卡片／C 同比例橫條圖）老闆選 A**。openGreensSheet 重寫：每豆列（國家分組照舊）加一條血條——**同一把尺＝全豆最大量當滿格**（零設定、順便兼具 C 的誰多誰少比較）、正常 `--green`／低量 `--danger` 紅條＋`· low` 紅字、極小量最少畫 2% 看得到一絲；沿用 .hm-bar 容器。副標改 `bars share one scale · red = at or below the low line`。
- **0 kg 豆折底部**（老闆曾誤認同名多處理法＋0kg 是重複 bug——實為不同商品＋用完歸零，SQL 查證過）：`quantity<=0` 收進底部「Out of stock / on the way」區，灰字、無血條、**不算 low**（gs-sum 的 Low stock 計數排除 0kg）；點列照開 openGreenDetail。
- **驗證**：jscheck ✓；stub 仿線上真況（Finca Milan 多處理法＋低量＋0kg）→ 血條比例 29/3/100/30% 對全豆最大 ✓、Low stock=1（0kg 不算）✓、Out 區在底 ✓、0kg 列明細照開 ✓、全 0kg 極端不炸 ✓、手機截圖乾淨。

## 〇、補記 — 2026-07-17 之三（Receive green 全欄位開放＋kg 可 0 佔位 ✅ 待 push）
- **老闆點名**：①New bean 建檔開放**所有豆子檔案欄位**——原本只有 name/country/process，加 region/station/variety/harvest/altitude 五格（全 optional、DB 皆 text 欄已 SQL 確認）②**kg 可 0（空白＝0）＝先佔位子**——豆還沒到先建檔；0 kg 時**不寫 stock_moves**（帳上沒有量的變動）、activity_log 記 `booked green placeholder`、toast 'Booked ✓ placeholder — 0 kg'。kg 欄 label 標 `0 = placeholder`。
- **驗證**：jscheck ✓；stub——12 欄全在、全欄位＋kg 空白送出 → beans insert quantity:0＋五欄入庫＋零 stock_moves ✓；Existing lot 併批 30kg 照舊（PATCH 20→50＋stock_moves＋流水帳）✓。⚠ 佔位豆到貨後用 Existing lot 併批補量即可。

## 〇、補記 — 2026-07-17 之二（Coffee Stock 拿掉 Intake 鈕 ✅ 待 push）
- **老闆點名**：Coffee Stock 的「＋ Intake — add roasted stock」鈕移除（綁定＋openBackfillSheet 的 BF.from='coffee' 回流分支一併清）。**補繳熟豆入口剩**：Log roast 的 Intake·past 分頁（新版主線）＋QC 抽屜的「＋ Add a past batch」（照舊）。
- **驗證**：jscheck ✓；stub Coffee Stock 無 Intake 字樣、列表照常、QC 的 past batch 入口健在。

## 〇、補記 — 2026-07-17（debug＋瘦身：斷頭功能/死碼/孤兒 CSS 大掃除 ✅ 待 push）
- **老闆下令 debug＋刪沒用的＋瘦身**。python 掃描（scratchpad/audit.py：孤兒函式＝定義後全檔零呼叫、呼叫未定義、CSS class 零引用）＋逐一人工確認後刪 130 行：
  - **Bean rotation 整段刪（64 行）**：`openBeanRotSheet` 呼叫的 `beanSwapCalc`/`beanSwapSave` **根本不存在**（不知哪輪重構斷線）而且它自己也沒有任何入口（只自我遞迴）＝雙重死亡。連帶 `BEAN_SWAP` 變數與 **loadAll 的 bean_swap 查詢**一併刪——⚠ loadAll rs[] 是位置索引，刪查詢後 subs/actToday/blends 索引全體 -1（rs[19]/[20]/[21]，行內註解已更新），**已用探針假資料驗證三槽對位正確**。
  - **saveRoastSheet 刪（36 行）**：Log roast 改版後的 dead code，之前註明保留、這輪老闆授權清掉。
  - **孤兒 CSS 19 條**：.footline＋.fl-*（PLINE 舊橫幅殘留）、.qrow 系＋.qtoggle＋.qacts＋.qlink（QC 舊版滑動輪前的樣式）、.deck-btns、.pb-sub、.ro-loss-card（Log roast 卡片化後沒人用）。.qact/.deck/.qc-new 有人用、保留。
  - 誤報排除：`_sbFrom`（bind 形式定義，掃描 regex 沒抓到）、其餘「呼叫未定義」全是字串/註解/CSS 函式誤中。
- **驗證**：jscheck ✓；探針對位 subs/actToday/blends ✓；冒煙——feed/tools/Log roast/Coffee Stock/QC/Coffee Info 六畫面全開零錯誤、console 乾淨。檔案 835KB。

## 〇、補記 — 2026-07-16 之十一（Records 磁貼刪掉 ✅ 待 push）
- **老闆點名刪 icon**：Tools 的 Records（roast log · date / name）磁貼＋dispatch 移除。**順帶發現**：這磁貼本來就是壞的——`openRecordsSheet` 只有呼叫沒有定義（不知哪輪重構斷線），點了會 ReferenceError；刪掉正好。同排剩 Coffee Stock / Coffee Info（＋lead 的 Delete a coffee / Clean up）。
- **驗證**：jscheck ✓；stub Tools 頁 roastrec 磁貼消失、其餘磁貼照常。

## 〇、補記 — 2026-07-16 之十（Coffee Info 詳情頁改純唯讀 ✅ 待 push）
- **老闆點名**：Coffee Info 只讀咖啡資訊、不做任何 action——openShelfBeanDetail 的 ★ Star/Remove ★、Take off shelf/Put back on sale（setShelfSold 售罄切換）、Send back to QC 三顆鈕連 UI 帶綁定全刪（~70 行，git 歷史可撈），只剩 ‹ Back 與 Close。**入口轉移**：點星/售罄走 Publish 主線、退回 QC 重審在 QC 抽屜處理（賣光豆不在 Publish 清單——需要售罄切換時去 Square 後台或喊一聲再開入口）。
- **順手補**：詳情頁頂部「● Shelf · off shelf」紅字與豆名旁 B#（bNoFor）一併拿掉（上輪列表清過、詳情頁漏網）；sold/syncRow 變數清掉。烘焙日期＋天數熟成字樣**保留**（詳情頁結構是老闆定的、屬咖啡資訊本體）。
- **驗證**：jscheck ✓；stub locked＋paused＋sold 全開 → 三鈕/off shelf/B# 全不出現、名字/roasted 日期/雷達/風味照常、Back/Close 正常。（B# regex 誤中雷達圖 base64——假警報，UI 乾淨。）

## 〇、補記 — 2026-07-16 之九（Coffee Info 列表精簡：ID／On shelf 膠囊／roasted Nd 全拿掉 ✅ 待 push）
- **老闆點名**：openRetailSheet 的 rowHTML 三樣不顯示——①B#（bNoFor）豆名旁編號 ②On shelf / Off shelf 膠囊（sold/pill 邏輯一併刪，rtl_sold 記憶資料照舊給詳情頁用）③「roasted Nd — ready/aging/fading」新鮮度字樣（shelfFreshness 仍在，Coffee Stock 血條/詳情頁照用；四象限分區與烘豆日排序不變、只是不顯示天數）。副標剩：風味 features＋警示（no price / re-checking in QC / sold through / no info）。
- **驗證**：jscheck ✓；stub synced＋locked＋有批次 → 膠囊/roasted Nd/B# 全不出現、風味與 In stock 分區照常、截圖乾淨。

## 〇、補記 — 2026-07-16 之八（Coffee Stock 合併列拿掉「N roasts」標籤 ✅ 待 push）
- **老闆點名**：同日多鍋合併後顯示的「2 roasts」多鍋提示刪掉——openBatchesSheet 可賣批次列與降級區兩處移除；合併行為照舊（同日加總一列）、Pass ✓/Pending/>30d 標籤照舊。QC 待杯測卡的「N roasts」**保留**（杯測場景知道幾鍋有用，老闆沒點名那邊）。
- **驗證**：jscheck ✓；stub 同日兩鍋（可賣＋降級各一組）→ 合併列無 roasts 字樣、kg 加總對、QC 標籤照舊。

## 〇、補記 — 2026-07-16 之七（Roastery 統一工作台整台移除 ✅ 待 push）
- **老闆點名刪掉**（2026-07-15 才上的方案 A「豆子中心工作台」壽命一天）：本體 ~317 行整段刪（RWB/rwbMatch/roasteryRows/openRoasterySheet，git 歷史可撈，原地留墓碑註解）。
- **入口全改**：Tools 磁貼移除＋dispatch 刪；今日流卡 `rstlow`→Coffee Stock（RST.seg 帶 blend/single）、`qcnav`→QC 抽屜（=2026-07-15 前的行為）；DONE_TOOLS 拿掉 'Roastery'。
- **返回動線簡化**：backToStock/backToQC/backToInfo 不再分流，一律回舊三抽屜（NAV_SRC 旗標保留備用）；openBackfillSheet 的 `BF.from='roastery'` 回流分支刪。
- **驗證**：jscheck ✓；grep 零殘留；stub——Tools 頁無 Roastery 磁貼、Coffee Stock 磁貼照常、rstlow/qcnav 卡分派開對抽屜、backTo* 全對。

## 〇、補記 — 2026-07-16 之六（Deduct 兩段簡化：不問 reason → 選批整批全清 ✅ 待 push）
- **第一段（老闆點名）**：扣咖啡不問原因——Why 區塊（Defect/Transfer/Other chips＋Transfer to 去向欄）整塊拿掉。RSTD 拿掉 why 欄。
- **第二段（老闆再點名）**：**kg 也不用填——選批＝整批全部刪除**。deduct 模式 kg 欄隱藏（`rd-kgwrap` 只給 Fix kg 用）、按鈕 label 帶量 `Deduct — remove whole batch · N kg`、按下 confirm 一次（防誤觸）→ 該日期組**所有鍋 remaining_kg 歸零**。烘焙紀錄/QC 歷史保留＝**不刪 roasts 列**（confirm 文案也講明 Fix kg 可救回——歸零後批次從 Coffee Stock 消失，要救去 Coffee Info History 或 Fix kg 前先想清楚）。activity_log 記 `deducted roasted · whole batch · N kg · 日期`。Fix kg 分頁照舊（typo 修正仍可填精確數字）。
- **驗證**：jscheck ✓；stub——kg 欄 deduct 模式隱藏/fix 模式出現 ✓、confirm 文案 ✓、10/07 組兩鍋(3+2)全歸零且 12/07 批不動 ✓、流水帳 whole batch ✓。
- **第三段（老闆再點名）**：「‹ Back」與「Deduct · N kg」**並排一列**（同 Log roast Add/Submit 排法，Back flex:1 / Deduct flex:1.6、短版 label 帶批量）；Close 照舊在下。stub 驗同列同高 48px ✓。

## 〇、補記 — 2026-07-16 之五（Coffee Stock 展開列大掃除：提示行以下全清 ✅ 待 push）
- **老闆點名**：「tap a batch row → deduct that exact roast date」提示行以下全部清掉——openBatchesSheet 展開列的 Cup it in QC chip、★ Star chip、Send back to QC chip、Target/Low 設定列、Roast this →／Blend this → 主鈕全移除，**展開列只剩批次列表**（可賣/降級/待秤三區）。對應死綁定（rst-cup/rst-star/rst-sbqc/rst-sv/rst-go 五段）一併刪，舊實作 git 歷史可撈。
- **行為保留**：點批次行扣量（data-bat/data-dgbat → openRstDeduct）、點待秤行補秤（data-pdbat → openWeighIn）、收合列「−」快速扣、頂部 Intake 鈕照舊。**功能入口轉移**：點星/送回 QC → Coffee Info 詳情或 Roastery 統一台；target/low 設定 → Roastery 統一台（openRoasterySheet 那份同款 UI 未動）；Roast this → 血條行動鈕。
- **順手修**：豆名列 dg/no info/to weigh 多標籤同現時互相重疊（既有 bug）——外層 row 加 flex-wrap:wrap，標籤多時換行。
- **驗證**：jscheck ✓；stub 全提示齊發 → 五個元素全不出現、批次三區照常、點批次行扣量抽屜照開、標籤換行不疊、截圖乾淨。
- **老闆點名**：Coffee Stock 每支咖啡的 status 膠囊（On shelf / ★ On shelf / Off shelf）拿掉——上架狀態去 Coffee Info 看（那邊的膠囊不動）。openBatchesSheet 列 render 刪膠囊一行；rstRows 的 x.sync/x.locked 計算保留（Roastery 統一台等共用）。「no info — cup it」警示與 dg/to weigh/低量提示照舊（庫存資訊非上架狀態）。頂部「kg on shelf」總量字樣照舊。
- **老闆再點名 ID 也拿掉**：豆名旁來源生豆 gNo（S#/G#）＋展開批次列（可賣/降級/待秤）的 rNos/rNo（R#）全部不顯示——批次列剩「日期 · 天數 · QC tag · kg」。只拿顯示，rNo/rNos/gNo helper 與 roast_no 資料照舊（QC/Roastery/扣豆對帳還在用）。
- **驗證**：jscheck ✓；stub 有 synced＋locked＋roast_no 資料 → 膠囊與 R#/G# 全不出現、批次/降級/待秤列照常、截圖乾淨。

## 〇、補記 — 2026-07-16 之三（Log roast 環境窗口：天氣/濕度/氣壓 ✅ 待 push）
- **老闆點名**：Log roast 上面顯示目前位置天氣、氣壓、濕氣（烘豆環境條件）。抽屜副標下一條 tint 橫條（`#ro-wx`）：「天氣 icon＋°C · % RH · hPa」，兩分頁都看得到。
- **實作**：Open-Meteo（免費免金鑰，`api.open-meteo.com/v1/forecast?current=temperature_2m,relative_humidity_2m,surface_pressure,weather_code`）；位置走 `navigator.geolocation`（timeout 3s、拒絕/失敗退**雪梨座標** -33.87,151.21）；**15 分鐘快取**（`ROWX` 模組變數）開關抽屜不重打；抓不到整條隱藏不佔位（stub 環境即此路徑）。`roWeather/roWxIcon/roWxFill`，paintRoastSheet 尾端非同步填。只顯示不寫入 roasts。
- **驗證**：jscheck ✓；stub 餵 ROWX 渲染 ✓、失敗隱藏 ✓、快取只打一次 ✓；真 API curl 雪梨實測回傳格式吻合（13.8°C/92%/1025.2hPa/code53）。⚠ 真機第一次會跳定位權限——拒絕也能用（退雪梨）。

## 〇、補記 — 2026-07-16 之二（Log roast Blend 分頁也卡片化＋Add/Submit 並排 ✅ 待 push）
- **並排（老闆點名）**：兩分頁底部統一「＋ Add」（虛線）＋「Submit N batches」（act 主鈕，短版 label——單行放得下 375px）並排；`ro-save`/`saveBlendBatch` 廢，submit 鈕依 mode 分流 `submitRoastSession`/`submitBlendSession`。
- **Blend 卡片化（老闆點名同格式）**：`RO.bb=[{name,out,amt}]` 一鍋一卡（`roBlendCard`）＝blend select＋成分比例列（聯動/short 提示照舊、per-card scope `data-bc+data-bp`、hint id `ro-bps-卡-成分`）＋琥珀 Roasted total（小數 1 位）；兩格總計（Batches/Roasted）；▲▼✕ 換序刪卡；日期照舊整個 session 一欄（`ro-date` 只在 blend）。`submitBlendSession` 多鍋迴圈＝每卡 insert kind='blend'+recipe 快照→`consumeBlendParts` FIFO 扣成分（含舊庫無 kind 欄 fallback、dup 日期 confirm 一次列全部、short 匯總一個 alert）。blend 不進 roast_draft（照舊）。
- **驗證**：jscheck ✓；stub——60/40 聯動（1.2→0.72/0.48、成分 1.8 反推 total 3）✓、short 提示 ✓、兩卡 submit payload（各 insert＋跨卡連續扣同一成分批 4→3.52→1.52）✓、single 回歸（共用按鈕分流後 add/del/submit 全鏈）✓、手機截圖乾淨。⚠ stub 踩雷：submit 後 `reload()` 會把 DB.blends 清空——重測記得重塞假資料。

## 〇、補記 — 2026-07-16（Log roast 輸入改版：Roast today / Intake 雙模式＋一鍋一卡 ✅ 待 push）
- **老闆點名畫面亂，重做 Log roast 單品輸入**（Blend 分頁不動）：pm-seg 下加 Roast today / Intake·past 第二層切換；下方三格總計（Batches / Green / Roasted，數字小數 1 位、不帶 kg）；一鍋一張粉底卡（`.ro-batch`）就地編輯＝Batch 1..N 由上往下，卡頭 ▲▼✕ 換序/刪、卡內豆 select＋Green（綠框）/Roasted（琥珀框，`--green`/`--roast` color-mix）＋每列即時 loss；`＋ Add batch` 加卡；全部填完 Submit 才亮。
- **硬性驗證（不再 confirm 放行）**：熟豆必填>0、生豆不能 0（roast 必填；intake 選填、有填須>0）、roasted 必須 < green（intake 生豆空免驗）、intake 每鍋必填日期——違規卡上紅字＋Submit 灰。原「待秤/no roasted-out」confirm 移除（熟豆改必填，`rstPendingBatches` 待秤池只剩歷史批會進）。
- **寫入分流（submitRoastSession）**：roast＝照舊 insert roasts×N＋同豆聚合一次扣 beans＋每鍋 stock_moves，roast_date 一律今天（單品日期欄拿掉，`ro-date` 只剩 blend 用）；**intake＝只 insert roasts**（每鍋自帶 roast_date、green_kg 有填才寫、不碰 beans/stock_moves——同 backfill 語意，老闆 07-16 拍板）。insert 依卡序＝R# 跟 Batch 1..N。
- **周邊**：曲線四格（charge/fc/drop/dur）整段移除（老闆拍板；`saveRoastSheet` dead code 照舊保留）；`roastAddBatch/roastEditBatch` 刪、新 helpers `roEmptyBatch/roFillBatch/roBatchWrong/roBatchDone/roSummary/roSubmitLabel/roRefresh/roBatchCard/roFmt1`；訂單 chip 與 `openRoastPreset` 改 `roFillBatch`（填第一張沒豆的卡）；草稿 `roast_draft` 改存 `{entry,batches}`（load 相容舊格式、舊 session date 給沒日期的列）。
- **⚠ 測試踩雷（重要，覆蓋舊認知）**：`sb` 是 **const**——載入後蓋 window.sb / window.fetch **都攔不到**（supabase client 建構時已綁原生 fetch）。正解＝**serve 測試複本在 supabase-js `<script>` 之前插 fetch hook**（載入前注入；本輪 python 對複本 replace 注入）。曾誤以為攔到而點 submit 直打線上，幸 RLS 擋未登入寫入（SQL 查證 roasts/app_state 零污染）。另 app 寫入層有 Read-only 護欄，stub 測試要先設 `ROLE='director'`。
- **驗證**：jscheck ✓；stub 全過——roast 兩豆三鍋 payload（聚合扣豆/每鍋 stock_moves/日期今天）✓、intake 兩鍋（各自日期/生豆留空不寫/零 beans/零 stock_moves）✓、驗證規則紅字＋灰鈕 ✓、▲▼✕/Add/總計即時/blur 格式 6→6.0 ✓、模式切換保值 ✓、blend 回歸（日期欄仍在、成分列照舊）✓、手機 375px 截圖乾淨。**push 待老闆 GitHub Desktop**，之後 curl 比對 deploy。

## 〇、補記 — 2026-07-15（Line 改回彈窗＋分頁標題/favicon，commit a6183f0 待 push）
- **Line 生產線介面改回彈窗**：老闆要「底部 Line 鍵點下去是彈窗不是頁面」。還原 abfea6e（那次把 popup 改成整頁 view），改回 `PLINE.open/close` 彈窗 overlay（`#plview` top:0/z-index:29＋`plhdr` 標題列×）；**不**把 abfea6e 順手清掉的舊橫幅死碼 `renderFootLine` 加回來。nav-line→`PLINE.open()`、其他 nav 鍵按下先 `PLINE.close()`
- **分頁標題動態化**：boot() 設 document.title——未登入 renderPublicMenu／登入 customer|wholesale＝`Ratio Coffee - Shopping Cart`；員工 view=feed＝`Ratio Coffee`；HTML `<title>` 預設也改 Ratio Coffee（原 Ratio · Today）。⚠ `?shop` 其實沒程式判斷，購物頁＝未登入/customer，標題綁身分不綁參數
- **favicon**：新增根目錄 `favicon.png`（#E7EAEE 底＋logo，192pt@2x=384px）；head 加 `<link rel=icon href=/favicon.png>`。⚠ **生成踩雷記**：瀏覽器 canvas toDataURL 那版寫出**全透明空圖**（看不到）＋長 base64 經 shell 搬運會**重複錯段**；最後改用 `osascript -l JavaScript` + AppKit（NSImage lockFocus/drawInRect→NSBitmapImageRep PNG）純命令列合成才穩，腳本 `scratchpad/mkicon.js`（pad=10 邊距＝logo 較大版）
- **待老闆拍板**：PWA 主畫面圖示（`apple-touch-icon` 仍指舊 `icon-192.png`）要不要一起換新款；commit 已做（老闆授權），**push 待老闆開 GitHub Desktop 按 Push origin**

## 〇、補記 — 2026-07-14 晚（豆況三態簡化：Pending / Pass / Downgrade ＋ ★ ✅ 全四 commit）
- **老闆拍板**：豆況簡化成三態＋附屬星標——烘完/手動入庫＝Pending、QC 過＝Pass、沒過＝Downgrade；Pass 可加 ★（＝可 publish 的豆）。**零 schema 改動零搬家**：qc 欄本來就是三值；★＝flavour_locked 重塑（語意不變「在賣的版本」、同名同處理法互斥單選）；legacy 'reroast' 讀取一律視同 downgrade、永不再寫入。roasts.status（pending_cupping/cupped）降為幕後流程欄（只餵 toCupList）。
- **Commit ①（4ee6c1a，老闆 GitHub Desktop 收的）**：helper `qcState(r)`（null→pending/pass/其餘→downgrade）＋`starSample(s,quiet)`（加星唯一入口：換星 confirm 把關、quiet＝push 用不問、回 {ok,swapped}，寫入走 lockFlavourSolo）；九處散寫 `!=='reroast'&&!=='downgrade'` 全改 qcState（rstBatches/rstDgBatches/rstPendingBatches/批次孤兒/Clean-up C+D/配方降級優先排序/announce 閘門併一條/兩處 send-back confirm）。**reroast 批現身降級池＝刻意（原是幽靈庫存）**。
- **Commit ②（66d12b1）**：qcVerdict pass **不再自動鎖**（刪換鎖 confirm/自動 lockFlavourSolo/qcSwap 開抽屜；同日連動蓋 qc 保留）；toast 引導（有星 mate→'★ stays on the current batch'、無→'List on Square to publish'）；QC 台去鎖頭（swipe → pass、Pass 鈕）。**上架 push＝自動星**：新上架必星（starSample quiet，抽屜固定顯示說明無開關）、更新模式沒星才給 ★ toggle（預設開、關掉 push 會 confirm）、requeue 一律不星（黃字）。老闆動線 pass→List→push 步數不變。
- **Commit ③（5a23144）**：★ 入口三處——openShelfBeanDetail（`· ★`/`☆ not starred`＋`★ Star · set as selling version`（最新批 pass 才出、swapped→直開 List Update 抽屜＝原 qcSwap 體驗搬家）＋`Remove ★`（confirm 警告失去 publish 資格））；Coffee Stock（膠囊 Live ★/No ★、批次 tag 三態 Pass ✓/Pending、`★ Star` chip）；LOCKQ→STARQ 孤兒卡（條件加 `!lockedMate(s)` 防「新批 pass 未星+舊批有星在賣」誤觸；文案 Add ★；**openLocksSheet 改走 starSample＝順手修裸寫 flavour_locked=true 沒互斥的 bug**）。
- **Commit ④**：publish 閘門綁 ★——announceShelfBean 沒星**硬擋**（原軟警告；no QC pass 留軟警告當異常偵測）；passedBeans 加星過濾（**⚠ 星檢查在 seen 去重前**——最新沒星/較舊有星的豆否則會漏）；Publish 面板膠囊 ★ Starred、Coffee Info 四象限 Pending 區 'no ★ yet'、Clean-up 等文案統一。Publish 面板母體本來就是 flavour_locked 過濾＝邏輯零改。
- **Edge 四支零改**（public-shop/public-bean 讀同一欄，星＝鎖自動一致）。現有在賣豆＝pass+locked＝Pass ★，上線零影響；歷史硬推未鎖豆由 STARQ 卡接住。
- **驗證**：每 commit JXA 語法 ✓＋serve 複本假資料 DOM（攔 window.fetch）✓ console 零錯誤——qcState 五值/三池分流/reroast 進降級池/announce 三劇本/starSample 搶星-取消-quiet/pushListToSquare 三模式/STARQ 防誤觸/互斥點星/詳情兩態鈕/膠囊 tag chip/passedBeans 去重陷阱。⚠ **真機還沒掃**：老闆 push 部署後掃一輪（QC 右滑 pass→List 卡→push 自動星→Publish 面板 ★；Coffee Stock 膠囊）。
- ⏭ 可選收尾：老闆若要「先手動點星才出 List 卡」嚴格版＝改 LISTQ 條件一行。
- **同 session 追加（線上資料操作）**：①Live→On shelf 文案改名（672154e，四處：Coffee Stock/Coffee Info/Publish 膠囊＋上架 toast）②Alo Village Cold Fermentation 處置（老闆拍板三輪，最終態）：43 天老豆剩 4.2kg 掛 Off shelf → 一度改名 'Just for brew'（內用豆）→ 老闆聽完「零機制純手動標籤」後拿掉 → 我誤把 remaining_kg 歸零被老闆糾正（**Coffee Stock＝庫存帳，只能靠扣豆減少，見記憶 business-data-boss-operates**）。**現況＝roasts 批（51121af0）原名 Alo Village CF、4.2kg、qc=pass 原封**；product_sync CF 列已刪（不在菜單；⚠ Square 後台商品本身還在，老闆有空去刪）、rtl_sold 已清。**後續老闆自己在 app 手動操作**（他明示「不然會亂掉」——業務資料以後不准 SQL 直改）。副作用已告知：pass＋有貨＋沒上架＝今日流會出 List 卡（老闆自行左滑睡掉或標 Downgrade）。若未來要做「過賞味自動轉內用」機制：新鮮度線 21/42/60 天全是純顯示，可掛提醒卡＋一鍵轉（老闆這輪沒要）。
- **⑧staff 權限矩陣重構（老闆拍板：staff 八站可讀可寫＝Roast/QC&Recipe/Orders/Customers/Daily task/Team/Print/Setting；Green/Marketing/Finance 看不到）**：①`canWrite()` 放寬＝`isLead()||ROLE==='staff'`（staff 從全面唯讀變八站可寫：QC 判定/Log roast/開單/秤重/扣豆/任務/公告/標籤全開）②Marketing/Green 的 17 個 canWrite 呼叫點升級 `isLead()`（sb-star/sb-sold/rst-star/Social images/換豆照/Publish 面板/announce/上架 push/Sample analyse/Buy log ×4/派工 asg-go）③四個無 gate 敏感抽屜補 `if(!isLead())` 擋（openReceiveSheet 收生豆/openStocktakeSheet 盤點/openDeleteCoffeeSheet 刪豆/openCleanupSheet——原本只靠 sb.from Proxy 護欄,canWrite 放寬後會漏）④Tools：Green 區＋Marketing 區整區 isLead 才畫、Roast 區 Delete a coffee/Clean up 磁貼 _mk→isLead、Print 區 Social Images 磁貼 isLead 才出 ⑤今日流卡 roles 加 'staff'：roastdem/qcnav/rstlow/rstover/fb（回購群發 ng 留 director）⑥首頁磁貼：roast 加 staff、marketing 拿掉 staff。驗證：三視角——staff＝八站可寫+QC 可判+五敏感抽屜全擋+Green/Marketing/Finance 磁貼與 list 卡全隱形；lead/director 全開；console 零錯誤。⚠ 註：'roaster'/'retail' 是舊角色名（新帳號指派不出），roles 陣列殘留無害。
- **⑦Timesheet 排班抽屜的「Past weeks & pay →」入口刪除（老闆點名）**：排班歸排班、薪資走 Tools→Payroll 磁貼（本體 openPayrollSheet 與 finance 常駐卡不動）。驗證：排班抽屜無該鈕、Save 照舊、Payroll 磁貼路照開、console 零錯誤。
- **⑥「Starred」詞彙退役（老闆定調「不用 Starred，全部標記 ★ on shelf，前面一樣」）**：有星的統一標「★ On shelf」（★ 一律在前）——Publish 面板膠囊、Coffee Stock 膠囊（原 On shelf ★ 換序）、List 卡 det、兩處空狀態、Publish 副標、announce 硬擋文案、加星 toast（★ on shelf ✓）、logAct（★ added）。全檔 Starred/starred 字樣歸零（客人 feedback 評分星不算）。驗證：兩膠囊 ★ On shelf ✓、console 零錯誤。
- **⑤熄燈膠囊退役（老闆定調「沒有 highlight 的 on shelf 也不是我的機制」）**：Coffee Info 膠囊的 `.pill.off` 中間態刪（原設計＝豆在 QC 重審中膠囊熄燈當催辦）——膠囊純兩態：On shelf（亮）／Off shelf（紅），inQC 不再影響膠囊；CSS `.hit .k.pill.off` 定義一併刪。行內黃字「re-checking in QC」資訊保留（文字資訊非曖昧狀態，老闆沒點名；他嫌的話下輪刪）。驗證：Dark Knight 情境（在賣＋一鍋 pending 在佇列）膠囊全亮、off class 零殘留、console 零錯誤。
- **④QC 同日連動退役（老闆定調「任何豆子要過 QC 都要手動，不能 assume」——覆蓋 07-12 的同日合併）**：qcVerdict 的 mates 迴圈刪＝判定只寫這一鍋；配套 buildItems QCQ 從「每豆一個代表鍋（matchRoast）」改**逐鍋列隊**（該豆所有未判定有庫存的鍋全列、一鍋一列、舊→新先烘先判；配對照 matchRoast 條件：ID 優先/名字+處理法雙鍵/舊資料無 process 容忍；同名不同處理法不混）。不改佇列會出幽靈 Pending（matchRoast 配到已判鍋、其餘鍋永不現身）。QC 防守線盤點：寫 pass 全檔僅 qcVerdict 一條路（按鈕/右滑），烘豆/補入庫/上架/edge 全不碰 qc；新批一律 qc=null=Pending。驗證：三鍋逐判各自獨立、佇列依序消列、全判完 List 卡才出、抽屜畫 3 列、異處理法不混、console 零錯誤。
- **③「No ★」警示機制整個退役（老闆定調「我沒有 no star 的機制」——沒星不是狀態，星＝Pass 之上可選附屬品，系統不催星）**：STARQ/Add ★ 聚合卡＋openLocksSheet 整個刪（LOCKQ 佇列、runAction 'locks' 分派一併）；Coffee Stock 膠囊收成貨架兩態 On shelf（有星帶 ★，一律玫瑰底）／Off shelf（琥珀 No ★ 第三態刪）；展開區「On Square but no ★」黃字刪；詳情頁「☆ not starred」刪（沒星＝不顯示）；Coffee Info「no ★ yet」刪＋分區名 'Pending — ★ when you list it'→'Not listed yet'（避開豆況 Pending 撞名）。**點星操作入口保留**：Coffee Stock ★ chip＋詳情頁 Star/Remove 鈕。publish 閘門仍認星（Publish 面板/announce/passedBeans 不變）——沒星的豆單純不出現在 publish 候選，想發就去點星。Hakuna Matata（synced 沒星、兩鍋 pending）＝老闆自己去 QC 判＋點星。

## 〇、補記 — 2026-07-15 之二（Folding Info Card 升級：四格各自選豆 ✅）
- **老闆需求**：A4 田字格的左上/右上/左下/右下四張卡**各自選豆**（原本只能單豆 ×4），第二頁（背面）跟著換。
- **改動（new/index.html）**：①`openInfoCardsSheet` 改四槽位 UI＝2×2 select（Top left/Top right/Bottom left/Bottom right，母體 passedBeans，「— empty —」＝該格留白）＋「Same coffee in all four」快速鈕（＝舊單豆行為）＋Download PDF ②原 `openInfoCardPrint` 拆兩段：`infoCardFaces(s)`＝單豆的 {cover,info} 卡面 HTML（fetch full row/雷達/明細全在此，同豆多格 cache 共用一次）＋`infoCard4Pdf(slotIds)`＝四格組裝＋html2pdf 下載（版式/CSS/html2pdf 參數零改動）。舊函式名 openInfoCardPrint 已移除（唯一呼叫者就是這抽屜）。
- **⚠ 鏡像關鍵**：第一頁（雷達＋明細面）照 [左上,右上,左下,右下]；第二頁（封面＋QR 面）排 **[右下,左下,右上,左上]**（左右＋上下都對調＝旋轉 180° 排列；老闆 07-15 指示第二頁下方跟上方對調），裁開每張卡正反才同一支豆。四格同豆時鏡不鏡像無差＝向後相容。**若老闆真機印出正反對不上＝印表機雙面翻頁邊（長邊/短邊）與假設相反，回報再調**。檔名：單一豆 `infocard-<slug>.pdf`、混豆 `infocard-4up.pdf`。
- **雙鍵補洞（07-15 老闆點名查核）**：infoCardFaces 的 full row 查詢原只比豆名（承自舊 openInfoCardPrint）——同名多處理法會抓到別支的鎖定風味；已補 `.eq('process',s.process)`（有 process 才加）。後續老闆下令「print 裡面的都要」→ 新共用 `fullSampleQuery(nm,proc)`（ilike 寬鬆＋proc 空不加，照 07-13 openListSheet 先例），七處全接：infoCardFaces（摺卡）/openPromoSheet（IG asset）/socialSplitPick（Social Images）/openSocialPostBean（FB+IG，+proc 參數，兩呼叫端 Publish 傳 x.s.process、picker 傳 shelfSampleFor）/uploadCardForBean（信件卡，+proc 參數，announceShelfBean 傳 s.process）/openListSheet（原有雙鍵改走 helper）/openCardPreview（QC 卡預覽）。**不補**：uploadCardsFor（出貨信訂單卡圖——訂單品項只記豆名無處理法，資料模型限制，同名多處理法時仍鎖定優先）、兩處改名 update（名字級是刻意）。驗證：jscheck ✓、preview 攔 fetch 抽測四管線查詢皆帶 process=ilike ✓、console 零錯誤。
- **驗證**：jscheck ✓；preview stub（攔 fetch＋假 html2pdf 捕 DOM）——四 select/選項對、同名雙處理法各自成列＋查詢 URL 各帶 process=eq.✓、混排 [Kiama,Danche,空,Kiama] → page1 照排＋page2 [Danche,Kiama,Kiama,空] 鏡像 ✓、空格 BLANK ✓、Same in all four 全填 ✓、全空按 Download 被擋 ✓、console 零錯誤、抽屜截圖乾淨。⚠ 真機雙面列印一張驗正反對位（老闆自測，對不上回報調鏡像）。
- **同 session 順帶**：診斷 Post to FB+IG 401＝session 已在伺服器端登出（auth log 有 logout 事件、`session doesn't exist`），非 Meta 連線問題——重新登入即復原；建議 callFn 401 人話提示未做（老闆沒回覆）。

## 〇、補記 — 2026-07-15 之二十（Roastery 統一工作台：四抽屜豆子中心一站式 ✅ commit 67d7c4b，待老闆 push）
- **老闆需求＋拍板**：烘焙生產線查一支豆要跳四個抽屜（Log roast/Coffee Stock/QC/Coffee Info）太複雜——方案 A「豆子中心工作台」；磁貼並存不刪；今日流卡改開新台。
- **新 `openRoasterySheet()`**（openRoastDateSheet 後、Backfill 註解前，+~250 行）：一支豆一列＝血條＋★/On/Off shelf 膠囊＋**「N QC」徽章**（待杯測+待判定合計）＋to weigh/dg 標；展開四段＝a)QC 段（In hand 同日合併→openCupSheet；To judge 滑卡 attachQcSwipe＋判定泡泡 View/Edit·Stock·Date·Pass/Downgrade，選中態 RWB.selq）b)批次段（可賣/降級/待秤三池，照 Coffee Stock 同款 markup，data-rwb* 前綴）c)資訊摘要（fresh+風味前 3 詞+country＋Details›→openShelfBeanDetail）d)動作列（Send back to QC／★ Star／Take off·Put back（isLead）／Roast this）。頂部 gs-sum 三格（kg/to QC/to weigh）＋常駐 Log roast 鈕＋Blends/Singles 分頁（RWB.seg，獨立於 RST 不互踩）＋Intake（BF.from='roastery' 回流）。
- **聚合 `roasteryRows(isBlend)`**＝rstRows 加掛 qcq/tocup/qcN/fresh/rep（QCQ 與 toCupList 的豆必然已在 rstRows 名單——兩者都要求 remaining>0 或落待秤池，孤兒兜底接住）；配對 `rwbMatch`＝拼配名字級/單品 bean_id 優先/退名字＋procKey 雙鍵/roast 無 process 容忍（照 matchRoast 慣例）。零新查詢零 schema 改動，寫入全走既有函式。
- **返回動線 `NAV_SRC`**（closeDrawer 後）：backToStock/backToQC/backToInfo 三 wrapper——統一台進來回統一台、舊抽屜進來照舊回家；openRoasterySheet 設 'roastery'、三舊抽屜開頭清 null。**改接 16 處**：qcVerdict 尾（有 drawer.show 守門，今日流卡路徑不變）、Cup 存檔 ×2、QcStock ×2、RoastDate ×2、WeighIn ×2、Deduct ×5、sb-sold/sb-back、Backfill 加 roastery 分支。
- **磁貼/分派**：Tools Roast 區首位 `['Roastery','one bench · roast to shelf','roastery','flame']`（舊四磁貼全留）＋dispatch＋DONE_TOOLS；今日流 rstlow→RWB.seg+openRoasterySheet、qcnav→openRoasterySheet。
- **驗證（serve 複本 stub 攔 fetch＋假 localStorage session，console 零錯誤）**：同名雙處理法各自成列（CF 4kg 1QC／WH 5kg ★synced 1QC+1dg+1 to weigh）、判定 Pass=PATCH 單鍋+回統一台+徽章消、**舊 QC 抽屜判定留在 QC（迴歸 ✓）**、扣豆 0.5kg 選批 PATCH 對、秤重 8.6kg PATCH 對、Take off payload 帶 process+rtl_sold '@' 雙鍵、Cup 開 B# 抽屜、Details↔Back、Intake BF.from、qcnav 卡/磁貼開新台、拼配池。
- **⏭ 老闆**：GitHub Desktop push → 真機掃一輪（Tools→Roastery：展開豆、滑卡判一鍋、扣一次豆、Details 進出）；用順了下輪再議收舊磁貼。

## 〇、補記 — 2026-07-15 之十九（Add account 磁貼：開帳號直達入口 ✅）
- **老闆要「可以申請帳號的 icon」**：`openAddAccountSheet`（缺口 #9 自 classic signUp 移植，走獨立 client persistSession:false）早就做好，只藏在 Team 抽屜的「+ Add account」按鈕。本輪加 Tools 磁貼直達。
- **改動（new/index.html）**：Team 區磁貼行尾 `.concat(ROLE==='director'?[['Add account','new sign-in','addacc','user',1]]:[])`（**director 專屬**——開帳號權限高於 lead）＋dispatch `if(k==='addacc')openAddAccountSheet()`。openAddAccountSheet 本體零改動（back 仍回 Team，帳號設角色在那）。
- **驗證**：jscheck ✓；preview——director 見磁貼「Add account · new sign-in」點開進抽屜、retail 角色磁貼隱藏（權限 gate 對）、console 零錯誤。⚠ 真開帳號要 email confirmation（signUp 後 session null，toast 提醒確認 email），新帳號 role 走 DB 預設＝customer，去 Team Accounts 點 chips 指派角色。

## 〇、補記 — 2026-07-15 之十八（瘦身＋bug/孤兒審查 ✅）
- **孤兒掃描**（596 函式）：純孤兒只有 `rsRangeLbl`（8911，排班標籤定義了沒呼叫）＝已刪；`init` 是 IIFE 啟動入口非孤兒；低引用 30 個全是 addEventListener 引用/dispatch 觸發＝正常。codebase 很乾淨無死碼堆。
- **瘦身**：`beanIdFor`/`bNoFor` 前半「解析豆」邏輯 100% 重複 → 抽共用 `resolveCoffee(nm,proc)`（回 {kind,obj}），兩者各自只做格式化（id vs B#）。`bNosForName` 語意不同（列全部同名 S#）保留獨立。
- **bug 修**：`resolveCoffee` 首行 `if(proc==='')proc=undefined`——原 beanIdFor/bNoFor 傳空字串會走「找 process 為空的特定豆」與名字級語意不一致的隱藏陷阱，統一折成名字級。
- **審查結論**（代理＋自審）：syncFor/matchRoast/itemBeanRef/雙路「ID 優先退名字級」邏輯確認無 bug；後半 helper（consumeBlendParts/greenForPart/blendPartPool/blCostPerKg/dot*/fullSampleQuery/buildItems 需求卡）本輪改時都各自 stub 驗證過。
- **驗證**：jscheck ✓；preview——resolveCoffee 重構後 beanIdFor/bNoFor 六情境（單品/拼配/名字級歧義/唯一/空字串/認不出/無號）行為與重構前完全一致、空字串陷阱修復、bNosForName 回歸對；console 零錯誤。

## 〇、補記 — 2026-07-15 之十七（🔴④product_sync 認 ID：上架/下架/查狀態全走 target_id ✅，含 edge v29）
- **老闆定調升級**：「凡判別到名字的一律改判 ID」——④做徹底含 Square edge。
- **DB（migration `product_sync_target_id`）**：product_sync 加 target_id（beans.id 或 blends.id）；回填——單品 name+process 精準、process null 的 name 唯一（Alo Bona Village 等）、拼配對 blends。全部真豆對到，只兩個訂閱商品 null（正確）。bean_id 名字欄保留（Square 商品名/顯示/edge 相容）。
- **前端（new/index.html）**：①product_sync select 加 target_id ②新 helper `beanIdFor(nm,proc)`＝name+proc→底層 id（bNoFor 的解析版）③syncFor 認 target_id（beanIdFor 解析→比 x.target_id，訂閱/認不出退名字級）④濃縮提醒 stale 認 target_id（dialins/product_sync 都有）⑤setShelfSold/上架 push 的 callFn 加傳 `target_id:beanIdFor(...)`。
- **edge（sync-to-square v29 已 deploy）**：定位 product_sync 列改「target_id 優先 → 退 bean_id+process」（**向後相容**：沒傳 target_id＝行為完全同 v28，訂閱列無 target_id 照舊）；push 的 rec 寫 target_id。commit 只含交接檔（edge source 在 Supabase 不在 repo）。
- **驗證**：SQL 回填全對；jscheck ✓；stub——syncFor 同名兩支 WH synced/CF paused 不混、拼配對、訂閱名字級退路、beanIdFor 解析對；console 零錯誤。⚠ **edge 真呼叫驗證待老闆真機**：deploy 向後相容零破壞，但上架/下架的 target_id 路徑要老闆真按一次才實測（前端已傳 target_id，v29 會用它定位）。
- **✅ 全 ID 化收官**：①出貨扣豆 ②Dial in ③配方成分 ④product_sync＋edge 全數認 ID。凡「判別哪支豆做操作」的地方都認 ID 了；剩極少數純顯示聚合（allRetailCoffees 的 on Square 標／soldKeys／onShelf 排序）名字級但不影響操作正確性。

## 〇、補記 — 2026-07-15 之十六（🔴③配方成分存 bean_id：成分身世/扣庫存/成本全認 ID ✅）
- **背景**：blends.parts 只存 {bean,process,pct}，greenForPart/consumeBlendParts/blendPartPool/blCostPerKg 用名字＋處理法消歧。beans 本以 name+process 為唯一鍵＝現有成分能唯一對到，**目前零實際風險，趁乾淨根治**（防未來 process 拼寫不一致/泛稱）。
- **DB 回填（execute_sql，非 migration——parts 是 jsonb）**：blends.parts 每個成分加 bean_id（name+process 對 beans 唯一鍵，保序 jsonb_agg order by ordinality）。6 配方全部成分對到（Dark Knight/Dancer 3/3、其餘非空成分全中）。
- **前端（new/index.html）**：①greenForPart：p.bean_id → DB.beans 記憶體命中，退名字＋處理法 ②blendPartPool 加第三參數 beanId＝part.bean_id 與 roast.bean_id 兩邊都有比 ID、否則名字＋處理法（呼叫端 Log roast 6177 傳 p.bean_id）③consumeBlendParts pool filter 同款 ID 優先 ④blCostPerKg ID 優先 ⑤Recipe change handler 選成分存 pt.bean_id（下拉每項對一支 beans 唯一命中）⑥recipeSave 存整個 parts 陣列＝bean_id 自動帶回 ⑦consumeBlendParts short 訊息帶 process 區分同名。
- **驗證**：jscheck ✓；stub 最刁鑽（Finca Milan 兩支同名、process 故意寫空、只有 bean_id 能救）——greenForPart 各拿 Pink Bourbon/Huila vs Geisha/Cauca、blendPartPool 各算 4kg/2kg、blCostPerKg 28.5（名字級會錯算 22）、consumeBlendParts 各扣各批（Nitro 4→0 short1、Sakura 2→0 short3）、console 零錯誤。
- **⏭ 🔴 剩最後一項**：④product_sync.bean_id 存名字字串（syncFor/setShelfSold/上架 push＋Square edge，跨前後端最大工程）。

## 〇、補記 — 2026-07-15 之十五（🔴②Dial in 認 target_id：沖煮設定不再寫到第一支同名豆 ✅）
- **背景**：dialins 表只有 coffee 名字、無 process/id，applyDialinBrew 寫沖煮設定用名字取第一支同名（同名多處理法會寫錯豆）。**現況 4 筆全拼配名字唯一＝零實際風險，趁乾淨根治**。
- **DB（migration `dialins_target_id`）**：加 `target_id text`（存 beans.id 或 blends.id），回填——拼配對 blends（Dreamer/June/April Project 都對到；May Project 是已刪配方→null 正確不亂綁）、單品只回填同名唯一的。
- **前端（new/index.html）**：①loadAll dialins select 加 target_id ②DLS 加 targetId ③openDialinSheet 下拉從「名字去重」改**每支豆一項**（beans 帶 process＋S#、blends＋B#，value=id）④Latest per coffee／loadLast 分組認 target_id（同名多處理法各自一組）⑤save 存 target_id（欄不存在容錯）⑥applyDialinBrew 認 target_id 直接命中 beans/blends（舊紀錄無 target_id 退名字級）⑦今日流 Dial in 卡入口（i.ref.name 上架名字級）綁得到唯一配方/生豆才帶 target_id、同名多支留 null。
- **驗證**：jscheck ✓；stub 同名兩支（bean_cf/bean_wh 各一筆 dial in）——下拉出 S#00012 CF／S#00013 WH／B#00028 Dark Knight 三項、Latest 兩組（d_wh/d_cf 各自）、apply d_wh（target_id=bean_wh）只寫 bean_wh 的 brew（grind 2.4）不碰 bean_cf、console 零錯誤。
- **⏭ 🔴 剩兩項**：③配方 parts 存 bean_id ④product_sync.bean_id 存名字。

## 〇、補記 — 2026-07-15 之十四（🔴①出貨扣熟豆統一走 itemBeanRef ✅）
- **deductOrderStock（1387）改用 `itemBeanRef(it)`**（同烘豆需求卡）取代自帶的後綴拆解——單一事實源，且拆解 valid 從「只驗熟豆批」升級成「beans 或 roasts 任一」（更穩健）。行為對齊：同名多處理法認對批扣。保留 `var nm=ref.name` 給 short 訊息。
- **驗證**：jscheck ✓；stub 攔 roasts PATCH——訂單要 Alo Village White Honey 1kg（帶後綴無 process），只扣 rwh（3→2kg）、CF 批 rcf 5kg 不動、short 空、console 零錯誤。
- **⏭ 🔴 剩三項**：②Dial in applyDialinBrew ③配方 parts 存 bean_id ④product_sync.bean_id 存名字。

## 〇、補記 — 2026-07-15 之十三（烘豆需求卡認 coffee stock 的 B#：同名多處理法分開算該烘多少 ✅）
- **老闆定調（回應 🔴 第 1 項）**：「這個是看 coffee stock 的 id」——烘豆需求卡該以熟豆庫存的 B# 認豆。**關鍵洞察**：出貨扣豆 deductOrderStock 早就靠「名 — 處理法」後綴把品項對到精確批次，烘豆需求卡只是還停在純名字。**不用改資料結構**（商品名帶後綴＝上架時 listNameFor 加的，處理法資訊已在名字裡）。
- **改動（new/index.html）**：①新 helper `itemBeanRef(it)`＝訂單品項→{name,proc,isBlend}：process 優先 it.process，否則拆「名 — 處理法」後綴；**拆解 valid 用「beans 生豆主檔 or 熟豆批任一對得到」**（⚠ 要烘的豆沒熟豆批但有生豆，只驗熟豆會漏拆）②buildItems 烘豆需求：dem 按 `name|procKey(proc)` 聚合、shelfG 改 `rstStockKg(name,isBlend,proc)`（process 級貨架，已排除 reroast/downgrade）、卡片 detail/summary 顯示 B#、ref 帶 proc ③RO.pre chip（paintRoastSheet）：找生豆批帶處理法（同名挑對支）＋顯示 S#。
- **驗證**：jscheck ✓；stub 同名雙處理法（CF 貨架 5kg／WH 0kg，兩單各要 1kg 帶後綴無 process 欄）——WH「B#00013 · 0g on shelf → roast 1000g」、CF「B#00012 · 5000g → covered ✓」**不再互相蓋**、ref 拆對 {Alo Village,White Honey}、Log roast chip 接 S#00013 bean_wh（非 bean_cf）、console 零錯誤。deductOrderStock 未動（自帶後綴拆解、扣的是必存在的熟豆批，OK；未來可統一走 itemBeanRef）。
- **⏭ 🔴 剩四項**：出貨扣熟豆 deductOrderStock（可改走 itemBeanRef 統一）、Dial in applyDialinBrew、配方 parts 不存 bean_id、product_sync.bean_id 存名字。

## 〇、補記 — 2026-07-15 之十二（收官掃描第一批：有 bean_id 卻偷看名字的落點改認 ID ✅）
- **背景**：老闆下令「所有跟豆子相關的都只抓 ID，其他只是 information」。兩個 Explore 代理全 app 審查，分三層（✅已ID／🟡有ID偷看名字·小修／🔴沒記ID需改結構）。本輪做**第一批 🟡**（六處）。
- **改動（new/index.html）**：①`beanInfoRows` 單品段：有 `full.bean_id` → **記憶體 DB.beans 精準命中**（消滅同名多支 pool[0] 猜測＋省一次 DB 查詢，DB.beans 已載全欄位），沒 ID 退名字＋處理法 ②`cardDataFor` origin 段：同款 s.bean_id 優先 ③`shelfLiveBeans` live 加 `proc`（product_sync 有 process 欄）＋烘焙日帶 proc ④⑤⑥三個挑豆器（IG asset/Post to socials/Announce）去重 key 從 `nm` 改 `nm|procKey(proc)`＝同名多處理法各出一列、data 屬性帶 proc、點擊 `shelfSampleFor(nm,proc)`／`openSocialPostBean(...,proc)`／`announceShelfBean` 拿 process-scoped sample。
- **驗證**：jscheck ✓；stub——同名兩支不同 bean_id 不同產區：beanInfoRows WH→Yirgacheffe/74158、CF→Guji/Heirloom（不再互污）、cardDataFor origin 同對 ✓；IG/Announce 挑豆器 Alo Village 分兩列各帶對 proc＋B#00012/B#00013、拼配 Dark Knight 單列 B#00028 ✓；console 零錯誤。
- **⏭ 剩 🔴 未做（需改 schema/回填，老闆逐項拍板）**：①烘豆需求卡 buildItems（訂單品項無 process）②出貨扣熟豆 deductOrderStock＋點單品項不帶 bean_id ③Dial in applyDialinBrew（dialins 無 bean_id/process，同名取第一支零消歧）④配方 parts 不存 bean_id（拖累 greenForPart/beanInfoRows 拼配段/成本/扣庫）⑤product_sync.bean_id 存名字字串（syncFor/setShelfSold/push）。建議從烘豆需求卡開始。

## 〇、補記 — 2026-07-15 之十一（卡片色點雙鍵化：改 S#00012 顏色 S#00013 不再跟著變 ✅）
- **老闆回報**：改 S#00012 顏色 S#00013 跟著變。**根因**：色點存 app_state `rtl_dot`，值形狀 `{豆名:'y|b|r|d'}`——**key 只有豆名**（classic 老設計），同名兩支共用一筆。
- **修法**：`saveDotFor(name,key,proc)` proc 有值寫雙鍵「豆名 @ 處理法」（照 rtl_sold 慣例）；`dotKeyFor/dotColorFor` 加 proc 參數＝先查雙鍵、退名字級（舊資料/拼配/沒 proc 的呼叫端）。**名字級舊值不清**——同名另一支還靠它 fallback，等它自己被改色時才寫自己的雙鍵。
- **呼叫端**：存 ×2（saveCupSheet 帶 CUP.process）；讀 12 處帶 proc（cardDataFor/Coffee Info 行＋詳情/Promo/SocialSplit ×2/SocialPost/List push/Cup/Recup/infoCardFaces）；Bean rotation 吧台只有名字＝名字級照舊。
- **驗證**：jscheck ✓；stub 重演——舊資料名字級 'y' 兩支同色（重現 bug）→ 改 CF 為 'r' → 儲存多了雙鍵、CF 讀 r、WH 仍讀名字級 y（不連動）✓；console 零錯誤。⚠ 真機改色後記得：卡片/社群圖等產出物的色是畫圖時讀的，改色後重產才會換色（本來就如此）。

## 〇、補記 — 2026-07-15 之十（QC 只認 ID：配對層去名字化 ✅）
- **老闆定調**：QC edit 只對應 ID 做更改，不看名字 assign。**盤點結果**：QC 主寫入（qcVerdict/lockFlavourSolo/Re-cup/openQcStockSheet/退回 QC）早就全走 `eq('id',…)` ✓；洞在**配對層**三處，已堵：
  ① `matchRoast`（612，QC 佇列心臟）：ID 優先原樣，**名字退路加雙鍵**——sample 與 roast 都記了 process 就必須 procKey 相等（同名雙處理法不再互配）；roast 沒記 process 的舊資料容忍
  ② `qcVerdict` 同日 mates 聯動：加 bean_id 檢查——兩邊都掛 ID 且不同＝不聯動（名字再像也不動）；無 ID 舊資料照舊聯動
  ③ QCQ 建構的 LISTQ/LOCKQ「已上架」判斷：名字級 find syncs → `syncFor(nm,s.process)` process 級
- **資料面查核**：roasts 單品 25/25 全有 bean_id、samples 單品全有（8 筆無 ID 的全是拼配＝設計如此，拼配名唯一無污染風險）——**不需回填，ID 軌道已通**。
- **驗證**：jscheck ✓；stub 同名雙處理法三批（bean_a CF／bean_b WH／無 ID legacy WH）——sample 有 ID 只配同 ID 批 ✓、無 ID 的 CF sample 名字退路只配 CF 批 ✓、判 WH pass 時 CF 批不聯動（null）＋legacy WH 批照聯動 ✓、console 零錯誤。

## 〇、補記 — 2026-07-15 之九（全 app 掛號：所有找豆子的地方都顯示 S#/B# ✅）
- **老闆下令**：所有找豆子的都要對應 ID。Explore 盤點 18 個內部落點＋7 個對客面（店面/?bean/菜單/標籤/信件卡/社群圖＝**刻意不加**，ID 是內部語彙）。
- **新 helper（rNos 旁）**：`bNoFor(nm,proc)`＝豆名＋處理法→'B#00013'（拼配名先命中 blends.blend_no；proc undefined＝名字級**同名唯一才回號**，多處理法回空防掛錯）；`bNosForName(nm)`＝同名全部號（'S#00012 S#00013'，Delete 名字級聚合用）。
- **落點（18）**：Cup/View-Edit 標題（rNo）、Live cupping 待杯清單（rNo）、Clean up 五清單（roasts 兩個 rNo＋samples/字串三個 bNoFor，rtl_sold key 有解析 ' @ '）、Dial in 下拉（**option 補了 value 屬性**——文字帶號後不能再拿 textContent 當存檔名）＋Latest 卡、Recipe 唯讀卡＋編輯 head（bNoFor 名字）＋成分下拉（gNo＝S#）、今日流 Low green 卡（gNo）/List 卡/Dial in 卡（bNoFor）、Coffee Info 清單行＋詳情標題＋**詳情拼配成分各標 S#（greenForPart→gNo）**、Publish 列、List/Update 表單標題、Bean rotation 下拉＋吧台行、Folding Info Card 四槽、Social Images picker、IG asset picker、Post to socials picker＋詳情標題、Announce picker、Delete a coffee（bNosForName 多號）。
- **跳過（有原因）**：Sample analyse（供應商生豆樣品未入庫沒號）、Live cupping 揭曉（自由字串可能非自家豆）、今日流聚合卡（QC nav/Roast demand/Lock——摘要卡，抽屜裡有號）。
- **驗證**：jscheck ✓；stub——helper 六情境（單品/拼配/名字級歧義回空/名字級唯一/Delete 雙號/拼配單號）、Dial in 下拉「Dark Knight · B#00028」、Delete「Alo Village S#00012 S#00013」、Coffee Info 行帶 B#、console 零錯誤。

## 〇、補記 — 2026-07-15 之八（ID 前綴改版：G→S、R→B ✅）
- **老闆定案**：生豆 **S#**、熟豆 **B#**（原 G#/R# 棄用）。純顯示層——DB 欄位（green_no/blend_no）與號碼全部不動。
- **改動（new/index.html）**：gNo→'S#'、rNo→'B#'、ID book 兩段文案與拼配硬編碼、磁貼副標 'all S# & B# numbers'、搜尋 regex（s13/S#00013/純數字＝生豆、b13/B#00013＝批次；g/r 打法停用）、註解同步。⚠ 函式名仍叫 gNo/rNo（green_no/roast 語源），別被名字騙——輸出已是 S#/B#。
- **驗證**：jscheck ✓；stub——S#00013/B#00013/B#00028、ID book 文案、搜尋六打法（s/b 命中、g/r 空）、console 零錯誤。

## 〇、補記 — 2026-07-15 之七（ID book 磁貼：一頁看所有 G#/R# ✅）
- **老闆點名**：Tools 加 icon 顯示所有剛設的 ID。**改動（new/index.html）**：①Production 區磁貼 `['ID book','all G# & R# numbers','idbook','menu']`（Green stock 旁，唯讀不上 mk 色）＋dispatch ②`openIdBookSheet()`（openGreensSheet 前）＝兩段清單：Coffees（beans 按 green_no 排，行＝G# 大字＋名字·處理法＋右側 kg green，**點行→openGreenDetail**）＋Blends（blends 按 blend_no，R# 大字＋配方名）；沒號的豆不列（容錯）。
- **驗證**：jscheck ✓；stub——磁貼在/點開抽屜、兩段排序對、沒號豆不列、點行跳生豆詳情、截圖乾淨、console 零錯誤。

## 〇、補記 — 2026-07-15 之六（R#ID 改版：一豆一號終身不變，批次＝R#＋烘焙日 ✅）
- **老闆指正**：R# 不要每鍋跳號——同一支豆（豆名＋處理法）固定同一個 ID，批次靠烘焙日分。**定案設計＝號碼跟「豆」走，G/R 只是生熟狀態**：單品熟豆承生豆同號（G#00013 烘出來＝R#00013）；拼配沒有生豆面，從**同一個號碼池**接著拿號（R#00028 Dark Knight／29 Dancer／30 Dreamer／31 April Project／32 June Project／33 Sugar Daddy）；號碼全域唯一，下一支新生豆＝G#00034、新配方自動拿下一號。
- **DB（migration `blend_no_and_drop_roast_no`）**：blends 加 `blend_no integer unique`（回填 28–33 按 pos；default 掛 beans_green_no_seq **池共用**；setval 33）；roasts **drop roast_no**＋drop roasts_roast_no_seq（昨天之五的每鍋跳號廢除）。
- **前端**：`rNo(r)` 重寫＝blend→DB.blends.blend_no（名字比對）、單品→bean_id 精準→豆名＋處理法備援→名字級（雙路慣例）；`rNos` 去重（同組同豆＝一號）；loadAll blends select 加 blend_no、roasts select 拿掉 roast_no；顯示落點（QC/Edit Add Stock/Coffee Stock 三行）**零改動自動繼承**（行內本有日期＝「R#00013 · 10/07 · 3d」）；搜尋 `r13`＝該豆**所有批次**（新→舊，各帶日期/QC/剩量）、`r28`＝拼配批次、g13/純數字找生豆照舊。
- **驗證**：SQL blends 28–33 ✓ seq=33 ✓；jscheck ✓；stub——rNo 三路（bean_id/legacy 備援/blend）全對、rNos 同日兩鍋去重、Coffee Stock 行「R#00013 · 10/07 · 3d · 2 roasts」、搜尋三打法、console 零錯誤。
- **⚠ 語義備忘**：R# 是「熟豆產品號」不是批次流水號；同一天同支豆多鍋＝同一批（既有同日合併規則）。袋標/罐標/掛牌印號之後想做再說。

## 〇、補記 — 2026-07-15 之五（烘焙批次編號 R#ID：比照 G# 辦理 ✅）
- **老闆加碼**：烘焙完的豆子也要 ID，G 換 R。**DB（migration `roasts_roast_no`）**：roasts 加 `roast_no integer unique`＋sequence `roasts_roast_no_seq` default（DB 自動發號，Log roast/backfill insert 零改動）；回填 46 批按 roast_date→created_at 排＝R#00001…R#00046；下一鍋自動 R#00047。roasts.id 是原生 UUID（與 beans 的前端字串 id 不同，但做法相同）。
- **前端**：helper `rNo(r)`＋`rNos(batches)`（gNo 旁；同日多鍋合併行列多個號）。落點：①loadAll roasts select 加 roast_no ②QC 抽屜 In hand 組行（cupGroups 加 rows 收集）＋To judge 行 sub ③openQcStockSheet 標題 ④Coffee Stock 展開三種批次行（可賣組/降級組/待入庫）⑤全域搜尋 `r31`/`R#00040` 找批次（回 ID/豆名/處理法/烘焙日/QC/剩量卡；純數字仍只找生豆）。
- **驗證**：SQL 46 批全有號無重複 ✓；jscheck ✓；preview stub——rNo/rNos 三態、Coffee Stock 三行帶號（同日兩鍋 `R#00031 R#00032 · 10/07 · QC ✓`）、QC To judge 行 `R#00040 · roasted 13/07`、搜尋 r31/R#00040 命中、console 零錯誤。
- **⏭ 老闆**：下一鍋 Log roast 自動拿 R#00047。標籤/掛牌印 G#/R# 之後想做再說。

## 〇、補記 — 2026-07-15 之四（生豆身分證 G#ID：每支生豆一個人類可讀編號 ✅）
- **老闆定案**：連環「拿錯豆」後下令——每支生豆一個 ID，G#00001 起。計畫檔 `~/.claude/plans/id-g-00001-shimmying-globe.md`。
- **DB（migration `beans_green_no`）**：beans 加 `green_no integer unique`＋sequence `beans_green_no_seq` 設 default（**DB 自動發號——前端兩個進豆 insert 點零改動、永不重號**）；回填 27 支既有豆按 id 排序（id 內嵌 base36 時間戳＝進貨順序）＝G#00001 Danche v1 … G#00027 Karimikui AA（Alo Village CF=G#00012／WH=G#00013）；sequence 已 setval 27，下一支新豆自動 G#00028。
- **前端（new/index.html）**：helper `gNo(b)`（procKey 旁）＝'G#'+padStart(5,'0')，沒號回空（容錯舊資料）。九落點：①loadAll beans select 加 green_no（不加記憶體看不到）②Green stock 清單行 sub ③openGreenDetail ID 列 ④openGreenEdit 標題旁唯讀 ⑤⑥⑦選豆下拉 ×3（Receive/Log roast/Backfill）option 前置 `G#00013 · Alo Village · White Honey · 25 kg`＝防拿錯豆主戰場 ⑧Stocktake 行 ⑨Coffee Stock 行（x.ref 有才顯示，批次孤兒沒有）＋全域搜尋（`g13`/`G#00013`/`13` 皆命中＝regex 去 g#/前導零比數字，名字搜尋照舊）。
- **驗證**：SQL＝27 支全有號/無重複/進貨序 ✓；jscheck ✓；preview stub＝gNo 三態（12/13/無號空串）、清單 sub 帶號、詳情 ID 列、Receive 下拉 option 格式、搜尋四打法、rstRows ref 帶 G#00013、console 零錯誤。
- **⏭ 老闆真機**：下次 Receive→New bean 收一支新豆，看自動拿 G#00028。**範圍外備忘**：samples/roasts 關聯改造（已有 bean_id 外鍵）、烘焙批次 R#ID、greenForPart/beanInfoRows 名字級對接改造——都是之後的工程。

## 〇、補記 — 2026-07-15 之三（Publish「拿不下架」修復：同名雙處理法的售罄鏈兩個洞 ✅）
- **老闆回報**：Publish 裡 Alo Village White Honey 拿不下架。DB 實查：同名兩列 sync（Cold Fermentation paused／White Honey synced），三表 process 寫法一致無髒資料。
- **洞一（Coffee Info 詳情，2491）**：`setShelfSold(nm,!sold)` **漏傳 proc**——同名雙 process 豆名字級打 edge availability，procKey('') 兩列都不中、rows.length=2 不走單列 fallback → **400 not synced yet**（「拿不下架」直接原因候選）。修：補第三參數 `proc`（openShelfBeanDetail 本來就有）。
- **洞二（Publish sold 分支，3277）**：成功後只 `openPublishSheet()` **不 reload**——DB.syncs 是記憶體快照，重畫永遠顯示舊狀態＝按了 ✓ 畫面還是 Live（體感元凶）。修：成功後 `await reload()` 再重開（照 Coffee Info 慣例）；proc 改傳 **x.proc**（列鍵，與 syncFor 判鈕狀態同一把鑰匙；原傳 x.s.process 理論同值但不同源）。
- **驗證**：jscheck ✓；preview stub 重演雙處理法場景——Publish 兩行狀態各自正確（CF Off shelf／WH Live）、點 WH 行 Take off shelf → callFn payload `{action:availability,sample_id:Alo Village,process:White Honey,sold_out:true}` ✓＋reload×1 ✓；Coffee Info 詳情 sb-sold 同 payload ✓＋reload＋openRetailSheet ✓；console 零錯誤。
- **⚠ 提醒老闆**：昨晚（07-13 22:43）的 session 登出問題若還沒重新登入，任何 edge 操作仍會 401「unauthorized」——先登出再登入一次。

## 〇、補記 — 2026-07-15（Live cupping 主體補寫：前次工具異常沒落地，本次真完工 ✅）
- **事故**：07-14 工具異常期，Live cupping「主體函式」的 Edit 假成功（commit 48f365c 只有磁貼＋分派 12 行）——老闆 push 後點磁貼**沒反應**（呼叫不存在的 openLiveCupSheet）。教訓：**大段 Edit 後必 grep 驗證函式定義真的在檔案裡**
- **本次**：主體全函式群真正寫入（openDeleteCoffeeSheet 前）＝LC 狀態/lcCleanup/lcSplit（換行逗號頓號都切）/lcMine/openLiveCupSheet（今天最新一輪含已揭曉；無輪→picker）/lcPaintPick（toCupList 選豆）/lcStart/lcSub（channel ×2 訂閱）/lcDone/lcLiveUpdate（打字中只更新小字保鍵盤焦點）/lcPaint（三態）/lcSubmit（upsert onConflict session_id,cupper）/lcReveal（自己直翻別人靠 realtime）/lcSaveOfficial（去重彙總→照 saveCupSheet insert 形狀：no 流水號＋容錯鏈＋cupper='Team'→存完進 QC 待判定）
- **驗證（本機 stub 全過）**：picker→開輪 payload（roast_id/bean_name/process/opened_by）→寫態→submit payload（notes 3 條）→等待態計數→reveal PATCH→揭曉三人並排→存正式 payload（features 7 個去重合併、雙鍵、Team）＋截圖＋console 零錯誤。⚠ stub 心得：**sb 是區域變數不在 window 上**（mock channel 蓋不到；channel 走 WebSocket 不走 fetch，stub 測試讓它真連無害）
- **⚠ 待老闆**：push 部署後兩裝置真測即時（DB 表/RLS/realtime publication 07-14 已上線且驗過連通）
- **同輪加做 ×3（老闆連發）**：①豆名自由填入（不綁待杯清單——別家豆/樣品可測；待杯批次降級快捷，點了帶批次資訊；自由豆 roast_id null＝存正式純紀錄不進 QC 佇列）②揭曉畫面豆名可改（edit name→update session 全場 realtime 同步）③**AI 總結風味**：新 edge **cup-ai v1**（Claude claude-haiku-4-5、team only、回 JSON {features 共識 3-6 詞, comment 一句杯測描述}）→ 揭曉畫面「✨ Summarise with AI」卡＋↻ Again；Save 有 AI 用 AI（features＋comment 進 samples），沒有照舊去重全收。**⚠ ANTHROPIC_API_KEY secret 還沒設**——真按會回明確錯誤；老闆要去 console.anthropic.com 拿 key → Supabase dashboard→Edge Functions→Secrets 加 ANTHROPIC_API_KEY（或貼給 Claude 代設路徑再議）

## 〇、補記 — 2026-07-14 之五（Live cupping 多人盲測協作：系統首次用 Realtime——⚠ 此輪主體未落地，見 07-15 補記）
- **老闆要**：杯測時大家各自登入→選同一支待杯豆→大框自由打風味→Submit 盲等其他人→揭曉對照→**算正式**（進 samples）。三拍板：每次一支豆／算正式（未來想接 AI 綜合風味）／真即時。介面鐵則：每畫面一個主要動作、大框自由打
- **⚠ 系統第一次用 Supabase Realtime**（此前 grep=0）。真測通過：Chrome 登入態訂閱 cupping_notes → insert 一筆 → 收到 INSERT 廣播（SUBSCRIBED ✓）＝publication/RLS/廣播整鏈路運作
- **migration `live_cupping_collab`**（已上線）：`cupping_sessions`（roast_id/bean_name/process/opened_by/revealed）＋`cupping_notes`（session_id FK cascade/cupper/notes jsonb/submitted_at；unique(session_id,cupper)）；RLS `is_staff()` 讀寫（信任模型）；**兩表加 supabase_realtime publication ＋ replica identity full**（reveal 翻牌要帶完整 row）
- **前端（new/index.html，openDeleteCoffeeSheet 前）**：磁貼 `livecup`（QC 排，全 staff 無門檻）→ `openLiveCupSheet()`。狀態 `LC={sid,session,notes,draft,chan}`。函式群：lcCleanup（removeChannel）/lcSplit（換行逗號分隔）/lcMine/lcDone/lcPaintPick（列 toCupList）/lcStart（開輪 insert session）/lcEnter/lcSub（channel postgres_changes ×2：notes 變化＋session UPDATE 翻牌）/lcLiveUpdate（我在寫就只更新計數不動 textarea）/lcPaint（三態：未交=大 textarea+Submit；已交=計數+Reveal all；揭曉=每人一卡並排+Save）/lcSubmit（upsert notes onConflict session_id,cupper）/lcReveal（update revealed）/lcSaveOfficial（去重彙總風味→upsert samples 雙鍵、cupper='Team'、cupping_date=今日）
- **盲測＝應用層**（非 DB）：揭曉前 realtime 雖推 rows，前端只畫「誰交了」不畫 notes 內容；揭曉才全畫。店內信任場景夠用，嚴格 DB 盲測列未來
- **並存不動**：單人 openCupSheet/saveCupSheet 照舊；存正式重用 saveCupSheet 的 samples 寫入形狀
- **驗證**：jscheck ✓；stub 全流程 payload 逐一對（開輪／submit notes array／reveal revealed:true／存正式 features 去重合併 6 詞＋雙鍵＋Team＋bean_id＋日期）；揭曉態渲染三人並排＋Save ✓；realtime 連線真測 ✓；console 零錯誤
- **⚠ 待老闆**：①push 部署後**兩裝置端到端即時**現場一試（連線層＋DOM 流程各自驗過，組合信心高）②未來 AI 綜合風味＝lcSaveOfficial 存正式前插一段呼叫（掛鉤未寫，屆時加）③channel 清理：closeDrawer 沒 hook，靠 openLiveCupSheet 進入時先清舊＋Close 鈕呼叫 lcCleanup（背景點關殘留無害，下次進清）

## 〇、補記 — 2026-07-14 之二（Coffee Info 一堆 Off shelf 誤報：rtl_sold 殘留清掃＋push 自動清 ✅）
- **老闆回報**：Coffee Info 突然一堆 Off shelf。**根因**：07-13 下架 12 支時 rtl_sold 標了 12 支；老闆重新上架走 Publish「List on Square」＝pushListToSquare 只寫 product_sync synced，**rtl_sold 舊標記沒人清**（Put back on sale 走 setShelfSold 會清、重新 List 不會）→ 明明在賣仍掛 Off shelf（Coffee Info/詳情的 sold 判斷＝rtl_sold ∪ paused）
- **修**：①資料——SQL 把 rtl_sold 裡已 synced 的 7 支清掉（Dancer/Danche v1-v3/Dark Knight/Sugar Daddy/June Project），留真下架的 5 支（April Project/Hakuna Matata/Kiama AA/Kii AB/Dreamer）②根因——pushListToSquare 的記憶寫回段（read-modify-write）加 rtl_sold：push 成功刪該豆 key（listNm＋nm 兩種 key 大小寫容錯）。驗證：stub——push Dancer 後 rtl_sold 寫回只剩 April Project、alert 零、console 零錯誤。⚠ stub 測 pushListToSquare 要蓋 window.callFn（不然 Signed out 就 throw）
- **烘豆日期修正（同 session 稍早）**：shelfLatestRoast/shelfFreshness 加可選 proc 參數（undefined＝名字級照舊）；Coffee Info 排序/列/詳情帶 proc——Alo Village WH（05-18）/CF（06-01）烘豆日不再互相污染。老闆點名先驗後 commit——本輪一起 commit

## 〇、補記 — 2026-07-14 之四（Tools「Clean up」清潔按鈕 ✅）
- **背景**：生產線體檢揪出四漏洞（賣超/待秤黑洞/死連結復發/未 QC 可出貨——後兩者本輪處理，前兩者待老闆排期）。老闆點名做清潔按鈕
- **交付**：Tools→Coffee 區磁貼「Clean up」（director only）→ `openCleanupSheet()` 五區掃描（雙鍵規則）＋分區清理：
  - **A Square 死連結**：edge **sync-to-square v28 +action `reconcile`**（掃 product_sync external_id 逐一驗 Square、404=dead；fix:true 清連結＋synced→paused；其他錯誤只報不修）；前端「Fix N dead links」
  - **B 舊杯測**（沒鎖＋沒貨＋不在 QCQ）：列出＋雙 confirm 刪 samples
  - **C 待秤超期**（>2 天）：點行 openWeighIn；✕ 誤記刪除＝刪 roasts＋green 退回生豆（找不到主檔只刪不退有提示）＋stock_moves 沖銷（kind:'adjust'）
  - **D 降級滯留**（>30 天）：純提醒、點行跳 Coffee Stock 該豆
  - **E rtl_sold 殘留**（記憶說下架、實際 synced）：Fix memory＝read-modify-write 清 keys——上次 Coffee Info 誤報 off shelf 的病根有工具了
  - 全空＝All clean ✓；各動作 logAct 記名
- **驗證**：stub 五區各一例＋鎖了的不列＋執行 payload（samples in(s1)/roasts delete＋beans 20→30＋stock_moves +10/rtl_sold 清 key）＋All clean 空態＋截圖 console 零錯誤；**現網 reconcile 乾跑＝checked 16、dead 0** ✓
- **⚠ 剩餘漏洞待排期**：①賣超（庫存歸零不自動下架——建議出貨歸零觸發 off shelf 或推播）②待秤黑洞的自動提醒（今日流卡/晨報——Clean up 是手動版）

## 〇、補記 — 2026-07-14 之三（Roast → Publish 營運藍圖文件 ✅）
- **老闆要求**：Log roast 到 Publish 做一份可下載的藍圖。交付：`Ratio-blueprint-roast-to-publish.html`（repo 根目錄，單檔自包含、亮/夜版、可列印成 PDF）＋Artifact 網頁版 https://claude.ai/code/artifact/f6d9755d-55c6-47fd-bbbf-6493e07fd140（手機隨時開）
- **內容**：總覽 SVG 流程圖（生豆→Log roast 多鍋→Coffee Stock 三池→QC→Publish→店面＋出貨 FIFO 迴圈＋降級回流）＋五站規則卡（Log roast/Coffee Stock/QC/Publish/Coffee Info）＋鐵律五條（豆子雙鍵/鎖=閘門/降級不隱形/off shelf=消失/FIFO）——全部照 2026-07-13~14 定稿規則，紙白玫瑰設計語言與 app 同款
- **規則有變時記得同步這份文件**（改完重發 Artifact 同 URL）

## 〇、補記 — 2026-07-14 之二（sync-to-square v26→v27：Blend/Single Origin 分類歸納 ✅）
- **老闆定調**：Square 商品按豆型歸類——「Blend」「Single Origin」（重用 Square 既有同名分類）；「Ratio Online Shop」降級為純認養圍欄（每支都掛、防誤抓店內品項，v25 防護邏輯不動）
- **v27**：泛用 `ensureCat(name)`（快取 map）取代單一 ensureRatioCategory；`isBlendBean(admin,name)`＝blends 主檔 ilike 命中或 roasts kind='blend' 同名；push 自動掛〔圍欄＋豆型〕雙分類、reporting=豆型；新 action `categorize_all`＝一次掃 product_sync 有 external_id 的全部商品補掛（訂閱按名字帶 blend/single 判）。v26 是中間版（單一分類版 categorize_all），部署後即被 v27 蓋掉
- **執行**：categorize_all 16 支歸好（4 Blend：Dancer/Dark Knight/April Project/Sugar Daddy/June Project…＋Subscription—Blend；其餘 Single Origin）；**又揪出 2 支死連結**：La Molienda/Mwendi Wega AB（synced 掛著但 Square 商品早刪、客人買不到）→ 清 external_id/variation_id＋轉 paused（重新上架走 create 即復活）
- **驗證**：inspect Dark Knight→Blend（重用店內既有分類 VDEA…）、Alo Village · Cold Fermentation→Single Origin ✓；圍欄不受影響（matchItem 仍只認 Ratio Online Shop）
- **⚠ 備忘**：「Blend」分類是店內既有的——Square 後台按它篩會同時看到 House 飲品和網店拼配豆（老闆自己的分類系統，設計如此）；死連結病根＝Square 後台手動刪商品不會同步 product_sync，之後可考慮 push 前 preflight 或定期對帳

## 〇、補記 — 2026-07-14（sync-to-square v25：專屬分類＋認養圍欄，House 品項誤連事件收拾 ✅）
- **事故**：老闆 07-13 重新上架 Dark Knight/Dancer/Dreamer 時，push 的名字認養（matchItem 按名字段互含）**誤抓店內 POS 品項**（「House - Dark Knight」$0、「House - Dancer」$0、「House - Decaf (Dreamer)」$1）——?shop 因此顯示 $0、店內品項被寫入 ratio_ref＋掛 Grind 磨豆選項＋附卡片圖＋描述被蓋
- **修法（老闆定調：上傳的商品要有自己的 category）——sync-to-square v25**：
  - `ensureRatioCategory()`＝找/建 Square CATEGORY「**Ratio Online Shop**」（照 ensureGrindModifier 模式，快取）
  - push：CREATED 模式掛 categories＋reporting_category；LINKED 模式只 append categories（不動老闆原 reporting）——`withRatioCat()`
  - **matchItem 圍欄**：名字認養只考慮「已掛 Ratio 分類」的商品（`itemInCategory`）；分類建立失敗＝完全不做名字認養（fail-safe 走 create）。ratio_ref 精確認養照舊優先。**店內品項永遠不會再被抓**
  - 新 utility action `detach {object_id}`：拆錯認商品＝清 ratio_ref＋移 Grind modifier＋刪 ratio card 圖＋清描述（名字/variations/分類不動）
- **修復執行**：detach ×3（三個 House 品項恢復乾淨）；product_sync 三列 external_id/variation_id 清 null（價格記憶保留，重新上架走 create＋新分類）；全豆體檢＝其餘上架豆全部連對（ratio_ref 立功），paused 舊豆 catalog not found 屬正常
- **意外驗收 🎉**：老闆已 push 部署新前端＋自己跑通同名多處理法全鏈——**Alo Village White Honey＋Cold Fermentation 同時在 ?shop 賣**（CF 商品名帶後綴「Alo Village — Cold Fermentation」）。店面現在 8 支豆
- **同輪加做：Coffee Stock 單品 0kg 不列**（老闆定調）：rstRows 單品 has 判斷收掉「設了 target/low 就算 0kg 也列」——只剩可賣>0／降級池／待入庫（Log roast 出來的）三種才現身；賣光的豆去 Coffee Info History 看。Blends 分頁不動（配方全列照舊）。stub 四情境驗證 ✓
- **⚠ 待老闆**：①White Honey 商品名還是純「Alo Village」（昨晚舊前端 push 的）——下次對它按 Update listing 會自動補後綴，兩支對稱 ②Square 後台瞄一眼三個 House 品項（描述被清空了，若原本有描述要自己補回）③Dark Knight/Dancer/Dreamer 要重新上架時照常 Publish 按 List＝建全新商品掛「Ratio Online Shop」分類

## 〇、補記 — 2026-07-13 之三（同名多處理法豆全鏈打通：Alo Village 兩處理法可同時鎖＋Publish＋上架 ✅）
- **起因**：Alo Village 的 White Honey 和 Cold Fermentation 沒法同時在 Publish（鎖被單選踢掉）。根因＝07-12「處理法分開」只做到 Coffee Stock/QC 上游，**風味鎖→Publish→Square→product_sync→店面整條鏈是名字級**
- **階段一（前端，commit e96ce91）**：`procKey()` helper（null/空白折 ''，全鏈比對統一用）；`lockFlavourSolo` 解鎖範圍改「同名＋同 procKey」（前端過濾 id 清單 `.in()` update，避開 PostgREST null 比對）；`lockedMate` 同範圍；新 `syncFor(nm,proc)` 統一上架列查找（proc undefined＝名字級、列 process null＝舊列名字級照舊配）；`shelfSampleFor(nm,proc)` 加可選參數（10 個舊呼叫點零改動）；Publish 母體按 name+process 分行＋PUB.open key `nm|proc`；rstRows 膠囊 locked/sync 各自處理法說話；杯測同日重複檢查加 process；Send back to QC 只解自己處理法的鎖
- **階段二（migration＋3 edge＋前端，本 commit）**：
  - migration ×2：product_sync 加 `process text` 欄；唯一鍵 (bean_id,channel)→**(bean_id,channel,process) nulls not distinct**（PG17）
  - **sync-to-square v24**：push 收 body.process；列定位＝bean_id＋procKey 精確配→null 舊列收養升級→無 process 且僅一列 fallback；寫入改 select-then-write（update by id／insert，push 不再用 onConflict）；ratio_ref 帶 process 的列改存「名 @ 處理法」防同名互相認養；delete/availability/inspect 同定位；ensure_sub_items 改 select-then-write
  - **public-shop v14**：flav map 兩層（name|proc 精確＋name 舊列 fallback）；roast_date 加 name+proc map；slug 帶 process（同名兩卡不同 slug）；legacy 單豆 checkout maybeSingle→limit(1) 防同名炸
  - **morning-brief v7**：售罄 30 天自動下架改**按 id 刪單列**（原按 bean_id 刪會誤殺還在賣的同名兄弟——真雷）；下架名帶 (process)
  - **前端**：loadAll syncs select 加 process；`listNameFor(nm,s)`＝同名多處理法 Square 商品名帶後綴「名 — 處理法」、單一處理法照舊純名（既有商品不改名）；openListSheet 記憶 key（價格/規格/圖模式）改 mkey＝上架顯示名（舊 key fallback 無縫）；pushListToSquare 卡片素材查詢加 process 過濾＋payload 帶 name=listNm/process；setShelfSold(nm,sold,proc) availability 帶 process＋rtl_sold 複合 key「名 @ 處理法」；deductOrderStock 商品名後綴解析（精確名找不到批次→拆「 — 」重試，訂閱行先擋不誤拆）
- **資料修復**：Alo Village 既有 synced 列（老闆 07-12 晚上架、process null）補 process='White Honey'（那列的鎖定 sample＝WH）——Cold Fermentation 日後上架才不會搶錯戶口
- **驗證**：兩階段 stub 全過（鎖不互踢/兩行 Publish/獨立開合/listNameFor 後綴規則/availability payload/rtl_sold 複合 key/後綴拆解扣對批次不碰兄弟）＋jscheck＋console 零錯誤＋截圖；curl public-shop ok（beans 7＝老闆重新上架的豆，行為正確）
- **⏭ 老闆真機收尾**：①QC 把 Cold Fermentation 重新 Pass（這次不會踢掉 White Honey 的鎖）②Publish 應見兩行 Alo Village 各帶處理法 ③CF 按 List（Square 建新商品「Alo Village — Cold Fermentation」）④WH 按 Update listing（商品名自動補後綴「Alo Village — White Honey」）⑤?shop 看兩張卡
- **⚠ 已知限制（後補）**：Coffee Info/IG asset/Announce 清單仍名字級（同名一行、rep＝鎖優先）；?bean 公開豆頁 slug 已分流但 public-bean edge 未動（兩支詳情頁可能顯示同一筆）；rtl_sold 複合 key Coffee Info 讀不到（售罄真狀態看 product_sync，無礙）
- **同輪之六：連結 Roast log→Coffee Stock（待入庫批次現身＋補熟豆）**（老闆點名，本 commit）：烘了但沒秤熟豆的批次（green_kg>0 但 remaining_kg 空/0）以前在 Coffee Stock 完全看不到（只收 remaining>0）——現在現身標「待入庫」、點行補熟豆入庫。對稱 dg 池模式：
  - 新 `rstPendingBatches(name,isBlend,process)`（rstDgBatches 旁）＝green>0＋remaining 空/≤0＋qc 非 downgrade/reroast＋同名同 procKey
  - rstRows：has 判斷加 pending、孤兒迴圈放寬（`remaining>0 || (green>0 && remaining 空)`——roasts process 對不上 beans 主檔時用 roasts 自己的 name+process 現身、不漏）、每列掛 x.pending/x.pendKg
  - openBatchesSheet：收合態「N to weigh」琥珀字、展開 dg 區後加「TO WEIGH」區（每筆一行不按日組＝各鍋熟豆各異，roast_date·green Xkg·weigh in ›）；血條總量不含 pending
  - 新 `openWeighIn(r)` 補熟豆抽屜：green 顯示、輸入熟豆 kg＋失重率即時（重用 roastLossPct）、Save→update roasts {roasted_kg,remaining_kg}＝入庫（從 pending 變可賣/待 QC）、logAct、reload
  - 驗證：stub——今天 4 筆情境＋孤兒（Mystery process 對不上）現身、to weigh badge、血條總量 4.3 不含 pending、展開 TO WEIGH 區、openWeighIn 填 8.6→失重率 −14%→PATCH {roasted_kg:8.6,remaining_kg:8.6}→r1 更新離開 pending、console 零錯誤＋截圖。⚠ **今天真資料**：4 筆（Danche v1/La Molienda/Danche v3/Hakuna Matata 各 green 10kg）待老闆秤熟豆——push 後 app 內 weigh in，或秤好告訴我代填（execute_sql）
- **同輪之五：Log roast 單品多鍋 session**（老闆點名「今天烘豆卡卡的」）：從「烘一鍋→存一次→關抽屜→重開重選」改成「開一次、連續 Add 鍋、最後一次 Submit 入庫」。老闆定案：①生豆 Submit 時一次扣（中途暫存可改可刪）②A+B 都要（先建清單/邊烘邊加/烘到一半加單）＝同一個累積列表、熟豆可之後回填③拼配不進這輪（維持 saveBlendBatch 單鍋）。
  - **RO 加 `batches:[]`**；openRoastSheet 開頭 `await loadRoastDraft()` 讀回未 submit 的 session
  - **新 app_state key `roast_draft`**＝`{date,batches}`（跨裝置暫存、防手機鎖屏/關 app 丟；每次 Add/改/刪存、Submit 清空）
  - **新函式**：`roastLossPct(g,o)`（失重率）、`roastAddBatch`（驗證→push batches→清這鍋量與曲線**保留選中豆**＝連烘同豆只改 kg→存 draft）、`roastEditBatch`（拉回輸入區改）、`roastDelBatch`、`loadRoastDraft`/`saveRoastDraft`、`buildRoastRec`（抽自 saveRoastSheet 單筆組建）、`submitRoastSession`（未填熟豆 confirm 提示→迴圈 insert roasts→**同 beanId 累加一次扣 beans.quantity**→stock_moves 每鍋一筆→logAct→清 draft→reload）
  - **paintRoastSheet single 分支重寫三段**：Add a batch 輸入（豆/green/out/**失重率即時 ro-loss 不 repaint**/曲線摺疊移進此區/＋Add）＋This session 列表（每鍋 green→out·−X%，沒填 out＝roasted out pending；點列 editbatch、✕ delbatch）＋Green 扣除預覽＋Submit 鈕（帶鍋數、空時 disabled）。blend 分支完全不動、single/blend 切換保留
  - **驗證**：stub——加 3 鍋（失重率 14%、Add 後保留豆清 kg）、draft upsert（app_state?on_conflict=key 帶 roast_draft）、submit（3 筆 roasts＋Kenya 一次扣 10/Geisha 扣 4＝各一次非每鍋、stock_moves 3 筆、batches 清空、reload）、DOM（session 列表/pending/green 預覽/submit label/刪除編輯鈕）、blend 回歸（單鍋 save 無 submit/add）＋console 零錯誤＋截圖。⚠ `saveRoastSheet` 變 dead code（single 改走 submitRoastSession），保留未刪
- **同輪之四：Coffee Info 重構成四象限**（老闆定調）：資料源除 QC 杯測，也接 Coffee Stock 現有庫存。三段＝**In stock**（鎖了＋有可賣庫存）／**Pending — lock in QC to list**（有貨＋還沒鎖，含沒杯測的 no info）／**History — sold through**（鎖了＋賣完的存檔）；**沒鎖＋沒貨＝不顯示**（老闆：沒鎖是同支豆次要批次、被換鎖解掉的舊紀錄本該刪，無存檔價值）。判定**處理法級**（同名多處理法各自分區——Alo Village White Honey 有貨→現貨、Cold Ferment 賣完→History）。改 `openRetailSheet`：候選枚舉＝DB.samples ∪ rstRows(兩分頁)（process 級去重 nm|procKey、拼配名字級）；分區＝shelfSampleFor(nm,proc) 鎖優先＋rstStockKg（排除 downgrade，規則2）；排序 In stock/Pending 烘豆日舊→新、History 新→舊；rowHTML 帶 data-shelf/shelfp/shelfb；`openShelfBeanDetail(nm,m,proc)` 加第三參數（shelfSampleFor/syncFor/價格 mkey 全 process 級）。收掉 hidN（上架沒鎖警示→改由 Pending 承擔）＋名字級 lockN>1 髒資料紅字（process 級單選後不發生）。驗證：stub 六情境全對（WH→In stock、Kiama 沒鎖→Pending not locked、Mystery 沒杯測→Pending no info、CF 鎖沒貨→History sold through、拼配 House Blend→In stock、Old Gone 沒鎖沒貨→消失）＋點 CF 詳情取到 tropical 非 honey＋console 零錯誤＋截圖。⚠ 小瑕疵：shelfFreshness/shelfLatestRoast 仍名字級（同名多處理法列表新鮮度可能顯示同一天，非關鍵，之後修）
- **同輪收尾 ×2**：①QC 判定泡泡滑動手感修正（commit b1fc9dd）——泡泡在抽屜捲動容器內沒設 touch-action、手勢被瀏覽器搶走；補 `pan-y`＋鎖定後非 passive touchmove preventDefault（照 attachDrawerDrag 成例）＋鎖定閾值 18px/1.6→12px/1.3。真機手感等老闆 iPhone 驗 ②Coffee Info「Ready to list」區收掉（老闆定調上架統一走 Publish、Coffee Info 純看資訊）——openRetailSheet 刪 toList 區塊三處；今日流 List 卡與 QC 換鎖直開 Update 抽屜不動

## 〇、補記 — 2026-07-13 之二（營運操作：店面 12 支 Live 豆全數下架 ✅）
- **老闆指令**：Roasted stock 裡掛 Live 的豆全下架（店面暫時清空）。Chrome 代跑（老闆先登入一次——07-08 曾登出的老問題，登入後 session 就在）
- **結果**：12 支全 paused——3 支走 `setShelfSold`（Dark Knight/Dancer/Dreamer，Square availability＋rtl_sold＋edge 回寫 paused）；**9 支 Square 打回 Catalog object not found**（April Project/Sugar Daddy/June Project/Kiama AA/Kii AB/Hakuna Matata/Danche v1-v3——Square 後台商品早被手動刪過、掛 Live 其實只有 ?shop 在賣）→ 這 9 支照 setShelfSold 後半邏輯直補 DB（rtl_sold 標記＋product_sync paused）。沒動：La Molienda/Mwendi Wega AB（沒鎖＝本來就不在店面）、Subscription ×2
- **驗證**：product_sync 對帳 13 paused（含原有 Finca Milan）/4 synced；?shop 客人視角全數 SOLD OUT 不能加購物車
- **⚠ 備忘**：這 9 支日後重新上架照常按 Publish「List on Square + Ratio shop」會重建 Square 商品（push 走 create）；morning-brief v4 有「售罄滿 30 天自動下架」——這批全標售罄了，30 天後會被自動收走 product_sync，屬正常行為
- **接著加做：public-shop v13**（老闆嫌整頁 SOLD OUT 卡不好看、選「售罄豆從菜單完全消失」）：GET beans 組建加一行 `if(r.status==='paused')return null`——**v8「售罄留菜單帶 sold_out 旗標」規則廢除**；sold_out 欄位保留恆 false（舊前端相容）；checkout 驗證/subs[]/catalogForSynced 全不動（paused 本來就進不了 allowedVarIds）。從此「Mark sold out」＝店面直接消失、「Put back on sale」＝自動回來。驗證：curl edge beans:0 subs:2 ✓；?shop 客人視角只剩訂閱卡（前端空分頁自動收、優雅降級不用改前端）。⚠ edge 程式碼不在 repo（歷來都 MCP 直部署），要看原始碼用 get_edge_function

## 〇、補記 — 2026-07-13（Publish 改認風味鎖 ＋ Downgrade 現身當配方首選 ✅）
- **背景**：老闆核對 Coffee Stock 管線心智模型後拍板兩更正：①Publish 門檻從 qc=pass 改**風味鎖定**（與 Coffee Stock 膠囊、public-shop QC gate 三處同口徑，順修 Publish 面板 Live 膠囊不看鎖的不一致）②downgrade 批次不再隱形——Coffee Stock 帶紅標顯示、拼配烘焙**優先吃降級豆**（消化進配方）
- **改動（全 new/index.html）**：
  - `paintPublishSheet`（**二次更正後定版**：老闆補刀「清單只索取 lock flavours 的豆」——不是沉底提示，是**沒鎖的根本不列**）：母體組建時 `shelfSampleFor(nm)` 沒鎖直接 return（鎖優先＝名字級判定）；x.qc/x.ok/matchRoast 邏輯全刪＝清單裡全是鎖了的豆、全可操作；膠囊固定 'Locked ✓'、synced 必真 Live；空清單文案 'No locked coffees yet…'；抽屜副標改 'your flavour-locked coffees'。synced 未鎖的豆從 Publish 消失＝去 Coffee Stock 看（掛 Not on shop 膠囊提醒去鎖）、售罄管理走 Coffee Info
  - 新 helper `rstDgBatches(name,isBlend,process)`（rstStockKg 旁）＝rstBatches 同形狀但只撈 qc='downgrade'——**刻意分池**：dg 不進血條/總量/出貨 FIFO
  - `rstRows`：每列掛 `x.dg`/`x.dgKg`；beans「有血才列」條件補 dg 池（**純降級豆不隱形**）
  - `openBatchesSheet`：header 總量旁紅字「+X kg downgraded」（不混進可賣 totKg）；豆卡收合態 label 旁紅小字「+X kg dg」；展開列表可賣池下加 dg 區＝紅膠囊 downgraded＋「use in blends first · X kg」＋逐日行（data-dgbat 可點）
  - `openRstDeduct(x,preGroup,pool)`：加第三參數指定批次池（dg 行點進來傳 x.dg）；沒給＝可賣池、可賣池空自動退 dg 池（純降級豆也能「−」清理／Fix kg）
  - `consumeBlendParts`：sort 加權＝downgrade 排隊首、同級內照 roast_date FIFO（過濾本來就沒擋 dg，只差順序）
- **不動的**：`rstBatches` 零改（出貨 `deductOrderStock`/血條/rstStockKg 全走它＝客人訂單永遠吃不到降級豆）；`shelfG` 需求覆蓋仍排除 dg（「還要烘多少」只看可賣量）；QC 佇列天生 `!r.qc` 擋已判定；public-shop edge 不動
- **驗證**：jscheck ✓；serve 複本 stub（攔 fetch）——可賣池/dg 池分離、純 dg 豆有列、出貨池無 dg、consumeBlendParts 先扣 dg 批（PATCH 順序 r2→r1）、Publish 三豆三態（locked→Live／synced 未鎖→Not on shop＋黃標／downgrade→沉底 Lock flavours first）、點 dg 行開扣量抽屜只帶 dg 組、QC 佇列回歸 0、console 零錯誤＋截圖×3
- **⚠ 陷阱備忘**：dg 量刻意不進可賣血條與低標——別「修正」它；沒鎖的豆（含 pass-未鎖）在 Publish 完全不列（行為變更＝設計如此），要找去 Coffee Stock/Coffee Info
- **同輪加做：Coffee Stock 豆卡「Send back to QC」**（老闆點名）：展開區新 chip（id rst-sbqc，ed＋有杯測＋有已判定批才出）——照 Coffee Info sb-requeue 同款：可賣池優先找判定批（含 dg 池）→confirm→清 roasts.qc＋解鎖 shelfSampleFor 那筆→logAct 'sent back to QC'→reload。兩處 confirm 文案統一改「It drops off the shop menu until you Pass it again」（v13 後解鎖＝店面消失，舊文案 Square listing stays live 已不準）。驗證：stub——按鈕條件（Kenya 出/Geisha noInfo 不出）、PATCH roasts qc:null＋samples 解鎖、reload ✓ console 零錯誤＋截圖
- **同輪加做：Coffee Info 分頁**（老闆點名）：`openRetailSheet` 加 pm-seg〔Blends｜Single origins〕（同 Coffee Stock 樣式、預設 blend）；新全域 `RTL_SEG`＋helper `rtlIsBlend(nm)`（命中 blends 主檔**或**有 kind='blend' 批次＝漏網之魚拼配也認得）；排序不動（本來就烘豆日舊上新下＝先賣先清）；soldN/hidN 副標計數隨當前分頁（數字跟看得到的列對應）；Ready to list/Sync problems 區塊全局不分頁。驗證：stub——blend tab〔Mystery Mix(06-01)→House Blend(07-08)〕、single tab〔Geisha(06-15)→Kenya AA(07-01)〕舊上新下、切換正常、console 零錯誤＋截圖

## 〇、補記 — 2026-07-11 之九（遊戲風首頁 Home：手遊磁貼牆＋紅點＋今日進度條 ✅）
- **成果**：新殼加**第四頁 `view==='home'`**（nav 第一顆 Home，暫不搶預設落地頁）＝手遊主畫面：3×3 站台磁貼（inline SVG 圖示＋待辦數）＋紅點（有沒看過的新卡）＋今日進度條（done X / Y）。老闆想要「少字、像遊戲」＋「新東西冒紅點」——此輪全交付
- **結構（全新增、舊路徑零改動）**：CSS `hm-` 前綴塊（</style> 前）＋ JS 塊（render() 前）＝`HOME_TILES`（9 塊：Orders/Wholesale/Roast(+Green)/QC/Shelf/Recipe/Pay(=Transaction)/Tasks(=Daily Task)/Customers＋finance 專屬 Payroll 磁貼）、`HOME_ICONS`（照喇叭鈕成例 viewBox24/currentColor）、`tileItems/tileCount/tileIds/tileFresh/homeMarkSeen/todayProgress/goTile/renderHome`。wire-in 僅 6 點：nav 按鈕、render() 分派、.on toggle、click 綁定、loadAll append、`todayStartISO()` helper
- **磁貼數字**＝該站現存非 pin 卡（自行按 i.roles 過濾——staff 看不到 Pay/Customers/Shelf，防財務洩漏）；QC 特例＝toCupList()+QCQ（與 QC 頁同源）。**紅點**＝tileIds 有 localStorage `home_seen_v1`（每磁貼已見 id 集合）沒有的 id → 點磁貼 markSeen（只存現存 id＝自動修剪）；存 localStorage 不存 app_state＝唯讀 Proxy 擋非 lead 寫入、staff 才滅得掉（照 brief_seen_ts 前例，換裝置紅點重亮＝已接受的特性）
- **進度條**：分子＝當日 activity_log 符合 `DONE_ACTS` 白名單（前綴比對，字串照抄 logAct 實際值；ticked closing 不算、closing complete 才算防灌水）；分母＝分子＋現存待辦；actToday 讀不到→降級「N to go」無條。loadAll Promise.all **尾端** append（rs[0..20] 索引不能動）→ `DB.actToday`（rs[21]）
- **跳轉**：QC→QC 頁；Payroll→openPayrollSheet()；其餘→markSeen＋`VIEW_MODE='all'`＋FOLDED=其他全站＋跳 feed 捲到 [data-grp] 組頭（'all' 因磁貼數字是全站量）
- **nav 五顆**：加 `body.appview nav button{font-size:13px;padding:10px 2px}`——375px 寬實測五顆各 61px 不溢出
- **驗證**：jscheck ✓；stub DOM 全過＝director 9 塊數字全對（4/15 done 27%）、點 Orders→只開 Orders 組＋紅點滅→新單復燃、staff 只見 4 塊、finance 只見 Payroll、actToday=null 降級、全清態 ✓+100%+All clear、亮/夜版截圖、feed/QC/Tools 回歸 ok、console 零錯誤（QC 一度報錯是 stub 少 r 欄位，非回歸）
- **⏭ 輪 5（等老闆試用拍板）**：把預設落地頁換成 Home＝boot 尾 `view='feed'` 改 `'home'` 一行；嫌 9 塊多刪 HOME_TILES 元素即減塊
- **⚠ 陷阱備忘**：磁貼數字與今日流「N to do」口徑不同（磁貼含全站、feed 計數看視角）；進度條分子是全店完成數（activity_log 不分人）——設計如此（團隊共同血條）

## 〇、補記 — 2026-07-11 之八（Meta 授權嚮導完成：Post to socials 已接通 ✅）
- **成果**：三顆 secrets 已設進 Supabase（META_PAGE_TOKEN/META_PAGE_ID/META_IG_ID），app Tools→Marketing→Post to socials 引導面消失、顯示「@ratio.crowsnest · Ratio ✓」＋豆清單——**功能通車**。第 3 輪（真發一支豆＋防呆驗證）還沒跑。
- **走的路（跟原藍圖不同，備查）**：Graph Explorer 的權限下拉在老闆 Chrome 上壞死（新增權限點不開、combobox 無 suggestions，疑擴充功能干擾）→ 改走 **Business Manager 系統用戶**路線（更正規、天生永不過期）：
  1. business.facebook.com→設定→**系統工作人員**：建「Daniel」（Admin，編號 61591783473458；建前要接受無歧視政策條款）
  2. **指派資產 ×3 全完整權限**：粉專 Ratio（1810574605902741）＋app Ratio Social Poster（2481180768960844，**早已存在且已 Live**——Phase B 整段跳過）＋IG ratio.crowsnest（17841455669003815）
  3. **產生權杖**：選 app、永不過期、勾 5 權限（pages_show_list/pages_read_engagement/pages_manage_posts/instagram_basic/instagram_content_publish；business_management 選不到、不需要）
  4. ⚠ **坑**：權限清單一開始沒有 pages_manage_posts——app 使用案例只掛了 Instagram。修法：developers.facebook.com→使用案例→新增「**管理粉絲專頁的所有內容**」（內容管理分類）→ 回去重開產生權杖就有了
  5. 系統用戶權杖（user 型）**不能直接發粉專文**→ 我用 `GET /me/accounts` 換出 **Page 權杖**存進 META_PAGE_TOKEN（繼承永不過期）；IG ID 用 `GET /{PAGE_ID}?fields=instagram_business_account` 查到
- **驗證**：curl 三查詢全通（page name/IG username 都對）；app 抽屜顯示兩帳號名＋豆清單 ✓
- **順帶**：privacy.html 已 commit（e62eaf3）**但老闆還沒 push**——app 早已存在所以這輪沒用到，推上去備著（Meta 合規遲早要）；Phase A 免做（粉專↔IG 本來就連好）；使用案例挑單裡看到 **Threads API**——日後 HANDLERS 加 threads 時回來掛
- **⏭ 第 3 輪**：挑一支上架豆真發（無痕驗公開可見）＋同豆重按驗防呆；Chrome 桌機登入身分是 Hung（director）
- **⚠ 安全備忘**：系統用戶權杖用完即棄沒存；Page 權杖只在 Supabase secrets；要作廢就去系統工作人員按「撤銷權杖」重生

## 〇、補記 — 2026-07-10 之十（🐛 晨報喇叭從沒出現過＋月報入口被 events 綁架）
- **症狀**：老闆「我介面沒有晨報，沒有月報」。
- **根因①（真 bug，喇叭）**：CSS `#hbell{...display:none}`（未登入店面不該有喇叭），但 `updateBell()` 顯示時寫 `b.style.display=''` ——清掉 inline 只會**落回 CSS 的 none**，所以喇叭**從上線起就沒出現過**。晨報只剩 `boot` 每天自動彈那一次（`seen!==todayKey()`），錯過或關掉就整天叫不出來。修：`''` → `'block'`（customer 仍 none）。**教訓：CSS 預設 display:none 的元素，JS 要顯示必須寫明確值，不能用空字串。**
- **根因②（月報入口）**：晨報底部「Next 30 days: N events ›」只在 `evAhead.length`（events 表）>0 時生成，計數也只算 events。老闆 events 表**一筆都沒有**，只有 staff_na 一筆（Joshua zhu 7/13–15）→ 按鈕不出現 → 月報從晨報完全進不去（唯一活路是 Tools→Daily task→Upcoming 磁貼）。修：`ahead=evAhead.length+naAhead`（未來 30 天請假數），文字改 `N item(s)`。
- **診斷過程備查**：Chrome MCP 在老闆線上登入態跑 `getComputedStyle(hbell)` 抓到 display:none 與命中規則；`DB.staffNa` 有資料、`openUpcomingSheet()` 真的列得出 Joshua——證明資料/RLS/渲染都正常，是入口的問題。
- **驗證**：jscheck ✓；preview mock——staff 喇叭 computed block 可見／customer none／未登入 boot 仍 none ✓；events 空＋一筆請假時晨報出現「Next 30 days: 1 item ›」✓；無 console error ✓。
- **順帶發現**：老闆那台瀏覽器登入身分是 `WHO='Wu'`、role=**staff**（不是 director）——若那該是老闆帳號，profiles.role 要改。

## 〇、補記 — 2026-07-11 之七（Post to socials：一鍵發豆子到 IG＋FB）
- **老闆需求**：一鍵把豆子「上架」到 FB/IG＝**發貼文**（拍板非 Meta 商店，嫌商業化）；按鈕放 Tools 想發才發。計畫檔同 `25-each-bag-dazzling-coral.md`（覆寫）。
- **新 edge `social-post` v1**（verify_jwt true，director-only 骨架抄 sync-to-square）：Graph API **v25.0**（`META_GRAPH_VERSION` 可覆寫）；secrets **META_PAGE_TOKEN/META_PAGE_ID/META_IG_ID（三顆都還沒設＝未連接狀態，等第 2 輪嚮導）**。action `status`＝未設 secrets 回 `{connected:false,reason:'not_configured'}`（HTTP 200 非 error）、token 死回 token_expired、正常回兩帳號名；action `post` {caption≤2200,image_urls≤10,targets}＝`HANDLERS={ig,fb}` **插座 map（日後 Threads/GBP 只加 key）**，逐平台獨立 try/catch 回 `{ok:任一成,results:{ig:{ok,id,permalink,error},fb:…}}`。postIG＝carousel 三步（/media is_carousel_item ×4→/media CAROUSEL children→輪詢 status_code 2s/60s→/media_publish→補 permalink）；postFB＝/photos published:false ×4→/feed attached_media[i]（URLSearchParams form-encode）。`humanizeError`：190→reconnect 人話、10/200/803/2207050→不是專業帳號沒綁 Page、media download→圖抓不到、4/9/32/613→rate limit。
- **前端（new/index.html）**：①抽 `shelfLiveBeans()`（原 openIGSheet 的 rtl_* 載入＋上架豆排序，兩處共用）②Marketing 磁貼「Post to socials」（data-t 'socialpost'）③`openSocialPostSheet`：status 檢查→未連接顯示「ask Claude to connect · one-time ~20 min」／已連接顯示帳號名＋豆清單（isSubName 濾訂閱商品）④`openSocialPostBean`：資料管線照 openPromoSheet（full/dots/info/col/promoCaptions 預填可改）＋**圖模式只給 Colour/Photo**（IG 只收 JPEG，透明會變黑）＋**防呆**（activity_log 查同豆今日 'posted socials'→黃字⚠＋加層 confirm）＋target 勾選由 status.targets 動態畫⑤`runSocialPost`：四張 JPEG 0.88→上傳 mail-assets `social-<slug>-<n>.jpg`（套 uploadCardForBean 寫法，任一失敗即停）→callFn post→逐平台 ✓/✗＋permalink 連結＋logAct（＝防呆資料源）。部分失敗（IG 成 FB 敗）按鈕鎖 Posted ✓ 防 IG 重複發，結果面標明哪個掛。
- **已查證（2026-07 官方）**：Business app 自用＝Standard Access **免 App Review**；Page token **永不過期**（改 FB 密碼/Meta 安檢才死，重跑嚮導 Phase C 即復原）；⚠ **app 要切 Live mode** 否則 FB 貼文只有管理員看得到。
- **驗證**：jscheck ✓；curl anon→401 ✓；本機 stub——磁貼 ✓、not_configured 引導面 ✓、已連接面帳號名＋豆清單（訂閱商品濾掉）✓、caption 預填/四縮圖/targets 勾選 ✓、上傳×4 檔名型別對＋post payload 完整 ✓、confirm 文案 ✓、全成→兩 permalink 連結+Posted ✓、部分失敗→逐平台 ✗ 人話+只出成功連結 ✓、console 零錯誤 ✓。
- **⏭ 第 2 輪（約老闆 ~20 分鐘，Chrome 帶做）＝Meta 授權嚮導**：A）IG @ratio.crowsnest 切專業帳號（Business）＋FB 粉專（沒有就建）＋Page↔IG 連結；B）developers.facebook.com 建 Business app→填 Privacy Policy URL→**切 Live**→抄 App ID/Secret；C）Graph Explorer 勾 pages_show_list/pages_read_engagement/pages_manage_posts/instagram_basic/instagram_content_publish（+business_management）→Generate→換長期 user token（/oauth/access_token fb_exchange_token）→/me/accounts 拿 Page token+PAGE_ID→/{PAGE_ID}?fields=instagram_business_account 拿 IG_ID→Token Debugger 驗 **Never**→Supabase secrets 三顆→app 磁貼看到帳號名 ✓。第 3 輪＝真發一支豆（無痕視窗驗公開可見）＋同豆重按驗防呆。

## 〇、補記 — 2026-07-11 之六（?shop 購物車訂閱：客人自助訂閱、付款自動進名單）
- **老闆需求**：訂閱上公開店面——?shop 加 Subscription 區（Blend / Single Origin 二選，$25 每兩週免運），客人加進現有購物車照常 Square 結帳；付款＝第一期（該單就是第一箱），**自動登記進 subscriptions**（source app、next_ship_date+14），下次 run sheet 他就在名單。豆子菜單不動。計畫檔同 `25-each-bag-dazzling-coral.md`（覆寫）。
- **三支 edge 各加一段**（checkout 收錢主路零改動）：
  - **sync-to-square v22** 新 action `ensure_sub_items`（director-only、冪等三層：product_sync 先查→Square 目錄**全名精確比對**→才建）：建兩個 catalog 商品「Subscription — Blend/— Single Origin」（variation "Fortnightly" $25）＋upsert product_sync（synced、grams 150）。⚠ 插在 `if(!sampleId)` 閘之前。不掛 Grind、不推圖。
  - **square-webhook v20**：Path B 匯入成功區塊（`if(inserted.length)`）尾加訂閱分支（**獨立 try/catch 絕不影響匯單**）：SUB_RE=`/^subscription\s*[—-]/i` 對 items → 有訂閱行且 customerId → 查重 `(customer_id,plan,active)`（重複購買→messages 提醒不再建）→ insert subscriptions｛plan 名字含 blend 判定、price=行價、next+14、last_order_id=匯入單｝＋messages「New subscriber」＋推播；**缺 email**（customer_id NOT NULL 建不了）→ messages「enrol manually」。防重放靠 inserted 空判（orders upsert ignoreDuplicates）。
  - **public-shop v11**：GET 回應加 `subs:[{plan,name,vid,price,grams}]`（product_sync 訂閱列＋Square 現價）；beans[] 被 QC 閘門天然濾掉訂閱商品（沒 locked sample）＝不會混進豆卡。**已驗證 allowedVarIds 在 QC 閘門之外**——訂閱 variation 天然可結帳。
- **前端（new/index.html）**：①`isSubName()` helper（em-dash 與連字號都認）②loadShopMenu 存 `SHOP_SUBS`③`shopSubCardHTML`/`wireSubCard`＝訂閱卡（輪播下方、每分類 tab 都在、空分類也在；pm-seg Blend/Single origin、$25、Add to cart；WS_MODE 不畫）④cartAdd 訂閱鎖 qty 1＋重複加 toast 擋；openCartSheet 訂閱行無 ± 顯示「a bag every fortnight · qty 1」；checkout payload 走原 {id,qty} 零改動⑤openSubsSheet 加一次性「Set up shop subscription items…」鈕（DB.syncs 兩列都在→灰字 live ✓）→callFn ensure_sub_items→reload⑥**噪音過濾 ×5**：beanNames()（New order/run sheet 選單不出訂閱名）、buildItems 烘豆需求（訂閱行不算豆）、濃縮 dial-in 過期卡、openRetailSheet、openIGSheet。**不濾**：裝箱清單與訂單卡（第一箱要真的裝）。
- **驗證**：jscheck ✓；curl public-shop v11——ok/beans 11 支照舊/subs:[]（商品未建，預期）✓；本機 stub——訂閱卡渲染+seg 切換+$25 ✓、加車 qty1+重複加擋 ✓、cart 抽屜訂閱行無±有 fortnight 字 ✓、混車 checkout payload {VSUBSINGLE qty1,VBEAN1 qty2} ✓、beanNames 乾淨 ✓、烘豆需求卡只算豆行（288g green 無 Subscription）✓、建置鈕邏輯（兩列在→不出）✓、console 零錯誤 ✓、截圖 ✓。
- **等老闆（部署後照順序）**：①Tools→Subscriptions→按「Set up shop subscription items…」（建 Square 商品＋註冊；再開抽屜看 live ✓）②curl 或重整 ?shop 看 Subscription 卡出現（public-shop 有 5 分快取）③**真機端到端**：自己 email 買一份訂閱→付款→今日流出現 Square 單（含 Subscription 行）＋subscriptions 自動多一列（+14 天）＋收「New subscriber ☕」推播→事後 Square 退款＋抽屜 Cancel 清理④Square Dashboard→Webhooks 挑該事件 **Resend** 驗防重（subscriptions 仍一列）。
- **注意**：webhook 訂閱判定靠**商品名前綴 'Subscription — '**——Square 後台改商品名會斷鏈（改價 OK 會跟）；qty>1 只建一筆訂閱、notes 記 qty 提醒跟客人確認。

## 〇、補記 — 2026-07-12 之二十八（Publish 清單改從 Coffee Stock 索取＋Coffee Info 補售罄鈕）
- **老闆點名**：Publish 面板裡的 list 只能從 Coffee Stock 索取（跟 QC 同源），不要自己撈「杯測 ∪ 上架」的另一套母體。老闆選方案 1：賣光沒庫存的豆不出現在 Publish，標售罄/下架改去 Coffee Info。
- **改動（new/index.html）**：①`paintPublishSheet`（3103 行）母體從「DB.samples ∪ DB.syncs」改成**重用 `rstRows(false) ∪ rstRows(true)`** 的名單去重（排除 isSubName）＝Publish 列的豆與 Coffee Stock 完全一致；空訊息＋副標文案跟著改（「the coffees in your stock → every channel」）②`openShelfBeanDetail`（Coffee Info 詳情，2404 行前）補 `sb-sold` 按鈕（只在已上架 syncRow＋canWrite）：Mark sold out / Put back on sale → `setShelfSold(nm,!sold)`（sold 變數同頁已算＝rtl_sold 或 paused）→ toast → reload＋openRetailSheet。原本詳情只有 Send back to QC；售罄鈕本來在 Publish，但 Publish 改母體後賣光豆消失，故售罄入口收進 Coffee Info（其母體仍含賣光的上架豆）。
- **為什麼要補 Coffee Info 售罄鈕**：Publish 母體縮成 Coffee Stock 後，「已上架但賣光（0 庫存、無 target/low）」的豆從 Publish 消失，而 Coffee Info 詳情原本沒有售罄鈕→會變成沒地方標售罄。補上才兌現老闆選的方案 1。
- **驗證**：jscheck ✓；serve 複本＋Chrome 預覽（攔 fetch）——Publish 母體只列有庫存豆（Dancer/Kiama），排除賣光的 Sold Bean＋訂閱；Coffee Info 母體仍含 Sold Bean；Coffee Info 詳情出 Mark sold out 鈕；點擊走 setShelfSold（無登入 session 時安全停在 callFn，**沒誤打線上**、DB 未動）；console 零錯誤＋截圖。⚠ **實際 Square 售罄寫入需登入**（同其他 sync-to-square 路徑）——老闆真機標一支賣光豆售罄確認。
- **注意**：Publish 母體＝rstRows（重算 batches/hp，Publish 用不到但正確性優先，同 Coffee Stock 開銷）。若日後改 Coffee Stock 的納入規則（rstRows），Publish 自動跟著變＝設計如此。

## 〇、補記 — 2026-07-12 之二十七（Coffee Stock Live 膠囊說真話：對齊店面的 QC gate）
- **老闆點名**：Coffee Stock 的 Live 狀態跟 ?shop 店面「完全沒有連結」。診斷屬實——兩條路徑用不同條件：Coffee Stock 的 Live 只看 `product_sync.status==='synced'`（單一條件，第 4096 行）；?shop 店面（public-shop v11/v12 GET）多一道 **QC gate**：豆必須有 `flavour_locked=true` 的 sample（`if(!s)return null`），否則店面看不到。所以 synced 但風味沒鎖的豆＝Coffee Stock 標 Live、店面卻沒有。**實查資料庫**（execute_sql）當下有 3 支：Kiama AA / La Molienda / Mwendi Wega AB（synced 沒鎖）＋ Finca Milan（paused 沒鎖）。脫節來源：上架沒勾 Lock、或 sb-requeue 送回重審解鎖風味但 Square 沒撤。
- **改動（new/index.html，rstRows/openBatchesSheet 三處）**：①rows.forEach 加 `x.locked`＝DB.samples（載入時已 .eq supplier 'Ratio Coffee'）有 flavour_locked 同名 sample＝與 public-shop 同條件 ②膠囊三態（4131 行）：paused→Sold out（danger）、synced+locked→Live（accent）、synced+!locked→**Not on shop**（琥珀 #B5791C 白字）③展開行（synced 沒鎖時）加琥珀提示「On Square but hidden from the shop — lock its flavour…（Lock flavours card in the daily flow）」。名字級判斷（同 x.sync），與店面一致；未動 buildItems 的 LOCKQ（今日流鎖風味卡照常）。
- **驗證**：jscheck ✓；serve 複本＋Chrome 預覽（攔 fetch）——三態豆各一：Dancer=Live(accent)、Kiama AA=Not on shop(rgb181,121,28)、Finca Milan=Sold out(danger)；展開 Kiama 出琥珀提示；console 零錯誤＋截圖（三膠囊對比清楚可讀）。
- **語意變更備忘（未來 session 注意）**：Coffee Stock 的 **Live 現在＝synced ＋ flavour_locked**（客人真看得到），不再只看 synced。synced 但沒鎖顯示 Not on shop。若日後 public-shop 的 QC gate 改了，這裡的 x.locked 判斷要跟著對齊。

## 〇、補記 — 2026-07-12 之二十六（?shop 店面分類改版：Blend｜Single origin｜Subscription）
- **老闆點名**：?shop 公開店面頂部分類 tab 移除 Classic/Innovation/Co-ferment，改成 Single origin＋Subscription；Blend 保留（老闆確認）；訂閱升級成獨立 tab（其他分類底下不再重複顯示訂閱卡，老闆確認可接受）。
- **改動（new/index.html，全前端 4 處，不動 edge/DB——分類是前端 derived）**：①`SHOP_CATS`（9955）→ `[['blend','Blend'],['single','Single origin'],['subscription','Subscription']]` ②`shopCategory(b)` 重寫＝有 recipe→'blend' 否則→'single'（舊 process 正則 co-ferment/anaerobic/… 三分支全刪，classic/innovation/coferment 三 key 消失、grep 確認無別處引用）③`renderShopTabs` counts 補 `if(!WS_MODE&&SHOP_SUBS.length)counts['subscription']=SHOP_SUBS.length`——訂閱算成有貨分類，沒訂閱/批發模式自動不出 tab ④`paintShopBody` 加訂閱分流：`SHOP_CAT==='subscription'` → 只畫 `shopSubCardHTML()`（獨立 tab）；其餘分類**移除末尾常駐 shopSubCardHTML()＋wireSubCard**（訂閱只在自己 tab）。重用 shopSubCardHTML/wireSubCard/cartAdd 全不動。
- **驗證**：jscheck ✓；serve 複本＋Chrome 預覽（攔 fetch 假 public-shop）——3 tab（Blend｜Single origin｜Subscription）、水洗/anaerobic/co-ferment 三單品全歸 Single origin、拼配在 Blend、Subscription tab 只有訂閱卡（方案切換＋加購入車 qty1）、Blend/Single origin tab 底下無訂閱卡、無 SHOP_SUBS→sub tab 消失、只有拼配→single 消失、批發模式→無 sub tab、console 零錯誤＋截圖 ×2。
- **等老闆真機**：部署後開 ?shop 看三個 tab、切 Subscription 下單一次確認。

## 〇、補記 — 2026-07-12 之二十五（Coffee Stock 加 Fix kg 模式：輸入錯誤直接改正）
- **老闆點名**：Coffee Stock 要能更改公斤數（輸入錯誤）。原本只有 Intake（加）與 Deduct（扣、要選 Defect/Transfer/Other 原因）——打錯數字只能假借 Defect 扣，污染瑕疵帳。
- **改動（new/index.html，openRstDeduct）**：Deduct 抽屜加 pm-seg 雙模式〔Deduct｜Fix kg · typo〕（RSTD.mode）。Fix 模式：Why 區隱藏、label 顯示「Correct total kg — now X kg」（選批次即時跟著變）、輸入該批**正確的總 kg** → Save correction＝調到位：diff>0 補到組內第一鍋、diff<0 組內依序減；**remaining_kg 與 roasted_kg 一起修**（是記錯不是耗損；Deduct 照舊只動 remaining）。logAct `corrected roasted kg`（note「舊 → 新 kg · 日期」）不進瑕疵帳。防呆：同值「nothing to fix」、負數/空值擋、零寫入。
- **驗證**：jscheck ✓；serve 複本＋fetch 攔截——5→0.5（remaining+roasted 同修、payload 對、血條 4/6 跟著動）、3.5→4（+0.5 只補第一鍋另一鍋不動）、防呆零寫入、Deduct 回歸（只動 remaining、帳記 defect）、console 零錯誤＋截圖。
- **等老闆真機**：部署後去 Coffee Stock 把那筆打錯的批次用 Fix kg 改回正確值。

## 〇、補記 — 2026-07-12 之二十四（QC 左右滑判定：右滑＝鎖頭 pass＋鎖風味、左滑＝downgrade、換鎖警訊）
- **老闆定案三題**：①左滑 downgrade＋confirm 警訊 ②右滑＝pass＋**必鎖風味**（鎖頭語意：風味確定才給過；上架/定價決定仍留在 publish List 卡，QC 不越權）③同豆已有鎖著批次＝「整批換掉」，架上風味/烘焙日期揭露訊息要跟著更新。
- **改動（new/index.html）**：①`attachQcSwipe` 改雙向（方向鎖 `Math.abs(dx)>18`、位移 ±130、回饋右綠左紅 `--danger` 22%、放手 ±35% 寬觸發）②新 helper `lockedMate(s)`＝記憶體找同名另一筆 flavour_locked ③`qcVerdict` 開頭統一兩道 confirm（滑動與泡泡按鈕共用）：downgrade→「Downgrade X? It will not be sold as this bean.」；pass 且同名已有鎖→synced 時「already has a locked batch on the shelf. Replace it? Shop info (flavours, roast date) will switch to this one.」／未上架時「Move the lock to this batch?」——取消＝整個判定不做（不產生 passed-沒鎖中間態）④pass＝必鎖（`v==='pass'&&s` 就 lockFlavourSolo；同名舊批自動解鎖＝每豆只鎖一個）⑤**換鎖且已上架**＝鎖成功後直接 `openListSheet({ref:s})`（Update 模式、價格記憶預填）＋toast「lock moved — push the update…」，老闆按一下 push 就把 Square 揭露換新（公開豆頁/資訊卡/出貨信本來就動態跟鎖走免管）⑥`QCLOCK` 開關整組退役（全域宣告、qtoggle、data-qact lock 全刪；泡泡改灰字「🔒 pass locks these flavours as the selling version」＋ Pass 鈕帶 🔒）；`pushListToSquare` 的 LST.lock（publish 端）不動。
- **驗證**：jscheck ✓；serve 複本＋Chrome 預覽（**fetch 攔截**假 Supabase）——右滑無同名鎖＝pass+鎖+寫入序列對（roasts→activity_log→samples 鎖→同名解鎖）；同名鎖+synced＝confirm 文案對、取消零寫入列彈回、確認＝同日兩鍋連動 pass+舊批解鎖+直開 Update 抽屜；左滑紅回饋+confirm、取消零寫入、確認 qc=downgrade 不鎖；縱向/12px 小滑不觸發；泡泡三編輯鈕+🔒Pass/Downgrade 走同警訊；console 零錯誤+截圖×2。
- **⚠ 測試陷阱（記取）**：本機預覽 stub **蓋 `window.sb` 沒用**——`const sb`（402 行）在 script scope，會直打線上 DB！這次好險假 id 不是 uuid 被 400 擋下。以後瀏覽器端假資料測試一律**攔 `window.fetch`**（supabase-js 底層）＋覆寫 alert/confirm；qcVerdict 失敗路徑的 `alert()` 會卡住自動化（原生對話框）。
- **等老闆真機**：滑一支待判定豆看左右手感（±35% 門檻可調）；真資料換鎖一次走到 Update push 看揭露換新。

## 〇、補記 — 2026-07-12 之二十三（QC 待判定右滑＝快速 pass）
- **老闆點名**：QC 待判定的豆右滑＝通知 pass（不用點開判定區）。
- **改動（new/index.html）**：新 `attachQcSwipe(el,q)`（照今日流 attachSwipe 精神）：只右滑、方向鎖（縱向讓抽屜捲動）、滑過 30% 寬變綠回饋、放手 >35% 寬才觸發 `qcVerdict(pass)`（含鎖風味/同日整批連動）＋toast；設 `_drag` 讓滑完的 click 不誤觸展開。openQCSheet 待判定列綁 attachQcSwipe＋click 加 `Date.now()-_drag<300` 防誤觸；dlab 提示「swipe right to pass」（canWrite 才顯示）。canWrite gate（唯讀不綁）。
- **驗證**：jscheck ✓；stub 模擬 PointerEvent——右滑 200px→g1:pass 寫入＋qc=pass ✓；縱向下拉→不 pass（讓捲動）✓；小右滑 12px（<18 locked 門檻）→不 pass、不誤觸展開 ✓；console 零錯誤。⚠ stub offsetWidth=32（抽屜未撐開）故門檻用絕對距離測；真機列寬幾百 px，滑到 35% 才 pass、綠回饋防誤觸。
- **等老闆真機**：實際手指右滑一支待判定豆確認 pass 觸發手感（會不會太靈敏/太鈍再調門檻 0.35）。

## 〇、補記 — 2026-07-12 之二十二（QC 導覽移除＋In hand highlight）
- **導覽移除 QC**：底部 nav 的 QC 顆刪掉（HTML 389＋active 9632＋click 9648）——QC 已是抽屜，改從 Tools qcgo 磁貼/今日流 qcnav 卡進；nav flex 自動三等分不改 CSS。commit ea6263e。
- **In hand highlight（老闆點名）**：openQCSheet 的 In hand（還沒 cup）列加回 `.qc-new`「New」泡泡＋淡 accent 底 highlight（`border-color:var(--accent)`＋`color-mix accent 9%`，CSS 早在 202-203 沒刪，抽屜版漏套）——跟下面待判定列（普通框）視覺區分。驗證：jscheck ✓（虛驚：上次 FAILED 是 jscheck 腳本自己 `ok?(...:...)` 三元筆誤，非 app）；stub In hand 有 qc-new 泡泡＋accent 邊＋color-mix 底，待判定無泡泡普通框 ✓ 截圖 NEW 泡泡醒目 ✓ console 零錯誤。

## 〇、補記 — 2026-07-12 之二十一（QC 改抽屜 popup：拿掉底部固定判定台）
- **老闆點名**：QC 的 foot banner（.deck 底部固定判定台）拿掉，QC 改成跟其他一樣的 popup 抽屜。老闆問建議→我推薦：判定「點豆就地展開」（同 Coffee Stock 手風琴）＋導覽 QC 按鈕保留但點了開抽屜。老闆批准。
- **改動（new/index.html）**：①`renderQC`（整頁＋deck）退役 → 新 **`openQCSheet()`** 抽屜：標題 QC＋分頁（Single/Blend）＋In hand 待杯測（同日合併，`.hit` 列點開 Cup）＋待判定清單（`.hit` 列點某筆 `selQC` toggle 就地展開判定區＝View/Edit・Edit/Add Stock・Roast Date・Lock toggle・Pass/Downgrade）＋Add a past batch/Shelf/Close。`qcnav()`＝相容別名。②**入口全改開抽屜**（不再 view='qc'）：qcnav 今日流卡(1045)、Coffee Stock cup(4186)、Tools qcgo(9073)、nav item(9543)、底部 nav-qc click(9648)→`openQCSheet()`。③**返回全導回抽屜**：qcVerdict(1160) 判完→抽屜開著就 openQCSheet；子抽屜 openQcStockSheet/openRoastDateSheet 存檔＋cancel→openQCSheet；saveCupSheet（新 cup＋editId 兩處）reload 後→openQCSheet。④render 分派移除 `view==='qc'` 分支(9626)；#deck 不再使用（HTML 預設 display:none，CSS 留著無害）。
- **保留**：分頁/同日合併/庫存同步/判定連動/鎖風味單選全照舊，只是容器整頁→抽屜。子抽屜 Cup/Recup 的 cancel 維持 closeDrawer（完全關，次要）。
- **驗證**：jscheck ✓；stub 混合佇列 → QC 開成抽屜（標題 QC、deck display:none）✓ 分頁 Single·2/Blend·1 ✓ In hand 合併列 ✓ 點待判定豆展開 6 顆判定鈕 ✓ 按 Pass → 判定寫入、抽屜保持開、Guji 從待判定消失（計數 2→1）✓ 切拼配分頁見 Dancer ✓ console 零錯誤 ✓ 截圖（Dancer 展開判定態、底部無 fixed banner）。
- **小注意**：QC 不再是 view → 底部導覽 QC 燈不再高亮（點了開 popup，同其他功能）；grep 確認無 renderQC/view='qc' 殘留（只剩一行註解）。

## 〇、補記 — 2026-07-12 之二十（QC 同日批次合併：In hand 合併＋判定整批一起判）
- **老闆點名**：QC 裡同一支豆同一時間（同烘焙日）出現的合併。
- **改動（new/index.html）兩處**：①**renderQC 的 In hand（cupSec）** 同 name+process+roast_date 分組一列（顯示「N roasts」＋green_kg 加總；點擊開組內第一鍋 openCupSheet）——同 Coffee Stock 的 rstGroupByDate 概念，但 QC 這區是跨豆列表故按三鍵分組。②**qcVerdict 整批一起判**：判定某鍋後，找同 name+process+roast_date 且 qc=null 的其他鍋（mates）一起 update qc——**否則合併顯示的其他鍋 qc 還是 null，判完又冒出來**。
- **為何 QCQ（待判定）不用改**：QCQ 靠 buildItems 的 seen（bean_id 或 sample_id+process）本就一豆一列，不會同日多列；同日多鍋的連動由 qcVerdict mates 補完。
- **驗證**：jscheck ✓；stub Guji Washed 同日 3 鍋＋別日 1 鍋 → In hand 合併（4d「3 roasts · 14 kg green」一列＋2d 一列，data-tocup=第一鍋 g1）✓；判 g1 pass → g1/g2/g3 一起 pass、g4（別日）不動 ✓；判定後 buildItems 重繪 4d 組整批消失、只剩別日 ✓；console 零錯誤。
- **注意**：合併鍵含 process（同名不同處理法不會誤併，同之前的分開邏輯）；下游 rstGroupByDate（Coffee Stock）本就同日合併，一致。

## 〇、補記 — 2026-07-12 之十九（QC 清單跟 Coffee Stock 同步：只顯示有庫存批次）
- **老闆點名問題**：單品熟豆還沒判定就被拿去拼配（consumeBlendParts FIFO 扣光 remaining→0），Coffee Stock 因 remaining>0 即時消失，但 QC 只看 qc=null 不看庫存 → 豆一直掛在 QC。真實案例 La Molienda（0 kg 還在 QC）。老闆定調：QC 從 Coffee Stock 拿豆單＝只顯示 remaining>0。
- **老闆拍板（AskUserQuestion）**：採**嚴格 >0**——連「烘了沒填烘出重量（remaining=null）」的 5 支新豆（Finca Milan/Gatitu AA/Kiama AA/Mwendi Wega AB）也從 QC 移除；要杯測先去 Coffee Stock Intake 補重量。
- **改動（new/index.html，buildItems 一帶 3 處）**：①toCupList filter 加 `Number(r.remaining_kg)>0` ②QCQ push 條件加 `&&Number(r.remaining_kg)>0`（沒庫存不進、不 return→自然不長 List/Lock 卡）③matchRoast **有貨優先**（`withStock=cands.filter(>0); pool=withStock.length?withStock:cands`）——同名一批吃光一批有貨時，sample 掛到有貨那批判定。
- **連帶（都合理沒另改）**：Today qc 計數卡、Coffee Info re-checking 標示跟著收斂；Coffee Info 母體不變（看資訊視角，samples∪syncs，沒庫存也能查）。
- **驗證**：jscheck ✓；stub Guji（吃光 rG0＋有貨 rG1）→ QCQ 只掛 rG1(3kg)＝有貨優先生效 ✓、Kii(null) 消失 ✓、La Molienda(0) 不在 tocup ✓、Today 計數=1 ✓；renderQC 只顯示 Guji（判定台跟著、單品計數 1）✓ console 零錯誤。
- **等老闆（push 後真機）**：La Molienda＋5 支 null 會從 QC 消失；那 5 支要杯測先 Coffee Stock → Intake 補烘出 kg。

## 〇、補記 — 2026-07-12 之十八（QC 頁分單品/拼配分頁）
- **老闆點名**：QC 裡分單品和拼配。tocup（toCupList）與 QCQ 的項目都是 roasts、帶 kind → `kind==='blend'` 判斷。
- **改動（renderQC）**：新 `QCSEG`（'single'/'blend'，保留上次同 RST.seg）。頂部 pm-seg「Single origins · N｜Blends · N」（各帶當前數量＝tocup+QCQ）；In hand（tocup）與待判定清單（QCQ）都 filter 成當前分頁；判定台（deck）的選中 q 從當前分頁 queue 取、selQC 換分頁自動落當前分頁第一筆；空分頁顯示「No blends/single origins in QC」。**hcnt 標題計數維持全域**（總 waiting/to cup），分頁計數在膠囊上。
- **順手**：Coffee Stock 缺資訊那支點「Cup it in QC →」跳轉時 `QCSEG=isBlend?'blend':'single'`——落地分頁對得上該豆。
- **不動**：QCQ/toCupList 本體（Today 卡計數等共用）；judging deck 內容、鎖風味、Pass/Downgrade 照舊。
- **驗證**：jscheck ✓；stub 混合佇列（2 單品＋2 拼配，各 1 待判定 1 in-hand）→ 單品分頁只見 Guji（判定台 Guji、計數 2/2）✓ 切 Blends 只見 Dancer（判定台跟著切 Dancer、單品零洩漏、selQC 自動 r3）✓ console 零錯誤、截圖乾淨。

## 〇、補記 — 2026-07-12 之十七（Coffee Stock 同日批次合併：同天幾鍋＝同一批）
- **老闆點名**：同支豆同一烘焙日期的多筆批次在 Coffee Stock 合併顯示，不分開列。
- **改動（new/index.html）**：新 `rstGroupByDate(batches)`＝FIFO 順序按 roast_date 分組（無日期＝一組）。**資料層各筆保留**（QC 判定/流水帳不動），只有顯示與扣豆按組：①血條段按組畫（同日一段）②展開批次列表一組一行（kg 加總＋「N roasts」標；QC ✓ 要全組 pass 才標）③openRstDeduct 重構＝chips 按日期組（RSTD.batch→gkey）、超量檢查用組總量、**扣豆組內依序扣**（同 deductOrderStock 邏輯，中途失敗講明已扣多少）。
- **驗證**：jscheck ✓；stub 同日兩鍋（2＋1.5）＋另日一鍋 → 列表兩行（17/06 · QC ✓ · 2 roasts · 3.5 kg）✓ 血條 2 段 ✓ deduct chips 合併 ✓ 扣 3 kg 跨鍋（第一鍋 2→0、第二鍋 1.5→0.5、別天不動）✓ 超量擋（剩 0.5 扣 1 → toast 擋）✓ console 零錯誤。

## 〇、補記 — 2026-07-12 之十六（Coffee Info 資訊源＝QC 鎖風味＋鎖改單選「在賣的版本」）
- **老闆定調**：Coffee Info 的訊息從 QC 來（本就如此——shelfSampleFor 讀 samples 鎖優先）；**同名重複豆由「鎖風味」決定賣哪支** → 鎖改**單選**。
- **改動（new/index.html）**：①新 `lockFlavourSolo(s)`＝鎖這筆＋`samples update flavour_locked=false where supplier='Ratio Coffee' ilike sample_id neq id` 同名其他筆自動解鎖（記憶體同步）②qcVerdict pass＋QCLOCK 改走 solo（已鎖的再 pass 也會清別筆——pass＝宣告這筆是在賣的版本）③List 抽屜 Lock flavour description 也走 solo ④Coffee Info 行掛髒資料警示：同名鎖 >1 → 紅字「N locked — pass the one on sale in QC」。
- **語意**：鎖風味＝「這筆杯測是對外販售版本」——Coffee Info/資訊卡/公開豆頁/出貨信全跟它走（各處 order flavour_locked desc 本就鎖優先，資訊源不用動）。
- **驗證**：jscheck ✓；stub Finca Milan 兩筆（April 舊鎖＋Sakura 新 pass）→ update 序列（鎖 sB→解鎖 neq sB）＋記憶體 April 解鎖 ✓、toast 照舊 ✓；髒資料兩筆都鎖 → Coffee Info 紅字警示 ✓；console 零錯誤。**真資料掃過：目前無同名多鎖髒資料**（警示是防未來）。
- **等老闆**：重複豆（同名多筆杯測）以後想換賣哪支＝去 QC 對那筆按 pass（或 View/Edit 改完 pass），舊的自動退位。

## 〇、補記 — 2026-07-12 之十五（Coffee Stock 處理法分開：同名豆不再混血條）
- **老闆點名**：Coffee Stock 要顯示處理法、不同處理法分開列。真實痛點＝**Finca Milan 有 6 種 culturing**（另 Alo Village/Hakuna Matata/Los Nogales 各 2 種），原本名字級匹配全混成一行血條。
- **資料層（migration `roasts_add_process`）**：roasts 加 `process text` 欄＋兩段回填——①bean_id 直連 beans ②bean_id 空但名字唯一 process 的安全回填。**單品批次 24/24 全回填**。loadAll roasts select 加 process（欄位串尾加，rs 索引不動）。
- **匹配核心（new/index.html）**：新 `rstProcMatch(r,process)`——**process 參數 undefined＝不過濾（名字級，向後相容）；給字串（含空字串）＝精準過濾**。rstBatches/rstStockKg/blendPartPool 全加第三參數。
- **分組**：rstRows 單品改 name+process 一行（seen key `name|proc`；批次孤兒同）；行物件帶 `proc`＋`key`；RST.open 由名字改 **key**（不然同名兩行一起展開）——rst-sv/rst-go/data-bat 三處 find 跟著改。行顯示：豆名旁 process 灰字（同 Coffee Info 樣式）；deduct 抽屜標題同。
- **寫入點跟進**：saveRoastSheet rec 加 `process:b.process`；saveBackfill 單品選豆帶 `sel.process`（打字＝null）；deductOrderStock 訂單行有 `it.process` → 精準扣（沒有→名字級照舊）；consumeBlendParts/Log roast 成分 stock 顯示帶 `p.process`（配方 parts 本就存 process；舊配方沒記→名字級）；「Roast this」預選改用 `x.ref`（原名字 find 會抓到第一支同名豆）。
- **不動**：拼配匹配照舊名字級（拼配沒 process 概念）；Publish/低庫存卡的 rstStockKg 名字級加總（Square 商品＝名字級）；noInfo 判斷維持名字級（samples process 記法不一致，收緊會亂紅——待統一再說）。
- **驗證**：jscheck ✓；stub Finca Milan ×2 process＋無 process 孤兒 → 三行分開（3/1.2/0.5 kg）、名字級 4.7 向後相容 ✓、展開只見自己批次、key 展開互不干擾 ✓、console 零錯誤、截圖（April Culturing 灰字＋綠條、孤兒行灰條）。
- **等老闆（push 後真機）**：Coffee Stock 看 Finca Milan 六支分開了沒；扣豆/Intake/Log roast 走一遍。

## 〇、補記 — 2026-07-12 之十四（刪豆同步 Coffee Stock：清幽靈行）
- **老闆回報**：Delete a coffee 刪掉的豆在 Coffee Stock 還會列。**根因**＝rstRows 列名條件：單品靠 beans.roast_target_kg/roast_low_kg（刪豆流程沒清）、拼配靠 blends 配方（刪豆流程沒刪）→ 0 kg 幽靈行。
- **修（confirmDeleteCoffee）**：刪除清單補兩步——①`beans.update({roast_target_kg:null,roast_low_kg:null})`（熟豆閾值，非生豆庫存，原則不破）②同名 blends 配方整列刪（confirm 訊息先列明「the blend recipe (and its brew guide)」；成分豆不動）。孤兒護欄（批次還有血就列）**保留**——那是防帳目消失的，正常刪豆 roasts 已整列刪不觸發。
- **驗證**：jscheck ✓；stub 重現兩種幽靈行（單品閾值/拼配配方）→ 跑刪豆 → 操作序列 samples→roasts→product_sync→beans 清閾值→blends 刪配方 ✓、confirm 訊息含 recipe ✓、模擬 reload 後兩分頁幽靈行消失 ✓、console 零錯誤。
- **真資料盤點**：現存幽靈只有拼配 **May Project**（0 杯測 0 批次）——等老闆確認是「刪過的豆殘留」還是「還沒開工的配方」，是前者我 SQL 代清。單品無殘留。

## 〇、補記 — 2026-07-12 之十三（Coffee v3：Claude Design 迭代定稿→拆成 Coffee Stock＋Coffee Info 實作）
- **工作流首例**：老闆指定改用 **claude.ai/design 迭代設計再實作**。DesignSync 推設計卡到「Ratio Design System」專案（projectId fdec005c…，**此專案卡片走 legacy register_assets 顯式註冊**——只 write_files 老闆看不到卡）。兩輪迭代：v2 合併版「太複雜」→ v3 拆兩顆定稿。設計卡三張留專案裡（coffee-stock/coffee-info/coffee-intake.html）＝之後改版的底稿。
- **「Coffee Stock」**（Roast 區磁貼，data-t='batches'）：①頂部圖例（黃 aging <21d/綠 ready 21-42d/紅 fading >42d/灰無日期——閾值同 shelfFreshness）＋總計行＋「＋ Intake」大鈕（呼叫 openBackfillSheet，`BF.from='coffee'`＝存完回 Coffee Stock、tab 跟當前分頁；toast 分兩種：有杯測「In stock ✓ — in the QC queue」/沒杯測「In stock ✓ — no coffee info yet, cup it in QC」）②**血條改新鮮度上色**（`rstFreshColor(rd)` 新函式；RST_OPS opacity 輪刪除；低量不再整條轉紅——警示留 label low!/over! 紅字）③批次列表每行新鮮度色點＋**行可點＝openRstDeduct(x,preBatch) 預選該批**（第二參數新增）＋deduct 批次 chips 也帶色點④rstRows 補 `x.noInfo`（無 shelfSampleFor）→ 豆名旁紅字「no info — cup it」＋展開區「Cup it in QC →」跳 QC 頁⑤上輪的風味摘要行/「Coffee info →」chip 移除（資訊歸 Coffee Info）。
- **「Coffee Info」**（Roast 區磁貼恢復，data-t='retail'）：openRetailSheet **母體擴大**＝自家 samples ∪ 上架 syncs（未上架/沒杯測的也列——純看資訊的地方）；行 sub 改「新鮮度＋風味前 3」（價格移到詳情；「no price」只對上架豆警示；re-checking in QC/flavour unlocked 警示照舊）；沒杯測＝紅字 no info；膠囊只上架豆有。**openShelfBeanDetail 拆成純資訊頁**：sb-edit/sb-sold/sb-promo/sb-ann/sb-card 五顆行銷鈕全移除（功能在 Publish/Print 都有），只留 **Send back to QC**（放錯資訊退回重審，別處無入口）＋back；`from` 參數退掉（上輪加的，已無呼叫者）。
- **驗證**：jscheck ✓；stub 批次 3d/30d/50d/無日期→血條黃綠紅灰四色正確、圖例、總計、target 撐大灰段 ✓；Intake：tab 預選、from='coffee'、存無杯測豆→no info toast＋回 Coffee Stock＋from 清掉 ✓；點批次行→deduct 預選 12/06 那批 ✓；Coffee Info 母體（上架 Guji 有 Live 膠囊＋未上架 Unlisted Bean 無膠囊都列）✓；詳情頁按鈕只剩 sb-requeue/sb-back/d-cl ✓；磁貼 Coffee Stock＋Coffee Info 在 Roast 區、舊「Coffee」消失 ✓；console 零錯誤；截圖與設計卡一致。
- **等老闆（push 後真機）**：Tools→Coffee Stock 走一遍 Intake→看血條顏色→點批次扣豆；Coffee Info 點幾支豆看詳情；確認 Send back to QC 還順手。
- **⚠ 記憶點**：血條紅色現在＝「過賞味期」不是「低庫存」——低庫存看 kg 標籤的 low! 紅字。

## 〇、補記 — 2026-07-12 之十二（豆子管理大統整：Coffee 合併磁貼＋Publish 一鍵上架＋QC Edit/Add Stock）
- **老闆三連發**：①Coffee Info＋Roasted Stock 統整成一顆看庫存＋咖啡資訊 ②一鍵上架面板（過 QC 的豆看所有渠道狀態＋控制上架下架＋上架訊息）③QC 的 Menu Card 換 Edit/Add Stock。全部**薄殼整合**——按鈕全接現有函式，新函式只 3 支（openPublishSheet/paintPublishSheet/openQcStockSheet）。
- **①「Coffee」磁貼**（Roast 區，原 Roasted Stock 改名升級）：rstRows 每行掛 product_sync 同名狀態→豆名旁 **Live/Sold out 膠囊**；展開區加**新鮮度＋風味前 3 摘要**＋「**Coffee info →**」鈕（await shelfLiveBeans 拿 m→openShelfBeanDetail 第三參數 `from='stock'`——back 鈕/售罄回跳都回 Coffee 不回 Coffee Info）。**Marketing 區 Coffee Info 磁貼移除**（openRetailSheet 函式保留、dispatch 分支保留防手滑復原）。
- **②「Publish」磁貼**（Marketing 區，同區 Post to socials/IG asset/Announce 三顆一併移除——四合一）：`openPublishSheet`＝母體「自家杯測豆 ∪ 已上架豆」；每列 QC 膠囊（QC ✓/not judged/downgraded/re-roast）＋渠道行「Shop (Square + Ratio): Live/Sold out/— · FB/IG: Xd ago · Email: Xd ago」（**Square 與 Ratio 店面同一條管線**＝product_sync，一顆膠囊組；FB/IG/Email 看 activity_log 'posted socials'/'announced coffee' 最新一筆，**announceShelfBean 成功處補了 `logAct('announced coffee',nm)`**）；排序＝pass 未上架最上（該上了）→已上架→未過 QC 沉底灰。展開（canWrite）＝tint 卡 caption 快評（風味＋comment）＋五顆鈕：List/Update listing→openListSheet、Mark sold out/Put back→setShelfSold、Email→announceShelfBean（沿用內建 QC 閘門/confirm）、Post FB+IG→先查 social-post status（未連線文案照 openSocialPostSheet）→openSocialPostBean、IG asset→openPromoSheet；**無杯測紀錄的純 sync 孤兒**：list/email/ig 鈕 disabled＋紅字提示；未過 QC 展開＝「Pass QC first」。
- **③ QC deck**：Menu Card 鈕→「**Edit/Add Stock**」→`openQcStockSheet(q)`：現量顯示＋「Add to stock (kg)」增量（即時 new total）＋Roast date 欄（預填該批；老闆點名——日期防跟別批混掉）；存檔 update roasts `remaining_kg=cur+add`＋`roasted_kg+=add`＋`roast_date`，日期有改連動 samples.roast_date（照 openRoastDateSheet 邏輯）；logAct 'added stock'；**不動 beans、不寫 stock_moves**（同 Add a past batch 語意）；負數擋（扣血去 Coffee 的「−」）；add=0 可只改日期。openCardPreview 函式保留（僅斷 QC 入口；卡圖在 Publish 的 IG asset 仍可看）。
- **驗證**：jscheck ✓；stub 三態豆（pass+synced／pass 未上架／未 judge＋paused 拼配）——Coffee：標題/Live/Sold out 膠囊/展開摘要「roasted 7d — aging · peach · jasmine · honey」/Coffee info → 開詳情＋back 文字「‹ Back to Coffee」✓；Publish：列表排序與膠囊全對、FB/IG 2d ago（stub activity_log）、展開五鈕（未上架無 sold 鈕）、openListSheet spy 帶對 sample、未 judge 展開「Pass QC first」✓；QC：按鈕列 View/Edit｜Edit/Add Stock｜Edit Roast Date、+2.5 即時 new total、payload {remaining_kg:4.5,roasted_kg:4.5,roast_date} ✓、生豆零寫入 ✓、負數擋 ✓；磁貼：Coffee/Publish 在、四顆舊磁貼消失 ✓；console 零錯誤；截圖 ✓。
- **等老闆（push 後真機）**：①Tools→Coffee 看膠囊＋展開資訊＋Coffee info 跳轉 ②Tools→Publish 挑支豆走一遍（上架訊息/售罄切換）③QC→Edit/Add Stock 補一筆真庫存 ④FB/IG 與 Email 的「發過沒」從今天起才有紀錄（歷史發文沒 logAct 所以顯示 —，正常）。

## 〇、補記 — 2026-07-12 之十一（QC 判定按鈕改名 ×2）
- 老闆點名，QC judging deck 那排按鈕（5247-5249）改名，純文字、功能不動：①「Re-cup」→「View/Edit」（含抽屜標題 4407 `CUP.editId?...` 同步；語意＝帶原杯測紀錄看/改、存檔 update 同一筆）②「Card」→「Menu Card」（q-card，開 openCardPreview 風味卡預覽）。驗證：jscheck ✓、stub QC deck 三顆按鈕＝View/Edit｜Menu Card｜Edit Roast Date、抽屜標題 View/Edit、無 Re-cup 殘留、排版不跑版、console 零錯誤。

## 〇、補記 — 2026-07-12 之十（Add a past batch 加 Single/Blend tab）
- **老闆需求**：補「漏網之魚」熟豆時，單品走 Add a past batch、拼配走 Log roast Blend＝兩個入口易混。要在 Add a past batch 裡直接 tab 切 Single origin / Blend。
- **改動（new/index.html · openBackfillSheet/saveBackfill 5292 起）**：①新增 `BF={mode,...}` 狀態物件 ②頂部 pm-seg tab（照 Log roast `ro-m-s`/`ro-m-b`＋`grab()` 保值重繪 pattern）③Single 分頁＝現況（豆下拉＋打字）；Blend 分頁＝配方下拉（`DB.blends`，空的提示去 Recipe）④`saveBackfill` 分兩路：single 現況（kind 未設）；**blend insert `kind='blend'`＋`recipe` 快照＋`remaining=out`，關鍵——不呼叫 `consumeBlendParts`（不扣成分）**＋kind/recipe 欄 fallback（照 saveBlendBatch 5069）。
- **設計哲學（定調）**：**Log roast＝當天現烘（動庫存：單品扣生豆、拼配扣成分）／ Add a past batch＝補歷史（完全不碰其他庫存）**。因 backfill blend 不扣成分→之前「先拼配後單品」的順序講究**消失**，補豆順序隨便。
- **驗證**：jscheck ✓；stub——tab 切換保值 ✓、Blend payload（kind=blend／green_kg=null／recipe 快照 blend_id／remaining=6.15）✓、**成分批次 5→5 沒被扣** ✓、進拼配貨架 `rstStockKg('Dancer',true)=6.15`、沒混單品貨架(false)=0 ✓、Single payload（kind 未設）進單品貨架 3.3 ✓、console 零錯誤、截圖 UI 乾淨。
- **補豆 SOP 簡化**：全部走 **Add a past batch → tab 切單品/拼配 → 填現貨量＋實際烘焙日 → 順序隨便**。Log roast 完全不動；Dancer 建議用新的 Add a past batch → Blend 補（不扣成分最乾淨），若之前已用 Log roast Blend 補過就不用重補。
- **等老闆**：push 後真機 Add a past batch 切 Blend 補一支真拼配、Roasted Stock → Blend 分頁對血條。

## 〇、補記 — 2026-07-12 之九（刪 classic 後孤兒巡檢 debug）
- **老闆要求「看有沒有孤兒 debug」**（切 opus-4-8）。系統掃描（python 抽 533 個函式定義 vs 全檔呼叫次數；磁貼 data-t vs dispatch 分支；classic 引用全掃）。
- **結論① 刪 classic 沒斷任何新殼功能**：classic 是獨立檔案，新殼函式從不被它呼叫→刪檔不可能產生孤兒函式。磁貼 33 顆 key 與 dispatch 分支一對一完整、det2 分派對稱、CLASSIC 常數/data-classic/_off 引用全歸零（前一輪已清）。
- **結論② 但留 5 處活 UI 文案指向死 app（本輪修）**——前一輪手改漏網，措辭變體 grep 沒抓全：①訂單抽屜副標 `cancelled orders live in the classic app`→`are not shown`（loadAll neq Cancelled，新殼本就不顯示）②訂單抽屜 `N older orders in the classic app`→`are not shown`（只顯前 25）③拼配庫存不足 alert `Fix batch numbers in the classic app (History → Batch stock)`→`Check the batch levels under Tools → Roasted Stock`④Recipe 唯讀者空狀態 `add them in the classic app`→`ask a manager to add them`⑤罐標無配方 `add it in classic F(x) → Blending`→`add it under Tools → Recipe`。
- **結論③ 附帶清 1 個既有死碼**：`fmtDate`（8804，07-10 移植 ?bean 時搬入但全檔零呼叫，實際用 fmtD）刪除。init 是 IIFE 標籤名（誤報）。
- **驗證**：jscheck ✓；classic 活 UI 殘留全掃歸零（僅剩程式碼註解提「照 classic …」＝來源說明，無害）；本機 stub——訂單抽屜副標＋舊訂單提示新文案、抽屜內零 classic 字 ✓；console 零錯誤。
- **教訓**：文案類殘留手改必漏——措辭變體多（in the/live in/add it in classic F(x)）。**應一開始就 grep 全檔 classic 字樣排除註解**，別靠肉眼。

## 〇、補記 — 2026-07-12 之八（🏁 閹割階段三：classic.html 整檔刪除＋#7 Files 薄殼收尾）
- **老闆拍板「可以刪classic」**＝#7 不另移植、階段三開跑。刪之前全面盤點依賴，發現並處理：
- **陪葬品盤點（刪之前查清楚）**：①**Bookkeeping off 磁貼＝空頭支票**——classic 裡根本沒這功能（4003 行自己寫著 expenses are not tracked yet），磁貼直接刪 ②**QR codes off 磁貼**——刪（?shop/?fb URL 沒變，要 QR 隨時可再生）③**classic Files 三份文件**＝repo 根靜態檔（刪 classic 檔案還在）→ **補薄殼**：Tools App 區「Files」磁貼＋openFilesSheet 三連結（Agreement docx download／SCA forms／Roasting manual PDF target=_blank）。classic 列的 Agreement **PDF 版檔案根本不在 repo**（死鈕）——只列存在的三份 ④**Team notes 刪除原本「留在 classic」**→ 補進新殼：note 行尾 × 鈕（canWrite）＋confirm＋delete messages by id
- **新殼清 classic 引用（new/index.html）**：CLASSIC 常數刪；今日流 roastlog/low 卡 det2 'Open classic app' 刪（low 卡 Rotation 文字改指 Tools → Sample analyse）；all-clear 空狀態連結刪；訂單抽屜/Look up 抽屜 'Open in classic app' 連結刪；Recipe 唯讀者 'Edit blends in classic' 連結刪；Tools App 區 'Classic app' 磁貼刪＋_off() 函式整組刪；Help 文字改；客戶抽屜 'older in the classic app' 改 'older not shown'
- **外圍檢查**：vercel.json 乾淨（只有 / → /new/ rewrite）；send-email 源碼拉下來掃過——所有連結都是 APP_URL/?fb、?shop（根網址＝新殼），零 classic；推播 url 都是 '/new/'；全 repo grep classic.html 引用歸零（只剩新殼註解）
- **驗證**：jscheck ✓；本機 stub——Classic app 磁貼消失 ✓ off 磁貼歸零 ✓ Files 磁貼＋抽屜三連結（download/open 屬性各就位、連結字色修過 --ink 不再瀏覽器藍）✓ notes 副標改＋× 刪除（confirm→delete id 驗到）✓ UI 零 'classic app' 殘字（只剩源碼註解）✓ console 零錯誤
- **等老闆**：push 後 `/classic.html` 會變 404（正常）；若手機主畫面還有 classic 捷徑可刪掉
- **⚠ 記憶點**：查 classic 舊實作＝`git show 786f556:classic.html`（786f556＝刪除前最後一個 commit）

## 〇、補記 — 2026-07-12 之七（Contacts 通訊錄＋Admin 開帳號：缺口 #8/#9 雙移植）
- **老闆點單「8 and 9」**：兩項一輪交付。
- **#8 Contacts（new/index.html）**：①Orders & customers 區磁貼 `['Contacts','suppliers · partners','contacts',_mk?1:0]`＋dispatch ②`openContactsSheet/renderContactsList/openContactEdit`（openTeamSheet 前）＝classic openContacts/saveContact/deleteContact 移植：contacts 表（**表已存在**，id/name/type/company/email/phone/notes/address 全對上）、類型四色膠囊照 CT_COLORS（Supplier 褐/Customer 玫瑰/Roaster 綠/Service 紫）、chips 過濾、編輯表單七欄、**insert/update payload 逐字照抄**（空欄→null）；刪除改新殼 confirm（classic 兩段按鈕）；**補 logAct**（added/edited/deleted contact——classic 沒記）。讀人人可看、寫入 canWrite 守門（classic 無 gate，新殼慣例收緊）。
- **#9 Admin 開帳號（new/index.html）**：真相＝classic Admin 頁只有「密碼閘＋改角色」，**開帳號其實是登入頁自助 signUp（2666）**；新殼登入「只登入不註冊」→ 真缺口＝開帳號。做法：Team 抽屜 Accounts 區（director only）尾加「+ Add account」→`openAddAccountSheet`：name/email/password(6+) 表單→**signUp 走獨立 client（persistSession:false＋autoRefreshToken:false，classic getAuthCheck 同招）**——不然 supabase-js 會把老闆當前 session 換成新帳號；payload 照 classic（options.data.name）；session null（email confirmation 開著）→ toast 提醒「must confirm the email」；新帳號 role 走 DB 預設，回 Accounts 點 chips 指派（複製 classic「註冊→Admin 改角色」流程）。**密碼閘不搬**——新殼用 ROLE==='director' 守門，能按到的 director 就是本人。
- **驗證**：jscheck ✓；本機 stub——磁貼在 Orders & customers ✓、假資料兩筆列出＋Service 過濾 ✓、編輯帶值 ✓、update payload（改 phone/清 email→null）✓、無名擋「Name is required」✓、insert payload ✓、刪除 confirm 措辭＋列表移除 ✓；Add account——空值/短密碼擋 ✓、**createClient opts 驗到 persistSession:false** ✓、signUp payload ✓、confirm-email toast＋回 Team ✓；console 零錯誤；截圖乾淨（膠囊四色）。
- **等老闆**：push 後真機①Tools→Contacts 把常用供應商建進去②Team→Add account 開一個測試帳號走一遍（記得 Supabase 若開 email confirmation，新人要先點信）。
- **缺口清單只剩 #7 Files**（等拍板：建議改雲端硬碟）。

## 〇、補記 — 2026-07-12 之六（C Market 生豆行情移植：缺口 #2）
- **老闆點單「2」**：C-Market 移植（我原建議「開 TradingView 就好」，老闆拍板要搬進新殼）。classic renderCMarket/cmCalcHTML/initCMarketCalc 移植。
- **改動（new/index.html）**：①Production 區磁貼 `['C Market','futures · landed cost','cmarket']`（唯讀不上玫瑰色）＋dispatch→`openCMarketSheet` ②**openCMarketSheet**（openCalcSheet 前）：TradingView advanced-chart embed（`CMK_SYMBOL='CAPITALCOM:COFFEE'` 同 classic；**theme 跟新殼當前明暗**——root.classList dark/light＋matchMedia auto 判斷，classic 固定 light）＋落地成本試算（Coffee C ¢/lb＋Differential→FOB→÷0.4536÷AUD/USD→A$/kg＋freight＝landed×lot size；**公式逐字照抄** initCMarketCalc）＋匯率 live 鈕（open.er-api.com，同 classic）③CSS 只加 `.cmk-chart/.cmk-load/.cmk-total` 三組，輸入列/stat 卡**重用 .cx-\*／.dlab／.chip**（比 classic 的 .cmc-* 整套省）。純看盤試算、不寫 DB、無 logAct。
- **驗證**：jscheck ✓；本機 stub——預設值 FOB A$11.47/kg（=classic 公式手算一致）、改 C 250＋freight 1.5 即時重算 ✓、live 匯率真抓到 0.6951＋updated 時戳 ✓、TradingView 真圖載入（Coffee US 3.30275 即時報價、暗色主題跟上）✓、Tools 磁貼在 Production 區＋點擊開抽屜 ✓、亮色模式重開正常 ✓、console 零錯誤。
- **小陷阱**：TradingView iframe 上的觸控/滾輪被 iframe 吃掉——抽屜要捲動得摸圖表以外的區域（classic 全頁面板沒這問題，抽屜版接受）。
- **等老闆**：GitHub Desktop push→真機 Tools→C Market 看圖＋試算一遍。

## 〇、補記 — 2026-07-12 之五（Announce 群發磁貼：缺口 #6 收尾——核心原來早就在）
- **發現**：Announce 核心（`announceShelfBean` 3140 起＝QC 閘門/收件人數 confirm/`uploadCardForBean` 卡圖/`announce_coffee` 群發/結果 toast）**早在 Coffee Info 詳情的 sb-ann 鈕做好了**（07-10 Retail Info 輪順手做的，缺口清單 07-09 盤點時還是 off 所以沒記到）。本輪只補 Tools 直達入口。
- **改動（new/index.html）**：Marketing 區 off 磁貼轉正 `['Announce','new coffee email','announce',1]`＋dispatch→`openAnnounceSheet`（薄層：`shelfLiveBeans` 上架豆清單＋風味預覽，點豆→`shelfSampleFor` 拿杯測列→跑現成 announceShelfBean）。edge function announce_coffee 零改動。
- **驗證**：jscheck 0 錯；本機 stub——上架豆 2 支列出（synced＋paused）✓ 點豆直達「Email "New coffee: X" to 2 customers?」confirm（QC pass＋鎖風味無警告）✓ 取消不寄 ✓ console 零錯誤。
- **等老闆（部署後真機）**：Tools→Announce 挑支豆真發一次（自己在 customers 留 email 收信看版面）。
- **已知取捨（照 classic 原樣，未加料）**：收件人＝全部有 email 的客戶（**不排除批發**）、無退訂連結、無同豆重複寄防呆——三者 classic 本來就沒有；日後要做退訂/分眾再議（要動 edge function）。

## 〇、補記 — 2026-07-12 之四（Invoice GST 發票移植：缺口 #5）
- **老闆點單「5」**：後勤三件套第二項。classic openInvoice/generateInvoicePDF 移植，GST 口徑逐字照抄。
- **前端（new/index.html）**：Finance 區 off 磁貼轉正 `['Invoice','GST PDF','invoice',1]`（rsMoney gate）→ `openInvoiceSheet`/`paintInvoice`：手填表單（照 classic 不挑訂單/客戶）——Bill To（買家/email/地址/開票日/到期日）＋分類品項卡（**Roasted/Green＝GST-free**、Green 選豆自 DB.beans 帶 cost_per_kg 且掛 **$5 handling inc GST**、**Shipping/Catering 10%** 可切 Plus GST（外加）/GST inc（**total/11 反推**））＋即時 line 小計與 Subtotal/GST/Total＋notes。
- **PDF**：`buildInvoicePDF` 照 classic 逐字（A4 直式、公司常數 verbatim：ABN 57 658 829 899／Crows Nest 地址／BSB 062-151／帳號 10497845；**「TAX INVOICE」僅在 GST>0 時**，否則 INVOICE——ATO 規矩）；引擎重用 `menusPDF`（按需載 jsPDF 2.5.1＋/logo.png）。
- **發票號 INV-YYYYMMDD-NNN**：classic 走 localStorage 雙軌——新殼 `invNextNo` **直讀寫 app_state 'inv_seq'**（產生時查最新 map→當日 max+1→**PDF 成功才 commit upsert**＝跨裝置不倒退；map 格式 {"YYYYMMDD":n} 相容 classic 既有值）。產生後 logAct('invoice generated',no,total)。
- **驗證**：jscheck 0 錯；本機 stub——GST 四口徑（Roasted 100/0、Green 180+4.5455/0.4545、Ship plus 20/2、Cater inc 100/10）✓ Subtotal/GST/Total 加總 ✓ 發票號接續（既有 2→INV-…-003、commit 寫回 3）✓ UI（Bill To/品項卡/分類切換/即時 totals $120/$2/$122）✓ console 零錯誤 ✓截圖。
- **等老闆（部署後真機）**：開一張真發票（含 Shipping 一行）看 PDF 版面與號碼；跟 classic 開的最後一張號碼確認接續（app_state inv_seq 同一份、天然接續）。

## 〇、補記 — 2026-07-12 之三（Finance P&L 財務總覽移植：缺口 #4）
- **老闆點單「4」**：後勤三件套第一項。classic openFinance/renderFinance 唯讀儀表板移植，**口徑一模一樣**。
- **前端（new/index.html）**：Finance 區磁貼 `['P&L','money overview','pnl']`（區塊本身 rsMoney gate、抽屜開頭再擋一次）→ `openPnlSheet`：①Money in＝paid 訂單依 `created_at` UTC YYYY-MM 分桶（本月/上月；**上月用「上月 15 號」toISOString 切**防跨月時區）——DB.orders 記憶體現算（loadAll 已排除 Cancelled，口徑同 classic）②Outstanding＝pending_payment/overdue **不分月全累加**＋依天數排序前 6 筆（#號 4 位補零 · 客名 · $ · Nd，overdue 紅字；**只讀持久化 overdue 標記**，轉換仍在 Orders 流程 markOverdue）③Green stock value＝Σ(quantity×cost_per_kg)（q>0 且有價；未定價豆數另提示 not counted）④Green bought this month＝purchases 當場查，`ordered_at||created_at` 本月、非 cancelled、kg×cost>0（Buy log 剛接活、此數字從此有真資料）⑤底部 Calculator 鈕（openCalcSheet）＋「card fees and other expenses are not tracked yet」說明照 classic。
- **驗證**：jscheck 0 錯；本機 stub——本月 $150/上月 $80 分桶 ✓未收 $75＋overdue 紅字排前 ✓庫存 $290＋未定價提示 ✓本月買豆 $555（cancelled/上月正確排除）✓staff 開抽屜被 roToast 擋 ✓console 零錯誤 ✓截圖。
- **等老闆（部署後真機）**：director 帳號開 Tools→P&L 看真數字對不對帳（跟 classic Finance 頁比對一次）。
- **注意**：真正的錢牆是 RLS（非 director/finance 讀 orders.total 等被限），前端 rsMoney 只是不畫；overdue 標記依賴 Orders 流程跑過 markOverdue。

## 〇、補記 — 2026-07-12 之二（Buy log 生豆採購帳移植：缺口 #3，生產線 100% 收官）
- **背景**：生產線最後一塊（老闆「好」拍板）。鏈＝Sample analyse 標 Buy → shortlist 預填下單 → On order → 收貨併批入庫。
- **前端（new/index.html，零 migration——purchases 表 classic 在用）**：①Tools Production 磁貼 `['Buy log','green purchases','buylog',1]`＋dispatch②`openBuyLogSheet`＝當場查 purchases(limit 60)＋samples(decision='buy')——shortlist 用 `sample_ref` 去重（已下單的 Buy 樣品不再出現）；區塊＝Cupping shortlist（點→預填開單）／+ New purchase order／On order（Received →＋Cancel 軟刪 status:'cancelled'，無硬刪照 classic）／History（非 ordered 前 10，帶 kg×$=小計與日期軌跡）③`openBuyForm(seed)`＝supplier/name/process/country/kg/cost/note，payload 照 classic savePurchase＋**補 `ordered_at:todayKey()`**（classic 從不寫此欄、poCard 只防禦性讀——新殼寫齊）④`openBuyReceive(p)`＝收貨 kg（預填 PO kg）＋lot → 照 classic receivePurchase：DB.beans 同名+同處理法**併批累加**（帶新 cost/supplier）否則**新建**（bean_ 前端 id 同 saveReceiveSheet）→ `stock_moves {kind:'receive',note:'PO received — 供應商 · lot X'}` → purchases 蓋 `{status:'received',received_at,bean_id,kg,lot_no}` → logAct → **reload()**（beans 變了，低庫存卡/需求全對）。
- **驗證**：jscheck 0 錯；本機 stub——shortlist 去重（已下單 Kii AB 不出現）✓預填開單＋insert payload（含 ordered_at/sample_ref）✓收貨新建路徑（beans insert＋stock_moves after=28＋PO 蓋章 L-77）✓併批路徑（4.5+10=14.5 update 非 insert、cost/supplier 更新）✓Cancel 軟刪✓console 零錯誤✓截圖。
- **等老闆（部署後真機）**：把最近標 Buy 的樣品下一張真採購單→到貨按 Received 收進庫存→Green stock 明細看 stock_moves 有 'PO received' 一筆。
- **🏁 生產線 100% 住進新殼**：樣品→Buy→採購→收貨→烘→拼配→QC→上架→接單→出貨（自動扣）→收款，全程零 classic。缺口清單剩後勤（#4 P&L/#5 Invoice/#6 Announce 建議移植；#2/#7/#8/#9 等拍板）。

## 〇、補記 — 2026-07-12（出貨自動扣熟豆批次：血條全自動）
- **背景**：血條上線後帳目靠手動扣（忘了扣就虛胖）——「繼續」授權自選，做血條的最後一塊。
- **關鍵發現（探索確認）**：全 app **唯一**把 orders.status 設 'Dispatched' 的地方＝`openDispatch` 的 `go()`（manual/訂閱/批發/Square 匯入全走這裡出貨）→ 一個插入點涵蓋全部通道。無雙重計算：烘豆需求 packQ 只算 Confirmed/Roasting（Ready 已不在），Dispatched 才扣與現行邏輯天然相容。
- **Migration `orders_stock_deducted_at`**：orders 加 `stock_deducted_at timestamptz`＝「這單已扣過」蓋章（select * 自動帶進 DB.orders）。
- **前端（new/index.html）**：`deductOrderStock(o)`（openDispatch 前）——每品項 `grams×qty/1000` kg 依名字 FIFO 扣同名批次（配方名命中 DB.blends→吃 kind='blend' 批次、單品→非 blend；用 `rstBatches`＝排除 QC 打退、舊→新）；**跳過**無 grams 假品項（Delivery fee）與 `isSubName` 訂閱商品行；批次不夠**照扣到 0 回報短缺、不擋出貨**（出貨是事實）；扣完蓋章＋`logAct('stock deducted','#no')`。`go()` 在 status update 成功後呼叫（畫卡/寄信前），短缺在 closeDrawer 後 alert 列清單提醒去 Roasted Stock 調帳。
- **驗證**：jscheck 0 錯；本機 stub——配方 1.0kg 跨兩批 FIFO（0.3→0、2.0→1.3）✓單品不夠→扣到 0＋short 0.15 回報 ✓QC 打退批原封不動 ✓運費/訂閱行零多餘 update ✓蓋章＋logAct ✓**同單重跑＝skipped 零寫入** ✓console 零錯誤。
- **等老闆（部署後真機）**：出一張真單（或測試單）→ Roasted Stock 看對應批次被扣、血條下降；故意出一張超過庫存的看短缺 alert。
- **注意**：手動扣血（「−」）仍在＝非訂單耗損用；舊單（stock_deducted_at=null、已 Dispatched 的歷史單）不會被回溯扣——蓋章欄只從此刻起作用；訂單取消/退貨**不自動回補**批次（低頻，Roasted Stock 手動加回或等日後需求）。

## 〇、補記 — 2026-07-11 之十（生豆樣品分析 Sample analyse 移植：缺口 #12，B 組全清空）
- **老闆拍板**：生產線盤點後選「Sample analyse」優先（B 組收尾）。生豆樣品杯測評分＋歷史＋Buy/Maybe/Skip 決策，原本要回 classic（green:analyse/samplehist）。
- **資料設計（零 migration）**：samples 表雙用途靠 `supplier` 分流——'Ratio Coffee'＝自家熟豆 QC（新殼所有現有查詢硬編此條件）、其他值/null＝外部生豆樣品；同一張表天然隔離。**讀取＝抓全再前端濾 `s.supplier!=='Ratio Coffee'`**（⚠ 不能 .neq 查——會漏 supplier=null 的樣品）。
- **前端（new/index.html）**：①Tools Production 區磁貼 `['Sample analyse','green cupping','sampleana',1]`＋dispatch②`openSampleSheet`＝當場查 samples limit 120 前端濾→`renderSampleSheetHTML`（日期分組卡片：名/供應商/處理法＋decision badge；點卡展開＝`sampleRadarSVG` 雷達＋風味＋comment＋cupper＋**Skip/Maybe/Buy 三 chip**（update decision＋就地改＋logAct）＋Edit＋Delete）③`openSampleForm`/`paintSampleForm`＝抄 paintCupSheet 的活雷達＋5 range 滑桿（min1 max3 step.5，即時只改 SVG 屬性不重畫）＋date/name/supplier/process＋3 風味＋comment 30 字 blank=auto（重用 `cupAutoComment`）④`saveSampleForm`＝payload 照 classic saveSample（no=存檔時現查當日 max+1、**supplier=自填絕不塞 Ratio Coffee**、cupper=WHO、decision:null）；防呆＝同名同日 confirm（classic 按兩次改新殼慣例 confirm）；編輯=update by id。
- **驗證**：jscheck 0 錯；本機 stub——列表濾熟豆留 null-supplier ✓日期分組 ✓展開雷達+三 chip ✓decision update @id＋就地改 ✓滑桿動雷達（5 點 polygon）＋auto comment（'Peach · perfumed'）✓insert payload（no 連號=3、supplier 自填、comment auto、cupper）✓同名同日 confirm 擋存 ✓console 零錯誤 ✓截圖。
- **等老闆（部署後真機）**：Tools→Sample analyse 評一支真樣品→存→標 Buy→重開確認；順手看 QC 台照常（不受影響）。
- **下游備忘**：decision='buy' 的樣品已存好標記，日後移植 **Buy log（缺口 #3）** 時照 classic loadPurchases 接「Buy shortlist→purchases(sample_ref)→收貨進 beans」。
- **B 組（唯讀→編輯回 classic）三項全清空** ✅：拼配（之六）、Dial-in（之九）、樣品分析（本輪）。

## 〇、補記 — 2026-07-11 之九（Dial-in 工具移植：Tools 磁貼＋自由選豆＋Apply to brew guide）
- **老闆需求**：「dial in 的 tool 好像沒做？」＝缺口清單**第 11 項**。新殼原只有今日流卡片能記（openDialinForm，僅上架豆長卡、無 note），主動記錄要回 classic。
- **改動（new/index.html）**：①loadAll dialins select 加 `id,note`②Tools QC & Recipe 區加磁貼 `['Dial in','espresso shots','dialin',1]`＋分派③**openDialinSheet**（自 classic openDialin/saveDialin 移植）：豆下拉＝DB.beans ∪ DB.blends 去重排序（配方建好即可 dial）、選豆自動帶該豆最新一筆數字（DLS.coffee 記選豆，存檔後保留＝連續調同支豆）、欄位 grind/dose/yield/time＋**Tasting note**、insert payload 照 classic（數字空→null、barista=WHO）、Latest per coffee（每豆最新一筆＋dlMeta 含 1:R ratio＋Apply 鈕 canWrite 才出）＋Recent 15 筆④**applyDialinBrew**（照 classic applyDialin）：confirm→只取有填欄位組 esp→**brew 內全字串、time_s→key 'time' 加 's' 後綴**（公開豆頁 How to brew 吃這格式）→配方命中 DB.blends→就地 select brew 單行→merge espresso（**其他 method 不動**）→update blends；單品→同款走 beans；logAct 記名。classic 的 localStorage sync 路不搬（新殼慣例直接寫）。
- **不動**：openDialinForm 卡片版照舊（快速路徑不加欄位）；Recipe 抽屜唯讀 Recent 照舊；Espresso Station 泡泡面板不移植。
- **驗證**：jscheck 0 錯；本機假資料＋stub sb.from——豆單含單品＋配方去重✓選豆帶上次數字（last 行 1:2.1）✓insert payload 形狀（含 note/barista/null 規則）✓存檔後保留選豆✓Latest 每豆一筆去重✓Apply 配方路：select brew→merge（**infusion 保留**、espresso 字串化、time '29s'）→update blends@id＋logAct✓單品路 beans 同款✓console 零錯誤✓截圖。
- **等老闆（部署後真機）**：Tools→Dial in 記一筆真的（含 note）→Recipe 抽屜 Recent 看得到→挑一支豆 Apply→公開豆頁 ?bean 的 How to brew espresso 數字更新。
- **缺口清單第 11 項可標 ✅**（新增/編輯已進新殼；classic openDialin 可退役）。

## 〇、補記 — 2026-07-11 之八（配方貫穿全系統：New order＋Labels 解鎖「建好即用」）
- **老闆需求**：「我會時常做配方豆、取名字，以後這個配方豆可以從其他工具裡面使用」＝配方是全系統一等公民。
- **盤點結論**（探索代理逐工具查證，行號見該輪 session）：配方建好立刻能用的原本只有 Menus(dine-in)＋Sub run（直讀 blends）；其餘被三層 gate 擋——上架 gate（New order/Coffee Info/IG/Post to socials/Dial-in 卡）、杯測 gate（Labels/Social Images/Info Card/Brew Card/上架佇列）。生產鏈本身全通（Log roast blend→QC→上架不被擋）。
- **設計判斷（老闆批准）**：QC 牆不拆——行銷/風味輸出工具維持 gate（沒過 QC 不對外）；**只解鎖兩個內部作業工具**到「建好即用」：①**New order**（批發/熟客會在上架前先訂）②**Labels bag＋tin**（拼好就要裝袋貼標）。
- **改動（new/index.html ×6 處）**：①paintNewOrder 豆單＝beanNames() ∪ DB.blends 名字（Set 去重防上架後 syncs 同名重複；**不動 beanNames() 本體**——Sub run 用它當單品清單會撞）②labelBlendOptions ③labelBeanNameList blend 分支 ④tinBlendNameList——三個名單改直接列 loadBlendDefs() 全部配方（原本 ∩ RETAIL_BEANS 杯測列）⑤applyRetailToBlend 加第二參數 nm、s 可 null（沒杯測＝成分/comment 直讀配方定義、風味/日期留空）⑥labelApplyByName blend 分支放行無 sample 配方。
- **驗證**：jscheck 0 錯；本機假資料（Test Blend＝未烘未杯測未上架新配方）——New order 真抽屜選單有 Test Blend、已上架 Dark Knight 不重複 ✓；Labels bag/tin 名單都有 ✓；未杯測 autofill 帶成分風味空、已杯測風味照帶（不退化）✓；shelfLiveBeans 無 Test Blend（行銷 gate 沒破）✓；console 零錯誤。
- **不做（跟老闆說明過）**：行銷/風味工具 gate 維持；Dial-in 手動入口＝缺口清單第 11 項另輪。
- **注意**：Labels 的配方名單來源是 MENUS_DATA.blends（menusEnsureData 抓）——與 DB.blends（loadAll rs[22]）是兩份快取，將來如果出現「Recipe 剛存的配方 Labels 看不到」的回報，就是 MENUS_DATA 沒重抓（menusEnsureData 有快取判斷），重開 app 或補 invalidate 即可。

## 〇、補記 — 2026-07-11 之七（做拼配 Blending：熟豆血條庫存＋比例聯動＋低量/超量警訊）
- **老闆需求**（多輪拍板）：每支熟豆（**拼配＋單品分開看**）一條**分段血條**（每批次一段、不同日期不同深淺**舊深新淺**＋1px 縫、介面乾淨）；低於自訂低血線＝該做下一批、超過準備值＝警訊庫存太多；做拼配照配方比例**輸一支成分自動反推其他成分與總量**；烘完直接加血；**手動扣血可選批次**（推估新舊剩量）＋原因（瑕疵 Defect／調撥 Transfer 含去向／Other）。
- **Migration `roasted_stock_thresholds`**：blends 加 `target_kg,low_stock_kg`；beans 加 `roast_target_kg,roast_low_kg`（單品熟豆閾值——**跟既有 low_stock_kg＝生豆低線區隔**）。null＝警訊關。
- **前端（new/index.html）**：①loadAll 尾端 append blends（rs[22]→`DB.blends`，id/name/parts/target/low）＋beans select 加兩新欄②helper `rstBatches(name,isBlend)`（同名批次舊→新；blend 看 kind='blend'）/`rstStockKg`/`rstBarHTML`（分段血條，RST_OPS opacity 輪 1/.75/.55/.4，低/超整條轉 danger；無 target 畫滿版只標 kg）③**openBatchesSheet 全面重寫**＝血條總覽：pm-seg「Blends｜Single origins」（RST.seg）、名單＝DB.blends 全列/beans 有血或有閾值/批次孤兒名 union、**排序低→超→正常**、每行名＋血條＋label＋「−」鈕、點行展開＝批次明細＋Target/Low 設定欄（Set→update blends 或 beans）＋Blend this／Roast this 鈕④**舊 openBatchUse 已刪**、扣量收編進 `openRstDeduct`：批次 chip（**預設最舊可改選**）＋kg＋原因 chip（Transfer 露去向欄必填）→單批 update remaining_kg、**超過該批剩量擋存**（不偷溢別批）、logAct 'transferred/deducted roasted' 帶批日期與去向⑤`openRoastPreset(mode,val)`＝開 Log roast 預選（血條行動鈕/Recipe「Blend this」共用）⑥**Log roast blend 分支比例聯動**：成分行改輸入框（data-bp/data-pct）＋stock 對照 span；輸任一成分→`total=amt/(pct/blTot)`（正規化防比例不滿百）→其他成分與 ro-bkg 自動填；輸總量→正向攤；**不重繪抽屜**（掉焦點）直接改框值；需求>blendPartPool 紅字 short；grab() 收 RO.bamt；切配方清空；存檔走 saveBlendBatch 原樣（進 pending_cupping 照舊）⑦openRoastSheet 改用 DB.blends 不再另查⑧**buildItems 聚合卡 ×2**（豆多不洗版）：'rstlow'（跨拼配/單品聚一張，runAction 開 Roasted Stock、全單品時自動落 single 檔）＋'rstover'（dismiss）；roles director/roaster。
- **驗證**：jscheck 0 錯；本機 8124 假資料全測——血條三態排序（低→超→正常）✓分段深淺 1px 縫✓Single 檔（無閾值只標 kg）✓展開明細＋Target/Low 帶入✓扣血：批 chip 預設最舊/Transfer 露去向/超量擋存「only has 3 kg」/合法扣 update {remaining_kg:1}@r1＋logAct '2 kg · 02/07 → own shop'＋血條即時 5.2/10 ✓聚合卡 low·2（Dancer+Ethiopia 跨類）/over·1 ✓聯動：50% 輸 5→3/2＋總量 10、反向 4→2/1.2/0.8、short 紅字 ✓截圖 ×2。
- **等老闆（部署後真機）**：①Roasted Stock 給主力配方＋一支單品設 Target/Low（建議 target≈一週用量、low≈兩三天，跑兩週再調；留空＝關）②真做一批小量拼配走一輪（輸一支成分→自動反推→存→成分批次被扣、拼配血條回血）③試一次「−」Transfer 扣血看 Activity 記錄。
- **注意**：血條準確性靠有扣才準（耗用要記得扣，常忘的話下輪做「訂單出貨自動扣熟豆批次」）；拼配/單品**名字是身分證**不要撞名；被 QC 打退（reroast/downgrade）批次**不算血**（rstBatches 排除，與 shelfG 上架差額同規則）——血條＝可正常出貨的豆；打退批次仍在 roasts 表可從 classic History 調帳。

## 〇、補記 — 2026-07-11 之六（配方 Recipe 抽屜升級可編輯：classic openBlending 移植進新殼）
- **老闆需求**：把配方豆（classic 的 Blend / F(x)，非 "formulae"）移植進新殼。定位＝缺口清單**第 10 項「拼配配方編輯 Blending」**（B 組：/new openRecipeSheet 原唯讀、編輯要回 classic）。
- **做法**：不新增磁貼，把現有唯讀的 `openRecipeSheet`（new/index.html:7302 起）就地升級。有寫入權（canWrite=lead/director）可編輯，其他人維持唯讀。**不搬 classic 的 localStorage 雙軌同步**（ratio_blends/debounce/canonical-compare/realtime）——走新殼慣例：開抽屜當場 `select('*')`、按 Save 直接 upsert／刪除 delete。
- **新增**：模組狀態 `RCP{defs,dins,open,knownIds}`＋`paintRecipe()`（重繪＋綁事件，chevron/加/刪重繪、輸入類即時寫回 RCP.defs 不重繪）＋`recipeSave()`。helper：`BL_SEP`( 消歧同名不同處理法)／`blPartVal`／`blBeanOptions`(成分下拉來源改 **DB.beans**，非 classic BEANS)／`blTotal`／`blCostPerKg`(DB.beans cost_per_kg 加權)／`blCostHTML`(**rsMoney gate**)／`blUid`(crypto.randomUUID)／`blankBlend`／`blDupNames`。
- **功能**：展開卡改名／3 成分下拉＋比例／Note／Special comment／刪除／+New blend；Total 100% 即時校驗變色；重名擋存；Cost/KG 只給財務/director。**rename cascade 保留**（照抄 classic renderBlending）：改配方名同步 relink `roasts.bean_name`／`samples.sample_id`／`product_sync.bean_id`＋就地更新 DB.roasts/DB.samples。upsert payload 同 classic（id/name/hname/parts/note/comment/brew原值/pos/updated_at）。dial-in 唯讀區原樣保留。**不建新表、不改 schema**（blends 表新殼本來就在讀）。
- **不做**：不動 blends.brew；不移植 R&D Station 泡泡面板/roasts 快照/Square 產品卡 recipe（下游 classic 仍跑）；不改 loadAll（blends 維持抽屜內即時抓）。
- **驗證**：jscheck 0 錯 ✓；本機 8124 注入假 DB.beans+RCP.defs 測 paintRecipe——Cost/KG 加權對($23.80)／Total 破 100 即時紅字提示／改名即時寫回／加刪展開／重名偵測命中／blankBlend 產 36 字元 uuid／處理法消歧下拉 ✓；手機 375 排版 ✓；部署 curl grep paintRecipe/recipeSave/blBeanOptions＋新文案 ✓（**37551d8 已 push 上線**）。
- **等老闆（部署後登入態實測）**：寫入本身本機測不了（blends RLS 未登入讀空、不宜對線上寫測試）——改個 note 存→重開確認寫入；謹慎試一次改名，看 roasts/samples 歷史有無跟著 relink。

## 〇、補記 — 2026-07-11 之五（訂閱系統進 app：subscriptions 表＋名單抽屜＋到期卡＋一鍵出貨）
- **老闆需求**：豆子訂閱搬進 app 自管（現跑 Square：Single/Blend 各 $25/包/每兩週免運），過渡期兩邊並行、日後淘汰 Square。拍板：收錢走 **Square 付款連結**（不存卡）；Square 舊客（約10位）自然跑完但**登記進 app 名單一起管出貨**（source='square'，錢已被 Square 扣、不生連結）；新客 source='app' 每期生成連結；**每期豆子老闆自選**（單品一支/配方一批全員套用）；10 位規模＝半自動（到期卡→挑豆→一鍵），不用 pg_cron。計畫檔 `~/.claude/plans/25-each-bag-dazzling-coral.md`。
- **新表 `subscriptions`**（migration `subscriptions_table`）：customer_id FK/plan(single|blend)/price(默認25)/grams(默認150)/interval_days(默認14)/status(active|paused|cancelled)/source(app|square)/next_ship_date/last_order_id/notes；RLS is_staff() 四政策照 orders。**next_ship_date+last_order_id 同步推進＝「這期已出」印記**；失敗筆不推進、明天卡片只剩失敗者。
- **前端（new/index.html）**：①loadAll 尾端加 subscriptions→`DB.subs`（rs[20]）②Tools「Orders & customers」區 **Subscriptions 磁貼**（director only，data-t 'subs'）③`openSubsSheet`（名單：active 按日期排/paused 黃沉底/cancelled 灰；k 膠囊標 app/square）＋`openSubForm`/`paintSubForm`/`saveSubForm`（挑既有客或建新客**照 classic saveOrder L6681**、type:'retail'——wholesale 型會被 whOrd 抓去批發站；plan/price/grams/billing seg/date/notes；編輯模式帶 Pause/Resume/Reactivate＋Cancel）④buildItems **subs-due 聚合卡**（active 且 next_ship_date<=today；st:'Orders' kind:'subrun' director only）⑤`openSubRunSheet`/`paintSubRun`（due 預覽＋單品選單重用 beanNames() 上架豆排前＋配方=blends 表選單+自由輸入）＋`runSubShipment`（order_no 迴圈外查一次 max、**逐筆 try/catch**：insert orders {channel:'subscription',status:'Confirmed',items:[{name,grams,qty:1,price}],payment_method:'platform',payment_status:square?'paid':'pending_payment'}→bump next_ship_date=max(原+interval,明天)+last_order_id→subCollectPayment→order_confirmation email；link/email 失敗只 warning、insert 失敗該筆跳過不推進；摘要 alert/toast）。
- **收錢抽象點 `subCollectPayment(order,sub)`**：全 app 唯一知道錢怎麼收的函式——square 直接 ok；app 呼 sync-to-square payment_link（冪等 reuse）。**日後換 Stripe/存卡只改這一個函式**，回寫同欄位、下游（確認信付款鈕/webhook 對帳）不變。
- **Edge functions 零改動**（payment_link/order_confirmation/webhook mark-paid 全現成；orders channel constraint 本來就放行 'subscription'——首次真正用上）。訂單進 Confirmed 自動吃 pack→ship→paid 卡全鏈，packQ/shipQ/payQ 零改動。
- **驗證**：jscheck ✓；本機 8124 stub（patch sb.from——⚠ sb 是 const，window.sb 蓋不掉）：到期卡計數/paused+未來排除 ✓、名單排序+square tag ✓、新客 insert 形狀照 classic ✓、批次 run：app 客 pending+link+email、square 客 paid+email 無 link、單號遞增、日期各自 bump（過期 07-01→07-15、今天→+14）✓、失敗路徑：insert 全炸→0 bump 0 錢 0 信+點名摘要 ✓、磁貼 director 有/staff 無 ✓、console 零錯誤 ✓、深色截圖兩張 ✓。⚠ stub 的 reload() 會把 DB 假資料洗空——連續測試要重灌 fixtures（這次踩過）。
- **等老闆**：①部署後真機：Tools→Subscriptions 逐位登記 10 位（Square 舊客選 Square billed、date 對齊 Square 扣款日）②用自己 email 建一筆 source=app 測試訂閱→到期卡→run→收信點連結付 $25 走一輪→測完 Cancel③Square 端訂閱之後自然到期不續。
- **注意**：真付款連結/真信本機不可測（會打真 Square/真寄信），留真機驗。

## 〇、補記 — 2026-07-11 之四（公開豆頁加 Brew Card）
- **老闆需求**：QR 掃入的 ?bean 頁面加 Brew Card。做法＝實體 A6 手沖卡的內容（`DEFAULT_POUROVER` 常數，全店通用 V60）搬上豆頁成「Pour-over guide · V60」卡（`pbBrewCardHTML`，插在豆子專屬 How to brew it 之後、footer 之前）：參數格（Dose·Water/Ratio/Temp/Grind/Time，重用 .pb-brew-g）→ The pour 編號步驟（.pb-step 圓號碼）→ If it tastes… 診斷行（.pb-fix 左問題右解法）→ Two habits → Fine-tune＋Join 注腳。**內容與印刷卡同一份**——之後 DEFAULT_POUROVER 接 app_state.pourover 時兩邊自動同步。
- **驗證**：?bean=kii-ab DOM（sections/steps=7/fixes=6）＋截圖 ✓；jscheck ✓；無 console error ✓。

## 〇、補記 — 2026-07-11 之三（公開豆頁排版重整：簡單易懂）
- **老闆需求**：QR 掃入的 ?bean 豆頁排版優化。原版問題：評語藏在 Flavour 卡的小灰字、產區資訊拆兩處（副標＋底部 Origin 卡）、沖煮參數整行擠（Temp 92°C · PPM 80 · …）、日期 28/06/26。
- **新版面**（?bean IIFE＋pb-* CSS）：品牌 → 豆名 → **評語升格 serif 斜體引言**（.pb-quote）→ 風味 chips 直接頂部 →「**The coffee**」兩欄清單卡（.pb-row：拼配＝每成分一行 70%｜Finca Milan · Nitro Culturing；單品＝Process/Origin/Variety/Altitude；共通 Roasted 人話日期 pbDate '28 Jun 2026'）→ Cup profile 雷達（點色版）→ How to brew it **格狀兩欄**（.pb-brew-g：灰標籤上、mono 值下，取代擠一行）→ footer。原 Flavour 卡與 Origin 卡拆併、副標移除。
- **驗證**：june-project（拼配）／kii-ab（單品全欄位）／dark-knight（brew 三方法格狀）三型截圖 ✓；jscheck ✓；無 console error ✓。

## 〇、補記 — 2026-07-11 之二（公開豆頁雷達用該豆的罐標點色）
- **老闆需求**：Social Images 的 QR 掃進去（?bean 公開頁），雷達圖顏色要用 Coffee Info 那支豆的對應顏色（rtl_dot 點色），跟社群圖/店內一致。
- **改法**：①**public-bean edge v6**——新增查 app_state `rtl_dot`（名字不分大小寫比對），用內嵌的 DOTCOL 表（⚠ 鏡射自前端 RTL_DOTCOL：y #E0B341／b #3D7DBF／d #22386B／r #C0392B，**改色票兩邊要同步**）轉 hex 回傳 `dot` 欄位（沒設點色回 null）；②前端 `sampleRadarSVG(s,force,col)` 加第三參數（描邊/頂點用 col、淡填 hex→rgba 0.18，沒給退回玫瑰 #B25E6A），?bean render 傳 `d.dot`。sampleRadarSVG 只有公開頁一個呼叫端，安全。
- **驗證**：curl v6——Dark Knight #C0392B／June Project #22386B／Kii AB #C0392B，與 rtl_dot 資料吻合 ✓；本機 ?bean=june-project 雷達 stroke/fill/頂點全深藍 ✓；jscheck ✓；無 console error ✓。注意 public-bean 有 5 分鐘 Cache-Control，剛改點色的豆要等快取過期才變色。

## 〇、補記 — 2026-07-11（Calculator 重整：前台一屏生豆→熟豆、成本摺疊＋app_state 記憶）
- **老闆需求**：「滑來滑去很難點數字」＋「前台主要看生豆與產出熟豆的關係；人事成本收起來，一年調一次」。根因＝16 欄 6 區超過一屏＋切模式/選尺寸全量重繪 scrollTop 歸零＋完全無持久化（nothing is saved）。
- **改法**（`openCalcSheet` 一帶，計算公式 cxBase/cxResults 一字未動）：①前台一屏＝模式段＋Roast batch＋**`#cx-flow` 生豆→熟豆換算行**（玫瑰粗體「40 kg green → 34.8 kg roasted · 232 × 150g bags」，cxRenderOut 一起更新）＋Package size＋Price＋Result；②包材/包裝工/場地/烘豆工資/運輸收進「Costs & labour」**摺疊列**（`#cx-costs-t` 切 display 不重繪、CX.costsOpen 記開合）；③重繪前記 `drawer.scrollTop` 重繪後還原（跳頂修掉）；④**app_state 新 key `calc_prefs`**＝{cbag,cstick,cbox,packRate,packSpeed,venue,staff,transport,pkgs}，開抽屜載入（CX_LOADED 一次性）、變更防抖 800ms upsert；批次數字（pots/bean/greenKg/shrink/wsQty）刻意不存；⑤input 監聽改 `d.oninput`（原 addEventListener 每次重繪疊加一支）。副標改「batch numbers reset each time — costs below are remembered」。
- **驗證**：jscheck ✓；mock sb.from 驗 prefs 讀（venue/packRate/自訂尺寸載入）寫（防抖 800ms、value 不含 pots）✓；切模式 scrollTop 200→200 ✓；換算行即時更新（改 pots 4→2：40kg→20kg）✓；232 包＝classic 參考案例吻合（公式沒動壞）✓；摺疊開合＋箭頭 ✓；截圖 ✓；boot 無 error ✓。

## 〇、補記 — 2026-07-10 之九（Retail Info 標出「上架了但店面看不到」的漏網豆）
- **背景**：老闆點名 highlight「已上架、不在 QC 裡」的豆——即被 public-shop QC 閘門（samples 要有 flavour_locked=true）濾掉的漏網之魚：掛著 On sale、客人在 app 店面卻看不到、也沒有任何流程會處理它們（Dark Knight 快取誤會那次順帶發現菜單只 3 支的根因）。
- **做法**：`openRetailSheet` 每行加判斷 `unlocked=!inQC&&!(rep&&rep.flavour_locked)` → 行內紅字「not in shop — flavour unlocked」＋頂部摘要計數「N not in shop — flavour unlocked」。**QC 重審中的不重複標**（已有黃字 re-checking in QC，那是正常流程）；售罄的照標（paused 一樣被閘門擋）。
- **驗證**：jscheck ✓；mock 四情境（已鎖乾淨/沒鎖標紅/重審只黃/售罄沒鎖標紅）DOM 逐行 ✓；截圖 ✓；boot 無 error ✓。
- **注意**：這只是標示，鎖風味仍要走原流程（QC Pass 自動鎖，或上架抽屜的 Lock flavour）。
- **追加①（老闆要更強烈）**：曾做整顆泡泡警示 `.hit.warn`（淡紅底＋紅框）——**已在追加②被取代移除**。
- **追加②（定案·膠囊紅綠燈）**：老闆嫌泡泡紅底「顏色太多」，改用右側狀態膠囊的亮/不亮當紅綠燈——**亮（實心 accent）＝完全正常不用管；熄燈（空心灰框）＝有附屬狀態要處理（QC 重審／風味沒鎖）、字仍是 Live；紅實心＝Sold out**。行內彩色說明文字全保留，掃「沒亮的膠囊」就知道動哪支。CSS 新增 `.hit .k.pill{/.off/.sold}`（**只掛 .k.pill，不動全域 .k**——IG 清單/生豆 kg/訂單 channel 共用它）；`.hit.warn` 三條規則刪除。膠章文字 On sale→**Live**（Sold out 不動）。
- **驗證**：jscheck ✓、warn 殘留 grep 歸零 ✓、mock 四情境 computed style 逐行對（實心 rgb(178,94,106)／空心透明＋灰框／紅 rgb(192,57,43)／泡泡回白底）✓、深淺主題截圖 ✓、boot 無 error ✓。

## 〇、補記 — 2026-07-10 之八（Square Online 商品頁主圖 3:4→1:1，沒改碼）
- **背景**：老闆發現 coffeeratio.com.au（Square Online 網店，客人真正下單的站）商品詳情頁主圖是直式長方——我們的 1080 正方四連圖被塞進 3:4 框上下留白。⚠ 這個站跟新殼 ?shop 是兩回事：**Ratio 有一個 Square Online 建站**（自訂網域 coffeeratio.com.au，2026-07-09 有發布過），商品從 Square 目錄自動帶入。
- **修法（Chrome MCP 代跑，老闆登入態）**：Square Dashboard 左欄「Square Online」→ square.online 後台 → Edit site → 頁面下拉 → Item pages 任一頁 → 左欄「Item details」section →（模板：改一處套用全部商品頁）→ Content → Image gallery → **Aspect ratio 3:4 改 1:1**（Image fit 維持 Crop）→ Done → Publish。真機驗證 coffeeratio.com.au 商品頁主圖已正方滿版 ✓。
- **備查**：Square Online 編輯器入口好藏——Dashboard `/dashboard/sites` 會轉跳 square.online/app/…；左欄捲到底「Square Online」最快。

## 〇、補記 — 2026-07-10 之七（拼配明細的百分比放大＋Dark Knight「沒上架」診斷）
- **百分比突顯（老闆點名）**：social origin 圖與摺卡明細頁的拼配行，左欄比例（50%）原是灰色小標樣式不顯眼——兩處 render 加判斷 `/^\d+(\.\d+)?%$/`，命中改 serif 大字正文色（social 40px／摺卡 9.5pt inline 蓋 .br span），一般標籤行（ORIGIN/ROASTED）不受影響。截圖驗證 ✓。
- **Dark Knight 沒進店面＝快取誤會（沒改碼）**：實查 product_sync synced ✓、samples flavour_locked ✓、curl public-shop 菜單有它＋4 圖 ✓——是 public-shop 的 5 分鐘 Cache-Control，別台裝置/已開頁面吃舊快取（SHOP_STALE 只救推的那台）。已告知老闆重新整理即可。順帶提醒：菜單只 3 支＝其他 synced 豆風味沒鎖被 QC 閘門濾掉（設計如此）。

## 〇、補記 — 2026-07-10 之六（Push to Live 商品圖模式可選＋per-bean 記憶）
- **背景**：Square 商品圖原是寫死規則（有背景照→自動 photo 四連圖、否則單張品牌卡），抽屜看不到也選不了——老闆 Social Images 選白底、June Project 上架卻照片版的困惑源頭。老闆拍板：①上架抽屜加選擇（同 Social Images 三模式）②透明自動轉白底（Square 走 JPEG 無透明，UI 註明）③每支豆各自記住。計畫檔同 `social-media-valiant-raven.md`（覆寫）。
- **做法**：①`renderSocialImages` 加 `opts.bg` 覆蓋（上架用 per-bean 底色、不動全域 SOC_BG）②app_state 新 key **`rtl_imgstyle`**＝`{豆名:{mode:'colour'|'transparent'|'photo',bg:'#hex'}}`，openListSheet 批次讀（併入 rtl_* 那組）、push 成功 read-modify-write 寫回③`paintListSheet` 加「Product images · 4-up carousel」段選＋Colour 色票列（重用 SOC_SWATCHES）＋Transparent 說明＋Photo 有無照片狀態/Replace 鈕（自訂色盤用 change 事件——input 每拖一格重繪會關色盤）④`pushListToSquare` 拆 havePhoto 自動規則改依 `LST.imgMode`：photo 沒照片→push 前先挑（取消＝中止）；colour/transparent→render 'white'（bg=記憶色/米白）JPEG 0.88；失敗仍退 makeSquareCard 兜底。
- **無感遷移**：沒記憶的豆預設＝舊行為（有照片 photo／無照片 colour 米白）。
- **驗證**：jscheck ✓；preview mock LST——三模式切換/色票選色/Transparent 提示/Photo 狀態列 ✓；opts.bg 覆蓋（全域 SOC_BG 不動、角落像素 #241E1B、dark 翻淺）✓；boot 無 error ✓。**真上架（打真 Square）本機不可測**：部署後老闆拿 June Project 選色底 Push update → 網店看輪播四張底色；再開一次抽屜確認記憶帶出。
- **edge 契約備查**：sync-to-square v21 收 `images_b64[]`（≤6 張、第一張 primary、順序=輪播序）＋`image_mime`；四連圖一律 JPEG（PNG 曾塞爆請求體）。

## 〇、補記 — 2026-07-10 之五（Social Images：自選底色＋每張產出物標註設定）
- **背景**：老闆兩需求①白底版底色可選（原寫死 #FAF8F4）②每張產出要註明用了什麼設定（多批下載後分不清，不好調整）。拍板：標註放**縮圖＋檔名**、圖片本身乾淨可直接發 IG；底色＝預設色票＋自訂色盤。計畫檔 `~/.claude/plans/social-media-valiant-raven.md`。
- **底色**：全域 `SOC_BG`（預設米白）＋`SOC_SWATCHES` 六色（米白/亞麻/淡玫瑰/鼠尾草/深棕/墨黑）＋`socBgIsDark()`（luma 公式同 photoIsDark）。抽屜段選 White 改名 **Colour**，下方 `soc-bgwrap` 色票列（只在 Colour 模式顯示）＋`<input type=color>` 自訂。**深底自動翻淺字**＝借 photo 深照片整套現成機制（_socTheme/雷達淺 grid/_liftColour 提亮），QR 白框永遠保留可掃。底色硬編碼改了三處：_socShell bg、html2canvas backgroundColor、_soc1080 保底補色——全跟 renderSocialImages 算出的 bg 走，並回傳 `bg` 給呼叫端。
- **標註**：exportSocialImages 組 `tag`（colour #HEX／transparent／photo · fade N%）→ 每張縮圖下加第二行灰字 tag＋標題行 lbl＋檔名後綴（自訂色 `-bg-EFE6D8`、photo 補 `-photo-fade60`；**米白預設照舊無後綴**、transparent 照舊）。兩個入口（Social Images 抽屜＋貨架 Social post kit）走同一個 exportSocialImages 都受惠。
- **不動**：photo/clear 行為、Square 商品圖自動 photo 版（L3222）、Folding Info Card。底色不存 app_state（session 全域，同 SOC_MODE）。
- **驗證**：jscheck ✓；本機 8125 真跑 html2canvas——亞麻底角落像素 #EFE6D8 ✓、墨黑底 #241E1B＋dark=true 淺字 ✓；抽屜 DOM（色票只在 Colour 顯示/點選換色換框/自訂色盤）✓；檔名三模式 ✓；深底四張截圖含拼配明細與 QR 白框 ✓；boot 無 console error ✓。

## 〇、補記 — 2026-07-10 之四（Social Images ↔ Folding Info Card 內容單一事實源）
- **背景**：老闆要「Social Images 四張圖＝Folding Info Card 四頁，改一邊內容另一邊要同步」。盤點結論：**豆子資料本來就同步**（兩邊同樣走 samples flavour_locked 優先 row＋cardDots 點色＋beanInfoRows 明細＋features/comment/雷達）；真正各抄一份的是**固定文案與連結組法**。
- **做法**：新殼 `renderSocialImages` 區塊頂新增單一事實源（約 L2245）：`CARD_TEXT`（brand/tagline/scan/ig/email/footer 六句）＋`cardBeanUrl(nm)`/`cardQrSrc(nm)`（?bean 連結與 qrserver 組法）。social 四張（socialCoverHTML/socialQrHTML/renderSocialImages）與 `openInfoCardPrint`（A4 摺卡）全部改引用，grep 確認舊字串歸零只剩定義一份。**以後改店帳號/email/標語/掃描語＝只改 CARD_TEXT，兩邊（含 Square 商品圖——它走同一個 renderSocialImages）一起變。**
- **驗證**：jscheck ✓；本機 serve（8125，8124 被別 session 佔）未登入 boot 無 console error ✓；console 實測改 `CARD_TEXT.scan` 後 socialQrHTML 輸出即時跟變 ✓。
- **注意**：IG caption（L2030 'Roasted fresh in Crows Nest'）與公開豆頁 footer（L6712）措辭刻意不同、不在同步範圍。
- **追加（同日）：拼配豆明細空白修好**。老闆回報摺卡明細對拼配豆沒內容——根因＝`beanInfoRows` 只查 beans 表（單品生豆），拼配命中不了一律回空（原本只有 shelf 抽屜自己另寫了 Recipe 區塊）。修法＝在 `beanInfoRows` 開頭加拼配分支（判斷同 shelf/cardDataFor：名字命中 blends 就是拼配）：明細改列配方成分「比例｜成分豆·處理法·產國」，成分用 `greenForPart` 從 green stock 消歧（Danche→Danche v3 補產國實測 ✓），生豆庫沒有的退回配方 process，空成分濾掉；Roasted 行照舊尊重 omit。**改這一處＝摺卡/social origin 圖/Square 商品圖/email 卡全部生效**；shelf 抽屜不受影響（它 recipe.length>0 時本來就不畫 The coffee 區）。驗證：jscheck ✓、mock sb.from 實測拼配與單品輸出 ✓（本機 anon 被 RLS 擋、讀不到真 blends，真資料驗證＝部署後開一支拼配豆出摺卡 PDF 看明細頁）。

## 〇、補記 — 2026-07-10 之三（🚑 上線事故＋hotfix：boot 炸在已拆除的 #chips）
- **事故**：老闆 push 今日流 v3＋閹割階段一後回報「生豆熟豆完全空白」「購物車沒連 Square」。真因＝chips 列退役時**只刪了 renderChips 函式與 #chips div，漏刪三處 `$('chips').innerHTML=''` 直接引用**（boot/renderPublicMenu/renderCustomerPortal）→ boot 一進場就 TypeError 中斷，**loadAll 沒跑**→ 登入後 DB 全空（生豆/熟豆/今日流）、店面/購物車綁定沒掛上。兩個症狀同一病灶。
- **修**：三行刪除，`$('chips')` 引用歸零（commit 89f099e）。修後實測：未登入 boot 走通進店面、加購物車 2 件、POST public-shop checkout 回 200＋Square 付款連結（total $50，未付款無交易）——**購物車↔Square 鏈本來就是好的**。
- **⚠ 教訓（以後照做）**：拆 DOM 元素時要 **grep 元素 id 的全部引用**（`$('xxx')`/getElementById），不能只清函式與 HTML；靜態 jscheck 抓不到 null.innerHTML 這種 runtime 錯，**未登入 boot 路徑也要在 preview 跑一次**（這次 stub 測試都從 renderFeed 進場、繞過了 boot）。
- **另一件事（資料非 bug）**：Roasted Stock 只有 Danche v3 一批＝其他 15 筆 roasts 沒填 roasted_kg/remaining_kg（記烘豆時 Roasted out 沒填），貨架靠這欄算庫存；老闆之後記烘豆要填，舊批可從補登入口補。

## 〇、補記 — 2026-07-10 之二（閹割 classic 階段一·換門面：根網址改由新殼接管）
- **背景**：老闆下令開始閹割 classic。盤點發現 classic 握三條對外命脈（?bean 罐標 QR／?fb 回饋 QR＋新殼 feedback 鈕／?shop email 連結，全指根網址）——所以第一刀是**換門面不砍功能**：網址不動、門後換人。
- **① 根換新殼**：新建 `vercel.json` `{"rewrites":[{"source":"/","destination":"/new/"}]}`；`index.html` → git mv `classic.html`（歷史保留）。已印出的實體 QR／寄出的 email 連結全部無痛沿用；員工 PWA `/new/` 不動。classic 入口＝`/classic.html`（登入頁加一行「Back office — daily ops now lives at /new」告示）。
- **② 新殼移植兩個公開處理器**（皆免登入 overlay，蓋 app 上層不擋 boot；CSS 用新殼 tokens 明暗自適應）：`?fb` 回饋表單（重構成 `showFbOverlay(ref)`——內部 Leave feedback 鈕改呼叫它、不再跳頁）＋ `?bean` 公開豆頁（含 `sampleRadarSVG`/`fmtDate` 一併搬入；`?shop` 免移植——新殼 signed-out 本來就是店面）。
- **③ CLASSIC 常數** → `'/classic.html'`（8 個跳轉點跟著走）。
- **④ 安檢結論**：新殼 manifest/icon/sw 全絕對路徑 ✓；classic 無自引 ✓；根目錄 `logo.png` 等實體檔不受 rewrite 影響 ✓；**push-send 的 url 預設 `/new/`**（查過 edge 原始碼）推播不受影響 ✓。
- **驗證**：jscheck 兩檔 ✓；本機 serve——`?fb=store` 表單→真寫入 feedback（端到端過，測試筆已刪）；`?bean=Kii AB` 真資料豆頁（風味 chips/雷達/品種海拔）夜版截圖 ✓；classic.html 改名後登入頁完好。**部署後必驗（老闆 push 後）**：curl 根 grep `swipewrap`＝新殼接管；`/classic.html` 完好；**拿實體罐標掃 QR** → 新殼豆頁（最重要）；客戶開根下單到 Square；`?checkout=done` 清購物車。⚠ ruby 本機不吃 vercel.json，「根→新殼」的 rewrite 行為只能上線驗。
- **階段二 backlog（每項移植或丟棄，老闆逐項拍板後另開工）**：建議移植＝Finance P&L／Announce 群發／Invoice GST PDF／拼配編輯／Dial-in 編輯／Buy log；待老闆答＝C-Market（開 TradingView 就好？）／Files（改雲端硬碟？）／Contacts（併 Customers？）／生豆樣品分析（還用嗎？）／Admin 開帳號（改 Supabase 後台？Stage C 快到）。**階段三＝缺口清完後 classic.html 整檔刪除**。

## 〇、補記 — 2026-07-10（今日流 v3：防誤滑＋分組＋晨報彈窗公告板＋收尾清單＋記名＋派工——一次五需求，5 commits 等 push）
- **背景**：老闆連發五需求①滑卡誤觸把工作滑掉②工作多不好讀③晨報卡不想點（改 popup）④要公告板（停水/客訴/VIP 上報）＋30 天事件行事曆⑤做完要記名字＋早上派工每人只看自己的。計畫檔 `~/.claude/plans/today-to-do-list-elegant-teapot.md`（九改動全記錄）。**全部完工並逐項 preview stub 驗證**，5 個 commit 在本地 main（26509ad→c4b1e97）**等老闆 GitHub Desktop push**。色彩紀律＝老闆要求「不要太花」：不新增色相、色只出現在色條/色點/icon、公告用細色條不用大色塊。
- **① 兩段式滑卡（防誤滑核心）**：卡片外包 `.swipewrap`（下墊灰色 `Later` 鈕 88px）；左滑放手只「滑開停住」（`SWIPE_OPEN` 全域、一次一張），**再點 Later 才 snooze**；點卡本體/滑開別張＝彈回；右滑 >35% 直接做（原樣）；方向鎖保留。`dropCard` 改平移整個 wrap。snooze toast 帶可點 **Undo**（`toast(msg,act,fn)` 第二形態＋`.toast.act` 開 pointer-events）；統一入口 `snoozeCard(id)`。
- **② 站別分組＋摺疊**：`renderFeed` 切三層＝置頂（pin/hot/mine 不分組）→ `st` 連續段分組（`.grphead` 色點＋站名＋張數，點擊摺疊，狀態存 sessionStorage `feed_folded`）→ undo/ctxline 沉底。**chips 篩選列退役**（renderChips 刪除、#chips div 刪、`.chips` CSS 刪；`.chip` 元件 CSS 保留——排班/薪資等抽屜還在用；`filter` 變數機制保留固定 'all'）。**All clear 收工畫面**（全清空時 ✓＋nice work）。
- **③ 晨報卡→每日 briefing 彈窗**：buildItems 的 brief 卡刪除（briefBits 統計一併刪；班表摘要收進 `BRIEF` 全域）；`openBriefSheet`＝drawer 承載：日期＋N to do／班表行（含 `offToday()` 休假註記）／公告全文列表／今日事件／`Next 30 days: N ›`／Post＋**Got it — start the day**。**每天首次進 feed 自動彈**（localStorage `brief_seen`=日期，per 裝置；`BRIEF_AUTO` 本次啟動只彈一次）；header 新增**喇叭鈕 #hbell**（SVG，customer 不顯示）隨時重開＋**紅點 #hbdot**＝有「ts 晚於 localStorage `brief_seen_ts`」的新公告；開彈窗即 `markBriefSeen`＋首次 `logAct('read brief')`（誰沒讀晨報→Activity 查）。
- **③b 公告板**：`app_state` 新 key **`new_notices`** `{notices:[{id,txt,body,lvl:'warn'|'info',by,ts,from,to}]}`；顯示條件 from≤today≤to；發布時順清過期；`openNoticeSheet`＝文字＋詳情＋等級二選（heads-up=accent 左條/info=灰左條）＋有效期三選（Today/Tomorrow/This week）；非 read-only 皆可發可刪。
- **④ Upcoming 事件流**：**新 DB 表 `events`**（id/date/txt/kind/by/created_at，RLS staff all，migration `add_activity_log_and_events`）；loadAll 撈今起 30 天＋**staff_na 休假唯讀併入**（顯示在 max(start,today) 一條）；`openUpcomingSheet` 按日 agenda（Today/Tomorrow/日期），kind＝booking/parcel/vip/care/other＋roster off；`openEventAdd` 日期+kind+文字；刪除＝發起人或 lead。Tools 磁貼 **Upcoming**（Daily task 群）。
- **⑤ 操作記名**：**新 DB 表 `activity_log`**（append-only：staff 只能 SELECT+INSERT 不能改刪）；前端 `logAct(action,ref,note)` fire-and-forget 永不擋正事；**佈點 15 處**＝accept/pack(Ready)/dispatch/paid/decline/cancel/task done/dial-in/cupped/qc 判定/roast 單品/roast 拼配/add to qc pipeline/receive green/stocktake＋新功能（read brief/posted notice/added event/ticked closing/closing complete/assigned the day）。Tools 磁貼 **Activity**（Team 群）＝時間軸抽屜（按日分組、50 筆一頁 Earlier 載更多、全員可看）。
- **⑥ Closing checklist（每日收尾清單）**：`CLOSING_HOUR=14`（常數可調）起 buildItems push 聚合卡（`sink:1` 沉底＋`nosnooze:1` 滑不掉＝cardHTML 不出 Later 鈕、attachSwipe 不停靠）；`openClosingSheet` 逐項大打勾（記打勾人名、樂觀更新先畫後存）、全勾完 toast 收工＋卡片消失；`openClosingEdit` 老闆加減項目。app_state key ×2：**`new_closing_items`**（`[{id,txt}]`）＋**`new_closing`**（`{'YYYY-MM-DD':{itemId:'人名'}}` 日期 key **隔天自動全新**，寫法同 snooze）。清單空時只給 lead 一張「Set up」引導卡。
- **⑦ 派工＋視角＋進度行**：app_state key **`new_assign`**（`{'YYYY-MM-DD':{cardId:'人名'}}` 隔天歸零＝每天早上重新分發）；`cardOwner(i)`＝task 卡沿用 assigned_to、其餘查派工表。**Assign 模式**（lead）＝進度行 Assign 鈕進入、每卡腳換人名膠囊點擊輪換（anyone→班表人員→…）、Done 退出（task 卡唯讀提示 from task card）；派工模式下滑卡停用。**視角**＝`My day · N`（預設：我的＋pin/hot/sink）/`Everything · N` 兩 chip；沒人認領收 **Up for grabs** 摺疊組（FOLDED key `__grabs`）；hot 全員可見防漏接。**team 進度行**（lead only）＝每人 `done/total`（done＝派了且已不在 ITEMS 且非今日 snooze）＋`N unassigned` 虛線＋點人名看該人清單（`VIEW_AS`，卡標題帶「· 名字」歸屬註記）＋back to me。
- **驗證**：每段 jscheck ✓＋serve 複本 stub 全流程（滑開/點 Later/Undo/摺疊/sessionStorage/垂直捲動方向鎖/自動彈窗/喇叭重開/紅點熄滅/Upcoming 按日+休假/打勾記名/全勾收工/Assign 輪換/My day 過濾/進度行數字/Yi's day 瀏覽），console 零錯誤＋截圖兩張。⚠ **真機還沒掃**：真資料 regression（低庫存卡 kind:'dismiss' 路徑仍在用）、iPhone PWA 滑卡手感（-88px 停靠）、真發公告跨裝置同步、activity_log/events RLS 真帳號行為。
- **陷阱備忘**：①`kind:'dismiss'` 仍被低庫存生豆卡使用（brief 卡刪了但分派保留）②Help 頁手勢說明已同步兩段式③loadAll 現在 Promise.all **18 個查詢**（rs[12]=new_notices rs[13]=events rs[14]=staff_na rs[15]=closing_items rs[16]=new_closing rs[17]=new_assign——**加查詢要照 index 順序**）④閹割 classic 時注意 classic 端動作**沒有 logAct**（缺口清單追加）。
- **後續待辦（老闆點頭再開工）**：morning-brief 推播帶當日公告、發公告/被派工即時推播（push-send 已有 to 參數）、事件一鍵轉 task、classic 端補 logAct。

## 〇、補記 — 2026-07-09 夜（睡前巡檢：部門配色＋卡片重疊 bug＋classic 缺口盤點）
- **背景**：老闆睡前要求「開 Chrome 檢查所有按鈕/banner/功能有無溢出、對齊、破圖並直接修；同部門上同色；debug/瘦身；盤點 classic 還沒移植的（準備閹割）」。⚠ **桌機 Chrome 仍登出**（代跑不了營運端），故走**本機 serve 複本＋注入 stub（WHO/ROLE/DB）在真瀏覽器渲染**驗證；客戶購物頁用線上真資料看。
- **UI 巡檢結果**：客戶購物頁（輪播卡/分類頁籤/購物車抽屜）＝乾淨無溢出無破圖；Tools（director 31 磁貼）＋今日流＋QC 台 stub 渲染＝**頁面零橫向溢出、零破圖**。唯一「溢出」是設計上的 `.bglogo`（旋轉背景、pointer-events:none），非 bug。
- **🐛 真 bug 修掉：今日流卡片長標題撞右上角 cattag**（new/index.html ~line 601）。長客戶名（如 wholesale 長店名）時，標題第一行文字會壓到絕對定位的 `● WHOLESALE · NOW` 標籤上。原本 `.t` 寫死 `padding-right:92px`，但「Wholesale · now」標籤實測 124px 寬 → 不夠。**修法**＝右內距改**依標籤長度動態算** `pr=Math.max(92, 22 + i.st.length*8 + (i.hot?46:0))`：短狀態維持 92px 不浪費、長的（Wholesale/Roasting＋now）自動加寬。preview 實測長名卡標題在標籤前換行、不再重疊。
- **✅ 部門同色（老闆要的「同部門同色」）**：Tools 8 部門原本標題全同一灰。**關鍵發現**＝今日流卡片早有一套 `STCOLOR`（Orders 玫瑰/QC 藍/Roast 琥珀/Shelf 紫/Transaction 橄欖…，連篩選 chip 都用），我一開始另配了一套土系色**跟它撞**（Shelf 卡片是紫、我 Tools 卻上綠）。改成 **Tools 部門色直接沿用 STCOLOR**＝整個 app 同概念同色：`DEPT={prod:STCOLOR.Roast, qc:STCOLOR.QC, shelf:STCOLOR.Shelf, ord:STCOLOR.Orders, fin:STCOLOR.Transaction, day:STCOLOR['Daily Task'], mkt:'#B75C93'(新), team:'#7B78C0'(新), app:'#8A8A8A'}`（Marketing/Team 卡片端無對應→給不撞的新色）。呈現＝gsec 標題上色＋前導圓點 `.gdot`＋磁貼**左側 3px 色條**（`--dept` 下放到 `.tool` 的 border-left，呼應卡片 border-left:4px）；建立類磁貼（_mkTile）改成「部門色條＋玫瑰色文字」（原本是玫瑰整框，會蓋掉色條）。明暗兩版皆實測清楚。CSS 動了 `.gsec`（flex＋gdot）、`.tool`（border-left:3px var(--dept)）。
- **瘦身/debug 結論**：339 個函式**零死碼**（唯一單次出現的 `init` 是進入點 IIFE）；stub 渲染 feed/tools/qc **零 runtime 錯誤**（只有 serve 複本缺 sw.js 的 404，線上有）。檔案 424KB 主要是正當內容（含兩塊 ~25KB 品牌卡 base64，內嵌是為 canvas 匯出免 CORS，不宜動）。**結論＝程式碼已精實，無有意義的瘦身空間**；硬壓縮反害單檔可維護性。
- **順手觀察（未動，待老闆決定）**：Tools 頁 **Notifications/Appearance（個人設定）排在最上面**，把 Production 等工作部門擠到下面捲動才到——建議挪到最底（App 附近）減少每天捲動摩擦，但會動到肌肉記憶，沒老闆點頭先不改。
- **✅ 利潤計算機移植進 /new（老闆選「1」＝classic 缺口清單第 1 項）**（new/index.html）：classic 的 `CALC_HTML`（fx:calc iframe）改成新殼原生抽屜 `openCalcSheet()`，磁貼放 **Finance 群**（`calc`，rsMoney gate）。**計算邏輯逐字照抄** classic getBase/calcRetail/calcWholesale（cxBase/cxResults），零售/批發雙模式（pm-seg 切換）；輸入：鍋數/生豆價/每鍋生豆/失重％、包裝尺寸 seg（150/250＋自訂 Add size）、售價、包裝成本/包（袋/貼/盒）、包裝人事（費率/速度）、固定成本（場地/烘豆人事/交通）；結果＝指標卡（可賣包數/熟豆 kg/利潤/毛利，批發＝包數/每包利潤/訂單利潤/毛利＋MOQ 狀態條）＋成本拆解列。**狀態存全域 CX，不寫 DB**（純試算，同 classic）。新 CSS 一套 `.cx-*`（用新殼 tokens，明暗皆可）。**驗證（真瀏覽器 stub）**：參考案例 4鍋·10kg·13%·$30·150g@$25 → **232 包/34.8kg/利潤+$4159.00/71.7%**＝與 classic 逐欄一致；批發 232包/每包+$4.93/訂單+$98.53/41.1%/MOQ 免運；即時重算（8鍋→464包·$8468）；MOQ 未達（qty5=$60→「needs $90 more」+$20 運費）；jscheck ✓。⚠ 真機看抽屜長度捲動＋老闆用真數字對一遍。
- **✅ 磁貼「可改色」規則擴大（老闆定調：做 app 期間先標，完工後整組拿掉）**（new/index.html renderTools）：原本只有 6 顆「一鍵新增」捷徑（_mkTile）是玫瑰色，其他會改資料的管理抽屜是白色（灰色地帶）。老闆要「**灰色地帶全部進可改色**」。做法＝`_tiles` 加第 4 元素 `x[3]` 真＝上 `color:var(--accent)`；標記 6 顆：**Delete a coffee**（_mk gate，1）、**Wholesale**（director，1）、**Payroll**（`_mk?1:0`＝finance 唯讀故白、director 玫瑰）、**Timesheet**（`_mk?1:0`＝staff 唯讀白、lead 玫瑰）、**Team notes**（`_mk?1:0`＝護欄擋非 canWrite 寫入故 staff 白）、**Team**（isLead gate，1）。**Calculator 維持白**（純試算不寫）；Menus/Info cards/IG asset 維持白（產出素材、不寫 DB）。判定收斂到 `_mk=canWrite()=isLead()`＝「這人在這顆能不能真的改到資料」。驗證：director 6 顆全 #C97783、Calculator/Green stock 白；staff 視角 Timesheet/Team notes 回白（改不了就不上色）。⚠ **這是臨時規則**，app 完工後把 `_mkTile` 的玫瑰＋`_tiles` 的 x[3] 一起拿掉即可回中性。
- **✅ Info cards 改成「一張 A4 = 4 張雙面卡」（老闆定稿，openInfoCardPrint 整段重寫）**：原本 A4 橫式＝2 張對摺卡（每卡 4 面）。老闆要把卡轉 90° 縮成**直式 2×2 田字格**、一面 4 張。做法＝**A4 直式雙面**（jsPDF `[210,297] portrait`）、PDF 仍 2 頁（正面頁＋背面頁，故 canvas 仍≈12MP、scale 2.6 不動、無 iPhone 破圖風險）：**兩面內容分組（老闆三修定稿）**＝面 1「封面＋QR」（cardCover：logo＋Ratio Coffee＋SPECIALTY COFFEE LAB＋菱飾＋豆名＋3 風味詞＋QR＋Scan for this coffee＋聯絡）／面 2「風味雷達＋產區明細」（cardInfo：The coffee＋豆名＋雷達＋8 行明細表）。**頁序**＝第一頁（正面正立）放 cardInfo（雷達＋明細）、第二頁（背面 .flip 轉 180°）放 cardCover（封面＋QR）。**每張卡再對摺一半（老闆定案，2026-07-09 四修）**＝上下兩半、中線對摺虛線：cardInfo＝上半雷達置中＋下半明細置中（同方向，對摺後是內頁上下連續讀）；cardCover＝上半封面 `transform:rotate(180deg)`＋下半 QR 不轉（反方向頭對頭，對摺後外頁兩面各自正立）。`.inner` padding:0、兩半各 flex:1 置中。**4 張同一支豆（identical）→ 裁十字成 4 張時正反自動對齊、不需鏡像**；背面頁用既有 `.flip`（整頁轉 180°）補雙面短邊翻的朝向。摺卡的 4 面壓成 2 面。**正反面定位（老闆 2026-07-09 二修）：第一頁（正面）＝明細面正立、第二頁（背面）＝封面面轉 180°**（page1 放 cardBack×4、page2 flip 放 cardFront×4；老闆要雙面印後這個朝向才對），fold/foldl/strip/panel 舊結構全換成 grid/card4/cutv/cuth4。CSS 一套新的（105×148.5 卡、字級縮小、明細 7.4pt）。驗證：stub 攔 html2pdf＋假 8 行明細，離屏 host 移進畫面截圖——正面頁 4 張齊（logo/Dancer/Red apple·Jasmine·Honey/雷達）、背面頁 4 張齊（8 行明細 Origin→Sourced via 全塞下＋QR＋聯絡，180° 倒轉＝印後正立）、十字裁切線在、無溢出；jscheck ✓。⚠ **真機下載印一張還沒做**：老闆要確認①4 張排版②雙面對齊③**背面若上下顛倒＝把印表機雙面設定在短邊↔長邊之間切換**（4 張同款故對齊永遠對，只影響背面正立方向）。
- **⚠ 以上 new/index.html 改動（部門色＋卡片重疊修＋計算機＋可改色＋Info cards 4 卡直式）尚未 commit/push**——老闆過目後用 GitHub Desktop push。閹割清單第 1 項可劃掉。
- **📋 classic 移植缺口盤點（準備閹割 classic）**：見下方「classic 缺口清單」專節。

## 〇、classic 缺口清單（2026-07-09 盤點 · 閹割前要嘛移植要嘛確認丟棄）
classic 功能樹＝12 泡泡站（onOpen）＋ DOCK 模組。逐一比對 /new：
**A. 新殼完全沒有（要嘛移植、要嘛老闆確認不要）**
1. **利潤計算機 Retail/Wholesale Calculator**（classic fx:calc/order:calc＝`CALC_HTML` iframe，零售+批發雙模式、烘豆參數/包裝/固定成本→利潤率）——/new 完全沒有。Finance 儀表板也連它（model margins）。
2. ~~**Coffee C-Market 生豆行情**~~ ✅ **2026-07-12 之六移植完成**：/new Production「C Market」磁貼＝TradingView 圖（明暗自適應）＋落地成本試算＋live 匯率，公式照 classic；細節見補記。**A 組剩 #7 Files／#8 Contacts／#9 Admin 三項等拍板。**
3. ~~**生豆採購紀錄/買入帳 Buy log**~~ ✅ **2026-07-12 之二移植完成**：/new Tools「Buy log」磁貼＝Buy shortlist 預填下單→On order→收貨併批入庫＋stock_moves；細節見補記。**生產線 100% 住進新殼。**
4. ~~**財務儀表板 Finance P&L**~~ ✅ **2026-07-12 之三移植完成**：/new Tools Finance 區「P&L」磁貼＝本月/上月已收、未收/逾期前 6、庫存價值、本月買豆，口徑照 classic；細節見補記。
5. ~~**GST 稅務發票 Invoice**~~ ✅ **2026-07-12 之四移植完成**：/new Finance「Invoice」磁貼＝手填表單＋GST 口徑照抄＋jsPDF＋發票號 app_state 接續；細節見補記。
6. ~~**行銷群發 Announce**~~ ✅ **2026-07-12 之五完成**：/new Marketing「Announce」磁貼＝挑上架豆→QC 閘門→群發（核心 announceShelfBean 早在 Coffee Info 詳情做好，本輪補磁貼直達）；細節見補記。**建議移植三件套（#4/#5/#6）全清空。**
7. ~~**檔案庫 Files**~~ ✅ **2026-07-12 之八收薄殼**：/new App 區「Files」磁貼＝三份靜態文件連結（檔案本體一直在 repo 根）；細節見補記。**缺口清單 12 項全數收掉，classic.html 同日整檔刪除（階段三完成）。**
8. ~~**通訊錄 Contacts**~~ ✅ **2026-07-12 之七移植完成**：/new Orders & customers「Contacts」磁貼＝類型四色＋過濾＋CRUD 照 classic＋logAct；細節見補記。
9. ~~**Admin 成員管理**~~ ✅ **2026-07-12 之七移植完成**：/new Team 抽屜 Accounts 區補「+ Add account」（獨立 client signUp 不頂掉 session）；改角色/lead 本來就有、密碼閘由 director gate 取代；細節見補記。**A 組只剩 #7 Files 等拍板。**
**B. /new 有但唯讀，編輯仍要回 classic**
10. ~~**拼配配方編輯 Blending**~~ ✅ **2026-07-11 之六移植完成**：/new openRecipeSheet 已升級可編輯（有寫入權可改名/成分/比例/note/comment＋新增刪除＋rename cascade relink 三表），唯讀者維持看；細節見補記之六。
11. ~~**Dial-in 濃縮沖煮紀錄編輯**~~ ✅ **2026-07-11 之九移植完成**：/new Tools「Dial in」磁貼＝自由選豆（單品∪配方）＋note＋帶上次數字＋Apply to brew guide；細節見補記之九。
12. ~~**生豆樣品分析 Sample analyse**~~ ✅ **2026-07-11 之十移植完成**：/new Tools「Sample analyse」磁貼＝活雷達滑桿評分＋風味＋歷史＋Buy/Maybe/Skip；細節見補記之十。**B 組三項全清空。**
**C. classic 本來就沒做（非缺口）**：green:sell、program＝「soon」占位。
**建議閹割順序**：先移植/確認 A 組高頻的（4 財務總覽、6 群發、1 計算機是老闆常用的三個）；B 組唯讀已可用、編輯低頻可暫留 classic 連結；A 組低頻的（7 檔案、8 通訊錄）確認是否真要。

## 〇、補記 — 2026-07-09（唯讀護欄＋Labels 移植＋上架入口）
- **Tools 停用跳 classic 的傳送門**（new/index.html）：Tools 裡會 `location.href=CLASSIC` 的 6 個磁貼（Make 區 Invoice/IG asset/QR codes/Announce＋Look up 的 Classic app；原本還有 Labels 但下面移植後移除）改成 `disabled`＋灰 40%＋小字「· off」，保留可見好復原。commit 080f950。
- **Header logo 放大 70%**（new/index.html）：`.brandlogo` 36px→61px。全頁共用（feed/QC/Tools/店面）。commit 080f950。
- **/new 唯讀護欄（老闆定：除 manager+director 全唯讀，整個 /new 全鎖）**（new/index.html，commit e09da74）：核心＝`canWrite()`＝`isLead()`（director 或 lead/manager）。**總閘門**＝包 `sb.from` Proxy（select 等讀取照過，insert/update/upsert/delete 一律擋，回傳「解析成 {error} 的可鏈式 thenable」不炸只靜默＋節流 toast「Read-only — ask a manager」）＋`callFn` 擋 edge 變更（第三參數 roOk 放行）。前台守衛：runAction/qcVerdict/addSnooze/openListSheet 早退、attachSwipe 不綁、Tools 藏 Make 區＋Delete a coffee。**例外（個人手機設定放行）**：訂閱推播（`sbRaw` 繞過）＋Send test（callFn roOk=true）＋深色模式（本來就 localStorage 非 DB）。**finance 也完全唯讀**（老闆拍板，不做薪資例外——Mimi 帳號未開故現無實影響）。⚠ 這是**介面層鎖**，RLS 未動（工程師 console 理論可繞，要硬牆另開單）。驗證：preview 模擬 staff——寫入全擋讀取正常、director 照寫、Tools 藏 Make/Delete、通知＋深色放行。
- **classic Labels（袋標＋罐標）整組移植進 /new**（new/index.html）：Tools→Make 新增「Labels」磁貼→`openLabelSheet()` 抽屜（頂 Bag/Tin 切換）。**資料層接新殼既有的**（RETAIL_BEANS/loadBlendDefs/blendDefByName/loadGrams/sampleDisp/beanForSample/retailByDisp/roastDateForSample/soReadyDM＝Menus 移植時就有，沒重造；只有 RETAIL_BEANS/soReadyDM 不可重宣告）。**.lbx 產生邏輯逐字照抄 classic**（Brother P-touch 範本 XML 就地改字＋lblFitBlock 自動縮放；tin 另嵌杯測雷達 BMP＋乾淨 logo BMP＋風味行）。JSZip 用 `loadScriptOnce` 首次才載；範本檔用 repo 根 `/blend-label.lbx`、`/tin-label.lbx`（絕對路徑，classic 是相對）；logo 用 `/logo.png`。CSS 新增 `.lbl-*/.smp-*/.gbtn/.gform-msg/.rtl-recipe` 一套（用新殼 tokens）。Bag：Blend/Single Origin；Tin：Single/Blend（blend 配方讀 classic F(x)→Blending 的 blends 表，只讀不編）。gated 在 Make 區＝manager/director。Ready brew date＝烘焙日+21 天（3 週，soReadyDM；沒烘焙日退杯測日）。驗證：jscheck ✓；preview 真範本實測——袋標 XML 置換（名字/產地/READY BREW DATE/NET 全中、DARK KNIGHT 消、重壓 212KB）、罐標（產地/處理/海拔置換＋radar 940KB＋logo 409KB＋風味注入、重壓 40KB）、UI 抽屜截圖乾淨、console 零錯誤。⚠ 真下載開 P-touch Editor 印一張還沒做（老闆自測）。
- **Retail Info「Ready to list」改成可點直接上架**（new/index.html）：openRetailSheet 那區原本唯讀路標「use the List card in Today」→ 改 `data-tolist` 可點列「QC passed · tap to list ›」→ `openListSheet(it)`。至此上架兩入口＝Today 的 List 卡 or Tools→Retail Info→Ready to list。順手在 openListSheet 頂加唯讀守衛（三入口一致：Today 卡/Retail 新入口/Edit listing）。驗證：preview——點列開「List · <bean>」抽屜、staff 擋 director 開、console 零錯誤。
- **✅「下面的時間沒照 ready brew date」根因＝新鮮度模型與 ready brew date 天數對不上（老闆說的是整個 app）**：Labels 的 soReadyDM 是烘焙日+21 天（對），但貨架/店面新鮮度常數 `SHELF_FRESH_REST` 原本 14 天→豆子第 15 天就顯示 ready/prime，比標籤早一週。**修法＝新鮮度三段全部照 ready brew date 對齊（老闆定案）**（new/index.html）：`SHELF_FRESH_REST=21, SHELF_FRESH_PRIME=42`（原 14/28）＋換字＝**烘後 <3週(21d)=aging🟡（還沒好）／3–6週(21–42d)=ready🟢（最佳）／>6週(42d)=fading🔴（>60天加 re-roast?）**。一個常數同時餵 `shelfFreshness`（內部貨架 line ~1300）＋`shopSpecsFor`（客戶商品明細 band，line ~5425）＝整個 app 同步。顏色：aging=fr-yellow／ready=fr-green／fading=fr-red（老闆沒指定色，我配黃綠紅＝等/最佳/該處理，可再調）。舊字串 resting/prime/ageing 沒被邏輯引用（只 render fr.txt，line 1377 的 split('— ')[1] 照舊 work）。驗證：jscheck ✓；preview 假資料——貨架 10d aging🟡/22d ready🟢/43d fading🔴/62d fading·re-roast?🔴、客戶 10d aging/30d ready/50d fading、console 零錯誤。⚠ prime 賞味窗現在是 21–42 天（老闆定的 3–6 週）；ready brew date 本身邏輯沒動（本來就對）。

- **Dispatch tracking 加掃描鈕**（new/index.html，先前 session 已寫進工作區未 push）：openDispatch 抽屜 Tracking 輸入框右側加 `dp-scan` 鈕（重用 Labels 的 `.lbl-namewrap/.lbl-namebtn`）→ `openTrackScan`：按需 `loadScriptOnce` html5-qrcode（QR＋一維皆讀）→全螢幕黑底 `#scanov` 相機層→掃到填回 `dp-track`＋toast，不寫 DB（按 Dispatch 才存）。無相機／未授權／載入失敗走英文防呆保留手動輸入。jscheck ✓。
- **Timesheet 開放全員（唯讀）＋員工自標休（Stage C 第 3 步核心）**（new/index.html）：老闆定案「全 staff 都能看排班、不能改、只能 request N/A」。做法：①Tools「Timesheet」磁貼門檻放寬＝director/finance/roaster/retail/staff＋lead（wholesale/customer 本來就進不了 Tools）；staff 副標「your shifts · days off」。②`renderRoster`/`rosterPersonHTML` 加 `canEdit=isLead()`＝**唯讀化**：非 lead 藏 Apply/Edit 模板列、藏「+ shift」、班列改成不可點 `div`（不掛 data-rsedit）、藏未指派「— tap to assign」空列、藏 Save；「Past weeks & pay →」只給 rsMoney()||canEdit。③新增「My unavailability」抽屜（有 WHO 就出，非 lead 時當主鈕）＝`openMyNA/addMyNA/delMyNA/rsRangeLbl`：列自己（name===WHO）的休假、From/To 日期加一筆、Remove 刪一筆，名字自動帶 WHO。**寫入走 `sbRaw`（繞唯讀護欄，屬「個人設定」例外，同推播訂閱）**——真牆是 staff_na 的 RLS（is_staff() 且 name=my_profile_name() 或 money）。⚠ **rosters 表 RLS 仍是 is_staff() 全放行**（DB 上任何 staff 可寫排班）——現只有 UI 層擋 read-only；要硬牆需另開 is_lead() SQL＋改 rosters write policy（老闆未要求，暫緩）。錢＝staff_rates/pay_weeks 早就 money-only RLS＋rsMoney() 前端雙鎖，唯讀開放不影響。驗證：jscheck ✓；preview stub——staff 唯讀（無 Save/tpl/+shift/edit btn/tap-assign、有 My unavailability、無 Past pay、顯示已排的人）＋截圖、lead 全編輯照舊、My unavailability 抽屜（add/from/to/既有列/remove/back 齊）、By person 唯讀無 edit btn、staff 下 sb.from 寫入被護欄擋成 thenable 而 sbRaw 是真 builder、console 零錯誤。⚠ 真機＋真員工帳號（RLS 只准自填、跨裝置 realtime）等 Stage C 開帳號後掃。**尚未 commit/push**。

- **貨架清單（Retail Info）加進 QC 工作台**（new/index.html）：老闆要杯測時也能看貨架。做法＝`renderQC` 兩個分支（佇列清空／有佇列）都在「＋ Add a past batch」下面多一顆 `.more` 鈕「Shelf · on sale now」（id `qc-shelf`），`wireExtras` 綁 → **重用既有 `openRetailSheet()`**（就是 Tools→Retail Info 那個抽屜，沒改它，只多一個入口）。唯讀：openRetailSheet 只 select，staff 也能開。驗證：jscheck ✓；preview stub——兩狀態都出 qc-shelf 鈕＋文案對、點擊觸發、console 零錯誤（drawer 內容因 preview 無 session 卡在 app_state await，真機同 Tools 入口正常）。**尚未 commit/push**。

- **Tools 依生產線四類重整（責任分區）**（new/index.html，plan `~/.claude/plans/lookup-production-declarative-robin.md`）：老闆要 Tools 上面那排雜亂的 Look up 照「生產線一進一出」分好類、好分工。定案四類（＋App）＝**Production**（生豆→烘焙→〔QC∥Recipe〕→上架：Receive/Log roast/Stocktake＋Green stock/Roasted Stock/QC 捷徑/Recipe/Retail Info/Delete a coffee）／**Orders & customers**（New order＋Orders/Customers/Wholesale）／**Daily task**（New task/Labels＋Info cards/Menus＋4 個停用 classic 行銷磁貼）／**Team**（Timesheet/Team notes/Team）／**App**（Classic/Help/Sign out）。做法＝`renderTools`（~5063）加 `_groups` 字串：`_mk=canWrite()` 決定寫入磁貼（Receive/Roast/Stocktake/New order/New task/Labels/Delete）出不出，唯讀磁貼人人看得到（分組是責任標示、**不是權限牆**——老闆定調：人少常兼職不硬隔離）；helper `_tiles/_mkTile/_offTiles`。舊 Make＋Look up 兩段 gsec 併掉。新分派 `qcgo`（view='qc';render()）＋`recipe`。新 `openRecipeSheet()`＝唯讀：blends 直接查表（name/parts/note）＋近期 dial-in（DB.dialins slice 12），配方編輯連 classic。**權限現狀不動**（canWrite=isLead 主管制）；階段二（讓 roaster/QC/retail 各編自己那區＝放寬寫入權＋RLS）另議未做。門檻沿用：Wholesale=director、Team=lead、Timesheet 全員（唯讀＋主管可編）、Delete/建立類=canWrite。⚠ New task 仍在 canWrite 內（沿用舊 Make 行為，非全員；staff 要溝通走 Team notes 可貼）——若要開放全員建任務再議。驗證：jscheck ✓；preview stub——四類 gsec 全角色都在、成員歸位（director 29 磁貼含建立/wholesale/team/delete/停用行銷；roaster/staff 16＝唯讀瀏覽）、Recipe 抽屜點得開、QC 捷徑磁貼在、console 零錯誤。⚠ 真機看排版＋Recipe 真資料（blends/dial-in）等部署後掃。**尚未 commit/push**。

- **Tools 加第五類 Marketing＋IG asset 點亮**（new/index.html）：老闆看四類後加「Marketing」（對外/生意側，擺 Orders & customers 後）。`_groups` 新增 Marketing gsec；`_offTiles` 改成 `_off(a)` 函式（可分別渲染停用磁貼）。歸位：Menus 老闆定「店面每天用」＝留 **Daily task**（不進 Marketing）；Invoice（GST）＝帳務挪進 **Orders & customers**（停用）；Marketing＝**IG asset（live）**＋Announce/QR codes（停用占位）。停用磁貼現全員可見（category 標示，disabled 點不動）。驗證：jscheck ✓；preview stub director/staff 五類齊全成員歸位。
- **Marketing → IG asset 做起來（社群素材，Phase 1＋1.5）**（new/index.html，plan 補在 lookup-production 檔尾）：**發現 IG 功能新殼早已內建**＝`openPromoSheet()`「Social post kit」（tight 版 1200×1200 品牌卡 `makeSquareCard(...,{tight:true})`＋雙語文案 `promoCaptions`＝IG 英文/小紅書中文＋下載圖＋複製），只是藏在 Retail Info→點豆明細（`sb-promo`）。**Phase 1**＝Marketing IG asset 磁貼改 live（`data-t="igasset"`）＋分派 `if(k==='igasset')openIGSheet()`＋新 `openIGSheet()`：載 rtl_* 記憶＋列上架豆（DB.syncs synced/paused，**最新烘焙排最上**＝先介紹新鮮的）→ 點一支 → `openPromoSheet(shelfSampleFor(nm)||{sample_id:nm},m)`（現成）。**Phase 1.5**＝`promoCaptions` 文案調淡（老闆要「不太商業化、訊息少」）：英文開頭 NEW ON THE SHELF→On the shelf、拿掉「Order through the link in bio」硬 CTA、hashtag 5→3；中文拿掉「歡迎私訊訂購」、hashtag 5→3。**策略建議（已寫 plan）**：一週 1–2 則固定發（穩定>頻繁）、主力風味卡（像故事不像廣告）、**Phase 2 未做＝每週輪播提醒發哪支豆**（今日流卡/晨報＋app_state `ig_last`）讓曝光規律。驗證：jscheck ✓；preview stub——IG asset 磁貼 live、點開出 picker（無資料顯示「Nothing on the shelf」正常）、promoCaptions 假資料吐淡版（無 link in bio/NEW ON THE SHELF/私訊訂購、雙語各 3 hashtag）、console 零錯誤。⚠ 真機＋真資料（挑豆出圖、下載 PNG 看排版、文案貼 IG）等部署後掃。**尚未 commit/push**。

- **Tools 分組再細化成 8 類（依生產線流程＋部門）**（new/index.html，plan lookup-production 檔尾）：老闆看圖多輪迭代後定案。從 5 類 → 8 類，`renderTools` 的 `_groups` 順序＝**Production → QC & Recipe → Shelf → Marketing → Orders & customers → Finance → Daily task → Team**（＋App）。動作＝把 Production 的 QC 捷徑＋Recipe 抽出成「QC & Recipe」（＝未來研發部門的家，老闆說研發同時做拼配＋杯測，所以 Recipe 跟 QC 綁一起、不留 Production）、Retail Info 抽出成「Shelf」（排 QC 後＝烘完→QC 過→才上架）、Marketing 上移到 Shelf 與 Orders 之間（上架→推廣→接單的前後順序）、新增 **Finance**（`rsMoney()` gate＝只有 director/finance 看得到；Payroll `payroll`→openPayrollSheet live＋Invoice/Bookkeeping off 占位；開銷/記帳/報表未來做）。**生豆 stock 清單留 Production**（工具在操作的人手上），Finance 只讀其價值（報表未來）＝不重複放。分派新增 `payroll`→openPayrollSheet。門檻沿用（create=canWrite、Wholesale=director、Finance=rsMoney、Team=lead）。驗證：jscheck ✓；preview stub——director 8 格依序、**staff 看不到 Finance＝7 格**（gate 有效）、成員歸位（QC/Recipe 在 QC & Recipe、Retail Info 在 Shelf、Invoice/Payroll 在 Finance、Delete 留 Production、Invoice 已離開 Orders）、console 零錯誤。⚠ 真機看 8 格排版順不順（手機捲動長度）＋Payroll 抽屜真資料。**尚未 commit/push**（＋前一批已 push 的六件不含本次）。

## 〇、補記 — 2026-07-08 第三 session（Timesheet Stage D 收尾＋打磨）
- **Square 手續費歸零（前端文案）＋QC 底部 bar 真機診斷量尺**（eWAY 付款串接老闆決定延後，探路成果留在對話）：
  - **手續費 0%**：清掉 new/index.html 四處寫死的「+2.2% card surcharge」文案（4632 店面/4712 批發車/兩處 Pay online by card）。**edge SURCHARGE_PCT 密鑰要老闆在 Supabase→Edge Functions→Secrets 設 0**（我無工具設密鑰；四支 edge 都 guard scPct>0，設 0 後付款連結不 ×1.022、信件卡費小字自動消失）。回復＝設回 2.2。classic ?shop 無寫死卡費文案（5386 那條是菜單加購註解）
  - **QC bar 位移＝根因抓到＋修法已上（待真機驗）**：加 dbgRuler 量尺（director 自動顯示）→老闆真機三截圖定案：**standalone=YES**（不是 Safari），但 `innerHeight` 切頁會變（Today/Tools **956**、QC **894**，差 62px）＝**iOS standalone 怪癖：頁面捲不動時 innerHeight 縮一截**（QC 內容短捲不動→894），底部 fixed bottom:0 的 nav 跟著視窗縮往上跳。**修**：body 加 `.appview` class（`min-height:calc(100vh+1px);min-height:calc(100lvh+1px)`）強制內部 app 頁永遠可捲→innerHeight 穩定 956→bar 貼底不跳；class 只在 render() 套、renderPublicMenu/renderCustomerPortal 清掉（**客戶店面不受影響、不多出垂直捲**）。桌機驗證：appview 套上/body 813>812 可捲/店面清掉歸 0 ✓ jscheck ✓。**✅ 2026-07-09 老闆真機確認修好（QC innerH 回 956、bar 貼底不跳），dbgRuler/dbgUpdate 量尺已完整移除**。手續費 SURCHARGE_PCT 老闆亦已設 0（回報「都好了」）。⚠ 教訓：iOS standalone 底部 fixed bar 位移＝**innerHeight 隨頁面可捲性變**（捲不動縮一截），解法＝強制頁面永遠可捲（body min-height > 視窗），不是改 safe-area padding
- **背景 Ratio logo 浮水印全頁開＋傾斜**（老闆「所有背景放這張圖」，附了傾斜版 logo）：①`.bglogo` 顯示邏輯 line ~4552 從 `view==='feed'?'':'none'` 改成一律 `''`（QC/Tools/公開店面/客戶門戶全顯示；以前只給 feed 因空頁像破圖，老闆現在要全開）②CSS `.bglogo` 加 `transform:rotate(-12deg)`＋size 500→440px、center 36%→40% 配合傾斜——**用真 logo.png（mask），非重畫**。驗證：preview QC/Tools 頁傾斜浮水印當紋理不破圖、console 零錯誤＋截圖。⚠ 公開店面/客戶門戶也會顯示（老闆說「所有」）；若不想給客戶看再把顯示條件加回內部 view 判斷。**✅ QC「foot banner 往上了」已修**（＝底部 bar iOS 貼底過高，全頁都有非只 QC）：老闆登入 Chrome＋手機截圖確診——底部 nav/deck 在 iPhone 被 `env(safe-area-inset-bottom)+12px`≈46px 墊高，nav 底色=頁面底色（dark 同色）看起來像浮空一階。**桌機重現不出**（無安全區）→ 用 **serve 複本把 env(safe-area-inset-bottom,0px) sed 成 34px 模擬 iPhone** 才重現＋驗證（真·螢幕底畫青線對照）。修：nav/.shoptabs padding-bottom、.deck bottom 從 `env+常數` 改 `max(env - 16px, 12px)+常數`——iPhone 只留 18px（剛避開 home pill）、**桌機 env=0 時值不變（回退相容）**。sim 驗證 46px→18px 貼底、deck 跟 nav 維持 7px、jscheck ✓。⚠ **PWA 快取**：老闆 push 後手機要關掉 app 重開 1-2 次讓 service worker 換新版才生效（CSS 改動）
- **PWA 桌面 app 圖示換成實心 Ratio logo**（老闆回報「放上去」＝指桌面圖示）：舊 new/icon-192/512.png 是**透明底線稿**→iOS 把透明填黑、糊成一團。新圖＝canvas 合成（/logo.png 置中 0.74＋**實心米白 #F4ECEA 底**，老闆三選一選了 cream+dark）→ 512 由瀏覽器 toDataURL 存檔、192 由 sips 降採樣；驗證實際檔 512×512／四角 [244,236,234,255]／**零透明像素**。manifest.webmanifest：background_color #FFFFFF→#F4ECEA（splash 配合）、icons 加 `purpose:"any maskable"`（實心底 maskable 安全）。⚠ 圖示仍帶 alpha 通道但全像素不透明（PIL 沒裝沒去通道，無影響——iOS 只填真透明像素）；apple-touch-icon 照舊指 /new/icon-192.png。**header 頂部/浮水印/PDF 的 logo 本來就有（mask 上色），沒動**
- **權限＋派工層（Team & Assignment）全鏈完工**（plan mode 核准；migration `task_assignment_and_lead`＋push-send v2＋new/index.html）。老闆四拍板：主管＝**Yi**（lead）、不分部門組純看人派、派工推播叮人、全隊任務透明；主管權限＝**派工＋排班**（錢照樣看不到——rsMoney 不含 lead＋RLS 雙牆）。設計核心：**lead 是能力不是角色**（profiles.lead boolean，與 role 正交，不動 myRole/roles 陣列）；lead 開關被現有 profiles「director update」政策罩住＝主管不能自我升權（pg_policies 查過 USING+CHECK 都 is_director、無欄位白名單）。內容：①migration：tasks+assigned_to（名字，null=共用）+due_date；profiles+lead ②**push-send v2**：body 加選用 `to`（名字→只叮 push_subs.who 該人）、JWT 授權 director→director||lead、無 to 廣播照舊（morning-brief/webhook 零回歸）；anon 401 煙霧測試過 ③boot select 補 lead→全域 LEAD＋isLead()（~487）④任務卡：副標「For you／→ Yi · due 8/7」＋det For/Due 列＋**自己的任務 mine:-50 排序置頂**（晨報後第一批）＋hot 紅邊；myItems 排序鍵加 mine 項 ⑤Tools「New task」磁貼（全員；Make 區）→openTaskAdd：標題＋Due chips（No date/Today/Tomorrow）＋**指派 chips 只有 isLead 畫**（staff 只能加共用任務）；存檔→insert→派給別人時 fire-and-forget push-send{to:名字}（失敗不擋，toast 註記）⑥Tools「Team」磁貼（isLead）→openTeamSheet：每人一列（今日班次＋未完成任務數）點列開預選派工單；**director-only 區＝Stage C Team 抽屜蓋掉**：每帳號改名（✎ prompt，驗證需與 staff_members.name 一字不差、不符警告）＋角色 chips customer/staff/wholesale/finance（無 director 防誤點）＋Lead 開關 ⑦Timesheet 磁貼門檻 director||finance→**+LEAD**（主管排班；副標 pay 字樣只給 rsMoney）。驗證：jscheck ✓；preview stub——任務卡三型（For you 置頂第二張/→ Nina/共用 due）、四身分磁貼矩陣（staff 無 Team 無排班/lead 全有/finance 只排班）、staff 派工單 0 chips、lead 9 chips＋Team 點 Joshua 預選＋insert{title,created_by,assigned_to,due_date}＋push{to:'Joshua'} 逐欄對、director 區 lead 開關{lead:true}/角色 chip{role:'customer'}/director 本人不可改、edge anon 401、console 零錯誤＋Team 看板截圖。**⚠ 等 Stage C**：Yi 帳號建好後在 Team 抽屜點「Make lead」（帳號還不存在所以 lead 旗標還沒設）；staff 按 Tools「Send test」會 401（推播僅 director/lead，本來就 director-only，非回歸）
- **Green stock 加編輯能力**（new/index.html openGreenDetail→openGreenEdit/saveGreenBean，老闆要求）：生豆明細抽屜加「Edit details」鈕→表單 11 欄（name/country/region/station/process/variety/harvest/altitude/cost_per_kg/low_stock_kg/supplier，鏡射 classic GFIELDS）。**刻意排除 quantity**——庫存 kg 走已審計的 Stocktake（明細有 stock_moves 流水帳，直接改數字會讓帳對不上），表單頂註明。**照抄 classic saveBean**：name 空擋、`greenDupExists`（name+process 撞號擋）、空欄存 null、cost/low 數字化；**改名連鎖**＝samples.sample_id + roasts.bean_name 兩路更新（eq bean_id 精準＋is bean_id null＋舊名 legacy），DB.beans/samples/roasts 記憶體同步，buildItems 重算低庫存。驗證：preview stub——11 欄預填/無 quantity 欄/撞號擋（Gatitu AA+Washed）/改名 payload 五筆（beans+samples×2+roasts×2 filters 對）/記憶體三表同步新名/console 零錯誤＋截圖。⚠ 真登入下改一支看杯測/貨架名字有跟著（RLS：beans/samples/roasts 都 is_staff 可寫，director OK）
- **🔴 上條的資料遺失風險 bug（老闆回報「編輯時有些欄位空的」）已修**（同 session）：根因＝loadAll beans select 漏了 region/station/variety/harvest/altitude 五欄 → 編輯表單讀記憶體是空的，**若按 Save 會把這五欄空值存成 null 蓋掉 DB 真資料**。DB 查證資料都還在（功能未 push、老闆存不到，無損失）。兩修：①loadAll beans select 補回五欄 ②`openGreenEdit` 改 async，打開先 `sb.from('beans').select('*').eq('id').single()` 抓**完整列**當表單基準（雙保險：就算記憶體不全也不會 null 覆蓋）。驗證：preview stub 給殘缺記憶體列——表單仍正確顯示 region=Risaralda/variety/altitude/station、Save 寫回真值非 null、console 零錯誤。**教訓：在殘缺的記憶體物件上做全欄位編輯表單＝空欄 null 覆蓋地雷，編輯前必抓完整列**
- **薪資單 PDF 版面 bug 修**（new/index.html buildPayPDF）：RATE 欄與 WAGE 欄文字重疊（cWage=xR-64 太左），欄錨點重排＝`cWd=x0+252,cWe=x0+307,cRate=x0+317,cWage=xR-77,cPaid=xR-62`；用 getTextWidth 精算含四位數金額零重疊、8 人 1 頁。**只驗 byte 數會漏版面 bug——PDF 類改動要量文字寬度或看真檔**
- **finance 今日流不再空**（new/index.html）：晨報卡 roles 補 'finance'＋finance 專屬置頂卡「Timesheet & payroll」(id fin-pay, kind 'paynav'→openPayrollSheet)，director/staff 不出。Stage C 建 Mimi 帳號後生效
- **Info card 摺卡 PDF 第二頁上下顛倒修**（new/index.html openInfoCardPrint）：老闆列印回報內頁反了。雙面短邊翻＝整張背面相對正面轉 180°，故內頁（第 2 頁）內容用 `.flip{position:absolute;inset:0;transform:rotate(180deg)}` 包一層預轉補償（第 1 頁不動）。**驗證**：html2pdf 的 toCanvas 掃紅塊——無轉在左上、加 flip 後翻到右下＝html2canvas 確實吃 transform（放在子元素上，非分頁根，較穩）。⚠ 真列印雙面設定要維持「短邊翻」；若老闆印表機是長邊翻會相反，屆時拿掉 flip 即可

## 〇、補記 — 2026-07-08 第二 session（小收尾打掃）
- **老闆回報兩問題（co-ferment 消失＋售罄沒掛牌）診斷與修**：①**co-ferment 在批發不見**＝全店唯一 co-ferment（Finca Milan，process April Culturing）已售罄（paused），wholesale 舊版菜單只收 synced 把它濾掉 → 分類沒豆不出 tab。修＝**wholesale v3**（catalogForSynced 收 synced+paused＋pausedItemIds 排除 allowedVarIds，menu 帶 sold_out、checkout 擋，鏡像 public-shop v8）；browser director JWT 實測 menu 13 支、Finca sold_out:true ✓ ②**售罄沒掛牌**＝**前端 commit 4e92b12（售罄卡 UI）還沒 push**，線上跑舊前端 → app/web/wholesale 都不顯示。老闆 GitHub Desktop Push 即解（資料端 public-shop v8/wholesale v3 已就緒）③**Square 端售罄沒生效（深層待辦）**：inspect Finca Milan＝`ecom_visibility:VISIBLE`，重下 availability(sold_out) 回 ok/paused 但再 inspect 仍 VISIBLE——**Square 不吃 ecom_visibility=UNAVAILABLE**（疑售罄看庫存數或 site/channel 覆蓋）。**但 Ratio 自家店面（public-shop/門戶/批發）售罄讀 product_sync.status==='paused' 不依賴 Square**，故自家店 push 後正常；只 Square 自己的線上店櫥窗沒跟上，待深挖或老闆 Square 後台手動標
- **售罄豆上菜單＋滿月自動下架＋晨報 6 點＋待辦入庫（老闆四連發指示）**：①**public-shop v8**：catalog walk 改收 synced+paused，GET 每支豆多 `sold_out` 旗標（paused＝true）；**paused 商品的 variation 不進 allowedVarIds**（購物車結帳擋）＋legacy 單豆路本來就擋——雙路實測都被拒 ✓。老闆本意「讓客戶知道產品有在流動」②**前端兩處**：新殼 shopCardsHTML 售罄卡＝卡圖灰化＋SOLD OUT 膠章＋購買列（段選/數量/加車）收起換一句「Sold out — the next roast is on its way」＋data-vid 清空，openShopDetailSheet 同標；classic ?shop＝名字旁 SOLD OUT 小字＋Order 鈕換灰字＋整列 opacity .75。公開店面/客戶門戶共用同函式一起生效；**批發菜單不受影響**（wholesale edge 只收 synced 照舊）③**morning-brief v4 售罄滿 30 天自動下架**：paused 且 last_synced_at（＝標售罄那刻）超 30 天 → 刪 product_sync 列（店面/貨架從此不列；**Square 商品不動**——paused 時已 ecom UNAVAILABLE 對外隱形，重新上架 push 會照 ratio_ref 認養回來；要連 Square 刪用 Delete a coffee），下架名單進晨報推播文字＋回應 JSON。force 實跑 ✓（Finca 今天才售罄沒觸發，正確）④**晨報改 6:00 整**：cron 兩條 30 20/30 19 → 0 20/0 19 UTC（edge 的雪梨 6 點檔閘門通吃 6:00–6:59 不用改）⑤**老闆三件待辦插入 tasks 表**（批發開帳號/清測試單+註銷連結/El Ver 三胞胎）——今日流出卡、晨報計數（force 跑已見「3 tasks」）。驗證：兩檔 jscheck ✓；live GET Finca Milan sold_out:true、兩結帳路拒售罄品、preview 新殼 stub 11 項＋真資料卡（SOLD OUT 膠章/灰圖/無購買列）＋classic ?shop 真資料（13 支、Finca 有章無鈕、12 支照常）✓ console 零錯誤。**⚠ Chrome 桌機仍登出**（老闆要我再試——實查 localStorage 無 token，代跑不了註銷；老闆登入後說聲即代跑）。**注意 public-shop GET 有 5 分鐘 CDN 快取**——售罄切換後店面最慢 5 分鐘跟上
- **部署驗證＋線上健檢（三個 commit push 後）**：①線上 /new 與本機位元組數全同（317987）、announceShelfBean/repurchase_nudge/packIdx 都在 ✓ ②Finca Milan 重推成功（見下）③push_subs 當時 0 → **同日稍晚老闆 iPhone 訂閱成功＝1**（send test 收到，推播鏈路全通）④security advisors 無新問題——is_staff()/my_customer_ids() 兩條「SECURITY DEFINER 可被呼叫」WARN 是 RLS 設計本身（回傳 boolean/自己的 customer ids，無資料外洩；**不可 revoke EXECUTE**——政策評估要用，收了 anon/登入查詢會直接報錯），連同 secrets_kv INFO/mail-assets 列目錄/密碼保護 Pro 限定＝全部已知接受 ⑤Chrome 桌機仍登出，tDABzmGt 註銷代跑不了＝一份內容三發到齊（Phase 4 第二刀）**（new/index.html）：貨架豆明細抽屜 Social post kit 下加「**Announce by email — new coffee**」→ `announceShelfBean()` 照抄 classic announceCoffee：QC 閘門（matchRoast 判 reroast/downgrade 擋死；沒 pass/沒鎖風味只 Heads up 警告）→ customers 有 email 人數 confirm → `uploadCardForBean()`（同 classic uploadCardFor：full row flavour_locked 優先→cardDataFor→makeSquareCard **Square 安全白邊版**——信件卡跟 classic 一致，不是 IG tight 版→ mail-assets `card-<slug>.png` upsert＋cache-bust）→ send-email `announce_coffee`（payload name/card_url/flavour/note 與 classic 一字不差，edge 零改動）。至此手機一個抽屜完成三發：信＋IG＋小紅書。驗證：jscheck ✓；preview stub 四情境——正常鎖定豆（confirm 人數只算有 email 的 3 位、卡 105KB card-kiama-aa.png upsert、send-email payload 逐欄對、toast「Sent to 3 of 3」）／未鎖＋沒判定出 Heads up／reroast 擋死／零 email 客戶擋，console 零錯誤。⚠ 真發信等老闆下支新豆上架時按
- **回購提醒附評論連結（Phase 4 第三刀＝三項全完工；老闆貼了 Google 評論連結觸發）**：①評論連結存進 app_state `google_review_url`（出貨信 CTA/QR 即刻生效；DB 原有 07-05 舊連結尾碼不同——VEBM vs 新 VEAE——實測兩條 302 到同一 placeid 的評論頁，等價，以新貼的為準）②**edge send-email v21**：新動作 `repurchase_nudge` {customer_id}——查客戶＋最近一單（排除 Cancelled；品項列名排除 Delivery fee）→ 信＝「Time for a fresh batch?」＋幾週前買了什麼＋「See what's on the shelf」鈕（APP_URL/?shop）＋Google 評論 CTA（同 dispatch reviewBlock 樣式）；誰/何時發由前端決定，edge 只組信寄出。部署後 401 煙霧測試 ✓ ③**新殼 Today 流「Fresh batch nudge」卡**（new/index.html）：buildItems 算每客最後一單（排除 wholesale 單/shop 客/無 email）→ 28–120 天窗內出卡，**一天最多 2 張**（最久沒買優先）；送過記 `NUDGE_LOG`（app_state `nudge_log` 扁平 {customer_id:'YYYY-MM-DD'}，loadAll rs[11] 新撈），同輪（沒有新單）60 天內不再出；卡副標/details 列上次品項（排除 Delivery fee）＋「Email carries: shop link + Google review link」；runAction kind 'nudge'＝confirm（列名字+email）→ callFn repurchase_nudge → nudge_log read-modify-write upsert（寫失敗不擋，頂多明天再看到卡）→ dropCard+toast；roles director only，det2 Later 照常可睡。驗證：jscheck ✓；preview stub 九客戶矩陣——只出 Amy(60d)+Bob(45d) 兩張（35d 的被擠掉、shop/無 email/10d/200d/已提醒 20d/純批發單全排除）、confirm 文案/payload {customer_id}/nudge_log 合併不蓋舊鍵/toast/卡消失 ✓、副標排除 Delivery fee ✓、console 零錯誤；**真 DB 試算＝目前 0 張卡會冒**（唯一合格池客人昨天才下單），四週後自然開始。⚠ 真信等第一張卡冒出來老闆按了看；nudge 卡只給 director
- **備貨打勾清單跳過 Delivery fee（批發低消運費假品項收尾）**（new/index.html）：openPackSheet 先算 `packIdx`＝排除「grams 空＋名字正對 Delivery fee」的品項 → 清單只列實體品項、全勾判定只算 packIdx；**pack_state 照舊用原始 index 當鍵**（跳過不影響舊資料，舊單已存的勾照亮）。上輪備注的「備貨清單會列出（無害）」實際是打包的人得勾一個運費才能按 Ready——修掉。驗證：jscheck ✓；preview stub 三情境——批發單只列 2 實體列勾滿即解鎖 Ready（payload 鍵 0,1）／零售單行為不變／舊 pack_state 相容——console 零錯誤
- **順手發現：待辦區「Retail Info 改版」其實早就完工**（classic index.html 7622–7656：Blends/Single Origin 分頁、三態 Square 膠囊、迷你 Announce 鍵全在，該待辦自帶的驗證紀錄也寫全過）——漏劃已補劃
- **Tools 同名磁貼改名**（new/index.html）：舊「Info card · IG asset · classic」→「**IG asset** · 1200×1200 card · classic」——跟新的「Info cards · A4 · 2 fold cards」不再撞名，data-classic 跳轉照舊
- **新殼豆子明細抽屜加「Analysed by」**（new/index.html）：①loadAll samples select 補 `cupper` 欄 ②openShelfBeanDetail 的 comment 行後顯示 `Analysed by <cupper>`（沒記錄不顯示，措辭同 classic）。順帶發現 classic 的 Analysed by 三處（8200/8488/9184）早就做完，「三、待辦」漏劃已補劃
- 驗證：jscheck ✓；preview stub 假資料——Tools 24 磁貼無同名、IG asset 新副標 ✓；明細抽屜有 cupper 顯示在 comment 後、無 cupper 不顯示 ✓；console 零錯誤
- **Social post kit（社群曝光 Phase 4 第一刀：IG/小紅書素材）**（new/index.html）：貨架豆明細抽屜加「Social post kit — IG & RED」鈕 → `openPromoSheet(s,m)`：①卡片＝openCardPreview 同管線（samples full row flavour_locked 優先→cardDataFor→makeSquareCard），**新殼 makeSquareCard 補上 classic 的 tight 模式**（{tight:true} 四邊 40px、文字內縮 58px——IG 貼文沒有平台裁切；Square/信件卡走預設白邊完全不動，像素驗證過）＋`<a download="ig-<slug>.png">` 直接下載 ②中英文案草稿＝`promoCaptions()` 本機模板組句（照 cupAutoComment 慣例不呼叫 AI）：豆名/產地/處理法（PROC_ZH 八種常見處理法中譯，沒對上保留英文）/品種/風味/comment/價格（centAmt）＋固定 hashtag，缺哪項自動跳過該行；textarea 可改＋Copy 鈕（navigator.clipboard→execCommand fallback）。驗證：jscheck ✓；preview 假資料——鈕在 Info card PDF 下、卡 173KB、檔名 ig-kiama-aa.png、中英文案逐行對、tight(100,100)=頭帶色 vs 預設=白、缺資料豆無 undefined、console 零錯誤。⚠ Copy 鈕在 headless 拿不到剪貼簿權限（環境限制），**真機點按驗**；文案是草稿，老闆貼上前自行修（小紅書文案用繁中，要簡體自己轉）
- **Edit listing 重審空窗防呆（老闆踩到回報「send back 後 shelf push 它還在 QC 上面」）**（new/index.html）：診斷＝兩件事——①豆子留在 QC 佇列是設計（送修單只有 QC Pass 能銷單，上架 push 是另一個櫃檯），老闆後來有走完 re-cup→Pass，DB 乾淨 ②但順藤摸出真地雷：**Edit listing 在風味未鎖時預設勾 Lock**，送回 QC 的空窗期按 push 會沒經重杯就把（可能還是錯的）描述鎖回。修：openListSheet 加 `rq`＝QCQ∪toCupList 名字比對 → LST.lock 強制 false＋LST.requeue；抽屜鎖定開關換黃字「Re-checking in QC — stays unlocked until it passes QC again」；push 時跳過「not locked — push anyway?」confirm（黃字已講明）。驗證：preview stub 三情境——重審中（黃字/無開關/push 照跑不寫 flavour_locked/不彈窗）、正常未鎖（開關預設勾/push 有鎖）、已鎖（無開關無黃字）✓ console 零錯誤。**另**：Finca Milan 最後成功 push＝07-08 11:58（上架那次），老闆自稱的 update push 沒到 Square（last_synced_at 沒動）——Square 卡片還是舊拼字 Nector，已請老闆重推一次看 toast/錯誤 → ✅ 07-08 12:50 重推到了（last_synced_at 更新；status paused＝售罄標記，老闆有標就正常）
- **Kiama 測試「還在擱置」診斷＋pass 不鎖提示（老闆回報）**：API log 還原＝send back 兩筆全成功、10 秒後判定板 Pass 也成功，但那刻「Lock flavours on pass」膠囊是**關的**（session 內沾黏、點一下就切，疑測試誤觸）→ pass 沒鎖風味 → 貨架 flavour unlocked＋Today 長 Lock flavours 卡＝老闆眼中的「擱置」。**非 bug**；Kiama 鎖已 SQL 恢復（風味詞沒變動，安全）。改善：qcVerdict 的 toast 加第四種註記——pass＋未鎖＋開關關 →「QC pass ✓ · flavours not locked (toggle off)」（preview 攔 toast 驗五情境：locked/toggle off/already locked/lock failed/reroast 全對）
- **順手檢查結果（三件等老闆）**：①~~#0021/#0022 Dani $1 測試單還在＋撞號~~ ✅ 2026-07-08 第二 session 複查＝**測試單已清完**（order_no 21 現在只剩 Mingjia Xie 真單 $85 已付；Dani 名下 15/20/26/27 全 Cancelled，不進作業畫面）——沒有撞號問題了 ②**殘留 Square 測試連結 square.link/u/tDABzmGt（link_id `HQMQG24UFJKI4YLK`）還活著**——Chrome 桌機 session 仍登出代跑不了（此輪再試仍登出），老闆登入 classic 後 console 跑 `callSquareFn({action:'payment_link_delete',link_id:'HQMQG24UFJKI4YLK'})` 即註銷（tasks 那筆已改名成只剩這件；sync-to-square 不收 service-role 故我無法後端代刪，一定要 director JWT）③~~El Ver/El Verge 三胞胎~~ ✅ 已清（DB 查無，只剩正牌 El Vergel 生豆＋拼配配方料，不該動；tasks 已劃掉）

## 〇、補記 — 2026-07-08 session（Wholesale 走道：批發商自助下單全鏈）
- **背景**：老闆盤點藍圖後拍板 wholesale 優先（plan mode 核准五階段）。拍板：①批發價＝全店統一折扣％（app_state `ws_discount` {pct}，改零售價自動跟動）②週一 17:00 截單只提示不硬擋 ③付款＝銀行轉帳＋Square 連結並列 ④低消 $150 直接比購物車小計（咖啡豆免 GST）
- **Stage A：migration `wholesale_lane_rls`（已套用＋驗證）**：①`is_staff()` 補 roaster/retail（原本只認 staff/director，跟前端 myRole 對齊）②新 `my_customer_ids()`（security definer，email 對 customers lower 比對）③customers/orders 加 self-read 政策（客戶/批發登入讀得到自己的列——**修好了原本客戶門戶讀不到自己訂單的暗傷**）④六張鬆表鎖 `is_staff()`：app_state（**折扣％在這，鎖它是發外部帳號的前提**）/contacts（原本 anon 可讀！）/messages/rosters（原本 anon 可讀）/tasks/push_subs——舊政策原文留在 migration 註解供回滾 ⑤**profiles「update own or staff」拆掉換 staff-only**（原政策讓任何帳號能改自己的 role＝升權漏洞）⑥orders_channel_check 加 'wholesale'。驗證：模擬批發 JWT 只見自己 2 客戶列＋1 單、六表全 0、升權 update 0 列；老闆視角全通；anon 全 0；public-shop 照常；advisors 無新警告
- **Stage B：Tools → Wholesale 抽屜（director only）**（new/index.html）：折扣％輸入＋Save（upsert ws_discount）、合約條款摘要、銀行明細唯讀（讀 app_state bank_details）、**帳號列表**＝profiles role in (customer,wholesale) 一鍵切換 customer↔wholesale。preview 斷言＋線上真寫入驗證過（測試值已歸零，**正式折扣％等老闆自己設**）
- **Stage C：edge `wholesale` v2（verify_jwt true）**：JWT→profiles role in (wholesale,director)→email ilike 對 customers（優先 type=shop）。`menu`＝public-shop 同款 catalog walk＋QC 風味鎖門檻，回批發價（零售×(1−pct/100)，server 算）＋sizes[].retail 供劃線＋moq＋bank；`checkout`（≤12 行、qty≤40，**payload 只有 {id,qty} 不帶價**）＝server 重算價→小計<150 加 {name:'Delivery fee',grams:null} 一行→insert orders（channel wholesale/bank_transfer/pending_payment）→quick_pay 連結（同 SURCHARGE_PCT，失敗不擋單）存 payment_link+square_order_id（**webhook 收款自動標已付零改動接上**）→messages＋push＋order_confirmation 信（v20 對 bank_transfer 本來就渲染銀行塊＋刷卡鈕，免費得到）。**真單全鏈驗證**：#0025 測試單 $40+$20 運費=$60、接單卡/備貨卡/收款卡正常、**Delivery fee（grams null）自然不進烘豆需求卡**、推播與確認信 log 200——測畢單/客戶/訊息/連結全清
- **Stage D：批發店面＋門戶**（new/index.html＋classic 一行）：①myRole/boot 認 wholesale → 走 renderCustomerPortal 批發分支（歡迎卡「Wholesale · X% off retail · order by Mon 5 pm for Wed dispatch」）②菜單改吃 `loadWholesaleMenu()`（callFn wholesale menu → WS_INFO）；**重用 shopCardsHTML/wireShopCards**——新 `shopPriceHTML()` 批發價前、零售價劃線後 ③購物車：`WS_MODE` 全域＋`cartKey()`（批發獨立 r2_wcart，共用裝置不混零售車）＋`cartMaxQty()`（40 vs 9）④`openWsCartSheet()`：MOQ 進度（差 $X 免運/Free delivery ✓）＋運費行＋截單提示＋Place order→wholesale checkout→成功清車開 `openWsOrderDoneSheet()`（單號/明細/銀行塊含 Reference/刷卡連結）⑤未付單卡「Payment details →」＝`openWsPaySheet()`（orders select 補 payment_link 欄）⑥classic ORD_CHANNELS/LABEL 加 wholesale。驗證：jscheck 兩檔＋preview 六情境（劃線/40 上限/獨立車/低於低消運費/payload 無價/done sheet/pay sheet/零售與員工回歸零錯誤）＋手機截圖兩張
- **⚠ 開帳號五步（等老闆，順序照做）**：①~~清 customers 重複列~~ ✅ 2026-07-08 SQL 清畢（8 筆重複/測試列刪除、$1 單搬回 Dani 本尊；剩 Happy Sip ×1 有 1 單、Dani ×1 有 4 單）②Supabase Dashboard→Auth→Add user（email＝customers 那列的 email、設密碼、Auto Confirm；handle_new_user 自動建 customer profile）③/new Tools→Wholesale：把帳號切成 wholesale＋**設定正式折扣％（現在是 0＝無折扣）**④~~Leaked password protection~~ **2026-07-08 實測＝Pro 方案限定（US$25/月），免費版開不了、不值得為此升級**——替代：同頁把 Minimum password length 調 12＋Password requirements 選大小寫+數字（帳號都是老闆手開、密碼老闆設強隨機密碼，黑名單檢查意義本來就小；advisor 那條提醒會一直在，視為已知接受）⑤發帳密給 Happy Sip 下一張試單，看接單卡＋推播進來
- **陷阱備忘**：①preview 瀏覽器 localhost:8124 有**老闆真登入 session**——測試時 sb 沒 stub 到會打真 DB（這輪就真寫了一筆 ws_discount，已歸零）；serve 複本用 sed 把 `const sb` 換 `var sb` 才 stub 得動（repo 檔照舊 const）②wholesale menu 有 auth 所以**沒有 CDN 快取**（跟 public-shop 5 分鐘快取不同），改價立即生效③批發單的 Delivery fee 是 items 假品項（grams:null）——金額對帳 items 加總＝total；烘豆需求卡天然忽略；~~備貨清單會列出（無害）~~ ✅ 2026-07-08 第二 session 已修（備貨打勾清單跳過，見補記）

## 〇、補記 — 2026-07-07 下午 session（資訊卡下載版白邊縮減）
- **老闆反映 Print Centre 下載的 1200×1200 資訊卡四周白邊太多**（原設計左右各 217px 是給 Square Online 直式版位裁切用的安全邊）。改法：`makeSquareCard(card,opts)` 加 **tight 模式**（index.html）——四邊只留 40px、文字內縮 58px；**只有 `printCardDownload` 傳 `{tight:true}`**，Square 上架（pushToSquare）與信件卡（uploadCardFor/ordUploadCards）維持原安全白邊**完全不動**（Square 會裁兩側，改了內容會被切）。Print Centre 說明文字同步改為 tighter margins 版
- 驗證：jscheck ✓；preview 假資料畫單品/拼配 tight 版＋原版對照截圖 ✓（雷達圖、風味橫幅、表格全正常）。⚠ 注意：杯測雷達的分數刻度是 **0–3**（`_cardRadar` 裡 `n/3`），餵測試資料別用 10 分制
- 待 push（GitHub Desktop）→ 部署後老闆去 Print Centre 重下載一張看效果
- **購物卡改版：資訊卡圖滿版＋明細收抽屜（老闆回報照片被裁半，plan mode 核准）**（new/index.html，同 session 第二件）：老闆兩案（A 明細收抽屜 vs B 純文字＋照片 popup）→ 設計判斷採 A：照片先行＋購買鍵常駐是手機電商標準，popup 多一步且體驗差。實查發現卡片圖＝生成的資訊卡（非實拍），且 HTML 明細表跟圖片內容重複。改法：①**CSS 幾何裁切**：`.shopimghold`（aspect-ratio:790/1096）＋ `.shopimg` position:absolute width:151.9% left:-25.95% top:-4.74% —— 裁掉 Square 安全白邊只顯示內容框。**⚠ 這組數字綁 classic makeSquareCard 預設邊距（內容框 x217-983/y64-1136 of 1200²）**，改卡片邊距要同步改這裡 ②主卡瘦身：圖滿版→名字＋價→「Details & brew guide →」列→段選/步進/Add to cart；膠囊列＋specs 表＋Brew guide 連結**移進抽屜** `openShopDetailSheet(name)`（specs 建構抽成 `shopSpecsFor(b)`，抽屜照 openDrawerHTML 慣例）③wireShopCards 加 `[data-shopdetail]` 接線。公開店面＋客戶門戶共用同函式一起生效；classic ?shop、Square 圖、信件卡、購物車流程全不動。驗證：jscheck ✓＋preview 375×812 真菜單（拼配/單品卡一屏放完雷達完整、抽屜開合、加車浮條 $25、切分類、淺深兩版、console 零錯誤）。**注意：若日後 Square 改上實拍照（非 1:1 生成卡），裁切會放大錯位，要回頭改這段 CSS**
- **浮條擋購買鍵修復（老闆真機截圖回報「消費上有障礙」，plan mode 核准）**（new/index.html，同 session 第三件）：cartbar（fixed，bottom 82px）出現後正好壓住 Add to cart。兩刀：①卡片順序改「名字價→段選/步進/Add to cart→Details 列」（購買動線緊跟價格，浮條頂多蓋次要的 Details）②paintCartBar 顯示浮條時 `body.paddingBottom='250px'`、藏時清回 ''（CSS 預設 170px）——paintCartBar 是浮條唯一開關，一處改全通路生效。驗證：preview 捲到底按鈕離浮條 285px、清車/加車 padding 170↔250 切換、抽屜 regression ✓
- **購物車改右上角 icon＋圓點進卡（老闆指定）**（new/index.html，同 session 第四件）：①浮動 cartbar 整組移除（DOM/CSS/監聽/250px 墊高 hack 全拆），`mountCartIcon()` 在 #hcnt 掛購物車 SVG＋件數徽章（>9 顯示 9+），公開店面與客戶門戶都掛（**「on the shelf」「customer」右上角文字取消**；其他分頁照舊寫 hcnt 文字自然蓋回）；paintCartBar 改成只畫徽章，點 icon → openCartSheet ②翻頁圓點從輪播下方移到**卡片內圖與價之間**：每張卡自帶一排、靜態亮自己那顆（滑到哪張看到哪張的點，捲動監聽整段刪掉）。驗證：preview icon 開抽屜（品項/小計/Checkout）、清車徽章藏/加車回 1、第二卡第二點亮、console 零錯誤
- **店面去提示字＋玻璃導滑箭頭（老闆指定：下面壓迫感大）**（new/index.html，同 session 第五件）：①「Freshly roasted in Crows Nest · swipe…」提示列刪除，卡片整體上移 ~60px ②螢幕左右緣加**毛玻璃圓形箭頭**（.shoparr：fixed top:42%、backdrop-filter blur、40px 圓鈕）——放在 #shopbody 裡離開商店自動消失；到頭那側自動藏（第一張只有右、最後只有左）；點按滑一張。**⚠ 兩個坑**：scroll-snap 容器上 `scrollBy/scrollTo smooth` 會完全不動（實測）→ 改 rAF 手動 glide 260ms、結尾讓 snap 吸正；headless 隱藏分頁 rAF 不跑（同 lazy 圖那坑）→ preview 驗畫面用直接設 scrollLeft，**滑動動畫要真機驗**。驗證：箭頭三位置顯隱矩陣 ✓、淺深兩版截圖 ✓、console 零錯誤
- **Today 流卡片改版：小膠囊鈕＋類別色條＋右上角分類（老闆 manager 視角評審，plan mode 核准）**（new/index.html，同 session 第七件）：老闆嫌每卡一顆滿版大紅鈕掃不快、分類字跟標題混。改法照設計評審：①滿版 .act 鈕（52px）→ 右下角 `.actsm` 膠囊鈕（跟右滑手勢本來就重複），卡高 ~200→131px ②新 `STCOLOR` 九類塵彩色表：卡片左緣 4px 色條＋右上角 `.cattag`「●＋類別字」；**急件改左條 accent 紅＋「· now」**（原整圈紅框 .card.hot 規則移除）；晨報 brief 卡左條隱形（同 inv 底）③副標 `.s1` 單行省略（細節本來就在 details 抽屜）④chips 加同色點當圖例、openDetails 抽屜 tag 同色呼應。**新類別 .feed/.cattag/.actsm/.cfoot/.moresm 全部另開，不動既有 .tag/.act/.more**（抽屜、商店卡、客戶門戶都在用舊類）。驗證：jscheck＋preview 假資料六卡（色條/· now/省略/抽屜開合/chips 色點）淺深兩版截圖；⚠ 真流（brief 真資料、QC 分頁 qrow）等老闆部署後掃一眼。**追修（老闆真機回報）**：滑卡彈回後左色條消失——attachSwipe 的拖曳回饋用 `borderColor` 整圈變色、回彈清空時連 border-left-color 一起洗掉 → 掛上時記 `barC`，reset/直捲放棄/拖曳中三處補回；preview 模擬 pointer 事件驗前後同色 ✓
- **抽屜把手下拉關閉修通（老闆真機回報拉不動）**（new/index.html，同 session 第八件）：attachDrawerDrag 邏輯本來就在（>90px 關），但 **iOS Safari 對捲動容器（.drawer overflow-y:auto）內元素的 touch-action:none 不一定買帳**——手指一動當捲動、pointercancel 殺掉拖曳 → 把手加非 passive `touchmove preventDefault` 硬擋；把手順手加大（padding 12/14、橫槓 44→52px）。preview 模擬：拉 50px 彈回、拉 140px 關閉 ✓；**真機手感等老闆部署後驗**
- **QC 補豆：Add a past batch（老闆點名——舊烘豆/忘記烘豆手動進 QC，plan mode 核准）**（new/index.html，同 session 第九件）：QC 分頁兩分支（空佇列/有佇列）加「＋ Add a past batch」→ `openBackfillSheet()`（選豆下拉含 0 庫存＋**免生豆表的打字欄**＋日期預設今天＋選填熟豆 kg）→ `saveBackfill()` insert roasts `{green_kg:null,status:'pending_cupping'}`；**跟 saveRoastSheet 的關鍵差異：不扣 beans.quantity、不寫 stock_moves**（舊豆生豆早用掉）。補完自動接管線：有 samples 杯測紀錄→直接進 QCQ（toast「In the QC queue ✓」）、沒有→Today 長 Cup 卡。防呆：空名字擋、同名同日 confirm。驗證：preview monkeypatch sb 假資料——payload 逐欄比對（只有一筆 roasts insert，無 beans/stock_moves）✓、有杯測直接進佇列＋判定板亮 ✓、打字補豆長 Cup 卡 ✓、dup confirm 擋 ✓。⚠ 假資料 stub 固定 id 會讓第二筆被 inQC 排除——測試時 id 要遞增（程式無 bug，純測試坑）
- **Cup 抽屜改版：即時雷達＋拉霸＋自動 comment（老闆杯測師視角設計，plan mode 核准）**（new/index.html，同 session 第十件）：①五感官 Light/Medium/Strong 三段鈕 → **橫向拉霸**（range 1–3 step .5，light 內圈/heavy 外圈；預設帶同豆上次分數 clamp 1–3、沒有全 2——**存檔永遠寫五感官，不再有 null**）②抽屜頂部「成品預覽卡」：SVG 雷達（同資訊卡刻度 n/3）＋Fraunces 風味行＋斜體 comment 行合成一塊，拉霸/打字**即時更新**（cupPreview 只動 SVG points 與文字節點，不整張重畫）③`cupAutoComment(scores,feats)` 規則組句（老闆拍板本機組句不呼叫真 AI）：前 2 風味詞＋高分感官短語（bright/sweet/syrupy/silky/long finish/perfumed）拼 ≤30 字；comment 留白存檔＝自動句，placeholder 即時顯示。saveCupSheet 其餘照舊（no 連號/容錯鏈/status cupped/同日 confirm）。驗證：preview monkeypatch——預填 2.5/3/2.5/1.5/2 ✓、撥 body 拉霸 polygon 即時變 ✓、留白存檔 comment=「Peach, Jasmine · bright, sweet」（剛好 30 字）✓、淺深截圖 ✓；⚠ 拉霸手感等老闆真機驗。**追修（老闆真機存檔炸出）**：samples 五感官欄位原是 **integer**，半格 1.5 被 DB 拒收（invalid input syntax for type integer）→ migration `widen_sample_scores_to_numeric_for_half_steps` 放寬成 numeric(2,1)（舊整數資料無痛、classic 寫整數照收；PostgREST 回傳可能變字串但前端全是 Number()/除法coercion 沒差）；SQL 實測 1.5/2.5 insert ✓（rollback 不留痕）。前端零改動，老闆原抽屜重按 Save 即成功
- **Re-cup：QC 佇列重新杯測（老闆點名「杯測需要 re-analysed」）**（new/index.html，同 session 第十一件）：QC 判定板「judging X」旁加 **re-cup 連結** → `openRecupSheet(q)` 開同一張 Cup 抽屜（標題 Re-cup、鈕 Update cupping），拉霸/風味/comment 帶原紀錄值 → 存檔走 **update samples 原紀錄**（不動 no/cupping_date、不再動 roasts、不查同日重複；features/cupper 容錯重試一層）。comment 留白照樣自動組句。驗證：preview monkeypatch——prefill 逐值比對 ✓、update eq id 正確 ✓、無多餘 insert/無碰 roasts ✓
- **追修（老闆回報 re-cup 值被重設）**：loadAll 的 samples `select` 原本沒撈五感官分數＋comment（只有 features/名稱）→ re-cup 讀不到舊值，cupClamp 全給 Medium(2)、comment 空。修：select 加 `fragrance,acidity,sweetness,body,aftertaste,comment`（第 226 行一行改）。**連帶修好第一次杯測「帶入上次分數」**（當初也因同原因沒生效——只帶了風味沒帶分數）。preview 驗：re-cup 拉霸讀到 2.5/1.5/3/2.5/1、comment 帶回手打字、只改 body 存檔其餘原封不動 ✓
- **烘豆需求卡改「先看熟豆貨架、只提差額」（老闆定調生產線：接單→看熟豆庫存→沒貨才烘）**（new/index.html，同 session 第十二件）：buildItems 的 roastdem 卡加 `shelfG(name)`＝roasts.remaining_kg 同名加總（**qc reroast/downgrade 批不算可賣**）→ 每支豆 need=max(0, 訂單量−貨架量)，只有 need>0 的進卡（副標記 covered 支數、det 每行「Xg ordered · Yg on shelf → roast Zg / covered ✓」、Total 只算差額、ref 籌碼只帶缺口量）；**全夠貨＝不出卡**。鎖風味→上架順序老闆確認過現況已合一（List 抽屜 lock 預設勾）。驗證：preview 假資料四情境（部分缺/夠貨/零庫存/全夠貨無卡）＋downgrade 排除 ✓
- **鎖風味決定搬進 QC 判定當下（老闆定調「lock in flavours 要在 QC 裡面做決定」）**（new/index.html，同 session 第十三件）：①全域 `QCLOCK=true`（session 內沾黏）②QC 判定板 judging 行下加「Lock flavours on pass」膠囊開關（accent 亮=開；**已鎖的豆改顯示 already locked ✓ 不出開關**）③`qcVerdict` 加第五參數 s（sample）：pass＋QCLOCK＋未鎖 → 順手 `samples.update({flavour_locked:true})`（失敗不擋判定，Lock 追趕卡會接住），toast「QC pass ✓ · flavours locked」；Re-roast/Down 不鎖④Today 流滑卡/按鈕快判 Pass 同吃 QCLOCK（呼叫處帶 i.ref.s）。下游不變：List 抽屜見已鎖就不再出 lock 勾、Lock 追趕卡只接漏網。驗證：preview 三情境——開關開 pass 打 roasts+samples 兩筆 ✓、關掉只打 roasts ✓、已鎖顯示 note 無開關 ✓
- **QC 杯測師工作台（老闆定義五步驟，plan mode 核准）**（new/index.html，同 session 第十四件）：①QC 頁頂部新「**In hand — tap to cup**」區：`toCupList()` helper（pending_cupping＋沒判定＋不在 QCQ，與 Today Cup 卡共用篩選）→ qrow 點列直接開 Cup 抽屜 ②**Cup 抽屜加四色點**（y黃/b藍/r紅/d深藍＝classic RTL_DOTCOL，＋None）：開抽屜 `cardDots()` 帶現有色、選色雷達/風味行**即時 tint**、存檔 `saveDotFor()`＝read-modify-write upsert app_state `rtl_dot`（**值形狀＝扁平 {豆名:'y'}**，同名異大小寫舊鍵順手清、_dotsMap 快取跟上；色寫失敗不擋杯測）③判定板 who 行改連結列 `re-cup · card · immersion`（新 .qlink 類）：**card**＝reuse List 管線（samples full row flavour_locked 優先→cardDataFor+makeSquareCard）抽屜秀 base64 PNG；**immersion**＝欄位同 classic rtlBrewFields('immersion')（Temp/PPM/Grind/Dose/Water/Time＋auto ratio），目標 blends 同名優先→beans（bean_id→名字+process），**只動 brew.immersion 保留 espresso 等咖啡師欄位**，brew 現值開抽屜時 fresh select。驗證：preview monkeypatch 全流程——to-cup 開杯、選黃 tint #E0B341、dot upsert 合併不蓋舊鍵、卡片真畫 117KB PNG、immersion 預填/ratio 1:16→1:13.3 即時/存檔保留 espresso、無配對 alert ✓
- **Today 去重＋Tools「Info cards」摺疊印刷卡（老闆混亂回報＋拍板，plan mode 核准）**（new/index.html，同 session 第十五件）：①**Today 的 QC/Cup 卡全移除**（杯測作業只住 QC 分頁）→ 換一張 `qcnav` 導航卡「Cupping & QC — X in hand · Y waiting」（roles director/roaster，act=Open QC → 切分頁，det 逐批列名，>2 天亮 hot）②**Tools → Info cards**：`passedBeans()`（dedup samples 配 matchRoast qc==='pass'）抽屜列表 → `openInfoCardPrint(s)` window.open＋document.write 印刷頁自動 print()——**@page 297×105mm 兩頁＝兩面（雙面短邊翻，對摺成 148.5×105）**：外面＝QR（qrserver 600px 指 `?bean=<slug>`，`beanSlug()` 同 classic ordCardSlug）＋聯絡佔位（網址/Crows Nest——**正式文案等老闆給**）｜封面（/logo.png＋Ratio Coffee Fraunces＋SPECIALTY COFFEE LAB）；內面＝TASTING NOTES（風味三詞 16.5pt 豆色字＋comment＋`printRadarSVG` 實色雷達）｜BREW GUIDE（immersion 表＋ratio，espresso/infusion/ice 有填才列＋by our baristas 註）。brew 解析同 openImmersionSheet（blends 同名優先→beans）。**陷阱**：document.write 字串裡的 `</script>` 要寫成 `<\/script>`；印刷頁是獨立文件，顏色用實色不用 CSS 變數。驗證：preview——Today 無 qc:/cup: 卡、qcnav 數字/切頁 ✓；Info cards 只列 pass 豆、攔 window.open 驗兩面結構/QR slug/風味/雷達/immersion/espresso 條件顯示/ratio ✓、印刷頁真渲染截圖設計過眼 ✓；⚠ @page mm 實際列印效果等老闆桌機/印刷行驗
- **Info cards 改直接下載 PDF（老闆指定不要列印框）**（new/index.html，同 session 第十六件）：openInfoCardPrint 改走 **html2pdf**（cdnjs 0.10.1，`loadScriptOnce` 首次用才載）——卡片 HTML 塞進頁內隱藏容器 → html2canvas scale 3.3＋useCORS（先等 QR/logo 圖載完）→ jsPDF format [297,105] 存 `infocard-<slug>.pdf`。**三個坑**：①離螢幕定位（left:-9999）不能寫在交給 html2pdf 的元素上——會被 clone 進 overlay 截到空白 → 包殼藏、把乾淨 .icroot 交出去 ②mm→px 進位會多一頁空白尾巴 → .side 高度 `calc(105mm - 1px)` ③html2canvas 不是全域（bundle 內部），debug 用 `html2pdf().from().toCanvas().get('canvas')`。驗證：preview 真流程 4 秒完成、攔 outputPdf 驗 **2 頁/282KB/MediaBox 841.89×297.64pt** ✓。另本機 headless Chrome 產的兩份樣品 PDF（Kiama AA 黃/Danche v2 玫瑰）已交老闆；雷達 viewBox 加寬修 Aftertaste 裁切（33a7ab2）。~~**遺留**：Tools 有兩個同名磁貼——舊「Info card · IG asset · classic」vs 新「Info cards · foldable print card」，老闆點錯過，待拍板要不要改名舊的~~ ✅ 2026-07-08 舊磁貼改名「IG asset · 1200×1200 card · classic」（見補記）
- **摺疊卡版型定稿 v2（老闆嫌 A4×4 亂、口述新四面配置）**（new/index.html，同 session 第十七件）：四面＝**封面（logo/Ratio Coffee/Specialty Coffee Lab/豆名）｜內左 The coffee（Origin/Variety/Altitude/Process/Roasted 表格——生豆查法同 cardDataFor 的 ilike+process 配對）｜內右 Tasting notes（風味三詞 17pt 豆色＋comment＋雷達 50mm）｜背面 QR（?bean= 豆頁）＋聯絡**。沖煮參數退出卡面（藏在 QR 後的豆頁）——openInfoCardPrint 的 brew 解析整段移除。驗證：preview 攔 html2pdf 收 HTML 逐項比對 11 項全過 ✓。**已交付老闆四張定稿 PDF**（Kiama AA 黃/Danche v2 藍/Danche v3 深藍/El Vergel 玫瑰——El Ver 卡面用正名 El Vergel＋掛 El Vergel 的產區資料；Danche v2/v3 色是我配的，rtl_dot 沒這兩鍵）；本機產生器 gen_fold2.py 在 scratchpad。⚠ A4×4 版（gen_a4.py）老闆棄用
- **Info cards 最終定稿＝A4 雙面裁 4 卡（老闆再改：摺疊版破圖棄用，全欄位明細＋Chrome 實檢）**（new/index.html，同 session 第十八件）：每卡 148.5×105 **不摺**，同卡 ×4 田字格：**正面**＝品牌列＋豆名＋處理法＋風味三詞（豆色）＋comment＋雷達 46mm；**反面**＝The coffee 全欄位表（**Origin/Station 處理廠/Variety/Altitude/Process/Harvest 產季/Roasted/Sourced via 生豆商**——beans 查詢補 station,harvest,supplier）＋QR＋聯絡。app openInfoCardPrint 同步（jsPDF [297,210]、.page/.cell 幾何、頁高-1px cell 高-.5px 防幽靈頁）；抽屜/磁貼文案更新。**已交付四支豆 A4 PDF**（gen_a4v2.py 產、headless Chrome 轉、**老闆 Chrome 分頁實開逐頁 zoom 檢查無破圖**——上輪摺疊版的破圖疑因老闆檢視器，未復現）。列印口訣：A4 雙面短邊翻＋沿虛線裁十字
- **追修（老闆真機 app 下載「完全破圖」，Chrome 全流程重現診斷）**：老闆 Chrome 實走 Tools→Info cards→下載→開 PDF——**根因①：html2canvas 不畫行內 SVG**（雷達整個消失、正面右側空洞）→ 新 `printRadarPNG(sc,color)` canvas 4× 超取樣畫成 PNG 嵌 <img>（printRadarSVG 保留但印刷卡不再用）；**根因②：scale 3.3 兩頁疊一張 canvas 19.4MP 爆 iPhone 16.7MP 上限**（真機全白）→ 降 2.6（12MP，~250dpi）。驗證：preview 攔 html2pdf——radar PNG ×4 非空、無行內 SVG、scale 2.6 ✓。**另見 Info cards 清單曝出 El Ver／El Verge／El Vergel 三胞胎（backfill 打字產物）＋Danche v1 等——等老闆拍板清重複**
- **Info cards 真·定稿＝A4 雙面 2 張摺疊卡（老闆問「封面在哪」→ 紙張幾何二選一拍板）**（new/index.html，同 session 第十九件）：4-up 不摺版的封面被壓縮成品牌小列，老闆要完整封面 → **A4 上下兩條 297×105、裁一刀各自對摺**（一張 A4 得 2 卡）。第 1 頁條＝〔QR 背面｜封面〕、第 2 頁條＝〔The coffee 全欄位詳情｜Tasting notes＋雷達 PNG 50mm〕；短邊翻對位已推導（條的 y 保持、背面左半落在封面背後＝內左詳情 ✓）。app openInfoCardPrint 改 outerStrip/innerStrip ×2；抽屜/磁貼文案「A4 · 2 fold cards」。已交四支豆 A4 PDF（gen_a4fold.py，Chrome 實檢封面回歸）。⚠ 版型歷程：摺疊單卡→A4×4 不摺→**A4×2 摺疊（現行）**——再改動先問老闆封面去留
- **視覺定稿 v2「實驗室證書風」（老闆三修正＋全權委託排版）**（new/index.html，同 session 第二十件）：①QR 縮 80%（36→29mm，細框墊底）②電話拿掉 ③「Roasted in Sydney, Australia」④美術升級：**四面細線框**（.frame inset 5mm .3mm 墨色；封面雙框 outline）、**髮絲線＋豆色菱形飾**（orn）、封面 lockup（logo 15mm/Fraunces 24pt/SPECIALTY COFFEE LAB .34em/底部色點＋義大利體豆名）、**風味詞 Fraunces 義大利體 17.5pt**（index.html 字體 link 補 ital,600）、明細表標籤小型大寫字距、豆色短色條、雷達標籤大寫（printRadarPNG 畫布加寬到 412 對齊 viewBox -62，canvas letterSpacing try/catch）。產生器 gen_final.py；四支豆 ratio-card-*.pdf 已交付（Chrome 實檢含 AFTERTASTE 裁切追修）。app 攔截驗證 10 項全過。**老闆宣告 info card 定案** ✅
- **Retail shelf 改版：可點列＋豆子明細抽屜（老闆點名「每支豆點出來看烘焙風味和豆子訊息」）**（new/index.html，同 session 第二十一件）：①列表改 .hit 可點列（色點＋豆名＋process／價格＋新鮮度／On sale·Sold out 徽章），副標「tap a coffee for flavour and dossier」②新 `openShelfBeanDetail(nm,m)`：● Shelf 豆色 tag＋新鮮度行、價格表（250g/500g/1kg 有填才列）、**Tasting notes**（風味膠囊＋italic comment＋printRadarPNG 雷達 72% 置中——透明底深淺版通吃）、**The coffee** 履歷全欄位、**Info card PDF 一鍵**（直接呼 openInfoCardPrint）、‹ Back to shelf（照 openCustomerDetail 模式）③履歷建構抽成 **`beanInfoRows(full)`**（資訊卡與貨架明細共用——改欄位一處改）。驗證：preview 假資料——列×2/sold 徽章/明細九項（價/鮮/膠囊/comment/雷達/履歷/卡鈕/返回）全過＋夜版截圖。**追修：明細順序照老闆定**＝名字（process 併標題小字）→ roasted 日期＋Xd — 熟成狀態 → 規格價格 → 雷達 → Tasting notes → The coffee 履歷；DOM index 順序驗證 2<3<4<5<6 ✓。**再追修：列表排序改烘豆日從舊到新**（最老在上＝先賣先清；沒烘豆日沉底按名排）——preview 四豆驗 May→June→Fresh→NoDate ✓
- **Retail shelf 加「Edit listing / 售罄切換」（老闆問哪裡設定上架資訊→拍板做進新殼）**（new/index.html，同 session 第二十二件）：①明細抽屜加 **Edit listing…** 主鈕 → 直接開 openListSheet（同一條上架管線——push 對 Square 是 upsert）；openListSheet 加 `LST.upd`（syncs 已 synced＝更新模式），標題「Update ·」/按鈕「Push update to Square」/toast「Updated ✓」跟著切 ②**售罄切換鈕**（Mark sold out ↔ Put back on sale）→ 新 `setShelfSold(nm,sold)`：callFn sync-to-square `availability`（照 classic syncSquareAvailability）＋ app_state `rtl_sold` read-modify-write（大小寫異鍵順手清）→ 完成回 shelf 列表。至此**手機全流程管貨架**：第一次上架（Today List 卡）／改價改規格重推／售罄／出資訊卡，不用回 classic。驗證：preview monkeypatch——Update 模式帶現價、availability payload、rtl_sold upsert ✓
- **Tools →「Delete a coffee」刪豆工具（老闆點名——自助清打錯名/重複豆）**（new/index.html，同 session 第二十三件）：`allRetailCoffees()`（samples∪roasts 名字聯集＋杯測/批次計數＋on Square 標記）列表 → 每列紅色 Delete… → **雙重 confirm**（列明會刪幾筆杯測/幾批烘豆；已上架加警語「Square 商品本身要去後台移除，但清掉 product_sync 後店面菜單即不再列」）→ 刪 samples（supplier Ratio Coffee＋ilike 名）＋roasts（ilike）＋product_sync＋**app_state 五鍵記憶大掃除**（rtl_price/g/sizes/sold/dot，大小寫異鍵一起清）→ reload。**beans 生豆庫存永遠不碰**。驗證：preview monkeypatch——列表計數/on Square 標記/雙 confirm/刪除 payload 三表/dot 記憶連 case 變體掃淨/未上架不出 Square 警語 ✓。**El Ver/El Verge 三胞胎老闆部署後可自清**
- **Menus 四種全搬進新殼（老闆拍板：全搬＋版面照舊）**（new/index.html +766 行逐字碼，同 session 第二十四件）：**繪製層 35 個函式用 python 從 classic 逐字拷貝**（jsPDF 同引擎 2.5.1 cdnjs 延遲載入＝版面照舊；含 drawCell/drawSpecialBand/drawCuppingRadar/drawTakeawayMenu/drawPourCell/drawDineInMenu/mnFit/strThumbPos 等；唯一 patch：retailOnlyBeanList 的 RTL_ROWS fallback 改直讀 RETAIL_BEANS；mnHexRgb 新殼已有跳過）；**資料轉接層**：BEANS/ROASTS→DB.*、RETAIL_BEANS＝DB.samples 按 sampleDisp 去重、blends 表→loadBlendDefs、rtl_g/rtl_dot→loadGrams/loadDots、**設定五鑰匙 menu_slots/special_slots/special_prices/takeaway/dinein 直讀寫 app_state（與 classic 互通）**、DINEIN 用 normDinein 跟預設結構合併；**四個設定抽屜**（Blend 4 槽選單＋風味預覽／Special 加豆+四價格／TakeAway 4 杯自動帶入／DineIn 全欄位：2 拼配+9 價格+4 註記+4 手沖+highlight），改了即存。Tools：classic 連結列拿掉 Menus、data-t 加 menus 磁貼。驗證：preview 假資料——四份 PDF 真產出（jsPDF save 攔截：Blend 1 頁/Special 3 豆分 2 頁/TakeAway 1 頁/DineIn 1 頁，檔名同 classic）＋四抽屜渲染 ✓；⚠ 版面像素級比對等老闆真機開 PDF 過目（繪製碼逐字同 classic，理論零差異）
- **瘦身 pass（老闆點名）**（new/index.html −2.2KB，同 session 第二十五件）：刪死碼——`printRadarSVG`（PNG 版取代後只剩定義）、`retailOnlyBeanList`/`strThumbPos`（classic UI 專用，搬運時多帶）、runAction 死分支 `kind:'cup'`（Cup 卡已改 QC 頁直開）、det2 'Open QC station' 死處理；**豆色快取二合一**：MENUS_DATA.dots 併入 `_dotsMap`（loadDots 直讀 cardDots 同快取——menusEnsureData 更新時杯測/卡片顏色同步受惠）。回歸：四菜單 PDF/杯測上色帶入/beanColorFor/printRadarPNG 全過
- **Take Away Menu 整組刪除（老闆點名）**（new/index.html −10.4KB，同 session 第二十六件）：buildTakeawayPDF/drawTakeawayMenu/drawPourCell/tkBlank/TAKEAWAY_DEFAULT/saveTakeaway/genTakeawayPDF/openMenuTakeawaySheet＋TAKEAWAY 全域＋menusEnsureData 的 takeaway 載入＋清單列/分派全拆；**takeawayAutofill/takeawayOptionList 保留**（Dine In 手沖自動帶入共用）。app_state 的 takeaway 鑰匙資料留著沒動（classic 那邊還在用）。回歸：Menus 剩三列、Dine In 抽屜與三份 PDF 照出 ✓
- **Retail Info 加「Send back to QC…」退回重審（老闆點名：放錯訊息）**（new/index.html，同 session 第二十七件）：豆子明細抽屜新鈕 → confirm（列明判定與後果）→ 找最新**有判定**的批次（bean_id 優先/名字備援，DB.roasts 已按 roast_date desc）→ `roasts.update({qc:null})` 回 QC 佇列＋`samples.flavour_locked=false` 解鎖（有 s.id 才動，best-effort）→ reload。**Square 上架不動**（照常賣，內部回爐）。流程：退回→QC 重杯修正→Pass（自動重鎖）。驗證：preview monkeypatch——confirm 文案/roasts qc=null eq 50/flavour 解鎖 eq 9/toast ✓
- **修 Retail Info 把售罄豆誤當故障（老闆回報 Hydro Honey 顯示 sync problems "pause" 進不了貨架）**（new/index.html，同 session 第二十八件）：sync-to-square 的 availability 動作會把 product_sync.status 設 **paused**（＝售罄的正常狀態），但貨架列表只收 synced → paused 被丟去「Sync problems」。修：live 收 synced+paused、sold 判斷加 status==='paused'（列表與明細兩處）、errs 排除 paused。DB 實查：老闆的「Danche」12:41 正是 paused（售罄），**不是同步壞掉**——修後回到貨架標 Sold out，一鍵 Put back on sale 復活。驗證：preview 三態假資料（paused 上架標售罄/synced 正常/error 留問題區）＋明細「● Shelf · sold out」＋按鈕文案 ✓
- **修 Delete a coffee 漏列「純上架孤兒」（老闆回報 delete 裡沒有 Danche）**（new/index.html，同 session 第二十九件）：allRetailCoffees 原本只從 samples∪roasts 收名——**只存在 product_sync 的殘留上架**（老闆的 Danche：0 杯測 0 烘豆＋paused Square 列）漏網 → 名單加第三來源 DB.syncs；**synced 旗標改含 paused**（售罄也是上架中，刪除時才會走 edge 拆 Square 商品）。DB 實查 Danche 名下確實只有 sync 列（external_id DERP2SY…），真紀錄全在 v1/v2/v3。驗證：preview——孤兒上榜帶 on Square 標、刪除呼叫 edge delete sample_id=Danche、本地只刪 exact 'Danche' 不碰 v2 ✓。⚠ Chrome 桌機 session 已登出（localStorage 無 token），代按刪除做不了——老闆手機 push 後自按
- **QC 判定板重排＋編輯烘豆日期（老闆點名）**（new/index.html，同 session 第三十件）：①judging→decision 區重排——底線連結列改**四顆等寬工具鍵 .qacts/.qact**（Re-cup／Card／Immersion／Roast date），judging 標題行帶「· roasted 日期」②新 `openRoastDateSheet(q)`：date input 帶現值 → 存 `roasts.roast_date`＋**samples.roast_date 有值時跟著改**（matchRoast 日期優先配對靠它）＋本地物件同步 → buildItems+render 即時刷新（新鮮度/貨架排序/卡片全跟著走）。驗證：preview——四鍵齊/無殘留 qlink/日期帶入/改 06-28 兩表 update 對 id/judging 行即時跳新日期 ✓
- **修「Pass 完 List 卡不出現」＋鎖風味靜默失敗（老闆回報 Danche v1 pass 後進不了 list）**（new/index.html，同 session 第三十一件）：DB 實查 v1 其實已 13:32 上架（老闆繞路推的）、但 flavour_locked=false（QC pass 的鎖定寫入失敗被 try/catch 靜默吞）。兩修：①qcVerdict 判定後改 **buildItems() 全量重算**（原本只濾 QCQ → Today 流舊資料，List 卡要等下次刷新）②鎖定失敗改 toast「⚠ flavour lock failed — lock it from Retail Info」不再靜默。**v1 的風味鎖已由 SQL 直接補鎖** ✓。驗證：preview 重現——pass 前無 list 卡→pass 後 list:s1 立刻在 ITEMS、佇列清空、鎖定寫入、toast ✓
- **Retail Info 加「re-checking in QC」回爐標示（老闆困惑 send back 後兩邊都有 Danche v1）**（new/index.html，同 session 第三十二件）：send back 的設計本來就是「內部回爐、對外照賣」＝雙重身分正確，但畫面沒講 → 列表列與明細副標加黃色「re-checking in QC」標（QCQ∪toCupList 名字比對）。驗證：preview 重現雙身分——列表標示＋On sale 徽章共存＋明細同標 ✓。**追修（老闆問「會刪 Square 嗎」）**：查出 sync-to-square v19 **本來就內建 `action:'delete'`**（刪目錄商品＋product_sync，director only）——前端接上：已上架豆刪除時**先呼 edge 拆 Square**（失敗先停問「本地照刪？」不半刪），確認文案改「the Square listing (item deleted from the Square catalogue too)」；未上架照舊只清本地。⚠ 注意 adopted（老闆手建再認養）的 Square 商品也會被刪——確認框有列明
- **header「Ratio」文字換 logo（老闆指定；追問後拍板只換 logo、不動版面）**（new/index.html，同 session 第六件）：#hbrand 內改 `.brandlogo`（36×36，`mask:url(/logo.png)`＋background:var(--ink) 上色——同 .bglogo 招式，夜版自動變紙白）；header padding 順手收窄（14/12→10/8）、align-items baseline→center。全 app 共用 header，員工分頁也一起換 logo。驗證：淺深兩版截圖 ✓

## 〇、補記 — 2026-07-07 白天 session（搬家：記烘豆進新殼）
- **開工檢查**：本機＝GitHub＝線上全同步（classic 726,356 / new 94,471 bytes）；Chrome MCP 實測線上 /new 三分頁全功能健康、console 零錯誤；DB 現況：無新單、3 張待收款（#0002 真單＋#0021/#0022 Dani $1 測試單——**老闆還沒回覆要不要取消清掉**）、push_subs=0（**推播還沒有任何裝置訂閱**，等老闆 iPhone 走 A2HS→Enable）
- **記烘豆搬進新殼**（new/index.html，待 push）：老闆「繼續」授權自選 → 按建議先搬烘豆記錄。①**Tools → Make 新「Log roast」**（玫瑰框，與 New order 並列）②**烘豆需求卡主鍵改「Log roast…」**（kind:'roastlog'，ref 帶需求清單）→ 開單批記錄抽屜：需求籌碼一鍵帶入（豆名配生豆批＋kg=×1.15 換算；配不到標 no green lot (blend?)）、選豆下拉帶庫存、生豆 kg、選填熟豆產出（同額入 remaining_kg）、日期預設今天、「Roast log (optional)」收合四欄（charge/first crack/drop/duration）③存檔**照抄 classic saveRoast 三筆寫入**：roasts insert（status pending_cupping）→ beans.quantity 扣減 → stock_moves kind:'roast' 流水帳。防呆：沒選豆 toast、超量 Stock check confirm（同 classic 文案）、產出>生豆 confirm。beans 查詢補帶 country 欄
  - 驗證：jscheck ＋ preview 假資料全流程（籌碼換算 0.6kg ✓/三筆寫入 payload 逐欄比對 ✓/庫存 8.5→7.9 ✓/超量擋寫入 ✓/需求卡 575g 接線 ✓）＋手機尺寸截圖夜版樣式一致；⚠ 登入後真烘一鍋待 boss 部署後試
  - 尚未搬：多批連烘（新殼一次一批，關掉再開即可）、blend 扣成分批次（Blending 工作台留 classic）
- **杯測快錄跟著搬進新殼**（new/index.html，同輪第二件，待 push）：補齊管線斷點——新殼 QC 佇列靠 samples 配批次，沒杯測過的新批次進不了 QC。①**今日流新「Cup」卡**（st:QC）：roasts status='pending_cupping' 且 qc 空 且不在 QC 佇列的批次（＝該豆從沒杯測過；有舊紀錄的豆照 classic 配對規則直接進 QC 佇列，不出 Cup 卡）——線上正好命中老闆 7/6 真烘的 5 批（Alo Bona/Finca Milan/El Vergel/Hakuna Matata/Danche）②**Cup 抽屜**：五感官 Light/Medium/Strong 三段選（再點＝清除）、風味 3 格（自動帶同豆上次紀錄）、描述 30 字 ③存檔照 classic submitCupping：no 依日連號（存檔時現查）、samples insert（supplier Ratio Coffee/decision null/cupper=WHO）＋容錯鏈（features→cupper→bean_id 逐個拿掉重試）→ roasts 標 cupped → toast「now in the QC queue」。防呆：全空擋存、同豆同日 confirm。loadAll roasts 查詢補帶 status 欄
  - 驗證：jscheck＋preview 假資料（卡片三分流：沒杯測出 Cup 卡/已判定排除/有紀錄走 QC 卡 ✓、風味預填 ✓、三段選切換與清除 ✓、insert payload 逐欄比對含 no=5 連號 ✓、status cupped ✓、同日重複 confirm 擋寫入 ✓）＋手機截圖；⚠ 部署後老闆拿那 5 批真杯一次
  - **管線現在成一條龍**：/new 記烘豆 → Cup 卡杯測 → QC 佇列判定 → （上架仍回 classic）
- **上架也搬進新殼——生產線全線在手機上走完**（new/index.html，同輪第三件，待 push）：①**「List · 豆名」卡**（st:Shelf，director）：QC pass 且 Square 未上架 → 抽屜：袋規 100-250g 段選＋主價＋500g/1kg 選填（**價格記憶走 app_state rtl_price/rtl_g/rtl_sizes**，classic 同款鑰匙跨 app 同步；讀回最新再改防互蓋）＋未鎖時「Lock flavour description」開關（預設開）→ Push＝現畫資訊卡（同出貨信管線 flavour_locked 優先）→ callFn sync-to-square action:'push'（payload 同 classic pushToSquare：name/description=process·風味/grams/price/variations/image_b64）→ 回寫價格記憶＋補鎖風味。未鎖硬推會 confirm ②**「Lock flavours — N coffees」聚合卡**：QC pass＋已上架但風味沒鎖 → 抽屜逐支列風味＋Lock 鍵（samples.flavour_locked=true），鎖過的顯示 locked ✓ ③QCQ 去重迴圈順便產 LISTQ/LOCKQ，不多跑查詢
  - **線上現況**：所有豆已 synced（老闆自己上完剩餘豆了），List 佇列今天是空的（未來新豆自動冒卡）；**Lock 聚合卡會亮 8 支**（Alo Village/April/Dancer/Dark Knight/Dreamer/La Molienda/May…風味都沒鎖）——老闆抽屜裡逐支按 Lock 就好
  - 驗證：jscheck＋preview 假資料（四分流：未上架→List/已上架未鎖→Lock 聚合/已鎖→無卡/QC 未判→QC 卡 ✓、app_state 預填 28/50/250g ✓、push payload 逐欄比對含真畫 125KB 卡片與三規格 variations ✓、記憶回寫三鑰匙 ✓、鎖風味 update ✓、Lock 抽屜逐支鎖＋locked ✓ 重畫 ✓）＋兩張手機截圖；⚠ 真推 Square 待部署後老闆用下一支新豆驗
  - **新殼生產線至此全線**：記烘豆 → 杯測 → QC → 鎖風味/上架 Square，classic 只剩低頻與後勤
- **盤點也進新殼**（new/index.html，同輪第四件，待 push）：Tools → Make 新「Stocktake」（玫瑰框）→ 全豆清單抽屜（產地分組、每支顯示帳面 kg＋實秤輸入格）→ Save **只存有改動的**（照 classic T8 規則：空白/無效/差異<0.0005 跳過）：beans.quantity 更新＋stock_moves kind:'stocktake' note:'Bulk stocktake'。驗證：jscheck＋preview（三支豆填 7.2/3/空白 → 只寫 b1 兩筆、delta −1.3 ✓、本地同步 ✓）＋截圖
  - **期間老闆 push 了前三個 commit**：線上 /new 已含記烘豆/杯測/上架（115,733 bytes 驗過含新函式）；盤點起的後續 commit 還在本機
- **購物車上線（設計評審優先度 1，plan mode 核准）**（public-shop v7 已生效＋new/index.html 待 push，第三十二輪）：①**edge v7**：GET 每豆加 `sizes:[{id,label,price}]`（catalog walk 的 ITEM related object 本來就帶全部 variations，撿起來用）；POST 新形狀 `{action:'checkout',items:[{id:variation_id,qty}]}`（≤6 行、qty≤9、**server 驗證**：id 必須屬於 synced 豆的 item variations 否則 400）＋舊形狀 `{bean,qty}` 向下相容（classic ?shop 不動）；payment link 加 `checkout_options.redirect_url=APP_URL/new/?checkout=done` ②**前端**：卡片 Order → **規格段選（>1 才顯示）＋數量步進＋Add to cart · $小計**（狀態存卡片 data-* 不重畫）；CART 存 localStorage 'r2_cart'（同 vid 累加、匿名跨次保留）；**浮動 cartbar**（反白、貼 shoptabs 上緣、tabs 藏時貼底）；**openCartSheet** 抽屜（行內步進/移除/Subtotal/「+2.2% surcharge · shipping arranged after payment」揭露/Checkout with Square——失敗不清車）；boot() 見 `?checkout=done` → 清車＋致謝 toast＋replaceState ③順手（評審第 3 項）：slide 100%→**92% 露邊**、**空分類 tab 不渲染**（≤1 類整條藏）；wireShopBuy 舊碼移除。驗證：v7 curl（sizes ✓/假 id 400 ✓/**真雙品項連結 $76.65 生成** ✓）＋preview 十關（加購/同豆累加/跨分類/浮條金額/抽屜步進移除/checkout payload 比對/失敗保車/?checkout=done 清車清網址藏浮條/露邊/三 tab）＋兩張截圖。⚠ **驗證產生的真連結 square.link/u/tDABzmGt（id HQMQG24UFJKI4YLK，$76.65）沒人會付但還活著**——老闆有空用 Chrome callSquareFn 註銷（同上次三連結做法）
- **購物頁改左右滑輪播＋底部四分類 tab（老闆點名）**（new/index.html，第三十一輪，待 push）：①**輪播**：`.shopwrap` scroll-snap（x mandatory、一頁一支豆、slide 100% 寬＋出血 22px、`.shopc` 蓋回 touch-action:pan-x pan-y——否則 .card 的 pan-y 會擋橫滑）＋圓點指示（scroll 事件按 slide 寬算 index）②**foot tab `#shoptabs`**（老闆定四格：**Blend / Classic / Innovation / Co-ferment**）：樣式同 nav（fixed bottom＋safe-area），選中反白；`shopCategory()` 自動歸檔——有配方＝blend、process 含 culturing/co-ferment＝coferment、anaerobic/hydro/nitro/carbonic/cold ferment/yeast/lactic/maceration＝innovation、其餘 classic；空分類顯示「Nothing in this corner」③公開店面與客戶門戶共用（`SHOP_BEANS`＋`renderShopTabs()`＋`paintShopBody()`）；boot() 復位時藏 shoptabs。真資料歸檔：June Project→blend、Alo Village（Cold Fermentation）→innovation、Danche（Red Honey）→classic。驗證：preview 真菜單（四 tab/預設 Blend/切 tab 換豆/空 Co-ferment 文案）＋假三豆輪播（3 slides/3 dots/滑到第二頁 dot 跟著走）＋截圖
- **購物頁換裝 C 規格書版＋Square 商品圖（老闆挑的）**（public-shop v5→v6 已生效＋new/index.html 待 push，第三十輪）：①**public-shop v5**：GET 菜單帶每支豆的 **Square 商品圖 URL**（batch-retrieve include_related_objects：變體→母商品 image_ids→IMAGE 物件 url，best-effort try/catch）②**v6 再加規格書欄位**：samples 帶 bean_id → beans 查 origin（region, country）/variety、roasts 查該生豆批最新 roast_date（bean_id 優先名字備援）③出了 A 大圖/B 側欄/C 規格書三版型範例（真資料真圖 SendUserFile）→ **老闆選 C** ④前端 shopCardsHTML 重寫：`.shopc` 卡（padding 0 出血）＋16:10 頂部裁切橫幅（object-position:top 讓資訊卡標題帶完整）＋Fraunces 名字與價格＋風味膠囊 .shop-chip＋明細表（Blend 或 Process/Origin/Variety/Cup/Bag/Roasted——烘焙日對客人講人話：freshly roasted/prime window/well rested）＋Order · $價＋Brew guide；首圖 eager 其餘 lazy。驗證：v6 curl 真資料（Danche＝Yirgacheffe＋品種＋06-28）✓、preview 真菜單三卡明細全對＋截圖 ✓；⚠ **lazy 圖在 headless 分頁不載入**（visibilityState hidden 不觸發 IntersectionObserver）——真裝置正常，preview 驗圖要手動轉 eager
- **三層入口定案：豆單開門→帳號解鎖→員工操作台（老闆定調＋plan mode 核准）**（new/index.html，第二十九輪，待 push）：①**init 抽成 `boot()`**（nav/chips 先復位再分流：沒登入店面／customer 門戶／員工操作台；view/filter 重設）——登入登出後重呼叫即換視角 ②**`openSignInSheet()` 登入抽屜**：Email＋Password（autocomplete 對應）→ signInWithPassword（照 classic）→ 失敗 inline 紅字不關抽屜、成功 toast＋boot()；Enter 送出；**只登入不註冊**（帳號 classic 開；客戶帳號等鎖 RLS 的設定階段）③店面 `pm-staff` 與客戶門戶 `cp-staff` 都改開抽屜（不再跳 classic；cp-staff＝signOut→boot→開抽屜原地換帳號）④**Tools 加 Sign out 磁貼**（confirm→signOut→boot 回店面）——員工進出迴圈閉合 ⑤How it works 補 Sign in and out 節。驗證：preview 八關（店面 landing/抽屜開/空欄擋/錯密碼 inline 錯誤鍵復位/stub director 登入→nav 復現 header「0 to do · Wu」/customer 角色→門戶/Sign out 磁貼→回店面/截圖）；⚠ 真帳號登入待老闆部署後手機試一次
- **Danche 三處理法串線修復（老闆回報「系統還是會亂掉」）**（DB 修復已生效＋new/index.html 待 push，第二十七輪）：**根因＝同名三個處理法（Red Honey 490kg/Hydro Honey 455kg/Anaerobic Washed 95kg）而多處配對只看名字**。①**資料修復（SQL 已執行）**：老闆自己刪了重複的 Hydro 豆（bean_mr8vmcq8 425kg）但留下孤兒——7/7 Hydro 杯測（sample a4817baf）bean_id 指向已刪豆＋process 'Hydro Honey.' 尾句點 → 改指倖存 bean_mqp2me2y＋去句點；7/6 Hydro 烘豆批（roast 9ae5e519）bean_id NULL → 連上同豆 ②**UI 全面標處理法**：QC 卡/Cup 卡標題、QC 工作台列與 judging 行、Retail shelf 名字旁都加 process 小字（Cup 卡經 bean_id 查豆） ③**貨架新鮮度改跟上架處理法**：shelfSampleFor（鎖定樣品優先）→ 用其 bean_id 找同生豆批的最新烘焙日，找不到才退名字——Red Honey 上架就看 Red Honey 的批，不被 Hydro 新批污染。驗證：preview 三 Danche 模擬（QC 卡標 Anaerobic/Cup 卡標 Hydro/工作台 judging 標處理法/貨架跟鎖定 Red Honey 9d 紅——非 Hydro 1d）。~~遺留：7/7 Anaerobic Washed 兩筆重複杯測~~ ✅ 老闆拍板「anaerobic 是 peach」→ 已刪 Plum 版（89e109d0），Danche 現在乾淨三筆一處理法一筆（Anaerobic=Bergamot/Grape/Peach、Hydro=Melon/Floral/Winy、Red Honey=Floral/Tropical/Caramel 鎖定在售）；**治本建議**：同名多處理法同時在售的話，考慮命名區分（如 Danche Red Honey）
- **客戶介面＝進來直接看豆單（老闆定調）**（new/index.html，第二十六輪，待 push）：/new 的兩個客戶入口都改成豆單開門見山——①**沒登入＝公開店面**（renderPublicMenu 取代原本的「去 classic 登入」閘門）：public-shop GET 真菜單卡（名稱＋$價/規格、配方比例或處理法、風味 3 顆、描述、**Order 大鍵**＝POST checkout 開 Square 付款頁、brew guide 連 ?bean=）＋回饋連結＋底部 Staff sign in 小鍵去 classic 登入 ②**客戶登入＝豆單在上**：歡迎卡（縮小）→ 菜單卡 → Your orders（自己的單）→ Staff sign in — switch account。共用 loadShopMenu/shopCardsHTML/wireShopBuy。**員工注意**：登出後 /new 首頁變店面，從底部 Staff sign in 進 classic 登入。驗證：preview 沒登入吃到**真菜單**（June Project $25/Alo Village $30/Danche $25 三支）＋客戶版順序（歡迎→3 豆卡→訂單→切換鍵）＋截圖；⚠ Order 真按會開真 Square 付款頁（沒真點）
- **貨架新鮮度三色＋60 天推播警示（老闆定規則）**（new/index.html＋morning-brief v3，第二十五輪，index.html 待 push、edge 已生效）：規則（2026-07-07 拍板）：**離最新烘焙日 <14 天紅（resting 養豆）、14–28 天綠（prime）、>28 天黃（ageing）、>60 天推警示**。①Retail shelf 每支在賣豆多一行新鮮度（shelfLatestRoast 取同名最新批次、shelfFreshness 分band；常數 SHELF_FRESH_REST/PRIME/STALE_DAYS=14/28/60；>60 天加「re-roast?」）＋頭列三色圖例；.fr-red/.fr-green/.fr-yellow 新 CSS（綠 #3F9A66/黃 #C29036 兩模式通用）②**morning-brief v3**：加查 product_sync＋roasts，在賣豆最新烘焙日 >60 天 → 晨報 bits 加「⚠ N shelf coffees roasted 60d+ (名字…)」每天推播。驗證：真資料 force 測到 **Alo Village 60d+** 進警示 ✓、preview 五態（5d 紅/20d 綠取最新批忽略 90d 舊批/40d 黃/75d 黃＋re-roast?/無日期灰）＋截圖
- **QC 判定板被 iPhone 底部安全區切掉（老闆截圖回報）**（new/index.html，第二十四輪，待 push）：.deck 原本 bottom:76px 沒算 env(safe-area-inset-bottom)——iPhone home 橫條讓 nav 高出 ~34px，Re-roast/Down 被蓋半截 → ①.deck bottom 改 calc(safe-area + 76px) ②判定板亮著時 body padding-bottom 加到 330px（清單最後一列才捲得出來），板收起（含在 QC 頁判完最後一批的 renderQC 直呼路徑）即清回。驗證：preview（deck bottom 76px=safe-area 0 環境正確/QC 亮板 padding 330/回 feed 清空/判完最後一批即清＋板藏）
- **QC 破圖修正（老闆回報）**（new/index.html，第二十三輪，待 push）：.bglogo 浮水印（logo.png 遮罩）在內容少的頁面整塊露出來，圓角方框輪廓像圖片載入失敗的破圖——render() 加一行：**浮水印只在今日流顯示**，QC/Tools 隱藏。驗證：preview 三分頁 display 檢查（feed block/qc none/tools none）＋QC 空狀態截圖乾淨
- **客戶門戶＋員工登入切換（權限地基第一塊磚，老闆點名方向）**（new/index.html，第二十二輪，待 push）：老闆宣布方向「之後客戶會直接登入、設定可見範圍、要有按鈕切更高權限」→ 這輪搭架子：①**角色預設翻面**：myRole() 認得 director/roaster/retail/staff 四種，**其他（含沒設）一律 'customer'**；init 的 fallback 從 director 改 customer（現有 5 個 profiles 全有明確角色、已查證不受影響）②**客戶視角＝獨立門戶**（renderCustomerPortal）：藏 nav/chips，只顯示歡迎卡（email 對 customers 表 ilike 找到名字）＋自己的訂單卡（狀態/品項/金額/tracking/awaiting payment，Cancelled 排除、最多 20 筆）＋Order coffee（?shop）＋Leave feedback（?fb=store）③**「Staff sign in — switch account」鍵**＝更高權限入口：confirm → signOut → 去 classic 登入員工帳號 → 回來即員工視角。⚠⚠ **只是 UI 隔離**：RLS 仍是小團隊信任模型（任何登入帳號可透過 API 讀全庫）——**真發客戶帳號前必須先做「設定階段」鎖 RLS**（orders/customers/beans…逐表收緊＋客戶只能讀自己的單），這是黃燈區權限地基的下半場。驗證：jscheck＋preview（角色映射七情境全對/門戶渲染兩單含 tracking 與 awaiting payment/nav 藏/staff 鍵 confirm 取消不登出）＋截圖
- **黑白頁手動切換（老闆問「哪裡可以切」→ 原本只跟系統）**（new/index.html，第二十一輪，待 push）：Tools 新「Appearance」三段選 **Auto / Light / Dark**——CSS 改造：夜版變數的 media query 加 `:root:not(.light)` 排除（系統深色也壓得住強制淺色）＋新增 `:root.dark` 同款變數塊（複製一份，改夜版色記得兩處同步）＋.bglogo 透明度同樣雙軌；JS `applyTheme()/themeGet()` 存 localStorage 'r2_theme'（顯示偏好**刻意一台一台設**，不走 app_state），開機即套避免閃色。驗證：preview（auto 跟系統/dark 強制/light 在深色系統下 ink 變 #1A1A1A ✓/回 auto/記憶保存/段選 on 態）＋強制淺色截圖
- **抽屜把手下拉關閉**（new/index.html，第二十輪，待 push）：.grab 從 44×5 小藥丸改成整寬熱區（視覺藥丸走 ::after，touch-action:none 不搶內容捲動）＋`attachDrawerDrag()`（openDrawerHTML 每次重畫都重掛）：pointer 拖曳跟手、**拉過 90px 放手＝關**（同時走 unlockBg）、不足彈回、往上 clamp 0。驗證：preview PointerEvent 模擬四情境（跟手 40px/彈回/150px 關＋body 解鎖/上拉不動）全過
- **抽屜背景鎖定修蟲（老闆回報）**（new/index.html，第十九輪，待 push）：彈窗開著背景照樣捲得動/滑得動 → ①`lockBg()/unlockBg()`：開抽屜時 body position:fixed＋top:-scrollY 釘住（iOS 的 overflow:hidden 靠不住），關閉復原捲動位置；**冪等設計**——openDrawerHTML 被 paintXxx 連呼重畫時不會重抓位置 ②`.drawer-bg` 加 touch-action:none（遮罩吃掉滑動）③`.drawer` 加 overscroll-behavior:contain（抽屜內捲到底不外溢）。全部彈窗共用 openDrawerHTML/closeDrawer 所以一次修全。驗證：preview（捲 400 開抽屜 body fixed top -400/鎖定時 scrollTo 無效 scrollY=0/重畫 top 不變/關閉回 400）
- **Retail shelf 貨架清單**（new/index.html，第十八輪＝老闆點名「retail list」，待 push）：Tools Look up 新磁貼「Retail shelf」（key 'retail'）→ 唯讀抽屜：①**在賣清單**（product_sync synced）：豆名＋鎖風味狀態（沒鎖標 unlocked 小字）＋價格規格（app_state rtl_price/rtl_g/rtl_sizes，沒記價紅字）＋On sale／**Sold out 紅**（rtl_sold）＋頭列計數 ②**Sync problems**（status≠synced 紅字）③**Ready to list**（ITEMS 的 list 卡＝QC pass 未上架，指去今日流按 List 卡）。動作留 classic Retail Info 與今日流卡。**順修 CSS 蟲**：`.dl span:first-child` 灰色蓋掉巢狀 `.red`（優先度 0,2,1 > 0,1,0）→ 補 `.dl span.red{color:var(--danger)}` 後置規則。驗證：jscheck＋preview（五態：有價/沒價紅/賣完紅＋計數/sync error/待上架 ✓、紅字 computed 224,104,90 ✓）＋手機截圖
- **「How it works」使用說明頁**（new/index.html，第十七輪，待 push）：Tools Look up 新磁貼（key 'help'）→ 抽屜六節英文說明：Today feed／Gestures（右滑做左滑睡＋undo＋籌碼過濾）／QC tab／Tools tab（Make 與 Look up 分工、classic 跳轉）／Notifications（iPhone A2HS 七步）／Good to know（回前景自動刷新、貪睡全店共用、烘豆扣帳與盤點修帳）。**給未來 staff 上手用——功能演進時記得回來改這頁**。驗證：jscheck＋preview（磁貼＋六節渲染）＋手機截圖
- **線上全面實測（老闆登入態 Chrome，第十六輪收官）**：部署版 150,253 bytes＝本機；今日流真資料 26 卡全對（5 Cup 卡＝7/6 五批、Lock flavours 8 coffees、**2 張 QC 判定卡 Danche/Kiama AA＝老闆日間有新杯測**、10 調參/3 收款/4 低庫存）；Tools 18 磁貼齊；四清單真資料開合正常（生豆 29 支 1877 kg/熟豆批次 2 批 20 kg/客戶 12 位/訂單 4 筆）；console 零錯誤。**兩個資料發現待老闆發落**：①customers 有 **8 筆重複的自家測試身分**（Dani×5/Daniel/Daniel Wu，都是 wu110681@gmail.com，含一筆打錯的 gmsil.com——那筆還掛著 1 張單）→ 名冊看起來很吵，建議留 1 筆刪 7 筆（含轉單）②生豆帳面 1877 kg 主要來自 Danche Red Honey 490 kg/Hydro Honey 425 kg 等大批次——如是單位打錯（該是 4.9 kg？）用新殼 Stocktake 就能修
- **晨報鬧鐘 DST 加固（morning-brief v2）＋安全體檢**（同輪第十五件，Supabase 端）：v2 加**時間閘**——只有雪梨時鐘是「早上 6 點檔」才真發（body {"force":true} 可繞過供測試，仍要金鑰）；pg_cron 排**兩個時段** 19:30＋20:30 UTC（job 'morning-brief-daily-dst' 新增），冬令/夏令各命中一發、另一發回 skipped → **全年自動對準 6:30，10 月不用改**。驗證：雪梨 9 點打＝skipped ✓、force＝真晨報 ✓、錯金鑰 401 ✓、兩 job active ✓。**advisors 安全體檢**：今天新裝的 pg_cron/pg_net/morning-brief 零新警告；清單全是既有已知項（always-true 政策群/secrets_kv INFO/mail-assets 列目錄/is_staff/Leaked password protection 等老闆）
- **晨報自動推播上線（全在 Supabase 端，index.html 沒動、不用 push）**（同輪第十四件）：①migration `enable_pg_cron_and_pg_net`（兩個 extension 首次啟用）②**edge `morning-brief` v1**（verify_jwt false＋自建驗證：x-cron-key header 必須等於 secrets_kv 'cron_key'——該表零 policy 只有 service role 讀得到；金鑰 openssl 隨機 48 字元）：雪梨在地時間算晨報（班表名單/待接/待包/待出/未收款/低庫存/待辦，全零顯示 All clear）→ service-role bearer 呼叫 push-send 廣播 ③migration `schedule_morning_brief_push`：pg_cron job 'morning-brief-daily' **每天 20:30 UTC＝雪梨 6:30**（⚠ 夏令 AEDT 時會變 7:30，10 月要嘛改 19:30 要嘛接受）用 net.http_post 帶金鑰打函式。驗證：錯金鑰 401 ✓、對金鑰回真晨報「On: Yi, Joshua · 3 unpaid · 4 bean low」✓、cron 同款 SQL 路徑 net._http_response 200 ✓、job active ✓。**現在 push_subs=0 所以每天無聲跑**——老闆 iPhone 訂閱推播後隔天早上自動開始叮
- **客戶名冊進新殼——客戶站轉全綠**（new/index.html，同輪第十三件，待 push）：Tools Customers 磁貼（key 'search'→'customers'）→ **Customer book 抽屜**：每位客戶＝名字/類型膠囊/單數/最後下單/累計金額（DB.orders 本就排除 Cancelled＝classic 同規則），照最後下單新→舊排、沒單的標 new 沉底 → 點開**客戶詳情**：類型/email/單數/累計＋最近 10 筆訂單史（單號/日期/狀態/金額/unpaid 紅字）＋‹ Back。驗證：jscheck＋preview（排序含同日比時間戳/加總 1220/no-orders 沉底/詳情訂單史/返回）＋截圖。**進度板 9 客戶手機端半綠→全綠**
- **調參表單帶上次數字**（new/index.html，同輪第十二件，待 push）：Dial in 抽屜從空白表單升級——同支豆最新一筆自動帶入四欄（微調幾格就能存，沒改的照舊存回）＋標題下顯示「last: grind 2.6 · 20g · → 44g · 27s · 3d ago · Yi」；沒調過的豆維持空表單。loadAll dialins 查詢補帶 grind/dose/yield/time_s/barista。驗證：jscheck＋preview（帶最新不帶舊/空表單/只改磨度存檔 payload 其他欄照舊）＋截圖
- **回前景自動刷新＋todayKey 時區修正**（new/index.html，同輪第十一件，待 push）：①手機切回 /new 自動 reload（`maybeAutoRefresh`：visible＋已登入＋抽屜沒開＋距上次載入 >60 秒才刷；visibilitychange 監聽；LAST_LOAD 在 reload 記錄）——PWA 掛牆用不再看到舊資料 ②todayKey 從 UTC 改本地日（跟 todayStr 一致）：貪睡「明天回來」從雪梨早上 10 點提前到午夜 0 點，也修掉同檔兩套日期的隱患。驗證：jscheck＋preview（五情境：未登入跳過/新鮮跳過/過期刷/抽屜開跳過/事件接線觸發——注意 headless 預覽分頁 visibilityState='hidden'，要 defineProperty 偽裝 visible 才測得到）
- **貪睡改跨裝置同步**（new/index.html，同輪第十件＝打磨類第一件，待 push）：原本左滑貪睡存 localStorage（iPhone PWA/Safari/電腦各一套，手機睡掉的卡電腦還冒）→ 改存 **app_state key:'new_snooze'**（loadAll 第 11 條查詢載入 SNOOZE_ALL、addSnooze/undoSnooze 即時 upsert 上雲、寫入時只留今天的 key＝順手清舊日期）。**語意變成全店共用**：誰睡掉＝大家都先不看（小團隊操作流合理）。localStorage 版棄用（貪睡本來就隔天失效，不遷移）。⚠ todayKey 用 UTC＝雪梨早上 10 點前還算「昨天」——既有行為，沒動。驗證：jscheck＋preview（舊日期自動失效/今日藏卡/upsert payload/undo 清雲）
- **生豆清單＋熟豆批次清單進新殼**（new/index.html，同輪第九件＝老闆點名「生豆豆單和熟豆豆單」，待 push）：Look up 磁貼改**名字制 data-t**（greens/batches/search/orders/notes/classic，不再加一顆重編一次號）。①**Green stock**：全豆清單（產地分組、名字＋處理法＋供應商、右側 kg **低於警戒線紅字**（low_stock_kg=0 輪替豆不警示）、頭列總 kg）→ 點豆開詳情（庫存/警戒線/單價/供應商＋**最近 6 筆 stock_moves 流水帳**現查）②**Roast batches**：照 classic Batch stock——remaining_kg>0 分豆群組（群組小計）、FIFO 最舊在上、徽章 use first/>30d 紅/QC ✓/re-roast/downgraded/blend → **點批次記用量**（Used/sold kg → remaining_kg 扣減，同 classic saveBatchUse）。loadAll roasts 補帶 roasted_kg。驗證：jscheck＋preview（低警示三態含 0=off ✓、詳情流水帳渲染 ✓、批次分組小計/FIFO/徽章 ✓、扣量 0.8−0.5=0.3 回列表 ✓）＋截圖
- **團隊留言板進新殼**（new/index.html，同輪第八件，待 push）：Tools「Look up」加 **Team notes** 磁貼（Classic app 磁貼順位 3→4，data-t 接線同步改）→ 抽屜：頂部發文框＋Post（insert {title,unread:true,channel:'general'}，channel 欄不存在退舊格式——同 classic 雙路）＋最新 30 則 general 留言（channel null 或 general，時間 dd/mm HH:MM）。**刪除刻意留 classic**（那邊有 confirm 防呆），副標有註明。驗證：jscheck＋preview（清單渲染/發文 payload 比對）＋截圖
- **訂單瀏覽進新殼**（new/index.html，同輪第七件，待 push）：Tools「Look up → Orders」從「請打搜尋框」升級成真清單——**Recent orders 抽屜**（最新 25 筆：單號/客名/狀態/金額/unpaid 紅字/日期/渠道膠囊，>25 提示去 classic；DB.orders 本就排除 Cancelled，抽屜副標註明）→ 點列開**詳情抽屜**（狀態 tag、品項逐行帶行金額、Total、付款方式與狀態、下單/出貨日、tracking 有才顯示、‹ Back to list 返回）。唯讀設計——動作照舊走今日流卡片。驗證：jscheck＋preview（三筆假單清單欄位/詳情 320+320=640/Back 返回）＋截圖
- **拼配批次也進新殼——烘豆站補完**（new/index.html，同輪第六件，待 push）：老闆主力商品是 blend，原本 Log roast 只能記單品 → 表單加 **Single origin / Blend 模式切換**：Blend 模式選配方（blends 表現查）→ 顯示配方列（pct% 成分＋batch stock 可用量，0 紅字）→ 填熟豆 kg → 存檔照 classic addCoffeeSubmit blend 路徑：roasts insert（kind:'blend'＋**配方快照** recipe:{blend_id,parts}，容錯鏈缺欄退回）→ **consumeBlendParts FIFO 扣成分熟豆批次**（最舊先扣、不夠扣完照存但 alert 短缺清單，同 classic）。防呆：同名同日批次 confirm。**烘豆需求籌碼升級**：配不到生豆批的先查配方表，是 blend 就出「blend · ~X kg roasted」籌碼（熟豆量不 ×1.15）一鍵切模式帶入；真的沒有才標 no green lot。loadAll roasts 補帶 kind/remaining_kg。順修 .red 樣式改全域（原本只在 .s 裡有效，抽屜列吃不到）。驗證：jscheck＋preview（FIFO 三批扣帳 0.4→0/2→1.8/1→0.6 逐筆比對 ✓、配方快照 payload ✓、blend 籌碼帶入 ✓、短缺 alert 兩支清單 ✓、紅字 computed style ✓）＋截圖
- **收生豆也進新殼**（new/index.html，同輪第五件，待 push）：查出 purchases 表全空＝老闆訂豆從不走 app 採購鏈 → 做**免採購單版**「Receive green」（Tools 玫瑰鍵）：Existing lot（選豆→帶上次供應商/單價可改→輸實收 kg，quantity 累加＋更新 cost/supplier）／New bean（名/國/處理法/kg/單價/供應商，**id 用 classic 同款 'bean_<ts36>_<rand6>' 格式**；同名同處理法已在帳上會 confirm 提醒改用併批）；兩路都記 stock_moves kind:'receive' note:'Received — 供應商 · lot X'（照 classic receivePurchase，只差 note 開頭不寫 PO）。loadAll beans 查詢補帶 cost_per_kg/supplier。驗證：jscheck＋preview（併批 8.5+30=38.5＋單價 15 更新＋lot 流水帳 ✓/新豆全欄位＋id 格式 ✓/預填 ✓/重複豆 confirm 擋 ✓）＋截圖
- 開發備忘：launch.json 加了 ratio-static-2（port 8125，8124 被別的 session 佔用時用）；serve 複本路徑不變

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
- **🚚 開搬第一波：新殼 `/new` 真資料版完成**（`new/index.html` 全新檔案，舊 index.html 一字未動，待 push 部署）：
  - **架構**：獨立頁、同 Supabase 同 publishable key、**同網域共用登入 session**（classic 登入過直接進；未登入顯示閘門連去 classic 登入）；讀 profiles 帶角色（director 全看、roaster 看 QC/Green/Tasks、retail/staff 看 Orders/Bar/Tasks）
  - **Today 真資料真寫入**：晨報（各佇列計數）／Accept（payment_link→Confirmed→確認信，照抄 callFn 模式）／Decline·Cancel（Cancelled＋取消信）／Pack（pack_state 全勾＋Ready）／Dispatch 抽屜（tracking＋出貨信**不帶新卡**，靠 edge 讀 mail-assets 既有卡——換裝完整版要補卡片管線）／Mark paid（＋收款信）／QC Pass（feed 卡）／Dial in 抽屜表單（insert dialins）／Task Done／Low green＝提示卡；滑卡右做左睡（貪睡存 localStorage 隔天回來）、時段排序、details 抽屜
  - **QC 分頁**：真佇列（samples 去重＋matchRoast）＋底部拇指 Pass/Re-roast/Down 真寫 roasts.qc
  - **Tools**：真搜尋 beans/customers/orders（抽屜詳情）＋ Make 類全部跳 classic
  - 驗證：jscheck＋preview 登出閘門＋假資料全管線（10 卡衍生正確含排除規則/QC 台/搜尋/Task Done 寫入/貪睡持久化/抽屜）＋截圖；✅ **老闆真單實測全通（2026-07-06 晚）**：/new 按 Accept → 付款連結生成、狀態轉 Confirmed、確認信寄達、款項退款流程也跑過——edge 三連發驗證完畢，新殼正式可營業
  - **搬家原則（對老闆的承諾）**：新殼滿意一塊搬一塊，舊 app 保留到說拆為止；下一波候選＝PWA＋推播（第二級）、Dispatch 卡片管線、Pack 逐項勾、新殼內開新單
  - **網址（push 後）：ratio-theta.vercel.app/new/**
- **🔔 PWA＋推播完成（搬家第二波頭牌，老闆點名）**（`new/` 加 manifest.webmanifest/sw.js/icon-192/512＋index.html 改動，待 push；DB 與 edge 已生效）：
  - **DB**（migration `push_notifications_setup`）：`push_subs`（endpoint 唯一/keys/who，authenticated 全可管）＋`secrets_kv`（**零 policy＝只有 service role 可讀**，VAPID 金鑰對放這，瀏覽器 Web Crypto 產生）
  - **edge `push-send` v1**（verify_jwt true，director JWT 或 service-role bearer）：npm:web-push 廣播全部訂閱、404/410 自動清死訂閱、回 sent/failed/pruned
  - **square-webhook v18**：網店新單匯入＋付款連結到帳兩處加 `callPush()`（service-role 內部呼叫、非致命 try/catch）→ **新單/收款手機鎖屏跳通知**
  - **/new 客戶端**：manifest（standalone、scope /new/）＋apple-touch-icon＋sw.js（push 顯示通知、點通知聚焦或開 /new）＋Tools 新「Notifications」區（**Enable here** 訂閱寫 push_subs＋**Send test** 打 push-send；iPhone 未加主畫面時顯示 A2HS 教學小字）；app 圖示＝墨底玫瑰 R（canvas 產生）\n  - 驗證：preview 實測 manifest/SW 註冊/圖示 200/Tools 通知區渲染；⚠ **真推播要老闆手機驗**：push 部署後 iPhone 開 /new → 加入主畫面 → 從圖示開 → Tools → Enable here → 允許 → Send test 應該叮一聲；之後網店來單自動推。**注意 iPhone 刪主畫面圖示＝斷推播**
- **🌙 夜班（老闆授權自主作業）：新殼第二波四件完工**（new/index.html，待老闆晨起 push）：
  ①**Pack 逐項打勾**：Pack 卡改開清單抽屜——每項一顆大按鈕、勾一項即存 pack_state、**全勾才亮「All packed — move to Ready」**（預帶既有勾選狀態）
  ②**回饋進今日流**：feedback（reply 為空）長成 Customers 卡——有 email 按 Reply… 開回覆抽屜（引原文＋textarea → send-email feedback_reply 寄信蓋章）、匿名按 Got it 收起
  ③**新殼開新單**：Tools → Make 第一顆「New order」——客人下拉（含 walk-in）/品項（豆名下拉＝beans∪product_sync、克數 100-1000、qty 步進、單價輸入、可加行刪行）/付款二選一/總額即時算 → insert manual 單（**order_no 查全表 max+1 含 Cancelled 防撞號**）→ 出現在今日流等 Accept
  ④**貪睡 undo**：本次 session 貪睡的卡在 feed 底部出現「N snoozed · undo」一鍵全部召回
  - 驗證：jscheck＋preview 假資料全流程（六種卡渲染/Pack 三段流程含寫入內容比對/Reply 派發 payload 正確/匿名貪睡＋undo 列/開新單完整填寫＋insert payload 全欄位比對 order_no 21・total 50）
  - **夜班守則遵守**：零真信件、零真推播、舊 app 未動、DB 只在老闆自己操作時寫；一切 UI 改動停留本機等 push。~~剩下未做：出貨信卡片管線~~ ✅ **完成（2026-07-07 晨）**：用 python 腳本從 classic **原封抽出** mnHexRgb/_rrPath/_cardFit/_cardRadar/兩張 icon base64/_loadCardIcons/_tintIcon/makeSquareCard 植入 new/index.html（37.5KB，零手抄）；資料端重寫成直查版 `cardDataFor`（blends 表直查配方、DB.roasts 補烘焙日、**app_state rtl_dot 讀卡片顏色**——PWA 的 localStorage 跟 Safari 分家所以不能學 classic 讀本機、beans ilike 查產地）＋`uploadCardsFor`（同 classic：flavour_locked 優先、去重、mail-assets upsert、cache-bust）。Dispatch 寄信改帶 cards、按鈕顯示 Drawing cards…。驗證：preview 實畫 blend 卡與 classic 視覺一致（截圖）＋上傳流程 stub 全對（去重/路徑/upsert/URL）。**新殼出貨信從此與 classic 同級**
- **新殼今日流補強 ×2**（new/index.html，待 push）：①**晨報帶今日班表**——loadAll 加 rosters 查詢（mondayStr 定位本週、排除 deleted），晨報副標開頭「On: Yi, Nina」、details 首列完整時段（非當天班次過濾）②**烘豆需求卡**——Confirmed/Roasting 品項同名跨單合併，標題直接寫總生豆量（×1.15），details 逐豆換算＋Total；roles=director+roaster（零售員不看）；CTXS 三種排序加 Roast/Customers 權重。驗證：preview 假資料（跨單合併 550g/747g 生豆/當天過濾/角色可見性）全過
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
  ✅ 1生豆(2026-07-06) ✅ 13網店櫥窗(2026-07-06 老闆實付驗證全通：?shop→Square 結帳→webhook 匯入 #0015→信件；**遺留小修**：櫥窗價格讀 product_sync 快取（$25）但 Square 連結模式商品實收自家價（$30）→ 菜單應改讀 Square 現價。**public-shop v2**：結帳地點改優先挑名字含 Online 的 location（舊版拿第一個=Crows Nest；可用 SQUARE_LOCATION_ID secret 強制指定）；⚠ sync-to-square 的 payment_link 仍走第一個地點，老闆還沒決定要不要跟進)｜ ✅ 8訂單(2026-07-06 泡泡面板，見補記) ✅ 4QC(2026-07-06 泡泡面板，見補記) ✅ 3烘焙(2026-07-06 泡泡面板，見補記) ✅ 5萃取(2026-07-06 泡泡面板，見補記) ✅ 0總覽首頁(2026-07-06 站台脈搏 MVP，見補記) ✅ Task模組(2026-07-06 待辦板＋脈搏藥丸，見補記) ✅ 2研發(2026-07-06 泡泡面板，見補記) ✅ 6Retail(2026-07-06 貨架卡入 QC 站，見補記) ✅ 7Marketing(2026-07-06 集中頁，見補記) ✅ 9客戶(2026-07-06 回饋佇列＋客戶名冊，見補記) ✅ 10文件(2026-07-06 既有 Print+File+Post 認站) ✅ 11人事(2026-07-06 Today on shift 卡) ✅ 12財務(2026-07-06 唯讀儀表板 MVP，見補記；記帳規則待老闆聊完再擴) ｜ 🟡設定類（先擱置）：權限地基（staff 角色開放，**新殼角色過濾已是雛形**）／Leaked password protection（Supabase Auth 後台）／~~sync-to-square 付款連結地點跟進 Online~~ ✅ **v19 完成**（2026-07-06 深夜，老闆發現退款掛在實體店拍板）：ensureLocationId 改 SQUARE_LOCATION_ID secret 優先→名字含 Online→fallback 第一個；**順便加卡費 surcharge**：`SURCHARGE_PCT` secret（預設 2.2＝Square AU 線上費率、上限 10、設 0 關閉），連結金額 ×(1+pct)、標題明寫 incl X% card surcharge、回傳帶 surcharge_pct/charged_amount；另加 `locations` 除錯 action。✅ **老闆新測試單驗過**（2026-07-06 深夜）：新連結標題含 incl 2.2% card surcharge、金額 ×1.022。**陷阱記錄**：已有連結的單會重用舊連結（防重複），所以升級後要用「新單」驗，老闆第一次拿 #0021 舊連結看以為沒生效。**確認信裡的金額仍是原價**（surcharge 只在連結頁顯示），要在信裡標註的話改 send-email。**後續兩件老闆拍板都完成**：①測試單 #21/#22/#23（$1×3）已刪、三個 Square 連結（QYFA…/CJL4…/IRGM…）經老闆 Chrome 分頁 callSquareFn 逐一註銷 ②**public-shop v4**：?shop 結帳加 surcharge——用 Square **service charge**（結帳頁單獨列一行 Card surcharge 2.2%，percentage 制 SUBTOTAL_PHASE），同吃 SURCHARGE_PCT secret；checkout 回傳加 id/total/surcharge_pct。實測：June Project $25 → total 25.55 ✓，測試連結 JSC7W7CS4A6FJBHQ 已註銷。**send-email v20**：確認信/催款信的付款按鈕下加 surcharge 揭露小字（同吃 SURCHARGE_PCT，銀行轉帳不加）——收款體系三處（連結/網店/信件）費率一個設定同步。Edge 版本現況：send-email **v20**／sync-to-square **v19**／public-shop **v4**／square-webhook v17／public-bean v1。⚠ v20 信件小字待下一張真單順眼驗證 ｜ 停車場（不排程）：wholesale／賣生豆／教學
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
- 優先序：~~Google 商家檔案（評論 QR 進出貨信/貼紙）~~ ✅ 全通（2026-07-08 老闆貼了評論連結，已存 app_state google_review_url——出貨信 CTA/QR 即刻生效；DB 原有一條 07-05 存的舊連結尾碼不同，實測兩條都指同一 placeid，以老闆新貼的為準）> IG（v3 資訊卡 1200×1200 直接當貼文，Print Centre 已可下載）> 小紅書（中文+北岸華人，高 ROI）> TikTok/Reels（有餘力）
- 四內容支柱：新豆上市 / 過程隨手拍 / 沖煮教學（Brew guide 現成）/ 選豆思路
- 頻率：IG 週 2 貼+3-4 限動、小紅書週 1-2、Google Post 週 1
- 在地：包裹小卡 QR、供豆下家立牌、季度市集
- **Phase 4 新增規格**：~~上架自動產 IG/小紅書素材（資訊卡+中英文案草稿）~~ ✅ 2026-07-08 Social post kit 完成（見〇補記）、~~新豆通知一份內容三發~~ ✅ 2026-07-08 新殼豆子抽屜 Announce by email 完成（見〇補記，三發同一抽屜）、~~回購提醒附評論連結~~ ✅ 2026-07-08 Fresh batch nudge 卡＋send-email v21 完成（見〇補記）——**Phase 4 三項全完工**

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
- ~~**杯測卡＋Retail Info 卡加「Analysed by」**（老闆需求 2026-07-06）：rtSampleCard 副標、retailCard 的 Roasted 行下方各顯示 `Analysed by <cupper>`（samples.cupper = 登入者名字，沒記錄就不顯示）~~ ✅ classic 早已完成（index.html 8200/8488/9184 三處，待辦漏劃）；新殼豆子明細抽屜 2026-07-08 補上（見補記）
- 剩：4 支上架（Dancer/Dreamer/April/May/June Project — 現在資料齊了，QC Pass + Lock flavour + Push to Square 即可）
- ~~**Retail Info 改版**~~（老闆需求 2026-07-06）✅ 早已完成（classic 7622–7656 都在），漏劃 2026-07-08 補劃：
  - **Blends / Single Origin 分頁**（lbl-seg 樣式，預設 Blends；以 blendDefByName 判定歸屬）；Blend 泡泡（rtl-blend-tag）移除
  - **收合列右側顯示 Square 狀態膠囊**（Live 綠 / Error 紅 / Not listed 灰）+ **迷你 Announce 鍵**（喇叭圖示，走原 announceCoffee 含上架閘門與人數確認）；展開後兩者隱藏（body 本來就有完整 Square/Announce 列）
  - 驗證：preview 假資料實測兩分頁篩選/計數、泡泡移除、三態膠囊、迷你鍵數量與綁定、展開收合切換，全過

## 四、基礎設施速查
- Supabase kjhudxzvidhynpabnalp（Sydney）；Edge：send-email **v12** / sync-to-square **v14**（+payment_link_delete、payment_link 存 square_order_id）/ square-webhook **v9**（payment_link 自動標 paid）
- orders 欄位新增：tracking_no, dispatch_email_at, confirm_email_at, payment_link, payment_link_id, pack_state, square_order_id
- beans.brew / blends.brew jsonb（method-keyed）；mail-assets bucket（public，卡片 PNG，advisor 唸可列目錄＝低風險留觀）
- **design-assets bucket**（2026-07-08 老闆為未來設計部門要求）：public、25MB/檔、只收 image/*＋pdf；**四政策全 is_staff()**（列目錄/上傳/改/刪都要員工登入）——**故意不開廣泛 public SELECT**，個別圖走 public URL 可嵌網站/信件但外人無法列目錄（比 mail-assets 嚴，advisor 無新 listing 警告）。上傳：Supabase Dashboard→Storage→design-assets 拖檔，或未來做 app 內上傳鈕/Make 自動化 Drive→此桶。定位＝設計部門「上線圖」，工作原始檔仍放 Google Drive（免費僅 1GB）。⚠ advisor 新增 is_money/my_profile_name/is_director 三條 SECURITY DEFINER 警告＝Timesheet Stage A 的 RLS 助手，**不可 revoke**（同 is_staff 家族，已知接受）
- Square item ids：Alo Village=CFGKRBQ5EAWGB5UAUV35NOP5、Dark Knight=JZVP5ICULJ7TQJGL7VWW6XE2；ratio_ref 定義=MV5EOCK2W3XXFQPHILKQWKOQ
- Chrome MCP：Ratio tab id 1489018982
- 開場模板：先抓 https://raw.githubusercontent.com/getratiocoffee/Ratio/main/index.html + 讀本檔
