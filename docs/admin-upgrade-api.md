# 管理員手動升級 API 使用指南

## 概述

此 API 允許管理員手動升級用戶的會員等級。符合 membership-spec.md 第 5 節規範。

## 端點

**POST** `/api/admin/upgrade-user`

## 權限要求

- 必須是已登入的用戶
- `profiles.is_admin` 欄位必須為 `true`

## 設定管理員

### 步驟 1: 運行資料庫遷移

```bash
# 確保已應用所有遷移
npm run db:migration:apply
```

或者手動在 Supabase SQL Editor 執行：

```sql
-- 1. 添加 is_admin 欄位（如果還沒有）
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. 設定第一個管理員
UPDATE public.profiles
SET is_admin = TRUE
WHERE id = 'your-user-uuid-here';

-- 3. 驗證
SELECT id, tier, is_admin FROM public.profiles WHERE is_admin = TRUE;
```

### 步驟 2: 查找你的 User ID

```sql
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

或使用提供的腳本：

```sql
-- 在 Supabase SQL Editor 執行
-- scripts/set-admin.sql
```

## API 規格

### Request Body

```typescript
{
  targetUserId: string;      // 目標用戶的 UUID
  tier: "FREE" | "PRO" | "VIP";  // 目標會員等級
  expireAt: string | null;   // 過期時間（ISO 8601 格式）
}
```

### 規則

1. **FREE**
   - `expireAt`: 應為 `null`

2. **PRO**
   - `expireAt`: **必填**，必須是未來的日期
   - 格式：ISO 8601（例：`2025-12-31T23:59:59Z`）

3. **VIP**
   - `expireAt`: 必須為 `null`（終身會員）

### Response (Success)

```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "tier": "PRO",
    "expireAt": "2025-12-31T23:59:59Z"
  },
  "log": {
    "timestamp": "2025-11-23T10:00:00Z",
    "action": "ADMIN_UPGRADE_USER",
    "adminId": "admin-uuid",
    "adminEmail": "admin@example.com",
    "targetUserId": "user-uuid",
    "oldTier": "FREE",
    "oldExpireAt": null,
    "newTier": "PRO",
    "newExpireAt": "2025-12-31T23:59:59Z"
  }
}
```

### Response (Error)

```json
{
  "error": "錯誤訊息",
  "details": "詳細錯誤資訊"
}
```

## HTTP 狀態碼

- **200**: 升級成功
- **400**: 請求參數錯誤
- **401**: 未授權（未登入）
- **403**: 權限不足（非管理員）
- **500**: 伺服器錯誤

## 使用範例

### cURL

```bash
# 升級到 PRO（30天）
curl -X POST http://localhost:3000/api/admin/upgrade-user \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "targetUserId": "target-user-uuid",
    "tier": "PRO",
    "expireAt": "2025-12-31T23:59:59Z"
  }'

# 升級到 VIP（終身）
curl -X POST http://localhost:3000/api/admin/upgrade-user \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "targetUserId": "target-user-uuid",
    "tier": "VIP",
    "expireAt": null
  }'
```

### JavaScript/TypeScript

```typescript
async function upgradeUser(
  targetUserId: string,
  tier: 'PRO' | 'VIP',
  expireAt: string | null
) {
  const response = await fetch('/api/admin/upgrade-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetUserId,
      tier,
      expireAt,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
}

// 使用範例
try {
  // 升級到 PRO（30天後過期）
  const result = await upgradeUser(
    'user-uuid',
    'PRO',
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  );
  console.log('升級成功:', result);

  // 升級到 VIP（終身）
  const result2 = await upgradeUser('user-uuid', 'VIP', null);
  console.log('升級成功:', result2);
} catch (error) {
  console.error('升級失敗:', error);
}
```

### React 組件範例

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

export default function AdminUpgradePanel() {
  const [userId, setUserId] = useState('');
  const [tier, setTier] = useState<'PRO' | 'VIP'>('PRO');
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setResult(null);

    try {
      const expireAt = tier === 'VIP'
        ? null
        : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

      const response = await fetch('/api/admin/upgrade-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: userId,
          tier,
          expireAt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setResult({ success: true, data });
      alert('升級成功！');
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : '升級失敗'
      });
      alert('升級失敗: ' + (error instanceof Error ? error.message : '未知錯誤'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      <h2 className="text-2xl font-bold">管理員升級面板</h2>

      <div>
        <Label htmlFor="userId">目標用戶 ID</Label>
        <Input
          id="userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="user-uuid"
        />
      </div>

      <div>
        <Label htmlFor="tier">會員等級</Label>
        <Select
          id="tier"
          value={tier}
          onChange={(e) => setTier(e.target.value as 'PRO' | 'VIP')}
        >
          <option value="PRO">PRO</option>
          <option value="VIP">VIP</option>
        </Select>
      </div>

      {tier === 'PRO' && (
        <div>
          <Label htmlFor="days">有效天數</Label>
          <Input
            id="days"
            type="number"
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            min={1}
          />
        </div>
      )}

      <Button onClick={handleUpgrade} disabled={loading || !userId}>
        {loading ? '升級中...' : '升級用戶'}
      </Button>

      {result && (
        <div className={`p-4 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

## 測試

使用提供的測試腳本：

### PowerShell (Windows)

```powershell
# 1. 編輯腳本，設定目標用戶 ID
# 2. 運行
.\scripts\test-admin-upgrade.ps1
```

### Bash (Linux/Mac)

```bash
# 1. 編輯腳本，設定目標用戶 ID
# 2. 賦予執行權限
chmod +x scripts/test-admin-upgrade.sh
# 3. 運行
./scripts/test-admin-upgrade.sh
```

## 操作日誌

每次升級操作都會記錄到 console，包含：

- 時間戳記
- 管理員 ID 和 Email
- 目標用戶 ID
- 舊的等級和過期時間
- 新的等級和過期時間

如果需要持久化審計日誌，可以創建 `audit_logs` 表並修改 API 代碼。

## 安全注意事項

1. **僅授予可信用戶管理員權限**
2. **定期審查管理員列表**
3. **監控升級日誌以防濫用**
4. **考慮實現雙因素認證**
5. **生產環境應啟用 HTTPS**

## 常見問題

### Q: 如何撤銷管理員權限？

```sql
UPDATE public.profiles
SET is_admin = FALSE
WHERE id = 'user-uuid';
```

### Q: 如何查看所有管理員？

```sql
SELECT p.id, u.email, p.tier, p.is_admin
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.is_admin = TRUE;
```

### Q: 可以降級用戶嗎？

可以，將 `tier` 設為 `"FREE"` 並 `expireAt` 設為 `null` 即可。

### Q: PRO 會員過期後會自動降級嗎？

會，資料庫有自動檢查機制（`check_membership_expiration` 函數）會在每次查詢會員資格時執行。

## 未來改進

- [ ] 實作審計日誌表 (`audit_logs`)
- [ ] 整合 Portaly Webhook 自動升級
- [ ] 管理員儀表板 UI
- [ ] 批量升級功能
- [ ] 自動發送升級通知郵件
