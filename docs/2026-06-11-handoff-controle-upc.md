# Handoff Controle UPC - 2026-06-11

## O que foi feito

- Landing page redesenhada com visual SaaS moderno e CTA mais legível.
- Dashboard operacional refeito para focar na prestação, seleção de contexto e acesso ao Modelo 01.
- Tela de importações separada do painel principal, agora com `prestacao_contas_id`, `codigo_municipio` e `exercicio` no fluxo.
- API de importação de lotes passou a aceitar e devolver `prestacao_contas_id`.
- Página do Modelo 01 recebeu o mesmo padrão visual das telas principais e links consistentes para importações.
- Editor do Modelo 01 foi refinado com cabeçalho mais limpo, cópia revisada e layout mais consistente.
- A checagem `corepack pnpm check` passou após os ajustes.

## Fluxo atual

1. Entrar pela landing page.
2. Abrir o dashboard e selecionar município, exercício e prestação.
3. Ir para importações com o contexto já carregado.
4. Abrir o Modelo 01 com o mesmo `prestacao_contas_id`.
5. Carregar valores, anexos e salvar os campos do modelo.

## Próximo passo sugerido

- Refinar os blocos internos do editor do Modelo 01 para reduzir densidade visual e melhorar a leitura dos campos e anexos.
- Se necessário, ajustar a tela inicial para ficar como porta principal de seleção de município e ano antes do dashboard.
