import type {
  ArquivoDetectadoImportacao,
  LoteImportacaoEntrada,
  LoteImportacaoSaida
} from "@controle-upc/shared";
import { ARQUIVOS_SIM_ESPERADOS, detectarCompetencia, detectarLayout } from "@controle-upc/shared";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as LoteImportacaoEntrada;

  const arquivos_detectados: ArquivoDetectadoImportacao[] = body.arquivos.map((arquivo) => ({
    nome_arquivo: arquivo.nome_arquivo,
    layout_codigo: detectarLayout(arquivo.nome_arquivo),
    competencia: detectarCompetencia(arquivo.nome_arquivo)
  }));

  const response: LoteImportacaoSaida = {
    codigo_municipio: body.codigo_municipio,
    exercicio: body.exercicio,
    total_arquivos: body.arquivos.length,
    arquivos_detectados
  };

  return NextResponse.json(response);
}

export function GET() {
  return NextResponse.json({
    arquivos_esperados: ARQUIVOS_SIM_ESPERADOS
  });
}
