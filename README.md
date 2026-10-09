# GuysMovies

Interface web do GuysMovies, uma rede social de filmes e séries onde cada pessoa
registra o que assistiu, monta a própria watchlist, avalia títulos, acompanha
séries temporada a temporada e marca com quem assistiu cada coisa.

Construída em Next.js com TypeScript e Tailwind CSS. A API que alimenta esta
interface vive em
[guys-movies-backend](https://github.com/AndreFreitasz/guys-movies-backend).

| Ambiente | URL                                      |
| -------- | ---------------------------------------- |
| Produção | https://www.guysmovies.space             |
| API      | https://guys-movies-backend.onrender.com |

## Sumário

- [Stack](#stack)
- [Funcionalidades](#funcionalidades)
- [Rotas da aplicação](#rotas-da-aplicação)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Subindo com Docker](#subindo-com-docker)
- [Rodando sem Docker](#rodando-sem-docker)
- [Stack completa, front e back juntos](#stack-completa-front-e-back-juntos)
- [Scripts disponíveis](#scripts-disponíveis)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Decisões de implementação](#decisões-de-implementação)
- [Deploy](#deploy)
- [Solução de problemas](#solução-de-problemas)
- [Convenções de contribuição](#convenções-de-contribuição)
- [Licença](#licença)

## Stack

| Camada       | Tecnologia                          |
| ------------ | ----------------------------------- |
| Runtime      | Node.js 20                          |
| Framework    | Next.js 15 com Pages Router         |
| Linguagem    | TypeScript 5                        |
| UI           | React 18                            |
| Estilo       | Tailwind CSS 3 e PostCSS            |
| Animação     | Framer Motion                       |
| Formulários  | React Hook Form com Yup             |
| Datas        | date-fns e react-day-picker         |
| Carrosséis   | react-slick                         |
| Notificações | react-toastify                      |
| Ícones       | react-icons                         |
| Container    | Docker multi stage e Docker Compose |

## Funcionalidades

- Home com carrosséis de filmes populares, mais bem avaliados, por gênero e por
  serviço de streaming, renderizados no servidor.
- Página de séries com a mesma organização de descoberta.
- Busca unificada de filmes, séries e pessoas, com resultados em abas.
- Página de detalhe de filme e de série, com elenco, provedores de streaming,
  nota e as ações de assistir e aguardar.
- Séries acompanhadas por temporada, com checklist e tempo total assistido.
- Watchlist com remoção direta e indicação de onde cada título está disponível.
- Página de assistidos com filtros e edição de data, nota e onde foi assistido.
- Perfil público com avatar, capa, bio, favoritos, estatísticas e linha do
  tempo.
- Seguir e deixar de seguir pessoas, com listas de seguidores e seguindo.
- Convites de "assisti com", com contador de pendências no header.
- Cadastro e login em modal, com a sessão em cookie httpOnly emitido pela API.
- Navegação responsiva: header no desktop, menu lateral e barra de abas no
  mobile.

## Rotas da aplicação

| Rota                 | Descrição                         |
| -------------------- | --------------------------------- |
| `/`                  | Home, descoberta de filmes        |
| `/series`            | Descoberta de séries              |
| `/busca`             | Busca de filmes, séries e pessoas |
| `/assistidos`        | O que a pessoa logada já assistiu |
| `/watchlist`         | Watchlist da pessoa logada        |
| `/movie/[id]`        | Detalhe de um filme               |
| `/serie/[id]`        | Detalhe de uma série              |
| `/perfil/[username]` | Perfil público de uma pessoa      |

## Arquitetura

```
Navegador
   |
   v
Next.js (este repositório)
   |                         \
   |  getServerSideProps      \  fetch no cliente
   v                           v
        GuysMovies API (NestJS)
                 |
         PostgreSQL + TMDB
```

As páginas de descoberta usam `getServerSideProps` para o primeiro paint vir
pronto do servidor, com cabeçalho de cache público e `stale-while-revalidate`.
Tudo que depende da sessão passa por hooks que fazem fetch no cliente com
`credentials: 'include'`, para o cookie httpOnly seguir na requisição.

A mesma variável `NEXT_PUBLIC_URL_API` é lida nos dois lados, no servidor e no
navegador. Isso importa na hora de rodar em container, e está detalhado em
[Stack completa, front e back juntos](#stack-completa-front-e-back-juntos).

## Pré-requisitos

Para o caminho com Docker, que é o recomendado:

- [Docker](https://docs.docker.com/get-docker/) 24 ou superior, com o Docker
  Compose v2 embutido.

Para rodar sem Docker, Node.js 20 ou superior e npm 10 ou superior.

Não é preciso banco nem chave de API para ver a interface funcionando: por
padrão o Compose aponta para a API já publicada.

## Variáveis de ambiente

| Variável              | Obrigatória | Descrição                           |
| --------------------- | ----------- | ----------------------------------- |
| `NEXT_PUBLIC_URL_API` | sim         | URL base da API, sem barra no final |

Por ser prefixada com `NEXT_PUBLIC_`, a variável é embutida no bundle no momento
do build. Em imagem de produção ela precisa ser passada como build arg, não só
como variável de runtime. O `Dockerfile` já declara o `ARG` correspondente.

Para rodar fora do Docker, copie o exemplo:

```bash
cp .env.example .env
```

## Subindo com Docker

O `docker-compose.yml` sobe um único serviço, o Next.js em modo de
desenvolvimento com hot reload. A API padrão é a publicada em produção, então
não é preciso levantar o backend para ver a aplicação de pé.

### Passo 1: clone o repositório

```bash
git clone https://github.com/AndreFreitasz/guys-movies-frontend.git
cd guys-movies-frontend
```

### Passo 2: suba o container

```bash
docker compose up --build
```

A primeira execução instala as dependências dentro da imagem e leva alguns
minutos. Nas próximas, o cache do Docker resolve em segundos.

Para deixar rodando em segundo plano:

```bash
docker compose up --build -d
```

### Passo 3: abra a aplicação

http://localhost:3000

A interface já vem conectada em
`https://guys-movies-backend.onrender.com`. Cadastro, login, watchlist e perfil
funcionam contra os dados reais de produção.

> A API roda em plano gratuito e hiberna quando fica ociosa. Se o primeiro
> carregamento vier vazio, espere uns 30 segundos e recarregue.

### Passo 4: apontando para outra API

Crie um `.env` na raiz com o endereço que você quiser e suba de novo:

```bash
echo "NEXT_PUBLIC_URL_API=http://localhost:3005" > .env
docker compose up -d
```

O Compose lê esse `.env` para resolver a variável. Se o backend estiver em
container também, leia a seção
[Stack completa, front e back juntos](#stack-completa-front-e-back-juntos),
porque `localhost` dentro de um container não aponta para a sua máquina.

### Passo 5: pare quando terminar

```bash
docker compose down
```

Para apagar também os volumes de dependências e cache do Next:

```bash
docker compose down -v
```

### Comandos úteis do dia a dia

```bash
docker compose logs -f web             # acompanha os logs do Next
docker compose restart web             # reinicia o container
docker compose build --no-cache web    # rebuild limpo após mudar dependências
docker compose exec web sh             # abre um shell dentro do container
```

O código é montado por bind mount, então editar um arquivo na sua máquina
recarrega a página sozinho. Só é preciso rebuildar quando o `package.json` muda.

### Imagem de produção

O `Dockerfile` tem quatro estágios: `deps`, `dev`, `builder` e `runner`. O
Compose usa o `dev`. Para gerar e rodar a imagem otimizada, com `next build` e
`next start`:

```bash
docker build \
  --target runner \
  --build-arg NEXT_PUBLIC_URL_API=https://guys-movies-backend.onrender.com \
  -t guys-movies-frontend:prod .

docker run --rm -p 3000:3000 guys-movies-frontend:prod
```

O `--build-arg` é obrigatório aqui. A variável é embutida no bundle durante o
build, então passar só `-e` no `docker run` não teria efeito no código que roda
no navegador.

## Rodando sem Docker

```bash
npm install
cp .env.example .env
npm run dev
```

A aplicação sobe em http://localhost:3000. Ajuste o `NEXT_PUBLIC_URL_API` do
`.env` conforme a API que você quer consumir.

Para simular produção na sua máquina:

```bash
npm run build
npm start
```

## Stack completa, front e back juntos

Se você quer os dois repositórios rodando na sua máquina, com banco local, o
caminho mais curto é deixar a API em Docker e o frontend fora dele.

**1. Suba a API seguindo o README do backend:**

```bash
git clone https://github.com/AndreFreitasz/guys-movies-backend.git
cd guys-movies-backend
cp .env.example .env     # preencha TMDB_API_KEY
docker compose up --build -d
```

A API fica em `http://localhost:3005` com o Postgres ao lado.

**2. Rode o frontend na máquina, apontando para ela:**

```bash
cd ../guys-movies-frontend
npm install
echo "NEXT_PUBLIC_URL_API=http://localhost:3005" > .env
npm run dev
```

Abra http://localhost:3000. Essa combinação funciona sem nenhum ajuste extra: o
navegador e o `getServerSideProps` rodam na mesma máquina, as duas pontas ficam
em `localhost` e o cookie de sessão é aceito como same site.

### Por que o frontend em container precisa de cuidado aqui

`NEXT_PUBLIC_URL_API` é usada no navegador e dentro do `getServerSideProps`, que
roda no servidor Next. Com o frontend em container e a API publicada na sua
máquina, `http://localhost:3005` resolveria para o próprio container no lado do
servidor, e a renderização falharia.

Para rodar os dois em Docker, use um host que valha nas duas pontas. No Docker
Desktop, `host.docker.internal` resolve tanto dentro do container quanto na sua
máquina:

```bash
echo "NEXT_PUBLIC_URL_API=http://host.docker.internal:3005" > .env
docker compose up -d
```

E abra a aplicação em **http://host.docker.internal:3000**, não em `localhost`.
Precisa ser o mesmo host nas duas pontas, senão o navegador trata a chamada como
cross site e descarta o cookie de sessão. Esse endereço já está liberado no
`CORS_ORIGINS` padrão do Compose do backend.

## Scripts disponíveis

| Script                | O que faz                                 |
| --------------------- | ----------------------------------------- |
| `npm run dev`         | Servidor de desenvolvimento na porta 3000 |
| `npm run build`       | Build de produção                         |
| `npm start`           | Serve o build de produção                 |
| `npm run services:up` | Sobe o container do Compose em background |
| `npm run lint:check`  | Confere a formatação com o Prettier       |
| `npm run lint:fix`    | Formata com o Prettier                    |

## Estrutura de pastas

```
pages/            rotas do Pages Router, uma pasta ou arquivo por rota
components/
  _ui/            header, footer, modal, formulários, carrossel, barra de abas
  home/           carrosséis e cards da home
  mediaDetails/   bloco compartilhado de detalhe de filme e série
  movie/          detalhe de filme e provedores de streaming
  series/         detalhe de série e checklist de temporadas
  profile/        avatar, capa, favoritos, editor e listas de pessoas
  search/         resultados de busca por tipo
  watched/        listagem e edição do que foi assistido
  watchlist/      listagem da watchlist
hooks/            authContext e um hook por recurso da API
interfaces/       tipos de domínio, espelhando as respostas da API
constants/        catálogo de serviços de streaming
utils/            authFetch e cabeçalhos de cache do SSR
styles/           CSS global e tokens do tema
public/           imagens, ícones e capas de perfil
Dockerfile          deps, dev, builder e runner
docker-compose.yml  Next em modo desenvolvimento com hot reload
```

## Decisões de implementação

- **Pages Router.** O projeto nasceu nele e as páginas de descoberta se
  beneficiam de `getServerSideProps` com cache na borda, sem precisar de
  migração.
- **Sessão em cookie httpOnly.** O token nunca passa pelo `localStorage`, então
  o JavaScript da página não tem acesso a ele. Todo fetch autenticado passa pelo
  `utils/authFetch.ts`, que envia as credenciais.
- **Hook por recurso.** Cada recurso da API tem um hook em `hooks/`, com o
  estado de carregamento e erro no mesmo lugar. Nenhuma página fala com `fetch`
  diretamente para dados de sessão.
- **Tema em tokens do Tailwind.** As cores de marca e de fundo vivem no
  `tailwind.config.ts`, não espalhadas em classes arbitrárias.
- **Cache público no SSR.** `utils/httpCache.ts` aplica `s-maxage` e
  `stale-while-revalidate` nas páginas de catálogo, que são iguais para todo
  mundo.

## Deploy

O frontend roda na [Vercel](https://vercel.com), com deploy automático a cada
commit na `main`. O domínio de produção é `www.guysmovies.space`, e o apex
redireciona para ele.

A `NEXT_PUBLIC_URL_API` é configurada no painel do projeto na Vercel. Como ela é
embutida no bundle em tempo de build, mudar o valor exige um novo deploy, não só
um restart.

Ao trocar o domínio do frontend, também é obrigatório atualizar `CORS_ORIGINS`
no painel do Render, onde a API roda. Sem isso o navegador bloqueia as chamadas
e o login para de funcionar.

## Solução de problemas

**A página carrega mas os carrosséis vêm vazios.** O `NEXT_PUBLIC_URL_API` está
errado ou a API está hibernando. Confira
`curl $NEXT_PUBLIC_URL_API/health` e recarregue depois de uns 30 segundos.

**Erro de CORS no console.** A origem que você está usando não está em
`CORS_ORIGINS` na API. Com o backend local, adicione a origem no `.env` dele e
reinicie o container.

**O login parece dar certo mas a sessão não persiste.** Frontend e API estão em
hosts diferentes, então o navegador descarta o cookie. Use o mesmo host nas duas
pontas, como explicado em
[Stack completa, front e back juntos](#stack-completa-front-e-back-juntos).

**A porta 3000 já está em uso.** Pare o processo que a ocupa ou mude o
mapeamento em `docker-compose.yml`.

**O hot reload não dispara no Windows ou no WSL.** O Compose já define
`WATCHPACK_POLLING=true` para isso. Se mesmo assim não pegar, reinicie o
container com `docker compose restart web`.

**Mudei o `package.json` e o container não vê a dependência nova.** As
dependências vivem em volume nomeado. Rode
`docker compose down -v && docker compose up --build`.

## Convenções de contribuição

- Branch a partir da `main`, no formato `feat/nome`, `fix/nome` ou `chore/nome`.
- Commits no padrão Conventional Commits, com a mensagem em português:
  `feat(ui): usar o favicon.png como icone da guia`.
- Código sem comentários e com todos os identificadores em inglês. Textos
  exibidos ao usuário final continuam em português.
- Rode `npm run lint:fix` e `npm run build` antes de abrir o PR.
- Rota nova precisa ser ligada em todas as superfícies de navegação: header do
  desktop, dropdown da conta, menu mobile, barra de abas e rodapé.

## Licença

MIT. Veja o campo `license` do `package.json`.
