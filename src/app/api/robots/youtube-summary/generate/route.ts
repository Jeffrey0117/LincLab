import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Vercel serverless 函數配置 - 延長超時時間
export const maxDuration = 30; // 秒

// 從 URL 提取 YouTube Video ID
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// 獲取 YouTube 影片資訊
async function getVideoInfo(videoId: string) {
  try {
    // 使用 oEmbed API 獲取基本資訊
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      throw new Error('無法獲取影片資訊');
    }

    const data = await response.json();
    return {
      title: data.title,
      author: data.author_name,
      thumbnailUrl: data.thumbnail_url,
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    return null;
  }
}

// 使用 DeepSeek API 生成摘要
async function generateSummaryWithAI(videoTitle: string, videoUrl: string): Promise<string> {
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

  if (!deepseekApiKey) {
    // 如果沒有 API key，返回預設摘要
    return generateDefaultSummary(videoTitle);
  }

  try {
    // 設定 15 秒超時
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是專業影片分析師。根據標題分析影片核心價值。簡潔有力，使用繁體中文。'
          },
          {
            role: 'user',
            content: `分析這部 YouTube 影片：「${videoTitle}」

格式（直接回覆，不要開場白）：

📌 核心觀點：[一句話總結]

🔑 關鍵洞見：
1. [重點一]
2. [重點二]
3. [重點三]

💡 實用建議：[一個行動建議]`
          }
        ],
        temperature: 0.7,
        max_tokens: 400,
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('DeepSeek API error:', await response.text());
      return generateDefaultSummary(videoTitle);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (text) {
      return text.trim();
    }

    return generateDefaultSummary(videoTitle);
  } catch (error) {
    console.error('Error calling DeepSeek:', error);
    return generateDefaultSummary(videoTitle);
  }
}

// 預設摘要生成（當沒有 AI 時使用）
function generateDefaultSummary(videoTitle: string): string {
  return `📌 核心觀點：本影片深入探討「${videoTitle}」的關鍵概念

🔑 關鍵洞見：
1. 影片標題暗示這是一個值得深入學習的主題
2. 建議搭配實際操作來加深理解
3. 可以在留言區與其他學習者交流心得

💡 實用建議：先完整看一遍，再針對重點段落做筆記`;
}

// 生成短碼
function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    // 建立 Supabase 客戶端（使用 server-side client，自動處理 cookies）
    const supabase = await createClient();

    // 驗證用戶登入
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '請先登入才能使用機器人功能' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // 檢查是否為管理員（管理員無限制）
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    const isAdmin = profile?.is_admin === true;

    // 獲取用戶等級限制
    const { data: membership } = await supabase
      .from('user_memberships')
      .select('tier')
      .eq('user_id', userId)
      .single();

    const tier = membership?.tier || 'free';

    // 管理員無限制，其他人依等級
    const dailyLimit = isAdmin ? 9999 : (tier === 'free' ? 1 : tier === 'pro' ? 5 : 20);

    // 檢查今日使用量（用 links 表計算，因為每次都會建立連結）
    const today = new Date().toISOString().split('T')[0];
    const { count: todayCount } = await supabase
      .from('links')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('template_type', 'cloud_drive')
      .like('title', 'YT課代表%')
      .gte('created_at', `${today}T00:00:00.000Z`);

    if ((todayCount || 0) >= dailyLimit) {
      return NextResponse.json({
        error: '已達到每日使用上限',
        message: `今日已使用 ${todayCount}/${dailyLimit} 次`,
        current: todayCount,
        limit: dailyLimit,
      }, { status: 403 });
    }

    // 解析請求
    const body = await request.json();
    const { youtubeUrl, affiliateUrl } = body;

    if (!youtubeUrl) {
      return NextResponse.json({ error: '請提供 YouTube 連結' }, { status: 400 });
    }

    // 提取 Video ID
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json({ error: '無效的 YouTube 連結' }, { status: 400 });
    }

    // 獲取影片資訊
    const videoInfo = await getVideoInfo(videoId);
    if (!videoInfo) {
      return NextResponse.json({ error: '無法獲取影片資訊' }, { status: 400 });
    }

    // 生成 AI 摘要
    const summary = await generateSummaryWithAI(videoInfo.title, youtubeUrl);

    // 建立嘟嘟網盤連結
    const shortCode = generateShortCode();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shortUrl = `${baseUrl}/${shortCode}`;

    // 隨機名字
    const randomNames = ['Joh**son', 'Mic**ael', 'Ale**nder', 'Chr**tina', 'Wil**am', 'Dan**el', 'Nic**las', 'Mat**ew', 'Ste**en', 'And**ew'];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];

    // 建立連結到資料庫 - 下載檔案內容比發文更詳細
    const fileContent = `📚 YT課代表筆記

━━━━━━━━━━━━━━━━━━━━━━
📺 影片資訊
━━━━━━━━━━━━━━━━━━━━━━

標題：${videoInfo.title}
作者：${videoInfo.author}
連結：${youtubeUrl}

━━━━━━━━━━━━━━━━━━━━━━
📝 重點摘要
━━━━━━━━━━━━━━━━━━━━━━

${summary}

━━━━━━━━━━━━━━━━━━━━━━
💡 學習建議
━━━━━━━━━━━━━━━━━━━━━━

• 建議搭配影片一起觀看，效果更佳
• 重要段落可以暫停做筆記
• 不懂的地方可以重複觀看
• 善用 YouTube 字幕功能輔助理解

━━━━━━━━━━━━━━━━━━━━━━

這份筆記由 YT課代表 整理
覺得有幫助的話，記得分享給需要的朋友！`;

    const { error: linkError } = await supabase.from('links').insert({
      user_id: userId,
      short_code: shortCode,
      title: `YT課代表筆記：${videoInfo.title}`,
      affiliate_url: affiliateUrl || youtubeUrl,
      og_title: `${randomName}給您加密分享了文件`,
      og_description: '請輸入提取碼查看分享內容',
      og_image: videoInfo.thumbnailUrl,
      content_mode: 'template',
      template_type: 'cloud_drive',
      template_config: {
        extractCode: '8888',
        fileName: `${videoInfo.title.substring(0, 50)} - YT課代表筆記.txt`,
        fileContent: fileContent,
      },
      strategy: 'none',
      link_mode: 'redirect',
      html_content: '', // 必填欄位
      is_active: true,
    });

    if (linkError) {
      console.error('Error creating link:', linkError);
      return NextResponse.json({
        error: '建立連結失敗',
        details: linkError.message,
        code: linkError.code
      }, { status: 500 });
    }

    // 使用量追蹤：透過 links 表計算（每次執行都會建立連結）

    // 組合發文內容
    const postContent = `📚 課代表來了！

${summary}

我把這份筆記放在雲端了：${shortUrl}
提取碼 8888 不客氣 🎁`;

    return NextResponse.json({
      success: true,
      videoTitle: videoInfo.title,
      summary,
      shortUrl,
      postContent,
    });

  } catch (error) {
    console.error('Error in youtube-summary:', error);
    return NextResponse.json({
      error: '處理失敗',
      message: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}
