/**
 * ETtoday News Scraper
 *
 * 爬取 ETtoday 熱門新聞列表
 * URL: https://www.ettoday.net/news/hot-news.htm
 */

import * as cheerio from 'cheerio';

export interface NewsPost {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  summary: string;
  date: string;
}

export interface ScrapeOptions {
  count: number;
  maxRetries?: number;
  offset?: number; // 跳過前 N 篇新聞
}

export interface ScrapeResult {
  success: NewsPost[];
  failed: Array<{ url: string; error: string }>;
  totalTime: number;
}

const HOT_NEWS_URL = 'https://www.ettoday.net/news/hot-news.htm';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 從 URL 中提取新聞 ID
 * 例如: https://www.ettoday.net/news/20251118/3069204.htm -> 3069204
 */
function extractNewsId(url: string): string {
  const match = url.match(/\/(\d+)\.htm$/);
  return match ? match[1] : url;
}

/**
 * 修正圖片 URL，確保是完整的 https URL
 */
function fixImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  if (!url.startsWith('http')) {
    return `https://${url}`;
  }
  return url;
}

/**
 * 爬取 ETtoday 熱門新聞
 */
export async function scrapeETtodayNews(options: ScrapeOptions): Promise<ScrapeResult> {
  const startTime = Date.now();
  const { count, maxRetries = 3, offset = 0 } = options;

  const success: NewsPost[] = [];
  const failed: Array<{ url: string; error: string }> = [];

  try {
    console.log(`Starting ETtoday news scrape: count=${count}, offset=${offset}`);

    let html = '';
    let lastError: Error | null = null;

    // 獲取熱門新聞頁面，支持重試
    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        const response = await fetch(HOT_NEWS_URL, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        html = await response.text();
        break;
      } catch (error) {
        lastError = error as Error;
        if (retry < maxRetries - 1) {
          console.log(`Retry ${retry + 1}/${maxRetries} fetching hot news page`);
          await delay(1000 * (retry + 1));
        }
      }
    }

    if (!html) {
      throw lastError || new Error('Failed to fetch hot news page');
    }

    // 使用 cheerio 解析 HTML
    const $ = cheerio.load(html);
    const pieces = $('.piece.clearfix');

    console.log(`Found ${pieces.length} news pieces on page`);

    // 處理每個新聞項目（支援 offset 跳過前 N 篇）
    pieces.each((index, element) => {
      // 跳過前 offset 篇
      if (index < offset) {
        return true; // continue
      }

      if (success.length >= count) {
        return false; // 達到數量限制，停止處理
      }

      try {
        const $piece = $(element);

        // 提取 URL 和標題
        const $titleLink = $piece.find('h3 a');
        const url = $titleLink.attr('href') || '';
        const title = $titleLink.text().trim();

        if (!url || !title) {
          throw new Error('Missing URL or title');
        }

        // 提取圖片 URL（優先使用 data-original，因為 src 可能是懶載入佔位圖）
        const $img = $piece.find('a.pic img');
        let imageUrl = $img.attr('data-original') || $img.attr('src') || '';
        imageUrl = fixImageUrl(imageUrl);

        // 提取摘要
        const summary = $piece.find('p.summary').text().trim();

        // 提取日期
        const date = $piece.find('span.date').text().trim();

        // 提取 ID
        const id = extractNewsId(url);

        const post: NewsPost = {
          id,
          title,
          url,
          imageUrl,
          summary,
          date,
        };

        success.push(post);
        console.log(`✓ Success: ${title}`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        failed.push({
          url: `piece_index_${index}`,
          error: errorMessage,
        });
        console.log(`✗ Failed: piece at index ${index} - ${errorMessage}`);
      }
    });

    const totalTime = Date.now() - startTime;

    console.log(`
ETtoday news scraping completed:
- Success: ${success.length}
- Failed: ${failed.length}
- Total time: ${(totalTime / 1000).toFixed(2)}s
    `);

    return {
      success,
      failed,
      totalTime,
    };
  } catch (error) {
    console.error('Fatal error during scraping:', error);
    throw error;
  }
}
