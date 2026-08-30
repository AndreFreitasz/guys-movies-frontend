# CP1 — Tela azul intermitente

## Contexto de execução

Steps 1, 2, 4, 7 e 9 do brief (subir o app, reproduzir no browser, diagnosticar
via DevTools e verificar visualmente) foram pulados por decisão do controller:
o Docker está parado nesta máquina e não há harness de browser disponível. Os
dois fixes (H1 e H2) foram aplicados diretamente, sem diagnóstico prévio, por
serem estritamente mais seguros que o estado atual independentemente de qual
hipótese realmente causa o bug. A verificação visual foi delegada ao humano
separadamente.

## Alterações

### `pages/_app.tsx` (fix H1)

Removidos `mode="wait"` e `exit={{ opacity: 0 }}` do `AnimatePresence` que
envolve o `Component` da página. O estado final da transição passa a ser
sempre `opacity: 1`; uma navegação interrompida no meio da transição não tem
mais como deixar a página com `opacity: 0` permanente. `initial={false}`
foi mantido para não gerar fade no primeiro render.

### `components/_ui/catalogErrorState/index.tsx` (novo)

Componente `CatalogErrorState`, extraído do bloco de erro que já existia em
`pages/index.tsx`, com um botão "Tentar de novo" adicionado. Recebe `title`,
`message` e `onRetry`. Será reutilizado pela Task 6 em `series.tsx`.

### `pages/index.tsx` (fix H2)

- Trocado o import de `LoadingSpinner` por `useRouter` (`next/router`) e por
  `CatalogErrorState`.
- Adicionados `router`, `retry` e `hasCatalog` logo após `seenIdsRef`, antes
  de qualquer `return` condicional — todos os hooks do componente `Home`
  (`useState`, `useRef`, `useRouter`, `useCallback`, `useEffect`) continuam
  acima do bloco `if (error || !hasCatalog)`.
- O bloco `if (error)` virou `if (error || !hasCatalog)`, usando
  `CatalogErrorState` no lugar do markup de erro inline, com `onRetry={retry}`
  chamando `router.replace(router.asPath)`.
- Removido o ternário `{!initialProviderData.length ? <LoadingSpinner /> : <main>...}`:
  agora o `<main>` é renderizado direto, sem spinner infinito quando o
  catálogo volta vazio — nesse caso o `if (error || !hasCatalog)` já
  interceptou o render antes de chegar ao `<main>`.

`LoadingSpinner` continua em uso em `pages/movie/[id].tsx`,
`pages/serie/[id].tsx` e `components/mediaDetails/experiencePanel.tsx`; só o
import em `pages/index.tsx` foi removido.

## Achados

Achado esperado e aceito, sem correção necessária: frontend modificado sem
teste automatizado; o harness de teste de frontend está fora do escopo desta
leva (ver spec §5).
