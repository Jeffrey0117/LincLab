/**
 * License Webhook API
 *
 * POST /api/license/webhook
 *
 * 銷售站付款成功後呼叫，直接開通永久會員
 * 買斷制，無到期日
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const API_SECRET = process.env.LICENSE_API_SECRET;
if (!API_SECRET) {
  console.error('CRITICAL: LICENSE_API_SECRET environment variable is not set');
}

interface WebhookRequest {
  email: string;       // 用戶 email
  order_id?: string;   // 訂單編號 (選填，記錄用)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // 1. 驗證 API Secret
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. 解析請求
    const body: WebhookRequest = await request.json();

    if (!body.email) {
      return NextResponse.json(
        { success: false, error: 'EMAIL_REQUIRED' },
        { status: 400 }
      );
    }

    const email = body.email.toLowerCase().trim();

    // 3. 查找用戶
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      console.error('Error listing users:', userError);
      return NextResponse.json(
        { success: false, error: 'USER_LOOKUP_FAILED' },
        { status: 500 }
      );
    }

    const user = users.users.find((u) => u.email?.toLowerCase() === email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'USER_NOT_FOUND', email },
        { status: 404 }
      );
    }

    // 4. 開通永久會員
    const { error: updateError } = await supabase.from('profiles').upsert({
      id: user.id,
      tier: 'VIP',
      expire_at: null,  // 永久
      updated_at: new Date().toISOString(),
    });

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { success: false, error: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    // 5. 記錄（選填）
    if (body.order_id) {
      await supabase.from('license_keys').insert({
        key: `ORDER-${body.order_id}`,
        plan: 'VIP',
        duration_days: null,
        used_by: user.id,
        used_at: new Date().toISOString(),
        source: 'webhook',
        note: `Order: ${body.order_id}`,
      });
    }

    // 6. 成功
    return NextResponse.json({
      success: true,
      user_id: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
