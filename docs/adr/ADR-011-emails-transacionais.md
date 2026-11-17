# ADR-011 — Envio de Emails Transacionais

**Status:** Proposto | **Data:** 20/10/2026 | **Autor(es):** Equipe ___

**Requisitos/restrições relacionados:** REQ02 (recuperação de senha); REQ07 (confirmação de compra); REQ10 (conclusão da gravação); REQ11 (conclusão da captura de tela); ADR-002 (hash no email); ADR-003 (degradação graciosa); ADR-004; ADR-009; ADR-012.

## Contexto

Quatro requisitos dependem de email. Os emails precisam chegar à caixa de entrada (não ao spam), não podem ser perdidos por falha transitória do provedor (ADR-003) e não podem bloquear os fluxos de negócio. O email de conclusão leva o hash dos artefatos ao usuário (ADR-002).

## Decisão

O serviço de Notificação consome eventos da fila (ADR-009) e envia por SMTP com Nodemailer, atrás de uma interface `EmailSender`:

- **Produção:** provedor transacional com SMTP (ex.: Amazon SES, Brevo ou SendGrid — escolha final por custo, a registrar em sala), com SPF, DKIM e DMARC no domínio do Veridit.
- **Desenvolvimento:** Mailpit, que captura localmente todos os emails enviados.
- **Templates** versionados para REQ02, REQ07, REQ10 e REQ11; os emails contêm link para a plataforma e o hash dos artefatos, mas nunca anexos de evidência nem dados sensíveis.
- **Idempotência** por (evento, destinatário) e registro do status de envio; o email de recuperação de senha usa fila de prioridade alta.

## Alternativas Consideradas

1. **Envio síncrono dentro do fluxo de negócio** — rejeitado: falha do provedor quebraria compra ou conclusão de registro (ADR-003).
2. **Servidor SMTP próprio (Postfix)** — rejeitado: reputação de IP e entregabilidade difíceis de manter.
3. **SDK HTTP proprietário do provedor diretamente no código** — rejeitado: acopla ao fornecedor; SMTP atrás de interface permite trocar de provedor por configuração.
4. **Anexar o ZIP ou o relatório ao email** — rejeitado: tamanho, limites dos provedores e exposição de evidência fora do controle de acesso (ADR-004).

## Justificativa

- Fila, retentativa e idempotência (ADR-009) garantem a entrega mesmo com o provedor instável.
- Provedor transacional com autenticação de domínio maximiza a entregabilidade com custo baixo.
- Mailpit permite testar todos os fluxos de email localmente, sem envio real.
- Hash no corpo do email cria prova externa à plataforma sem expor a evidência.

## Cenários de Qualidade (medida de resposta)

- **Estímulo:** conclusão de uma gravação. **Resposta:** email REQ10 com título, horários e hash. **Medida:** entregue em até 5 minutos em 99% dos casos.

## Consequências

**Positivas:** emails confiáveis e desacoplados dos fluxos; troca de provedor por configuração; testes locais completos.

**Negativas:** dependência de terceiro e custo por volume; configuração de DNS (SPF/DKIM/DMARC) necessária.

**Mitigações:** alertas de falha de envio e de DLQ (ADR-013); documentação da configuração de DNS no repositório.
