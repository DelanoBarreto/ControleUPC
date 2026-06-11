import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Layers3,
  ShieldCheck,
  Sparkles,
  Workflow
} from "lucide-react";

const features = [
  {
    title: "Prestação mais eficiente",
    text: "Centralize modelos, anexos e pendências para reduzir retrabalho na entrega da UPC."
  },
  {
    title: "Fluxo guiado pela IN",
    text: "Selecione a prestação, acompanhe os modelos exigidos e avance até a exportação final."
  },
  {
    title: "Controle antes do envio",
    text: "Valide inconsistências, campos incompletos e documentos pendentes antes de fechar os relatórios."
  }
];

const steps = [
  "Abrir a landing e entrar no sistema",
  "Selecionar município, exercício e UPC",
  "Importar o lote SIM ou abrir o Modelo 01",
  "Revisar anexos, pendências e exportação"
];

const trustItems = [
  "Modelo 01 no centro do fluxo",
  "Importação SIM como base auxiliar",
  "Anexos e rastreio por contexto",
  "Preparo para demonstração e uso real"
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f3f6fb] text-[#0f1720]">
      <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#2b6dff_0%,#6a3df0_42%,#9b49ff_74%,#ff4f8b_100%)] text-white">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-[-8rem] top-[-6rem] size-[26rem] rounded-full bg-white/20 blur-3xl" />
          <div className="absolute right-[-6rem] top-10 size-[20rem] rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute bottom-[-10rem] right-[20%] size-[28rem] rounded-full bg-fuchsia-200/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-6">
          <header className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-full border border-white/15 bg-white/10 px-4 py-3 backdrop-blur md:grid-cols-[1fr_auto_1fr]">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-white/15">
                <Layers3 className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Controle UPC</p>
                <p className="text-sm font-medium">Prestação de contas municipal</p>
              </div>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                Landing
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                Dashboard
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                Modelo 01
              </span>
            </div>

            <Link
              className="inline-flex min-w-[190px] shrink-0 items-center justify-center gap-2 justify-self-end whitespace-nowrap rounded-full bg-[#101828] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 ring-1 ring-white/20 transition hover:-translate-y-0.5"
              href="/dashboard"
            >
              <span>Entrar no sistema</span>
              <ArrowRight className="size-4 shrink-0" />
            </Link>
          </header>

          <div className="grid gap-10 pb-16 pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pb-20 lg:pt-20">
            <div className="max-w-2xl space-y-7">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                  Landing page
                </span>
                <span className="rounded-full bg-black/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
                  Interface SaaS moderna
                </span>
              </div>

              <div className="space-y-5">
                <h1 className="max-w-xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl">
                  Prestação de contas da UPC com eficiência, controle e segurança.
                </h1>
                <p className="max-w-xl text-base leading-7 text-white/82 md:text-lg">
                  Reduza digitação manual, organize modelos e anexos da IN 01/2025, valide pendências e
                  prepare relatórios PDF e Excel com mais consistência.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  className="inline-flex min-w-[178px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#101828] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-black/25 ring-1 ring-white/20 transition hover:-translate-y-0.5"
                  href="/dashboard"
                >
                  <span>Entrar agora</span>
                  <ArrowRight className="size-4 shrink-0" />
                </Link>
                <Link
                  className="inline-flex min-w-[154px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/25 bg-white/12 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18"
                  href="/modelos/modelo-01"
                >
                  <span>Ver Modelo 01</span>
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {trustItems.map((item) => (
                  <div
                    className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur"
                    key={item}
                  >
                    <BadgeCheck className="size-5 shrink-0 text-emerald-200" />
                    <span className="text-sm font-medium text-white/88">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-8 top-8 size-24 rounded-full bg-cyan-300/30 blur-2xl" />
              <div className="absolute -right-6 bottom-10 size-28 rounded-full bg-pink-300/20 blur-2xl" />

              <div className="relative rounded-[2rem] border border-white/20 bg-white/12 p-4 shadow-[0_40px_120px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                <div className="rounded-[1.5rem] bg-[#f7f8fc] p-4 text-[#101828] shadow-2xl">
                  <div className="flex items-center justify-between rounded-[1.2rem] bg-[linear-gradient(135deg,#5b3df0_0%,#7a50f5_52%,#4fd7ff_100%)] px-5 py-4 text-white">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Visão geral</p>
                      <h2 className="mt-2 text-2xl font-semibold">Painel de controle</h2>
                    </div>
                    <div className="rounded-full border border-white/15 bg-white/15 px-3 py-1 text-xs font-semibold">
                      Demo mode
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-[1.2rem] bg-[#ccf6df] p-4 shadow-[0_18px_40px_rgba(34,197,94,0.16)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/65">
                        Lotes recebidos
                      </p>
                      <p className="mt-4 text-3xl font-semibold">128</p>
                      <p className="mt-2 text-sm text-emerald-950/70">Fluxo ativo neste período</p>
                    </div>
                    <div className="rounded-[1.2rem] bg-[#ffb08a] p-4 shadow-[0_18px_40px_rgba(249,115,22,0.18)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-950/70">
                        Pendências
                      </p>
                      <p className="mt-4 text-3xl font-semibold">07</p>
                      <p className="mt-2 text-sm text-orange-950/70">Exigem atenção hoje</p>
                    </div>
                    <div className="rounded-[1.2rem] bg-[#49e0ff] p-4 shadow-[0_18px_40px_rgba(6,182,212,0.18)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-950/70">
                        Modelo 01
                      </p>
                      <p className="mt-4 text-3xl font-semibold">94%</p>
                      <p className="mt-2 text-sm text-cyan-950/70">Pronto para exportar</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[1.2rem] border border-[#e4e9ef] bg-white p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">Checklist inteligente</p>
                        <Sparkles className="size-4 text-[#6a3df0]" />
                      </div>
                      <div className="mt-4 space-y-3">
                        {[
                          "Importação SIM concluída",
                          "Anexos do Modelo 01 pendentes",
                          "Revisar exportação final"
                        ].map((item, index) => (
                          <div className="flex items-center gap-3 rounded-xl bg-[#f7f9fd] px-3 py-2" key={item}>
                            <span className="flex size-7 items-center justify-center rounded-full bg-[#6a3df0]/10 text-xs font-semibold text-[#6a3df0]">
                              {index + 1}
                            </span>
                            <span className="text-sm text-slate-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.2rem] border border-[#e4e9ef] bg-[#0f172a] p-4 text-white">
                      <p className="text-sm font-semibold">Pronto para demonstração</p>
                      <p className="mt-2 text-sm leading-6 text-white/78">
                        Layout com alto contraste, cards coloridos e transição clara entre a landing e a área
                        operacional.
                      </p>
                      <div className="mt-4 grid gap-2">
                        <div className="h-2 rounded-full bg-white/12">
                          <div className="h-2 w-[86%] rounded-full bg-[#4fd7ff]" />
                        </div>
                        <div className="h-2 rounded-full bg-white/12">
                          <div className="h-2 w-[64%] rounded-full bg-[#ff7da6]" />
                        </div>
                        <div className="h-2 rounded-full bg-white/12">
                          <div className="h-2 w-[92%] rounded-full bg-[#7df2b5]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-1 bg-white">
        <div className="absolute left-0 right-0 top-[-5.5rem] h-28 bg-[radial-gradient(circle_at_20%_0%,rgba(43,109,255,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,79,139,0.16),transparent_30%)] blur-2xl" />
        <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-10">
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((item) => (
              <article className="rounded-[1.5rem] border border-[#e8edf4] bg-[#f8fbff] p-6 shadow-[0_18px_50px_rgba(20,32,30,0.06)]" key={item.title}>
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2b6dff_0%,#9b49ff_100%)] text-white">
                    <ShieldCheck className="size-5" />
                  </div>
                  <p className="text-base font-semibold text-slate-900">{item.title}</p>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="rounded-[1.8rem] border border-[#e8edf4] bg-[#0f172a] p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Fluxo</p>
              <h2 className="mt-3 text-2xl font-semibold">Da seleção da UPC ao pacote final sem perder contexto.</h2>
              <div className="mt-6 space-y-4">
                {steps.map((step, index) => (
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3" key={step}>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#2545d7]">
                      {index + 1}
                    </span>
                    <span className="text-sm text-white/86">{step}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[1.8rem] border border-[#e8edf4] bg-white p-6 shadow-[0_24px_70px_rgba(20,32,30,0.08)]">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-[#edf6f3] text-[#155d53]">
                    <Workflow className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f6b5f]">Próximo passo</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-900">Acompanhar a prestação da UPC</h2>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                A home apresenta o valor do sistema, a dashboard acompanha modelos, pendências e arquivos, e
                as telas internas mantêm o mesmo padrão para concluir a prestação com mais segurança.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#2b6dff_0%,#9b49ff_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5"
                  href="/dashboard"
                >
                  Ir para a dashboard
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  className="inline-flex items-center gap-2 rounded-full border border-[#dce3ec] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  href="/importacoes"
                >
                  Abrir importação
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
