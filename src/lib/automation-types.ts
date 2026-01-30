// ============================================================
// 自動化發文助手系統 - TypeScript 類型定義
// ============================================================

// ============================================================
// 1. 策略分類
// ============================================================
export type StrategyCategory =
  | 'beauty'    // 正妹/美女
  | 'discount'  // 優惠/折扣
  | 'food'      // 美食
  | '3c'        // 3C 產品
  | 'travel'    // 旅遊
  | 'game'      // 遊戲
  | 'fashion'   // 時尚/穿搭
  | 'other';    // 其他

// ============================================================
// 2. 自動化策略介面
// ============================================================
export interface AutomationStrategy {
  id: string;
  created_at: string;
  updated_at: string;

  // 基本資訊
  name: string;
  description?: string;
  category?: StrategyCategory;
  icon?: string; // emoji or icon name

  // 內容設定
  post_content: string; // 預設的貼文文案
  short_link_id?: string; // 關聯的短連結 ID

  // 狀態
  is_active: boolean;
  is_public: boolean;

  // 統計
  total_uses: number;
  total_clicks: number;

  // 權限
  created_by: string;
  allowed_users?: string[]; // 允許使用的用戶 ID 列表

  // 元資料
  tags?: string[];
  metadata?: Record<string, any>;
}

// 策略包含短連結資訊
export interface AutomationStrategyWithLink extends AutomationStrategy {
  short_link?: {
    id: string;
    short_code: string;
    title?: string;
    affiliate_url: string;
    click_count?: number;
  };
}

// ============================================================
// 3. 文案變體介面
// ============================================================
export interface StrategyVariant {
  id: string;
  created_at: string;

  strategy_id: string;

  post_content: string;
  variant_name?: string;
  is_active: boolean;

  usage_count: number;
  last_used_at?: string;
}

// ============================================================
// 4. 使用記錄介面
// ============================================================
export interface StrategyUsageLog {
  id: string;
  created_at: string;

  strategy_id: string;
  variant_id?: string;
  user_id: string;

  // 使用資訊
  copied_content: boolean;
  copied_link: boolean;
  marked_as_used: boolean;

  // 元資料
  user_agent?: string;
  ip_address?: string;
  metadata?: Record<string, any>;
}

// 使用記錄包含策略資訊
export interface StrategyUsageLogWithStrategy extends StrategyUsageLog {
  strategy?: {
    id: string;
    name: string;
    category?: StrategyCategory;
    icon?: string;
  };
}

// ============================================================
// 5. API 請求/回應類型
// ============================================================

// 創建策略的輸入
export interface CreateStrategyInput {
  name: string;
  description?: string;
  category?: StrategyCategory;
  icon?: string;

  post_content: string;
  short_link_id?: string;

  is_public?: boolean;
  allowed_users?: string[];

  tags?: string[];
  metadata?: Record<string, any>;
}

// 更新策略的輸入
export interface UpdateStrategyInput {
  name?: string;
  description?: string;
  category?: StrategyCategory;
  icon?: string;

  post_content?: string;
  short_link_id?: string;

  is_active?: boolean;
  is_public?: boolean;
  allowed_users?: string[];

  tags?: string[];
  metadata?: Record<string, any>;
}

// 創建變體的輸入
export interface CreateVariantInput {
  strategy_id: string;
  post_content: string;
  variant_name?: string;
  is_active?: boolean;
}

// 更新變體的輸入
export interface UpdateVariantInput {
  post_content?: string;
  variant_name?: string;
  is_active?: boolean;
}

// 記錄使用的輸入
export interface RecordUsageInput {
  strategy_id: string;
  variant_id?: string;

  copied_content?: boolean;
  copied_link?: boolean;
  marked_as_used?: boolean;

  metadata?: Record<string, any>;
}

// 查詢策略的參數
export interface GetStrategiesParams {
  category?: StrategyCategory;
  is_active?: boolean;
  is_public?: boolean;
  search?: string; // 搜尋名稱或描述
  tags?: string[];
  sort_by?: 'created_at' | 'updated_at' | 'total_uses' | 'name';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// 查詢使用記錄的參數
export interface GetUsageLogsParams {
  strategy_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

// ============================================================
// 6. 統計資料類型
// ============================================================

// 熱門策略
export interface PopularStrategy {
  strategy_id: string;
  strategy_name: string;
  category?: StrategyCategory;
  icon?: string;
  recent_uses: number;
}

// 用戶最愛策略
export interface UserFavoriteStrategy {
  strategy_id: string;
  strategy_name: string;
  category?: StrategyCategory;
  icon?: string;
  use_count: number;
  last_used: string;
}

// 策略統計
export interface StrategyStats {
  total_strategies: number;
  active_strategies: number;
  total_uses: number;
  total_clicks: number;
  most_popular_category?: StrategyCategory;
}

// 用戶使用統計
export interface UserUsageStats {
  total_uses: number;
  unique_strategies_used: number;
  most_used_category?: StrategyCategory;
  recent_activity: StrategyUsageLogWithStrategy[];
  favorite_strategies: UserFavoriteStrategy[];
}

// ============================================================
// 7. 分類相關常數和輔助函數
// ============================================================

// 分類顯示資訊
export const CATEGORY_INFO: Record<StrategyCategory, { label: string; emoji: string; description: string }> = {
  beauty: {
    label: '正妹圖片',
    emoji: '👧',
    description: '吸引目光的正妹/美女圖片策略'
  },
  discount: {
    label: '優惠折扣',
    emoji: '💰',
    description: '省錢優惠、限時折扣相關策略'
  },
  food: {
    label: '美食推薦',
    emoji: '🍔',
    description: '美食、餐廳、料理相關策略'
  },
  '3c': {
    label: '3C 開箱',
    emoji: '📱',
    description: '3C 產品、科技、開箱相關策略'
  },
  travel: {
    label: '旅遊分享',
    emoji: '✈️',
    description: '旅遊、景點、住宿相關策略'
  },
  game: {
    label: '遊戲推薦',
    emoji: '🎮',
    description: '遊戲、電競、娛樂相關策略'
  },
  fashion: {
    label: '時尚穿搭',
    emoji: '👗',
    description: '時尚、穿搭、美妝相關策略'
  },
  other: {
    label: '其他',
    emoji: '📦',
    description: '其他類型的策略'
  }
};

// 取得分類顯示名稱
export function getCategoryLabel(category?: StrategyCategory): string {
  if (!category) return '未分類';
  return CATEGORY_INFO[category]?.label || category;
}

// 取得分類 emoji
export function getCategoryEmoji(category?: StrategyCategory): string {
  if (!category) return '📦';
  return CATEGORY_INFO[category]?.emoji || '📦';
}

// 取得分類描述
export function getCategoryDescription(category?: StrategyCategory): string {
  if (!category) return '未分類的策略';
  return CATEGORY_INFO[category]?.description || '';
}

// 取得所有分類選項
export function getAllCategories(): Array<{ value: StrategyCategory; label: string; emoji: string }> {
  return Object.entries(CATEGORY_INFO).map(([value, info]) => ({
    value: value as StrategyCategory,
    label: info.label,
    emoji: info.emoji
  }));
}

// ============================================================
// 8. 驗證函數
// ============================================================

// 驗證策略輸入
export function validateStrategyInput(input: CreateStrategyInput | UpdateStrategyInput): string[] {
  const errors: string[] = [];

  if ('name' in input && input.name) {
    if (input.name.length < 2) {
      errors.push('策略名稱至少需要 2 個字元');
    }
    if (input.name.length > 100) {
      errors.push('策略名稱不能超過 100 個字元');
    }
  }

  if ('post_content' in input && input.post_content) {
    if (input.post_content.length < 10) {
      errors.push('貼文內容至少需要 10 個字元');
    }
    if (input.post_content.length > 5000) {
      errors.push('貼文內容不能超過 5000 個字元');
    }
  }

  if ('category' in input && input.category) {
    const validCategories = Object.keys(CATEGORY_INFO);
    if (!validCategories.includes(input.category)) {
      errors.push('無效的分類');
    }
  }

  return errors;
}

// 驗證變體輸入
export function validateVariantInput(input: CreateVariantInput | UpdateVariantInput): string[] {
  const errors: string[] = [];

  if ('post_content' in input && input.post_content) {
    if (input.post_content.length < 10) {
      errors.push('文案內容至少需要 10 個字元');
    }
    if (input.post_content.length > 5000) {
      errors.push('文案內容不能超過 5000 個字元');
    }
  }

  if ('variant_name' in input && input.variant_name) {
    if (input.variant_name.length > 50) {
      errors.push('變體名稱不能超過 50 個字元');
    }
  }

  return errors;
}
