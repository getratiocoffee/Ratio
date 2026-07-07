# Ratio 開發交接 — 至 2026-07-07（站台改造全線＋新殼 /new 上線）

## ⚡ 當前狀態速覽（2026-07-07 更新，新 session 先讀這段）
- **兩個 app 並行**：
  - **新殼 `/new`**（new/index.html，獨立檔案）＝日常營運主力：今日流（10 種卡：晨報含班表/接單/烘豆需求/備貨打勾/出貨含現畫資訊卡/收款/QC/調參/低庫存/任務/回饋回覆）＋QC 拇指工作台＋Tools（搜尋/開新單/傳送門）；滑卡（右做左睡＋undo）、時段排序、紙白玫瑰＋炭紙自動夜版、PWA 可裝＋**Web Push 推播**（新單/收款手機叮）、角色過濾（director/roaster/retail/staff）。與 classic 同網域共用登入
  - **classic `/`**（index.html 單檔）＝低頻功能：上架/印刷/盤點/庫存/財務儀表板等，12 站泡泡面板全亮；**完全沒被新殼改動**
- **Edge 版本**：send-email **v20**（付款按鈕帶 surcharge 揭露）/ sync-to-square **v19**（付款連結走 Online 地點＋2.2% surcharge）/ square-webhook **v18**（＋推播）/ public-shop **v4**（結帳 service-charge surcharge）/ public-bean v1 / **push-send v1** / **morning-brief v1**（2026-07-07：pg_cron 每天 20:30 UTC＝雪梨 6:30 冬令自動呼叫，算晨報→push-send 廣播；x-cron-key 驗證，金鑰在 secrets_kv 'cron_key'；訂閱 0 時無聲）。SURCHARGE_PCT secret 一處管三處（預設 2.2）
- **新表**：tasks（團隊待辦）/ push_subs（推播訂閱）/ secrets_kv（**零政策＝service-role only**，放 VAPID 鑰匙——advisor 的 INFO 是刻意設計）
- **安全**：messages 匿名讀已鎖＋登入重載；handle_new_user execute 已再次 revoke（2026-07-07 驗證 404）；always-true 政策群＝小團隊信任模型（刻意）；mail-assets 可列目錄（低風險留觀）
- **等老闆做**：Leaked password protection（Supabase Auth 後台一鍵，advisor 持續提醒）、上架剩餘豆（classic Beans 站照佇列按）、新殼 Dispatch 首次真單看卡片
- **等老闆拍板**：staff 帳號開放（新殼角色過濾已就緒）、語音快錄/BOOKOO 秤（第三級）、wholesale/賣生豆/教學（停車場）
- **開發環境備忘**：push 用 GitHub Desktop（終端機無 Git 認證）；無 Node，jscheck 用 osascript；本機預覽 launch.json 指向 scratchpad/serve 複本（**改完檔案要 cp 過去**）；Chrome MCP 可開 ratio-theta（老闆登入態可代跑 callSquareFn 等）；Claude Code CLI 已裝在老闆 Mac（design-login 已授權，重推設計系統用終端機 claude）

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
- **Info cards 改直接下載 PDF（老闆指定不要列印框）**（new/index.html，同 session 第十六件）：openInfoCardPrint 改走 **html2pdf**（cdnjs 0.10.1，`loadScriptOnce` 首次用才載）——卡片 HTML 塞進頁內隱藏容器 → html2canvas scale 3.3＋useCORS（先等 QR/logo 圖載完）→ jsPDF format [297,105] 存 `infocard-<slug>.pdf`。**三個坑**：①離螢幕定位（left:-9999）不能寫在交給 html2pdf 的元素上——會被 clone 進 overlay 截到空白 → 包殼藏、把乾淨 .icroot 交出去 ②mm→px 進位會多一頁空白尾巴 → .side 高度 `calc(105mm - 1px)` ③html2canvas 不是全域（bundle 內部），debug 用 `html2pdf().from().toCanvas().get('canvas')`。驗證：preview 真流程 4 秒完成、攔 outputPdf 驗 **2 頁/282KB/MediaBox 841.89×297.64pt** ✓。另本機 headless Chrome 產的兩份樣品 PDF（Kiama AA 黃/Danche v2 玫瑰）已交老闆；雷達 viewBox 加寬修 Aftertaste 裁切（33a7ab2）。**遺留**：Tools 有兩個同名磁貼——舊「Info card · IG asset · classic」vs 新「Info cards · foldable print card」，老闆點錯過，待拍板要不要改名舊的
- **摺疊卡版型定稿 v2（老闆嫌 A4×4 亂、口述新四面配置）**（new/index.html，同 session 第十七件）：四面＝**封面（logo/Ratio Coffee/Specialty Coffee Lab/豆名）｜內左 The coffee（Origin/Variety/Altitude/Process/Roasted 表格——生豆查法同 cardDataFor 的 ilike+process 配對）｜內右 Tasting notes（風味三詞 17pt 豆色＋comment＋雷達 50mm）｜背面 QR（?bean= 豆頁）＋聯絡**。沖煮參數退出卡面（藏在 QR 後的豆頁）——openInfoCardPrint 的 brew 解析整段移除。驗證：preview 攔 html2pdf 收 HTML 逐項比對 11 項全過 ✓。**已交付老闆四張定稿 PDF**（Kiama AA 黃/Danche v2 藍/Danche v3 深藍/El Vergel 玫瑰——El Ver 卡面用正名 El Vergel＋掛 El Vergel 的產區資料；Danche v2/v3 色是我配的，rtl_dot 沒這兩鍵）；本機產生器 gen_fold2.py 在 scratchpad。⚠ A4×4 版（gen_a4.py）老闆棄用
- **Info cards 最終定稿＝A4 雙面裁 4 卡（老闆再改：摺疊版破圖棄用，全欄位明細＋Chrome 實檢）**（new/index.html，同 session 第十八件）：每卡 148.5×105 **不摺**，同卡 ×4 田字格：**正面**＝品牌列＋豆名＋處理法＋風味三詞（豆色）＋comment＋雷達 46mm；**反面**＝The coffee 全欄位表（**Origin/Station 處理廠/Variety/Altitude/Process/Harvest 產季/Roasted/Sourced via 生豆商**——beans 查詢補 station,harvest,supplier）＋QR＋聯絡。app openInfoCardPrint 同步（jsPDF [297,210]、.page/.cell 幾何、頁高-1px cell 高-.5px 防幽靈頁）；抽屜/磁貼文案更新。**已交付四支豆 A4 PDF**（gen_a4v2.py 產、headless Chrome 轉、**老闆 Chrome 分頁實開逐頁 zoom 檢查無破圖**——上輪摺疊版的破圖疑因老闆檢視器，未復現）。列印口訣：A4 雙面短邊翻＋沿虛線裁十字
- **追修（老闆真機 app 下載「完全破圖」，Chrome 全流程重現診斷）**：老闆 Chrome 實走 Tools→Info cards→下載→開 PDF——**根因①：html2canvas 不畫行內 SVG**（雷達整個消失、正面右側空洞）→ 新 `printRadarPNG(sc,color)` canvas 4× 超取樣畫成 PNG 嵌 <img>（printRadarSVG 保留但印刷卡不再用）；**根因②：scale 3.3 兩頁疊一張 canvas 19.4MP 爆 iPhone 16.7MP 上限**（真機全白）→ 降 2.6（12MP，~250dpi）。驗證：preview 攔 html2pdf——radar PNG ×4 非空、無行內 SVG、scale 2.6 ✓。**另見 Info cards 清單曝出 El Ver／El Verge／El Vergel 三胞胎（backfill 打字產物）＋Danche v1 等——等老闆拍板清重複**
- **Info cards 真·定稿＝A4 雙面 2 張摺疊卡（老闆問「封面在哪」→ 紙張幾何二選一拍板）**（new/index.html，同 session 第十九件）：4-up 不摺版的封面被壓縮成品牌小列，老闆要完整封面 → **A4 上下兩條 297×105、裁一刀各自對摺**（一張 A4 得 2 卡）。第 1 頁條＝〔QR 背面｜封面〕、第 2 頁條＝〔The coffee 全欄位詳情｜Tasting notes＋雷達 PNG 50mm〕；短邊翻對位已推導（條的 y 保持、背面左半落在封面背後＝內左詳情 ✓）。app openInfoCardPrint 改 outerStrip/innerStrip ×2；抽屜/磁貼文案「A4 · 2 fold cards」。已交四支豆 A4 PDF（gen_a4fold.py，Chrome 實檢封面回歸）。⚠ 版型歷程：摺疊單卡→A4×4 不摺→**A4×2 摺疊（現行）**——再改動先問老闆封面去留
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
