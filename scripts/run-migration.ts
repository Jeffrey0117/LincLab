/**
 * 臨時 Migration 執行工具
 * 用於執行 20251114000003_add_links_updated_at.sql
 *
 * 執行方式:
 * npx tsx scripts/run-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// 從環境變數取得 Supabase 連線資訊
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少 Supabase 環境變數');
  console.error('需要: NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🔄 開始執行 migration...');

  try {
    // 讀取 SQL 檔案
    const sqlPath = join(process.cwd(), 'supabase', 'migrations', '20251114000003_add_links_updated_at.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    console.log('📄 SQL 內容:', sql.substring(0, 200) + '...');

    // 將 SQL 分割成多個語句
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    console.log(`📝 共 ${statements.length} 個 SQL 語句\n`);

    // 逐個執行
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      console.log(`[${i + 1}/${statements.length}] 執行中...`);
      console.log(`   ${statement.substring(0, 80)}...`);

      let data, error;
      try {
        const result = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });
        data = result.data;
        error = result.error;
      } catch (e) {
        // 如果沒有 exec_sql 函數，使用直接執行
        // 這需要在 Supabase Dashboard 手動建立函數，或使用 service role
        console.warn('   ⚠️  無法使用 RPC，需要手動執行');
        data = null;
        error = e;
      }

      if (error) {
        // 某些語句可能會因為重複執行而失敗（如 IF NOT EXISTS），這是正常的
        const errorMessage = (error as any).message || String(error);
        console.warn(`   ⚠️  警告: ${errorMessage}`);
        if (errorMessage.includes('already exists') ||
            errorMessage.includes('duplicate') ||
            errorMessage.includes('IF NOT EXISTS')) {
          console.log('   ℹ️  這是預期的（資源已存在），繼續...');
        } else {
          throw error;
        }
      } else {
        console.log('   ✅ 成功');
      }
    }

    console.log('\n✅ Migration 執行完成！');
    console.log('\n請重新啟動開發伺服器以重新載入 schema cache');

  } catch (error) {
    console.error('\n❌ Migration 失敗:', error);
    console.error('\n請手動在 Supabase Dashboard 執行以下 SQL:');
    console.error('https://app.supabase.com/project/_/sql/new');
    console.error('\n檔案位置: supabase/migrations/20251114000003_add_links_updated_at.sql');
    process.exit(1);
  }
}

runMigration();
