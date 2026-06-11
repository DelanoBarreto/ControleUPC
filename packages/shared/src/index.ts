export const ORIGENS_DADO = [
  "sim_auto",
  "sim_parcial",
  "manual",
  "ajuste_controlado",
  "ocr_sugerido",
  "ocr_confirmado"
] as const;

export type OrigemDado = (typeof ORIGENS_DADO)[number];

export const STATUS_MODELO = [
  "pendente",
  "em_revisao",
  "completo",
  "exportado"
] as const;

export type StatusModelo = (typeof STATUS_MODELO)[number];

export const MODELO_INICIAL = {
  codigo: "modelo_01",
  nome: "Rol de Responsaveis",
  fonteNormativa: "IN 01/2025"
} as const;

export type ArquivoEntradaImportacao = {
  nome_arquivo: string;
  tamanho_bytes?: number;
};

export type LoteImportacaoEntrada = {
  codigo_municipio: string;
  exercicio: number;
  arquivos: ArquivoEntradaImportacao[];
};

export type ArquivoDetectadoImportacao = {
  nome_arquivo: string;
  layout_codigo: string | null;
  competencia: string | null;
};

export type LoteImportacaoSaida = {
  codigo_municipio: string;
  exercicio: number;
  total_arquivos: number;
  arquivos_detectados: ArquivoDetectadoImportacao[];
};

export {
  ARQUIVOS_SIM_ESPERADOS,
  COMPETENCIA_PATTERN,
  LAYOUT_PATTERNS,
  detectarCompetencia,
  detectarLayout
} from "./importacao";
