# Arquitetura - PetCaixa

## Visao geral
- SPA estatica (Next.js output export) para Capacitor Android e PWA.
- Banco SQLite local via @capacitor-community/sqlite, com fallback web (jeep-sqlite).
- ORM Drizzle sobre SQLite (sqlite-proxy).
- Datas normalizadas em America/Recife (day_reference YYYY-MM-DD); timestamps UTC ISO8601.

## Camadas
- UI: src/app, src/components
- Logica: src/lib/calculator.ts, src/lib/timezone.ts, src/lib/backup.ts
- Dados: src/lib/db (client, schema, salesRepo)
- Docs: docs/adr, docs/arquitetura, docs/schema

## Fluxo
1. Usuario registra venda no formulario.
2. Parser reativo calcula pre-visualizacao.
3. Venda persistida no SQLite local.
4. Agregacoes recalculadas via SQL (SUM/AVG/COUNT).
5. Historico agrupa por mes/dia.
6. Backup local automatico (JSON) apos mutacoes.
