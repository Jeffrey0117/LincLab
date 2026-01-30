import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ExecuteRobotResponse, ExecutionStatus, PTTPost } from '@/lib/robot-types';
import { scrapePTTBeauty as scrapePTTBeautyReal, PTTPost as ScraperPTTPost } from '@/lib/scrapers/ptt-beauty-scraper';
import crypto from 'crypto';
import { canUseRobot, USAGE_LIMITS } from '@/lib/membership';

/**
 * PTT 爬蟲實現 - 使用真正的爬蟲
 */
async function scrapePTTBeauty(
  config: any,
  params: any,
  logId: string,
  userId: string
): Promise<PTTPost[]> {
  const supabase = await createClient();
  const targetCount = params.targetCount || 10;

  try {
    // 更新執行狀態為 running
    await supabase
      .from('robot_execution_logs')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        current_step: '正在抓取 PTT 文章列表...'
      })
      .eq('id', logId);

    // 使用真正的 PTT 爬蟲
    const result = await scrapePTTBeautyReal({
      count: targetCount,
      minPushCount: params.filters?.minPushCount || config?.minPushCount || 0,
      maxRetries: 3,
      startPage: 1,
    });

    // 轉換格式（ScraperPTTPost -> PTTPost）
    const posts: PTTPost[] = result.success.map((post: ScraperPTTPost) => ({
      id: post.id,
      title: post.title,
      author: post.author,
      date: post.date,
      url: post.url,
      pushCount: post.pushCount,
      images: post.images,
      content: '',
    }));

    // 更新進度
    await supabase
      .from('robot_execution_logs')
      .update({
        current_step: `已抓取 ${posts.length} 篇符合條件的文章`,
        progress_percentage: 50
      })
      .eq('id', logId);

    return posts;

  } catch (error) {
    console.error('PTT 爬蟲錯誤:', error);
    throw error;
  }
}

/**
 * 創建策略卡片
 */
async function createStrategyFromPost(
  post: PTTPost,
  robotConfig: any,
  userId: string,
  affiliateUrl?: string | null
): Promise<{ strategyId?: string; linkId?: string; error?: string }> {
  const supabase = await createClient();
  try {
    // 決定跳轉目標：優先用戶設定的分潤連結，否則用原始 PTT 文章連結
    const targetUrl = affiliateUrl || post.url;

    // 1. 創建短連結（使用圖片模板）
    const { data: link, error: linkError } = await supabase
      .from('links')
      .insert({
        short_code: generateShortCode(),
        original_url: post.url,
        affiliate_url: targetUrl, // 重要：設定分潤連結
        user_id: userId,
        content_mode: 'template',
        template_type: 'image',
        template_config: {
          imageUrl: post.images[0],
          altText: post.title,
          showHint: true,
          hintText: '👆 點擊查看更多精彩圖片',
          hintPosition: 'bottom',
          fitMode: 'cover'
        },
        og_title: post.title,
        og_description: `PTT 表特版熱門文章 - 推文數: ${post.pushCount}`,
        og_image: post.images[0],
        // 設定策略：使用 cookie_popup 讓用戶跳轉分潤連結
        strategy: affiliateUrl ? 'cookie_popup' : 'none',
        strategy_config: affiliateUrl ? {
          triggerType: 'immediate',
          title: '發現好物！',
          description: '點擊查看更多精彩內容',
          acceptText: '立即查看',
          declineText: '稍後再說'
        } : null
      })
      .select()
      .single();

    if (linkError) {
      console.error('創建短連結失敗:', linkError);
      return { error: '創建短連結失敗' };
    }

    // 2. 生成貼文文案
    const postContent = generatePostContent(post);

    // 3. 創建自動化策略卡片
    const { data: strategy, error: strategyError } = await supabase
      .from('automation_strategies')
      .insert({
        name: `PTT: ${post.title}`,
        description: `推文數: ${post.pushCount} | 作者: ${post.author}`,
        category: 'beauty',
        icon: '😍',
        post_content: postContent,
        short_link_id: link.id,
        created_by: userId,
        is_active: true,
        is_public: false, // 預設為私人
        tags: ['PTT', '表特版', '正妹', `推${post.pushCount}`],
        metadata: {
          source: 'ptt_beauty',
          original_post: post
        }
      })
      .select()
      .single();

    if (strategyError) {
      console.error('創建策略失敗:', strategyError);
      return { linkId: link.id, error: '創建策略失敗' };
    }

    // 4. 儲存爬取項目記錄
    const contentHash = crypto
      .createHash('sha256')
      .update(post.id)
      .digest('hex');

    await supabase
      .from('scraped_items')
      .insert({
        robot_id: robotConfig.id,
        source_url: post.url,
        source_id: post.id,
        source_hash: contentHash,
        title: post.title,
        author: post.author,
        publish_date: new Date().toISOString(), // 需要解析實際日期
        images: post.images,
        primary_image: post.images[0],
        push_count: post.pushCount,
        is_processed: true,
        processed_at: new Date().toISOString(),
        strategy_id: strategy.id,
        link_id: link.id,
        raw_data: post
      });

    return { strategyId: strategy.id, linkId: link.id };

  } catch (error) {
    console.error('創建策略錯誤:', error);
    return { error: '創建策略時發生錯誤' };
  }
}

/**
 * 生成短連結代碼
 */
function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成貼文文案
 */
function generatePostContent(post: PTTPost): string {
  const templates = [
    `🔥 爆推正妹來了！\n\n${post.title}\n\n推文數：${post.pushCount} 🚀\n發文者：${post.author}\n\n👇 點擊查看高清大圖\n#PTT表特版 #正妹 #台灣`,
    `✨ ${post.title}\n\n推文數：${post.pushCount} ❤️\n\n點擊查看更多精彩圖片 👈\n#正妹 #PTT #表特版`,
    `😍 今日精選\n\n${post.title}\n\n🔥 ${post.pushCount} 推\n\n立即查看完整圖集 ➡️\n#PTT正妹 #表特版`,
    `【PTT 熱門】${post.title}\n\n推爆數：${post.pushCount} 💯\n\n點擊查看更多美照 📸\n#正妹 #PTT表特版`
  ];

  // 根據推文數選擇模板
  let templateIndex = 0;
  if (post.pushCount > 80) {
    templateIndex = 0; // 爆推模板
  } else if (post.pushCount > 50) {
    templateIndex = 2; // 精選模板
  } else {
    templateIndex = 1; // 一般模板
  }

  return templates[templateIndex];
}

/**
 * POST /api/robots/[robotType]/scrape
 * 執行爬蟲
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ robotType: string }> }
) {
  try {
    const supabase = await createClient();
    const { robotType } = await context.params;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: '未授權訪問' },
        { status: 401 }
      );
    }

    // 驗證用戶
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: '無效的授權令牌' },
        { status: 401 }
      );
    }

    // 獲取機器人配置
    const { data: robotConfig, error: configError } = await supabase
      .from('robot_configs')
      .select('*')
      .eq('robot_type', robotType)
      .eq('is_active', true)
      .single();

    if (configError || !robotConfig) {
      return NextResponse.json(
        { error: '找不到指定的機器人' },
        { status: 404 }
      );
    }

    // 檢查權限
    if (!robotConfig.is_public &&
        robotConfig.created_by !== user.id &&
        !robotConfig.allowed_users?.includes(user.id)) {
      return NextResponse.json(
        { error: '無權限使用此機器人' },
        { status: 403 }
      );
    }

    // 會員權限和使用限制檢查
    const usageCheck = await canUseRobot(user.id);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Usage limit exceeded',
          message: usageCheck.reason,
          current: usageCheck.current,
          limit: usageCheck.limit,
          dailyLimit: USAGE_LIMITS.ROBOT_DAILY_LIMIT,
        },
        { status: 403 }
      );
    }

    // 獲取請求參數
    const body = await request.json();
    const executionParams = {
      targetCount: body.count || robotConfig.max_items_per_run || 10,
      filters: body.filters || {},
      options: body.options || {},
      affiliateUrl: body.affiliateUrl || null, // 用戶設定的分潤連結
    };

    // 創建執行記錄
    const { data: executionLog, error: logError } = await supabase
      .from('robot_execution_logs')
      .insert({
        robot_id: robotConfig.id,
        user_id: user.id,
        status: 'pending',
        execution_params: executionParams,
        target_count: executionParams.targetCount,
        progress_percentage: 0
      })
      .select()
      .single();

    if (logError || !executionLog) {
      return NextResponse.json(
        { error: '創建執行記錄失敗' },
        { status: 500 }
      );
    }

    // 異步執行爬蟲（避免超時）
    executeRobotAsync(robotType, robotConfig, executionParams, executionLog.id, user.id);

    const response: ExecuteRobotResponse = {
      execution_log_id: executionLog.id,
      status: 'pending',
      message: '爬蟲任務已開始執行'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('爬蟲執行 API 錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}

/**
 * 異步執行機器人爬蟲
 */
async function executeRobotAsync(
  robotType: string,
  robotConfig: any,
  params: any,
  logId: string,
  userId: string
) {
  const supabase = await createClient();
  let successCount = 0;
  let failedCount = 0;
  const createdStrategyIds: string[] = [];
  const createdLinkIds: string[] = [];
  const errors: string[] = [];

  try {
    // 根據機器人類型執行不同的爬蟲
    let scrapedItems: any[] = [];

    if (robotType === 'ptt_beauty') {
      scrapedItems = await scrapePTTBeauty(robotConfig.config, params, logId, userId);
    } else {
      throw new Error(`不支援的機器人類型: ${robotType}`);
    }

    // 更新爬取數量
    await supabase
      .from('robot_execution_logs')
      .update({
        scraped_count: scrapedItems.length,
        current_step: `開始處理 ${scrapedItems.length} 個項目...`,
        progress_percentage: 60,
        scraped_items: scrapedItems
      })
      .eq('id', logId);

    // 處理每個爬取的項目
    for (let i = 0; i < scrapedItems.length; i++) {
      const item = scrapedItems[i];

      try {
        // 更新進度
        const progress = 60 + Math.floor((i + 1) / scrapedItems.length * 40);
        await supabase
          .from('robot_execution_logs')
          .update({
            current_step: `處理第 ${i + 1}/${scrapedItems.length} 個項目`,
            progress_percentage: progress
          })
          .eq('id', logId);

        // 創建策略卡片（傳入用戶設定的分潤連結）
        const result = await createStrategyFromPost(item, robotConfig, userId, params.affiliateUrl);

        if (result.error) {
          failedCount++;
          errors.push(`${item.title}: ${result.error}`);
        } else {
          successCount++;
          if (result.strategyId) createdStrategyIds.push(result.strategyId);
          if (result.linkId) createdLinkIds.push(result.linkId);
        }

      } catch (itemError: any) {
        failedCount++;
        errors.push(`${item.title}: ${itemError.message}`);
        console.error('處理項目錯誤:', itemError);
      }
    }

    // 更新最終狀態
    const finalStatus: ExecutionStatus =
      successCount === 0 ? 'failed' :
      failedCount > 0 ? 'partial' :
      'completed';

    await supabase
      .from('robot_execution_logs')
      .update({
        status: finalStatus,
        success_count: successCount,
        failed_count: failedCount,
        created_strategy_ids: createdStrategyIds,
        created_link_ids: createdLinkIds,
        error_messages: errors,
        completed_at: new Date().toISOString(),
        duration_seconds: Math.floor((Date.now() - new Date(logId).getTime()) / 1000),
        progress_percentage: 100,
        current_step: `完成：成功 ${successCount}，失敗 ${failedCount}`
      })
      .eq('id', logId);

  } catch (error: any) {
    console.error('機器人執行錯誤:', error);

    // 更新為失敗狀態
    await supabase
      .from('robot_execution_logs')
      .update({
        status: 'failed',
        error_messages: [error.message],
        completed_at: new Date().toISOString(),
        progress_percentage: 100,
        current_step: '執行失敗'
      })
      .eq('id', logId);
  }
}