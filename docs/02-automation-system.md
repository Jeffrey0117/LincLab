# 自動化發文助手系統 - 完整文件

## 概述

自動化發文助手系統是一個完整的內容管理和發文輔助系統，幫助用戶快速創建、管理和追蹤社群媒體發文策略。

## 系統架構

### 資料庫設計

#### 1. `automation_strategies` - 策略模板表
儲存所有發文策略模板，包括：
- 基本資訊（名稱、描述、分類、圖示）
- 內容設定（預設文案、關聯短連結）
- 狀態控制（啟用/停用、公開/私有）
- 統計數據（使用次數、點擊次數）
- 權限管理（創建者、允許使用者列表）

#### 2. `strategy_variants` - 文案變體表
支援 A/B Testing 的文案變體功能：
- 同一策略的不同文案版本
- 追蹤每個變體的使用統計
- 自動記錄最後使用時間

#### 3. `strategy_usage_logs` - 使用記錄表
詳細記錄每次使用情況：
- 使用者、策略、變體資訊
- 操作類型（複製文案/連結、標記為已使用）
- 元資料（IP、User Agent）

### Row Level Security (RLS)

系統實作完整的權限控制：

**策略讀取權限**：
- 可以看到公開的策略
- 可以看到自己創建的策略
- 可以看到被允許使用的策略

**策略修改權限**：
- 只有創建者可以修改/刪除策略

**使用記錄權限**：
- 只能查看自己的使用記錄
- 只能創建自己的使用記錄

### 自動觸發器

系統包含以下自動化功能：

1. **更新時間戳**：自動更新 `updated_at` 欄位
2. **統計更新**：使用記錄新增時自動更新策略和變體的統計數據

### 資料庫函數

提供兩個實用函數：

1. **`get_popular_strategies(days_back, limit_count)`**
   - 取得最近 N 天的熱門策略
   - 參數：
     - `days_back`: 往前追溯天數（預設 30）
     - `limit_count`: 回傳數量（預設 10）

2. **`get_user_favorite_strategies(target_user_id, limit_count)`**
   - 取得用戶最常使用的策略
   - 參數：
     - `target_user_id`: 目標用戶 ID
     - `limit_count`: 回傳數量（預設 5）

## API 端點

### 策略管理

#### `GET /api/automation/strategies`
獲取所有可用策略

**查詢參數**：
```typescript
{
  category?: 'beauty' | 'discount' | 'food' | '3c' | 'travel' | 'game' | 'fashion' | 'other',
  is_active?: boolean,
  is_public?: boolean,
  search?: string,
  tags?: string, // 逗號分隔
  sort_by?: 'created_at' | 'updated_at' | 'total_uses' | 'name',
  sort_order?: 'asc' | 'desc',
  limit?: number,
  offset?: number,
  include_link?: boolean
}
```

**回應**：
```typescript
{
  strategies: AutomationStrategy[],
  count: number
}
```

#### `POST /api/automation/strategies`
創建新策略（需要登入）

**請求 Body**：
```typescript
{
  name: string,
  description?: string,
  category?: StrategyCategory,
  icon?: string,
  post_content: string,
  short_link_id?: string,
  is_public?: boolean,
  allowed_users?: string[],
  tags?: string[],
  metadata?: Record<string, any>
}
```

**回應**：
```typescript
{
  strategy: AutomationStrategy
}
```

#### `GET /api/automation/strategies/[id]`
獲取單一策略詳情

**查詢參數**：
```typescript
{
  include_link?: boolean,
  include_variants?: boolean
}
```

**回應**：
```typescript
{
  strategy: AutomationStrategy,
  variants?: StrategyVariant[]
}
```

#### `PATCH /api/automation/strategies/[id]`
更新策略（僅創建者）

**請求 Body**：
```typescript
{
  name?: string,
  description?: string,
  category?: StrategyCategory,
  icon?: string,
  post_content?: string,
  short_link_id?: string,
  is_active?: boolean,
  is_public?: boolean,
  allowed_users?: string[],
  tags?: string[],
  metadata?: Record<string, any>
}
```

#### `DELETE /api/automation/strategies/[id]`
刪除策略（僅創建者）

**回應**：
```typescript
{
  success: boolean,
  message: string
}
```

#### `POST /api/automation/strategies/[id]/use`
記錄策略使用

**請求 Body**：
```typescript
{
  variant_id?: string,
  copied_content?: boolean,
  copied_link?: boolean,
  marked_as_used?: boolean,
  metadata?: Record<string, any>
}
```

**回應**：
```typescript
{
  success: boolean,
  usage_log: StrategyUsageLog,
  message: string
}
```

### 使用歷史

#### `GET /api/automation/history`
獲取當前用戶的使用歷史

**查詢參數**：
```typescript
{
  strategy_id?: string,
  start_date?: string,
  end_date?: string,
  limit?: number,
  offset?: number,
  stats?: boolean // 是否包含統計資料
}
```

**回應**：
```typescript
{
  history: StrategyUsageLogWithStrategy[],
  count: number,
  stats?: UserUsageStats
}
```

## 客戶端 API 使用

系統提供了完整的客戶端 API 函數庫（`src/lib/automation-api.ts`）：

### 基本使用

```typescript
import {
  getStrategies,
  getStrategy,
  createStrategy,
  updateStrategy,
  deleteStrategy,
  recordStrategyUsage,
  getUsageHistory,
} from '@/lib/automation-api';

// 獲取所有正妹分類的策略
const { strategies } = await getStrategies({
  category: 'beauty',
  is_active: true,
  limit: 10
});

// 獲取單一策略（包含短連結資訊）
const { strategy } = await getStrategy('strategy-id', {
  include_link: true,
  include_variants: true
});

// 記錄使用
await recordStrategyUsage('strategy-id', {
  copied_content: true
});

// 獲取使用歷史（包含統計）
const { history, stats } = await getUsageHistory({
  stats: true,
  limit: 20
});
```

### 便利函數

```typescript
import {
  copyContentAndRecord,
  copyLinkAndRecord,
  markStrategyAsUsed,
  formatPostContent,
} from '@/lib/automation-api';

// 複製文案並自動記錄
await copyContentAndRecord('strategy-id', postContent);

// 複製連結並自動記錄
await copyLinkAndRecord('strategy-id', shortLink);

// 標記為已使用
await markStrategyAsUsed('strategy-id');

// 格式化文案（替換 {link} 佔位符）
const formattedContent = formatPostContent(
  '點擊查看：{link}',
  'https://shp.ee/abc123'
);
```

## TypeScript 類型

所有類型定義在 `src/lib/automation-types.ts`：

```typescript
import type {
  AutomationStrategy,
  AutomationStrategyWithLink,
  StrategyVariant,
  StrategyUsageLog,
  StrategyCategory,
  CreateStrategyInput,
  UpdateStrategyInput,
  RecordUsageInput,
  UserUsageStats,
} from '@/lib/automation-types';
```

## 分類系統

系統支援以下分類：

| 分類 | 標籤 | Emoji | 描述 |
|------|------|-------|------|
| `beauty` | 正妹圖片 | 👧 | 吸引目光的正妹/美女圖片策略 |
| `discount` | 優惠折扣 | 💰 | 省錢優惠、限時折扣相關策略 |
| `food` | 美食推薦 | 🍔 | 美食、餐廳、料理相關策略 |
| `3c` | 3C 開箱 | 📱 | 3C 產品、科技、開箱相關策略 |
| `travel` | 旅遊分享 | ✈️ | 旅遊、景點、住宿相關策略 |
| `game` | 遊戲推薦 | 🎮 | 遊戲、電競、娛樂相關策略 |
| `fashion` | 時尚穿搭 | 👗 | 時尚、穿搭、美妝相關策略 |
| `other` | 其他 | 📦 | 其他類型的策略 |

### 分類輔助函數

```typescript
import {
  getCategoryLabel,
  getCategoryEmoji,
  getCategoryDescription,
  getAllCategories,
} from '@/lib/automation-types';

// 取得分類標籤
getCategoryLabel('beauty'); // "正妹圖片"

// 取得分類 emoji
getCategoryEmoji('food'); // "🍔"

// 取得分類描述
getCategoryDescription('3c'); // "3C 產品、科技、開箱相關策略"

// 取得所有分類選項（用於下拉選單）
const categories = getAllCategories();
```

## 種子資料

系統提供了豐富的範例策略（`supabase/migrations/20251113000002_seed_automation_strategies.sql`）：

- 👧 正妹圖片 - 甜美風格
- 👧 正妹圖片 - 性感風格
- 💰 限時優惠 - 緊迫感版
- 💰 省錢攻略 - 實用分享版
- 🍔 美食推薦 - 打卡必吃版
- 🍔 美食推薦 - 深夜放毒版
- 📱 3C 開箱 - 實測心得版
- ✈️ 旅遊景點 - 秘境分享版
- ✈️ 旅遊住宿 - 飯店推薦版
- 🎮 手遊推薦 - 新遊戲版
- 👗 穿搭分享 - 季節新品版

每個策略都包含：
- 完整的文案模板
- 適用的社群平台建議
- 最佳發文時間
- 目標受眾資訊
- 相關標籤

## 部署步驟

### 1. 執行 Migration

```bash
# 開發環境
npm run supabase:migration:up

# 或使用 Supabase CLI
supabase db push
```

### 2. 驗證資料庫

確認以下表格已正確建立：
- `automation_strategies`
- `strategy_variants`
- `strategy_usage_logs`

### 3. 檢查 RLS 策略

在 Supabase Dashboard 中確認 RLS 策略已啟用。

### 4. 載入種子資料（可選）

種子資料會在 migration 時自動載入，如果需要重新載入：

```sql
-- 在 Supabase SQL Editor 中執行
-- supabase/migrations/20251113000002_seed_automation_strategies.sql
```

## 安全性考量

### 1. Row Level Security (RLS)
所有表格都啟用 RLS，確保：
- 用戶只能看到有權限的策略
- 用戶只能修改自己創建的策略
- 用戶只能查看自己的使用記錄

### 2. API 權限控制
所有 API 端點都包含：
- 用戶驗證檢查
- 所有權驗證
- 輸入驗證

### 3. 資料驗證
提供完整的驗證函數：
- `validateStrategyInput()`
- `validateVariantInput()`
- `validateContent()`

## 效能優化

### 1. 資料庫索引
已為常用查詢建立索引：
- `category` 索引（WHERE category IS NOT NULL）
- `is_active` 索引（WHERE is_active = true）
- `is_public` 索引（WHERE is_public = true）
- `created_by` 索引
- `created_at` 降序索引

### 2. 查詢優化
- 使用分頁（limit/offset）
- 選擇性載入關聯資料（include_link, include_variants）
- 使用資料庫函數進行複雜統計

### 3. 快取策略
建議在前端實作：
- 策略列表快取
- 熱門策略快取
- 使用者最愛策略快取

## 未來擴充功能

### Phase 2 功能
1. **文案變體 A/B Testing**
   - 自動輪替文案變體
   - 統計各變體效果
   - 推薦最佳變體

2. **智能推薦系統**
   - 根據使用歷史推薦策略
   - 根據時間推薦最佳發文策略
   - 根據轉換率推薦高效策略

3. **排程發文**
   - 設定發文時間
   - 自動發文到社群平台
   - 發文效果追蹤

4. **團隊協作**
   - 策略共享
   - 團隊成員管理
   - 使用統計報表

## 疑難排解

### Migration 執行失敗

```bash
# 檢查 migration 狀態
supabase migration list

# 重置資料庫（警告：會刪除所有資料）
supabase db reset
```

### RLS 策略問題

如果遇到權限錯誤：
1. 確認用戶已登入
2. 檢查 `auth.uid()` 是否正確
3. 在 Supabase Dashboard 查看 RLS 策略

### API 調用失敗

1. 檢查環境變數是否正確設定
2. 確認 Supabase 客戶端初始化
3. 查看瀏覽器 Network 面板的錯誤訊息

## 參考資源

- [Supabase 文件](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript 官方文件](https://www.typescriptlang.org/docs/)

## 聯絡資訊

如有問題或建議，請透過以下方式聯絡：
- GitHub Issues
- 專案維護者
