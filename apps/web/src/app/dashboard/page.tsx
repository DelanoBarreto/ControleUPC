import { createSupabaseServerClient } from "@/lib/supabase/server";

type DashboardLoteResumo = {
  id: string;
  codigo_municipio: string;
  municipio_nome: string;
  exercicio: number;
  status: string;
  total_arquivos: number;
  total_erros: number;
  storage_base_path: string;
  created_at: string;
};

const fallbackKpis = [
  {
    label: "Lotes recebidos",
    value: "0",
    note: "Sem dados carregados ainda"
  },
  {
    label: "Lotes pendentes",
    value: "0",
    note: "Aguardando processamento"
  },
  {
    label: "Lotes com erro",
    value: "0",
    note: "Requerem revisao"
  },
  {
    label: "Arquivos importados",
    value: "0",
    note: "Total de arquivos recebidos"
  }
];

const fallbackPendencies = [
  {
    upc: "Sem dados",
    modelo: "Modelo 01",
    pendencia: "Importe o primeiro lote para habilitar os resumos"
  }
];

const fallbackRecentImports = [
  {
    municipio: "Aguardando carga",
    exercicio: "-",
    lote: "Nenhum lote registrado ainda",
    status: "Sem dados"
  }
];

function formatStatus(status: string) {
  if (status === "concluido") return "Concluido";
  if (status === "erro") return "Com erro";
  if (status === "processando") return "Processando";
  return "Pendente";
}

export default async function DashboardPage() {
  let kpis = fallbackKpis;
  let pendingItems = fallbackPendencies;
  let recentImports = fallbackRecentImports;

  try {
    const supabase = createSupabaseServerClient();

    const [{ count: totalLotacoes }, { count: totalPendentes }, { count: totalErros }, { count: totalArquivos }, recentResult] =
      await Promise.all([
        supabase.schema("controle_upc").from("importacao_lote").select("id", { count: "exact", head: true }),
        supabase
          .schema("controle_upc")
          .from("importacao_lote")
          .select("id", { count: "exact", head: true })
          .eq("status", "pendente"),
        supabase
          .schema("controle_upc")
          .from("importacao_lote")
          .select("id", { count: "exact", head: true })
          .eq("status", "erro"),
        supabase.schema("controle_upc").from("importacao_arquivo").select("id", { count: "exact", head: true }),
        supabase
          .schema("controle_upc")
          .from("v_importacao_lote_resumo")
          .select("id, codigo_municipio, municipio_nome, exercicio, status, total_arquivos, total_erros, created_at")
          .order("created_at", { ascending: false })
          .limit(5)
      ]);

    const recentLots = (recentResult.data ?? []) as DashboardLoteResumo[];

    kpis = [
      {
        label: "Lotes recebidos",
        value: String(totalLotacoes ?? 0),
        note: "Total de lotes registrados"
      },
      {
        label: "Lotes pendentes",
        value: String(totalPendentes ?? 0),
        note: "Aguardando processamento"
      },
      {
        label: "Lotes com erro",
        value: String(totalErros ?? 0),
        note: "Precisam revisao"
      },
      {
        label: "Arquivos importados",
        value: String(totalArquivos ?? 0),
        note: "Registros de arquivos do SIM"
      }
    ];

    pendingItems = recentLots
      .filter((item) => item.status === "pendente" || item.status === "erro")
      .slice(0, 3)
      .map((item) => ({
        upc: `${item.municipio_nome} (${item.codigo_municipio})`,
        modelo: `Exercicio ${item.exercicio}`,
        pendencia: `Lote ${formatStatus(item.status)} com ${item.total_arquivos} arquivos e ${item.total_erros} erros`
      }));

    recentImports = recentLots.map((item) => ({
      municipio: `${item.municipio_nome} (${item.codigo_municipio})`,
      exercicio: String(item.exercicio),
      lote: `${item.total_arquivos} arquivos | ${item.storage_base_path}`,
      status: formatStatus(item.status)
    }));
  } catch {
    // Mantem os dados de fallback quando o banco ainda nao estiver disponivel.
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <section className="border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
              Controle UPC
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Dashboard operacional</h1>
          </div>
          <a
            className="rounded border border-[var(--line)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[#f6f8f7]"
            href="/"
          >
            Voltar
          </a>
        </div>
      </section>

      <section className="mx-auto space-y-6 px-6 py-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => (
            <article className="rounded-md border border-[var(--line)] bg-white p-5" key={item.label}>
              <p className="text-sm text-[var(--muted)]">{item.label}</p>
              <strong className="mt-2 block text-3xl text-[var(--foreground)]">{item.value}</strong>
              <p className="mt-3 text-sm text-[var(--muted)]">{item.note}</p>
            </article>
          ))}
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-md border border-[var(--line)] bg-white">
            <div className="border-b border-[var(--line)] px-5 py-4">
              <h2 className="text-lg font-semibold">Pendencias por UPC</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                O que ainda precisa ser concluido antes de exportar.
              </p>
            </div>
            <div className="divide-y divide-[var(--line)]">
              {pendingItems.map((item) => (
                <div className="grid gap-2 px-5 py-4 md:grid-cols-[220px_140px_1fr]" key={`${item.upc}-${item.modelo}`}>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{item.upc}</p>
                    <p className="text-sm text-[var(--muted)]">{item.modelo}</p>
                  </div>
                  <div className="text-sm text-[var(--muted)]">Pendente</div>
                  <div className="text-sm text-[var(--muted)]">{item.pendencia}</div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-md border border-[var(--line)] bg-white">
            <div className="border-b border-[var(--line)] px-5 py-4">
              <h2 className="text-lg font-semibold">Importacoes recentes</h2>
            </div>
            <div className="space-y-4 p-5">
              {recentImports.map((item) => (
                <div className="rounded border border-[var(--line)] px-4 py-3" key={`${item.municipio}-${item.exercicio}-${item.lote}`}>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {item.municipio} - {item.exercicio}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{item.lote}</p>
                  <p className="mt-2 text-sm text-[var(--accent)]">{item.status}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-md border border-[var(--line)] bg-white">
          <div className="border-b border-[var(--line)] px-5 py-4">
            <h2 className="text-lg font-semibold">Acoes rapidas</h2>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-3">
            <a className="rounded-md border border-[var(--line)] px-4 py-4 hover:bg-[#f8faf9]" href="/importacoes">
              <p className="text-sm font-medium">Importar lote</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Enviar arquivos SIM por municipio e exercicio.</p>
            </a>
            <a className="rounded-md border border-[var(--line)] px-4 py-4 hover:bg-[#f8faf9]" href="/modelos/modelo-01">
              <p className="text-sm font-medium">Abrir Modelo 01</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Revisar responsaveis, anexos e exportacao.</p>
            </a>
            <a className="rounded-md border border-[var(--line)] px-4 py-4 hover:bg-[#f8faf9]" href="/">
              <p className="text-sm font-medium">Ver home</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Retornar a visao geral do sistema.</p>
            </a>
          </div>
        </section>
      </section>
    </main>
  );
}
