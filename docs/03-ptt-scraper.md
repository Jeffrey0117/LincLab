# PTT 爬蟲 API 系統使用指南

## 概述

這是一個完整的 PTT 表特版爬蟲系統，可以自動抓取熱門文章、提取圖片，並生成行銷策略和短連結。

## 系統架構

```
┌─────────────────────┐
│   前端 UI           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   API 端點          │
│  /api/robots/*      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   爬蟲核心邏輯      │
│  ptt-beauty-scraper │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   策略生成器        │
│  strategy-generator │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   資料庫 (Supabase) │
│  - robot_configs    │
│  - execution_logs   │
│  - scraped_items    │
└─────────────────────┘
```

## 核心檔案

### 1. 爬蟲核心 (`src/lib/scrapers/ptt-beauty-scraper.ts`)

**功能**：
- 抓取 PTT 表特版文章列表
- 解析文章內容和圖片
- 過濾條件：推文數、圖片數量
- 錯誤處理和重試機制
- 尊重 PTT 服務條款（延遲請求）

**主要函數**：
```typescript
scrapePTTBeauty(options: ScrapeOptions): Promise<ScrapeResult>
```

**使用範例**：
```typescript
import { scrapePTTBeauty } from '@/lib/scrapers/ptt-beauty-scraper';

const result = await scrapePTTBeauty({
  count: 10,           // 抓取 10 篇文章
  minPushCount: 50,    // 至少 50 推
  maxRetries: 3,       // 失敗重試 3 次
});

console.log(`成功: ${result.success.length}`);
console.log(`失敗: ${result.failed.length}`);
```

### 2. 策略生成器 (`src/lib/scrapers/strategy-generator.ts`)

**功能**：
- 根據 PTT 文章生成短連結
- 自動生成吸引人的貼文文案
- 創建 automation_strategy 記錄
- 批次處理支援

**主要函數**：
```typescript
generateStrategyFromPost(options: GenerateStrategyOptions): Promise<GeneratedStrategy>
batchGenerateStrategies(posts, userId, affiliateUrl, category): Promise<Result>
```

**生成的文案格式**：
```
🔥 這個女生真的太正了！

[正妹] 超甜美的鄰家女孩

更多精選圖片點這裡 👆

👉 https://your-link.com/abc123

#正妹 #表特 #美女 #PTT
```

### 3. 資料庫 Schema (`supabase/migrations/20251113000003_create_robot_system.sql`)

**主要表格**：

1. `robot_configs` - 機器人配置
   - 機器人類型、分類
   - 執行設定（抓取數量、延遲時間）
   - 權限管理
   - 統計資料

2. `robot_execution_logs` - 執行記錄
   - 執行狀態追蹤
   - 進度百分比
   - 成功/失敗數量
   - 創建的策略 ID 列表

3. `scraped_items` - 抓取項目
   - 去重機制（source_hash）
   - 原始資料保存
   - 處理狀態追蹤

4. `content_generation_templates` - 文案模板
   - 支援變數替換
   - 條件式使用
   - 優先級排序

### 4. TypeScript 類型 (`src/lib/robot-types.ts`)

**核心類型**：
- `RobotConfig` - 機器人配置
- `RobotExecutionLog` - 執行記錄
- `ScrapedItem` - 抓取項目
- `ExecutionStatus` - 執行狀態枚舉
- 以及各種 API 請求/回應類型

## API 端點

### 1. 執行爬蟲

```http
POST /api/robots/ptt-beauty/scrape
```

**請求 Body**：
```json
{
  "count": 10,
  "minPushCount": 50,
  "affiliateUrl": "https://shopee.tw/...",
  "maxRetries": 3,
  "category": "beauty"
}
```

**回應**：
```json
{
  "executionLogId": "uuid-here",
  "status": "started",
  "message": "爬蟲已開始執行，請查詢執行狀態以獲取結果"
}
```

**注意事項**：
- 由於 Vercel 有 10 秒 timeout 限制，爬蟲會在背景執行
- 立即返回 202 Accepted 狀態
- 需要輪詢狀態查詢端點來獲取結果

### 2. 查詢執行狀態

```http
GET /api/robots/execution/{logId}
```

**回應**：
```json
{
  "id": "uuid",
  "status": "running",
  "progress": {
    "current": 5,
    "total": 10,
    "percentage": 50
  },
  "current_step": "生成策略 5/10",
  "started_at": "2025-11-13T10:00:00Z",
  "robot": {
    "id": "uuid",
    "name": "PTT 表特版爬蟲",
    "robot_type": "ptt_beauty"
  }
}
```

**完成時的回應**：
```json
{
  "id": "uuid",
  "status": "completed",
  "progress": {
    "current": 10,
    "total": 10,
    "percentage": 100
  },
  "result": {
    "successCount": 8,
    "failedCount": 2,
    "createdStrategyIds": ["uuid1", "uuid2", ...],
    "createdLinkIds": ["uuid1", "uuid2", ...],
    "errors": [
      "https://ptt.cc/...: No images found"
    ],
    "totalTime": 45
  },
  "started_at": "2025-11-13T10:00:00Z",
  "completed_at": "2025-11-13T10:00:45Z"
}
```

### 3. 取消執行

```http
DELETE /api/robots/execution/{logId}
```

**回應**：
```json
{
  "success": true,
  "message": "Execution cancelled successfully"
}
```

### 4. 獲取執行歷史

```http
GET /api/robots/execution?robot_type=ptt_beauty&limit=20&offset=0
```

**查詢參數**：
- `robot_id` - 機器人 ID
- `robot_type` - 機器人類型
- `status` - 執行狀態
- `limit` - 每頁數量（預設 20）
- `offset` - 偏移量（預設 0）

**回應**：
```json
{
  "logs": [
    {
      "id": "uuid",
      "status": "completed",
      "success_count": 8,
      "failed_count": 2,
      "created_at": "2025-11-13T10:00:00Z",
      "robot_config": {
        "id": "uuid",
        "name": "PTT 表特版爬蟲",
        "robot_type": "ptt_beauty",
        "icon": "😍"
      }
    }
  ],
  "count": 50,
  "hasMore": true
}
```

### 5. 獲取機器人列表

```http
GET /api/robots/configs?category=beauty&is_active=true
```

**查詢參數**：
- `robot_type` - 機器人類型
- `category` - 分類
- `is_active` - 是否啟用
- `is_beta` - 是否為測試版

**回應**：
```json
{
  "robots": [
    {
      "id": "uuid",
      "name": "PTT 表特版爬蟲",
      "robot_type": "ptt_beauty",
      "description": "自動抓取 PTT 表特版熱門文章...",
      "icon": "😍",
      "category": "beauty",
      "total_executions": 150,
      "total_cards_created": 1200,
      "is_beta": false
    }
  ],
  "count": 1,
  "categories": [
    { "category": "beauty", "count": 1 }
  ]
}
```

## 使用流程

### 前端整合範例

```typescript
// 1. 開始執行爬蟲
async function startScraper() {
  const response = await fetch('/api/robots/ptt-beauty/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      count: 10,
      minPushCount: 50,
      affiliateUrl: 'https://shopee.tw/...',
    }),
  });

  const data = await response.json();
  const logId = data.executionLogId;

  // 2. 輪詢狀態
  pollExecutionStatus(logId);
}

// 輪詢執行狀態
async function pollExecutionStatus(logId: string) {
  const intervalId = setInterval(async () => {
    const response = await fetch(`/api/robots/execution/${logId}`);
    const data = await response.json();

    console.log(`進度: ${data.progress.percentage}%`);
    console.log(`步驟: ${data.current_step}`);

    // 檢查是否完成
    if (['completed', 'failed', 'partial'].includes(data.status)) {
      clearInterval(intervalId);

      if (data.status === 'completed') {
        console.log('✅ 爬蟲完成！');
        console.log(`成功創建 ${data.result.successCount} 個策略`);
        console.log('策略 IDs:', data.result.createdStrategyIds);
      } else {
        console.log('❌ 爬蟲失敗');
        console.log('錯誤:', data.result.errors);
      }
    }
  }, 2000); // 每 2 秒查詢一次
}
```

## 配置說明

### 環境變數

確保設定以下環境變數：

```env
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### PTT 爬蟲配置

預設配置在資料庫中：

```json
{
  "board": "Beauty",
  "baseUrl": "https://www.ptt.cc/bbs/Beauty/index.html",
  "minPushCount": 10,
  "filterKeywords": ["[公告]", "[協尋]", "[神人]"],
  "maxPages": 3,
  "cookieOver18": "1"
}
```

## 注意事項

### 1. 尊重 PTT 服務條款

- ✅ 已實作請求延遲（1-2 秒）
- ✅ 設定適當的 User-Agent
- ✅ 包含 over18 cookie
- ⚠️ 不要過於頻繁執行
- ⚠️ 建議設定每日執行次數限制

### 2. 錯誤處理

爬蟲會自動處理以下錯誤：
- 網路連線失敗（自動重試）
- 圖片無效（跳過該文章）
- 解析錯誤（記錄並繼續）
- 資料庫錯誤（回滾事務）

### 3. 效能考量

- 並行處理限制：3 個文章同時處理
- 批次間延遲：2 秒
- 單次最大抓取：50 篇文章
- 建議：count <= 20 以確保在合理時間內完成

### 4. Vercel 部署限制

由於 Vercel Serverless Functions 有 10 秒 timeout：

**解決方案**：
1. ✅ 已實作背景執行（不等待完成）
2. ✅ 立即返回 202 Accepted
3. ✅ 提供狀態查詢端點

**未來改進**：
- 考慮使用 Vercel Edge Functions
- 或使用 Queue 系統（如 Inngest, QStash）
- 或遷移到 long-running 伺服器

## 資料庫遷移

執行遷移來創建必要的表格：

```bash
# 如果使用 Supabase CLI
supabase db push

# 或手動執行 SQL
# 檔案位置: supabase/migrations/20251113000003_create_robot_system.sql
```

## 測試

### 測試單一文章抓取

```typescript
import { testSingleArticle } from '@/lib/scrapers/ptt-beauty-scraper';

const result = await testSingleArticle(
  'https://www.ptt.cc/bbs/Beauty/M.1234567890.A.123.html'
);

console.log('找到圖片:', result?.images);
```

### 測試策略生成

```typescript
import { generateStrategyFromPost } from '@/lib/scrapers/strategy-generator';

const strategy = await generateStrategyFromPost({
  post: {
    title: '[正妹] 測試標題',
    author: 'testuser',
    date: '2025-11-13',
    url: 'https://ptt.cc/...',
    images: ['https://i.imgur.com/abc123.jpg'],
    pushCount: 100,
  },
  userId: 'user-uuid',
  affiliateUrl: 'https://shopee.tw/...',
});

console.log('策略 ID:', strategy.strategyId);
console.log('短代碼:', strategy.shortCode);
console.log('文案:', strategy.postContent);
```

## 常見問題

### Q: 為什麼有些文章抓取失敗？

A: 可能原因：
1. 文章沒有圖片
2. 圖片連結已失效
3. 網路連線問題
4. PTT 伺服器暫時無法連線

### Q: 如何自訂文案模板？

A: 在 `content_generation_templates` 表中新增模板，或修改 `strategy-generator.ts` 中的模板陣列。

### Q: 可以爬取其他看板嗎？

A: 可以！只需要：
1. 複製 `ptt-beauty-scraper.ts`
2. 修改 `PTT_BEAUTY_BOARD` 常數
3. 調整解析邏輯（如果需要）
4. 在 `robot_configs` 中新增配置

### Q: 如何防止重複抓取？

A: 系統使用 `source_hash` 欄位來防止重複。相同的文章只會被處理一次。

## 授權與免責聲明

本爬蟲僅供學習和研究使用。使用者需自行負責遵守 PTT 的使用條款和相關法律規定。

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 更新日誌

### 2025-11-13
- ✅ 初始版本完成
- ✅ PTT 表特版爬蟲
- ✅ 策略生成器
- ✅ API 端點
- ✅ 資料庫 Schema
- ✅ TypeScript 類型定義
