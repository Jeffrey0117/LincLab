/**
 * 測試 PTT 爬蟲功能
 *
 * 用法：
 * npx ts-node scripts/test-ptt-scraper.ts
 */

import { scrapePTTBeauty } from '../src/lib/scrapers/ptt-beauty-scraper';

async function main() {
  console.log('=== PTT Beauty Scraper Test ===\n');

  // 測試: 完整爬蟲（抓取 3 篇文章）
  console.log('Test: Scraping 3 posts...');
  try {
    const result = await scrapePTTBeauty({ count: 3 });
    console.log(`✓ Scraping completed in ${(result.totalTime / 1000).toFixed(2)}s`);
    console.log(`  - Success: ${result.success.length}`);
    console.log(`  - Failed: ${result.failed.length}`);

    if (result.success.length > 0) {
      console.log('\nSuccessful posts:');
      result.success.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   View URL: ${post.viewUrl}`);
        console.log(`   Image: ${post.imageUrl}`);
      });
    }

    if (result.failed.length > 0) {
      console.log('\nFailed posts:');
      result.failed.forEach((fail, index) => {
        console.log(`${index + 1}. ${fail.url}: ${fail.error}`);
      });
    }
  } catch (error) {
    console.error('✗ Test 2 failed:', error);
  }

  console.log('\n=== Test Complete ===');
}

// 執行測試
main().catch(console.error);
