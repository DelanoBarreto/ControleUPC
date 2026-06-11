import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ArrowLeft, FileDown, FileSpreadsheet, Layers3, Upload } from "lucide-react";
import Link from "next/link";
import { Modelo01EditorClient } from "./Modelo01EditorClient";

export type CampoModelo = {
  id: string;
  chave: string;
  rotulo: string;
  secao: string | null;
  tipo_campo: string;
  editavel: boolean;
  obrigatorio: boolean;
  texto_oficial: boolean;
  ordem: number;
};

type FuncaoRol = {
  codigo: string;
  nome: string;
  exige_anexo: boolean;
  ordem: number;
};

type Modelo01Contexto = {
  prestacaoContasId: string;
  totalCampos: number;
  totalCamposEditaveis: number;
  totalCamposBloqueados: number;
  totalFuncoes: number;
};

export type ValorCampoModelo = {
  campo_modelo_id: string;
  valor_texto: string | null;
  valor_data: string | null;
  valor_numero: number | null;
  valor_booleano: boolean | null;
  origem: string;
  revisado: boolean;
  observacao: string | null;
};

function buildImportacoesHref(prestacaoContasId: string) {
  const params = new URLSearchParams();
  if (prestacaoContasId.trim()) params.set("prestacao_contas_id", prestacaoContasId.trim());
  return `/importacoes${params.size ? `?${params.toString()}` : ""}`;
}

const fallbackCampos: CampoModelo[] = [
  {
    id: "fallback-codigo-municipio",
    chave: "codigo_municipio",
    rotulo: "Código do município",
    secao: "Identificação",
    tipo_campo: "texto",
    editavel: false,
    obrigatorio: true,
    texto_oficial: true,
    ordem: 1
  },
  {
    id: "fallback-nome-municipio",
    chave: "nome_municipio",
    rotulo: "Nome do município",
    secao: "Identificação",
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
    secao: "Gestão",
    tipo_campo: "texto",
    editavel: true,
    obrigatorio: true,
    texto_oficial: false,
    ordem: 3
  }
];

const fallbackFuncoes: FuncaoRol[] = [
  {
    codigo: "dirigente_maximo",
    nome: "Dirigente máximo da unidade ou representante legal",
    exige_anexo: true,
    ordem: 1
  },
  { codigo: "ordenador_despesa", nome: "Ordenador de despesas", exige_anexo: true, ordem: 2 },
  { codigo: "contador", nome: "Contador responsável", exige_anexo: true, ordem: 3 }
];

type Modelo01PageProps = {
  searchParams?: Promise<{
    prestacao_contas_id?: string;
  }>;
};

export default async function Modelo01Page({ searchParams }: Modelo01PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const prestacaoContasId = resolvedSearchParams?.prestacao_contas_id ?? "";
  let campos = fallbackCampos;
  let funcoes = fallbackFuncoes;

  try {
    const supabase = createSupabaseServerClient();
    const modeloResult = await supabase
      .schema("controle_upc")
      .from("modelo_in")
      .select("id")
      .eq("codigo", "modelo_01")
      .single();

    if (modeloResult.data?.id) {
      const [camposResult, funcoesResult] = await Promise.all([
        supabase
          .schema("controle_upc")
          .from("campo_modelo")
          .select("id, chave, rotulo, secao, tipo_campo, editavel, obrigatorio, texto_oficial, ordem")
          .eq("modelo_id", modeloResult.data.id)
          .order("ordem", { ascending: true }),
        supabase
          .schema("controle_upc")
          .from("funcao_rol")
          .select("codigo, nome, exige_anexo, ordem")
          .order("ordem", { ascending: true })
      ]);

      if (camposResult.data?.length) {
        campos = camposResult.data as CampoModelo[];
      }
      if (funcoesResult.data?.length) {
        funcoes = funcoesResult.data as FuncaoRol[];
      }
    }
  } catch {
    // Mantém os dados de fallback quando o banco ainda não estiver acessível.
  }

  const contexto: Modelo01Contexto = {
    prestacaoContasId,
    totalCampos: campos.length,
    totalCamposEditaveis: campos.filter((campo) => campo.editavel).length,
    totalCamposBloqueados: campos.filter((campo) => !campo.editavel).length,
    totalFuncoes: funcoes.length
  };

  const importacoesHref = buildImportacoesHref(prestacaoContasId);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#edf2ff_0%,#f7f9fc_34%,#eef4f1_100%)] text-[#101828]">
      <section className="mx-auto max-w-7xl px-6 pt-6">
        <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-[linear-gradient(135deg,#233876_0%,#2545d7_52%,#0f766e_100%)] px-6 py-6 text-white shadow-[0_28px_90px_rgba(37,69,215,0.22)] md:px-8 md:py-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/15 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
                    Modelo da IN
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
                    Workspace ativo
                  </span>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Modelo 01 - Rol de Responsáveis</h1>
                  <p className="max-w-3xl text-sm leading-6 text-white/80 md:text-base">
                    Workspace de preenchimento do modelo da IN: campos oficiais, valores editáveis, anexos obrigatórios
                    e exportação da prestação selecionada.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:min-w-[280px] sm:grid-cols-2">
                <div className="rounded-[20px] border border-white/15 bg-white/12 px-4 py-3 backdrop-blur">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">Campos</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{contexto.totalCampos}</p>
                </div>
                <div className="rounded-[20px] border border-white/15 bg-white/12 px-4 py-3 backdrop-blur">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">Editáveis</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{contexto.totalCamposEditaveis}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex min-w-[190px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#101828] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 ring-1 ring-white/20 transition hover:-translate-y-0.5"
                href="/dashboard"
              >
                <ArrowLeft className="size-4 shrink-0" />
                <span>Painel da prestação</span>
              </Link>
              <Link
                className="inline-flex min-w-[190px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#101828] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:bg-[#1f2937]"
                href={importacoesHref}
              >
                <Upload className="size-4 shrink-0" />
                <span className="whitespace-nowrap">Ir para importações</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_340px]">
          <Modelo01EditorClient
            campos={campos}
            contexto={contexto}
            prestacaoContasIdInicial={prestacaoContasId}
            valores={[]}
          />

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(43,109,255,0.12)_0%,rgba(15,118,110,0.12)_100%)] text-[#2545d7]">
                    <Layers3 className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">Resumo da prestação</h2>
                    <p className="mt-1 text-sm text-slate-500">Estado atual do workspace e atalhos de operação.</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 p-5">
                <div className="rounded-[18px] border border-slate-200 bg-[#f8fbff] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prestação</p>
                  <p className="mt-1 break-all font-mono text-xs leading-5 font-medium text-slate-900">
                    {prestacaoContasId || "Sem prestação aberta"}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3">
                    <p className="text-lg font-semibold text-slate-950">{contexto.totalCampos}</p>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">Campos</p>
                  </div>
                  <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3">
                    <p className="text-lg font-semibold text-slate-950">{contexto.totalCamposEditaveis}</p>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">Editáveis</p>
                  </div>
                  <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3">
                    <p className="text-lg font-semibold text-slate-950">{contexto.totalFuncoes}</p>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">Funções</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-950">Funções exigidas</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {funcoes.map((funcao) => (
                  <div className="px-5 py-4 text-sm" key={funcao.codigo}>
                    <p className="font-medium text-slate-950">{funcao.nome}</p>
                    <p className="mt-1 text-slate-500">Código: {funcao.codigo}</p>
                    <p className="mt-1 text-slate-500">
                      {funcao.exige_anexo ? "Exige anexo" : "Sem anexo obrigatório"}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-950">Exportação final</h2>
              </div>
              <div className="flex flex-col gap-3 p-5">
                <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#101828] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                  <FileDown className="size-4" />
                  Gerar PDF
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <FileSpreadsheet className="size-4" />
                  Gerar Excel
                </button>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
