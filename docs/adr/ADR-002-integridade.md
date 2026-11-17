# ADR-002 — Priorizar Integridade como Característica Arquitetural (rev1)

**Status:** Proposto | **Data:** 20/10/2026 | **Autor(es):** Equipe ___

**Revisa:** ADR-002 de 13/10/2026 (versão original preservada no histórico do repositório).

**Requisitos/restrições relacionados:** REQ05–REQ07 (compra e pagamento de créditos); REQ08–REQ15 (gravação, relatório e ZIP com valor probatório); Apêndice A (ids gerados pelo sistema, data/hora início/fim, status, nome/tamanho de arquivo; CPF, OAB, email); Seção 3; ADR-001; ADR-008; ADR-010.

## Contexto

O sistema produz registros de conteúdo web com finalidade probatória (advogados — D1) e opera créditos pagos (REQ05–REQ07). Uma inconsistência entre pagamento confirmado e créditos concedidos, o consumo de crédito sem registro correspondente ou uma alteração indetectável de uma evidência após a captura comprometem diretamente o produto. O pagamento é confirmado por provedor externo, de forma assíncrona, e não pode participar de uma transação local.

## Decisão

Tratar integridade como a característica de maior peso, com as seguintes medidas:

- **Livro-razão de créditos no PostgreSQL:** cada concessão, débito e estorno é um lançamento imutável; o saldo é derivado dos lançamentos. O débito ao iniciar um registro e a mudança de status do registro ocorrem na mesma transação ACID.
- **Pagamento externo:** créditos concedidos somente após confirmação do provedor, recebida por webhook com assinatura validada e status reconsultado na API do provedor; processamento idempotente pelo id do pagamento (restrição de unicidade) e reconciliação periódica (ADR-010).
- **Hash SHA-256 de cada artefato** calculado pelo worker em streaming, durante o upload e antes de a referência ser registrada (ADR-008); o hash é incluído no relatório (REQ14), no manifesto do ZIP (REQ15) e no email de conclusão (REQ10/REQ11), entregando ao usuário uma prova externa à plataforma.
- **Trilha de auditoria append-only** (compra, gravação, acesso e download): o usuário de banco da aplicação tem apenas permissão de INSERT na tabela, e cada linha guarda o hash da linha anterior (encadeamento), tornando detectável qualquer remoção ou alteração.
- **Validação de entrada** de todos os campos do Apêndice A (CPF, OAB, email, URL) na borda e no domínio.

## Alternativas Consideradas

1. **Consistência eventual com sagas no domínio interno** — rejeitada: débito/estorno de créditos e status do registro exigem atomicidade simples, que o banco compartilhado (ADR-001) oferece.
2. **Atomicidade entre provedor e créditos (transação distribuída/2PC)** — inviável: o provedor de pagamento não participa de transações do Veridit.
3. **Conceder créditos no retorno do navegador após o checkout** — rejeitada: o retorno é manipulável pelo cliente; somente a confirmação do provedor é confiável.
4. **Hash calculado posteriormente, de forma assíncrona (versão anterior)** — rejeitada: abre janela em que o arquivo poderia ser alterado antes de ter o hash registrado.
5. **Carimbo do tempo RFC 3161 por Autoridade de Carimbo do Tempo (ICP-Brasil)** — rejeitado na v1: custo por carimbo e integração com terceiro; o hash enviado por email ao usuário já cria prova externa à plataforma. Recomendado para reavaliação na v2 (uso pericial).
6. **Registro distribuído (blockchain)** — rejeitado: custo e complexidade desnecessários na v1.

## Justificativa

- Os dois fluxos mais críticos — créditos (REQ05–REQ07) e evidência (REQ08–REQ15) — exigem exatamente atomicidade interna e não-alteração; o ACID local resolve o primeiro sem sagas, e o hash calculado na origem resolve o segundo.
- Separar o livro-razão interno (ACID) da confirmação externa (idempotência e reconciliação) trata corretamente a única parte do fluxo que não pode ser atômica.
- O hash registrado no banco prova consistência perante a própria plataforma; entregue ao usuário (relatório e email), passa a provar a integridade também perante terceiros.
- O encadeamento de hashes na auditoria torna a trilha verificável sem infraestrutura adicional.

## Cenários de Qualidade (medida de resposta)

- **Estímulo:** arquivo de evidência alterado no storage após a captura. **Resposta:** a verificação hash x objeto detecta a divergência, marca o registro como comprometido e emite alerta. **Medida:** 100% das divergências detectadas no próximo download ou na verificação periódica (no máximo 24 h).
- **Estímulo:** o provedor envia o mesmo webhook de pagamento várias vezes. **Resposta:** créditos lançados uma única vez. **Medida:** zero créditos duplicados.

## Consequências

**Positivas:** créditos sempre consistentes com pagamentos confirmados; evidência verificável inclusive por terceiros; trilha auditável e à prova de adulteração detectável.

**Negativas:** créditos não ficam disponíveis instantaneamente (aguardam confirmação do provedor); custo de cálculo do hash; correções exigem lançamentos compensatórios em vez de edição.

**Mitigações:** status "aguardando pagamento" visível ao usuário e reconciliação periódica (ADR-010); hash em streaming, sem segunda leitura do arquivo; transações curtas e índices apropriados.

## Alterações em relação à versão anterior

- Corrigido "pagamento e créditos atômicos": ACID restrito ao livro-razão interno; pagamento externo por webhook idempotente + reconciliação.
- Eliminada a contradição com a ADR-007: hash calculado na captura (upload), não de forma assíncrona.
- Hash entregue ao usuário (relatório, ZIP, email); carimbo do tempo registrado como alternativa.
- Explicitado como a auditoria append-only é garantida (permissões + encadeamento).
- Corrigido "apêndice distribuído" para "registro distribuído"; adicionados cenários mensuráveis.
