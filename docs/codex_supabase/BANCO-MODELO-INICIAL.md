# BANCO DE DADOS — Modelo Inicial PortalGov e Prestação

## Decisões confirmadas

- Produtos prioritários: PortalGov e Prestação de Contas.
- Nomes de tabelas e campos em português.
- IDs em UUID.
- Um usuário pode acessar mais de um município.
- Supabase único inicialmente.
- Login centralizado em `auth.users`.
- Tabelas próprias dos produtos guardam vínculos e permissões, não senhas.

## PortalGov — tabelas principais

```txt
portalgov_municipios
portalgov_usuarios
portalgov_noticias
portalgov_leis
portalgov_decretos
portalgov_licitacoes
portalgov_documentos
portalgov_secretarias
portalgov_banners
portalgov_configuracoes
```

## Prestação — tabelas principais

```txt
prestacao_municipios
prestacao_usuarios
prestacao_exercicios
prestacao_categorias_documentos
prestacao_documentos
prestacao_receitas
prestacao_despesas
prestacao_relatorios
prestacao_envios
prestacao_configuracoes
```

## Observação sobre municípios duplicados

Neste início, cada produto pode ter sua própria tabela de municípios:

```txt
portalgov_municipios
prestacao_municipios
```

Isso deixa cada produto mais independente e mais fácil para iniciante.

Futuramente, pode ser criada uma tabela central `tenants` ou `clientes`, mas isso não será obrigatório agora.

## Relacionamento de usuários

O usuário real fica em:

```txt
auth.users
```

PortalGov:

```txt
portalgov_usuarios.user_id -> auth.users.id
portalgov_usuarios.municipio_id -> portalgov_municipios.id
```

Prestação:

```txt
prestacao_usuarios.user_id -> auth.users.id
prestacao_usuarios.municipio_id -> prestacao_municipios.id
```

## Exemplo de usuário com múltiplos municípios

```txt
auth.users
id: user_123
email: joao@empresa.com
```

```txt
portalgov_usuarios
user_id  | municipio_id | perfil
user_123 | aracati      | admin
user_123 | sobral       | editor
```

```txt
prestacao_usuarios
user_id  | municipio_id | perfil
user_123 | aracati      | operador
```

Resultado:

- João acessa PortalGov de Aracati.
- João acessa PortalGov de Sobral.
- João acessa Prestação de Aracati.
- João não acessa Prestação de Sobral, a menos que exista registro em `prestacao_usuarios`.

## Lógica do painel administrativo

Ao entrar no painel:

1. Usuário faz login pelo Supabase Auth.
2. Sistema obtém `user.id`.
3. Sistema identifica o produto atual: PortalGov ou Prestação.
4. Sistema consulta a tabela de vínculo do produto.
5. Se não houver vínculo ativo, bloquear acesso.
6. Se houver um município, selecionar automaticamente.
7. Se houver vários municípios, mostrar seletor de município.
8. Todas as consultas administrativas devem usar o município ativo.
9. Menus e ações devem respeitar o perfil.

## Exemplo de fluxo PortalGov

```txt
Login -> auth.users -> user_id
Consulta -> portalgov_usuarios where user_id = auth.uid() and ativo = true
Retorna -> municípios permitidos
Usuário escolhe -> Aracati
Admin carrega -> somente dados com municipio_id = Aracati
```

## Exemplo de fluxo Prestação

```txt
Login -> auth.users -> user_id
Consulta -> prestacao_usuarios where user_id = auth.uid() and ativo = true
Retorna -> municípios permitidos
Usuário escolhe -> Aracati
Admin carrega -> somente dados com municipio_id = Aracati
```

## Regra de segurança

Mesmo se o frontend filtrar, o banco deve proteger com RLS.

Regra conceitual:

```txt
auth.uid() precisa estar vinculado ao municipio_id do registro na tabela de vínculo do produto.
```

## Arquivos

PortalGov:

```txt
portalgov/{municipio_id}/noticias/{arquivo_id}.jpg
portalgov/{municipio_id}/leis/{arquivo_id}.pdf
```

Prestação:

```txt
prestacao/{municipio_id}/{exercicio_id}/documentos/{arquivo_id}.pdf
prestacao/{municipio_id}/{exercicio_id}/relatorios/{arquivo_id}.pdf
```

O banco guarda:

```txt
bucket
caminho_arquivo
tipo_mime
tamanho_bytes
criado_por
criado_em
```
