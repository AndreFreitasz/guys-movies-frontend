# Melhorias no frontend — design

**Data:** 2026-08-30
**Repositórios no escopo:** `guys-movies-frontend` e `guys-movies-backend`
**Origem:** sete tarefas levantadas pelo autor do projeto

---

## 1. Contexto

O `guys-movies-frontend` é um Next.js 14 (pages router) com Tailwind e framer-motion, servido por uma API NestJS em `../guys-movies-backend`. Esta leva reúne um bug de navegação, duas mudanças de comportamento no fluxo de "assistido", um redesenho dos banners e um trabalho de performance de animação.

Duas das tarefas não fecham só no frontend: não existe endpoint para atualizar a data de "assistido", e o `rate` cria registros sem vínculo com o filme. O escopo foi confirmado como **front + back**.

## 2. Decisões já tomadas

| Questão | Decisão |
|---|---|
| Escopo dos repositórios | Front + back tratados como um escopo único |
| Séries na aba "assistidos" | **Fora de escopo.** A aba segue só com filmes |
| Formato dos banners no mobile | Pôster full-bleed (2:3); backdrop 16:9 permanece no desktop |
| Ritual de auditoria | `differential-review` seguido de `fp-check` a cada checkpoint |
| `layoutId` no sheet de assistidos | **Removido** em favor de fluidez |
| Estrutura | Extrair lógica compartilhada; **não** fundir as rotas `/movie/[id]` e `/serie/[id]` |

## 3. Arquitetura

As páginas `pages/movie/[id].tsx` (449 linhas) e `pages/serie/[id].tsx` (466 linhas) têm cerca de 230 linhas de lógica com estado praticamente idênticas, diferindo apenas no prefixo da API e no payload. As tarefas 2 e 3 caem exatamente nesse trecho, nas duas.

A apresentação **já** é compartilhada por `components/mediaDetails/*` (473 linhas). As rotas continuam separadas: as URLs são públicas e linkadas em todo o app, e o `getServerSideProps` de cada uma consome endpoints e formatos diferentes.

Dois pontos de extração, ambos exigidos pelas tarefas:

### 3.1 `hooks/useWatchedMedia`

Encapsula `isWatched`, `rating`, `watchedAt`, watchlist e as chamadas à API, parametrizado por `kind: "movie" | "serie"` — que resolve `watchedMovie`/`waitingMovie` contra `watchedSerie`/`waitingSerie`.

```ts
const {
  isWatched, rating, watchedAt,
  isWaiting, watchedLoading, isWaitingLoading,
  toggleWatched, setRating, updateWatchedDate, toggleWaiting,
} = useWatchedMedia({ kind: "serie", idTmdb: serie.id, buildPayload });
```

Permanece em cada página: `getServerSideProps`, os `useMemo` que normalizam campos (`title`/`name`, `release_date`/`first_air_date`, `director`/`created_by`, `number_of_seasons`, badge `+18`) e a composição do JSX. Cada arquivo cai para ~200 linhas.

Ganho para esta leva: auto-assistido e edição de data são escritos e auditados **uma vez**.

### 3.2 `components/_ui/mediaHero`

O Hero sobe de `components/home/hero` para `_ui` e passa a consumir um tipo neutro:

```ts
export interface HeroItem {
  id: number;
  href: string;              // /movie/123 | /serie/123
  title: string;             // title | name
  overview: string;
  voteAverage: number;
  backdropPath: string | null;
  posterPath: string | null;
  date: string | null;       // já formatada dd/MM/yyyy nos dois serviços
  badge: string;
}
```

O componente não sabe distinguir filme de série. É isso que torna a tarefa 5 barata.

---

## 4. Tarefas

### 4.1 Tela azul intermitente

**Diagnóstico antes da correção.** Dois suspeitos, ambos verificáveis:

- **H1 — `pages/_app.tsx:88`.** `AnimatePresence mode="wait"` com `key={router.asPath}`. Com `mode="wait"`, a entrada da página nova só dispara após a saída da anterior terminar. Uma navegação iniciada antes de a saída completar pode deixar a página nova presa em `opacity: 0`: o conteúdo está no DOM, sem erro e sem falha de rede, mas invisível — sobra o `bg-defaultBackground`. Compatível com todos os sintomas relatados (intermitente, ligado à navegação, console limpo).
- **H2 — `pages/index.tsx:157`.** `!initialProviderData.length ? <LoadingSpinner />`, sem timeout e sem saída. Se `/movies/popularByProviders` responder `200` com `[]` — a `TtlCache` do backend serve lista vazia quando o TMDB expira — `error` é `null` e a home fica em spinner permanente.

**Verificação:** navegação rápida e repetida entre `/`, `/series` e `/assistidos`, inspecionando o `motion.div` de página. Um elemento com `style="opacity: 0"` e conteúdo dentro prova H1; o spinner prova H2. Nenhuma correção é escrita antes disso.

**Correção prevista para H1:** manter o fade de entrada, remover a animação de saída e o `mode="wait"`. O estado final passa a ser sempre `opacity: 1`, e uma transição interrompida deixa de ter como esconder a página.

**Correção para H2:** catálogo vazio vira estado de erro explícito com retry, não spinner infinito.

### 4.2 Marcar como assistido ao dar nota

**O caminho óbvio é perigoso e foi descartado.** Chamar `POST /watchedMovie` quando `!isWatched` não serve: esse endpoint é *toggle* — `markAsWatched` deleta o registro se ele já existir. Com qualquer dessincronia entre o estado do front e o banco (aba antiga, request perdido, segundo dispositivo), dar uma nota apagaria em silêncio o registro e a nota anterior do usuário. Um efeito colateral automático não pode rodar sobre um endpoint destrutivo.

**Caminho adotado: o `rate`,** que é idempotente e já cria o registro com `watchedAt: null` quando não existe. Seu único defeito é não vincular `idMovie`, o que faz o item aparecer em "assistidos" sem título e sem pôster.

- `RateMovieDto` ganha `createMovieDto` opcional (`CreatedMovieDto`) e `RateSerieDto` ganha `createSerieDto` opcional (`CreatedSerieDto`). O DTO de filme já valida tamanho e prende `posterPath` à CDN da TMDB; o de série deve receber as mesmas restrições se ainda não as tiver.
- `rateMovie` / `rateSerie` garantem o filme/série na base e preenchem `idMovie` / `serie` ao criar.
- A resposta passa a ser `{ message: string, created: boolean }`. Com `created: true`, o front vira `isWatched` e troca o toast de aviso por confirmação.
- `handleRating` deixa de bloquear com "Você precisa marcar o filme como assistido".

**Dívida existente:** registros já criados pelo `rateMovie` antigo estão sem `idMovie` na base. Uma migration TypeORM os reconcilia pelo `idTmdb`.

### 4.3 Editar a data

Dois endpoints novos, simétricos:

```
PATCH /watchedMovie/watchedAt   { idTmdb: number, watchedAt: string | null }
PATCH /watchedSerie/watchedAt   { idTmdb: number, watchedAt: string | null }
```

`watchedAt: null` é valor de primeira classe: limpa a data e devolve o item a "assistido sem data", simétrico com o que 4.2 cria. A coluna já é `nullable: true`.

Três regras, sendo a primeira o ponto mais sensível de toda a leva:

1. O `WHERE` inclui `idUser` vindo de `@CurrentUser('id')`, **nunca** do body. Sem isso, qualquer usuário autenticado edita o registro de qualquer outro pelo `idTmdb` (IDOR).
2. `@IsOptional() @IsDateString()` e rejeição de data futura.
3. Sem registro, `404`. O endpoint atualiza; criar é responsabilidade de 4.2.

Resposta: o item atualizado, no mesmo formato de `WatchedMovieListItemDto` — assim o front substitui o item na lista sem refetch.

No front, `WatchedDateForm` substitui `BodyModalForm` com três modos — criar, editar e limpar — e entra em três pontos:

- **`WatchedDetailSheet`**: a linha "Você assistiu em" ganha ação de editar, com atualização otimista e refetch em caso de falha.
- **`movie/[id]` e `serie/[id]`**: `MediaExperiencePanel` passa a exibir a data atual quando assistido, com "Editar" ao lado. Hoje não exibe data alguma.

Toda a conversa com a API passa por `useWatchedMedia`.

### 4.4 Banners: enquadramento e swipe

**Enquadramento.** A causa não é um `object-position` errado: é pedir que uma imagem 16:9 preencha um container de `78vh`, que no celular é quase 1:2. Qualquer `object-position` seria um palpite sobre onde está o assunto, e erraria em boa parte dos títulos.

A correção troca a **fonte**, não o recorte:

```html
<picture>
  <source media="(min-width: 768px)" srcset="…/w1280{backdropPath}" />
  <img src="…/w780{posterPath}" fetchpriority="high" />
</picture>
```

No celular entra o pôster, 2:3 e desenhado para ser vertical — enquadramento correto por construção. No desktop segue o backdrop. O navegador baixa só a imagem que vai usar, e o pôster `w780` é mais leve que o backdrop `w1280` — essa imagem é o elemento de LCP da página. Título sem pôster cai no backdrop com `object-position: 50% 30%`. O filtro de `slides`, hoje preso a `backdrop_path`, passa a aceitar qualquer uma das duas.

**Swipe: `scroll-snap` nativo.** A trilha vira `overflow-x: auto` com `scroll-snap-type: x mandatory` e `scroll-snap-align: center` nos slides. O gesto roda no compositor, com momentum e rubber-banding nativos do iOS.

`drag="x"` do framer-motion foi descartado: exige `touch-action: none`, que passa a competir com o scroll vertical da página — é o bug clássico do carrossel full-screen que engole o gesto para baixo.

O índice ativo vem de um `IntersectionObserver` nos slides, não de um listener de `scroll` (que dispararia dezenas de vezes por gesto). A rotação automática vira `scrollTo({ behavior: "smooth" })`. O `isPaused`, hoje só ligado a `mouseenter`, passa a reagir também a `pointerdown`.

**Custo de animação.** O `scale: 1.08 → 1` com `duration: 9` mantém uma camada promovida em tela cheia por nove segundos, e o `.aurora` anima `filter: blur(20px)` em loop infinito — os dois concorrem com o gesto no celular. O Ken Burns fica restrito ao desktop. `prefers-reduced-motion` já está coberto pelo `MotionConfig reducedMotion="user"`. Primeiro slide com `fetchpriority="high"`, demais preguiçosos.

### 4.5 Banner na aba séries

`pages/series.tsx` ganha um fetch paralelo a `/series/popular` — endpoint que já existe e já devolve `backdrop_path`, `poster_path` e `name`. **Nenhuma mudança de backend.**

Ajuste de layout: hoje o `<main>` de séries é o próprio container `max-w-[1600px]` com `pt-8`. O Hero precisa ficar full-bleed fora dele, com o mesmo `-mt-[4.25rem]` que a home usa para passar sob o header transparente. O cabeçalho "Séries em alta agora" desce para dentro do container, abaixo do banner.

### 4.6 Fluidez dos modais

Quatro causas identificadas, três da mesma família:

**Animar elementos que carregam `backdrop-filter`.** O painel do `Modal` usa `glass-strong` (`blur(28px) saturate(180%)`) e anima `y` e `scale` nele. Cada quadro muda a região borrada e força o recálculo de um blur de 28px em tela cheia a 60fps. O overlay repete o padrão com `backdrop-blur-md` animando `opacity`. Causa principal.

**Curva com cauda morta.** `duration: 0.45` com `cubic-bezier(0.32, 0.72, 0, 1)` percorre quase todo o trajeto no início e arrasta os últimos ~40% num movimento imperceptível — lido como "travou no fim".

**Scroll do body restaurado cedo demais.** Em `modal/index.tsx:30-34` o cleanup restaura `document.body.style.overflow` quando `isOpen` vira `false`, mas a saída ainda roda por 450ms: a página atrás volta a rolar durante o fechamento. Pior, restaura para `""` em vez do valor anterior, quebrando modais sobrepostos. O `watchedDetailSheet` já faz isso corretamente, salvando `previousOverflow`.

**`layoutId` sobre grade grande.** No `watchedDetailSheet` o pôster voa do card para o sheet via `layoutId`. Animação de layout é medida e escrita pela thread principal a cada quadro, aqui sobre um `motion.div layout` com até 500 cards e três camadas de `backdrop-blur` empilhadas. Trecho mais caro do app.

**Correções:**

- Separar borrão de movimento: o wrapper animado carrega só `transform`/`opacity`, e o vidro vira filho estático — o blur é rasterizado uma vez.
- Overlay borrado estático, com fade apenas de uma camada sólida.
- Mola (`stiffness: 420, damping: 38`) no lugar do tween, e **saída mais curta que a entrada** (~0.2s): fechar deve parecer instantâneo.
- `overflow` do body restaurado em `onExitComplete`, preservando o valor anterior.
- `drag="y"` restrito ao mobile.
- **`layoutId` removido** do sheet, substituído por scale+fade. É uma mudança visível — o pôster deixa de voar do card para o sheet — escolhida deliberadamente em favor da fluidez.

---

## 5. Testes

**Backend.** Jest e supertest já estão instalados; existe apenas o `app.e2e-spec.ts` de scaffold. Teste escrito antes do código nos dois pontos onde uma regressão é invisível e cara:

- o `PATCH` escopado por usuário — um teste que prova que o usuário A **não** consegue editar o registro do usuário B;
- o `rate` criando registro corretamente vinculado.

Não é cobertura por cobertura: é onde o risco está.

**Frontend.** Não existe harness de teste. Instalar jest e testing-library é um projeto próprio, com decisões que cabem ao autor, e não entra como efeito colateral desta leva. A verificação do front é feita no navegador a cada checkpoint.

Consequência assumida explicitamente: o `differential-review` apontará código de front modificado sem teste. Isso é registrado como aceito conscientemente, não silenciado. Criar o harness de teste do frontend seria uma tarefa 8 e exigiria reclassificar o escopo.

**Backfill.** A reconciliação dos registros órfãos é uma migration TypeORM, não um script avulso — o schema já é gerenciado por migrations.

---

## 6. Auditoria de segurança

Todo checkpoint fecha com a mesma sequência:

1. Build e lint passando nos dois repositórios.
2. `differential-review` sobre o diff daquele checkpoint.
3. Cada achado passa por `fp-check` → veredito TRUE ou FALSE POSITIVE com evidência.
4. TRUE POSITIVE é corrigido antes de o checkpoint fechar. FALSE POSITIVE fica registrado no README com o motivo da dispensa, de modo que o julgamento seja auditável e não só o resultado.

O backend já roda `ValidationPipe` com `whitelist` e `forbidNonWhitelisted`, então DTOs novos nascem protegidos contra campos não declarados.

Concentração de risco:

| Checkpoint | Risco principal |
|---|---|
| CP4 · `PATCH watchedAt` | **IDOR.** O `WHERE` tem de vir de `@CurrentUser('id')`, nunca do body. Maior superfície nova da leva |
| CP3 · `rate` + payload | Texto do usuário chegando ao banco. O DTO novo precisa espelhar `@ValidateNested()` com `@Type(() => CreatedMovieDto)` — sem os dois, o class-validator pula a validação aninhada em silêncio |
| CP5 / CP6 · banners | `posterPath` e `backdropPath` interpolados em URL de imagem devem continuar presos à CDN da TMDB |
| CP1 / CP7 | Sem superfície de segurança; risco é de regressão visual e de estado |

---

## 7. Checkpoints

| # | Checkpoint | Escopo | Depende de |
|---|---|---|---|
| **CP1** | Tela azul | Diagnóstico confirmado + `_app.tsx`, `index.tsx` | — |
| **CP2** | `useWatchedMedia` | Refactor puro, **zero mudança de comportamento** | — |
| **CP3** | Auto-assistido ao dar nota | Front + back + migration de backfill | CP2 |
| **CP4** | Editar data | `PATCH` nos dois recursos + `WatchedDateForm` + 3 pontos de entrada | CP2 |
| **CP5** | `MediaHero` | Extração + pôster no mobile + swipe (home) | — |
| **CP6** | Banner em séries | Segundo fetch + ajuste de layout | CP5 |
| **CP7** | Fluidez dos modais | `Modal` + `watchedDetailSheet` | — |

CP1 vem primeiro: é o incômodo real e não depende de nada. CP2 é refactor isolado justamente para que sua auditoria seja trivial — se o diff mudar comportamento, ele falhou. CP5 e CP7 são independentes e podem ser reordenados.

CP4 não depende tecnicamente de CP3, mas vem depois dele por preferência: CP3 é o que passa a criar registros sem data, e é justamente esse estado que a edição de CP4 existe para resolver. Testar CP4 antes de CP3 exigiria fabricar o estado à mão no banco.

---

## 8. Fora de escopo

- Séries na aba "assistidos" (exigiria `/watchedSerie/list`, filtro por tipo e estatísticas unificadas).
- Fundir `/movie/[id]` e `/serie/[id]` numa rota única — implicaria migração de rotas e redirects.
- Harness de teste no frontend.
- Refatoração não exigida pelas sete tarefas.
