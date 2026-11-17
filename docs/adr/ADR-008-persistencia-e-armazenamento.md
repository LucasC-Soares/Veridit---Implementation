# ADR-008 — Persistência e Armazenamento de Evidências (PostgreSQL + Object Storage S3)

**Status:** Proposto | **Data:** 20/10/2026 | **Autor(es):** Equipe ___

**Requisitos/restrições relacionados:** REQ05–REQ07 (livro-razão de créditos); REQ08–REQ15 (artefatos e metadados); Apêndice A; ADR-001 (banco compartilhado, esquema por serviço); ADR-002 (ACID, hash, auditoria); ADR-004 (criptografia em repouso, LGPD); ADR-005; ADR-007.

## Contexto

O ADR-001 fixou banco relacional compartilhado, mas não o produto. O livro-razão de créditos exige transações ACID; as evidências são arquivos grandes (vídeo em segmentos, telas, HAR, ZIP) que não devem residir no banco; a ADR-002 exige hash por artefato e auditoria imutável; a ADR-004 exige criptografia em repouso e política LGPD; os workers (ADR-005) precisam gravar arquivos sem competir com as transações do domínio.

## Decisão

Adotar PostgreSQL como banco relacional (um esquema por serviço; livro-razão, registros, metadados, hashes, auditoria append-only, outbox) e armazenamento de objetos compatível com S3 para os artefatos, com versionamento, Object Lock (WORM) e criptografia no servidor:

- **Ordem de gravação:** o worker envia o objeto calculando o SHA-256 em streaming; em seguida, uma transação registra chave, hash, tamanho e status; só então a retenção (Object Lock) é aplicada ao objeto. Objetos sem referência após 24 h — ainda sem retenção — são removidos por job de limpeza.
- **Retenção:** prazo definido nos termos de uso (ADR-004); expirado o prazo, os artefatos são excluídos. Dados cadastrais ficam no banco e podem ser anonimizados independentemente.
- **Disponibilidade:** backup contínuo com recuperação point-in-time e réplica standby do PostgreSQL; verificação periódica hash x objeto (ADR-002).
- **Produto de storage:** MinIO em ambiente local/Docker e S3 na migração para nuvem, acessados apenas pela API S3.

## Alternativas Consideradas

1. **MySQL** — rejeitada: atenderia ao requisito transacional; PostgreSQL foi preferido por JSONB para metadados, row-level security e permissões granulares por esquema.
2. **Artefatos dentro do banco (BLOB)** — rejeitada: infla backups, degrada transações e faria a carga de mídia competir com o livro-razão (ADR-002).
3. **Filesystem local compartilhado** — rejeitada: sem versionamento nem imutabilidade nativos; dificulta a escala horizontal dos workers (ADR-005).
4. **MongoDB** — rejeitada: o esquema é fortemente relacional (Apêndice A) e o livro-razão exige ACID multi-registro consolidado.

## Justificativa

- PostgreSQL entrega o ACID do livro-razão (ADR-002), e esquemas com permissões por serviço reduzem o acoplamento do banco compartilhado (ADR-001).
- Object Lock materializa a não-alteração da evidência; aplicá-lo após o commit evita objetos órfãos imutáveis e mantém banco e storage consistentes.
- A API S3 desacopla os workers do produto e do local físico: o fornecedor pode ser trocado sem alterar código, e os workers escalam sem conflito de I/O.
- Separar dados cadastrais de evidências concilia a exclusão prevista na LGPD com a imutabilidade.

## Consequências

**Positivas:** livro-razão consistente; evidência imutável e verificável; escala horizontal dos workers; migração local para nuvem sem reescrita.

**Negativas:** dois componentes de persistência para operar; consistência banco x objeto depende da ordem de gravação; risco de fornecedor: a distribuição e o licenciamento da edição comunitária do MinIO mudaram recentemente (AGPLv3, mudanças na distribuição de binários e imagens).

**Mitigações:** job de limpeza de órfãos e verificação hash x objeto; antes da implantação, verificar a situação vigente do MinIO e, se necessário, usar alternativa compatível com S3 que suporte Object Lock (ex.: Ceph RGW, SeaweedFS — confirmar suporte); criptografia no servidor (ADR-004).

## Alterações em relação à versão anterior

- Ordem de gravação objeto, hash, transação e retenção definida; limpeza de órfãos.
- Política de retenção e conciliação com a LGPD; backup PITR e réplica standby.
- Registrado o risco de licenciamento/distribuição do MinIO, com alternativas.
