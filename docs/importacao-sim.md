# Importacao Dos Arquivos SIM

## Decisao

Os arquivos do SIM serao enviados pela propria aplicacao web, por uma tela simples de importacao.

O usuario nao precisara acessar diretamente o Supabase para colocar arquivos em pasta manualmente. O Supabase sera usado por tras do sistema, como banco de dados e armazenamento dos arquivos originais.

Na operacao diaria, o usuario escolhe apenas o municipio e o exercicio. Nao existe campo para selecionar mes. A competencia sera inferida pelos arquivos enviados dentro da pasta ou do `.zip`.

## Fluxo Simples Para O Usuario

1. Abrir a tela `Importacoes SIM`.
2. Selecionar:
   - municipio;
   - exercicio;
3. Enviar uma pasta ou um arquivo `.zip` contendo os CSVs daquele municipio/ano.
4. Conferir a lista de arquivos detectados.
5. Clicar em `Analisar lote`.
6. Conferir layout e competencia detectados.
7. Clicar em `Importar`.
8. O sistema registra o lote em `controle_upc.importacao_lote`, cria um job de processamento e prepara o caminho no Storage.
9. O worker grava primeiro os registros brutos em `sim_staging.sim_raw_registros`.
10. Acompanhar o status: pendente, processando, concluido ou com erro.

O usuario nao precisa selecionar o mes. O sistema deve detectar a competencia de cada arquivo pelo nome e/ou conteudo.

Antes do envio definitivo, a tela pode chamar uma analise local no web em `POST /api/importacoes/analyze` para verificar nomes de arquivo, layout e competencia.

Depois da analise, a tela chama `POST /api/importacoes/lotes` para registrar o lote, resolver municipio/exercicio e preparar o caminho base no Storage.

O worker pode ser acionado por `POST /imports/lotes/{lote_id}/process` ou pelo consumidor de fila `POST /jobs/process-pending`.

Essa tela deve ser objetiva. Ela nao deve mostrar uma tela complexa de tabelas do SIM.

## Como Os Arquivos Serao Guardados

Os arquivos originais enviados pelo usuario devem ser salvos no Supabase Storage.

Padrao sugerido do caminho:

```txt
sim-imports/{codigo_municipio}/{exercicio}/{lote_id}/original/{nome_arquivo}
```

Exemplo:

```txt
sim-imports/014/2026/2f4b.../original/GE202601.BAS
sim-imports/014/2026/2f4b.../original/UG202602.BAS
sim-imports/014/2026/2f4b.../original/OD202603.BAS
```

O arquivo original deve ser preservado para auditoria, reprocessamento e conferencia futura.

O bucket do Supabase deve existir com o nome `sim-imports` e pode ser privado.

## Como Os Dados Vao Para O Banco

Depois do upload, o sistema cria um job de importacao.

O worker Python processa o lote:

1. identifica o tipo de arquivo pelo layout/nome/conteudo;
2. identifica a competencia do arquivo;
3. valida campos obrigatorios e formato;
4. grava os registros brutos na staging e, na evolucao, normaliza para as tabelas por layout;
5. registra erros por arquivo e linha;
6. atualiza o status do lote.

O primeiro corte do processamento usa a tabela `sim_staging.sim_raw_registros` para nao perder nada do arquivo original enquanto o mapeamento fino para as tabelas `101`, `103`, `104`, `108`, `109`, `503`, `504`, `951`, `952` e `953` evolui.

As tabelas staging ficam no banco Supabase, em schema proprio, por exemplo:

```txt
sim_staging.sim_101_gestores
sim_staging.sim_103_orgaos
sim_staging.sim_104_unidades_orcamentarias
sim_staging.sim_108_unidades_gestoras
sim_staging.sim_109_ordenadores_despesa
sim_staging.sim_503_tipos_responsaveis_contratacao
sim_staging.sim_504_responsaveis_contratacao
sim_staging.sim_951_agentes_publicos
sim_staging.sim_952_desligamentos
sim_staging.sim_953_reingressos
```

No MVP, essas tabelas terao colunas principais nomeadas para consulta e relacionamento, alem de um campo `raw_record` em `jsonb` para preservar o registro original completo do arquivo.

O frontend nao deve mostrar essas tabelas como produto final. Elas existem para alimentar os modelos da IN.

## Controle De Lotes

Criar tabelas proprias para controlar os envios:

```txt
controle_upc.importacao_lote
controle_upc.importacao_arquivo
controle_upc.importacao_erro
```

### importacao_lote

Guarda:

- municipio;
- exercicio;
- status;
- usuario que enviou;
- data de envio;
- quantidade de arquivos;
- quantidade de registros importados;
- quantidade de erros;
- caminho base no Storage.

### importacao_arquivo

Guarda:

- lote;
- nome original do arquivo;
- caminho no Storage;
- layout identificado;
- competencia detectada;
- status;
- quantidade de linhas;
- quantidade de registros validos;
- quantidade de erros.

### importacao_erro

Guarda:

- arquivo;
- linha;
- campo;
- mensagem do erro;
- valor recebido;
- severidade.

## Regras Importantes

- O usuario deve poder reenviar um lote do exercicio se precisar corrigir arquivos.
- O sistema deve manter historico dos lotes anteriores.
- O processamento novo nao deve apagar o arquivo original antigo.
- A importacao deve ser idempotente por municipio, exercicio, competencia detectada, layout e chave do registro.
- Dados importados do SIM devem ficar com origem `sim_auto` ou `sim_parcial`.
- Se houver divergencia, o sistema deve marcar para revisao, nao sobrescrever silenciosamente dados ja revisados pelo usuario.

## Tela Sugerida

A tela deve ter apenas:

- filtros de municipio e exercicio;
- area de arrastar arquivos/pasta/zip;
- lista dos arquivos detectados;
- botao `Importar`;
- painel simples de status;
- link para baixar relatorio de erros.

Nada de tela complexa para editar CSV do SIM.

## Opcoes De Envio

### Opcao Recomendada

Enviar um `.zip` por municipio/ano, contendo os arquivos e competencias disponiveis.

Vantagens:

- funciona melhor no navegador;
- preserva a organizacao original dos arquivos;
- reduz chance de arquivo esquecido;
- facilita reprocessar o lote.

### Opcao Tambem Possivel

Selecionar uma pasta do exercicio pelo navegador.

Vantagens:

- mais parecido com a rotina local do usuario;
- evita compactar manualmente.

Observacao: upload de pasta depende de suporte do navegador. Por isso, o `.zip` deve ser mantido como alternativa principal.

## Exemplo De Organizacao Local Do Usuario

```txt
SIM/
  014_ARACATI/
    2026/
      01/
        GE202601.BAS
        UG202601.BAS
        OD202601.BAS
        ...
      02/
        GE202602.BAS
        UG202602.BAS
        OD202602.BAS
        ...
```

O usuario pode compactar a pasta `2026` inteira ou selecionar a pasta do exercicio. O sistema detecta as competencias existentes pelos arquivos.
