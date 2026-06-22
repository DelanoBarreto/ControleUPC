# Direcao Visual - Controle UPC

## 1. Referencias Analisadas

Referencias usadas:

- site publico Wisedocs;
- telas internas de sistema GED enviadas em imagem;
- objetivo do Controle UPC como sistema operacional de prestacao de contas municipal.

## 2. Direcao Recomendada

O Controle UPC deve seguir uma linha visual de SaaS moderno operacional.

Atualizacao aprovada em junho de 2026: a referencia principal da area interna
passa a ser o layout `Lumina Dashboard / Clean UI Interface Refinement` enviado
pelo usuario. A composicao deve usar sidebar clara fixa, topbar branca compacta,
barra horizontal de contexto, checklist central e coluna lateral de indicadores
e atalhos. Evitar hero grande dentro das telas operacionais.

O shell completo da aplicacao deve ter largura maxima de `1440px`, incluindo
sidebar e conteudo. Em monitores maiores, o sistema permanece centralizado e nao
estica tabelas ou formularios por toda a tela.

A referencia visual enviada pelo usuario, com dashboard financeiro moderno,
passa a orientar a area logada: cards brancos com profundidade, hierarquia forte,
acento azul/amarelo/lilas, graficos claros, composicao premium e acabamento de
produto web atual. A experiencia deve continuar operacional, mas nao pode parecer
um GED antigo nem uma tela administrativa ultrapassada.

A referencia Wisedocs e util para:

- sensacao SaaS moderna;
- branco como base;
- azul como cor principal;
- cards leves;
- menus simples;
- foco em documento, upload, busca, OCR e auditoria.

A referencia de dashboard moderno enviada em print e util para:

- acabamento visual premium;
- cards com sombra e profundidade;
- metricas escaneaveis;
- composicao leve com bastante respiro;
- graficos e indicadores com acentos visuais;
- sensacao de sistema web atual, nao legado.

As telas internas do video sao uteis para:

- sidebar de modulos;
- busca rapida;
- grid de documentos;
- area de upload por arrastar e soltar;
- cadastro de metadados;
- botoes de exportacao;
- operacao densa para usuario que trabalha varias horas no sistema.

## 3. O Que Aproveitar

### Navegacao

- barra superior azul institucional;
- identificacao do municipio/tenant no topo;
- menu lateral com icones e texto;
- destaque claro para item ativo;
- grupos por modulo: Dashboard, Prestacoes, Modelos, Importacao SIM, Anexos, Exportacoes, Relatorios, Administracao.

### Telas Operacionais

- layout em duas colunas quando fizer sentido;
- painel esquerdo para contexto e filtros;
- area principal para tabela, modelo, upload ou revisao;
- cards modernos com radius, sombra leve/media e boa hierarquia;
- bordas finas combinadas com profundidade visual;
- botoes claros e previsiveis;
- grids com filtros, exportacao, selecao e acoes por linha.
- microinteracoes discretas em hover, foco, selecao e salvamento.

### Documentos E Anexos

- area de upload grande com borda tracejada;
- listagem de anexos com status;
- metadados do documento ao lado do upload;
- preview de PDF/documento;
- acoes de abrir, baixar, substituir, excluir e vincular ao campo/modelo.

## 4. O Que Evitar

- copiar o visual antigo do GED literalmente;
- copiar dashboards genericos sem adaptar ao fluxo da IN;
- usar muitos icones pequenos sem legenda;
- menus suspensos longos em cima de telas importantes;
- excesso de botoes lado a lado sem hierarquia;
- tabelas muito largas sem congelar colunas importantes;
- cores fortes demais sem funcao;
- usar landing page como tela principal do usuario logado.

## 5. Layout Base Da Area Logada

### Topo

Deve conter:

- logo do Controle UPC;
- municipio selecionado;
- exercicio;
- UPC selecionada;
- usuario;
- acao rapida de trocar contexto.

O contexto atual deve aparecer em uma barra horizontal compacta com municipio,
exercicio, UPC/UG, gestor e periodo. As acoes `Trocar UPC` e `Trocar Municipio`
abrem a edicao sem transformar a tela inicial em um formulario extenso.

### Sidebar

Itens recomendados:

- Dashboard;
- Prestacoes de Contas;
- Modelos da IN;
- Importacao SIM;
- Anexos;
- Pendencias;
- Exportacoes;
- Relatorios;
- Administracao.

### Conteudo

Cada tela deve ter:

- titulo curto;
- contexto atual;
- filtros principais;
- area de trabalho;
- acoes primarias no canto superior direito;
- status de salvamento/processamento quando houver.

## 6. Telas Prioritarias

### Dashboard

Deve mostrar:

- UPCs em andamento;
- prazo de 180 dias;
- modelos pendentes;
- anexos ausentes;
- importacoes SIM com erro;
- progresso geral por municipio/exercicio.

### Prestacao De Contas

Deve permitir:

- escolher municipio;
- escolher exercicio;
- escolher UPC;
- visualizar gestor;
- visualizar periodo;
- abrir checklist da IN;
- abrir modelo especifico.

### Modelo Da IN

Deve funcionar como renderizador de template versionado:

- secoes e quadros vindos do banco;
- textos oficiais bloqueados;
- campos automaticos identificados;
- campos manuais editaveis;
- campos hibridos com revisao;
- anexos vinculados por modelo, secao, campo ou responsavel.

### Importacao SIM

Deve ser simples:

- municipio;
- exercicio;
- upload de pasta ou `.zip`;
- resumo dos arquivos detectados;
- status do processamento;
- relatorio de erros.

### Anexos

Deve seguir padrao GED:

- area grande de upload;
- lista dos arquivos;
- preview;
- vinculo com modelo/campo/responsavel;
- status de conversao para PDF;
- indicacao se entra no pacote final.

## 7. Paleta E Estilo

Base recomendada:

- fundo principal: cinza muito claro ou branco premium com leve textura/gradiente;
- paineis: branco;
- bordas: cinza claro;
- cor primaria: azul institucional;
- acentos: teal, amarelo e lilas/roxo usados com criterio;
- sucesso: verde;
- alerta: amarelo;
- erro/vencido: vermelho;

Estilo:

- tipografia Manrope ou equivalente geometrica moderna;
- raio de 8px em botoes e 12px a 16px em paineis;
- sombra leve apenas em paineis flutuantes e coluna lateral;
- gradientes permitidos em areas de destaque, graficos e cards de contexto;
- tipografia clara, moderna e com hierarquia forte;
- icones com legenda em menus principais;
- densidade maior em telas de trabalho do que em tela publica.

Na tela de Prestacao/Contexto, a preferencia e por superficies brancas, bordas
finas e azul institucional. Gradientes ficam reservados para elementos pontuais,
nao para dominar o fluxo operacional.

## 8. Regra De Produto

A area logada deve parecer um sistema de trabalho moderno, nao um site de propaganda
e nao um GED antigo.

A tela publica pode ser inspirada no Wisedocs.

A area interna deve combinar:

- organizacao operacional tipo GED/Excel;
- acabamento visual de dashboard SaaS moderno;
- linguagem da IN como eixo principal;
- modelos versionados renderizados pelo sistema.

Fluxos obrigatorios:

- contexto de prestacao;
- modelos da IN;
- importacao SIM;
- anexos;
- revisao;
- exportacao;
- pendencias.
