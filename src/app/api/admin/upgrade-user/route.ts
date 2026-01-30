import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { setUserExpiration } from '@/lib/membership';

/**
 * POST /api/admin/upgrade-user
 *
 * Allows admins to set user expiration date
 * All users are paid members, this API just manages expiration
 *
 * Request Body:
 * {
 *   targetUserId: string,
 *   expireAt: string | null     // Expiration date (null = permanent)
 * }
 *
 * Response:
 * {
 *   success: true,
 *   user: {
 *     id: string,
 *     tier: "MEMBER",
 *     isMember: true,
 *     expireAt: string | null
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[Admin Upgrade API] Authentication failed:', authError);
      return NextResponse.json(
        { error: '未授權，請先登入', details: authError?.message },
        { status: 401 }
      );
    }

    // 2. Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      console.warn('[Admin Upgrade API] Non-admin access attempt:', {
        userId: user.id,
        isAdmin: profile?.is_admin,
        error: profileError?.message,
      });
      return NextResponse.json(
        { error: '權限不足，僅限管理員操作' },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const { targetUserId, expireAt } = body;

    // Validation
    if (!targetUserId || typeof targetUserId !== 'string') {
      return NextResponse.json(
        { error: '缺少或無效的 targetUserId' },
        { status: 400 }
      );
    }

    // Validate expireAt format if provided
    let validatedExpireAt: string | null = null;
    if (expireAt) {
      const expireDate = new Date(expireAt);
      if (isNaN(expireDate.getTime())) {
        return NextResponse.json(
          { error: 'expireAt 日期格式無效' },
          { status: 400 }
        );
      }
      // Check if date is in the future
      if (expireDate <= new Date()) {
        return NextResponse.json(
          { error: 'expireAt 必須是未來的日期' },
          { status: 400 }
        );
      }
      validatedExpireAt = expireAt;
    }

    // 4. Get target user's current expiration for logging
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('expire_at')
      .eq('id', targetUserId)
      .single();

    const oldExpireAt = targetProfile?.expire_at;

    // 5. Set the expiration date
    await setUserExpiration(targetUserId, validatedExpireAt);

    // 6. Verify the update was successful
    const { data: updatedProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('id, tier, expire_at')
      .eq('id', targetUserId)
      .single();

    if (verifyError || !updatedProfile) {
      throw new Error('更新後驗證失敗');
    }

    // 7. Log the operation
    const logData = {
      timestamp: new Date().toISOString(),
      action: 'ADMIN_SET_EXPIRATION',
      adminId: user.id,
      adminEmail: user.email,
      targetUserId,
      oldExpireAt,
      newExpireAt: validatedExpireAt,
    };

    console.log('[Admin Upgrade API] Expiration update successful:', logData);

    // 8. Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: updatedProfile.id,
        tier: 'MEMBER',
        isMember: true,
        expireAt: updatedProfile.expire_at,
      },
      log: logData,
    });

  } catch (error) {
    console.error('[Admin Upgrade API] Error:', error);
    return NextResponse.json(
      {
        error: '設定到期日失敗',
        details: error instanceof Error ? error.message : '未知錯誤',
      },
      { status: 500 }
    );
  }
}
