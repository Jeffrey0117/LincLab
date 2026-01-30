import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  AutomationStrategy,
  AutomationStrategyWithLink,
  CreateStrategyInput,
  GetStrategiesParams,
  validateStrategyInput,
} from '@/lib/automation-types';

/**
 * GET /api/automation/strategies
 * 獲取所有可用的自動化策略
 * 查詢參數：
 * - category: 分類篩選
 * - is_active: 是否啟用
 * - is_public: 是否公開
 * - search: 搜尋關鍵字
 * - tags: 標籤篩選（逗號分隔）
 * - sort_by: 排序欄位
 * - sort_order: 排序順序
 * - limit: 每頁數量
 * - offset: 偏移量
 * - include_link: 是否包含短連結資訊
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 取得當前用戶
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 解析查詢參數
    const searchParams = request.nextUrl.searchParams;
    const params: GetStrategiesParams = {
      category: searchParams.get('category') as any,
      is_active: searchParams.get('is_active') === 'true',
      is_public: searchParams.get('is_public') === 'true' || undefined,
      search: searchParams.get('search') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean),
      sort_by: (searchParams.get('sort_by') as any) || 'created_at',
      sort_order: (searchParams.get('sort_order') as any) || 'desc',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const includeLink = searchParams.get('include_link') === 'true';

    // 建立查詢
    let query = supabase.from('automation_strategies').select(
      includeLink
        ? `
          *,
          short_link:links!short_link_id (
            id,
            short_code,
            title,
            affiliate_url,
            click_count
          )
        `
        : '*'
    );

    // 套用篩選條件
    if (params.category) {
      query = query.eq('category', params.category);
    }

    if (params.is_active !== undefined) {
      query = query.eq('is_active', params.is_active);
    }

    // 如果指定 is_public，則只顯示公開的
    // 否則顯示公開的 + 自己創建的 + 被允許使用的
    if (params.is_public !== undefined) {
      query = query.eq('is_public', params.is_public);
    }

    // 搜尋功能（名稱或描述）
    if (params.search) {
      query = query.or(
        `name.ilike.%${params.search}%,description.ilike.%${params.search}%`
      );
    }

    // 標籤篩選
    if (params.tags && params.tags.length > 0) {
      query = query.overlaps('tags', params.tags);
    }

    // 排序
    query = query.order(params.sort_by || 'created_at', {
      ascending: params.sort_order === 'asc',
    });

    // 分頁
    if (params.limit) {
      query = query.range(params.offset || 0, (params.offset || 0) + params.limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching strategies:', error);
      return NextResponse.json({ error: 'Failed to fetch strategies' }, { status: 500 });
    }

    return NextResponse.json({
      strategies: data as unknown as AutomationStrategy[] | AutomationStrategyWithLink[],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('Error in GET /api/automation/strategies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/automation/strategies
 * 創建新的自動化策略（需要登入）
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 驗證用戶登入
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 解析請求資料
    const body: CreateStrategyInput = await request.json();

    // 驗證輸入
    const errors = validateStrategyInput(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });
    }

    // 檢查短連結是否存在（如果有提供）
    if (body.short_link_id) {
      const { data: link, error: linkError } = await supabase
        .from('links')
        .select('id')
        .eq('id', body.short_link_id)
        .eq('user_id', user.id)
        .single();

      if (linkError || !link) {
        return NextResponse.json(
          { error: 'Short link not found or not owned by user' },
          { status: 404 }
        );
      }
    }

    // 創建策略
    const { data, error } = await supabase
      .from('automation_strategies')
      .insert({
        name: body.name,
        description: body.description,
        category: body.category,
        icon: body.icon,
        post_content: body.post_content,
        short_link_id: body.short_link_id,
        is_public: body.is_public ?? true,
        allowed_users: body.allowed_users,
        tags: body.tags,
        metadata: body.metadata || {},
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating strategy:', error);
      return NextResponse.json({ error: 'Failed to create strategy' }, { status: 500 });
    }

    return NextResponse.json({ strategy: data as unknown as AutomationStrategy }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/automation/strategies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
