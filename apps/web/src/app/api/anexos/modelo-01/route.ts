import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const ATTACHMENTS_BUCKET = "anexos-upc";
const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp"
]);

function sanitizeFileName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function isAllowedAttachment(filename: string) {
  const lower = filename.toLowerCase();
  return Array.from(ALLOWED_EXTENSIONS).some((extension) => lower.endsWith(extension));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const prestacaoContasId = url.searchParams.get("prestacao_contas_id");

  if (!prestacaoContasId) {
    return NextResponse.json({ message: "prestacao_contas_id e obrigatorio." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .schema("controle_upc")
    .from("anexo_arquivo")
    .select(
      "id, prestacao_contas_id, modelo_id, campo_modelo_id, escopo, nome_original, mime_type, storage_path_original, storage_path_pdf, status, created_at"
    )
    .eq("prestacao_contas_id", prestacaoContasId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const anexos = await Promise.all(
    (data ?? []).map(async (anexo) => {
      const [originalResult, pdfResult] = await Promise.all([
        supabase.storage.from(ATTACHMENTS_BUCKET).createSignedUrl(anexo.storage_path_original, 3600),
        anexo.storage_path_pdf
          ? supabase.storage.from(ATTACHMENTS_BUCKET).createSignedUrl(anexo.storage_path_pdf, 3600)
          : Promise.resolve({ data: null, error: null })
      ]);

      return {
        ...anexo,
        signed_url_original: originalResult.data?.signedUrl ?? null,
        signed_url_pdf: pdfResult.data?.signedUrl ?? null
      };
    })
  );

  return NextResponse.json({ anexos });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const prestacaoContasId = String(formData.get("prestacao_contas_id") ?? "");
  const campoModeloId = String(formData.get("campo_modelo_id") ?? "");
  const escopo = String(formData.get("escopo") ?? "modelo");
  const arquivo = formData.get("file");

  if (!prestacaoContasId.trim()) {
    return NextResponse.json({ message: "prestacao_contas_id e obrigatorio." }, { status: 400 });
  }

  if (!(arquivo instanceof File)) {
    return NextResponse.json({ message: "Arquivo e obrigatorio." }, { status: 400 });
  }

  if (!isAllowedAttachment(arquivo.name)) {
    return NextResponse.json(
      {
        message: "Formato de arquivo nao permitido.",
        detail: "Use PDF, Word, Excel ou imagem."
      },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();
  const { data: modelo, error: modeloError } = await supabase
    .schema("controle_upc")
    .from("modelo_in")
    .select("id")
    .eq("codigo", "modelo_01")
    .single();

  if (modeloError || !modelo) {
    return NextResponse.json({ message: "Modelo 01 nao encontrado." }, { status: 500 });
  }

  const attachmentId = crypto.randomUUID();
  const safeName = sanitizeFileName(arquivo.name);
  const storagePath = `anexos-upc/${prestacaoContasId}/${attachmentId}/${safeName}`;
  const uploadResult = await supabase.storage.from(ATTACHMENTS_BUCKET).upload(storagePath, arquivo, {
    contentType: arquivo.type || "application/octet-stream",
    upsert: true
  });

  if (uploadResult.error) {
    return NextResponse.json(
      { message: "Falha ao enviar anexo para o Storage.", detail: uploadResult.error.message },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .schema("controle_upc")
    .from("anexo_arquivo")
    .insert({
      id: attachmentId,
      prestacao_contas_id: prestacaoContasId,
      modelo_id: modelo.id,
      campo_modelo_id: campoModeloId.trim() || null,
      escopo,
      nome_original: arquivo.name,
      mime_type: arquivo.type || null,
      storage_path_original: uploadResult.data.path,
      storage_path_pdf: null,
      status: "enviado"
    })
    .select(
      "id, prestacao_contas_id, modelo_id, campo_modelo_id, escopo, nome_original, mime_type, storage_path_original, storage_path_pdf, status, created_at"
    )
    .single();

  if (error || !data) {
    return NextResponse.json(
      { message: "Falha ao registrar anexo.", detail: error?.message ?? "Anexo nao localizado." },
      { status: 500 }
    );
  }

  return NextResponse.json({ anexo: data });
}
