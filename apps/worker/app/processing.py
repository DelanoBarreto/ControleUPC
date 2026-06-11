from __future__ import annotations

from datetime import datetime, timezone

from .schemas import ProcessamentoLoteSaida
from .services import detectar_competencia, detectar_layout, parse_tabular_content
from .supabase_client import create_supabase_client

BUCKET_IMPORTS = "sim-imports"


def processar_lote(lote_id: str) -> ProcessamentoLoteSaida:
    supabase = create_supabase_client()

    lote_result = (
        supabase.schema("controle_upc")
        .table("importacao_lote")
        .select("id, storage_base_path, status")
        .eq("id", lote_id)
        .single()
        .execute()
    )
    lote = lote_result.data
    if not lote:
        raise RuntimeError("Lote nao encontrado.")

    agora = datetime.now(timezone.utc).isoformat()

    supabase.schema("controle_upc").table("importacao_lote").update(
        {"status": "processando", "started_at": agora}
    ).eq("id", lote_id).execute()

    lista = supabase.storage.from_(BUCKET_IMPORTS).list(f"{lote['storage_base_path']}/original")
    arquivos_processados = 0
    registros_brutos = 0
    erros = 0

    for item in lista or []:
        nome_arquivo = item.get("name") if isinstance(item, dict) else getattr(item, "name", None)
        if not nome_arquivo:
            continue

        caminho = f"{lote['storage_base_path']}/original/{nome_arquivo}"
        download_result = supabase.storage.from_(BUCKET_IMPORTS).download(caminho)
        conteudo = (
            download_result
            if isinstance(download_result, (bytes, bytearray))
            else getattr(download_result, "content", b"")
        )
        if not isinstance(conteudo, (bytes, bytearray)):
            erros += 1
            continue

        arquivo_result = (
            supabase.schema("controle_upc")
            .table("importacao_arquivo")
            .select("id")
            .eq("lote_id", lote_id)
            .eq("nome_original", nome_arquivo)
            .single()
            .execute()
        )
        arquivo = arquivo_result.data
        if not arquivo:
            erros += 1
            continue

        parsed = parse_tabular_content(bytes(conteudo))
        layout_codigo = detectar_layout(nome_arquivo)
        competencia = detectar_competencia(nome_arquivo)
        arquivos_processados += 1
        registros_brutos += len(parsed.registros)
        erros += len(parsed.erros)

        for registro in parsed.registros:
            supabase.schema("sim_staging").table("sim_raw_registros").insert(
                {
                    "importacao_arquivo_id": arquivo["id"],
                    "layout_codigo": layout_codigo,
                    "competencia": competencia,
                    "linha": registro["linha"],
                    "conteudo_original": registro["conteudo_original"],
                    "dados": registro["dados"],
                }
            ).execute()

        status_arquivo = "concluido_com_erros" if parsed.erros else "concluido"
        supabase.schema("controle_upc").table("importacao_arquivo").update(
            {
                "layout_codigo": layout_codigo,
                "competencia": competencia,
                "status": status_arquivo,
                "total_linhas": len(parsed.registros),
                "total_registros_validos": len(parsed.registros),
                "total_erros": len(parsed.erros),
            }
        ).eq("id", arquivo["id"]).execute()

    status_lote = "concluido_com_erros" if erros > 0 else "concluido"
    supabase.schema("controle_upc").table("importacao_lote").update(
        {
            "status": status_lote,
            "total_registros": registros_brutos,
            "total_erros": erros,
            "finished_at": datetime.now(timezone.utc).isoformat(),
        }
    ).eq("id", lote_id).execute()

    return ProcessamentoLoteSaida(
        lote_id=lote_id,
        status=status_lote,
        arquivos_processados=arquivos_processados,
        registros_brutos=registros_brutos,
        erros=erros,
    )
