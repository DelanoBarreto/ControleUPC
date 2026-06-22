import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const VERSAO_NORMATIVA_PADRAO = "in_01_2025_portaria_51_2026";

type RouteContext = {
  params: Promise<{
    codigo: string;
  }>;
};

type TemplateRow = {
  id: string;
  versao_normativa_id: string;
  codigo: string;
  nome: string;
  anexo: string | null;
  descricao: string | null;
  tipo_prestacao: string;
  schema_version: number;
  ativo: boolean;
  aplicabilidade: Record<string, unknown>;
  regras_jsonb: Record<string, unknown>;
};

type CampoRow = {
  id: string;
  template_id: string;
  secao_id: string | null;
  quadro_id: string | null;
  campo_modelo_id: string | null;
  chave: string;
  rotulo: string;
  tipo_campo: string;
  classificacao_preenchimento: string;
  origem_default: string;
  editavel: boolean;
  obrigatorio: boolean;
  texto_oficial: boolean;
  permite_anexo: boolean;
  ordem: number;
  schema_matriz: Record<string, unknown>;
  fonte_sim_jsonb: Record<string, unknown>;
  validacoes_jsonb: Record<string, unknown>;
  ui_jsonb: Record<string, unknown>;
};

type ValorRow = {
  id: string;
  template_campo_id: string;
  valor_texto: string | null;
  valor_data: string | null;
  valor_numero: number | null;
  valor_booleano: boolean | null;
  valor_jsonb: Record<string, unknown>;
  origem: string;
  revisado: boolean;
  observacao: string | null;
};

type OrigemSimRow = {
  id: string;
  template_campo_id: string;
  layout_codigo: string;
  campo_origem: string | null;
  regra_jsonb: Record<string, unknown>;
  prioridade: number;
};

export async function GET(request: Request, context: RouteContext) {
  const { codigo } = await context.params;
  const url = new URL(request.url);
  const prestacaoContasId = url.searchParams.get("prestacao_contas_id");
  const versaoNormativaCodigo = url.searchParams.get("versao") ?? VERSAO_NORMATIVA_PADRAO;

  const supabase = createSupabaseServerClient();

  const versaoResult = await supabase
    .schema("controle_upc")
    .from("versao_normativa")
    .select("id, codigo, nome, instrumento, data_publicacao, vigencia_inicio, vigencia_fim, status")
    .eq("codigo", versaoNormativaCodigo)
    .single();

  if (versaoResult.error) {
    return NextResponse.json({ message: versaoResult.error.message }, { status: 500 });
  }

  const templateResult = await supabase
    .schema("controle_upc")
    .from("modelo_template")
    .select("*")
    .eq("codigo", codigo)
    .eq("versao_normativa_id", versaoResult.data.id)
    .eq("ativo", true)
    .order("schema_version", { ascending: false })
    .limit(1)
    .single();

  if (templateResult.error) {
    return NextResponse.json({ message: templateResult.error.message }, { status: 404 });
  }

  const template = templateResult.data as TemplateRow;
  const [secoesResult, quadrosResult, camposResult] = await Promise.all([
    supabase
      .schema("controle_upc")
      .from("modelo_template_secao")
      .select("*")
      .eq("template_id", template.id)
      .order("ordem", { ascending: true }),
    supabase
      .schema("controle_upc")
      .from("modelo_template_quadro")
      .select("*")
      .eq("template_id", template.id)
      .order("ordem", { ascending: true }),
    supabase
      .schema("controle_upc")
      .from("modelo_template_campo")
      .select("*")
      .eq("template_id", template.id)
      .order("ordem", { ascending: true })
  ]);

  const erroEstrutura = secoesResult.error ?? quadrosResult.error ?? camposResult.error;
  if (erroEstrutura) {
    return NextResponse.json({ message: erroEstrutura.message }, { status: 500 });
  }

  const campos = (camposResult.data ?? []) as CampoRow[];
  const campoIds = campos.map((campo) => campo.id);

  const [valoresResult, origensResult] = await Promise.all([
    prestacaoContasId && campoIds.length
      ? supabase
          .schema("controle_upc")
          .from("modelo_template_valor")
          .select("*")
          .eq("prestacao_contas_id", prestacaoContasId)
          .in("template_campo_id", campoIds)
      : Promise.resolve({ data: [], error: null }),
    campoIds.length
      ? supabase
          .schema("controle_upc")
          .from("modelo_template_campo_origem_sim")
          .select("*")
          .in("template_campo_id", campoIds)
          .order("prioridade", { ascending: true })
      : Promise.resolve({ data: [], error: null })
  ]);

  const erroDados = valoresResult.error ?? origensResult.error;
  if (erroDados) {
    return NextResponse.json({ message: erroDados.message }, { status: 500 });
  }

  const valoresPorCampo = new Map(
    ((valoresResult.data ?? []) as ValorRow[]).map((valor) => [valor.template_campo_id, valor])
  );
  const origensPorCampo = ((origensResult.data ?? []) as OrigemSimRow[]).reduce(
    (acc, origem) => {
      acc[origem.template_campo_id] ??= [];
      acc[origem.template_campo_id].push(origem);
      return acc;
    },
    {} as Record<string, OrigemSimRow[]>
  );

  const camposComDados = campos.map((campo) => ({
    ...campo,
    valor: valoresPorCampo.get(campo.id) ?? null,
    origens_sim: origensPorCampo[campo.id] ?? []
  }));

  return NextResponse.json({
    versao_normativa: versaoResult.data,
    template,
    secoes: secoesResult.data ?? [],
    quadros: quadrosResult.data ?? [],
    campos: camposComDados
  });
}
