import re
import csv
import io
import json
from dataclasses import dataclass
from typing import Any

LAYOUT_PATTERNS = {
    "101": re.compile(r"(^|[^0-9])GE\d{6}\.BAS$", re.IGNORECASE),
    "108": re.compile(r"(^|[^0-9])UG\d{6}\.BAS$", re.IGNORECASE),
    "109": re.compile(r"(^|[^0-9])OD\d{6}\.BAS$", re.IGNORECASE),
    "103": re.compile(r"(^|[^0-9])OR\d{6}\.BAS$", re.IGNORECASE),
    "104": re.compile(r"(^|[^0-9])UO\d{6}\.BAS$", re.IGNORECASE),
    "503": re.compile(r"(^|[^0-9])CL\d{6}\.LCO$", re.IGNORECASE),
    "504": re.compile(r"(^|[^0-9])MC\d{6}\.LCO$", re.IGNORECASE),
    "951": re.compile(r"(^|[^0-9])AG\d{6}\.CPF$", re.IGNORECASE),
    "952": re.compile(r"(^|[^0-9])DS\d{6}\.CPF$", re.IGNORECASE),
    "953": re.compile(r"(^|[^0-9])RA\d{6}\.CPF$", re.IGNORECASE),
}

COMPETENCIA_PATTERN = re.compile(r"(?<!\d)(20\d{4})(?!\d)")

CSV_DELIMITERS = [";", ",", "\t", "|"]


@dataclass
class ParsedArquivo:
    registros: list[dict[str, Any]]
    erros: list[str]
    delimitador: str | None


def detectar_layout(nome_arquivo: str) -> str | None:
    for codigo, pattern in LAYOUT_PATTERNS.items():
        if pattern.search(nome_arquivo):
            return codigo
    return None


def detectar_competencia(nome_arquivo: str) -> str | None:
    match = COMPETENCIA_PATTERN.search(nome_arquivo)
    if match:
        return match.group(1)
    return None


def _decode_content(conteudo: bytes) -> str:
    for encoding in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            return conteudo.decode(encoding)
        except UnicodeDecodeError:
            continue
    return conteudo.decode("latin-1", errors="ignore")


def parse_tabular_content(conteudo: bytes) -> ParsedArquivo:
    texto = _decode_content(conteudo)
    amostra = texto[:4096]
    erros: list[str] = []

    try:
        dialect = csv.Sniffer().sniff(amostra, delimiters=CSV_DELIMITERS)
        reader = csv.DictReader(io.StringIO(texto), dialect=dialect)
        if reader.fieldnames:
            registros = []
            for indice, row in enumerate(reader, start=2):
                registros.append(
                    {
                        "linha": indice,
                        "dados": {chave.strip(): (valor or "").strip() for chave, valor in row.items()},
                        "conteudo_original": json.dumps(row, ensure_ascii=False),
                    }
                )
            return ParsedArquivo(registros=registros, erros=erros, delimitador=dialect.delimiter)
    except csv.Error as exc:
        erros.append(f"Sniffer CSV falhou: {exc}")

    linhas = [linha for linha in texto.splitlines() if linha.strip()]
    registros = [
        {
            "linha": indice + 1,
            "dados": {"conteudo": linha},
            "conteudo_original": linha,
        }
        for indice, linha in enumerate(linhas)
    ]
    return ParsedArquivo(registros=registros, erros=erros, delimitador=None)
