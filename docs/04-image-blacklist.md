# 圖片黑名單過濾系統

## 概述

圖片黑名單過濾系統用於防止爬蟲抓取和創建包含不適當或無效圖片的草稿。系統在兩個層級進行過濾：

1. **爬蟲層級** - 在 PTT Beauty 爬蟲中直接過濾黑名單圖片
2. **草稿生成層級** - 在創建草稿前再次檢查（雙重保險）

## 文件結構

```
src/lib/config/
  └── image-blacklist.ts         # 黑名單配置和過濾函數

src/lib/scrapers/
  ├── ptt-beauty-scraper.ts      # 爬蟲層級的過濾
  └── strategy-generator.ts      # 草稿生成層級的過濾

scripts/
  ├── test-blacklist-filter.ts   # 黑名單功能測試
  └── test-scraper-blacklist.ts  # 爬蟲場景測試
```

## 核心功能

### 1. 黑名單配置 (`image-blacklist.ts`)

#### 數據結構

```typescript
interface BlacklistEntry {
  url: string;      // 圖片 URL
  reason: string;   // 加入黑名單的原因
  addedAt: string;  // 添加日期
}
```

#### 主要函數

- `isImageBlacklisted(imageUrl: string): boolean`
  - 檢查單個圖片 URL 是否在黑名單中
  - 支持多種 URL 格式（含副檔名、查詢參數等）

- `hasBlacklistedImage(images: string[]): boolean`
  - 檢查圖片列表中是否包含黑名單圖片

- `filterBlacklistedImages(images: string[]): string[]`
  - 過濾掉黑名單中的圖片，返回乾淨的圖片列表

- `getBlacklistedImages(images: string[]): string[]`
  - 獲取圖片列表中所有黑名單圖片

- `getBlacklistReason(imageUrl: string): string | null`
  - 獲取圖片被列入黑名單的原因

### 2. URL 標準化

系統會自動標準化 URL 以確保匹配的準確性：

- 移除查詢參數 (`?abc=123`)
- 移除錨點 (`#anchor`)
- 移除副檔名 (`.jpg`, `.png`, etc.)
- 提取圖片 ID 進行匹配

**支持的 URL 格式：**
```
https://imgur.com/e8dN5uA
https://imgur.com/e8dN5uA.jpg
https://imgur.com/e8dN5uA.png
https://imgur.com/e8dN5uA?abc=123
https://i.imgur.com/e8dN5uA.jpg
```

以上所有格式都會被識別為相同的黑名單項目。

## 爬蟲整合

### PTT Beauty Scraper

修改內容：

1. **導入黑名單函數**
```typescript
import {
  filterBlacklistedImages,
  hasBlacklistedImage,
  getBlacklistedImages,
  getBlacklistReason,
} from '@/lib/config/image-blacklist';
```

2. **添加過濾計數**
```typescript
const filtered: Array<{ url: string; reason: string }> = [];
```

3. **圖片檢查邏輯**
```typescript
// 檢查圖片是否在黑名單中
const blacklistedImages = getBlacklistedImages(images);
if (blacklistedImages.length > 0) {
  const reason = getBlacklistReason(blacklistedImages[0]) || '圖片在黑名單中';
  filtered.push({
    url: pttUrl,
    reason: `黑名單圖片: ${blacklistedImages.join(', ')} - ${reason}`,
  });
  break; // 跳過該文章
}
```

4. **日誌輸出**
```typescript
console.log(`⊗ Filtered: ${article.title} - ${reason}`);
```

### Strategy Generator

在創建草稿前添加雙重檢查：

```typescript
// 檢查圖片是否在黑名單中（雙重保險）
const allImages = post.images && post.images.length > 0 ? post.images : [post.imageUrl];
const blacklistedImages = getBlacklistedImages(allImages);
if (blacklistedImages.length > 0) {
  const reason = getBlacklistReason(blacklistedImages[0]) || '圖片在黑名單中';
  console.log(`⊗ Skipped blacklisted: "${extractCleanTitle(post.title)}" - ${reason}`);
  return {
    strategyId: '',
    linkId: '',
    shortCode: '',
    shortUrl: '',
    isDuplicate: true,
  };
}
```

## API 修改

### Scrape Route (`/api/robots/ptt-beauty/scrape`)

添加過濾統計：

```typescript
const allFiltered: any[] = []; // 被黑名單過濾的文章

// 記錄被過濾的文章
if (scrapeResult.filtered && scrapeResult.filtered.length > 0) {
  allFiltered.push(...scrapeResult.filtered);
  console.log(`⊗ Filtered ${scrapeResult.filtered.length} articles with blacklisted images`);
}
```

統計輸出包含過濾數量：

```
📈 Final Statistics:
- Requested: 10
- Delivered: 8
- Total Scraped: 15
- Filtered (blacklist): 2
- Duplicates Skipped: 3
- Failed: 2
- Attempts: 2
```

## 如何添加新的黑名單項目

編輯 `src/lib/config/image-blacklist.ts`：

```typescript
export const IMAGE_BLACKLIST: BlacklistEntry[] = [
  {
    url: 'https://imgur.com/e8dN5uA',
    reason: '重複出現的無效圖片',
    addedAt: '2025-11-21',
  },
  // 添加新項目
  {
    url: 'https://imgur.com/xxxxx',
    reason: '不適當內容',
    addedAt: '2025-11-22',
  },
];
```

## 測試

### 1. 基礎功能測試

```bash
npx tsx scripts/test-blacklist-filter.ts
```

測試內容：
- URL 標準化
- 黑名單匹配
- 圖片過濾
- 原因獲取
- URL 變體識別

### 2. 爬蟲場景測試

```bash
npx tsx scripts/test-scraper-blacklist.ts
```

測試內容：
- 模擬真實爬蟲場景
- 驗證過濾邏輯
- 統計準確性

### 預期輸出

```
=== Testing PTT Beauty Scraper Blacklist Filter ===

總共 4 篇文章

處理文章: [正妹] 清新美女
  ✓ 通過檢查，無黑名單圖片

處理文章: [正妹] 性感女神
  ⊗ 過濾原因: 重複出現的無效圖片
  ⊗ 黑名單圖片: https://imgur.com/e8dN5uA

=== 處理結果統計 ===
總計: 4 篇
通過: 2 篇
過濾: 2 篇

✅ 測試通過！黑名單過濾功能正常運作
```

## 日誌符號說明

- `✓` - 成功處理
- `⊗` - 被黑名單過濾
- `⊘` - 重複項目（去重）
- `✗` - 失敗

## 未來改進

1. **數據庫支持** - 將黑名單存儲在數據庫中，支持動態管理
2. **管理界面** - 創建 UI 界面來管理黑名單
3. **正則表達式支持** - 支持使用正則表達式匹配圖片 URL
4. **白名單機制** - 添加白名單來排除某些誤判
5. **自動檢測** - 使用 AI 自動檢測不適當的圖片

## 技術細節

### 為什麼需要雙重過濾？

1. **爬蟲層級** - 儘早過濾，節省後續處理資源
2. **草稿生成層級** - 防止漏網之魚，確保絕對不會創建黑名單草稿

### URL 匹配策略

系統使用三重匹配策略：

1. **完整 URL 匹配** - 標準化後的完整 URL 比對
2. **包含關係匹配** - 檢查 URL 是否包含黑名單 URL
3. **ID 匹配** - 提取圖片 ID 進行比對（處理不同域名的情況）

這確保了不同格式的相同圖片都能被正確識別。

## 相關文檔

- [PTT Beauty Scraper](./03-ptt-scraper.md)
- [Strategy Generator](./strategy-generator.md)
- [Robot System](./robot-system.md)
