/**
 * POST /api/robots/ptt-beauty/scrape
 *
 * 執行 PTT 表特版爬蟲
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { scrapePTTBeauty } from '@/lib/scrapers/ptt-beauty-scraper';
import { batchGenerateStrategies } from '@/lib/scrapers/strategy-generator';
import {
  ExecutionStatus,
  RobotExecutionLog,
  ExecutionParams,
} from '@/lib/robot-types';
import { canUseRobot, USAGE_LIMITS } from '@/lib/membership';

interface ScrapeRequest {
  count: number;
  minPushCount?: number;
  affiliateUrl?: string;
  maxRetries?: number;
  category?: string;
}

interface ScrapeResponse {
  executionLogId: string;
  status: 'started';
  message: string;
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
 * 獲取 PTT Beauty 機器人配置
 */
async function getPTTBeautyRobot() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('robot_configs')
    .select('id')
    .eq('robot_type', 'ptt_beauty')
    .single();

  if (error || !data) {
    throw new Error('PTT Beauty robot not found');
  }

  return data;
}

/**
 * 執行爬蟲（同步模式，優化為 Vercel 快速執行）
 * 為了在 Vercel 10s 限制內完成，採用單次抓取策略
 */
async function executeScraper(
  logId: string,
  robotId: string,
  userId: string | null,
  request: ScrapeRequest
) {
  const startTime = Date.now();

  try {
    const targetCount = request.count;

    console.log(`🚀 Starting fast scraper: target=${targetCount}`);

    // 單次抓取，不做多輪嘗試（節省時間）
    const scrapeResult = await scrapePTTBeauty({
      count: targetCount + 5, // 多抓一些以應對失敗
      minPushCount: request.minPushCount,
      maxRetries: 1, // 減少重試次數
      startPage: 1,
    });

    const totalScraped = scrapeResult.success.length;

    if (scrapeResult.success.length === 0) {
      console.log('⚠️ No articles available from API');
      await updateExecutionLog(logId, {
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_messages: ['無法從 API 獲取文章'],
        current_step: '執行失敗',
      });
      return;
    }

    // 只處理需要的數量
    const postsToProcess = scrapeResult.success.slice(0, targetCount);

    console.log(`🔧 Processing ${postsToProcess.length} posts`);

    // 生成草稿（快速模式，不做進度回調）
    const strategyResult = await batchGenerateStrategies(
      postsToProcess,
      userId,
      robotId,
      request.affiliateUrl, // 傳遞分潤連結
      undefined, // 不使用進度回調，節省數據庫寫入時間
      'beauty' // 使用 beauty 模板
    );

    const finalResults = strategyResult.success;
    const duration = Math.round((Date.now() - startTime) / 1000);

    // 完成狀態
    const status: ExecutionStatus =
      strategyResult.failed.length === 0 ? 'completed' : 'partial';

    await updateExecutionLog(logId, {
      status,
      completed_at: new Date().toISOString(),
      duration_seconds: duration,
      success_count: finalResults.length,
      failed_count: strategyResult.failed.length,
      skipped_count: strategyResult.duplicates.length,
      scraped_count: totalScraped,
      created_strategy_ids: finalResults.map((s) => s.strategyId).filter(id => id),
      created_link_ids: finalResults.map((s) => s.linkId).filter(id => id),
      error_messages: strategyResult.failed.map((f) => `${f.post.title}: ${f.error}`),
      progress_percentage: 100,
      current_step: '執行完成',
    });

    console.log(`✅ Scraper completed in ${duration}s: ${finalResults.length} success, ${strategyResult.duplicates.length} duplicates, ${strategyResult.failed.length} failed`);
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
 * POST /api/robots/ptt-beauty/scrape
 *
 * 重要：Vercel Serverless 無法在 response 返回後繼續執行任務
 * 因此改為同步執行模式，等待爬蟲完成後再返回結果
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

    // 驗證參數 - 限制最大數量為 5，避免超時
    const maxCount = 5; // Vercel Free tier 10s 限制
    if (!body.count || body.count < 1) {
      return NextResponse.json(
        { error: 'Count must be at least 1' },
        { status: 400 }
      );
    }

    // 自動限制數量
    const actualCount = Math.min(body.count, maxCount);
    if (body.count > maxCount) {
      console.log(`Requested ${body.count}, limiting to ${maxCount} due to Vercel timeout limits`);
    }

    // 獲取機器人配置
    const robot = await getPTTBeautyRobot();

    // 創建執行記錄
    const logId = await createExecutionLog(userId, robot.id, {
      targetCount: actualCount,
      filters: {
        minPushCount: body.minPushCount,
      },
    });

    // 同步執行爬蟲（等待完成）
    const adjustedRequest = { ...body, count: actualCount };
    await executeScraper(logId, robot.id, userId, adjustedRequest);

    // 查詢最終結果
    const { data: finalLog } = await supabase
      .from('robot_execution_logs')
      .select('*')
      .eq('id', logId)
      .single();

    // 返回完整結果
    return NextResponse.json({
      executionLogId: logId,
      status: finalLog?.status || 'completed',
      message: '爬蟲執行完成',
      result: {
        requested: body.count,
        actual: actualCount,
        success: finalLog?.success_count || 0,
        failed: finalLog?.failed_count || 0,
        skipped: finalLog?.skipped_count || 0,
        strategies: finalLog?.created_strategy_ids || [],
      },
      note: body.count > maxCount
        ? `因 Vercel 超時限制，每次最多處理 ${maxCount} 篇`
        : undefined,
    }, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/robots/ptt-beauty/scrape:', error);

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
 * GET /api/robots/ptt-beauty/scrape
 * 獲取爬蟲資訊和使用說明
 */
export async function GET() {
  return NextResponse.json({
    name: 'PTT 表特版爬蟲',
    description: '自動抓取 PTT 表特版熱門文章，生成精美圖片連結卡片',
    method: 'POST',
    parameters: {
      count: {
        type: 'number',
        required: true,
        min: 1,
        max: 50,
        description: '要抓取的文章數量',
      },
      minPushCount: {
        type: 'number',
        required: false,
        default: 50,
        description: '最小推文數篩選條件',
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
      category: {
        type: 'string',
        required: false,
        default: 'beauty',
        description: '策略分類',
      },
    },
    example: {
      count: 10,
      minPushCount: 50,
      affiliateUrl: 'https://shopee.tw/...',
    },
    response: {
      executionLogId: 'uuid',
      status: 'started',
      message: '爬蟲已開始執行，請查詢執行狀態以獲取結果',
    },
  });
}
