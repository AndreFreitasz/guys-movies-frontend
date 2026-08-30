# Melhorias no frontend — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir a tela azul intermitente, tornar `rate` capaz de marcar como assistido, permitir editar a data de assistido, redesenhar os banners com pôster no mobile e swipe nativo, levar o banner para a aba séries e tirar o custo de animação dos modais.

**Architecture:** A lógica de estado duplicada entre `pages/movie/[id].tsx` e `pages/serie/[id].tsx` é extraída para um hook único `hooks/useWatchedMedia`, parametrizado por `kind`. O Hero da home sobe para `components/_ui/mediaHero` com um tipo neutro `HeroItem`, o que permite reusá-lo em séries sem tocar no backend. No backend, `rate` passa a vincular o registro à mídia e nascem dois endpoints `PATCH .../watchedAt` escopados pelo usuário autenticado.

**Tech Stack:** Next.js 14 (pages router), React 18, Tailwind, framer-motion 11, NestJS 10, TypeORM 0.3, class-validator, Jest + ts-jest.

**Spec:** `guys-movies-frontend/docs/superpowers/specs/2026-08-30-frontend-melhorias-design.md`

## Global Constraints

- **Sem comentários no código.** Nenhum `//`, `/* */` ou docstring em arquivo de código, nos dois repositórios. Se um trecho precisa de explicação, o nome tem de carregá-la.
- **Identificadores em inglês.** Variáveis, funções, tipos, arquivos e componentes. Texto voltado ao usuário (labels, toasts, mensagens de erro da API) continua em português.
- **Dois repositórios git independentes:** `E:\projects\guys-movies\guys-movies-frontend` e `E:\projects\guys-movies\guys-movies-backend`. Cada commit vive no repo do arquivo alterado. Nunca rodar `git` na pasta raiz — ela não é um repo.
- **Séries na aba "assistidos": fora de escopo.** A aba `/assistidos` segue só com filmes.
- **Harness de teste no frontend: fora de escopo.** Verificação de front é feita no navegador. O `differential-review` vai apontar front modificado sem teste; isso é aceito conscientemente e registrado, não silenciado.
- **`ValidationPipe` já roda com `whitelist: true` e `forbidNonWhitelisted: true`** (`src/main.ts:32-39`). DTO novo nasce protegido contra campo não declarado, mas validação aninhada exige `@ValidateNested()` **e** `@Type(() => Dto)` juntos — sem os dois o class-validator pula a validação em silêncio.
- **`posterPath` e `backdropPath` interpolados em URL de imagem continuam presos à CDN da TMDB** (`@Matches(/^(https:\/\/image\.tmdb\.org\/|\/)/)`).
- **Ritual de auditoria por checkpoint:** build + lint nos dois repos → `differential-review` sobre o diff → cada achado por `fp-check` → TRUE POSITIVE corrigido antes de fechar, FALSE POSITIVE registrado em `docs/superpowers/audits/CP<N>.md` com o motivo da dispensa.
- **Comandos de verificação:**
  - frontend: `npm run build` e `npm run lint:check` em `guys-movies-frontend`
  - backend: `npm run build`, `npm test` e `npm run lint:check` em `guys-movies-backend`

---

## Estrutura de arquivos

### Criar

| Arquivo | Responsabilidade |
|---|---|
| `guys-movies-frontend/hooks/useWatchedMedia.ts` | Todo o estado e toda a conversa com a API de assistido / watchlist / nota / data, para filme e série |
| `guys-movies-frontend/components/_ui/mediaHero/index.tsx` | Carrossel de banner neutro (`HeroItem`), com pôster no mobile e swipe por `scroll-snap` |
| `guys-movies-frontend/components/_ui/catalogErrorState/index.tsx` | Estado de erro de catálogo com botão de retry, usado por `index.tsx` e `series.tsx` |
| `guys-movies-frontend/components/watched/watchedDateForm.tsx` | Formulário de data em três modos: criar, editar e limpar |
| `guys-movies-frontend/docs/superpowers/audits/CP1.md` … `CP7.md` | Registro por checkpoint dos achados do `differential-review` e do veredito do `fp-check` |
| `guys-movies-backend/src/movie/dto/update-watched-at.dto.ts` | Body do `PATCH /watchedMovie/watchedAt` |
| `guys-movies-backend/src/serie/dto/update-watched-at-serie.dto.ts` | Body do `PATCH /watchedSerie/watchedAt` |
| `guys-movies-backend/src/serie/dto/watched-serie-list.dto.ts` | Formato de item de série assistida, simétrico ao de filme |
| `guys-movies-backend/src/movie/watched-movie/watched-movie.service.spec.ts` | Prova o escopo por usuário do `PATCH` e o vínculo criado pelo `rate` |
| `guys-movies-backend/src/serie/watched-serie/watched-serie.service.spec.ts` | O mesmo, para série |
| `guys-movies-backend/src/migrations/1790000000000-BackfillWatchedMediaLinks.ts` | Reconcilia registros órfãos criados pelo `rate` antigo |

### Modificar

| Arquivo | Mudança |
|---|---|
| `guys-movies-frontend/pages/_app.tsx` | Remover `mode="wait"` e a animação de saída da transição de página |
| `guys-movies-frontend/pages/index.tsx` | Catálogo vazio vira erro com retry; passar a usar `MediaHero` |
| `guys-movies-frontend/pages/series.tsx` | Segundo fetch para `/series/popular`, `MediaHero` full-bleed, cabeçalho para dentro do container |
| `guys-movies-frontend/pages/movie/[id].tsx` | Consumir `useWatchedMedia`; data atual e "Editar" no painel |
| `guys-movies-frontend/pages/serie/[id].tsx` | O mesmo |
| `guys-movies-frontend/components/mediaDetails/experiencePanel.tsx` | Exibir a data de assistido com ação de editar |
| `guys-movies-frontend/components/watched/watchedDetailSheet.tsx` | Remover `layoutId`, separar borrão de movimento, editar data |
| `guys-movies-frontend/components/watched/watchedTile.tsx` | Remover os `layoutId` que davam par ao sheet |
| `guys-movies-frontend/components/_ui/modal/index.tsx` | Vidro estático, mola, saída curta, `overflow` restaurado em `onExitComplete` |
| `guys-movies-frontend/pages/assistidos.tsx` | Substituir o item na lista após editar a data |
| `guys-movies-backend/src/movie/dto/rate-movie.dto.ts` | Ganha `createMovieDto?: CreatedMovieDto` |
| `guys-movies-backend/src/serie/dto/rate-serie.dto.ts` | Ganha `createSerieDto?: CreatedSerieDto` |
| `guys-movies-backend/src/movie/watched-movie/{controller,service}.ts` | `rate` vincula e devolve `created`; novo `PATCH watchedAt`; `isWatched` devolve `watchedAt` |
| `guys-movies-backend/src/serie/watched-serie/{controller,service}.ts` | O mesmo, para série |

### Remover

- `guys-movies-frontend/components/home/hero/index.tsx` — substituído por `components/_ui/mediaHero` (Task 5)
- `guys-movies-frontend/components/movie/bodyModalForm/index.tsx` — substituído por `components/watched/watchedDateForm.tsx` (Task 4)

---

## Task 1: Tela azul intermitente (CP1)

**Files:**
- Diagnóstico: `guys-movies-frontend/pages/_app.tsx:93-103`, `guys-movies-frontend/pages/index.tsx:157-159`
- Create: `guys-movies-frontend/components/_ui/catalogErrorState/index.tsx`
- Modify: `guys-movies-frontend/pages/_app.tsx`, `guys-movies-frontend/pages/index.tsx`
- Create: `guys-movies-frontend/docs/superpowers/audits/CP1.md`

**Interfaces:**
- Consumes: nada.
- Produces: `CatalogErrorState` — `({ title, message, onRetry }: { title: string; message: string; onRetry: () => void }) => JSX.Element`, default export de `components/_ui/catalogErrorState`. Reusado pela Task 6 em `series.tsx`.

**Nenhuma correção é escrita antes do diagnóstico.** As duas hipóteses são verificáveis em minutos, e a correção de uma não é a da outra.

- [ ] **Step 1: Subir o app e reproduzir**

```bash
cd /e/projects/guys-movies/guys-movies-frontend && npm run dev
```

Com o app em `http://localhost:3000`, navegar rápido e repetidamente entre `/`, `/series` e `/assistidos` — clicar no próximo link antes de a página anterior terminar de aparecer. Repetir cerca de 15 vezes. Parar assim que a tela ficar azul (só `bg-defaultBackground`, sem conteúdo).

- [ ] **Step 2: Distinguir H1 de H2 no DevTools**

Com a tela azul na frente, no inspetor de elementos:

- **Prova de H1 (`AnimatePresence mode="wait"`):** existe um `<div style="opacity: 0">` filho direto do `div.min-h-screen`, e **com conteúdo dentro** (header, main, footer no DOM). A página carregou e está invisível.
- **Prova de H2 (spinner infinito):** a página mostra o `LoadingSpinner` de `index.tsx:158`, e a aba Network traz `GET /movies/popularByProviders` com status `200` e corpo `[]`.

Registrar qual das duas ocorreu em `docs/superpowers/audits/CP1.md`. As duas podem ocorrer — nesse caso os dois fixes entram.

- [ ] **Step 3: Corrigir H1 em `pages/_app.tsx`**

O estado final passa a ser sempre `opacity: 1`, e uma transição interrompida deixa de ter como esconder a página. Substituir o bloco das linhas 93-103 por:

```tsx
          <AnimatePresence initial={false}>
            <motion.div
              key={router.asPath}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              <Component {...pageProps} />
            </motion.div>
          </AnimatePresence>
```

Mudou: `mode="wait"` saiu e `exit={{ opacity: 0 }}` saiu. O `initial={false}` permanece — ele evita o fade no primeiro render.

- [ ] **Step 4: Verificar que H1 sumiu**

Repetir o Step 1, cerca de 30 navegações rápidas. Esperado: nenhuma tela azul; a página nova sempre aparece. Se ainda aparecer, **parar** e voltar ao Step 2 — a hipótese estava errada e o diagnóstico recomeça.

- [ ] **Step 5: Criar `CatalogErrorState`**

Create `guys-movies-frontend/components/_ui/catalogErrorState/index.tsx`:

```tsx
import React from "react";

interface CatalogErrorStateProps {
  title: string;
  message: string;
  onRetry: () => void;
}

const CatalogErrorState: React.FC<CatalogErrorStateProps> = ({
  title,
  message,
  onRetry,
}) => (
  <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-4 text-center">
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-2xl">
      ⚠️
    </span>
    <h1 className="mt-5 text-2xl font-black text-white">{title}</h1>
    <p className="mt-3 text-sm leading-relaxed text-white/45">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="mt-7 rounded-2xl px-6 py-3 text-sm font-bold tracking-tight bg-white text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.5)] active:translate-y-0 active:scale-[0.96]"
    >
      Tentar de novo
    </button>
  </div>
);

export default CatalogErrorState;
```

- [ ] **Step 6: Corrigir H2 em `pages/index.tsx`**

Catálogo vazio deixa de ser spinner e vira erro com retry.

Trocar o import `import LoadingSpinner from "../components/_ui/loadingSpinner";` por:

```tsx
import { useRouter } from "next/router";
import CatalogErrorState from "../components/_ui/catalogErrorState";
```

Dentro do componente `Home`, logo depois do `seenIdsRef`:

```tsx
  const router = useRouter();
  const retry = useCallback(() => router.replace(router.asPath), [router]);
  const hasCatalog = initialProviderData.length > 0;
```

Substituir o bloco `if (error) { ... }` (linhas 121-140) por:

```tsx
  if (error || !hasCatalog) {
    return (
      <>
        <Head>
          <title>GuysMovies - Erro</title>
        </Head>
        <Header />
        <CatalogErrorState
          title="Não conseguimos carregar o catálogo"
          message={
            error ??
            "O catálogo voltou vazio desta vez. Tente de novo em alguns instantes."
          }
          onRetry={retry}
        />
        <Footer />
      </>
    );
  }
```

E trocar o ternário `{!initialProviderData.length ? (<LoadingSpinner />) : (<main …>…</main>)}` (linhas 157-262) pelo `<main>` direto, sem o ternário e sem o `LoadingSpinner`.

- [ ] **Step 7: Verificar H2**

Com o backend parado (`docker compose stop backend` na raiz) ou com `TMDB_API_KEY` inválido, abrir `http://localhost:3000`. Esperado: card de erro com "Tentar de novo", nunca spinner permanente. Com o backend de volta no ar, clicar em "Tentar de novo" deve carregar a home.

- [ ] **Step 8: Build e lint**

```bash
cd /e/projects/guys-movies/guys-movies-frontend && npm run build && npm run lint:check
```
Esperado: build sem erro, prettier sem diferença.

- [ ] **Step 9: Auditoria do checkpoint**

`differential-review` sobre `git -C /e/projects/guys-movies/guys-movies-frontend diff`. Cada achado passa por `fp-check`. TRUE POSITIVE é corrigido agora; FALSE POSITIVE vai para `docs/superpowers/audits/CP1.md` com o motivo. Achado esperado e aceito: front modificado sem teste automatizado.

- [ ] **Step 10: Commit**

```bash
cd /e/projects/guys-movies/guys-movies-frontend
git add pages/_app.tsx pages/index.tsx components/_ui/catalogErrorState/index.tsx docs/superpowers/audits/CP1.md
git commit -m "fix: elimina a tela azul intermitente na navegacao"
```

---

## Task 2: `useWatchedMedia` (CP2)

**Files:**
- Create: `guys-movies-frontend/hooks/useWatchedMedia.ts`
- Modify: `guys-movies-frontend/pages/movie/[id].tsx`, `guys-movies-frontend/pages/serie/[id].tsx`
- Create: `guys-movies-frontend/docs/superpowers/audits/CP2.md`

**Interfaces:**
- Consumes: `authFetch` de `utils/authFetch`, `useAuth` de `hooks/authContext`.
- Produces:

```ts
export type WatchedMediaKind = "movie" | "serie";

export interface WatchedMediaLabels {
  authRequired: string;
  watchedSuccess: string;
  watchedRemoved?: string;
  watchedError: string;
  missingDate: string;
  waitingAdded?: string;
  waitingRemoved?: string;
  waitingError: string;
  ratingBlocked: string;
  ratingError: string;
}

export interface UseWatchedMediaOptions {
  kind: WatchedMediaKind;
  idTmdb: number;
  buildPayload: () => unknown;
  labels: WatchedMediaLabels;
}

export interface UseWatchedMediaResult {
  isWatched: boolean;
  rating: number;
  isWaiting: boolean;
  watchedLoading: boolean;
  isWaitingLoading: boolean;
  requireUser: () => boolean;
  toggleWatched: (watchedAtIso: string) => Promise<void>;
  setRating: (newRating: number) => Promise<void>;
  toggleWaiting: () => Promise<void>;
}
```

As Tasks 3 e 4 estendem esse contrato: a Task 3 remove `ratingBlocked` e acrescenta `ratingCreated`; a Task 4 acrescenta `watchedAt`, `updateWatchedDate`, `dateUpdated` e `dateError`.

**Este é um refactor puro: zero mudança de comportamento.** Se o diff mudar comportamento, o checkpoint falhou. Por isso os toasts entram como `labels` opcionais — hoje a página de filme não emite toast ao desmarcar nem ao mexer na watchlist, e a de série emite. Label ausente significa toast ausente. Fechar essa divergência **não** é escopo desta task.

- [ ] **Step 1: Criar o hook**

Create `guys-movies-frontend/hooks/useWatchedMedia.ts`:

```ts
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authFetch } from "../utils/authFetch";
import { useAuth } from "./authContext";

export type WatchedMediaKind = "movie" | "serie";

export interface WatchedMediaLabels {
  authRequired: string;
  watchedSuccess: string;
  watchedRemoved?: string;
  watchedError: string;
  missingDate: string;
  waitingAdded?: string;
  waitingRemoved?: string;
  waitingError: string;
  ratingBlocked: string;
  ratingError: string;
}

export interface UseWatchedMediaOptions {
  kind: WatchedMediaKind;
  idTmdb: number;
  buildPayload: () => unknown;
  labels: WatchedMediaLabels;
}

const RESOURCES = {
  movie: {
    watched: "watchedMovie",
    waiting: "waitingMovie",
    payloadKey: "createMovieDto",
  },
  serie: {
    watched: "watchedSerie",
    waiting: "waitingSerie",
    payloadKey: "createSerieDto",
  },
} as const;

const apiUrl = (path: string) => `${process.env.NEXT_PUBLIC_URL_API}/${path}`;

export const useWatchedMedia = ({
  kind,
  idTmdb,
  buildPayload,
  labels,
}: UseWatchedMediaOptions) => {
  const { user, authLoading } = useAuth();
  const resource = RESOURCES[kind];

  const [isWatched, setIsWatched] = useState(false);
  const [rating, setRatingValue] = useState(0);
  const [watchedLoading, setWatchedLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isWaitingLoading, setIsWaitingLoading] = useState(false);

  const requireUser = useCallback(() => {
    if (authLoading) return false;
    if (!user) {
      toast.warn(labels.authRequired);
      return false;
    }
    return true;
  }, [authLoading, labels.authRequired, user]);

  const loadState = useCallback(async () => {
    const [watchedResponse, waitingResponse, rateResponse] =
      await Promise.allSettled([
        authFetch(apiUrl(`${resource.watched}/isWatched?idTmdb=${idTmdb}`)),
        authFetch(apiUrl(`${resource.waiting}/isWaiting?idTmdb=${idTmdb}`)),
        authFetch(apiUrl(`${resource.watched}/getRate?idTmdb=${idTmdb}`)),
      ]);

    if (watchedResponse.status === "fulfilled" && watchedResponse.value.ok) {
      const data = await watchedResponse.value.json();
      setIsWatched(Boolean(data.watched));
    }

    if (waitingResponse.status === "fulfilled" && waitingResponse.value.ok) {
      const data = await waitingResponse.value.json();
      setIsWaiting(Boolean(data.waiting));
    }

    if (rateResponse.status === "fulfilled" && rateResponse.value.ok) {
      const data = await rateResponse.value.json();
      setRatingValue(data.rate ?? 0);
    }
  }, [idTmdb, resource.waiting, resource.watched]);

  useEffect(() => {
    if (authLoading || !user) return;
    loadState();
  }, [authLoading, loadState, user]);

  const toggleWatched = useCallback(
    async (watchedAtIso: string) => {
      if (!requireUser()) return;

      setWatchedLoading(true);

      try {
        const response = await authFetch(apiUrl(resource.watched), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            watchedAt: watchedAtIso,
            [resource.payloadKey]: buildPayload(),
          }),
        });

        if (!response.ok) throw new Error("Requisição rejeitada");

        const data = (await response.json()) as { unmarked?: boolean };

        if (data.unmarked) {
          setIsWatched(false);
          setRatingValue(0);
          if (labels.watchedRemoved) toast.info(labels.watchedRemoved);
          return;
        }

        setIsWatched(true);
        toast.success(labels.watchedSuccess);
      } catch {
        toast.error(labels.watchedError);
      } finally {
        setWatchedLoading(false);
      }
    },
    [
      buildPayload,
      labels.watchedError,
      labels.watchedRemoved,
      labels.watchedSuccess,
      requireUser,
      resource.payloadKey,
      resource.watched,
    ],
  );

  const setRating = useCallback(
    async (newRating: number) => {
      if (!requireUser()) return;

      if (!isWatched) {
        toast.warn(labels.ratingBlocked);
        return;
      }

      const previousRating = rating;
      setRatingValue(newRating);

      try {
        const response = await authFetch(apiUrl(`${resource.watched}/rate`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idTmdb, rating: newRating }),
        });

        if (!response.ok) throw new Error("Requisição rejeitada");
      } catch {
        setRatingValue(previousRating);
        toast.error(labels.ratingError);
      }
    },
    [
      idTmdb,
      isWatched,
      labels.ratingBlocked,
      labels.ratingError,
      rating,
      requireUser,
      resource.watched,
    ],
  );

  const toggleWaiting = useCallback(async () => {
    if (!requireUser()) return;

    setIsWaitingLoading(true);

    try {
      const response = await authFetch(apiUrl(resource.waiting), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [resource.payloadKey]: buildPayload() }),
      });

      if (!response.ok) throw new Error("Requisição rejeitada");

      const data = (await response.json()) as { unmarked?: boolean };
      setIsWaiting(!data.unmarked);

      if (data.unmarked && labels.waitingRemoved) {
        toast.info(labels.waitingRemoved);
        return;
      }

      if (!data.unmarked && labels.waitingAdded) {
        toast.success(labels.waitingAdded);
      }
    } catch {
      toast.error(labels.waitingError);
    } finally {
      setIsWaitingLoading(false);
    }
  }, [
    buildPayload,
    labels.waitingAdded,
    labels.waitingError,
    labels.waitingRemoved,
    requireUser,
    resource.payloadKey,
    resource.waiting,
  ]);

  return {
    isWatched,
    rating,
    isWaiting,
    watchedLoading,
    isWaitingLoading,
    toggleWatched,
    setRating,
    toggleWaiting,
  };
};
```

Nota sobre `loadState`: o código de hoje usa três `useCallback` separados com `try/catch` cada um, chamados por um `Promise.all`. O `Promise.allSettled` acima é equivalente em efeito — falha de uma chamada não derruba as outras e não altera o estado correspondente. A única diferença observável é o `console.error` que só a página de série emitia ao falhar o `getRate`; ele sai.

- [ ] **Step 2: Consumir o hook em `pages/movie/[id].tsx`**

Remover: `showToast`, `validateUser`, `sendWatchedRequest`, `getRating`, `checkIsWaiting`, `checkIsWatched`, `fetchData`, o `useEffect` que chama `fetchData`, `handleWaitingClick`, `handleRating` e os estados `rating`, `isWatched`, `watchedLoading`, `isWaiting`, `isWaitingLoading`. Remover o import de `toast` e o de `authFetch`; o estado `loading` (nunca setado) e `isClient` permanecem.

Manter `buildMoviePayload` e acrescentar:

```tsx
  const {
    isWatched,
    rating,
    isWaiting,
    watchedLoading,
    isWaitingLoading,
    toggleWatched,
    setRating,
    toggleWaiting,
  } = useWatchedMedia({
    kind: "movie",
    idTmdb: movie.id,
    buildPayload: buildMoviePayload,
    labels: {
      authRequired: "Entre em uma conta para fazer atualizações no filme",
      watchedSuccess: "Filme marcado como assistido!",
      watchedError: "Erro ao atualizar o filme como assistido.",
      missingDate: "Informe a data em que você assistiu.",
      waitingError: "Erro ao atualizar a lista de espera.",
      ratingBlocked:
        "Você precisa marcar o filme como assistido para avaliá-lo.",
      ratingError: "Erro ao enviar a avaliação.",
    },
  });

  const handleWatchedClick = useCallback(() => {
    if (!requireUser()) return;
    if (!isWatched) {
      openModal();
      return;
    }
    toggleWatched(new Date().toISOString());
  }, [isWatched, openModal, requireUser, toggleWatched]);

  const handleWatchedSubmit = useCallback(() => {
    if (!requireUser()) return;
    if (!watchedDate) {
      toast.warn("Informe a data em que você assistiu.");
      return;
    }
    setIsModalOpen(false);
    toggleWatched(new Date(watchedDate).toISOString());
  }, [requireUser, toggleWatched, watchedDate]);
```

**A guarda `requireUser()` é a primeira instrução dos dois handlers, e tem de continuar sendo.** No código antigo o `validateUser()` rodava antes do ramo do modal: deslogado, clicar em "Marcar como assistido" avisava "Entre em uma conta…" e **não** abria o modal. Confiar só no `requireUser()` de dentro do `toggleWatched` chega tarde demais — o modal já abriu. Qualquer task posterior que mexa nesses handlers preserva a guarda no topo.

`handleWaitingClick` some: passar `toggleWaiting` direto para `MediaPosterCard.onWatchlistToggle` e para `waitingConfig.onClick`. `handleRating` some: passar `setRating` direto para `ratingConfig.onChange`.

Import novo: `import { useWatchedMedia } from "../../hooks/useWatchedMedia";`. O import de `toast` fica, por causa do `missingDate`.

- [ ] **Step 3: Consumir o hook em `pages/serie/[id].tsx`**

Mesma cirurgia, com as labels da série:

```tsx
    labels: {
      authRequired: "Entre em uma conta para fazer atualizações na série",
      watchedSuccess: "Série marcada como assistida!",
      watchedRemoved: "Série removida da lista de assistidos.",
      watchedError: "Erro ao atualizar a série como assistida.",
      missingDate: "Informe a data em que você assistiu.",
      waitingAdded: "Série adicionada à watchlist!",
      waitingRemoved: "Série removida da watchlist.",
      waitingError: "Erro ao atualizar a watchlist.",
      ratingBlocked:
        "Você precisa marcar a série como assistida para avaliá-la.",
      ratingError: "Erro ao enviar a avaliação.",
    },
```

com `kind: "serie"`, `idTmdb: serie.id` e `buildPayload: buildSeriePayload`.

- [ ] **Step 4: Conferir o tamanho dos arquivos**

```bash
cd /e/projects/guys-movies/guys-movies-frontend && wc -l "pages/movie/[id].tsx" "pages/serie/[id].tsx"
```
Esperado: por volta de 200 linhas cada (eram 449 e 466). Se ainda estiverem acima de 300, sobrou lógica que devia ter ido para o hook.

- [ ] **Step 5: Verificar comportamento no navegador, logado**

Em `/movie/<id>` e `/serie/<id>`, com uma conta logada, confirmar um a um:

1. Estado inicial de assistido, watchlist e nota carrega igual a antes.
2. "Marcar como assistido" abre o modal; salvar com data marca e mostra o toast de sucesso.
3. Clicar de novo desmarca e zera a nota (na série, com o toast "removida da lista de assistidos"; no filme, sem toast — igual a hoje).
4. Watchlist alterna nos dois sentidos (na série com toasts, no filme sem).
5. Dar nota sem estar assistido mostra o aviso e não envia.
6. Dar nota estando assistido persiste após recarregar a página.
7. Deslogado, qualquer ação mostra "Entre em uma conta…".

- [ ] **Step 6: Build e lint**

```bash
cd /e/projects/guys-movies/guys-movies-frontend && npm run build && npm run lint:check
```

- [ ] **Step 7: Auditoria do checkpoint**

`differential-review` no diff, cada achado por `fp-check`, registro em `docs/superpowers/audits/CP2.md`. Atenção específica: o review tem de confirmar que **nenhum comportamento mudou**.

- [ ] **Step 8: Commit**

```bash
cd /e/projects/guys-movies/guys-movies-frontend
git add hooks/useWatchedMedia.ts "pages/movie/[id].tsx" "pages/serie/[id].tsx" docs/superpowers/audits/CP2.md
git commit -m "refactor: extrai useWatchedMedia das paginas de detalhe"
```

---

## Task 3: Marcar como assistido ao dar nota (CP3)

**Files:**
- Modify: `guys-movies-backend/src/movie/dto/rate-movie.dto.ts`, `guys-movies-backend/src/serie/dto/rate-serie.dto.ts`
- Modify: `guys-movies-backend/src/movie/watched-movie/watched-movie.service.ts`, `guys-movies-backend/src/movie/watched-movie/watched-movie.controller.ts`
- Modify: `guys-movies-backend/src/serie/watched-serie/watched-serie.service.ts`, `guys-movies-backend/src/serie/watched-serie/watched-serie.controller.ts`
- Create: `guys-movies-backend/src/movie/watched-movie/watched-movie.service.spec.ts`
- Create: `guys-movies-backend/src/serie/watched-serie/watched-serie.service.spec.ts`
- Create: `guys-movies-backend/src/migrations/1790000000000-BackfillWatchedMediaLinks.ts`
- Modify: `guys-movies-frontend/hooks/useWatchedMedia.ts`, `guys-movies-frontend/pages/movie/[id].tsx`, `guys-movies-frontend/pages/serie/[id].tsx`
- Create: `guys-movies-frontend/docs/superpowers/audits/CP3.md`

**Depende de:** Task 2.

**Interfaces:**
- Consumes: `useWatchedMedia` da Task 2; `CreatedMovieService.findMovieByIdTmdb(idTmdb: number): Promise<Movies>` e `CreatedMovieService.createMovie(dto: CreatedMovieDto)`; `CreatedSerieService.findSerieByIdTmdb` e `.createSerie` equivalentes.
- Produces:
  - `WatchedMovieService.rateMovie(userId: number, idTmdb: number, rating: number, createMovieDto?: CreatedMovieDto): Promise<{ message: string; created: boolean }>`
  - `WatchedSerieService.rateSerie(userId: number, idTmdb: number, rating: number, createSerieDto?: CreatedSerieDto): Promise<{ message: string; created: boolean }>`
  - `POST /watchedMovie/rate` e `POST /watchedSerie/rate` respondem `{ message: string, created: boolean }`
  - `WatchedMediaLabels` perde `ratingBlocked` e ganha `ratingCreated: string`

**Por que não `POST /watchedMovie`:** aquele endpoint é *toggle* — `markAsWatched` deleta o registro se ele já existir. Com qualquer dessincronia entre front e banco, dar nota apagaria em silêncio o registro e a nota anterior. Um efeito colateral automático não pode rodar sobre endpoint destrutivo. O `rate` é idempotente e já cria o registro com `watchedAt: null`; o defeito dele é só não vincular a mídia.

- [ ] **Step 1: Escrever o teste que falha — filme**

Create `guys-movies-backend/src/movie/watched-movie/watched-movie.service.spec.ts`:

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WatchedMovieService } from './watched-movie.service';
import { WatchedMovie } from '../entities/watched-movie.entity';
import { CreatedMovieService } from '../created-movie/created-movie.service';
import { CreatedMovieDto } from '../dto/created-movie.dto';

const moviePayload: CreatedMovieDto = {
  title: 'Clube da Luta',
  overview: 'Um narrador insone conhece um vendedor de sabonetes',
  releaseDate: '1999-10-15',
  idTmdb: 550,
  posterPath: '/poster.jpg',
  director: 'David Fincher',
  voteAverage: 8.4,
};

describe('WatchedMovieService.rateMovie', () => {
  let service: WatchedMovieService;
  let repository: {
    findOne: jest.Mock;
    create: jest.Mock;
    insert: jest.Mock;
    save: jest.Mock;
  };
  let createdMovieService: {
    createMovie: jest.Mock;
    findMovieByIdTmdb: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
      create: jest.fn(value => value),
      insert: jest.fn().mockResolvedValue(undefined),
      save: jest.fn().mockResolvedValue(undefined),
    };
    createdMovieService = {
      createMovie: jest.fn().mockResolvedValue({ message: 'ok' }),
      findMovieByIdTmdb: jest.fn().mockResolvedValue({ id: 7 }),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        WatchedMovieService,
        { provide: getRepositoryToken(WatchedMovie), useValue: repository },
        { provide: CreatedMovieService, useValue: createdMovieService },
      ],
    }).compile();

    service = moduleRef.get(WatchedMovieService);
  });

  it('cria o registro vinculado ao filme quando ainda nao existe', async () => {
    repository.findOne.mockResolvedValue(null);

    const result = await service.rateMovie(1, 550, 4, moviePayload);

    expect(createdMovieService.createMovie).toHaveBeenCalledWith(moviePayload);
    expect(repository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        idUser: { id: 1 },
        idMovie: { id: 7 },
        idTmdb: 550,
        rating: 4,
        watchedAt: null,
      }),
    );
    expect(result.created).toBe(true);
  });

  it('apenas atualiza a nota quando o registro ja existe', async () => {
    repository.findOne.mockResolvedValue({ id: 3, idTmdb: 550, rating: 2 });

    const result = await service.rateMovie(1, 550, 5, moviePayload);

    expect(repository.insert).not.toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 5 }),
    );
    expect(result.created).toBe(false);
  });

  it('busca o registro escopado pelo usuario autenticado', async () => {
    repository.findOne.mockResolvedValue(null);

    await service.rateMovie(42, 550, 3, moviePayload);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { idUser: { id: 42 }, idTmdb: 550 },
    });
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

```bash
cd /e/projects/guys-movies/guys-movies-backend && npx jest src/movie/watched-movie/watched-movie.service.spec.ts
```
Esperado: FAIL. `rateMovie` hoje aceita três argumentos, devolve `string` e nunca chama `createMovie`.

- [ ] **Step 3: Implementar `rateMovie`**

Em `src/movie/watched-movie/watched-movie.service.ts`, substituir o método `rateMovie` inteiro:

```ts
  async rateMovie(
    userId: number,
    idTmdb: number,
    rating: number,
    createMovieDto?: CreatedMovieDto,
  ): Promise<{ message: string; created: boolean }> {
    try {
      const watchedMovie = await this.watchedMovieRepository.findOne({
        where: {
          idUser: { id: userId },
          idTmdb: idTmdb,
        },
      });

      if (watchedMovie) {
        watchedMovie.rating = rating;
        await this.watchedMovieRepository.save(watchedMovie);
        return { message: 'Avaliação atualizada com sucesso', created: false };
      }

      if (createMovieDto) {
        await this.createdMovieService.createMovie(createMovieDto);
      }

      const movie = await this.createdMovieService.findMovieByIdTmdb(idTmdb);

      const createdRecord = this.watchedMovieRepository.create({
        idUser: { id: userId } as User,
        idMovie: movie ? ({ id: movie.id } as Movies) : null,
        idTmdb: idTmdb,
        rating: rating,
        watchedAt: null,
      });
      await this.watchedMovieRepository.insert(createdRecord);

      return {
        message: 'Filme marcado como assistido com sucesso',
        created: true,
      };
    } catch (error) {
      throw new HttpException(
        `Erro ao atualizar a avaliação: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
```

- [ ] **Step 4: Rodar e ver passar**

```bash
cd /e/projects/guys-movies/guys-movies-backend && npx jest src/movie/watched-movie/watched-movie.service.spec.ts
```
Esperado: 3 testes passando.

- [ ] **Step 5: Estender `RateMovieDto`**

Modify `src/movie/dto/rate-movie.dto.ts` — `@ValidateNested()` e `@Type()` andam juntos; sem os dois o class-validator pula a validação aninhada em silêncio:

```ts
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreatedMovieDto } from './created-movie.dto';

export class RateMovieDto {
  @IsInt()
  @Min(1)
  idTmdb: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreatedMovieDto)
  createMovieDto?: CreatedMovieDto;
}
```

- [ ] **Step 6: Repassar o DTO no controller de filme**

Em `src/movie/watched-movie/watched-movie.controller.ts`, o método `rateMovie` passa a devolver o objeto do service:

```ts
  @Post('rate')
  @HttpCode(HttpStatus.OK)
  async rateMovie(
    @CurrentUser('id') userId: number,
    @Body() body: RateMovieDto,
  ) {
    return this.watchedMovieService.rateMovie(
      userId,
      body.idTmdb,
      body.rating,
      body.createMovieDto,
    );
  }
```

- [ ] **Step 7: Repetir os passos 1 a 6 para série**

Create `src/serie/watched-serie/watched-serie.service.spec.ts` com a mesma estrutura, trocando: `WatchedSerieService`, `WatchedSerie`, `CreatedSerieService`, `CreatedSerieDto`, o campo de relação `user` no lugar de `idUser`, `serie` no lugar de `idMovie`, e o payload:

```ts
const seriePayload: CreatedSerieDto = {
  name: 'Dark',
  overview: 'Quatro familias procuram uma crianca desaparecida',
  firstAirDate: '2017-12-01',
  idTmdb: 70523,
  posterPath: '/poster.jpg',
  numberOfSeasons: 3,
  voteAverage: 8.3,
};
```

O teste de escopo espera:

```ts
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { user: { id: 42 }, idTmdb: 70523 },
    });
```

Implementar `rateSerie` espelhando `rateMovie`, com `user`/`serie` no lugar de `idUser`/`idMovie` e as mensagens 'Avaliação atualizada com sucesso' e 'Série marcada como assistida com sucesso'. Estender `RateSerieDto` com `createSerieDto?: CreatedSerieDto` sob `@IsOptional() @IsObject() @ValidateNested() @Type(() => CreatedSerieDto)`. `CreatedSerieDto` já traz `@MaxLength` e o `@Matches` da CDN da TMDB — conferir e não relaxar.

- [ ] **Step 8: Rodar a suíte inteira**

```bash
cd /e/projects/guys-movies/guys-movies-backend && npm test
```
Esperado: 6 testes passando, nenhum falhando.

- [ ] **Step 9: Migration de backfill**

Registros criados pelo `rate` antigo estão sem vínculo. Create `src/migrations/1790000000000-BackfillWatchedMediaLinks.ts`:

```ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillWatchedMediaLinks1790000000000
  implements MigrationInterface
{
  name = 'BackfillWatchedMediaLinks1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "watched_movie" SET "idMovieId" = "movies"."id" FROM "movies" WHERE "watched_movie"."idMovieId" IS NULL AND "movies"."idTmdb" = "watched_movie"."idTmdb"`,
    );
    await queryRunner.query(
      `UPDATE "watched_serie" SET "serieId" = "series"."id" FROM "series" WHERE "watched_serie"."serieId" IS NULL AND "series"."idTmdb" = "watched_serie"."idTmdb"`,
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
```

O `down` é vazio de propósito: reconciliar um vínculo correto não tem inverso desejável — desfazer recriaria os órfãos.

- [ ] **Step 10: Rodar a migration e conferir**

```bash
cd /e/projects/guys-movies/guys-movies-backend && npm run migration:run
```

Conferir que não sobrou órfão com filme cadastrado:

```bash
cd /e/projects/guys-movies && docker compose exec db psql -U postgres -d postgres -c 'SELECT count(*) FROM watched_movie w JOIN movies m ON m."idTmdb" = w."idTmdb" WHERE w."idMovieId" IS NULL;'
```
Esperado: `0`.

- [ ] **Step 11: Backend build e lint**

```bash
cd /e/projects/guys-movies/guys-movies-backend && npm run build && npm run lint:check
```

- [ ] **Step 12: Commit do backend**

```bash
cd /e/projects/guys-movies/guys-movies-backend
git add src/movie src/serie src/migrations
git commit -m "feat: rate cria registro vinculado e informa created"
```

- [ ] **Step 13: Ajustar o hook no frontend**

Em `hooks/useWatchedMedia.ts`:

Trocar em `WatchedMediaLabels` o campo `ratingBlocked: string` por `ratingCreated: string`.

Substituir o corpo de `setRating`:

```ts
  const setRating = useCallback(
    async (newRating: number) => {
      if (!requireUser()) return;

      const previousRating = rating;
      setRatingValue(newRating);

      try {
        const response = await authFetch(apiUrl(`${resource.watched}/rate`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idTmdb,
            rating: newRating,
            [resource.payloadKey]: buildPayload(),
          }),
        });

        if (!response.ok) throw new Error("Requisição rejeitada");

        const data = (await response.json()) as { created?: boolean };

        if (data.created) {
          setIsWatched(true);
          toast.success(labels.ratingCreated);
        }
      } catch {
        setRatingValue(previousRating);
        toast.error(labels.ratingError);
      }
    },
    [
      buildPayload,
      idTmdb,
      labels.ratingCreated,
      labels.ratingError,
      rating,
      requireUser,
      resource.payloadKey,
      resource.watched,
    ],
  );
```

O guarda `if (!isWatched) { toast.warn(...) }` **sai**. `isWatched` deixa de ser dependência de `setRating`.

- [ ] **Step 14: Atualizar as labels das duas páginas**

Em `pages/movie/[id].tsx`, trocar a entrada `ratingBlocked` por:

```tsx
      ratingCreated: "Nota salva e filme marcado como assistido!",
```

Em `pages/serie/[id].tsx`:

```tsx
      ratingCreated: "Nota salva e série marcada como assistida!",
```

- [ ] **Step 15: Verificar no navegador**

Logado, num filme **nunca marcado**:

1. Dar uma nota. Esperado: nenhum aviso de bloqueio; toast "Nota salva e filme marcado como assistido!"; o botão vira "Remover do assistido" na hora.
2. Abrir `/assistidos`. Esperado: o filme aparece **com título e pôster** — não como card vazio.
3. Recarregar a página do filme. Esperado: nota e estado de assistido persistem.
4. Repetir 1 a 3 numa série (a aba `/assistidos` segue só com filmes, então parar no passo 3).
5. Num filme já assistido, mudar a nota. Esperado: sem toast de criação, nota persiste.

- [ ] **Step 16: Frontend build e lint**

```bash
cd /e/projects/guys-movies/guys-movies-frontend && npm run build && npm run lint:check
```

- [ ] **Step 17: Auditoria do checkpoint**

`differential-review` sobre os diffs dos **dois** repos; cada achado por `fp-check`; registro em `docs/superpowers/audits/CP3.md`. Risco a cobrar explicitamente: texto do usuário chegando ao banco pelo DTO aninhado novo — confirmar que `@ValidateNested()` e `@Type()` estão os dois presentes e que `posterPath` segue preso à CDN da TMDB.

- [ ] **Step 18: Commit do frontend**

```bash
cd /e/projects/guys-movies/guys-movies-frontend
git add hooks/useWatchedMedia.ts "pages/movie/[id].tsx" "pages/serie/[id].tsx" docs/superpowers/audits/CP3.md
git commit -m "feat: dar nota marca a midia como assistida"
```

---

## Task 4: Editar a data (CP4)

**Files:**
- Create: `guys-movies-backend/src/movie/dto/update-watched-at.dto.ts`, `guys-movies-backend/src/serie/dto/update-watched-at-serie.dto.ts`, `guys-movies-backend/src/serie/dto/watched-serie-list.dto.ts`
- Modify: `guys-movies-backend/src/movie/watched-movie/{watched-movie.service.ts,watched-movie.controller.ts}`, `guys-movies-backend/src/serie/watched-serie/{watched-serie.service.ts,watched-serie.controller.ts}`
- Modify: `guys-movies-backend/src/movie/watched-movie/watched-movie.service.spec.ts`, `guys-movies-backend/src/serie/watched-serie/watched-serie.service.spec.ts`
- Create: `guys-movies-frontend/components/watched/watchedDateForm.tsx`
- Modify: `guys-movies-frontend/hooks/useWatchedMedia.ts`, `guys-movies-frontend/components/mediaDetails/experiencePanel.tsx`, `guys-movies-frontend/components/watched/watchedDetailSheet.tsx`, `guys-movies-frontend/pages/assistidos.tsx`, `guys-movies-frontend/pages/movie/[id].tsx`, `guys-movies-frontend/pages/serie/[id].tsx`
- Delete: `guys-movies-frontend/components/movie/bodyModalForm/index.tsx`
- Create: `guys-movies-frontend/docs/superpowers/audits/CP4.md`

**Depende de:** Task 2 (tecnicamente) e Task 3 (por ordem: é o CP3 que passa a criar registros sem data, e é esse estado que a edição existe para resolver).

**Interfaces:**
- Consumes: `useWatchedMedia`, `WatchedMovieItem` de `interfaces/watched/types`, `formatWatchedDate` de `components/watched/watchedTile`.
- Produces:
  - `PATCH /watchedMovie/watchedAt` body `{ idTmdb: number, watchedAt: string | null }` → `WatchedMovieListItemDto`
  - `PATCH /watchedSerie/watchedAt` body `{ idTmdb: number, watchedAt: string | null }` → `WatchedSerieListItemDto`
  - `GET /watchedMovie/isWatched` e `/watchedSerie/isWatched` passam a responder `{ watched: boolean, watchedAt: string | null }`
  - `WatchedMovieService.updateWatchedAt(userId: number, idTmdb: number, watchedAt: string | null): Promise<WatchedMovieListItemDto>`
  - `WatchedSerieService.updateWatchedAt(userId: number, idTmdb: number, watchedAt: string | null): Promise<WatchedSerieListItemDto>`
  - `WatchedDateForm` — `({ initialDate, onSubmit, onClear, loading, mode }: WatchedDateFormProps) => JSX.Element`
  - `useWatchedMedia` ganha `watchedAt: string | null` e `updateWatchedDate: (value: string | null) => Promise<void>`

**Este é o ponto mais sensível da leva.** O `WHERE` do `PATCH` inclui `idUser` vindo de `@CurrentUser('id')`, **nunca** do body. Sem isso, qualquer usuário autenticado edita o registro de qualquer outro pelo `idTmdb`. Por isso o teste vem primeiro.

- [ ] **Step 1: Escrever o teste de escopo por usuário — filme**

Acrescentar a `src/movie/watched-movie/watched-movie.service.spec.ts` um novo `describe`:

```ts
describe('WatchedMovieService.updateWatchedAt', () => {
  let service: WatchedMovieService;
  let repository: { findOne: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
      save: jest.fn(value => Promise.resolve(value)),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        WatchedMovieService,
        { provide: getRepositoryToken(WatchedMovie), useValue: repository },
        {
          provide: CreatedMovieService,
          useValue: { createMovie: jest.fn(), findMovieByIdTmdb: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(WatchedMovieService);
  });

  it('busca sempre pelo usuario autenticado, nunca so pelo idTmdb', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.updateWatchedAt(42, 550, '2024-05-01'),
    ).rejects.toMatchObject({ status: 404 });

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { idUser: { id: 42 }, idTmdb: 550 },
      relations: { idMovie: true },
    });
  });

  it('nao edita o registro de outro usuario', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.updateWatchedAt(2, 550, '2024-05-01'),
    ).rejects.toMatchObject({ status: 404 });

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('aceita null e devolve o item com a data limpa', async () => {
    repository.findOne.mockResolvedValue({
      id: 3,
      idTmdb: 550,
      rating: 4,
      watchedAt: new Date('2024-05-01'),
      createdAt: new Date('2024-04-01'),
      idMovie: {
        title: 'Clube da Luta',
        overview: 'Sinopse',
        posterPath: '/poster.jpg',
        releaseDate: '1999-10-15',
        director: 'David Fincher',
        voteAverage: 8.4,
      },
    });

    const item = await service.updateWatchedAt(1, 550, null);

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ watchedAt: null }),
    );
    expect(item).toMatchObject({
      idTmdb: 550,
      title: 'Clube da Luta',
      watchedAt: null,
      rating: 4,
    });
  });

  it('rejeita data futura', async () => {
    repository.findOne.mockResolvedValue({ id: 3, idTmdb: 550 });
    const future = new Date(Date.now() + 86400000).toISOString();

    await expect(
      service.updateWatchedAt(1, 550, future),
    ).rejects.toMatchObject({ status: 400 });

    expect(repository.save).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

```bash
cd /e/projects/guys-movies/guys-movies-backend && npx jest src/movie/watched-movie/watched-movie.service.spec.ts
```
Esperado: FAIL com `service.updateWatchedAt is not a function`.

- [ ] **Step 3: Implementar `updateWatchedAt` no service de filme**

Em `src/movie/watched-movie/watched-movie.service.ts`, extrair o mapeamento de item (hoje inline em `listWatchedMovies`) para um método privado e acrescentar o novo método:

```ts
  private toListItem(watched: WatchedMovie): WatchedMovieListItemDto {
    return {
      idTmdb: watched.idTmdb,
      title: watched.idMovie?.title ?? null,
      overview: watched.idMovie?.overview ?? null,
      posterPath: watched.idMovie?.posterPath ?? null,
      releaseDate: watched.idMovie?.releaseDate ?? null,
      director: watched.idMovie?.director ?? null,
      voteAverage: watched.idMovie?.voteAverage ?? null,
      rating: watched.rating ?? null,
      watchedAt: watched.watchedAt
        ? new Date(watched.watchedAt).toISOString()
        : null,
      createdAt: new Date(watched.createdAt).toISOString(),
    };
  }

  async updateWatchedAt(
    userId: number,
    idTmdb: number,
    watchedAt: string | null,
  ): Promise<WatchedMovieListItemDto> {
    if (watchedAt && new Date(watchedAt).getTime() > Date.now()) {
      throw new HttpException(
        'A data de assistido não pode estar no futuro',
        HttpStatus.BAD_REQUEST,
      );
    }

    const watchedMovie = await this.watchedMovieRepository.findOne({
      where: { idUser: { id: userId }, idTmdb: idTmdb },
      relations: { idMovie: true },
    });

    if (!watchedMovie) {
      throw new HttpException(
        'Filme assistido não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    watchedMovie.watchedAt = watchedAt ? new Date(watchedAt) : null;
    await this.watchedMovieRepository.save(watchedMovie);

    return this.toListItem(watchedMovie);
  }
```

E trocar o `.map` de `listWatchedMovies` por `watchedMovies.map(watched => this.toListItem(watched))`.

Atenção ao `try/catch`: os métodos vizinhos embrulham tudo em `HttpStatus.INTERNAL_SERVER_ERROR`, o que transformaria o 404 e o 400 em 500. `updateWatchedAt` **não** leva `try/catch` — as exceções que ele levanta já carregam o status certo.

- [ ] **Step 4: Rodar e ver passar**

```bash
cd /e/projects/guys-movies/guys-movies-backend && npx jest src/movie/watched-movie/watched-movie.service.spec.ts
```
Esperado: 7 testes passando.

- [ ] **Step 5: Criar o DTO do body**

Create `src/movie/dto/update-watched-at.dto.ts`:

```ts
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateWatchedAtDto {
  @IsInt()
  @Min(1)
  idTmdb: number;

  @IsOptional()
  @IsDateString()
  watchedAt?: string | null;
}
```

`@IsOptional()` do class-validator pula a validação quando o valor é `null` ou `undefined` — é isso que faz `watchedAt: null` ser valor de primeira classe. Campo ausente e `null` são tratados igual: os dois limpam a data.

- [ ] **Step 6: Expor o endpoint no controller de filme**

Em `src/movie/watched-movie/watched-movie.controller.ts`, importar `Patch` de `@nestjs/common` e `UpdateWatchedAtDto`, e acrescentar:

```ts
  @Patch('watchedAt')
  @HttpCode(HttpStatus.OK)
  async updateWatchedAt(
    @CurrentUser('id') userId: number,
    @Body() body: UpdateWatchedAtDto,
  ) {
    return this.watchedMovieService.updateWatchedAt(
      userId,
      body.idTmdb,
      body.watchedAt ?? null,
    );
  }
```

O `userId` vem de `@CurrentUser('id')`. O body não tem, e não pode ter, campo de usuário — `forbidNonWhitelisted` rejeita qualquer tentativa de mandar um.

- [ ] **Step 7: `isWatched` passa a devolver a data**

A página de detalhe precisa saber a data atual para exibi-la, e hoje nenhum endpoint a entrega para um item só. Em `src/movie/watched-movie/watched-movie.service.ts`, substituir `isWatchedMovie`:

```ts
  async isWatchedMovie(
    idUser: number,
    idTmdb: number,
  ): Promise<{ watched: boolean; watchedAt: string | null }> {
    try {
      const watchedMovie = await this.watchedMovieRepository.findOne({
        where: {
          idUser: { id: idUser },
          idTmdb: idTmdb,
        },
      });

      return {
        watched: Boolean(watchedMovie),
        watchedAt: watchedMovie?.watchedAt
          ? new Date(watchedMovie.watchedAt).toISOString()
          : null,
      };
    } catch (error) {
      throw new HttpException(
        `Erro ao verificar se o filme foi assistido: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
```

E no controller:

```ts
  @Get('isWatched')
  async isWatched(
    @CurrentUser('id') userId: number,
    @Query() query: IsWatchedMovieDto,
  ) {
    return this.watchedMovieService.isWatchedMovie(userId, query.idTmdb);
  }
```

O formato de resposta `{ watched }` continua válido para quem já consumia; só ganhou um campo.

- [ ] **Step 8: Espelhar tudo para série**

Create `src/serie/dto/watched-serie-list.dto.ts`:

```ts
export class WatchedSerieListItemDto {
  idTmdb: number;
  name: string | null;
  overview: string | null;
  posterPath: string | null;
  firstAirDate: string | null;
  numberOfSeasons: number | null;
  voteAverage: number | null;
  rating: number | null;
  watchedAt: string | null;
  createdAt: string;
}
```

Create `src/serie/dto/update-watched-at-serie.dto.ts` idêntico ao de filme, com a classe `UpdateWatchedAtSerieDto`.

Em `watched-serie.service.ts`, acrescentar `toListItem` (usando `watched.serie?.name`, `.overview`, `.posterPath`, `.firstAirDate`, `.numberOfSeasons`, `.voteAverage`) e `updateWatchedAt` com `where: { user: { id: userId }, idTmdb }` e `relations: { serie: true }`, mensagem de 404 'Série assistida não encontrada'. Trocar `isWatchedSerie` para devolver `{ watched, watchedAt }` e ajustar o controller, incluindo o `@Patch('watchedAt')`.

Acrescentar a `watched-serie.service.spec.ts` o `describe` de `updateWatchedAt`, espelhando o do filme com `user`/`serie` e `idTmdb: 70523`.

- [ ] **Step 9: Suíte inteira e build**

```bash
cd /e/projects/guys-movies/guys-movies-backend && npm test && npm run build && npm run lint:check
```
Esperado: todos os testes passando.

- [ ] **Step 10: Provar o escopo com requisição real**

Com o stack no ar e **duas contas**, A e B. Marcar um filme como assistido pela conta A e anotar o `idTmdb`. Com o token de B:

```bash
curl -i -X PATCH http://localhost:3005/watchedMovie/watchedAt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_DE_B>" \
  -d '{"idTmdb": <ID_DO_FILME_DE_A>, "watchedAt": "2020-01-01"}'
```
Esperado: `404`. Repetir com o token de A: esperado `200` e o item com a data nova. Conferir no banco que o registro de A mudou e nenhum outro foi tocado.

- [ ] **Step 11: Commit do backend**

```bash
cd /e/projects/guys-movies/guys-movies-backend
git add src/movie src/serie
git commit -m "feat: endpoints PATCH watchedAt escopados pelo usuario"
```

- [ ] **Step 12: Criar `WatchedDateForm`**

Create `guys-movies-frontend/components/watched/watchedDateForm.tsx`:

```tsx
import React, { useState } from "react";
import Input from "../_ui/form/input";

export type WatchedDateFormMode = "create" | "edit";

interface WatchedDateFormProps {
  initialDate: string | null;
  mode: WatchedDateFormMode;
  loading?: boolean;
  onSubmit: (isoDate: string) => void;
  onClear?: () => void;
}

const toInputValue = (value: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const WatchedDateForm: React.FC<WatchedDateFormProps> = ({
  initialDate,
  mode,
  loading,
  onSubmit,
  onClear,
}) => {
  const [date, setDate] = useState(() => toInputValue(initialDate));

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!date) return;
        onSubmit(new Date(`${date}T00:00:00`).toISOString());
      }}
      className="flex flex-col gap-5"
    >
      <p className="text-sm leading-relaxed text-white/45">
        {mode === "create"
          ? "Conte pra gente quando você assistiu para manter seu histórico sempre em ordem."
          : "Ajuste a data em que você assistiu, ou limpe o registro para deixá-la em branco."}
      </p>

      <Input
        type="date"
        label="Quando você assistiu?"
        value={date}
        max={new Date().toISOString().slice(0, 10)}
        onChange={(event) => setDate(event.target.value)}
        className="font-medium"
      />

      <button
        type="submit"
        disabled={loading || !date}
        className="flex h-12 items-center justify-center rounded-2xl text-sm font-bold tracking-tight bg-white text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.5)] active:translate-y-0 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Salvar momento"}
      </button>

      {mode === "edit" && onClear && (
        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/70 transition-all duration-300 ease-ios hover:bg-white/[0.09] hover:text-white active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
        >
          Limpar data
        </button>
      )}
    </form>
  );
};

export default WatchedDateForm;
```

Os três modos da spec: criar (`mode="create"`), editar (`mode="edit"`) e limpar (o botão "Limpar data", só no modo de edição).

- [ ] **Step 13: Estender `useWatchedMedia`**

Em `hooks/useWatchedMedia.ts`:

Acrescentar a `WatchedMediaLabels`:

```ts
  dateUpdated: string;
  dateError: string;
```

Acrescentar o estado `const [watchedAt, setWatchedAt] = useState<string | null>(null);`.

Em `loadState`, dentro do `if` do `watchedResponse`, acrescentar `setWatchedAt(data.watchedAt ?? null);`.

Em `toggleWatched`, no ramo `data.unmarked` acrescentar `setWatchedAt(null);`; no ramo de marcado, `setWatchedAt(watchedAtIso);`.

Acrescentar o método novo:

```ts
  const updateWatchedDate = useCallback(
    async (value: string | null) => {
      if (!requireUser()) return;

      const previousWatchedAt = watchedAt;
      setWatchedAt(value);

      try {
        const response = await authFetch(
          apiUrl(`${resource.watched}/watchedAt`),
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idTmdb, watchedAt: value }),
          },
        );

        if (!response.ok) throw new Error("Requisição rejeitada");

        const item = (await response.json()) as { watchedAt: string | null };
        setWatchedAt(item.watchedAt);
        toast.success(labels.dateUpdated);
      } catch {
        setWatchedAt(previousWatchedAt);
        toast.error(labels.dateError);
      }
    },
    [
      idTmdb,
      labels.dateError,
      labels.dateUpdated,
      requireUser,
      resource.watched,
      watchedAt,
    ],
  );
```

Devolver `watchedAt` e `updateWatchedDate` no objeto de retorno.

- [ ] **Step 14: Exibir a data no `MediaExperiencePanel`**

Em `components/mediaDetails/experiencePanel.tsx`, acrescentar à interface de props:

```tsx
interface WatchedDateConfig {
  watchedAt: string | null;
  onEdit: () => void;
}
```

e `watchedDateConfig?: WatchedDateConfig;` em `MediaExperiencePanelProps`. Renderizar, logo abaixo do grid de botões e só quando `watchedConfig.isActive && watchedDateConfig`:

```tsx
          {watchedConfig.isActive && watchedDateConfig && (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/30 px-4 py-3">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                  Você assistiu em
                </p>
                <p className="text-sm font-semibold text-white">
                  {formatWatchedDate(watchedDateConfig.watchedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={watchedDateConfig.onEdit}
                className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/20"
              >
                Editar
              </button>
            </div>
          )}
```

Import: `import { formatWatchedDate } from "../watched/watchedTile";`.

- [ ] **Step 15: Ligar as duas páginas de detalhe**

Em `pages/movie/[id].tsx` e `pages/serie/[id].tsx`:

- Trocar o import de `BodyModalForm` por `import WatchedDateForm, { WatchedDateFormMode } from "../../components/watched/watchedDateForm";`.
- Pegar `watchedAt` e `updateWatchedDate` do hook.
- Acrescentar o estado `const [dateMode, setDateMode] = useState<WatchedDateFormMode>("create");`.
- `handleWatchedClick` passa a `setDateMode("create")` antes de `openModal()`. A guarda `if (!requireUser()) return;` continua sendo a **primeira** instrução do handler — ver a nota na Task 2, Step 2.
- Acrescentar `const openDateEditor = useCallback(() => { setDateMode("edit"); setIsModalOpen(true); }, []);`
- Passar ao painel:

```tsx
              watchedDateConfig={{ watchedAt, onEdit: openDateEditor }}
```

- Substituir o corpo do `Modal` por:

```tsx
        <WatchedDateForm
          initialDate={dateMode === "edit" ? watchedAt : null}
          mode={dateMode}
          loading={watchedLoading}
          onSubmit={(isoDate) => {
            setIsModalOpen(false);
            if (dateMode === "edit") {
              updateWatchedDate(isoDate);
              return;
            }
            toggleWatched(isoDate);
          }}
          onClear={() => {
            setIsModalOpen(false);
            updateWatchedDate(null);
          }}
        />
```

- O título do modal vira `dateMode === "edit" ? "Editar a data" : "Quando você assistiu?"`.
- Os estados `watchedDate` / `setWatchedDate` somem — o formulário guarda o próprio valor. O label `missingDate` sai de `WatchedMediaLabels` e das duas páginas; o botão desabilitado com data vazia cobre o caso.
- Acrescentar às labels: `dateUpdated: "Data atualizada!"` e `dateError: "Erro ao atualizar a data."`.

- [ ] **Step 16: Deletar `BodyModalForm`**

```bash
cd /e/projects/guys-movies/guys-movies-frontend && rm -r components/movie/bodyModalForm && grep -rn "bodyModalForm" --include=*.tsx --include=*.ts .
```
Esperado: grep sem resultado.

- [ ] **Step 17: Editar a data pelo `WatchedDetailSheet`**

Em `components/watched/watchedDetailSheet.tsx`, acrescentar `onWatchedAtChange: (idTmdb: number, watchedAt: string | null) => Promise<void>` a `WatchedDetailSheetProps`, importar `WatchedDateForm`, e trocar o `DetailRow` de "Você assistiu em" (linhas 137-140) por:

```tsx
                  {isEditingDate ? (
                    <div className="border-b border-white/5 py-3">
                      <WatchedDateForm
                        initialDate={movie.watchedAt}
                        mode="edit"
                        onSubmit={(isoDate) => {
                          setIsEditingDate(false);
                          onWatchedAtChange(movie.idTmdb, isoDate);
                        }}
                        onClear={() => {
                          setIsEditingDate(false);
                          onWatchedAtChange(movie.idTmdb, null);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-between gap-4 border-b border-white/5 py-3">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                        Você assistiu em
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-right text-sm font-medium text-white/85">
                          {formatWatchedDate(movie.watchedAt)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditingDate(true)}
                          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/20"
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  )}
```

com o estado `const [isEditingDate, setIsEditingDate] = useState(false);` e um efeito que o zera sempre que o sheet troca de filme:

```tsx
  useEffect(() => {
    setIsEditingDate(false);
  }, [movie?.idTmdb]);
```

O `WatchedDateForm` guarda a data no próprio estado inicial, então a `key` dele precisa mudar junto com o item — passar `key={movie.watchedAt ?? "empty"}` no componente para que reabrir a edição depois de salvar traga o valor novo.

Em `pages/assistidos.tsx`, implementar a atualização otimista com refetch em caso de falha:

```tsx
  const updateWatchedAt = useCallback(
    async (idTmdb: number, watchedAt: string | null) => {
      const previous = data;

      setData((current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) =>
                item.idTmdb === idTmdb ? { ...item, watchedAt } : item,
              ),
            }
          : current,
      );
      setSelected((current) =>
        current && current.idTmdb === idTmdb
          ? { ...current, watchedAt }
          : current,
      );

      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_URL_API}/watchedMovie/watchedAt`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idTmdb, watchedAt }),
          },
        );

        if (!response.ok) throw new Error("Requisição rejeitada");

        const item = (await response.json()) as WatchedMovieItem;
        setData((current) =>
          current
            ? {
                ...current,
                items: current.items.map((existing) =>
                  existing.idTmdb === item.idTmdb ? item : existing,
                ),
              }
            : current,
        );
        setSelected((current) =>
          current && current.idTmdb === item.idTmdb ? item : current,
        );
      } catch {
        setData(previous);
        toast.error("Erro ao atualizar a data.");
        fetchWatched();
      }
    },
    [data, fetchWatched],
  );
```

Passar `onWatchedAtChange={updateWatchedAt}` ao `WatchedDetailSheet`. Importar `toast` de `react-toastify`.

Nota: as estatísticas do topo (`stats.lastWatchedAt`) vêm do servidor e não são recalculadas na atualização otimista — o refetch do erro e o próximo carregamento da página as corrigem. Aceito.

- [ ] **Step 18: Verificar no navegador**

1. Em `/movie/<id>` já assistido: o painel mostra "Você assistiu em" com a data. "Editar" abre o modal com a data preenchida; salvar outra data atualiza o painel na hora.
2. "Limpar data" deixa "Data não registrada" e o item continua assistido.
3. Data no futuro: o `max` do input impede escolher; se forçada por API, volta `400`.
4. Em `/serie/<id>`: mesmo roteiro.
5. Em `/assistidos`, abrir um card, editar a data pelo sheet: a lista atualiza sem recarregar. Com o backend derrubado no meio, a data volta ao valor anterior e aparece o toast de erro.
6. Um filme criado por nota (sem data) aceita ganhar data pelo sheet.

- [ ] **Step 19: Build, lint e auditoria**

```bash
cd /e/projects/guys-movies/guys-movies-frontend && npm run build && npm run lint:check
```

`differential-review` sobre os dois repos, cada achado por `fp-check`, registro em `docs/superpowers/audits/CP4.md`. **Risco principal a cobrar: IDOR.** O review tem de confirmar, linha a linha, que os dois `PATCH` derivam o usuário de `@CurrentUser('id')` e que o body não tem nem aceita campo de usuário.

- [ ] **Step 20: Commit do frontend**

```bash
cd /e/projects/guys-movies/guys-movies-frontend
git add components hooks pages docs/superpowers/audits/CP4.md
git commit -m "feat: edicao da data de assistido nos tres pontos de entrada"
```

---

## Task 5: `MediaHero` — enquadramento e swipe (CP5)

**Files:**
- Create: `guys-movies-frontend/components/_ui/mediaHero/index.tsx`
- Delete: `guys-movies-frontend/components/home/hero/index.tsx`
- Modify: `guys-movies-frontend/pages/index.tsx`
- Create: `guys-movies-frontend/docs/superpowers/audits/CP5.md`

**Interfaces:**
- Consumes: nada das tasks anteriores.
- Produces:

```ts
export interface HeroItem {
  id: number;
  href: string;
  title: string;
  overview: string;
  voteAverage: number;
  backdropPath: string | null;
  posterPath: string | null;
  date: string | null;
  badge: string;
}

interface MediaHeroProps {
  items: HeroItem[];
}
```

`MediaHero` é o default export de `components/_ui/mediaHero`. A Task 6 consome esse mesmo tipo em `series.tsx`.

**A causa do enquadramento ruim não é `object-position`:** é pedir que uma imagem 16:9 preencha um container de `78vh`, que no celular é quase 1:2. A correção troca a **fonte**, não o recorte — no celular entra o pôster 2:3, desenhado para ser vertical.

**`drag="x"` do framer-motion foi descartado:** exige `touch-action: none`, que compete com o scroll vertical da página. É o bug clássico do carrossel full-screen que engole o gesto para baixo. O swipe vem de `scroll-snap` nativo, que roda no compositor com momentum e rubber-banding do iOS.

- [ ] **Step 1: Criar o `MediaHero`**

Create `guys-movies-frontend/components/_ui/mediaHero/index.tsx`:

```tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaPlay, FaStar, FaChevronRight } from "react-icons/fa";

export interface HeroItem {
  id: number;
  href: string;
  title: string;
  overview: string;
  voteAverage: number;
  backdropPath: string | null;
  posterPath: string | null;
  date: string | null;
  badge: string;
}

interface MediaHeroProps {
  items: HeroItem[];
}

const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w780";
const THUMB_BASE_URL = "https://image.tmdb.org/t/p/w185";
const ROTATE_MS = 8000;
const MAX_SLIDES = 5;

const MediaHero: React.FC<MediaHeroProps> = ({ items }) => {
  const slides = useMemo(
    () =>
      items
        .filter((item) => item.backdropPath || item.posterPath)
        .slice(0, MAX_SLIDES),
    [items],
  );

  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: track.clientWidth * index, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number(
            (entry.target as HTMLElement).dataset.slideIndex ?? 0,
          );
          setActiveIndex(index);
        });
      },
      { root: track, threshold: 0.6 },
    );

    Array.from(track.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2 || isPaused) return;

    const timeoutId = setTimeout(
      () => goTo((activeIndex + 1) % slides.length),
      ROTATE_MS,
    );

    return () => clearTimeout(timeoutId);
  }, [activeIndex, goTo, isPaused, slides.length]);

  if (!slides.length) return null;

  const active = slides[activeIndex] ?? slides[0];

  return (
    <section
      className="relative -mt-[4.25rem] mb-4 h-[78vh] min-h-[520px] w-full overflow-hidden lg:-mt-20 lg:h-[86vh] lg:min-h-[620px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onPointerDown={() => setIsPaused(true)}
    >
      <div
        ref={trackRef}
        className="hide-scrollbar absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            data-slide-index={index}
            className="relative h-full w-full shrink-0 snap-center"
          >
            <picture>
              {slide.backdropPath && (
                <source
                  media="(min-width: 768px)"
                  srcSet={`${BACKDROP_BASE_URL}${slide.backdropPath}`}
                />
              )}
              <img
                src={
                  slide.posterPath
                    ? `${POSTER_BASE_URL}${slide.posterPath}`
                    : `${BACKDROP_BASE_URL}${slide.backdropPath}`
                }
                alt={slide.title}
                fetchPriority={index === 0 ? "high" : "low"}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className={`h-full w-full object-cover ${
                  slide.posterPath
                    ? "object-center"
                    : "object-[50%_30%] md:object-center"
                }`}
              />
            </picture>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05050c] via-[#05050c]/55 to-[#05050c]/85" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#05050c] via-[#05050c]/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#05050c] to-transparent" />

      <div className="pointer-events-none relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col justify-end px-4 pb-10 pt-24 sm:px-6 lg:px-10 lg:pb-16 xl:px-14">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="pointer-events-auto max-w-2xl"
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-indigo-400/30 bg-indigo-500/15 px-3 py-1 text-[0.6rem] font-black uppercase tracking-[0.2em] text-indigo-200">
              {active.badge}
            </span>
            {active.voteAverage > 0 && (
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1">
                <FaStar className="text-amber-400" size={10} />
                <span className="text-[0.7rem] font-black text-white">
                  {active.voteAverage.toFixed(1)}
                </span>
              </span>
            )}
            {active.date && (
              <span className="text-[0.7rem] font-bold text-white/45">
                {active.date}
              </span>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-black leading-[1.05] tracking-tight text-white drop-shadow-2xl sm:text-5xl lg:text-6xl xl:text-7xl">
            {active.title}
          </h1>

          <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            {active.overview}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={active.href}
              className="group flex h-12 items-center gap-2.5 rounded-full px-7 text-sm font-black tracking-tight bg-white text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.5)] active:translate-y-0 active:scale-[0.96]"
            >
              <FaPlay size={12} />
              Ver detalhes
            </Link>
            <a
              href="#catalogo"
              className="group flex h-12 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-6 text-sm font-bold tracking-tight text-white transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.11] active:translate-y-0 active:scale-[0.96]"
            >
              Explorar catálogo
              <FaChevronRight
                size={11}
                className="transition-transform duration-300 ease-ios group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </motion.div>

        {slides.length > 1 && (
          <div className="pointer-events-auto mt-8 flex items-center gap-2.5 lg:mt-10">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Ver ${slide.title}`}
                  aria-current={isActive}
                  className="group relative h-1 overflow-hidden rounded-full bg-white/15 transition-all duration-500 ease-ios"
                  style={{ width: isActive ? 56 : 20 }}
                >
                  {isActive && (
                    <motion.span
                      key={`${slide.id}-progress`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isPaused ? 0.35 : 1 }}
                      transition={{
                        duration: isPaused ? 0.3 : ROTATE_MS / 1000,
                        ease: "linear",
                      }}
                      className="absolute inset-0 origin-left rounded-full bg-white"
                    />
                  )}
                </button>
              );
            })}

            <div className="ml-3 hidden items-center gap-2 sm:flex">
              {slides.map((slide, index) => (
                <button
                  key={`thumb-${slide.id}`}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={slide.title}
                  className={`h-12 w-8 overflow-hidden rounded-md border transition-all duration-500 ease-ios hover:scale-110 ${
                    index === activeIndex
                      ? "border-white/70 opacity-100"
                      : "border-white/10 opacity-40 hover:opacity-80"
                  }`}
                >
                  {slide.posterPath && (
                    <img
                      src={`${THUMB_BASE_URL}${slide.posterPath}`}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default React.memo(MediaHero);
```

O que mudou em relação ao Hero antigo, e por quê:

- O `scale: 1.08 → 1` com `duration: 9` sumiu: mantinha uma camada promovida em tela cheia por nove segundos, concorrendo com o gesto no celular. O Ken Burns não volta nem no desktop — a troca de slide agora é scroll, não crossfade, e o zoom não tem onde encaixar.
- Os `backdrop-blur-md` dos badges saíram: eram três regiões borradas sobre a imagem que muda a cada gesto.
- O filtro de slides, antes preso a `backdrop_path`, aceita qualquer uma das duas fontes.
- `fetchPriority="high"` só no primeiro slide — ele é o elemento de LCP da página. Os demais são preguiçosos.
- `prefers-reduced-motion` já está coberto pelo `MotionConfig reducedMotion="user"` de `_app.tsx`; nada novo é preciso.

O React só passou a reconhecer a prop `fetchPriority` em camelCase na 18.3. Conferir a versão instalada antes de rodar:

```bash
cd /e/projects/guys-movies/guys-movies-frontend && node -p "require('react/package.json').version"
```

Se for menor que `18.3.0`, o console avisa "React does not recognize the fetchPriority prop" — nesse caso usar `fetchpriority` em minúsculas, que o React repassa como atributo cru.

- [ ] **Step 2: Consumir na home**

Em `pages/index.tsx`, trocar `import Hero from "../components/home/hero";` por:

```tsx
import MediaHero, { HeroItem } from "../components/_ui/mediaHero";
```

Acrescentar, dentro de `Home`:

```tsx
  const heroItems = useMemo<HeroItem[]>(
    () =>
      popularMovies.map((movie) => ({
        id: movie.id,
        href: `/movie/${movie.id}`,
        title: movie.title,
        overview: movie.overview,
        voteAverage: movie.vote_average,
        backdropPath: movie.backdrop_path ?? null,
        posterPath: movie.poster_path ?? null,
        date: movie.release_date ?? null,
        badge: "Em alta",
      })),
    [popularMovies],
  );
```

e trocar `<Hero movies={popularMovies} />` por `<MediaHero items={heroItems} />`. Acrescentar `useMemo` ao import de `react`.

- [ ] **Step 3: Deletar o Hero antigo**

```bash
cd /e/projects/guys-movies/guys-movies-frontend && rm -r components/home/hero && grep -rn "home/hero" --include=*.tsx --include=*.ts .
```
Esperado: grep sem resultado.

- [ ] **Step 4: Verificar no navegador**

Desktop (largura ≥ 768px):
1. O banner mostra o **backdrop** 16:9, sem distorção.
2. Setas de progresso e miniaturas navegam entre os slides, com scroll suave.
3. A rotação automática troca de slide a cada 8s e pausa com o mouse em cima.

Mobile (DevTools em iPhone, ou aparelho real):
1. O banner mostra o **pôster** 2:3, com o assunto enquadrado — não um recorte do meio de um backdrop.
2. Em Network, só uma das duas imagens é baixada (`w780` do pôster), não as duas.
3. Arrastar na horizontal troca de slide com momentum; arrastar na vertical **rola a página**, não é engolido pelo carrossel. Este é o teste que reprova `drag="x"`.
4. Um título sem pôster cai no backdrop com o enquadramento em 30% da altura.

- [ ] **Step 5: Build, lint e auditoria**

```bash
cd /e/projects/guys-movies/guys-movies-frontend && npm run build && npm run lint:check
```

`differential-review` + `fp-check`, registro em `docs/superpowers/audits/CP5.md`. Risco a cobrar: `posterPath` e `backdropPath` interpolados em URL de imagem — confirmar que só concatenam sobre `https://image.tmdb.org/t/p/`.

- [ ] **Step 6: Commit**

```bash
cd /e/projects/guys-movies/guys-movies-frontend
git add components pages/index.tsx docs/superpowers/audits/CP5.md
git commit -m "feat: MediaHero com poster no mobile e swipe nativo"
```

---

## Task 6: Banner na aba séries (CP6)

**Files:**
- Modify: `guys-movies-frontend/pages/series.tsx`
- Create: `guys-movies-frontend/docs/superpowers/audits/CP6.md`

**Depende de:** Task 5 (`MediaHero` e `HeroItem`) e Task 1 (`CatalogErrorState`).

**Interfaces:**
- Consumes: `MediaHero` e `HeroItem` de `components/_ui/mediaHero`; `CatalogErrorState` de `components/_ui/catalogErrorState`.
- Produces: `SerieProps` de `interfaces/series/types.ts` ganha `popularSeries: HeroSerie[]`, onde:

```ts
interface HeroSerie {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  backdrop_path: string | null;
  poster_path: string | null;
  first_air_date: string | null;
}
```

**Nenhuma mudança de backend.** `GET /series/popular` já existe e já devolve `backdrop_path`, `poster_path`, `name` e `first_air_date` — o `formatSeries` do `SeriesService` espalha o objeto cru da TMDB e formata a data em `dd/MM/yyyy`, igual ao lado de filmes.

- [ ] **Step 1: Segundo fetch no `getServerSideProps`**

Em `pages/series.tsx`, trocar o fetch único por dois em paralelo:

```tsx
    const [providerRes, popularRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/series/popularByProviders`),
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/series/popular`),
    ]);

    if (!providerRes.ok || !popularRes.ok) {
      throw new Error(
        "Ocorreu um erro ao buscar os dados, tente novamente mais tarde!",
      );
    }

    const [providerData, popularSeries] = await Promise.all([
      providerRes.json(),
      popularRes.json(),
    ]);
```

e acrescentar o normalizador, no mesmo estilo do `pickProviderSeries` já existente:

```tsx
const HERO_SERIES_LIMIT = 5;

const pickHeroSeries = (series: any) =>
  Array.isArray(series)
    ? series.slice(0, HERO_SERIES_LIMIT).map((serie: any) => ({
        id: serie.id,
        name: serie.name,
        overview: serie.overview ?? "",
        vote_average: serie.vote_average ?? 0,
        backdrop_path: serie.backdrop_path ?? null,
        poster_path: serie.poster_path ?? null,
        first_air_date: serie.first_air_date ?? null,
      }))
    : [];
```

Devolver `popularSeries: pickHeroSeries(popularSeries)` nas props do caminho feliz e `popularSeries: []` no `catch`.

- [ ] **Step 2: Acrescentar o campo ao tipo**

Em `interfaces/series/types.ts`, acrescentar a `SerieProps`:

```ts
export interface HeroSerie {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  backdrop_path: string | null;
  poster_path: string | null;
  first_air_date: string | null;
}

export interface SerieProps {
  providerData: ProviderSeries[];
  popularSeries: HeroSerie[];
  error?: string;
}
```

- [ ] **Step 3: Reorganizar o layout**

Hoje o `<main>` de séries **é** o container `max-w-[1600px]` com `pt-8`. O Hero precisa ficar full-bleed fora dele, com o mesmo `-mt-[4.25rem]` que a home usa para passar sob o header transparente — esse deslocamento já vem de dentro do `MediaHero`.

Substituir o `<main>` inteiro por:

```tsx
      <main className="relative overflow-x-hidden">
        <MediaHero items={heroItems} />

        <div className="relative mx-auto w-full max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-10 xl:px-14">
          <div className="aurora" />

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="relative mb-4"
          >
            {/* bloco copiado sem alteração de series.tsx:65-73 */}
          </motion.header>

          {providerData.map((provider, index) => (
            {/* bloco copiado sem alteração de series.tsx:77-126 */}
          ))}
        </div>
      </main>
```

O `motion.header` e o `providerData.map` são movidos **verbatim** do arquivo atual (linhas 59-127) para dentro do novo `<div>` container. Nenhuma linha deles muda; só a indentação. Os marcadores acima existem só neste plano — o arquivo final não leva comentário nenhum.

O `pt-8` sai (o Hero encosta no topo) e o `aurora` desce para dentro do container, como na home.

- [ ] **Step 4: Montar os `heroItems`**

```tsx
  const heroItems = useMemo<HeroItem[]>(
    () =>
      popularSeries.map((serie) => ({
        id: serie.id,
        href: `/serie/${serie.id}`,
        title: serie.name,
        overview: serie.overview,
        voteAverage: serie.vote_average,
        backdropPath: serie.backdrop_path,
        posterPath: serie.poster_path,
        date: serie.first_air_date,
        badge: "Em alta",
      })),
    [popularSeries],
  );
```

Imports novos: `useMemo` de `react`, `MediaHero` e `HeroItem`. O componente `Serie` precisa desestruturar `popularSeries` das props.

- [ ] **Step 5: Trocar o estado de erro pelo `CatalogErrorState`**

Substituir o bloco `if (error)` pelo componente da Task 1, com `useRouter` e o mesmo `retry`, título "Não conseguimos carregar as séries".

- [ ] **Step 6: Verificar no navegador**

1. `/series` abre com o banner no topo, passando sob o header, sem faixa escura entre header e imagem.
2. Desktop: backdrop 16:9. Mobile: pôster 2:3. Swipe horizontal troca; vertical rola a página.
3. "Ver detalhes" leva a `/serie/<id>`, não a `/movie/<id>`.
4. O cabeçalho "Séries em alta agora" aparece **abaixo** do banner, dentro do container, alinhado com os carrosséis.
5. Com o backend fora do ar, aparece o card de erro com retry.

- [ ] **Step 7: Build, lint e auditoria**

```bash
cd /e/projects/guys-movies/guys-movies-frontend && npm run build && npm run lint:check
```

`differential-review` + `fp-check`, registro em `docs/superpowers/audits/CP6.md`.

- [ ] **Step 8: Commit**

```bash
cd /e/projects/guys-movies/guys-movies-frontend
git add pages/series.tsx interfaces/series/types.ts docs/superpowers/audits/CP6.md
git commit -m "feat: banner na aba series"
```

---

## Task 7: Fluidez dos modais (CP7)

**Files:**
- Modify: `guys-movies-frontend/components/_ui/modal/index.tsx`
- Modify: `guys-movies-frontend/components/watched/watchedDetailSheet.tsx`
- Modify: `guys-movies-frontend/components/watched/watchedTile.tsx`
- Create: `guys-movies-frontend/docs/superpowers/audits/CP7.md`

**Interfaces:**
- Consumes: `WatchedDateForm` da Task 4 (já embutido no sheet).
- Produces: nenhuma API nova. `Modal` e `WatchedDetailSheet` mantêm as props que já têm.

Quatro causas, três da mesma família:

1. **Animar elementos que carregam `backdrop-filter`.** O painel do `Modal` usa `glass-strong` (`blur(28px) saturate(180%)`) e anima `y` e `scale` nele: cada quadro muda a região borrada e força o recálculo de um blur de 28px em tela cheia a 60fps. O overlay repete o padrão com `backdrop-blur-md` animando `opacity`. Causa principal.
2. **Curva com cauda morta.** `duration: 0.45` com `cubic-bezier(0.32, 0.72, 0, 1)` percorre quase todo o trajeto no início e arrasta os últimos ~40% num movimento imperceptível — lido como "travou no fim".
3. **Scroll do body restaurado cedo demais.** `modal/index.tsx:30-34` restaura no cleanup, quando `isOpen` vira `false`, mas a saída ainda roda por 450ms: a página atrás volta a rolar durante o fechamento. Pior, restaura para `""` em vez do valor anterior, quebrando modais sobrepostos. O `watchedDetailSheet` já faz isso certo, salvando `previousOverflow`.
4. **`layoutId` sobre grade grande.** No sheet o pôster voa do card via `layoutId`. Animação de layout é medida e escrita pela thread principal a cada quadro, aqui sobre um `motion.div layout` com até 500 cards e três camadas de `backdrop-blur` empilhadas. Trecho mais caro do app.

- [ ] **Step 1: Reescrever o `Modal`**

Substituir `components/_ui/modal/index.tsx` inteiro:

```tsx
import React, { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const MOBILE_QUERY = "(max-width: 639px)";

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
}) => {
  const previousOverflowRef = useRef("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobile(query.matches);

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const restoreScroll = () => {
    document.body.style.overflow = previousOverflowRef.current;
  };

  return (
    <AnimatePresence onExitComplete={restoreScroll}>
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 backdrop-blur-md" />

          <motion.div
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "12%", opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
            className="relative z-10 w-full sm:max-w-lg"
          >
            <div className="glass-strong max-h-[92vh] overflow-hidden rounded-t-[2rem] shadow-lift sm:rounded-[2rem]">
              <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-white/20 sm:hidden" />

              <div className="flex items-center justify-between px-6 pb-4 pt-5">
                <div className="flex items-center gap-0.5">
                  <span className="brand-text text-lg font-black tracking-tight">
                    GUY&apos;S
                  </span>
                  <span className="text-lg font-black tracking-tight text-white">
                    Filmes
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/60 transition-all duration-300 ease-ios hover:bg-white/[0.12] hover:text-white active:scale-90"
                >
                  <FaTimes size={13} />
                </button>
              </div>

              <div className="hide-scrollbar max-h-[calc(92vh-5rem)] overflow-y-auto overscroll-contain px-6 pb-8">
                {title && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-black tracking-tight text-white">
                      {title}
                    </h2>
                    {subtitle && (
                      <p className="mt-1.5 text-sm text-white/45">{subtitle}</p>
                    )}
                    <div className="mt-4 h-px w-full bg-gradient-to-r from-indigo-500/60 via-purple-500/25 to-transparent" />
                  </div>
                )}
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
```

O que mudou, ponto a ponto:

- O wrapper animado carrega só `transform` e `opacity`; o `glass-strong` virou filho estático, então o blur é rasterizado uma vez em vez de a cada quadro.
- O overlay borrado é uma `div` estática; só a camada sólida `bg-black/70` faz fade.
- Mola `stiffness: 420, damping: 38` no lugar do tween de 0.45s, e saída de 0.2s — fechar deve parecer instantâneo.
- O `scale` saiu da animação: com o blur separado ele não acrescenta nada e custa uma composição a mais.
- `drag="y"` só no mobile.
- O `overflow` do body é restaurado em `onExitComplete`, preservando o valor anterior.

- [ ] **Step 2: Tirar os `layoutId` do par tile/sheet**

Em `components/watched/watchedTile.tsx`: remover `layoutId={`watched-${movie.idTmdb}`}` do `motion.button` e `layoutId={`watched-poster-${movie.idTmdb}`}` do `motion.img` (que pode voltar a ser `<img>`).

Em `components/watched/watchedDetailSheet.tsx`: remover os dois `layoutId` correspondentes e trocar a entrada por scale + fade:

```tsx
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={movie.title ?? "Detalhes do filme"}
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="relative w-full max-w-3xl"
          >
            <div className="max-h-[92vh] overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#0a0a16]/95 shadow-lift sm:rounded-[2rem]">
              {/* handle, botão de fechar e o bloco de conteúdo, copiados sem alteração de watchedDetailSheet.tsx:81-172 */}
            </div>
          </motion.div>
```

E o overlay do sheet segue o mesmo padrão do `Modal`: uma `div` estática com `backdrop-blur-md` e uma `motion.div` sólida fazendo fade. O `backdrop-blur-2xl` sai do painel — o fundo já é `bg-[#0a0a16]/95`, quase opaco; o blur atrás dele não aparece e custa uma camada.

**Esta é uma mudança visível:** o pôster deixa de voar do card para o sheet. Foi escolhida deliberadamente em favor da fluidez, e está registrada na spec.

- [ ] **Step 3: Restaurar o `overflow` do sheet em `onExitComplete`**

O `watchedDetailSheet` já salva `previousOverflow`, mas restaura no cleanup do efeito. Mover a restauração para `onExitComplete` do `AnimatePresence`, com o valor guardado num `useRef`, igual ao `Modal`.

- [ ] **Step 4: Medir**

No DevTools, aba Performance, com CPU throttling 4x:

1. Em `/movie/<id>`, gravar abrindo e fechando o modal 3 vezes. Esperado: nenhum long task acima de 50ms durante a transição; quadros em 60fps.
2. Em `/assistidos` com pelo menos 50 filmes, gravar abrindo e fechando o sheet 3 vezes. Comparar com uma gravação de antes (`git stash`) — o pico de "Recalculate Style" e "Layout" tem de cair visivelmente. É o trecho que o `layoutId` dominava.

- [ ] **Step 5: Verificar comportamento**

1. Modal abre e fecha; fechar parece instantâneo, sem cauda arrastada.
2. Durante o fechamento, a página atrás **não** rola.
3. Modal aberto de dentro de outro contexto com scroll travado devolve o `overflow` ao valor anterior, não a `""`.
4. No mobile, arrastar o modal para baixo fecha. No desktop, arrastar não faz nada e a seleção de texto funciona.
5. `Esc` fecha; clicar no overlay fecha.
6. O sheet de `/assistidos` abre com scale+fade, sem o pôster voando.
7. Com `prefers-reduced-motion: reduce` ligado no SO, as transições são instantâneas (via `MotionConfig reducedMotion="user"`).

- [ ] **Step 6: Build, lint e auditoria**

```bash
cd /e/projects/guys-movies/guys-movies-frontend && npm run build && npm run lint:check
```

`differential-review` + `fp-check`, registro em `docs/superpowers/audits/CP7.md`. Sem superfície de segurança neste checkpoint; o risco é de regressão visual e de estado.

- [ ] **Step 7: Commit**

```bash
cd /e/projects/guys-movies/guys-movies-frontend
git add components docs/superpowers/audits/CP7.md
git commit -m "perf: separa borrao de movimento nos modais e remove layoutId"
```

---

## Fora de escopo

Registrado aqui para que a ausência seja deliberada e não um esquecimento:

- Séries na aba "assistidos" — exigiria `/watchedSerie/list`, filtro por tipo e estatísticas unificadas.
- Fundir `/movie/[id]` e `/serie/[id]` numa rota única — implicaria migração de rotas e redirects.
- Harness de teste no frontend — jest e testing-library são um projeto próprio, com decisões que cabem ao autor.
- Fechar a divergência de toasts entre a página de filme e a de série (a de filme não avisa ao desmarcar nem ao mexer na watchlist). A Task 2 preserva as duas como estão; unificar é uma decisão de produto, não um efeito colateral de refactor.
- Qualquer refatoração não exigida pelas sete tarefas.
