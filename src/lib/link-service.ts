/**
 * 優化的短連結服務
 *
 * 目的：減少 Vercel Function Invocations 和 DB 查詢
 * 原本：每次點擊 = 4-5 Function Invocations + 5-6 DB 查詢
 * 優化後：每次點擊 = 1 Function Invocation + 1 RPC 呼叫
 */

import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface LinkData {
  id: string;
  short_code: string;
  affiliate_url: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  favicon_url?: string;
  html_content?: string;
  strategy?: string;
  strategy_config?: Record<string, unknown>;
  content_mode?: 'custom' | 'template';
  template_type?: string;
  template_config?: Record<string, unknown>;
  link_mode?: 'redirect' | 'proxy_preview' | 'proxy_ai';
  target_url?: string;
  proxy_content?: string;
}

export interface ClickInfo {
  is_new: boolean;
  is_converted: boolean;
}

export interface LinkAndClickResult {
  found: boolean;
  link: LinkData | null;
  click: ClickInfo | null;
}

/**
 * 取得客戶端 IP 地址
 */
export async function getClientIP(): Promise<string> {
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
 * 取得 User Agent
 */
export async function getUserAgent(): Promise<string> {
  const headersList = await headers();
  return headersList.get('user-agent') || 'unknown';
}

/**
 * 優化的一次性取得 link 資料並記錄點擊
 *
 * 使用 Supabase RPC 函數將多次 DB 操作整合為一次呼叫：
 * - 查詢 link 資料
 * - 檢查是否已點擊
 * - 記錄新點擊（如果需要）
 * - 更新點擊計數
 *
 * 從原本的 5-6 次 DB 查詢減少到 1 次 RPC 呼叫
 */
export async function getLinkAndTrackClick(
  shortCode: string,
  isPreview: boolean = false
): Promise<LinkAndClickResult> {
  try {
    const ipAddress = await getClientIP();
    const userAgent = await getUserAgent();

    const supabase = getSupabaseClient();
    // 一次 RPC 呼叫完成所有操作
    const { data, error } = await supabase.rpc('get_link_and_track_click', {
      p_short_code: shortCode,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_is_preview: isPreview
    });

    if (error) {
      console.error('RPC error:', error);
      // 如果 RPC 不存在，fallback 到舊方法
      return await getLinkAndTrackClickFallback(shortCode, ipAddress, userAgent, isPreview);
    }

    return data as LinkAndClickResult;
  } catch (err) {
    console.error('Error in getLinkAndTrackClick:', err);
    return { found: false, link: null, click: null };
  }
}

/**
 * Fallback 方法：當 RPC 不存在時使用
 * 這是為了向後相容，在 migration 還沒執行時使用
 */
async function getLinkAndTrackClickFallback(
  shortCode: string,
  ipAddress: string,
  userAgent: string,
  isPreview: boolean
): Promise<LinkAndClickResult> {
  try {
    const supabase = getSupabaseClient();
    // 1. 查詢 link 資料
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select(`
        id,
        short_code,
        affiliate_url,
        og_title,
        og_description,
        og_image,
        favicon_url,
        html_content,
        strategy,
        strategy_config,
        content_mode,
        template_type,
        template_config,
        link_mode,
        target_url,
        proxy_content
      `)
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .single();

    if (linkError || !link) {
      return { found: false, link: null, click: null };
    }

    // 如果是預覽模式，不記錄點擊
    if (isPreview) {
      return {
        found: true,
        link: link as LinkData,
        click: { is_new: false, is_converted: false }
      };
    }

    // 2. 檢查是否已點擊
    const { data: existingClick } = await supabase
      .from('link_clicks')
      .select('converted')
      .eq('link_id', link.id)
      .eq('ip_address', ipAddress)
      .single();

    let isNewClick = false;
    const isConverted = existingClick?.converted || false;

    // 3. 如果沒有點擊記錄，建立新記錄
    if (!existingClick) {
      await supabase.from('link_clicks').insert({
        link_id: link.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        converted: false
      });

      // 4. 遞增點擊計數
      await supabase.rpc('increment_click_count', {
        p_short_code: shortCode
      });

      isNewClick = true;
    }

    return {
      found: true,
      link: link as LinkData,
      click: { is_new: isNewClick, is_converted: isConverted }
    };
  } catch (err) {
    console.error('Error in fallback:', err);
    return { found: false, link: null, click: null };
  }
}

/**
 * 標記為已轉換（使用優化的 RPC）
 */
export async function markAsConverted(shortCode: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const ipAddress = await getClientIP();

    // 嘗試使用 RPC
    const { data, error } = await supabase.rpc('mark_link_converted', {
      p_short_code: shortCode,
      p_ip_address: ipAddress
    });

    if (error) {
      // Fallback：直接更新
      return await markAsConvertedFallback(shortCode, ipAddress);
    }

    return data === true;
  } catch (err) {
    console.error('Error marking as converted:', err);
    return false;
  }
}

/**
 * Fallback：標記轉換
 */
async function markAsConvertedFallback(
  shortCode: string,
  ipAddress: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { data: link } = await supabase
      .from('links')
      .select('id')
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .single();

    if (!link) return false;

    const { error } = await supabase
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

    return !error;
  } catch {
    return false;
  }
}

/**
 * 只取得 link 基本資料（用於 generateMetadata）
 * 注意：這個函數不會記錄點擊
 */
export async function getLinkMetadata(shortCode: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('links')
    .select('og_title, og_description, og_image, favicon_url')
    .eq('short_code', shortCode)
    .eq('is_active', true)
    .single();

  if (error) {
    return null;
  }

  return data;
}
