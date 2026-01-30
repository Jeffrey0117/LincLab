# Google Apps Script 快速參考卡

## 完整程式碼（直接複製貼上）

```javascript
/**
 * Google Apps Script - Shopee Link Cloak 推送接收器
 * 欄位順序：時間、標題、蟑螂分潤網連結、圖片URL
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createResponse(false, '未收到資料', 400);
    }

    let requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createResponse(false, 'JSON 格式錯誤', 400);
    }

    if (!requestData.rows || !Array.isArray(requestData.rows)) {
      return createResponse(false, '資料格式不正確，需要 rows 陣列', 400);
    }

    if (requestData.rows.length === 0) {
      return createResponse(false, '沒有資料可新增', 400);
    }

    const spreadsheetId = requestData.spreadsheetId;
    const sheetName = requestData.sheetName || 'Sheet1';

    if (!spreadsheetId) {
      return createResponse(false, '缺少 spreadsheetId', 400);
    }

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    if (!spreadsheet) {
      return createResponse(false, '無法開啟試算表，請確認權限', 400);
    }

    let sheet;
    const sheets = spreadsheet.getSheets();

    if (sheetName === 'Sheet1' || sheetName === '工作表1') {
      sheet = sheets[0];
    } else {
      sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        return createResponse(false, '找不到工作表：' + sheetName, 404);
      }
    }

    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      addHeaderRow(sheet);
    }

    let successCount = 0;
    const errors = [];

    for (let i = 0; i < requestData.rows.length; i++) {
      try {
        const row = requestData.rows[i];

        if (!row.created_at || !row.title || !row.short_url) {
          errors.push(`第 ${i + 1} 列缺少必要欄位`);
          continue;
        }

        const newRow = [
          row.created_at,
          row.title,
          row.short_url,
          row.og_image || ''
        ];

        sheet.appendRow(newRow);
        successCount++;

        if (i % 10 === 0) {
          Utilities.sleep(100);
        }

      } catch (rowError) {
        errors.push(`第 ${i + 1} 列失敗：` + rowError.message);
      }
    }

    if (successCount > 0) {
      return createResponse(true, `成功新增 ${successCount} 列`, 200, {
        addedRows: successCount,
        totalRows: requestData.rows.length
      });
    } else {
      return createResponse(false, '無法新增任何資料', 400, {
        errors: errors
      });
    }

  } catch (error) {
    return createResponse(false, '伺服器錯誤：' + error.message, 500);
  }
}

function addHeaderRow(sheet) {
  try {
    const headers = ['時間', '標題', '蟑螂分潤網連結', '圖片URL'];
    sheet.appendRow(headers);

    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f3f3f3');

    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  } catch (error) {
    Logger.log('新增標題列失敗：' + error.message);
  }
}

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

function testDoPost() {
  const testPayload = {
    spreadsheetId: 'YOUR_SPREADSHEET_ID_HERE',
    sheetName: 'Sheet1',
    rows: [
      {
        created_at: '2024-11-19 10:30:00',
        title: '測試文章',
        short_url: 'https://linclab.vercel.app/abc123',
        og_image: 'https://example.com/image.jpg'
      }
    ]
  };

  const e = {
    postData: {
      contents: JSON.stringify(testPayload)
    }
  };

  const result = doPost(e);
  Logger.log(result);
}
```

---

## 設定步驟（5 分鐘快速版）

### 1️⃣ 建立 Google Sheet
- 前往 [Google Sheets](https://sheets.google.com)
- 新增試算表
- 複製 URL 中的 Spreadsheet ID

### 2️⃣ 建立 Apps Script
- 在 Google Sheet 中：延伸功能 > Apps Script
- 或直接訪問 [script.google.com](https://script.google.com)

### 3️⃣ 複製程式碼
- 清除預設程式碼
- 複製上方完整程式碼到編輯器

### 4️⃣ 部署
- 點擊「部署」> 「新增部署」
- 類型選擇「Web 應用程式」
- 執行身份：您的帳號
- 誰可以存取：「任何人」
- 複製部署 URL

### 5️⃣ 在應用中設定
- 進入應用程式 Google Sheets 設定
- 貼上：Spreadsheet ID 和部署 URL
- 測試連接
- 啟用自動推送

---

## 欄位對應表

| Sheet 欄位 | 資料來源欄位 | 說明 |
|-----------|-----------|------|
| A 欄 - 時間 | `created_at` | ISO 格式時間戳記 |
| B 欄 - 標題 | `title` | 內容標題 |
| C 欄 - 蟑螂分潤網連結 | `short_url` | `https://linclab.vercel.app/{short_code}` |
| D 欄 - 圖片URL | `og_image` | 縮圖或商品圖片 |

---

## 推送範例

**請求格式：**
```json
{
  "spreadsheetId": "1a2b3c4d5e6f7g8h9i0j",
  "sheetName": "Sheet1",
  "rows": [
    {
      "created_at": "2024-11-19 10:30:00",
      "title": "我的商品",
      "short_url": "https://linclab.vercel.app/abc123",
      "og_image": "https://example.com/product.jpg"
    }
  ]
}
```

**成功回應：**
```json
{
  "success": true,
  "message": "成功新增 1 列",
  "timestamp": "2024-11-19T10:30:00.000Z",
  "addedRows": 1,
  "totalRows": 1
}
```

---

## 故障排除

| 問題 | 解決方案 |
|------|--------|
| Web App URL 無效 | 確認部署時選擇「任何人」，重新建立部署 |
| 資料沒有出現 | 檢查 Spreadsheet ID 和工作表名稱是否正確 |
| JSON 錯誤 | 使用 testDoPost() 測試，檢查資料格式 |
| 權限錯誤 | 確認 Google Sheet 設定為「任何人都能編輯」 |
| 找不到工作表 | 使用 sheets[0] 取得第一個工作表（腳本已自動處理） |

---

## 重要提醒

✅ **必須做：**
- Google Sheet 設定為「任何人都能編輯」
- Apps Script 部署選擇「任何人」可以存取
- 在推送前貼上正確的 Spreadsheet ID

❌ **不要做：**
- 修改欄位順序（除非您也更新 appendRow 的順序）
- 刪除標題列（會影響資料識別）
- 手動刪除工作表而不更新 sheetName 設定

---

## 聯繫支持

如遇問題，請提供：
1. Apps Script 執行日誌內容
2. 推送的 JSON 資料格式
3. Google Sheet 的名稱和 ID
4. 錯誤訊息截圖
