# PRD de Execucao - Controle UPC

## 1. Proposito

Documentar o estado atual do projeto Controle UPC, as decisoes ja tomadas, o que foi implementado e o que ainda falta para chegar a um sistema completo de prestacao de contas da UPC conforme a IN 01/2025.

Este documento serve como ponte de continuidade para retomar o trabalho em outro computador sem perder o contexto.

## 2. Regra Central Do Projeto

- A IN 01/2025 e a regra principal do sistema.
- O Manual SIM 2026 e apenas referencia tecnica para os CSVs auxiliares.
- O usuario trabalha nos modelos da IN, nao em telas de tabela do SIM.
- A importacao SIM recebe apenas municipio e exercicio. O mes nao e selecionado pelo usuario; a competencia e inferida pelos arquivos.

## 3. Visao Do Produto

O sistema Controle UPC deve:

- importar CSVs mensais do SIM;
- guardar os arquivos originais no Supabase Storage;
- gravar os dados brutos e estruturados no banco;
- apresentar os modelos da IN em uma interface moderna;
- permitir edicao controlada e auditavel;
- aceitar anexos por modelo, campo ou responsavel;
- exportar PDF e Excel;
- apoiar OCR/LLM para extracao assistida;
- mostrar dashboard com pendencias e metricas.

## 4. Stack Escolhida

- Frontend: Next.js 16, React, TypeScript, Tailwind CSS, shadcn/ui, lucide-react.
- Banco e storage: Supabase Database, Supabase Storage, Supabase Auth no futuro.
- ORM e schema: Drizzle e migrations SQL.
- Tabelas e planilhas: AG Grid, ExcelJS, xlsx.
- PDF: PDF.js, pdf-lib, Playwright.
- Processamento pesado: Python FastAPI.
- OCR e leitura: PyMuPDF, Tesseract, Pillow, Pydantic.
- LLM local: adaptador para Codex/Ollama/LM Studio/OpenAI compativel.

## 5. Arquitetura

Estrutura prevista:

- `apps/web`: aplicacao web principal.
- `apps/worker`: processamento pesado, OCR, importacao e jobs.
- `packages/shared`: tipos, constantes e regras compartilhadas.
- `supabase`: migrations, seeds, policies e configuracoes.
- `docs`: documento mestre e documentos de continuidade.

## 6. O Que Ja Foi Implementado

### 6.1 Documentacao Base

- `docs/plano-controle-upc.md` como documento mestre do projeto.
- `docs/importacao-sim.md` com o fluxo simples de importacao.
- Este documento de execucao para retomada futura.

### 6.2 Banco De Dados

Migration criada em:

- `supabase/migrations/20260611000100_initial_controle_upc.sql`

Ja contem:

- schemas `controle_upc` e `sim_staging`;
- enums de status e origem;
- tabelas de municipio, exercicio, unidade gestora, unidade orcamentaria, UPC, gestao e prestacao de contas;
- tabelas de importacao (`importacao_lote`, `importacao_arquivo`, `importacao_erro`);
- fila de jobs (`job_processamento`);
- anexos (`anexo_arquivo`);
- rol de responsaveis (`funcao_rol`, `rol_responsavel`);
- auditoria (`auditoria_alteracao`);
- modelo base do Modelo 01;
- tabela de valores editaveis por campo do modelo;
- camada bruta `sim_staging.sim_raw_registros`;
- bucket `sim-imports` previsto no Storage;
- view `controle_upc.v_importacao_lote_resumo`.

### 6.3 Importacao SIM

Fluxo simples ja desenhado e parcialmente implementado:

- usuario escolhe municipio e exercicio;
- envia pasta ou `.zip`;
- sistema detecta layout e competencia pelos nomes dos arquivos;
- backend registra lote;
- backend cria job de processamento;
- arquivos sao enviados para o bucket `sim-imports`;
- worker pode processar o lote e gravar a camada bruta.

Arquivos principais:

- `apps/web/src/app/importacoes/page.tsx`
- `apps/web/src/app/api/importacoes/analyze/route.ts`
- `apps/web/src/app/api/importacoes/lotes/route.ts`
- `apps/worker/app/main.py`
- `apps/worker/app/processing.py`
- `apps/worker/app/services.py`

### 6.4 Dashboard

- tela inicial com metricas operacionais;
- leitura de lotes recentes por view no Supabase;
- visao de pendencias e importacoes recentes.

Arquivo principal:

- `apps/web/src/app/dashboard/page.tsx`

### 6.5 Modelo 01

O Modelo 01 foi estruturado para leitura do banco e futura edicao controlada:

- carrega campos do `modelo_in`;
- carrega funcoes do `funcao_rol`;
- usa `campo_modelo_valor` para persistir valores editaveis;
- ja possui API para gravacao/consulta dos valores.
- a tela precisa receber ou informar `prestacao_contas_id` para carregar e salvar os campos.

Arquivos principais:

- `apps/web/src/app/modelos/modelo-01/page.tsx`
- `apps/web/src/app/api/modelos/modelo-01/valores/route.ts`

## 7. Decisoes Ja Fechadas

- O usuario nao escolhe mes na importacao.
- O SIM nao vira interface final de negocio; ele e apenas base auxiliar.
- A tabela 101 e a principal para gestor/dirigente maximo.
- A tabela 109 e fonte de ordenador de despesa, nao substitui a 101.
- O frontend deve mostrar modelos da IN, nao as tabelas SIM.
- Textos oficiais da IN nao devem ser editaveis.
- Valores e campos manuais podem ser editados com rastreio.
- Cada modelo pode ter anexos.
- Os arquivos originais importados devem ser preservados para auditoria e reprocessamento.

## 8. O Que Ainda Falta

### 8.1 Frontend

- tela real de edicao do Modelo 01 com autosave;
- tela de anexos por modelo, campo e responsavel;
- tela de selecao/abertura da prestacao de contas por municipio, exercicio e UPC;
- fluxo visual para informar `prestacao_contas_id` e carregar os valores da prestacao;
- experincia de tabela mais proxima de Excel para o usuario;
- layout final da home com visual mais forte.

### 8.2 Banco E Dominio

- populacao completa de `campo_modelo`;
- populacao completa de `campo_modelo_valor` a partir dos modelos reais;
- regras de relacionamento entre UPC, gestao e prestacao de contas;
- auditoria de alteracoes em campos editaveis;
- regras de integridade e validacao mais fortes para CSVs.

### 8.3 Importacao

- parser completo para CSVs reais do SIM;
- mapeamento para as tabelas estruturadas por layout;
- relatorio de erros por linha/campo;
- reprocessamento de lote;
- processamento assincrono da fila em ambiente real.

### 8.4 Exportacao

- gerar PDF fiel ao padrao da IN;
- gerar Excel formatado;
- incluir anexos no pacote final;
- exportacao com ordem e layout visual equivalentes ao documento oficial.

### 8.5 OCR E LLM

- upload de PDF, Word e Excel para extracao assistida;
- OCR para documentos escaneados;
- sugestoes de campos com revisao humana;
- gravacao final somente apos confirmacao.

## 9. Proximas Fases Recomendada

1. Finalizar a tela editavel do Modelo 01.
2. Implementar anexos por campo e por modelo.
3. Completar a importacao real dos CSVs para as tabelas estruturadas.
4. Implementar exportacao PDF e Excel.
5. Criar OCR/LLM assistido para documentos.
6. Evoluir dashboard com metricas reais.

## 10. Como Retomar Amanha

- Abrir o documento mestre em `docs/plano-controle-upc.md`.
- Ler este PRD de execucao para lembrar o que ja foi feito.
- Revisar `apps/web/src/app/api/importacoes/lotes/route.ts` e `apps/worker/app/processing.py` como base do fluxo de importacao.
- Revisar `apps/web/src/app/modelos/modelo-01/page.tsx` e `apps/web/src/app/api/modelos/modelo-01/valores/route.ts` para a continuidade da edicao do Modelo 01.
- Na tela do Modelo 01, informar `prestacao_contas_id`, carregar os valores e salvar campo a campo.
- Priorizar a experiencia visual do usuario e a exportacao final.

## 11. Observacao De Status

O sistema ainda nao esta completo. A base tecnica, documental e de arquitetura foi montada, mas ainda faltam a edicao real do modelo, os anexos, a importacao estruturada completa, as exportacoes e a experiencia final do usuario.

## 12. Atualizacao De 2026-06-10

Entregas consolidadas hoje:

- documento mestre do projeto em `docs/plano-controle-upc.md`;
- documento de continuidade em `docs/prd-execucao-controle-upc.md`;
- importacao SIM com municipio + exercicio, sem selecao de mes;
- bucket `sim-imports` para arquivos originais;
- fila de jobs `controle_upc.job_processamento`;
- camada bruta `sim_staging.sim_raw_registros`;
- dashboard lendo lotes recentes;
- Modelo 01 lendo campos da IN e salvando valores por campo em `campo_modelo_valor`;
- API de valores do Modelo 01;
- anexos do Modelo 01 com upload, listagem e abertura dos arquivos por `prestacao_contas_id`;
- bucket `anexos-upc` para suportar anexos;
- tela do Modelo 01 preparada para carregar a prestacao, editar campos, anexar documentos e abrir os arquivos enviados.
- anexos aceitam PDF, Word, Excel e imagens, com vinculo opcional por campo.

O que ainda falta, em ordem de prioridade:

1. validar a interface em ambiente com dependencias instaladas;
2. completar o editor do Modelo 01 com selecao de prestacao de contas por municipio, exercicio e UPC;
3. evoluir os anexos para conversao de Word/Excel/imagem para PDF e consolidacao no pacote final, mantendo o original acessivel;
4. completar o mapeamento dos CSVs SIM para as tabelas estruturadas;
5. implementar exportacao PDF e Excel fiel ao padrao da IN;
6. fechar a experiencia visual final com uma UI mais forte e madura.

Retomada recomendada:

- abrir o clone do repositório `DelanoBarreto/ControleUPC`;
- ler este PRD de execucao antes de continuar;
- revisar `apps/web/src/app/modelos/modelo-01/Modelo01EditorClient.tsx`;
- revisar `apps/web/src/app/api/anexos/modelo-01/route.ts`;
- revisar `apps/web/src/app/api/modelos/modelo-01/valores/route.ts`;
- continuar com o fluxo de anexos e exportacao.

## 13. Atualizacao De 2026-06-11

Estado consolidado nesta retomada:

- repositorio clonado em `C:\Antigravity\Projetos\ControleUPC`;
- dependencias instaladas e `pnpm-lock.yaml` gerado;
- scripts raiz atualizados para usar `corepack pnpm`, porque este ambiente nao tinha shim global de `pnpm`;
- `apps/web/package.json` passou a usar `eslint .` e `next typegen && tsc --noEmit`;
- `apps/web/tsconfig.json` ganhou `baseUrl` local para resolver `@/*` corretamente;
- `apps/web/next.config.ts` ficou apenas com `reactStrictMode`, removendo a antiga configuracao experimental;
- `apps/web/src/app/modelos/modelo-01/Modelo01EditorClient.tsx` agora carrega valores e anexos automaticamente quando recebe `prestacao_contas_id`;
- `apps/web/src/app/dashboard/page.tsx`, `apps/web/src/app/importacoes/page.tsx` e `apps/web/src/app/modelos/modelo-01/page.tsx` usam `next/link` para navegacao interna;
- validacoes executadas com sucesso: `corepack pnpm check`, `corepack pnpm build` e rota `/modelos/modelo-01?prestacao_contas_id=00000000-0000-0000-0000-000000000001` retornando HTTP 200 no dev server;
- o dev server do Next sobe corretamente com `corepack pnpm --filter @controle-upc/web dev --hostname 127.0.0.1 --port 3000`;
- `next typegen` precisa rodar antes do `tsc` neste ambiente do Next 16 para manter os tipos gerados sincronizados.

Proximo passo recomendado:

1. Criar a tela de selecao real de prestacao de contas por municipio, exercicio e UPC.
2. Abrir o Modelo 01 a partir dessa selecao com `prestacao_contas_id` na query string.
3. Evoluir anexos para conversao e consolidacao no pacote final, mantendo o original acessivel.
4. Seguir para exportacao PDF e Excel.
