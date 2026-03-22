# Shamrock Art Studio

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

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Shamrock-Art-Studios
