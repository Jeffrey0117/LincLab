/**
 * 測試 PTT Beauty 爬蟲數量控制修復
 *
 * 用法：
 * npx ts-node scripts/test-count-fix.ts
 */

import { scrapePTTBeauty } from '../src/lib/scrapers/ptt-beauty-scraper';

async function testCountControl() {
  console.log('=== PTT Beauty Count Control Test ===\n');

  // 測試案例 1: 要求抓取 1 張圖片
  console.log('Test Case 1: Requesting 1 image...');
  try {
    const result = await scrapePTTBeauty({ count: 1 });

    console.log(`✓ Scraping completed in ${(result.totalTime / 1000).toFixed(2)}s`);
    console.log(`  - Success: ${result.success.length} (Expected: 1)`);
    console.log(`  - Failed: ${result.failed.length}`);

    if (result.success.length === 1) {
      console.log('✅ PASS: Got exactly 1 result as requested\n');
    } else {
      console.log(`❌ FAIL: Expected 1 result, got ${result.success.length}\n`);
    }

    if (result.success.length > 0) {
      console.log('Result details:');
      result.success.forEach((post, index) => {
        console.log(`  ${index + 1}. ${post.title}`);
        console.log(`     Images: ${post.images.length}`);
        console.log(`     First image: ${post.imageUrl.substring(0, 60)}...`);
      });
    }
  } catch (error) {
    console.error('❌ Test 1 failed:', error);
  }

  console.log('\n---\n');

  // 測試案例 2: 要求抓取 3 張圖片
  console.log('Test Case 2: Requesting 3 images...');
  try {
    const result = await scrapePTTBeauty({ count: 3 });

    console.log(`✓ Scraping completed in ${(result.totalTime / 1000).toFixed(2)}s`);
    console.log(`  - Success: ${result.success.length} (Expected: 3)`);
    console.log(`  - Failed: ${result.failed.length}`);

    if (result.success.length === 3) {
      console.log('✅ PASS: Got exactly 3 results as requested\n');
    } else {
      console.log(`❌ FAIL: Expected 3 results, got ${result.success.length}\n`);
    }
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
  }

  console.log('\n=== Test Complete ===');
}

// 執行測試
testCountControl().catch(console.error);
