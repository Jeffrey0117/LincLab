/**
 * Image Blacklist Configuration
 * 圖片黑名單設定 - 用於過濾和刪除包含特定圖片的草稿
 */

export interface BlacklistEntry {
  id: string;
  pattern: string;
  description: string;
  addedAt: string;
}

/**
 * 圖片黑名單
 * 支持多種格式的 imgur URL 匹配
 */
export const IMAGE_BLACKLIST: BlacklistEntry[] = [
  {
    id: 'imgur-e8dN5uA',
    pattern: 'e8dN5uA',
    description: '特定的 imgur 圖片 ID',
    addedAt: '2025-11-21',
  },
  // 在此添加更多黑名單項目
];

/**
 * 正規化 imgur URL
 * 將不同格式的 imgur URL 轉換為統一的 ID 格式
 *
 * 支持的格式：
 * - https://imgur.com/e8dN5uA
 * - https://i.imgur.com/e8dN5uA.jpg
 * - https://i.imgur.com/e8dN5uA.png
 * - http://imgur.com/e8dN5uA
 */
export function normalizeImgurUrl(url: string): string | null {
  if (!url) return null;

  // 移除協議和 www
  const normalized = url.toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '');

  // 匹配 imgur.com/ID 或 i.imgur.com/ID.ext
  const imgurPattern = /(?:i\.)?imgur\.com\/([a-zA-Z0-9]+)/;
  const match = normalized.match(imgurPattern);

  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * 檢查 URL 是否在黑名單中
 */
export function isBlacklistedImage(url: string): boolean {
  if (!url) return false;

  const imgurId = normalizeImgurUrl(url);
  if (!imgurId) {
    // 如果不是 imgur URL，直接進行完整 URL 比對
    return IMAGE_BLACKLIST.some(entry =>
      url.toLowerCase().includes(entry.pattern.toLowerCase())
    );
  }

  // 如果是 imgur URL，比對 ID
  return IMAGE_BLACKLIST.some(entry =>
    imgurId === entry.pattern || imgurId.includes(entry.pattern)
  );
}

/**
 * 檢查草稿是否包含黑名單圖片
 * 檢查 template_config.imageUrl, template_config.images[], 和 og_image
 */
export function draftContainsBlacklistedImage(draft: {
  og_image?: string | null;
  template_config?: {
    imageUrl?: string;
    images?: string[];
  } | null;
}): boolean {
  // 檢查 og_image
  if (draft.og_image && isBlacklistedImage(draft.og_image)) {
    return true;
  }

  // 檢查 template_config
  if (draft.template_config) {
    // 檢查 imageUrl
    if (draft.template_config.imageUrl && isBlacklistedImage(draft.template_config.imageUrl)) {
      return true;
    }

    // 檢查 images 陣列
    if (draft.template_config.images && Array.isArray(draft.template_config.images)) {
      return draft.template_config.images.some(img => isBlacklistedImage(img));
    }
  }

  return false;
}

/**
 * 找出草稿中所有黑名單圖片的 URL
 */
export function findBlacklistedImages(draft: {
  og_image?: string | null;
  template_config?: {
    imageUrl?: string;
    images?: string[];
  } | null;
}): string[] {
  const blacklistedUrls: string[] = [];

  if (draft.og_image && isBlacklistedImage(draft.og_image)) {
    blacklistedUrls.push(draft.og_image);
  }

  if (draft.template_config) {
    if (draft.template_config.imageUrl && isBlacklistedImage(draft.template_config.imageUrl)) {
      blacklistedUrls.push(draft.template_config.imageUrl);
    }

    if (draft.template_config.images && Array.isArray(draft.template_config.images)) {
      draft.template_config.images.forEach(img => {
        if (isBlacklistedImage(img)) {
          blacklistedUrls.push(img);
        }
      });
    }
  }

  return blacklistedUrls;
}
