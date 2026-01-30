'use server';

import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * 從 headers 取得客戶端 IP 地址
 */
async function getClientIP(): Promise<string> {
  const headersList = await headers();

  // 嘗試從不同的 header 取得真實 IP
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for 可能包含多個 IP，取第一個
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headersList.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // 如果都沒有，返回預設值
  return 'unknown';
}

/**
 * 追蹤短連結點擊次數（使用 IP 追蹤，24小時內同 IP 不重複計數）
 * @param shortCode 短連結代碼
 * @returns 成功或失敗狀態
 */
export async function trackLinkClick(shortCode: string) {
  try {
    const supabase = getSupabaseClient();
    // 取得客戶端 IP
    const ipAddress = await getClientIP();
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'unknown';

    // 1. 先找到對應的 link
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('id')
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .single();

    if (linkError || !link) {
      console.error('Link not found:', linkError);
      return { success: false };
    }

    // 2. 檢查是否已經點擊過（同 IP，永久記錄）
    const { data: existingClick } = await supabase
      .from('link_clicks')
      .select('id')
      .eq('link_id', link.id)
      .eq('ip_address', ipAddress)
      .single();

    // 3. 如果已經點擊過，不計數（避免重複）
    if (existingClick) {
      console.log(`IP ${ipAddress} already clicked, skipping count`);
      return { success: true, counted: false };
    }

    // 4. 記錄這次點擊（第一次）
    const { error: insertError } = await supabase
      .from('link_clicks')
      .insert({
        link_id: link.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        converted: false, // 預設未轉換
      });

    if (insertError) {
      console.error('Failed to insert click record:', insertError);
      // 即使插入失敗，仍然計數（向後相容）
    }

    // 5. 遞增點擊計數
    const { error: updateError } = await supabase.rpc('increment_click_count', {
      p_short_code: shortCode
    });

    if (updateError) {
      console.error('Failed to increment click count:', updateError);
      return { success: false };
    }

    return { success: true, counted: true };
  } catch (err) {
    console.error('Error tracking click:', err);
    return { success: false };
  }
}
