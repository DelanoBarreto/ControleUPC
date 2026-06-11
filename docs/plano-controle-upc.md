# Plano Mestre - Controle UPC

## 1. Visao Geral

O Controle UPC sera um sistema web para apoiar a montagem da prestacao de contas de gestao das Unidades Prestadoras de Contas (UPC), conforme os modelos, anexos e exigencias definidos pela IN 01/2025 do TCE-CE.

O sistema deve reduzir digitacao manual, importar dados auxiliares dos arquivos CSV do SIM, validar consistencia, permitir complementacao controlada, anexar documentos e exportar os relatorios finais em PDF e Excel.

Este documento deve ser mantido como referencia permanente do projeto. Sempre que um novo modelo, modulo, regra de banco, tela, fluxo de importacao ou exportacao for definido, este arquivo deve ser atualizado.

## 2. Regra Principal Do Projeto

A IN 01/2025 e a fonte principal do produto.

Ela define:

- quais modelos precisam existir;
- quais anexos/documentos compoem a prestacao de contas;
- qual estrutura visual deve ser apresentada ao usuario;
- quais campos, quadros, textos e documentos precisam ser gerados;
- quais regras de prestacao de contas por UPC devem ser respeitadas.

O Manual SIM 2026 e apenas uma referencia tecnica dos arquivos CSV que o municipio ja possui.

Ele serve para:

- entender os layouts dos CSVs;
- importar dados para o banco;
- validar campos, tipos e chaves;
- relacionar dados contabeis, patrimoniais, folha, gestores, ordenadores e demais bases auxiliares;
- preencher automaticamente campos dos modelos da IN quando houver informacao suficiente.

O sistema nao deve tratar o Manual SIM como tela final do usuario e nao deve implementar envio mensal do SIM ao TCE.

## 3. Stack Definida

### Aplicacao Web

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react

### Banco, Auth E Arquivos

- Supabase Database (PostgreSQL)
- Supabase Storage
- Supabase Auth em fase futura
- Supabase Policies para controle de acesso
- Drizzle ORM
- SQL migrations

### Tabelas, Formularios E Dashboard

- AG Grid Community para experiencia parecida com Excel
- TanStack Table para tabelas administrativas menores
- Recharts ou componentes de graficos do shadcn/ui

### PDF, Excel, Word E Anexos

- PDF.js para visualizar PDFs no navegador
- pdf-lib para juntar, reorganizar e manipular PDFs
- Playwright para gerar PDF a partir de HTML/CSS fiel ao layout da IN
- ExcelJS para criar arquivos Excel formatados
- SheetJS para leitura e importacao de planilhas variadas
- LibreOffice headless para conversao de Word/Excel para PDF quando necessario

### Processamento Pesado, OCR E LLM

- Python FastAPI como worker separado
- PyMuPDF para leitura e extracao de PDF
- Tesseract OCR para PDFs/imagens digitalizadas
- Pydantic para validar dados extraidos antes de gravar no banco
- Adaptador para LLM local compativel com Codex/Ollama/LM Studio/OpenAI API

### Testes

- Playwright para testes de interface, PDF e fluxo do usuario
- Vitest para testes unitarios do frontend e regras TypeScript
- Testes de importacao para CSV, Excel, PDF e OCR

## 4. Arquitetura

O projeto deve ser organizado como monorepo:

- `apps/web`: aplicacao Next.js.
- `apps/worker`: servico Python FastAPI para tarefas pesadas.
- `packages/shared`: tipos, schemas, validacoes e contratos reutilizaveis.
- `supabase`: migrations, policies, seeds e configuracoes de banco/storage.
- `docs`: documentacao tecnica e funcional do projeto.

O fluxo de importacao dos arquivos SIM esta detalhado em:

- `docs/importacao-sim.md`

Analise inicial de lote:

- `POST /api/importacoes/analyze`

Registro inicial do lote:

- `POST /api/importacoes/lotes`

### Responsabilidade Do Web

O app web deve cuidar de:

- pagina inicial moderna;
- login futuro;
- dashboard operacional com pendencias, importacoes recentes e metricas simples;
- tela simples de importacao SIM por municipio e exercicio, sem selecao manual de mes, com deteccao automatica da competencia;
- analise do lote antes do registro definitivo;
- selecao de municipio, exercicio, UPC, periodo e modelo;
- telas dos modelos da IN;
- edicao controlada;
- revisao de dados sugeridos por OCR/LLM;
- anexos;
- solicitacao de exportacao PDF/Excel;
- acompanhamento de jobs.

### Responsabilidade Do Worker

O worker deve cuidar de:

- processamento de CSVs grandes;
- validacao de layouts SIM;
- leitura de PDFs;
- OCR;
- conversao de Word/Excel/PDF;
- chamadas ao LLM local;
- geracao de sugestoes estruturadas;
- tarefas demoradas de exportacao.

### Responsabilidade Do Supabase

O Supabase deve guardar:

- dados relacionais do sistema;
- tabelas staging dos CSVs SIM;
- tabelas proprias da prestacao de contas;
- anexos no Storage;
- arquivos originais dos lotes SIM no Storage;
- fila de jobs;
- status de processamento;
- auditoria de alteracoes.

## 5. Regras De Dados

Migration inicial:

- `supabase/migrations/20260611000100_initial_controle_upc.sql`

### Camada SIM

As tabelas do SIM devem existir apenas no banco de dados, em camada staging ou equivalente.

O usuario nao deve ver telas chamadas "Tabela 101", "Tabela 109" ou "Tabela 951". O usuario deve ver os modelos da IN, com dados ja traduzidos para a linguagem da prestacao de contas.

As tabelas SIM servem para consulta, relacionamento e preenchimento automatico.

No MVP, as tabelas staging devem ter colunas principais nomeadas para os campos usados pelo Modelo 01 e tambem `raw_record` em `jsonb`, preservando o registro original completo importado do CSV. Alem disso, existe uma camada bruta `sim_staging.sim_raw_registros` para preservar cada linha importada enquanto o mapeamento fino evolui. Conforme cada novo modelo for implementado, novas colunas nomeadas podem ser adicionadas sem perder o historico original.

Os arquivos originais do SIM devem ser enviados pela aplicacao web e armazenados no Supabase Storage no padrao:

```txt
sim-imports/{codigo_municipio}/{exercicio}/{lote_id}/original/{nome_arquivo}
```

O bucket privado esperado para esse fluxo e `sim-imports`.

Depois do upload, o worker processa o lote, detecta a competencia de cada arquivo e grava os dados primeiro em staging bruta, com evolucao posterior para as tabelas estruturadas.

### Camada Da IN

As tabelas proprias do sistema devem representar:

- UPC;
- prestacao de contas;
- modelos da IN;
- campos dos modelos;
- status de preenchimento;
- anexos;
- revisoes;
- auditoria;
- exportacoes.

### Origem Dos Dados

Cada informacao relevante deve guardar sua origem:

- `sim_auto`: veio automaticamente do CSV SIM;
- `sim_parcial`: veio parcialmente do SIM e precisa revisao;
- `manual`: digitado pelo usuario;
- `ajuste_controlado`: ajuste permitido sobre informacao importada;
- `ocr_sugerido`: sugerido por OCR/LLM e ainda pendente de confirmacao;
- `ocr_confirmado`: sugerido por OCR/LLM e confirmado pelo usuario.

Na importacao SIM, o usuario nao escolhe mes. Ele escolhe apenas municipio e exercicio. Os meses/competencias sao inferidos pelos arquivos enviados em pasta ou `.zip`.

Para o Modelo 01, os valores editaveis ficam em `controle_upc.campo_modelo_valor`, e os textos oficiais permanecem bloqueados em `controle_upc.campo_modelo` com `texto_oficial = true`.

## 6. MVP - Modelo 01

O primeiro modulo completo sera o Modelo 01 - Rol de Responsaveis.

O objetivo do MVP e validar o fluxo principal:

- importar CSVs auxiliares;
- montar dados da UPC;
- abrir Modelo 01;
- preencher automaticamente o que for possivel;
- permitir complementacao manual;
- anexar documentos;
- mostrar pendencias;
- exportar PDF;
- exportar Excel.

### Fontes SIM Para O Modelo 01

- `101`: fonte principal para gestor/dirigente maximo da UPC.
- `103`: orgaos.
- `104`: unidades orcamentarias.
- `108`: unidades gestoras e composicao da UPC.
- `109`: ordenadores de despesa por UO, incluindo gestor ordinario ou delegados.
- `503`: tipos de responsaveis pela contratacao.
- `504`: identificacao dos responsaveis pela contratacao.
- `951`: cadastro de agentes publicos.
- `952`: desligamentos de agentes publicos.
- `953`: reingressos de agentes publicos.

### Regras Do Modelo 01

- O dirigente maximo/prestador de contas deve vir prioritariamente da tabela `101`.
- A tabela `109` deve ser usada para identificar ordenadores de despesa, nao para substituir a tabela `101`.
- As tabelas `503` e `504` podem preencher parcialmente os responsaveis por licitacoes/contratacoes.
- A tabela `951` deve alimentar a busca de pessoas para selecao manual.
- O usuario deve completar as funcoes que nao existirem no SIM.
- Cada linha deve indicar se esta automatica, parcial, manual, pendente ou revisada.
- A tela do Modelo 01 deve carregar valores a partir de `prestacao_contas_id` e salvar por campo em `campo_modelo_valor`.

## 7. Regras De Interface

O frontend deve mostrar os modelos da IN, nao as tabelas do SIM.

Textos oficiais da IN nao devem ser editaveis.

Devem ser bloqueados por padrao:

- nome do municipio vindo do SIM;
- codigo do municipio;
- codigo da unidade gestora;
- nome da unidade gestora;
- codigo da unidade orcamentaria;
- nome da unidade orcamentaria;
- textos oficiais dos modelos;
- titulos, legendas e quadros fixos da IN.

Podem ser editados com controle:

- valores;
- datas;
- justificativas;
- observacoes;
- campos manuais;
- responsaveis nao encontrados automaticamente;
- dados sugeridos por OCR/LLM apos revisao humana.

Toda edicao relevante deve gerar auditoria com usuario, data, campo, valor anterior, valor novo e origem.

## 8. Regras De Anexos

Todo modelo deve aceitar um ou varios anexos.

Os anexos devem poder ser vinculados a:

- municipio;
- exercicio;
- UPC;
- periodo;
- modelo;
- secao do modelo;
- campo especifico;
- responsavel especifico, quando aplicavel.

Exemplos:

- Modelo 01: portarias, atos de nomeacao, exoneracao, certidao do contador.
- Modelo 08: notas explicativas, guias, comprovantes, demonstrativos complementares.
- Modelos com extratos: relacao digitada no modelo e PDFs anexados ao pacote final.

Arquivos Word, Excel e imagens devem poder ser convertidos para PDF quando forem anexados ao pacote final.

## 9. OCR E LLM

O OCR/LLM deve ser assistente de preenchimento, nao gravacao automatica final.

Fluxo esperado:

1. Usuario envia PDF, imagem, Word ou Excel.
2. Worker extrai texto ou executa OCR.
3. LLM local interpreta o conteudo.
4. Sistema gera sugestoes de campos para o modelo da IN.
5. Usuario revisa e confirma.
6. Dados confirmados sao gravados com origem `ocr_confirmado`.

Nenhum dado sugerido por IA deve substituir texto oficial da IN.

## 10. Proximas Fases

### Fase 1 - Fundacao

- Criar monorepo.
- Criar app Next.js.
- Criar worker FastAPI.
- Configurar Supabase.
- Criar design system inicial.
- Criar layout base com pagina inicial moderna e workspace do sistema.
- Criar dashboard operacional inicial.

### Fase 2 - Banco

- Criar migrations iniciais.
- Criar tabelas de dominio da UPC.
- Criar staging dos CSVs necessarios ao Modelo 01.
- Criar tabela de jobs.
- Criar estrutura de anexos e auditoria.

### Fase 3 - Importacao SIM

- Tela simples de importacao por municipio e exercicio.
- Upload de pasta do exercicio ou arquivo `.zip`.
- Deteccao automatica das competencias existentes nos arquivos.
- Upload de CSV.
- Identificacao do layout.
- Validacao basica.
- Gravacao em staging.
- Relatorio de erros.

### Fase 4 - Modelo 01

- Tela do Modelo 01.
- Preenchimento automatico com `101`, `109`, `503`, `504`, `951`, `952` e `953`.
- Edicao controlada.
- Pendencias.
- Anexos.

### Fase 5 - Exportacao

- PDF fiel ao modelo.
- Excel formatado.
- Pacote final com anexos.

### Fase 6 - Dashboard

- Pendencias por UPC.
- Pendencias por modelo.
- Anexos ausentes.
- Dados parciais.
- Importacoes com erro.
  - resumir lotes recebidos;
  - mostrar importacoes recentes;
  - exibir metricas simples de status.

### Fase 7 - OCR/LLM

- Upload de PDF para leitura.
- OCR.
- Extracao estruturada.
- Revisao humana.
- Gravacao confirmada.

### Fase 8 - Proximos Modelos

- Repetir o padrao para os demais modelos da IN.
- Mapear cada modelo individualmente.
- Classificar campos como automaticos, parciais, manuais ou anexos.

## 11. Checklist De Aceite

- [ ] O sistema usa a IN 01/2025 como fonte principal do produto.
- [ ] O Manual SIM 2026 e usado apenas como referencia dos CSVs.
- [ ] O frontend mostra modelos da IN, nao tabelas SIM.
- [ ] A stack definida esta documentada.
- [ ] A arquitetura `apps/web`, `apps/worker`, Supabase e jobs esta definida.
- [ ] O MVP e o Modelo 01 completo.
- [ ] A tabela `101` e fonte principal do gestor/dirigente maximo.
- [ ] A tabela `109` e fonte de ordenador de despesa.
- [ ] A importacao SIM usa apenas municipio e exercicio, inferindo as competencias pelos arquivos enviados.
- [ ] O Modelo 01 carrega campos da IN e salva valores editaveis em `campo_modelo_valor`.
- [ ] O lote gera job de processamento e preserva a camada bruta da importacao.
- [ ] Os textos oficiais da IN ficam bloqueados.
- [ ] Dados importados possuem origem rastreavel.
- [ ] Anexos podem ser vinculados a modelos e campos/responsaveis.
- [ ] Exportacao PDF e Excel fazem parte do MVP.
- [ ] OCR/LLM exige revisao humana antes de gravar.

## 12. Decisoes Em Aberto

- Definir nome final do produto.
- Definir identidade visual inicial.
- Definir se o login entra no MVP ou na fase seguinte.
- Definir primeiro municipio de teste.
- Definir amostras reais de CSV para validar a importacao.
- Definir padrao visual exato do PDF/Excel do Modelo 01.
