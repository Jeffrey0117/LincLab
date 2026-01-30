// 帳號類型定義

export type AccountType =
  | 'beauty'        // 外貌吸引型（正妹、帥哥）
  | 'professional'  // 專業資料型（教學、PDF）
  | 'emotion'       // 情緒反應型（八卦、爭議）
  | 'curiosity'     // 好奇心型（冷知識、驚奇）
  | 'lifestyle'     // 生活共鳴型（搞笑、廢文）
  | 'benefit';      // 利益誘因型（免費、折扣）

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  description: string | null;
  avatar_url?: string;
  // OG 模版設定
  default_og_title?: string | null;
  default_og_description?: string | null;
  default_og_image?: string | null;
  default_favicon_url?: string | null;
  default_affiliate_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountWithStats extends Account {
  link_count: number;
  total_clicks: number;
  total_conversions: number;
}

// 帳號類型的中文顯示名稱
export const ACCOUNT_TYPE_NAMES: Record<AccountType, string> = {
  beauty: '外貌吸引型',
  professional: '專業資料型',
  emotion: '情緒反應型',
  curiosity: '好奇心型',
  lifestyle: '生活共鳴型',
  benefit: '利益誘因型',
};

// 帳號類型的圖示
export const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  beauty: '👩',
  professional: '📚',
  emotion: '😡',
  curiosity: '🤔',
  lifestyle: '😂',
  benefit: '🎁',
};

// 帳號類型的描述
export const ACCOUNT_TYPE_DESCRIPTIONS: Record<AccountType, string> = {
  beauty: '正妹、帥哥、IG小模等外貌吸引型內容',
  professional: '教學、PDF、懶人包等專業資料型內容',
  emotion: '八卦、爭議、留言戰等情緒反應型內容',
  curiosity: '冷知識、驚奇故事等好奇心型內容',
  lifestyle: '搞笑、廢文、迷因等生活共鳴型內容',
  benefit: '免費資源、折扣、抽獎等利益誘因型內容',
};

// 帳號類型的完整資訊
export interface AccountTypeInfo {
  id: AccountType;
  name: string;
  icon: string;
  description: string;
}

export const ACCOUNT_TYPES: AccountTypeInfo[] = [
  {
    id: 'beauty',
    name: ACCOUNT_TYPE_NAMES.beauty,
    icon: ACCOUNT_TYPE_ICONS.beauty,
    description: ACCOUNT_TYPE_DESCRIPTIONS.beauty,
  },
  {
    id: 'professional',
    name: ACCOUNT_TYPE_NAMES.professional,
    icon: ACCOUNT_TYPE_ICONS.professional,
    description: ACCOUNT_TYPE_DESCRIPTIONS.professional,
  },
  {
    id: 'emotion',
    name: ACCOUNT_TYPE_NAMES.emotion,
    icon: ACCOUNT_TYPE_ICONS.emotion,
    description: ACCOUNT_TYPE_DESCRIPTIONS.emotion,
  },
  {
    id: 'curiosity',
    name: ACCOUNT_TYPE_NAMES.curiosity,
    icon: ACCOUNT_TYPE_ICONS.curiosity,
    description: ACCOUNT_TYPE_DESCRIPTIONS.curiosity,
  },
  {
    id: 'lifestyle',
    name: ACCOUNT_TYPE_NAMES.lifestyle,
    icon: ACCOUNT_TYPE_ICONS.lifestyle,
    description: ACCOUNT_TYPE_DESCRIPTIONS.lifestyle,
  },
  {
    id: 'benefit',
    name: ACCOUNT_TYPE_NAMES.benefit,
    icon: ACCOUNT_TYPE_ICONS.benefit,
    description: ACCOUNT_TYPE_DESCRIPTIONS.benefit,
  },
];

// 新增帳號的表單資料
export interface CreateAccountInput {
  name: string;
  type: AccountType;
  description?: string;
  avatar_url?: string;
  // OG 模版設定
  default_og_title?: string;
  default_og_description?: string;
  default_og_image?: string;
  default_favicon_url?: string;
  default_affiliate_url?: string;
}

// 更新帳號的表單資料
export interface UpdateAccountInput {
  name?: string;
  type?: AccountType;
  description?: string;
  avatar_url?: string;
  // OG 模版設定
  default_og_title?: string;
  default_og_description?: string;
  default_og_image?: string;
  default_favicon_url?: string;
  default_affiliate_url?: string;
}
