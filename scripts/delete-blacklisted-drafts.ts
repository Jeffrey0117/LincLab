/**
 * CLI Script: 刪除包含黑名單圖片的草稿
 *
 * 使用方式：
 *   npx tsx scripts/delete-blacklisted-drafts.ts --preview  # 預覽模式
 *   npx tsx scripts/delete-blacklisted-drafts.ts --delete   # 執行刪除
 *
 * 功能：
 * - 掃描所有草稿，找出包含黑名單圖片的草稿
 * - 支援預覽模式（dry-run）
 * - 提供詳細的刪除記錄
 */

import { createClient } from '@supabase/supabase-js';
import { draftContainsBlacklistedImage, findBlacklistedImages, IMAGE_BLACKLIST } from '../src/lib/image-blacklist';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface DraftRecord {
  id: string;
  short_code: string;
  title: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  template_config: {
    imageUrl?: string;
    images?: string[];
  } | null;
  created_at: string;
  user_id: string;
}

async function main() {
  const args = process.argv.slice(2);
  const isPreview = args.includes('--preview');
  const isDelete = args.includes('--delete');

  if (!isPreview && !isDelete) {
    console.log('使用方式:');
    console.log('  npx tsx scripts/delete-blacklisted-drafts.ts --preview  # 預覽模式');
    console.log('  npx tsx scripts/delete-blacklisted-drafts.ts --delete   # 執行刪除');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('刪除包含黑名單圖片的草稿');
  console.log('='.repeat(60));
  console.log();

  // 顯示當前黑名單
  console.log('📋 當前黑名單：');
  IMAGE_BLACKLIST.forEach(entry => {
    console.log(`   - ${entry.pattern} (${entry.description})`);
  });
  console.log();

  // 查詢所有草稿
  console.log('🔍 掃描草稿中...');
  const { data: drafts, error: fetchError } = await supabase
    .from('links')
    .select('id, short_code, title, og_title, og_description, og_image, template_config, created_at, user_id')
    .eq('status', 'draft')
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error('❌ 無法查詢草稿:', fetchError.message);
    process.exit(1);
  }

  if (!drafts || drafts.length === 0) {
    console.log('✓ 沒有找到任何草稿');
    process.exit(0);
  }

  console.log(`✓ 找到 ${drafts.length} 個草稿`);
  console.log();

  // 過濾包含黑名單圖片的草稿
  const blacklistedDrafts: DraftRecord[] = [];

  for (const draft of drafts as DraftRecord[]) {
    if (draftContainsBlacklistedImage(draft)) {
      blacklistedDrafts.push(draft);
    }
  }

  if (blacklistedDrafts.length === 0) {
    console.log('✅ 沒有找到包含黑名單圖片的草稿');
    process.exit(0);
  }

  console.log(`⚠️  找到 ${blacklistedDrafts.length} 個包含黑名單圖片的草稿：`);
  console.log();

  // 顯示詳細資訊
  blacklistedDrafts.forEach((draft, index) => {
    const blacklistedImages = findBlacklistedImages(draft);
    console.log(`${index + 1}. ${draft.title || draft.og_title || 'Untitled'}`);
    console.log(`   短連結：${draft.short_code}`);
    console.log(`   ID：${draft.id}`);
    console.log(`   建立時間：${new Date(draft.created_at).toLocaleString('zh-TW')}`);
    console.log(`   黑名單圖片 (${blacklistedImages.length})：`);
    blacklistedImages.forEach(url => {
      console.log(`      - ${url}`);
    });
    console.log();
  });

  if (isPreview) {
    console.log('📌 這是預覽模式，未執行刪除操作');
    console.log(`   如需刪除，請執行：npx tsx scripts/delete-blacklisted-drafts.ts --delete`);
    process.exit(0);
  }

  // 執行刪除
  if (isDelete) {
    console.log('='.repeat(60));
    console.log(`⚠️  即將刪除 ${blacklistedDrafts.length} 個草稿`);
    console.log('='.repeat(60));
    console.log();

    // 二次確認（自動化環境可以跳過）
    const shouldProceed = process.env.AUTO_CONFIRM === 'true' || await confirm('確定要繼續嗎？(yes/no): ');

    if (!shouldProceed) {
      console.log('❌ 取消刪除操作');
      process.exit(0);
    }

    console.log();
    console.log('🗑️  開始刪除...');
    console.log();

    let successCount = 0;
    let failedCount = 0;

    for (const draft of blacklistedDrafts) {
      try {
        const { error: deleteError } = await supabase
          .from('links')
          .delete()
          .eq('id', draft.id);

        if (deleteError) {
          console.error(`❌ 刪除失敗 ${draft.short_code}: ${deleteError.message}`);
          failedCount++;
        } else {
          console.log(`✓ 已刪除 ${draft.short_code} (${draft.title || draft.og_title || 'Untitled'})`);
          successCount++;
        }
      } catch (error) {
        console.error(`❌ 刪除異常 ${draft.short_code}:`, error);
        failedCount++;
      }
    }

    console.log();
    console.log('='.repeat(60));
    console.log('刪除完成');
    console.log('='.repeat(60));
    console.log(`✓ 成功刪除：${successCount} 個`);
    if (failedCount > 0) {
      console.log(`❌ 刪除失敗：${failedCount} 個`);
    }
    console.log(`📊 總計：${blacklistedDrafts.length} 個`);
    console.log();
  }
}

// 簡單的確認輸入函數（僅用於手動執行）
async function confirm(question: string): Promise<boolean> {
  if (process.env.AUTO_CONFIRM === 'true') {
    return true;
  }

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question(question, (answer: string) => {
      readline.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

main()
  .then(() => {
    console.log('✅ 腳本執行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 腳本執行失敗:', error);
    process.exit(1);
  });
