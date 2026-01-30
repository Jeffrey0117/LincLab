/**
 * 測試 PTT 爬蟲功能 - 簡單驗證 API 是否可用
 *
 * 用法：
 * node scripts/test-ptt-scraper.js
 */

async function testAPI() {
  console.log('=== PTT Beauty API Test ===\n');

  const API_BASE_URL = 'https://nextjs-ptt-beauty.vercel.app';

  // 測試 1: 直接測試 API 端點
  console.log('Test 1: Fetching posts from API...');
  try {
    const apiUrl = `${API_BASE_URL}/api/posts?page=1`;
    console.log(`Fetching: ${apiUrl}`);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // 檢查資料格式
    let posts = [];
    if (data.posts && Array.isArray(data.posts)) {
      posts = data.posts;
    } else if (Array.isArray(data)) {
      posts = data;
    }

    console.log(`✓ Successfully fetched ${posts.length} posts`);

    if (posts.length > 0) {
      console.log('\nFirst post example:');
      console.log(JSON.stringify(posts[0], null, 2));

      // 驗證必要欄位
      const firstPost = posts[0];
      console.log('\nField validation:');
      console.log(`  - id: ${firstPost.id ? '✓' : '✗'}`);
      console.log(`  - title: ${firstPost.title ? '✓' : '✗'}`);
      console.log(`  - imageUrl: ${firstPost.imageUrl ? '✓' : '✗'}`);
      console.log(`  - author: ${firstPost.author ? '✓' : '✗'}`);

      // 生成短連結資料預覽
      if (firstPost.id && firstPost.imageUrl) {
        console.log('\n短連結創建預覽:');
        console.log(`  - destination_url: ${API_BASE_URL}/view/${firstPost.id}`);
        console.log(`  - og_title: ${firstPost.title}`);
        console.log(`  - og_description: PTT 表特版`);
        console.log(`  - og_image: ${firstPost.imageUrl}`);
        console.log(`  - strategy: forced_conversion`);
      }
    }

    console.log('\n✓ API test passed! Ready to create short links.');
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    return false;
  }

  return true;
}

// 執行測試
testAPI()
  .then(success => {
    console.log('\n=== Test Complete ===');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
