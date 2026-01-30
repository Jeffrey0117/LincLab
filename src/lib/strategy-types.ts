// Strategy configuration types for customizable link strategies

export type ButtonPosition = 'center' | 'top' | 'bottom';
export type FloatingPosition = 'left' | 'right';
export type CookieTriggerType =
  | 'immediate'
  | 'delay'
  | 'scroll'
  | 'scroll-bottom'
  | 'exit-intent';

// Cookie Popup Strategy Config
export interface CookieStrategyConfig {
  triggerType?: CookieTriggerType;
  delaySeconds?: number;      // 當 triggerType = 'delay'
  scrollPercentage?: number;  // 當 triggerType = 'scroll'
  title?: string;              // 自訂彈窗標題
  description?: string;        // 自訂彈窗描述
  acceptText?: string;         // 自訂接受按鈕文字
  declineText?: string;        // 自訂拒絕按鈕文字
}

// Floating Button Strategy Config
export interface FloatingButtonConfig {
  text?: string;
  position?: FloatingPosition;
}

// Exit Intent Strategy Config
export interface ExitIntentConfig {
  title?: string;
  description?: string;
  buttonText?: string;
}

// Bottom Bar Strategy Config
export interface BottomBarConfig {
  text?: string;
  buttonText?: string;
}

// Captcha Verification Strategy Config
export interface CaptchaVerificationConfig {
  title?: string;
  description?: string;
  verifyText?: string;
  style?: 'google' | 'cloudflare';
  showSpinner?: boolean;
  delaySeconds?: number;
}

// Age Verification Strategy Config
export interface AgeVerificationConfig {
  title?: string;
  description?: string;
  minAge?: number; // 最低年齡
  confirmText?: string; // 確認按鈕文字
  declineText?: string; // 拒絕按鈕文字（會關閉視窗）
}

// Content Unlock Strategy Config
export interface ContentUnlockConfig {
  title?: string;
  description?: string;
  content?: string; // 需要閱讀的內容/條款
  confirmText?: string; // 確認按鈕文字
  checkboxText?: string; // 勾選框文字
  requireScroll?: boolean; // 是否需要滾動到底部才能確認
}

// Image Link Strategy Config
export interface ImageLinkConfig {
  imageUrl?: string; // 要顯示的圖片網址
  altText?: string; // 圖片的 alt 文字
  showHint?: boolean; // 是否顯示點擊提示
  hintText?: string; // 提示文字
  hintPosition?: 'top' | 'bottom' | 'center'; // 提示位置
  fitMode?: 'cover' | 'contain' | 'fill'; // 圖片適應模式
}

// Adult 18+ Strategy Config
export interface Adult18PlusConfig {
  title?: string; // 標題
  warningText?: string; // 警告文字
  description?: string; // 描述
  confirmText?: string; // 確認按鈕文字
  cancelText?: string; // 取消按鈕文字
  backgroundColor?: string; // 背景顏色
  showWarningIcon?: boolean; // 是否顯示警告圖示
}

// Cloud Drive (嘟嘟網盤) Strategy Config
export interface CloudDriveConfig {
  extractCode?: string;      // 提取碼，預設 "8888"
  fileContent?: string;      // 下載的 txt 檔案內容
  fileName?: string;         // 下載檔案名稱
}

// Union type for all strategy configs
export type StrategyConfig =
  | CookieStrategyConfig
  | FloatingButtonConfig
  | ExitIntentConfig
  | BottomBarConfig
  | CaptchaVerificationConfig
  | AgeVerificationConfig
  | ContentUnlockConfig
  | ImageLinkConfig
  | Adult18PlusConfig
  | CloudDriveConfig
  | null;

// Default configurations for each strategy
export const DEFAULT_CONFIGS = {
  cookie_popup: {
    triggerType: 'immediate' as CookieTriggerType,
    delaySeconds: 3,
    scrollPercentage: 50,
    title: 'Cookie 使用通知',
    description: '本網站使用 Cookie 來提供更好的使用體驗。點擊「同意並繼續」即表示您同意我們使用 Cookie。',
    acceptText: '同意並繼續',
    declineText: '稍後再說',
  } as CookieStrategyConfig,

  floating_button: {
    text: '限時優惠',
    position: 'right' as FloatingPosition,
  } as FloatingButtonConfig,

  exit_intent: {
    title: '等等！別走！',
    description: '限時優惠還沒領取，現在就來看看吧！',
    buttonText: '立即查看優惠',
  } as ExitIntentConfig,

  bottom_bar: {
    text: '🎉 限時優惠進行中',
    buttonText: '立即查看',
  } as BottomBarConfig,

  captcha_verification: {
    title: '請驗證您的訪問',
    description: '為了防止惡意機器人訪問，請完成以下驗證',
    verifyText: '我不是機器人',
    style: 'google',
    showSpinner: true,
    delaySeconds: 1,
  } as CaptchaVerificationConfig,


  content_unlock: {
    title: '請確認您已閱讀以下內容',
    description: '為了確保您了解相關資訊，請仔細閱讀以下內容',
    content: '使用條款與隱私政策\n\n本網站提供的所有內容僅供參考，使用者需自行判斷內容的正確性。繼續使用本網站即表示您同意遵守相關規定。',
    confirmText: '我已閱讀並同意',
    checkboxText: '我已詳細閱讀上述內容',
    requireScroll: true,
  } as ContentUnlockConfig,

  image_link: {
    imageUrl: 'https://via.placeholder.com/1200x630/4F46E5/FFFFFF?text=%E9%BB%9E%E6%93%8A%E6%9F%A5%E7%9C%8B%E8%A9%B3%E6%83%85',
    altText: '點擊查看詳情',
    showHint: true,
    hintText: '👆 點擊圖片查看詳情',
    hintPosition: 'bottom',
    fitMode: 'cover',
  } as ImageLinkConfig,

  adult_18plus: {
    title: '18 禁內容警告',
    warningText: '本網站包含成人內容',
    description: '您即將進入包含成人內容的網站，僅限年滿 18 歲（含）以上之成年人瀏覽。若您尚未年滿 18 歲，請立即離開。',
    confirmText: '我已滿 18 歲，進入網站',
    cancelText: '離開',
    showWarningIcon: true,
  } as Adult18PlusConfig,

  cloud_drive: {
    extractCode: '8888',
    fileContent: '感謝您的下載！\n\n這是您的專屬內容。',
    fileName: '分享資料.txt',
  } as CloudDriveConfig,
};

// Helper function to get merged config with defaults
export function getStrategyConfig<T extends StrategyConfig>(
  strategyType: string,
  customConfig: T | null | undefined
): T {
  const defaultConfig = DEFAULT_CONFIGS[strategyType as keyof typeof DEFAULT_CONFIGS];

  if (!customConfig) {
    return defaultConfig as T;
  }

  return {
    ...defaultConfig,
    ...customConfig,
  } as T;
}

// ========== Template System Types ==========

// 內容模式
export type ContentMode = 'custom' | 'template';

// 模板類型
export type TemplateType =
  | 'image'           // 圖片模板
  | 'external_link'   // 外部連結預覽
  | 'beauty'          // 正妹圖片
  | 'article'         // 文章模板
  | 'cloud_drive';    // 嘟嘟網盤

// 外部連結模板配置
export interface ExternalLinkTemplateConfig {
  targetUrl: string;
  customTitle?: string;
  customDescription?: string;
  customImage?: string;
}

// 正妹圖片模板配置
export interface BeautyTemplateConfig {
  images: string[];
  title: string;
  description?: string;
  layout?: 'grid' | 'carousel' | 'masonry';
}

// 文章模板配置
export interface ArticleTemplateConfig {
  title: string;
  content: string;
  authorName?: string;
  publishDate?: string;
  coverImage?: string;
}

// 模板配置聯合類型
export type TemplateConfig =
  | ImageLinkConfig
  | ExternalLinkTemplateConfig
  | BeautyTemplateConfig
  | ArticleTemplateConfig
  | CloudDriveConfig;
