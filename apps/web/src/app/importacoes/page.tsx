"use client";

import { useMemo, useRef, useState } from "react";
import { ARQUIVOS_SIM_ESPERADOS, type ArquivoDetectadoImportacao } from "@controle-upc/shared";

const importSteps = [
  "Selecionar municipio e exercicio.",
  "Enviar uma pasta ou um .zip com os arquivos do ano.",
  "O sistema detecta a competencia e os layouts automaticamente.",
  "O worker grava o original no Storage e processa os CSVs.",
  "A tela mostra sucesso, aviso ou erro por arquivo."
];

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  const kb = value / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export default function ImportacoesPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [codigoMunicipio, setCodigoMunicipio] = useState("014");
  const [exercicio, setExercicio] = useState("2026");
  const [analysis, setAnalysis] = useState<ArquivoDetectadoImportacao[]>([]);
  const [loteId, setLoteId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [storageBasePath, setStorageBasePath] = useState<string | null>(null);
  const [status, setStatus] = useState("Aguardando arquivos");
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
    setStatus("Aguardando arquivos");
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

      if (!response.ok) {
        throw new Error("Falha ao analisar lote.");
      }

      const data = (await response.json()) as {
        arquivos_detectados: ArquivoDetectadoImportacao[];
      };
      setAnalysis(data.arquivos_detectados);
      setLoteId(null);
      setJobId(null);
      setStorageBasePath(null);
      setStatus("Lote analisado com sucesso.");
    } catch {
      setStatus("Nao foi possivel analisar o lote.");
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

      if (!response.ok) {
        throw new Error("Falha ao registrar lote.");
      }

      const data = (await response.json()) as {
        lote_id: string;
        job_id: string;
        storage_base_path: string;
      };
      setLoteId(data.lote_id);
      setJobId(data.job_id);
      setStorageBasePath(data.storage_base_path);
      setStatus("Lote registrado com sucesso.");
    } catch {
      setStatus("Nao foi possivel registrar o lote.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <section className="border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
              Controle UPC
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Importacao SIM</h1>
          </div>
          <a
            className="rounded border border-[var(--line)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[#f6f8f7]"
            href="/"
          >
            Voltar
          </a>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-md border border-[var(--line)] bg-white">
            <div className="border-b border-[var(--line)] px-5 py-4">
              <h2 className="text-lg font-semibold">Envio simples</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                O usuario envia uma pasta ou um zip do municipio e do exercicio. O sistema detecta automaticamente a competencia de cada arquivo.
              </p>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Municipio</span>
                <input
                  className="w-full rounded border border-[var(--line)] bg-[#f9fbfa] px-3 py-2 text-sm text-[var(--foreground)] outline-none"
                  onChange={(event) => setCodigoMunicipio(event.target.value)}
                  value={codigoMunicipio}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Exercicio</span>
                <input
                  className="w-full rounded border border-[var(--line)] bg-[#f9fbfa] px-3 py-2 text-sm text-[var(--foreground)] outline-none"
                  onChange={(event) => setExercicio(event.target.value)}
                  value={exercicio}
                />
              </label>
            </div>
            <div className="px-5 pb-5">
              <div className="rounded-md border border-dashed border-[var(--line)] bg-[#fbfcfb] px-6 py-10 text-center">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  Arraste a pasta do exercicio ou um arquivo .zip
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  O arquivo original sera guardado no Supabase Storage.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
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
                    // @ts-expect-error - folder upload is supported by browsers via webkitdirectory
                    webkitdirectory="true"
                  />
                  <button
                    className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
                    onClick={() => zipInputRef.current?.click()}
                    type="button"
                  >
                    Escolher zip
                  </button>
                  <button
                    className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
                    onClick={() => folderInputRef.current?.click()}
                    type="button"
                  >
                    Escolher pasta
                  </button>
                  <button
                    className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
                    onClick={analyzeLot}
                    type="button"
                    disabled={analyzing || files.length === 0}
                  >
                    {analyzing ? "Analisando..." : "Analisar lote"}
                  </button>
                  <button
                    className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
                    onClick={registerImportLot}
                    type="button"
                    disabled={importing || files.length === 0}
                  >
                    {importing ? "Registrando..." : "Importar"}
                  </button>
                  <button
                    className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
                    onClick={clearFiles}
                    type="button"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-[var(--line)] bg-white">
            <div className="border-b border-[var(--line)] px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Arquivos detectados</h2>
                <span className="text-sm text-[var(--muted)]">
                  {summary.totalArquivos} arquivos | {summary.totalBytes}
                </span>
              </div>
            </div>
            <div className="divide-y divide-[var(--line)]">
              {files.length === 0 ? (
                <div className="px-5 py-8 text-sm text-[var(--muted)]">
                  Nenhum arquivo selecionado ainda.
                </div>
              ) : (
                files.map((file, index) => {
                  const detected = analysis[index];
                  return (
                    <div
                      className="grid gap-2 px-5 py-3 md:grid-cols-[1fr_120px_120px_120px]"
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                    >
                      <div className="text-sm text-[var(--foreground)]">{file.name}</div>
                      <div className="text-sm text-[var(--muted)]">{formatBytes(file.size)}</div>
                      <div className="text-sm text-[var(--muted)]">
                        {detected?.layout_codigo ?? "Layout?"}
                      </div>
                      <div className="text-sm text-[var(--muted)]">
                        {detected?.competencia ?? "Competencia?"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-md border border-[var(--line)] bg-white">
            <div className="border-b border-[var(--line)] px-5 py-4">
              <h2 className="text-lg font-semibold">Fluxo</h2>
            </div>
            <ol className="space-y-3 p-5">
              {importSteps.map((item, index) => (
                <li className="flex gap-3 text-sm" key={item}>
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="text-[var(--foreground)]">{item}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-md border border-[var(--line)] bg-white">
            <div className="border-b border-[var(--line)] px-5 py-4">
              <h2 className="text-lg font-semibold">Status</h2>
            </div>
            <div className="space-y-3 p-5 text-sm text-[var(--muted)]">
              <p>Status atual: {status}</p>
              <p>Lote: {loteId ?? "Nao registrado"}</p>
              <p>Job: {jobId ?? "Nao enfileirado"}</p>
              <p>Storage: {storageBasePath ?? "Aguardando registro"}</p>
              <p>Pendente: aguardando arquivos</p>
              <p>Processando: worker lendo lote</p>
              <p>Concluido: dados gravados em staging</p>
              <p>Erro: relatorio disponivel para download</p>
            </div>
          </section>

          <section className="rounded-md border border-[var(--line)] bg-white">
            <div className="border-b border-[var(--line)] px-5 py-4">
              <h2 className="text-lg font-semibold">Arquivos esperados</h2>
            </div>
            <div className="grid gap-3 p-5">
              {ARQUIVOS_SIM_ESPERADOS.map((item) => (
                <div className="rounded border border-[var(--line)] px-4 py-3 text-sm" key={item}>
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
