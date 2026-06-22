# Controle UPC - Documento Mestre

**Versão:** 3.0
**Atualizado em:** 21/06/2026
**Status:** documento vivo e fonte inicial de consulta.

## 1. Objetivo

O Controle UPC é um sistema web para montar a Prestação de Contas de Gestão das
Unidades Prestadoras de Contas conforme a IN 01/2025 do TCE-CE, atualizada pela
Portaria 51/2026.

O produto deve:

- importar dados auxiliares dos CSVs do SIM;
- reduzir digitação manual;
- apresentar os modelos oficiais da IN;
- permitir edição controlada e auditável;
- receber anexos por modelo, campo ou responsável;
- exportar PDF, Excel e pacote final;
- identificar pendências;
- usar OCR/LLM somente como assistência com confirmação humana.

## 2. Regras Centrais

1. A IN 01/2025 define modelos, documentos, textos oficiais e entregas.
2. O Manual SIM 2026 serve apenas para interpretar e importar os CSVs.
3. O usuário não trabalha em telas chamadas Tabela 101, 109 ou similares.
4. A tabela SIM 101 é a fonte principal do gestor da pasta.
5. A tabela SIM 109 identifica ordenadores de despesa e não substitui a 101.
6. Os modelos da IN são templates versionados no banco.
7. Alterações futuras por Portaria não devem exigir reescrever o frontend.
8. Textos oficiais da IN são bloqueados.
9. Valores manuais ou ajustáveis precisam de origem e auditoria.
10. Anexos pertencem ao contexto da prestação e podem ser vinculados ao modelo,
    seção, campo ou responsável.

## 3. Escopo Inicial

O MVP funcional é o Modelo 01 - Rol de Responsáveis.

O Modelo 01 deve validar o fluxo completo:

1. abrir município, exercício, UPC, gestor e período;
2. importar bases auxiliares do SIM;
3. preencher dados automáticos;
4. permitir complementação manual;
5. anexar documentos;
6. mostrar pendências;
7. exportar PDF e Excel;
8. formar o pacote final.

## 4. Arquitetura

```text
apps/web        Next.js, React, TypeScript e APIs do produto
apps/worker     FastAPI para ETL, OCR, conversão e tarefas pesadas
packages/shared Tipos, schemas e contratos compartilhados
supabase        Banco, migrations, policies, storage e jobs
docs            PRD, decisões, planos e checklists
```

### Stack

- Next.js 16, React, TypeScript e Tailwind CSS;
- Supabase PostgreSQL, Storage e Auth futura;
- Drizzle e migrations SQL;
- AG Grid Community e TanStack Table;
- PDF.js, pdf-lib e Playwright;
- ExcelJS e SheetJS;
- FastAPI, PyMuPDF, Tesseract e Pydantic;
- adaptador para LLM local ou API compatível.

## 5. Estado Implementado

### Banco e Supabase

- projeto Supabase remoto vinculado;
- domínio de município, exercício, UG, UO, UPC, gestão e prestação;
- lotes de importação, arquivos, erros e jobs;
- staging bruta do SIM;
- anexos e auditoria;
- templates versionados da IN;
- seed inicial do Modelo 01;
- índices de chaves estrangeiras;
- buckets previstos para importações e anexos.

### Templates

- migration de templates versionados aplicada;
- Modelo 01 registrado com seções, quadros e campos;
- carregador reutilizável de templates;
- editor genérico;
- rota dinâmica `/modelos/[codigo]`;
- APIs genéricas de valores e anexos.

### Contexto da Prestação

- `POST /api/contextos/abrir`;
- `GET /api/contextos/recentes`;
- contexto real com município, exercício, UG, UPC, gestor e período;
- `prestacao_contas_id` real propagado aos módulos.

### Frontend Aprovado Para Continuidade

- `/dashboard` representa Prestação/Contexto;
- sidebar clara;
- topbar branca compacta;
- barra horizontal de contexto;
- checklist da IN;
- progresso, prestações recentes e acessos rápidos;
- edição do contexto aberta pelos botões Trocar UPC/Trocar Município;
- shell completo limitado a `1440px` e centralizado em telas maiores;
- layout de referência: Lumina Dashboard / Clean UI Interface Refinement.

### Validação

- `npm.cmd run lint`;
- `npx.cmd tsc --noEmit`;
- rota `/dashboard` validada no navegador;
- interação do painel de troca de contexto validada;
- largura máxima de `1440px` validada em viewport amplo.

## 6. Direção Visual Oficial

A área interna usa estética Corporate Modern / Flat 2.0:

- fundo neutro;
- superfícies brancas;
- bordas finas;
- sidebar clara;
- tipografia Manrope;
- azul institucional nas ações;
- cards laterais com sombra discreta;
- status com cores semânticas;
- densidade adequada para trabalho administrativo.

Gradientes são permitidos, mas não devem dominar a tela operacional de contexto.
Não usar hero grande em Prestação/Contexto.

O shell da aplicação tem largura máxima de `1440px`. Em monitores ultrawide,
fica centralizado sobre fundo neutro.

## 7. Pendências Principais

1. Aprovação final da tela Prestação/Contexto.
2. Refazer o Modelo 01 como planilha controlada seguindo o novo design.
3. Concluir anexos por modelo, campo e responsável.
4. Implementar conversão de Word, Excel e imagens para PDF.
5. Completar parser real dos CSVs SIM.
6. Alimentar automaticamente campos do Modelo 01.
7. Implementar exportação PDF e Excel.
8. Criar pacote final com anexos e índice.
9. Aplicar RLS e autenticação antes de produção.
10. Implementar OCR/LLM assistido após o fluxo principal.

## 8. Ordem De Desenvolvimento

1. Aprovar Prestação/Contexto.
2. Implementar Modelo 01 planilha.
3. Implementar Importação SIM.
4. Implementar Anexos.
5. Conectar automações SIM ao Modelo 01.
6. Exportar PDF/Excel e consolidar pacote.
7. Criar dashboard executivo.
8. Aplicar segurança multiusuário.
9. Implementar OCR/LLM.
10. Replicar o motor para os demais modelos.

## 9. Hierarquia Documental

1. `docs/adr-001-modelos-in-versionados.md`
2. `docs/decisao-visual-saas-moderno-operacional.md`
3. `docs/design-tokens-controle-upc.md`
4. `docs/controle-upc-documento-mestre.md`
5. `docs/checklist-execucao-controle-upc.md`
6. `docs/plano-controle-upc.md`
7. `docs/prd-execucao-controle-upc.md`
8. `docs/plano-desenvolvimento-controle-upc.md`
9. `docs/guia-tecnico-execucao-controle-upc.md`

## 10. Regra De Atualização

Atualizar este documento e o checklist sempre que ocorrer:

- aprovação ou rejeição de tela;
- novo modelo da IN;
- migration ou alteração de banco;
- nova API;
- mudança no fluxo SIM;
- nova regra de anexo;
- implementação de exportação;
- decisão regulatória ou visual.
