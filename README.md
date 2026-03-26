# SlideVantage Admin Portal

## ⚠️ Upgrading from a previous version

**Always delete `.next/` before running after a new zip:**

```bash
rm -rf .next
npm install   # only needed if package.json changed
npm run dev
```

The `.next/` cache preserves old route mappings. If the templates tab redirects to dashboard,
this is a stale cache issue — deleting `.next/` fixes it.

**Plan CRUD (super_admin only):**
Go to Dashboard → Subscriptions → click the **Plans** tab. Super admins see Create/Edit/Delete buttons for plans.

## Setup (fully offline after initial install)

```bash
# 1. Install all dependencies (internet required once)
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local and set:
#   MONGODB_URI=mongodb+srv://...   (or mongodb://localhost:27017/slidevantage)
#   AUTH_SECRET=<run: openssl rand -base64 32>
#   NEXTAUTH_URL=http://localhost:3000

# 3. Seed the database
npm run seed

# 4. Start dev server (no internet needed)
npm run dev
```

Open http://localhost:3000

**Default login**
- Email: `admin@slidevantage.com`
- Password: `Admin@2025!`

## Why it works offline after `npm install`

- **No Google Fonts** — uses the OS system font stack (`-apple-system`, `Segoe UI`, etc.)
- **`tsx` is a devDependency** — `npm run seed` uses the local `./node_modules/.bin/tsx`, not `npx`
- **No external CDN calls** at runtime — all assets are bundled by Next.js

## Roles

| Role | Access |
|---|---|
| `super_admin` | Everything |
| `admin` | Templates, categories, users, subscriptions, payments, banners, promo codes, reports |
| `subscriber` | Browse templates, downloads, billing, favourites, account |
| `free` | Browse free templates, account |

## Tech Stack

- **Next.js 15** — App Router, Server Components, Server Actions
- **MongoDB + Mongoose 8** — all data
- **NextAuth v5** — role-based auth (admin + user in one portal)
- **Recharts** — reports and dashboard charts
- **Tailwind CSS 3** — utility styling
- **TypeScript 5** — end to end
