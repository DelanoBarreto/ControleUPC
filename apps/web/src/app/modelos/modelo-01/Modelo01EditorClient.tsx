"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BadgeInfo,
  FileDown,
  Paperclip,
  RefreshCw,
  Save
} from "lucide-react";

import type { CampoModelo, ValorCampoModelo } from "./page";

type CampoDraft = {
  valor_texto: string;
  valor_data: string;
  valor_numero: string;
  valor_booleano: boolean;
  origem: string;
  revisado: boolean;
  observacao: string;
};

type AnexoItem = {
  id: string;
  escopo: string;
  nome_original: string;
  mime_type: string | null;
  storage_path_original: string;
  storage_path_pdf: string | null;
  status: string;
  campo_modelo_id: string | null;
  signed_url_original: string | null;
  signed_url_pdf: string | null;
  created_at: string;
};

type Props = {
  campos: CampoModelo[];
  contexto: {
    prestacaoContasId: string;
    totalCampos: number;
    totalCamposEditaveis: number;
    totalCamposBloqueados: number;
    totalFuncoes: number;
  };
  prestacaoContasIdInicial?: string;
  valores: ValorCampoModelo[];
};

function buildInitialDrafts(campos: CampoModelo[], valores: ValorCampoModelo[]) {
  const mapa = new Map(valores.map((valor) => [valor.campo_modelo_id, valor]));

  return Object.fromEntries(
    campos.map((campo) => {
      const valor = mapa.get(campo.id);

      return [
        campo.id,
        {
          valor_texto: valor?.valor_texto ?? "",
          valor_data: valor?.valor_data ?? "",
          valor_numero: valor?.valor_numero?.toString() ?? "",
          valor_booleano: valor?.valor_booleano ?? false,
          origem: valor?.origem ?? "manual",
          revisado: valor?.revisado ?? false,
          observacao: valor?.observacao ?? ""
        } satisfies CampoDraft
      ];
    })
  ) as Record<string, CampoDraft>;
}

function groupCamposBySecao(campos: CampoModelo[]) {
  const grupos = new Map<string, CampoModelo[]>();
  const ordem: string[] = [];

  for (const campo of campos) {
    const secao = campo.secao?.trim() || "Sem seção";
    if (!grupos.has(secao)) {
      grupos.set(secao, []);
      ordem.push(secao);
    }
    grupos.get(secao)?.push(campo);
  }

  return ordem.map((secao) => ({
    secao,
    campos: grupos.get(secao) ?? []
  }));
}

async function fetchValoresModelo01(prestacaoContasId: string) {
  const response = await fetch(
    `/api/modelos/modelo-01/valores?prestacao_contas_id=${encodeURIComponent(prestacaoContasId)}`
  );

  if (!response.ok) {
    throw new Error("Falha ao carregar valores.");
  }

  const data = (await response.json()) as {
    valores: ValorCampoModelo[];
  };
  return data.valores;
}

async function fetchAnexosModelo01(prestacaoContasId: string) {
  const response = await fetch(
    `/api/anexos/modelo-01?prestacao_contas_id=${encodeURIComponent(prestacaoContasId)}`
  );

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { anexos: AnexoItem[] };
  return data.anexos;
}

export function Modelo01EditorClient({ campos, contexto, prestacaoContasIdInicial, valores }: Props) {
  const [prestacaoContasId, setPrestacaoContasId] = useState(prestacaoContasIdInicial ?? "");
  const initialLoadDoneRef = useRef(false);
  const [drafts, setDrafts] = useState<Record<string, CampoDraft>>(() =>
    buildInitialDrafts(campos, valores)
  );
  const [anexos, setAnexos] = useState<AnexoItem[]>([]);
  const [anexoArquivo, setAnexoArquivo] = useState<File | null>(null);
  const [anexoCampoId, setAnexoCampoId] = useState("");
  const [anexoEscopo, setAnexoEscopo] = useState("modelo");
  const [savingCampoId, setSavingCampoId] = useState<string | null>(null);
  const [status, setStatus] = useState("Aguardando prestação de contas.");

  const camposAgrupados = useMemo(() => groupCamposBySecao(campos), [campos]);
  const editaveis = useMemo(() => campos.filter((campo) => campo.editavel), [campos]);

  useEffect(() => {
    if (!prestacaoContasIdInicial || initialLoadDoneRef.current) {
      return;
    }

    initialLoadDoneRef.current = true;
    void (async () => {
      try {
        const [valoresCarregados, anexosCarregados] = await Promise.all([
          fetchValoresModelo01(prestacaoContasIdInicial),
          fetchAnexosModelo01(prestacaoContasIdInicial)
        ]);
        setDrafts(buildInitialDrafts(campos, valoresCarregados));
        setAnexos(anexosCarregados);
        setStatus("Valores carregados.");
      } catch {
        setStatus("Não foi possível carregar os valores.");
      }
    })();
  }, [campos, prestacaoContasIdInicial]);

  async function carregarValores(prestacaoId?: string) {
    const id = (prestacaoId ?? prestacaoContasId).trim();

    if (!id) {
      setStatus("Informe um prestacao_contas_id para carregar os valores.");
      return;
    }

    setStatus("Carregando valores do banco...");

    try {
      const [valoresCarregados, anexosCarregados] = await Promise.all([
        fetchValoresModelo01(id),
        fetchAnexosModelo01(id)
      ]);
      setDrafts(buildInitialDrafts(campos, valoresCarregados));
      setAnexos(anexosCarregados);
      setStatus("Valores carregados.");
    } catch {
      setStatus("Não foi possível carregar os valores.");
    }
  }

  async function carregarAnexos(prestacaoId?: string) {
    const id = (prestacaoId ?? prestacaoContasId).trim();
    if (!id) return;

    try {
      setAnexos(await fetchAnexosModelo01(id));
    } catch {
      // Mantém a listagem anterior quando a consulta falhar.
    }
  }

  function updateDraft(campoId: string, patch: Partial<CampoDraft>) {
    setDrafts((current) => ({
      ...current,
      [campoId]: {
        ...(current[campoId] ?? {
          valor_texto: "",
          valor_data: "",
          valor_numero: "",
          valor_booleano: false,
          origem: "manual",
          revisado: false,
          observacao: ""
        }),
        ...patch
      }
    }));
  }

  async function salvarCampo(campo: CampoModelo) {
    if (!prestacaoContasId.trim()) {
      setStatus("Informe um prestacao_contas_id antes de salvar.");
      return;
    }

    const draft = drafts[campo.id];
    if (!draft) return;

    setSavingCampoId(campo.id);
    setStatus(`Salvando ${campo.rotulo}...`);

    try {
      const response = await fetch("/api/modelos/modelo-01/valores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prestacao_contas_id: prestacaoContasId,
          campo_modelo_id: campo.id,
          valor_texto:
            campo.tipo_campo === "texto" || campo.tipo_campo === "texto_longo"
              ? draft.valor_texto
              : null,
          valor_data: campo.tipo_campo === "data" ? draft.valor_data || null : null,
          valor_numero: campo.tipo_campo === "numero" && draft.valor_numero ? Number(draft.valor_numero) : null,
          valor_booleano: campo.tipo_campo === "booleano" ? draft.valor_booleano : null,
          origem: draft.origem,
          revisado: draft.revisado,
          observacao: draft.observacao || null
        })
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar campo.");
      }

      setStatus(`${campo.rotulo} salvo com sucesso.`);
    } catch {
      setStatus(`Não foi possível salvar ${campo.rotulo}.`);
    } finally {
      setSavingCampoId(null);
    }
  }

  async function enviarAnexo() {
    if (!prestacaoContasId.trim()) {
      setStatus("Informe um prestacao_contas_id antes de anexar.");
      return;
    }

    if (!anexoArquivo) {
      setStatus("Selecione um arquivo para anexar.");
      return;
    }

    const formData = new FormData();
    formData.set("prestacao_contas_id", prestacaoContasId);
    formData.set("campo_modelo_id", anexoCampoId);
    formData.set("escopo", anexoEscopo);
    formData.set("file", anexoArquivo);

    setStatus("Enviando anexo...");

    try {
      const response = await fetch("/api/anexos/modelo-01", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar anexo.");
      }

      await carregarAnexos();
      setAnexoArquivo(null);
      setAnexoCampoId("");
      setAnexoEscopo("modelo");
      setStatus("Anexo enviado com sucesso.");
    } catch {
      setStatus("Não foi possível enviar o anexo.");
    }
  }

  return (
    <section className="overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fd_100%)] shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
      <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#233876_0%,#2545d7_52%,#0f766e_100%)] px-6 py-6 text-white md:px-8 md:py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/15 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
                  <BadgeInfo className="mr-1 inline-block size-3 align-[-1px]" />
                  Prestação aberta
                </span>
                <span className="rounded-full border border-white/15 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
                  {contexto.totalCamposBloqueados} bloqueados
                </span>
                <span className="rounded-full border border-white/15 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
                  {contexto.totalFuncoes} funções
                </span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Modelo 01 - Rol de Responsáveis</h2>
                <p className="max-w-2xl text-sm leading-6 text-white/78 md:text-base">
                  Campos oficiais bloqueados, valores editáveis com rastreio, anexos por contexto e salvamento
                  campo a campo no mesmo padrão visual da aplicação.
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

          <div className="flex flex-col gap-3 rounded-[26px] border border-white/15 bg-white/12 p-4 backdrop-blur md:flex-row md:items-end md:justify-between">
            <label className="block flex-1">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                Prestação de contas ID
              </span>
              <input
                className="w-full rounded-full border border-white/15 bg-white px-4 py-3 font-mono text-xs text-slate-900 outline-none transition focus:border-[#2545d7]"
                onChange={(event) => setPrestacaoContasId(event.target.value)}
                placeholder="Cole o id da prestação de contas"
                value={prestacaoContasId}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-full bg-[#101828] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5"
                onClick={() => void carregarValores()}
                type="button"
              >
                <RefreshCw className="size-4" />
                Carregar valores
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg shadow-black/5 transition hover:-translate-y-0.5 hover:bg-slate-50"
                onClick={() => void carregarAnexos()}
                type="button"
              >
                <Paperclip className="size-4" />
                Recarregar anexos
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-[20px] border border-white/15 bg-white/12 px-4 py-3 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Campos</p>
              <p className="mt-1 text-2xl font-semibold text-white">{contexto.totalCampos}</p>
            </div>
            <div className="rounded-[20px] border border-white/15 bg-white/12 px-4 py-3 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Editáveis</p>
              <p className="mt-1 text-2xl font-semibold text-white">{contexto.totalCamposEditaveis}</p>
            </div>
            <div className="rounded-[20px] border border-white/15 bg-white/12 px-4 py-3 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Anexos</p>
              <p className="mt-1 text-2xl font-semibold text-white">{anexos.length}</p>
            </div>
            <div className="rounded-[20px] border border-white/15 bg-white/12 px-4 py-3 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Status</p>
              <p className="mt-1 text-sm font-medium text-white">{status}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {camposAgrupados.map((grupo) => (
          <section
            className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-[0_18px_50px_rgba(20,32,30,0.06)]"
            key={grupo.secao}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
              <div>
                <h3 className="text-base font-semibold text-[var(--foreground)]">{grupo.secao}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{grupo.campos.length} campos nesta seção</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                {grupo.campos.filter((campo) => campo.editavel).length} editáveis
              </span>
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-2">
              {grupo.campos.map((campo) => {
                const draft = drafts[campo.id];
                const isSaving = savingCampoId === campo.id;

                if (!campo.editavel) {
                  return (
                    <div className="rounded-[20px] border border-slate-100 bg-[#fbfcfe] p-4 shadow-sm" key={campo.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-[var(--foreground)]">{campo.rotulo}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">{campo.secao ?? "Sem seção"}</p>
                        </div>
                        <span className="rounded-full border border-slate-200 px-2 py-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                          Bloqueado
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-[var(--muted)]">
                        <p>Chave: {campo.chave}</p>
                        <p>Tipo: {campo.tipo_campo}</p>
                        <p>{campo.obrigatorio ? "Obrigatório" : "Opcional"}</p>
                        <p>{campo.texto_oficial ? "Texto oficial da IN" : "Valor controlado"}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="rounded-[20px] border border-slate-100 bg-[#fbfcfe] p-4 shadow-sm" key={campo.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">{campo.rotulo}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">{campo.secao ?? "Sem seção"}</p>
                      </div>
                      <span className="rounded-full border border-[#cfe2de] bg-[#edf6f3] px-2 py-1 text-[10px] uppercase tracking-wide text-[#155d53]">
                        Editável
                      </span>
                    </div>

                    <div className="mt-3 grid gap-3">
                      {campo.tipo_campo === "texto_longo" ? (
                        <textarea
                          className="min-h-28 rounded-full border border-slate-200 bg-[#fcfdfd] px-3 py-2 text-sm outline-none transition focus:border-[#2545d7]"
                          onBlur={() => salvarCampo(campo)}
                          onChange={(event) => updateDraft(campo.id, { valor_texto: event.target.value })}
                          value={draft?.valor_texto ?? ""}
                        />
                      ) : campo.tipo_campo === "data" ? (
                        <input
                          className="rounded-full border border-slate-200 bg-[#fcfdfd] px-3 py-2 text-sm outline-none transition focus:border-[#2545d7]"
                          onBlur={() => salvarCampo(campo)}
                          onChange={(event) => updateDraft(campo.id, { valor_data: event.target.value })}
                          type="date"
                          value={draft?.valor_data ?? ""}
                        />
                      ) : campo.tipo_campo === "numero" ? (
                        <input
                          className="rounded-full border border-slate-200 bg-[#fcfdfd] px-3 py-2 text-sm outline-none transition focus:border-[#2545d7]"
                          onBlur={() => salvarCampo(campo)}
                          onChange={(event) => updateDraft(campo.id, { valor_numero: event.target.value })}
                          type="number"
                          value={draft?.valor_numero ?? ""}
                        />
                      ) : campo.tipo_campo === "booleano" ? (
                        <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-[#fcfdfd] px-3 py-2 text-sm">
                          <input
                            checked={draft?.valor_booleano ?? false}
                            onChange={(event) => updateDraft(campo.id, { valor_booleano: event.target.checked })}
                            type="checkbox"
                          />
                          Marcar como verdadeiro
                        </label>
                      ) : (
                        <input
                          className="rounded-full border border-slate-200 bg-[#fcfdfd] px-3 py-2 text-sm outline-none transition focus:border-[#2545d7]"
                          onBlur={() => salvarCampo(campo)}
                          onChange={(event) => updateDraft(campo.id, { valor_texto: event.target.value })}
                          value={draft?.valor_texto ?? ""}
                        />
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                        <span>Chave: {campo.chave}</span>
                        <span>Tipo: {campo.tipo_campo}</span>
                        <span>{campo.obrigatorio ? "Obrigatório" : "Opcional"}</span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
                          <input
                            checked={draft?.revisado ?? false}
                            onChange={(event) => updateDraft(campo.id, { revisado: event.target.checked })}
                            type="checkbox"
                          />
                          Revisado
                        </label>

                        <button
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => salvarCampo(campo)}
                          type="button"
                          disabled={isSaving}
                        >
                          <Save className="size-4" />
                          {isSaving ? "Salvando..." : "Salvar"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="border-t border-slate-100 p-6">
        <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(20,32,30,0.06)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">Anexos do modelo</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Anexe portarias, notas, extratos e documentos de suporte vinculados a esta prestação.
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Formatos aceitos: PDF, Word, Excel e imagens. O arquivo fica vinculado a esta prestação e ao campo
                escolhido, quando houver.
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={() => void carregarAnexos()}
              type="button"
            >
              <RefreshCw className="size-4" />
              Recarregar
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <select
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
              onChange={(event) => setAnexoEscopo(event.target.value)}
              value={anexoEscopo}
            >
              <option value="modelo">Anexo do modelo</option>
              <option value="secao">Anexo da seção</option>
              <option value="campo">Anexo do campo</option>
              <option value="responsavel">Anexo do responsável</option>
            </select>

            <select
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
              onChange={(event) => setAnexoCampoId(event.target.value)}
              value={anexoCampoId}
            >
              <option value="">Sem campo específico</option>
              {campos.map((campo) => (
                <option key={campo.id} value={campo.id}>
                  {campo.rotulo}
                </option>
              ))}
            </select>

            <input
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#2545d7]"
              onChange={(event) => setAnexoArquivo(event.target.files?.[0] ?? null)}
              type="file"
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              className="inline-flex items-center gap-2 rounded-full bg-[#101828] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              onClick={enviarAnexo}
              type="button"
            >
              <Paperclip className="size-4" />
              Anexar arquivo
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {anexos.length === 0 ? (
              <div className="rounded-[18px] border border-slate-200 bg-white px-3 py-3 text-sm text-[var(--muted)]">
                Nenhum anexo carregado ainda.
              </div>
            ) : (
              anexos.map((anexo) => (
                <div className="rounded-[18px] border border-slate-200 bg-white px-3 py-3" key={anexo.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-[var(--foreground)]">{anexo.nome_original}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {anexo.signed_url_original ? (
                        <a
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1 font-medium text-[var(--foreground)] transition hover:bg-slate-50"
                          href={anexo.signed_url_original}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <ArrowUpRight className="size-3" />
                          Abrir original
                        </a>
                      ) : null}
                      {anexo.signed_url_pdf ? (
                        <a
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1 font-medium text-[var(--foreground)] transition hover:bg-slate-50"
                          href={anexo.signed_url_pdf}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <FileDown className="size-3" />
                          Abrir PDF
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Escopo: {anexo.escopo} | Status: {anexo.status}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Campo: {anexo.campo_modelo_id ?? "sem vínculo"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 px-6 py-4 text-sm text-[var(--muted)]">
        {editaveis.length} campos editáveis carregados para revisão e salvamento.
      </div>
    </section>
  );
}
