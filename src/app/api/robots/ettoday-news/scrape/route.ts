/**
 * POST /api/robots/ettoday-news/scrape
 *
 * 執行 ETtoday 新聞爬蟲
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { scrapeETtodayNews, NewsPost } from '@/lib/scrapers/ettoday-news-scraper';
import { batchGenerateStrategies } from '@/lib/scrapers/strategy-generator';
import { PTTPost } from '@/lib/scrapers/ptt-beauty-scraper';
import {
  ExecutionStatus,
  RobotExecutionLog,
  ExecutionParams,
} from '@/lib/robot-types';
import { canUseRobot, USAGE_LIMITS } from '@/lib/membership';

interface ScrapeRequest {
  count: number;
  affiliateUrl?: string;
  maxRetries?: number;
}

interface ScrapeResponse {
  executionLogId: string;
  status: 'started';
  message: string;
}

/**
 * 將 NewsPost 轉換為 PTTPost 格式
 * 以便重用 strategy-generator 的功能
 */
function newsPostToPTTPost(newsPost: NewsPost): PTTPost & { summary?: string } {
  return {
    id: newsPost.id,
    title: newsPost.title,
    author: 'ETtoday',
    date: newsPost.date,
    url: newsPost.url,
    viewUrl: newsPost.url,
    imageUrl: newsPost.imageUrl,
    images: newsPost.imageUrl ? [newsPost.imageUrl] : [],
    pushCount: 0, // 新聞沒有推文數
    summary: newsPost.summary, // 新聞摘要
  };
}

/**
 * 創建執行記錄
 */
async function createExecutionLog(
  userId: string | null,
  robotId: string,
  params: ExecutionParams
): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('robot_execution_logs')
    .insert({
      robot_id: robotId,
      user_id: userId,
      status: 'running' as ExecutionStatus,
      execution_params: params,
      target_count: params.targetCount,
      scraped_count: 0,
      success_count: 0,
      failed_count: 0,
      skipped_count: 0,
      created_strategy_ids: [],
      created_link_ids: [],
      error_messages: [],
      warnings: [],
      started_at: new Date().toISOString(),
      progress_percentage: 0,
      current_step: '準備開始爬蟲',
      scraped_items: [],
      processing_logs: [],
      metadata: {},
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create execution log: ${error?.message}`);
  }

  return data.id;
}

/**
 * 更新執行記錄
 */
async function updateExecutionLog(
  logId: string,
  update: Partial<RobotExecutionLog>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('robot_execution_logs')
    .update(update)
    .eq('id', logId);

  if (error) {
    console.error('Failed to update execution log:', error);
  }
}

/**
 * 獲取 ETtoday News 機器人配置
 */
async function getETtodayNewsRobot() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('robot_configs')
    .select('id')
    .eq('robot_type', 'ettoday_news')
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * 執行爬蟲（異步）- 智能批次迴圈，持續抓取直到收集足夠新文章
 */
async function executeScraper(
  logId: string,
  robotId: string,
  userId: string | null,
  request: ScrapeRequest
) {
  try {
    const targetCount = request.count;
    const startTime = Date.now();

    // 智能批次迴圈變數
    const allSuccessResults: any[] = [];
    const allDuplicates: any[] = [];
    const allFailures: Array<{ post: PTTPost; error: string }> = [];
    let totalScraped = 0;
    const maxAttempts = 5; // 最多嘗試 5 次
    let attempts = 0;

    // 更新狀態
    await updateExecutionLog(logId, {
      current_step: '正在抓取 ETtoday 熱門新聞',
      progress_percentage: 10,
    });

    // 持續抓取直到收集到足夠的新文章
    let currentOffset = 0; // 追蹤已處理的新聞數量

    while (allSuccessResults.length < targetCount && attempts < maxAttempts) {
      attempts++;

      // 計算還需要多少篇新文章
      const needed = targetCount - allSuccessResults.length;

      // 智能批次大小：至少抓 10 篇，最多 50 篇
      // 確保有足夠的新聞可以過濾重複
      const batchSize = Math.max(Math.min(needed * 3, 50), 10);

      console.log(`\nAttempt ${attempts}: Need ${needed} more, fetching ${batchSize} news from offset ${currentOffset}...`);

      // 執行爬蟲（使用 offset 跳過已處理的新聞）
      const scrapeResult = await scrapeETtodayNews({
        count: batchSize,
        maxRetries: request.maxRetries,
        offset: currentOffset,
      });

      // 更新 offset 以便下次從新位置開始
      currentOffset += scrapeResult.success.length;

      totalScraped += scrapeResult.success.length;

      if (scrapeResult.success.length === 0) {
        console.log('No news fetched in this attempt');
        break;
      }

      // 更新狀態
      await updateExecutionLog(logId, {
        current_step: `檢查重複與生成草稿 (已抓 ${totalScraped} 篇, 嘗試 ${attempts}/${maxAttempts})`,
        progress_percentage: 20 + attempts * 10,
        scraped_count: totalScraped,
      });

      // 將 NewsPost 轉換為 PTTPost 格式
      const pttPosts: PTTPost[] = scrapeResult.success.map(newsPostToPTTPost);

      // 生成草稿（包含去重檢查）- 使用 external_link 模板
      // 使用 maxSuccess 精確控制只創建需要的數量
      const strategyResult = await batchGenerateStrategies(
        pttPosts,
        userId,
        robotId,
        request.affiliateUrl,
        async (current, total) => {
          const percentage = 30 + attempts * 10 + Math.round((current / total) * 10);
          await updateExecutionLog(logId, {
            progress_percentage: Math.min(percentage, 90),
            current_step: `生成草稿 ${current}/${total} (嘗試 ${attempts})`,
          });
        },
        'external_link', // 使用外部連結預覽模板
        needed // maxSuccess: 只創建還需要的數量
      );

      // 累積結果
      allSuccessResults.push(...strategyResult.success);
      allDuplicates.push(...strategyResult.duplicates);
      allFailures.push(...strategyResult.failed);

      console.log(`Attempt ${attempts} results: ${strategyResult.success.length} new, ${strategyResult.duplicates.length} duplicates`);
      console.log(`Total collected: ${allSuccessResults.length}/${targetCount}`);

      // 如果已經收集到足夠的新文章，停止
      if (allSuccessResults.length >= targetCount) {
        break;
      }

      // 如果這批全是重複的
      if (strategyResult.success.length === 0) {
        // 檢查是否已經抓完所有可用的新聞（ETtoday 熱門頁面約 60-70 條）
        if (currentOffset >= 60) {
          console.log(`Reached end of available news (offset=${currentOffset}), stopping`);
          break;
        }
        // 如果嘗試太多次還是全部重複，停止
        if (attempts >= 5) {
          console.log('All news are duplicates after multiple attempts, stopping');
          break;
        }
        console.log(`All duplicates in this batch, continuing with offset ${currentOffset}...`);
      }
    }

    // 只取用戶要求的數量
    const finalResults = allSuccessResults.slice(0, targetCount);

    // 計算執行時間
    const duration = Math.round((Date.now() - startTime) / 1000);

    // 完成狀態
    const status: ExecutionStatus =
      finalResults.length === 0
        ? 'failed'
        : finalResults.length < targetCount
        ? 'partial'
        : 'completed';

    await updateExecutionLog(logId, {
      status,
      completed_at: new Date().toISOString(),
      duration_seconds: duration,
      success_count: finalResults.length,
      failed_count: allFailures.length,
      skipped_count: allDuplicates.length,
      scraped_count: totalScraped,
      created_strategy_ids: finalResults.map((s) => s.strategyId).filter((id: string) => id),
      created_link_ids: finalResults.map((s) => s.linkId).filter((id: string) => id),
      error_messages: allFailures.map((f) => `${f.post.title}: ${f.error}`),
      progress_percentage: 100,
      current_step: finalResults.length === 0 ? '所有新聞都是重複的' : '執行完成',
    });

    console.log(`
ETtoday News Scraper execution completed:
- Log ID: ${logId}
- Requested: ${targetCount}
- Delivered: ${finalResults.length}
- Total Scraped: ${totalScraped}
- Duplicates Skipped: ${allDuplicates.length}
- Failed: ${allFailures.length}
- Duration: ${duration}s
- Attempts: ${attempts}
    `);
  } catch (error) {
    console.error('Scraper execution failed:', error);

    await updateExecutionLog(logId, {
      status: 'failed',
      completed_at: new Date().toISOString(),
      error_messages: [
        error instanceof Error ? error.message : 'Unknown error',
      ],
      current_step: '執行失敗',
    });
  }
}

/**
 * POST /api/robots/ettoday-news/scrape
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 驗證用戶登入（必須登入）
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

    // 檢查每日使用限制
    const usageCheck = await canUseRobot(userId);
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

    // 解析請求
    const body: ScrapeRequest = await request.json();

    // 驗證參數
    if (!body.count || body.count < 1 || body.count > 50) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 50' },
        { status: 400 }
      );
    }

    // 獲取機器人配置
    const robot = await getETtodayNewsRobot();

    if (!robot) {
      return NextResponse.json(
        {
          error: 'Robot configuration not found',
          message: '找不到 ETtoday News 機器人配置。請先在 robot_configs 表中創建 robot_type = "ettoday_news" 的配置。',
          hint: '需要執行 SQL: INSERT INTO robot_configs (name, robot_type, description, ...) VALUES ("ETtoday 新聞爬蟲", "ettoday_news", ...)',
        },
        { status: 404 }
      );
    }

    // 創建執行記錄
    const logId = await createExecutionLog(userId, robot.id, {
      targetCount: body.count,
      filters: {},
    });

    // 在背景執行爬蟲（不等待完成）
    executeScraper(logId, robot.id, userId, body).catch((error) => {
      console.error('Background scraper execution failed:', error);
    });

    // 立即返回
    const response: ScrapeResponse = {
      executionLogId: logId,
      status: 'started',
      message: '爬蟲已開始執行，請查詢執行狀態以獲取結果',
    };

    return NextResponse.json(response, { status: 202 });
  } catch (error) {
    console.error('Error in POST /api/robots/ettoday-news/scrape:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/robots/ettoday-news/scrape
 * 獲取爬蟲資訊和使用說明
 */
export async function GET() {
  return NextResponse.json({
    name: 'ETtoday 熱門新聞爬蟲',
    description: '自動抓取 ETtoday 熱門新聞，生成精美圖片連結卡片',
    method: 'POST',
    parameters: {
      count: {
        type: 'number',
        required: true,
        min: 1,
        max: 50,
        description: '要抓取的新聞數量',
      },
      affiliateUrl: {
        type: 'string',
        required: false,
        description: '聯盟連結網址（用於轉換目標）',
      },
      maxRetries: {
        type: 'number',
        required: false,
        default: 3,
        min: 1,
        max: 5,
        description: '失敗重試次數',
      },
    },
    example: {
      count: 10,
      affiliateUrl: 'https://shopee.tw/...',
    },
    response: {
      executionLogId: 'uuid',
      status: 'started',
      message: '爬蟲已開始執行，請查詢執行狀態以獲取結果',
    },
    notes: [
      '需要先在 robot_configs 表中創建 robot_type = "ettoday_news" 的配置',
      '爬蟲會自動去重，避免重複抓取相同新聞',
      '生成的連結預設為草稿狀態（status = "draft"）',
    ],
  });
}
