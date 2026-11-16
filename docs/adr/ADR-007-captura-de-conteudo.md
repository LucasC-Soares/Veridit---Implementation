# ADR-007 — Tecnologia de Captura de Conteúdo (Navegador Remoto Interativo com Playwright)

**Status:** Proposto | **Data:** 20/10/2026 | **Autor(es):** Equipe ___

**Requisitos/restrições relacionados:** REQ08 (iniciar registro: endereço do site e título; tela ou vídeo de navegação); REQ09 (concluir gravação); REQ10/REQ11 (concluir captura de tela e confirmações); REQ14; REQ15; Apêndice A; ADR-002 (hash na origem); ADR-003 (sem retentativa automática da captura); ADR-004 (SSRF); ADR-005 (sessões dedicadas); ADR-008; ADR-009; ADR-012.

## Contexto

O REQ08 exige captura de "tela de um site ou vídeo de navegação" e o REQ09 que o usuário conclua a gravação: o usuário precisa navegar no site e decidir quando concluir. Ao mesmo tempo, a evidência só tem valor se produzida em ambiente controlado pela plataforma, de forma fiel e verificável (ADR-002), e não a partir de material gerado no computador do usuário.

## Decisão

Implementar a captura como uma sessão de navegador remoto interativo no serviço de Mídia:

- Ao iniciar o registro (REQ08), Captura/Registro debita o crédito (ADR-002) e solicita uma sessão; um worker de sessão abre um Chromium via Playwright em contexto isolado (perfil novo, sem dados persistidos), com gravação de vídeo e de HAR habilitadas e saída de rede apenas pelo proxy de egress (ADR-004, ADR-012).
- A tela é transmitida ao navegador do usuário por CDP screencast sobre WebSocket; cliques, rolagem e digitação do usuário retornam pelo mesmo canal e são aplicados pelo Playwright.
- O usuário pode capturar telas a qualquer momento (botão "Capturar tela" — REQ11); "Concluir gravação" (REQ09) encerra o contexto, finalizando vídeo e HAR.
- O vídeo gravado é o do navegador no servidor (fonte da evidência), não o stream exibido ao usuário; é persistido em segmentos de 10 s com hash SHA-256 calculado em streaming no upload (ADR-002, ADR-008). Após a conclusão, o evento de pós-processamento (relatório, ZIP, email) é publicado via outbox (ADR-009).
- Limites: duração máxima de 30 min, encerramento por 5 min de inatividade, downloads e pop-ups de permissão bloqueados; versão do navegador, user-agent, viewport e horários registrados nos metadados do registro (Apêndice A).

## Alternativas Consideradas

1. **Captura automática headless sem interação (versão anterior)** — rejeitada: o usuário não navega nem decide quando concluir, não atendendo REQ08/REQ09 ("vídeo de navegação").
2. **Desktop virtual com noVNC (ou Selenium Grid com VNC)** — rejeitada: grava a área de trabalho inteira, consome mais recursos, tem latência maior e não produz HAR integrado.
3. **Captura no cliente (extensão de navegador ou gravação de tela local)** — rejeitada: autenticidade difícil de provar; depende do ambiente e da boa-fé do usuário (ADR-002).
4. **Puppeteer** — rejeitado: restrito ao Chromium, sem geração nativa de HAR (depende de bibliotecas de terceiros) e com gravação de vídeo menos integrada que a do Playwright.

## Justificativa

- Atende ao requisito como escrito — o usuário navega e conclui — mantendo a evidência produzida inteiramente no servidor, em ambiente controlado e auditável.
- Playwright fornece, em uma única API, contexto isolado, gravação de vídeo, HAR, capturas de tela e injeção de eventos de mouse/teclado; o CDP screencast entrega os quadros para o streaming.
- O HAR registra URL final, códigos HTTP e tempos de resposta, dando traçabilidade técnica ao relatório (REQ14) e reforçando o valor probatório.
- Isolar a navegação no proxy de egress neutraliza o SSRF, o maior risco específico de abrir URLs arbitrárias no servidor (ADR-004).

## Cenários de Qualidade (medida de resposta)

- **Estímulo:** usuário navega e conclui uma gravação. **Resposta:** vídeo, HAR e telas persistidos com hash. **Medida:** 100% dos artefatos com hash registrado antes do status "concluído"; latência de interação conforme ADR-005 (no máximo 300 ms no percentil 95).

## Consequências

**Positivas:** atende literalmente REQ08–REQ11; evidência produzida e gravada somente no servidor; metadados automáticos; integração direta com hash (ADR-002) e pós-processamento (ADR-009).

**Negativas:** um Chromium por sessão (CPU/RAM elevados); a qualidade da experiência depende da rede do usuário; canal de eventos bidirecional a implementar; o HAR pode conter cookies e tokens de sites em que o usuário se autenticar durante a sessão.

**Mitigações:** controle de admissão e limites por nó (ADR-005); taxa de quadros adaptativa; HAR original retido criptografado e, no ZIP, versão com cabeçalhos sensíveis (Cookie, Authorization, Set-Cookie) mascarados, ambas com hash próprio no manifesto; imagem Docker com versão fixada do Playwright/Chromium (ADR-012).

## Alterações em relação à versão anterior

- Decisão alterada: de captura automática headless para navegador remoto interativo (REQ08/REQ09).
- Adicionados proxy de egress (SSRF), limites de sessão, gravação em segmentos e tratamento do HAR.
- Atualizada a justificativa contra o Puppeteer; nomes de serviços alinhados à ADR-001 rev1.
