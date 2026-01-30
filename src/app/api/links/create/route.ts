/**
 * POST /api/links/create
 *
 * 創建新的短連結
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';
import { canCreateLink, ERROR_MESSAGES } from '@/lib/membership';

interface CreateLinkRequest {
  title: string;
  affiliateUrl: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  strategy?: string;
  accountId?: string;
  tags?: string[];
  faviconUrl?: string;
  // 新增參數
  targetUrl?: string;       // 外部連結預覽的目標 URL（用於 external_link 模板）
  htmlContent?: string;     // 自定義 HTML 內容（用於無模板模式）
  useTemplate?: boolean;    // 是否使用模板模式（預設 true）
}

/**
 * HTML 特殊字元編碼（防止 XSS 攻擊）
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 獲取已認證的用戶 ID
 * 不再支援開發模式後備邏輯，必須登入才能使用
 */
async function getUserId(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (user) {
    return user.id;
  }

  console.log('Auth check failed:', authError?.message);
  return null;
}

/**
 * POST /api/links/create
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 獲取用戶 ID（支持開發模式）
    const userId = await getUserId(supabase);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: ERROR_MESSAGES.NOT_LOGGED_IN
        },
        { status: 401 }
      );
    }

    // 會員權限檢查
    const membershipCheck = await canCreateLink(userId);
    if (!membershipCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Membership required',
          message: membershipCheck.reason,
          current: membershipCheck.current,
          limit: membershipCheck.limit,
        },
        { status: 403 }
      );
    }

    // 解析請求 body
    const body: CreateLinkRequest = await request.json();

    // 驗證必填欄位
    if (!body.title || !body.affiliateUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: title and affiliateUrl are required'
        },
        { status: 400 }
      );
    }

    // 驗證 URL 格式
    try {
      new URL(body.affiliateUrl);
    } catch (e) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid affiliateUrl format'
        },
        { status: 400 }
      );
    }

    // 生成短代碼
    const shortCode = nanoid(6);

    // 判斷是否使用模板模式（預設為 true）
    const useTemplate = body.useTemplate !== false;

    // 準備要插入的資料
    let linkData;

    if (useTemplate) {
      // 模板模式：使用 external_link 模板
      linkData = {
        user_id: userId,
        short_code: shortCode,
        title: body.title,
        affiliate_url: body.affiliateUrl,
        og_title: body.ogTitle || body.title,
        og_description: body.ogDescription || null,
        og_image: body.ogImage || null,
        // 使用模板模式，套用外部連結預覽模板
        content_mode: 'template',
        template_type: 'external_link',
        template_config: {
          targetUrl: body.targetUrl || body.affiliateUrl, // 優先使用 targetUrl
          customTitle: body.ogTitle || body.title,
          customDescription: body.ogDescription || '',
          customImage: body.ogImage || '',
        },
        // 策略設定
        strategy: body.strategy || 'cookie_popup',
        strategy_config: {
          triggerType: 'immediate',
          title: 'Cookie 使用說明',
          description: '本網站使用 Cookie 來提供更好的使用體驗',
          acceptText: '我同意',
          declineText: '了解更多',
        },
        account_id: body.accountId || null,
        tags: body.tags || [],
        favicon_url: body.faviconUrl || null,
        is_active: true,
        status: 'active',
        click_count: 0,
        html_content: '', // 使用模板模式，html_content 為空
      };
    } else {
      // 自定義 HTML 模式
      const htmlContent = body.htmlContent || generateHtmlContent({
        title: body.title,
        ogTitle: body.ogTitle,
        ogDescription: body.ogDescription,
        ogImage: body.ogImage,
        faviconUrl: body.faviconUrl,
        affiliateUrl: body.affiliateUrl,
        strategy: body.strategy || 'redirect',
      });

      linkData = {
        user_id: userId,
        short_code: shortCode,
        title: body.title,
        affiliate_url: body.affiliateUrl,
        og_title: body.ogTitle || body.title,
        og_description: body.ogDescription || null,
        og_image: body.ogImage || null,
        // 使用自定義 HTML 模式
        content_mode: 'custom',
        template_type: null,
        template_config: {},
        // 策略設定
        strategy: body.strategy || 'redirect',
        strategy_config: {
          triggerType: 'immediate',
          title: 'Cookie 使用說明',
          description: '本網站使用 Cookie 來提供更好的使用體驗',
          acceptText: '我同意',
          declineText: '了解更多',
        },
        account_id: body.accountId || null,
        tags: body.tags || [],
        favicon_url: body.faviconUrl || null,
        is_active: true,
        status: 'active',
        click_count: 0,
        html_content: htmlContent, // 使用自定義 HTML 內容
      };
    }

    // 插入到資料庫
    const { data: link, error } = await supabase
      .from('links')
      .insert([linkData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create link',
          details: error.message
        },
        { status: 500 }
      );
    }

    // 構建完整的短連結 URL
    const origin = request.headers.get('origin') ||
                  request.headers.get('host') ||
                  'http://localhost:3000';
    const shortUrl = `${origin}/${shortCode}`;

    return NextResponse.json({
      success: true,
      data: link,
      shortUrl
    });

  } catch (error) {
    console.error('Error in POST /api/links/create:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * 生成 HTML 內容
 */
function generateHtmlContent(params: {
  title: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  faviconUrl?: string;
  affiliateUrl: string;
  strategy: string;
}): string {
  const {
    title,
    ogTitle,
    ogDescription,
    ogImage,
    faviconUrl,
    affiliateUrl,
    strategy
  } = params;

  // 根據策略生成不同的轉址代碼
  let redirectScript = '';

  switch (strategy) {
    case 'cookie':
      redirectScript = `
        <script>
          // 設置 cookie
          document.cookie = "visited=true; path=/; max-age=86400";
          // 延遲轉址
          setTimeout(function() {
            window.location.href = "${affiliateUrl}";
          }, 1000);
        </script>
      `;
      break;
    case 'redirect':
      redirectScript = `
        <script>
          window.location.href = "${affiliateUrl}";
        </script>
      `;
      break;
    case 'meta-refresh':
      redirectScript = `
        <meta http-equiv="refresh" content="2;url=${affiliateUrl}">
      `;
      break;
    case 'iframe':
      redirectScript = `
        <style>
          body { margin: 0; padding: 0; }
          iframe { border: none; width: 100vw; height: 100vh; }
        </style>
        <iframe src="${affiliateUrl}"></iframe>
      `;
      break;
    default:
      redirectScript = `
        <script>
          window.location.href = "${affiliateUrl}";
        </script>
      `;
  }

  // 對所有用戶輸入進行 HTML 編碼（防止 XSS）
  const safeTitle = escapeHtml(title);
  const safeOgTitle = ogTitle ? escapeHtml(ogTitle) : '';
  const safeOgDescription = ogDescription ? escapeHtml(ogDescription) : '';

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  ${safeOgTitle ? `<meta property="og:title" content="${safeOgTitle}">` : ''}
  ${safeOgDescription ? `<meta property="og:description" content="${safeOgDescription}">` : ''}
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : ''}
  <meta property="og:type" content="website">
  ${faviconUrl ? `<link rel="icon" type="image/x-icon" href="${faviconUrl}">` : ''}
  ${strategy === 'meta-refresh' ? redirectScript : ''}
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      text-align: center;
      color: white;
    }
    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top: 3px solid white;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h1 {
      font-size: 24px;
      margin: 0 0 10px;
    }
    p {
      font-size: 14px;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  ${strategy !== 'iframe' ? `
    <div class="container">
      <div class="spinner"></div>
      <h1>${safeTitle}</h1>
      <p>正在為您跳轉...</p>
    </div>
  ` : ''}
  ${strategy !== 'meta-refresh' ? redirectScript : ''}
</body>
</html>`;
}