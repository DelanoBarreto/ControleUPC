# PRD de Execucao - Controle UPC

## 1. Proposito

Documentar o estado atual do projeto Controle UPC, as decisoes ja tomadas, o que foi implementado e o que ainda falta para chegar a um sistema completo de prestacao de contas da UPC conforme a IN 01/2025.

Este documento serve como ponte de continuidade para retomar o trabalho em outro computador sem perder o contexto.

Documentos novos colocados em `docs` que valem como referencia complementar:

- `docs/handoff-2026-06-21.md` para retomar em outro computador;
- `docs/controle-upc-documento-mestre.md` para consolidacao oficial de visao, estado e backlog;
- `docs/checklist-execucao-controle-upc.md` para acompanhar execução por módulo;
- `docs/20260620000100_templates_versionados.sql` apenas como rascunho historico de schema.
- `docs/decisao-visual-saas-moderno-operacional.md` como regra vigente de UI/UX da area logada.

Regra pratica:

- a referencia principal continua sendo este PRD + `docs/plano-controle-upc.md` + `docs/plano-desenvolvimento-controle-upc.md` + `docs/guia-tecnico-execucao-controle-upc.md` + `docs/adr-001-modelos-in-versionados.md`;
- o documento mestre novo serve para pesquisa e revisao estrategica;
- o SQL novo nao substitui as migrations reais ja aplicadas no Supabase.

Se houver conflito entre documentos, prevalece a seguinte ordem:

1. `docs/adr-001-modelos-in-versionados.md`
2. `docs/decisao-visual-saas-moderno-operacional.md` para UI/UX
3. `docs/design-tokens-controle-upc.md` para tokens visuais
4. `docs/plano-controle-upc.md`
5. `docs/prd-execucao-controle-upc.md`
6. `docs/plano-desenvolvimento-controle-upc.md`
7. `docs/guia-tecnico-execucao-controle-upc.md`
8. `docs/controle-upc-documento-mestre.md`
9. `docs/checklist-execucao-controle-upc.md`
10. `docs/20260620000100_templates_versionados.sql` apenas como apoio

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

Decisao arquitetural central:

- os modelos da IN devem ser templates versionados no banco, conforme `docs/adr-001-modelos-in-versionados.md`;
- o Modelo 01 deve ser o primeiro caso do renderizador generico de modelos, nao uma tela fixa hardcoded.
- o guia tecnico consolidado esta em `docs/guia-tecnico-execucao-controle-upc.md`.

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

Limite importante:

- a estrutura atual de `modelo_in`, `campo_modelo` e `campo_modelo_valor` e uma base inicial;
- ainda falta evoluir o schema para versao normativa, secoes, quadros, colunas, classificacao dos campos e vigencia por Portaria.

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

- tela Prestacao/Contexto baseada no design Lumina;
- sidebar clara e topbar branca compacta;
- barra de contexto com municipio, exercicio, UPC/UG, gestor e periodo;
- checklist da IN;
- progresso, prestacoes recentes e acessos rapidos;
- painel de edicao do contexto;
- shell completo limitado a `1440px`;
- integração com APIs reais de contexto.

Arquivo principal:

- `apps/web/src/app/dashboard/PrestacaoDashboardClient.tsx`

### 6.5 Modelo 01

O Modelo 01 foi estruturado para leitura do banco e futura edicao controlada:

- carrega campos do `modelo_in`;
- carrega funcoes do `funcao_rol`;
- usa `campo_modelo_valor` para persistir valores editaveis;
- ja possui API para gravacao/consulta dos valores.
- a tela precisa receber ou informar `prestacao_contas_id` para carregar e salvar os campos.
- a proxima evolucao deve transformar esse fluxo no primeiro uso do renderizador generico de templates da IN.

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

- refazer a tela do Modelo 01 como planilha controlada;
- tela de anexos por modelo, campo e responsavel;
- experincia de tabela mais proxima de Excel para o usuario;
- aplicar o shell e design aprovados às próximas telas.

### 8.2 Banco E Dominio

- criar estrutura de templates versionados da IN;
- registrar versao normativa IN 01/2025 atualizada pela Portaria 51/2026;
- modelar secoes, quadros, linhas, colunas e campos por template;
- classificar campos como automatico, hibrido, manual, narrativo, anexo ou declaracao de inexistencia;
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

1. Criar a estrutura de templates versionados da IN.
2. Migrar o Modelo 01 para o template versionado.
3. Finalizar a tela editavel do Modelo 01 como renderizador generico.
4. Implementar anexos por campo e por modelo.
5. Completar a importacao real dos CSVs para as tabelas estruturadas.
6. Implementar exportacao PDF e Excel.
7. Criar OCR/LLM assistido para documentos.
8. Evoluir dashboard com metricas reais.

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

1. Criar a estrutura de templates versionados da IN.
2. Migrar o Modelo 01 para essa estrutura.
3. Criar a tela de selecao real de prestacao de contas por municipio, exercicio e UPC.
4. Abrir o Modelo 01 pelo renderizador generico com `prestacao_contas_id` na query string.
5. Evoluir anexos para conversao e consolidacao no pacote final, mantendo o original acessivel.
6. Seguir para exportacao PDF e Excel.

## 14. Atualizacao De 2026-06-21

Estado consolidado nesta data:

- projeto Supabase remoto `ControleUPC` ativo e vinculado;
- migrations aplicadas com sucesso no remoto:
  - `initial_controle_upc`;
  - `modelos_in_templates_versionados`;
  - `fk_indexes`;
- banco remoto confirma o Modelo 01 com 3 secoes, 3 quadros e 9 campos;
- rotas novas de template existem e ja servem leitura e salvamento;
- o app agora aceita `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SECRET_KEY`;
- o fluxo de anexos por template ja existe;
- `RLS` continua como pendencia obrigatoria antes de producao;
- o plano deve priorizar a abertura real do contexto da prestacao e a retirada de IDs exemplificativos do dashboard.

Próximas entregas de maior valor:

1. endpoint de abertura/resolve de contexto da prestacao;
2. tela de selecao real de municipio, exercicio, UPC e prestacao;
3. ajuste do dashboard para consumir contexto real;
4. fechamento da tela do Modelo 01 com esse contexto;
5. definicao das politicas de seguranca por tenant/usuario;
6. conclusao dos anexos e exportacao.

## 15. Atualizacao De 2026-06-21 - Contexto Real No Dashboard

Implementado:

- nova rota `GET /api/contextos/recentes` para listar prestacoes reais a partir de `prestacao_contas`, `upc`, `municipio`, `exercicio`, `unidade_gestora` e `gestao`;
- dashboard passou a buscar prestacoes recentes reais nessa rota;
- UUIDs exemplificativos foram removidos do fluxo ativo;
- botao de abertura do painel passou a chamar `/api/contextos/abrir`, criando ou resolvendo a prestacao antes de mostrar o painel;
- selecao de prestacao recente preenche municipio, exercicio, UG, UPC, gestor, periodo e `prestacao_contas_id`;
- links para Modelo 01 e Importacoes seguem usando o `prestacao_contas_id` real.

Validacoes executadas:

- `npm.cmd run lint`;
- `npm.cmd run typecheck`.

## 20. Atualizacao De 2026-06-21 - Handoff E Tela De Contexto

Implementado:

- `/dashboard` redesenhado conforme a referencia Lumina Dashboard / Clean UI Interface Refinement;
- sidebar clara, topbar branca, barra de contexto, checklist e coluna lateral;
- botoes Trocar UPC e Trocar Municipio abrem o editor real do contexto;
- shell completo limitado a `1440px`, centralizado em monitores maiores;
- documentacao visual atualizada;
- documento mestre corrigido e consolidado;
- checklist executavel criado;
- handoff autossuficiente criado para continuacao em outro computador.

Arquivos de retomada:

- `docs/handoff-2026-06-21.md`;
- `docs/controle-upc-documento-mestre.md`;
- `docs/checklist-execucao-controle-upc.md`.

Validacoes:

- `npm.cmd run lint`;
- `npx.cmd tsc --noEmit`;
- dashboard aberto no navegador;
- painel de troca de contexto validado;
- console sem erros;
- largura maxima validada em viewport amplo.

Proxima entrega:

1. aprovacao final da tela Prestacao/Contexto;
2. Modelo 01 como planilha controlada;
3. anexos por linha/campo;
4. integracao dos dados SIM;
5. exportacao PDF e Excel.

## 19. Atualizacao De 2026-06-21 - Reset Visual Da Area Interna

Decisao:

- backend, Supabase, APIs, templates e regras foram preservados;
- a area interna deve seguir padrao SaaS moderno operacional, combinando acabamento premium de dashboard web 2026 com eficiencia de GED/Excel;
- a primeira tela aprovada para refazer e `Prestacao/Contexto`;
- cada proxima tela depende de aval visual do usuario.

Implementado:

- documento `docs/design-tokens-controle-upc.md`;
- tokens globais no `globals.css`;
- componentes base `InternalShell`, `DataPanel`, `DenseTable`, `StatusBadge`, `ActionToolbar` e `ContextHeader`;
- `/dashboard` refeito como tela operacional de abertura da prestacao;
- removido o item `Landing` do menu interno.

Revisao posterior da decisao visual:

- a tentativa operacional densa ficou visualmente antiga e foi rejeitada pelo usuario;
- a referencia aceita passa a ser dashboard moderno/premium, com cards brancos, sombras, profundidade, acentos azul/amarelo/lilas e composicao visual mais atual;
- gradientes, sombras, cards com destaque e acentos roxo/lilas passam a ser permitidos quando tiverem funcao de hierarquia, leitura, progresso ou analise;
- continua proibido transformar a area logada em landing page decorativa;
- a tela `/dashboard` deve ser redesenhada novamente antes de avancar para Modelo 01.

Validacoes executadas:

- `npm.cmd run lint`;
- `npm.cmd run typecheck`.

## 18. Atualizacao De 2026-06-21 - Pagina Dinamica De Modelos

Implementado:

- nova pagina `apps/web/src/app/modelos/[codigo]/page.tsx`;
- slugs como `/modelos/modelo-02` viram `templateCodigo="modelo_02"`;
- pagina dinamica usa `TemplateEditorClient`;
- dashboard passou a apontar Modelo 02, Modelo 03 e Anexos para rotas dinamicas;
- Modelo 01 especifico continua existindo.

Impacto:

- novos modelos da IN nao precisam nascer como tela fixa;
- quando o template existir no banco, a pagina dinamica consegue renderizar campos, valores e anexos pelo mesmo motor.

Validacoes executadas:

- `npm.cmd run lint`;
- `npm.cmd run typecheck`.

Proximo passo recomendado:

1. criar a base de templates versionados da IN;
2. reforcar o renderizador generico do Modelo 01;
3. iniciar parser real dos CSVs SIM para alimentar campos automaticos.

## 16. Atualizacao De 2026-06-21 - Carregador Reutilizavel De Templates

Implementado:

- novo modulo `apps/web/src/lib/modelos/templates.ts`;
- tipos compartilhados para campos de template e funcoes do rol;
- fallbacks do Modelo 01 movidos para o modulo de templates;
- funcao `carregarCamposTemplate(codigo, fallback)` para carregar campos de qualquer modelo versionado;
- funcao `carregarFuncoesRol(fallback)` para carregar funcoes do rol;
- `apps/web/src/app/modelos/modelo-01/page.tsx` passou a usar o carregador reutilizavel.

Impacto:

- Modelo 01 continua funcionando;
- proximo modelo da IN pode reaproveitar a mesma carga de template;
- a pagina deixou de consultar diretamente `modelo_template`, `modelo_template_campo`, `modelo_template_secao` e `funcao_rol`.

Validacoes executadas:

- `npm.cmd run lint`;
- `npm.cmd run typecheck`.

Proximo passo recomendado:

1. separar o editor visual em componente generico de template;
2. criar rota/pagina dinamica para outros modelos da IN;
3. iniciar mapeamento SIM por campo automatico.

## 17. Atualizacao De 2026-06-21 - Editor Generico De Template

Implementado:

- novo componente `apps/web/src/components/modelos/TemplateEditorClient.tsx`;
- `Modelo01EditorClient` virou wrapper fino do editor generico;
- `templateCodigo` passou a controlar leitura de valores e anexos em `/api/modelos/templates/{codigo}` e `/api/anexos/templates/{codigo}`;
- titulo do editor passou a vir por propriedade;
- Modelo 01 continua usando `templateCodigo="modelo_01"`.

Impacto:

- proximos modelos da IN podem reaproveitar o mesmo editor;
- dependencia visual de `modelo_01` saiu do componente principal;
- o proximo trabalho passa a ser pagina dinamica por modelo e mapeamento SIM.

Validacoes executadas:

- `npm.cmd run lint`;
- `npm.cmd run typecheck`.
