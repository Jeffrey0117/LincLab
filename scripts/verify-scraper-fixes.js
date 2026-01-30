#!/usr/bin/env node

/**
 * PTT Scraper Fixes Verification Script
 *
 * This script helps verify that all 4 critical issues have been fixed:
 * 1. Duplicate detection
 * 2. Delete prevention
 * 3. Display format
 * 4. Dashboard titles
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

async function prompt(question) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${question}${colors.reset} `, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function verify() {
  log('\n🔧 PTT Beauty Scraper - Fix Verification Tool\n', 'bright');

  // Issue 1: Duplicate Detection
  section('Issue 1: Duplicate Detection');
  log('Testing if duplicate articles are being detected and skipped...\n', 'yellow');

  log('Steps to verify:');
  log('1. Run the PTT scraper (via /automation page or API)');
  log('2. Note how many drafts were created');
  log('3. Run the scraper again immediately');
  log('4. Check the console logs for "⊘ Skipped duplicate" messages');
  log('5. Verify scraped_items table has records\n');

  const dup1 = await prompt('Did you see "🔍 Checking duplicate" messages in console? (y/n)');
  const dup2 = await prompt('Did the second run skip some articles? (y/n)');
  const dup3 = await prompt('Are scraped_items records being created? (y/n)');

  if (dup1 === 'y' && dup2 === 'y' && dup3 === 'y') {
    log('✅ Issue 1 PASSED - Duplicate detection is working!\n', 'green');
  } else {
    log('❌ Issue 1 FAILED - Check the logs and database\n', 'red');
    log('Troubleshooting:');
    log('- Verify is_duplicate_item() RPC function exists');
    log('- Check scraped_items table has unique constraint on (robot_id, source_hash)');
    log('- Look for error messages in console with ❌ emoji\n');
  }

  // Issue 2: Delete Prevention
  section('Issue 2: Delete Should Prevent Re-scraping');
  log('Testing if deleted drafts stay in scraped_items...\n', 'yellow');

  log('Steps to verify:');
  log('1. Delete a draft via automation page or DELETE /api/automation/drafts/{id}');
  log('2. Query: SELECT * FROM scraped_items WHERE link_id IS NULL');
  log('3. Run scraper again');
  log('4. Verify the deleted article is NOT scraped again\n');

  const del1 = await prompt('Did you delete a draft? (y/n)');
  if (del1 === 'y') {
    const del2 = await prompt('Does scraped_items still have the record (with link_id = NULL)? (y/n)');
    const del3 = await prompt('Did re-running the scraper skip this article? (y/n)');

    if (del2 === 'y' && del3 === 'y') {
      log('✅ Issue 2 PASSED - Delete prevention is working!\n', 'green');
    } else {
      log('❌ Issue 2 FAILED - Check database schema\n', 'red');
      log('Troubleshooting:');
      log('- Verify link_id column has ON DELETE SET NULL constraint');
      log('- Check console for "scraped_items record preserved" message\n');
    }
  } else {
    log('⏭️  Skipped Issue 2 test\n', 'yellow');
  }

  // Issue 3: Display Format
  section('Issue 3: Link Display Format');
  log('Testing if links show Title → "看更多" → Grid of images...\n', 'yellow');

  log('Steps to verify:');
  log('1. Visit a draft link: /{shortCode}?preview=true');
  log('2. Check if you see:');
  log('   - Title at the top');
  log('   - "看更多" description text');
  log('   - Grid layout with ALL images (not just one large image)');
  log('3. Verify NO single large image with PTT link format\n');

  const dis1 = await prompt('Did you visit a draft link? (y/n)');
  if (dis1 === 'y') {
    const dis2 = await prompt('Do you see the title at top? (y/n)');
    const dis3 = await prompt('Do you see "看更多" text? (y/n)');
    const dis4 = await prompt('Do you see a GRID of multiple images? (y/n)');
    const dis5 = await prompt('Is the old single-image format GONE? (y/n)');

    if (dis2 === 'y' && dis3 === 'y' && dis4 === 'y' && dis5 === 'y') {
      log('✅ Issue 3 PASSED - Display format is correct!\n', 'green');
    } else {
      log('❌ Issue 3 FAILED - Check template configuration\n', 'red');
      log('Troubleshooting:');
      log('- Query: SELECT template_type, template_config FROM links WHERE id = ?');
      log('- Should see template_type: "beauty" and layout: "grid"');
      log('- Verify images array has multiple images\n');
    }
  } else {
    log('⏭️  Skipped Issue 3 test\n', 'yellow');
  }

  // Issue 4: Dashboard Titles
  section('Issue 4: Dashboard Titles');
  log('Testing if approved drafts show "自動化-{title}" on dashboard...\n', 'yellow');

  log('Steps to verify:');
  log('1. Approve a draft via automation page');
  log('2. Go to /dashboard');
  log('3. Check if the approved link shows "自動化-{card title}"');
  log('4. Verify it does NOT show "無標題"\n');

  const tit1 = await prompt('Did you approve a draft? (y/n)');
  if (tit1 === 'y') {
    const tit2 = await prompt('Does dashboard show "自動化-" prefix? (y/n)');
    const tit3 = await prompt('Is "無標題" gone for this link? (y/n)');

    if (tit2 === 'y' && tit3 === 'y') {
      log('✅ Issue 4 PASSED - Dashboard titles are correct!\n', 'green');
    } else {
      log('❌ Issue 4 FAILED - Check approve logic\n', 'red');
      log('Troubleshooting:');
      log('- Query: SELECT title, og_title, status FROM links WHERE id = ?');
      log('- After approval, title should be set to "自動化-{og_title}"');
      log('- Check console for "✓ Draft approved" message with title\n');
    }
  } else {
    log('⏭️  Skipped Issue 4 test\n', 'yellow');
  }

  // Summary
  section('🎯 Verification Summary');
  log('\nAll tests completed! Review the results above.\n', 'bright');
  log('For detailed documentation, see: PTT_SCRAPER_FIXES.md\n', 'cyan');

  log('Useful database queries:');
  log('```sql');
  log('-- Check scraped_items');
  log('SELECT robot_id, source_hash, title, link_id, created_at');
  log('FROM scraped_items ORDER BY created_at DESC LIMIT 10;');
  log('');
  log('-- Check for duplicates');
  log('SELECT source_hash, COUNT(*) FROM scraped_items');
  log('GROUP BY source_hash HAVING COUNT(*) > 1;');
  log('');
  log('-- Check links');
  log('SELECT id, short_code, title, og_title, status, template_type');
  log('FROM links WHERE status IN (\'draft\', \'active\')');
  log('ORDER BY created_at DESC LIMIT 10;');
  log('```\n');

  rl.close();
}

// Run the verification
verify().catch(err => {
  log(`\n❌ Error: ${err.message}\n`, 'red');
  rl.close();
  process.exit(1);
});
