/**
 * 機器人爬蟲系統 - TypeScript 類型定義
 */

// ============================================================
// 基礎類型定義
// ============================================================

/**
 * 機器人類型枚舉
 */
export enum RobotType {
  PTT_BEAUTY = 'ptt_beauty',
  DCARD_BEAUTY = 'dcard_beauty',
  IG_BEAUTY = 'ig_beauty',
  NEWS = 'news_crawler',
  DISCOUNT = 'discount_hunter',
}

/**
 * 機器人分類
 */
export type RobotCategory =
  | 'beauty'
  | 'discount'
  | 'food'
  | 'news'
  | 'tech'
  | 'entertainment'
  | 'other';

/**
 * 執行狀態
 */
export type ExecutionStatus =
  | 'pending'    // 準備中
  | 'running'    // 執行中
  | 'completed'  // 完成
  | 'failed'     // 失敗
  | 'partial'    // 部分成功
  | 'cancelled'; // 已取消

// ============================================================
// 資料庫表格類型
// ============================================================

/**
 * 機器人配置
 */
export interface RobotConfig {
  id: string;
  created_at: string;
  updated_at: string;

  // 基本資訊
  name: string;
  robot_type: string;
  description?: string;
  icon?: string;
  category?: RobotCategory;

  // 配置
  config: Record<string, any>;
  default_template_type: string;
  default_strategy_config?: Record<string, any>;

  // 執行設定
  max_items_per_run: number;
  rate_limit_delay: number;
  timeout_seconds: number;

  // 狀態
  is_active: boolean;
  is_public: boolean;
  is_beta: boolean;

  // 權限
  created_by?: string;
  allowed_users?: string[];
  required_role?: string;

  // 統計
  total_executions: number;
  total_cards_created: number;
  total_items_scraped: number;
  last_execution_at?: string;

  // 排序
  display_order: number;
}

/**
 * 執行記錄
 */
export interface RobotExecutionLog {
  id: string;
  created_at: string;

  robot_id: string;
  user_id: string;

  // 執行狀態
  status: ExecutionStatus;

  // 執行參數
  execution_params: ExecutionParams;

  // 執行結果
  target_count?: number;
  scraped_count: number;
  success_count: number;
  failed_count: number;
  skipped_count: number;

  // 創建的資源
  created_strategy_ids: string[];
  created_link_ids: string[];

  // 錯誤資訊
  error_messages: string[];
  warnings: string[];

  // 執行時間
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;

  // 進度
  progress_percentage: number;
  current_step?: string;

  // 詳細記錄
  scraped_items: any[];
  processing_logs: ProcessingLog[];

  metadata?: Record<string, any>;
}

/**
 * 爬取的項目
 */
export interface ScrapedItem {
  id: string;
  created_at: string;

  robot_id: string;
  execution_log_id?: string;

  // 來源識別
  source_url: string;
  source_id?: string;
  source_hash: string;

  // 抓取的資料
  title?: string;
  content?: string;
  author?: string;
  publish_date?: string;

  // 圖片和媒體
  images: string[];
  videos: string[];
  primary_image?: string;

  // 互動數據
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  push_count?: number; // PTT 推文數

  // 處理狀態
  is_processed: boolean;
  processed_at?: string;
  strategy_id?: string;
  link_id?: string;

  // 原始資料
  raw_data?: any;
}

/**
 * 文案生成模板
 */
export interface ContentGenerationTemplate {
  id: string;
  created_at: string;

  robot_id?: string;
  name: string;

  // 模板內容
  template_content: string;
  available_variables: string[];

  // 使用條件
  conditions?: TemplateConditions;

  priority: number;
  is_default: boolean;
  is_active: boolean;
}

// ============================================================
// API 參數類型
// ============================================================

/**
 * 執行參數
 */
export interface ExecutionParams {
  targetCount?: number;
  filters?: ExecutionFilters;
  options?: ExecutionOptions;
}

/**
 * 執行篩選條件
 */
export interface ExecutionFilters {
  minPushCount?: number;
  maxPushCount?: number;
  excludeKeywords?: string[];
  includeKeywords?: string[];
  dateRange?: {
    from?: string;
    to?: string;
  };
  hasImage?: boolean;
  hasVideo?: boolean;
}

/**
 * 執行選項
 */
export interface ExecutionOptions {
  skipDuplicates?: boolean;
  autoGenerateContent?: boolean;
  useCustomTemplate?: string;
  createAsDraft?: boolean;
}

/**
 * 模板使用條件
 */
export interface TemplateConditions {
  minPushCount?: number;
  maxPushCount?: number;
  hasImage?: boolean;
  hasVideo?: boolean;
  keywords?: string[];
}

/**
 * 處理記錄
 */
export interface ProcessingLog {
  timestamp: string;
  step: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: any;
}

// ============================================================
// PTT 爬蟲專用類型
// ============================================================

/**
 * PTT 爬蟲配置
 */
export interface PTTCrawlerConfig {
  board: string;
  baseUrl: string;
  minPushCount: number;
  filterKeywords: string[];
  maxPages: number;
  cookieOver18?: string;
}

/**
 * PTT 文章
 */
export interface PTTPost {
  id: string;
  title: string;
  author: string;
  date: string;
  url: string;
  pushCount: number;
  category?: string;
  images: string[];
  content: string;
}

/**
 * PTT 爬蟲參數
 */
export interface ScrapePTTBeautyParams extends ExecutionParams {
  board?: string;
  minPushCount?: number;
  maxPages?: number;
}

// ============================================================
// API 回應類型
// ============================================================

/**
 * 機器人列表回應
 */
export interface GetRobotsResponse {
  robots: RobotConfig[];
  categories: Array<{
    category: RobotCategory;
    count: number;
  }>;
}

/**
 * 執行爬蟲回應
 */
export interface ExecuteRobotResponse {
  execution_log_id: string;
  status: ExecutionStatus;
  message: string;
}

/**
 * 執行狀態回應
 */
export interface GetExecutionStatusResponse {
  log: RobotExecutionLog;
  robot: RobotConfig;
  progress: {
    percentage: number;
    current: number;
    total: number;
    currentStep: string;
  };
  results?: {
    strategies: Array<{
      id: string;
      name: string;
      post_content: string;
      short_link?: string;
    }>;
    errors: string[];
    warnings: string[];
  };
}

/**
 * 執行歷史回應
 */
export interface GetExecutionHistoryResponse {
  logs: RobotExecutionLog[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================================
// 前端狀態管理類型
// ============================================================

/**
 * 機器人執行狀態（前端用）
 */
export interface RobotExecutionState {
  isExecuting: boolean;
  currentLogId?: string;
  progress: number;
  currentStep?: string;
  results?: {
    success: number;
    failed: number;
    total: number;
  };
  error?: string;
}

/**
 * 機器人卡片資料（前端用）
 */
export interface RobotCardData {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
  category: RobotCategory;
  stats: {
    totalExecutions: number;
    totalCards: number;
    lastRun?: string;
  };
  isBeta: boolean;
  isAvailable: boolean;
}

// ============================================================
// 輔助函數
// ============================================================

/**
 * 檢查執行狀態是否為終止狀態
 */
export function isTerminalStatus(status: ExecutionStatus): boolean {
  return ['completed', 'failed', 'cancelled'].includes(status);
}

/**
 * 取得狀態顯示文字
 */
export function getStatusDisplay(status: ExecutionStatus): string {
  const statusMap: Record<ExecutionStatus, string> = {
    pending: '準備中',
    running: '執行中',
    completed: '已完成',
    failed: '執行失敗',
    partial: '部分成功',
    cancelled: '已取消',
  };
  return statusMap[status] || status;
}

/**
 * 取得狀態顏色
 */
export function getStatusColor(status: ExecutionStatus): string {
  const colorMap: Record<ExecutionStatus, string> = {
    pending: 'gray',
    running: 'blue',
    completed: 'green',
    failed: 'red',
    partial: 'yellow',
    cancelled: 'gray',
  };
  return colorMap[status] || 'gray';
}

/**
 * 生成內容雜湊值（用於去重）
 */
export function generateContentHash(content: string): string {
  // 簡單的雜湊函數實現（實際應用中應使用 crypto 庫）
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * 格式化執行時間
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} 秒`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes} 分 ${remainingSeconds} 秒`;
}