# 從這裡開始 - Google Sheets 整合快速指南

歡迎！本文件幫助您快速開始 Google Sheets 整合。根據您的情況，選擇適合的指南。

---

## 您是哪一種用戶？

### 🚀 選項 A：我想快速開始（5-10 分鐘）

**您適合閱讀：**
1. **本文件** - 了解整體概況（3 分鐘）
2. **GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md** - 複製程式碼並快速設定（5 分鐘）

**成果：**
- 完整可用的 Google Apps Script
- 部署 URL 準備好
- 應用程式已連接 Google Sheets

👉 **[前往快速參考](./GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md)**

---

### 📚 選項 B：我需要詳細的逐步教程

**您適合閱讀：**
1. **本文件** - 了解整體概況（3 分鐘）
2. **APPS_SCRIPT_STEP_BY_STEP.md** - 跟著 7 步逐一完成（20 分鐘）
3. 遇到問題時查看 **GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md**

**成果：**
- 完全理解每個步驟
- 能夠自行排除問題
- 掌握所有細節

👉 **[前往詳細教程](./APPS_SCRIPT_STEP_BY_STEP.md)**

---

### 🔧 選項 C：我是開發者，想深入了解

**您適合閱讀：**
1. **GOOGLE_SHEETS_INTEGRATION_README.md** - 整體概覽（10 分鐘）
2. **GOOGLE_APPS_SCRIPT_SETUP.md** - 完整技術參考（30 分鐘）
3. **FIELD_ORDER_UPDATE.md** - 理解欄位變更和實現（15 分鐘）

**成果：**
- 完整的技術理解
- 能夠自訂和擴展功能
- 掌握所有 API 細節

👉 **[前往完整指南](./GOOGLE_SHEETS_INTEGRATION_README.md)**

---

### ⬆️ 選項 D：我有現有系統需要升級

**您適合閱讀：**
1. **FIELD_ORDER_UPDATE.md** - 了解變更和遷移方案（15 分鐘）
2. **GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md** - 取得新程式碼（5 分鐘）
3. **APPS_SCRIPT_STEP_BY_STEP.md** - 重新部署（20 分鐘）

**成果：**
- 現有資料成功遷移
- 系統升級完成
- 新欄位順序正常使用

👉 **[前往升級指南](./FIELD_ORDER_UPDATE.md)**

---

## 新欄位順序一覽

系統已更新為以下欄位順序（重要！）：

```
Google Sheet 中的欄位：

A 欄 (第 1 個) → 時間 (created_at)
B 欄 (第 2 個) → 標題 (title)
C 欄 (第 3 個) → 蟑螂分潤網連結 (short_url)
D 欄 (第 4 個) → 圖片URL (og_image)

範例資料：
A: 2024-11-19 10:30:00
B: 我的商品
C: https://linclab.vercel.app/abc123
D: https://example.com/image.jpg
```

---

## 核心步驟（所有人都相同）

無論選擇哪個指南，設定過程都包含這 5 個核心步驟：

```
1️⃣ 建立 Google Sheet
   └─ 複製 Spreadsheet ID

2️⃣ 建立 Google Apps Script
   └─ 複製程式碼到 Code.gs

3️⃣ 部署 Web App
   └─ 複製部署 URL

4️⃣ 在應用程式設定
   └─ 輸入 ID、URL、工作表名稱

5️⃣ 啟用推送
   └─ 測試連接、啟用自動推送
```

**所有文件都遵循這個流程，只是詳細程度不同。**

---

## 我應該選擇哪個？

| 您的情況 | 推薦文件 | 預計時間 |
|---------|--------|--------|
| 初次設定，想快速完成 | QUICK_REFERENCE | 10 分鐘 |
| 初次設定，想理解每步 | STEP_BY_STEP | 25 分鐘 |
| 是開發者，需要細節 | SETUP + README | 45 分鐘 |
| 有舊系統需要升級 | FIELD_ORDER_UPDATE | 30 分鐘 |
| 已設定好，現在有問題 | QUICK_REFERENCE 的故障排除 | 5 分鐘 |

---

## 所有文件一覽

### 📌 必讀文件

#### 1. **GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md** ⭐⭐⭐
- **長度：** 中等（~300 行）
- **深度：** 實用
- **包含：**
  - ✅ 完整可複製的程式碼
  - ✅ 5 分鐘快速步驟
  - ✅ 欄位對應表
  - ✅ 推送範例
  - ✅ 故障排除速查表
- **適合：** 所有人首先閱讀

#### 2. **APPS_SCRIPT_STEP_BY_STEP.md** ⭐⭐⭐
- **長度：** 詳細（~400 行）
- **深度：** 教學
- **包含：**
  - ✅ 7 大詳細步驟
  - ✅ 每步的操作說明
  - ✅ 工作流程圖
  - ✅ FAQ 和故障排除
  - ✅ 完整工作流程圖
- **適合：** 初學者或需要詳細指引

#### 3. **GOOGLE_APPS_SCRIPT_SETUP.md** ⭐⭐⭐
- **長度：** 完整（~500 行）
- **深度：** 技術參考
- **包含：**
  - ✅ 設定步驟和代碼解釋
  - ✅ 程式邏輯說明
  - ✅ 欄位詳細說明
  - ✅ curl 測試示例
  - ✅ 安全建議
- **適合：** 開發者或需要深入理解

#### 4. **FIELD_ORDER_UPDATE.md** ⭐⭐⭐
- **長度：** 中等（~350 行）
- **深度：** 技術實現
- **包含：**
  - ✅ 新舊欄位對比
  - ✅ TypeScript 更新
  - ✅ API 實現範例
  - ✅ 資料遷移方案
  - ✅ 測試清單
- **適合：** 有現有系統需要升級的用戶

#### 5. **GOOGLE_SHEETS_INTEGRATION_README.md** ⭐⭐⭐
- **長度：** 綜合（~600 行）
- **深度：** 綜合參考
- **包含：**
  - ✅ 文件導覽
  - ✅ 整體概念說明
  - ✅ 快速查詢表
  - ✅ 故障排除指南
  - ✅ 進階主題
- **適合：** 需要全面參考的用戶

#### 6. **GOOGLE_SHEETS_START_HERE.md** ⭐⭐⭐
- **您正在閱讀的文件！**
- 幫助您選擇正確的指南

---

## 我現在應該做什麼？

### 如果您選擇了快速開始（選項 A）：
1. 打開 [GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md](./GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md)
2. 複製「完整程式碼」部分
3. 跟著「設定步驟（5 分鐘快速版）」進行
4. 完成！

### 如果您選擇了詳細教程（選項 B）：
1. 打開 [APPS_SCRIPT_STEP_BY_STEP.md](./APPS_SCRIPT_STEP_BY_STEP.md)
2. 從「第 1 步：準備 Google Sheet」開始
3. 跟著每一步進行，可參考截圖和說明
4. 遇到問題時查看故障排除部分

### 如果您選擇了深入學習（選項 C）：
1. 先閱讀本文件的「新欄位順序一覽」部分
2. 打開 [GOOGLE_SHEETS_INTEGRATION_README.md](./GOOGLE_SHEETS_INTEGRATION_README.md)
3. 理解整體架構和工作流程
4. 深入閱讀 [GOOGLE_APPS_SCRIPT_SETUP.md](./GOOGLE_APPS_SCRIPT_SETUP.md)
5. 最後查看 [FIELD_ORDER_UPDATE.md](./FIELD_ORDER_UPDATE.md) 了解實現細節

### 如果您需要升級系統（選項 D）：
1. 打開 [FIELD_ORDER_UPDATE.md](./FIELD_ORDER_UPDATE.md)
2. 跟著「遷移現有資料」部分進行
3. 按照「欄位順序更新」實施代碼更新
4. 完成測試清單

---

## 常見問題（超短版）

**Q: 我完全不懂 Google Apps Script，應該看哪個文件？**
A: 看 APPS_SCRIPT_STEP_BY_STEP.md，它包含每個步驟的詳細說明。

**Q: 我只想快速完成設定，不想看太多文字。**
A: 看 GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md 的「完整程式碼」和「設定步驟（5 分鐘快速版）」。

**Q: 設定好後資料不出現，我應該怎麼辦？**
A:
1. 查看 GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md 的「故障排除」表
2. 查看 APPS_SCRIPT_STEP_BY_STEP.md 的「故障排除」部分
3. 在 Google Apps Script 編輯器檢查執行日誌

**Q: 我想修改欄位順序或新增自訂邏輯。**
A: 看 GOOGLE_APPS_SCRIPT_SETUP.md 的「程式碼解釋」部分和 GOOGLE_SHEETS_INTEGRATION_README.md 的「進階主題」。

**Q: 我有舊的系統，資料需要怎麼轉移？**
A: 完整看 FIELD_ORDER_UPDATE.md，它有多個遷移方案。

---

## 重要提示

### 1. 請務必設定正確的權限
```
Google Sheet 必須設定為：
「任何知道連結的人都能編輯」
```

### 2. 程式碼必須包含所有 4 個函數
```
必須有：
✅ doPost(e)
✅ addHeaderRow(sheet)
✅ createResponse()
✅ testDoPost() （可選，但推薦用於測試）
```

### 3. 部署時必須選擇正確選項
```
類型：Web 應用程式（不是時間驅動）
執行位置：您的帳號
誰可以存取：任何人
```

### 4. 新欄位順序務必正確
```
A 欄 → 時間
B 欄 → 標題
C 欄 → 短連結
D 欄 → 圖片
```

---

## 文件大小參考

| 文件 | 大小 | 讀取時間 | 難度 |
|------|-----|--------|------|
| GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md | ~4 KB | 5-10 分鐘 | ⭐ 簡單 |
| APPS_SCRIPT_STEP_BY_STEP.md | ~6 KB | 20-30 分鐘 | ⭐⭐ 中等 |
| GOOGLE_APPS_SCRIPT_SETUP.md | ~8 KB | 30-40 分鐘 | ⭐⭐⭐ 進階 |
| FIELD_ORDER_UPDATE.md | ~5 KB | 15-20 分鐘 | ⭐⭐ 中等 |
| GOOGLE_SHEETS_INTEGRATION_README.md | ~10 KB | 20-30 分鐘 | ⭐⭐ 中等 |

所有文件都可線上閱讀，不需下載。

---

## 常用連結快速查詢

### Google 服務
- [Google Sheets](https://sheets.google.com) - 建立試算表
- [Google Apps Script](https://script.google.com) - 建立指令碼
- [Google Developers](https://developers.google.com/apps-script) - 官方文件

### 本專案文件
```
快速開始？
└─ GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md

需要詳細教程？
└─ APPS_SCRIPT_STEP_BY_STEP.md

想深入學習？
├─ GOOGLE_SHEETS_INTEGRATION_README.md
├─ GOOGLE_APPS_SCRIPT_SETUP.md
└─ FIELD_ORDER_UPDATE.md

已經設定好有問題？
└─ 各文件的「故障排除」部分

想升級現有系統？
└─ FIELD_ORDER_UPDATE.md
```

---

## 現在就開始！

選擇適合您的選項：

- **🚀 快速開始（5 分鐘）** → [GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md](./GOOGLE_APPS_SCRIPT_QUICK_REFERENCE.md)

- **📚 詳細教程（25 分鐘）** → [APPS_SCRIPT_STEP_BY_STEP.md](./APPS_SCRIPT_STEP_BY_STEP.md)

- **🔧 完整參考（45 分鐘）** → [GOOGLE_SHEETS_INTEGRATION_README.md](./GOOGLE_SHEETS_INTEGRATION_README.md)

- **⬆️ 升級指南** → [FIELD_ORDER_UPDATE.md](./FIELD_ORDER_UPDATE.md)

---

## 成功標誌

設定完成後，您應該看到：

✅ Google Sheets 中新增了 4 個欄位的標題列
✅ 推送後資料自動出現在 Sheet 中
✅ 欄位順序正確：時間、標題、短連結、圖片
✅ 應用程式顯示「推送成功」提示

如果您看到以上所有標誌，表示設定已完成！

---

## 反饋和支持

遇到問題？

1. **查閱故障排除**：各文件都有故障排除部分
2. **檢查執行日誌**：Google Apps Script 編輯器 → 執行日誌
3. **執行測試函數**：testDoPost() 可幫助診斷問題
4. **驗證設定**：確保所有 ID 和 URL 正確複製

---

**祝您設定順利！** 🎉

**文件版本：** 1.0
**最後更新：** 2024-11-19
