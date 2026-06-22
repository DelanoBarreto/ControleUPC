# PRD Técnico — Prestação de Contas

## Produto

Prestação de Contas é um sistema multi-tenant para controle e organização de prestações de contas municipais.

Cada município terá seus próprios exercícios, documentos, relatórios, envios e usuários.

## Objetivo

Permitir que municípios organizem e acompanhem informações de prestação de contas, com separação segura por município.

## Banco de dados

Todas as tabelas do produto Prestação de Contas devem usar prefixo:

```txt
prestacao_
```

Os IDs devem ser UUID.

Os nomes das tabelas e campos devem ser em português.

## Tabelas iniciais sugeridas

### prestacao_municipios

Pode representar os municípios/clientes deste produto.

Mesmo que exista `portalgov_municipios`, manter `prestacao_municipios` para o produto ser independente dentro do banco compartilhado.

Campos sugeridos:

```txt
id uuid primary key
nome text not null
slug text unique not null
codigo_ibge text
uf text default 'CE'
ativo boolean default true
criado_em timestamptz default now()
atualizado_em timestamptz
```

### prestacao_usuarios

Vincula usuários do Supabase Auth aos municípios no sistema de prestação de contas.

Não guardar senha aqui.

Campos sugeridos:

```txt
id uuid primary key
user_id uuid not null references auth.users(id)
municipio_id uuid not null references prestacao_municipios(id)
perfil text not null
ativo boolean default true
criado_em timestamptz default now()
atualizado_em timestamptz
```

Um mesmo usuário pode acessar mais de um município.

### prestacao_exercicios

Representa o ano/exercício da prestação de contas.

Campos sugeridos:

```txt
id uuid primary key
municipio_id uuid not null references prestacao_municipios(id)
ano integer not null
status text default 'aberto'
data_inicio date
data_fim date
criado_em timestamptz default now()
atualizado_em timestamptz
```

### prestacao_categorias_documentos

Categorias ou tipos de documentos exigidos.

Campos sugeridos:

```txt
id uuid primary key
nome text not null
descricao text
ativo boolean default true
criado_em timestamptz default now()
atualizado_em timestamptz
```

### prestacao_documentos

Documentos vinculados a município e exercício.

Campos sugeridos:

```txt
id uuid primary key
municipio_id uuid not null references prestacao_municipios(id)
exercicio_id uuid references prestacao_exercicios(id)
categoria_id uuid references prestacao_categorias_documentos(id)
titulo text not null
descricao text
bucket text
caminho_arquivo text
arquivo_url text
tipo_mime text
tamanho_bytes bigint
status text default 'pendente'
criado_por uuid references auth.users(id)
criado_em timestamptz default now()
atualizado_em timestamptz
```

### prestacao_receitas

Campos sugeridos:

```txt
id uuid primary key
municipio_id uuid not null references prestacao_municipios(id)
exercicio_id uuid references prestacao_exercicios(id)
descricao text
valor numeric(14,2)
data_referencia date
fonte_recurso text
criado_por uuid references auth.users(id)
criado_em timestamptz default now()
atualizado_em timestamptz
```

### prestacao_despesas

Campos sugeridos:

```txt
id uuid primary key
municipio_id uuid not null references prestacao_municipios(id)
exercicio_id uuid references prestacao_exercicios(id)
descricao text
valor numeric(14,2)
data_referencia date
credor text
classificacao text
criado_por uuid references auth.users(id)
criado_em timestamptz default now()
atualizado_em timestamptz
```

### prestacao_relatorios

Campos sugeridos:

```txt
id uuid primary key
municipio_id uuid not null references prestacao_municipios(id)
exercicio_id uuid references prestacao_exercicios(id)
titulo text not null
tipo text
bucket text
caminho_arquivo text
arquivo_url text
status text default 'gerado'
criado_por uuid references auth.users(id)
criado_em timestamptz default now()
atualizado_em timestamptz
```

### prestacao_envios

Representa envios, protocolos ou remessas de prestação.

Campos sugeridos:

```txt
id uuid primary key
municipio_id uuid not null references prestacao_municipios(id)
exercicio_id uuid references prestacao_exercicios(id)
titulo text not null
descricao text
status text default 'rascunho'
data_envio timestamptz
protocolo text
criado_por uuid references auth.users(id)
criado_em timestamptz default now()
atualizado_em timestamptz
```

### prestacao_configuracoes

Campos sugeridos:

```txt
id uuid primary key
municipio_id uuid not null references prestacao_municipios(id)
chave text not null
valor jsonb
criado_em timestamptz default now()
atualizado_em timestamptz
```

## Área administrativa

Após login:

1. Autenticar com Supabase Auth.
2. Obter `auth.uid()`.
3. Consultar `prestacao_usuarios`.
4. Verificar municípios vinculados.
5. Se houver mais de um município, permitir seleção do município ativo.
6. Carregar somente dados do município ativo.
7. Controlar permissões pelo perfil.

## Perfis iniciais sugeridos

```txt
admin
operador
analista
visualizador
suporte
```

## RLS conceitual

Tabelas administrativas devem permitir acesso apenas quando existir vínculo ativo em `prestacao_usuarios`.

Exemplo conceitual:

```txt
auth.uid() deve existir em prestacao_usuarios.user_id
e prestacao_usuarios.municipio_id deve ser igual ao municipio_id do registro
e prestacao_usuarios.ativo = true
```

## Arquivos

Arquivos devem ficar no Storage.

Caminho sugerido:

```txt
prestacao/{municipio_id}/{exercicio_id}/documentos/{arquivo_id}.pdf
prestacao/{municipio_id}/{exercicio_id}/relatorios/{arquivo_id}.pdf
```

O banco deve armazenar apenas bucket, caminho, URL pública/assinada se aplicável e metadados.
