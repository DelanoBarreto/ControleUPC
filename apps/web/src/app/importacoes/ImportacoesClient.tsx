"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileArchive,
  FolderOpen,
  LayoutDashboard,
  ListChecks,
  SearchCheck,
  UploadCloud
} from "lucide-react";

import { ARQUIVOS_SIM_ESPERADOS, type ArquivoDetectadoImportacao } from "@controle-upc/shared";

type ImportacoesClientProps = {
  codigoMunicipioInicial: string;
  exercicioInicial: string;
  prestacaoContasIdInicial: string;
};

const passosImportacao = [
  "Selecione município, exercício e a prestação de contas vinculada.",
  "Envie uma pasta ou um .zip com os arquivos do período.",
  "O sistema detecta competência e layout automaticamente.",
  "O lote é registrado para processamento e auditoria.",
  "Abra o Modelo 01 já no mesmo contexto."
];

const indicadoresImportacao = [
  { label: "Lotes", value: "0", note: "registrados nesta base" },
  { label: "Arquivos", value: "0", note: "aguardando envio" },
  { label: "Competências", value: "Auto", note: "inferidas pelo nome" },
  { label: "Destino", value: "Storage", note: "original preservado" }
];

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  const kb = value / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function buildModeloHref(prestacaoContasId: string) {
  const id = prestacaoContasId.trim();
  if (!id) return "/modelos/modelo-01";
  return `/modelos/modelo-01?prestacao_contas_id=${encodeURIComponent(id)}`;
}

export default function ImportacoesClient({
  codigoMunicipioInicial,
  exercicioInicial,
  prestacaoContasIdInicial
}: ImportacoesClientProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [codigoMunicipio, setCodigoMunicipio] = useState(codigoMunicipioInicial);
  const [exercicio, setExercicio] = useState(exercicioInicial);
  const [prestacaoContasId, setPrestacaoContasId] = useState(prestacaoContasIdInicial);
  const [analysis, setAnalysis] = useState<ArquivoDetectadoImportacao[]>([]);
  const [loteId, setLoteId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [storageBasePath, setStorageBasePath] = useState<string | null>(null);
  const [status, setStatus] = useState("Aguardando arquivos.");
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const zipInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const summary = useMemo(() => {
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    return {
      totalArquivos: files.length,
      totalBytes: formatBytes(totalBytes)
    };
  }, [files]);

  const modeloHref = buildModeloHref(prestacaoContasId);
  const temPrestacao = prestacaoContasId.trim().length > 0;

  function appendFiles(list: FileList | null) {
    if (!list) return;

    setFiles((current) => {
      const next = [...current, ...Array.from(list)];
      const seen = new Set<string>();

      return next.filter((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });
  }

  function clearFiles() {
    setFiles([]);
    setAnalysis([]);
    setLoteId(null);
    setJobId(null);
    setStorageBasePath(null);
    setStatus("Aguardando arquivos.");

    if (zipInputRef.current) zipInputRef.current.value = "";
    if (folderInputRef.current) folderInputRef.current.value = "";
  }

  async function analyzeLot() {
    if (files.length === 0) return;

    setAnalyzing(true);
    setStatus("Analisando lote...");

    try {
      const response = await fetch("/api/importacoes/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo_municipio: codigoMunicipio,
          exercicio: Number(exercicio),
          arquivos: files.map((file) => ({
            nome_arquivo: file.name,
            tamanho_bytes: file.size
          }))
        })
      });

      if (!response.ok) throw new Error("Falha ao analisar lote.");

      const data = (await response.json()) as {
        arquivos_detectados: ArquivoDetectadoImportacao[];
      };

      setAnalysis(data.arquivos_detectados);
      setLoteId(null);
      setJobId(null);
      setStorageBasePath(null);
      setStatus("Lote analisado com sucesso.");
    } catch {
      setStatus("Não foi possível analisar o lote.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function registerImportLot() {
    if (files.length === 0) return;

    setImporting(true);
    setStatus("Registrando lote...");

    try {
      const analysisByName = new Map(analysis.map((item) => [item.nome_arquivo, item]));
      const formData = new FormData();

      formData.set("codigo_municipio", codigoMunicipio);
      formData.set("exercicio", exercicio);
      if (prestacaoContasId.trim()) {
        formData.set("prestacao_contas_id", prestacaoContasId.trim());
      }
      formData.set(
        "arquivos_detectados",
        JSON.stringify(
          files.map((file) => {
            const detected = analysisByName.get(file.name);
            return {
              nome_arquivo: file.name,
              layout_codigo: detected?.layout_codigo ?? null,
              competencia: detected?.competencia ?? null
            };
          })
        )
      );

      for (const file of files) {
        formData.append("files", file);
      }

      const response = await fetch("/api/importacoes/lotes", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Falha ao registrar lote.");

      const data = (await response.json()) as {
        lote_id: string;
        job_id: string;
        storage_base_path: string;
        prestacao_contas_id: string | null;
      };

      setLoteId(data.lote_id);
      setJobId(data.job_id);
      setStorageBasePath(data.storage_base_path);
      if (!prestacaoContasId.trim() && data.prestacao_contas_id) {
        setPrestacaoContasId(data.prestacao_contas_id);
      }
      setStatus("Lote registrado com sucesso.");
    } catch {
      setStatus("Não foi possível registrar o lote.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#edf2ff_0%,#f7f9fc_34%,#eef4f1_100%)] text-[#101828]">
      <section className="mx-auto max-w-7xl px-6 pt-6">
        <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-[linear-gradient(135deg,#233876_0%,#2545d7_52%,#0f766e_100%)] px-6 py-6 text-white shadow-[0_28px_90px_rgba(37,69,215,0.22)] md:px-8 md:py-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">Menu de importações</p>
                <h1 className="text-3xl font-semibold md:text-4xl">Painel de importação SIM</h1>
                <p className="max-w-3xl text-sm leading-6 text-white/80 md:text-base">
                  Envie os arquivos auxiliares em um módulo próprio. O sistema registra o lote, preserva o original e
                  prepara o contexto para o Modelo 01.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  className="inline-flex min-w-[220px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#101828] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 ring-1 ring-white/20 transition hover:-translate-y-0.5"
                  href="/dashboard"
                >
                  <ArrowLeft className="size-4 shrink-0" />
                  <span>Painel da prestação</span>
                </Link>
                <Link
                  className={`inline-flex min-w-[220px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${
                    temPrestacao
                      ? "bg-[#101828] text-white shadow-lg shadow-black/20 ring-1 ring-white/20"
                      : "pointer-events-none bg-white/20 text-white/70"
                  }`}
                  href={modeloHref}
                >
                  <LayoutDashboard className="size-4 shrink-0" />
                  <span>Abrir Modelo 01</span>
                </Link>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="block rounded-[20px] bg-white/12 p-4 backdrop-blur">
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                  <ListChecks className="size-4" />
                  Prestação de contas ID
                </span>
                <input
                  className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-white/40"
                  onChange={(event) => setPrestacaoContasId(event.target.value)}
                  placeholder="Cole o id da prestação"
                  value={prestacaoContasId}
                />
              </label>
              <label className="block rounded-[20px] bg-white/12 p-4 backdrop-blur">
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                  <UploadCloud className="size-4" />
                  Município
                </span>
                <input
                  className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-white/40"
                  onChange={(event) => setCodigoMunicipio(event.target.value)}
                  value={codigoMunicipio}
                />
              </label>
              <label className="block rounded-[20px] bg-white/12 p-4 backdrop-blur">
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                  <FolderOpen className="size-4" />
                  Exercício
                </span>
                <input
                  className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-white/40"
                  onChange={(event) => setExercicio(event.target.value)}
                  value={exercicio}
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {indicadoresImportacao.map((item) => (
              <article
                className="rounded-[24px] border border-white/70 bg-white p-5 shadow-[0_18px_50px_rgba(20,32,30,0.06)]"
                key={item.label}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                <strong className="mt-4 block text-3xl font-semibold text-slate-950">{item.value}</strong>
                <p className="mt-3 text-sm leading-6 text-slate-500">{item.note}</p>
              </article>
            ))}
          </section>

          <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(43,109,255,0.12)_0%,rgba(15,118,110,0.12)_100%)] text-[#2545d7]">
                  <UploadCloud className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Envio do lote auxiliar</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Envie uma pasta ou um .zip. A competência é inferida automaticamente pelos nomes dos arquivos.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Município
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#2545d7]"
                  onChange={(event) => setCodigoMunicipio(event.target.value)}
                  value={codigoMunicipio}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Exercício
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#2545d7]"
                  onChange={(event) => setExercicio(event.target.value)}
                  value={exercicio}
                />
              </label>
            </div>

            <div className="px-6 pb-6">
              <div className="rounded-[24px] border border-dashed border-[#b9c7df] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-6 py-10 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2b6dff_0%,#0f766e_100%)] text-white">
                  <FileArchive className="size-7" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-950">
                  Arraste a pasta do exercício ou selecione um arquivo .zip
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  O arquivo original será preservado no Storage para auditoria e reprocessamento.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <input
                    ref={zipInputRef}
                    className="hidden"
                    multiple
                    onChange={(event) => appendFiles(event.target.files)}
                    type="file"
                    accept=".zip,.csv,.bas,.lco,.cpf,.txt,.xls,.xlsx,.doc,.docx"
                  />
                  <input
                    ref={folderInputRef}
                    className="hidden"
                    multiple
                    onChange={(event) => appendFiles(event.target.files)}
                    type="file"
                    accept=".csv,.bas,.lco,.cpf,.txt,.xls,.xlsx,.doc,.docx"
                    // @ts-expect-error - browsers support folder upload via webkitdirectory
                    webkitdirectory="true"
                  />
                  <button
                    className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full bg-[#101828] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5"
                    onClick={() => zipInputRef.current?.click()}
                    type="button"
                  >
                    <FileArchive className="size-4" />
                    Zip
                  </button>
                  <button
                    className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    onClick={() => folderInputRef.current?.click()}
                    type="button"
                  >
                    <FolderOpen className="size-4" />
                    Pasta
                  </button>
                  <button
                    className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={analyzeLot}
                    type="button"
                    disabled={analyzing || files.length === 0}
                  >
                    <SearchCheck className="size-4" />
                    {analyzing ? "Analisando..." : "Analisar lote"}
                  </button>
                  <button
                    className="inline-flex min-w-[140px] items-center justify-center rounded-full bg-[#2545d7] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={registerImportLot}
                    type="button"
                    disabled={importing || files.length === 0}
                  >
                    {importing ? "Registrando..." : "Importar"}
                  </button>
                  <button
                    className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    onClick={clearFiles}
                    type="button"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-950">Arquivos detectados</h2>
                <span className="rounded-full bg-[#edf6f3] px-3 py-1 text-xs font-semibold text-[#0f766e]">
                  {summary.totalArquivos} arquivos | {summary.totalBytes}
                </span>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {files.length === 0 ? (
                <div className="px-6 py-8 text-sm text-slate-500">Nenhum arquivo selecionado ainda.</div>
              ) : (
                files.map((file, index) => {
                  const detected = analysis[index];
                  return (
                    <div
                      className="grid gap-2 px-6 py-4 md:grid-cols-[1fr_120px_120px_120px]"
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                    >
                      <div className="text-sm font-semibold text-slate-900">{file.name}</div>
                      <div className="text-sm text-slate-500">{formatBytes(file.size)}</div>
                      <div className="text-sm text-slate-500">{detected?.layout_codigo ?? "Layout?"}</div>
                      <div className="text-sm text-slate-500">{detected?.competencia ?? "Competência?"}</div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-950">Fluxo</h2>
            </div>
            <ol className="space-y-3 p-5">
              {passosImportacao.map((item, index) => (
                <li className="flex gap-3 text-sm" key={item}>
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2b6dff_0%,#0f766e_100%)] text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-950">Status</h2>
            </div>
            <div className="space-y-3 p-5 text-sm text-slate-500">
              <p>Status atual: {status}</p>
              <p>Lote: {loteId ?? "Não registrado"}</p>
              <p>Job: {jobId ?? "Não enfileirado"}</p>
              <p>Storage: {storageBasePath ?? "Aguardando registro"}</p>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fd_100%)] p-6 shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#edf6f3] text-[#0f766e]">
                <ListChecks className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Abrir Modelo 01</h3>
                <p className="text-sm text-slate-500">
                  Quando a prestação estiver vinculada, o botão leva direto para o mesmo contexto.
                </p>
              </div>
            </div>

            <Link
              className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${
                temPrestacao
                  ? "border border-slate-200 bg-white text-slate-900 shadow-lg shadow-slate-300"
                  : "pointer-events-none bg-slate-100 text-slate-400"
              }`}
              href={modeloHref}
            >
              <ArrowRight className="size-4 shrink-0" />
              <span className="whitespace-nowrap">Abrir Modelo 01</span>
            </Link>
          </section>

          <section className="rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-950">Arquivos esperados</h2>
            </div>
            <div className="grid gap-3 p-5">
              {ARQUIVOS_SIM_ESPERADOS.map((item) => (
                <div
                  className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
