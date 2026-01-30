/**
 * GET /api/robots/execution/[logId]
 *
 * 查詢機器人執行狀態
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RobotExecutionLog, ExecutionStatus } from '@/lib/robot-types';

interface ExecutionStatusResponse {
  id: string;
  status: ExecutionStatus;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  result?: {
    successCount: number;
    failedCount: number;
    skippedCount: number;
    createdStrategyIds: string[];
    createdLinkIds: string[];
    errors: string[];
    warnings: string[];
    totalTime?: number;
  };
  started_at?: string;
  completed_at?: string;
  current_step?: string;
  robot?: {
    id: string;
    name: string;
    robot_type: string;
  };
}

/**
 * GET /api/robots/execution/[logId]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ logId: string }> }
) {
  try {
    const supabase = await createClient();
    const { logId } = await context.params;

    // 獲取當前用戶（必須登入）
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    // 查詢執行記錄（加上 user_id 過濾確保資料隔離）
    const { data: log, error } = await supabase
      .from('robot_execution_logs')
      .select(
        `
        *,
        robot_config:robot_configs!robot_id (
          id,
          name,
          robot_type
        )
      `
      )
      .eq('id', logId)
      .eq('user_id', user.id)  // 資料隔離：只能查詢自己的記錄
      .single();

    if (error || !log) {
      return NextResponse.json(
        { error: 'Execution log not found' },
        { status: 404 }
      );
    }

    // 構建回應（使用 snake_case 保持一致性）
    const response = {
      id: log.id,
      status: log.status,
      target_count: log.target_count,
      success_count: log.success_count,
      failed_count: log.failed_count,
      skipped_count: log.skipped_count,
      progress_percentage: log.progress_percentage,
      current_step: log.current_step,
      started_at: log.started_at,
      completed_at: log.completed_at,
      duration_seconds: log.duration_seconds,
      created_strategy_ids: log.created_strategy_ids || [],
      created_link_ids: log.created_link_ids || [],
      error_messages: log.error_messages || [],
      warnings: log.warnings || [],
      robot: log.robot_config,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/robots/execution/[logId]:', error);

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
 * DELETE /api/robots/execution/[logId]
 * 取消正在執行的任務
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ logId: string }> }
) {
  try {
    const supabase = await createClient();
    const { logId } = await context.params;

    // 獲取當前用戶（必須登入）
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    // 檢查執行記錄（加上 user_id 過濾確保資料隔離）
    const { data: log, error: fetchError } = await supabase
      .from('robot_execution_logs')
      .select('id, status, user_id')
      .eq('id', logId)
      .eq('user_id', user.id)  // 資料隔離：只能操作自己的記錄
      .single();

    if (fetchError || !log) {
      return NextResponse.json(
        { error: 'Execution log not found' },
        { status: 404 }
      );
    }

    // 只能取消 running 或 pending 狀態的任務
    if (!['running', 'pending'].includes(log.status)) {
      return NextResponse.json(
        { error: 'Cannot cancel completed execution' },
        { status: 400 }
      );
    }

    // 更新狀態為 cancelled
    const { error: updateError } = await supabase
      .from('robot_execution_logs')
      .update({
        status: 'cancelled' as ExecutionStatus,
        completed_at: new Date().toISOString(),
        current_step: '已取消',
      })
      .eq('id', logId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: 'Execution cancelled successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/robots/execution/[logId]:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
