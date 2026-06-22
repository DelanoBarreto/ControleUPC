# PROMPTS PARA CODEX — Projeto SaaS Supabase

## Prompt Mestre

```txt
Você está trabalhando em um projeto SaaS/micro-SaaS com Supabase self-hosted rodando em uma VPS Hostinger com EasyPanel.

A arquitetura atual usa apenas uma instalação do Supabase e um único banco Postgres para vários produtos.

Produtos:
1. PortalGov — portal municipal para prefeituras.
2. Prestação de Contas — sistema de prestação de contas municipais.
3. Digitalização — sistema de digitalização de documentos.
4. Jurídico — sistema de processos jurídicos.

Como existe apenas um Supabase, as tabelas devem ser separadas por prefixo do produto:
- portalgov_
- prestacao_
- digitalizacao_
- juridico_

Use nomes em português e IDs UUID.

Não crie tabelas genéricas como usuarios, documentos, noticias ou configuracoes sem prefixo.

O Supabase Auth será o cadastro geral de login. A tabela auth.users guarda o usuário, email e senha criptografada.

Não criar campos de senha nas tabelas próprias dos sistemas.

Cada produto deve ter sua própria tabela de vínculo de usuários:
- portalgov_usuarios
- prestacao_usuarios
- digitalizacao_usuarios
- juridico_usuarios

Essas tabelas devem usar user_id referenciando auth.users.id e devem indicar a qual município, empresa ou cliente o usuário pertence, além do perfil e status ativo.

Um usuário pode acessar mais de um município. Portanto, não assumir relacionamento um-para-um entre usuário e município.

O sistema deve ser multi-tenant. Cada prefeitura, empresa ou cliente deve acessar somente seus próprios dados.

No PortalGov, usar municipio_id nas tabelas de negócio.
Na Prestação de Contas, usar municipio_id nas tabelas de negócio.
Na Digitalização, usar empresa_id nas tabelas de negócio.
No Jurídico, usar cliente_id, empresa_id ou municipio_id conforme o contexto do módulo.

Todas as tabelas sensíveis devem ser pensadas para RLS. A segurança não deve depender apenas do frontend. O banco deve bloquear acesso entre clientes diferentes.

Arquivos, imagens e PDFs não devem ser guardados diretamente no banco. O banco deve guardar apenas metadados e caminho do arquivo.

Ao criar código, migrations, tabelas ou área administrativa:
- respeite os prefixos dos produtos;
- mantenha auth.users como login central;
- crie tabelas de vínculo por produto;
- inclua municipio_id, empresa_id ou cliente_id nas tabelas de negócio;
- prepare consultas para filtrar pelo cliente correto;
- prepare a arquitetura para RLS;
- não exponha service_role_key no frontend;
- não sugerir vários Supabases como padrão inicial.

Antes de criar qualquer migration destrutiva, alteração em tabela existente ou regra RLS complexa, explique o plano e peça confirmação.
```

## Prompt para modelar PortalGov

```txt
Crie o desenho inicial do banco para o produto PortalGov.

Contexto:
O PortalGov é um portal municipal multi-tenant. Cada município terá seu próprio site, identificado pelo domínio, por exemplo:
- www.aracati.ce.gov.br
- www.fortaleza.ce.gov.br

O sistema roda em um único Supabase compartilhado com outros produtos, então todas as tabelas deste produto devem começar com portalgov_.

Use nomes em português e IDs UUID.

Use auth.users como autenticação principal. Não criar senha em portalgov_usuarios.

Um usuário pode acessar mais de um município.

Crie tabelas iniciais para:
- municípios
- usuários do PortalGov
- notícias
- leis
- decretos
- licitações
- documentos
- secretarias
- banners
- configurações do site

Cada tabela de conteúdo deve ter municipio_id.

A tabela portalgov_usuarios deve vincular auth.users.id ao município e ao perfil do usuário.

Preparar o modelo para RLS, onde usuários só podem acessar dados dos municípios vinculados.

Não aplique migrations ainda. Primeiro me mostre o desenho das tabelas, campos, relacionamentos e regras de segurança sugeridas.
```

## Prompt para modelar Prestação de Contas

```txt
Crie o desenho inicial do banco para o produto Prestação de Contas.

Contexto:
O produto Prestação de Contas é um sistema multi-tenant para municípios. Cada município terá seus próprios exercícios, documentos, receitas, despesas, relatórios e envios.

O sistema roda em um único Supabase compartilhado com outros produtos, então todas as tabelas deste produto devem começar com prestacao_.

Use nomes em português e IDs UUID.

Use auth.users como autenticação principal. Não criar senha em prestacao_usuarios.

Um usuário pode acessar mais de um município.

Crie tabelas iniciais para:
- municípios
- usuários da prestação
- exercícios
- categorias de documentos
- documentos
- receitas
- despesas
- relatórios
- envios
- configurações

Cada tabela de negócio deve ter municipio_id.

A tabela prestacao_usuarios deve vincular auth.users.id ao município e ao perfil do usuário.

Preparar o modelo para RLS, onde usuários só podem acessar dados dos municípios vinculados.

Arquivos PDF/imagens não devem ser guardados no banco. O banco deve guardar somente metadados, bucket e caminho_arquivo.

Não aplique migrations ainda. Primeiro me mostre o desenho das tabelas, campos, relacionamentos e regras de segurança sugeridas.
```

## Prompt para área administrativa

```txt
Crie a lógica da área administrativa considerando Supabase Auth e multi-tenant.

Contexto:
O login é feito pelo Supabase Auth usando auth.users.

Após o login, o sistema deve:
1. Obter o user.id do Supabase Auth.
2. Verificar em qual produto o usuário está tentando entrar.
3. Consultar a tabela de vínculo correspondente:
   - portalgov_usuarios
   - prestacao_usuarios
   - digitalizacao_usuarios
   - juridico_usuarios
4. Verificar se o usuário está ativo.
5. Identificar o município, empresa ou cliente vinculado.
6. Se o usuário tiver mais de um município, permitir seleção do município ativo.
7. Identificar o perfil/permissão.
8. Carregar somente os menus e dados permitidos.

Não confiar apenas no frontend para segurança. As consultas devem filtrar por municipio_id, empresa_id ou cliente_id, e as tabelas devem ser preparadas para RLS.

Crie uma estrutura clara para:
- rota protegida
- carregamento do usuário logado
- carregamento do vínculo do usuário
- seleção de município ativo
- controle de menus por perfil
- bloqueio de acesso quando o usuário não estiver vinculado ao produto
```

## Prompt para revisar RLS

```txt
Revise a segurança do banco Supabase para este projeto multi-tenant.

Contexto:
Existe um único Supabase para vários produtos:
- PortalGov
- Prestação de Contas
- Digitalização
- Jurídico

Cada produto usa tabelas com prefixo próprio.

O login é centralizado em auth.users.

Cada produto tem sua tabela de vínculo de usuários.

Um usuário pode acessar mais de um município.

Quero garantir que:
1. Usuário de um município não acesse dados de outro município.
2. Usuário sem vínculo ativo não acesse a área administrativa.
3. O frontend não dependa da service_role_key.
4. Todas as tabelas sensíveis tenham RLS.
5. Storage seja protegido por caminho/bucket e vínculo do usuário.
6. Consultas públicas só retornem dados publicados e do município correto.

Antes de criar SQL, explique quais tabelas precisam de RLS e quais políticas serão necessárias.
```

## Prompt para criar nova tabela

```txt
Preciso criar uma nova tabela para o produto [NOME_DO_PRODUTO].

Regras obrigatórias:
- Usar prefixo do produto no nome da tabela.
- Usar nomes em português.
- Usar id como UUID.
- Não criar tabela genérica.
- Se a tabela pertencer a um município, empresa ou cliente, incluir municipio_id, empresa_id ou cliente_id.
- Incluir criado_em.
- Incluir atualizado_em se fizer sentido.
- Incluir criado_por quando o registro for criado por usuário logado.
- Preparar para RLS.
- Não guardar arquivos diretamente na tabela, apenas caminho e metadados.

Produto:
[PortalGov/Prestação/Digitalização/Jurídico]

Tabela desejada:
[descrever tabela]

Antes de gerar SQL, me mostre o desenho da tabela e os relacionamentos.
```
