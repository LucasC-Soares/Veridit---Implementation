# Índice das ADRs

Este documento reúne as **Architecture Decision Records (ADRs)** do Veridit. Cada registro documenta uma decisão arquitetural, seu contexto, as alternativas consideradas, a justificativa e suas consequências.

## Decisões arquiteturais

| ADR | Decisão | Descrição |
|---|---|---|
| [ADR-001](ADR-001-estilo-arquitetural.md) | Estilo Arquitetural do Veridit | Define a Arquitetura Baseada em Serviços como estilo global e delimita os serviços e suas responsabilidades. |
| [ADR-002](ADR-002-integridade.md) | Priorizar Integridade como Característica Arquitetural | Define as medidas para preservar a integridade dos créditos, pagamentos, evidências e registros de auditoria. |
| [ADR-003](ADR-003-confiabilidade.md) | Priorizar Confiabilidade como Característica Arquitetural | Estabelece estratégias de isolamento de falhas, processamento assíncrono, retentativas e recuperação de operações. |
| [ADR-004](ADR-004-seguranca.md) | Priorizar Segurança como Característica Arquitetural | Define as medidas de autenticação, autorização, proteção de dados, segurança da captura e atendimento à LGPD. |
| [ADR-005](ADR-005-desempenho.md) | Priorizar Desempenho como Característica Arquitetural | Define a separação entre sessões interativas de captura e workers de pós-processamento para atender às demandas de desempenho. |
| [ADR-006](ADR-006-linguagem-e-stack.md) | Linguagem e Stack de Desenvolvimento do Veridit | Define TypeScript, Node.js, NestJS e React como tecnologias centrais de desenvolvimento. |
| [ADR-007](ADR-007-captura-de-conteudo.md) | Tecnologia de Captura de Conteúdo | Define o uso de navegador remoto interativo com Playwright para realizar as capturas de conteúdo. |
| [ADR-008](ADR-008-persistencia-e-armazenamento.md) | Persistência e Armazenamento de Evidências | Define PostgreSQL para dados relacionais e armazenamento de objetos compatível com S3 para os artefatos. |
| [ADR-009](ADR-009-mensageria.md) | Mensageria | Define RabbitMQ e o padrão Transactional Outbox para publicação e processamento confiável de mensagens. |
| [ADR-010](ADR-010-integracao-de-pagamento.md) | Integração de Pagamento | Define adaptadores de pagamento no padrão Microkernel, com webhooks idempotentes e reconciliação. |
| [ADR-011](ADR-011-emails-transacionais.md) | Envio de Emails Transacionais | Define o envio assíncrono de emails por SMTP, com Nodemailer e provedor transacional. |
| [ADR-012](ADR-012-implantacao-docker-compose.md) | Implantação e Ambiente de Execução | Define Docker Compose como estratégia de implantação e execução do ambiente da primeira versão. |
| [ADR-013](ADR-013-observabilidade.md) | Observabilidade | Define logs estruturados, métricas, painéis, alertas e health checks para monitoramento do sistema. |

## Criação de novas ADRs

Para registrar uma nova decisão arquitetural, utilize o [Modelo de ADR](template.md). Numere o documento sequencialmente, adicione-o a esta tabela e mantenha os links atualizados.
