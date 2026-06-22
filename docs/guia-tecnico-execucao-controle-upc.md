# Guia Tecnico De Execucao - Controle UPC

## 1. Finalidade

Este guia consolida a arquitetura tecnica do Controle UPC para orientar a implementacao do sistema sem depender da conversa.

Ele nao substitui os documentos especializados. Ele organiza as decisoes principais e aponta para os arquivos de referencia:

- `docs/plano-controle-upc.md`;
- `docs/plano-desenvolvimento-controle-upc.md`;
- `docs/adr-001-modelos-in-versionados.md`;
- `docs/importacao-sim.md`;
- `docs/direcao-visual-controle-upc.md`;
- `docs/decisao-visual-saas-moderno-operacional.md`;
- `docs/prd-execucao-controle-upc.md`.
- `docs/checklist-execucao-controle-upc.md`;
- `docs/handoff-2026-06-21.md`.

## 2. Decisoes Centrais

- A IN 01/2025 e a fonte principal do produto.
- O Manual SIM 2026 e fonte tecnica para importacao e relacionamento dos arquivos.
- O frontend deve mostrar modelos da IN, nao tabelas do SIM.
- A area logada deve seguir a decisao visual `SaaS moderno operacional`, nao o padrao antigo de GED denso.
- Os modelos da IN devem ser templates versionados no banco.
- O Modelo 01 deve ser o primeiro caso do renderizador generico de modelos.
- A importacao SIM recebe municipio e exercicio; o mes e inferido pelos arquivos.
- Os arquivos originais devem ser preservados no Supabase Storage.
- Toda informacao relevante deve guardar origem e status de revisao.
- Anexos devem poder ser vinculados a modelo, secao, campo ou responsavel.
- OCR/LLM sugere dados, mas nao grava resultado final sem revisao humana.

## 3. Arquitetura Alvo

### Web

Responsabilidades:

- layout da area logada;
- selecao de municipio, exercicio, UPC e prestacao;
- importacao SIM;
- renderizador dos modelos da IN;
- edicao controlada;
- anexos;
- dashboard;
- solicitacao de exportacao PDF/Excel.

Stack:

- Next.js;
- React;
- TypeScript;
- Tailwind;
- shadcn/ui;
- AG Grid Community quando houver experiencia de planilha.

### Worker

Responsabilidades:

- processamento de lotes SIM;
- validacao de arquivos;
- normalizacao para staging;
- OCR;
- conversao de anexos;
- geracao e consolidacao de PDF;
- jobs demorados.

Stack:

- Python;
- FastAPI;
- Pydantic;
- bibliotecas de PDF/OCR/planilhas conforme necessidade.

### Supabase

Responsabilidades:

- banco PostgreSQL;
- schemas `controle_upc` e `sim_staging`;
- Storage privado;
- fila de jobs;
- auditoria;
- policies/RLS em fase de multi-tenant real.

## 4. Templates Versionados Da IN

Motivo:

- o Art. 31 da IN permite alteracoes por Portaria;
- a Portaria 51/2026 ja atualizou a IN 01/2025;
- telas hardcoded gerariam retrabalho a cada mudanca normativa.

Estrutura alvo:

- versao normativa;
- anexo;
- modelo;
- secao;
- quadro;
- linha;
- coluna;
- campo;
- tipo de campo;
- classificacao de preenchimento;
- regra de obrigatoriedade;
- regra de anexo;
- regra de declaracao de inexistencia;
- origem automatica possivel no SIM.

Tipos de preenchimento:

- `automatico`;
- `hibrido`;
- `manual_estruturado`;
- `manual_narrativo`;
- `documento_externo`;
- `declaracao_inexistencia`.

Regra:

- uma prestacao de contas deve ficar vinculada a versao do template usada no momento da criacao ou fechamento;
- nova Portaria gera nova versao de template;
- prestacao antiga nao deve ser alterada retroativamente.

Implementado inicialmente:

- migration `supabase/migrations/20260620000100_modelos_in_templates_versionados.sql`;
- migration `supabase/migrations/20260621000200_fk_indexes.sql`;
- tabelas `versao_normativa`, `modelo_template`, `modelo_template_secao`, `modelo_template_quadro`, `modelo_template_campo`, `modelo_template_valor` e `modelo_template_campo_origem_sim`;
- seed inicial da versao `in_01_2025_portaria_51_2026`;
- seed inicial do `modelo_01`;
- API `GET /api/modelos/templates/modelo_01`;
- API `POST /api/modelos/templates/valores`;
- tela do Modelo 01 lendo campos do template versionado;
- anexos do Modelo 01 vinculados por `template_id` e `template_campo_id`;
- rota generica de anexos por template: `GET/POST /api/anexos/templates/[codigo]`.
- endpoint de abertura de contexto: `POST /api/contextos/abrir`;
- dashboard ja pode abrir o contexto real da prestacao sem depender de IDs exemplificativos.

Validacao remota:

- projeto Supabase `ControleUPC` com ref `doqkxfqpwqiwkclxauwh`;
- migrations aplicadas no remoto: `initial_controle_upc`, `modelos_in_templates_versionados`, `fk_indexes`;
- Modelo 01 confirmado com 3 secoes, 3 quadros e 9 campos;
- RLS ainda deve ser tratado como fase obrigatoria antes de uso multiusuario/producao.

## 5. Dados Dinamicos E JSONB

O banco nao deve criar uma tabela propria para cada quadro variavel da IN.

Usar modelo hibrido:

- entidades principais em tabelas relacionais;
- definicao do modelo em templates versionados;
- valores simples em colunas tipadas quando possivel;
- quadros e matrizes em `jsonb` controlado por schema do template.

Exemplos de uso de matriz:

- Restos a Pagar;
- mapas;
- inventarios;
- demonstrativos com linhas dinamicas;
- quadros importados do SIM e revisados pelo usuario.

Regra:

- `jsonb` nao substitui validacao;
- cada matriz precisa de schema de colunas, tipos, obrigatoriedade e origem;
- o frontend deve renderizar a matriz a partir do template;
- o worker deve validar antes de gravar ou exportar.

## 6. Importacao SIM

Fluxo:

1. usuario seleciona municipio e exercicio;
2. usuario envia `.zip` ou pasta;
3. sistema detecta layouts e competencias;
4. originais sao salvos em `sim-imports`;
5. lote e arquivos sao registrados;
6. job e criado;
7. worker processa em background;
8. registros brutos entram em `sim_staging.sim_raw_registros`;
9. regras especificas alimentam staging estruturado;
10. erros sao registrados por arquivo, linha e campo.

Processamento:

- deve respeitar ordem cronologica quando houver calculos acumulados;
- janeiro a dezembro devem ser tratados de forma previsivel;
- divergencias nao devem sobrescrever dado revisado silenciosamente;
- importacao deve ser idempotente por municipio, exercicio, competencia, layout e chave do registro.

Observacao:

- `BackgroundTasks` pode servir apenas para prototipo;
- processamento robusto deve usar a fila `controle_upc.job_processamento`;
- Celery/Redis pode entrar depois se a escala exigir.

## 7. Renderizador De Modelos

O frontend deve ter um renderizador generico de modelos da IN.

Entrada:

- `prestacao_contas_id`;
- template versionado;
- valores existentes;
- dados sugeridos pelo SIM;
- anexos vinculados;
- status de revisao.

Saida:

- tela editavel;
- campos bloqueados quando oficiais ou vindos de fonte travada;
- campos manuais editaveis;
- quadros em AG Grid quando houver matriz;
- alertas de validacao;
- status de salvamento;
- pendencias.

Modelo 01:

- deve validar o padrao;
- nao deve crescer como componente isolado e fixo;
- deve ser migrado gradualmente para o renderizador.

## 8. Anexos E Dossie PDF

Regras:

- anexos podem ser PDF, Word, Excel ou imagem;
- original deve ser preservado;
- arquivo convertido para PDF deve ser armazenado separadamente;
- cada anexo deve indicar se entra no pacote final;
- anexos podem ser vinculados a modelo, secao, campo ou responsavel.

Fluxo:

1. upload do anexo;
2. armazenamento no bucket `anexos-upc`;
3. registro em `controle_upc.anexo_arquivo`;
4. job de conversao quando necessario;
5. geracao de PDF do modelo;
6. mesclagem com anexos selecionados;
7. validacao de tamanho;
8. armazenamento do pacote final.

Limite:

- a IN cita limite de 15MB por arquivo PDF;
- o sistema deve alertar antes do fechamento quando o pacote se aproximar do limite;
- compressao pode reduzir tamanho, mas nao deve destruir legibilidade nem validade do documento.

## 9. UI Moderna Operacional

Base visual:

- referencia Lumina Dashboard / Clean UI Interface Refinement;
- area logada moderna, limpa e operacional;
- topbar branca compacta;
- sidebar clara, fixa, atual e escaneavel;
- contexto sempre visivel: municipio, exercicio, UPC, prestacao;
- tabelas densas, mas organizadas;
- cards brancos com borda e sombra discreta;
- gradientes e acentos visuais permitidos quando ajudarem hierarquia e leitura;
- azul institucional como base, com amarelo, teal e lilas/roxo como acentos controlados;
- botoes com hierarquia clara.
- shell completo com largura maxima de `1440px`;
- centralizacao do shell em monitores maiores.

Fluxo principal:

1. Hub de municipios;
2. cockpit da UPC;
3. checklist da prestacao;
4. modelo da IN;
5. anexos;
6. exportacao;
7. dashboard de pendencias.

Regra:

- esconder complexidade do SIM;
- mostrar linguagem da IN;
- reduzir digitacao;
- mostrar pendencia antes do erro final.
- nao copiar visual antigo de GED;
- nao criar dashboard generico sem relacao com a prestacao de contas;
- nao transformar a area logada em landing page;
- priorizar sensacao de produto web atual, com UX de alto nivel.

## 10. Ordem De Implementacao

1. aprovar Prestacao/Contexto;
2. refazer Modelo 01 como planilha controlada;
3. fortalecer importacao SIM com ordem cronologica e validacoes;
4. evoluir anexos com conversao para PDF;
5. alimentar o Modelo 01 com dados SIM;
6. gerar PDF/Excel a partir do template;
7. montar dashboard executivo;
8. aplicar RLS e autenticacao;
9. adicionar OCR/LLM assistido;
10. replicar para demais modelos.

## 11. Criterios De Aceite Tecnicos

- modelo novo pode ser cadastrado ou alterado por template, sem criar tela nova;
- prestacao antiga preserva versao de template usada;
- campo automatico, manual e hibrido ficam visualmente diferenciados;
- importacao SIM preserva arquivo original;
- lote SIM gera erros rastreaveis;
- anexo original e convertido ficam acessiveis;
- exportacao usa a mesma fonte de verdade da tela;
- OCR/LLM exige confirmacao humana;
- dashboard mostra pendencias por UPC e modelo.

## 12. Cuidados

- nao recriar tabelas que ja existem sem migration incremental;
- nao trocar Supabase Storage por S3 no documento do projeto;
- nao prometer ICP-Brasil nativo no MVP;
- nao usar `BackgroundTasks` como solucao definitiva de fila;
- nao copiar codigo exemplo de PRD sem adaptar ao schema real;
- nao transformar a tela do Modelo 01 em excecao hardcoded.
