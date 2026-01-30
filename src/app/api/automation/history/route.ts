import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  StrategyUsageLogWithStrategy,
  GetUsageLogsParams,
  UserUsageStats,
} from '@/lib/automation-types';

/**
 * GET /api/automation/history
 * 獲取當前用戶的使用歷史
 * 查詢參數：
 * - strategy_id: 篩選特定策略
 * - start_date: 開始日期
 * - end_date: 結束日期
 * - limit: 每頁數量
 * - offset: 偏移量
 * - stats: 是否包含統計資料
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 驗證用戶登入
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 解析查詢參數
    const searchParams = request.nextUrl.searchParams;
    const params: GetUsageLogsParams = {
      strategy_id: searchParams.get('strategy_id') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const includeStats = searchParams.get('stats') === 'true';

    // 建立查詢
    let query = supabase
      .from('strategy_usage_logs')
      .select(
        `
        *,
        strategy:automation_strategies!strategy_id (
          id,
          name,
          category,
          icon
        )
      `
      )
      .eq('user_id', user.id);

    // 套用篩選條件
    if (params.strategy_id) {
      query = query.eq('strategy_id', params.strategy_id);
    }

    if (params.start_date) {
      query = query.gte('created_at', params.start_date);
    }

    if (params.end_date) {
      query = query.lte('created_at', params.end_date);
    }

    // 排序（最新的在前）
    query = query.order('created_at', { ascending: false });

    // 分頁
    if (params.limit) {
      query = query.range(params.offset || 0, (params.offset || 0) + params.limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching usage history:', error);
      return NextResponse.json({ error: 'Failed to fetch usage history' }, { status: 500 });
    }

    // 如果需要統計資料
    let stats: UserUsageStats | null = null;
    if (includeStats) {
      stats = await getUserStats(supabase, user.id);
    }

    return NextResponse.json({
      history: data as StrategyUsageLogWithStrategy[],
      count: data?.length || 0,
      stats,
    });
  } catch (error) {
    console.error('Error in GET /api/automation/history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * 取得用戶統計資料
 */
async function getUserStats(supabase: any, userId: string): Promise<UserUsageStats> {
  try {
    // 1. 總使用次數
    const { count: totalUses } = await supabase
      .from('strategy_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // 2. 使用過的不同策略數量
    const { data: uniqueStrategies } = await supabase
      .from('strategy_usage_logs')
      .select('strategy_id')
      .eq('user_id', userId);

    const uniqueStrategyIds = new Set(
      uniqueStrategies?.map((log: any) => log.strategy_id) || []
    );

    // 3. 最常使用的分類
    const { data: categoryData } = await supabase
      .from('strategy_usage_logs')
      .select(
        `
        strategy:automation_strategies!strategy_id (
          category
        )
      `
      )
      .eq('user_id', userId);

    const categoryCounts: Record<string, number> = {};
    categoryData?.forEach((log: any) => {
      const category = log.strategy?.category;
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });

    const mostUsedCategory = Object.entries(categoryCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0] as any;

    // 4. 最近活動（最近 10 筆）
    const { data: recentActivity } = await supabase
      .from('strategy_usage_logs')
      .select(
        `
        *,
        strategy:automation_strategies!strategy_id (
          id,
          name,
          category,
          icon
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // 5. 最愛策略（使用次數最多的前 5 個）
    const { data: favoriteData } = await supabase.rpc('get_user_favorite_strategies', {
      target_user_id: userId,
      limit_count: 5,
    });

    return {
      total_uses: totalUses || 0,
      unique_strategies_used: uniqueStrategyIds.size,
      most_used_category: mostUsedCategory,
      recent_activity: (recentActivity || []) as StrategyUsageLogWithStrategy[],
      favorite_strategies: favoriteData || [],
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      total_uses: 0,
      unique_strategies_used: 0,
      recent_activity: [],
      favorite_strategies: [],
    };
  }
}
