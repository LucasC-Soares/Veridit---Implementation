# ADR-010 — Integração de Pagamento (Adaptadores Microkernel, Webhook Idempotente e Reconciliação)

**Status:** Proposto | **Data:** 20/10/2026 | **Autor(es):** Equipe ___

**Requisitos/restrições relacionados:** REQ05 (comprar créditos: pacote, faturamento, pagamento); REQ06 (Mercado Pago ou PIX com QR Code ou código gerado pela plataforma); REQ07 (email de confirmação); D2 (pacotes básico, médio, premium); Apêndice A (dados da compra); ADR-001 (microkernel); ADR-002 (livro-razão); ADR-004; ADR-009; ADR-011.

## Contexto

O REQ06 exige dois caminhos de pagamento — checkout do Mercado Pago e PIX exibido pela própria plataforma (QR Code ou código copia-e-cola) — e a evolução prevê novos meios. A confirmação é sempre assíncrona e emitida pelo provedor; créditos só podem ser concedidos com base nela (ADR-002). Gerar cobrança PIX exige um PSP (prestador de serviços de pagamento) homologado.

## Decisão

No serviço Créditos/Pagamento, um núcleo de pedidos e livro-razão com adaptadores de pagamento plugáveis (microkernel — ADR-001), por meio de uma interface única (criar cobrança, consultar status, validar notificação):

- **Adaptadores da v1:** `MercadoPagoCheckout` (checkout hospedado) e `Pix` (cobrança PIX criada pela API do Mercado Pago, que devolve QR Code e código copia-e-cola exibidos na plataforma).
- **Estados do pedido:** criado, aguardando pagamento, pago, expirado, cancelado, estornado. A transição para "pago" e o lançamento dos créditos ocorrem na mesma transação, com o evento de email (REQ07) gravado no outbox (ADR-009).
- **Webhook:** assinatura validada; o status é reconsultado na API do provedor (o corpo da notificação não é tratado como verdade); processamento idempotente por restrição de unicidade no id do pagamento.
- **Reconciliação** a cada 15 minutos para pedidos pendentes, e expiração de cobranças PIX não pagas.
- **Dados:** dados de faturamento (Apêndice A) criptografados (ADR-004); nenhum dado de cartão trafega pelo Veridit, pois o checkout é hospedado pelo provedor.

## Alternativas Consideradas

1. **Integração direta, sem adaptadores** — rejeitada: novos meios de pagamento exigiriam alterar o núcleo de pedidos e créditos.
2. **PIX por API de PSP bancário próprio na v1** — rejeitada: exige contrato, homologação e certificados mTLS com a instituição, incompatível com o prazo; o adaptador permite migrar depois.
3. **Checkout transparente com cartão coletado no frontend do Veridit** — rejeitado: amplia o escopo de conformidade PCI DSS e a superfície de ataque.
4. **Conceder créditos no redirecionamento de retorno do checkout** — rejeitado: manipulável pelo cliente (ADR-002).

## Justificativa

- O microkernel isola o que varia (provedores) do que é estável (pedidos e livro-razão), atendendo à evolução prevista em REQ06 e D2 sem alteração do núcleo.
- Um único PSP (Mercado Pago) para os dois caminhos reduz contratos, credenciais e homologação na v1, mantendo a interface pronta para outros PSPs.
- Webhook validado, reconsulta, idempotência e reconciliação cobrem duplicação, falsificação e perda de notificações — os três modos de falha da confirmação assíncrona.

## Cenários de Qualidade (medida de resposta)

- **Estímulo:** webhook de pagamento aprovado é perdido. **Resposta:** a reconciliação detecta o pagamento. **Medida:** créditos concedidos e email enviado em até 15 minutos.
- **Estímulo:** notificação forjada com assinatura inválida. **Resposta:** rejeitada e auditada. **Medida:** zero créditos concedidos.

## Consequências

**Positivas:** novos meios de pagamento como novos adaptadores; créditos sempre lastreados em confirmação do provedor; escopo PCI mínimo.

**Negativas:** dependência de um único PSP na v1; atraso entre pagamento e crédito quando o webhook falha; testes dependem do ambiente sandbox do provedor.

**Mitigações:** interface de adaptador estável e testada com dublês; status "aguardando pagamento" visível; reconciliação monitorada (ADR-013).
