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
 * 檢查該 IP 是否已經轉換過（跳轉過蝦皮）
 */
export async function checkIfConverted(shortCode: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const ipAddress = await getClientIP();

    // 1. 找到對應的 link
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('id')
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .single();

    if (linkError || !link) {
      return false;
    }

    // 2. 檢查該 IP 是否已經轉換過
    const { data: clickRecord } = await supabase
      .from('link_clicks')
      .select('converted')
      .eq('link_id', link.id)
      .eq('ip_address', ipAddress)
      .single();

    return clickRecord?.converted === true;
  } catch (err) {
    console.error('Error checking conversion:', err);
    return false;
  }
}

/**
 * 標記該 IP 已經轉換（跳轉過蝦皮）
 */
export async function markAsConverted(shortCode: string): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const ipAddress = await getClientIP();

    // 1. 找到對應的 link
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('id')
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .single();

    if (linkError || !link) {
      console.error('Link not found:', linkError);
      return;
    }

    // 2. 更新或插入記錄，標記為已轉換
    const { error: upsertError } = await supabase
      .from('link_clicks')
      .upsert(
        {
          link_id: link.id,
          ip_address: ipAddress,
          converted: true,
        },
        {
          onConflict: 'link_id,ip_address',
          ignoreDuplicates: false,
        }
      );

    if (upsertError) {
      console.error('Failed to mark as converted:', upsertError);
    }
  } catch (err) {
    console.error('Error marking as converted:', err);
  }
}
