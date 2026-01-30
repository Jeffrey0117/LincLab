#!/bin/bash

# 自動化發文助手系統 - 安裝腳本
# 此腳本會自動安裝必要的依賴並執行 migration

set -e  # 遇到錯誤立即退出

echo "=========================================="
echo "自動化發文助手系統 - 安裝程式"
echo "=========================================="
echo ""

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤：未安裝 Node.js"
    echo "請先安裝 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 檢查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 錯誤：未安裝 npm"
    exit 1
fi

echo "✅ npm 版本: $(npm -v)"
echo ""

# 步驟 1: 安裝依賴
echo "步驟 1/4: 安裝 npm 依賴..."
echo "----------------------------------------"

if npm list @supabase/ssr &> /dev/null; then
    echo "✅ @supabase/ssr 已安裝"
else
    echo "📦 安裝 @supabase/ssr..."
    npm install @supabase/ssr
fi

if npm list date-fns &> /dev/null; then
    echo "✅ date-fns 已安裝"
else
    echo "📦 安裝 date-fns..."
    npm install date-fns
fi

if npm list sonner &> /dev/null; then
    echo "✅ sonner 已安裝"
else
    echo "📦 安裝 sonner..."
    npm install sonner
fi

echo ""

# 步驟 2: 檢查環境變數
echo "步驟 2/4: 檢查環境變數..."
echo "----------------------------------------"

if [ -f .env.local ]; then
    echo "✅ .env.local 檔案存在"

    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local && grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo "✅ Supabase 環境變數已設定"
    else
        echo "⚠️  警告：.env.local 中缺少 Supabase 環境變數"
        echo "請確保包含以下變數："
        echo "  - NEXT_PUBLIC_SUPABASE_URL"
        echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    fi
else
    echo "⚠️  警告：未找到 .env.local 檔案"
    echo "請創建 .env.local 並設定 Supabase 環境變數"
fi

echo ""

# 步驟 3: 檢查 Supabase CLI
echo "步驟 3/4: 檢查 Supabase CLI..."
echo "----------------------------------------"

if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI 已安裝"
    echo "版本: $(supabase --version)"

    read -p "是否要執行 migration? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 執行 migration..."
        supabase db push
        echo "✅ Migration 執行完成"
    else
        echo "⏭️  跳過 migration"
        echo "您可以稍後手動執行: supabase db push"
    fi
else
    echo "⚠️  未安裝 Supabase CLI"
    echo ""
    echo "有兩種方式執行 migration："
    echo ""
    echo "方式 1: 安裝 Supabase CLI (推薦)"
    echo "  npm install -g supabase"
    echo "  supabase login"
    echo "  supabase link --project-ref your-project-ref"
    echo "  supabase db push"
    echo ""
    echo "方式 2: 在 Supabase Dashboard 手動執行"
    echo "  1. 前往 Supabase Dashboard"
    echo "  2. 選擇 SQL Editor"
    echo "  3. 執行 migration 檔案："
    echo "     - supabase/migrations/20251113000001_create_automation_system.sql"
    echo "     - supabase/migrations/20251113000002_seed_automation_strategies.sql"
fi

echo ""

# 步驟 4: 總結
echo "步驟 4/4: 安裝總結"
echo "----------------------------------------"
echo ""
echo "✅ 依賴安裝完成"
echo ""
echo "📁 已創建的檔案："
echo "  📄 Migration 檔案 (2 個)"
echo "  📄 TypeScript 類型定義"
echo "  📄 API 路由 (4 個)"
echo "  📄 客戶端 API 函數庫"
echo "  📄 Supabase 客戶端"
echo "  📄 文件 (4 個)"
echo ""
echo "🎯 下一步："
echo "  1. 確認 .env.local 環境變數已設定"
echo "  2. 執行 migration (如果還沒執行)"
echo "  3. 啟動開發伺服器: npm run dev"
echo "  4. 測試 API: http://localhost:3000/api/automation/strategies"
echo "  5. 閱讀快速開始指南: docs/QUICK_START.md"
echo ""
echo "📚 文件位置："
echo "  - 完整文件: docs/AUTOMATION_SYSTEM.md"
echo "  - 使用範例: docs/AUTOMATION_EXAMPLES.md"
echo "  - 快速開始: docs/QUICK_START.md"
echo "  - 總結報告: docs/AUTOMATION_SUMMARY.md"
echo ""
echo "=========================================="
echo "安裝完成！🎉"
echo "=========================================="
