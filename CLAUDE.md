# Ratio App — Claude 開場須知

## 開場動作
1. 先讀 `ratio-session-handoff.md`（進度、待辦、陷阱都在裡面）
2. Session 結束前把新進度補回該檔案的「〇、補記」區

## 這是什麼
Ratio Coffee（雪梨烘豆生意）的內部管理 app。全部程式在**一個 `index.html`**（HTML+CSS+JS 全包，UI 文字一律英文、註解可中文）。

## 架構
- **前端**：`index.html` → push 到 GitHub（getratiocoffee/Ratio）→ Vercel 自動部署到 https://ratio-theta.vercel.app
- **後端**：Supabase `kjhudxzvidhynpabnalp`（Sydney）— 資料庫 + Edge Functions（send-email / sync-to-square / square-webhook）
- **金流**：Square（付款連結、商品目錄同步）

## 這台電腦的規矩
- **push 用 GitHub Desktop**（終端機沒有 GitHub 認證，`git push` 會失敗）→ commit 完請使用者開 GitHub Desktop 按 Push origin
- **沒裝 Node**。JS 語法檢查用：`osascript -l JavaScript`（抽出 `<script>` 區塊 `new Function` 檢查）— 每次改完 index.html 必跑
- **部署驗證**：`curl https://ratio-theta.vercel.app/?nocache=<rand>`，grep 新函式名 + 比對檔案大小
- JS 字串多用單引號包——英文字串裡**不要用撇號**（can't → cannot），曾因此炸過

## 程式碼慣例
- 核心模式：資料抓進記憶體（ORDERS/BEANS…）→ render 函式拼 HTML 字串 → innerHTML → 綁事件；改資料後重新 render
- 導覽入口：`DOCK_NODES` 樹 + `runModuleAction()`（找功能從這裡順藤摸瓜）
- 訂單狀態六態（大寫）：New/Confirmed/Roasting/Ready/Dispatched/Cancelled

## 使用者
程式新手，老闆本人。用繁體中文、講簡單、多用比喻；不確定就先問再動手。
