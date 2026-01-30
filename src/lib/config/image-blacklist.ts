/**
 * Image Blacklist Configuration
 *
 * 統一的圖片黑名單配置，用於：
 * 1. 爬蟲過濾 - 防止抓取黑名單中的圖片
 * 2. 刪除功能 - 批次刪除含有黑名單圖片的草稿
 */

export interface BlacklistEntry {
  url: string;
  reason: string;
  addedAt: string;
}

/**
 * 圖片黑名單
 *
 * 使用場景：
 * - 過濾不適當的圖片
 * - 過濾重複出現的無效圖片
 * - 過濾廣告圖片
 */
export const IMAGE_BLACKLIST: BlacklistEntry[] = [
  {
    url: 'https://imgur.com/e8dN5uA',
    reason: '重複出現的無效圖片',
    addedAt: '2025-11-21',
  },
  // 可以在這裡添加更多黑名單項目
];

/**
 * 檢查圖片 URL 是否在黑名單中
 */
export function isImageBlacklisted(imageUrl: string): boolean {
  if (!imageUrl) return false;

  // 標準化 URL（移除查詢參數、錨點和副檔名）
  let normalizedUrl = imageUrl.split('?')[0].split('#')[0];
  // 移除常見的圖片副檔名
  normalizedUrl = normalizedUrl.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');

  return IMAGE_BLACKLIST.some(entry => {
    let normalizedBlacklistUrl = entry.url.split('?')[0].split('#')[0];
    normalizedBlacklistUrl = normalizedBlacklistUrl.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');

    // 檢查完整匹配或包含關係
    // 同時處理 imgur.com 和 i.imgur.com 的情況
    const urlId = normalizedUrl.split('/').pop() || '';
    const blacklistId = normalizedBlacklistUrl.split('/').pop() || '';

    return normalizedUrl === normalizedBlacklistUrl ||
           normalizedUrl.includes(normalizedBlacklistUrl) ||
           (urlId && blacklistId && urlId === blacklistId);
  });
}

/**
 * 檢查圖片列表中是否包含黑名單圖片
 */
export function hasBlacklistedImage(images: string[]): boolean {
  return images.some(img => isImageBlacklisted(img));
}

/**
 * 過濾掉黑名單中的圖片
 */
export function filterBlacklistedImages(images: string[]): string[] {
  return images.filter(img => !isImageBlacklisted(img));
}

/**
 * 獲取被過濾的黑名單圖片列表
 */
export function getBlacklistedImages(images: string[]): string[] {
  return images.filter(img => isImageBlacklisted(img));
}

/**
 * 獲取黑名單項目的原因
 */
export function getBlacklistReason(imageUrl: string): string | null {
  const entry = IMAGE_BLACKLIST.find(entry => {
    let normalizedUrl = imageUrl.split('?')[0].split('#')[0];
    normalizedUrl = normalizedUrl.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');

    let normalizedBlacklistUrl = entry.url.split('?')[0].split('#')[0];
    normalizedBlacklistUrl = normalizedBlacklistUrl.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');

    const urlId = normalizedUrl.split('/').pop() || '';
    const blacklistId = normalizedBlacklistUrl.split('/').pop() || '';

    return normalizedUrl === normalizedBlacklistUrl ||
           normalizedUrl.includes(normalizedBlacklistUrl) ||
           (urlId && blacklistId && urlId === blacklistId);
  });

  return entry ? entry.reason : null;
}
