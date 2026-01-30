# 自動化發文助手系統 - 快速開始

## 前置準備

確保您的專案已安裝以下依賴：

```bash
npm install @supabase/supabase-js @supabase/ssr date-fns sonner
```

或使用 yarn：

```bash
yarn add @supabase/supabase-js @supabase/ssr date-fns sonner
```

## 步驟 1：安裝依賴

如果尚未安裝 `@supabase/ssr`，請執行：

```bash
npm install @supabase/ssr
```

## 步驟 2：執行 Migration

### 方式 1：使用 Supabase CLI（推薦）

```bash
# 如果還沒有 Supabase CLI，請先安裝
npm install -g supabase

# 登入 Supabase
supabase login

# 連結到您的專案
supabase link --project-ref your-project-ref

# 執行 migration
supabase db push
```

### 方式 2：手動在 Supabase Dashboard 執行

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的專案
3. 點擊左側選單的 "SQL Editor"
4. 複製並執行以下檔案的內容：
   - `supabase/migrations/20251113000001_create_automation_system.sql`
   - `supabase/migrations/20251113000002_seed_automation_strategies.sql`

## 步驟 3：驗證安裝

在 Supabase Dashboard 中檢查以下表格是否已建立：

- ✅ `automation_strategies`
- ✅ `strategy_variants`
- ✅ `strategy_usage_logs`

## 步驟 4：檢查 RLS 策略

在 Supabase Dashboard 中：

1. 進入 "Authentication" > "Policies"
2. 確認以下表格都有啟用 RLS：
   - `automation_strategies`
   - `strategy_variants`
   - `strategy_usage_logs`

## 步驟 5：環境變數設定

確認 `.env.local` 包含以下變數：

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 步驟 6：測試 API

### 測試方式 1：使用瀏覽器

啟動開發伺服器：

```bash
npm run dev
```

在瀏覽器中訪問：

```
http://localhost:3000/api/automation/strategies
```

應該會看到 JSON 回應（可能需要先登入）。

### 測試方式 2：使用 curl

```bash
# 獲取所有公開策略
curl http://localhost:3000/api/automation/strategies?is_public=true

# 獲取特定分類的策略
curl http://localhost:3000/api/automation/strategies?category=beauty

# 獲取熱門策略
curl http://localhost:3000/api/automation/strategies?sort_by=total_uses&sort_order=desc&limit=5
```

### 測試方式 3：使用 JavaScript

在瀏覽器 Console 中執行：

```javascript
// 獲取策略
fetch('/api/automation/strategies?is_public=true')
  .then(res => res.json())
  .then(data => console.log(data));
```

## 步驟 7：在元件中使用

### 簡單範例

建立一個測試頁面：`app/test-automation/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getStrategies } from '@/lib/automation-api';

export default function TestAutomationPage() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStrategies() {
      try {
        const { strategies } = await getStrategies({
          is_public: true,
          limit: 10
        });
        setStrategies(strategies);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStrategies();
  }, []);

  if (loading) {
    return <div>載入中...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">自動化發文助手測試</h1>
      <div className="space-y-4">
        {strategies.map((strategy: any) => (
          <div key={strategy.id} className="border p-4 rounded">
            <h2 className="font-semibold">{strategy.name}</h2>
            <p className="text-sm text-gray-600">{strategy.description}</p>
            <div className="mt-2 text-xs text-gray-500">
              使用次數: {strategy.total_uses}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

訪問 `http://localhost:3000/test-automation` 查看結果。

## 常見問題

### Q1: Migration 執行失敗

**錯誤**：`relation "links" does not exist`

**解決**：確保 `links` 表格已經存在。這個系統依賴於現有的 `links` 表格。

### Q2: API 回應 401 Unauthorized

**原因**：某些 API 端點需要用戶登入。

**解決**：
1. 確保用戶已登入
2. 檢查 Supabase Auth 設定
3. 使用公開端點測試（例如：`?is_public=true`）

### Q3: RLS 策略問題

**錯誤**：`new row violates row-level security policy`

**解決**：
1. 檢查 RLS 策略是否正確設定
2. 確認用戶有適當的權限
3. 在開發環境中，可以暫時在 Supabase Dashboard 中停用 RLS 進行測試

### Q4: 種子資料沒有載入

**解決**：
```sql
-- 手動執行種子資料 SQL
-- 在 Supabase SQL Editor 中執行
-- supabase/migrations/20251113000002_seed_automation_strategies.sql
```

### Q5: TypeScript 類型錯誤

**錯誤**：`Cannot find module '@/lib/automation-types'`

**解決**：
1. 確認檔案路徑正確
2. 重啟 TypeScript 伺服器（VS Code: Cmd/Ctrl + Shift + P > "Restart TS Server"）
3. 檢查 `tsconfig.json` 中的 `paths` 設定

## 下一步

現在您已經成功設定自動化發文助手系統，可以：

1. 📖 閱讀 [完整文件](./AUTOMATION_SYSTEM.md)
2. 💡 查看 [使用範例](./AUTOMATION_EXAMPLES.md)
3. 🎨 開始建立前端 UI 元件
4. 🚀 部署到生產環境

## 需要幫助？

如果遇到問題：

1. 檢查 [完整文件](./AUTOMATION_SYSTEM.md) 的「疑難排解」章節
2. 查看 [使用範例](./AUTOMATION_EXAMPLES.md) 中的程式碼
3. 檢查瀏覽器 Console 和 Network 面板
4. 查看 Supabase Dashboard 的 Logs

## 檢查清單

安裝完成後，請確認：

- [ ] `@supabase/ssr` 已安裝
- [ ] Migration 已執行成功
- [ ] 三個表格已建立
- [ ] RLS 策略已啟用
- [ ] 種子資料已載入
- [ ] API 端點可以正常訪問
- [ ] 測試頁面可以顯示策略列表

恭喜！您已經成功設定自動化發文助手系統。🎉
