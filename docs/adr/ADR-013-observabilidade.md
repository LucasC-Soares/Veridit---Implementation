# ADR-013 — Observabilidade (Logs Estruturados, Métricas e Alertas)

**Status:** Proposto | **Data:** 20/10/2026 | **Autor(es):** Equipe ___

**Requisitos/restrições relacionados:** ADR-002 (verificação de integridade); ADR-003 (health checks, alertas, DLQ); ADR-004 (dados pessoais em logs, eventos de segurança); ADR-005 (métricas de latência e sessões); ADR-009 (filas, outbox); ADR-010 (reconciliação); ADR-012; LGPD.

## Contexto

As ADRs de confiabilidade, desempenho e segurança dependem de detectar falhas: mensagens na DLQ, outbox parado, sessões esgotadas, divergência de hash, pagamentos não reconciliados. Um fluxo atravessa gateway, vários serviços e a fila, e precisa ser rastreável de ponta a ponta sem expor dados pessoais.

## Decisão

Adotar a seguinte pilha de observabilidade, executada no Docker Compose (ADR-012):

- **Logs estruturados em JSON (pino)** com correlation-id gerado no gateway e propagado em cabeçalhos HTTP e mensagens; CPF, tokens e senhas nunca registrados (mascaramento por padrão); agregação com Loki.
- **Métricas Prometheus** (prom-client nos serviços e plugin Prometheus do RabbitMQ): latência e erros por rota, sessões ativas e fila de admissão, profundidade de filas, mensagens na DLQ, idade do outbox, pedidos pendentes, divergências de hash.
- **Painéis no Grafana e alertas:** DLQ com mensagens, outbox pendente há mais de 5 min, fila acima do limiar, divergência de hash, falhas repetidas de login, reconciliação com pendências.
- **Health checks** de liveness e readiness em todos os serviços (usados pelo Compose).

## Alternativas Consideradas

1. **Apenas logs de console (`docker logs`)** — rejeitado: não permite alertas nem métricas exigidos pela ADR-003.
2. **Pilha ELK (Elasticsearch, Logstash, Kibana)** — rejeitada: consumo de memória elevado para o ambiente local; Loki é mais leve e se integra ao Grafana.
3. **Plataforma SaaS (ex.: Datadog)** — rejeitada: custo e envio de dados para terceiros (LGPD).
4. **Tracing distribuído com OpenTelemetry na v1** — adiado: o correlation-id atende à rastreabilidade inicial; a instrumentação OpenTelemetry fica registrada como evolução.

## Justificativa

- Transforma as táticas de detecção das ADRs 002, 003 e 005 (monitor, heartbeat, detecção de exceções) em alertas concretos e verificáveis.
- Correlation-id permite reconstruir o fluxo de um registro entre serviços e fila com baixo custo.
- Pilha aberta e leve, executável localmente, sem envio de dados pessoais a terceiros.

## Cenários de Qualidade (medida de resposta)

- **Estímulo:** uma mensagem chega à DLQ. **Resposta:** alerta com correlation-id e tipo de operação. **Medida:** alerta emitido em até 2 minutos.

## Consequências

**Positivas:** falhas detectadas antes de serem percebidas pelos usuários; rastreabilidade ponta a ponta; metas dos cenários de qualidade mensuráveis.

**Negativas:** mais containers e consumo de recursos; risco de vazamento de dados pessoais em logs se o mascaramento falhar.

**Mitigações:** perfil do Compose para subir a observabilidade opcionalmente; testes do mascaramento de logs; retenção de logs limitada.
