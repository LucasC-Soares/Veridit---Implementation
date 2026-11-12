# Veridit — Requisitos do Sistema

Documento de requisitos funcionais e atributos de qualidade do projeto **Veridit** (RiSE Labs).

## Sumário

- [1. Introdução](#1-introdução)
- [2. Requisitos Funcionais](#2-requisitos-funcionais)
- [3. Atributos de Qualidade](#3-atributos-de-qualidade)
- [4. Decisões](#4-decisões)
- [Apêndice A — Campos das Entidades](#apêndice-a--campos-das-entidades)

## 1. Introdução

Este documento apresenta os requisitos funcionais e os atributos de qualidade definidos para o projeto.

## 2. Requisitos Funcionais

A prioridade de cada requisito é classificada como:

- **Alta**: crucial para o produto.
- **Média**: importante para o produto.
- **Baixa**: desejável, mas a aplicação pode existir sem o requisito.

### Resumo

| ID | Requisito | Prioridade | Decisões |
|----|-----------|------------|----------|
| REQ 01 | Cadastrar Usuário | Alta | D1 |
| REQ 02 | Recuperar Senha | Média | — |
| REQ 03 | Logar no Sistema | Alta | — |
| REQ 04 | Sair do Sistema | Alta | — |
| REQ 05 | Comprar Créditos | Alta | D2 |
| REQ 06 | Efetuar Pagamento de Créditos | Alta | — |
| REQ 07 | Confirmar pagamento por email | Alta | — |
| REQ 08 | Iniciar Registro de conteúdo | Alta | — |
| REQ 09 | Concluir gravação de conteúdo | Alta | — |
| REQ 10 | Confirmar gravação de conteúdo por email | Alta | — |
| REQ 11 | Concluir captura de Tela | Alta | — |
| REQ 11 | Confirmar captura de tela por email | Alta | — |
| REQ 12 | Listar Registros realizados | Alta | — |
| REQ 13 | Visualizar Detalhes dos Registros realizados | Alta | — |
| REQ 14 | Gerar Relatório do Registro realizado | Alta | — |
| REQ 15 | Gerar Arquivo zip do Registro realizado | Alta | — |

> **Nota:** o documento original possui dois requisitos numerados como REQ 11. A numeração foi mantida como no original.

### Detalhamento

#### REQ 01 – Cadastrar Usuário

O sistema deve permitir o cadastro de usuários para acesso ao sistema com base nos campos definidos no [Apêndice A](#apêndice-a--campos-das-entidades).

- **Decisões registradas:** D1
- **Prioridade:** Alta

#### REQ 02 – Recuperar Senha

O sistema deve permitir que o usuário possa recuperar a senha de acesso ao sistema.

- **Prioridade:** Média

#### REQ 03 – Logar no Sistema

O sistema deve permitir que o usuário efetue log-in no sistema.

- **Prioridade:** Alta

#### REQ 04 – Sair do Sistema

O sistema deve permitir que o usuário efetue log-out no sistema.

- **Prioridade:** Alta

#### REQ 05 – Comprar Créditos

O sistema deve permitir que o usuário possa comprar créditos para realizar o registro de ocorrências com base em diferentes pacotes definidos no Apêndice A. A realização da compra de créditos envolve os passos de selecionar o pacote de créditos, informar os dados de faturamento e realizar o pagamento.

- **Decisões registradas:** D2
- **Prioridade:** Alta

#### REQ 06 – Efetuar Pagamento de Créditos

O sistema deve permitir que o usuário realize o pagamento dos créditos através do Mercado Pago ou pela plataforma do Veridit. Ao solicitar o pagamento pela plataforma do Veridit, o sistema deve gerar o QR Code ou o número do Pix para pagamento.

- **Prioridade:** Alta

#### REQ 07 – Confirmar pagamento por email

O sistema deve informar o usuário por email da compra dos créditos realizada.

- **Prioridade:** Alta

#### REQ 08 – Iniciar Registro de conteúdo

O sistema deve permitir que o usuário realize a captura de conteúdo através de um site da internet com base nos campos definidos no Apêndice A. O conteúdo pode ser uma tela de um site ou vídeo de navegação.

- **Prioridade:** Alta

#### REQ 09 – Concluir gravação de conteúdo

O sistema deve permitir a conclusão da gravação de conteúdo.

- **Prioridade:** Alta

#### REQ 10 – Confirmar gravação de conteúdo por email

O sistema deve informar ao usuário por email da conclusão da gravação do conteúdo.

- **Prioridade:** Alta

#### REQ 11 – Concluir captura de Tela

O sistema deve permitir a conclusão da captura de tela do conteúdo.

- **Prioridade:** Alta

#### REQ 11 – Confirmar captura de tela por email

O sistema deve informar ao usuário por email da conclusão da captura de tela realizada.

- **Prioridade:** Alta

#### REQ 12 – Listar Registros realizados

O sistema deve listar os registros realizados pelo usuário com base nos campos definidos no Apêndice A.

- **Prioridade:** Alta

#### REQ 13 – Visualizar Detalhes dos Registros realizados

O sistema deve disponibilizar os dados do registro selecionado pelo usuário com base nos campos definidos no Apêndice A.

- **Prioridade:** Alta

#### REQ 14 – Gerar Relatório do Registro realizado

O sistema deve gerar um relatório do registro selecionado pelo usuário apresentando as informações com base nos campos definidos no Apêndice A.

- **Prioridade:** Alta

#### REQ 15 – Gerar Arquivo zip do Registro realizado

O sistema deve gerar um arquivo zip para download com os arquivos capturados durante o registro.

- **Prioridade:** Alta

## 3. Atributos de Qualidade

- **Segurança:** o sistema deve permitir o acesso apenas por usuários cadastrados.

## 4. Decisões

Principais decisões consideradas com base nos requisitos do produto.

- **D1.** O sistema deve permitir o cadastro de advogados, usuários comuns e empresas. Na primeira versão do sistema, apenas advogados e usuários comuns serão cadastrados.
- **D2.** O sistema deve permitir a escolha do pacote de créditos pelo usuário. Na primeira versão do sistema, os pacotes básico, médio e premium são oferecidos.

## Apêndice A — Campos das Entidades

| Entidade | Campos |
|----------|--------|
| Advogado | Nome completo, email, senha, CPF e número da OAB |
| Usuário comum | Nome completo, email, senha, CPF |
| Pacote de créditos | Nome, quantidade de créditos, valor por crédito, descrição dos benefícios |
| Dados da compra do pacote de créditos | Nome completo, email, telefone, CPF, CEP, endereço, número, complemento, bairro, cidade, estado |
| Registro de conteúdo | Endereço do site, título do registro do conteúdo |
| Registros realizados | Título, data/hora início, data/hora fim, detalhes, status |
| Detalhes dos registros | id gerado pelo sistema, título, data/hora início, data/hora fim, tipos de dados registrados, informações dos dados (número de imagens e vídeos), usuário responsável pelo registro |
| Relatório do registro de conteúdo | Título, id gerado pelo sistema, usuário, CPF, id do registro gerado pelo sistema, data/hora início, data/hora fim, duração, imagens capturadas, site da imagem, URL do site navegado, nome do arquivo gerado pelo sistema, tamanho do arquivo |