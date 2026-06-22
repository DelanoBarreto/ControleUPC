create index if not exists idx_anexo_arquivo_prestacao_contas_id
  on controle_upc.anexo_arquivo (prestacao_contas_id);

create index if not exists idx_anexo_arquivo_modelo_id
  on controle_upc.anexo_arquivo (modelo_id);

create index if not exists idx_anexo_arquivo_campo_modelo_id
  on controle_upc.anexo_arquivo (campo_modelo_id);

create index if not exists idx_anexo_arquivo_template_id
  on controle_upc.anexo_arquivo (template_id);

create index if not exists idx_anexo_arquivo_template_campo_id
  on controle_upc.anexo_arquivo (template_campo_id);

create index if not exists idx_campo_modelo_valor_campo_modelo_id
  on controle_upc.campo_modelo_valor (campo_modelo_id);

create index if not exists idx_gestao_upc_id
  on controle_upc.gestao (upc_id);

create index if not exists idx_importacao_arquivo_lote_id
  on controle_upc.importacao_arquivo (lote_id);

create index if not exists idx_importacao_erro_arquivo_id
  on controle_upc.importacao_erro (arquivo_id);

create index if not exists idx_importacao_lote_exercicio_id
  on controle_upc.importacao_lote (exercicio_id);

create index if not exists idx_modelo_template_modelo_id
  on controle_upc.modelo_template (modelo_id);

create index if not exists idx_modelo_template_campo_secao_id
  on controle_upc.modelo_template_campo (secao_id);

create index if not exists idx_modelo_template_campo_quadro_id
  on controle_upc.modelo_template_campo (quadro_id);

create index if not exists idx_modelo_template_campo_campo_modelo_id
  on controle_upc.modelo_template_campo (campo_modelo_id);

create index if not exists idx_modelo_template_campo_origem_sim_template_campo_id
  on controle_upc.modelo_template_campo_origem_sim (template_campo_id);

create index if not exists idx_modelo_template_quadro_secao_id
  on controle_upc.modelo_template_quadro (secao_id);

create index if not exists idx_modelo_template_valor_template_campo_id
  on controle_upc.modelo_template_valor (template_campo_id);

create index if not exists idx_prestacao_contas_upc_id
  on controle_upc.prestacao_contas (upc_id);

create index if not exists idx_prestacao_contas_gestao_id
  on controle_upc.prestacao_contas (gestao_id);

create index if not exists idx_prestacao_contas_versao_normativa_id
  on controle_upc.prestacao_contas (versao_normativa_id);

create index if not exists idx_rol_responsavel_unidade_orcamentaria_id
  on controle_upc.rol_responsavel (unidade_orcamentaria_id);

create index if not exists idx_rol_responsavel_funcao_rol_id
  on controle_upc.rol_responsavel (funcao_rol_id);

create index if not exists idx_status_modelo_upc_modelo_id
  on controle_upc.status_modelo_upc (modelo_id);

create index if not exists idx_status_modelo_upc_template_id
  on controle_upc.status_modelo_upc (template_id);

create index if not exists idx_unidade_gestora_exercicio_id
  on controle_upc.unidade_gestora (exercicio_id);

create index if not exists idx_unidade_orcamentaria_exercicio_id
  on controle_upc.unidade_orcamentaria (exercicio_id);

create index if not exists idx_upc_exercicio_id
  on controle_upc.upc (exercicio_id);

create index if not exists idx_upc_unidade_gestora_id
  on controle_upc.upc (unidade_gestora_id);

create index if not exists idx_upc_unidade_orcamentaria_unidade_orcamentaria_id
  on controle_upc.upc_unidade_orcamentaria (unidade_orcamentaria_id);

create index if not exists idx_sim_101_gestores_importacao_arquivo_id
  on sim_staging.sim_101_gestores (importacao_arquivo_id);

create index if not exists idx_sim_103_orgaos_importacao_arquivo_id
  on sim_staging.sim_103_orgaos (importacao_arquivo_id);

create index if not exists idx_sim_104_unidades_orcamentarias_importacao_arquivo_id
  on sim_staging.sim_104_unidades_orcamentarias (importacao_arquivo_id);

create index if not exists idx_sim_108_unidades_gestoras_importacao_arquivo_id
  on sim_staging.sim_108_unidades_gestoras (importacao_arquivo_id);

create index if not exists idx_sim_109_ordenadores_despesa_importacao_arquivo_id
  on sim_staging.sim_109_ordenadores_despesa (importacao_arquivo_id);

create index if not exists idx_sim_503_tipos_responsaveis_contratacao_importacao_arquivo_id
  on sim_staging.sim_503_tipos_responsaveis_contratacao (importacao_arquivo_id);

create index if not exists idx_sim_504_responsaveis_contratacao_importacao_arquivo_id
  on sim_staging.sim_504_responsaveis_contratacao (importacao_arquivo_id);

create index if not exists idx_sim_951_agentes_publicos_importacao_arquivo_id
  on sim_staging.sim_951_agentes_publicos (importacao_arquivo_id);

create index if not exists idx_sim_952_desligamentos_importacao_arquivo_id
  on sim_staging.sim_952_desligamentos (importacao_arquivo_id);

create index if not exists idx_sim_953_reingressos_importacao_arquivo_id
  on sim_staging.sim_953_reingressos (importacao_arquivo_id);
