import type { ArquivoDetectadoImportacao } from "@controle-upc/shared";

export type ImportacaoLotePayload = {
  codigo_municipio: string;
  exercicio: number;
  prestacao_contas_id?: string;
  arquivos_detectados: ArquivoDetectadoImportacao[];
};

export type ImportacaoArquivoPayload = {
  nome_arquivo: string;
  layout_codigo: string | null;
  competencia: string | null;
};

export type ImportacaoLoteRow = {
  id: string;
  municipio_codigo: string;
  exercicio: number;
  status: string;
  storage_base_path: string;
  total_arquivos: number;
};
