<div align="center">
  <img src="public/logo.png" alt="LincLab" width="120" />
  <h1>LincLab</h1>
  <p><strong>聯盟行銷短連結管理平台</strong> — 開源、可自架的聯盟行銷智能管理系統</p>

  <p>
    <a href="#快速開始">快速開始</a> ·
    <a href="docs/SELF-HOSTING.md">自架指南</a> ·
    <a href="#功能">功能介紹</a> ·
    <a href="LICENSE">授權</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker" alt="Docker" />
    <img src="https://img.shields.io/badge/License-BSL_1.1-orange" alt="License" />
  </p>
</div>

---

## 功能

| 功能 | 說明 |
|------|------|
| **OG 偽裝短網址** | 自訂 Open Graph 標籤，降低社群平台封鎖率 |
| **多帳號管理** | 不同帳號、不同定位策略 |
| **點擊追蹤統計** | 即時查看每個連結的點擊數據 |
| **自動爬蟲機器人** | PTT 表特版、ETtoday 新聞自動抓取 |
| **YouTube 摘要生成** | AI 分析影片重點，自動產生貼文 |
| **Google Sheets 整合** | 一鍵推送連結資料到試算表 |
| **標籤分類系統** | 靈活管理不同類別的連結 |
| **管理員儀表板** | 用戶管理、系統統計 |
| **Self-hosted 模式** | 自架部署，所有用戶自動 VIP |

## 技術棧

- **框架**: Next.js 15 (App Router, Standalone output)
- **前端**: React 18 + TypeScript
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **後端**: Supabase (PostgreSQL + Auth + RLS)
- **部署**: Docker / Vercel

## 快速開始

### 本地開發

```bash
# 1. Clone
git clone https://github.com/Jeffrey0117/LincLab.git
cd LincLab

# 2. 安裝依賴
npm install

# 3. 設定環境變數
cp .env.example .env.local
# 編輯 .env.local，填入 Supabase 設定

# 4. 設定資料庫
# 在 Supabase SQL Editor 中依序執行 supabase/migrations/ 下的 SQL 檔案

# 5. 啟動開發伺服器
npm run dev
```

### Docker 部署

```bash
cp .env.example .env.local
# 編輯 .env.local

docker compose up -d
```

應用會在 `http://localhost:3000` 啟動。

### Vercel 部署

1. Fork 此 repo
2. 在 Vercel 中匯入專案
3. 設定環境變數（參考 `.env.example`）
4. 部署

> 詳細步驟請參考 [自架指南](docs/SELF-HOSTING.md)

## 環境變數

| 變數 | 必填 | 說明 |
|------|:----:|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase 專案 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `NEXT_PUBLIC_BASE_URL` | Yes | 網站 URL (e.g. `http://localhost:3000`) |
| `LICENSE_API_SECRET` | Yes | License webhook 密鑰 |
| `NEXT_PUBLIC_SITE_NAME` | No | 網站名稱 (預設: LincLab) |
| `DEPLOYMENT_MODE` | No | `self-hosted` (預設) 或 `saas` |
| `GOOGLE_API_KEY` | No | Google Sheets 整合 |
| `DEEPSEEK_API_KEY` | No | YouTube 摘要 AI |

## 資料庫設定

1. 建立 [Supabase](https://supabase.com) 專案
2. 依序執行 `supabase/migrations/` 下的 19 個 SQL 檔案
3. 或使用 `scripts/setup-database.sh`（需要 psql）

## 專案結構

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   │   ├── admin/          # 管理員 API
│   │   ├── automation/     # 自動化系統
│   │   ├── integrations/   # 第三方整合
│   │   ├── license/        # License 管理
│   │   ├── links/          # 連結 CRUD
│   │   ├── robots/         # 爬蟲機器人
│   │   └── user/           # 用戶資訊
│   ├── admin/              # 管理員頁面
│   ├── auth/               # 認證頁面
│   ├── automation/         # 自動化頁面
│   ├── dashboard/          # 主控台
│   └── sales/              # 行銷頁面
├── components/             # React 元件
│   ├── ui/                 # shadcn/ui 基礎元件
│   └── sales/              # 行銷頁面元件
├── lib/                    # 核心邏輯
│   ├── config/             # 設定檔
│   ├── scrapers/           # 爬蟲模組
│   └── supabase/           # Supabase client
└── hooks/                  # 自訂 Hooks
```

## 部署模式

### Self-hosted（預設）

設定 `DEPLOYMENT_MODE=self-hosted`，所有註冊用戶自動獲得 VIP 權限。

### SaaS

設定 `DEPLOYMENT_MODE=saas`，需要管理員手動開通 VIP 或透過 License webhook。

## 授權

本專案採用 [Business Source License 1.1](LICENSE)。

- **允許**：自架使用、學習研究、非商業用途
- **不允許**：未經授權提供商業 SaaS 服務
- Change Date (2029-01-30) 後自動轉為 Apache-2.0

詳見 [LICENSE](LICENSE) 檔案。
