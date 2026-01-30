/**
 * Test Blacklist Filtering
 *
 * 測試圖片黑名單過濾功能
 */

import {
  isImageBlacklisted,
  hasBlacklistedImage,
  filterBlacklistedImages,
  getBlacklistedImages,
  getBlacklistReason,
  IMAGE_BLACKLIST,
} from '../src/lib/config/image-blacklist';

function testBlacklistFunctions() {
  console.log('=== Testing Image Blacklist Functions ===\n');

  // 測試數據
  const testImages = [
    'https://imgur.com/e8dN5uA',
    'https://imgur.com/e8dN5uA.jpg',
    'https://imgur.com/abc123',
    'https://i.imgur.com/xyz789.jpg',
    'https://example.com/image.jpg',
  ];

  console.log('黑名單配置:');
  IMAGE_BLACKLIST.forEach((entry, index) => {
    console.log(`  ${index + 1}. ${entry.url}`);
    console.log(`     原因: ${entry.reason}`);
    console.log(`     添加日期: ${entry.addedAt}`);
  });

  console.log('\n測試圖片:');
  testImages.forEach((img, index) => {
    console.log(`  ${index + 1}. ${img}`);
  });

  console.log('\n--- Test 1: isImageBlacklisted() ---');
  testImages.forEach(img => {
    const isBlacklisted = isImageBlacklisted(img);
    const reason = getBlacklistReason(img);
    console.log(`${img}`);
    console.log(`  -> ${isBlacklisted ? '❌ 黑名單' : '✅ 正常'}`);
    if (reason) {
      console.log(`  -> 原因: ${reason}`);
    }
  });

  console.log('\n--- Test 2: hasBlacklistedImage() ---');
  const hasBlacklisted = hasBlacklistedImage(testImages);
  console.log(`圖片列表中是否包含黑名單圖片: ${hasBlacklisted ? '是 ❌' : '否 ✅'}`);

  console.log('\n--- Test 3: filterBlacklistedImages() ---');
  const filteredImages = filterBlacklistedImages(testImages);
  console.log(`原始圖片數量: ${testImages.length}`);
  console.log(`過濾後數量: ${filteredImages.length}`);
  console.log('過濾後的圖片:');
  filteredImages.forEach(img => {
    console.log(`  ✓ ${img}`);
  });

  console.log('\n--- Test 4: getBlacklistedImages() ---');
  const blacklistedImages = getBlacklistedImages(testImages);
  console.log(`被過濾的圖片數量: ${blacklistedImages.length}`);
  blacklistedImages.forEach(img => {
    const reason = getBlacklistReason(img);
    console.log(`  ✗ ${img}`);
    console.log(`    原因: ${reason}`);
  });

  console.log('\n--- Test 5: 測試 URL 變體 ---');
  const urlVariants = [
    'https://imgur.com/e8dN5uA',
    'https://imgur.com/e8dN5uA.jpg',
    'https://imgur.com/e8dN5uA.png',
    'https://imgur.com/e8dN5uA?abc=123',
    'https://imgur.com/e8dN5uA#anchor',
    'https://i.imgur.com/e8dN5uA.jpg',
  ];

  console.log('測試不同的 URL 格式是否都能被正確識別:');
  urlVariants.forEach(url => {
    const isBlacklisted = isImageBlacklisted(url);
    console.log(`${url} -> ${isBlacklisted ? '❌ 黑名單' : '✅ 正常'}`);
  });

  console.log('\n=== Test Completed ===');
}

// 執行測試
testBlacklistFunctions();
