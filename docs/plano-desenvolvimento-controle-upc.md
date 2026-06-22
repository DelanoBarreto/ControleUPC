# Plano de Desenvolvimento - Controle UPC

## 1. Objetivo

Este documento transforma o PRD atual em um plano de desenvolvimento executavel.

Ele serve para:

- orientar o trabalho tecnico em ordem correta;
- registrar o que precisa mudar no PRD;
- manter pesquisa e desenvolvimento alinhados ao sistema real;
- evitar que o projeto vire uma colecao de telas soltas sem processo de entrega.

Para detalhes tecnicos operacionais, usar tambem `docs/guia-tecnico-execucao-controle-upc.md`.

Referencias adicionais de pesquisa:

- `docs/handoff-2026-06-21.md`
- `docs/controle-upc-documento-mestre.md`
- `docs/checklist-execucao-controle-upc.md`
- `docs/20260620000100_templates_versionados.sql`

Uso recomendado:

- o documento mestre novo ajuda a revisar estrategia, MVP e backlog;
- o SQL novo serve apenas como historico de raciocinio, nao como schema final;
- a verdade operacional continua sendo o banco remoto + migrations aplicadas + ADR-001.

## 2. Diagnostico Do PRD Atual

O PRD existente e util, mas ainda mistura tres coisas diferentes:

- visao de produto;
- regras de negocio da IN e do SIM;
- ordem de implementacao tecnica.

Isso causa dois problemas:

1. fica dificil saber o que e decisao de produto e o que e tarefa de desenvolvimento;
2. a ordem de entrega nao esta fechada o bastante para guiar o trabalho diario.

## 3. O Que Precisa Mudar No PRD

### 3.1 Separar nivel estrategico de nivel tecnico

O PRD deve ter:

- visao do produto;
- regra regulatoria;
- escopo do MVP;
- fora de escopo;
- criterios de aceite;
- riscos e decisoes pendentes.

O plano de desenvolvimento deve ter:

- ordem de implementacao;
- dependencias entre modulos;
- backlog por fase;
- criterios tecnicos;
- pontos de validacao.

### 3.2 Fixar a hierarquia correta do dominio

O sistema precisa deixar claro que:

- a IN define o que o usuario ve e entrega;
- o SIM e base auxiliar de importacao e relacionamento;
- a UPC e a unidade de negocio do sistema;
- a prestacao de contas e a instanciacao do trabalho por UPC e exercicio;
- os modelos da IN sao configuracao versionada, nao telas hardcoded.

Essa decisao esta formalizada em `docs/adr-001-modelos-in-versionados.md`.

### 3.3 Definir o caminho de implementacao

A ordem correta de entrega deve ser:

1. base do produto e identidade visual;
2. modelo de dados e prestacao de contas;
3. templates versionados dos modelos da IN;
4. importacao SIM;
5. renderizador visual do Modelo 01;
6. anexos e consolidacao de arquivos;
7. exportacao PDF e Excel;
8. dashboard e pendencias;
9. OCR e LLM assistido;
10. replicacao para os demais modelos.

## 4. Decisoes Ja Consolidadas

- A IN 01/2025 e a regra principal.
- O Manual SIM 2026 e apenas referencia tecnica.
- O usuario nao trabalha em telas do SIM.
- A importacao recebe municipio e exercicio.
- O mes nao e selecionado manualmente.
- Os arquivos podem vir em pasta ou `.zip`.
- O sistema deve preservar os originais importados.
- Os textos oficiais da IN nao podem ser editados.
- Os campos e valores controlados podem ser editados com auditoria.
- Os anexos pertencem ao modelo, ao campo e, quando preciso, ao responsavel.
- O MVP inicial deve comecar pelo Modelo 01.
- O Modelo 01 deve validar o renderizador generico de templates da IN.

## 5. Plano De Desenvolvimento

### Fase 0 - Base De Produto

Entrega:

- documento mestre do projeto;
- PRD de execucao;
- plano de desenvolvimento;
- convencoes de nomenclatura;
- mapa de decisoes pendentes.

Saida esperada:

- qualquer pessoa consegue retomar o projeto sem perder contexto.

### Fase 1 - Fundacao Tecnica

Entrega:

- monorepo organizado;
- app web;
- worker de processamento;
- banco Supabase;
- storage;
- fila de jobs;
- tema visual inicial;
- home moderna.

Saida esperada:

- o sistema abre, navega e esta pronto para receber dados.

### Fase 2 - Dominio E Banco

Entrega:

- municipio;
- exercicio;
- UPC;
- gestao;
- prestacao de contas;
- versoes normativas;
- modelos da IN;
- secoes, quadros, linhas, colunas e campos dos modelos;
- classificacao de campos;
- valores editaveis;
- anexos;
- auditoria;
- status de preenchimento;
- estrutura de importacao e staging.

Saida esperada:

- o banco sustenta o trabalho real sem depender de gambiarras de front-end.

### Fase 3 - Templates Versionados Da IN

Entrega:

- tabela de versao normativa da IN e Portarias;
- template versionado de modelo;
- estrutura de secoes, quadros, linhas, colunas e campos;
- classificacao de preenchimento por campo;
- mapeamento entre campo do modelo e origem SIM;
- regra de obrigatoriedade, anexo e declaracao de inexistencia;
- seed do Modelo 01 na versao IN 01/2025 atualizada pela Portaria 51/2026.

Saida esperada:

- o sistema consegue mudar modelos por configuracao, sem reescrever a tela a cada Portaria.

### Fase 4 - Importacao SIM

Entrega:

- upload por municipio e exercicio;
- aceite de pasta ou `.zip`;
- deteccao automatica de layout;
- deteccao de competencia pelos arquivos;
- preservacao do original;
- registro em staging;
- validacao de consistencia;
- relatorio de erros.

Saida esperada:

- o sistema consegue importar a base auxiliar sem exigir digitacao manual.

### Fase 5 - Renderizador E Modelo 01

Entrega:

- renderizador generico de modelo da IN;
- Modelo 01 carregado a partir do template versionado;
- tela com visual de formulario/tabela moderna;
- selecao de prestacao de contas;
- carregamento automatico dos dados;
- edicao controlada;
- bloqueio dos textos oficiais;
- salvamento campo a campo;
- auditoria das alteracoes.

Saida esperada:

- o usuario consegue trabalhar no padrao da IN com experiencia proxima do Excel, mas com regras do sistema.

### Fase 6 - Anexos E Pacote Final

Entrega:

- upload de PDF, Word, Excel e imagens;
- vinculacao por modelo, secao, campo e responsavel;
- abertura do anexo original;
- conversao para PDF quando necessario;
- consolidacao do pacote final.

Saida esperada:

- o sistema vira um dossie digital da UPC.

### Fase 7 - Exportacao

Entrega:

- PDF fiel ao padrao da IN;
- Excel formatado;
- layout legivel para revisao humana;
- pacote final com anexos e indice de documentos.

Saida esperada:

- o usuario consegue entregar e revisar fora da tela.

### Fase 8 - Dashboard E Controle

Entrega:

- progresso por UPC;
- pendencias por modelo;
- faltas de anexo;
- importacoes com erro;
- metricas por periodo;
- visao executiva da operacao.

Saida esperada:

- o escritorio ou municipio enxerga o que falta e o que ja foi concluido.

### Fase 9 - OCR E LLM Assistido

Entrega:

- leitura de PDF e imagem;
- extracao assistida;
- sugestao de campos;
- revisao humana obrigatoria;
- gravacao apenas apos confirmacao.

Saida esperada:

- reduzir digitacao sem perder controle.

### Fase 10 - Replicacao Para Outros Modelos

Entrega:

- mesmos padroes aplicados aos demais modelos da IN;
- configuracao versionada por modelo;
- campos automaticos, manuais e anexos classificados por regra.

## 6. Backlog Imediato

1. concluido: ligar a UI ao endpoint de abertura de contexto da prestacao;
2. concluido: fechar a tela de selecao de prestacao de contas sem IDs exemplificativos;
3. concluido: criar a base de templates versionados da IN;
4. concluido parcial: migrar o Modelo 01 para template versionado;
5. concluido: separar o editor visual em componente generico de template;
6. concluido: criar pagina/rota dinamica para outros modelos da IN;
7. concluido: refazer Prestacao/Contexto no design Lumina e limitar shell a `1440px`;
8. obter aprovação final da tela Prestacao/Contexto;
9. refazer Modelo 01 como planilha controlada;
10. completar o fluxo do Modelo 01 com dados reais do banco;
11. implementar conversao de anexos para PDF;
12. montar exportacao PDF e Excel;
13. fortalecer importacao SIM com validacao por layout;
14. construir dashboard executivo de pendencias;
15. preparar RLS, Auth e OCR/LLM assistido.

O status detalhado de cada módulo está em:

- `docs/checklist-execucao-controle-upc.md`

## 7. Padrao De Pesquisa Para Desenvolvimento

Antes de implementar qualquer novo modulo, pesquisar:

- regra da IN afetada;
- modelo da IN envolvido;
- campo ou documento afetado;
- origem dos dados no SIM ou manual;
- necessidade de anexo;
- necessidade de auditoria;
- formato de exportacao.

## 8. Criterios De Aceite Do Plano

- o PRD passa a ter fronteiras claras;
- a ordem de entrega fica fechada;
- o desenvolvimento deixa de depender de memoria da conversa;
- cada fase tem saida esperada;
- o que e pesquisa, o que e regra e o que e implementacao ficam separados.
