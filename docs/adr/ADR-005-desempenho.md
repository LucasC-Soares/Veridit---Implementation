# ADR-005 — Priorizar Desempenho como Característica Arquitetural (rev1)

**Status:** Proposto | **Data:** 20/10/2026 | **Autor(es):** Equipe ___

**Revisa:** ADR-005 de 13/10/2026 (versão original preservada no histórico do repositório).

**Requisitos/restrições relacionados:** REQ08–REQ11 (sessão de captura interativa); REQ14 (relatório); REQ15 (ZIP); REQ12–REQ13 (listagem e detalhes); Apêndice A (status e tamanho dos arquivos); ADR-001; ADR-007; ADR-009.

## Contexto

O sistema tem dois perfis de carga distintos: (a) a sessão de captura interativa (REQ08–REQ11, ADR-007), síncrona e sensível à latência — o usuário navega por streaming em um navegador executado no servidor; (b) o pós-processamento (hash, relatório REQ14, ZIP REQ15, emails), pesado mas tolerante a atraso. Misturar os dois degradaria a navegação justamente no momento crítico do registro.

Premissas de volume da v1 (a validar em sala): até 50 sessões simultâneas no pico; sessões de até 30 minutos; vídeos de até cerca de 500 MB por registro.

## Decisão

Tratar desempenho como driver arquitetural, separando os dois caminhos:

- **Sessões interativas em workers de sessão dedicados:** um Chromium por sessão, limite de sessões por nó, escala horizontal pelo número de sessões e controle de admissão com fila de espera visível ao usuário quando a capacidade estiver esgotada.
- **Streaming de tela por WebSocket** com taxa de quadros e qualidade adaptativas à rede do usuário (ADR-007).
- **Pós-processamento assíncrono por fila** (ADR-009) em workers stateless separados das sessões, sem tocar nas transações ACID do domínio de créditos.
- **Cache e paginação** nas leituras de listagem e detalhes (REQ12–REQ13); feedback de progresso pelo campo status (Apêndice A) e por email (REQ10, REQ11).

## Alternativas Consideradas

1. **Pós-processamento síncrono** — rejeitado: bloqueia o usuário e consome o servidor de aplicação.
2. **Space-Based** — rejeitado: líder em desempenho, mas reduz integridade (ADR-001/ADR-002).
3. **Escala vertical de um único servidor** — rejeitada: limite físico de navegadores simultâneos por máquina e ponto único de falha.
4. **Sessões e pós-processamento no mesmo pool de workers** — rejeitado: geração de vídeo/ZIP disputaria CPU com as sessões e aumentaria a latência da navegação interativa.

## Justificativa

- Separar os pools aplica a cada carga a tática adequada: recursos dedicados e controle de admissão para a carga sensível à latência; concorrência assíncrona para a carga tolerante a atraso.
- Escalar apenas o componente sob pressão (sessões ou pós-processamento) otimiza custo.
- A fila move a carga pesada para fora do caminho crítico sem abandonar ACID no domínio de créditos — desempenho obtido sem pagar com integridade.

## Cenários de Qualidade (medida de resposta)

- **Estímulo:** 50 sessões de captura simultâneas. **Resposta:** navegação fluida. **Medida:** latência entre a ação do usuário e o quadro atualizado de no máximo 300 ms no percentil 95 (rede do usuário até 50 ms).
- **Estímulo:** conclusão de uma gravação de 30 minutos. **Resposta:** relatório e ZIP gerados em segundo plano. **Medida:** disponíveis em até 5 minutos em 95% dos casos.
- **Estímulo:** listagem de registros com 1.000 itens. **Medida:** resposta de no máximo 1 s no percentil 95.

## Consequências

**Positivas:** navegação responsiva durante a captura; escala sob demanda de cada componente crítico; proteção contra picos por controle de admissão.

**Negativas:** um navegador por sessão é caro em CPU/RAM; usuários podem aguardar vaga em picos; latência percebida na entrega de ZIP e relatórios.

**Mitigações:** créditos como limitador natural de concorrência por usuário; tempo máximo e encerramento por inatividade das sessões (ADR-007); métricas de sessões ativas e fila de admissão (ADR-013).

## Alterações em relação à versão anterior

- Separados os caminhos de sessão interativa (síncrono) e pós-processamento (fila), conforme a nova ADR-007.
- Registradas premissas de volume; cenários mensuráveis.
- Substituída a alternativa "pré-processamento especulativo" por alternativas reais (escala vertical; pool único).
