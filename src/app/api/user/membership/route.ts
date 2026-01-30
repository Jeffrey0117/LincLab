import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserMembership, getUserUsageStats } from '@/lib/membership';

/**
 * GET /api/user/membership
 *
 * Returns current user's membership tier, expiration, and usage statistics
 *
 * Response format:
 * {
 *   userId: string,
 *   tier: "FREE" | "MEMBER",
 *   isMember: boolean,
 *   expireAt: string | null,
 *   usage: {
 *     links: { current: number, limit: number, percentage: number },
 *     templates: { current: number, limit: number },
 *     strategies: { current: number, limit: number }
 *   },
 *   features: {
 *     hasSubdomain: boolean,
 *     hasAllFeatures: boolean
 *   }
 * }
 */
export async function GET() {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Debug logging
    console.log('[Membership API] Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
    });

    if (authError || !user) {
      console.error('[Membership API] Authentication failed:', authError);
      return NextResponse.json(
        { error: '未授權，請先登入', details: authError?.message },
        { status: 401 }
      );
    }

    // 2. Get membership info
    const membership = await getUserMembership(user.id);

    // 3. Get usage statistics
    const stats = await getUserUsageStats(user.id);

    // 4. Return formatted response
    return NextResponse.json({
      userId: user.id,
      tier: membership.tier,
      isMember: membership.isMember,
      expireAt: membership.expireAt,
      usage: stats.usage,
      features: stats.features,
    });

  } catch (error) {
    console.error('Error fetching membership:', error);
    return NextResponse.json(
      {
        error: '取得會員資訊失敗',
        details: error instanceof Error ? error.message : '未知錯誤',
      },
      { status: 500 }
    );
  }
}
