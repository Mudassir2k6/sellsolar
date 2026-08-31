# SellSolar

Pakistan solar marketplace recovered from the Bolt hosted build at [sellsolar-homepage-bfeb.bolt.host](https://sellsolar-homepage-bfeb.bolt.host).

That URL is a published site, not a Git repository. This folder is a Vite + React + Tailwind reconstruction of the live app, including listings, auth, dealers, dashboards, and the original Supabase data layer.

## Setup

1. Install Node.js 18+.
2. Copy `.env.example` to `.env` and add the public Supabase anon key used by the hosted site (it is already in the published JS bundle).
3. Install and run:

```bash
npm install
npm run dev
```

## Stack

- Vite + React 18
- Tailwind CSS
- lucide-react
- Supabase (`profiles`, `solar_listings`, `categories`, `brands`, `enquiries`, `advertisements`, `favorites`, `notifications`)
