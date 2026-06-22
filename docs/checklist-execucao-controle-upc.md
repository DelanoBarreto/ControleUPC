# Checklist De Execução - Controle UPC

**Atualizado em:** 21/06/2026
**Legenda:** `[x]` concluído, `[-]` parcial, `[ ]` pendente.

## 1. Regras E Documentação

- [x] IN 01/2025 definida como fonte principal do produto.
- [x] Manual SIM definido como referência técnica dos CSVs.
- [x] ADR de templates versionados aceito.
- [x] Direção visual oficial registrada.
- [x] Documento mestre atualizado.
- [x] Checklist de execução criado.
- [ ] Revisar documentação após cada aprovação de tela.

## 2. Fundação Técnica

- [x] Monorepo com `apps/web`, `apps/worker`, `supabase` e `docs`.
- [x] Next.js, React, TypeScript e Tailwind configurados.
- [x] Worker FastAPI estruturado.
- [x] Supabase remoto vinculado.
- [x] Migrations iniciais aplicadas.
- [x] Storage previsto para SIM e anexos.
- [-] Fila de jobs estruturada; execução robusta ainda precisa de fechamento.
- [ ] Supabase Auth.
- [ ] RLS multi-tenant.

## 3. Banco E Domínio

- [x] Município e exercício.
- [x] Unidade gestora e unidade orçamentária.
- [x] UPC, gestão e prestação de contas.
- [x] Importação, arquivos, erros e jobs.
- [x] Staging bruta do SIM.
- [x] Anexos e auditoria.
- [x] Templates versionados da IN.
- [x] Seed inicial do Modelo 01.
- [-] Regras completas de preenchimento automático por campo.
- [ ] Validações finais e policies para produção.

## 4. Prestação / Contexto

- [x] API para abrir ou resolver contexto.
- [x] API para listar prestações recentes.
- [x] Remoção de UUIDs exemplificativos.
- [x] Sidebar clara e topbar compacta.
- [x] Barra horizontal com município, exercício, UPC/UG e gestor.
- [x] Checklist da IN.
- [x] Cards de progresso, recentes e acessos rápidos.
- [x] Painel expansível para editar contexto.
- [x] Shell máximo de `1440px`, centralizado em monitores grandes.
- [x] Layout validado em navegador.
- [ ] Aprovação final do usuário para encerrar esta tela.

## 5. Modelo 01

- [x] Template versionado inicial.
- [x] Carregador reutilizável.
- [x] Editor genérico inicial.
- [x] API de leitura e gravação de valores.
- [x] Uso de `prestacao_contas_id`.
- [-] Anexos iniciais por template/campo.
- [ ] Refazer visual como planilha controlada moderna.
- [ ] Exibir item, campo, origem, valor, status, anexo e observação.
- [ ] Bloquear textos oficiais.
- [ ] Alimentar gestor prioritariamente pela tabela 101.
- [ ] Usar tabela 109 apenas para ordenadores de despesa.
- [ ] Integrar 503, 504, 951, 952 e 953.
- [ ] Auditoria completa de alterações.
- [ ] Validação visual e aprovação do usuário.

## 6. Importação SIM

- [x] Regra município + exercício sem seleção de mês.
- [x] Upload previsto para pasta ou `.zip`.
- [x] Análise inicial de arquivos.
- [x] Registro de lote e job.
- [x] Preservação do original.
- [-] Worker e staging bruta.
- [ ] Parser completo dos CSVs reais.
- [ ] Inferência robusta de layout e competência.
- [ ] Idempotência e reprocessamento.
- [ ] Relatório de erros por arquivo, linha e campo.
- [ ] Tabelas estruturadas e relacionamentos.
- [ ] Tela final seguindo o design aprovado.

## 7. Anexos

- [x] Upload inicial.
- [x] Bucket e registro de metadados.
- [x] Vínculo por template e campo.
- [ ] Vínculo por seção e responsável.
- [ ] Preview de PDF.
- [ ] Conversão Word/Excel/imagem para PDF.
- [ ] Preservar original e convertido.
- [ ] Definir entrada ou não no pacote final.
- [ ] Ordenação dos anexos no dossiê.
- [ ] Alertas de tamanho e legibilidade.
- [ ] Tela GED moderna seguindo o design aprovado.

## 8. Exportação

- [ ] PDF fiel ao padrão da IN.
- [ ] Excel formatado.
- [ ] Índice de documentos.
- [ ] Mesclagem do relatório com anexos.
- [ ] Pacote final por prestação.
- [ ] Validação de tamanho.
- [ ] Histórico de exportações.

## 9. Dashboard E Pendências

- [-] Checklist inicial exibido na tela de contexto.
- [-] Progresso inicial exibido.
- [ ] Métricas reais por UPC.
- [ ] Pendências por modelo e campo.
- [ ] Anexos ausentes.
- [ ] Importações com erro.
- [ ] Prazos e alertas.
- [ ] Visão consolidada por município e exercício.

## 10. OCR E LLM

- [ ] Upload para extração assistida.
- [ ] Extração de texto com PyMuPDF.
- [ ] OCR com Tesseract.
- [ ] Mapeamento de campos por LLM.
- [ ] Tela de revisão.
- [ ] Gravação somente após confirmação humana.
- [ ] Auditoria da sugestão e confirmação.

## 11. Próxima Entrega

Após aprovação da tela Prestação/Contexto:

1. criar o layout do Modelo 01;
2. manter o mesmo shell de `1440px`;
3. aplicar experiência de planilha controlada;
4. mostrar origem e status por linha;
5. implementar anexos por linha/campo;
6. validar no navegador;
7. solicitar aprovação antes da próxima tela.
