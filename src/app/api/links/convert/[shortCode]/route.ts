/**
 * POST /api/links/convert/[shortCode]
 *
 * 輕量 API：標記連結已轉換
 * 優化目的：減少 Server Action 的 overhead
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getClientIP(): Promise<string> {
  const headersList = await headers();
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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await context.params;
    const ipAddress = await getClientIP();
    const supabase = getSupabaseClient();

    // 嘗試使用 RPC（如果已部署）
    const { data: rpcResult, error: rpcError } = await supabase.rpc('mark_link_converted', {
      p_short_code: shortCode,
      p_ip_address: ipAddress
    });

    if (!rpcError && rpcResult) {
      return NextResponse.json({ success: true });
    }

    // Fallback：直接查詢和更新
    const { data: link } = await supabase
      .from('links')
      .select('id')
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .single();

    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    const { error: upsertError } = await supabase
      .from('link_clicks')
      .upsert(
        {
          link_id: link.id,
          ip_address: ipAddress,
          converted: true
        },
        {
          onConflict: 'link_id,ip_address',
          ignoreDuplicates: false
        }
      );

    if (upsertError) {
      console.error('Failed to mark conversion:', upsertError);
      return NextResponse.json(
        { success: false, error: 'Failed to mark conversion' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in convert API:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
