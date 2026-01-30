import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/admin/set-tier
 *
 * 管理員設定用戶會員等級
 *
 * Request Body:
 * {
 *   targetUserId: string,
 *   tier: "FREE" | "VIP"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 使用 service role client 繞過 RLS
    const serviceClient = createAdminClient();

    // 1. 驗證當前用戶
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    // 2. 檢查是否為管理員
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: '權限不足，僅限管理員操作' },
        { status: 403 }
      );
    }

    // 3. 解析請求
    const body = await request.json();
    const { targetUserId, tier } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { error: '缺少 targetUserId' },
        { status: 400 }
      );
    }

    if (!tier || !['FREE', 'VIP'].includes(tier)) {
      return NextResponse.json(
        { error: 'tier 必須是 FREE 或 VIP' },
        { status: 400 }
      );
    }

    // 4. 更新用戶 tier（使用 service client 繞過 RLS）
    const { error: updateError } = await serviceClient
      .from('profiles')
      .update({
        tier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetUserId);

    if (updateError) {
      console.error('[Admin Set Tier] Update error:', updateError);
      return NextResponse.json(
        { error: '更新失敗', details: updateError.message },
        { status: 500 }
      );
    }

    console.log('[Admin Set Tier] Success:', {
      adminId: user.id,
      targetUserId,
      newTier: tier,
    });

    return NextResponse.json({
      success: true,
      targetUserId,
      tier,
    });

  } catch (error) {
    console.error('[Admin Set Tier] Error:', error);
    return NextResponse.json(
      { error: '操作失敗', details: error instanceof Error ? error.message : '未知錯誤' },
      { status: 500 }
    );
  }
}
