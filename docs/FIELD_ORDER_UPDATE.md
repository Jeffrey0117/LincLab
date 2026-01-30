# 欄位順序更新指南

## 概述

系統已更新 Google Sheets 推送的欄位順序。本文件說明了前端和後端的對應更新。

---

## 新欄位順序

### 舊順序（已廢棄）
1. 標題 (title)
2. 圖片URL (og_image)
3. 分潤連結 (affiliate_url)
4. 建立時間 (created_at)

### 新順序（目前版本）
1. **時間** (created_at) - 優先顯示資料建立時間
2. **標題** (title) - 重要識別資訊
3. **蟑螂分潤網連結** (short_url) - 核心價值
4. **圖片URL** (og_image) - 視覺輔助

---

## 後端更新

### TypeScript 型別定義

**檔案：** `src/lib/google-sheets.ts`

```typescript
export interface SheetRow {
  created_at: string;    // 新增：時間（優先）
  title: string;
  short_url: string;     // 修改：改為 short_url
  og_image: string;
}
```

### 資料轉換

**檔案：** `src/lib/google-sheets.ts` - `appendToSheet` 函數

```typescript
// 轉換為二維陣列格式（按新順序）
const values = rows.map(row => [
  row.created_at,    // 1. 時間
  row.title,         // 2. 標題
  row.short_url,     // 3. 蟑螂分潤網連結
  row.og_image       // 4. 圖片URL
]);
```

### 標題列更新

**檔案：** `src/lib/google-sheets.ts` - `addHeaderRow` 函數

```typescript
export async function addHeaderRow(
  spreadsheetId: string,
  sheetName: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'GOOGLE_API_KEY not configured'
    };
  }

  // 更新標題順序
  const headers = [['時間', '標題', '蟑螂分潤網連結', '圖片URL']];
  const range = `${sheetName}!A1:D1`;

  try {
    const response = await fetch(
      `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}&valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: headers
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error?.message || `HTTP ${response.status}`
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

---

## 前端更新

### API 推送邏輯

**檔案：** `src/app/api/integrations/google-sheets/push/route.ts`（需要建立或更新）

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { appendToSheet } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const { linkIds } = await request.json();

    if (!linkIds || !Array.isArray(linkIds) || linkIds.length === 0) {
      return NextResponse.json(
        { error: '沒有短連結可推送' },
        { status: 400 }
      );
    }

    // 從資料庫獲取短連結資料
    const supabase = createClient();
    const { data: links, error: queryError } = await supabase
      .from('links')
      .select('id, title, short_code, og_image, created_at')
      .in('id', linkIds);

    if (queryError || !links) {
      return NextResponse.json(
        { error: '無法取得短連結資料' },
        { status: 500 }
      );
    }

    // 獲取 Google Sheets 設定
    const { data: gsConfig, error: configError } = await supabase
      .from('google_sheets_config')
      .select('spreadsheet_id, sheet_name')
      .single();

    if (configError || !gsConfig?.spreadsheet_id) {
      return NextResponse.json(
        { error: 'Google Sheets 未設定' },
        { status: 400 }
      );
    }

    // 轉換資料格式（新欄位順序）
    const rows = links.map(link => ({
      created_at: new Date(link.created_at).toLocaleString('zh-TW'),
      title: link.title,
      short_url: `https://linclab.vercel.app/${link.short_code}`,
      og_image: link.og_image || ''
    }));

    // 推送到 Google Sheets
    const result = await appendToSheet(
      gsConfig.spreadsheet_id,
      gsConfig.sheet_name || 'Sheet1',
      rows
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '推送失敗' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `成功推送 ${result.updatedRows} 筆資料`,
      count: result.updatedRows
    });

  } catch (error) {
    console.error('Google Sheets 推送錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}
```

---

## 資料庫更新

### Supabase 表結構

確保 `links` 表包含以下欄位：

```sql
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  short_code VARCHAR(50) UNIQUE NOT NULL,
  og_image TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Google Sheets 配置表

```sql
CREATE TABLE google_sheets_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  spreadsheet_id VARCHAR(255) NOT NULL,
  sheet_name VARCHAR(100) DEFAULT 'Sheet1',
  is_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 遷移現有資料

如果您已有舊順序的資料在 Google Sheet 中，需要進行以下操作：

### 選項 1：手動重新組織（推薦用於小數據量）

1. 在 Google Sheet 中新增 4 個新欄位
2. 使用公式將舊資料轉移到新位置
3. 刪除舊欄位

**Excel 公式範例：**
```
新 A 欄 (時間) = 舊 D 欄
新 B 欄 (標題) = 舊 A 欄
新 C 欄 (短連結) = 舊 C 欄
新 D 欄 (圖片URL) = 舊 B 欄
```

### 選項 2：使用 Google Apps Script 自動化

```javascript
function migrateFieldOrder() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4);
  const data = dataRange.getValues();

  // 重新組織欄位：old [title, image, url, created_at] -> new [created_at, title, short_url, image]
  const newData = data.map(row => [
    row[3],  // created_at from old D -> new A
    row[0],  // title from old A -> new B
    row[2],  // url from old C -> new C
    row[1]   // image from old B -> new D
  ]);

  // 清除舊資料並寫入新資料
  sheet.clearContents();
  const headers = ['時間', '標題', '蟑螂分潤網連結', '圖片URL'];
  sheet.appendRow(headers);
  sheet.getRange(2, 1, newData.length, 4).setValues(newData);
}
```

### 選項 3：建立新 Sheet（最安全）

1. 建立新的 Google Sheet（例如「內容_v2」）
2. 在應用程式設定中指向新 Sheet
3. 舊資料保留作為備份
4. 新推送的資料會自動使用正確的欄位順序

---

## 測試清單

部署後，請確保以下項目都已測試：

- [ ] 建立 Google Sheet 並取得 Spreadsheet ID
- [ ] 建立 Google Apps Script 並部署 Web App
- [ ] 複製部署 URL 到應用程式設定
- [ ] 測試連接成功
- [ ] 推送單筆資料，確認欄位順序正確
- [ ] 推送多筆資料，確認批量操作正常
- [ ] 檢查 Google Sheet 中的標題列是否為新順序
- [ ] 驗證時間戳記格式正確
- [ ] 確認短連結 URL 格式為 `https://linclab.vercel.app/{short_code}`

---

## 常見問題

### Q: 更新後舊資料會受影響嗎？
A: 不會。舊資料會保留在 Google Sheet 中。如果要重新組織舊資料，請參考上方的遷移方案。

### Q: 如何同時支援新舊欄位順序？
A: 不建議。應在部署前完成遷移。如必要，可建立兩個不同的 Google Sheet，一個用舊順序，一個用新順序。

### Q: 推送後還能改變欄位順序嗎？
A: 可以，但需要：
1. 更新 Apps Script 中的 appendRow 順序
2. 更新後端 TypeScript 程式碼
3. 刪除或重新組織 Google Sheet 中的舊資料

### Q: 如何驗證欄位順序是否正確？
A: 推送一筆測試資料後，檢查 Google Sheet 中的欄位是否按照以下順序排列：
- A 欄：時間戳記（例如 `2024-11-19 10:30:00`）
- B 欄：文字標題
- C 欄：URL（以 `https://linclab.vercel.app/` 開頭）
- D 欄：圖片 URL

---

## 相關檔案

- `src/lib/google-sheets.ts` - TypeScript 客戶端
- `src/app/api/integrations/google-sheets/push/route.ts` - API 端點
- `docs/GOOGLE_APPS_SCRIPT_SETUP.md` - Apps Script 完整指南
- `docs/GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md` - 快速參考

---

**更新日期：** 2024-11-19
**版本：** 1.0
