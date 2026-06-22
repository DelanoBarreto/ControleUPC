# ADR-001 - Modelos da IN como templates versionados

## Status

Aceita.

## Contexto

A IN TCE-CE 01/2025, atualizada pela Portaria 51/2026, define os anexos, modelos, quadros, tabelas e demonstrativos que compoem a prestacao de contas municipal.

O Art. 31 da IN autoriza o Presidente do TCE-CE a promover, por Portaria, atualizacoes, inclusoes, exclusoes ou alteracoes no conteudo dos anexos, informacoes, tabelas, quadros, modelos e demonstrativos.

Como a propria IN 01/2025 ja foi atualizada pela Portaria 51/2026, a alteracao dos modelos por Portaria deve ser tratada como comportamento normal do regulador, nao como excecao.

## Decisao

Os modelos da IN devem ser tratados como configuracao versionada no banco de dados, e nao como telas fixas no codigo.

O frontend deve atuar como renderizador generico de modelos, lendo do banco:

- versao normativa aplicavel;
- anexo;
- modelo;
- secoes;
- quadros;
- linhas;
- colunas;
- campos;
- classificacao de preenchimento;
- regras de obrigatoriedade;
- origem possivel dos dados;
- regras de anexo;
- regra de declaracao de inexistencia.

O PDF e o Excel tambem devem ser gerados a partir da mesma configuracao versionada, garantindo que a tela, os dados salvos e a exportacao usem a mesma fonte de verdade.

## Consequencias

- O Modelo 01 nao deve evoluir como uma tela fixa hardcoded.
- O Modelo 01 deve ser o primeiro caso de uso do renderizador generico.
- A tabela atual `controle_upc.modelo_in` e a tabela `controle_upc.campo_modelo` sao apenas a base inicial, mas precisam evoluir para suportar versao normativa, secoes, quadros, colunas, classificacao de campos e vigencia.
- Prestacoes antigas devem continuar vinculadas a versao do modelo usada no momento da criacao ou fechamento.
- Mudancas futuras por Portaria devem gerar nova versao de template, sem alterar retroativamente prestacoes ja fechadas.

## Impacto No Proximo Desenvolvimento

A proxima fase tecnica deve priorizar a evolucao do banco e da UI para template versionado antes de expandir a tela do Modelo 01.

Ordem recomendada:

1. criar estrutura de versao normativa e template de modelo;
2. migrar o Modelo 01 atual para essa estrutura;
3. criar renderizador generico no frontend;
4. salvar valores por prestacao e campo de template;
5. gerar PDF e Excel a partir do template versionado;
6. repetir o padrao para os demais modelos da IN.
