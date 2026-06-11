# Supabase

Esta pasta guardara migrations, seeds, policies e configuracoes do Supabase.

Camadas previstas:

- `sim_staging`: tabelas espelho dos CSVs do SIM usados como fonte auxiliar.
- `sim_staging.sim_raw_registros`: camada bruta para preservar cada linha importada antes do mapeamento fino.
- `controle_upc`: tabelas proprias da prestacao de contas conforme a IN 01/2025.
- `controle_upc.job_processamento`: fila de processamento do worker.
- `controle_upc.campo_modelo_valor`: valores editaveis e auditaveis por campo do modelo.
- `storage`: buckets para anexos, PDFs gerados e arquivos importados.
- `jobs`: fila de processamento para importacao, OCR, conversao e exportacao.

Migration inicial:

- `migrations/20260611000100_initial_controle_upc.sql`

Storage de importacao:

- criar o bucket privado `sim-imports`;
- salvar os arquivos originais em `sim-imports/{codigo_municipio}/{exercicio}/{lote_id}/original/{nome_arquivo}`;
- manter os originais para auditoria e reprocessamento.
