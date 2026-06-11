create extension if not exists "pgcrypto";

create schema if not exists controle_upc;
create schema if not exists sim_staging;

create type controle_upc.origem_dado as enum (
  'sim_auto',
  'sim_parcial',
  'manual',
  'ajuste_controlado',
  'ocr_sugerido',
  'ocr_confirmado'
);

create type controle_upc.status_importacao as enum (
  'pendente',
  'processando',
  'concluido',
  'concluido_com_erros',
  'erro'
);

create type controle_upc.status_modelo as enum (
  'pendente',
  'em_revisao',
  'completo',
  'exportado'
);

create type controle_upc.status_job as enum (
  'pending',
  'processing',
  'done',
  'failed'
);

create type controle_upc.escopo_anexo as enum (
  'modelo',
  'secao',
  'campo',
  'responsavel'
);

create table controle_upc.municipio (
  id uuid primary key default gen_random_uuid(),
  codigo_municipio text not null unique,
  nome text not null,
  uf text not null default 'CE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table controle_upc.exercicio (
  id uuid primary key default gen_random_uuid(),
  ano integer not null unique check (ano between 2000 and 2100),
  created_at timestamptz not null default now()
);

create table controle_upc.unidade_gestora (
  id uuid primary key default gen_random_uuid(),
  municipio_id uuid not null references controle_upc.municipio(id),
  exercicio_id uuid not null references controle_upc.exercicio(id),
  codigo_ug text not null,
  nome_ug text not null,
  data_cadastro date,
  lei_criacao text,
  origem controle_upc.origem_dado not null default 'sim_auto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipio_id, exercicio_id, codigo_ug)
);

create table controle_upc.unidade_orcamentaria (
  id uuid primary key default gen_random_uuid(),
  municipio_id uuid not null references controle_upc.municipio(id),
  exercicio_id uuid not null references controle_upc.exercicio(id),
  codigo_orgao text not null,
  codigo_uo text not null,
  nome_uo text not null,
  tipo_unidade_administrativa text,
  origem controle_upc.origem_dado not null default 'sim_auto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipio_id, exercicio_id, codigo_orgao, codigo_uo)
);

create table controle_upc.upc (
  id uuid primary key default gen_random_uuid(),
  municipio_id uuid not null references controle_upc.municipio(id),
  exercicio_id uuid not null references controle_upc.exercicio(id),
  unidade_gestora_id uuid not null references controle_upc.unidade_gestora(id),
  nome text not null,
  natureza_juridica text,
  situacao text not null default 'ativa',
  origem controle_upc.origem_dado not null default 'sim_auto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipio_id, exercicio_id, unidade_gestora_id)
);

create table controle_upc.upc_unidade_orcamentaria (
  id uuid primary key default gen_random_uuid(),
  upc_id uuid not null references controle_upc.upc(id) on delete cascade,
  unidade_orcamentaria_id uuid not null references controle_upc.unidade_orcamentaria(id),
  data_inclusao date,
  data_exclusao date,
  origem controle_upc.origem_dado not null default 'sim_auto',
  unique (upc_id, unidade_orcamentaria_id)
);

create table controle_upc.gestao (
  id uuid primary key default gen_random_uuid(),
  upc_id uuid not null references controle_upc.upc(id) on delete cascade,
  cpf_gestor text not null,
  nome_gestor text not null,
  periodo_inicio date not null,
  periodo_fim date,
  tipo_prestacao text not null default 'anual',
  origem controle_upc.origem_dado not null default 'sim_auto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table controle_upc.prestacao_contas (
  id uuid primary key default gen_random_uuid(),
  upc_id uuid not null references controle_upc.upc(id) on delete cascade,
  gestao_id uuid references controle_upc.gestao(id),
  tipo text not null default 'anual',
  periodo_inicio date not null,
  periodo_fim date not null,
  status controle_upc.status_modelo not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table controle_upc.modelo_in (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  descricao text,
  fonte_normativa text not null default 'IN 01/2025',
  ordem integer not null,
  ativo boolean not null default true
);

create table controle_upc.campo_modelo (
    id uuid primary key default gen_random_uuid(),
    modelo_id uuid not null references controle_upc.modelo_in(id) on delete cascade,
    chave text not null,
    rotulo text not null,
  secao text,
  tipo_campo text not null default 'texto',
  editavel boolean not null default true,
  obrigatorio boolean not null default false,
  texto_oficial boolean not null default false,
    ordem integer not null default 0,
    unique (modelo_id, chave)
  );

create table controle_upc.campo_modelo_valor (
  id uuid primary key default gen_random_uuid(),
  prestacao_contas_id uuid not null references controle_upc.prestacao_contas(id) on delete cascade,
  campo_modelo_id uuid not null references controle_upc.campo_modelo(id) on delete cascade,
  valor_texto text,
  valor_data date,
  valor_numero numeric,
  valor_booleano boolean,
  valor_jsonb jsonb not null default '{}'::jsonb,
  origem controle_upc.origem_dado not null default 'manual',
  revisado boolean not null default false,
  observacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (prestacao_contas_id, campo_modelo_id)
);

create table controle_upc.status_modelo_upc (
  id uuid primary key default gen_random_uuid(),
  prestacao_contas_id uuid not null references controle_upc.prestacao_contas(id) on delete cascade,
  modelo_id uuid not null references controle_upc.modelo_in(id),
  status controle_upc.status_modelo not null default 'pendente',
  total_pendencias integer not null default 0,
  total_anexos integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (prestacao_contas_id, modelo_id)
);

create table controle_upc.importacao_lote (
  id uuid primary key default gen_random_uuid(),
  municipio_id uuid not null references controle_upc.municipio(id),
  exercicio_id uuid not null references controle_upc.exercicio(id),
  status controle_upc.status_importacao not null default 'pendente',
  storage_base_path text not null,
  uploaded_by uuid,
  total_arquivos integer not null default 0,
  total_registros integer not null default 0,
  total_erros integer not null default 0,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table controle_upc.importacao_arquivo (
  id uuid primary key default gen_random_uuid(),
  lote_id uuid not null references controle_upc.importacao_lote(id) on delete cascade,
  nome_original text not null,
  storage_path text not null,
  layout_codigo text,
  competencia text,
  status controle_upc.status_importacao not null default 'pendente',
  total_linhas integer not null default 0,
  total_registros_validos integer not null default 0,
  total_erros integer not null default 0,
  created_at timestamptz not null default now()
);

create table controle_upc.importacao_erro (
  id uuid primary key default gen_random_uuid(),
  arquivo_id uuid not null references controle_upc.importacao_arquivo(id) on delete cascade,
  linha integer,
  campo text,
  valor_recebido text,
  mensagem text not null,
  severidade text not null default 'erro',
  created_at timestamptz not null default now()
);

create table controle_upc.job_processamento (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  status controle_upc.status_job not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  resultado jsonb,
  erro text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create table controle_upc.anexo_arquivo (
  id uuid primary key default gen_random_uuid(),
  prestacao_contas_id uuid not null references controle_upc.prestacao_contas(id) on delete cascade,
  modelo_id uuid references controle_upc.modelo_in(id),
  campo_modelo_id uuid references controle_upc.campo_modelo(id),
  escopo controle_upc.escopo_anexo not null default 'modelo',
  referencia_id uuid,
  nome_original text not null,
  mime_type text,
  storage_path_original text not null,
  storage_path_pdf text,
  status text not null default 'enviado',
  uploaded_by uuid,
  created_at timestamptz not null default now()
);

create table controle_upc.funcao_rol (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  inciso text not null,
  alinea text not null,
  aplica_administracao_direta boolean not null default true,
  aplica_indireta boolean not null default true,
  exige_anexo boolean not null default false,
  ordem integer not null
);

create table controle_upc.rol_responsavel (
  id uuid primary key default gen_random_uuid(),
  prestacao_contas_id uuid not null references controle_upc.prestacao_contas(id) on delete cascade,
  unidade_orcamentaria_id uuid references controle_upc.unidade_orcamentaria(id),
  funcao_rol_id uuid not null references controle_upc.funcao_rol(id),
  cpf text,
  nome text,
  matricula text,
  cargo text,
  periodo_inicio date,
  periodo_fim date,
  ato_tipo text,
  ato_numero text,
  ato_data date,
  doe_numero text,
  doe_data date,
  origem controle_upc.origem_dado not null default 'manual',
  revisado boolean not null default false,
  observacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table controle_upc.auditoria_alteracao (
  id uuid primary key default gen_random_uuid(),
  entidade text not null,
  entidade_id uuid not null,
  campo text not null,
  valor_anterior text,
  valor_novo text,
  origem controle_upc.origem_dado not null,
  usuario_id uuid,
  created_at timestamptz not null default now()
);

-- Staging SIM: preserved source metadata plus key columns for the first MVP.
create table sim_staging.sim_101_gestores (
  id uuid primary key default gen_random_uuid(),
  importacao_arquivo_id uuid references controle_upc.importacao_arquivo(id),
  tipo_documento text not null,
  codigo_municipio text not null,
  exercicio_orcamento text not null,
  codigo_ug text not null,
  codigo_orgao text not null,
  codigo_uo text not null,
  cpf_gestor text not null,
  forma_ingresso text,
  tipo_relacao text,
  numero_expediente_nomeacao_posse text,
  data_inicio_gestao text,
  data_referencia_doc text,
  nome_gestor text,
  data_fim_gestao text,
  codigo_tipo_cargo text,
  raw_record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table sim_staging.sim_103_orgaos (
  id uuid primary key default gen_random_uuid(),
  importacao_arquivo_id uuid references controle_upc.importacao_arquivo(id),
  tipo_documento text not null,
  codigo_municipio text not null,
  exercicio_orcamento text not null,
  codigo_orgao text not null,
  nome_orgao text,
  data_referencia_doc text,
  raw_record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table sim_staging.sim_104_unidades_orcamentarias (
  id uuid primary key default gen_random_uuid(),
  importacao_arquivo_id uuid references controle_upc.importacao_arquivo(id),
  tipo_documento text not null,
  codigo_municipio text not null,
  exercicio_orcamento text not null,
  codigo_orgao text not null,
  codigo_uo text not null,
  tipo_unidade_administrativa text,
  nome_uo text,
  data_referencia_doc text,
  raw_record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table sim_staging.sim_108_unidades_gestoras (
  id uuid primary key default gen_random_uuid(),
  importacao_arquivo_id uuid references controle_upc.importacao_arquivo(id),
  tipo_documento text not null,
  codigo_municipio text not null,
  exercicio_orcamento text not null,
  codigo_ug text not null,
  codigo_orgao text not null,
  codigo_uo text not null,
  data_inclusao_uo text,
  data_referencia_doc text,
  nome_ug text,
  data_cadastro_ug text,
  lei_criacao_ug text,
  raw_record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table sim_staging.sim_109_ordenadores_despesa (
  id uuid primary key default gen_random_uuid(),
  importacao_arquivo_id uuid references controle_upc.importacao_arquivo(id),
  tipo_documento text not null,
  codigo_municipio text not null,
  exercicio_orcamento text not null,
  codigo_ug text not null,
  codigo_orgao text not null,
  codigo_uo text not null,
  data_inclusao_uo text,
  cpf_ordenador text not null,
  forma_ingresso text,
  tipo_relacao text,
  numero_expediente_nomeacao_posse text,
  data_inicio_designacao text,
  data_referencia_doc text,
  nome_ordenador text,
  data_fim_designacao text,
  codigo_tipo_cargo text,
  raw_record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table sim_staging.sim_503_tipos_responsaveis_contratacao (
  id uuid primary key default gen_random_uuid(),
  importacao_arquivo_id uuid references controle_upc.importacao_arquivo(id),
  tipo_documento text not null,
  codigo_municipio text not null,
  cpf_gestor_ug text not null,
  data_portaria_designacao text not null,
  sequencial_responsavel text not null,
  numero_portaria_designacao text,
  tipo_responsavel_contratacao text,
  data_extincao text,
  numero_portaria_extincao text,
  data_referencia_doc text,
  raw_record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table sim_staging.sim_504_responsaveis_contratacao (
  id uuid primary key default gen_random_uuid(),
  importacao_arquivo_id uuid references controle_upc.importacao_arquivo(id),
  tipo_documento text not null,
  codigo_municipio text not null,
  cpf_gestor_ug text not null,
  data_portaria_designacao text not null,
  sequencial_responsavel text not null,
  cpf_responsavel text not null,
  nome_responsavel text,
  endereco_responsavel text,
  telefone_responsavel text,
  funcao_responsavel text,
  data_nomeacao text,
  data_exoneracao text,
  data_referencia_doc text,
  raw_record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table sim_staging.sim_951_agentes_publicos (
  id uuid primary key default gen_random_uuid(),
  importacao_arquivo_id uuid references controle_upc.importacao_arquivo(id),
  tipo_documento text not null,
  codigo_municipio text not null,
  exercicio_orcamento text not null,
  codigo_orgao text not null,
  codigo_uo text not null,
  cpf_agente text not null,
  forma_ingresso text,
  tipo_relacao text,
  numero_expediente_nomeacao_posse text,
  tipo_expediente_nomeacao_posse text,
  data_expediente_nomeacao_posse text,
  data_publicacao_expediente text,
  data_posse text,
  matricula text,
  situacao_funcional text,
  regime_juridico text,
  codigo_ocupacao text,
  codigo_tipo_cargo_funcao text,
  carga_horaria_semanal text,
  nome_agente text,
  endereco text,
  telefone text,
  nomenclatura_cargo text,
  data_referencia_doc text,
  raw_record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table sim_staging.sim_952_desligamentos (
  id uuid primary key default gen_random_uuid(),
  importacao_arquivo_id uuid references controle_upc.importacao_arquivo(id),
  tipo_documento text not null,
  codigo_municipio text not null,
  exercicio_orcamento text not null,
  codigo_orgao text not null,
  codigo_uo text not null,
  cpf_agente text not null,
  forma_ingresso text,
  tipo_relacao text,
  numero_expediente_nomeacao_posse text,
  numero_expediente_desligamento text,
  tipo_desligamento text,
  tipo_expediente_desligamento text,
  data_expediente_desligamento text,
  data_publicacao_desligamento text,
  cpf_pensionista text,
  nome_pensionista text,
  endereco_pensionista text,
  telefone_pensionista text,
  data_referencia_doc text,
  raw_record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table sim_staging.sim_953_reingressos (
    id uuid primary key default gen_random_uuid(),
    importacao_arquivo_id uuid references controle_upc.importacao_arquivo(id),
    tipo_documento text not null,
    codigo_municipio text not null,
  exercicio_orcamento text not null,
  codigo_orgao text not null,
  codigo_uo text not null,
  cpf_agente text not null,
  forma_ingresso text,
  tipo_relacao text,
  numero_expediente_nomeacao_posse text,
  numero_expediente_desligamento text,
  numero_expediente_reingresso text,
  tipo_reingresso text,
  tipo_expediente_reingresso text,
  data_expediente_reingresso text,
  data_publicacao_reingresso text,
  tipo_amparo_legal text,
  numero_amparo_legal text,
  data_amparo_legal text,
  data_publicacao_amparo_legal text,
  data_referencia_doc text,
    raw_record jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
  );

create table sim_staging.sim_raw_registros (
  id uuid primary key default gen_random_uuid(),
  importacao_arquivo_id uuid not null references controle_upc.importacao_arquivo(id) on delete cascade,
  layout_codigo text,
  competencia text,
  linha integer,
  conteudo_original text,
  dados jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_importacao_lote_municipio_exercicio
  on controle_upc.importacao_lote (municipio_id, exercicio_id, created_at desc);

create index idx_importacao_arquivo_layout_competencia
  on controle_upc.importacao_arquivo (layout_codigo, competencia);

create index idx_sim_raw_registros_importacao_arquivo
  on sim_staging.sim_raw_registros (importacao_arquivo_id);

insert into storage.buckets (id, name, public)
values ('sim-imports', 'sim-imports', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('anexos-upc', 'anexos-upc', false)
on conflict (id) do nothing;

create or replace view controle_upc.v_importacao_lote_resumo as
select
  l.id,
  m.codigo_municipio,
  m.nome as municipio_nome,
  e.ano as exercicio,
  l.status,
  l.total_arquivos,
  l.total_erros,
  l.storage_base_path,
  l.created_at
from controle_upc.importacao_lote l
join controle_upc.municipio m on m.id = l.municipio_id
join controle_upc.exercicio e on e.id = l.exercicio_id;

create index idx_rol_responsavel_prestacao
  on controle_upc.rol_responsavel (prestacao_contas_id, funcao_rol_id);

create index idx_sim_101_lookup
  on sim_staging.sim_101_gestores (codigo_municipio, exercicio_orcamento, codigo_ug, cpf_gestor);

create index idx_sim_108_lookup
  on sim_staging.sim_108_unidades_gestoras (codigo_municipio, exercicio_orcamento, codigo_ug);

create index idx_sim_109_lookup
  on sim_staging.sim_109_ordenadores_despesa (codigo_municipio, exercicio_orcamento, codigo_ug, codigo_orgao, codigo_uo);

create index idx_sim_951_lookup
  on sim_staging.sim_951_agentes_publicos (codigo_municipio, exercicio_orcamento, cpf_agente);

insert into controle_upc.modelo_in (codigo, nome, descricao, ordem)
values
  ('modelo_01', 'Rol de Responsaveis', 'Dados resumidos dos responsaveis conforme art. 18 da IN 01/2025.', 1)
on conflict (codigo) do nothing;

insert into controle_upc.campo_modelo (
  modelo_id,
  chave,
  rotulo,
  secao,
  tipo_campo,
  editavel,
  obrigatorio,
  texto_oficial,
  ordem
)
select
  m.id,
  campo.chave,
  campo.rotulo,
  campo.secao,
  campo.tipo_campo,
  campo.editavel,
  campo.obrigatorio,
  campo.texto_oficial,
  campo.ordem
from controle_upc.modelo_in m
cross join (
  values
    ('codigo_municipio', 'Codigo do municipio', 'Identificacao', 'texto', false, true, true, 1),
    ('nome_municipio', 'Nome do municipio', 'Identificacao', 'texto', false, true, true, 2),
    ('exercicio', 'Exercicio', 'Identificacao', 'texto', false, true, true, 3),
    ('nome_upc', 'Nome da UPC', 'Identificacao', 'texto', false, true, true, 4),
    ('gestor_nome', 'Nome do gestor da pasta', 'Gestao', 'texto', true, true, false, 5),
    ('gestor_cpf', 'CPF do gestor da pasta', 'Gestao', 'texto', true, true, false, 6),
    ('periodo_inicio', 'Inicio do periodo', 'Gestao', 'data', true, true, false, 7),
    ('periodo_fim', 'Fim do periodo', 'Gestao', 'data', true, false, false, 8),
    ('observacao', 'Observacao', 'Complemento', 'texto_longo', true, false, false, 9)
) as campo(chave, rotulo, secao, tipo_campo, editavel, obrigatorio, texto_oficial, ordem)
where m.codigo = 'modelo_01'
on conflict (modelo_id, chave) do nothing;

insert into controle_upc.funcao_rol (
  codigo,
  nome,
  inciso,
  alinea,
  aplica_administracao_direta,
  aplica_indireta,
  exige_anexo,
  ordem
)
values
  ('dirigente_maximo', 'Dirigente maximo da unidade ou representante legal', 'I', 'a', true, true, true, 1),
  ('ordenador_despesa', 'Ordenador de despesas', 'I', 'b', true, true, true, 2),
  ('setor_financeiro', 'Responsavel pelo setor financeiro', 'I', 'c', true, true, false, 3),
  ('almoxarifado', 'Responsavel pelo setor de almoxarifado', 'I', 'd', true, true, false, 4),
  ('patrimonio', 'Responsavel pelo setor de patrimonio', 'I', 'e', true, true, false, 5),
  ('contador', 'Contador responsavel', 'I', 'f', true, true, true, 6),
  ('licitacoes', 'Responsaveis pelas licitacoes', 'I', 'g', true, true, true, 7),
  ('pessoal', 'Responsavel pelo setor de pessoal', 'I', 'h', true, true, false, 8),
  ('controle_interno', 'Responsavel pelo controle interno', 'I', 'i', true, true, false, 9),
  ('planejamento', 'Responsavel pelo setor de planejamento', 'I', 'j', true, true, false, 10),
  ('juridico', 'Responsavel pelo setor juridico', 'I', 'k', true, true, false, 11),
  ('gestao_contratos', 'Responsavel pelo setor de gestao de contratos', 'I', 'l', true, true, false, 12),
  ('diretoria', 'Membros da Diretoria', 'II', 'a', false, true, false, 13),
  ('conselho_administracao', 'Membros do Conselho de Administracao', 'II', 'b', false, true, false, 14),
  ('conselho_deliberativo_curador', 'Membros do Conselho Deliberativo ou Curador', 'II', 'c', false, true, false, 15),
  ('conselho_fiscal', 'Membros do Conselho Fiscal', 'II', 'd', false, true, false, 16),
  ('conselho_consultivo', 'Membros do Conselho Consultivo', 'II', 'e', false, true, false, 17),
  ('comite_auditoria_estatutario', 'Membros do Comite de Auditoria Estatutario', 'II', 'f', false, true, false, 18)
on conflict (codigo) do nothing;
