/**
 * PTT Beauty Board Scraper - Using existing API
 *
 * 使用現成的 PHP API: https://chatbot.digitalgo.synology.me
 */

import {
  filterBlacklistedImages,
  getBlacklistedImages,
  getBlacklistReason,
} from '@/lib/config/image-blacklist';

export interface PTTPost {
  id: string;
  title: string;
  author: string;
  date: string;
  url: string; // PTT 原始 URL
  viewUrl: string; // 查看頁面 URL
  imageUrl: string; // 第一張圖
  images: string[]; // 所有圖片
  pushCount: number;
}

export interface ScrapeOptions {
  count: number;
  minPushCount?: number;
  maxRetries?: number;
  startPage?: number; // 從第幾頁開始抓（用於智能去重）
}

export interface ScrapeResult {
  success: PTTPost[];
  failed: Array<{ url: string; error: string }>;
  filtered: Array<{ url: string; reason: string }>; // 被黑名單過濾的文章
  totalTime: number;
}

interface APIArticle {
  title: string;
  urls: {
    regular: string; // 預覽圖 URL
  };
  user?: {
    name?: string;
    links?: {
      html?: string; // PTT 文章 URL
    };
  };
}

const API_BASE_URL = 'https://chatbot.digitalgo.synology.me';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchArticlesFromAPI(page: number): Promise<APIArticle[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/search.php?page=${page}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error fetching page ${page}:`, error);
    return [];
  }
}

async function fetchImagesFromAPI(slug: string): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/images.php?page=${slug}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const images = await response.json();
    if (!Array.isArray(images)) {
      return [];
    }
    return images.map((img: any) => img.src).filter(Boolean);
  } catch (error) {
    console.error(`Error fetching images for ${slug}:`, error);
    return [];
  }
}

export async function scrapePTTBeauty(options: ScrapeOptions): Promise<ScrapeResult> {
  const startTime = Date.now();
  const { count, maxRetries = 3, startPage = 1 } = options;

  const success: PTTPost[] = [];
  const failed: Array<{ url: string; error: string }> = [];
  const filtered: Array<{ url: string; reason: string }> = [];

  try {
    console.log(`Starting scrape: count=${count}, starting page=${startPage}`);

    const pagesNeeded = Math.ceil(count / 20);
    const allArticles: APIArticle[] = [];

    for (let page = startPage; page < startPage + pagesNeeded; page++) {
      console.log(`Fetching page ${page} from API`);
      const articles = await fetchArticlesFromAPI(page);
      allArticles.push(...articles);
      if (articles.length === 0) {
        console.log('No more articles available');
        break;
      }
      if (page < startPage + pagesNeeded - 1) {
        await delay(100); // 減少延遲以加快速度
      }
    }

    console.log(`Found ${allArticles.length} articles from API`);

    const articlesToProcess = allArticles.slice(0, count);

    for (const article of articlesToProcess) {
      let lastError: Error | null = null;

      for (let retry = 0; retry < maxRetries; retry++) {
        try {
          const pttUrl = article.user?.links?.html;
          if (!pttUrl) {
            throw new Error('Missing PTT URL in article data');
          }

          const slug = pttUrl.split('/').pop();
          if (!slug) {
            throw new Error('Cannot extract slug from PTT URL');
          }

          const images = await fetchImagesFromAPI(slug);

          if (images.length === 0) {
            throw new Error('No images found');
          }

          // 檢查圖片是否在黑名單中
          const blacklistedImages = getBlacklistedImages(images);
          if (blacklistedImages.length > 0) {
            const reason = getBlacklistReason(blacklistedImages[0]) || '圖片在黑名單中';
            console.log(`⊗ Filtered: ${article.title} - ${reason} (${blacklistedImages.length}/${images.length} images)`);
            filtered.push({
              url: pttUrl,
              reason: `黑名單圖片: ${blacklistedImages.join(', ')} - ${reason}`,
            });
            break; // 跳出重試循環
          }

          // 過濾掉黑名單圖片（保險起見，雖然上面已經檢查過了）
          const cleanImages = filterBlacklistedImages(images);
          if (cleanImages.length === 0) {
            throw new Error('All images are blacklisted');
          }

          const post: PTTPost = {
            id: slug,
            title: article.title || '無標題',
            author: article.user?.name || 'unknown',
            date: new Date().toISOString(),
            url: pttUrl,
            viewUrl: pttUrl, // 直接用 PTT URL
            imageUrl: cleanImages[0],
            images: cleanImages, // 只存儲過濾後的圖片
            pushCount: 0,
          };

          success.push(post);
          console.log(`✓ Success: ${post.title} (${cleanImages.length} images, ${images.length - cleanImages.length} filtered)`);
          break;

        } catch (error) {
          lastError = error as Error;
          if (retry < maxRetries - 1) {
            console.log(`Retry ${retry + 1}/${maxRetries} for ${article.title}`);
            await delay(1000 * (retry + 1));
          }
        }
      }

      if (lastError && !success.find(p => p.title === article.title)) {
        failed.push({
          url: article.user?.links?.html || 'unknown',
          error: lastError.message,
        });
        console.log(`✗ Failed: ${article.title} - ${lastError.message}`);
      }

      await delay(50); // 減少延遲以加快速度
    }

    const totalTime = Date.now() - startTime;

    console.log(`
Scraping completed:
- Success: ${success.length}
- Filtered (blacklist): ${filtered.length}
- Failed: ${failed.length}
- Total time: ${(totalTime / 1000).toFixed(2)}s
    `);

    return {
      success,
      failed,
      filtered,
      totalTime,
    };
  } catch (error) {
    console.error('Fatal error during scraping:', error);
    throw error;
  }
}
