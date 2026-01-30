# 圖片黑名單系統 - 快速上手指南

## 快速開始

### 1. 立即使用（Web UI）

最簡單的方式，無需命令列操作：

1. 開啟瀏覽器訪問：`http://localhost:3000/admin/blacklist`
2. 系統自動掃描並顯示包含黑名單圖片的草稿
3. 確認要刪除的項目（預設全選）
4. 點擊「刪除選中的草稿」
5. 確認刪除

完成！

### 2. 使用 CLI 腳本

#### 預覽模式（推薦先執行）

```bash
npx tsx scripts/delete-blacklisted-drafts.ts --preview
```

這會顯示所有將被刪除的草稿，但不會實際刪除。

#### 執行刪除

```bash
npx tsx scripts/delete-blacklisted-drafts.ts --delete
```

系統會要求確認，輸入 `yes` 繼續。

## 當前黑名單

目前黑名單中的圖片：

- `https://imgur.com/e8dN5uA` （所有格式變體）

## 新增黑名單項目

編輯檔案：`src/lib/image-blacklist.ts`

```typescript
export const IMAGE_BLACKLIST: BlacklistEntry[] = [
  {
    id: 'imgur-e8dN5uA',
    pattern: 'e8dN5uA',
    description: '特定的 imgur 圖片 ID',
    addedAt: '2025-11-21',
  },
  // 👇 在這裡新增更多項目
  {
    id: 'imgur-YourNewID',
    pattern: 'YourNewID',
    description: '描述這張圖片',
    addedAt: '2025-11-22',
  },
];
```

## API 使用

### 預覽

```bash
curl http://localhost:3000/api/automation/drafts/filter-blacklist
```

### 刪除全部

```bash
curl -X POST http://localhost:3000/api/automation/drafts/filter-blacklist \
  -H "Content-Type: application/json" \
  -d '{"confirm": true}'
```

### 刪除指定草稿

```bash
curl -X POST http://localhost:3000/api/automation/drafts/filter-blacklist \
  -H "Content-Type: application/json" \
  -d '{"confirm": true, "draftIds": ["uuid1", "uuid2"]}'
```

## 常見問題

### Q: 刪除後能恢復嗎？
A: 無法恢復。建議先使用預覽模式確認。

### Q: 會刪除 scraped_items 記錄嗎？
A: 不會。scraped_items 記錄會保留，用於防止重複抓取。

### Q: 支援哪些圖片格式？
A: 目前主要支援 imgur 圖片。系統會自動識別所有 imgur URL 變體。

### Q: 如何確認刪除成功？
A:
- Web UI 會顯示刪除結果
- CLI 腳本會輸出詳細日誌
- API 回應包含成功/失敗統計

## 安全提示

1. **先預覽後刪除**：務必先執行預覽模式
2. **確認草稿內容**：在 Web UI 中可以點擊預覽草稿
3. **備份重要資料**：大量刪除前考慮備份
4. **測試環境驗證**：先在測試環境測試新的黑名單規則

## 完整文檔

詳細說明請參考：[IMAGE_BLACKLIST.md](./IMAGE_BLACKLIST.md)

## 疑難排解

### 腳本執行錯誤

檢查環境變數是否設置：
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
```

### 找不到草稿

可能原因：
1. 所有草稿都是乾淨的（很好！）
2. 黑名單 pattern 設置錯誤
3. 草稿的圖片 URL 格式不符合

### Web UI 無法訪問

確認：
1. 開發伺服器是否運行：`npm run dev`
2. 路徑是否正確：`/admin/blacklist`
3. 瀏覽器控制台是否有錯誤

## 快速參考

| 操作 | 命令/路徑 |
|------|----------|
| Web UI 管理 | `/admin/blacklist` |
| CLI 預覽 | `npx tsx scripts/delete-blacklisted-drafts.ts --preview` |
| CLI 刪除 | `npx tsx scripts/delete-blacklisted-drafts.ts --delete` |
| API 預覽 | `GET /api/automation/drafts/filter-blacklist` |
| API 刪除 | `POST /api/automation/drafts/filter-blacklist` |
| 編輯黑名單 | `src/lib/image-blacklist.ts` |
| 運行測試 | `npm test -- image-blacklist.test.ts` |
