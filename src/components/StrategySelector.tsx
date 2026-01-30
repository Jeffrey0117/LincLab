import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp, Sparkles, Layers, Info, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export type StrategyType =
  | 'none'
  | 'cookie_popup'
  | 'captcha_verification'
  | 'content_unlock'
  | 'image_link'
  | 'adult_18plus'
  | 'cloud_drive';

interface Strategy {
  id: StrategyType;
  name: string;
  description: string;
  icon: string;
  implemented: boolean;
  recommended?: boolean;
  detailedInfo?: string; // 新增詳細說明欄位
}

const strategies: Strategy[] = [
  {
    id: 'none',
    name: '無策略（純文章）',
    description: '不使用任何轉換策略，直接顯示內容給訪客瀏覽',
    icon: '📄',
    implemented: true,
    detailedInfo: '適合純資訊分享、部落格文章或不需要轉換的內容。訪客可以自由瀏覽內容而不會被導向分潤連結。',
  },
  {
    id: 'captcha_verification',
    name: '安全驗證',
    description: '模擬人機驗證界面，看起來像正常的網站安全檢查（強制性高、自然）',
    icon: '🛡️',
    implemented: true,
    recommended: true,
    detailedInfo: '使用者必須完成簡單的驗證才能繼續，非常自然且具有強制性，適合需要高轉換率的場景。',
  },
  {
    id: 'content_unlock',
    name: '內容解鎖',
    description: '需要確認已閱讀條款才能繼續，看起來像使用條款同意（強制性高）',
    icon: '📄',
    implemented: true,
    recommended: true,
    detailedInfo: '模擬常見的條款同意頁面，使用者習慣點擊「同意」按鈕，自然導向目標連結。',
  },
  {
    id: 'cookie_popup',
    name: 'Cookie 同意彈窗',
    description: '標準的 Cookie 同意通知，兩個按鈕都可導向（通用性高）',
    icon: '🍪',
    implemented: true,
    detailedInfo: '符合 GDPR 規範的 Cookie 通知，接受或拒絕按鈕都會導向目標連結。',
  },
  {
    id: 'image_link',
    name: '圖片連結',
    description: '全屏顯示一張圖片，點擊後開啟分潤連結（最適合社群分享，看起來像普通圖片）',
    icon: '🖼️',
    implemented: true,
    recommended: true,
    detailedInfo: '完美偽裝成普通圖片分享，點擊任何位置都會導向目標連結，適合社群媒體分享。',
  },
  {
    id: 'adult_18plus',
    name: '18 禁警告',
    description: '標準的成人內容警告頁面，所有按鈕都會導向（看起來專業且合法）',
    icon: '🔞',
    implemented: true,
    recommended: true,
    detailedInfo: '專業的 18 禁警告頁面，符合法律規範外觀，確認、取消或任何互動都會導向目標連結。適合成人內容或限制級商品推廣。',
  },
  {
    id: 'cloud_drive',
    name: '嘟嘟網盤',
    description: '偽裝成雲端硬碟分享頁面，輸入提取碼後可下載內容並開啟分潤連結',
    icon: '☁️',
    implemented: true,
    recommended: true,
    detailedInfo: '模擬百度網盤風格的雲端硬碟分享頁面，使用者輸入正確提取碼後會開啟分潤連結，同時可下載自訂的文字內容。非常適合需要互動驗證的場景。',
  },
];

interface StrategySelectorProps {
  value: StrategyType;
  onChange: (value: StrategyType) => void;
}

const StrategySelector = ({ value, onChange }: StrategySelectorProps) => {
  const [isOtherExpanded, setIsOtherExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 搜尋過濾
  const filteredStrategies = strategies.filter(s => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query) ||
      (s.detailedInfo && s.detailedInfo.toLowerCase().includes(query))
    );
  });

  // 搜尋時自動展開所有分組
  const shouldExpandOther = isOtherExpanded || !!searchQuery;

  // 分組策略
  const recommendedStrategies = filteredStrategies.filter(s => s.recommended && s.implemented);
  const otherStrategies = filteredStrategies.filter(s => !s.recommended && s.implemented);
  const upcomingStrategies = filteredStrategies.filter(s => !s.implemented);

  const renderStrategyCard = (strategy: Strategy, isRecommended: boolean = false) => (
    <div
      key={strategy.id}
      className={`relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
        value === strategy.id
          ? isRecommended
            ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20 shadow-md shadow-green-200/50 dark:shadow-green-900/30'
            : 'border-primary bg-primary/5 shadow-md'
          : isRecommended
            ? 'border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 hover:shadow-sm hover:shadow-green-200/30'
            : 'border-muted hover:border-primary/50 hover:shadow-sm'
      } ${!strategy.implemented ? 'opacity-50' : ''}`}
    >
      <RadioGroupItem
        value={strategy.id}
        id={strategy.id}
        disabled={!strategy.implemented}
        className="mt-1"
      />
      <label
        htmlFor={strategy.id}
        className="flex-1 cursor-pointer"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{strategy.icon}</span>
          <span className="font-semibold">{strategy.name}</span>
          {strategy.recommended && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-700 dark:text-green-300 rounded-full font-medium shadow-sm">
              <Sparkles className="w-3 h-3" />
              推薦
            </span>
          )}
          {!strategy.implemented && (
            <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
              即將推出
            </span>
          )}
          {strategy.detailedInfo && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{strategy.detailedInfo}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {strategy.description}
        </p>
      </label>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-base font-semibold">選擇導流策略</Label>

        {/* 搜尋框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜尋策略名稱或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3"
          />
        </div>
      </div>

      <RadioGroup value={value} onValueChange={onChange}>
        <div className="space-y-6">
          {/* 推薦策略組 */}
          {recommendedStrategies.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                <Sparkles className="w-4 h-4" />
                <span>推薦策略</span>
                <div className="flex-1 h-px bg-gradient-to-r from-green-200 dark:from-green-800 to-transparent"></div>
              </div>
              <div className="grid gap-3">
                {recommendedStrategies.map(strategy => renderStrategyCard(strategy, true))}
              </div>
            </div>
          )}

          {/* 其他策略組 */}
          {otherStrategies.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {searchQuery ? (
                  // 搜尋時不顯示摺疊按鈕
                  <>
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">其他策略</span>
                    <div className="flex-1 h-px bg-border"></div>
                  </>
                ) : (
                  // 非搜尋時顯示可摺疊按鈕
                  <>
                    <button
                      type="button"
                      onClick={() => setIsOtherExpanded(!isOtherExpanded)}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Layers className="w-4 h-4" />
                      <span>其他策略</span>
                      {isOtherExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <div className="flex-1 h-px bg-border"></div>
                  </>
                )}
              </div>

              {/* 可摺疊的其他策略內容 */}
              <div
                className={`grid gap-3 transition-all duration-300 ${
                  shouldExpandOther
                    ? 'opacity-100 max-h-[2000px]'
                    : 'opacity-0 max-h-0 overflow-hidden'
                }`}
              >
                {otherStrategies.map(strategy => renderStrategyCard(strategy, false))}
              </div>

              {/* 摺疊時顯示簡短提示（搜尋時不顯示） */}
              {!shouldExpandOther && !searchQuery && (
                <p className="text-xs text-muted-foreground pl-6">
                  點擊展開查看 {otherStrategies.length} 個其他策略選項
                </p>
              )}
            </div>
          )}

          {/* 即將推出的策略（如果有的話） */}
          {upcomingStrategies.length > 0 && (
            <div className="space-y-3 opacity-60">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span>即將推出</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>
              <div className="grid gap-3">
                {upcomingStrategies.map(strategy => renderStrategyCard(strategy, false))}
              </div>
            </div>
          )}

          {/* 無搜尋結果提示 */}
          {searchQuery && filteredStrategies.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">找不到符合「{searchQuery}」的策略</p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-primary hover:underline mt-2"
              >
                清除搜尋
              </button>
            </div>
          )}
        </div>
      </RadioGroup>
    </div>
  );
};

export default StrategySelector;
export { strategies };
