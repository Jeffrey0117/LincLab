import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const supabaseAdmin = createAdminClient();
  try {
    // 1. 驗證是否為管理員
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: '沒有權限' }, { status: 403 });
    }

    // 2. 取得要重設的 email 和新密碼
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: '請提供 email 和 newPassword' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: '密碼至少 6 個字元' }, { status: 400 });
    }

    // 3. 找到該用戶
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('List users error:', listError);
      return NextResponse.json({ error: '查詢用戶失敗' }, { status: 500 });
    }

    const targetUser = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!targetUser) {
      return NextResponse.json({ error: '找不到該用戶' }, { status: 404 });
    }

    // 4. 更新密碼 + 確認 email（順便解決驗證問題）
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      {
        password: newPassword,
        email_confirm: true  // 順便確認 email
      }
    );

    if (updateError) {
      console.error('Update user error:', updateError);
      return NextResponse.json({ error: '更新密碼失敗: ' + updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `已將 ${email} 的密碼設為: ${newPassword}，Email 已確認`,
      userId: targetUser.id
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({
      error: '處理失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}
