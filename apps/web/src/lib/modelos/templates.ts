import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CampoModeloTemplate = {
  id: string;
  chave: string;
  rotulo: string;
  secao: string | null;
  tipo_campo: string;
  classificacao_preenchimento?: string;
  origem_default?: string;
  editavel: boolean;
  obrigatorio: boolean;
  texto_oficial: boolean;
  permite_anexo?: boolean;
  ordem: number;
};

export type FuncaoRolTemplate = {
  codigo: string;
  nome: string;
  exige_anexo: boolean;
  ordem: number;
};

type TemplateCampoRow = Omit<CampoModeloTemplate, "secao"> & {
  secao_id: string | null;
};

type TemplateSecaoRow = {
  id: string;
  titulo: string;
};

export const fallbackCamposModelo01: CampoModeloTemplate[] = [
  {
    id: "fallback-codigo-municipio",
    chave: "codigo_municipio",
    rotulo: "Codigo do municipio",
    secao: "Identificacao",
    tipo_campo: "texto",
    editavel: false,
    obrigatorio: true,
    texto_oficial: true,
    ordem: 1
  },
  {
    id: "fallback-nome-municipio",
    chave: "nome_municipio",
    rotulo: "Nome do municipio",
    secao: "Identificacao",
    tipo_campo: "texto",
    editavel: false,
    obrigatorio: true,
    texto_oficial: true,
    ordem: 2
  },
  {
    id: "fallback-gestor-nome",
    chave: "gestor_nome",
    rotulo: "Nome do gestor da pasta",
    secao: "Gestao",
    tipo_campo: "texto",
    editavel: true,
    obrigatorio: true,
    texto_oficial: false,
    ordem: 3
  }
];

export const fallbackFuncoesRol: FuncaoRolTemplate[] = [
  {
    codigo: "dirigente_maximo",
    nome: "Dirigente maximo da unidade ou representante legal",
    exige_anexo: true,
    ordem: 1
  },
  { codigo: "ordenador_despesa", nome: "Ordenador de despesas", exige_anexo: true, ordem: 2 },
  { codigo: "contador", nome: "Contador responsavel", exige_anexo: true, ordem: 3 }
];

export function normalizarCodigoModelo(slug: string) {
  return slug.trim().toLowerCase().replaceAll("-", "_");
}

export function tituloModeloFromCodigo(codigo: string) {
  const match = codigo.match(/^modelo_(\d+)$/);
  if (!match) return codigo.replaceAll("_", " ");

  return `Modelo ${match[1].padStart(2, "0")}`;
}

export async function carregarCamposTemplate(codigo: string, fallback: CampoModeloTemplate[]) {
  const supabase = createSupabaseServerClient();

  const templateResult = await supabase
    .schema("controle_upc")
    .from("modelo_template")
    .select("id")
    .eq("codigo", codigo)
    .eq("ativo", true)
    .order("schema_version", { ascending: false })
    .limit(1)
    .single();

  if (!templateResult.data?.id) {
    return fallback;
  }

  const [camposResult, secoesResult] = await Promise.all([
    supabase
      .schema("controle_upc")
      .from("modelo_template_campo")
      .select(
        "id, chave, rotulo, secao_id, tipo_campo, classificacao_preenchimento, origem_default, editavel, obrigatorio, texto_oficial, permite_anexo, ordem"
      )
      .eq("template_id", templateResult.data.id)
      .order("ordem", { ascending: true }),
    supabase
      .schema("controle_upc")
      .from("modelo_template_secao")
      .select("id, titulo")
      .eq("template_id", templateResult.data.id)
  ]);

  if (!camposResult.data?.length) {
    return fallback;
  }

  const secoes = new Map(
    ((secoesResult.data ?? []) as TemplateSecaoRow[]).map((secao) => [secao.id, secao.titulo])
  );

  return (camposResult.data as TemplateCampoRow[]).map((campo) => ({
    ...campo,
    secao: campo.secao_id ? (secoes.get(campo.secao_id) ?? null) : null
  }));
}

export async function carregarFuncoesRol(fallback: FuncaoRolTemplate[]) {
  const supabase = createSupabaseServerClient();

  const funcoesResult = await supabase
    .schema("controle_upc")
    .from("funcao_rol")
    .select("codigo, nome, exige_anexo, ordem")
    .order("ordem", { ascending: true });

  return funcoesResult.data?.length ? (funcoesResult.data as FuncaoRolTemplate[]) : fallback;
}
