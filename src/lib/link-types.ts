import { StrategyType } from '@/components/StrategySelector';
import { StrategyConfig } from '@/lib/strategy-types';

// 連結基礎介面
export interface Link {
  id: string;
  user_id: string;
  short_code: string;
  title?: string;
  html_content: string;
  affiliate_url: string;
  created_at: string;
  is_active: boolean;
  strategy?: StrategyType;
  strategy_config?: StrategyConfig;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  favicon_url?: string;

  // 新增：帳號和標籤
  account_id?: string;
  tags?: string[];

  // 新增：統計數據
  click_count?: number;
  conversion_count?: number;
}

// 連結包含帳號資訊
export interface LinkWithAccount extends Link {
  account?: {
    id: string;
    name: string;
    type: string;
  };
}

// 新增連結的表單資料
export interface CreateLinkInput {
  title?: string;
  html_content: string;
  affiliate_url: string;
  strategy: StrategyType;
  strategy_config?: StrategyConfig;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  favicon_url?: string;
  account_id?: string;
  tags?: string[];
}

// 更新連結的表單資料
export interface UpdateLinkInput {
  title?: string;
  html_content?: string;
  affiliate_url?: string;
  strategy?: StrategyType;
  strategy_config?: StrategyConfig;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  favicon_url?: string;
  is_active?: boolean;
  account_id?: string;
  tags?: string[];
}

// 批量操作類型
export type BatchAction =
  | 'activate'      // 啟用
  | 'deactivate'    // 停用
  | 'delete'        // 刪除
  | 'add_tags'      // 新增標籤
  | 'remove_tags';  // 移除標籤

// 批量操作的請求資料
export interface BatchOperationInput {
  link_ids: string[];
  action: BatchAction;
  tags?: string[];  // 當 action 是 add_tags 或 remove_tags 時使用
}
