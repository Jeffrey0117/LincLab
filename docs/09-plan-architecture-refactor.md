# Plan 5: 重新規劃系統架構與 UX 流程

## 問題分析

### 目前的問題
1. **概念混淆**：「模式」、「模板」、「策略」三個概念混在一起
2. **分類不清**：外部連結模式、圖片策略本質上都是「模板」
3. **流程混亂**：用戶不清楚什麼時候選什麼
4. **自訂內容被忽略**：大部分用戶其實只想用模板，不需要自訂 HTML

### 核心洞察
- **90% 的用戶只需要模板**：填內容就好，不想寫 HTML
- **策略是獨立的**：不管用什麼模板，都可以套用任何轉換策略
- **模板 = 頁面布局**，**策略 = 轉換招數**

---

## 新架構設計

### 概念重新定義

#### 1. 內容模式（Content Mode）
用戶選擇如何呈現內容：

- **自訂內容模式**
  - 完全自由，可以寫 HTML
  - 適合進階用戶
  - 使用率：約 10%

- **模板模式**
  - 預設好布局，只需填內容
  - 適合所有用戶
  - 使用率：約 90%

#### 2. 模板類型（Template Types）
在模板模式下可選擇的頁面布局：

1. **圖片模板** 🖼️
   - 全屏顯示一張圖片
   - 適合：商品圖、活動海報
   - 需要填寫：圖片網址、替代文字

2. **外部連結預覽模板** 🔗
   - 顯示外部網站的 OG 卡片
   - 適合：假裝導向其他網站
   - 需要填寫：目標網址、預覽文案（可選）

3. **正妹圖片模板** 👧（新增）
   - 精美的圖片展示布局
   - 適合：吸睛的視覺內容
   - 需要填寫：圖片網址、標題、描述

4. **文章模板** 📝（新增）
   - Blog 風格的文章頁面
   - 適合：看起來像真實文章
   - 需要填寫：標題、內文、圖片（可選）

5. **影片模板** 🎬（新增）
   - 假的影片播放頁面
   - 適合：吸引點擊
   - 需要填寫：封面圖、標題、描述

6. **商品展示模板** 🛍️（新增）
   - 電商風格的商品頁
   - 適合：直接展示商品
   - 需要填寫：商品圖、名稱、價格、描述

#### 3. 轉換策略（Conversion Strategy）
不管用哪個模板，都可以套用的轉換招數：

**強制性高（推薦）：**
- 🛡️ 安全驗證：模擬 reCAPTCHA
- 🔞 年齡驗證：18+ 限制
- 📄 內容解鎖：需閱讀條款

**通用性高：**
- 🍪 Cookie 彈窗：標準通知


**較不推薦：**
- 👥 社交證明：持續通知
- ⬇️ 下載按鈕：較明顯
- ⏰ 倒計時：限時優惠感

---

## 新的 UX 流程

### 創建連結的步驟

#### Step 1: 基本設定
**目的**：設定分享時的外觀（OG Tags）和內部標題

**內容**：
- 網站標題（內部使用，方便管理）
- OG 標題（分享時顯示）
- OG 描述（分享時顯示）
- OG 圖片（分享時顯示）
- Favicon（可選）

**UI 設計**：
- 單頁表單
- 即時預覽社群分享卡片的樣子
- 有「跳過使用預設值」選項

#### Step 2: 選擇模式
**目的**：用戶選擇要自訂 HTML 還是用模板

**選項**：
```
┌────────────────────┐  ┌────────────────────┐
│  🎨 自訂內容模式    │  │  📋 模板模式        │
│                    │  │                    │
│  完全自由          │  │  快速建立          │
│  寫 HTML/CSS       │  │  只需填內容        │
│  適合進階用戶      │  │  適合所有人        │
│     VIP(PRO會員)    │  │  （推薦）          │
└────────────────────┘  └────────────────────┘
```

#### Step 3a: 自訂內容模式流程
如果選擇「自訂內容模式」：

1. **填寫 HTML 內容**
   - 提供程式碼編輯器
   - 即時預覽

2. **選擇轉換策略**
   - 從策略清單選擇
   - 配置策略細節

3. **完成**

#### Step 3b: 模板模式流程
如果選擇「模板模式」：

1. **選擇模板類型**
   ```
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │ 🖼️ 圖片模板  │ │ 🔗 外部連結  │ │ 👧 正妹圖片  │
   └─────────────┘ └─────────────┘ └─────────────┘

   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │ 📝 文章模板  │ │ 🎬 影片模板  │ │ 🛍️ 商品展示  │
   └─────────────┘ └─────────────┘ └─────────────┘
   ```
(這邊用templates那邊的卡片來應該不錯)


2. **填寫模板內容**你
   - 根據選擇的模板，顯示對應的表單
   - 例如圖片模板：圖片網址、替代文字、顯示模式
   - 例如文章模板：標題、內文、配圖

3. **選擇轉換策略**
   - 從策略清單選擇
   - 配置策略細節
   - 顯示「推薦」標籤在強制性高的策略上

4. **預覽與完成**
   - 即時預覽最終效果
   - 確認後創建

---

## UI/UX 改進方案

### 1. CreateLinkFlow 重構

**現狀**：
```
選擇模式 → 進入對應編輯器
├─ 自訂內容 → CustomContentEditorV2
└─ 外部連結 → ExternalLinkEditor
```

**問題**：
- 兩個編輯器重複了很多邏輯
- 外部連結不應該是「模式」，應該是「模板」

**新架構**：
```
Step 1: 基本設定（BasicInfoEditor）
  ├─ 網站標題
  ├─ OG Tags
  └─ Favicon

Step 2: 選擇模式（ModeSelector）
  ├─ 自訂內容模式
  └─ 模板模式

Step 3a: 自訂內容編輯器（CustomContentEditor）
  ├─ HTML 編輯器
  ├─ 選擇策略
  └─ 配置策略

Step 3b: 模板編輯器（TemplateEditor）
  ├─ 選擇模板類型（TemplateTypeSelector）
  ├─ 填寫模板內容（根據類型動態顯示表單）
  ├─ 選擇策略
  └─ 配置策略

Step 4: 預覽與確認（PreviewAndConfirm）
  ├─ 即時預覽
  ├─ 帳號/標籤設定
  └─ 創建按鈕
```

### 2. 統一的策略選擇器

**設計原則**：
- 策略選擇器在所有流程中共用
- 視覺上分組：「推薦策略」、「其他策略」
- 提供「策略預覽」功能，可以看效果

**UI 組件**：
```tsx
<StrategySelector
  value={strategy}
  onChange={setStrategy}
  mode="grouped" // 分組顯示
  showPreview={true} // 顯示預覽按鈕
/>
```

### 3. 模板類型選擇器

**新組件**：`TemplateTypeSelector`

**功能**：
- 卡片式布局展示所有模板
- 每個模板有：icon、名稱、描述、適用場景
- 可以「預覽模板」看實際效果
- 有「推薦」標籤在常用模板上

**UI 設計**：
```
┌──────────────────────────────────┐
│  🖼️  圖片模板            [推薦]   │
│  全屏顯示圖片，適合商品或海報    │
│  [預覽模板] [選擇此模板]         │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  🔗  外部連結預覽                │
│  顯示外部網站卡片，看起來像轉址   │
│  [預覽模板] [選擇此模板]         │
└──────────────────────────────────┘
```

---

## 資料結構調整

### 資料庫 schema 需要新增欄位

```sql
ALTER TABLE links ADD COLUMN content_mode VARCHAR(20);
-- 值: 'custom' | 'template'

ALTER TABLE links ADD COLUMN template_type VARCHAR(50);
-- 值: 'image' | 'external_link' | 'beauty' | 'article' | 'video' | 'product' | null

ALTER TABLE links ADD COLUMN template_config JSONB;
-- 儲存模板特定的配置
```

### TypeScript 類型定義

```typescript
// 內容模式
type ContentMode = 'custom' | 'template';

// 模板類型
type TemplateType =
  | 'image'           // 圖片模板
  | 'external_link'   // 外部連結預覽
  | 'beauty'          // 正妹圖片
  | 'article'         // 文章模板
  | 'video'           // 影片模板
  | 'product';        // 商品展示

// 模板配置（根據類型不同）
interface ImageTemplateConfig {
  imageUrl: string;
  altText?: string;
  fitMode?: 'cover' | 'contain' | 'fill';
}

interface ExternalLinkTemplateConfig {
  targetUrl: string;
  customTitle?: string;
  customDescription?: string;
  customImage?: string;
}

interface BeautyTemplateConfig {
  images: string[]; // 多張圖片
  title: string;
  description?: string;
  layout?: 'grid' | 'carousel' | 'masonry';
}

// ... 其他模板配置
```

---

## 開發優先級

### Phase 1: 重構核心流程（優先）✅
1. ✅ 創建 plan-5.md（本文檔）
2. ✅ 創建新的 BasicInfoEditor 組件
3. ✅ 重構 ModeSelector（改為內容模式選擇）
4. ✅ 創建 TemplateTypeSelector 組件
5. ✅ 創建 TemplateEditor 組件
6. ✅ 更新 TypeScript 類型定義（strategy-types.ts）
7. ✅ 重構 CreateLinkFlow 採用新流程
8. ✅ 創建資料庫 migration 檔案
9. 🔲 執行資料庫 migration（需在線上 Supabase Dashboard 執行）

### Phase 2: 實作新模板（次要）✅
1. ✅ 正妹圖片模板（支援輪播、網格、瀑布流三種布局）
2. ✅ 文章模板（Medium 風格部落格）
3. ✅ 影片模板（YouTube 風格播放頁）
4. ✅ 商品展示模板（Shopee 風格商品頁）

### Phase 3: UX 優化（最後）✅
1. ✅ 統一的策略選擇器（分組顯示推薦/其他策略）
2. ✅ 模板預覽功能（範例資料 + 預覽對話框）
3. ✅ 搜尋與摺疊功能
4. ✅ 簡化連結標題設定（改用直接輸入）

---

## 用戶體驗示意圖

### 情境 1：小白用戶想快速建立圖片連結

```
1. 點擊「創建新連結」
2. [Step 1] 快速填寫標題、描述 → 點「下一步」
3. [Step 2] 選擇「📋 模板模式」（推薦）
4. [Step 3] 選擇「🖼️ 圖片模板」
5. [Step 4] 貼上圖片網址
6. [Step 5] 選擇「🛡️ 安全驗證」策略（推薦）
7. [Step 6] 預覽效果 → 確認創建 ✅
```

**總步驟**：6 步
**預估時間**：< 1 分鐘

### 情境 2：進階用戶想自訂 HTML

```
1. 點擊「創建新連結」
2. [Step 1] 設定 OG Tags → 點「下一步」
3. [Step 2] 選擇「🎨 自訂內容模式」
4. [Step 3] 寫 HTML → 即時預覽
5. [Step 4] 選擇策略（可選）
6. [Step 5] 確認創建 ✅
```

**總步驟**：5 步
**預估時間**：3-5 分鐘

---

## 技術實作注意事項

### 1. 向下兼容
- 舊的 `link_mode` 欄位需要遷移到新的 `content_mode` + `template_type`
- 提供 migration script
- 舊連結正常運作

### 2. 組件複用
- BasicInfoEditor 在所有流程共用
- StrategySelector 在所有流程共用
- 模板配置表單可以模組化

### 3. 效能考量
- 模板預覽使用 lazy loading
- 圖片預載入
- 適當的 code splitting

---

## 總結

### 核心改進
1. **概念清晰化**：內容模式（自訂/模板）→ 模板類型 → 轉換策略
2. **流程簡化**：分步驟引導，每步只做一件事
3. **降低門檻**：90% 用戶只需要模板，不用碰 HTML
4. **提高靈活性**：模板 + 策略可以任意組合

### 預期效果
- 新用戶 30 秒內完成第一個連結
- 減少 50% 的用戶困惑
- 提高 3 倍的轉換率
- 更好的擴展性（未來可以輕鬆加新模板）

---

## 下一步行動

1. ✅ Review 此 plan，確認方向正確
2. ✅ 開始 Phase 1 開發
3. 🔲 在線上 Supabase Dashboard 執行 migration（檔案位置：`supabase/migrations/20251112000001_add_content_mode_and_template.sql`）
4. 🔲 測試新的創建連結流程
5. 🔲 Phase 2：實作新模板（beauty, article, video, product）
6. 🔲 Phase 3：UX 優化（策略分組顯示、預覽功能等）

---

## Phase 1 開發紀錄

**完成時間**：2025-11-12

**已完成的組件**：
- ✅ `src/components/link-creation/BasicInfoEditor.tsx` - Step 1 基本設定表單（含即時社群分享預覽）
- ✅ `src/components/link-creation/ModeSelector.tsx` - Step 2 內容模式選擇（custom/template）
- ✅ `src/components/link-creation/TemplateTypeSelector.tsx` - Step 3 模板類型選擇（6種模板）
- ✅ `src/components/link-creation/TemplateEditor.tsx` - Step 4 模板內容編輯（已實作 image 和 external_link）
- ✅ `src/components/link-creation/CreateLinkFlow.tsx` - 重構主流程，整合所有新組件

**已完成的資料結構**：
- ✅ TypeScript 類型定義：ContentMode, TemplateType, 各種 TemplateConfig
- ✅ Migration 檔案：`supabase/migrations/20251112000001_add_content_mode_and_template.sql`
- ✅ 向下兼容的資料遷移邏輯

**新的使用者流程**：
```
新建連結：
  Step 1: 基本設定（可跳過）
    ↓
  Step 2: 選擇模式（custom/template）
    ↓
  Step 3a: 自訂內容 → CustomContentEditorV2 → 完成
  Step 3b: 模板模式 → 選擇模板類型 → Step 4: 編輯模板內容 → 完成

編輯連結：
  直接進入對應編輯器（向下兼容）
```

**Phase 2 開發紀錄**：
- ✅ `BeautyTemplate.tsx` - 正妹圖片模板（輪播/網格/瀑布流）
- ✅ `ArticleTemplate.tsx` - 文章模板（Medium 風格）
- ✅ `VideoTemplate.tsx` - 影片模板（YouTube 風格）
- ✅ `ProductTemplate.tsx` - 商品展示模板（Shopee 風格）
- ✅ `TemplateEditor.tsx` - 整合所有模板的配置表單

**Phase 3 開發紀錄**：
- ✅ `StrategySelector.tsx` - 優化分組顯示、搜尋、摺疊功能
- ✅ `template-examples.ts` - 所有模板的範例資料
- ✅ `TemplatePreviewDialog.tsx` - 預覽對話框組件
- ✅ `BasicInfoEditor.tsx` - 簡化連結標題設定（改用直接輸入）
- ✅ `CustomContentEditorV2.tsx` - 移除重複的 Step 1

**最終系統功能**：
- 6 種模板類型全部完成（image, external_link, beauty, article, video, product）
- 8 種轉換策略（全部可與任何模板組合）
- 完整的預覽功能
- 優化的使用者體驗

---

**創建時間**：2025-11-12
**最終更新**：2025-11-12
**版本**：2.0
**狀態**：✅ Phase 1、2、3 全部完成
