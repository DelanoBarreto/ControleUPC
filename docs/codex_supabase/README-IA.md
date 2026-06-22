# README-IA — Contexto Geral do Projeto para Codex

## Objetivo deste documento

Este documento deve ser usado como referência principal para qualquer IA/Codex que for trabalhar no projeto.

O projeto é composto por vários sistemas SaaS/micro-SaaS que inicialmente serão executados em:

- 1 VPS Hostinger KVM 4
- Ubuntu 24.04
- EasyPanel
- 1 Supabase self-hosted instalado via Docker/Compose pelo EasyPanel
- 1 banco Postgres compartilhado
- 1 Auth central do Supabase
- Tabelas separadas por produto/sistema

## Produtos atuais

Os sistemas/produtos são:

1. `portalgov` — Portal municipal para prefeituras.
2. `prestacao` — Sistema de prestação de contas municipais.
3. `digitalizacao` — Sistema de digitalização de documentos.
4. `juridico` — Sistema de processos jurídicos.

Neste momento, os sistemas prioritários para modelagem são:

1. `portalgov`
2. `prestacao`

## Regra principal da arquitetura

Existe apenas um Supabase inicialmente.

Portanto, não criar um banco separado para cada sistema e não assumir que existe um Supabase por produto.

Todos os produtos devem conviver no mesmo banco, usando tabelas com prefixo.

Exemplo:

- `portalgov_municipios`
- `portalgov_noticias`
- `prestacao_municipios`
- `prestacao_documentos`
- `digitalizacao_empresas`
- `juridico_processos`

## Idioma e padrão de nomes

Usar nomes em português.

Usar prefixo do produto em todas as tabelas.

Usar `uuid` como tipo principal para IDs.

Não criar tabelas genéricas sem prefixo, como:

- `usuarios`
- `documentos`
- `municipios`
- `configuracoes`

Sempre criar com prefixo:

- `portalgov_usuarios`
- `portalgov_documentos`
- `prestacao_usuarios`
- `prestacao_documentos`

## Supabase Auth

O login e a senha dos usuários devem ficar somente no Supabase Auth, na tabela interna:

- `auth.users`

As tabelas próprias dos produtos não devem ter campo de senha.

As tabelas próprias devem guardar apenas vínculo, perfil, permissão e status.

Exemplo:

- `portalgov_usuarios`
- `prestacao_usuarios`

Essas tabelas devem referenciar `auth.users.id`.

## Usuário pode acessar mais de um município

Um usuário pode acessar mais de um município.

Exemplo:

O mesmo usuário pode ser:

- Admin do PortalGov de Aracati
- Editor do PortalGov de Sobral
- Operador da Prestação de Contas de Aracati

Por isso, as tabelas de vínculo precisam permitir múltiplos registros para o mesmo `user_id`.

## Segurança

O sistema deve ser multi-tenant.

Cada prefeitura, município, empresa ou cliente só deve acessar seus próprios dados.

A segurança deve ser feita em duas camadas:

1. Frontend/backend filtrando pelo município/empresa correto.
2. Banco de dados com RLS protegendo acesso indevido.

Não confiar apenas no frontend.

## Chaves do Supabase

Nunca expor `service_role_key` no frontend.

Frontend deve usar apenas a chave pública/anon/publishable.

Operações administrativas sensíveis devem ser feitas no backend ou com policies corretas.

## Arquivos

Não guardar PDFs, imagens ou documentos grandes diretamente no banco.

O banco deve guardar apenas:

- nome do arquivo
- tipo MIME
- tamanho
- bucket
- caminho do arquivo
- id do município/empresa
- usuário que enviou
- data de criação

Os arquivos físicos devem ficar no Supabase Storage ou, futuramente, em storage externo compatível com S3, como Cloudflare R2, AWS S3, Wasabi ou Backblaze B2.

## Regra para Codex

Antes de criar qualquer migration destrutiva, alteração em tabela existente, exclusão de campo, exclusão de tabela ou política RLS complexa, explicar o plano e pedir confirmação.
