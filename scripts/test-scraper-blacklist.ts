/**
 * Test PTT Beauty Scraper with Blacklist
 *
 * 模擬真實的爬蟲場景，測試黑名單過濾功能
 */

import { PTTPost } from '../src/lib/scrapers/ptt-beauty-scraper';
import {
  isImageBlacklisted,
  hasBlacklistedImage,
  filterBlacklistedImages,
  getBlacklistedImages,
  getBlacklistReason,
} from '../src/lib/config/image-blacklist';

// 模擬從 API 抓取的文章數據
const mockPosts: PTTPost[] = [
  {
    id: 'post1',
    title: '[正妹] 清新美女',
    author: 'user1',
    date: '2025-11-21',
    url: 'https://www.ptt.cc/bbs/Beauty/M.1234567890.A.123.html',
    viewUrl: 'https://www.ptt.cc/bbs/Beauty/M.1234567890.A.123.html',
    imageUrl: 'https://imgur.com/abc123',
    images: ['https://imgur.com/abc123', 'https://imgur.com/def456'],
    pushCount: 50,
  },
  {
    id: 'post2',
    title: '[正妹] 性感女神',
    author: 'user2',
    date: '2025-11-21',
    url: 'https://www.ptt.cc/bbs/Beauty/M.1234567891.A.124.html',
    viewUrl: 'https://www.ptt.cc/bbs/Beauty/M.1234567891.A.124.html',
    imageUrl: 'https://imgur.com/e8dN5uA', // 這個應該被過濾
    images: ['https://imgur.com/e8dN5uA', 'https://imgur.com/xyz789'],
    pushCount: 100,
  },
  {
    id: 'post3',
    title: '[正妹] 氣質美人',
    author: 'user3',
    date: '2025-11-21',
    url: 'https://www.ptt.cc/bbs/Beauty/M.1234567892.A.125.html',
    viewUrl: 'https://www.ptt.cc/bbs/Beauty/M.1234567892.A.125.html',
    imageUrl: 'https://i.imgur.com/abc789.jpg',
    images: ['https://i.imgur.com/abc789.jpg', 'https://i.imgur.com/def012.jpg'],
    pushCount: 75,
  },
  {
    id: 'post4',
    title: '[正妹] 甜美笑容',
    author: 'user4',
    date: '2025-11-21',
    url: 'https://www.ptt.cc/bbs/Beauty/M.1234567893.A.126.html',
    viewUrl: 'https://www.ptt.cc/bbs/Beauty/M.1234567893.A.126.html',
    imageUrl: 'https://i.imgur.com/e8dN5uA.jpg', // 這個也應該被過濾
    images: ['https://i.imgur.com/e8dN5uA.jpg'],
    pushCount: 60,
  },
];

function testScraperBlacklist() {
  console.log('=== Testing PTT Beauty Scraper Blacklist Filter ===\n');

  console.log(`總共 ${mockPosts.length} 篇文章\n`);

  const validPosts: PTTPost[] = [];
  const filteredPosts: Array<{ post: PTTPost; reason: string }> = [];

  // 模擬爬蟲處理流程
  for (const post of mockPosts) {
    console.log(`處理文章: ${post.title}`);
    console.log(`  作者: ${post.author}, 推文數: ${post.pushCount}`);
    console.log(`  圖片數量: ${post.images.length}`);

    // 檢查是否有黑名單圖片
    const blacklistedImages = getBlacklistedImages(post.images);

    if (blacklistedImages.length > 0) {
      const reason = getBlacklistReason(blacklistedImages[0]) || '圖片在黑名單中';
      console.log(`  ⊗ 過濾原因: ${reason}`);
      console.log(`  ⊗ 黑名單圖片: ${blacklistedImages.join(', ')}`);
      filteredPosts.push({ post, reason });
    } else {
      console.log(`  ✓ 通過檢查，無黑名單圖片`);
      validPosts.push(post);
    }
    console.log('');
  }

  console.log('=== 處理結果統計 ===');
  console.log(`總計: ${mockPosts.length} 篇`);
  console.log(`通過: ${validPosts.length} 篇`);
  console.log(`過濾: ${filteredPosts.length} 篇\n`);

  if (validPosts.length > 0) {
    console.log('✅ 通過的文章:');
    validPosts.forEach((post, index) => {
      console.log(`  ${index + 1}. ${post.title}`);
      console.log(`     圖片: ${post.images.length} 張`);
    });
    console.log('');
  }

  if (filteredPosts.length > 0) {
    console.log('❌ 被過濾的文章:');
    filteredPosts.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.post.title}`);
      console.log(`     原因: ${item.reason}`);
      const blacklisted = getBlacklistedImages(item.post.images);
      console.log(`     黑名單圖片: ${blacklisted.join(', ')}`);
    });
    console.log('');
  }

  console.log('=== 測試完成 ===');

  // 驗證測試結果
  const expectedFiltered = 2; // post2 和 post4
  const expectedValid = 2; // post1 和 post3

  if (filteredPosts.length === expectedFiltered && validPosts.length === expectedValid) {
    console.log('✅ 測試通過！黑名單過濾功能正常運作');
    return true;
  } else {
    console.log('❌ 測試失敗！');
    console.log(`   預期過濾: ${expectedFiltered}, 實際: ${filteredPosts.length}`);
    console.log(`   預期通過: ${expectedValid}, 實際: ${validPosts.length}`);
    return false;
  }
}

// 執行測試
const success = testScraperBlacklist();
process.exit(success ? 0 : 1);
