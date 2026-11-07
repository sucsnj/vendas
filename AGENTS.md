<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes  APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# AGENTS.md  PetCaixa Sales Tracker

## Stack
- Next.js 16 (App Router) with `output: 'export'` (SPA/static)
- React 19, TypeScript, Tailwind CSS v4
- Capacitor (Android) + @capacitor-community/sqlite + jeep-sqlite (web)
- Drizzle ORM over SQLite
- date-fns / Intl for America/Recife timezone (UTC-3)

## Rules
- UTF-8 without BOM, LF line endings.
- Never use PowerShell to write/edit code (avoids BOM/CRLF); use Write/Edit tools.
- Mobile-first UI, small screens.
- All dates normalized to America/Recife for day_reference (YYYY-MM-DD).
- Timestamps stored as UTC ISO8601.
- No server actions/API routes relying on request.
- Do not commit secrets.

## Commands
- dev: npm run dev
- build: npm run build
- lint: npm run lint
- typecheck: npx tsc --noEmit
- cap sync: npx cap sync android

## Estrutura
- src/app: paginas e layout
- src/components: componentes de UI
- src/lib: logica, db, backup
- docs/adr: decisoes de arquitetura
- docs/arquitetura: visao geral
- docs/schema: modelo de dados

## Backup
- Automatico em Documents/PetCaixa_Backups (Android)
- Manual JSON/XLSX
- Importacao JSON/XLSX

## Icone
- public/icon.svg
- resources/icon.png (Capacitor assets)
