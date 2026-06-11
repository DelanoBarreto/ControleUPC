"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

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

type Props = {
  campos: CampoModelo[]; 
  valores: ValorCampoModelo[];
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

export function Modelo01EditorClient({ campos, valores }: Props) {
  const searchParams = useSearchParams();
  const prestacaoInicial = searchParams.get("prestacao_contas_id") ?? "";
  const [prestacaoContasId, setPrestacaoContasId] = useState(prestacaoInicial);
  const [drafts, setDrafts] = useState<Record<string, CampoDraft>>(() =>
    buildInitialDrafts(campos, valores)
  );
  const [anexos, setAnexos] = useState<AnexoItem[]>([]);
  const [anexoArquivo, setAnexoArquivo] = useState<File | null>(null);
  const [anexoCampoId, setAnexoCampoId] = useState("");
  const [anexoEscopo, setAnexoEscopo] = useState("modelo");
  const [savingCampoId, setSavingCampoId] = useState<string | null>(null);
  const [status, setStatus] = useState("Aguardando prestacao de contas.");

  const editaveis = useMemo(() => campos.filter((campo) => campo.editavel), [campos]);

  useEffect(() => {
    setDrafts(buildInitialDrafts(campos, valores));
  }, [campos, valores]);

  async function carregarValores() {
    if (!prestacaoContasId.trim()) {
      setStatus("Informe um prestacao_contas_id para carregar os valores.");
      return;
    }

    setStatus("Carregando valores do banco...");

    try {
      const response = await fetch(
        `/api/modelos/modelo-01/valores?prestacao_contas_id=${encodeURIComponent(prestacaoContasId)}`
      );
      if (!response.ok) {
        throw new Error("Falha ao carregar valores.");
      }

      const data = (await response.json()) as {
        valores: ValorCampoModelo[];
      };
      setDrafts(buildInitialDrafts(campos, data.valores));
      await carregarAnexos();
      setStatus("Valores carregados.");
    } catch {
      setStatus("Nao foi possivel carregar os valores.");
    }
  }

  async function carregarAnexos() {
    if (!prestacaoContasId.trim()) {
      return;
    }

    try {
      const response = await fetch(
        `/api/anexos/modelo-01?prestacao_contas_id=${encodeURIComponent(prestacaoContasId)}`
      );

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as { anexos: AnexoItem[] };
      setAnexos(data.anexos);
    } catch {
      // Mantem a listagem anterior quando a consulta falhar.
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
      setStatus(`Nao foi possivel salvar ${campo.rotulo}.`);
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
      setStatus("Nao foi possivel enviar o anexo.");
    }
  }

  return (
    <section className="rounded-md border border-[var(--line)] bg-white">
      <div className="border-b border-[var(--line)] px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Campos do modelo</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Campos oficiais bloqueados, valores editaveis com rastreio e salvamento campo a campo.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:min-w-[360px]">
            <label className="block text-sm">
              <span className="mb-2 block font-medium">prestacao_contas_id</span>
              <input
                className="w-full rounded border border-[var(--line)] bg-[#f9fbfa] px-3 py-2 text-sm outline-none"
                onChange={(event) => setPrestacaoContasId(event.target.value)}
                placeholder="Cole o id da prestacao de contas"
                value={prestacaoContasId}
              />
            </label>
            <div className="flex gap-2">
              <button
                className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
                onClick={carregarValores}
                type="button"
              >
                Carregar valores
              </button>
              <div className="rounded-md border border-[var(--line)] px-3 py-2 text-sm text-[var(--muted)]">
                {status}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2">
        {campos.map((campo) => {
          const draft = drafts[campo.id];
          const isSaving = savingCampoId === campo.id;

          if (!campo.editavel) {
            return (
              <div className="rounded-md border border-[var(--line)] bg-[#f9fbfa] p-4" key={campo.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{campo.rotulo}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{campo.secao ?? "Sem secao"}</p>
                  </div>
                  <span className="rounded-full border border-[var(--line)] px-2 py-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                    Bloqueado
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-[var(--muted)]">
                  <p>Chave: {campo.chave}</p>
                  <p>Tipo: {campo.tipo_campo}</p>
                  <p>{campo.obrigatorio ? "Obrigatorio" : "Opcional"}</p>
                  <p>{campo.texto_oficial ? "Texto oficial da IN" : "Valor controlado"}</p>
                </div>
              </div>
            );
          }

          return (
            <div className="rounded-md border border-[var(--line)] bg-[#f9fbfa] p-4" key={campo.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{campo.rotulo}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{campo.secao ?? "Sem secao"}</p>
                </div>
                <span className="rounded-full border border-[var(--line)] px-2 py-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                  Editavel
                </span>
              </div>

              <div className="mt-3 grid gap-3">
                {campo.tipo_campo === "texto_longo" ? (
                  <textarea
                    className="min-h-28 rounded border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none"
                    onBlur={() => salvarCampo(campo)}
                    onChange={(event) => updateDraft(campo.id, { valor_texto: event.target.value })}
                    value={draft?.valor_texto ?? ""}
                  />
                ) : campo.tipo_campo === "data" ? (
                  <input
                    className="rounded border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none"
                    onBlur={() => salvarCampo(campo)}
                    onChange={(event) => updateDraft(campo.id, { valor_data: event.target.value })}
                    type="date"
                    value={draft?.valor_data ?? ""}
                  />
                ) : campo.tipo_campo === "numero" ? (
                  <input
                    className="rounded border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none"
                    onBlur={() => salvarCampo(campo)}
                    onChange={(event) => updateDraft(campo.id, { valor_numero: event.target.value })}
                    type="number"
                    value={draft?.valor_numero ?? ""}
                  />
                ) : campo.tipo_campo === "booleano" ? (
                  <label className="flex items-center gap-2 rounded border border-[var(--line)] bg-white px-3 py-2 text-sm">
                    <input
                      checked={draft?.valor_booleano ?? false}
                      onChange={(event) => updateDraft(campo.id, { valor_booleano: event.target.checked })}
                      type="checkbox"
                    />
                    Marcar como verdadeiro
                  </label>
                ) : (
                  <input
                    className="rounded border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none"
                    onBlur={() => salvarCampo(campo)}
                    onChange={(event) => updateDraft(campo.id, { valor_texto: event.target.value })}
                    value={draft?.valor_texto ?? ""}
                  />
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                  <span>Chave: {campo.chave}</span>
                  <span>Tipo: {campo.tipo_campo}</span>
                  <span>{campo.obrigatorio ? "Obrigatorio" : "Opcional"}</span>
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
                    className="rounded-md border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--foreground)]"
                    onClick={() => salvarCampo(campo)}
                    type="button"
                    disabled={isSaving}
                  >
                    {isSaving ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[var(--line)] p-5">
        <div className="rounded-md border border-[var(--line)] bg-[#fbfcfb] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">Anexos do modelo</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Anexe portarias, notas, extratos e documentos de suporte vinculados a esta prestacao.
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Formatos aceitos: PDF, Word, Excel e imagens. O arquivo fica vinculado a esta prestacao e ao campo
                escolhido, quando houver.
              </p>
            </div>
            <button
              className="rounded-md border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--foreground)]"
              onClick={carregarAnexos}
              type="button"
            >
              Recarregar
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <select
              className="rounded border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none"
              onChange={(event) => setAnexoEscopo(event.target.value)}
              value={anexoEscopo}
            >
              <option value="modelo">Anexo do modelo</option>
              <option value="secao">Anexo da secao</option>
              <option value="campo">Anexo do campo</option>
              <option value="responsavel">Anexo do responsavel</option>
            </select>

            <select
              className="rounded border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none"
              onChange={(event) => setAnexoCampoId(event.target.value)}
              value={anexoCampoId}
            >
              <option value="">Sem campo especifico</option>
              {campos.map((campo) => (
                <option key={campo.id} value={campo.id}>
                  {campo.rotulo}
                </option>
              ))}
            </select>

            <input
              className="rounded border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none"
              onChange={(event) => setAnexoArquivo(event.target.files?.[0] ?? null)}
              type="file"
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
              onClick={enviarAnexo}
              type="button"
            >
              Anexar arquivo
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {anexos.length === 0 ? (
              <div className="rounded border border-[var(--line)] bg-white px-3 py-3 text-sm text-[var(--muted)]">
                Nenhum anexo carregado ainda.
              </div>
            ) : (
              anexos.map((anexo) => (
                <div className="rounded border border-[var(--line)] bg-white px-3 py-3" key={anexo.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-[var(--foreground)]">{anexo.nome_original}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {anexo.signed_url_original ? (
                        <a
                          className="rounded border border-[var(--line)] px-2 py-1 font-medium text-[var(--foreground)]"
                          href={anexo.signed_url_original}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Abrir original
                        </a>
                      ) : null}
                      {anexo.signed_url_pdf ? (
                        <a
                          className="rounded border border-[var(--line)] px-2 py-1 font-medium text-[var(--foreground)]"
                          href={anexo.signed_url_pdf}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Abrir PDF
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Escopo: {anexo.escopo} | Status: {anexo.status}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Campo: {anexo.campo_modelo_id ?? "sem vinculo"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--line)] px-5 py-4 text-sm text-[var(--muted)]">
        {editaveis.length} campos editaveis carregados para revisao e salvamento.
      </div>
    </section>
  );
}
