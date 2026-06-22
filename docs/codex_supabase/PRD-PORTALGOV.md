# PRD Técnico — PortalGov

## Produto

PortalGov é um portal municipal multi-tenant para prefeituras.

Cada município terá seu próprio site público, identificado por domínio.

Exemplo:

- `www.aracati.ce.gov.br`
- `www.fortaleza.ce.gov.br`
- `www.sobral.ce.gov.br`

O sistema também terá área administrativa para usuários vinculados a um ou mais municípios.

## Objetivo

Permitir que cada município gerencie suas informações públicas, como:

- notícias
- leis
- decretos
- licitações
- documentos
- secretarias
- banners
- páginas institucionais
- configurações do portal

Cada município deve ver e administrar apenas seus próprios dados.

## Banco de dados

Todas as tabelas do PortalGov devem usar prefixo:

```txt
portalgov_
```

Os IDs devem ser UUID.

Os nomes das tabelas e campos devem ser em português.

## Tabelas iniciais sugeridas

### portalgov_municipios

Representa os municípios/clientes do PortalGov.

Campos sugeridos:

```txt
id uuid primary key
nome text not null
slug text unique not null
codigo_ibge text
uf text default 'CE'
dominio_principal text
ativo boolean default true
logo_url text
brasao_url text
criado_em timestamptz default now()
atualizado_em timestamptz
```

### portalgov_usuarios

Vincula usuários do Supabase Auth aos municípios.

Importante: não guardar senha aqui.

Campos sugeridos:

```txt
id uuid primary key
user_id uuid not null references auth.users(id)
municipio_id uuid not null references portalgov_municipios(id)
perfil text not null
ativo boolean default true
criado_em timestamptz default now()
atualizado_em timestamptz
```

Um mesmo `user_id` pode aparecer várias vezes, uma para cada município.

### portalgov_noticias

Campos sugeridos:

```txt
id uuid primary key
municipio_id uuid not null references portalgov_municipios(id)
titulo text not null
slug text
resumo text
conteudo text
imagem_url text
status text default 'rascunho'
publicado_em timestamptz
criado_por uuid references auth.users(id)
criado_em timestamptz default now()
atualizado_em timestamptz
```

### portalgov_leis

Campos sugeridos:

```txt
id uuid primary key
municipio_id uuid not null references portalgov_municipios(id)
numero text not null
ano integer
ementa text
descricao text
arquivo_url text
status text default 'publicado'
data_publicacao date
criado_por uuid references auth.users(id)
criado_em timestamptz default now()
atualizado_em timestamptz
```

### portalgov_decretos

Campos sugeridos:

```txt
id uuid primary key
municipio_id uuid not null references portalgov_municipios(id)
numero text not null
ano integer
ementa text
descricao text
arquivo_url text
status text default 'publicado'
data_publicacao date
criado_por uuid references auth.users(id)
criado_em timestamptz default now()
atualizado_em timestamptz
```

### portalgov_licitacoes

Campos sugeridos:

```txt
id uuid primary key
municipio_id uuid not null references portalgov_municipios(id)
numero text
modalidade text
objeto text
status text
data_abertura timestamptz
arquivo_url text
criado_por uuid references auth.users(id)
criado_em timestamptz default now()
atualizado_em timestamptz
```

### portalgov_documentos

Campos sugeridos:

```txt
id uuid primary key
municipio_id uuid not null references portalgov_municipios(id)
titulo text not null
categoria text
descricao text
bucket text
caminho_arquivo text
arquivo_url text
tipo_mime text
tamanho_bytes bigint
status text default 'publicado'
criado_por uuid references auth.users(id)
criado_em timestamptz default now()
atualizado_em timestamptz
```

### portalgov_secretarias

Campos sugeridos:

```txt
id uuid primary key
municipio_id uuid not null references portalgov_municipios(id)
nome text not null
slug text
descricao text
responsavel text
telefone text
email text
ativo boolean default true
criado_em timestamptz default now()
atualizado_em timestamptz
```

### portalgov_banners

Campos sugeridos:

```txt
id uuid primary key
municipio_id uuid not null references portalgov_municipios(id)
titulo text
imagem_url text not null
link_url text
ordem integer default 0
ativo boolean default true
criado_em timestamptz default now()
atualizado_em timestamptz
```

### portalgov_configuracoes

Campos sugeridos:

```txt
id uuid primary key
municipio_id uuid not null references portalgov_municipios(id)
chave text not null
valor jsonb
criado_em timestamptz default now()
atualizado_em timestamptz
```

## Área pública

A área pública deve:

1. Capturar o domínio acessado.
2. Buscar o município correspondente em `portalgov_municipios`.
3. Carregar somente dados com `municipio_id` do município encontrado.
4. Mostrar somente registros publicados/ativos.

## Área administrativa

Após login:

1. Autenticar com Supabase Auth.
2. Obter `auth.uid()`.
3. Consultar `portalgov_usuarios`.
4. Verificar municípios vinculados ao usuário.
5. Se houver mais de um município, permitir seleção do município ativo.
6. Carregar menus conforme perfil.
7. Filtrar todas as consultas pelo `municipio_id` ativo.

## Perfis iniciais sugeridos

```txt
admin
editor_noticias
editor_licitacoes
editor_documentos
visualizador
suporte
```

## RLS conceitual

Tabelas administrativas devem permitir acesso apenas quando existir vínculo ativo em `portalgov_usuarios`.

Exemplo conceitual:

```txt
auth.uid() deve existir em portalgov_usuarios.user_id
e portalgov_usuarios.municipio_id deve ser igual ao municipio_id do registro
e portalgov_usuarios.ativo = true
```

Tabelas públicas podem permitir leitura pública apenas de registros publicados e ativos.
