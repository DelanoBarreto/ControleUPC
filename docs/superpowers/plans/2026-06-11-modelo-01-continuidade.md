# Modelo 01 Continuidade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** completar a continuidade do Modelo 01 com carregamento confiavel por `prestacao_contas_id`, edicao controlada e anexos vinculados.

**Architecture:** manter a pagina do Modelo 01 como orquestradora de dados e deixar o editor cliente responsavel apenas pela interacao. O trabalho vai consolidar o carregamento automatico dos valores, melhorar o fluxo de selecao da prestacao, reforcar a persistencia campo a campo e manter os anexos consultaveis e vinculados ao modelo.

**Tech Stack:** Next.js 16, React, TypeScript, Supabase, Route Handlers, Storage.

---

### Task 1: Carregamento automatico da prestacao

**Files:**
- Modify: `apps/web/src/app/modelos/modelo-01/Modelo01EditorClient.tsx`
- Modify: `apps/web/src/app/modelos/modelo-01/page.tsx`

- [ ] **Step 1: Write the failing test**

```ts
// ideia: quando `prestacao_contas_id` vier na query string, o editor deve carregar os valores automaticamente
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @controle-upc/web typecheck`
Expected: falha ou alerta de fluxo manual incompleto.

- [ ] **Step 3: Write minimal implementation**

```ts
// carregar valores ao montar a tela quando houver `prestacao_contas_id`
// e manter o estado sincronizado com a query string
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @controle-upc/web typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/modelos/modelo-01/Modelo01EditorClient.tsx apps/web/src/app/modelos/modelo-01/page.tsx docs/superpowers/plans/2026-06-11-modelo-01-continuidade.md
git commit -m "feat: continue modelo 01 workflow"
```

### Task 2: Persistencia e UX de anexos

**Files:**
- Modify: `apps/web/src/app/api/anexos/modelo-01/route.ts`
- Modify: `apps/web/src/app/modelos/modelo-01/Modelo01EditorClient.tsx`

- [ ] **Step 1: Write the failing test**

```ts
// ideia: validar formato aceito e retorno da listagem com URLs assinadas
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @controle-upc/web typecheck`
Expected: nenhuma regressao de tipos.

- [ ] **Step 3: Write minimal implementation**

```ts
// melhorar feedback de upload e recarregar anexo apos salvar
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @controle-upc/web typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/api/anexos/modelo-01/route.ts apps/web/src/app/modelos/modelo-01/Modelo01EditorClient.tsx
git commit -m "feat: improve modelo 01 attachments"
```

### Task 3: Validacao final

**Files:**
- Modify: none

- [ ] **Step 1: Run typecheck**

Run: `pnpm --filter @controle-upc/web typecheck`
Expected: PASS

- [ ] **Step 2: Run build**

Run: `pnpm run build`
Expected: PASS

- [ ] **Step 3: Review result**

Confirm that the Modelo 01 page loads, accepts a `prestacao_contas_id`, saves a field, and lists attachments.
