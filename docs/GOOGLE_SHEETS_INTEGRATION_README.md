# Google Sheets 整合 - 完整說明文件

## 文件導覽

本次更新包含 4 份核心文件和 1 份本導覽文件，全面涵蓋 Google Sheets 整合的各個方面。

### 文件列表

#### 1. **GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md** ⭐ 快速開始
- **適合人群**：想快速設定的用戶
- **內容**：
  - 完整可複製貼上的程式碼
  - 5 分鐘快速設定步驟
  - 欄位對應表
  - 推送範例和回應格式
  - 故障排除快速表
- **用途**：初次設定時首先閱讀

#### 2. **APPS_SCRIPT_STEP_BY_STEP.md** 📚 詳細教程
- **適合人群**：需要詳細指引的初學者
- **內容**：
  - 7 大步驟的詳細說明
  - 每個步驟的截圖和操作說明
  - 完整的工作流程圖
  - 常見問題解答
  - 故障排除方案
- **用途**：跟著步驟逐一完成設定

#### 3. **GOOGLE_APPS_SCRIPT_SETUP.md** 🔧 完整參考
- **適合人群**：需要深入了解細節的開發者
- **內容**：
  - 詳細的設定步驟
  - 程式碼解釋和邏輯說明
  - 欄位說明和資料格式
  - 推送資料格式和回應處理
  - 測試方法（Apps Script 和 curl）
  - 安全建議
  - 版本更新說明
- **用途**：深度理解和自訂程式碼

#### 4. **FIELD_ORDER_UPDATE.md** 📋 欄位順序變更
- **適合人群**：需要升級現有系統的用戶
- **內容**：
  - 新舊欄位順序對比
  - 後端 TypeScript 更新說明
  - 前端 API 實現
  - 資料庫結構
  - 現有資料遷移方案
  - 測試清單
- **用途**：了解欄位變更和遷移現有資料

#### 5. **GOOGLE_SHEETS_INTEGRATION_README.md** 📖 本文件
- **內容**：文件導覽和快速參考
- **用途**：了解整體結構和快速定位需要的文件

---

## 新欄位順序概覽

系統已更新為以下新欄位順序：

| 位置 | 欄位名稱 | 資料來源 | 格式範例 |
|-----|--------|--------|--------|
| **A 欄** | 時間 | `created_at` | `2024-11-19 10:30:00` |
| **B 欄** | 標題 | `title` | `我的分潤商品` |
| **C 欄** | 蟑螂分潤網連結 | `short_url` | `https://linclab.vercel.app/abc123` |
| **D 欄** | 圖片URL | `og_image` | `https://example.com/image.jpg` |

---

## 快速開始指南（5 分鐘版）

### 步驟總結

```
1. 建立 Google Sheet
   ↓ 複製 Spreadsheet ID
2. 建立 Google Apps Script
   ↓ 複製程式碼（見 GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md）
3. 部署 Web App
   ↓ 複製部署 URL
4. 在應用程式設定
   ↓ 輸入 ID 和 URL、測試
5. 啟用推送
   ↓ 完成！
```

### 檢查清單

- [ ] 建立 Google Sheet
- [ ] 複製 Spreadsheet ID
- [ ] 設定 Sheet 權限為「任何人都能編輯」
- [ ] 建立 Google Apps Script
- [ ] 複製程式碼到 Code.gs
- [ ] 執行 testDoPost() 進行測試（可選）
- [ ] 部署 Web App
- [ ] 複製部署 URL
- [ ] 在應用程式輸入 Spreadsheet ID
- [ ] 在應用程式輸入 Web App URL
- [ ] 點擊「測試連接」
- [ ] 啟用「自動推送」
- [ ] 執行推送測試
- [ ] 檢查 Google Sheet 驗證結果

---

## 選擇適合您的文件

### 情況 1：我是初學者，想快速設定

👉 **閱讀順序：**
1. 先看本文件的「快速開始指南」
2. 再看 **GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md**
3. 遇到問題時查看 **APPS_SCRIPT_STEP_BY_STEP.md**

### 情況 2：我需要詳細的逐步教程

👉 **閱讀順序：**
1. 本文件的「快速開始指南」（5 分鐘了解概況）
2. **APPS_SCRIPT_STEP_BY_STEP.md**（詳細的 7 大步驟）
3. **GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md**（查詢具體程式碼）

### 情況 3：我是開發者，想深入了解實現細節

👉 **閱讀順序：**
1. **GOOGLE_APPS_SCRIPT_SETUP.md**（完整參考）
2. **FIELD_ORDER_UPDATE.md**（理解欄位變更）
3. **GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md**（快速查詢程式碼）

### 情況 4：我有現有的舊系統，需要升級

👉 **閱讀順序：**
1. **FIELD_ORDER_UPDATE.md**（了解變更和遷移方案）
2. **GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md**（取得新程式碼）
3. **APPS_SCRIPT_STEP_BY_STEP.md**（逐步重新部署）

### 情況 5：我已設定好，現在有問題

👉 **檢查步驟：**
1. 查看 **GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md** 中的故障排除表
2. 查看 **APPS_SCRIPT_STEP_BY_STEP.md** 中的故障排除部分
3. 在 Apps Script 執行日誌中查看詳細錯誤訊息
4. 參考 **GOOGLE_APPS_SCRIPT_SETUP.md** 的常見問題

---

## 核心概念

### Google Sheets 整合工作流程

```
應用程式
  ↓
[POST] 推送請求到 Web App URL
  ↓
Google Apps Script (doPost 函數)
  ↓
解析 JSON、驗證資料
  ↓
開啟 Google Sheet
  ↓
新增資料列
  ↓
回應成功 JSON
  ↓
應用程式接收回應
  ↓
顯示成功提示
  ↓
Google Sheet 更新
```

### 資料流向

```
應用程式資料庫 (links 表)
  ├─ id
  ├─ title
  ├─ short_code
  ├─ og_image
  └─ created_at
           ↓
應用程式 API (push 端點)
  ├─ 組織資料
  ├─ 轉換格式
  └─ 驗證欄位
           ↓
HTTP POST 請求
  {
    "spreadsheetId": "xxx",
    "sheetName": "Sheet1",
    "rows": [
      {
        "created_at": "2024-11-19 10:30:00",
        "title": "商品標題",
        "short_url": "https://linclab.vercel.app/abc123",
        "og_image": "https://example.com/image.jpg"
      }
    ]
  }
           ↓
Google Apps Script (doPost)
  ├─ 驗證請求
  ├─ 解析 JSON
  ├─ 開啟 Sheet
  └─ appendRow
           ↓
Google Sheet 更新
  A1: 時間 | B1: 標題 | C1: 短連結 | D1: 圖片
  A2: ... | B2: ... | C2: ... | D2: ...
```

---

## 程式碼片段快速查詢

### Google Apps Script 核心函數

**doPost(e)** - 接收和處理 POST 請求
```javascript
function doPost(e) {
  // 驗證 → 解析 → 開啟 Sheet → 新增資料 → 回應
}
```

**addHeaderRow(sheet)** - 自動新增標題列
```javascript
function addHeaderRow(sheet) {
  const headers = ['時間', '標題', '蟑螂分潤網連結', '圖片URL'];
  sheet.appendRow(headers);
}
```

**createResponse()** - 統一的回應格式
```javascript
function createResponse(success, message, statusCode, data = null) {
  return ContentService.createTextOutput(JSON.stringify({...}))
}
```

### TypeScript 型別定義

**SheetRow 介面**
```typescript
export interface SheetRow {
  created_at: string;
  title: string;
  short_url: string;
  og_image: string;
}
```

---

## 常見設定值

### 標題列（A1:D1）
```
A1: 時間
B1: 標題
C1: 蟑螂分潤網連結
D1: 圖片URL
```

### 工作表名稱
- **預設：** `Sheet1` 或 `工作表1`
- **備用：** 任何您建立的工作表名稱

### 短連結格式
```
https://linclab.vercel.app/{short_code}
```

### 時間戳記格式
```
2024-11-19 10:30:00
或 ISO 格式：2024-11-19T10:30:00.000Z
```

---

## API 請求和回應參考

### 請求格式
```json
POST {WEB_APP_URL}

{
  "spreadsheetId": "1a2b3c4d5e6f7g8h9i0j",
  "sheetName": "Sheet1",
  "rows": [
    {
      "created_at": "2024-11-19 10:30:00",
      "title": "商品標題",
      "short_url": "https://linclab.vercel.app/abc123",
      "og_image": "https://example.com/image.jpg"
    }
  ]
}
```

### 成功回應 (HTTP 200)
```json
{
  "success": true,
  "message": "成功新增 1 列",
  "timestamp": "2024-11-19T10:30:00.000Z",
  "addedRows": 1,
  "totalRows": 1
}
```

### 失敗回應範例

**缺少欄位 (HTTP 400)**
```json
{
  "success": false,
  "message": "資料格式不正確，需要 rows 陣列",
  "timestamp": "2024-11-19T10:30:00.000Z"
}
```

**找不到工作表 (HTTP 404)**
```json
{
  "success": false,
  "message": "找不到工作表：Sheet2",
  "timestamp": "2024-11-19T10:30:00.000Z",
  "errors": ["無法定位指定的工作表"]
}
```

**伺服器錯誤 (HTTP 500)**
```json
{
  "success": false,
  "message": "伺服器錯誤：SpreadsheetApp error",
  "timestamp": "2024-11-19T10:30:00.000Z"
}
```

---

## 設定驗證清單

設定完成後，請驗證以下項目：

### Google Sheet
- [ ] 試算表名稱正確
- [ ] 權限設定為「任何知道連結的人都能編輯」
- [ ] Spreadsheet ID 正確複製
- [ ] 工作表名稱正確（預設 Sheet1）

### Google Apps Script
- [ ] 程式碼無語法錯誤
- [ ] 包含所有必要函數（doPost、addHeaderRow、createResponse）
- [ ] testDoPost() 執行成功（可選）

### Web App 部署
- [ ] 部署類型為「Web 應用程式」
- [ ] 執行位置為您的帳號
- [ ] 誰可以存取設為「任何人」
- [ ] 部署 URL 可正常訪問
- [ ] 直接訪問 URL 回應 "未收到資料" 訊息

### 應用程式設定
- [ ] Spreadsheet ID 正確輸入
- [ ] Web App URL 正確輸入
- [ ] 工作表名稱正確輸入
- [ ] 點擊「測試連接」成功
- [ ] 「自動推送」已啟用

### 推送測試
- [ ] 成功推送至少 1 筆資料
- [ ] Google Sheet 顯示新資料
- [ ] 欄位順序正確（時間、標題、短連結、圖片）
- [ ] 資料內容正確

---

## 故障排除快速指南

| 症狀 | 可能原因 | 解決方案 |
|------|--------|--------|
| 無法訪問 Web App URL | 部署設定不正確 | 檢查部署類型和訪問權限 |
| 無法開啟試算表 | Spreadsheet ID 錯誤或無權限 | 驗證 ID、檢查 Sheet 權限 |
| JSON 格式錯誤 | 資料格式不符 | 檢查必要欄位（created_at, title, short_url） |
| 找不到工作表 | Sheet 名稱不匹配 | 使用預設 Sheet1 或驗證工作表名稱 |
| 資料沒有新增 | Web App URL 設定錯誤 | 檢查應用程式設定中的 URL |
| 推送緩慢 | 批量資料過大 | 減少單次推送的資料筆數 |

完整故障排除見各文件。

---

## 技術規格

### 支援環境
- Google Sheets（線上版，需要 Google 帳號）
- Google Apps Script（內建於 Google 生態）
- 任何能發送 HTTP POST 的應用程式

### 限制和配額
- **最大請求大小**：10 MB
- **批量操作延遲**：每 10 列增加 100 ms 延遲以避免超限
- **Sheet 最大列數**：理論上無限（受 Google Sheets 限制）
- **並發請求**：可以同時處理多個推送

### 相容性
- 支援所有現代瀏覽器（Chrome, Firefox, Safari, Edge）
- Google Sheets 應用程式在 iOS 和 Android 上可用
- Google Apps Script 相容所有 JavaScript ES6+ 功能

---

## 安全最佳實踐

### 權限管理
- ✅ 設定 Sheet 為「任何人都能編輯」（透過連結）
- ✅ 限制誰可以知道 Sheet URL 和部署 URL
- ✅ 定期檢查 Sheet 修訂歷史記錄
- ❌ 不要在程式碼中硬寫 API 密鑰

### 資料驗證
- ✅ 驗證所有輸入資料
- ✅ 檢查欄位完整性
- ✅ 記錄所有推送日誌
- ❌ 不要信任未驗證的外部資料

### 日誌和監控
- ✅ 定期檢查 Apps Script 執行日誌
- ✅ 監控推送失敗和錯誤
- ✅ 保存重要的推送記錄
- ❌ 不要在日誌中儲存敏感資訊

---

## 進階主題

### 自訂欄位順序

如需改變欄位順序，修改 Apps Script 中的 appendRow：

```javascript
const newRow = [
  row.created_at,    // 改變此順序
  row.title,
  row.short_url,
  row.og_image
];
sheet.appendRow(newRow);
```

### 新增驗證邏輯

可在 doPost 中新增自訂驗證：

```javascript
// 驗證短連結格式
if (!row.short_url.startsWith('https://linclab.vercel.app/')) {
  errors.push('短連結格式不正確');
  continue;
}
```

### 批量操作優化

目前每 10 列增加 100 ms 延遲。可根據需要調整：

```javascript
if (i % 50 === 0) {  // 改為每 50 列
  Utilities.sleep(100);
}
```

### 監控和告警

結合 Google Forms 或 Slack 建立告警系統：

```javascript
if (successCount === 0) {
  // 發送告警通知
}
```

---

## 版本歷史

### v1.0 (2024-11-19) - 當前版本
- 新增欄位順序：時間、標題、蟑螂分潤網連結、圖片URL
- 支援批量推送
- 自動新增標題列
- 完整的錯誤處理
- HTTP 狀態碼回應

### 計畫功能 (v2.0)
- 自訂欄位對應
- 條件推送（例如只推送特定類別）
- Webhook 重試機制
- 推送歷史和統計
- 多工作表支援

---

## 相關資源

### 官方文件
- [Google Apps Script 說明文件](https://developers.google.com/apps-script/guides/sheets)
- [Google Sheets API 文件](https://developers.google.com/sheets/api)
- [Google Apps Script 最佳實踐](https://developers.google.com/apps-script/best-practices)

### 本專案文件
- `GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md` - 快速參考
- `APPS_SCRIPT_STEP_BY_STEP.md` - 詳細教程
- `GOOGLE_APPS_SCRIPT_SETUP.md` - 完整設定
- `FIELD_ORDER_UPDATE.md` - 欄位更新

### 相關程式碼檔案
- `src/lib/google-sheets.ts` - TypeScript 客戶端
- `src/components/robots/GoogleSheetsPush.tsx` - UI 元件
- `src/app/api/integrations/google-sheets/` - API 路由

---

## 聯繫支持和反饋

遇到問題或有建議？

1. **檢查執行日誌**：Apps Script 編輯器 → 執行日誌
2. **查閱文件**：本指南的相關章節
3. **搜尋常見問題**：各文件的 FAQ 部分
4. **測試 doPost()**：執行 testDoPost() 函數進行調試

---

## 快速命令參考

### Google Apps Script 測試
```
1. 選擇函數：testDoPost
2. 點擊執行按鈕
3. 查看執行日誌結果
```

### 部署更新
```
1. 編輯程式碼
2. 按 Ctrl+S 保存
3. 點擊「部署」> 「管理部署」
4. 編輯對應的部署
5. 新版本自動生效
```

### 驗證 Web App URL
```bash
curl -X POST {WEB_APP_URL} \
  -H 'Content-Type: application/json' \
  -d '{"rows": []}'

# 預期回應：
# {"success": false, "message": "沒有資料可新增"}
```

---

**文件版本：** 1.0
**最後更新：** 2024-11-19
**維護者：** Shopee Link Cloak 團隊

---

## 文件總結

| 文件 | 主要內容 | 適合人群 | 閱讀時間 |
|------|--------|--------|--------|
| GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md | 完整程式碼、5 分鐘步驟、故障排除 | 所有人 | 5 分鐘 |
| APPS_SCRIPT_STEP_BY_STEP.md | 詳細 7 步教程、每步說明 | 初學者 | 20 分鐘 |
| GOOGLE_APPS_SCRIPT_SETUP.md | 完整參考、程式碼解釋、安全建議 | 開發者 | 30 分鐘 |
| FIELD_ORDER_UPDATE.md | 欄位變更、資料遷移、測試清單 | 有現有系統的用戶 | 15 分鐘 |
| GOOGLE_SHEETS_INTEGRATION_README.md | 文件導覽、概念說明、快速查詢 | 所有人 | 10 分鐘 |

🎉 **開始您的 Google Sheets 整合之旅吧！**
