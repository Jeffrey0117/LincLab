// ============================================================
// 自動化發文助手系統 - API 輔助函數
// 提供給客戶端元件使用的 API 調用函數
// ============================================================

import {
  AutomationStrategy,
  AutomationStrategyWithLink,
  CreateStrategyInput,
  UpdateStrategyInput,
  GetStrategiesParams,
  RecordUsageInput,
  StrategyUsageLogWithStrategy,
  UserUsageStats,
  PopularStrategy,
} from './automation-types';

// ============================================================
// 策略相關 API
// ============================================================

/**
 * 獲取所有可用策略
 */
export async function getStrategies(
  params?: GetStrategiesParams & { include_link?: boolean }
): Promise<{ strategies: AutomationStrategy[] | AutomationStrategyWithLink[]; count: number }> {
  const searchParams = new URLSearchParams();

  if (params?.category) searchParams.set('category', params.category);
  if (params?.is_active !== undefined) searchParams.set('is_active', String(params.is_active));
  if (params?.is_public !== undefined) searchParams.set('is_public', String(params.is_public));
  if (params?.search) searchParams.set('search', params.search);
  if (params?.tags?.length) searchParams.set('tags', params.tags.join(','));
  if (params?.sort_by) searchParams.set('sort_by', params.sort_by);
  if (params?.sort_order) searchParams.set('sort_order', params.sort_order);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  if (params?.include_link) searchParams.set('include_link', 'true');

  const response = await fetch(`/api/automation/strategies?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch strategies');
  }

  return response.json();
}

/**
 * 獲取單一策略詳情
 */
export async function getStrategy(
  id: string,
  options?: { include_link?: boolean; include_variants?: boolean }
): Promise<{
  strategy: AutomationStrategy | AutomationStrategyWithLink;
  variants?: any[];
}> {
  const searchParams = new URLSearchParams();

  if (options?.include_link) searchParams.set('include_link', 'true');
  if (options?.include_variants) searchParams.set('include_variants', 'true');

  const response = await fetch(`/api/automation/strategies/${id}?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch strategy');
  }

  return response.json();
}

/**
 * 創建新策略
 */
export async function createStrategy(
  input: CreateStrategyInput
): Promise<{ strategy: AutomationStrategy }> {
  const response = await fetch('/api/automation/strategies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create strategy');
  }

  return response.json();
}

/**
 * 更新策略
 */
export async function updateStrategy(
  id: string,
  input: UpdateStrategyInput
): Promise<{ strategy: AutomationStrategy }> {
  const response = await fetch(`/api/automation/strategies/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update strategy');
  }

  return response.json();
}

/**
 * 刪除策略
 */
export async function deleteStrategy(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/automation/strategies/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete strategy');
  }

  return response.json();
}

/**
 * 記錄策略使用
 */
export async function recordStrategyUsage(
  strategyId: string,
  input: Omit<RecordUsageInput, 'strategy_id'>
): Promise<{ success: boolean; usage_log: any }> {
  const response = await fetch(`/api/automation/strategies/${strategyId}/use`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to record usage');
  }

  return response.json();
}

// ============================================================
// 使用歷史相關 API
// ============================================================

/**
 * 獲取使用歷史
 */
export async function getUsageHistory(params?: {
  strategy_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
  stats?: boolean;
}): Promise<{
  history: StrategyUsageLogWithStrategy[];
  count: number;
  stats?: UserUsageStats;
}> {
  const searchParams = new URLSearchParams();

  if (params?.strategy_id) searchParams.set('strategy_id', params.strategy_id);
  if (params?.start_date) searchParams.set('start_date', params.start_date);
  if (params?.end_date) searchParams.set('end_date', params.end_date);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  if (params?.stats) searchParams.set('stats', 'true');

  const response = await fetch(`/api/automation/history?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch usage history');
  }

  return response.json();
}

// ============================================================
// 便利函數
// ============================================================

/**
 * 複製文案到剪貼簿並記錄使用
 */
export async function copyContentAndRecord(
  strategyId: string,
  content: string,
  variantId?: string
): Promise<boolean> {
  try {
    // 複製到剪貼簿
    await navigator.clipboard.writeText(content);

    // 記錄使用
    await recordStrategyUsage(strategyId, {
      copied_content: true,
      variant_id: variantId,
    });

    return true;
  } catch (error) {
    console.error('Error copying content:', error);
    return false;
  }
}

/**
 * 複製連結到剪貼簿並記錄使用
 */
export async function copyLinkAndRecord(
  strategyId: string,
  link: string,
  variantId?: string
): Promise<boolean> {
  try {
    // 複製到剪貼簿
    await navigator.clipboard.writeText(link);

    // 記錄使用
    await recordStrategyUsage(strategyId, {
      copied_link: true,
      variant_id: variantId,
    });

    return true;
  } catch (error) {
    console.error('Error copying link:', error);
    return false;
  }
}

/**
 * 標記策略為已使用
 */
export async function markStrategyAsUsed(
  strategyId: string,
  variantId?: string
): Promise<boolean> {
  try {
    await recordStrategyUsage(strategyId, {
      marked_as_used: true,
      variant_id: variantId,
    });

    return true;
  } catch (error) {
    console.error('Error marking as used:', error);
    return false;
  }
}

/**
 * 獲取熱門策略（最近 30 天）
 */
export async function getPopularStrategies(
  daysBack: number = 30,
  limit: number = 10
): Promise<PopularStrategy[]> {
  // 這個需要直接調用資料庫函數，可以通過 API 路由實作
  // 暫時使用 getStrategies 並按 total_uses 排序
  const { strategies } = await getStrategies({
    is_active: true,
    is_public: true,
    sort_by: 'total_uses',
    sort_order: 'desc',
    limit,
  });

  return strategies.map((s) => ({
    strategy_id: s.id,
    strategy_name: s.name,
    category: s.category,
    icon: s.icon,
    recent_uses: s.total_uses,
  }));
}

/**
 * 格式化文案內容（替換 {link} 佔位符）
 */
export function formatPostContent(content: string, link: string): string {
  return content.replace(/\{link\}/g, link);
}

/**
 * 預覽文案（顯示前 100 個字元）
 */
export function previewContent(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength) + '...';
}

/**
 * 統計文案字數
 */
export function countContentLength(content: string): number {
  return content.length;
}

/**
 * 檢查文案是否包含連結佔位符
 */
export function hasLinkPlaceholder(content: string): boolean {
  return content.includes('{link}');
}

/**
 * 驗證文案是否有效
 */
export function validateContent(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!content || content.trim().length === 0) {
    errors.push('文案不能為空');
  }

  if (content.length < 10) {
    errors.push('文案至少需要 10 個字元');
  }

  if (content.length > 5000) {
    errors.push('文案不能超過 5000 個字元');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
