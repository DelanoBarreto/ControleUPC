# AGENTS.md — Controle UPC
Projeto: prestacao de contas das UPCs conforme IN TCE-CE 01/2025 e atualizacoes. Consulte `docs/controle-upc-documento-mestre.md` e o checklist de execucao antes de planejar alteracoes.

## Fluxo curto
1. Confirmar branch, `git status`, tarefa e arquivos relevantes. Usar branch/worktree isolada; nao sobrescrever alteracoes existentes.
2. Priorizar o MVP Modelo 01 — Rol de Responsaveis. Respeitar templates oficiais versionados, texto normativo bloqueado e trilha de auditoria.
3. SIM e fonte auxiliar para importacao; nao substituir modelos da IN por telas de tabelas SIM. OCR/LLM apenas com revisao humana.
4. Validar isolamento por municipio, exercicio e UPC; proteger documentos e dados pessoais. Nunca expor `.env` ou credenciais.
5. Migracoes, RLS, deploy, merge na main e mudancas destrutivas exigem revisao/aprovacao.
6. Testar apenas escopo pertinente; indicar claramente testes nao executados.

## Continuidade economica
Ao concluir, registrar em ate 6 linhas: projeto/branch; tarefa; feito; arquivos/commit; testes; proximo. Responder em ate 4 frases, salvo risco ou solicitacao de detalhes. Nao duplicar historico.
