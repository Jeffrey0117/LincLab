import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { RecordUsageInput } from '@/lib/automation-types';

/**
 * 從 headers 取得客戶端 IP 地址
 */
async function getClientIP(): Promise<string> {
  const headersList = await headers();

  // 嘗試從不同的 header 取得真實 IP
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headersList.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

/**
 * POST /api/automation/strategies/[id]/use
 * 記錄策略使用（複製文案、複製連結、標記為已使用）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // 驗證用戶登入
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 解析請求資料
    const body: RecordUsageInput = await request.json();

    // 檢查策略是否存在
    const { data: strategy, error: strategyError } = await supabase
      .from('automation_strategies')
      .select('id, is_active')
      .eq('id', id)
      .single();

    if (strategyError || !strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    if (!strategy.is_active) {
      return NextResponse.json({ error: 'Strategy is not active' }, { status: 400 });
    }

    // 檢查變體是否存在（如果有提供）
    if (body.variant_id) {
      const { data: variant, error: variantError } = await supabase
        .from('strategy_variants')
        .select('id, is_active')
        .eq('id', body.variant_id)
        .eq('strategy_id', id)
        .single();

      if (variantError || !variant) {
        return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
      }

      if (!variant.is_active) {
        return NextResponse.json({ error: 'Variant is not active' }, { status: 400 });
      }
    }

    // 取得客戶端資訊
    const ipAddress = await getClientIP();
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'unknown';

    // 記錄使用
    const { data, error } = await supabase
      .from('strategy_usage_logs')
      .insert({
        strategy_id: id,
        variant_id: body.variant_id,
        user_id: user.id,
        copied_content: body.copied_content ?? false,
        copied_link: body.copied_link ?? false,
        marked_as_used: body.marked_as_used ?? false,
        user_agent: userAgent,
        ip_address: ipAddress,
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording usage:', error);
      return NextResponse.json({ error: 'Failed to record usage' }, { status: 500 });
    }

    // 統計會由觸發器自動更新，不需要手動處理

    return NextResponse.json({
      success: true,
      usage_log: data,
      message: 'Usage recorded successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/automation/strategies/[id]/use:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
