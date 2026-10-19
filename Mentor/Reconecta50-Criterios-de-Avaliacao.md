# Reconecta 50+: como desenvolver e apresentar o projeto pelos critérios de avaliação

Minha sugestão é usar os critérios da banca para orientar tanto o desenvolvimento quanto a apresentação. O Reconecta 50+ aborda a diversidade etária e geracional no mercado de trabalho, com foco na inclusão profissional de pessoas com 50 anos ou mais. A avaliação ficará mais consistente quando a equipe conseguir mostrar o que funciona, quem se beneficia e quais resultados foram observados.

O foco que recomendo para o MVP é ajudar uma pessoa a contar sua experiência profissional, revisar um currículo gerado a partir desse relato e baixar um documento que possa usar em uma candidatura. O acesso a vagas reais pode complementar a experiência quando houver oportunidades verificadas.

Este documento relaciona a proposta aos critérios informados e indica as evidências que a equipe deve preparar. As ações recomendadas ainda precisam ser implementadas ou validadas.

| Critério | Peso informado | O que o Reconecta precisa demonstrar |
| --- | --- | --- |
| Relevância e impacto social | 25% | Como a solução pode favorecer a inclusão profissional e a diversidade etária, com evidências de autonomia e avanço nas candidaturas. |
| Uso consciente da IA | 25% | Que a IA tem uma função útil, preserva os fatos e opera com consumo e custo acompanhados. |
| Inovação e criatividade | 20% | Que a aplicação da IA oferece uma experiência adequada ao problema e uma vantagem específica a validar. |
| Viabilidade técnica e usabilidade | 20% | Que o fluxo funciona do início ao fim e pode ser usado pelo público escolhido. |
| Apresentação: PPT/PDF e pitch | A confirmar | Que a equipe explica a proposta com clareza e sustenta os argumentos com demonstração e evidências. |

**Os percentuais informados somam 90%.** Se a avaliação totalizar 100%, os 10% restantes poderiam corresponder à apresentação, mas isso precisa ser confirmado no regulamento.

## 1. Relevância e impacto social: 25%

**O Reconecta 50+ atua em um campo de grande relevância e sensibilidade social: a diversidade etária e geracional no mercado de trabalho.** Sua proposta é apoiar a participação profissional de pessoas com 50 anos ou mais, valorizando suas trajetórias e facilitando o acesso a oportunidades. Essa atuação se conecta a questões como autonomia, renda, reconhecimento profissional e participação social.

O projeto pode contribuir para enfrentar barreiras associadas ao etarismo ao ajudar cada pessoa a apresentar suas competências e experiências de forma clara. A aproximação com empregadores dispostos a considerar profissionais de diferentes idades pode ampliar essa contribuição e favorecer a troca de conhecimentos entre gerações.

Eu apresentaria o potencial de impacto em três dimensões:

- **Autonomia na busca por trabalho:** facilitar a preparação do currículo e os passos de uma candidatura, reduzindo a necessidade de ajuda para essas tarefas.
- **Reconhecimento da trajetória profissional:** tornar mais claras as atividades e competências que a pessoa desenvolveu, inclusive em experiências informais, desde que relatadas e confirmadas por ela.
- **Inclusão e diversidade nas oportunidades:** aproximar candidatos de processos seletivos que considerem suas competências e permitam a participação de profissionais de diferentes gerações.

A sensibilidade do tema também precisa orientar a experiência. Pessoas com mais de 50 anos têm histórias, objetivos e níveis de familiaridade digital diferentes. A linguagem deve ser respeitosa, sem infantilização ou atribuição automática de qualidades e limitações à idade. O usuário deve ter controle sobre como sua trajetória será apresentada.

No MVP, eu começaria por pessoas desse público que estão em busca de recolocação e relatam dificuldade para preparar ou atualizar o currículo. A contribuição inicial seria permitir que elas organizem suas experiências, revisem o conteúdo e obtenham um documento utilizável. Esse recorte dá à equipe uma tarefa concreta para desenvolver e observar.

O impacto mais amplo depende também do lado de quem contrata. Por isso, eu incluiria conversas com empregadores para entender critérios de seleção, barreiras percebidas e oportunidades de participação. Currículos concluídos e candidaturas realizadas são resultados iniciais; entrevistas, contratações e mudanças nas práticas de seleção exigem acompanhamento posterior. A redução do etarismo permanece um objetivo a investigar, sem ser tratada como resultado já alcançado.

Para demonstrar relevância, eu levaria à banca relatos reais, autorizados e sem identificação desnecessária, além de observações de uso. Um piloto qualitativo com 10 a 15 participantes pode ajudar a identificar dificuldades recorrentes; esse número é uma sugestão de organização, sem representatividade estatística.

Os registros mais úteis seriam:

- Quantas pessoas iniciaram e quantas concluíram um currículo revisado.
- Quanto tempo levaram e em quais etapas precisaram de ajuda.
- Quais informações precisaram corrigir no conteúdo gerado.
- Quantas usaram o documento em uma candidatura e qual foi o retorno observado.
- Como candidatos e empregadores avaliaram a clareza com que as experiências foram apresentadas.

Na apresentação, todo número deve indicar a quantidade de participantes, o período e como foi obtido. Enquanto o piloto não acontecer, essas medidas devem aparecer como plano de validação.

## 2. Uso consciente da IA: 25%

A função mais clara da IA é organizar relatos escritos de maneiras diferentes e ajudar a redigir experiências profissionais. Por exemplo, ela pode transformar uma descrição informal de tarefas em tópicos de currículo, preservando o sentido e os fatos fornecidos.

Essa escolha permite explicar por que usar IA. A formatação do PDF, a edição de dados e filtros simples de vagas podem ser feitos pelo próprio sistema, sem novas chamadas ao modelo.

### Fidelidade e responsabilidade

Minha orientação é que cada experiência, formação, data e competência tenha apoio no relato ou confirmação do usuário. Quando faltar informação, o sistema deve perguntar ou deixar o campo pendente. A revisão precisa ocorrer antes da exportação.

O código atual exige ajustes nesse ponto: o retorno simulado acrescenta competências e atividades genéricas, e o prompt pede características como estabilidade emocional sem exigir evidência. Recomendo retirar essas inferências e demonstrar como o produto lida com relatos incompletos.

Também considero importantes estas decisões:

- Explicar, antes do envio, que o relato será processado por um serviço de IA.
- Enviar apenas os dados necessários à tarefa. Nome, telefone e e-mail podem ser adicionados ao documento pelo sistema, sem precisar entrar no pedido de reescrita das experiências.
- Definir o que será armazenado, por quanto tempo e como a pessoa poderá apagar seus dados. Conferir também as condições de tratamento de dados do provedor escolhido.
- Identificar claramente uma demonstração com conteúdo simulado. Uma falha da IA deve ser comunicada e permitir nova tentativa, preservando o relato.

### Eficiência e baixo custo

O baixo custo precisa ser medido. Eu começaria com uma geração solicitada pelo usuário, limite de tamanho para o relato e edição posterior sem chamar a IA a cada alteração. Novas gerações devem ter uma finalidade clara, com limite de tentativas e de consumo.

Durante o piloto, a equipe pode registrar modelo utilizado, quantidade de chamadas, consumo, tempo de resposta e custo. A documentação do Gemini explica a [contagem de tokens](https://ai.google.dev/gemini-api/docs/tokens), e a [tabela oficial de preços](https://ai.google.dev/gemini-api/docs/pricing) deve ser consultada na data da medição.

Uma medida útil é:

**Custo de IA por currículo concluído = custo total das chamadas no período, incluindo novas tentativas e eventuais chamadas cobradas que falharam, dividido pelo número de currículos concluídos e revisados.**

Se nenhum currículo for concluído, a medida ainda não pode ser calculada. Hospedagem, armazenamento e atendimento devem aparecer separadamente no custo de operação. Caso o piloto utilize créditos ou franquia gratuita, convém mostrar também uma estimativa pelas tarifas aplicáveis para avaliar a continuidade.

Para a banca, eu mostraria um relato, o resultado gerado, a revisão feita pelo usuário e uma medição de consumo. Isso sustenta melhor o critério do que apenas afirmar que a solução é ética e barata.

## 3. Inovação e criatividade: 20%

A inovação que o projeto pode defender está na forma de aplicar a IA à dificuldade escolhida. Já existem serviços de vagas e capacitação para profissionais maduros, como a [Maturi](https://www.maturi.com.br/). Por isso, eu evitaria apresentar o público 50+ ou a geração de currículos como prova de ineditismo.

Uma hipótese de diferencial é ajudar a pessoa a reconhecer e descrever o que fez, sem exigir que ela conheça termos de recrutamento ou saiba escrever instruções para uma IA. O sistema pode começar com perguntas sobre atividades concretas, identificar informações ausentes e apresentar sugestões que a pessoa consiga conferir.

**Exemplo hipotético para demonstrar a proposta:**

> Relato: “Eu conferia as mercadorias que chegavam, anotava o que faltava e avisava quando precisava comprar mais.”
>
> Sugestão de redação: “Conferência de mercadorias recebidas, registro de itens em falta e comunicação da necessidade de reposição.”

O exemplo preserva o que foi dito. Uma competência como “controle de estoque” poderia ser sugerida para confirmação, sem acrescentar liderança, domínio de sistemas ou resultados financeiros que não foram informados.

Outro recurso a experimentar seria permitir que a pessoa consulte o trecho do relato que deu origem a uma sugestão. Isso pode facilitar a revisão e tornar a transformação mais compreensível. É uma possibilidade de evolução, ainda sem implementação no repositório.

Para avaliar o diferencial, eu compararia a mesma tarefa usando o Reconecta e a alternativa que os participantes já utilizam, como um modelo de currículo ou um editor de texto. A comparação pode observar esforço, necessidade de ajuda e fidelidade do resultado. A originalidade da combinação e sua utilidade precisam ser sustentadas por essa observação.

## 4. Viabilidade técnica e usabilidade: 20%

O repositório já oferece um ponto de partida: backend em Express e TypeScript, integração escrita com o Gemini e uma lista de três vagas simuladas. A implementação ainda não cobre a jornada completa do candidato, e o funcionamento da integração não foi verificado nesta análise.

Minha recomendação é aproveitar essa base para entregar o seguinte percurso:

**Relato → informações complementares → geração → revisão → download do currículo.**

O modelo de dados precisa comportar as informações necessárias ao documento, inclusive contato e mais de uma experiência quando o usuário tiver esse histórico. A saída da IA deve ser validada antes de chegar à interface. O suporte do Gemini a [respostas estruturadas](https://ai.google.dev/gemini-api/docs/structured-output) pode ajudar, acompanhado de validação no próprio sistema.

Eu consideraria o fluxo pronto para demonstração quando fosse possível:

1. Preencher informações e entender o próximo passo em um celular.
2. Saber que a geração está em andamento e receber uma mensagem compreensível se falhar.
3. Corrigir o resultado sem perder o que já foi informado.
4. Baixar um PDF que corresponda ao conteúdo revisado.
5. Concluir a tarefa com pessoas do público escolhido e registrar as dificuldades encontradas.

A interface deve ter textos legíveis, contraste adequado, controles identificados e navegação por teclado. As [orientações do W3C para usuários mais velhos](https://www.w3.org/WAI/older-users/) oferecem uma referência para esse trabalho. A observação com pessoas de diferentes níveis de familiaridade digital deve orientar os ajustes.

Se a demonstração incluir vagas, as oportunidades reais precisam ter fonte, link de candidatura e data de verificação. As vagas fictícias devem ser identificadas como exemplos. A lista atual é fixa e ainda não realiza recomendação por perfil.

Para viabilizar um piloto público, também será necessário limitar chamadas à IA e definir quem mantém o serviço, atende dúvidas e revisa as oportunidades. Essas atividades devem caber na capacidade da equipe.

## 5. Apresentação: qualidade do PPT/PDF e do pitch

A apresentação deve permitir que a banca acompanhe o problema, veja a solução em uso e entenda os resultados disponíveis. Eu organizaria o material em seis partes, ajustando a duração às regras do evento:

| Parte | Conteúdo sugerido |
| --- | --- |
| Problema e público | Quem a equipe pretende atender e qual dificuldade foi observada. Usar relatos ou dados com fonte. |
| Recorte do MVP | A tarefa que o produto ajuda a concluir e por que ela foi priorizada. |
| Demonstração | Mostrar o percurso do relato até a revisão e o currículo para download, conforme o que estiver funcionando. |
| Papel da IA | Explicar o que ela transforma, como os fatos são conferidos e qual foi o consumo medido. |
| Evidências | Apresentar o que foi observado com participantes, incluindo limitações e dificuldades. |
| Continuidade | Mostrar o próximo experimento, como obter oportunidades reais e quem poderia sustentar a operação. |

No PPT/PDF, eu usaria pouco texto, capturas legíveis do protótipo e gráficos apenas quando houver dados medidos. Um resultado esperado deve estar identificado como hipótese ou meta. A versão em PDF precisa fazer sentido mesmo sem a explicação oral.

Para o pitch, cada integrante deve conhecer a narrativa e o tempo disponível. A equipe pode preparar uma gravação de uma execução real do protótipo como apoio, identificada como gravação, caso a demonstração ao vivo não seja possível.

Uma abertura possível, adequada à fase atual, seria:

> “Estamos desenvolvendo o Reconecta 50+ para ajudar profissionais que encontram dificuldade em preparar seu currículo. Nossa proposta é partir do relato da pessoa, usar IA para organizar a experiência e permitir que ela revise o conteúdo antes de baixar o documento. O primeiro piloto vai investigar se esse processo facilita uma candidatura e quanto apoio cada participante precisa.”

Depois que houver resultados, o pitch deve incorporar as evidências obtidas. Contratações, parcerias e depoimentos só devem ser apresentados quando existirem e puderem ser utilizados.

## Prioridade sugerida para a equipe

Relevância social e uso consciente da IA representam, juntos, 50% dos pesos informados. Eu começaria pela definição do público, pelas conversas com participantes e pela fidelidade do currículo. Em paralelo, desenvolveria o fluxo completo e o registro de consumo. A demonstração e os resultados desse trabalho fornecerão o conteúdo da apresentação.

Antes do evento, a equipe deve conseguir responder com evidências: quem utilizou, o que conseguiu concluir, onde precisou de ajuda, o que a IA acrescentou à tarefa e quanto custou entregar esse resultado.

*Documento de orientação de mentoria, elaborado em 19/10/2026 a partir dos critérios informados, da [proposta do Reconecta](../ideias/Reconecta.md), do [backend](../ReconectaBackend/src/server.ts) e do [serviço de geração de currículo](../ReconectaBackend/src/services/geminiService.ts). Complementa a [sugestão inicial de MVP](Sugestao-MVP-Reconecta50.md). Não atribui uma nota ao projeto nem comprova execução, custo ou impacto ainda não medidos.*
