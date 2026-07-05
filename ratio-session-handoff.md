# Ratio 開發交接 — 2026-07-05 Session

## 一、本次完成

### 1. 杯測表單 Roast date
- `samples` 新欄位 `roast_date`（migration 已套用）
- Start Analyse：Cupping date 鎖定當天、Roast date 可填（單品自動帶該筆烘焙日、blend 帶同名最新烘焙）
- Edit 表單也可修 roast date；`roastDateForSample()` 優先讀樣品快照

### 2. Pending 雙檢視
- 頂部 tab：Roasted date（預設）/ Cupping date
- Cupping 檢視：Ratio Coffee 杯測紀錄依 cupping_date 分抽屜（卡片含 Re-analyse + Retail 控制）
- Roasted 檢視：有 roast_date 的杯測紀錄（無 roasts 列的 blend）也併入對應日期抽屜；抽屜 Single/Blend 分頁自動切到有內容那頁；頂部 blend 區排除已有烘焙日期者
- 共用 `rtSampleCard()` / `wireRtSampleCards()`

### 3. 資料清理
- 刪 5 筆殘留：Dancer×2、Dreamer、Dark Knight Testing、Dark Knight 無日期重複（舊版表單日期混淆產物）
- `product_sync.bean_id`「Dark Knight Testing」→「Dark Knight」（cascade 漏掉這筆，手動修）
- 目前 samples 乾淨：7 筆，cupping/roast date 都正確

### 4. Square 商品圖卡 v3 定稿（規格在記憶 #14）
- 卡身 766px（CX=217）、上下 64、圓角 28、外框 3px
- 文字安全區中央 650px（TSX=275）— 手機直式框裁左右各 ~200px，文字絕不可超出
- Header/Content/Footer 內容左緣對齊 TSX；Footer 水滴+風味靠左起排
- Content 整張卡統一字級（先掃全行取最小 fit，全行同級）
- 豆/水滴 icon base64 內嵌（CARD_ICON_BEAN/CARD_ICON_DROP）canvas source-in 染色

### 5. sync-to-square v11
- `ratio_ref` STRING custom attribute：每次推送寫入 sample_id；認領商品優先用 ratio_ref 比對（改名不斷鏈）
- 推送後自動刪舊「… card」圖（手動上傳照片不動）
- 新增 `delete_object` action（Director 限定，raw catalog object id）
- Aroma/Acidity 測試定義：Dashboard 手建，API 無權刪 → Daniel 已在 Dashboard 刪除 ✓

### 6. 已上架狀態
- Alo Village + Dark Knight 已用 v3 圖卡 Re-sync（linked 模式、ratio_ref 在位）
- 注意：最後一次推送是「字級統一」版之前 — **部署最新 index.html 後要再 Re-sync 兩支一次**

## 二、關鍵陷阱（新增）

1. **手機商品頁直式框裁左右各 ~200px**（比桌面 150px 更兇）— 圖卡文字必須在中央 650px 內；色帶滿版出血 OK
2. **圖卡是靜態 PNG** — 改 makeSquareCard 後必須 Re-sync 才會換圖（v11 會自動清舊圖）
3. **Dashboard 手建的 custom attribute 定義 API 刪不掉**（權限屬 Square 內部 app）
4. 從瀏覽器 console 直接推送的 pattern：`window.__pushCard(name, grams, price)` — 組 cardData + makeSquareCard + callSquareFn push（繞過 UI 的 price prompt）；記得先 loadRoasts + ensureBeansForInvoice + blendsPull
5. Pending 日期抽屜資料源 = roasts.roast_date + samples.roast_date（無對應 roasts 列時）；blend 定義本身無日期 → 留頂部區塊

## 三、待辦（記憶 #13，Phase 4 前一波做）

1. beans 沖煮參數欄位 brew_temp/brew_ratio/grind_size/brew_method/flavour_desc + Retail Info UI → 完整商品描述
2. Square 磨豆選項 Modifier（Whole Bean/Filter/Espresso）— 動 sync-to-square
3. Square 多規格 Variations（250g/500g/1kg）— 動 sync-to-square，跟 1、2 一波
4. 出貨通知信（Dispatched 觸發，含沖煮參數+烘焙日期）
5. 新豆上架通知 + 回購提醒（可延後）
6. Square token 輪替（曾貼在對話）

**資料補齊（隨時）：** 7 筆杯測 comment、April/May/June Project blend note、4 支上架（Dancer/Dreamer/April/May/June Project）、Dancer 烘焙日 15/06 待確認

## 四、基礎設施速查
- Supabase kjhudxzvidhynpabnalp（Sydney）；Edge Functions：sync-to-square **v11** / square-webhook v8 / send-email v2
- samples 新欄位：roast_date（date）
- Square item ids：Alo Village=CFGKRBQ5EAWGB5UAUV35NOP5、Dark Knight=JZVP5ICULJ7TQJGL7VWW6XE2；ratio_ref 定義=MV5EOCK2W3XXFQPHILKQWKOQ
- 開場模板：先抓 https://raw.githubusercontent.com/getratiocoffee/Ratio/main/index.html + 讀本檔
