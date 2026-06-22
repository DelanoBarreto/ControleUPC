import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type TemplateCampoValorPayload = {
  prestacao_contas_id: string;
  template_campo_id: string;
  valor_texto?: string | null;
  valor_data?: string | null;
  valor_numero?: number | null;
  valor_booleano?: boolean | null;
  valor_jsonb?: Record<string, unknown>;
  origem?: "manual" | "sim_auto" | "sim_parcial" | "ajuste_controlado" | "ocr_sugerido" | "ocr_confirmado";
  revisado?: boolean;
  observacao?: string | null;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as TemplateCampoValorPayload;

  if (!payload.prestacao_contas_id || !payload.template_campo_id) {
    return NextResponse.json(
      { message: "prestacao_contas_id e template_campo_id sao obrigatorios." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();

  const campoResult = await supabase
    .schema("controle_upc")
    .from("modelo_template_campo")
    .select("id, editavel, texto_oficial")
    .eq("id", payload.template_campo_id)
    .single();

  if (campoResult.error) {
    return NextResponse.json({ message: campoResult.error.message }, { status: 404 });
  }

  if (!campoResult.data.editavel || campoResult.data.texto_oficial) {
    return NextResponse.json(
      { message: "Campo oficial bloqueado para edicao direta." },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .schema("controle_upc")
    .from("modelo_template_valor")
    .upsert(
      {
        prestacao_contas_id: payload.prestacao_contas_id,
        template_campo_id: payload.template_campo_id,
        valor_texto: payload.valor_texto ?? null,
        valor_data: payload.valor_data ?? null,
        valor_numero: payload.valor_numero ?? null,
        valor_booleano: payload.valor_booleano ?? null,
        valor_jsonb: payload.valor_jsonb ?? {},
        origem: payload.origem ?? "manual",
        revisado: payload.revisado ?? false,
        observacao: payload.observacao ?? null
      },
      { onConflict: "prestacao_contas_id,template_campo_id" }
    )
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ valor: data });
}
