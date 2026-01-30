/**
 * GET /api/user/usage
 *
 * 取得當前用戶的使用統計和限制資訊
 * 用於前端顯示使用量和剩餘配額
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserUsageStats, USAGE_LIMITS } from '@/lib/membership';

export async function GET() {
  try {
    const supabase = await createClient();

    // 驗證用戶
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    // 取得使用統計
    const stats = await getUserUsageStats(user.id);

    return NextResponse.json({
      ...stats,
      // 額外計算剩餘配額
      remaining: {
        robotToday: Math.max(0, USAGE_LIMITS.ROBOT_DAILY_LIMIT - stats.usage.robotToday),
      },
      // 清楚的說明文字
      descriptions: {
        robotDaily: `每天最多可執行 ${USAGE_LIMITS.ROBOT_DAILY_LIMIT} 次機器人`,
        linkArchive: `連結 ${USAGE_LIMITS.LINK_ARCHIVE_DAYS} 天無點擊將自動封存`,
        draftExpire: `草稿 ${USAGE_LIMITS.DRAFT_EXPIRE_DAYS} 天未處理將自動刪除`,
      },
    });

  } catch (error) {
    console.error('Error in GET /api/user/usage:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
