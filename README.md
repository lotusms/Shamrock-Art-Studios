# Shamrock Art Studio

> **Repo root:** This folder (`shamrock-art-studio/`) is the Git and Next.js project root. The parent `Shamrock Art Studio/` folder is only a disk wrapper (like `Volair/volair/`).

Starter app built with [Next.js](https://nextjs.org), React, Tailwind CSS, and Firebase using `pnpm`.

## Getting Started

Install dependencies if needed and start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Firebase Setup

1. Copy the example env file:

```bash
cp .env.local.example .env.local
```

2. Paste your Firebase web app config into `.env.local`.
3. Use the shared initializer from `src/lib/firebase.js`.

Example:

```js
import { getFirebaseApp } from "@/lib/firebase";

const app = getFirebaseApp();
```

## Available Scripts

- `pnpm dev` starts the local development server.
- `pnpm build` creates the production build.
- `pnpm start` runs the production server.
- `pnpm lint` runs ESLint.

## Stack

- Next.js App Router
- React
- Tailwind CSS v4
- Firebase Web SDK

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

## Deploy on Vercel

1. Import the GitHub repo in [Vercel](https://vercel.com/new).
2. **Framework:** Next.js (auto-detected). **Install command:** `pnpm install` (used automatically when `pnpm-lock.yaml` is present).
3. **Environment variables:** In the project → Settings → Environment Variables, add every key from `.env.local.example` (same `NEXT_PUBLIC_*` names). `.env.local` is not committed; production builds need these in Vercel if you use Firebase on the client.
4. Deploy. Build command is `pnpm build` via the `build` script in `package.json`.

If the build fails, open the full log and check the first **Error** line—often it’s a missing env var, Node version, or lint/type error. This repo pins Node `>=20.9.0` and `pnpm` via `packageManager` in `package.json` for consistent CI/Vercel installs.

- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
