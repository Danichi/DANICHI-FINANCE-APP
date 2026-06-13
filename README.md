# Danichi Finance

Partner revenue tracker for Danichi Media. Automatically splits payments between partners based on configurable roles, logs all transactions, and provides analytics on earnings and equity.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS + Custom CSS design system |
| Charts | Recharts |
| Backend | Node.js + Express 5 |
| Database | SQLite (better-sqlite3 + Drizzle ORM) |
| Deployment | Cloudflare Pages (frontend) + Railway (backend) |

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Local Development

**1. Install dependencies**
```bash
# Root (concurrently runner)
npm install

# Server
cd server && npm install

# Client
cd client && npm install
```

**2. Configure environment**
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

**3. Start both servers**
```bash
npm run dev
```

Or use the one-click launcher:
```
Start Danichi Finance.bat
```

The app opens at `http://localhost:5173`. The API runs on `http://localhost:3001`.

**4. Seed sample data (optional)**
```bash
cd server && npm run seed
```

---

## How the Split Works

Every payment is divided into four buckets (percentages are configurable in Settings):

| Bucket | Default % | Goes to |
|--------|-----------|---------|
| Business Reserve | 10% | Business profit pool |
| Client Management | 10% | Assigned partner (or 50/50) |
| Sales Commission | 20% | Assigned partner (or 50/50) |
| Work Pool | 60% | Split by hours or % |

---

## Deployment

### Backend (Railway)

1. Connect the GitHub repo to Railway
2. Set the root directory to `server/`
3. Add environment variables from `server/.env.example`
4. Railway uses `server/railway.json` for build config — no extra setup needed
5. Add a persistent volume at `/data` and set `DB_PATH=/data/danichi.db`

### Frontend (Cloudflare Pages)

1. Connect the GitHub repo to Cloudflare Pages
2. Set build settings:
   - **Root directory:** `client`
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
3. Add environment variable:
   - `VITE_API_URL` = your Railway backend URL (e.g. `https://danichi-api.up.railway.app`)

### CORS Setup

After deploying, add your Cloudflare Pages URL to the `CORS_ORIGINS` environment variable on Railway:
```
CORS_ORIGINS=https://your-app.pages.dev,http://localhost:5173
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET/POST | `/api/transactions` | List / create transactions |
| GET/PUT/DELETE | `/api/transactions/:id` | Get / update / delete transaction |
| GET/POST | `/api/expenses` | List / create expenses |
| GET/POST | `/api/goals` | List / create goals |
| GET | `/api/analytics/dashboard` | Dashboard stats |
| GET | `/api/analytics/equity` | Partner earnings breakdown |
| GET | `/api/analytics/monthly-revenue` | Revenue by month |
| GET/PUT | `/api/settings` | App settings |

---

## Contributing

Both Malachi and Daniel work on this via their own Claude Code sessions connected to the same GitHub repo. Pull latest changes before starting work:

```bash
git pull origin main
```

Push your changes:
```bash
git add .
git commit -m "your message"
git push origin main
```

The other partner pulls and gets the changes immediately.
