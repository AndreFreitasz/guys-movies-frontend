# Capa de perfil, tela de detalhe, abas e cards

Data: 2026-10-20
Escopo: `guys-movies-frontend` e `guys-movies-backend`

Seis mudanças pedidas em conjunto: quatro de interface (todas validadas em mockup
com o usuário), uma correção de bug e uma integração externa nova.

## Decisões já fechadas

| Item | Decisão | Validado |
|---|---|---|
| 1. Capa do perfil | Sem recorte + moldura borrada | mockup |
| 3. Abas Filmes/Séries | Abas grandes estilo Netflix, viram o título | mockup |
| 4+5. Tela de detalhe | Notas como chips de metadado, sinopse dominante | mockup |
| 6. Ano nos cards | Selo de vidro no canto superior esquerdo | mockup |
| Fonte das notas | OMDb: Rotten Tomatoes + Metacritic | terminal |
| Filtro com bug | É o de Diretor (não existe filtro de elenco) | terminal |

---

## 1. Capa do perfil sem recorte

**Problema.** A perda de nitidez não vem da resolução — `profileCover.tsx` já pede
`original` à TMDB. Vem do tratamento: `backdrop-blur-[2px]` aplicado sobre a
imagem inteira, `opacity-[0.76]`, três gradientes sobrepostos e
`object-cover object-top`, que recorta e ainda enquadra no topo.

**Solução.** Duas camadas no mesmo contêiner:

- fundo: a própria imagem em `object-cover`, `blur(40px)`, `scale(1.15)`,
  `opacity .55` — preenche as laterais sem deixar barras vazias;
- frente: a imagem em `object-contain`, centralizada, **sem recorte, sem blur,
  sem opacidade**, com máscara de degradê só na base.

Sai o `backdrop-blur`, sai a `opacity` da camada da frente e os três gradientes
viram um só (`to top`, fundindo no `#05050c`).

**Altura.** Passa de fixa (`h-104 / sm:h-140 / lg:h-172`) para `48vh` no mobile e
`62vh` a partir de `md`, com `max-height` para telas muito altas. As informações
do perfil passam a ficar sobre a imagem, não abaixo dela.

**Arquivos.** `components/profile/profileCover.tsx` (reescrita das camadas),
`components/profile/profileHero.tsx` e `pages/perfil/[username].tsx`
(sobreposição e espaçamento).

**Risco.** Pôsteres muito estreitos deixam a moldura borrada dominar. Mitigação:
`max-width` na camada da frente, para a imagem real nunca ficar menor que ~55% da
largura.

---

## 2. Duplicação no filtro de Diretor + diretores no topo

**Investigação feita.** Descartados:

- backend duplicando linhas — `listWatchedMovies` usa `find()` com relação
  to-one, que não multiplica;
- dados duplicados — consulta ao banco não encontrou nenhum par
  (usuário, filme) repetido;
- regressão da atualização de libs — `mode="popLayout"` já existia no commit
  `9cd73e1`, anterior às atualizações.

**Causa provável.** `pages/assistidos.tsx` envolve a lista em
`<AnimatePresence mode="popLayout">`, mas `WatchedTile` e `WatchedSerieTile` são
`React.FC` comuns: retornam um `motion.button` sem encaminhar ref. O `popLayout`
precisa de ref no filho direto para medir e posicionar (`position: absolute`) o
item que sai; sem ela, o item some do fluxo mas continua desenhado — o "filme
repetido". Agrava-se ao trocar filtros rápido, que é exatamente o relato.

Além disso **nenhum dos dois tiles define `exit`**, então o `popLayout` não está
animando saída nenhuma: hoje é só custo e risco.

**Procedimento.** Reproduzir primeiro (systematic-debugging), confirmar a causa,
e só então corrigir. Se a reprodução apontar outra origem, a spec é revisada
antes de qualquer correção.

**Correção prevista.** `React.forwardRef` nos dois tiles encaminhando a ref ao
`motion.button`, mais um `exit` explícito. Se a reprodução mostrar que o
`popLayout` não agrega nada, trocar por `mode="sync"`.

**Diretores no topo.** Ordenação em dois níveis em `visibleMovies`: itens cujo
`director` está em `directors` vêm primeiro; dentro de cada grupo, mantém-se a
ordenação escolhida (recente / nota / título). Implementado como uma chave de
partição antes do `sortMovies` atual, sem alterar as ordenações existentes.

**Arquivos.** `components/watched/watchedTile.tsx`,
`components/watched/watchedSerieTile.tsx`, `pages/assistidos.tsx`.

---

## 3. Abas Filmes / Séries

As abas sobem para **acima** do título e passam a ser elas próprias o título
(~27px). O `<h1>` atual ("Filmes assistidos" / "Séries assistidas") é removido
por redundância; o parágrafo de apoio permanece.

- sublinhado que desliza entre as abas (`layoutId` do framer-motion), respeitando
  `prefers-reduced-motion`;
- contador por aba, para ver os dois totais sem trocar de aba;
- alvo de toque de 44px (hoje ~32px);
- `role="tablist"` / `aria-selected` preservados.

Extraído para `components/watched/collectionTabs.tsx` — `assistidos.tsx` já tem
mais de 1.100 linhas e não deve receber mais marcação.

---

## 4. Notas externas (Rotten Tomatoes + Metacritic)

### Backend

Módulo novo `src/ratings/`:

- `RatingsService.forImdbId(imdbId)` → `https://www.omdbapi.com/?i=<id>&apikey=<key>`
- resposta: `{ rottenTomatoes: number | null, metacritic: number | null }`
- parse do array `Ratings[]`: `"Rotten Tomatoes"` vem como `"85%"`,
  `"Metacritic"` como `"67/100"` — ambos normalizados para inteiro 0–100
- cache via `TtlCache` já existente (TTL 24h, dedup de in-flight incluído)

**A OMDb devolve erro com HTTP 200**, sinalizando no corpo
(`{"Response":"False","Error":"..."}`). O parser verifica `Response`, não o
status.

**Degradação suave, obrigatória em todos os caminhos:** sem `OMDB_API_KEY`, com
OMDb indisponível, com `imdb_id` ausente ou com a fonte sem nota para o título, o
campo volta `null` e a tela apenas não desenha aquele selo. A página de detalhe
nunca falha por causa das notas externas.

**Origem do `imdb_id`.** Filmes: já vem na resposta de `/movie/{id}` da TMDB.
Séries: exige uma chamada a `/tv/{id}/external_ids`, também cacheada.

**Metacritic em séries é frequentemente ausente** na OMDb (verificado: Breaking
Bad retorna só IMDb e Rotten Tomatoes). Em séries, o normal será exibir TMDB +
Rotten Tomatoes.

**Testes** (Jest, padrão do repositório): resposta completa; resposta sem
Metacritic; `Response:"False"`; falha de rede; chave ausente; cache hit sem
segunda chamada HTTP.

**Configuração.** `OMDB_API_KEY` no `.env` local (já feito) e no painel do Render.
`.env.example` recebe só o nome da variável.

### Frontend

As notas viram chips na linha de metadados, ao lado de ano e duração. Cada fonte
tem sua cor: TMDB verde, Rotten Tomatoes vermelho, Metacritic amarelo. Chip de
fonte sem nota não é renderizado.

---

## 5. Sinopse em destaque + fim do vão

Ordem nova na coluna direita: **título → linha de metadados (ano · duração ·
chips de nota) → sinopse → barra de ação**.

A sinopse sai de `children` (3ª linha da grid) e sobe para o bloco do cabeçalho,
em corpo maior e com bom entrelinhamento. O vão atual vem do `gap-y-8` da grid
somado ao padding do painel; com a sinopse ocupando esse espaço e a ação virando
uma barra fina, ele desaparece.

O texto de apoio *"Gerencie rapidamente o que já assistiu…"* é removido: ocupa
três linhas, não acrescenta informação aos botões e é parte do que empurra a
sinopse para baixo.

**Arquivos.** `components/mediaDetails/detailLayout.tsx` (grid),
`heroHeader.tsx` (metadados + chips), `synopsis.tsx` (tipografia),
`experiencePanel.tsx` (barra fina), `pages/movie/[id].tsx`, `pages/serie/[id].tsx`.

---

## 6. Ano nos cards

Selo de vidro no canto superior esquerdo, espelhando o selo de nota à direita:
`rounded-lg`, fundo `black/55`, borda `white/14`, `backdrop-blur`, ~9px.

Sempre visível — **nunca apenas no hover**, que não existe no celular.

Sete componentes: `home/movieCard`, `series/seriesCard`, `watched/watchedTile`,
`watched/watchedSerieTile`, `watchlist/watchlistCard`, `profile/favoriteShelf`,
`profile/timelineList`. Alguns ainda não recebem a data por prop; a ligação entra
junto.

Séries usam `first_air_date`. Sem data, nada é renderizado — sem traço nem espaço
reservado.

Helper único `formatYear(date: string | null): string | null` em `utils/`, para
os sete cards não repetirem o parsing.

---

## Fora de escopo

- **Índice único em `watched_movie(usuário, filme)`.** A tabela não tem essa
  constraint; hoje não há duplicatas, mas nada impede que surjam — e aí a lista
  mostraria repetidos de verdade, por dados e não por animação. Levantado ao
  usuário, que não pediu a migration. Fica registrado.
- **Filtro de elenco/ator.** Confirmado que o item se referia ao filtro de
  Diretor. Criar filtro de elenco exigiria o backend passar a guardar o elenco
  dos assistidos.
- **Infraestrutura de testes no frontend.** Não existe hoje. As mudanças visuais
  são validadas rodando o app. Montar um framework de testes não foi pedido.

## Verificação

- Backend: `nest build`, suíte Jest (248 testes atuais + os novos de ratings),
  `eslint` limpo.
- Frontend: `next build` limpo, `tsc --noEmit` limpo, app rodando com as telas
  afetadas conferidas no navegador (perfil, detalhe de filme, detalhe de série,
  assistidos, watchlist, busca, home, séries).
- A tela de detalhe é conferida com e sem `OMDB_API_KEY` definida, para garantir
  que a ausência dos selos não quebra o layout.
