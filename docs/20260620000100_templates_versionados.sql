-- Migration: templates versionados da IN (ADR-001)
-- Evolui modelo_in / campo_modelo / campo_modelo_valor (criados em 20260611000100_initial_controle_upc.sql)
-- para suportar: versão normativa, seções, quadros (campo único / tabela repetível / texto livre),
-- classificação de origem do dado e mapeamento ao SIM.
--
-- ATENÇÃO: os nomes de coluna/constraint abaixo seguem o que está descrito nos documentos do projeto.
-- Confirmar contra o schema real antes de aplicar (ex.: se já existir enum de status/origem,
-- usar o enum existente em vez do "check constraint" abaixo, para manter consistência).

begin;

-- 1. Versão normativa: a IN em si + cada Portaria que a altera (Art. 31 da IN 01/2025)
create table if not exists controle_upc.versao_normativa (
  id uuid primary key default gen_random_uuid(),
  norma text not null,                 -- ex.: 'IN TCE-CE 01/2025'
  ato_alteracao text,                  -- ex.: 'Portaria 51/2026'
  vigente_desde date not null,
  vigente_ate date,                    -- null = vigente
  observacoes text,
  created_at timestamptz not null default now()
);

comment on table controle_upc.versao_normativa is
  'Cada linha é um "estado" da norma. Permite que prestações de contas de exercícios diferentes
   apontem para versões diferentes do mesmo modelo, sem perder histórico quando o TCE publicar
   uma nova Portaria alterando Anexos/Modelos.';

-- 2. Evoluir modelo_in: vincular à versão normativa, ao Anexo e à natureza jurídica aplicável
alter table controle_upc.modelo_in
  add column if not exists versao_normativa_id uuid references controle_upc.versao_normativa(id),
  add column if not exists anexo text,                          -- 'I', 'II', 'III', 'IV', 'V', 'VI'
  add column if not exists categoria_anexo_ii text,               -- null | LEGISLATIVO | EDUCACAO | SAUDE | DEMAIS_FUNDOS | AUTARQUIA_FUNDACAO | CONTROLADORIA
  add column if not exists natureza_juridica_aplicavel text[],    -- quais naturezas de UPC usam este modelo
  add column if not exists ordem_exibicao int;

create index if not exists idx_modelo_in_versao_normativa
  on controle_upc.modelo_in (versao_normativa_id);

-- 3. Seção dentro do modelo (ex.: "Identificação da Unidade", "Quadro 02 — Projetos/Atividades")
create table if not exists controle_upc.secao_modelo (
  id uuid primary key default gen_random_uuid(),
  modelo_in_id uuid not null references controle_upc.modelo_in(id) on delete cascade,
  codigo text not null,
  titulo text not null,
  ordem int not null,
  created_at timestamptz not null default now(),
  unique (modelo_in_id, codigo)
);

create index if not exists idx_secao_modelo_modelo_in
  on controle_upc.secao_modelo (modelo_in_id);

-- 4. Quadro dentro da seção — campo único, tabela repetível ou texto livre
create table if not exists controle_upc.quadro_modelo (
  id uuid primary key default gen_random_uuid(),
  secao_modelo_id uuid not null references controle_upc.secao_modelo(id) on delete cascade,
  codigo text not null,
  titulo text not null,
  tipo_quadro text not null check (tipo_quadro in ('campo_unico', 'tabela_repetivel', 'texto_livre')),
  ordem int not null,
  created_at timestamptz not null default now(),
  unique (secao_modelo_id, codigo)
);

create index if not exists idx_quadro_modelo_secao
  on controle_upc.quadro_modelo (secao_modelo_id);

-- 5. Evoluir campo_modelo: vincular ao quadro, classificar origem e mapear ao SIM
alter table controle_upc.campo_modelo
  add column if not exists quadro_modelo_id uuid references controle_upc.quadro_modelo(id),
  add column if not exists tipo_dado text not null default 'texto'
    check (tipo_dado in ('texto', 'numero', 'data', 'moeda', 'booleano', 'selecao')),
  add column if not exists origem_padrao text not null default 'manual'
    check (origem_padrao in (
      'sim_auto', 'sim_parcial', 'manual', 'ajuste_controlado',
      'ocr_sugerido', 'ocr_confirmado', 'documento_externo', 'declaracao_inexistencia'
    )),
  add column if not exists tabela_sim_referencia text,    -- ex.: '101', '305', '980'
  add column if not exists campo_sim_referencia text,     -- nome/índice do campo na tabela SIM
  add column if not exists obrigatorio boolean not null default true,
  add column if not exists permite_declaracao_inexistencia boolean not null default false,
  add column if not exists ordem int;

create index if not exists idx_campo_modelo_quadro
  on controle_upc.campo_modelo (quadro_modelo_id);

-- 6. Linha de um quadro repetível (ex.: cada adiantamento concedido, cada parceria com terceiro setor)
create table if not exists controle_upc.quadro_modelo_linha (
  id uuid primary key default gen_random_uuid(),
  prestacao_contas_id uuid not null references controle_upc.prestacao_contas(id) on delete cascade,
  quadro_modelo_id uuid not null references controle_upc.quadro_modelo(id),
  ordem int not null,
  origem text not null default 'manual'
    check (origem in (
      'sim_auto', 'sim_parcial', 'manual', 'ajuste_controlado',
      'ocr_sugerido', 'ocr_confirmado', 'documento_externo', 'declaracao_inexistencia'
    )),
  created_at timestamptz not null default now()
);

create index if not exists idx_quadro_linha_prestacao
  on controle_upc.quadro_modelo_linha (prestacao_contas_id, quadro_modelo_id);

-- 7. Evoluir campo_modelo_valor: suportar linha repetível + auditoria de origem/revisão
alter table controle_upc.campo_modelo_valor
  add column if not exists quadro_linha_id uuid references controle_upc.quadro_modelo_linha(id),
  add column if not exists origem text not null default 'manual'
    check (origem in (
      'sim_auto', 'sim_parcial', 'manual', 'ajuste_controlado',
      'ocr_sugerido', 'ocr_confirmado', 'documento_externo', 'declaracao_inexistencia'
    )),
  add column if not exists revisado_por uuid,
  add column if not exists revisado_em timestamptz;

create index if not exists idx_campo_modelo_valor_quadro_linha
  on controle_upc.campo_modelo_valor (quadro_linha_id);

-- 8. Seed: registrar a versão normativa atual do projeto
insert into controle_upc.versao_normativa (norma, ato_alteracao, vigente_desde, observacoes)
values (
  'IN TCE-CE 01/2025',
  'Portaria 51/2026',
  '2026-01-01',
  'Versão vigente a partir das Prestações de Contas de Gestão referentes ao exercício de 2025, com Anexos alterados pela Portaria 51/2026.'
)
on conflict do nothing;

commit;

-- Próximo passo (fora desta migration): popular secao_modelo/quadro_modelo/campo_modelo
-- do Modelo 01 referenciando o versao_normativa_id criado acima, e migrar os registros
-- existentes em campo_modelo_valor para apontar origem/quadro_linha_id corretamente.
