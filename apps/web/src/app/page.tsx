const statusCards = [
  {
    label: "Fonte normativa",
    value: "IN 01/2025",
    detail: "Modelos, anexos, regras e exportacoes"
  },
  {
    label: "Fonte auxiliar",
    value: "CSV SIM",
    detail: "Importacao para preencher dados automaticamente"
  },
  {
    label: "MVP",
    value: "Modelo 01",
    detail: "Rol de Responsaveis com anexos e exportacao"
  },
  {
    label: "Stack",
    value: "Next + Supabase",
    detail: "Worker Python para OCR, PDF, Excel e LLM"
  }
];

const phases = [
  "Banco e Supabase",
  "Importacao dos CSVs essenciais",
  "Tela do Modelo 01",
  "Anexos por modelo/campo",
  "PDF e Excel",
  "Dashboard de pendencias",
  "OCR e LLM com revisao humana"
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
              Controle UPC
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
              Prestacao de contas no padrao da IN 01/2025
            </h1>
          </div>
          <div className="hidden rounded border border-[var(--line)] px-4 py-2 text-sm text-[var(--muted)] md:block">
            Ambiente inicial do sistema
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-[var(--line)] pr-6">
          <nav className="space-y-2 text-sm">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Importacoes", href: "/importacoes" },
              { label: "Modelo 01", href: "/modelos/modelo-01" },
              { label: "Anexos", href: "/dashboard" },
              { label: "Exportacoes", href: "/dashboard" }
            ].map((item, index) => (
              <a
                className={`block rounded-md px-3 py-2 ${
                  index === 0
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--foreground)] hover:bg-white"
                }`}
                href={item.href}
                key={item.label}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statusCards.map((card) => (
              <article className="rounded-md border border-[var(--line)] bg-white p-5" key={card.label}>
                <p className="text-sm text-[var(--muted)]">{card.label}</p>
                <strong className="mt-2 block text-xl text-[var(--foreground)]">{card.value}</strong>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{card.detail}</p>
              </article>
            ))}
          </div>

          <section className="rounded-md border border-[var(--line)] bg-white">
            <div className="border-b border-[var(--line)] px-5 py-4">
              <h2 className="text-lg font-semibold">Workspace da UPC</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                O usuario trabalhara por municipio, exercicio, UPC, periodo e modelo.
              </p>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-4">
              {[
                { field: "Municipio", href: "/importacoes" },
                { field: "Exercicio", href: "/importacoes" },
                { field: "UPC", href: "/modelos/modelo-01" },
                { field: "Modelo", href: "/modelos/modelo-01" }
              ].map(({ field, href }) => (
                <a className="block" href={href} key={field}>
                  <span className="mb-2 block text-sm font-medium">{field}</span>
                  <div className="rounded border border-[var(--line)] bg-[#f9fbfa] px-3 py-2 text-sm text-[var(--muted)] hover:bg-[#eff4f1]">
                    Abrir
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <a className="rounded-md border border-[var(--line)] bg-white p-5 hover:bg-[#f8faf9]" href="/importacoes">
              <p className="text-sm text-[var(--muted)]">Fluxo inicial</p>
              <strong className="mt-2 block text-xl">Importar arquivos SIM</strong>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Envio por municipio e exercicio, sem selecao de mes, com deteccao automatica da competencia.
              </p>
            </a>
            <a className="rounded-md border border-[var(--line)] bg-white p-5 hover:bg-[#f8faf9]" href="/modelos/modelo-01">
              <p className="text-sm text-[var(--muted)]">MVP</p>
              <strong className="mt-2 block text-xl">Abrir Modelo 01</strong>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Rol de Responsaveis com edicao controlada e anexos.
              </p>
            </a>
          </section>

          <section className="rounded-md border border-[var(--line)] bg-white">
            <div className="border-b border-[var(--line)] px-5 py-4">
              <h2 className="text-lg font-semibold">Proximas fases</h2>
            </div>
            <ol className="grid gap-3 p-5 md:grid-cols-2">
              {phases.map((phase, index) => (
                <li className="flex items-center gap-3 rounded border border-[var(--line)] px-4 py-3" key={phase}>
                  <span className="flex size-7 items-center justify-center rounded bg-[var(--accent)] text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm">{phase}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </section>
    </main>
  );
}
