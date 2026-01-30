# Plan 1: 多帳號批量管理系統

## 目標
建立一個能清楚管理多個帳號、批量連結的 Dashboard 系統，讓不同類型的帳號（正妹帳號、專業帳號等）能夠有效分類和管理大量蝦皮分潤連結。

---

## 核心問題

目前的 Dashboard 只能看到所有連結的列表，但無法：
1. 區分不同帳號的連結（正妹帳號 vs 專業帳號）
2. 批量管理同類型的連結
3. 追蹤不同策略的效果
4. 快速複製成功的連結模式

---

## 解決方案：新增頁面和功能

### 1. 帳號/分類管理系統

#### 資料庫設計
```sql
-- 新增 accounts 表
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,                    -- 例如："正妹帳號 - IG小模"
  type TEXT NOT NULL,                    -- 類型：beauty/professional/emotion/curiosity/lifestyle/benefit
  description TEXT,                      -- 描述
  avatar_url TEXT,                       -- 帳號頭像
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 修改 links 表，新增 account_id
ALTER TABLE links
ADD COLUMN account_id UUID REFERENCES accounts(id),
ADD COLUMN tags TEXT[];                  -- 標籤陣列，例如：['正妹', 'IG', '夏日穿搭']
```

#### 帳號類型（對應 strategy.md）
1. **外貌吸引型 (beauty)** - 正妹、帥哥、IG小模
2. **專業資料型 (professional)** - 教學、PDF、懶人包
3. **情緒反應型 (emotion)** - 八卦、爭議、留言戰
4. **好奇心型 (curiosity)** - 冷知識、驚奇故事
5. **生活共鳴型 (lifestyle)** - 搞笑、廢文、迷因
6. **利益誘因型 (benefit)** - 免費資源、折扣、抽獎

---

### 2. 新頁面結構

```
/dashboard
├── /overview           ← 總覽（新增）
├── /accounts           ← 帳號管理（新增）
├── /links              ← 連結管理（現有，改進）
├── /analytics          ← 數據分析（新增）
└── /templates          ← 模板庫（新增）
```

---

### 3. 各頁面詳細設計

#### 3.1 總覽頁面 `/overview`

**目的：** 一眼看到所有帳號的關鍵數據

**內容：**
- 總連結數、總點擊數、總轉換數
- 各帳號的卡片展示（顯示名稱、類型、連結數、本週點擊數）
- 最近 7 天的趨勢圖
- 熱門連結 Top 10

**UI 草稿：**
```
┌────────────────────────────────────────┐
│ 📊 總覽                                 │
├────────────────────────────────────────┤
│ [總連結: 156] [總點擊: 12.3K] [轉換: 234] │
├────────────────────────────────────────┤
│ 我的帳號：                               │
│ ┌──────┐ ┌──────┐ ┌──────┐             │
│ │ 👩 正妹│ │ 📚 專業│ │ 😂 廢文│             │
│ │ 45連結│ │ 32連結│ │ 28連結│             │
│ │ 2.3K點│ │ 1.8K點│ │ 3.1K點│             │
│ └──────┘ └──────┘ └──────┘             │
├────────────────────────────────────────┤
│ 📈 本週趨勢圖                            │
└────────────────────────────────────────┘
```

---

#### 3.2 帳號管理頁面 `/accounts`

**目的：** 新增、編輯、刪除帳號

**功能：**
- 列出所有帳號
- 每個帳號卡片顯示：
  - 帳號名稱、類型、描述
  - 連結數量、本週點擊數
  - [進入管理] [編輯] [刪除] 按鈕
- [新增帳號] 按鈕

**新增帳號對話框：**
```
┌────────────────────────────┐
│ 新增帳號                    │
├────────────────────────────┤
│ 帳號名稱: [___________]     │
│ 類型: [下拉選單▼]           │
│   ├ 👩 外貌吸引型           │
│   ├ 📚 專業資料型           │
│   ├ 😡 情緒反應型           │
│   ├ 🤔 好奇心型             │
│   ├ 😂 生活共鳴型           │
│   └ 🎁 利益誘因型           │
│ 描述: [___________]         │
│ 頭像URL: [___________]      │
│         [取消] [創建]       │
└────────────────────────────┘
```

---

#### 3.3 連結管理頁面 `/links` (改進版)

**新增功能：**

1. **帳號篩選器**
   - 下拉選單選擇帳號
   - 顯示該帳號的所有連結

2. **標籤系統**
   - 每個連結可以加多個標籤
   - 例如：`#正妹` `#夏日穿搭` `#IG小模`
   - 可以按標籤篩選

3. **批量操作**
   - 勾選多個連結
   - 批量停用/啟用
   - 批量刪除
   - 批量加標籤
   - 批量複製（生成新的短網址，但內容相同）

4. **進階搜尋**
   - 按標題搜尋
   - 按標籤搜尋
   - 按策略類型搜尋
   - 按建立日期搜尋

**UI 草稿：**
```
┌────────────────────────────────────────┐
│ 🔗 連結管理                             │
├────────────────────────────────────────┤
│ [帳號: 正妹帳號▼] [標籤: 全部▼] [搜尋___] │
│ [☑ 批量操作▼]          [+ 新增連結]     │
├────────────────────────────────────────┤
│ [☑] | 短碼 | 標題 | 策略 | 點擊 | 狀態   │
│ [☑] | abc123 | AirPods評測 | 下載 | 234 | ✅ │
│ [☑] | def456 | 正妹穿搭 | Cookie | 567 | ✅ │
│ [ ] | ghi789 | 免費資源 | 下載 | 89  | ❌ │
└────────────────────────────────────────┘
```

---

#### 3.4 數據分析頁面 `/analytics`

**目的：** 追蹤各帳號、各策略的效果

**內容：**
1. **帳號對比**
   - 圖表顯示各帳號的點擊數、轉換率
   - 按時間範圍篩選（7天/30天/90天）

2. **策略效果**
   - Cookie 彈窗 vs 下載按鈕的轉換率
   - 哪種策略最有效

3. **熱門連結**
   - Top 20 最多點擊的連結
   - 按帳號分類

4. **標籤分析**
   - 哪些標籤的連結表現最好
   - 例如：`#正妹` 標籤的平均點擊數

**UI 草稿：**
```
┌────────────────────────────────────────┐
│ 📊 數據分析                             │
├────────────────────────────────────────┤
│ 時間範圍: [最近 7 天▼]                  │
├────────────────────────────────────────┤
│ 帳號點擊數對比：                         │
│ ████████████ 正妹帳號 (45%)             │
│ ████████     專業帳號 (30%)             │
│ █████        廢文帳號 (25%)             │
├────────────────────────────────────────┤
│ 策略效果：                               │
│ Cookie 彈窗: 轉換率 12%                  │
│ 下載按鈕:   轉換率 18% ⬆️                │
└────────────────────────────────────────┘
```

---

#### 3.5 模板庫頁面 `/templates`

**目的：** 快速複製成功的連結模式

**功能：**
- 儲存成功的連結配置為模板
- 包含：HTML 內容、策略配置、OG tags、標籤
- 可以從模板快速創建新連結（只需改蝦皮連結）

**使用場景：**
- 你發現「正妹穿搭」類型的連結很有效
- 把它存成模板
- 未來可以快速創建 50 個類似的連結，只需換不同的蝦皮商品

**UI 草稿：**
```
┌────────────────────────────────────────┐
│ 📝 模板庫                               │
├────────────────────────────────────────┤
│ [+ 新增模板]            [搜尋: ______]  │
├────────────────────────────────────────┤
│ 模板列表：                               │
│ ┌──────────────────────────────────┐   │
│ │ 👩 正妹穿搭模板                    │   │
│ │ 策略: 下載按鈕 | 標籤: #正妹 #穿搭  │   │
│ │ [使用模板] [編輯] [刪除]           │   │
│ └──────────────────────────────────┘   │
│ ┌──────────────────────────────────┐   │
│ │ 📚 免費資源模板                    │   │
│ │ 策略: Cookie | 標籤: #免費 #資源   │   │
│ │ [使用模板] [編輯] [刪除]           │   │
│ └──────────────────────────────────┘   │
└────────────────────────────────────────┘
```

---

## 4. 實作優先順序

### Phase 1: 基礎架構（1-2 天）
1. 建立 `accounts` 資料表
2. 修改 `links` 資料表，新增 `account_id` 和 `tags`
3. 建立基本的 API routes

### Phase 2: 帳號管理（2-3 天）
1. `/accounts` 頁面
2. 新增/編輯/刪除帳號功能
3. 更新 CreateLinkDialog，加上選擇帳號的下拉選單

### Phase 3: 改進連結管理（2-3 天）
1. 帳號篩選器
2. 標籤系統（新增標籤、按標籤篩選）
3. 批量操作（停用、刪除、加標籤）

### Phase 4: 總覽和分析（2-3 天）
1. `/overview` 總覽頁面
2. `/analytics` 數據分析頁面
3. 整合圖表庫（如 recharts）

### Phase 5: 模板系統（1-2 天）
1. 建立 `templates` 資料表
2. `/templates` 模板庫頁面
3. 從模板創建連結功能

---

## 5. 資料庫 Schema 完整版

```sql
-- 帳號表
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('beauty', 'professional', 'emotion', 'curiosity', 'lifestyle', 'benefit')),
  description TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 修改 links 表
ALTER TABLE links
ADD COLUMN account_id UUID REFERENCES accounts(id),
ADD COLUMN tags TEXT[] DEFAULT '{}',
ADD COLUMN click_count INTEGER DEFAULT 0,
ADD COLUMN conversion_count INTEGER DEFAULT 0;

-- 建立索引
CREATE INDEX idx_links_account_id ON links(account_id);
CREATE INDEX idx_links_tags ON links USING GIN(tags);

-- 模板表
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  account_id UUID REFERENCES accounts(id),
  name TEXT NOT NULL,
  html_content TEXT NOT NULL,
  strategy TEXT NOT NULL,
  strategy_config JSONB,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  favicon_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 點擊記錄表（用於分析）
CREATE TABLE link_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES links(id) NOT NULL,
  clicked_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  converted BOOLEAN DEFAULT FALSE
);

-- 建立索引
CREATE INDEX idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX idx_link_clicks_clicked_at ON link_clicks(clicked_at);
```

---

## 6. 技術實作要點

### 6.1 新增的 React 組件

```
src/components/
├── accounts/
│   ├── AccountCard.tsx          ← 帳號卡片
│   ├── AccountForm.tsx          ← 新增/編輯帳號表單
│   └── AccountSelector.tsx      ← 帳號選擇下拉選單
├── analytics/
│   ├── AccountComparisonChart.tsx  ← 帳號對比圖表
│   ├── StrategyEffectChart.tsx     ← 策略效果圖表
│   └── TopLinksTable.tsx           ← 熱門連結表格
├── links/
│   ├── LinkFilters.tsx          ← 篩選器組件
│   ├── LinkBatchActions.tsx     ← 批量操作工具列
│   └── TagInput.tsx             ← 標籤輸入組件
└── templates/
    ├── TemplateCard.tsx         ← 模板卡片
    └── TemplateForm.tsx         ← 新增/編輯模板表單
```

### 6.2 新增的頁面

```
src/app/
├── (authenticated)/
│   ├── overview/
│   │   └── page.tsx             ← 總覽頁面
│   ├── accounts/
│   │   └── page.tsx             ← 帳號管理頁面
│   ├── links/
│   │   └── page.tsx             ← 改進的連結管理頁面
│   ├── analytics/
│   │   └── page.tsx             ← 數據分析頁面
│   └── templates/
│       └── page.tsx             ← 模板庫頁面
```

### 6.3 API Routes

```
src/app/api/
├── accounts/
│   ├── route.ts                 ← GET/POST accounts
│   └── [id]/
│       └── route.ts             ← PUT/DELETE account
├── links/
│   ├── batch/
│   │   └── route.ts             ← 批量操作
│   └── [id]/
│       ├── clicks/
│       │   └── route.ts         ← 記錄點擊
│       └── route.ts             ← 更新連結
├── analytics/
│   └── route.ts                 ← 獲取統計數據
└── templates/
    ├── route.ts                 ← GET/POST templates
    └── [id]/
        └── route.ts             ← PUT/DELETE template
```

---

## 7. 使用情境示例

### 情境 1: 管理正妹帳號
1. 進入 `/accounts`，創建「正妹帳號 - IG小模」
2. 進入 `/templates`，創建「正妹穿搭模板」
3. 使用模板批量創建 50 個連結，每個連結對應不同的蝦皮商品
4. 在 `/links` 用帳號篩選器查看這 50 個連結
5. 在 `/analytics` 追蹤這批連結的效果

### 情境 2: 測試不同策略
1. 創建 2 個帳號：「正妹 A」和「正妹 B」
2. 正妹 A 全部用 Cookie 策略
3. 正妹 B 全部用下載按鈕策略
4. 在 `/analytics` 對比兩個帳號的轉換率
5. 找出最有效的策略

### 情境 3: 標籤分析
1. 為連結加上標籤：`#夏日穿搭` `#秋冬穿搭` `#運動穿搭`
2. 在 `/analytics` 查看哪個標籤的連結表現最好
3. 專注製作高效標籤的內容

---

## 8. 下一步行動

**立即開始：**
1. 你覺得這個計劃如何？有沒有要調整的？
2. 確認後，我會開始實作 Phase 1（資料庫）
3. 然後逐步完成各個功能

**需要討論的：**
- 還有沒有其他必要功能？
- UI/UX 的優先順序？
- 要不要加入更多自動化功能（例如：自動加標籤、AI 推薦策略）？

---

## 9. 預期成果

完成後你可以：
1. 清楚管理 10+ 個不同類型的帳號
2. 每個帳號輕鬆管理 100+ 個連結
3. 快速找到最有效的策略和內容類型
4. 用模板快速複製成功模式
5. 用數據驅動決策，不再瞎猜

**總結：從「連結列表」變成「專業的分潤管理系統」** 🚀
