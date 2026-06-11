import { createSupabaseServerClient } from "@/lib/supabase/server";
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

const fallbackCampos: CampoModelo[] = [
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

const fallbackFuncoes: FuncaoRol[] = [
  { codigo: "dirigente_maximo", nome: "Dirigente maximo da unidade ou representante legal", exige_anexo: true, ordem: 1 },
  { codigo: "ordenador_despesa", nome: "Ordenador de despesas", exige_anexo: true, ordem: 2 },
  { codigo: "contador", nome: "Contador responsavel", exige_anexo: true, ordem: 3 }
];

export default async function Modelo01Page() {
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
    // Mantem os dados de fallback quando o banco ainda nao estiver acessivel.
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <section className="border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
              Modelo da IN
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Modelo 01 - Rol de Responsaveis</h1>
          </div>
          <a
            className="rounded border border-[var(--line)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[#f6f8f7]"
            href="/"
          >
            Voltar
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Modelo01EditorClient campos={campos} valores={[]} />

          <aside className="space-y-6">
            <section className="rounded-md border border-[var(--line)] bg-white">
              <div className="border-b border-[var(--line)] px-5 py-4">
                <h2 className="text-lg font-semibold">Funcoes da rol</h2>
              </div>
              <div className="divide-y divide-[var(--line)]">
                {funcoes.map((funcao) => (
                  <div className="px-5 py-4 text-sm" key={funcao.codigo}>
                    <p className="font-medium text-[var(--foreground)]">{funcao.nome}</p>
                    <p className="mt-1 text-[var(--muted)]">Codigo: {funcao.codigo}</p>
                    <p className="mt-1 text-[var(--muted)]">
                      {funcao.exige_anexo ? "Exige anexo" : "Sem anexo obrigatorio"}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-[var(--line)] bg-white">
              <div className="border-b border-[var(--line)] px-5 py-4">
                <h2 className="text-lg font-semibold">Exportacao</h2>
              </div>
              <div className="flex flex-col gap-3 p-5">
                <button className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">
                  Gerar PDF
                </button>
                <button className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--foreground)]">
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
