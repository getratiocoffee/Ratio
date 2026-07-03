# Ratio Commerce — 開始指南

## 準備工作（只做一次）
把 `ratio-commerce-plan.md` 上傳到這個 Claude Project 的 Knowledge。
上傳後每次開新對話 Claude 都會自動讀取，不需要重新解釋。

---

## 每個 Phase 的開場白

### Phase 1 — Order Module
> 訂單管理、調貨通知、銀行轉帳確認
```
我要開始 Ratio Commerce Phase 1 — Order Module。
請先從 GitHub 抓最新的 index.html：
https://raw.githubusercontent.com/getratiocoffee/Ratio/main/index.html
```

### Phase 2 — Square Sync
> 豆子自動上架 Square、接收訂單
```
我要開始 Ratio Commerce Phase 2 — Square Sync。
Phase 1 已完成。
請先從 GitHub 抓最新的 index.html：
https://raw.githubusercontent.com/getratiocoffee/Ratio/main/index.html
我的 Square API Key 是：[貼上]
```

### Phase 3 — Email & Notifications
> 所有自動 email、通知、售後服務、沖煮參數
```
我要開始 Ratio Commerce Phase 3 — Email & Notifications。
Phase 1 + 2 已完成。
請先從 GitHub 抓最新的 index.html：
https://raw.githubusercontent.com/getratiocoffee/Ratio/main/index.html
我的 Email 服務 API Key 是：[貼上]
```

### Phase 4 — Instagram Shop
> 豆子自動同步到 Instagram Shop
```
我要開始 Ratio Commerce Phase 4 — Instagram Shop Sync。
Phase 1–3 已完成。
請先從 GitHub 抓最新的 index.html：
https://raw.githubusercontent.com/getratiocoffee/Ratio/main/index.html
我的 Meta API Key 是：[貼上]
```

### Phase 5 — Subscription Module
> 訂閱制、自動建單、週期管理
```
我要開始 Ratio Commerce Phase 5 — Subscription Module。
Phase 1–4 已完成。
請先從 GitHub 抓最新的 index.html：
https://raw.githubusercontent.com/getratiocoffee/Ratio/main/index.html
```

### Phase 6 — Roast & Inventory Integration
> 訂單連動烘豆排程、庫存自動扣減、庫存警訊
```
我要開始 Ratio Commerce Phase 6 — Roast & Inventory Integration。
Phase 1–5 已完成。
請先從 GitHub 抓最新的 index.html：
https://raw.githubusercontent.com/getratiocoffee/Ratio/main/index.html
```

---

## 每個 Phase 完成後

1. 下載 Claude 給你的 `index.html`
2. 上傳到 GitHub（Vercel 自動部署）
3. 用 `?nocache=xxx` 測試新版
4. 確認沒問題 → 開下一個 Phase 的新對話

---

## 注意事項

- 每個 Phase **開新對話**，不要在同一個對話裡做多個 Phase
- Square / Meta / Email 的 API Key **不要貼在公開地方**，只貼在 Claude 對話裡
- Phase 2 開始前需要準備：Square Developer 帳號 + API Key
- Phase 3 開始前需要準備：Email 服務帳號（建議用 Resend，免費額度夠用）
- Phase 4 開始前需要準備：Meta Business 帳號 + Commerce 設定完成

