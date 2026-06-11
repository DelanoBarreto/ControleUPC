import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type ModeloCampoValorPayload = {
  prestacao_contas_id: string;
  campo_modelo_id: string;
  valor_texto?: string | null;
  valor_data?: string | null;
  valor_numero?: number | null;
  valor_booleano?: boolean | null;
  valor_jsonb?: Record<string, unknown>;
  origem?: "manual" | "sim_auto" | "sim_parcial" | "ajuste_controlado" | "ocr_sugerido" | "ocr_confirmado";
  revisado?: boolean;
  observacao?: string | null;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const prestacaoContasId = url.searchParams.get("prestacao_contas_id");

  if (!prestacaoContasId) {
    return NextResponse.json({ message: "prestacao_contas_id e obrigatorio." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .schema("controle_upc")
    .from("campo_modelo_valor")
    .select("*")
    .eq("prestacao_contas_id", prestacaoContasId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ valores: data ?? [] });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ModeloCampoValorPayload;

  if (!payload.prestacao_contas_id || !payload.campo_modelo_id) {
    return NextResponse.json(
      { message: "prestacao_contas_id e campo_modelo_id sao obrigatorios." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .schema("controle_upc")
    .from("campo_modelo_valor")
    .upsert(
      {
        prestacao_contas_id: payload.prestacao_contas_id,
        campo_modelo_id: payload.campo_modelo_id,
        valor_texto: payload.valor_texto ?? null,
        valor_data: payload.valor_data ?? null,
        valor_numero: payload.valor_numero ?? null,
        valor_booleano: payload.valor_booleano ?? null,
        valor_jsonb: payload.valor_jsonb ?? {},
        origem: payload.origem ?? "manual",
        revisado: payload.revisado ?? false,
        observacao: payload.observacao ?? null
      },
      { onConflict: "prestacao_contas_id,campo_modelo_id" }
    )
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ valor: data });
}
