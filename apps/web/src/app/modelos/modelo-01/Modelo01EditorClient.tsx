"use client";

import {
  TemplateEditorClient,
  type ValorCampoTemplate
} from "@/components/modelos/TemplateEditorClient";
import type { CampoModelo } from "./page";

type Props = {
  campos: CampoModelo[];
  contexto: {
    prestacaoContasId: string;
    totalCampos: number;
    totalCamposEditaveis: number;
    totalCamposBloqueados: number;
    totalFuncoes: number;
  };
  prestacaoContasIdInicial?: string;
  valores: ValorCampoTemplate[];
};

export function Modelo01EditorClient(props: Props) {
  return (
    <TemplateEditorClient
      {...props}
      templateCodigo="modelo_01"
      titulo="Modelo 01 - Rol de Responsaveis"
    />
  );
}
