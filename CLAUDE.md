# Ratio App — Claude 開場須知

## 開場動作
1. 先讀 `ratio-session-handoff.md`（進度、待辦、陷阱都在裡面；頂部「⚡ 當前狀態速覽」先看）
2. Session 結束前把新進度補回該檔案的「〇、補記」區

## 這是什麼
Ratio Coffee（雪梨烘豆生意）的內部管理系統。**單一 app**＝**新殼 `new/index.html`**（一個單檔 HTML+CSS+JS 全包，UI 文字一律英文、註解可中文）→ `/new/`，根 `/` 也由它接管（vercel.json rewrite；?shop/?bean/?fb 公開頁全在新殼）：手機優先 PWA。今日流卡片＋QC 拇指台＋Tools；生產線全鏈：收生豆→烘→杯測→QC→鎖風味→上架 Square→接單→出貨→收款；後勤（財務/發票/群發/配方/通訊錄/開帳號/文件）全在 Tools 磁貼。
**classic.html 已於 2026-07-12 整檔刪除**（缺口清單 12 項全數移植或收掉）——查它的舊實作用 `git show 786f556:classic.html`。

## 架構
- **前端**：push 到 GitHub（getratiocoffee/Ratio）→ Vercel 自動部署到 https://ratio-theta.vercel.app
- **後端**：Supabase `kjhudxzvidhynpabnalp`（Sydney）— 資料庫＋Edge Functions ×7（send-email / sync-to-square / square-webhook / public-shop / public-bean / push-send / morning-brief——版本號與細節見交接檔速覽）
- **自動化**：pg_cron 每天雪梨 6:30 打 morning-brief 推播晨報（金鑰在 secrets_kv 'cron_key'）；Web Push 新單/收款即時叮
- **金流**：Square（付款連結、商品目錄同步、網店 ?shop）

## 這台電腦的規矩
- **push 用 GitHub Desktop**（終端機沒有 GitHub 認證，`git push` 會失敗）→ commit 完請使用者開 GitHub Desktop 按 Push origin
- **沒裝 Node**。JS 語法檢查用：`osascript -l JavaScript`（抽出 `<script>` 區塊 `new Function` 檢查）— 每次改完任一 index.html 必跑
- **本機預覽**：launch.json 的 ruby 靜態伺服器指向 scratchpad/serve 複本——**改完檔案要 cp 過去**才會生效；8124 被佔用時用 ratio-static-2（8125）
- **部署驗證**：`curl https://ratio-theta.vercel.app/new/?nocache=<rand>` 比對 bytes＋grep 新函式名
- JS 字串多用單引號包——英文字串裡**不要用撇號**（can't → cannot），曾因此炸過
- Chrome MCP 可開 ratio-theta（老闆登入態可代跑驗證）

## 程式碼慣例
- 核心模式：資料抓進記憶體（`loadAll()`→`DB.*`→`buildItems()`）→ render 拼 HTML 字串 → innerHTML → 綁事件；改資料後重新 render
- **加功能的路數**：今日流卡＝buildItems push {id,st,kind,ref…}＋runAction 分派；工具＝Tools 磁貼（data-t 名字制）＋openXxxSheet 抽屜；寫入規則多半承自 classic 對應函式（交接檔各補記註明抄了哪個；classic 舊碼從 git 歷史撈）
- 訂單狀態六態（大寫）：New/Confirmed/Roasting/Ready/Dispatched/Cancelled
- 跨裝置的小狀態（貪睡/價格記憶/卡片顏色）放 `app_state` 表，不放 localStorage（PWA 與 Safari 分家）

## 使用者
程式新手，老闆本人。講簡單、多用比喻；不確定就先問再動手。連續「繼續」＝授權自選下一個可自主項目、一輪一交付。

## ⚠ 語言（最高優先·硬規定，絕不可違反）
**全程只准用繁體中文，永遠不要用任何其他語言（含日文/英文）回覆。連思考（reasoning/thinking）也一律用繁體中文**——老闆看得到思考過程，要用中文才知道我在做什麼。每次回覆＋每段思考開頭先確認自己是中文（曾多次用日文回覆被糾正）。UI 文字仍照舊一律英文，這條只管「跟老闆的對話與思考」。
