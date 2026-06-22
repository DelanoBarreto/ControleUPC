import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type AbrirContextoPayload = {
  codigo_municipio: string;
  nome_municipio: string;
  exercicio: number;
  codigo_ug: string;
  nome_ug: string;
  nome_upc: string;
  cpf_gestor: string;
  nome_gestor: string;
  periodo_inicio: string;
  periodo_fim?: string | null;
  tipo_prestacao?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<AbrirContextoPayload>;

  const requiredFields: Array<keyof AbrirContextoPayload> = [
    "codigo_municipio",
    "nome_municipio",
    "exercicio",
    "codigo_ug",
    "nome_ug",
    "nome_upc",
    "cpf_gestor",
    "nome_gestor",
    "periodo_inicio"
  ];

  const missing = requiredFields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || String(value).trim() === "";
  });

  if (missing.length > 0) {
    return NextResponse.json(
      { message: "Campos obrigatorios ausentes.", missing },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();

  const municipioResult = await supabase
    .schema("controle_upc")
    .from("municipio")
    .upsert(
      {
        codigo_municipio: String(payload.codigo_municipio).trim(),
        nome: String(payload.nome_municipio).trim(),
        uf: "CE"
      },
      { onConflict: "codigo_municipio" }
    )
    .select("id, codigo_municipio, nome")
    .single();

  if (municipioResult.error || !municipioResult.data) {
    return NextResponse.json(
      { message: "Falha ao registrar municipio.", detail: municipioResult.error?.message },
      { status: 500 }
    );
  }

  const exercicioResult = await supabase
    .schema("controle_upc")
    .from("exercicio")
    .upsert(
      {
        ano: Number(payload.exercicio)
      },
      { onConflict: "ano" }
    )
    .select("id, ano")
    .single();

  if (exercicioResult.error || !exercicioResult.data) {
    return NextResponse.json(
      { message: "Falha ao registrar exercicio.", detail: exercicioResult.error?.message },
      { status: 500 }
    );
  }

  const unidadeGestoraResult = await supabase
    .schema("controle_upc")
    .from("unidade_gestora")
    .upsert(
      {
        municipio_id: municipioResult.data.id,
        exercicio_id: exercicioResult.data.id,
        codigo_ug: String(payload.codigo_ug).trim(),
        nome_ug: String(payload.nome_ug).trim(),
        origem: "manual"
      },
      { onConflict: "municipio_id,exercicio_id,codigo_ug" }
    )
    .select("id, codigo_ug, nome_ug")
    .single();

  if (unidadeGestoraResult.error || !unidadeGestoraResult.data) {
    return NextResponse.json(
      { message: "Falha ao registrar unidade gestora.", detail: unidadeGestoraResult.error?.message },
      { status: 500 }
    );
  }

  const upcResult = await supabase
    .schema("controle_upc")
    .from("upc")
    .upsert(
      {
        municipio_id: municipioResult.data.id,
        exercicio_id: exercicioResult.data.id,
        unidade_gestora_id: unidadeGestoraResult.data.id,
        nome: String(payload.nome_upc).trim(),
        situacao: "ativa",
        origem: "manual"
      },
      { onConflict: "municipio_id,exercicio_id,unidade_gestora_id" }
    )
    .select("id, nome")
    .single();

  if (upcResult.error || !upcResult.data) {
    return NextResponse.json(
      { message: "Falha ao registrar UPC.", detail: upcResult.error?.message },
      { status: 500 }
    );
  }

  const periodoInicio = String(payload.periodo_inicio).trim();
  const periodoFim = payload.periodo_fim ? String(payload.periodo_fim).trim() : null;
  const tipoPrestacao = payload.tipo_prestacao?.trim() || "anual";

  const gestaoExistente = await supabase
    .schema("controle_upc")
    .from("gestao")
    .select("id, cpf_gestor, nome_gestor, periodo_inicio, periodo_fim")
    .eq("upc_id", upcResult.data.id)
    .eq("cpf_gestor", String(payload.cpf_gestor).trim())
    .eq("periodo_inicio", periodoInicio)
    .maybeSingle();

  if (gestaoExistente.error) {
    return NextResponse.json(
      { message: "Falha ao consultar gestao existente.", detail: gestaoExistente.error.message },
      { status: 500 }
    );
  }

  const gestaoResult = gestaoExistente.data
    ? { data: gestaoExistente.data, error: null }
    : await supabase
        .schema("controle_upc")
        .from("gestao")
        .insert({
          upc_id: upcResult.data.id,
          cpf_gestor: String(payload.cpf_gestor).trim(),
          nome_gestor: String(payload.nome_gestor).trim(),
          periodo_inicio: periodoInicio,
          periodo_fim: periodoFim,
          tipo_prestacao: tipoPrestacao,
          origem: "manual"
        })
        .select("id, cpf_gestor, nome_gestor, periodo_inicio, periodo_fim")
        .single();

  if (gestaoResult.error || !gestaoResult.data) {
    return NextResponse.json(
      { message: "Falha ao registrar gestao.", detail: gestaoResult.error?.message },
      { status: 500 }
    );
  }

  const prestacaoExistente = await supabase
    .schema("controle_upc")
    .from("prestacao_contas")
    .select("id, upc_id, gestao_id, tipo, periodo_inicio, periodo_fim, status")
    .eq("upc_id", upcResult.data.id)
    .eq("gestao_id", gestaoResult.data.id)
    .eq("periodo_inicio", periodoInicio)
    .eq("periodo_fim", periodoFim ?? periodoInicio)
    .eq("tipo", tipoPrestacao)
    .maybeSingle();

  if (prestacaoExistente.error) {
    return NextResponse.json(
      { message: "Falha ao consultar prestacao existente.", detail: prestacaoExistente.error.message },
      { status: 500 }
    );
  }

  const prestacaoResult = prestacaoExistente.data
    ? { data: prestacaoExistente.data, error: null }
    : await supabase
        .schema("controle_upc")
        .from("prestacao_contas")
        .insert({
          upc_id: upcResult.data.id,
          gestao_id: gestaoResult.data.id,
          tipo: tipoPrestacao,
          periodo_inicio: periodoInicio,
          periodo_fim: periodoFim ?? periodoInicio
        })
        .select("id, upc_id, gestao_id, tipo, periodo_inicio, periodo_fim, status")
        .single();

  if (prestacaoResult.error || !prestacaoResult.data) {
    return NextResponse.json(
      { message: "Falha ao criar prestacao.", detail: prestacaoResult.error?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    municipio: municipioResult.data,
    exercicio: exercicioResult.data,
    unidade_gestora: unidadeGestoraResult.data,
    upc: upcResult.data,
    gestao: gestaoResult.data,
    prestacao_contas: prestacaoResult.data
  });
}
