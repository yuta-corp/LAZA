# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- Install dependencies: `pnpm install`
- Start development server: `pnpm dev` (http://localhost:3000)
- Build for production: `pnpm build`
- Start production server: `pnpm start`
- Lint code: `pnpm lint`
- Format code: `pnpm format`
- Type checking: `pnpm typecheck`
- Database migrations: `pnpm db:migrate`
- Seed database with demo data: `pnpm db:seed`
- Open Prisma Studio: `pnpm exec prisma studio`

To run a single test (if using a test framework, adjust accordingly):
- The project currently doesn't have a test framework configured. Add tests as needed.

## Code Architecture

### High-Level Structure
- **app/**: Next.js 16 App Router
  - `page.tsx`: Home page with public reports hero and explanation
  - `signaler/page.tsx`: 4-step report submission form
  - `signalement/[slug]/page.tsx`: Public report detail page (shareable)
  - `api/salt/route.ts`: Endpoint for ephemeral salt (identity commitment)
  - `api/reports/route.ts`: Endpoint for report creation (multipart: form + files)
- **components/**: Reusable UI components
  - `report-card.tsx`: Tweet-like card for published reports
  - `report-form.tsx`: 4-step assistant (details → evidence → identity → legal)
  - `share-buttons.tsx`: Social share buttons (X, LinkedIn, Facebook, WhatsApp, Instagram, copy)
  - UI primitives in `components/ui/` (shadcn/ui base)
- **lib/**: Utilities and Prisma client
  - `generated/prisma/`: Prisma client (auto-generated, do not edit)
  - `crypto/identity.ts`: Web Crypto API usage (SHA-256 for CIN+birthdate+salt, file hashes)
- **prisma/**: Database schema and seed
  - `schema.prisma`: Report/Evidence models and enums
  - `seed.ts`: Demo data generation
- **public/**: Static assets
- **hooks/**: Custom hooks (if any)
- **styles/**: Tailwind CSS configuration (via tailwind.config.ts and postcss.config.mjs)

### Key Features
- Anonymous reporting: Browser-side encryption (Web Crypto) stores only SHA-256(CIN + birthdate + salt); salt from `/api/salt`
- Evidence integrity: Client-side SHA-256 of files verified server-side
- Pre-moderation: Reports queued for trusted team review before publishing
- Legal compliance: Malagasy law (Art. 373.1) warning displayed and accepted in form
- Tech stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Prisma 7 + PostgreSQL, shadcn/ui + Tailwind v4

### Data Model (prisma/schema.prisma)
- Report: id, slug, title, description, category, region, status, createdAt, updatedAt
- Evidence: id, reportId, url (URL publique Vercel Blob des fichiers, ou lien), sha256, createdAt
- Enums: ReportCategory, ReportRegion, ReportStatus (DRAFT, PENDING, PUBLISHED, REJECTED)

### Security Notes
- Never store raw CIN or birthdate in browser or DB; only salted hash
- Salt rotates server-side; old salts stored temporarily for verification
- Evidence files uploaded to Vercel Blob (public); only the blob URL is stored in the DB
- Demo data via `pnpm db:seed` is fictional; reset with migration