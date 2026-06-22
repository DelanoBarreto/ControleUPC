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

O documento consolidado do projeto esta em:

[docs/controle-upc-documento-mestre.md](docs/controle-upc-documento-mestre.md)

## Retomada Em Outro Computador

Comece pelo handoff:

[docs/handoff-2026-06-21.md](docs/handoff-2026-06-21.md)

Depois consulte o checklist:

[docs/checklist-execucao-controle-upc.md](docs/checklist-execucao-controle-upc.md)

## Guia Tecnico De Execucao

Use este guia como referencia operacional para implementar banco, templates, importacao SIM, renderizador, anexos e exportacao:

[docs/guia-tecnico-execucao-controle-upc.md](docs/guia-tecnico-execucao-controle-upc.md)

## Plano De Desenvolvimento

Use este arquivo para guiar a ordem de implementacao e a pesquisa tecnica do projeto:

[docs/plano-desenvolvimento-controle-upc.md](docs/plano-desenvolvimento-controle-upc.md)

## Decisoes Arquiteturais

A decisao central do projeto e que os modelos da IN devem ser templates versionados no banco, nao telas fixas no codigo:

[docs/adr-001-modelos-in-versionados.md](docs/adr-001-modelos-in-versionados.md)

## Direcao Visual

A direcao visual da area logada e das telas operacionais esta documentada em:

[docs/direcao-visual-controle-upc.md](docs/direcao-visual-controle-upc.md)

O shell interno tem largura maxima de `1440px`, sidebar clara, topbar compacta e
layout centralizado em monitores maiores.

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

O Modelo 01 deve ser implementado como primeiro caso do renderizador generico de modelos da IN.

Ele deve validar:

- importacao dos CSVs auxiliares;
- identificacao da UPC;
- preenchimento automatico e manual;
- anexos por modelo/responsavel;
- pendencias;
- exportacao PDF e Excel.
