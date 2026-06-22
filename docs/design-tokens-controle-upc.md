# Design Tokens - Controle UPC

Status: obrigatorio para a area logada.

Direcao oficial: SaaS moderno operacional. O sistema deve ter acabamento visual premium,
parecido com dashboards web modernos de 2026, mas sem perder a eficiencia de ferramenta
de trabalho para prestacao de contas, modelos da IN, tabelas, anexos e importacao SIM.

Referencia operacional oficial: `Lumina Dashboard / Clean UI Interface Refinement`.
Usar abordagem Flat 2.0, sidebar clara, topbar branca, barra compacta de contexto,
cards com borda fina e sombras discretas.

Largura maxima do shell interno: `1440px`, centralizado. O fundo externo usa tom
neutro para delimitar a aplicacao em monitores ultrawide.

## Cores

| Token | Hex | Uso |
|---|---|---|
| `bg-page` | `#F6F7FB` | Fundo principal da aplicacao |
| `bg-page-soft` | `#EEF3FA` | Fundo alternativo para areas de destaque |
| `bg-panel` | `#FFFFFF` | Paineis, cards, sidebar |
| `border-default` | `#E2E4E8` | Bordas finas |
| `border-strong` | `#C7CBD1` | Borda hover/foco |
| `text-primary` | `#1F2329` | Texto principal |
| `text-secondary` | `#6B7280` | Labels e texto secundario |
| `azul-institucional` | `#1E4E8C` | Topbar, links, botoes primarios |
| `azul-institucional-hover` | `#163C6B` | Hover/active primario |
| `azul-institucional-bg-suave` | `#E8EEF8` | Item ativo sidebar |
| `teal-acento` | `#0F766E` | Acento secundario moderado |
| `amarelo-acento` | `#F6B100` | Indicadores, progresso e destaques controlados |
| `lilas-acento` | `#6D5DF6` | Acento visual secundario para graficos e detalhes |
| `roxo-profundo` | `#2D2942` | Areas premium, graficos ou modo escuro futuro |
| `sucesso` | `#1A7F37` | Status concluido |
| `sucesso-bg` | `#EAF6EC` | Fundo sucesso |
| `alerta` | `#B45309` | Pendencia/atencao |
| `alerta-bg` | `#FDF3E7` | Fundo alerta |
| `erro` | `#B42318` | Erro/vencido |
| `erro-bg` | `#FBEAE9` | Fundo erro |

## Gradientes

Gradientes sao permitidos e recomendados quando ajudarem a criar profundidade,
hierarquia ou acabamento premium. Devem ser usados com moderacao.

| Token | Valor | Uso |
|---|---|---|
| `gradient-primary` | `linear-gradient(135deg, #1E4E8C 0%, #2F6FB5 55%, #6D5DF6 100%)` | Hero interno pequeno, cards de contexto, grafico principal |
| `gradient-soft` | `radial-gradient(circle at top left, rgba(47,111,181,.16), transparent 35%), linear-gradient(180deg, #FFFFFF 0%, #F6F7FB 100%)` | Fundo suave de areas premium |
| `gradient-dark` | `linear-gradient(135deg, #171B2A 0%, #252A44 55%, #2D2942 100%)` | Preview de modo escuro ou painel analitico futuro |

## Elevacao

| Token | Valor | Uso |
|---|---|---|
| `shadow-sm` | `0 6px 18px rgba(31, 35, 41, .06)` | Cards simples |
| `shadow-md` | `0 16px 40px rgba(31, 35, 41, .10)` | Paineis principais |
| `shadow-xl` | `0 28px 80px rgba(31, 35, 41, .16)` | Elementos em destaque, preview e cards flutuantes |

## Raio E Densidade

- Cards e paineis: `12px` a `16px`.
- Inputs e botoes: `8px`.
- Tabelas operacionais: densas, com altura de linha menor, cabecalho fixo e boa leitura.
- Modelos da IN: visual de planilha controlada, sem parecer formulario antigo.

## Tipografia

- Familia principal: `Manrope`, com fallback para `Segoe UI` e `system-ui`.
- Titulos: peso `600` ou `700`.
- Metadados e cabecalhos: `10px` a `12px`, uppercase e tracking discreto.
- Numeros de progresso: peso `800`, com algarismos tabulares quando necessario.

## Regras

- Gradientes sao permitidos na area logada quando houver funcao visual clara.
- Roxo/lilas e amarelo sao permitidos como acentos modernos, especialmente em graficos, metricas e detalhes.
- Cards podem ter sombra, profundidade, radius maior e microinteracoes.
- A area logada nao deve parecer landing page, mas tambem nao deve parecer GED antigo.
- Evitar excesso de decoracao sem funcao, blobs genericos e gradientes aleatorios.
- Topbar pode ser azul solido, branca premium ou mista, conforme a tela.
- Sidebar deve ser moderna, clara, escaneavel e com item ativo bem definido.
- A tela de contexto deve priorizar topbar branca e sidebar clara.
- Nao usar hero grande na tela operacional de Prestacao/Contexto.
- Status verde/amarelo/vermelho continuam reservados para significado operacional.
- O usuario deve sentir que esta em um produto web atual, bonito e confiavel, sem perder eficiencia.
