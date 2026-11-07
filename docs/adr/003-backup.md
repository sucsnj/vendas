# ADR 003 - Backup local

## Contexto
O app e offline-first e precisa de copia de seguranca do banco.

## Decisao
- Usar exportToJson do @capacitor-community/sqlite.
- Salvar automaticamente em Documents/PetCaixa_Backups no Android.
- No PWA, exportacao manual via download (Blob).
- Suportar importacao de JSON e XLSX.
- Permissoes de storage no AndroidManifest.

## Consequencias
- Dados podem ser restaurados em outro dispositivo.
