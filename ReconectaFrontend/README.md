# Reconecta 50+ · Frontend

Frontend para pessoas com 50 anos ou mais, construído com React, Vite e TypeScript. Inclui login, cadastro, painel, perfil, currículo, preparação para recursos de IA e acompanhamento de candidaturas, com layout responsivo, ajuste de fonte, leitura por voz e compartilhamento.

## Requisitos e execução

Use Node.js **22.22.2+ na linha 22**, **24.15.0+ na linha 24**, ou **26+**, conforme `engines` do `package.json`. O comando de testes unitários usa `--experimental-strip-types`, disponível a partir do Node 22.6; as versões mínimas deste projeto são maiores porque também precisam atender ao jsdom e ao Vitest instalados.

```sh
cd ReconectaFrontend
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite. As rotas são `/login`, `/cadastro`, `/dashboard`, `/perfil`, `/curriculo`, `/vagas-recomendadas` e `/minhas-vagas`. A logo utiliza o `Link` do React Router, permitindo navegar sem recarregar o documento.

## Verificação

O projeto usa Prettier para manter a mesma formatação em TypeScript, JSX, CSS e documentação. Execute `npm run format` para formatar e `npm run format:check` para conferir sem alterar arquivos. Os comandos atuam apenas neste frontend; arquivos de ambiente e artefatos gerados são excluídos.

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

`typecheck` verifica código, testes TypeScript/JSX, testes JavaScript e configurações. O build também verifica os tipos antes de gerar `dist/`. `test:unit` executa as validações de cadastro com o executor do Node; `test:components` usa Vitest, Testing Library e jsdom. `npm run preview` permite conferir o build localmente.

## Organização e reutilização

Nas vagas com `application: { channel: 'phone', phone, instructions, acceptsWhatsApp: true }`, a candidatura oferece uma mensagem editável com botão **Copiar mensagem**, ao lado no computador e abaixo no celular. Sem integração, o texto é um modelo baseado no nome, na vaga e na apresentação profissional. O endpoint de preparo pode devolver `{ type: 'whatsapp', phone, body, source: 'ai' }`; o telefone precisa coincidir com o contato de inscrição e o canal deve aceitar WhatsApp. As orientações vêm do anúncio. O acompanhamento por WhatsApp, sozinho, não autoriza esse canal para inscrição. A pessoa revisa e envia pelo próprio WhatsApp; não há envio automático.

As páginas compõem a interface e os componentes recebem dados e callbacks tipados. Regras sem dependência de React ficam em funções de `utils`, como `filterJobs`, validações de dados pessoais e validação/normalização do currículo. Os filtros de vaga ficam em `JobFilters`, com opções tipadas e ID único; o texto de orientação fica em `WorkspaceHelp`. Essa separação permite mudar o conteúdo e as regras sem alterar o layout inteiro.

O painel de demonstração fica em `/dashboard`, com navegação para `/perfil`, `/curriculo` e `/minhas-vagas`. Ele pode ser aberto pelo link **Conhecer o painel de demonstração** no login, sem simular autenticação. Se um endpoint de login estiver configurado e responder com sucesso, o frontend também direciona ao painel.

`WorkspaceLayout` reúne cabeçalho, navegação, acessibilidade e rodapé para as páginas do painel. A leitura é interrompida ao navegar, o título do documento é atualizado e o foco vai para o título principal. O cabeçalho e a navegação ficam fora da leitura. O layout adapta os cartões e a navegação para telas pequenas.

`CareerProvider` mantém os rascunhos de perfil e currículo somente em memória, sem persistir dados pessoais ou simular uma sessão. O perfil alimenta a prévia do currículo, que pode ser impressa ou salva em PDF usando a janela de impressão do navegador. Essa primeira versão destaca uma experiência profissional. **Minhas vagas** apresenta um estado vazio e orientações: ainda não há busca, envio de candidatura ou acompanhamento conectado à API.

`AuthProvider` incrementa uma versão de sessão a cada login bem-sucedido e logout. `SessionProviders` recria os estados de perfil, currículo e candidaturas nesse limite, inclusive ao entrar em outra conta sem recarregar. Assim, dados da prévia ou da conta anterior não são reaproveitados. A preferência de fonte fica acima desse limite e é preservada.

Os componentes do painel ficam em `features/dashboard/components`; os tipos e a prévia do currículo ficam em `features/career`. Os testes de dashboard cobrem navegação, foco, tamanho da fonte, rascunhos e ausência de candidaturas fictícias.

- `src/app`: composição da aplicação e rotas.
- `src/pages`: composição das páginas de autenticação e do painel.
- `src/layouts`: estrutura e navegação compartilhadas pelas páginas do painel.
- `src/components`: cabeçalho, rodapé, logo, campos, ajuda e compartilhamento.
- `src/features/auth/components`: layout e formulários de autenticação.
- `src/features/auth/services`: acesso à API de autenticação.
- `src/features/auth/types` e `utils`: contratos de autenticação e validação do cadastro.
- `src/features/auth`: estado de autenticação em memória, provider e hook de acesso.
- `src/features/career`: perfil, currículo, gravação de áudio, prévia e integração da criação com IA.
- `src/features/jobs`: componentes, filtros, validação de respostas e busca de vagas recomendadas.
- `src/features/dashboard`: cartões de navegação da visão geral.
- `src/utils`: validações de dados pessoais compartilhadas entre cadastro e perfil.
- `src/features/accessibility`: leitura por voz e preferência de fonte.
- `src/styles/global.css`: fontes, variáveis de cor e estilos básicos.
- `tests`: testes de validação e componentes.

Cada componente possui CSS Modules ao lado do arquivo `.tsx`. `AuthForm.module.css` contém estilos comuns aos formulários. Login e cadastro compartilham `AuthLayout` e `FormField`.

`LoginForm` recebe `onAuthenticate`, `onSuccess` e ações opcionais de cadastro e recuperação. `RegisterForm` recebe `onRegister` e `onSuccess`. Erros do callback posterior ao sucesso são tratados separadamente dos erros da operação. `ShareButton` aceita título, texto, URL e rótulo personalizados.

`FontScaleProvider` mantém a preferência de fonte acima das rotas: começa em 130% e salva a escolha no armazenamento local, quando disponível. `usePageReader` recebe a referência do conteúdo a narrar; `data-read-skip` exclui trechos e `data-read-order` respeita a posição visual dos filhos. O cabeçalho é ignorado e valores digitados não são narrados.

A coleta dos textos fica em `collectReadableText`, separada do controle da voz. Detalhes recolhidos narram apenas seu resumo; o conteúdo completo é incluído quando aberto. Navegadores sem as APIs necessárias deixam a leitura indisponível, e falhas ao iniciar a voz exibem uma mensagem que permite tentar novamente.

Durante a geração do currículo com IA, os campos manuais ficam bloqueados até a conclusão ou o cancelamento, evitando sobrescrever alterações simultâneas. A exportação em PDF fica disponível após atualizar o currículo com as alterações manuais, para que o documento corresponda à prévia salva.

O destinatário de uma sugestão de e-mail da IA deve corresponder ao e-mail de inscrição declarado em `application`. Respostas com outro destinatário são recusadas e a pessoa pode usar o modelo local com o contato informado na vaga.

## Páginas de erro e recuperação

Endereços desconhecidos mostram uma página 404, sem redirecionamento silencioso para o login. A rota `/` continua direcionando ao login ou ao painel, conforme o estado de autenticação da navegação atual. A 404 e a recuperação de tela incluem ajuste de fonte, leitura por voz, foco no título e ações adequadas ao celular.

`ErrorBoundary` captura falhas de renderização das rotas. A pessoa pode tentar novamente, voltar ao início ou recarregar o aplicativo. A recuperação é reiniciada ao navegar, e os providers de perfil, currículo e autenticação ficam acima dessa proteção para preservar o estado em memória durante uma nova tentativa. Uma segunda proteção em `main.tsx` trata falhas desses providers sem depender deles ou do roteador.

O HTML inicial também contém uma mensagem e um link para reabrir o aplicativo caso o JavaScript não carregue. Recarregar a página perde os rascunhos em memória. Detalhes técnicos das exceções não são exibidos ao usuário; os erros continuam disponíveis no console de desenvolvimento.

Erros de validação, ações indisponíveis e falhas de API continuam tratados pelas próprias telas. Error boundaries não capturam erros de compilação, de importação antes de iniciar o React, nem exceções de eventos ou tarefas assíncronas; essas últimas precisam continuar com tratamento explícito. Uma importação ausente no código deve ser corrigida antes de publicar, usando `npm run build`.

Na hospedagem, configure o retorno de `index.html` para endereços de navegação da SPA, permitindo que o React exiba a 404. Arquivos estáticos ausentes devem continuar retornando erro HTTP. A página 404 da SPA, por si só, não altera o status HTTP do servidor. Isso deve ser configurado no serviço de hospedagem.

## Ambiente

O arquivo **`.env.example` deve ser versionado**: ele documenta as variáveis e não contém credenciais. Copie-o para `.env.local` e configure os valores locais. Arquivos `.env` e `.env.*` são ignorados, com exceção do exemplo.

```dotenv
VITE_AUTH_LOGIN_URL=http://localhost:3000/auth/login
```

Essa URL é apenas um exemplo: ajuste para o endpoint acordado com o backend. Reinicie o Vite após alterar o ambiente. Variáveis com prefixo `VITE_` ficam acessíveis no navegador; não coloque senhas ou chaves privadas nelas.

## Integração com o backend

O `authService` envia `POST` para `VITE_AUTH_LOGIN_URL` com JSON `{ "identifier": "...", "password": "..." }` e **`credentials: 'include'`**. CPF ou telefone são normalizados para dígitos. Uma resposta 2xx representa sucesso; 401, 429 e demais erros recebem mensagens próprias.

Para essa estratégia funcionar, o backend precisa:

- Autorizar explicitamente a origem do frontend no CORS, por exemplo `http://localhost:5173`, e habilitar credenciais (`Access-Control-Allow-Credentials: true`). Não usar `Access-Control-Allow-Origin: *` com credenciais.
- Responder ao preflight `OPTIONS` quando aplicável e permitir o método e o cabeçalho `Content-Type`.
- Criar a sessão e devolver seu cookie por `Set-Cookie` com **`HttpOnly`**. Em produção, usar HTTPS e `Secure`, além de configurar `Path`, duração e `SameSite` conforme a implantação. Se frontend e API forem de sites diferentes, normalmente será necessário `SameSite=None; Secure`; políticas do navegador ainda podem restringir cookies entre sites.
- Validar os dados no servidor e definir proteção CSRF adequada à autenticação por cookie. A validação do frontend não substitui a do servidor.

O JavaScript não lê o cookie HttpOnly; o navegador o envia automaticamente nas requisições permitidas. Nenhuma senha ou token de sessão é salvo no armazenamento local do frontend.

Sem a URL configurada, o login mostra o aviso de demonstração. O cadastro valida nome, telefone, CPF, data de nascimento, endereço e senha, mas **não envia nem salva dados**. Ainda faltam o serviço HTTP de cadastro, a consulta de sessão, proteção de rotas, recuperação de senha e integração dos dados do painel. As rotas do painel estão públicas para demonstração; elas não representam uma sessão autenticada.

## Vagas recomendadas

`/vagas-recomendadas` é uma área distinta de `/minhas-vagas`: apresenta oportunidades para conhecer, enquanto Minhas vagas é destinada ao futuro acompanhamento das candidaturas já enviadas.

A página não exibe uma lista genérica. Ela exige um currículo com apresentação e função preenchidas e permite solicitar uma análise das informações profissionais. Sem integração, informa a indisponibilidade e não apresenta vagas fictícias como compatíveis. Os exemplos de vaga ficam exclusivamente nos testes, em `tests/fixtures/jobs.ts`.

O contrato `JobOpportunity` organiza função, empresa, local, modalidade, jornada, remuneração, benefícios, requisitos, recrutador e acompanhamento. `ApplicationTracking` diferencia e-mail, celular/WhatsApp e plataformas externas (Gupy, Indeed e LinkedIn). O componente `JobCard` apresenta os dados e `JobTrackingDetails` explica o canal de acompanhamento. Links de candidatura são habilitados apenas para dados não demonstrativos com URL HTTPS.

Configure `VITE_JOB_RECOMMENDATIONS_URL` com o endpoint que fará a análise por IA. O frontend envia `POST` JSON `{ "resume": { ... } }` com `credentials: 'include'`, usando somente os campos profissionais do currículo. Nome, telefone, data de nascimento e endereço do perfil não são anexados. O backend precisa comparar currículo e requisitos de vagas reais e ativas, decidir a compatibilidade e devolver uma justificativa baseada nas informações fornecidas.

Resposta esperada:

```json
{
  "recommendations": [
    {
      "isCompatible": true,
      "reason": "A função e as habilidades descritas no currículo atendem aos requisitos desta vaga.",
      "matchedSkills": ["Atendimento", "Organização"],
      "job": {
        "id": "identificador-da-vaga",
        "title": "Recepcionista",
        "company": "Nome real da empresa",
        "location": "Cidade e estado",
        "workMode": "Presencial",
        "schedule": "Jornada informada pela empresa",
        "compensation": "Remuneração informada pela empresa",
        "benefits": [],
        "description": "Descrição do anúncio original",
        "requirements": ["Atendimento"],
        "recruiter": { "name": "Responsável pela seleção", "contact": "Contato real da seleção" },
        "application": { "channel": "external", "url": "https://exemplo.com/inscricao" },
        "tracking": { "channel": "email", "instructions": "Como acompanhar a candidatura" }
      }
    }
  ]
}
```

As variantes de `tracking` seguem o tipo `ApplicationTracking`. O frontend valida o formato, exclui itens com `isCompatible: false` e vagas de demonstração, remove IDs repetidos e apresenta o motivo da recomendação. A qualidade da análise depende do backend; a interface não simula IA com uma busca por palavras. Os filtros locais atuam somente sobre o conjunto compatível recebido.

`application` define onde realizar a inscrição e é independente de `tracking`, que define onde acompanhar as atualizações. Uma inscrição em uma plataforma pode ter acompanhamento por e-mail. As variantes de `application` são `{ channel: 'external', url }`, `{ channel: 'email', email }`, `{ channel: 'phone', phone, instructions }` e `{ channel: 'manual', instructions }`. URLs precisam ser HTTPS e destinatários precisam ser válidos. O campo legado `applicationUrl` ainda é aceito como inscrição externa quando `application` estiver ausente. Sem nenhum desses campos, a interface orienta consultar o anúncio ou o recrutador; o e-mail de acompanhamento não é usado como destinatário de inscrição.

O hook `useJobRecommendations` controla cancelamento e respostas antigas. Resultados são associados ao conteúdo do currículo analisado: alterações exigem nova análise, sem mostrar resultados obsoletos. Há estados de currículo incompleto, análise em andamento, falha, nenhuma vaga compatível e nenhum resultado para os filtros. Candidaturas externas não são consideradas enviadas ao apenas abrir um link, nem têm status sincronizado automaticamente.

## Edição dos dados do perfil

O perfil permite editar nome, telefone, data de nascimento e endereço. As validações de nome, telefone e data de nascimento são compartilhadas com o cadastro em `src/utils/personalDataValidation.ts`. Não há bloqueio por idade mínima; datas ausentes, impossíveis ou futuras continuam inválidas. Os dados continuam apenas em memória nesta demonstração. Data de nascimento e endereço completo não são incluídos automaticamente na impressão do currículo.

Após um login bem-sucedido, `useAccountProfile` carrega o perfil da conta com `GET` para `VITE_PROFILE_URL`, incluindo `credentials: 'include'`. O backend identifica a pessoa pela sessão e deve devolver o contrato abaixo. Não é enviado um identificador de pessoa na URL. A data de nascimento deve estar no formato `YYYY-MM-DD`; senhas não devem ser retornadas.

```json
{
  "profile": {
    "fullName": "Nome completo da pessoa",
    "phone": "85999999999",
    "birthDate": "1986-06-15",
    "address": "Rua, número, bairro, cidade e estado"
  }
}
```

Os campos de Meu perfil são montados após o carregamento e começam preenchidos com esses dados. A pessoa pode editar apenas os campos desejados. Enquanto a consulta ocorre, a tela mostra o carregamento; em caso de erro ou endpoint ausente, oferece uma nova tentativa. O perfil carregado é mantido em memória entre as páginas, sem repetir a consulta nem sobrescrever as edições a cada navegação. Sair cancela a consulta e descarta respostas atrasadas. O painel de demonstração não consulta dados de conta.

Configure `VITE_PROFILE_URL` em `.env.local` quando o endpoint estiver disponível. O carregamento não implementa atualização no servidor: o botão Atualizar meu perfil ainda altera somente a prévia em memória. O serviço de salvamento e a restauração da sessão após recarregar continuam pendentes de integração.

A senha é alterada por um formulário independente (`ChangePasswordForm`), que recebe `onChangePassword({ currentPassword, newPassword })`. A confirmação é validada somente na interface. Nenhuma senha faz parte de `CareerProfile` ou é persistida no navegador. A implementação de demonstração informa que a operação está indisponível, sem simular sucesso; a chamada HTTP depende da futura integração com o backend.

## Candidaturas nas vagas recomendadas

Cada vaga recomendada oferece **Quero me candidatar** e **Não tenho interesse**. A segunda opção oculta a vaga nesta página e oferece a ação de mostrar as vagas ocultadas novamente. Essa preferência fica em memória nesta visita; persistência e aprendizado a partir das preferências dependem de integração com o backend.

`JobApplicationActions` exibe as ações e `useJobApplication` coordena a preparação e a confirmação; `jobApplicationService` contém o acesso HTTP e os contratos discriminados ficam em `features/jobs/types/application.ts`. `JobApplicationProvider` guarda os estados por vaga, com `useSyncExternalStore`, acima das rotas. As ações ficam separadas de `JobCard`, que recebe o conteúdo de ações por propriedade. O fluxo adapta os botões e campos para celular.

### Preparação

Configure `VITE_JOB_APPLICATION_PLAN_URL`. Somente ao clicar em Quero me candidatar, o frontend envia `POST` JSON com `{ jobId, resume, profile: { fullName, phone }, allowAutomatic }`, incluindo credenciais de sessão. `allowAutomatic` é verdadeiro somente para inscrição em plataforma com URL HTTPS válida. Para inscrição por e-mail é sempre falso: a IA apenas sugere uma mensagem para copiar e enviar pela plataforma da pessoa. Receber atualizações por e-mail não impede uma inscrição automática na plataforma. Data de nascimento, endereço e senhas não fazem parte desse pedido. O endpoint deve apenas preparar a candidatura e devolver uma das respostas abaixo, sem enviar a inscrição nessa etapa:

```json
{
  "type": "automatic",
  "planId": "plano-123",
  "summary": "Resumo dos dados e do canal que serão usados no envio."
}
```

```json
{ "type": "external", "url": "https://exemplo.com/inscricao" }
```

```json
{
  "type": "email",
  "to": "selecao@exemplo.com",
  "subject": "Candidatura à vaga",
  "body": "Mensagem baseada no currículo da pessoa.",
  "source": "ai"
}
```

```json
{
  "type": "manual",
  "instructions": "Orientações para continuar pelo contato indicado pela empresa."
}
```

O backend deve decidir se consegue automatizar a candidatura por uma integração disponível e autorizada. Quando não conseguir, deve devolver o endereço de inscrição ou outro canal real. O plano automático precisa estar vinculado à pessoa autenticada, à vaga e à versão do currículo que foi apresentada para conferência; o servidor deve validar os dados e a validade do plano antes de executar o envio.

Sem esse endpoint configurado, o frontend usa o endereço HTTPS ou o contato presente na vaga. Para e-mail, monta um modelo inicial editável com o resumo profissional, nome e telefone, identificado como modelo, sem afirmar que foi gerado por IA. Se nenhum canal utilizável estiver disponível, apresenta as orientações de contato da vaga. Erros ao preparar também oferecem esse caminho alternativo.

### Envio automático

Depois de revisar o resumo, os dados e o currículo, a pessoa escolhe **Confirmar candidatura automática**. Configure `VITE_JOB_APPLICATION_SUBMIT_URL` para receber `POST { jobId, planId }`, com `credentials: include` e o cabeçalho `Idempotency-Key`. O backend deve permitir esse cabeçalho no CORS, executar o plano e devolver:

```json
{ "status": "submitted", "applicationId": "candidatura-123" }
```

Caso a automação não consiga prosseguir, pode devolver `{ "status": "external", "url": "https://exemplo.com/inscricao" }`. A interface só mostra candidatura enviada após receber `submitted` e um protocolo válido. Abrir um site ou preparar um e-mail não registra sucesso. Não há repetição automática do pedido de envio; novas tentativas da mesma ação reutilizam a chave. O servidor deve garantir idempotência, impedir candidaturas duplicadas por pessoa e vaga e retornar o estado existente quando um pedido já tiver sido processado.

Filtrar, ocultar ou sair da página não apaga o plano, as edições do e-mail, o protocolo nem a chave de idempotência. Requisições em andamento continuam no estado da sessão e seus resultados aparecem quando a vaga voltar a ser exibida. Trocar de conta ou sair encerra esse estado e cancela conexões pendentes. Cancelar a conexão não desfaz um envio já iniciado no servidor. O backend deve persistir o andamento e os protocolos para futura consulta em Minhas vagas; esse histórico ainda não está integrado ao frontend. O estado da sessão não substitui esse registro permanente nem sobrevive ao recarregamento.

Planos ainda não enviados são descartados se o currículo, os dados de contato ou o canal de inscrição mudarem, exigindo novo preparo. Depois de uma tentativa cujo envio não foi confirmado, o plano e a chave são preservados e o botão de outro canal fica indisponível até obter uma resposta conclusiva, evitando incentivar uma segunda inscrição enquanto a primeira pode estar em andamento. Um erro 401 ou 429 em uma tentativa posterior não comprova que o primeiro envio falhou e não remove esse bloqueio. Se nenhuma tentativa anterior ficou incerta e o envio não chegou a ser iniciado, como na ausência do endpoint, o canal manual continua disponível. A conferência sempre mostra a versão dos dados usada no preparo.

### E-mail e inscrição externa

A sugestão de e-mail recebida da IA é editável, com assunto e destinatário visíveis e o botão **Copiar mensagem** ao lado do texto (abaixo no celular). O botão copia apenas o corpo revisado da mensagem. A pessoa abre sua própria plataforma, como o Gmail, preenche o destinatário e o assunto, cola a mensagem, anexa o PDF e envia por conta própria. Não há link `mailto:`, abertura automática de aplicativo ou envio de e-mail pela IA. O backend deve respeitar `allowAutomatic: false` e nunca automatizar e-mails. O frontend também converte um plano automático indevido de uma vaga por e-mail em um modelo para copiar, sem chamar o endpoint de envio. URLs externas para inscrições em sites continuam restritas a HTTPS.

## Currículo por voz e IA

Em Meu currículo, `ResumeAssistant` oferece gravação de áudio, reprodução antes do envio e alternativa por texto. `useAudioRecorder` usa `getUserMedia` e `MediaRecorder`, com detecção de suporte, gravação sem limite de duração ou tamanho imposto pelo frontend, descarte, liberação do microfone ao parar/sair da página e revogação das URLs temporárias. Em produção, a captura exige HTTPS e permissão de microfone; localhost pode ser usado no desenvolvimento. Consulte [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) e [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder).

O frontend **não faz transcrição nem chama um provedor de IA diretamente**. Configure `VITE_RESUME_GENERATE_URL` com um endpoint do seu backend. Sem configuração, a interface informa a indisponibilidade sem enviar dados ou inventar um resultado. A chave de IA fica exclusivamente no servidor.

Contrato proposto para integrar com o backend:

```text
POST VITE_RESUME_GENERATE_URL
credentials: include
Content-Type: multipart/form-data (boundary definido pelo navegador)

source: audio | text
audio: arquivo de áudio, quando source=audio
text: relato em texto, quando source=text
```

O pedido envia apenas a gravação ou o relato, sem anexar automaticamente nome, telefone, data de nascimento ou endereço. O servidor precisa validar tamanho/formato, aceitar os formatos negociados pelo navegador (como WebM/Opus, MP4 ou Ogg/Opus), transcrever o áudio quando necessário e organizar o relato com IA. Não deve inventar qualificações, empresas ou datas; informações não fornecidas devem permanecer vazias. Defina no backend a política de tratamento e retenção dos áudios.

Resposta JSON esperada:

```json
{
  "resume": {
    "summary": "Apresentação profissional baseada no relato",
    "role": "Função informada",
    "company": "",
    "period": "",
    "activities": "Atividades descritas pela pessoa",
    "skills": "Organização, atendimento"
  }
}
```

Os seis campos são strings; `summary` e `role` precisam estar preenchidos. O serviço valida a resposta, trata falhas de conexão, 401/413/429, cancelamento e timeout de 60 segundos. Quando a geração termina com sucesso, `ResumeAssistant` chama `onGenerated` e a página atualiza automaticamente os campos e o currículo em `CareerProvider`, liberando seu uso nas recomendações sem confirmação ou atualização manual da prévia. A edição manual é aberta para revisão. Falhas ou solicitações canceladas não substituem o currículo anterior. Esse salvamento é apenas em memória durante a navegação; persistir na conta e recuperar após recarregar dependem de integração com o backend. O modelo atual destaca uma experiência, assim como o editor manual. Para múltiplas experiências, o contrato e o editor deverão evoluir juntos.

O backend ainda precisa implementar esse endpoint, autenticação/permissões, CORS com credenciais e o processamento de IA. Nenhum arquivo do backend é alterado por esse recurso.

## Hospedagem

Publique o conteúdo de `dist/` e configure o servidor de arquivos para retornar `index.html` nas rotas da aplicação. Isso permite abrir ou atualizar diretamente `/cadastro` e `/login`. O frontend não altera a configuração do backend.

O botão **Sair** aparece no cabeçalho somente após um login bem-sucedido, inclusive no celular. O painel de demonstração não exibe essa ação. O estado de autenticação fica em memória nesta navegação; restaurar uma sessão após recarregar depende da futura consulta de sessão ao backend. Configure `VITE_AUTH_LOGOUT_URL` com o endpoint POST de logout. A chamada inclui `credentials: 'include'`: o backend deve invalidar a sessão e expirar o cookie HttpOnly, com CORS permitindo credenciais. Respostas 2xx e 401 encerram a navegação e limpam os rascunhos em memória. Em caso de falha, a interface mantém os dados e permite tentar novamente. As preferências de acessibilidade são preservadas.
