"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Landmark,
  Layers3,
  LayoutDashboard,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Upload,
  UserRound
} from "lucide-react";

type ContextoRecente = {
  municipio: string;
  nomeMunicipio: string;
  ano: string;
  codigoUg: string;
  nomeUg: string;
  upc: string;
  cpfGestor: string;
  nomeGestor: string;
  periodoInicio: string;
  periodoFim: string;
  prestacaoId: string;
  status: string;
  progresso: number;
};

type ChecklistItem = {
  codigo: string;
  titulo: string;
  origem: string;
  status: string;
  pendencias: number;
  href: string;
  accent: "blue" | "yellow" | "violet" | "teal";
};

const menu = [
  { key: "prestacao", label: "Prestação", href: "/dashboard", icon: LayoutDashboard },
  { key: "modelos", label: "Modelos da IN", href: "/modelos/modelo-01", icon: Layers3 },
  { key: "importacoes", label: "Importação SIM", href: "/importacoes", icon: Upload },
  { key: "anexos", label: "Anexos", href: "/anexos", icon: FolderOpen },
  { key: "pendencias", label: "Pendências", href: "/dashboard", icon: FileText },
  { key: "relatorios", label: "Relatórios", href: "/dashboard", icon: BarChart3 },
  { key: "admin", label: "Administração", href: "/dashboard", icon: Settings }
] as const;

const checklist: ChecklistItem[] = [
  {
    codigo: "Modelo 01",
    titulo: "Rol de Responsáveis",
    origem: "SIM + manual",
    status: "Em preenchimento",
    pendencias: 4,
    href: "/modelos/modelo-01",
    accent: "blue"
  },
  {
    codigo: "Modelo 02",
    titulo: "Relatório de Desempenho da Gestão",
    origem: "Template IN",
    status: "Pendente",
    pendencias: 7,
    href: "/modelos/modelo-02",
    accent: "violet"
  },
  {
    codigo: "Anexos",
    titulo: "Documentos obrigatórios e comprovantes",
    origem: "Upload",
    status: "Pendente",
    pendencias: 9,
    href: "/anexos",
    accent: "yellow"
  },
  {
    codigo: "Exportação",
    titulo: "Dossiê final PDF e Excel",
    origem: "Sistema",
    status: "Bloqueado",
    pendencias: 1,
    href: "/dashboard",
    accent: "teal"
  }
];

function buildHref(baseHref: string, prestacaoId: string) {
  const params = new URLSearchParams();
  if (prestacaoId.trim()) params.set("prestacao_contas_id", prestacaoId.trim());
  return `${baseHref}${params.size ? `?${params.toString()}` : ""}`;
}

function statusTone(status: string): "success" | "warning" | "danger" | "info" {
  const normalized = status.toLowerCase();
  if (normalized.includes("concl") || normalized.includes("completo")) return "success";
  if (normalized.includes("bloque") || normalized.includes("erro")) return "danger";
  if (normalized.includes("pend") || normalized.includes("preench")) return "warning";
  return "info";
}

export function PrestacaoDashboardClient() {
  const [nomeMunicipio, setNomeMunicipio] = useState("Prefeitura Municipal");
  const [municipio, setMunicipio] = useState("014");
  const [ano, setAno] = useState("2026");
  const [codigoUg, setCodigoUg] = useState("001");
  const [nomeUg, setNomeUg] = useState("Prefeitura Municipal");
  const [upc, setUpc] = useState("Prefeitura Municipal");
  const [cpfGestor, setCpfGestor] = useState("00000000000");
  const [nomeGestor, setNomeGestor] = useState("Gestor da Pasta");
  const [periodoInicio, setPeriodoInicio] = useState("2026-01-01");
  const [periodoFim, setPeriodoFim] = useState("2026-12-31");
  const [prestacaoId, setPrestacaoId] = useState("");
  const [salvandoContexto, setSalvandoContexto] = useState(false);
  const [statusContexto, setStatusContexto] = useState("Selecione ou abra um contexto para iniciar.");
  const [contextosRecentes, setContextosRecentes] = useState<ContextoRecente[]>([]);
  const [carregandoRecentes, setCarregandoRecentes] = useState(true);
  const [editandoContexto, setEditandoContexto] = useState(false);

  useEffect(() => {
    void carregarRecentes();
  }, []);

  async function carregarRecentes() {
    setCarregandoRecentes(true);
    try {
      const response = await fetch("/api/contextos/recentes");
      if (!response.ok) throw new Error("Falha ao carregar recentes.");
      const data = (await response.json()) as { contextos: ContextoRecente[] };
      setContextosRecentes(data.contextos);
    } catch {
      setStatusContexto("Não foi possível carregar prestações recentes.");
    } finally {
      setCarregandoRecentes(false);
    }
  }

  function selecionarContexto(contexto: ContextoRecente) {
    setMunicipio(contexto.municipio);
    setNomeMunicipio(contexto.nomeMunicipio);
    setAno(contexto.ano);
    setCodigoUg(contexto.codigoUg);
    setNomeUg(contexto.nomeUg);
    setUpc(contexto.upc);
    setCpfGestor(contexto.cpfGestor);
    setNomeGestor(contexto.nomeGestor);
    setPeriodoInicio(contexto.periodoInicio);
    setPeriodoFim(contexto.periodoFim);
    setPrestacaoId(contexto.prestacaoId);
    setStatusContexto("Contexto recente selecionado.");
    setEditandoContexto(false);
  }

  async function abrirContexto() {
    setSalvandoContexto(true);
    setStatusContexto("Abrindo contexto...");

    try {
      const response = await fetch("/api/contextos/abrir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo_municipio: municipio,
          nome_municipio: nomeMunicipio,
          exercicio: Number(ano),
          codigo_ug: codigoUg,
          nome_ug: nomeUg,
          nome_upc: upc,
          cpf_gestor: cpfGestor,
          nome_gestor: nomeGestor,
          periodo_inicio: periodoInicio,
          periodo_fim: periodoFim,
          tipo_prestacao: "anual"
        })
      });

      if (!response.ok) throw new Error("Falha ao abrir contexto.");

      const data = (await response.json()) as {
        prestacao_contas: { id: string };
        municipio: { codigo_municipio: string; nome: string };
        upc: { nome: string };
      };

      setPrestacaoId(data.prestacao_contas.id);
      setMunicipio(data.municipio.codigo_municipio);
      setNomeMunicipio(data.municipio.nome);
      setUpc(data.upc.nome);
      setStatusContexto("Contexto aberto. Checklist liberado.");
      setEditandoContexto(false);
      await carregarRecentes();
    } catch {
      setStatusContexto("Não foi possível abrir o contexto.");
    } finally {
      setSalvandoContexto(false);
    }
  }

  const progresso = prestacaoId ? 38 : 12;
  const pendencias = checklist.reduce((total, item) => total + item.pendencias, 0);

  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#191c1e]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] bg-[#f8fafc] shadow-[0_0_32px_rgba(30,41,59,.08)] lg:grid-cols-[234px_minmax(0,1fr)]">
        <Sidebar progresso={progresso} />

        <div className="min-w-0">
          <Topbar municipio={nomeMunicipio} ano={ano} upc={upc} />

          <main className="px-4 py-5 sm:px-6">
            <ContextBar
              ano={ano}
              codigoUg={codigoUg}
              municipio={municipio}
              nomeGestor={nomeGestor}
              nomeMunicipio={nomeMunicipio}
              periodoFim={periodoFim}
              periodoInicio={periodoInicio}
              upc={upc}
              onEdit={() => setEditandoContexto((value) => !value)}
            />

            {editandoContexto ? (
              <ContextEditor
                ano={ano}
                codigoUg={codigoUg}
                cpfGestor={cpfGestor}
                nomeGestor={nomeGestor}
                nomeMunicipio={nomeMunicipio}
                nomeUg={nomeUg}
                municipio={municipio}
                periodoFim={periodoFim}
                periodoInicio={periodoInicio}
                prestacaoId={prestacaoId}
                salvando={salvandoContexto}
                status={statusContexto}
                upc={upc}
                onAbrir={() => void abrirContexto()}
                onAtualizar={() => void carregarRecentes()}
                setters={{
                  ano: setAno,
                  codigoUg: setCodigoUg,
                  cpfGestor: setCpfGestor,
                  municipio: setMunicipio,
                  nomeGestor: setNomeGestor,
                  nomeMunicipio: setNomeMunicipio,
                  nomeUg: setNomeUg,
                  periodoFim: setPeriodoFim,
                  periodoInicio: setPeriodoInicio,
                  prestacaoId: setPrestacaoId,
                  upc: setUpc
                }}
              />
            ) : null}

            <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_288px]">
              <ChecklistPanel pendencias={pendencias} prestacaoId={prestacaoId} />

              <aside className="grid gap-5">
                <ProgressCard progresso={progresso} prestacaoId={prestacaoId} />
                <RecentCard
                  carregando={carregandoRecentes}
                  contextos={contextosRecentes}
                  onAtualizar={() => void carregarRecentes()}
                  onSelecionar={selecionarContexto}
                />
                <p className="px-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#64748b]">Acessos rápidos</p>
                <QuickAction
                  href={buildHref("/modelos/modelo-01", prestacaoId)}
                  icon={<FileText className="size-5" />}
                  label="Modelo 01"
                  text="Abrir a planilha controlada do Rol de Responsáveis."
                  tone="blue"
                />
                <QuickAction
                  href={buildHref("/importacoes", prestacaoId)}
                  icon={<Upload className="size-5" />}
                  label="Importação SIM"
                  text="Enviar zip ou pasta do exercício sem selecionar mês."
                  tone="violet"
                />
                <QuickAction
                  href={buildHref("/anexos", prestacaoId)}
                  icon={<FolderOpen className="size-5" />}
                  label="Anexos"
                  text="Vincular documentos ao modelo, campo ou responsável."
                  tone="yellow"
                />
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ progresso }: { progresso: number }) {
  return (
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-[#e2e8f0] bg-white lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-[#edf0f4] px-5">
        <div className="grid size-9 place-items-center rounded-lg bg-[linear-gradient(135deg,#dce8ff,#e4ddff)] text-sm font-bold text-[#102a52]">
          UPC
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[.08em] text-[#475569]">Controle</p>
          <h1 className="text-lg font-bold leading-5">Prestação da IN</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = item.key === "prestacao";
          return (
            <Link
              className={`relative flex h-11 items-center gap-3 rounded-lg px-4 text-sm transition ${
                active ? "font-bold text-[#123f66]" : "text-[#5f6368] hover:bg-[#f4f7fa] hover:text-[#1e293b]"
              }`}
              href={item.href}
              key={item.key}
            >
              {active ? <span className="absolute -left-3 h-9 w-[3px] rounded-r bg-[#0058be]" /> : null}
              <Icon className="size-[18px]" strokeWidth={active ? 2.2 : 1.7} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-4 rounded-xl border border-[#e2e8f0] bg-white p-3 shadow-[0_4px_12px_rgba(30,41,59,.04)]">
        <div className="flex items-center justify-between">
          <span className="rounded border border-[#dbe2ea] bg-[#f8fafc] px-2 py-1 text-[10px] font-bold">IN 01/2025</span>
          <Sparkles className="size-4 text-[#475569]" />
        </div>
        <p className="mt-3 text-xs font-medium leading-5">Trabalhe por contexto: UPC, modelos, anexos e pacote final.</p>
        <div className="mt-3 h-1.5 rounded-full bg-[#e5e7eb]">
          <div className="h-full rounded-full bg-[#334155]" style={{ width: `${progresso}%` }} />
        </div>
        <p className="mt-2 text-[10px] text-[#64748b]">{progresso}% do fluxo inicial preparado</p>
      </div>

      <div className="px-5 pb-4">
        <div className="grid size-8 place-items-center rounded-full bg-[#4b5563] text-xs font-bold text-white">N</div>
      </div>
    </aside>
  );
}

function Topbar({ municipio, ano, upc }: { municipio: string; ano: string; upc: string }) {
  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-[#e2e8f0] bg-white px-4 sm:px-6">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[.08em] text-[#475569]">Workspace</p>
        <p className="truncate text-sm font-bold">{municipio} / {ano} / {upc}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden h-9 w-64 items-center gap-2 rounded-full bg-[#f1f3f6] px-4 text-sm text-[#7b7f87] md:flex">
          <Search className="size-4" />
          <span className="truncate">Buscar modelo, anexo ou pendência</span>
        </div>
        <div className="flex h-9 items-center gap-2 rounded-full bg-[#075aa9] px-4 text-sm font-medium text-white shadow-sm">
          <span className="size-2 rounded-full bg-[#52c77a]" />
          Administrador
        </div>
        <div className="grid size-9 place-items-center rounded-full bg-[#45484d] text-xs font-bold text-white">N</div>
      </div>
    </header>
  );
}

type ContextBarProps = {
  municipio: string;
  nomeMunicipio: string;
  ano: string;
  upc: string;
  codigoUg: string;
  nomeGestor: string;
  periodoInicio: string;
  periodoFim: string;
  onEdit: () => void;
};

function ContextBar(props: ContextBarProps) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[#78909c] bg-white px-4 py-3 shadow-[0_4px_12px_rgba(30,41,59,.07)] xl:flex-row xl:items-center xl:justify-between">
      <div className="grid flex-1 gap-x-6 gap-y-2 sm:grid-cols-2 xl:grid-cols-[1.1fr_.75fr_1.1fr_1.35fr]">
        <ContextMeta icon={<Building2 />} label="Município" value={`${props.municipio} - ${props.nomeMunicipio}`} />
        <ContextMeta icon={<CalendarDays />} label="Exercício" value={props.ano} />
        <ContextMeta icon={<Landmark />} label="UPC / UG" value={`${props.upc} (${props.codigoUg})`} />
        <ContextMeta
          icon={<UserRound />}
          label={`Gestor (${formatDateShort(props.periodoInicio)} a ${formatDateShort(props.periodoFim)})`}
          value={props.nomeGestor}
        />
      </div>
      <div className="flex shrink-0 flex-wrap gap-2 xl:justify-end">
        <button className="context-button" onClick={props.onEdit} type="button">Trocar UPC</button>
        <button className="context-button" onClick={props.onEdit} type="button">Trocar Município</button>
      </div>
    </section>
  );
}

function ContextMeta({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 border-[#e5e7eb] xl:border-r xl:pr-5 xl:last:border-r-0">
      <span className="text-[#123f66] [&>svg]:size-4">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[9px] uppercase tracking-[.06em] text-[#525861]">{label}</span>
        <span className="block truncate text-xs font-medium text-[#202327]">{value}</span>
      </span>
    </div>
  );
}

type Setters = Record<
  "ano" | "codigoUg" | "cpfGestor" | "municipio" | "nomeGestor" | "nomeMunicipio" | "nomeUg" | "periodoFim" | "periodoInicio" | "prestacaoId" | "upc",
  (value: string) => void
>;

type ContextEditorProps = {
  ano: string;
  codigoUg: string;
  cpfGestor: string;
  municipio: string;
  nomeGestor: string;
  nomeMunicipio: string;
  nomeUg: string;
  periodoFim: string;
  periodoInicio: string;
  prestacaoId: string;
  salvando: boolean;
  status: string;
  upc: string;
  setters: Setters;
  onAbrir: () => void;
  onAtualizar: () => void;
};

function ContextEditor(props: ContextEditorProps) {
  const fields: Array<[string, string, keyof Setters, string?]> = [
    ["Município", props.municipio, "municipio"],
    ["Nome do município", props.nomeMunicipio, "nomeMunicipio"],
    ["Exercício", props.ano, "ano"],
    ["UPC", props.upc, "upc"],
    ["Código da UG", props.codigoUg, "codigoUg"],
    ["Nome da UG", props.nomeUg, "nomeUg"],
    ["CPF do gestor", props.cpfGestor, "cpfGestor"],
    ["Nome do gestor", props.nomeGestor, "nomeGestor"],
    ["Início da gestão", props.periodoInicio, "periodoInicio", "date"],
    ["Fim da gestão", props.periodoFim, "periodoFim", "date"],
    ["Prestação de contas ID", props.prestacaoId, "prestacaoId"]
  ];

  return (
    <section className="mt-3 rounded-xl border border-[#dbe2ea] bg-white p-4 shadow-[0_4px_12px_rgba(30,41,59,.04)]">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {fields.map(([label, value, setter, type]) => (
          <label className="block" key={setter}>
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.06em] text-[#64748b]">{label}</span>
            <input
              className="h-10 w-full rounded-lg border border-[#dce2e8] bg-white px-3 text-sm outline-none transition focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/15"
              onChange={(event) => props.setters[setter](event.target.value)}
              type={type ?? "text"}
              value={value}
            />
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-3 border-t border-[#edf0f3] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[#64748b]">{props.status}</p>
        <div className="flex gap-2">
          <button className="secondary-button" onClick={props.onAtualizar} type="button">
            <RefreshCw className="size-4" />
            Atualizar
          </button>
          <button className="primary-button" disabled={props.salvando} onClick={props.onAbrir} type="button">
            <ClipboardCheck className="size-4" />
            {props.salvando ? "Abrindo..." : "Abrir contexto"}
          </button>
        </div>
      </div>
    </section>
  );
}

function ChecklistPanel({ pendencias, prestacaoId }: { pendencias: number; prestacaoId: string }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
      <div className="flex flex-col gap-3 px-5 pb-4 pt-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#525861]">Checklist da IN</p>
          <h2 className="mt-1 text-2xl font-bold tracking-[-.03em]">O que precisa ser feito agora</h2>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-[#66500b]">
          <FileSpreadsheet className="size-4" />
          {pendencias} pendências
        </div>
      </div>

      <div className="overflow-x-auto px-5 pb-5">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-[110px_minmax(180px,1fr)_105px_115px_70px] border-b border-[#e8ebef] px-3 py-3 text-[10px] font-bold uppercase tracking-[.05em]">
            <span>Item</span>
            <span>Descrição</span>
            <span>Origem</span>
            <span>Status</span>
            <span>Ação</span>
          </div>
          <div>
            {checklist.map((item) => (
              <ChecklistRow item={item} key={item.codigo} prestacaoId={prestacaoId} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChecklistRow({ item, prestacaoId }: { item: ChecklistItem; prestacaoId: string }) {
  return (
    <div className="grid min-h-[76px] grid-cols-[110px_minmax(180px,1fr)_105px_115px_70px] items-center border-b border-[#edf0f3] px-3 text-xs last:border-b-0 hover:bg-[#f8fafc]">
      <div className="flex items-center gap-2">
        <AccentDot tone={item.accent} />
        <span className="font-medium">{item.codigo}</span>
      </div>
      <p className="max-w-[220px] leading-5">{item.titulo}</p>
      <span className="leading-5 text-[#72767d]">{item.origem}</span>
      <StatusPill tone={statusTone(item.status)}>{item.status}</StatusPill>
      <Link className="inline-flex items-center gap-1 font-medium text-[#173e5c]" href={buildHref(item.href, prestacaoId)}>
        Abrir <ArrowUpRight className="size-3.5" />
      </Link>
    </div>
  );
}

function ProgressCard({ progresso, prestacaoId }: { progresso: number; prestacaoId: string }) {
  return (
    <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_8px_18px_rgba(30,41,59,.08)]">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[#525861]">Progresso da prestação</p>
        <div className="grid size-8 place-items-center rounded-full bg-[#f4f5f7] text-[#515760]">
          <CircleUserRound className="size-4" />
        </div>
      </div>
      <p className="mt-2 text-5xl font-extrabold tracking-[-.06em]">{progresso}%</p>
      <div className="mt-2 h-1.5 rounded-full bg-[#d9dde2]">
        <div className="h-full rounded-full bg-[#1768a8]" style={{ width: `${progresso}%` }} />
      </div>
      <p className="mt-4 text-xs leading-5">{prestacaoId ? "Contexto aberto para continuar os modelos." : "Abra o contexto para liberar o fluxo real."}</p>
    </section>
  );
}

function RecentCard({
  carregando,
  contextos,
  onAtualizar,
  onSelecionar
}: {
  carregando: boolean;
  contextos: ContextoRecente[];
  onAtualizar: () => void;
  onSelecionar: (contexto: ContextoRecente) => void;
}) {
  return (
    <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_8px_18px_rgba(30,41,59,.08)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[#525861]">Recentes</p>
          <h3 className="mt-1 text-sm font-medium">Prestações abertas</h3>
        </div>
        <button className="grid size-8 place-items-center rounded-full bg-[#f4f5f7] text-[#515760]" onClick={onAtualizar} type="button">
          <RefreshCw className="size-4" />
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {carregando ? (
          <EmptyState text="Carregando prestações..." />
        ) : contextos.length ? (
          contextos.slice(0, 3).map((contexto) => (
            <button
              className="w-full rounded-lg border border-[#e4e8ed] p-3 text-left transition hover:border-[#9bb9d7] hover:bg-[#f8fbff]"
              key={contexto.prestacaoId}
              onClick={() => onSelecionar(contexto)}
              type="button"
            >
              <p className="truncate text-xs font-bold">{contexto.upc || contexto.nomeMunicipio}</p>
              <p className="mt-1 text-[10px] text-[#64748b]">{contexto.municipio} - {contexto.ano}</p>
            </button>
          ))
        ) : (
          <EmptyState text="Nenhuma prestação recente encontrada." />
        )}
      </div>
    </section>
  );
}

function QuickAction({
  href,
  icon,
  label,
  text,
  tone
}: {
  href: string;
  icon: ReactNode;
  label: string;
  text: string;
  tone: "blue" | "yellow" | "violet";
}) {
  const toneClass = {
    blue: "bg-[#1371c4]",
    yellow: "bg-[#efa914]",
    violet: "bg-[#7442c8]"
  }[tone];

  return (
    <Link className="group rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-[0_8px_18px_rgba(30,41,59,.08)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(30,41,59,.11)]" href={href}>
      <div className="flex gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-sm ${toneClass}`}>{icon}</span>
        <span className="min-w-0">
          <span className="flex items-center gap-1 text-sm font-medium">
            {label}
            <ChevronRight className="size-3.5 opacity-0 transition group-hover:opacity-100" />
          </span>
          <span className="mt-1 block text-xs leading-5 text-[#71757c]">{text}</span>
        </span>
      </div>
    </Link>
  );
}

function StatusPill({ children, tone }: { children: ReactNode; tone: "success" | "warning" | "danger" | "info" }) {
  const toneClass = {
    success: "bg-[#dcfce7] text-[#166534]",
    warning: "bg-[#dce9f8] text-[#173e5c]",
    danger: "bg-[#dce9f8] text-[#173e5c]",
    info: "bg-[#dce9f8] text-[#173e5c]"
  }[tone];

  return <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-medium leading-3 ${toneClass}`}>{children}</span>;
}

function AccentDot({ tone }: { tone: ChecklistItem["accent"] }) {
  const toneClass = {
    blue: "bg-[#1667a8]",
    yellow: "bg-[#e5a11a]",
    violet: "bg-[#8454bd]",
    teal: "bg-[#2ba978]"
  }[tone];
  return <span className={`size-1.5 shrink-0 rounded-full ${toneClass}`} />;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#d6dbe1] px-4 py-5 text-center text-xs leading-5 text-[#858990]">
      {text}
    </div>
  );
}

function formatDateShort(value: string) {
  const [, month, day] = value.split("-");
  return day && month ? `${day}/${month}` : value;
}
