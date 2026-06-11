import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ImportacaoArquivoPayload, ImportacaoLotePayload } from "@/lib/supabase/types";

const IMPORTS_BUCKET = "sim-imports";

function sanitizeFileName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function resolveUploadPath(file: File) {
  const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
  return relativePath
    .split("/")
    .filter(Boolean)
    .map((segment) => sanitizeFileName(segment))
    .join("/");
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const supabase = createSupabaseServerClient();

  let payload: ImportacaoLotePayload;
  let files: File[] = [];
  let jobId: string | null = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const arquivos_detectados_json = String(formData.get("arquivos_detectados") ?? "[]");
    files = formData.getAll("files").filter((item): item is File => item instanceof File);

    payload = {
      codigo_municipio: String(formData.get("codigo_municipio") ?? ""),
      exercicio: Number(formData.get("exercicio") ?? ""),
      arquivos_detectados: JSON.parse(arquivos_detectados_json) as ImportacaoArquivoPayload[]
    };
  } else {
    payload = (await request.json()) as ImportacaoLotePayload;
  }

  if (!payload.codigo_municipio.trim() || !Number.isInteger(payload.exercicio) || payload.exercicio < 2000) {
    return NextResponse.json(
      { message: "Municipio ou exercicio invalidos." },
      { status: 400 }
    );
  }

  if (!Array.isArray(payload.arquivos_detectados)) {
    return NextResponse.json({ message: "Arquivos detectados invalidos." }, { status: 400 });
  }

  const loteId = crypto.randomUUID();
  const storageBasePath = `sim-imports/${payload.codigo_municipio}/${payload.exercicio}/${loteId}`;
  const { data: municipio, error: municipioError } = await supabase
    .schema("controle_upc")
    .from("municipio")
    .upsert(
      {
        codigo_municipio: payload.codigo_municipio,
        nome: payload.codigo_municipio,
        uf: "CE"
      },
      { onConflict: "codigo_municipio" }
    )
    .select("id")
    .single();

  if (municipioError || !municipio) {
    return NextResponse.json(
      { message: "Falha ao resolver municipio.", detail: municipioError?.message ?? "Municipio nao localizado." },
      { status: 500 }
    );
  }

  const { data: exercicio, error: exercicioError } = await supabase
    .schema("controle_upc")
    .from("exercicio")
    .upsert(
      {
        ano: payload.exercicio
      },
      { onConflict: "ano" }
    )
    .select("id")
    .single();

  if (exercicioError || !exercicio) {
    return NextResponse.json(
      { message: "Falha ao resolver exercicio.", detail: exercicioError?.message ?? "Exercicio nao localizado." },
      { status: 500 }
    );
  }

  const { error: loteError } = await supabase.schema("controle_upc").from("importacao_lote").insert({
    id: loteId,
    municipio_id: municipio.id,
    exercicio_id: exercicio.id,
    status: "pendente",
    storage_base_path: storageBasePath,
    total_arquivos: payload.arquivos_detectados.length
  });

  if (loteError) {
    return NextResponse.json(
      { message: "Falha ao registrar lote de importacao.", detail: loteError.message },
      { status: 500 }
    );
  }

  const { data: job, error: jobError } = await supabase
    .schema("controle_upc")
    .from("job_processamento")
    .insert({
      tipo: "processar_lote_sim",
      status: "pending",
      payload: {
        lote_id: loteId,
        storage_base_path: storageBasePath,
        total_arquivos: payload.arquivos_detectados.length
      }
    })
    .select("id")
    .single();

  if (jobError || !job) {
    await supabase.schema("controle_upc").from("importacao_lote").update({
      status: "erro",
      total_erros: 1
    }).eq("id", loteId);
    return NextResponse.json(
      { message: "Falha ao registrar job de processamento.", detail: jobError?.message ?? "Job nao localizado." },
      { status: 500 }
    );
  }
  jobId = job.id;

  if (files.length > 0) {
    for (const file of files) {
      const storagePath = `${storageBasePath}/original/${resolveUploadPath(file)}`;
      const uploadResult = await supabase.storage.from(IMPORTS_BUCKET).upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: true
      });

      if (uploadResult.error) {
        await supabase.schema("controle_upc").from("importacao_lote").update({
          status: "erro",
          total_erros: 1
        }).eq("id", loteId);
        await supabase.schema("controle_upc").from("job_processamento").update({
          status: "failed",
          erro: uploadResult.error.message
        }).eq("id", jobId);
        return NextResponse.json(
          {
            message: "Falha ao enviar arquivo para o Storage.",
            detail: uploadResult.error.message,
            arquivo: file.name
          },
          { status: 500 }
        );
      }

      const detected = payload.arquivos_detectados.find((item) => item.nome_arquivo === file.name);
      const { error: arquivoError } = await supabase.schema("controle_upc").from("importacao_arquivo").insert({
        lote_id: loteId,
        nome_original: file.name,
        storage_path: uploadResult.data.path,
        layout_codigo: detected?.layout_codigo ?? null,
        competencia: detected?.competencia ?? null,
        status: "pendente"
      });

      if (arquivoError) {
        await supabase.schema("controle_upc").from("importacao_lote").update({
          status: "erro",
          total_erros: 1
        }).eq("id", loteId);
        await supabase.schema("controle_upc").from("job_processamento").update({
          status: "failed",
          erro: arquivoError.message
        }).eq("id", jobId);
        return NextResponse.json(
          {
            message: "Falha ao registrar arquivo do lote.",
            detail: arquivoError.message,
            arquivo: file.name
          },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({
    lote_id: loteId,
    job_id: jobId,
    municipio_id: municipio.id,
    exercicio_id: exercicio.id,
    storage_base_path: storageBasePath
  });
}
