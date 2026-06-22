# Supabase

Esta pasta guardara migrations, seeds, policies e configuracoes do Supabase.

Projeto remoto:

- Nome: `ControleUPC`
- Project ref: `doqkxfqpwqiwkclxauwh`
- URL: `https://doqkxfqpwqiwkclxauwh.supabase.co`

Camadas previstas:

- `sim_staging`: tabelas espelho dos CSVs do SIM usados como fonte auxiliar.
- `sim_staging.sim_raw_registros`: camada bruta para preservar cada linha importada antes do mapeamento fino.
- `controle_upc`: tabelas proprias da prestacao de contas conforme a IN 01/2025.
- `controle_upc.versao_normativa`: versoes da IN/Portarias usadas para versionar os modelos.
- `controle_upc.modelo_template*`: estrutura configuravel dos Modelos da IN, sem hardcode no frontend.
- `controle_upc.job_processamento`: fila de processamento do worker.
- `controle_upc.campo_modelo_valor`: valores editaveis e auditaveis por campo do modelo.
- `controle_upc.modelo_template_valor`: valores por campo versionado do template regulatorio.
- `storage`: buckets para anexos, PDFs gerados e arquivos importados.
- `jobs`: fila de processamento para importacao, OCR, conversao e exportacao.

Migration inicial:

- `migrations/20260611000100_initial_controle_upc.sql`
- `migrations/20260620000100_modelos_in_templates_versionados.sql`
- `migrations/20260621000200_fk_indexes.sql`

Regra de modelagem:

- A IN 01/2025 atualizada por Portaria define os modelos oficiais.
- Cada alteracao futura do TCE deve gerar nova versao em `versao_normativa` e novos registros em `modelo_template*`.
- O frontend deve renderizar os modelos a partir dessas tabelas, bloqueando textos oficiais e permitindo somente edicao controlada de valores/campos manuais.

Status remoto:

- Migration inicial aplicada.
- Migration de templates versionados aplicada.
- Migration de indices de chaves estrangeiras aplicada.
- Modelo 01 validado com 3 secoes, 3 quadros e 9 campos.
- RLS ainda precisa de politica definitiva por tenant/usuario antes de producao.

Storage de importacao:

- criar o bucket privado `sim-imports`;
- salvar os arquivos originais em `sim-imports/{codigo_municipio}/{exercicio}/{lote_id}/original/{nome_arquivo}`;
- manter os originais para auditoria e reprocessamento.
