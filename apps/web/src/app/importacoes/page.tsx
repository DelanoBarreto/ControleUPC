import ImportacoesClient from "./ImportacoesClient";

type ImportacoesPageProps = {
  searchParams?: Promise<{
    codigo_municipio?: string;
    exercicio?: string;
    prestacao_contas_id?: string;
  }>;
};

export default async function ImportacoesPage({ searchParams }: ImportacoesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <ImportacoesClient
      codigoMunicipioInicial={resolvedSearchParams?.codigo_municipio?.trim() || "014"}
      exercicioInicial={resolvedSearchParams?.exercicio?.trim() || "2026"}
      prestacaoContasIdInicial={resolvedSearchParams?.prestacao_contas_id?.trim() || ""}
    />
  );
}
