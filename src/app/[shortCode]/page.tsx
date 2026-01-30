import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import ShortLinkClientOptimized from './ShortLinkClientOptimized';
import type { LinkData, ClickInfo } from '@/lib/link-service';

// 使用 Edge Runtime - 比 Node.js Runtime 便宜很多
// Edge: 免費 500K 請求/月，之後 $0.65/百萬
// Node.js: 免費 100K 請求/月，之後 $0.60/百萬
export const runtime = 'edge';

// 啟用部分快取 - 減少重複查詢
export const revalidate = 60; // 60 秒快取 metadata

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * 只取 OG metadata（最輕量查詢）
 * 這個查詢會被快取 60 秒
 */
async function getLinkMetadata(shortCode: string) {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('links')
    .select('og_title, og_description, og_image, favicon_url')
    .eq('short_code', shortCode)
    .eq('is_active', true)
    .single();

  return data;
}

/**
 * 取得完整 link 資料（給 Client Component 用）
 */
async function getFullLinkData(shortCode: string): Promise<LinkData | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
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

  if (error || !data) return null;
  return data as LinkData;
}

// SSR 生成 OG tags（必須保留，否則社群分享沒有預覽）
export async function generateMetadata({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}): Promise<Metadata> {
  try {
    const { shortCode } = await params;
    const metadata = await getLinkMetadata(shortCode);

    if (!metadata) {
      return { title: '連結不存在' };
    }

    return {
      title: metadata.og_title || 'LinkCab 縮網址服務',
      description: metadata.og_description,
      openGraph: {
        title: metadata.og_title || 'LinkCab 縮網址服務',
        description: metadata.og_description || undefined,
        images: metadata.og_image ? [{ url: metadata.og_image }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: metadata.og_title || undefined,
        description: metadata.og_description || undefined,
        images: metadata.og_image ? [metadata.og_image] : [],
      },
      icons: {
        icon: metadata.favicon_url || '/favicon.ico',
      },
    };
  } catch (err) {
    console.error('Error in generateMetadata:', err);
    return { title: '載入錯誤' };
  }
}

/**
 * 優化後的短連結頁面 (Edge Runtime)
 *
 * 成本優化策略：
 * 1. 使用 Edge Runtime（比 Node.js 便宜 5 倍）
 * 2. Metadata 有 60 秒快取
 * 3. Click tracking 移到 Client-side（不算 Function）
 * 4. 只在 Server 做最小必要的工作（OG + 傳資料）
 *
 * 成本估算（200K 月點擊）：
 * - Edge Runtime: 200K 請求 → 免費範圍內 (500K 免費)
 * - 如果用 Node.js: 200K 請求 → 超出免費 100K
 */
export default async function ShortLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ shortCode: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { shortCode } = await params;
  const { preview } = await searchParams;
  const isPreviewMode = preview === 'true';

  // Server 端只做一次 DB 查詢取得資料
  const linkData = await getFullLinkData(shortCode);

  if (!linkData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-muted-foreground">連結不存在或已失效</p>
        </div>
      </div>
    );
  }

  // Click tracking 移到 Client-side 處理
  // 這樣不會觸發額外的 Server Function
  return (
    <ShortLinkClientOptimized
      shortCode={shortCode}
      isPreview={isPreviewMode}
      initialLinkData={linkData}
      initialClickInfo={null} // Client 會自己處理
    />
  );
}
