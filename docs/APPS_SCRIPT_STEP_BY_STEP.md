# Google Apps Script 逐步教程

本文件提供完整的視覺化步驟指南，幫助您逐步完成設定。

---

## 第 1 步：準備 Google Sheet

### 1.1 建立新試算表

1. 訪問 [Google Sheets](https://sheets.google.com)
2. 點擊左上角「+ 建立」按鈕
3. 選擇「空白試算表」
4. 輸入名稱（例如：「蟑螂分潤內容」）

```
Google Sheets 首頁
├─ 點擊「+ 建立」
├─ 選擇「空白試算表」
└─ 命名試算表
```

### 1.2 複製 Spreadsheet ID

1. 打開新建立的試算表
2. 在瀏覽器網址列找到 URL：
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   ```
3. 複製 `{SPREADSHEET_ID}` 部分（不包括大括號）
   - **範例：** `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p`

### 1.3 設定權限

1. 點擊試算表右上角的「共用」按鈕
2. 在「誰可以存取」對話框中：
   - 點擊「變更」
   - 選擇「任何知道連結的人」
   - 權限設定為「編輯者」
   - 點擊「完成」

```
權限設定流程：
共用按鈕 → 變更 → 選擇「任何知道連結的人」→ 編輯者 → 完成
```

---

## 第 2 步：建立 Google Apps Script

### 2.1 開啟 Apps Script 編輯器

**方法 A（推薦）：從 Google Sheet**

1. 在 Google Sheet 中點擊菜單 → 「延伸功能」
2. 選擇「Apps Script」
3. 系統會自動建立新的 Apps Script 專案

**方法 B：直接從 Apps Script 網站**

1. 訪問 [script.google.com](https://script.google.com)
2. 點擊左上角「建立新專案」或「新增專案」
3. 給專案命名（例如：「Link Cloak Webhook」）

### 2.2 檢查編輯器界面

```
Google Apps Script 編輯器
├─ 左側菜單
│  ├─ 檔案（包含 Code.gs）
│  ├─ 執行日誌
│  └─ 部署
├─ 中央代碼編輯區
│  ├─ 選項卡：Code.gs
│  └─ [編輯程式碼]
└─ 右側
   ├─ 執行 / 調試按鈕
   └─ 函數下拉菜單
```

---

## 第 3 步：複製程式碼

### 3.1 清除預設程式碼

1. 在 `Code.gs` 中，選擇所有預設程式碼（Ctrl+A）
2. 按 Delete 鍵清除

### 3.2 複製完整程式碼

1. 從 [完整程式碼](./GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md) 複製所有內容
2. 貼到 `Code.gs` 編輯器中
3. 按 Ctrl+S 保存

程式碼應包含以下函數：

```
Code.gs 應包含的函數：
├─ doPost(e)             - 主要處理函數
├─ addHeaderRow(sheet)   - 新增標題列
├─ createResponse()      - 建立回應
└─ testDoPost()          - 測試函數
```

### 3.3 驗證代碼無誤

1. 檢查是否有紅色波浪線（語法錯誤）
2. 如有錯誤，確保：
   - 所有大括號和引號都配對
   - 所有分號都在行尾
   - 函數名稱拼寫正確

---

## 第 4 步：測試程式碼（選擇性但推薦）

### 4.1 在編輯器中執行測試

1. 在函數下拉菜單選擇 `testDoPost`
2. 點擊上方的「執行」按鈕
3. 第一次執行時，系統會要求授權
   - 點擊「檢閱權限」
   - 選擇您的 Google 帳號
   - 點擊「允許」

### 4.2 查看測試結果

1. 點擊「執行日誌」標籤
2. 應看到類似內容：
   ```
   {
     "success": true,
     "message": "成功新增 2 列",
     "timestamp": "2024-11-19T10:30:00.000Z",
     "addedRows": 2,
     "totalRows": 2
   }
   ```

### 4.3 檢查 Google Sheet

1. 回到您的 Google Sheet
2. 應該看到新增的標題列和測試資料：

| 時間 | 標題 | 蟑螂分潤網連結 | 圖片URL |
|-----|------|-------------|--------|
| 2024-11-19 10:30:00 | 測試文章 1 | https://linclab.vercel.app/abc123 | https://example.com/image1.jpg |
| 2024-11-19 10:35:00 | 測試文章 2 | https://linclab.vercel.app/def456 | https://example.com/image2.jpg |

---

## 第 5 步：部署 Web App

### 5.1 進入部署設定

1. 在 Apps Script 編輯器左側點擊「部署」
2. 點擊「新增部署」按鈕

### 5.2 設定部署參數

在「選擇類型」下拉菜單中：

1. 點擊齒輪圖標
2. 選擇「Web 應用程式」
3. 設定以下選項：

| 選項 | 設定值 |
|-----|-------|
| **執行位置** | 選擇您的 Google 帳號 |
| **誰可以存取** | 選擇「任何人」 |
| **描述** | 例如：「Shopee Link Cloak Webhook」 |

### 5.3 部署

1. 點擊「部署」按鈕
2. 系統會顯示「部署成功」訊息
3. 複製顯示的部署 URL

部署 URL 格式：
```
https://script.google.com/macros/d/{deploymentId}/usercontent
```

**重要：保存此 URL，稍後需要貼到應用程式中**

### 5.4 驗證部署

1. 在新標籤頁中訪問部署 URL
2. 應該看到類似回應：
   ```json
   {
     "success": false,
     "message": "未收到資料",
     "timestamp": "2024-11-19T10:30:00.000Z"
   }
   ```

   這是正常的，因為直接訪問 URL 不會發送任何資料。

---

## 第 6 步：在應用程式中設定

### 6.1 前往設定頁面

1. 登入 Shopee Link Cloak 應用程式
2. 進入「設定」或「自動化」頁面
3. 找到「Google Sheets 整合」或「Google Sheets 設定」選項

### 6.2 輸入設定資訊

填入以下欄位：

| 欄位 | 值 | 範例 |
|-----|---|------|
| **Google Sheet URL** | Sheet 的完整 URL | `https://docs.google.com/spreadsheets/d/1a2b3c4d.../edit` |
| **或 Spreadsheet ID** | 從 URL 提取的 ID | `1a2b3c4d5e6f7g8h9i0j` |
| **工作表名稱** | 工作表的名稱 | `Sheet1` 或 `工作表1` |
| **Web App URL** | Apps Script 部署 URL | `https://script.google.com/macros/d/...` |

### 6.3 測試連接

1. 點擊「測試連接」或「驗證」按鈕
2. 系統會嘗試連接到您的 Google Sheet
3. 看到「連接成功」提示後，表示設定正確

### 6.4 啟用自動推送

1. 如有「啟用自動推送」選項，勾選此項
2. 點擊「保存」或「更新設定」
3. 完成！

---

## 第 7 步：執行推送測試

### 7.1 使用應用程式推送資料

1. 在應用程式中建立或運行機器人
2. 生成短連結
3. 點擊「推送到 Google Sheets」或類似按鈕
4. 看到成功提示

### 7.2 檢查結果

1. 打開您的 Google Sheet
2. 應該看到新的資料列自動新增
3. 驗證欄位順序和內容是否正確：

| 時間 | 標題 | 蟑螂分潤網連結 | 圖片URL |
|-----|------|-------------|--------|
| 2024-11-19 10:30:00 | 真實商品標題 | https://linclab.vercel.app/xyz789 | [商品圖片URL] |

---

## 故障排除

### 症狀 1：「無法開啟試算表」錯誤

**原因：** Apps Script 無法存取 Google Sheet

**解決方案：**
1. 確認 Google Sheet 的共用設定為「任何知道連結的人都能編輯」
2. 重新檢查 Spreadsheet ID 是否複製正確
3. 在 Apps Script 中手動執行 testDoPost()，檢查錯誤日誌

### 症狀 2：部署 URL 無法訪問

**原因：** 部署設定不正確

**解決方案：**
1. 在 Apps Script 中點擊「部署」> 「管理部署」
2. 檢查部署類型是否為「Web 應用程式」
3. 確認「誰可以存取」設定為「任何人」
4. 刪除舊部署，建立新部署

### 症狀 3：資料沒有新增到 Sheet

**原因：** 可能是網路問題或設定不正確

**解決方案：**
1. 檢查應用程式設定中的 Spreadsheet ID 和 Web App URL
2. 在 Apps Script 執行日誌中查看錯誤訊息
3. 嘗試手動推送單筆資料進行測試
4. 檢查瀏覽器控制台的網路請求

### 症狀 4：標題列不正確或位置錯誤

**原因：** 之前手動編輯了 Sheet

**解決方案：**
1. 刪除現有的資料和標題列
2. 重新運行推送，Apps Script 會自動新增正確的標題列
3. 或手動新增標題列：`時間`、`標題`、`蟑螂分潤網連結`、`圖片URL`

---

## 完整工作流程圖

```
開始
  ↓
[1] 建立 Google Sheet → 複製 ID、設定權限
  ↓
[2] 建立 Apps Script → 複製程式碼
  ↓
[3] 測試（可選） → 執行 testDoPost()、檢查結果
  ↓
[4] 部署 Web App → 複製部署 URL
  ↓
[5] 在應用程式設定 → 輸入 ID 和 URL、測試連接
  ↓
[6] 啟用推送 → 勾選「啟用自動推送」
  ↓
[7] 運行機器人 → 生成內容並推送
  ↓
[8] 驗證結果 → 檢查 Google Sheet
  ↓
完成！
```

---

## 常見問題解答

**Q: 可以使用已有的 Google Sheet 嗎？**
A: 可以。直接複製其 Spreadsheet ID，Apps Script 會自動新增標題列（如果是空表）。

**Q: 部署後需要再點擊什麼嗎？**
A: 不需要。部署後，應用程式會自動調用部署 URL，您只需要在應用程式中進行推送操作即可。

**Q: 如何更新 Apps Script？**
A: 修改程式碼後，在編輯器點擊「部署」> 「管理部署」，找到對應的部署點擊編輯，系統會自動更新。

**Q: 多個人可以共享同一個 Sheet 嗎？**
A: 可以。將 Sheet URL 和 Apps Script 部署 URL 共享給其他人即可，他們可以在各自的應用中設定。

**Q: 如何監控推送日誌？**
A: 在 Apps Script 編輯器點擊「執行日誌」標籤，可以看到所有推送的詳細記錄。

---

## 下一步

設定完成後，您可以：

1. ✅ 自動推送機器人生成的內容到 Google Sheet
2. ✅ 與團隊成員共享試算表進行協作
3. ✅ 使用 Google Sheets 的功能進行分析和統計
4. ✅ 建立儀表板和圖表來視覺化數據

---

## 需要幫助？

如有問題：

1. **檢查執行日誌**：Apps Script 編輯器 → 執行日誌
2. **測試函數**：執行 testDoPost() 查看詳細錯誤
3. **驗證設定**：確保所有 ID 和 URL 都正確複製
4. **查閱文件**：
   - [完整設定指南](./GOOGLE_APPS_SCRIPT_SETUP.md)
   - [快速參考卡](./GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md)
   - [欄位順序更新](./FIELD_ORDER_UPDATE.md)

---

**文件版本：** 1.0
**最後更新：** 2024-11-19
