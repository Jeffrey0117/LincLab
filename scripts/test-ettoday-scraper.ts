import { scrapeETtodayNews } from '../src/lib/scrapers/ettoday-news-scraper';

async function main() {
  console.log('Testing ETtoday scraper...\n');

  try {
    const result = await scrapeETtodayNews({ count: 3 });

    console.log('\n=== Results ===');
    console.log(`Success: ${result.success.length}`);
    console.log(`Failed: ${result.failed.length}`);
    console.log(`Time: ${result.totalTime}ms`);

    if (result.success.length > 0) {
      console.log('\n=== Sample Data ===');
      result.success.forEach((news, i) => {
        console.log(`\n[${i + 1}] ${news.title}`);
        console.log(`    URL: ${news.url}`);
        console.log(`    Image: ${news.imageUrl}`);
        console.log(`    Date: ${news.date}`);
        console.log(`    Summary: ${news.summary.substring(0, 50)}...`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
