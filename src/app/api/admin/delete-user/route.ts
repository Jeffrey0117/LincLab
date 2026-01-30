import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/admin/delete-user
 *
 * 管理員刪除用戶（從 auth.users 和 profiles 中完全移除）
 *
 * Request Body:
 * {
 *   targetUserId: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { error: '缺少 targetUserId' },
        { status: 400 }
      );
    }

    // 4. 不能刪除自己
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: '不能刪除自己的帳號' },
        { status: 400 }
      );
    }

    // 5. 使用 service role 刪除用戶
    const serviceClient = createAdminClient();

    // 刪除 auth.users（會連帶刪除 profiles，因為有 ON DELETE CASCADE）
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(targetUserId);

    if (deleteError) {
      console.error('[Admin Delete User] Delete error:', deleteError);
      return NextResponse.json(
        { error: '刪除失敗', details: deleteError.message },
        { status: 500 }
      );
    }

    console.log('[Admin Delete User] Success:', {
      adminId: user.id,
      deletedUserId: targetUserId,
    });

    return NextResponse.json({
      success: true,
      deletedUserId: targetUserId,
    });

  } catch (error) {
    console.error('[Admin Delete User] Error:', error);
    return NextResponse.json(
      { error: '操作失敗', details: error instanceof Error ? error.message : '未知錯誤' },
      { status: 500 }
    );
  }
}
