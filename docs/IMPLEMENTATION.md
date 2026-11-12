# Implementação arquitetural — escopo funcional REQ01–REQ05

Este documento registra como a implementação aplica os ADRs do Veridit e onde os
princípios SOLID aparecem. Os módulos copiados do projeto Obraflow foram
mantidos apenas como referência de organização; os fluxos do Veridit estão nos
módulos `access` e `credits`.

## Escopo funcional entregue

- **REQ 01 — Cadastrar Usuário:** `POST /auth/register`, com perfil comum ou
  advogado, CPF protegido e validação de OAB para advogado.
- **REQ 02 — Recuperar Senha:** `POST /auth/forgot-password` e
  `POST /auth/reset-password`, com token aleatório, uso único, hash no banco e
  validade de 30 minutos. A resposta de solicitação não revela se o email
  existe.
- **REQ 03 — Logar no Sistema:** `POST /auth/login`, senha Argon2id, access
  token JWT de 15 minutos e refresh token persistido e revogável.
- **REQ 04 — Sair do Sistema:** `POST /auth/logout`, revogando o refresh token.
- **REQ 05 — Comprar Créditos:** `GET /credits/packages` e
  `POST /credits/purchases`, criando uma compra `AWAITING_PAYMENT` com os dados
  de faturamento. A confirmação e o pagamento externo não são implementados,
  pois pertencem aos requisitos 6 e 7.

O schema também contém as tabelas necessárias aos requisitos posteriores
(registros, artefatos, outbox, auditoria e livro-razão), mas seus fluxos não
foram expostos nesta entrega.

## Componentes arquiteturais

A estrutura segue os componentes definidos em `ARQUITETURA.md`, sem antecipar
comportamento dos requisitos 6–15:

- `gateway/`: entrada única, proxy para o backend e rate limiting de borda.
- `backend/src/modules/access`: serviço de acesso funcional nos requisitos 1–4.
- `backend/src/modules/credits`: serviço de créditos funcional no requisito 5.
- `backend/src/modules/capture` e `backend/src/modules/media`: contratos,
  entidades e adapters preparados, não registrados no `AppModule` nesta fase.
- `backend/src/modules/notification`: porta de email e adapter de
  desenvolvimento, usado como base para o outbox de recuperação.
- `backend/src/shared/infrastructure/messaging`: porta de mensageria,
  adapter em memória e adapter RabbitMQ selecionável por configuração.
- `backend/src/shared/infrastructure/storage`: porta de objetos e adapter local
  para desenvolvimento, preservando a substituição futura por S3/MinIO.
- `backend/src/shared/infrastructure/observability`: logs JSON, health check e
  endpoint de métricas.
- `docker-compose.yml`: PostgreSQL, gateway, RabbitMQ, MinIO, Mailpit,
  backend e frontend.

Os componentes futuros existem como limites arquiteturais e infraestrutura
preparada, mas não iniciam captura, pagamento externo, Playwright, relatórios,
ZIP ou workers. Isso mantém o escopo funcional estritamente em REQ01–REQ05.

## Telas implementadas nesta fase

Com base em `Veridit - Design.html`, o frontend ativo cobre:

- cadastro;
- login;
- recuperação de senha;
- dashboard inicial;
- seleção de pacote e checkout pendente;
- perfil e configurações.

As telas de pagamento externo, acompanhamento de captura, detalhes de registro,
relatório e download ZIP permanecem planejadas para REQ06–REQ15.

O design foi alinhado ao arquivo `Veridit - Design.html`: fundo papel `#F2F3EE`,
texto tinta `#131B18`, régua `#C9CEC6`, verdete `#0B5E50`, carimbo vermelho
`#B83A26`, navegação horizontal, campos sublinhados, tabelas sem cartões
arredondados e valores técnicos em fonte monoespaçada.

## Organização em camadas

Cada módulo segue o padrão:

- `domain/entities`: entidades sem dependência de framework ou banco.
- `domain/repositories`: interfaces e tokens dos contratos de persistência.
- `application/services`: regras de aplicação, dependentes apenas dos contratos.
- `application/use-cases`: um caso de uso por rota, com DTO de resposta padrão.
- `infrastructure/repositories`: implementações Drizzle dos contratos.
- `infrastructure/controllers`: entrada HTTP, sem acesso ao banco.

Somente as implementações em `infrastructure/repositories` importam Drizzle,
`DATABASE` ou o schema.

O fluxo de autenticação também possui refresh token opaco rotacionável em
`POST /auth/refresh`, rate limiting para login/recuperação e persistência
transacional do token de recuperação junto da mensagem de outbox. Os dados
persistidos são organizados nos schemas PostgreSQL `access`, `credits`,
`capture`, `media`, `notification` e `audit`, conforme a arquitetura baseada em
serviços.

## Aplicação dos ADRs

| ADR | Aplicação nesta entrega |
| --- | --- |
| [ADR-001](./adr/ADR-001-estilo-arquitetural-rev1.pdf) | Separação por serviços/domínios (`access` e `credits`) sobre PostgreSQL compartilhado e contratos de módulo. |
| [ADR-002](./adr/ADR-002-integridade-rev1.pdf) | CPF com cifra e índice cego; compra inicia pendente; tabelas de `credit_ledger`, `audit_events` e `outbox_messages` preparadas para transações e idempotência. |
| [ADR-003](./adr/ADR-003-confiabilidade-rev1.pdf) | Tokens persistidos e revogáveis; outbox e estados de compra modelados para não perder transições. |
| [ADR-004](./adr/ADR-004-seguranca-rev1.pdf) | Argon2id, JWT curto, refresh revogável, resposta uniforme na recuperação e validação na borda. Segredos vêm de ambiente. |
| [ADR-005](./adr/ADR-005-desempenho-rev1.pdf) | Leituras de pacotes separadas do fluxo de compra e índices/constraints no PostgreSQL; captura e workers ficam fora do escopo atual. |
| [ADR-006](./adr/ADR-006-linguagem-e-stack.pdf) | NestJS, TypeScript, PostgreSQL e Drizzle, conforme o backend existente. |
| [ADR-007](./adr/ADR-007-tecnologia-de-captura.pdf) | Não implementado nos requisitos 1–5; schema de registros e artefatos preserva o contrato futuro. |
| [ADR-008](./adr/ADR-008-persistencia-e-armazenamento.pdf) | PostgreSQL para dados transacionais; `evidence_artifacts` referencia storage de objetos sem colocar mídia no banco. |
| [ADR-009](./adr/ADR-009-mensageria.pdf) | `outbox_messages` modela a transactional outbox para email e processamento posterior; broker fica para os requisitos seguintes. |
| [ADR-010](./adr/ADR-010-integracao-de-pagamento.pdf) | Compra fica `AWAITING_PAYMENT`; adaptador/webhook e concessão de créditos aguardam REQ06–07. |
| [ADR-011](./adr/ADR-011-envio-de-email.pdf) | Recuperação não confirma existência do email; o envio real será consumer de outbox no módulo de notificação. |
| [ADR-012](./adr/ADR-012-implantacao.pdf) | Docker Compose, `.env.example`, PostgreSQL com healthcheck e migrações Drizzle. |
| [ADR-013](./adr/ADR-013-observabilidade.pdf) | Correlation-id, logs estruturados e métricas completas ficam como evolução; nenhum dado sensível é incluído nas respostas ou nos logs desta camada. |

## SOLID

- **Responsabilidade única (SRP):** `AccessService` coordena o caso de uso de
  acesso, `Argon2PasswordHasher` só faz hashing/verificação, o guard só valida
  JWT e `CreditsService` só trata pacotes/checkout.
- **Aberto/fechado (OCP):** `PasswordHasher` é uma porta; Argon2id pode ser
  substituído por outro adaptador sem alterar os casos de uso.
- **Substituição de Liskov (LSP):** `Argon2PasswordHasher` implementa
  integralmente o contrato `PasswordHasher`, permitindo substituição no
  provider do Nest.
- **Segregação de interfaces (ISP):** o domínio de acesso depende apenas de
  `hash`/`verify`, não de uma interface de persistência ou de email maior que
  não utiliza.
- **Inversão de dependência (DIP):** services recebem os contratos de
  repositório e `PASSWORD_HASHER` por injeção; controllers dependem dos
  use-cases, e somente repositories dependem de Drizzle.

## Limites conscientes

Não foram implementados pagamento externo, webhook, confirmação de pagamento,
captura, Playwright, relatórios, ZIP ou workers. Isso evita antecipar
REQ06–REQ15, embora os contratos, schemas e adapters de infraestrutura
preservem a evolução sem redesenho.
