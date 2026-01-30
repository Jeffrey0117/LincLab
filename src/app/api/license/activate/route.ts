/**
 * License Key Activation API
 *
 * POST /api/license/activate
 *
 * For users to activate their license keys.
 * Requires user authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ActivateRequest {
  key: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: '請先登入' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body: ActivateRequest = await request.json();

    if (!body.key || typeof body.key !== 'string') {
      return NextResponse.json(
        { success: false, error: 'INVALID_REQUEST', message: '請輸入啟用碼' },
        { status: 400 }
      );
    }

    // Normalize key: uppercase and trim
    const normalizedKey = body.key.trim().toUpperCase();

    // Validate format (PLAN-XXXX-XXXX)
    const keyPattern = /^(PRO|VIP)-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!keyPattern.test(normalizedKey)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_FORMAT', message: '啟用碼格式不正確' },
        { status: 400 }
      );
    }

    // 3. Call the activation function
    const { data: result, error: activateError } = await supabase.rpc(
      'activate_license_key',
      {
        license_key: normalizedKey,
        user_id: user.id,
      }
    );

    if (activateError) {
      console.error('Activation error:', activateError);
      return NextResponse.json(
        { success: false, error: 'ACTIVATION_FAILED', message: '啟用失敗，請稍後再試' },
        { status: 500 }
      );
    }

    // 4. Return result from database function
    return NextResponse.json(result);
  } catch (error) {
    console.error('License activation error:', error);
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: '伺服器錯誤' },
      { status: 500 }
    );
  }
}
