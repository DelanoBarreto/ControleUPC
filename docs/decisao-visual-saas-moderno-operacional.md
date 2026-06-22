# Decisao Visual - SaaS Moderno Operacional

Status: regra oficial para a area logada do Controle UPC.

Data: 2026-06-21.

## 1. Decisao

A area logada do Controle UPC nao deve seguir a restricao anterior de
"GED denso sem gradientes". Essa tentativa ficou visualmente antiga e foi
rejeitada pelo usuario.

A direcao oficial passa a ser:

> SaaS moderno operacional: acabamento premium de produto web atual,
> combinado com eficiencia de ferramenta GED/Excel para prestacao de contas.

## 2. Referencia Visual

Referencia principal:

- `Lumina Dashboard / Clean UI Interface Refinement`;
- sidebar clara e topbar branca compacta;
- barra horizontal de contexto;
- checklist central e coluna lateral de indicadores;
- cards brancos com profundidade;
- sombras discretas;
- radius de 8px em controles e 12px a 16px em paineis;
- hierarquia tipografica forte;
- acentos azul, amarelo, teal e lilas/roxo;
- graficos e metricas claras;
- composicao leve, limpa e atual.

Referencias secundarias:

- Wisedocs para fluxo de documentos, upload, busca e organizacao GED;
- Excel/planilhas para densidade operacional dos modelos da IN;
- sistemas GED apenas como referencia funcional, nao como copia visual.

## 3. Permitido

- Gradientes em cards, headers, graficos, areas de contexto e destaques.
- Sombras leves, medias e fortes para criar profundidade.
- Cards com visual premium e microinteracoes.
- Acentos lilas/roxo, amarelo, teal e azul.
- Graficos, indicadores, barras de progresso e visual analitico.
- Layout mais sofisticado, com composicao de dashboard moderno.

## 4. Proibido

- Copiar GED antigo literalmente.
- Fazer tela administrativa cinza e sem personalidade.
- Criar dashboard generico sem relacao com a IN.
- Transformar a area logada em landing page decorativa.
- Usar gradiente sem funcao.
- Espalhar cores fortes sem significado.
- Sacrificar tabelas, filtros, checklist e produtividade por estetica.

## 5. Aplicacao Nas Telas

### Prestacao / Contexto

Primeira tela implementada para aprovação.

Estrutura vigente:

- sidebar clara;
- topbar branca;
- barra de municipio, exercicio, UPC/UG, gestor e periodo;
- botoes Trocar UPC e Trocar Municipio;
- progresso da prestacao;
- checklist da IN;
- coluna lateral com recentes e acessos rapidos;
- shell maximo de `1440px`, centralizado em telas maiores.

### Modelo Da IN

Deve parecer uma planilha controlada moderna:

- grade densa;
- campos oficiais bloqueados;
- valores editaveis com status;
- origem dos dados visivel;
- anexos por linha/campo;
- barra superior com contexto e acoes.

### Importacao SIM

Deve ser simples e bonita:

- upload de zip/pasta;
- arquivos detectados;
- competencia inferida;
- status do processamento;
- erros claros.

### Anexos

Deve misturar GED moderno com preview:

- painel de metadados;
- area de upload;
- lista de arquivos;
- preview PDF;
- vinculo com modelo, campo ou responsavel.

## 6. Regra De Hierarquia Documental

Este documento e `docs/design-tokens-controle-upc.md` substituem qualquer
trecho anterior que proibia gradientes, roxo/lilas, cards destacados,
sombras ou visual de dashboard moderno na area logada.

Se houver conflito, prevalece:

1. `docs/decisao-visual-saas-moderno-operacional.md`
2. `docs/design-tokens-controle-upc.md`
3. `docs/direcao-visual-controle-upc.md`
4. documentos gerais de PRD e plano

## 7. Proximo Passo

Obter a aprovação final de `/dashboard`. Depois refazer o Modelo 01 como planilha
controlada moderna, mantendo o mesmo shell visual.
