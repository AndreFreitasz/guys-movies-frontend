# Capa de perfil, tela de detalhe, abas e cards — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar as seis mudanças aprovadas: capa de perfil sem recorte, correção da duplicação no filtro de diretor, abas grandes, notas de Rotten Tomatoes e Metacritic, sinopse em destaque e o ano em todos os cards.

**Architecture:** O backend ganha um módulo `ratings` que consulta a OMDb pelo `imdb_id` e devolve notas normalizadas, cacheadas pelo `TtlCache` existente; a tela de detalhe do frontend é reordenada para metadados → sinopse → barra de ação; a capa do perfil troca recorte por imagem inteira sobre moldura borrada; as abas viram o título da página; e um helper único alimenta o selo de ano nos cards.

**Tech Stack:** Backend NestJS 11, TypeScript 6, TypeORM 1, Jest 30, axios. Frontend Next 16 (Pages Router), React 18, TypeScript 7, Tailwind 4, framer-motion 14.

**Spec:** `guys-movies-frontend/docs/superpowers/specs/2026-10-20-perfil-detalhe-e-cards-design.md`

## Global Constraints

- **Sem comentários no código, nomes em inglês.** Regra de estilo inegociável do projeto, vale para todo arquivo tocado.
- **Commitar direto na `main`.** Nunca criar branch. Um commit por tarefa.
- **Dois repositórios:** `E:\projects\guys-movies\guys-movies-backend` e `E:\projects\guys-movies\guys-movies-frontend`. Caminhos nas tarefas são relativos à raiz do repositório indicado.
- **Degradação suave das notas externas:** sem `OMDB_API_KEY`, com a OMDb fora do ar, sem `imdb_id` ou sem nota para o título, o valor é `null` e o selo não é renderizado. A tela nunca falha por causa disso.
- **A OMDb responde erro com HTTP 200**, sinalizando em `Response: "False"`. Sempre checar o corpo, nunca só o status.
- **Nada de ano só no hover.** Celular não tem hover; o ano é sempre visível.
- Backend: Prettier com `arrowParens: "avoid"`, aspas simples. Frontend: aspas duplas. Rodar `npm run lint:fix` antes de cada commit.
- Verificação por tarefa: backend `npx nest build` + `npx jest`; frontend `npx next build`. Nenhuma tarefa é commitada com build quebrado.

---

### Task 1: Serviço de notas externas (OMDb)

**Files:**
- Create: `guys-movies-backend/src/ratings/ratings.service.ts`
- Create: `guys-movies-backend/src/ratings/ratings.module.ts`
- Create: `guys-movies-backend/src/ratings/critic-scores.dto.ts`
- Test: `guys-movies-backend/src/ratings/ratings.service.spec.ts`

**Interfaces:**
- Consumes: `TtlCache` de `src/common/ttl-cache.ts` — `new TtlCache<T>(ttlMs, maxEntries)` e `cache.resolve(key, loader)`.
- Produces: `CriticScoresDto { rottenTomatoes: number | null; metacritic: number | null }` e `RatingsService.forImdbId(imdbId: string | null | undefined): Promise<CriticScoresDto>`. As tarefas 2 e 3 dependem desses nomes exatos.

- [ ] **Step 1: Escrever o DTO**

`src/ratings/critic-scores.dto.ts`:

```ts
export class CriticScoresDto {
  rottenTomatoes: number | null;
  metacritic: number | null;
}
```

- [ ] **Step 2: Escrever os testes que falham**

`src/ratings/ratings.service.spec.ts`:

```ts
import axios from 'axios';
import { RatingsService } from './ratings.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const omdbPayload = (ratings: { Source: string; Value: string }[]) => ({
  data: { Response: 'True', Ratings: ratings },
});

describe('RatingsService', () => {
  let service: RatingsService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OMDB_API_KEY = 'test-key';
    service = new RatingsService();
  });

  it('normaliza rotten tomatoes e metacritic', async () => {
    mockedAxios.get.mockResolvedValue(
      omdbPayload([
        { Source: 'Internet Movie Database', Value: '7.6/10' },
        { Source: 'Rotten Tomatoes', Value: '85%' },
        { Source: 'Metacritic', Value: '67/100' },
      ]),
    );

    await expect(service.forImdbId('tt3896198')).resolves.toEqual({
      rottenTomatoes: 85,
      metacritic: 67,
    });
  });

  it('devolve null para a fonte ausente', async () => {
    mockedAxios.get.mockResolvedValue(
      omdbPayload([{ Source: 'Rotten Tomatoes', Value: '96%' }]),
    );

    await expect(service.forImdbId('tt0903747')).resolves.toEqual({
      rottenTomatoes: 96,
      metacritic: null,
    });
  });

  it('trata Response False como ausencia de notas', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { Response: 'False', Error: 'Incorrect IMDb ID.' },
    });

    await expect(service.forImdbId('tt0000000')).resolves.toEqual({
      rottenTomatoes: null,
      metacritic: null,
    });
  });

  it('nao propaga falha de rede', async () => {
    mockedAxios.get.mockRejectedValue(new Error('ECONNRESET'));

    await expect(service.forImdbId('tt3896198')).resolves.toEqual({
      rottenTomatoes: null,
      metacritic: null,
    });
  });

  it('nao chama a omdb sem chave configurada', async () => {
    delete process.env.OMDB_API_KEY;
    const withoutKey = new RatingsService();

    await expect(withoutKey.forImdbId('tt3896198')).resolves.toEqual({
      rottenTomatoes: null,
      metacritic: null,
    });
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('nao chama a omdb sem imdb id', async () => {
    await expect(service.forImdbId(null)).resolves.toEqual({
      rottenTomatoes: null,
      metacritic: null,
    });
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('usa o cache na segunda chamada', async () => {
    mockedAxios.get.mockResolvedValue(
      omdbPayload([{ Source: 'Metacritic', Value: '74/100' }]),
    );

    await service.forImdbId('tt1');
    await service.forImdbId('tt1');

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 3: Rodar os testes e confirmar que falham**

Run: `cd guys-movies-backend && npx jest src/ratings --silent`
Expected: FAIL — `Cannot find module './ratings.service'`

- [ ] **Step 4: Implementar o serviço**

`src/ratings/ratings.service.ts`:

```ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { TtlCache } from '../common/ttl-cache';
import { CriticScoresDto } from './critic-scores.dto';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 500;
const REQUEST_TIMEOUT_MS = 8000;

const EMPTY_SCORES: CriticScoresDto = {
  rottenTomatoes: null,
  metacritic: null,
};

@Injectable()
export class RatingsService {
  private readonly logger = new Logger(RatingsService.name);
  private readonly cache = new TtlCache<CriticScoresDto>(
    CACHE_TTL_MS,
    CACHE_MAX_ENTRIES,
  );

  private parseScore(value: string | undefined): number | null {
    if (!value) return null;
    const match = /^(\d+(?:\.\d+)?)/.exec(value.trim());
    if (!match) return null;
    const parsed = Math.round(Number.parseFloat(match[1]));
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return null;
    return parsed;
  }

  private async fetchScores(imdbId: string): Promise<CriticScoresDto> {
    const url =
      `https://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}` +
      `&apikey=${process.env.OMDB_API_KEY}`;

    const response = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS });
    const payload = response.data;

    if (!payload || payload.Response !== 'True') {
      return { ...EMPTY_SCORES };
    }

    const ratings: { Source?: string; Value?: string }[] = Array.isArray(
      payload.Ratings,
    )
      ? payload.Ratings
      : [];

    const valueOf = (source: string): string | undefined =>
      ratings.find(entry => entry.Source === source)?.Value;

    return {
      rottenTomatoes: this.parseScore(valueOf('Rotten Tomatoes')),
      metacritic: this.parseScore(valueOf('Metacritic')),
    };
  }

  async forImdbId(
    imdbId: string | null | undefined,
  ): Promise<CriticScoresDto> {
    if (!imdbId || !process.env.OMDB_API_KEY) {
      return { ...EMPTY_SCORES };
    }

    try {
      return await this.cache.resolve(imdbId, () => this.fetchScores(imdbId));
    } catch (error) {
      this.logger.warn(
        `Nao foi possivel obter notas externas para ${imdbId}: ${error?.message ?? error}`,
      );
      return { ...EMPTY_SCORES };
    }
  }
}
```

`src/ratings/ratings.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';

@Module({
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
```

- [ ] **Step 5: Rodar os testes e confirmar que passam**

Run: `npx jest src/ratings --silent`
Expected: PASS, 7 testes.

- [ ] **Step 6: Build e lint**

Run: `npx nest build && npx eslint "src/**/*.ts" --fix`
Expected: ambos saem com código 0.

- [ ] **Step 7: Commit**

```bash
cd guys-movies-backend
git add src/ratings
git commit -m "feat(ratings): fetch rotten tomatoes and metacritic from omdb"
```

---

### Task 2: Expor as notas nos detalhes de filme e série

**Files:**
- Modify: `guys-movies-backend/src/movie/movie.service.ts`
- Modify: `guys-movies-backend/src/movie/dto/movie.dto.ts`
- Modify: `guys-movies-backend/src/movie/movie.module.ts`
- Modify: `guys-movies-backend/src/serie/serie.service.ts`
- Modify: `guys-movies-backend/src/serie/serie.module.ts`
- Modify: `guys-movies-backend/src/serie/dto/serie.dto.ts`

**Interfaces:**
- Consumes: `RatingsService.forImdbId()` e `CriticScoresDto` da Task 1.
- Produces: campo `critic_scores: CriticScoresDto` em `MovieDto` e `SerieDto`. A Task 9 do frontend consome esse nome.

- [ ] **Step 1: Adicionar o campo aos DTOs**

Em `src/movie/dto/movie.dto.ts`, adicionar ao final de `MovieDto`:

```ts
  critic_scores: CriticScoresDto;
```

com `import { CriticScoresDto } from '../../ratings/critic-scores.dto';` no topo. Repetir exatamente o mesmo em `src/serie/dto/serie.dto.ts`, na classe `SerieDto`.

- [ ] **Step 2: Injetar o serviço nos módulos**

Em `src/movie/movie.module.ts` e `src/serie/serie.module.ts`, adicionar `RatingsModule` ao array `imports`, com `import { RatingsModule } from '../ratings/ratings.module';`.

- [ ] **Step 3: Enriquecer o filme**

Em `src/movie/movie.service.ts`, injetar no construtor:

```ts
    private readonly ratingsService: RatingsService,
```

A resposta de `/movie/{id}` da TMDB já traz `imdb_id`. Dentro de `fetchMovie`, antes do `return`:

```ts
    const criticScores = await this.ratingsService.forImdbId(movie.imdb_id);
```

e incluir no objeto retornado:

```ts
      critic_scores: criticScores,
```

- [ ] **Step 4: Enriquecer a série**

`/tv/{id}` **não** traz `imdb_id`. Em `fetchSerie`, acrescentar `external_ids` ao `append_to_response` já existente:

```ts
      `&append_to_response=credits,watch/providers,external_ids`;
```

e então:

```ts
    const criticScores = await this.ratingsService.forImdbId(
      serie.external_ids?.imdb_id,
    );
```

incluindo `critic_scores: criticScores,` no retorno.

- [ ] **Step 5: Verificar contra a API real**

Run:
```bash
cd guys-movies-backend && npx nest build && (node dist/main.js &) && sleep 18 && \
  curl -s "http://localhost:3005/movie/324544" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.stringify(JSON.parse(s).critic_scores)))"
```
Expected: objeto com `rottenTomatoes` e `metacritic` numéricos ou `null` — nunca erro. Repetir para uma série e confirmar que `metacritic` vindo `null` não quebra nada.

- [ ] **Step 6: Suíte completa, build e lint**

Run: `npx jest --silent && npx nest build && npx eslint "src/**/*.ts" --fix`
Expected: 248 testes anteriores + 7 novos, todos passando.

- [ ] **Step 7: Commit**

```bash
git add src/movie src/serie
git commit -m "feat(ratings): serve critic scores with movie and serie details"
```

---

### Task 3: Ano do título nos eventos da timeline

**Files:**
- Modify: `guys-movies-backend/src/profile/timeline.service.ts`

**Interfaces:**
- Produces: campo `year: number | null` em cada evento da timeline. A Task 5 do frontend consome.

- [ ] **Step 1: Adicionar o campo ao tipo do evento**

No tipo de evento declarado no topo de `timeline.service.ts` (onde já existe `occurredAt: string;`), adicionar:

```ts
  year: number | null;
```

- [ ] **Step 2: Preencher a partir da entidade**

A relação já está carregada (o código usa `row.idMovie.title`). Adicionar um helper no arquivo:

```ts
const yearOf = (date: string | null | undefined): number | null => {
  if (!date) return null;
  const year = Number.parseInt(String(date).slice(0, 4), 10);
  return Number.isInteger(year) ? year : null;
};
```

No evento de filme, junto de `title` e `posterPath`:

```ts
          year: yearOf(row.idMovie.releaseDate),
```

No evento de temporada, usar `yearOf(row.idSerie.firstAirDate)` — o campo existe em `src/serie/entities/series.entity.ts:18`. Conferir no arquivo o nome exato da relação carregada antes de escrever.

- [ ] **Step 3: Confirmar na API real**

Run:
```bash
npx nest build && (node dist/main.js &) && sleep 18 && \
  curl -s -b "jwt=<token>" "http://localhost:3005/profile/<username>/timeline" | head -c 400
```
Expected: cada evento traz `year` numérico ou `null`.

Se não houver sessão à mão, rodar a suíte de `timeline.service.spec.ts` e conferir que os eventos passaram a carregar o campo.

- [ ] **Step 4: Testes, build, lint e commit**

```bash
npx jest --silent && npx nest build && npx eslint "src/**/*.ts" --fix
git add src/profile/timeline.service.ts
git commit -m "feat(profile): include the title year in timeline events"
```

---

### Task 4: Helper de ano e selo nos cards de pôster

**Files:**
- Create: `guys-movies-frontend/utils/formatYear.ts`
- Create: `guys-movies-frontend/components/_ui/yearBadge/index.tsx`
- Modify: `guys-movies-frontend/components/home/movieCard/index.tsx`
- Modify: `guys-movies-frontend/components/series/seriesCard/index.tsx`
- Modify: `guys-movies-frontend/components/watched/watchedTile.tsx`
- Modify: `guys-movies-frontend/components/watched/watchedSerieTile.tsx`
- Modify: `guys-movies-frontend/components/watchlist/watchlistCard.tsx`
- Modify: `guys-movies-frontend/components/profile/favoriteShelf.tsx`
- Modify: `guys-movies-frontend/pages/index.tsx`, `pages/busca.tsx`, `components/search/searchResultGrid.tsx`

**Interfaces:**
- Produces: `formatYear(date: string | number | null | undefined): string | null` e o componente `<YearBadge year={...} />`. A Task 5 reutiliza ambos.

- [ ] **Step 1: Escrever o helper**

`utils/formatYear.ts`:

```ts
export const formatYear = (
  date: string | number | null | undefined,
): string | null => {
  if (date === null || date === undefined || date === "") return null;
  const year = Number.parseInt(String(date).slice(0, 4), 10);
  if (!Number.isInteger(year) || year < 1800 || year > 2200) return null;
  return String(year);
};
```

- [ ] **Step 2: Escrever o selo**

`components/_ui/yearBadge/index.tsx`:

```tsx
import React from "react";
import { formatYear } from "../../../utils/formatYear";

interface YearBadgeProps {
  date: string | number | null | undefined;
}

const YearBadge: React.FC<YearBadgeProps> = ({ date }) => {
  const year = formatYear(date);
  if (!year) return null;

  return (
    <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-lg border border-white/15 bg-black/55 px-1.5 py-0.5 text-[0.6rem] font-extrabold tracking-wide text-white/90 backdrop-blur-md">
      {year}
    </span>
  );
};

export default YearBadge;
```

- [ ] **Step 3: Aplicar nos cards que já têm a data**

Em cada um, inserir `<YearBadge date={...} />` como filho do contêiner do pôster (o elemento com `relative`), ao lado do selo de nota:

- `watched/watchedTile.tsx` → `date={movie.releaseDate}`
- `watched/watchedSerieTile.tsx` → `date={serie.firstAirDate}`
- `series/seriesCard/index.tsx` → `date={first_air_date}` (já vem em `Serie`)
- `profile/favoriteShelf.tsx` → `date={favorite.year}` (o tipo `Favorite` já tem `year: number | null`)

Em `watchlist/watchlistCard.tsx` o ano já é exibido como texto solto na linha 66; **remover** aquele `<p>` e usar o selo, para não duplicar a informação.

- [ ] **Step 4: Ligar a data no card da home/busca**

`MovieCardProps` não recebe data. Adicionar a prop opcional:

```tsx
  releaseDate?: string | null;
```

e renderizar `<YearBadge date={releaseDate} />`. Depois passar o valor nos três consumidores (confirmados via grafo): `pages/index.tsx`, `pages/busca.tsx` e `components/search/searchResultGrid.tsx`, usando o campo `release_date` que já vem da API.

- [ ] **Step 5: Verificar**

Run: `cd guys-movies-frontend && npx tsc --noEmit && npx next build`
Expected: ambos limpos.

Depois subir o app (`npx next start -p 3100`) e conferir que o ano aparece **sem hover** em: home, busca, séries, assistidos (filmes e séries), watchlist e favoritos do perfil.

- [ ] **Step 6: Commit**

```bash
cd guys-movies-frontend && npm run lint:fix
git add utils/formatYear.ts components pages
git commit -m "feat(cards): show the release year on every poster card"
```

---

### Task 5: Ano na timeline do perfil

**Files:**
- Modify: `guys-movies-frontend/interfaces/profile/types.ts`
- Modify: `guys-movies-frontend/components/profile/timelineList.tsx`

**Interfaces:**
- Consumes: campo `year` do backend (Task 3) e `formatYear` (Task 4).

- [ ] **Step 1: Adicionar o campo ao tipo**

Em `interfaces/profile/types.ts`, no union `TimelineEvent`, adicionar `year: number | null;` em **ambas** as variantes (`kind: "movie"` e `kind: "season"`).

- [ ] **Step 2: Exibir**

Em `timelineList.tsx`, ao lado do título do evento, renderizar o ano em texto discreto:

```tsx
{formatYear(event.year) && (
  <span className="ml-2 text-xs font-semibold text-white/40">
    {formatYear(event.year)}
  </span>
)}
```

A timeline é uma lista, não um grid de pôsteres — aqui o ano é texto inline, não o selo de vidro, porque não há imagem sobre a qual flutuar.

- [ ] **Step 3: Verificar e commitar**

```bash
npx tsc --noEmit && npx next build && npm run lint:fix
git add interfaces/profile/types.ts components/profile/timelineList.tsx
git commit -m "feat(profile): show the title year on timeline rows"
```

---

### Task 6: Capa do perfil sem recorte

**Files:**
- Modify: `guys-movies-frontend/components/profile/profileCover.tsx`
- Modify: `guys-movies-frontend/pages/perfil/[username].tsx`

- [ ] **Step 1: Reescrever as camadas**

Substituir o bloco de imagem de `profileCover.tsx`. Remover: `backdrop-blur-[2px]`, `opacity-[0.76]`, `object-cover object-top` e dois dos três gradientes. A estrutura nova:

```tsx
      <div
        aria-hidden={!cover}
        className="pointer-events-none absolute inset-x-0 top-0 h-[48vh] max-h-[560px] md:h-[62vh] md:max-h-[760px]"
      >
        {narrow ? (
          <>
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={narrow}
                alt=""
                aria-hidden
                decoding="async"
                className="h-full w-full scale-110 object-cover opacity-55 blur-3xl"
              />
            </div>
            <picture className="relative block h-full w-full">
              <source media="(min-width: 768px)" srcSet={wide ?? undefined} />
              <img
                src={narrow}
                alt={`Capa do perfil: ${cover?.title ?? ""}`}
                decoding="async"
                className="mx-auto h-full w-full max-w-[1600px] object-contain object-top"
                style={FADE_MASK}
              />
            </picture>
          </>
        ) : (
          <div
            className="h-full w-full bg-linear-to-br from-ink-700 via-ink-800 to-ink-950"
            style={FADE_MASK}
          />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-[#05050c] via-[#05050c]/45 to-transparent" />
      </div>
```

Manter o `NOISE_URL` fora ou com opacidade bem baixa — ele também reduz nitidez; a spec pede o mínimo de camadas sobre a imagem.

- [ ] **Step 2: Ajustar a sobreposição**

Em `pages/perfil/[username].tsx`, aumentar o espaçamento superior do conteúdo para que `ProfileHero` caia sobre a parte inferior da capa, não abaixo dela. O herói já é `relative z-10`; basta o `padding-top` do contêiner acompanhar a nova altura.

- [ ] **Step 3: Verificar com imagens reais**

Run: `npx next build && npx next start -p 3100`

Abrir um perfil com capa e conferir:
1. a imagem está **nítida** (sem blur na camada da frente);
2. **nenhum recorte** — o pôster/backdrop aparece inteiro;
3. as laterais estão preenchidas pela moldura borrada, sem barras pretas;
4. nome, @ e contadores continuam legíveis sobre a imagem;
5. testar com capa **retrato** e **paisagem** — a moldura não pode dominar a tela.

- [ ] **Step 4: Commit**

```bash
npm run lint:fix
git add components/profile/profileCover.tsx "pages/perfil/[username].tsx"
git commit -m "feat(profile): show the cover uncropped over a blurred frame"
```

---

### Task 7: Duplicação no filtro e diretores no topo

**Files:**
- Modify: `guys-movies-frontend/components/watched/watchedTile.tsx`
- Modify: `guys-movies-frontend/components/watched/watchedSerieTile.tsx`
- Modify: `guys-movies-frontend/pages/assistidos.tsx`

**REQUIRED SUB-SKILL:** Use `superpowers:systematic-debugging` nesta tarefa. A causa está documentada como **hipótese**, não como fato.

- [ ] **Step 1: Reproduzir antes de mudar qualquer coisa**

Subir o app, entrar em `/assistidos` autenticado, abrir o filtro de Diretor e alternar rapidamente entre diretores diferentes (marcar um, desmarcar, marcar outro). Confirmar visualmente os cards repetidos e **abrir o console** à procura do aviso do React sobre refs em componentes função.

Registrar o que foi observado. **Se a duplicação não reproduzir assim, parar e reportar** — a hipótese está errada e a spec precisa ser revista antes de qualquer correção.

- [ ] **Step 2: Confirmar a causa**

Com a duplicação reproduzida, trocar temporariamente `mode="popLayout"` por `mode="sync"` na linha 865 e repetir o teste. Se os duplicados sumirem, a causa é o `popLayout` sem ref — confirmada.

- [ ] **Step 3: Corrigir os tiles**

Converter os dois tiles para `forwardRef`, encaminhando a ref ao `motion.button`, e dar a eles um `exit` de verdade (hoje não existe nenhum, então o `AnimatePresence` só custa):

```tsx
const WatchedTile = React.forwardRef<HTMLButtonElement, WatchedTileProps>(
  ({ movie, index, onSelect }, ref) => (
    <motion.button
      ref={ref}
      type="button"
      onClick={() => onSelect(movie)}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.035, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
```

O restante do corpo não muda. Adicionar `WatchedTile.displayName = "WatchedTile";` antes do export. Repetir em `watchedSerieTile.tsx`.

- [ ] **Step 4: Confirmar que a correção resolve**

Repetir o Step 1 com `mode="popLayout"` restaurado. Sem duplicados, sem aviso de ref no console.

- [ ] **Step 5: Diretores selecionados no topo**

Em `pages/assistidos.tsx`, no `useMemo` de `visibleMovies`, trocar o `return sortMovies(filtered, sortKey);` final por uma partição estável que preserva a ordenação atual dentro de cada grupo:

```tsx
    const sorted = sortMovies(filtered, sortKey);
    if (directors.length === 0) return sorted;

    const selected = sorted.filter(
      (item) => item.director != null && directors.includes(item.director),
    );
    const rest = sorted.filter(
      (item) => item.director == null || !directors.includes(item.director),
    );
    return [...selected, ...rest];
```

Observação: com o filtro de diretor ativo o `rest` fica vazio, porque a lista já foi filtrada. A partição passa a valer de verdade quando o filtro de diretor for usado junto de outro filtro que amplie o conjunto. Manter assim — é o comportamento pedido e não quebra nada.

- [ ] **Step 6: Verificar e commitar**

```bash
npx tsc --noEmit && npx next build && npm run lint:fix
git add components/watched pages/assistidos.tsx
git commit -m "fix(watched): stop tiles from ghosting when filters change"
```

---

### Task 8: Abas Filmes / Séries

**Files:**
- Create: `guys-movies-frontend/components/watched/collectionTabs.tsx`
- Modify: `guys-movies-frontend/pages/assistidos.tsx:605-667`

**Interfaces:**
- Produces: `WatchedTab = "movies" | "series"` passa a ser declarado e exportado por `collectionTabs.tsx`. A declaração local de `assistidos.tsx:47` é **removida**, e o arquivo passa a importar o tipo do novo componente — evita duas definições do mesmo tipo.
- Produces: `<CollectionTabs activeTab movieCount serieCount onChange />`.

- [ ] **Step 1: Criar o componente**

`components/watched/collectionTabs.tsx`:

```tsx
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WatchedTab = "movies" | "series";

interface CollectionTabsProps {
  activeTab: WatchedTab;
  movieCount: number | null;
  serieCount: number | null;
  onChange: (tab: WatchedTab) => void;
}

const TABS: { id: WatchedTab; label: string }[] = [
  { id: "movies", label: "Filmes" },
  { id: "series", label: "Séries" },
];

const CollectionTabs: React.FC<CollectionTabsProps> = ({
  activeTab,
  movieCount,
  serieCount,
  onChange,
}) => {
  const reduceMotion = useReducedMotion();
  const countOf = (tab: WatchedTab) =>
    tab === "movies" ? movieCount : serieCount;

  return (
    <div
      role="tablist"
      aria-label="Alternar entre filmes e séries"
      className="flex items-baseline gap-7 border-b border-white/8 sm:gap-9"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        const count = countOf(tab.id);

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative min-h-[44px] pb-3 text-2xl font-black tracking-tight transition-colors duration-300 sm:text-3xl lg:text-4xl ${
              isActive
                ? "text-white"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            {tab.label}
            {count !== null && (
              <span
                className={`ml-2 align-middle text-xs font-extrabold ${
                  isActive ? "text-white/45" : "text-white/25"
                }`}
              >
                {count}
              </span>
            )}
            {isActive && (
              <motion.span
                layoutId="collection-tab-underline"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 36 }
                }
                className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-linear-to-r from-brand-500 to-brand-400"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CollectionTabs;
```

- [ ] **Step 2: Substituir no cabeçalho**

Em `assistidos.tsx`, remover o `<h1>` ("Filmes assistidos" / "Séries assistidas") e o bloco `role="tablist"` das linhas 635-667. Colocar `<CollectionTabs …/>` **acima** do parágrafo de apoio, logo após o kicker "Sua coleção". Manter o parágrafo e o `LibrarySummary`.

Contadores: `data?.items.length ?? null` e `serieData?.items.length ?? null`. Quando a lista de séries ainda não foi carregada o valor é `null` e nenhum número é exibido — não mostrar `0`, que seria mentira.

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit && npx next build && npx next start -p 3100`

Conferir: abas grandes acima do parágrafo; sublinhado desliza ao trocar; contadores corretos; alvo de toque confortável no mobile; navegação por teclado (Tab/Enter) funciona; `?tab=series` na URL continua abrindo a aba certa.

- [ ] **Step 4: Commit**

```bash
npm run lint:fix
git add components/watched/collectionTabs.tsx pages/assistidos.tsx
git commit -m "feat(watched): turn the collection tabs into the page heading"
```

---

### Task 9: Tela de detalhe — metadados, sinopse e barra de ação

**Files:**
- Create: `guys-movies-frontend/components/mediaDetails/scoreChips.tsx`
- Modify: `guys-movies-frontend/components/mediaDetails/heroHeader.tsx`
- Modify: `guys-movies-frontend/components/mediaDetails/detailLayout.tsx`
- Modify: `guys-movies-frontend/components/mediaDetails/experiencePanel.tsx`
- Modify: `guys-movies-frontend/components/mediaDetails/synopsis.tsx`
- Modify: `guys-movies-frontend/pages/movie/[id].tsx`, `pages/serie/[id].tsx`
- Modify: `guys-movies-frontend/interfaces/movie/types.ts`, `interfaces/series/types.ts`

**Interfaces:**
- Consumes: `critic_scores` do backend (Task 2) e `formatYear` (Task 4).
- Produces: `<ScoreChips tmdb rottenTomatoes metacritic />`.

- [ ] **Step 1: Tipar as notas no frontend**

Em `interfaces/movie/types.ts` e `interfaces/series/types.ts`, adicionar ao tipo de detalhe:

```ts
  critic_scores?: {
    rottenTomatoes: number | null;
    metacritic: number | null;
  };
```

Opcional de propósito: se o backend ainda não tiver sido implantado, o frontend não quebra.

- [ ] **Step 2: Criar os chips**

`components/mediaDetails/scoreChips.tsx`:

```tsx
import React from "react";

interface ScoreChipsProps {
  tmdb: number | null | undefined;
  rottenTomatoes: number | null | undefined;
  metacritic: number | null | undefined;
}

const CHIP = "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.65rem] font-extrabold";

const ScoreChips: React.FC<ScoreChipsProps> = ({
  tmdb,
  rottenTomatoes,
  metacritic,
}) => (
  <>
    {typeof tmdb === "number" && tmdb > 0 && (
      <span className={`${CHIP} bg-emerald-500/15 text-emerald-300`}>
        TMDB {tmdb.toFixed(1)}
      </span>
    )}
    {typeof rottenTomatoes === "number" && (
      <span className={`${CHIP} bg-red-500/15 text-red-300`}>
        🍅 {rottenTomatoes}%
      </span>
    )}
    {typeof metacritic === "number" && (
      <span className={`${CHIP} bg-amber-400/15 text-amber-300`}>
        MC {metacritic}
      </span>
    )}
  </>
);

export default ScoreChips;
```

Nenhum chip é renderizado quando a nota é `null` — é isso que faz o Metacritic sumir nas séries.

- [ ] **Step 3: Reescrever o cabeçalho**

`heroHeader.tsx` passa a receber `year`, `runtime`, `criticScores` e `overview`, e a ordem interna vira: badge → título → linha de metadados → **sinopse**. Remover `CircularVoteAverage` e a pill "Score TMDB" — a nota agora é um chip.

```tsx
      <header className="flex min-w-0 flex-col gap-3 lg:gap-4">
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-indigo-300 sm:text-[0.65rem]">
          {badgeLabel}
        </p>
        <h1 className="wrap-break-word text-2xl font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/55">
          {year && <span>{year}</span>}
          {runtime && <span>· {runtime}</span>}
          <ScoreChips
            tmdb={voteAverage}
            rottenTomatoes={criticScores?.rottenTomatoes}
            metacritic={criticScores?.metacritic}
          />
        </div>
        {overview && (
          <p className="max-w-3xl text-sm leading-relaxed text-white/85 sm:text-base sm:leading-relaxed">
            {overview}
          </p>
        )}
      </header>
```

- [ ] **Step 4: Enxugar o painel de experiência**

Em `experiencePanel.tsx`, remover a prop `description` e sua renderização (o texto "Gerencie rapidamente o que já assistiu…"), e compactar o bloco: título menor, estrelas e botões na mesma faixa horizontal em telas `sm+`. Remover a passagem de `description` nos dois `pages`.

- [ ] **Step 5: Fechar o vão na grid**

Em `detailLayout.tsx`, reduzir `lg:gap-y-8` para `lg:gap-y-5`. A sinopse saiu de `children` (3ª linha) e foi para o cabeçalho, então `children` passa a conter só "Onde assistir" e "Elenco principal" — remover `<MediaSynopsis>` dos dois `pages`, passando `movie.overview` ao `MediaHeroHeader`.

Manter o componente `synopsis.tsx` no repositório apenas se ainda houver consumidor; se ficar órfão, apagá-lo no mesmo commit.

- [ ] **Step 6: Verificar com e sem a chave**

Run: `npx tsc --noEmit && npx next build`

Com `OMDB_API_KEY` definida no backend: abrir um filme e conferir os três chips, a sinopse logo abaixo do título e a ausência do vão.
Depois **remover a variável, reiniciar o backend** e reabrir a mesma tela: só o chip do TMDB aparece e o layout continua íntegro. Conferir também uma série (onde o Metacritic normalmente não existe).

- [ ] **Step 7: Commit**

```bash
npm run lint:fix
git add components/mediaDetails interfaces "pages/movie/[id].tsx" "pages/serie/[id].tsx"
git commit -m "feat(details): lead with the synopsis and fold scores into metadata"
```

---

## Verificação final

- [ ] Backend: `npx nest build`, `npx jest` (248 + 7 novos), `npx eslint "src/**/*.ts"` — todos limpos.
- [ ] Frontend: `npx tsc --noEmit`, `npx next build` — limpos.
- [ ] App rodando: perfil (capa retrato e paisagem), detalhe de filme, detalhe de série, assistidos (as duas abas, filtro de diretor), watchlist, busca, home, séries.
- [ ] Detalhe conferido **com e sem** `OMDB_API_KEY`.
- [ ] Nenhum branch criado; commits direto na `main` dos dois repositórios.

## Pendência do usuário

Adicionar `OMDB_API_KEY` no painel do Render. Sem isso os selos de Rotten Tomatoes e Metacritic não aparecem em produção, embora nada quebre.
