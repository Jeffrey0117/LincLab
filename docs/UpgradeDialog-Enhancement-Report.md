# UpgradeDialog 強化報告

## 概述
根據 `membership-spec.md` 的要求，已成功強化升級提示彈窗系統 (`UpgradeDialog.tsx`)。

---

## 更新內容

### 1. Props 驗證 ✓
確認所有 Props 完全符合規範：

```typescript
interface UpgradeDialogProps {
  open: boolean;                    // 彈窗開啟狀態
  onOpenChange: (open: boolean) => void;  // 狀態變更回調
  currentTier: MembershipTier;      // 當前會員等級
  requiredTier: MembershipTier;     // 所需會員等級
  feature?: string;                  // 可選，功能名稱
  onUpgrade?: () => void;           // 可選，升級回調
}
```

### 2. 文案優化 ✓
簡化並優化文案，更符合 spec 要求：

**標題：**
- PRO: "此功能為 Pro 會員 專屬"（附 Lock 圖標）
- VIP: "此功能為 VIP 會員 專屬"（附 Crown 圖標）

**主文案：**
```
[功能名稱]
升級即可立即使用
```

**按鈕文案：**
- 取消按鈕：「取消」
- 升級按鈕：「立即升級 →」

### 3. 升級按鈕邏輯 ✓
智能導向到正確的 Portaly 付款頁面：

```typescript
const CHECKOUT_URLS = {
  PRO: 'https://portaly.cc/jeffby8/product/JLrcS7IGJXmIvKirTFct',
  VIP: 'https://portaly.cc/jeffby8/product/5DvRxuOwYSn7JIq5ZJNc',
};

const handleUpgrade = () => {
  const checkoutUrl = CHECKOUT_URLS[requiredTier];
  if (checkoutUrl) {
    window.open(checkoutUrl, '_blank');  // 新分頁開啟
    onUpgrade?.();
    onOpenChange(false);  // 自動關閉彈窗
  }
};
```

### 4. 方案比較展示 ✓
根據 `membership-spec.md` 顯示完整的方案資訊：

#### PRO 方案卡片：
- 價格：NT$350 / 月
- 標籤：早鳥優惠
- 配色：橘色到粉色漸層
- 功能清單：
  - 30 個短連結
  - 2 個自動化機器人
  - 3 個偽裝模板
  - 轉換追蹤分析
  - OG 偽裝技術
  - 搶先體驗新功能

#### VIP 方案卡片：
- 價格：NT$1,299 / 月
- 標籤：限量中
- 配色：紫色到粉色漸層
- 功能清單：
  - 無上限短連結
  - 無上限自動化機器人
  - 無上限偽裝模板
  - 專屬子網域
  - VIP LINE 群組
  - 模板自動更新
  - 優先技術支援
  - 進階課程與諮詢

### 5. 視覺設計優化 ✓

#### 配色方案：
- **PRO 漸層：** `from-orange-500 to-pink-500`
- **VIP 漸層：** `from-purple-600 to-pink-600`

#### 圖標使用：
- **PRO 鎖定：** Lock 圖標（橘色）
- **VIP 尊榮：** Crown 圖標（紫色）
- **功能勾選：** Check 圖標（白色，粗體）
- **升級導向：** ArrowRight 圖標

#### 卡片設計：
```tsx
<div className="bg-gradient-to-br {gradient} rounded-xl p-6 text-white shadow-lg">
  {/* 漸層背景 + 圓角 + 陰影 */}
</div>
```

#### 響應式設計：
- 對話框寬度：`sm:max-w-lg` (小螢幕最大寬度)
- 按鈕布局：行動裝置垂直排列，桌面水平排列
- 方案卡片：自適應內距和字體大小

### 6. 用戶體驗改進 ✓

1. **自動關閉：** 點擊「立即升級」後自動關閉彈窗
2. **新分頁開啟：** 使用 `window.open(..., '_blank')` 保留當前工作狀態
3. **視覺層次：** 大標題 + 副標題 + 方案卡片 + 方案對比指示器
4. **互動反饋：** 按鈕 hover 效果 (`hover:opacity-90`)
5. **無障礙設計：** 保持語義化 HTML 和 ARIA 屬性

---

## 使用範例

### 基本使用：
```tsx
import { UpgradeDialog } from '@/components/UpgradeDialog';

function MyComponent() {
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <>
      <button onClick={() => setShowUpgrade(true)}>
        創建連結
      </button>

      <UpgradeDialog
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        currentTier="FREE"
        requiredTier="PRO"
        feature="create_link"
      />
    </>
  );
}
```

### 配合 useUpgradeDialog Hook：
```tsx
import { useUpgradeDialog, UpgradeDialog } from '@/components/UpgradeDialog';

function MyComponent() {
  const { upgradeDialog, handleUpgradeRequired, closeDialog } = useUpgradeDialog();

  const handleCreateLink = async () => {
    try {
      await canCreateLink(userId);
      // 繼續創建連結...
    } catch (error) {
      if (error instanceof UpgradeRequiredError) {
        handleUpgradeRequired(error);
      }
    }
  };

  return (
    <>
      <button onClick={handleCreateLink}>創建連結</button>

      <UpgradeDialog
        open={upgradeDialog.open}
        onOpenChange={(open) => !open && closeDialog()}
        currentTier={upgradeDialog.currentTier}
        requiredTier={upgradeDialog.requiredTier}
        feature={upgradeDialog.feature}
      />
    </>
  );
}
```

---

## 測試方式

訪問測試頁面：**http://localhost:3000/test-upgrade-dialog**

測試場景：
1. 點擊「觸發 PRO 升級彈窗」查看 PRO 方案彈窗
2. 點擊「觸發 VIP 升級彈窗」查看 VIP 方案彈窗
3. 驗證彈窗文案、圖標、配色
4. 測試「取消」按鈕關閉彈窗
5. 測試「立即升級」按鈕開啟 Portaly 連結
6. 驗證響應式設計（縮放瀏覽器視窗）

---

## 完成清單

- [x] Props 確認並符合規範
- [x] 文案設計優化（簡潔有力）
- [x] 升級按鈕邏輯（智能導向 Portaly）
- [x] 方案比較展示（PRO/VIP 完整資訊）
- [x] 視覺設計強化（漸層、圖標、卡片）
- [x] 響應式設計（行動/桌面適配）
- [x] 用戶體驗優化（自動關閉、新分頁）
- [x] 創建測試頁面
- [x] 撰寫使用文檔

---

## 技術細節

### 依賴組件：
- `@/components/ui/dialog` (Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle)
- `@/components/ui/button` (Button)
- `@/components/ui/badge` (Badge)
- `lucide-react` (Lock, Crown, Check, ArrowRight)
- `@/lib/membership` (MembershipTier type)

### 檔案路徑：
- 主組件：`C:\Users\jeffb\Desktop\code\shopee-link-cloak\src\components\UpgradeDialog.tsx`
- 測試頁面：`C:\Users\jeffb\Desktop\code\shopee-link-cloak\src\app\test-upgrade-dialog\page.tsx`
- 規格文件：`C:\Users\jeffb\Desktop\code\shopee-link-cloak\membership-spec.md`

### 關鍵數據來源：
- Portaly 連結：`membership-spec.md` 第 90-92 行
- 方案價格：PRO NT$350/月，VIP NT$1,299/月
- 功能清單：根據 `membership-spec.md` 第 31-41 行

---

## 後續建議

1. **A/B 測試：** 測試不同文案對轉換率的影響
2. **動畫效果：** 考慮添加彈窗開啟/關閉的過渡動畫
3. **倒數計時：** 為「早鳥優惠」添加倒數計時器增加緊迫感
4. **社會證明：** 顯示已升級用戶數量或評價
5. **FAQ 連結：** 添加「了解更多」連結到定價頁面或 FAQ
6. **優惠碼輸入：** 未來可支援優惠碼輸入功能

---

## 截圖展示

由於當前環境限制，請訪問以下頁面查看實際效果：

**測試頁面：** http://localhost:3000/test-upgrade-dialog

**預期視覺效果：**

### PRO 升級彈窗：
- 標題帶 Lock 圖標
- 橘粉漸層卡片
- 顯示 6 項核心功能
- 價格：NT$350/月
- 標籤：早鳥優惠

### VIP 升級彈窗：
- 標題帶 Crown 圖標
- 紫粉漸層卡片
- 顯示 8 項進階功能
- 價格：NT$1,299/月
- 標籤：限量中

---

**更新時間：** 2025-11-23
**版本：** v2.0
**狀態：** ✅ 已完成
