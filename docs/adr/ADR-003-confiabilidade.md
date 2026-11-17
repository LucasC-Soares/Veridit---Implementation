# ADR-003 — Priorizar Confiabilidade como Característica Arquitetural (rev1)

**Status:** Proposto | **Data:** 20/10/2026 | **Autor(es):** Equipe ___

**Revisa:** ADR-003 de 13/10/2026 (versão original preservada no histórico do repositório).

**Requisitos/restrições relacionados:** REQ08–REQ11 (captura no momento em que o conteúdo está disponível); REQ05–REQ07 (compra de créditos); REQ07, REQ10, REQ11 (confirmações por email); REQ14–REQ15; Apêndice A (status do registro); ADR-001; ADR-002; ADR-007; ADR-009; ADR-013.

## Contexto

A captura (REQ08–REQ11) só tem valor se ocorrer enquanto o conteúdo está no ar — conteúdo ofensivo pode ser removido a qualquer instante, e a perda de uma gravação destrói o valor do registro. Falhas silenciosas em pagamento ou email geram inconsistências percebidas pelo usuário (crédito pago e não concedido, gravação concluída e não confirmada). Uma sessão de captura não pode ser simplesmente repetida mais tarde: o site pode ter mudado.

## Decisão

Tratar confiabilidade como driver arquitetural, com as seguintes medidas:

- Serviços implantados e falhando de forma independente (ADR-001).
- **Transactional outbox:** toda mensagem é gravada na mesma transação da mudança de estado e publicada por um relay, eliminando a perda entre commit e publicação (ADR-009).
- **Mensageria durável** com retentativa exponencial e DLQ para pós-processamento (hash, relatório, ZIP) e emails; consumers idempotentes (ADR-009).
- **Captura sem retentativa automática:** o vídeo é gravado em segmentos persistidos continuamente, preservando o que já foi capturado; em falha técnica, o registro recebe status "falhou", o crédito é estornado (ADR-002) e o usuário é notificado para iniciar nova captura.
- Health checks, métricas e alertas (ADR-013); **degradação graciosa** — falha de notificação não afeta registro nem créditos, e a confirmação é reprocessada.
- **Pontos únicos de falha mitigados:** backup do PostgreSQL com recuperação point-in-time e réplica standby; ao menos duas instâncias do gateway.

## Alternativas Consideradas

1. **Monólito único** — rejeitado: qualquer falha derruba captura, pagamento e evidências juntos.
2. **Microsserviços completos** — rejeitados: confiabilidade a custo operacional alto (ADR-001).
3. **Retentativas apenas síncronas** — rejeitadas: falha transitória do provedor de email perderia a confirmação.
4. **Publicar na fila diretamente após o commit (sem outbox)** — rejeitado: queda do serviço entre o commit e a publicação perde a mensagem silenciosamente.
5. **Retentativa automática da sessão de captura** — rejeitada: o conteúdo pode ter mudado, e a evidência misturaria momentos diferentes sem conhecimento do usuário.

## Justificativa

- Isolamento de falhas por serviço somado ao outbox e à retentativa assíncrona entrega a garantia de que nenhuma operação crítica se perde, sem o custo de microsserviços.
- Distinguir pós-processamento (repetível) de captura (não repetível) aplica a retentativa onde ela é segura e preserva a fidelidade da evidência onde não é.
- Gravação em segmentos e estorno automático transformam a falha de captura em perda mínima de dados e nenhuma perda financeira para o usuário.
- A degradação graciosa mantém o domínio consistente mesmo com dependências externas instáveis.

## Cenários de Qualidade (medida de resposta)

- **Estímulo:** provedor de email indisponível por 30 minutos. **Resposta:** emails retidos e reenviados automaticamente; registros e créditos inalterados. **Medida:** zero emails perdidos; 100% entregues em até 1 hora após o retorno do provedor.
- **Estímulo:** queda de um worker durante o pós-processamento. **Resposta:** tarefa reprocessada por outro worker. **Medida:** relatório e ZIP disponíveis em até 5 minutos após a falha.
- **Estímulo:** queda do worker de sessão durante uma captura. **Resposta:** segmentos já gravados preservados, status "falhou", crédito estornado e usuário notificado. **Medida:** perda máxima de um segmento (10 s) de vídeo; estorno em 100% dos casos.

## Consequências

**Positivas:** falhas isoladas entre domínios; operações críticas eventualmente concluídas; nenhuma cobrança por captura que falhou; sistema observável.

**Negativas:** infraestrutura de mensageria e relay de outbox; mensagens podem ser entregues mais de uma vez; capturas interrompidas exigem nova ação do usuário.

**Mitigações:** idempotência por chave de operação nos consumers; alertas de DLQ e de outbox pendente (ADR-013); política de retentativa documentada (ADR-009); mensagem clara ao usuário em caso de falha.

## Alterações em relação à versão anterior

- Adicionado transactional outbox (corrige perda possível entre commit e publicação).
- Retentativa automática restrita ao pós-processamento; política de falha de captura com estorno.
- Pontos únicos de falha (banco, gateway) com mitigação explícita.
- Adicionados cenários de qualidade mensuráveis.
