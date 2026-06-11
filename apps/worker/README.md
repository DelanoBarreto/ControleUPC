# Controle UPC Worker

Servico FastAPI responsavel por tarefas pesadas:

- importacao e validacao de CSVs do SIM;
- leitura e OCR de PDFs;
- conversao de Word/Excel/imagens para PDF;
- extracao assistida por LLM;
- geracao de sugestoes para os modelos da IN.

Endpoint inicial disponivel:

- `POST /imports/analyze`: recebe municipio, exercicio e nomes de arquivos, e devolve layout/competencia detectados.
- `POST /imports/lotes/{lote_id}/process`: processa o lote no Storage, grava a camada bruta e atualiza os status.
- `POST /jobs/process-pending`: consome jobs pendentes da fila e processa os lotes.

Camada inicial de processamento:

- `sim_staging.sim_raw_registros`: preserva cada linha importada antes do mapeamento fino por modelo.

Comando previsto para desenvolvimento:

```powershell
uvicorn app.main:app --reload --port 8000
```
