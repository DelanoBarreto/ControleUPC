export const ARQUIVOS_SIM_ESPERADOS = [
  "GE*.BAS - Gestores",
  "OR*.BAS - Orgaos",
  "UO*.BAS - Unidades Orcamentarias",
  "UG*.BAS - Unidades Gestoras",
  "OD*.BAS - Ordenadores de Despesas",
  "CL*.LCO - Tipos de Responsaveis pela Contratacao",
  "MC*.LCO - Identificacao dos Responsaveis pela Contratacao",
  "AG*.CPF - Agentes Publicos",
  "DS*.CPF - Desligamentos",
  "RA*.CPF - Reingressos"
] as const;

export const LAYOUT_PATTERNS: Array<[string, RegExp]> = [
  ["101", /(^|[^0-9])GE\d{6}\.BAS$/i],
  ["103", /(^|[^0-9])OR\d{6}\.BAS$/i],
  ["104", /(^|[^0-9])UO\d{6}\.BAS$/i],
  ["108", /(^|[^0-9])UG\d{6}\.BAS$/i],
  ["109", /(^|[^0-9])OD\d{6}\.BAS$/i],
  ["503", /(^|[^0-9])CL\d{6}\.LCO$/i],
  ["504", /(^|[^0-9])MC\d{6}\.LCO$/i],
  ["951", /(^|[^0-9])AG\d{6}\.CPF$/i],
  ["952", /(^|[^0-9])DS\d{6}\.CPF$/i],
  ["953", /(^|[^0-9])RA\d{6}\.CPF$/i]
] as const;

export const COMPETENCIA_PATTERN = /(?<!\d)(20\d{4})(?!\d)/;

export function detectarLayout(nomeArquivo: string): string | null {
  for (const [codigo, pattern] of LAYOUT_PATTERNS) {
    if (pattern.test(nomeArquivo)) return codigo;
  }
  return null;
}

export function detectarCompetencia(nomeArquivo: string): string | null {
  const match = nomeArquivo.match(COMPETENCIA_PATTERN);
  return match?.[1] ?? null;
}
