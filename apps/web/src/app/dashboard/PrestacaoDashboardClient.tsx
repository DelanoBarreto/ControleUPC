"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileArchive,
  FileCheck2,
  FileText,
  FolderOpen,
  Layers3,
  LayoutDashboard,
  ListChecks,
  PanelTop,
  Search,
  Sparkles,
  Upload
} from "lucide-react";

const modelos = [
  {
    codigo: "Modelo 01",
    nome: "Rol de Responsáveis",
    status: "Em preenchimento",
    progresso: 72,
    pendencias: 4,
    href: "/modelos/modelo-01"
  },
  {
    codigo: "Modelo 02",
    nome: "Demonstrativo da gestão",
    status: "Aguardando base",
    progresso: 28,
    pendencias: 7,
    href: "/modelos/modelo-01"
  },
  {
    codigo: "Modelo 03",
    nome: "Declarações e evidências",
    status: "Incompleto",
    progresso: 45,
    pendencias: 5,
    href: "/modelos/modelo-01"
  },
  {
    codigo: "Anexos",
    nome: "Documentos obrigatórios",
    status: "Revisão documental",
    progresso: 38,
    pendencias: 9,
    href: "/modelos/modelo-01"
  }
];

const pendencias = [
  "Modelo 01: informar responsável pelo controle interno.",
  "Modelo 01: anexar portaria de nomeação do dirigente máximo.",
  "Anexos: falta documento de suporte da contabilidade.",
  "Exportação: validar textos oficiais antes de gerar PDF final."
];

const arquivosImportados = [
  { nome: "Balancete de receita", origem: "SIM", status: "Importado" },
  { nome: "Empenhos e liquidações", origem: "SIM", status: "Com avisos" },
  { nome: "Cadastro de responsáveis", origem: "Manual", status: "Pendente" }
];

const indicadores = [
  { label: "Modelos da IN", valor: "4", nota: "em acompanhamento" },
  { label: "Preenchimento", valor: "58%", nota: "média da prestação" },
  { label: "Pendências", valor: "25", nota: "antes do envio" },
  { label: "Arquivos", valor: "12", nota: "vinculados ao processo" }
];

const contextosRecentes = [
  {
    municipio: "014",
    nome: "Prefeitura Municipal",
    ano: "2026",
    upc: "Prefeitura Municipal",
    prestacaoId: "00000000-0000-0000-0000-000000000001",
    status: "Em preenchimento",
    progresso: 58
  },
  {
    municipio: "014",
    nome: "Fundo Municipal de Saúde",
    ano: "2026",
    upc: "Fundo Municipal de Saúde",
    prestacaoId: "00000000-0000-0000-0000-000000000002",
    status: "Aguardando anexos",
    progresso: 41
  },
  {
    municipio: "014",
    nome: "Câmara Municipal",
    ano: "2025",
    upc: "Câmara Municipal",
    prestacaoId: "00000000-0000-0000-0000-000000000003",
    status: "Revisão final",
    progresso: 86
  }
];

function buildModeloHref(baseHref: string, prestacaoId: string) {
  const params = new URLSearchParams();
  if (prestacaoId.trim()) params.set("prestacao_contas_id", prestacaoId.trim());
  return `${baseHref}${params.size ? `?${params.toString()}` : ""}`;
}

function buildImportacoesHref(prestacaoId: string, municipio: string, ano: string) {
  const params = new URLSearchParams();
  if (prestacaoId.trim()) params.set("prestacao_contas_id", prestacaoId.trim());
  if (municipio.trim()) params.set("codigo_municipio", municipio.trim());
  if (ano.trim()) params.set("exercicio", ano.trim());
  return `/importacoes${params.size ? `?${params.toString()}` : ""}`;
}

export function PrestacaoDashboardClient() {
  const [municipio, setMunicipio] = useState("014");
  const [ano, setAno] = useState("2026");
  const [upc, setUpc] = useState("Prefeitura Municipal");
  const [prestacaoId, setPrestacaoId] = useState("00000000-0000-0000-0000-000000000001");
  const [painelAberto, setPainelAberto] = useState(false);

  function selecionarContexto(contexto: (typeof contextosRecentes)[number]) {
    setMunicipio(contexto.municipio);
    setAno(contexto.ano);
    setUpc(contexto.upc);
    setPrestacaoId(contexto.prestacaoId);
    setPainelAberto(false);
  }

  const importacoesHref = buildImportacoesHref(prestacaoId, municipio, ano);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#edf2ff_0%,#f7f9fc_32%,#eef4f1_100%)] text-[#101828]">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[300px_1fr]">
        <aside className="sticky top-6 h-fit rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_24px_80px_rgba(16,24,40,0.09)] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2b6dff_0%,#9b49ff_100%)] text-white">
              <PanelTop className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">Controle UPC</p>
              <h1 className="text-lg font-semibold">Prestação da IN</h1>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {[
              { label: "Prestação", href: "/dashboard", icon: LayoutDashboard, active: true },
              { label: "Importações", href: importacoesHref, icon: Upload, active: false },
              { label: "Modelo 01", href: buildModeloHref("/modelos/modelo-01", prestacaoId), icon: Layers3, active: false },
              { label: "Landing", href: "/", icon: Sparkles, active: false }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    item.active
                      ? "bg-[linear-gradient(135deg,rgba(43,109,255,0.12)_0%,rgba(155,73,255,0.12)_100%)] text-[#2545d7]"
                      : "text-[#475467] hover:bg-slate-50"
                  }`}
                  href={item.href}
                  key={item.label}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="size-4" />
                    {item.label}
                  </span>
                  <ArrowRight className="size-4 opacity-50" />
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[24px] bg-[linear-gradient(180deg,#ffcf8a_0%,#ffa24b_100%)] p-5 text-[#4c2d03] shadow-[0_20px_50px_rgba(255,162,75,0.25)]">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/70">
                <ListChecks className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a3e00]">IN 01/2025</p>
                <h2 className="text-base font-semibold">Envio dos modelos</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#5e3700]">
              A tela principal acompanha os modelos exigidos, pendências, anexos e prontidão para exportação.
            </p>
          </div>
        </aside>

        <section className="space-y-6">
          <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-[linear-gradient(135deg,#233876_0%,#2545d7_52%,#0f766e_100%)] px-6 py-6 text-white shadow-[0_28px_90px_rgba(37,69,215,0.22)] md:px-8 md:py-8">
            <div className="relative flex flex-col gap-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                    {painelAberto ? "Painel principal" : "Abertura da prestação"}
                  </p>
                  <h2 className="text-3xl font-semibold md:text-4xl">
                    {painelAberto ? "Prestação de contas da UPC" : "Selecione município, exercício e UPC"}
                  </h2>
                  <p className="max-w-3xl text-sm leading-6 text-white/80 md:text-base">
                    {painelAberto
                      ? "Acompanhe os modelos da IN, campos incompletos, anexos exigidos, arquivos vinculados e pendências antes do envio."
                      : "Abra o contexto correto da prestação antes de trabalhar nos modelos. A importação de arquivos SIM fica em módulo próprio no menu Importações."}
                  </p>
                </div>

                {painelAberto ? (
                  <div className="flex flex-wrap gap-3">
                    <Link
                      className="inline-flex min-w-[190px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#101828] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 ring-1 ring-white/20 transition hover:-translate-y-0.5"
                      href={buildModeloHref("/modelos/modelo-01", prestacaoId)}
                    >
                      <Layers3 className="size-4 shrink-0" />
                      <span>Abrir Modelo 01</span>
                    </Link>
                    <Link
                      className="inline-flex min-w-[190px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#2545d7] shadow-lg shadow-black/10 ring-1 ring-white/30 transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
                      href={importacoesHref}
                    >
                      <Upload className="size-4 shrink-0" />
                      <span>Ir para importações</span>
                    </Link>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <label className="block rounded-[20px] bg-white/12 p-4 backdrop-blur">
                  <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                    <Building2 className="size-4" />
                    Município
                  </span>
                  <input
                    className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-white/40"
                    value={municipio}
                    onChange={(event) => setMunicipio(event.target.value)}
                  />
                </label>
                <label className="block rounded-[20px] bg-white/12 p-4 backdrop-blur">
                  <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                    <CalendarDays className="size-4" />
                    Exercício
                  </span>
                  <input
                    className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-white/40"
                    value={ano}
                    onChange={(event) => setAno(event.target.value)}
                  />
                </label>
                <label className="block rounded-[20px] bg-white/12 p-4 backdrop-blur">
                  <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                    <FolderOpen className="size-4" />
                    UPC
                  </span>
                  <input
                    className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-white/40"
                    value={upc}
                    onChange={(event) => setUpc(event.target.value)}
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <label className="block flex-1">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                    Prestação de contas ID
                  </span>
                  <input
                    className="w-full rounded-full border border-white/15 bg-white px-5 py-3 font-mono text-xs text-slate-800 outline-none"
                    value={prestacaoId}
                    onChange={(event) => setPrestacaoId(event.target.value)}
                  />
                </label>
                <button
                  className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#2545d7] shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
                  onClick={() => setPainelAberto(true)}
                  type="button"
                >
                  <ClipboardCheck className="size-4" />
                  Carregar painel
                </button>
              </div>
            </div>
          </section>

          {painelAberto ? (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {indicadores.map((item) => (
                  <article
                    className="rounded-[24px] border border-white/70 bg-white p-5 shadow-[0_18px_50px_rgba(20,32,30,0.06)]"
                    key={item.label}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                    <strong className="mt-4 block text-4xl font-semibold text-slate-950">{item.valor}</strong>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{item.nota}</p>
                  </article>
                ))}
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <article className="rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(43,109,255,0.12)_0%,rgba(15,118,110,0.12)_100%)] text-[#2545d7]">
                        <FileText className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">Modelos da IN</h3>
                        <p className="text-sm text-slate-500">Preenchidos, incompletos e pendentes para envio.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 p-5 md:grid-cols-2">
                    {modelos.map((modelo) => (
                      <Link
                        className="rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 transition hover:-translate-y-0.5 hover:border-[#cfe0ff]"
                        href={buildModeloHref(modelo.href, prestacaoId)}
                        key={modelo.codigo}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2545d7]">
                              {modelo.codigo}
                            </p>
                            <h4 className="mt-2 text-base font-semibold text-slate-950">{modelo.nome}</h4>
                            <p className="mt-1 text-sm text-slate-500">{modelo.status}</p>
                          </div>
                          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                            {modelo.pendencias}
                          </span>
                        </div>
                        <div className="mt-5 h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-[linear-gradient(135deg,#2b6dff_0%,#0f766e_100%)]"
                            style={{ width: `${modelo.progresso}%` }}
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-slate-500">{modelo.progresso}% preenchido</span>
                          <span className="font-semibold text-[#2545d7]">Abrir</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </article>

                <article className="rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-[#fff7ed] text-[#c2410c]">
                        <AlertTriangle className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">Pendências para envio</h3>
                        <p className="text-sm text-slate-500">Itens que bloqueiam a entrega dos modelos.</p>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {pendencias.map((item) => (
                      <div className="flex gap-3 px-6 py-4" key={item}>
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                        <p className="text-sm leading-6 text-slate-600">{item}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <article className="rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-[#ecfeff] text-[#0e7490]">
                        <FileArchive className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">Arquivos vinculados</h3>
                        <p className="text-sm text-slate-500">Bases importadas e documentos usados pelos modelos.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 p-5">
                    {arquivosImportados.map((arquivo) => (
                      <div
                        className="flex items-center justify-between gap-4 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3"
                        key={arquivo.nome}
                      >
                        <div className="flex items-center gap-3">
                          <FileCheck2 className="size-4 text-[#0f766e]" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{arquivo.nome}</p>
                            <p className="text-xs text-slate-500">{arquivo.origem}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          {arquivo.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fd_100%)] p-6 shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-[#edf6f3] text-[#0f766e]">
                      <BadgeCheck className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">Dinâmica do preenchimento</h3>
                      <p className="text-sm text-slate-500">Ordem recomendada para atender a IN.</p>
                    </div>
                  </div>
                  <ol className="mt-6 grid gap-3 md:grid-cols-2">
                    {[
                      "Conferir modelos exigidos",
                      "Preencher campos incompletos",
                      "Anexar documentos obrigatórios",
                      "Gerar PDF e Excel final"
                    ].map((item, index) => (
                      <li className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-white px-4 py-3" key={item}>
                        <span className="flex size-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2b6dff_0%,#0f766e_100%)] text-sm font-semibold text-white">
                          {index + 1}
                        </span>
                        <span className="text-sm text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ol>
                </article>
              </section>
            </>
          ) : (
            <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <article className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(43,109,255,0.12)_0%,rgba(15,118,110,0.12)_100%)] text-[#2545d7]">
                    <Search className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">Prestações recentes</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Escolha um contexto já iniciado ou use os campos acima para abrir outra prestação.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {contextosRecentes.map((contexto) => (
                    <button
                      className={`w-full rounded-[20px] border px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-[#cfe0ff] hover:bg-[#f8fbff] ${
                        prestacaoId === contexto.prestacaoId
                          ? "border-[#cfe0ff] bg-[#f8fbff]"
                          : "border-slate-200 bg-white"
                      }`}
                      key={contexto.prestacaoId}
                      onClick={() => selecionarContexto(contexto)}
                      type="button"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{contexto.nome}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            Município {contexto.municipio} · Exercício {contexto.ano}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#edf6f3] px-3 py-1 text-xs font-semibold text-[#0f766e]">
                          {contexto.status}
                        </span>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-[linear-gradient(135deg,#2b6dff_0%,#0f766e_100%)]"
                          style={{ width: `${contexto.progresso}%` }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </article>

              <article className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fd_100%)] p-6 shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf6f3] text-[#0f766e]">
                    <ClipboardCheck className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">Ao carregar o painel</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      A tela muda para o acompanhamento dos modelos da IN, com pendências, anexos e arquivos vinculados.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {[
                    "Modelos preenchidos e incompletos",
                    "Pendências que bloqueiam o envio",
                    "Arquivos importados e anexos vinculados",
                    "Acesso direto ao Modelo 01 da prestação"
                  ].map((item) => (
                    <div className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-white px-4 py-3" key={item}>
                      <CheckCircle2 className="size-4 shrink-0 text-[#0f766e]" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#101828] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5"
                  onClick={() => setPainelAberto(true)}
                  type="button"
                >
                  <ClipboardCheck className="size-4" />
                  Carregar painel da prestação
                </button>
              </article>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
