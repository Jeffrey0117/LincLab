# Google Apps Script 設定指南

## 功能概述

本指南說明如何設定 Google Apps Script，接收來自 Shopee Link Cloak 應用程式的資料推送，並自動新增到 Google Sheets。

新的欄位順序已更新為：
1. **時間** (created_at) - 資料建立時間戳記
2. **標題** (title) - 內容的標題
3. **蟑螂分潤網連結** (short_url) - 格式：`https://linclab.vercel.app/{short_code}`
4. **圖片URL** (og_image) - 內容的縮圖連結

---

## 設定步驟

### 1. 建立 Google Sheets

1. 前往 [Google Sheets](https://sheets.google.com)
2. 點擊「建立新試算表」
3. 命名試算表（例如：「蟑螂分潤內容」）
4. 複製試算表 URL（稍後會用到）

### 2. 建立 Google Apps Script

#### 方式 A：從 Google Sheets 建立（推薦）

1. 在 Google Sheets 中點擊「延伸功能」> 「Apps Script」
2. 系統會開啟 Google Apps Script 編輯器
3. 清除預設程式碼，複製下方的完整程式碼

#### 方式 B：從 Google Apps Script 首頁建立

1. 前往 [script.google.com](https://script.google.com)
2. 點擊「新增專案」
3. 按照以下步驟設定

### 3. 複製完整程式碼

在 Google Apps Script 編輯器中，將下列程式碼複製到 `Code.gs` 文件：

```javascript
/**
 * Google Apps Script - Shopee Link Cloak 推送接收器
 * 功能：接收 API 推送的內容資料，自動新增到 Google Sheets
 * 欄位順序：時間、標題、蟑螂分潤網連結、圖片URL
 */

/**
 * doPost 函數 - 接收 HTTP POST 請求
 * 當應用程式推送資料時會觸發此函數
 */
function doPost(e) {
  try {
    // 1. 驗證請求
    if (!e || !e.postData || !e.postData.contents) {
      return createResponse(false, '未收到資料', 400);
    }

    // 2. 解析 JSON 資料
    let requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseError) {
      Logger.log('JSON 解析錯誤：' + parseError.message);
      return createResponse(false, 'JSON 格式錯誤', 400);
    }

    // 3. 驗證資料結構
    if (!requestData.rows || !Array.isArray(requestData.rows)) {
      return createResponse(false, '資料格式不正確，需要 rows 陣列', 400);
    }

    if (requestData.rows.length === 0) {
      return createResponse(false, '沒有資料可新增', 400);
    }

    // 4. 取得 Google Sheet
    const spreadsheetId = requestData.spreadsheetId;
    const sheetName = requestData.sheetName || 'Sheet1';

    if (!spreadsheetId) {
      return createResponse(false, '缺少 spreadsheetId', 400);
    }

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    if (!spreadsheet) {
      return createResponse(false, '無法開啟試算表，請確認權限', 400);
    }

    // 5. 取得工作表（使用 getSheets()[0] 取得第一個工作表，避免名稱問題）
    let sheet;
    const sheets = spreadsheet.getSheets();

    if (sheetName === 'Sheet1' || sheetName === '工作表1') {
      // 如果指定使用第一個工作表，直接使用
      sheet = sheets[0];
    } else {
      // 否則按名稱查找
      sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        return createResponse(false, '找不到工作表：' + sheetName, 404);
      }
    }

    // 6. 檢查並新增標題列（如果是空表）
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      addHeaderRow(sheet);
    }

    // 7. 逐列新增資料
    let successCount = 0;
    const errors = [];

    for (let i = 0; i < requestData.rows.length; i++) {
      try {
        const row = requestData.rows[i];

        // 驗證必要欄位
        if (!row.created_at || !row.title || !row.short_url) {
          errors.push(`第 ${i + 1} 列缺少必要欄位 (created_at, title, short_url)`);
          continue;
        }

        // 按照新的欄位順序：時間、標題、蟑螂分潤網連結、圖片URL
        const newRow = [
          row.created_at,      // 時間
          row.title,            // 標題
          row.short_url,        // 蟑螂分潤網連結
          row.og_image || ''    // 圖片URL（可選）
        ];

        // 新增資料列
        sheet.appendRow(newRow);
        successCount++;

        // 為了避免超出速率限制，添加小延遲
        if (i % 10 === 0) {
          Utilities.sleep(100);
        }

      } catch (rowError) {
        errors.push(`第 ${i + 1} 列處理失敗：` + rowError.message);
      }
    }

    // 8. 回傳結果
    if (successCount > 0) {
      return createResponse(true, `成功新增 ${successCount} 列`, 200, {
        addedRows: successCount,
        totalRows: requestData.rows.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } else {
      return createResponse(false, '無法新增任何資料', 400, {
        errors: errors
      });
    }

  } catch (error) {
    Logger.log('doPost 錯誤：' + error.message);
    return createResponse(false, '伺服器錯誤：' + error.message, 500);
  }
}

/**
 * 新增標題列到工作表
 */
function addHeaderRow(sheet) {
  try {
    const headers = ['時間', '標題', '蟑螂分潤網連結', '圖片URL'];
    sheet.appendRow(headers);

    // 設定標題列格式
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f3f3f3');

    // 自動調整欄寬
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }

    Logger.log('標題列已新增');
  } catch (error) {
    Logger.log('新增標題列失敗：' + error.message);
  }
}

/**
 * 建立統一的回應格式
 */
function createResponse(success, message, statusCode, data = null) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };

  if (data) {
    Object.assign(response, data);
  }

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setResponseCode(statusCode);
}

/**
 * 測試函數 - 在編輯器中執行測試
 * 執行方式：選擇此函數並點擊執行按鈕
 */
function testDoPost() {
  const testPayload = {
    spreadsheetId: 'YOUR_SPREADSHEET_ID_HERE', // 替換為您的 Spreadsheet ID
    sheetName: 'Sheet1',
    rows: [
      {
        created_at: '2024-11-19 10:30:00',
        title: '測試文章 1',
        short_url: 'https://linclab.vercel.app/abc123',
        og_image: 'https://example.com/image1.jpg'
      },
      {
        created_at: '2024-11-19 10:35:00',
        title: '測試文章 2',
        short_url: 'https://linclab.vercel.app/def456',
        og_image: 'https://example.com/image2.jpg'
      }
    ]
  };

  // 模擬 POST 請求
  const e = {
    postData: {
      contents: JSON.stringify(testPayload)
    }
  };

  const result = doPost(e);
  Logger.log('測試結果：');
  Logger.log(result);
}

/**
 * 部署函數 - 設定 Web App 部署
 * 執行步驟：
 * 1. 點擊左側「部署」按鈕
 * 2. 點擊「新增部署」> 「類型」選擇「Web 應用程式」
 * 3. 設定如下：
 *    - 執行位置：選擇您的帳號
 *    - 誰可以存取：選擇「任何人」
 * 4. 點擊「部署」
 * 5. 複製部署 URL（Web App URL）
 * 6. 在應用程式的 Google Sheets 設定中貼上此 URL
 */

// 部署後的 Web App URL 格式範例：
// https://script.google.com/macros/d/{deploymentId}/usercontent
```

### 4. 設定 Spreadsheet ID

1. 打開您建立的 Google Sheet
2. 從 URL 中複製 Spreadsheet ID
   - URL 格式：`https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - 複製 `{SPREADSHEET_ID}` 部分
3. 在應用程式的 Google Sheets 設定中貼上此 ID

### 5. 部署 Google Apps Script

1. 在 Apps Script 編輯器左側點擊「部署」
2. 點擊「新增部署」
3. 在「選擇類型」下拉選單中選擇「Web 應用程式」
4. 設定如下選項：
   - **執行位置**：選擇您的帳號
   - **誰可以存取**：選擇「任何人」
5. 點擊「部署」按鈕
6. 系統會顯示部署 URL，格式如：
   ```
   https://script.google.com/macros/d/{deploymentId}/usercontent
   ```
7. 複製此 URL

### 6. 在應用程式中設定部署 URL

1. 前往應用程式的 Google Sheets 設定頁面
2. 在「Web App URL」欄位貼上部署 URL
3. 點擊「測試連接」驗證設定
4. 測試成功後，勾選「啟用自動推送」

---

## 欄位說明

| 欄位名稱 | 資料類型 | 說明 | 範例 |
|---------|---------|------|------|
| 時間 | 字串 | 資料建立的時間戳記 | `2024-11-19 10:30:00` |
| 標題 | 字串 | 內容的標題 | `我的分潤商品` |
| 蟑螂分潤網連結 | URL | 短連結，格式固定 | `https://linclab.vercel.app/abc123` |
| 圖片URL | URL | 商品或內容的縮圖 | `https://example.com/image.jpg` |

---

## 推送資料格式

應用程式會以以下 JSON 格式推送資料：

```json
{
  "spreadsheetId": "1a2b3c4d5e6f7g8h9i0j",
  "sheetName": "Sheet1",
  "rows": [
    {
      "created_at": "2024-11-19 10:30:00",
      "title": "測試商品",
      "short_url": "https://linclab.vercel.app/abc123",
      "og_image": "https://example.com/image.jpg"
    }
  ]
}
```

---

## 錯誤處理與回應

### 成功回應 (HTTP 200)
```json
{
  "success": true,
  "message": "成功新增 5 列",
  "timestamp": "2024-11-19T10:30:00.000Z",
  "addedRows": 5,
  "totalRows": 5
}
```

### 失敗回應 (HTTP 400/404/500)
```json
{
  "success": false,
  "message": "找不到工作表：Sheet2",
  "timestamp": "2024-11-19T10:30:00.000Z",
  "errors": ["第 1 列缺少必要欄位 (created_at, title, short_url)"]
}
```

---

## 測試推送

### 方法 1：在 Apps Script 中測試

1. 打開 Google Apps Script 編輯器
2. 在程式碼上方的函數下拉選單選擇 `testDoPost`
3. 點擊「執行」按鈕
4. 在「執行日誌」中查看結果

### 方法 2：使用 curl 測試

```bash
curl -X POST \
  'https://script.google.com/macros/d/{deploymentId}/usercontent' \
  -H 'Content-Type: application/json' \
  -d '{
    "spreadsheetId": "1a2b3c4d5e6f7g8h9i0j",
    "sheetName": "Sheet1",
    "rows": [
      {
        "created_at": "2024-11-19 10:30:00",
        "title": "測試商品",
        "short_url": "https://linclab.vercel.app/abc123",
        "og_image": "https://example.com/image.jpg"
      }
    ]
  }'
```

---

## 常見問題

### Q: 部署後無法訪問 Web App URL？
A:
1. 確認部署時選擇「任何人」可以存取
2. 檢查 URL 是否複製完整
3. 嘗試在隱私瀏覽模式中訪問
4. 如果問題持續，在 Apps Script 編輯器點擊「部署」> 「管理部署」，並建立新部署

### Q: 資料沒有新增到 Sheet？
A:
1. 檢查 Spreadsheet ID 是否正確
2. 確認 Google Sheet 的工作表名稱是否正確
3. 檢查應用程式設定中的 Web App URL 是否正確
4. 在 Apps Script 編輯器查看「執行日誌」了解詳細錯誤

### Q: 如何更新部署？
A:
1. 修改 Apps Script 程式碼
2. 點擊左側「部署」
3. 點擊要更新的部署旁的編輯按鈕
4. 更新描述後點擊「部署」
5. 新版本會自動使用，無需更新 URL

### Q: 如何刪除舊部署？
A:
1. 在 Apps Script 編輯器點擊「部署」
2. 點擊要刪除的部署旁的刪除按鈕
3. 確認刪除

### Q: 可以設定多個工作表嗎？
A:
可以。在推送時指定不同的 `sheetName` 即可。腳本會自動查找對應的工作表。

---

## 安全建議

1. **權限管理**：
   - Google Sheet 應該設定為「任何人都能編輯」
   - Apps Script 部署設定為「任何人」可以存取

2. **資料驗證**：
   - 腳本會驗證所有必要欄位
   - 無效資料會被記錄但不會中斷整個推送

3. **存取日誌**：
   - 定期檢查 Google Sheet 的修訂歷史記錄
   - 監控誰修改了您的試算表

---

## 版本更新

### 版本 1.0（目前版本）
- 支援 4 個欄位：時間、標題、蟑螂分潤網連結、圖片URL
- 自動新增標題列
- 完整的錯誤處理和日誌記錄
- HTTP 狀態碼回應
- 支援批量推送

---

## 相關文件

- [Google Sheets 整合設定指南](./google-sheets-setup.md)
- [應用程式設定說明](../README.md)

---

**最後更新時間**：2024-11-19
**維護者**：Shopee Link Cloak 團隊
