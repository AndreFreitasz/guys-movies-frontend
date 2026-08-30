# CP2 — useWatchedMedia

## Contexto de execução

Steps 5 e 7 do brief (verificação no navegador logado e a auditoria via
`differential-review`/`fp-check`) foram pulados por decisão do controller: o
Docker está parado nesta máquina, não há harness de browser disponível, e a
revisão diferencial é disparada pelo controller depois deste report. Nenhum
comportamento foi verificado visualmente; a verificação abaixo é por leitura
de diff e pelo build.

## Alterações

### `hooks/useWatchedMedia.ts` (novo)

Hook `useWatchedMedia({ kind, idTmdb, buildPayload, labels })`, transcrito
literalmente do brief, incluindo os arrays de dependência dos `useCallback`.
Consome `authFetch` e `useAuth`. Concentra o estado (`isWatched`, `rating`,
`isWaiting`, `watchedLoading`, `isWaitingLoading`) e as três ações
(`toggleWatched`, `setRating`, `toggleWaiting`) que antes existiam duplicadas
em `pages/movie/[id].tsx` e `pages/serie/[id].tsx`. Os toasts que só uma das
duas páginas emitia (`watchedRemoved`, `waitingAdded`, `waitingRemoved`)
ficaram como campos opcionais em `WatchedMediaLabels`: quando a página não
passa o label, nenhum toast é disparado.

O carregamento inicial (`loadState`) troca os três `useCallback` +
`Promise.all` de cada página por um único `Promise.allSettled`, efeito
equivalente: falha de uma chamada não derruba as outras nem altera o estado
correspondente. A única diferença observável é a perda do `console.error`
que só a página de série emitia quando `getRate` falhava — não afeta UI nem
toasts.

### `pages/movie/[id].tsx` (449 → 267 linhas)

Removidos `showToast`, `validateUser`, `sendWatchedRequest`, `getRating`,
`checkIsWaiting`, `checkIsWatched`, `fetchData`, o `useEffect` que chamava
`fetchData`, `handleWaitingClick`, `handleRating` e os estados `rating`,
`isWatched`, `watchedLoading`, `isWaiting`, `isWaitingLoading` — tudo migrado
para `useWatchedMedia`. Removidos os imports de `authFetch` e `useAuth` (o
segundo ficou sem uso na página: `user`/`authLoading` só alimentavam
`validateUser`, que agora vive dentro do hook como `requireUser`). O import
de `toast` permanece, usado em `handleWatchedSubmit` para o aviso de data
ausente. Os estados `loading` (nunca setado com `true`) e `isClient` foram
mantidos exatamente como estavam.

`buildMoviePayload` foi mantido intocado. `handleWatchedClick` e
`handleWatchedSubmit` passaram a chamar `toggleWatched` do hook em vez de
`sendWatchedRequest` + updates manuais de estado. `handleWaitingClick` e
`handleRating` foram removidos: `MediaPosterCard.onWatchlistToggle`,
`waitingConfig.onClick` e `ratingConfig.onChange` agora recebem
`toggleWaiting` e `setRating` do hook diretamente.

Labels passadas (idênticas ao brief): `authRequired`, `watchedSuccess`,
`watchedError`, `missingDate`, `waitingError`, `ratingBlocked`,
`ratingError`. Sem `watchedRemoved`, `waitingAdded` nem `waitingRemoved` —
preserva o comportamento de hoje: filme não toasta ao desmarcar como
assistido nem ao alternar a watchlist.

### `pages/serie/[id].tsx` (466 → 272 linhas)

Mesma cirurgia da página de filme, com `kind: "serie"`, `idTmdb: serie.id` e
`buildPayload: buildSeriePayload`. Labels passadas incluem também
`watchedRemoved`, `waitingAdded` e `waitingRemoved`, preservando os quatro
toasts que a página de série já emitia hoje (desmarcar assistido, adicionar
à watchlist, remover da watchlist). O `console.error` que existia dentro do
`catch` de `getRating` não tem equivalente no hook (ver nota acima sobre
`loadState`); é a única diferença observável, e é apenas de console, não de
UI.

## Comandos executados

```
$ npm run build
✓ Compiled successfully
✓ Generating static pages (3/3)
Route (pages)                              Size     First Load JS
├ ƒ /movie/[id]                            1.95 kB         181 kB
├ ƒ /serie/[id]                            1.93 kB         181 kB
(build completo, sem erros de tipo)

$ npx prettier --check hooks/useWatchedMedia.ts "pages/movie/[id].tsx" "pages/serie/[id].tsx" docs/superpowers/audits/CP2.md
Checking formatting...
All matched files use Prettier code style!

$ wc -l "pages/movie/[id].tsx" "pages/serie/[id].tsx"
267 pages/movie/[id].tsx
272 pages/serie/[id].tsx
```

As duas páginas ficaram acima da estimativa de "por volta de 200" do brief
(267 e 272), mas bem abaixo do limite de alerta de 300 linhas — a diferença
vem de `formattedDate`/`genresLabel`/`quickDetails`/`creators`/`seasonsLabel`
(memos de apresentação específicos de cada página, fora do escopo do hook) e
do próprio JSX de layout, que não muda de tamanho com este refactor.

## Achados

Achado esperado e aceito, sem correção necessária: frontend modificado sem
teste automatizado; o harness de teste de frontend está fora do escopo desta
leva (ver spec §5).

Decisão de julgamento registrada: o brief não listava explicitamente a
remoção de `const { user, authLoading } = useAuth();` nem do import de
`useAuth` nas duas páginas. Como `validateUser` — o único consumidor dessas
variáveis — migrou para o hook, elas ficariam sem uso caso permanecessem;
foram removidas junto com o import de `authFetch`, pela mesma lógica de
"a lógica que migrou para o hook sai da página". Não altera comportamento
observável.
