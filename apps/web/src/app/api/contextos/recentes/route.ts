import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type PrestacaoRow = {
  id: string;
  upc_id: string;
  gestao_id: string | null;
  status: string;
  periodo_inicio: string;
  periodo_fim: string;
  created_at: string;
};

type UpcRow = {
  id: string;
  municipio_id: string;
  exercicio_id: string;
  unidade_gestora_id: string;
  nome: string;
};

type MunicipioRow = {
  id: string;
  codigo_municipio: string;
  nome: string;
};

type ExercicioRow = {
  id: string;
  ano: number;
};

type UnidadeGestoraRow = {
  id: string;
  codigo_ug: string;
  nome_ug: string;
};

type GestaoRow = {
  id: string;
  cpf_gestor: string;
  nome_gestor: string;
  periodo_inicio: string;
  periodo_fim: string | null;
};

function unique(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function byId<T extends { id: string }>(rows: T[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

export async function GET() {
  const supabase = createSupabaseServerClient();

  const prestacoesResult = await supabase
    .schema("controle_upc")
    .from("prestacao_contas")
    .select("id, upc_id, gestao_id, status, periodo_inicio, periodo_fim, created_at")
    .order("updated_at", { ascending: false })
    .limit(8);

  if (prestacoesResult.error) {
    return NextResponse.json(
      { message: "Falha ao listar prestacoes recentes.", detail: prestacoesResult.error.message },
      { status: 500 }
    );
  }

  const prestacoes = (prestacoesResult.data ?? []) as PrestacaoRow[];
  const upcIds = unique(prestacoes.map((prestacao) => prestacao.upc_id));
  const gestaoIds = unique(prestacoes.map((prestacao) => prestacao.gestao_id));

  if (prestacoes.length === 0) {
    return NextResponse.json({ contextos: [] });
  }

  const [upcsResult, gestoesResult] = await Promise.all([
    supabase
      .schema("controle_upc")
      .from("upc")
      .select("id, municipio_id, exercicio_id, unidade_gestora_id, nome")
      .in("id", upcIds),
    supabase
      .schema("controle_upc")
      .from("gestao")
      .select("id, cpf_gestor, nome_gestor, periodo_inicio, periodo_fim")
      .in("id", gestaoIds)
  ]);

  if (upcsResult.error) {
    return NextResponse.json(
      { message: "Falha ao listar UPCs recentes.", detail: upcsResult.error.message },
      { status: 500 }
    );
  }

  if (gestoesResult.error) {
    return NextResponse.json(
      { message: "Falha ao listar gestoes recentes.", detail: gestoesResult.error.message },
      { status: 500 }
    );
  }

  const upcs = (upcsResult.data ?? []) as UpcRow[];
  const municipioIds = unique(upcs.map((upc) => upc.municipio_id));
  const exercicioIds = unique(upcs.map((upc) => upc.exercicio_id));
  const unidadeGestoraIds = unique(upcs.map((upc) => upc.unidade_gestora_id));

  const [municipiosResult, exerciciosResult, unidadesGestorasResult] = await Promise.all([
    supabase
      .schema("controle_upc")
      .from("municipio")
      .select("id, codigo_municipio, nome")
      .in("id", municipioIds),
    supabase
      .schema("controle_upc")
      .from("exercicio")
      .select("id, ano")
      .in("id", exercicioIds),
    supabase
      .schema("controle_upc")
      .from("unidade_gestora")
      .select("id, codigo_ug, nome_ug")
      .in("id", unidadeGestoraIds)
  ]);

  if (municipiosResult.error || exerciciosResult.error || unidadesGestorasResult.error) {
    return NextResponse.json(
      {
        message: "Falha ao montar contextos recentes.",
        detail:
          municipiosResult.error?.message ??
          exerciciosResult.error?.message ??
          unidadesGestorasResult.error?.message
      },
      { status: 500 }
    );
  }

  const upcById = byId(upcs);
  const municipioById = byId((municipiosResult.data ?? []) as MunicipioRow[]);
  const exercicioById = byId((exerciciosResult.data ?? []) as ExercicioRow[]);
  const unidadeGestoraById = byId((unidadesGestorasResult.data ?? []) as UnidadeGestoraRow[]);
  const gestaoById = byId((gestoesResult.data ?? []) as GestaoRow[]);

  const contextos = prestacoes.map((prestacao) => {
    const upc = upcById.get(prestacao.upc_id);
    const municipio = upc ? municipioById.get(upc.municipio_id) : undefined;
    const exercicio = upc ? exercicioById.get(upc.exercicio_id) : undefined;
    const unidadeGestora = upc ? unidadeGestoraById.get(upc.unidade_gestora_id) : undefined;
    const gestao = prestacao.gestao_id ? gestaoById.get(prestacao.gestao_id) : undefined;

    return {
      prestacaoId: prestacao.id,
      status: prestacao.status,
      periodoInicio: prestacao.periodo_inicio,
      periodoFim: prestacao.periodo_fim,
      municipio: municipio?.codigo_municipio ?? "",
      nomeMunicipio: municipio?.nome ?? "",
      ano: exercicio?.ano ? String(exercicio.ano) : "",
      codigoUg: unidadeGestora?.codigo_ug ?? "",
      nomeUg: unidadeGestora?.nome_ug ?? "",
      upc: upc?.nome ?? "",
      cpfGestor: gestao?.cpf_gestor ?? "",
      nomeGestor: gestao?.nome_gestor ?? "",
      progresso: 0
    };
  });

  return NextResponse.json({ contextos });
}
