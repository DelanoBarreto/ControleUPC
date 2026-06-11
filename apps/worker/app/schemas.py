from pydantic import BaseModel, Field


class ArquivoEntrada(BaseModel):
    nome_arquivo: str
    tamanho_bytes: int | None = None


class LoteImportacaoEntrada(BaseModel):
    codigo_municipio: str = Field(min_length=2, max_length=3)
    exercicio: int = Field(ge=2000, le=2100)
    arquivos: list[ArquivoEntrada]


class ArquivoDetectado(BaseModel):
    nome_arquivo: str
    layout_codigo: str | None = None
    competencia: str | None = None


class LoteImportacaoSaida(BaseModel):
    codigo_municipio: str
    exercicio: int
    total_arquivos: int
    arquivos_detectados: list[ArquivoDetectado]


class ProcessamentoLoteSaida(BaseModel):
    lote_id: str
    status: str
    arquivos_processados: int
    registros_brutos: int
    erros: int
