# ARQUITETURA — Supabase Único para Sistemas SaaS

## Cenário atual

O projeto roda inicialmente em uma VPS Hostinger KVM 4 com Ubuntu 24.04 e EasyPanel.

O Supabase está instalado via template/modelo do EasyPanel e roda como stack Docker/Compose.

A VPS não deve ser tratada como ambiente para várias instalações completas de Supabase em produção. Portanto, a arquitetura inicial usa:

- 1 Supabase self-hosted
- 1 Postgres
- 1 Auth central
- várias tabelas separadas por produto
- RLS para proteger dados por município/empresa/cliente

## Produtos

### 1. PortalGov

Produto para portal municipal.

Prefixo obrigatório:

```txt
portalgov_
```

Exemplos:

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

Separação por cliente:

```txt
municipio_id
```

### 2. Prestação de Contas

Produto para prestação de contas municipais.

Prefixo obrigatório:

```txt
prestacao_
```

Exemplos:

```txt
prestacao_municipios
prestacao_usuarios
prestacao_exercicios
prestacao_receitas
prestacao_despesas
prestacao_documentos
prestacao_relatorios
prestacao_envios
prestacao_configuracoes
```

Separação por cliente:

```txt
municipio_id
```

### 3. Digitalização

Produto para digitalização de documentos.

Prefixo obrigatório:

```txt
digitalizacao_
```

Exemplos:

```txt
digitalizacao_empresas
digitalizacao_usuarios
digitalizacao_tipos_documentos
digitalizacao_documentos
digitalizacao_arquivos
digitalizacao_pastas
digitalizacao_caixas
```

Separação por cliente:

```txt
empresa_id
```

### 4. Jurídico

Produto para controle de processos jurídicos.

Prefixo obrigatório:

```txt
juridico_
```

Exemplos:

```txt
juridico_clientes
juridico_usuarios
juridico_processos
juridico_partes
juridico_andamentos
juridico_documentos
juridico_prazos
```

Separação por cliente:

```txt
cliente_id
```

## Por que usar prefixo por produto?

Como existe apenas um banco, o prefixo evita confusão.

Errado:

```txt
usuarios
documentos
configuracoes
```

Certo:

```txt
portalgov_usuarios
prestacao_usuarios
digitalizacao_documentos
juridico_documentos
```

## Usuários

O Supabase Auth é central.

A tabela `auth.users` guarda o login do usuário.

As tabelas dos produtos guardam vínculos.

Exemplo:

```txt
auth.users
- id = user_123
- email = joao@aracati.ce.gov.br

portalgov_usuarios
- user_id = user_123
- municipio_id = aracati
- perfil = admin

prestacao_usuarios
- user_id = user_123
- municipio_id = aracati
- perfil = operador
```

O mesmo usuário pode ter acesso a vários produtos e vários municípios.

## Multi-município

Um usuário pode acessar mais de um município.

Exemplo:

```txt
portalgov_usuarios

user_id  | municipio_id | perfil
user_123 | aracati      | admin
user_123 | sobral       | editor
```

O painel administrativo precisa identificar quais municípios o usuário pode acessar.

Se houver mais de um, pode ser necessário exibir uma tela de seleção de município ou trocar o município ativo no painel.

## RLS

As tabelas sensíveis devem ter Row Level Security.

Exemplo de regra conceitual:

```txt
Usuário só pode acessar registros cujo municipio_id esteja vinculado ao user_id dele na tabela de vínculo do produto.
```

No PortalGov:

```txt
portalgov_noticias.municipio_id deve estar em portalgov_usuarios.municipio_id para auth.uid()
```

Na Prestação:

```txt
prestacao_documentos.municipio_id deve estar em prestacao_usuarios.municipio_id para auth.uid()
```

## Domínio no PortalGov

O PortalGov usa domínio para identificar o município público.

Exemplo:

```txt
www.aracati.ce.gov.br
www.fortaleza.ce.gov.br
```

A tabela `portalgov_municipios` deve ter campos para domínio.

Sugestão:

```txt
dominio_principal
dominios_adicionais
slug
ativo
```

Quando o visitante abrir o portal, o sistema deve identificar o município pelo domínio e filtrar os dados públicos por `municipio_id`.

## Storage

Arquivos devem ser organizados por produto e município/empresa.

Exemplo PortalGov:

```txt
portalgov/{municipio_id}/noticias/{arquivo_id}.jpg
portalgov/{municipio_id}/leis/{arquivo_id}.pdf
```

Exemplo Prestação:

```txt
prestacao/{municipio_id}/{exercicio_id}/documentos/{arquivo_id}.pdf
```

Exemplo Digitalização:

```txt
digitalizacao/{empresa_id}/documentos/2026/01/{arquivo_id}.pdf
```

O banco guarda o caminho e os metadados.

O arquivo físico fica no Storage.

## Evolução futura

No futuro, se houver cliente pagando por infraestrutura dedicada, será possível migrar dados de um município/empresa para outra VPS/Supabase, desde que todas as tabelas tenham sido modeladas com `municipio_id`, `empresa_id` ou `cliente_id`.

Por isso, toda tabela de negócio deve ter a coluna de separação correta desde o início.
