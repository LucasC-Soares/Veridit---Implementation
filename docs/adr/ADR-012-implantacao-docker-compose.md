# ADR-012 — Implantação e Ambiente de Execução (Docker Compose)

**Status:** Proposto | **Data:** 20/10/2026 | **Autor(es):** Equipe ___

**Requisitos/restrições relacionados:** Trabalho II (código e instruções de execução no repositório); ADR-001 (múltiplos deployables); ADR-004 (SSRF, segredos); ADR-006 (Node LTS); ADR-007 (Chromium); ADR-008; ADR-009; ADR-011; ADR-013; restrições: equipe pequena, cronograma curto.

## Contexto

O sistema tem cerca de doze containers (frontend, gateway, cinco serviços, workers de sessão e de pós-processamento, PostgreSQL, RabbitMQ, storage S3, proxy de egress, Mailpit e observabilidade). O trabalho exige instruções para executar o sistema, e o Chromium depende de bibliotecas do sistema operacional que precisam ser reprodutíveis.

## Decisão

Implantar a v1 com Docker Compose, a partir de um único arquivo no repositório:

- **Imagens:** uma por serviço, com Node LTS fixado; workers de sessão sobre a imagem oficial do Playwright com versão fixada.
- **Redes:** "interna" (sem acesso à internet) para serviços, banco, fila e storage; "egress" apenas para o proxy de egress com bloqueio de faixas privadas (ex.: smokescreen); o navegador de captura acessa a internet somente por esse proxy (ADR-004).
- **Configuração e segredos:** variáveis em `.env` não versionado, com `.env.example` versionado; Docker secrets para credenciais no ambiente de demonstração.
- **Inicialização:** healthchecks e dependências entre serviços; container de migrações do banco executado antes dos serviços; dados de exemplo (pacotes D2) carregados por seed.
- **Execução:** README com pré-requisitos e o comando `docker compose up`.

## Alternativas Consideradas

1. **Kubernetes na v1** — rejeitado: complexidade operacional desproporcional à equipe e ao prazo; as mesmas imagens servem para migração futura.
2. **Execução direta na máquina, sem containers** — rejeitada: dependências do Chromium e versões de PostgreSQL/RabbitMQ divergiriam entre máquinas da equipe e do professor.
3. **PaaS gerenciado (ex.: serviço de containers em nuvem)** — rejeitado na v1: custo, credenciais de nuvem e lock-in; o sistema deve ser executável localmente para avaliação.

## Justificativa

- Um comando sobe todo o sistema, atendendo à exigência de instruções de execução com reprodutibilidade entre máquinas.
- Redes separadas tornam a proteção contra SSRF uma propriedade da infraestrutura, não apenas do código (ADR-004).
- Imagens por serviço preservam a implantação independente do estilo baseado em serviços (ADR-001) e o caminho para Kubernetes.

## Cenários de Qualidade (medida de resposta)

- **Estímulo:** um novo membro clona o repositório. **Resposta:** sistema completo em execução. **Medida:** em até 15 minutos, com um único comando após configurar o `.env`.

## Consequências

**Positivas:** ambiente reprodutível; isolamento de rede da captura; demonstração local simples.

**Negativas:** Compose em host único, sem alta disponibilidade real nem escala automática; consumo de memória elevado na máquina de desenvolvimento.

**Mitigações:** réplicas declaradas no Compose para workers; limites de memória por container; perfis do Compose para subir apenas parte do sistema; Kubernetes como evolução registrada.
