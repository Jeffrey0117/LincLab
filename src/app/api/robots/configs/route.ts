/**
 * GET /api/robots/configs
 *
 * 獲取可用的機器人配置列表
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RobotConfig, RobotCategory } from '@/lib/robot-types';

interface GetRobotConfigsParams {
  robot_type?: string;
  category?: RobotCategory;
  is_active?: boolean;
  is_beta?: boolean;
  is_public?: boolean;
}

interface GetRobotConfigsResponse {
  robots: RobotConfig[];
  count: number;
  categories: Array<{
    category: RobotCategory;
    count: number;
  }>;
}

/**
 * GET /api/robots/configs
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 驗證用戶登入
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 解析查詢參數
    const searchParams = request.nextUrl.searchParams;
    const params: GetRobotConfigsParams = {
      robot_type: searchParams.get('robot_type') || undefined,
      category: (searchParams.get('category') as RobotCategory) || undefined,
      is_active: searchParams.get('is_active') === 'true' || undefined,
      is_beta: searchParams.get('is_beta') === 'true' || undefined,
      is_public: searchParams.get('is_public') === 'true' || undefined,
    };

    // 建立查詢
    let query = supabase.from('robot_configs').select('*');

    // 套用篩選條件
    if (params.robot_type) {
      query = query.eq('robot_type', params.robot_type);
    }

    if (params.category) {
      query = query.eq('category', params.category);
    }

    if (params.is_active !== undefined) {
      query = query.eq('is_active', params.is_active);
    }

    if (params.is_beta !== undefined) {
      query = query.eq('is_beta', params.is_beta);
    }

    // 權限篩選：公開的 OR 自己創建的 OR 被允許使用的
    if (params.is_public !== undefined) {
      query = query.eq('is_public', params.is_public);
    } else {
      // 預設只顯示有權限看的
      query = query.or(
        `is_public.eq.true,created_by.eq.${user.id},allowed_users.cs.{${user.id}}`
      );
    }

    // 排序
    query = query.order('display_order').order('created_at');

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching robot configs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch robot configs' },
        { status: 500 }
      );
    }

    // 計算分類統計
    const categoryMap = new Map<RobotCategory, number>();
    data?.forEach((robot) => {
      if (robot.category) {
        categoryMap.set(
          robot.category,
          (categoryMap.get(robot.category) || 0) + 1
        );
      }
    });

    const categories = Array.from(categoryMap.entries()).map(
      ([category, count]) => ({
        category,
        count,
      })
    );

    const response: GetRobotConfigsResponse = {
      robots: (data as RobotConfig[]) || [],
      count: data?.length || 0,
      categories,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/robots/configs:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
