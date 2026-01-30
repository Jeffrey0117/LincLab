/**
 * Strategy Generator for PTT Posts
 * 根據 Agent 1 的分析結果，使用正確的欄位結構
 * Plan-8: 加入去重檢查和草稿狀態管理
 * Plan-9: 加入圖片黑名單過濾
 */

import { PTTPost } from './ptt-beauty-scraper';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import {
  getBlacklistedImages,
  getBlacklistReason,
} from '@/lib/config/image-blacklist';

export interface GenerateStrategyOptions {
  post: PTTPost;
  userId: string | null;
  robotId?: string; // Plan-8: 用於去重檢查
  checkDuplicate?: boolean; // Plan-8: 是否檢查重複
  duplicateCheckDays?: number; // Plan-8: 檢查幾天內的重複
  affiliateUrl?: string; // 使用者設定的分潤連結
  templateType?: 'beauty' | 'external_link'; // 模板類型，預設 beauty
}

export interface GeneratedStrategy {
  strategyId: string;
  linkId: string;
  shortCode: string;
  shortUrl: string;
  isDuplicate?: boolean; // Plan-8: 是否為重複項目
}

function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Plan-8: 產生文章的唯一雜湊值（用於去重）
 */
function generateSourceHash(post: PTTPost): string {
  const content = `${post.url}|${post.title}`;
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Plan-8: 檢查文章是否已經被抓取過
 */
async function checkIsDuplicate(
  supabase: any,
  robotId: string,
  sourceHash: string,
  daysBack: number = 30
): Promise<boolean> {
  try {
    console.log(`🔍 Checking duplicate: robot=${robotId}, hash=${sourceHash.substring(0, 8)}..., days=${daysBack}`);

    const { data, error } = await supabase.rpc('is_duplicate_item', {
      p_robot_id: robotId,
      p_source_hash: sourceHash,
      days_back: daysBack,
    });

    if (error) {
      console.error('❌ 去重檢查 RPC 失敗:', error.message, error);
      // 作為後備，直接查詢 scraped_items 表
      const { data: items, error: queryError } = await supabase
        .from('scraped_items')
        .select('id')
        .eq('robot_id', robotId)
        .eq('source_hash', sourceHash)
        .limit(1);

      if (queryError) {
        console.error('❌ 直接查詢也失敗:', queryError.message);
        return false; // 檢查失敗不阻擋執行
      }

      const isDup = items && items.length > 0;
      console.log(`📊 直接查詢結果: ${isDup ? '重複' : '新項目'}`);
      return isDup;
    }

    console.log(`📊 RPC 結果: ${data === true ? '重複' : '新項目'}`);
    return data === true;
  } catch (error) {
    console.error('❌ 去重檢查異常:', error);
    return false;
  }
}

function extractCleanTitle(pttTitle: string): string {
  let title = pttTitle.replace(/\[正妹\]/g, '').trim();
  title = title.replace(/^Re:\s*/gi, '').trim();
  return title || '正妹分享';
}

async function createShortLink(
  userId: string | null,
  post: PTTPost,
  robotId?: string,
  affiliateUrl?: string,
  templateType: 'beauty' | 'external_link' = 'beauty'
): Promise<{ linkId: string; shortCode: string; scrapedItemId?: string }> {
  const supabase = await createClient();
  const shortCode = generateShortCode();
  const cleanTitle = extractCleanTitle(post.title);
  const sourceHash = generateSourceHash(post);

  // 如果沒有 userId，從資料庫撈第一個存在的連結的 user_id（必定存在且有效）
  let actualUserId = userId;
  if (!actualUserId) {
    const { data: existingLink } = await supabase
      .from('links')
      .select('user_id')
      .not('user_id', 'is', null)
      .limit(1)
      .single();

    if (existingLink?.user_id) {
      actualUserId = existingLink.user_id;
      console.log(`Using existing user_id: ${actualUserId}`);
    } else {
      throw new Error('No valid user_id found in database. Please login first.');
    }
  }

  // Plan-8: 創建草稿狀態的連結（預設 status = 'draft'）
  const allImages = post.images && post.images.length > 0 ? post.images : [post.imageUrl];

  // 根據模板類型準備不同的資料
  let linkData;

  if (templateType === 'external_link') {
    // 外部連結預覽模板（用於新聞等）- 使用 direct 策略，不顯示 cookie 跳窗
    linkData = {
      user_id: actualUserId,
      short_code: shortCode,
      title: cleanTitle,
      affiliate_url: affiliateUrl || post.url, // 優先使用 affiliateUrl，否則用原文連結
      html_content: '',
      content_mode: 'template',
      template_type: 'external_link',
      template_config: {
        targetUrl: post.url, // 顯示原文連結的預覽
        customTitle: cleanTitle,
        customDescription: (post as any).summary || '',
        customImage: post.imageUrl,
      },
      og_title: cleanTitle,
      og_description: (post as any).summary || cleanTitle,
      og_image: post.imageUrl,
      status: 'draft',
      strategy: 'direct', // 外部連結使用直接跳轉，不需要 cookie 跳窗
      strategy_config: {}
    };
  } else {
    // Beauty 模板（用於 PTT 表特版）
    linkData = {
      user_id: actualUserId,
      short_code: shortCode,
      title: cleanTitle,
      affiliate_url: affiliateUrl || '',
      html_content: '',
      content_mode: 'template',
      template_type: 'beauty',
      template_config: {
        images: allImages,
        title: cleanTitle,
        description: `👇 往下滑看更多美圖 (共 ${allImages.length} 張)`,
        layout: 'grid',
        sourceUrl: post.viewUrl,
        sourceType: 'ptt_beauty'
      },
      og_title: cleanTitle,
      og_description: `${allImages.length} 張精選美圖 - PTT 表特版`,
      og_image: post.imageUrl,
      status: 'draft',
      strategy: 'cookie_popup',
      strategy_config: {
        triggerType: 'immediate',
        title: 'Cookie 使用說明',
        description: '本網站使用 Cookie 來提升您的瀏覽體驗。繼續使用本網站即表示您同意我們的 Cookie 政策。',
        acceptText: '我同意',
        declineText: '了解更多'
      }
    };
  }

  const { data: link, error: linkError } = await supabase
    .from('links')
    .insert(linkData)
    .select('id, short_code')
    .single();

  if (linkError || !link) {
    throw new Error(`Failed to create link: ${linkError?.message}`);
  }

  // Plan-8: 記錄到 scraped_items（用於未來去重）
  let scrapedItemId: string | undefined;
  if (robotId) {
    try {
      const { data: scrapedItem, error: scrapedError } = await supabase
        .from('scraped_items')
        .insert({
          robot_id: robotId,
          source_url: post.url,
          source_hash: sourceHash,
          title: post.title, // 使用正確的欄位名稱
          author: post.author,
          push_count: post.pushCount,
          images: post.images || [],
          primary_image: post.imageUrl,
          link_id: link.id, // 使用 link_id 而不是 created_link_id
          is_processed: true,
          raw_data: {
            imageUrl: post.imageUrl,
            images: post.images || [],
            pushCount: post.pushCount,
            date: post.date,
            viewUrl: post.viewUrl,
            id: post.id
          }
        })
        .select('id')
        .single();

      if (!scrapedError && scrapedItem) {
        scrapedItemId = scrapedItem.id;
        console.log(`✓ Scraped item recorded: ${sourceHash.substring(0, 8)}...`);
      } else {
        // 檢查是否為唯一約束違反（重複）
        if (scrapedError?.code === '23505' || scrapedError?.message?.includes('unique')) {
          console.warn(`⚠️  Duplicate constraint violated (expected if retrying): ${sourceHash.substring(0, 8)}...`);
          // 嘗試查找現有記錄
          const { data: existing } = await supabase
            .from('scraped_items')
            .select('id')
            .eq('robot_id', robotId)
            .eq('source_hash', sourceHash)
            .single();
          if (existing) {
            scrapedItemId = existing.id;
            console.log(`📌 Using existing scraped_item: ${scrapedItemId}`);
          }
        } else {
          console.error('❌ Failed to create scraped_item:', scrapedError?.message, scrapedError);
        }
      }
    } catch (error) {
      console.error('❌ Exception creating scraped_item:', error);
    }
  }

  return {
    linkId: link.id,
    shortCode: link.short_code,
    scrapedItemId,
  };
}

export async function generateStrategyFromPost(
  options: GenerateStrategyOptions
): Promise<GeneratedStrategy> {
  const {
    post,
    userId,
    robotId,
    checkDuplicate = true,
    duplicateCheckDays = 30,
    affiliateUrl,
    templateType = 'beauty'
  } = options;

  try {
    // Plan-9: 檢查圖片是否在黑名單中（雙重保險）
    const allImages = post.images && post.images.length > 0 ? post.images : [post.imageUrl];
    const blacklistedImages = getBlacklistedImages(allImages);
    if (blacklistedImages.length > 0) {
      const reason = getBlacklistReason(blacklistedImages[0]) || '圖片在黑名單中';
      console.log(`⊗ Skipped blacklisted: "${extractCleanTitle(post.title)}" - ${reason}`);
      console.log(`   Blacklisted images: ${blacklistedImages.join(', ')}`);
      return {
        strategyId: '',
        linkId: '',
        shortCode: '',
        shortUrl: '',
        isDuplicate: true, // 使用 isDuplicate 標記來統一處理
      };
    }

    // Plan-8: 檢查是否為重複項目
    if (checkDuplicate && robotId) {
      const supabase = await createClient();
      const sourceHash = generateSourceHash(post);
      const isDuplicate = await checkIsDuplicate(supabase, robotId, sourceHash, duplicateCheckDays);

      if (isDuplicate) {
        console.log(`⊘ Skipped duplicate: "${extractCleanTitle(post.title)}"`);
        return {
          strategyId: '',
          linkId: '',
          shortCode: '',
          shortUrl: '',
          isDuplicate: true,
        };
      }
    }

    // 創建草稿連結
    const { linkId, shortCode } = await createShortLink(userId, post, robotId, affiliateUrl, templateType);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shortUrl = `${baseUrl}/${shortCode}`;

    console.log(`✓ Created draft link: ${shortUrl} for "${extractCleanTitle(post.title)}"`);

    return {
      strategyId: linkId,
      linkId,
      shortCode,
      shortUrl,
      isDuplicate: false,
    };
  } catch (error) {
    console.error('Error generating strategy from post:', error);
    throw error;
  }
}

export async function batchGenerateStrategies(
  posts: PTTPost[],
  userId: string | null,
  robotId?: string,
  affiliateUrl?: string,
  onProgress?: (current: number, total: number) => void,
  templateType: 'beauty' | 'external_link' = 'beauty',
  maxSuccess?: number // 最多創建幾個草稿，達到就停止
): Promise<{
  success: GeneratedStrategy[];
  duplicates: GeneratedStrategy[];
  failed: Array<{ post: PTTPost; error: string }>;
}> {
  const success: GeneratedStrategy[] = [];
  const duplicates: GeneratedStrategy[] = [];
  const failed: Array<{ post: PTTPost; error: string }> = [];

  for (let i = 0; i < posts.length; i++) {
    // 如果已達到目標數量，停止處理
    if (maxSuccess && success.length >= maxSuccess) {
      console.log(`Reached maxSuccess (${maxSuccess}), stopping early`);
      break;
    }

    const post = posts[i];

    try {
      const strategy = await generateStrategyFromPost({
        post,
        userId,
        robotId,
        checkDuplicate: true,
        duplicateCheckDays: 30,
        affiliateUrl,
        templateType,
      });

      if (strategy.isDuplicate) {
        duplicates.push(strategy);
      } else {
        success.push(strategy);
      }

      if (onProgress) {
        onProgress(i + 1, posts.length);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`Failed to generate strategy for post: ${post.title}`, error);
      failed.push({
        post,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  console.log(`
Batch generation completed:
- Success: ${success.length}
- Duplicates: ${duplicates.length}
- Failed: ${failed.length}
  `);

  return { success, duplicates, failed };
}
