from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException

from .schemas import ArquivoDetectado, LoteImportacaoEntrada, LoteImportacaoSaida
from .processing import processar_lote
from .supabase_client import create_supabase_client
from .services import detectar_competencia, detectar_layout

app = FastAPI(title="Controle UPC Worker", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/imports/analyze", response_model=LoteImportacaoSaida)
def analyze_imports(payload: LoteImportacaoEntrada) -> LoteImportacaoSaida:
    arquivos_detectados = [
        ArquivoDetectado(
            nome_arquivo=arquivo.nome_arquivo,
            layout_codigo=detectar_layout(arquivo.nome_arquivo),
            competencia=detectar_competencia(arquivo.nome_arquivo),
        )
        for arquivo in payload.arquivos
    ]

    return LoteImportacaoSaida(
        codigo_municipio=payload.codigo_municipio,
        exercicio=payload.exercicio,
        total_arquivos=len(payload.arquivos),
        arquivos_detectados=arquivos_detectados,
    )


@app.post("/imports/lotes/{lote_id}/process")
def process_import_lote(lote_id: str):
    try:
        return processar_lote(lote_id)
    except RuntimeError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/jobs/process-pending")
def process_pending_jobs():
    supabase = create_supabase_client()
    jobs_result = (
        supabase.schema("controle_upc")
        .table("job_processamento")
        .select("id, tipo, payload")
        .eq("status", "pending")
        .execute()
    )
    jobs = jobs_result.data or []
    processados = []

    for job in jobs:
        job_id = job["id"]
        lote_id = (job.get("payload") or {}).get("lote_id")
        if not lote_id:
            supabase.schema("controle_upc").table("job_processamento").update(
                {
                    "status": "failed",
                    "erro": "payload sem lote_id",
                    "finished_at": datetime.now(timezone.utc).isoformat(),
                }
            ).eq("id", job_id).execute()
            processados.append({"job_id": job_id, "status": "failed"})
            continue

        supabase.schema("controle_upc").table("job_processamento").update(
            {
                "status": "processing",
                "started_at": datetime.now(timezone.utc).isoformat(),
            }
        ).eq("id", job_id).execute()

        try:
            resultado = processar_lote(lote_id)
            supabase.schema("controle_upc").table("job_processamento").update(
                {
                    "status": "done",
                    "resultado": resultado.model_dump(),
                    "finished_at": datetime.now(timezone.utc).isoformat(),
                }
            ).eq("id", job_id).execute()
            processados.append({"job_id": job_id, "status": "done", "lote_id": lote_id})
        except Exception as exc:  # pragma: no cover - runtime safeguard
            supabase.schema("controle_upc").table("job_processamento").update(
                {
                    "status": "failed",
                    "erro": str(exc),
                    "finished_at": datetime.now(timezone.utc).isoformat(),
                }
            ).eq("id", job_id).execute()
            processados.append({"job_id": job_id, "status": "failed", "lote_id": lote_id})

    return {"jobs_encontrados": len(jobs), "jobs_processados": processados}
