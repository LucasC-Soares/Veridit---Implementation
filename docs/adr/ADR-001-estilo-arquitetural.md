# ADR-001 — Estilo Arquitetural do Veridit (rev1)

**Status:** Proposto | **Data:** 20/10/2026 | **Autor(es):** Equipe ___

**Revisa:** ADR-001 de 13/10/2026 (versão original preservada no histórico do repositório).

**Requisitos/restrições relacionados:** REQ01–REQ15; Seção 3 (Segurança); decisões D1 e D2; REQ06 (pagamento confirmado por provedor externo); ADR-002 a ADR-005 (top 4 características); restrições de contexto: equipe pequena, primeira versão, cronograma curto (13–22/10).

## Contexto

O Veridit registra conteúdo de sites como evidência: o usuário navega em uma sessão de captura e o sistema grava vídeo de navegação e capturas de tela (REQ08–REQ11, ADR-007); opera a compra de créditos com pagamento via Mercado Pago ou PIX (REQ05–REQ07) e oferece listagem, detalhamento, relatório e exportação ZIP (REQ12–REQ15). As características priorizadas, em ordem, são integridade, confiabilidade, segurança e desempenho; usabilidade, extensibilidade e interoperabilidade são secundárias. A evolução prevista (D1 — perfil empresa; D2 — pacotes; REQ06 — novos meios de pagamento) deve ser acomodada sem redesenho.

O pagamento é confirmado de forma assíncrona por um provedor externo (webhook): nenhuma transação local abrange o provedor, em qualquer estilo. A integridade transacional que diferencia os estilos refere-se, portanto, ao domínio interno — livro-razão de créditos, status dos registros e metadados das evidências.

## Decisão

Adotar a Arquitetura Baseada em Serviços como estilo global: frontend web + API gateway (autenticação/autorização centralizadas — ADR-004) + serviços de domínio implantados separadamente, sobre um PostgreSQL compartilhado com um esquema por serviço (ADR-008), mensageria assíncrona com outbox para pós-processamento e emails (ADR-009) e padrão microkernel interno para os adaptadores de pagamento (ADR-010). Serviços:

- **Acesso** — cadastro, login/logout, recuperação de senha, perfis (REQ01–REQ04, D1).
- **Créditos/Pagamento** — pacotes, pedidos, livro-razão de créditos, adaptadores de pagamento, webhooks e reconciliação (REQ05–REQ07, D2).
- **Captura/Registro** — orquestra o registro: dados do Apêndice A, status, débito e estorno de crédito, abertura e conclusão da sessão de captura, listagem e detalhes (REQ08–REQ13).
- **Mídia** — sessões de navegador remoto (gravação de vídeo, HAR e capturas de tela) e workers de pós-processamento: hash, relatório e ZIP (REQ08–REQ11, REQ14, REQ15).
- **Notificação** — emails transacionais (REQ02, REQ07, REQ10, REQ11 — ADR-011).

## Alternativas Consideradas

1. **Monólito em camadas — 51 pontos.** Máxima simplicidade e consistência, mas tolerância a falhas mínima: sessões de navegador e geração de vídeo/ZIP competiriam com toda a aplicação, e uma falha derrubaria captura e pagamento juntos. Rejeitada.
2. **Microkernel (global) — 52 pontos.** Forte em consistência e extensão por plugins, fraco em tolerância a falhas e escalabilidade. Rejeitado como estilo global; adotado internamente nos adaptadores de pagamento (ADR-010).
3. **Microsserviços — 39 pontos.** Banco por serviço exigiria sagas entre créditos e registro (débito ao iniciar a captura, estorno em falha) e custo operacional alto para a equipe. Rejeitada.
4. **Event-Driven (global) — 42 pontos.** Alta tolerância a falhas e escalabilidade, mas consistência eventual em todo o domínio e baixa testabilidade. Rejeitada como estilo global; adotada apenas como mensageria interna (ADR-009).
5. **Space-Based — 40 pontos.** Líder em elasticidade, porém dados replicados em cache sem fonte única prejudicam a integridade. Rejeitada.

## Justificativa

- **Integridade (peso 5):** o banco compartilhado permite que débito/estorno de créditos e mudança de status do registro ocorram em uma única transação ACID local, sem sagas. O pagamento externo é tratado por webhook idempotente e reconciliação (ADR-002, ADR-010) — necessidade comum a todos os estilos, que por isso não os diferencia.
- **Confiabilidade (peso 4):** serviços implantados separadamente isolam falhas (a queda da Mídia não afeta pagamentos); a mensageria durável com outbox cobre pós-processamento e emails (ADR-003, ADR-009). É o critério que desempata contra Camadas e Microkernel.
- **Segurança (peso 3):** ponto único de entrada com autenticação centralizada; cerca de cinco serviços limitam a superfície de rede; dados sensíveis concentrados sob controle unificado (LGPD — ADR-004).
- **Desempenho (peso 2):** sessões de captura e workers de pós-processamento escalam horizontalmente de forma independente dos demais serviços (ADR-005).
- **Matriz ponderada (Tabela 1):** Service-Based (54), Microkernel (52), Camadas (51), Event-Driven (42), Space-Based (40), Microsserviços (39). A margem sobre Microkernel e Camadas é pequena: a decisão é sensível às notas de integridade e segurança atribuídas pela equipe e deve ser reavaliada se essas notas forem alteradas em sala.

| Característica (peso) | Camadas | Microkernel | Service-Based | Event-Driven | Space-Based | Microsserviços |
|---|---|---|---|---|---|---|
| Integridade (5) | 5 | 5 | 4 | 2 | 2 | 2 |
| Confiabilidade (4) | 2 | 2 | 4 | 4 | 3,5 | 4 |
| Segurança (3) | 5 | 5 | 4 | 2 | 2 | 2 |
| Desempenho (2) | 1,5 | 2 | 3 | 5 | 5 | 3,5 |
| **Total ponderado** | **51** | **52** | **54** | **42** | **40** | **39** |

*Tabela 1 — Notas de 1 a 5. Confiabilidade = média de confiabilidade e tolerância a falhas; Desempenho = média de desempenho e escalabilidade (tabelas de estilos de Richards & Ford, caps. 10–17 — conferir com a edição usada pela equipe). Integridade (consistência transacional do domínio interno) e Segurança (superfície de ataque/controle centralizado) não constam das tabelas do livro: notas atribuídas pela equipe, a validar em sala. Pesos seguem a ordem das top 4 (5, 4, 3, 2). Custo e simplicidade foram tratados como restrições de contexto, não como critérios ponderados.*

## Consequências

**Positivas:** transacionalidade simples no domínio interno; isolamento de carga e de falhas entre domínios; caminho de evolução natural para microsserviços (D1/D2); adaptadores de pagamento substituíveis sem impacto no núcleo.

**Negativas:** esquema compartilhado acopla a evolução dos serviços; o PostgreSQL e o gateway são pontos únicos de falha; elasticidade inferior à de microsserviços; exige CI/CD para múltiplos deployables e infraestrutura de mensageria.

**Mitigações:** um esquema por serviço, com cada serviço acessando apenas o próprio esquema e contratos versionados; migrações versionadas; backup com recuperação point-in-time e réplica standby (ADR-003, ADR-008); ao menos duas instâncias do gateway; health checks e alertas (ADR-013).

## Alterações em relação à versão anterior

- Nome padronizado para "Veridit" (documento de requisitos).
- Argumento de ACID restrito ao domínio interno; reconhecido que o pagamento externo é assíncrono em qualquer estilo (corrige "pagamento e créditos atômicos").
- Responsabilidades dos serviços explicitadas; "Captura/Registro" (orquestração) separado de "Mídia" (sessão de navegador e pós-processamento), alinhado à ADR-007.
- Matriz ponderada anexada e reproduzível; a pontuação anterior (58/51/50) não pôde ser reproduzida e foi substituída. Pesos de segurança e desempenho diferenciados (3 e 2), coerentes com a ordem das top 4.
- Pontos únicos de falha (banco e gateway) registrados como consequência, com mitigações.
