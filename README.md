# Controle UPC

Sistema web para montagem da prestacao de contas de Unidades Prestadoras de Contas (UPC), conforme a IN 01/2025 do TCE-CE.

## Regra Central

- A IN 01/2025 define os modelos, anexos, documentos e entregas do sistema.
- O Manual SIM 2026 serve apenas como referencia tecnica para importar e relacionar CSVs auxiliares.
- O usuario deve trabalhar nos modelos da IN, nao em telas de tabelas do SIM.

## Estrutura Inicial

- `apps/web`: aplicacao Next.js.
- `apps/worker`: worker FastAPI para CSV, PDF, OCR, Excel, Word e LLM.
- `packages/shared`: tipos e constantes compartilhadas.
- `supabase`: migrations, seeds, policies e storage.
- `docs`: documentacao do projeto.

## Documento Mestre

O planejamento vivo do projeto esta em:

[docs/plano-controle-upc.md](docs/plano-controle-upc.md)

Atualize esse documento sempre que um novo modelo, regra de banco, tela, importacao ou exportacao for definido.

## Documento De Continuidade

Use este arquivo quando for retomar o projeto em outro computador:

[docs/prd-execucao-controle-upc.md](docs/prd-execucao-controle-upc.md)

## Stack

- Next.js 16, React, TypeScript
- Supabase Database, Storage e Auth futura
- Drizzle ORM e SQL migrations
- Tailwind CSS, shadcn/ui, lucide-react
- AG Grid Community
- PDF.js, pdf-lib, Playwright
- ExcelJS, xlsx
- Python FastAPI, PyMuPDF, Tesseract, Pydantic e LLM local

## MVP

O primeiro fluxo completo sera o Modelo 01 - Rol de Responsaveis.

Ele deve validar:

- importacao dos CSVs auxiliares;
- identificacao da UPC;
- preenchimento automatico e manual;
- anexos por modelo/responsavel;
- pendencias;
- exportacao PDF e Excel.
