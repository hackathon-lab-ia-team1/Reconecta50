# Reconecta 50+: minha sugestão para o MVP

Minha sugestão é começar com uma entrega bem definida: ajudar uma pessoa a contar sua experiência profissional, transformar esse relato em um currículo fiel, revisar o resultado e baixar um documento que possa usar em uma candidatura.

A proposta reúne capacitação digital, criação de currículo e conexão com empresas. Para o primeiro MVP, eu concentraria o desenvolvimento no currículo e validaria, em paralelo, o acesso a oportunidades reais de trabalho.

## O que já existe

O repositório tem uma base inicial de backend em Express e TypeScript, código de integração com o Gemini e três vagas simuladas. Ainda faltam interface, revisão do currículo, exportação e recomendação personalizada de vagas. Também não encontrei nos materiais evidências de entrevistas com usuários ou de empresas parceiras confirmadas.

## O que eu priorizaria

1. **Relato guiado:** perguntas curtas sobre experiências, atividades, conhecimentos e objetivo profissional. Começaria por texto e avaliaria a necessidade de voz com os usuários.
2. **Informações faltantes:** perguntar o que falta para completar o currículo, sem inventar dados.
3. **Revisão:** permitir que a pessoa corrija e confirme o conteúdo antes de finalizar.
4. **Download:** gerar um PDF com contato, experiências e demais informações fornecidas.
5. **Próxima ação:** quando houver oportunidades verificadas, apresentar poucas vagas reais, com requisitos, localização, fonte e link de candidatura. A seleção pode ser manual no início.

Cursos completos, portal para empresas e recomendação sofisticada podem entrar depois do primeiro piloto. Na interface inicial, eu já cuidaria da legibilidade, do contraste e da facilidade para navegar e corrigir informações. Ter mais de 50 anos não significa ter pouca familiaridade com tecnologia.

## Cuidados com a implementação

Antes do uso por candidatos, eu ajustaria três pontos:

- **Fidelidade:** o retorno simulado acrescenta competências e atividades que a pessoa pode não ter informado. O prompt também pede características como estabilidade emocional sem exigir evidência. O currículo deve se apoiar no relato e na confirmação do usuário.
- **Simulação explícita:** hoje, a falta de chave ou uma falha na IA pode retornar conteúdo simulado com indicação de sucesso. Essa condição precisa ficar clara na experiência.
- **Validação:** conferir os dados recebidos e os campos retornados pela IA antes de apresentar o currículo.

## Como eu validaria a ideia

Eu começaria com um piloto qualitativo de 10 a 15 participantes e conversas com 2 ou 3 empregadores. Esses números são uma sugestão para organizar o aprendizado, sem pretensão de representar todo o público 50+.

Observaria quantas pessoas conseguem concluir o currículo, onde precisam de ajuda, quais correções factuais fazem e se conseguem avançar em uma candidatura real. Um currículo melhor, por si só, ainda não comprova recolocação ou redução do etarismo.

Também definiria quem poderia sustentar o serviço e como manter oportunidades verificadas. Como a [Maturi](https://www.maturi.com.br/) já oferece vagas e capacitação para profissionais maduros, eu buscaria validar um diferencial mais específico: facilitar a apresentação da trajetória profissional de quem encontra dificuldade nessa tarefa.

Para o hackathon, minha prioridade seria demonstrar o fluxo completo de relato, revisão e download. Enquanto isso, parte da equipe pode conversar com usuários e empregadores para orientar os próximos passos.

*Sugestão baseada na leitura dos documentos e do código disponíveis em 19/10/2026. A aplicação e a integração com o Gemini não foram executadas nesta análise.*
