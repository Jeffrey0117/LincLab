/**
 * Membership System - 買斷制
 *
 * FREE = 未付費（無法使用）
 * VIP = 已付費（永久使用，有使用限制）
 *
 * ============================================================================
 * VIP 會員權益：
 * - 連結數量：無上限
 * - 機器人使用：每天最多 10 次
 * - 連結保留期限：90 天未點擊自動封存（可恢復）
 * - 草稿保留期限：30 天未處理自動刪除
 * ============================================================================
 */

import { createClient } from '@/lib/supabase/server';
import { isSelfHosted } from '@/lib/config/site';

// ============================================================================
// 使用限制常數（集中管理，方便調整）
// ============================================================================

export const USAGE_LIMITS = {
  /** 機器人每日使用次數上限 (暫時關閉以控制成本) */
  ROBOT_DAILY_LIMIT: 1,

  /** 連結無點擊封存天數 */
  LINK_ARCHIVE_DAYS: 90,

  /** 草稿自動刪除天數 */
  DRAFT_EXPIRE_DAYS: 30,

  /** 連結數量上限（目前無限制，設為 -1） */
  LINK_COUNT_LIMIT: -1,
} as const;

// ============================================================================
// 錯誤訊息（清楚的中文提示）
// ============================================================================

export const ERROR_MESSAGES = {
  NOT_LOGGED_IN: '請先登入',
  NOT_VIP: '此功能僅限 VIP 會員使用。請先購買課程以解鎖所有功能。',
  ROBOT_DAILY_LIMIT_REACHED: `今日機器人使用次數已達上限（${USAGE_LIMITS.ROBOT_DAILY_LIMIT} 次/天）。為確保服務穩定，每日限制 ${USAGE_LIMITS.ROBOT_DAILY_LIMIT} 次。`,
  LINK_LIMIT_REACHED: '連結數量已達上限。請刪除不需要的連結或聯繫客服升級配額。',
} as const;

// ============================================================================
// Type Definitions
// ============================================================================

export type MembershipTier = 'FREE' | 'VIP';

export interface UserMembership {
  userId: string;
  tier: MembershipTier;
  isPaid: boolean;
  isMember: boolean;
  expireAt: string | null;
}

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  current?: number;
  limit?: number;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * 取得用戶會員狀態
 *
 * self-hosted 模式：所有用戶自動為 VIP
 * saas 模式：檢查 profiles 表的 tier 欄位
 */
export async function getUserMembership(userId: string): Promise<UserMembership> {
  // Self-hosted mode: everyone is VIP
  if (isSelfHosted()) {
    return {
      userId,
      tier: 'VIP',
      isPaid: true,
      isMember: true,
      expireAt: null,
    };
  }

  // SaaS mode: check profiles table
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('tier, expire_at')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return {
      userId,
      tier: 'FREE',
      isPaid: false,
      isMember: false,
      expireAt: null,
    };
  }

  const isVIP = profile.tier === 'VIP';
  return {
    userId,
    tier: isVIP ? 'VIP' : 'FREE',
    isPaid: isVIP,
    isMember: isVIP,
    expireAt: profile.expire_at,
  };
}

/**
 * 檢查是否已付費會員
 */
export async function isMember(userId: string): Promise<boolean> {
  const membership = await getUserMembership(userId);
  return membership.isPaid;
}

/**
 * 檢查是否可建立連結（含詳細原因）
 */
export async function canCreateLink(userId: string): Promise<UsageCheckResult> {
  const membership = await getUserMembership(userId);

  if (!membership.isPaid) {
    return {
      allowed: false,
      reason: ERROR_MESSAGES.NOT_VIP,
    };
  }

  // 如果有連結數量限制
  if (USAGE_LIMITS.LINK_COUNT_LIMIT > 0) {
    const supabase = await createClient();
    const { count } = await supabase
      .from('links')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if ((count || 0) >= USAGE_LIMITS.LINK_COUNT_LIMIT) {
      return {
        allowed: false,
        reason: ERROR_MESSAGES.LINK_LIMIT_REACHED,
        current: count || 0,
        limit: USAGE_LIMITS.LINK_COUNT_LIMIT,
      };
    }
  }

  return { allowed: true };
}

/**
 * 檢查是否可使用機器人（含每日次數限制）
 */
export async function canUseRobot(userId: string): Promise<UsageCheckResult> {
  const membership = await getUserMembership(userId);

  if (!membership.isPaid) {
    return {
      allowed: false,
      reason: ERROR_MESSAGES.NOT_VIP,
    };
  }

  // 檢查今日使用次數
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('robot_execution_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today.toISOString());

  const todayUsage = count || 0;

  if (todayUsage >= USAGE_LIMITS.ROBOT_DAILY_LIMIT) {
    return {
      allowed: false,
      reason: ERROR_MESSAGES.ROBOT_DAILY_LIMIT_REACHED,
      current: todayUsage,
      limit: USAGE_LIMITS.ROBOT_DAILY_LIMIT,
    };
  }

  return {
    allowed: true,
    current: todayUsage,
    limit: USAGE_LIMITS.ROBOT_DAILY_LIMIT,
  };
}

/**
 * 取得用戶使用統計（含限制資訊）
 */
export async function getUserUsageStats(userId: string) {
  const supabase = await createClient();
  const membership = await getUserMembership(userId);

  // 連結統計
  const { count: linkCount } = await supabase
    .from('links')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // 草稿統計
  const { count: draftCount } = await supabase
    .from('links')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'draft');

  // 今日機器人使用次數
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count: robotTodayCount } = await supabase
    .from('robot_execution_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today.toISOString());

  return {
    tier: membership.tier,
    isPaid: membership.isPaid,
    usage: {
      links: linkCount || 0,
      drafts: draftCount || 0,
      robotToday: robotTodayCount || 0,
    },
    limits: {
      links: USAGE_LIMITS.LINK_COUNT_LIMIT,
      robotDaily: USAGE_LIMITS.ROBOT_DAILY_LIMIT,
      linkArchiveDays: USAGE_LIMITS.LINK_ARCHIVE_DAYS,
      draftExpireDays: USAGE_LIMITS.DRAFT_EXPIRE_DAYS,
    },
    features: {
      hasAllFeatures: membership.isPaid,
    },
  };
}

/**
 * 取得需要封存的連結（90天無點擊）
 */
export async function getLinksToArchive(userId?: string) {
  const supabase = await createClient();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - USAGE_LIMITS.LINK_ARCHIVE_DAYS);

  let query = supabase
    .from('links')
    .select('id, short_code, title, og_title, last_clicked_at, click_count')
    .eq('status', 'active')
    .or(`last_clicked_at.is.null,last_clicked_at.lt.${cutoffDate.toISOString()}`);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching links to archive:', error);
    return [];
  }

  return data || [];
}

/**
 * 取得需要刪除的草稿（30天未處理）
 */
export async function getDraftsToDelete(userId?: string) {
  const supabase = await createClient();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - USAGE_LIMITS.DRAFT_EXPIRE_DAYS);

  let query = supabase
    .from('links')
    .select('id, short_code, title, og_title, created_at')
    .eq('status', 'draft')
    .lt('created_at', cutoffDate.toISOString());

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching drafts to delete:', error);
    return [];
  }

  return data || [];
}

// ============================================================================
// Admin Functions
// ============================================================================

/**
 * 開通會員（內部使用）
 */
export async function activateMembership(userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    tier: 'VIP',
    expire_at: null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error('開通會員失敗');
  }
}

/**
 * 設定用戶到期日（管理員功能）
 */
export async function setUserExpiration(userId: string, expireAt: string | null): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      expire_at: expireAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw new Error('設定到期日失敗');
  }
}

// ============================================================================
// Error Classes
// ============================================================================

export class MembershipRequiredError extends Error {
  constructor(feature: string) {
    super(`需要付費會員才能使用: ${feature}`);
  }
}

export class UsageLimitError extends Error {
  current: number;
  limit: number;

  constructor(message: string, current: number, limit: number) {
    super(message);
    this.current = current;
    this.limit = limit;
  }
}
