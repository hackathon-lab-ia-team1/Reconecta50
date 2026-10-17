# Contribuindo com o Hackathon LAB.AI - Equipe 1

Este documento define as regras para contribuição, versionamento e o fluxo de desenvolvimento da Equipe 1 no Hackathon LAB.AI.

## Planejamento e Metodologia

O desenvolvimento é estruturado utilizando Scrum e Kanban:

* O levantamento de requisitos define os objetivos do projeto.
* As metas e entregáveis do hackathon são organizados por Milestones no repositório.
* As tarefas são acompanhadas pelo GitHub Projects (ou ferramentas de apoio como Notion e Trello).

## Fluxo de desenvolvimento

Cada implementação deve seguir o fluxo:

1. Criar ou utilizar uma Issue vinculada a uma Milestone para a tarefa.
2. Criar uma branch própria a partir da branch `develop`.
3. Realizar as alterações e commits.
4. Abrir um Pull Request apontando para a branch `develop`.
5. Solicitar revisão de outro integrante da equipe.
6. Realizar os ajustes solicitados, quando necessário.
7. Fazer o merge após pelo menos uma aprovação.
8. Acompanhar e atualizar o status da tarefa no GitHub Projects.

## Branches

As branches devem seguir o padrão:

```text
<tipo>/<issue>-<descricao>

```

Tipos permitidos:

* `feature` — nova funcionalidade
* `fix` — correção de bug
* `refactor` — refatoração
* `docs` — documentação
* `chore` — tarefas de configuração ou manutenção
* `test` — criação ou alteração de testes

Exemplos:

```text
feature/10-onboarding-usuario
fix/18-ajustar-layout-mobile
refactor/22-modularizar-servico
docs/05-documentar-arquitetura
chore/02-configurar-ambiente
test/14-testes-integracao

```

A descrição deve ser curta, objetiva e utilizar letras minúsculas separadas por hífen.

As branches principais do projeto seguem o Gitflow:

* `main` — versão estável e final para apresentação.
* `develop` — integração contínua do desenvolvimento.

Não devem ser realizadas alterações diretamente nas branches principais (`main` e `develop`).

## Commits

Os commits devem seguir o padrão:

```text
tipo: descrição

```

Tipos principais:

* `feat` — nova funcionalidade
* `fix` — correção de bug
* `refactor` — refatoração
* `docs` — documentação
* `test` — testes
* `chore` — manutenção ou configuração

Exemplos:

```text
feat: adiciona fluxo de onboarding
fix: corrige falha no envio de formulario
refactor: reorganiza chamadas da api
test: adiciona testes do modulo principal
docs: atualiza documentacao do projeto
chore: ajusta dependencias do repositorio

```

A mensagem do commit deve ser objetiva e descrever a alteração realizada.

## Pull Requests

Toda alteração deve ser submetida por meio de um Pull Request direcionado à branch `develop`.

O título do Pull Request deve seguir o padrão:

```text
tipo: descrição

```

Exemplo:

```text
feat: implementa fluxo de onboarding

```

O Pull Request deve:

* Descrever brevemente as alterações realizadas.
* Referenciar a Issue relacionada.
* Informar os testes realizados.
* Utilizar o template de Pull Request do projeto, se houver.

Quando a alteração concluir uma Issue, utilizar:

```text
Closes #<número-da-issue>

```

Exemplo:

```text
Closes #10

```

## Code Review

Todo Pull Request deve possuir pelo menos uma aprovação de outro integrante antes do merge.

O autor do Pull Request não deve aprovar o próprio Pull Request como única revisão.

As alterações solicitadas durante a revisão devem ser realizadas antes do merge, quando aplicável.

## Issues

As tarefas do projeto devem ser registradas como Issues e vinculadas ao GitHub Projects e às Milestones correspondentes.

As Issues devem possuir as labels adequadas ao tipo e ao contexto da tarefa.

Cada implementação deve estar vinculada a uma Issue correspondente.

## GitHub Projects

O GitHub Projects é utilizado para acompanhar o andamento das tarefas do projeto via Kanban.

As Issues devem ser movimentadas conforme o progresso da implementação, permitindo acompanhar o fluxo desde o planejamento até a conclusão.

## Regra geral

Toda alteração no projeto deve seguir o fluxo:

```text
Issue / Requisito
  ↓
Branch (criada a partir de 'develop')
  ↓
Commits
  ↓
Pull Request (direcionado a 'develop')
  ↓
Code Review & Aprovação
  ↓
Merge em 'develop'
  ↓
Merge em 'main' (ao final da Sprint ou Milestone de Release)

```
