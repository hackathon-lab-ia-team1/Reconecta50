# Reconecta 50+ · Frontend

Tela de login baseada na identidade e na proposta inclusiva do protótipo, construída com React, Vite e TypeScript em modo estrito.

## Executar

Requer Node.js 20.19+ ou 22.12+ e npm.

```sh
cd ReconectaFrontend
npm install
npm run dev
```

`npm run build` verifica os tipos e gera `dist/`. `npm run preview` serve a versão de produção. `npm run lint` executa a análise estática. `npm test` roda a validação de cadastro e os testes de componentes com Vitest e Testing Library.

## Organização

As rotas `/login` e `/cadastro` são gerenciadas por React Router em `src/app/App.tsx`. Em hospedagem de produção, configure fallback das rotas para `index.html` para permitir abrir ou atualizar diretamente `/cadastro`.

As duas páginas usam `AuthLayout`, que concentra cabeçalho, leitura, compartilhamento, apresentação e ajuda. `RegisterForm` recebe `onRegister` e `onSuccess`, utiliza o campo compartilhado `FormField` e mantém validação pura em `features/auth/utils/validateRegistration.ts`. Tipos ficam em `features/auth/types/registration.ts`. A implementação de demonstração não envia dados, não cria contas e não persiste senhas. `npm test` verifica os limites de idade e os casos de validação (Node.js 22.18+).

- `src/pages`: composição da página.
- `src/components`: componentes compartilhados.
- `src/features/auth/components`: formulário e estados da autenticação.
- `src/features/auth/services`: comunicação com o backend.
- `src/styles`: estilos globais e layout responsivo.

## Reutilizar os componentes

`AppHeader` recebe `homeHref` e `children` para compor ações; `AppFooter` mantém o rodapé comum. `AccessibilityToolbar` recebe `speaking`, `audioAvailable` e `onRead`. `useFontScale` acessa o estado compartilhado por `FontScaleProvider`, montado acima das rotas em `App`. O tamanho começa em 130% e a preferência é mantida entre páginas e recarregamentos por armazenamento local; quando o armazenamento não está disponível, o estado funciona em memória.

`usePageReader(contentRef)` lê apenas a árvore apontada pela referência, sem depender de classes CSS ou de consultas ao documento. Marque um contêiner com `data-read-order` para seguir a posição visual dos seus filhos (como as colunas que mudam de ordem no celular), e use `data-read-skip` para excluir um trecho. Contêineres com nomes acessíveis continuam tendo seus controles internos lidos; valores digitados não são narrados.

`ShareButton` aceita `title`, `text`, `url` e `label`. Sem propriedades, preserva o convite atual e o endereço da página. Seus estilos funcionam fora da barra de acessibilidade.

`LoginForm` exige `onAuthenticate(credentials): Promise<void>` e oferece `onSuccess`, `onRegister`, `onForgotPassword` e `successMessage`. A página escolhe o serviço; o formulário não importa uma implementação de autenticação. As ações opcionais de cadastro e recuperação mantêm o aviso de demonstração quando não são fornecidas. Os campos usam IDs únicos por instância.

`Brand` aceita `href`. `HelpDisclosure` recebe `label` e `children` e gera um ID único para o conteúdo expansível. `WelcomePanel` contém a apresentação específica da tela de entrada.

Cada componente possui seu arquivo `.module.css` ao lado do `.tsx`. Os formulários compartilham `AuthForm.module.css` e o componente `FormField`, que concentra rótulos, dicas, erros e exibição de senha. `global.css` contém somente fontes, variáveis de cor e estilos básicos do documento e de foco. Não use nomes de classes CSS como contrato de comportamento; use referências e propriedades React.

Nos formulários, falhas de `onAuthenticate` ou `onRegister` permitem nova tentativa. O callback opcional `onSuccess` pode ser síncrono ou assíncrono e é tratado separadamente: uma falha de continuação mantém o sucesso da operação e apresenta uma orientação específica, sem reenviar a solicitação.

## Autenticação

O backend atual não possui endpoint de login. Sem `VITE_AUTH_LOGIN_URL`, o envio mostra um aviso de demonstração e não autentica nem inventa um usuário. A página de cadastro valida os campos localmente, mas não cria contas nem salva dados. Recuperação de senha e painel ainda não estão implementados.

Para integrar, copie `.env.example` para `.env.local` e configure a URL do endpoint. O serviço envia `POST` com JSON `{ identifier, password }`, normalizando CPF/telefone para dígitos. Espera uma resposta 2xx e uma sessão gerenciada pelo servidor com cookie HttpOnly. Configure no servidor HTTPS, cookie seguro, proteção CSRF, CORS com origem explícita e credenciais, validação, limitação de tentativas e mensagens que não revelem a existência de contas. Nenhuma senha ou token é persistido no navegador. Após a integração, implemente o destino do usuário autenticado no lugar da mensagem de sucesso.

O formulário inclui rótulos, autocomplete, validação com foco no primeiro erro, mensagens anunciadas, exibição de senha e estado de envio. A página oferece leitura por voz quando suportada, ajuste de texto, link para pular ao formulário e layout móvel. CPF/telefone são verificados apenas quanto ao formato; a identificação real pertence ao servidor.

As fontes Google são opcionais; há fallback local quando indisponíveis. Os ícones são do Lucide.
