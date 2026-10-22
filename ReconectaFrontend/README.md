# Reconecta 50+ · Frontend

Interface de login e cadastro para pessoas com 50 anos ou mais, construída com React, Vite e TypeScript. Inclui layout responsivo, ajuste de fonte, leitura por voz e compartilhamento.

## Requisitos e execução

Use Node.js **22.22.2+ na linha 22**, **24.15.0+ na linha 24**, ou **26+**, conforme `engines` do `package.json`. O comando de testes unitários usa `--experimental-strip-types`, disponível a partir do Node 22.6; as versões mínimas deste projeto são maiores porque também precisam atender ao jsdom e ao Vitest instalados.

```sh
cd ReconectaFrontend
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite. As rotas são `/login` e `/cadastro`. A logo utiliza o `Link` do React Router, permitindo navegar sem recarregar o documento.

## Verificação

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

`typecheck` verifica código, testes TypeScript/JSX, testes JavaScript e configurações. O build também verifica os tipos antes de gerar `dist/`. `test:unit` executa as validações de cadastro com o executor do Node; `test:components` usa Vitest, Testing Library e jsdom. `npm run preview` permite conferir o build localmente.

## Organização e reutilização

- `src/app`: composição da aplicação e rotas.
- `src/pages`: composição das páginas de login e cadastro.
- `src/components`: cabeçalho, rodapé, logo, campos, ajuda e compartilhamento.
- `src/features/auth/components`: layout e formulários de autenticação.
- `src/features/auth/services`: acesso à API de autenticação.
- `src/features/auth/types` e `utils`: contratos e validação do cadastro.
- `src/features/accessibility`: leitura por voz e preferência de fonte.
- `src/styles/global.css`: fontes, variáveis de cor e estilos básicos.
- `tests`: testes de validação e componentes.

Cada componente possui CSS Modules ao lado do arquivo `.tsx`. `AuthForm.module.css` contém estilos comuns aos formulários. Login e cadastro compartilham `AuthLayout` e `FormField`.

`LoginForm` recebe `onAuthenticate`, `onSuccess` e ações opcionais de cadastro e recuperação. `RegisterForm` recebe `onRegister` e `onSuccess`. Erros do callback posterior ao sucesso são tratados separadamente dos erros da operação. `ShareButton` aceita título, texto, URL e rótulo personalizados.

`FontScaleProvider` mantém a preferência de fonte acima das rotas: começa em 130% e salva a escolha no armazenamento local, quando disponível. `usePageReader` recebe a referência do conteúdo a narrar; `data-read-skip` exclui trechos e `data-read-order` respeita a posição visual dos filhos. O cabeçalho é ignorado e valores digitados não são narrados.

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

Sem a URL configurada, o login mostra o aviso de demonstração. O cadastro valida nome, telefone, CPF, data de nascimento, endereço e senha, mas **não envia nem salva dados**. Ainda faltam o serviço HTTP de cadastro, a consulta de sessão, logout, proteção de rotas, recuperação de senha e o destino após autenticação.

## Publicação

Publique o conteúdo de `dist/` e configure o servidor de arquivos para retornar `index.html` nas rotas da aplicação. Isso permite abrir ou atualizar diretamente `/cadastro` e `/login`. O frontend não altera a configuração do backend.
