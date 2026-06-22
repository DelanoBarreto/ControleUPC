create table if not exists controle_upc.versao_normativa (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  instrumento text not null,
  fonte text not null default 'TCE-CE',
  data_publicacao date,
  vigencia_inicio date,
  vigencia_fim date,
  status text not null default 'vigente' check (status in ('rascunho', 'vigente', 'revogada')),
  observacao text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists controle_upc.modelo_template (
  id uuid primary key default gen_random_uuid(),
  versao_normativa_id uuid not null references controle_upc.versao_normativa(id) on delete restrict,
  modelo_id uuid references controle_upc.modelo_in(id) on delete set null,
  codigo text not null,
  nome text not null,
  anexo text,
  descricao text,
  tipo_prestacao text not null default 'anual',
  schema_version integer not null default 1,
  ativo boolean not null default true,
  aplicabilidade jsonb not null default '{}'::jsonb,
  regras_jsonb jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (versao_normativa_id, codigo, schema_version)
);

create table if not exists controle_upc.modelo_template_secao (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references controle_upc.modelo_template(id) on delete cascade,
  chave text not null,
  titulo text not null,
  descricao text,
  ordem integer not null default 0,
  regras_jsonb jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (template_id, chave)
);

create table if not exists controle_upc.modelo_template_quadro (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references controle_upc.modelo_template(id) on delete cascade,
  secao_id uuid references controle_upc.modelo_template_secao(id) on delete cascade,
  chave text not null,
  titulo text not null,
  tipo_quadro text not null default 'formulario' check (tipo_quadro in ('formulario', 'matriz', 'texto', 'anexo')),
  descricao text,
  ordem integer not null default 0,
  schema_matriz jsonb not null default '{}'::jsonb,
  regras_jsonb jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (template_id, chave)
);

create table if not exists controle_upc.modelo_template_campo (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references controle_upc.modelo_template(id) on delete cascade,
  secao_id uuid references controle_upc.modelo_template_secao(id) on delete cascade,
  quadro_id uuid references controle_upc.modelo_template_quadro(id) on delete cascade,
  campo_modelo_id uuid references controle_upc.campo_modelo(id) on delete set null,
  chave text not null,
  rotulo text not null,
  tipo_campo text not null default 'texto',
  classificacao_preenchimento text not null default 'manual_estruturado' check (
    classificacao_preenchimento in (
      'automatico',
      'hibrido',
      'manual_estruturado',
      'manual_narrativo',
      'documento_externo',
      'declaracao_inexistencia'
    )
  ),
  origem_default controle_upc.origem_dado not null default 'manual',
  editavel boolean not null default true,
  obrigatorio boolean not null default false,
  texto_oficial boolean not null default false,
  permite_anexo boolean not null default false,
  ordem integer not null default 0,
  schema_matriz jsonb not null default '{}'::jsonb,
  fonte_sim_jsonb jsonb not null default '{}'::jsonb,
  validacoes_jsonb jsonb not null default '{}'::jsonb,
  ui_jsonb jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (template_id, chave)
);

create table if not exists controle_upc.modelo_template_valor (
  id uuid primary key default gen_random_uuid(),
  prestacao_contas_id uuid not null references controle_upc.prestacao_contas(id) on delete cascade,
  template_campo_id uuid not null references controle_upc.modelo_template_campo(id) on delete cascade,
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
  unique (prestacao_contas_id, template_campo_id)
);

create table if not exists controle_upc.modelo_template_campo_origem_sim (
  id uuid primary key default gen_random_uuid(),
  template_campo_id uuid not null references controle_upc.modelo_template_campo(id) on delete cascade,
  layout_codigo text not null,
  campo_origem text,
  regra_jsonb jsonb not null default '{}'::jsonb,
  prioridade integer not null default 0,
  created_at timestamptz not null default now()
);

alter table controle_upc.prestacao_contas
  add column if not exists versao_normativa_id uuid references controle_upc.versao_normativa(id);

alter table controle_upc.status_modelo_upc
  add column if not exists template_id uuid references controle_upc.modelo_template(id);

alter table controle_upc.anexo_arquivo
  add column if not exists template_id uuid references controle_upc.modelo_template(id),
  add column if not exists template_campo_id uuid references controle_upc.modelo_template_campo(id);

create index if not exists idx_modelo_template_versao_codigo
  on controle_upc.modelo_template (versao_normativa_id, codigo);

create index if not exists idx_template_secao_template_ordem
  on controle_upc.modelo_template_secao (template_id, ordem);

create index if not exists idx_template_quadro_template_ordem
  on controle_upc.modelo_template_quadro (template_id, ordem);

create index if not exists idx_template_campo_template_ordem
  on controle_upc.modelo_template_campo (template_id, ordem);

create index if not exists idx_template_valor_prestacao
  on controle_upc.modelo_template_valor (prestacao_contas_id);

create index if not exists idx_template_campo_origem_sim_layout
  on controle_upc.modelo_template_campo_origem_sim (layout_codigo, prioridade);

insert into controle_upc.versao_normativa (
  codigo,
  nome,
  instrumento,
  data_publicacao,
  status,
  observacao,
  metadata
)
values (
  'in_01_2025_portaria_51_2026',
  'IN 01/2025 atualizada pela Portaria 51/2026',
  'IN TCE-CE 01/2025 + Portaria 51/2026',
  '2026-01-29',
  'vigente',
  'Versao normativa usada como base inicial dos templates do Controle UPC.',
  '{"fonte":"Doc/IN 01 2025 - atualizada pela Portaria 51 2026.pdf"}'::jsonb
)
on conflict (codigo) do nothing;

insert into controle_upc.modelo_template (
  versao_normativa_id,
  modelo_id,
  codigo,
  nome,
  anexo,
  descricao,
  tipo_prestacao,
  schema_version,
  aplicabilidade,
  regras_jsonb
)
select
  vn.id,
  mi.id,
  'modelo_01',
  'Modelo 01 - Rol de Responsaveis',
  'Anexo I',
  'Rol de responsaveis e periodos de gestao conforme a IN 01/2025 atualizada pela Portaria 51/2026.',
  'anual',
  1,
  '{"upc_tipo":["administracao_direta","autarquia","fundacao_publica_direito_publico"]}'::jsonb,
  '{"texto_oficial_bloqueado":true,"permite_anexos":true}'::jsonb
from controle_upc.versao_normativa vn
left join controle_upc.modelo_in mi on mi.codigo = 'modelo_01'
where vn.codigo = 'in_01_2025_portaria_51_2026'
on conflict (versao_normativa_id, codigo, schema_version) do nothing;

insert into controle_upc.modelo_template_secao (template_id, chave, titulo, ordem)
select mt.id, secao.chave, secao.titulo, secao.ordem
from controle_upc.modelo_template mt
join controle_upc.versao_normativa vn on vn.id = mt.versao_normativa_id
cross join (
  values
    ('identificacao', 'Identificacao da Prestacao', 1),
    ('gestao', 'Gestao e Responsaveis', 2),
    ('complemento', 'Complemento e Observacoes', 3)
) as secao(chave, titulo, ordem)
where vn.codigo = 'in_01_2025_portaria_51_2026'
  and mt.codigo = 'modelo_01'
on conflict (template_id, chave) do nothing;

insert into controle_upc.modelo_template_quadro (
  template_id,
  secao_id,
  chave,
  titulo,
  tipo_quadro,
  ordem,
  regras_jsonb
)
select
  mt.id,
  s.id,
  quadro.chave,
  quadro.titulo,
  quadro.tipo_quadro,
  quadro.ordem,
  quadro.regras_jsonb
from controle_upc.modelo_template mt
join controle_upc.versao_normativa vn on vn.id = mt.versao_normativa_id
join controle_upc.modelo_template_secao s on s.template_id = mt.id
join (
  values
    ('identificacao', 'dados_prestacao', 'Dados da Prestacao', 'formulario', 1, '{}'::jsonb),
    ('gestao', 'rol_responsaveis', 'Rol de Responsaveis', 'matriz', 1, '{"grid":"ag_grid"}'::jsonb),
    ('complemento', 'observacoes', 'Observacoes', 'texto', 1, '{}'::jsonb)
) as quadro(secao_chave, chave, titulo, tipo_quadro, ordem, regras_jsonb) on quadro.secao_chave = s.chave
where vn.codigo = 'in_01_2025_portaria_51_2026'
  and mt.codigo = 'modelo_01'
on conflict (template_id, chave) do nothing;

insert into controle_upc.modelo_template_campo (
  template_id,
  secao_id,
  quadro_id,
  campo_modelo_id,
  chave,
  rotulo,
  tipo_campo,
  classificacao_preenchimento,
  origem_default,
  editavel,
  obrigatorio,
  texto_oficial,
  permite_anexo,
  ordem,
  fonte_sim_jsonb,
  validacoes_jsonb,
  ui_jsonb
)
select
  mt.id,
  s.id,
  q.id,
  cm.id,
  campo.chave,
  campo.rotulo,
  campo.tipo_campo,
  campo.classificacao_preenchimento,
  campo.origem_default::controle_upc.origem_dado,
  campo.editavel,
  campo.obrigatorio,
  campo.texto_oficial,
  campo.permite_anexo,
  campo.ordem,
  campo.fonte_sim_jsonb,
  campo.validacoes_jsonb,
  campo.ui_jsonb
from controle_upc.modelo_template mt
join controle_upc.versao_normativa vn on vn.id = mt.versao_normativa_id
join (
  values
    ('identificacao', 'dados_prestacao', 'codigo_municipio', 'Codigo do municipio', 'texto', 'automatico', 'sim_auto', false, true, true, false, 1, '{"layouts":["101","103","108"],"campo":"codigo_municipio"}'::jsonb, '{}'::jsonb, '{"readonly":true}'::jsonb),
    ('identificacao', 'dados_prestacao', 'nome_municipio', 'Nome do municipio', 'texto', 'automatico', 'sim_auto', false, true, true, false, 2, '{"layouts":["103"],"campo":"nome_municipio"}'::jsonb, '{}'::jsonb, '{"readonly":true}'::jsonb),
    ('identificacao', 'dados_prestacao', 'exercicio', 'Exercicio', 'texto', 'automatico', 'sim_auto', false, true, true, false, 3, '{"origem":"prestacao_contas.exercicio"}'::jsonb, '{}'::jsonb, '{"readonly":true}'::jsonb),
    ('identificacao', 'dados_prestacao', 'nome_upc', 'Nome da UPC', 'texto', 'automatico', 'sim_auto', false, true, true, false, 4, '{"layouts":["108"],"campo":"nome_ug"}'::jsonb, '{}'::jsonb, '{"readonly":true}'::jsonb),
    ('gestao', 'rol_responsaveis', 'gestor_nome', 'Nome do gestor da pasta', 'texto', 'hibrido', 'sim_parcial', true, true, false, true, 5, '{"layouts":["101"],"campo":"nome_gestor","prioridade":1}'::jsonb, '{}'::jsonb, '{"grid_column":true}'::jsonb),
    ('gestao', 'rol_responsaveis', 'gestor_cpf', 'CPF do gestor da pasta', 'texto', 'hibrido', 'sim_parcial', true, true, false, true, 6, '{"layouts":["101"],"campo":"cpf_gestor","prioridade":1}'::jsonb, '{"cpf":true,"length":11}'::jsonb, '{"grid_column":true}'::jsonb),
    ('gestao', 'rol_responsaveis', 'periodo_inicio', 'Inicio do periodo', 'data', 'hibrido', 'sim_parcial', true, true, false, false, 7, '{"layouts":["101"],"campo":"data_inicio_gestao"}'::jsonb, '{}'::jsonb, '{"grid_column":true}'::jsonb),
    ('gestao', 'rol_responsaveis', 'periodo_fim', 'Fim do periodo', 'data', 'hibrido', 'sim_parcial', true, false, false, false, 8, '{"layouts":["101"],"campo":"data_fim_gestao"}'::jsonb, '{}'::jsonb, '{"grid_column":true}'::jsonb),
    ('complemento', 'observacoes', 'observacao', 'Observacao', 'texto_longo', 'manual_narrativo', 'manual', true, false, false, true, 9, '{}'::jsonb, '{}'::jsonb, '{"textarea":true}'::jsonb)
) as campo(
  secao_chave,
  quadro_chave,
  chave,
  rotulo,
  tipo_campo,
  classificacao_preenchimento,
  origem_default,
  editavel,
  obrigatorio,
  texto_oficial,
  permite_anexo,
  ordem,
  fonte_sim_jsonb,
  validacoes_jsonb,
  ui_jsonb
) on true
join controle_upc.modelo_template_secao s on s.template_id = mt.id and s.chave = campo.secao_chave
join controle_upc.modelo_template_quadro q on q.template_id = mt.id and q.chave = campo.quadro_chave
left join controle_upc.modelo_in mi on mi.codigo = mt.codigo
left join controle_upc.campo_modelo cm on cm.modelo_id = mi.id and cm.chave = campo.chave
where vn.codigo = 'in_01_2025_portaria_51_2026'
  and mt.codigo = 'modelo_01'
on conflict (template_id, chave) do nothing;

insert into controle_upc.modelo_template_campo_origem_sim (
  template_campo_id,
  layout_codigo,
  campo_origem,
  regra_jsonb,
  prioridade
)
select
  c.id,
  origem.layout_codigo,
  origem.campo_origem,
  origem.regra_jsonb,
  origem.prioridade
from controle_upc.modelo_template_campo c
join controle_upc.modelo_template mt on mt.id = c.template_id
join controle_upc.versao_normativa vn on vn.id = mt.versao_normativa_id
join (
  values
    ('gestor_nome', '101', 'nome_gestor', '{"uso":"dirigente_maximo"}'::jsonb, 1),
    ('gestor_cpf', '101', 'cpf_gestor', '{"uso":"dirigente_maximo"}'::jsonb, 1),
    ('periodo_inicio', '101', 'data_inicio_gestao', '{"uso":"periodo_gestao"}'::jsonb, 1),
    ('periodo_fim', '101', 'data_fim_gestao', '{"uso":"periodo_gestao"}'::jsonb, 1),
    ('gestor_nome', '109', 'nome_ordenador', '{"uso":"ordenador_despesa"}'::jsonb, 2),
    ('gestor_cpf', '109', 'cpf_ordenador', '{"uso":"ordenador_despesa"}'::jsonb, 2),
    ('gestor_nome', '951', 'nome_agente', '{"uso":"consulta_pessoa"}'::jsonb, 3),
    ('gestor_cpf', '951', 'cpf_agente', '{"uso":"consulta_pessoa"}'::jsonb, 3)
) as origem(chave, layout_codigo, campo_origem, regra_jsonb, prioridade) on origem.chave = c.chave
where vn.codigo = 'in_01_2025_portaria_51_2026'
  and mt.codigo = 'modelo_01'
  and not exists (
    select 1
    from controle_upc.modelo_template_campo_origem_sim atual
    where atual.template_campo_id = c.id
      and atual.layout_codigo = origem.layout_codigo
      and coalesce(atual.campo_origem, '') = coalesce(origem.campo_origem, '')
  );
