# AniStream Workspace

## Overview

pnpm workspace monorepo menggunakan TypeScript. Sebuah aplikasi streaming anime yang dapat di-deploy ke Vercel.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (artifacts/anime-stream)
- **API Framework**: Express 4 (api/index.ts - Vercel serverless function)
- **Scraper**: Axios + Cheerio (scraping sumber data anime)
- **Database**: PostgreSQL + Drizzle ORM (lib/db)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (dari OpenAPI spec)
- **Build**: Vite (frontend), esbuild (API server)

## Artifacts

- `artifacts/anime-stream` — Frontend React + Vite (halaman utama, pencarian, detail anime, episode)
- `artifacts/api-server` — Express API server (untuk development di Replit)
- `api/index.ts` — Vercel serverless function handler (untuk deployment ke Vercel)

## Vercel Deployment

File konfigurasi: `vercel.json`

- **Build command**: `pnpm --filter @workspace/anime-stream run build`
- **Output directory**: `artifacts/anime-stream/dist/public`
- **Install command**: `pnpm install --no-frozen-lockfile`
- **API**: Serverless function di `api/index.ts` (menggabungkan semua route scraper)
- **API dependencies**: `api/package.json` (express, cors, axios, cheerio)

## Perbaikan untuk Vercel

1. `package.json` — Dihapus script `preinstall` yang memblokir npm/pnpm standard
2. `api/index.ts` — Ditulis ulang sebagai standalone Express serverless function (tidak bergantung pada workspace internal)
3. `api/package.json` — Package dependencies untuk fungsi serverless
4. `api/tsconfig.json` — TypeScript config untuk fungsi serverless
5. `pnpm-workspace.yaml` — Dihapus `minimumReleaseAge` yang bisa bermasalah di environment Vercel
6. `artifacts/anime-stream/vite.config.ts` — Dihapus alias `@assets` yang merujuk ke `attached_assets` (tidak ada di Vercel)
7. `vercel.json` — Dikonfigurasi ulang dengan routing yang benar

## Key Commands

- `pnpm --filter @workspace/anime-stream run dev` — Jalankan frontend locally
- `pnpm --filter @workspace/api-server run dev` — Jalankan API server locally
- `pnpm --filter @workspace/api-spec run codegen` — Generate API hooks dan Zod schemas dari OpenAPI spec
- `pnpm --filter @workspace/db run push` — Push DB schema changes (dev only)

## Data Source

Anime data di-scrape dari API `sankavollerei.com/anime/winbu` menggunakan Axios.
HTML scraping untuk halaman episode menggunakan Cheerio dari `winbu.net`.
