# Self-Hosting Guide

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works)
- Docker (optional, for containerized deployment)

---

## 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down the following from **Settings > API**:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - Anon public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Service role key (`SUPABASE_SERVICE_ROLE_KEY`)

## 2. Database Migrations

Run all SQL migration files in order from `supabase/migrations/`.

### Option A: Supabase SQL Editor (Recommended)

1. Open your Supabase Dashboard > SQL Editor
2. Execute each `.sql` file in `supabase/migrations/` in alphabetical order (001 through 019)
3. Verify tables are created under the `public` schema

### Option B: Command Line (psql)

```bash
# Set your database connection string
export DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Run the setup script
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh
```

Find your connection string in Supabase Dashboard > Settings > Database > Connection string > URI.

## 3. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the required values:

| Variable | Required | Description |
|----------|:--------:|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `NEXT_PUBLIC_BASE_URL` | Yes | Your site URL (e.g. `https://links.example.com`) |
| `LICENSE_API_SECRET` | Yes | Generate with `openssl rand -hex 32` |
| `DEPLOYMENT_MODE` | No | `self-hosted` (default) or `saas` |
| `NEXT_PUBLIC_SITE_NAME` | No | Site name (default: LincLab) |
| `GOOGLE_API_KEY` | No | For Google Sheets integration |
| `DEEPSEEK_API_KEY` | No | For YouTube summary AI |

## 4. Deployment

### Option A: Docker (Recommended)

```bash
# Build and start
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

The app starts on port 3000 by default.

### Option B: Node.js

```bash
# Install dependencies
npm install

# Build
npm run build

# Start production server
npm start
```

### Option C: Vercel

1. Fork this repository
2. Import the project in Vercel
3. Add environment variables in the Vercel dashboard
4. Deploy

## 5. Reverse Proxy

For production, place the app behind a reverse proxy with HTTPS.

### Nginx

```nginx
server {
    listen 80;
    server_name links.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name links.example.com;

    ssl_certificate /etc/letsencrypt/live/links.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/links.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Caddy

```
links.example.com {
    reverse_proxy localhost:3000
}
```

Caddy handles HTTPS automatically via Let's Encrypt.

## 6. Self-Hosted Mode

When `DEPLOYMENT_MODE=self-hosted` (the default), all registered users automatically receive VIP privileges with no restrictions. No license key or admin activation is needed.

To use subscription-based access control, set `DEPLOYMENT_MODE=saas`.

## 7. Admin Setup

To set yourself as admin:

1. Register an account through the web UI
2. In Supabase Dashboard > Table Editor > `profiles` table
3. Find your user row and set `role` to `admin`
4. You can now access `/admin/dashboard` to manage users

## 8. Updating

```bash
# Pull latest changes
git pull origin main

# Rebuild
docker compose up -d --build
# or: npm install && npm run build && npm start
```
