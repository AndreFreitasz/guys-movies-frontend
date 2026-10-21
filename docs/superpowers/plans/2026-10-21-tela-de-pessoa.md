# Tela de pessoa — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar `/pessoa/[id]` com filmografia paginada, contagem de gêneros interativa e cruzamento com a biblioteca, alcançável pela busca e pelos nomes de elenco e direção.

**Architecture:** O backend ganha o módulo `person`, que faz **uma** chamada ao TMDB por pessoa, descarta créditos de ruído, agrega departamentos/gêneros/estatísticas e guarda o resultado num `TtlCache`. Filtro, ordenação e paginação rodam sobre esse agregado, nunca contra a API. O frontend consome isso numa página ISR, com o cruzamento de biblioteca carregando no cliente porque a página é estática e compartilhada.

**Tech Stack:** NestJS 10 + axios + Jest no backend; Next.js 16 (Pages Router) + React 18 + Tailwind v4 + framer-motion no frontend.

**Spec:** `docs/superpowers/specs/2026-10-21-tela-de-pessoa-design.md`

## Global Constraints

- **Sem comentários no código. Nomes em inglês.** Regra inegociável do projeto, válida para todo arquivo tocado aqui.
- Textos de interface em **português do Brasil**.
- Backend: caminhos de import no estilo `src/...` ou relativo, seguindo o arquivo vizinho.
- Frontend: `prettier --write` antes de cada commit; `npx tsc --noEmit` limpo.
- O frontend **não tem runner de testes**. Verificação de frontend é build + typecheck + inspeção no navegador.
- O backend tem Jest. Toda lógica pura deste plano nasce de um teste que falha primeiro.
- Rota nova é `/pessoa/[id]`. `/perfil/[username]` continua sendo dos usuários do app.
- Página de pessoa usa ISR: `getStaticProps` com `revalidate: 86400`, `getStaticPaths` com `paths: []` e `fallback: "blocking"`.
- **Nada específico do usuário pode sair do `getStaticProps`** — a página é compartilhada entre visitantes.
- Filtro de ruído: descartar crédito cujo `character` case com `/^(self|himself|herself)\b/i`, ou que seja `tv` com gênero `10767`, `10763` ou `10764`. Documentário **não** é filtrado.
- Ordenação "Relevância" = `vote_average × log10(vote_count + 1)`. `popularity` cru não é oferecido.

---

### Task 1: Normalização e filtro de ruído dos créditos

**Files:**
- Create: `guys-movies-backend/src/person/credits.ts`
- Create: `guys-movies-backend/src/person/credits.spec.ts`
- Create: `guys-movies-backend/src/person/interfaces/person.interface.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `MediaType`, `PersonCredit`, `RawCredit`, `DEPARTMENT_LABELS`, `departmentSlug(department: string): string`, `isNoiseCredit(credit: RawCredit): boolean`, `normalizeCredits(cast: RawCredit[], crew: RawCredit[], imageBaseUrl: string): PersonCredit[]`.

- [ ] **Step 1: Criar o arquivo de tipos**

`src/person/interfaces/person.interface.ts`:

```ts
export type MediaType = 'movie' | 'tv';

export interface RawCredit {
  id: number;
  media_type: MediaType;
  title?: string;
  name?: string;
  character?: string;
  job?: string;
  department?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
}

export interface PersonCredit {
  id: number;
  mediaType: MediaType;
  title: string;
  posterUrl: string | null;
  year: number | null;
  voteAverage: number | null;
  voteCount: number;
  genreIds: number[];
  role: string;
  department: string;
}

export interface DepartmentSummary {
  key: string;
  label: string;
  count: number;
}

export interface GenreCount {
  id: number;
  name: string;
  count: number;
}

export interface PersonStats {
  totalTitles: number;
  firstYear: number | null;
  lastYear: number | null;
  topGenre: string | null;
  bestRated: PersonCredit | null;
}

export interface PersonCreditsPage {
  items: PersonCredit[];
  page: number;
  totalPages: number;
  total: number;
}

export interface PersonProfile {
  id: number;
  name: string;
  profileUrl: string | null;
  biography: string | null;
  biographyLanguage: 'pt' | 'en' | null;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  knownForDepartment: string | null;
  departments: DepartmentSummary[];
  genres: GenreCount[];
  stats: PersonStats;
  highlights: PersonCredit[];
  defaultDepartment: string;
  credits: PersonCreditsPage;
}

export interface PersonSearchResult {
  id: number;
  name: string;
  profileUrl: string | null;
  knownForDepartment: string | null;
  knownFor: string[];
}
```

- [ ] **Step 2: Escrever o teste que falha**

`src/person/credits.spec.ts`:

```ts
import { isNoiseCredit, normalizeCredits, departmentSlug } from './credits';
import { RawCredit } from './interfaces/person.interface';

const base: RawCredit = {
  id: 1,
  media_type: 'movie',
  title: 'Forrest Gump',
  character: 'Forrest Gump',
  release_date: '1994-07-06',
  vote_average: 8.462,
  vote_count: 30708,
  genre_ids: [18, 10749],
  poster_path: '/abc.jpg',
};

describe('isNoiseCredit', () => {
  it('descarta participacao como a propria pessoa', () => {
    expect(isNoiseCredit({ ...base, character: 'Self' })).toBe(true);
    expect(isNoiseCredit({ ...base, character: 'Self - Guest' })).toBe(true);
    expect(isNoiseCredit({ ...base, character: 'Himself' })).toBe(true);
    expect(isNoiseCredit({ ...base, character: 'Herself' })).toBe(true);
  });

  it('mantem personagem cujo nome apenas comeca com as mesmas letras', () => {
    expect(isNoiseCredit({ ...base, character: 'Selfridge' })).toBe(false);
  });

  it('descarta tv de talk, news e reality', () => {
    const talk: RawCredit = { ...base, media_type: 'tv', genre_ids: [10767] };
    const news: RawCredit = { ...base, media_type: 'tv', genre_ids: [10763] };
    const reality: RawCredit = { ...base, media_type: 'tv', genre_ids: [10764] };
    expect(isNoiseCredit(talk)).toBe(true);
    expect(isNoiseCredit(news)).toBe(true);
    expect(isNoiseCredit(reality)).toBe(true);
  });

  it('mantem documentario, que e obra legitima', () => {
    expect(isNoiseCredit({ ...base, genre_ids: [99] })).toBe(false);
    expect(isNoiseCredit({ ...base, media_type: 'tv', genre_ids: [99] })).toBe(
      false,
    );
  });

  it('mantem filme mesmo que o id de genero coincida com um de tv', () => {
    expect(
      isNoiseCredit({ ...base, media_type: 'movie', genre_ids: [10767] }),
    ).toBe(false);
  });
});

describe('departmentSlug', () => {
  it('traduz os departamentos conhecidos', () => {
    expect(departmentSlug('Directing')).toBe('directing');
    expect(departmentSlug('Costume & Make-Up')).toBe('costume-make-up');
  });
});

describe('normalizeCredits', () => {
  it('normaliza elenco com o personagem como papel', () => {
    const [credit] = normalizeCredits([base], [], 'https://img/');

    expect(credit).toEqual({
      id: 1,
      mediaType: 'movie',
      title: 'Forrest Gump',
      posterUrl: 'https://img/abc.jpg',
      year: 1994,
      voteAverage: 8.462,
      voteCount: 30708,
      genreIds: [18, 10749],
      role: 'Forrest Gump',
      department: 'acting',
    });
  });

  it('usa name e first_air_date para series', () => {
    const serie: RawCredit = {
      id: 2,
      media_type: 'tv',
      name: 'Band of Brothers',
      character: 'Narrator',
      first_air_date: '2001-09-09',
      genre_ids: [18],
    };

    const [credit] = normalizeCredits([serie], [], 'https://img/');

    expect(credit.title).toBe('Band of Brothers');
    expect(credit.year).toBe(2001);
  });

  it('usa o job como papel na equipe', () => {
    const crew: RawCredit = {
      ...base,
      character: undefined,
      job: 'Director',
      department: 'Directing',
    };

    const [credit] = normalizeCredits([], [crew], 'https://img/');

    expect(credit.role).toBe('Director');
    expect(credit.department).toBe('directing');
  });

  it('deduplica o mesmo titulo com o mesmo papel no mesmo departamento', () => {
    const crew: RawCredit = {
      ...base,
      character: undefined,
      job: 'Producer',
      department: 'Production',
    };

    expect(normalizeCredits([], [crew, { ...crew }], 'https://img/')).toHaveLength(
      1,
    );
  });

  it('mantem o mesmo titulo em departamentos diferentes', () => {
    const crew: RawCredit = {
      ...base,
      character: undefined,
      job: 'Director',
      department: 'Directing',
    };

    const credits = normalizeCredits([base], [crew], 'https://img/');

    expect(credits).toHaveLength(2);
    expect(credits.map((credit) => credit.department).sort()).toEqual([
      'acting',
      'directing',
    ]);
  });

  it('descarta ruido e aceita poster ausente', () => {
    const noise: RawCredit = { ...base, id: 9, character: 'Self' };
    const noPoster: RawCredit = { ...base, id: 10, poster_path: null };

    const credits = normalizeCredits([noise, noPoster], [], 'https://img/');

    expect(credits).toHaveLength(1);
    expect(credits[0].posterUrl).toBeNull();
  });

  it('aceita data vazia sem quebrar', () => {
    const credits = normalizeCredits(
      [{ ...base, release_date: '' }],
      [],
      'https://img/',
    );

    expect(credits[0].year).toBeNull();
  });
});
```

- [ ] **Step 3: Rodar e confirmar que falha**

Run: `cd guys-movies-backend && npx jest src/person/credits.spec.ts`
Expected: FAIL — `Cannot find module './credits'`.

- [ ] **Step 4: Implementar**

`src/person/credits.ts`:

```ts
import {
  MediaType,
  PersonCredit,
  RawCredit,
} from './interfaces/person.interface';

const SELF_ROLE_REGEX = /^(self|himself|herself)\b/i;
const NOISE_TV_GENRE_IDS = new Set([10767, 10763, 10764]);

export const DEPARTMENT_LABELS: Record<string, string> = {
  acting: 'Atuação',
  directing: 'Direção',
  writing: 'Roteiro',
  production: 'Produção',
  creator: 'Criação',
  crew: 'Equipe',
  camera: 'Fotografia',
  sound: 'Som',
  art: 'Arte',
  editing: 'Montagem',
  'costume-make-up': 'Figurino e maquiagem',
  'visual-effects': 'Efeitos visuais',
  lighting: 'Iluminação',
};

export const departmentSlug = (department: string): string =>
  (department || 'crew')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const departmentLabel = (slug: string): string =>
  DEPARTMENT_LABELS[slug] ??
  slug.replace(/-/g, ' ').replace(/^./, (first) => first.toUpperCase());

export const isNoiseCredit = (credit: RawCredit): boolean => {
  if (SELF_ROLE_REGEX.test(credit.character ?? '')) return true;

  if (credit.media_type !== 'tv') return false;

  return (credit.genre_ids ?? []).some((id) => NOISE_TV_GENRE_IDS.has(id));
};

const parseYear = (credit: RawCredit): number | null => {
  const raw = credit.release_date || credit.first_air_date || '';
  const year = Number(raw.slice(0, 4));
  return Number.isFinite(year) && year > 0 ? year : null;
};

const toCredit = (
  credit: RawCredit,
  department: string,
  role: string,
  imageBaseUrl: string,
): PersonCredit => ({
  id: credit.id,
  mediaType: (credit.media_type ?? 'movie') as MediaType,
  title: credit.title || credit.name || 'Sem título',
  posterUrl: credit.poster_path ? `${imageBaseUrl}${credit.poster_path}` : null,
  year: parseYear(credit),
  voteAverage:
    typeof credit.vote_average === 'number' ? credit.vote_average : null,
  voteCount: credit.vote_count ?? 0,
  genreIds: credit.genre_ids ?? [],
  role,
  department,
});

export const normalizeCredits = (
  cast: RawCredit[],
  crew: RawCredit[],
  imageBaseUrl: string,
): PersonCredit[] => {
  const seen = new Set<string>();
  const result: PersonCredit[] = [];

  const push = (credit: PersonCredit) => {
    const key = `${credit.department}:${credit.id}:${credit.role}`;
    if (seen.has(key)) return;
    seen.add(key);
    result.push(credit);
  };

  for (const entry of Array.isArray(cast) ? cast : []) {
    if (isNoiseCredit(entry)) continue;
    push(toCredit(entry, 'acting', entry.character || 'Elenco', imageBaseUrl));
  }

  for (const entry of Array.isArray(crew) ? crew : []) {
    if (isNoiseCredit(entry)) continue;
    push(
      toCredit(
        entry,
        departmentSlug(entry.department ?? ''),
        entry.job || 'Equipe',
        imageBaseUrl,
      ),
    );
  }

  return result;
};
```

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `npx jest src/person/credits.spec.ts`
Expected: PASS, todos os testes verdes.

- [ ] **Step 6: Commit**

```bash
git add src/person/credits.ts src/person/credits.spec.ts src/person/interfaces/person.interface.ts
git commit -m "feat(person): normalize credits and drop guest appearances"
```

---

### Task 2: Mapa de gêneros do TMDB

**Files:**
- Create: `guys-movies-backend/src/person/genre-map.service.ts`
- Create: `guys-movies-backend/src/person/genre-map.service.spec.ts`

**Interfaces:**
- Consumes: `MediaType` da Task 1.
- Produces: `GenreMapService` com `resolve(): Promise<GenreMap>` e o tipo `GenreMap = { movie: Map<number,string>; tv: Map<number,string> }`.

- [ ] **Step 1: Escrever o teste que falha**

`src/person/genre-map.service.spec.ts`:

```ts
import axios from 'axios';
import { GenreMapService } from './genre-map.service';

jest.mock('axios');

const mockedGet = axios.get as jest.Mock;

describe('GenreMapService', () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedGet.mockImplementation((url: string) =>
      Promise.resolve({
        data: {
          genres: url.includes('/genre/movie/list')
            ? [{ id: 18, name: 'Drama' }]
            : [{ id: 10767, name: 'Talk' }],
        },
      }),
    );
  });

  it('separa os mapas de filme e serie', async () => {
    const service = new GenreMapService();
    const map = await service.resolve();

    expect(map.movie.get(18)).toBe('Drama');
    expect(map.tv.get(10767)).toBe('Talk');
    expect(map.movie.get(10767)).toBeUndefined();
  });

  it('busca uma vez so e reaproveita o cache', async () => {
    const service = new GenreMapService();
    await service.resolve();
    await service.resolve();

    expect(mockedGet).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx jest src/person/genre-map.service.spec.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar**

`src/person/genre-map.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TtlCache } from '../common/ttl-cache';

export interface GenreMap {
  movie: Map<number, string>;
  tv: Map<number, string>;
}

interface GenreListResponse {
  genres: { id: number; name: string }[];
}

const GENRE_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class GenreMapService {
  private readonly apiKey = process.env.TMDB_API_KEY;
  private readonly baseUrl = 'https://api.themoviedb.org/3';
  private readonly cache = new TtlCache<GenreMap>(GENRE_TTL_MS, 4);

  private async fetchList(path: string): Promise<Map<number, string>> {
    const response = await axios.get<GenreListResponse>(
      `${this.baseUrl}${path}?api_key=${this.apiKey}&language=pt-BR`,
      { timeout: 8000 },
    );

    return new Map(
      (response.data?.genres ?? []).map((genre) => [genre.id, genre.name]),
    );
  }

  async resolve(): Promise<GenreMap> {
    return this.cache.resolve('all', async () => {
      const [movie, tv] = await Promise.all([
        this.fetchList('/genre/movie/list'),
        this.fetchList('/genre/tv/list'),
      ]);

      return { movie, tv };
    });
  }
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx jest src/person/genre-map.service.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/person/genre-map.service.ts src/person/genre-map.service.spec.ts
git commit -m "feat(person): resolve TMDB genre names per media type"
```

---

### Task 3: Agregação de departamentos, gêneros e estatísticas

**Files:**
- Create: `guys-movies-backend/src/person/aggregate.ts`
- Create: `guys-movies-backend/src/person/aggregate.spec.ts`

**Interfaces:**
- Consumes: `PersonCredit`, `DepartmentSummary`, `GenreCount`, `PersonStats` da Task 1; `GenreMap` da Task 2; `departmentLabel` da Task 1.
- Produces: `summarizeDepartments(credits: PersonCredit[]): DepartmentSummary[]`, `countGenres(credits: PersonCredit[], map: GenreMap): GenreCount[]`, `buildStats(credits: PersonCredit[], genres: GenreCount[]): PersonStats`, `pickDefaultDepartment(departments: DepartmentSummary[], knownForDepartment: string | null): string`.

- [ ] **Step 1: Escrever o teste que falha**

`src/person/aggregate.spec.ts`:

```ts
import {
  buildStats,
  countGenres,
  pickDefaultDepartment,
  summarizeDepartments,
} from './aggregate';
import { GenreMap } from './genre-map.service';
import { PersonCredit } from './interfaces/person.interface';

const credit = (over: Partial<PersonCredit>): PersonCredit => ({
  id: 1,
  mediaType: 'movie',
  title: 'Filme',
  posterUrl: null,
  year: 2000,
  voteAverage: 7,
  voteCount: 1000,
  genreIds: [18],
  role: 'Alguem',
  department: 'acting',
  ...over,
});

const map: GenreMap = {
  movie: new Map([
    [18, 'Drama'],
    [35, 'Comédia'],
  ]),
  tv: new Map([
    [18, 'Drama'],
    [10759, 'Ação e Aventura'],
  ]),
};

describe('summarizeDepartments', () => {
  it('conta e ordena por volume, com rotulo em portugues', () => {
    const result = summarizeDepartments([
      credit({ department: 'acting' }),
      credit({ id: 2, department: 'acting' }),
      credit({ id: 3, department: 'directing' }),
    ]);

    expect(result).toEqual([
      { key: 'acting', label: 'Atuação', count: 2 },
      { key: 'directing', label: 'Direção', count: 1 },
    ]);
  });

  it('nao devolve departamento vazio', () => {
    expect(summarizeDepartments([])).toEqual([]);
  });
});

describe('countGenres', () => {
  it('resolve o nome pelo media_type do credito', () => {
    const result = countGenres(
      [
        credit({ mediaType: 'movie', genreIds: [18] }),
        credit({ id: 2, mediaType: 'tv', genreIds: [10759] }),
      ],
      map,
    );

    expect(result).toEqual([
      { id: 18, name: 'Drama', count: 1 },
      { id: 10759, name: 'Ação e Aventura', count: 1 },
    ]);
  });

  it('ordena por contagem decrescente', () => {
    const result = countGenres(
      [
        credit({ genreIds: [18] }),
        credit({ id: 2, genreIds: [18] }),
        credit({ id: 3, genreIds: [35] }),
      ],
      map,
    );

    expect(result[0]).toEqual({ id: 18, name: 'Drama', count: 2 });
  });

  it('ignora genero sem nome no mapa', () => {
    expect(countGenres([credit({ genreIds: [999] })], map)).toEqual([]);
  });
});

describe('buildStats', () => {
  it('resume total, anos, genero principal e melhor avaliado', () => {
    const credits = [
      credit({ id: 1, year: 1994, voteAverage: 8.5, voteCount: 30000 }),
      credit({ id: 2, year: 2020, voteAverage: 6.1, voteCount: 900 }),
    ];
    const genres = countGenres(credits, map);

    const stats = buildStats(credits, genres);

    expect(stats.totalTitles).toBe(2);
    expect(stats.firstYear).toBe(1994);
    expect(stats.lastYear).toBe(2020);
    expect(stats.topGenre).toBe('Drama');
    expect(stats.bestRated?.id).toBe(1);
  });

  it('ignora titulo com poucos votos ao escolher o melhor avaliado', () => {
    const credits = [
      credit({ id: 1, voteAverage: 9.9, voteCount: 3 }),
      credit({ id: 2, voteAverage: 8.0, voteCount: 5000 }),
    ];

    expect(buildStats(credits, []).bestRated?.id).toBe(2);
  });

  it('aceita filmografia vazia', () => {
    expect(buildStats([], [])).toEqual({
      totalTitles: 0,
      firstYear: null,
      lastYear: null,
      topGenre: null,
      bestRated: null,
    });
  });
});

describe('pickDefaultDepartment', () => {
  const departments = [
    { key: 'production', label: 'Produção', count: 60 },
    { key: 'acting', label: 'Atuação', count: 20 },
  ];

  it('prefere o departamento principal da pessoa', () => {
    expect(pickDefaultDepartment(departments, 'Acting')).toBe('acting');
  });

  it('cai no de maior volume quando o principal nao tem creditos', () => {
    expect(pickDefaultDepartment(departments, 'Sound')).toBe('production');
  });

  it('devolve acting quando nao ha departamento algum', () => {
    expect(pickDefaultDepartment([], null)).toBe('acting');
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx jest src/person/aggregate.spec.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar**

`src/person/aggregate.ts`:

```ts
import { departmentLabel, departmentSlug } from './credits';
import { GenreMap } from './genre-map.service';
import {
  DepartmentSummary,
  GenreCount,
  PersonCredit,
  PersonStats,
} from './interfaces/person.interface';

const MIN_VOTES_FOR_BEST = 500;

export const summarizeDepartments = (
  credits: PersonCredit[],
): DepartmentSummary[] => {
  const counts = new Map<string, number>();

  for (const credit of credits) {
    counts.set(credit.department, (counts.get(credit.department) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: departmentLabel(key), count }))
    .sort((left, right) => right.count - left.count);
};

export const countGenres = (
  credits: PersonCredit[],
  map: GenreMap,
): GenreCount[] => {
  const counts = new Map<number, { name: string; count: number }>();

  for (const credit of credits) {
    const names = credit.mediaType === 'tv' ? map.tv : map.movie;

    for (const id of credit.genreIds) {
      const name = names.get(id);
      if (!name) continue;

      const current = counts.get(id);
      if (current) current.count += 1;
      else counts.set(id, { name, count: 1 });
    }
  }

  return [...counts.entries()]
    .map(([id, value]) => ({ id, name: value.name, count: value.count }))
    .sort((left, right) => right.count - left.count);
};

export const buildStats = (
  credits: PersonCredit[],
  genres: GenreCount[],
): PersonStats => {
  const years = credits
    .map((credit) => credit.year)
    .filter((year): year is number => year !== null);

  const bestRated = credits
    .filter(
      (credit) =>
        credit.voteCount >= MIN_VOTES_FOR_BEST && credit.voteAverage !== null,
    )
    .sort((left, right) => (right.voteAverage ?? 0) - (left.voteAverage ?? 0))[0];

  const uniqueTitles = new Set(
    credits.map((credit) => `${credit.mediaType}:${credit.id}`),
  );

  return {
    totalTitles: uniqueTitles.size,
    firstYear: years.length ? Math.min(...years) : null,
    lastYear: years.length ? Math.max(...years) : null,
    topGenre: genres[0]?.name ?? null,
    bestRated: bestRated ?? null,
  };
};

export const pickDefaultDepartment = (
  departments: DepartmentSummary[],
  knownForDepartment: string | null,
): string => {
  if (!departments.length) return 'acting';

  const preferred = departmentSlug(knownForDepartment ?? '');
  const match = departments.find((department) => department.key === preferred);

  return match ? match.key : departments[0].key;
};
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx jest src/person/aggregate.spec.ts`
Expected: PASS.

> Atenção: `buildStats` conta títulos únicos por `mediaType:id`, não créditos — quem dirigiu e atuou no mesmo filme conta uma vez só. O teste "resume total" cobre isso porque os dois créditos têm ids diferentes; se divergir, o bug é a chave do `Set`.

- [ ] **Step 5: Commit**

```bash
git add src/person/aggregate.ts src/person/aggregate.spec.ts
git commit -m "feat(person): derive departments, genre counts and career stats"
```

---

### Task 4: Filtro, ordenação por relevância e paginação

**Files:**
- Create: `guys-movies-backend/src/person/query.ts`
- Create: `guys-movies-backend/src/person/query.spec.ts`

**Interfaces:**
- Consumes: `PersonCredit`, `PersonCreditsPage` da Task 1.
- Produces: `PAGE_SIZE`, `CreditSort = 'relevance' | 'year' | 'rating'`, `CreditQuery`, `relevanceScore(credit: PersonCredit): number`, `queryCredits(credits: PersonCredit[], query: CreditQuery): PersonCreditsPage`, `pickHighlights(credits: PersonCredit[], limit?: number): PersonCredit[]`.

- [ ] **Step 1: Escrever o teste que falha**

`src/person/query.spec.ts`:

```ts
import { pickHighlights, queryCredits, relevanceScore } from './query';
import { PersonCredit } from './interfaces/person.interface';

const credit = (over: Partial<PersonCredit>): PersonCredit => ({
  id: 1,
  mediaType: 'movie',
  title: 'Filme',
  posterUrl: null,
  year: 2000,
  voteAverage: 7,
  voteCount: 1000,
  genreIds: [18],
  role: 'Alguem',
  department: 'acting',
  ...over,
});

describe('relevanceScore', () => {
  it('poe Forrest Gump acima de uma serie longeva com nota parecida', () => {
    const forrest = credit({ voteAverage: 8.462, voteCount: 30708 });
    const simpsons = credit({ voteAverage: 8, voteCount: 11088 });

    expect(relevanceScore(forrest)).toBeGreaterThan(relevanceScore(simpsons));
  });

  it('nao quebra com zero votos', () => {
    expect(relevanceScore(credit({ voteAverage: null, voteCount: 0 }))).toBe(0);
  });
});

describe('queryCredits', () => {
  const credits = [
    credit({ id: 1, year: 1994, voteAverage: 8.5, voteCount: 30000, genreIds: [18] }),
    credit({ id: 2, year: 2020, voteAverage: 6.0, voteCount: 800, genreIds: [35] }),
    credit({ id: 3, mediaType: 'tv', year: 2001, voteAverage: 8.6, voteCount: 5000, genreIds: [18] }),
    credit({ id: 4, department: 'directing', year: 2010, voteCount: 400 }),
  ];

  it('filtra por departamento', () => {
    const page = queryCredits(credits, { department: 'directing' });

    expect(page.items).toHaveLength(1);
    expect(page.items[0].id).toBe(4);
  });

  it('filtra por midia', () => {
    const page = queryCredits(credits, { department: 'acting', media: 'tv' });

    expect(page.items.map((item) => item.id)).toEqual([3]);
  });

  it('filtra por genero', () => {
    const page = queryCredits(credits, { department: 'acting', genre: 35 });

    expect(page.items.map((item) => item.id)).toEqual([2]);
  });

  it('ordena por relevancia por padrao', () => {
    const page = queryCredits(credits, { department: 'acting' });

    expect(page.items[0].id).toBe(1);
  });

  it('ordena por ano decrescente', () => {
    const page = queryCredits(credits, { department: 'acting', sort: 'year' });

    expect(page.items.map((item) => item.id)).toEqual([2, 3, 1]);
  });

  it('ordena por nota', () => {
    const page = queryCredits(credits, { department: 'acting', sort: 'rating' });

    expect(page.items[0].id).toBe(3);
  });

  it('pagina e informa o total', () => {
    const many = Array.from({ length: 45 }, (_, index) =>
      credit({ id: index + 1, voteCount: 45 - index }),
    );

    const page = queryCredits(many, { department: 'acting', page: 2 });

    expect(page.items).toHaveLength(20);
    expect(page.page).toBe(2);
    expect(page.total).toBe(45);
    expect(page.totalPages).toBe(3);
  });

  it('devolve pagina vazia quando pedem alem do fim', () => {
    const page = queryCredits(credits, { department: 'acting', page: 99 });

    expect(page.items).toEqual([]);
    expect(page.page).toBe(99);
  });
});

describe('pickHighlights', () => {
  it('exige votos minimos e devolve os mais relevantes', () => {
    const credits = [
      credit({ id: 1, voteAverage: 9.9, voteCount: 10 }),
      credit({ id: 2, voteAverage: 8.5, voteCount: 30000 }),
      credit({ id: 3, voteAverage: 8.4, voteCount: 20000 }),
    ];

    const highlights = pickHighlights(credits, 2);

    expect(highlights.map((item) => item.id)).toEqual([2, 3]);
  });

  it('nao repete o mesmo titulo vindo de departamentos diferentes', () => {
    const credits = [
      credit({ id: 7, department: 'acting', voteCount: 9000 }),
      credit({ id: 7, department: 'directing', voteCount: 9000 }),
    ];

    expect(pickHighlights(credits, 6)).toHaveLength(1);
  });

  it('relaxa o piso de votos quando a pessoa nao tem titulo popular', () => {
    const credits = [credit({ id: 1, voteAverage: 7, voteCount: 12 })];

    expect(pickHighlights(credits, 6)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx jest src/person/query.spec.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar**

`src/person/query.ts`:

```ts
import {
  MediaType,
  PersonCredit,
  PersonCreditsPage,
} from './interfaces/person.interface';

export const PAGE_SIZE = 20;

const MIN_VOTES_FOR_HIGHLIGHT = 200;
const DEFAULT_HIGHLIGHTS = 6;

export type CreditSort = 'relevance' | 'year' | 'rating';

export interface CreditQuery {
  department?: string;
  media?: MediaType | 'all';
  genre?: number;
  sort?: CreditSort;
  page?: number;
}

export const relevanceScore = (credit: PersonCredit): number =>
  (credit.voteAverage ?? 0) * Math.log10(credit.voteCount + 1);

const compare = (sort: CreditSort) => {
  if (sort === 'year') {
    return (left: PersonCredit, right: PersonCredit) =>
      (right.year ?? 0) - (left.year ?? 0);
  }

  if (sort === 'rating') {
    return (left: PersonCredit, right: PersonCredit) =>
      (right.voteAverage ?? 0) - (left.voteAverage ?? 0);
  }

  return (left: PersonCredit, right: PersonCredit) =>
    relevanceScore(right) - relevanceScore(left);
};

export const queryCredits = (
  credits: PersonCredit[],
  query: CreditQuery,
): PersonCreditsPage => {
  const media = query.media ?? 'all';
  const page = Math.max(1, Math.trunc(query.page ?? 1) || 1);

  const filtered = credits.filter((credit) => {
    if (query.department && credit.department !== query.department) return false;
    if (media !== 'all' && credit.mediaType !== media) return false;
    if (query.genre && !credit.genreIds.includes(query.genre)) return false;
    return true;
  });

  filtered.sort(compare(query.sort ?? 'relevance'));

  const start = (page - 1) * PAGE_SIZE;

  return {
    items: filtered.slice(start, start + PAGE_SIZE),
    page,
    total: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
  };
};

export const pickHighlights = (
  credits: PersonCredit[],
  limit = DEFAULT_HIGHLIGHTS,
): PersonCredit[] => {
  const byTitle = new Map<string, PersonCredit>();

  for (const credit of credits) {
    const key = `${credit.mediaType}:${credit.id}`;
    const current = byTitle.get(key);
    if (!current || relevanceScore(credit) > relevanceScore(current)) {
      byTitle.set(key, credit);
    }
  }

  const unique = [...byTitle.values()].sort(
    (left, right) => relevanceScore(right) - relevanceScore(left),
  );

  const popular = unique.filter(
    (credit) => credit.voteCount >= MIN_VOTES_FOR_HIGHLIGHT,
  );

  return (popular.length ? popular : unique).slice(0, limit);
};
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx jest src/person/query.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/person/query.ts src/person/query.spec.ts
git commit -m "feat(person): filter, rank and paginate credits over the aggregate"
```

---

### Task 5: PersonService, controller e módulo

**Files:**
- Create: `guys-movies-backend/src/person/person.service.ts`
- Create: `guys-movies-backend/src/person/person.controller.ts`
- Create: `guys-movies-backend/src/person/person.module.ts`
- Create: `guys-movies-backend/src/person/person.service.spec.ts`
- Modify: `guys-movies-backend/src/app/app.module.ts`

**Interfaces:**
- Consumes: tudo das Tasks 1–4.
- Produces: `PersonService.getProfile(id: number): Promise<PersonProfile>`, `PersonService.getCredits(id: number, query: CreditQuery): Promise<PersonCreditsPage>`, `PersonService.search(term: string): Promise<PersonSearchResult[]>`.

- [ ] **Step 1: Escrever o teste que falha**

`src/person/person.service.spec.ts`:

```ts
import axios from 'axios';
import { PersonService } from './person.service';
import { GenreMapService } from './genre-map.service';

jest.mock('axios');

const mockedGet = axios.get as jest.Mock;

const genreMap = {
  resolve: jest.fn().mockResolvedValue({
    movie: new Map([[18, 'Drama']]),
    tv: new Map([[10767, 'Talk']]),
  }),
} as unknown as GenreMapService;

const tmdbPerson = {
  id: 31,
  name: 'Tom Hanks',
  biography: 'Ator estadunidense.',
  birthday: '1956-07-09',
  deathday: null,
  place_of_birth: 'Concord, California, USA',
  known_for_department: 'Acting',
  profile_path: '/face.jpg',
  combined_credits: {
    cast: [
      {
        id: 13,
        media_type: 'movie',
        title: 'Forrest Gump',
        character: 'Forrest Gump',
        release_date: '1994-07-06',
        vote_average: 8.5,
        vote_count: 30000,
        genre_ids: [18],
        poster_path: '/fg.jpg',
      },
      {
        id: 99,
        media_type: 'tv',
        name: 'Late Show',
        character: 'Self',
        first_air_date: '2015-09-08',
        vote_average: 6,
        vote_count: 100,
        genre_ids: [10767],
      },
    ],
    crew: [],
  },
};

describe('PersonService', () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedGet.mockResolvedValue({ data: tmdbPerson });
  });

  it('monta o perfil sem os creditos de ruido', async () => {
    const service = new PersonService(genreMap);

    const profile = await service.getProfile(31);

    expect(profile.name).toBe('Tom Hanks');
    expect(profile.stats.totalTitles).toBe(1);
    expect(profile.genres).toEqual([{ id: 18, name: 'Drama', count: 1 }]);
    expect(profile.departments).toEqual([
      { key: 'acting', label: 'Atuação', count: 1 },
    ]);
    expect(profile.defaultDepartment).toBe('acting');
    expect(profile.credits.items[0].title).toBe('Forrest Gump');
    expect(profile.highlights[0].title).toBe('Forrest Gump');
  });

  it('busca o TMDB uma vez por pessoa', async () => {
    const service = new PersonService(genreMap);

    await service.getProfile(31);
    await service.getCredits(31, { department: 'acting' });

    expect(mockedGet).toHaveBeenCalledTimes(1);
  });

  it('cai para a bio em ingles quando a pt-BR vem vazia', async () => {
    mockedGet.mockImplementation((url: string) => {
      if (url.includes('language=en-US')) {
        return Promise.resolve({ data: { biography: 'American actor.' } });
      }
      return Promise.resolve({ data: { ...tmdbPerson, biography: '' } });
    });

    const service = new PersonService(genreMap);
    const profile = await service.getProfile(31);

    expect(profile.biography).toBe('American actor.');
    expect(profile.biographyLanguage).toBe('en');
  });

  it('estoura 404 quando o TMDB nao conhece a pessoa', async () => {
    mockedGet.mockResolvedValue({ data: { success: false } });

    const service = new PersonService(genreMap);

    await expect(service.getProfile(999999999)).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx jest src/person/person.service.spec.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar o serviço**

`src/person/person.service.ts`:

```ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { TtlCache } from '../common/ttl-cache';
import { GenreMapService } from './genre-map.service';
import { normalizeCredits } from './credits';
import {
  buildStats,
  countGenres,
  pickDefaultDepartment,
  summarizeDepartments,
} from './aggregate';
import { CreditQuery, pickHighlights, queryCredits } from './query';
import {
  PersonCredit,
  PersonCreditsPage,
  PersonProfile,
  PersonSearchResult,
} from './interfaces/person.interface';

interface PersonAggregate {
  profile: Omit<PersonProfile, 'credits'>;
  credits: PersonCredit[];
}

const PERSON_TTL_MS = 6 * 60 * 60 * 1000;
const SEARCH_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class PersonService {
  private readonly apiKey = process.env.TMDB_API_KEY;
  private readonly baseUrl = 'https://api.themoviedb.org/3';
  private readonly posterBaseUrl = 'https://image.tmdb.org/t/p/w342';
  private readonly profileBaseUrl = 'https://image.tmdb.org/t/p/w300';
  private readonly cache = new TtlCache<PersonAggregate>(PERSON_TTL_MS, 100);
  private readonly searchCache = new TtlCache<PersonSearchResult[]>(
    SEARCH_TTL_MS,
    100,
  );

  constructor(private readonly genreMapService: GenreMapService) {}

  private async fetchEnglishBiography(id: number): Promise<string | null> {
    try {
      const response = await axios.get<{ biography?: string }>(
        `${this.baseUrl}/person/${id}?api_key=${this.apiKey}&language=en-US`,
        { timeout: 8000 },
      );
      return response.data?.biography?.trim() || null;
    } catch {
      return null;
    }
  }

  private async loadAggregate(id: number): Promise<PersonAggregate> {
    return this.cache.resolve(String(id), async () => {
      const response = await axios.get<any>(
        `${this.baseUrl}/person/${id}?api_key=${this.apiKey}&language=pt-BR` +
          `&append_to_response=combined_credits`,
        { timeout: 10000 },
      );

      const data = response.data;
      if (!data?.id) {
        throw new HttpException('Pessoa não encontrada', HttpStatus.NOT_FOUND);
      }

      const credits = normalizeCredits(
        data.combined_credits?.cast ?? [],
        data.combined_credits?.crew ?? [],
        this.posterBaseUrl,
      );

      const genreMap = await this.genreMapService.resolve();
      const genres = countGenres(credits, genreMap);
      const departments = summarizeDepartments(credits);

      let biography = (data.biography ?? '').trim() || null;
      let biographyLanguage: 'pt' | 'en' | null = biography ? 'pt' : null;

      if (!biography) {
        biography = await this.fetchEnglishBiography(id);
        biographyLanguage = biography ? 'en' : null;
      }

      return {
        credits,
        profile: {
          id: data.id,
          name: data.name,
          profileUrl: data.profile_path
            ? `${this.profileBaseUrl}${data.profile_path}`
            : null,
          biography,
          biographyLanguage,
          birthday: data.birthday ?? null,
          deathday: data.deathday ?? null,
          placeOfBirth: data.place_of_birth ?? null,
          knownForDepartment: data.known_for_department ?? null,
          departments,
          genres,
          stats: buildStats(credits, genres),
          highlights: pickHighlights(credits),
          defaultDepartment: pickDefaultDepartment(
            departments,
            data.known_for_department ?? null,
          ),
        },
      };
    });
  }

  async getProfile(id: number): Promise<PersonProfile> {
    const aggregate = await this.loadAggregate(id);

    return {
      ...aggregate.profile,
      credits: queryCredits(aggregate.credits, {
        department: aggregate.profile.defaultDepartment,
      }),
    };
  }

  async getCredits(
    id: number,
    query: CreditQuery,
  ): Promise<PersonCreditsPage> {
    const aggregate = await this.loadAggregate(id);

    return queryCredits(aggregate.credits, {
      ...query,
      department: query.department || aggregate.profile.defaultDepartment,
    });
  }

  async search(term: string): Promise<PersonSearchResult[]> {
    const trimmed = term?.trim();
    if (!trimmed) return [];

    return this.searchCache.resolve(trimmed.toLowerCase(), async () => {
      const response = await axios.get<any>(
        `${this.baseUrl}/search/person?api_key=${this.apiKey}` +
          `&language=pt-BR&query=${encodeURIComponent(trimmed)}`,
        { timeout: 8000 },
      );

      return (response.data?.results ?? [])
        .filter((result: any) => !result.adult)
        .slice(0, 20)
        .map((result: any) => ({
          id: result.id,
          name: result.name,
          profileUrl: result.profile_path
            ? `${this.profileBaseUrl}${result.profile_path}`
            : null,
          knownForDepartment: result.known_for_department ?? null,
          knownFor: (result.known_for ?? [])
            .map((item: any) => item.title || item.name)
            .filter(Boolean)
            .slice(0, 3),
        }));
    });
  }
}
```

- [ ] **Step 4: Implementar controller e módulo**

`src/person/person.controller.ts`:

```ts
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PersonService } from './person.service';
import { CreditSort } from './query';
import { MediaType } from './interfaces/person.interface';

@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Get('search')
  search(@Query('q') term: string) {
    return this.personService.search(term);
  }

  @Get(':id')
  getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.personService.getProfile(id);
  }

  @Get(':id/credits')
  getCredits(
    @Param('id', ParseIntPipe) id: number,
    @Query('department') department?: string,
    @Query('media') media?: MediaType | 'all',
    @Query('genre') genre?: string,
    @Query('sort') sort?: CreditSort,
    @Query('page') page?: string,
  ) {
    return this.personService.getCredits(id, {
      department,
      media,
      genre: genre ? Number(genre) : undefined,
      sort,
      page: page ? Number(page) : 1,
    });
  }
}
```

`src/person/person.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { PersonController } from './person.controller';
import { PersonService } from './person.service';
import { GenreMapService } from './genre-map.service';

@Module({
  controllers: [PersonController],
  providers: [PersonService, GenreMapService],
  exports: [PersonService],
})
export class PersonModule {}
```

Em `src/app/app.module.ts`, importar `PersonModule` de `src/person/person.module` e acrescentá-lo ao array `imports`, logo após `SearchModule`.

> `@Get('search')` precisa vir **antes** de `@Get(':id')` no controller, senão o Nest casa `search` como id e o `ParseIntPipe` devolve 400.

- [ ] **Step 5: Rodar os testes e subir o servidor**

Run: `npx jest src/person`
Expected: PASS, todos os specs de `person`.

Run: `npx nest build && node dist/main.js`
Depois, noutro terminal:

```bash
curl -s "http://localhost:3005/person/31" | head -c 400
curl -s -o /dev/null -w "%{size_download} bytes\n" "http://localhost:3005/person/31"
curl -s "http://localhost:3005/person/31/credits?department=acting&page=2" | head -c 200
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3005/person/999999999"
```

Expected: o perfil responde com `Tom Hanks`; **o payload fica na casa das dezenas de KB, não dos 247KB** do TMDB; a página 2 devolve outros títulos; o id inexistente devolve 404.

- [ ] **Step 6: Commit**

```bash
git add src/person src/app/app.module.ts
git commit -m "feat(person): expose person profile, credits and search endpoints"
```

---

### Task 6: Id do TMDB no elenco e na direção

**Files:**
- Modify: `guys-movies-backend/src/movie/movie.service.ts` (`mapCast`, `mapDirector`)
- Modify: `guys-movies-backend/src/serie/serie.service.ts` (`mapCast`)
- Modify: `guys-movies-backend/src/movie/dto/movie.dto.ts` (`CastDto` e o tipo do diretor)
- Modify: `guys-movies-frontend/interfaces/movie/types.ts` (`CastMember`, `Director`)

**Interfaces:**
- Consumes: nada.
- Produces: `CastMember.id?: number` e `Director.id?: number` no frontend; os mesmos campos nos DTOs do backend.

- [ ] **Step 1: Acrescentar o id no backend**

Em `movie.service.ts`, `mapCast` passa a devolver `id: actor.id` junto dos campos atuais, e `mapDirector` passa a devolver `id: director.id`. Em `serie.service.ts`, `mapCast` recebe o mesmo `id: actor.id`.

Em `src/movie/dto/movie.dto.ts`, acrescentar `id: number;` a `CastDto` e ao objeto do diretor.

- [ ] **Step 2: Acrescentar o id no frontend**

Em `interfaces/movie/types.ts`:

```ts
export interface CastMember {
  id?: number;
  name: string;
  character: string;
  profile_path: string;
}

export interface Director {
  id?: number;
  name: string;
  profile_path: string;
}
```

O `?` é proposital: títulos ainda em cache no backend respondem sem o campo, e a interface precisa aguentar isso sem quebrar.

- [ ] **Step 3: Verificar**

Run (backend reiniciado): `curl -s "http://localhost:3005/movie/13" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const m=JSON.parse(d);console.log('elenco[0]:',JSON.stringify(m.cast[0]));console.log('diretor:',JSON.stringify(m.director));})"`
Expected: ambos trazem `id` numérico.

- [ ] **Step 4: Commit**

```bash
git add ../guys-movies-backend/src/movie ../guys-movies-backend/src/serie interfaces/movie/types.ts
git commit -m "feat(credits): expose TMDB ids on cast and director"
```

---

### Task 7: Tipos do frontend e página `/pessoa/[id]` com o hero

**Files:**
- Create: `guys-movies-frontend/interfaces/person/types.ts`
- Create: `guys-movies-frontend/components/person/personHero.tsx`
- Create: `guys-movies-frontend/pages/pessoa/[id].tsx`

**Interfaces:**
- Consumes: o contrato de `GET /person/:id` da Task 5.
- Produces: `PersonProfile`, `PersonCredit`, `DepartmentSummary`, `GenreCount`, `PersonCreditsPage`, `PersonStats` (espelho dos tipos do backend) e o componente `PersonHero`.

- [ ] **Step 1: Criar os tipos**

`interfaces/person/types.ts`:

```ts
export type MediaType = "movie" | "tv";

export interface PersonCredit {
  id: number;
  mediaType: MediaType;
  title: string;
  posterUrl: string | null;
  year: number | null;
  voteAverage: number | null;
  voteCount: number;
  genreIds: number[];
  role: string;
  department: string;
}

export interface DepartmentSummary {
  key: string;
  label: string;
  count: number;
}

export interface GenreCount {
  id: number;
  name: string;
  count: number;
}

export interface PersonStats {
  totalTitles: number;
  firstYear: number | null;
  lastYear: number | null;
  topGenre: string | null;
  bestRated: PersonCredit | null;
}

export interface PersonCreditsPage {
  items: PersonCredit[];
  page: number;
  totalPages: number;
  total: number;
}

export interface PersonProfile {
  id: number;
  name: string;
  profileUrl: string | null;
  biography: string | null;
  biographyLanguage: "pt" | "en" | null;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  knownForDepartment: string | null;
  departments: DepartmentSummary[];
  genres: GenreCount[];
  stats: PersonStats;
  highlights: PersonCredit[];
  defaultDepartment: string;
  credits: PersonCreditsPage;
}

export interface ArtistSearchResult {
  id: number;
  name: string;
  profileUrl: string | null;
  knownForDepartment: string | null;
  knownFor: string[];
}

export const creditHref = (credit: PersonCredit): string =>
  credit.mediaType === "tv" ? `/serie/${credit.id}` : `/movie/${credit.id}`;

export const personAge = (
  birthday: string | null,
  deathday: string | null,
): number | null => {
  if (!birthday) return null;

  const born = new Date(birthday);
  const end = deathday ? new Date(deathday) : new Date();
  if (Number.isNaN(born.getTime()) || Number.isNaN(end.getTime())) return null;

  let age = end.getFullYear() - born.getFullYear();
  const monthDelta = end.getMonth() - born.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && end.getDate() < born.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
};
```

- [ ] **Step 2: Criar o hero**

`components/person/personHero.tsx`: recebe `profile: PersonProfile`. Renderiza, sobre um fundo em degradê de índigo (`radial-gradient` em `rgba(79,70,229,.34)` no canto superior esquerdo, fundindo para `#05050c`):

- foto circular de 128px com borda `border-white/10`; sem foto, as iniciais, como `castSection.tsx` já faz
- sobrelinha com o rótulo do departamento principal, em `text-[11px] uppercase tracking-[0.3em] text-indigo-300`
- nome em `text-4xl lg:text-5xl font-black tracking-tight`
- linha de metadados: idade calculada de `birthday` (ou intervalo com `deathday`), `placeOfBirth`, `stats.totalTitles` títulos, `ativo desde {stats.firstYear}` — cada campo some quando o dado for nulo, sem "Não informado"
- biografia truncada em 320 caracteres com botão "ler mais" que expande via `useState`; quando `biographyLanguage === "en"`, uma nota discreta "Biografia disponível apenas em inglês"
- quando não houver biografia em nenhum idioma, a seção inteira não é renderizada

- [ ] **Step 3: Criar a página**

`pages/pessoa/[id].tsx` com `getStaticPaths` (`paths: []`, `fallback: "blocking"`) e `getStaticProps` que busca `${process.env.NEXT_PUBLIC_URL_API}/person/${id}`:

```tsx
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: "blocking",
});

const PERSON_REVALIDATE_SECONDS = 86400;
const PERSON_RETRY_SECONDS = 60;

export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params!;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL_API}/person/${id}`,
    );

    if (!response.ok) {
      return { notFound: true, revalidate: PERSON_RETRY_SECONDS };
    }

    const profile = await response.json();

    if (!profile?.id) {
      return { notFound: true, revalidate: PERSON_RETRY_SECONDS };
    }

    return {
      revalidate: PERSON_REVALIDATE_SECONDS,
      props: { profile },
    };
  } catch {
    return { notFound: true, revalidate: PERSON_RETRY_SECONDS };
  }
};
```

O corpo renderiza `<Head>` com `<title>{profile.name} - GuysMovies</title>` e `<PersonHero profile={profile} />`. **Não renderiza `<Header />` nem `<Footer />`** — o shell vive no `_app` desde o commit `16beb1a`.

- [ ] **Step 4: Verificar**

```bash
npx prettier --write pages/pessoa components/person interfaces/person
npx tsc --noEmit
npx next build
```

Expected: typecheck limpo e `/pessoa/[id]` aparecendo como `●` (SSG) na tabela de rotas do build.

Depois, com backend e `next start` no ar, abrir `http://localhost:3002/pessoa/31` e conferir nome, foto, metadados e bio.

- [ ] **Step 5: Commit**

```bash
git add interfaces/person components/person pages/pessoa
git commit -m "feat(person): add the person page with its hero"
```

---

### Task 8: Destaques em pôster

**Files:**
- Create: `guys-movies-frontend/components/person/careerHighlights.tsx`
- Modify: `guys-movies-frontend/pages/pessoa/[id].tsx`

**Interfaces:**
- Consumes: `PersonCredit` da Task 7.
- Produces: `CareerHighlights` com props `{ credits: PersonCredit[] }`.

- [ ] **Step 1: Criar o componente**

`components/person/careerHighlights.tsx`:

```tsx
import React from "react";
import Link from "next/link";
import { creditHref, PersonCredit } from "../../interfaces/person/types";

interface CareerHighlightsProps {
  credits: PersonCredit[];
}

const CareerHighlights: React.FC<CareerHighlightsProps> = ({ credits }) => {
  if (!credits.length) return null;

  return (
    <section className="mt-10">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
        Definem a carreira
      </h2>
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {credits.map((credit) => (
          <Link
            key={`${credit.mediaType}-${credit.id}`}
            href={creditHref(credit)}
            className="group flex flex-col gap-2 transition-transform duration-300 ease-ios hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-indigo-400"
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-white/5">
              {credit.posterUrl ? (
                <img
                  src={credit.posterUrl}
                  alt={credit.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center p-2 text-center text-[11px] font-semibold text-white/50">
                  {credit.title}
                </span>
              )}
            </div>
            <span className="line-clamp-2 text-xs font-semibold leading-snug text-white">
              {credit.title}
            </span>
            <span className="text-[11px] tabular-nums text-white/40">
              {credit.year ?? "—"}
              {credit.voteAverage ? ` · ★ ${credit.voteAverage.toFixed(1)}` : ""}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CareerHighlights;
```

- [ ] **Step 2: Montar na página**

Renderizar `<CareerHighlights credits={profile.highlights} />` logo abaixo do hero, ainda dentro do bloco de fundo em degradê.

- [ ] **Step 3: Verificar**

Run: `npx prettier --write components/person pages/pessoa && npx tsc --noEmit && npx next build`
Expected: limpo. Em `/pessoa/31` os seis destaques devem ser Forrest Gump, À Espera de um Milagre, O Resgate do Soldado Ryan, Toy Story, Prenda-Me se For Capaz e Toy Story 3. **Se aparecer "Os Simpsons" ou "O Barco do Amor", a ordenação da Task 4 está errada.**

- [ ] **Step 4: Commit**

```bash
git add components/person/careerHighlights.tsx pages/pessoa
git commit -m "feat(person): open the page with the career highlights"
```

---

### Task 9: Barras de gênero

**Files:**
- Create: `guys-movies-frontend/components/person/genreBreakdown.tsx`
- Modify: `guys-movies-frontend/pages/pessoa/[id].tsx`

**Interfaces:**
- Consumes: `GenreCount` da Task 7.
- Produces: `GenreBreakdown` com props `{ genres: GenreCount[]; activeGenre: number | null; onSelect: (genreId: number | null) => void }`.

- [ ] **Step 1: Criar o componente**

**Cor é série única.** Um só tom de índigo, variando por estado. A cor codifica
seleção, não identidade de gênero — não é paleta categórica e por isso não exige
validação de contraste entre matizes.

`components/person/genreBreakdown.tsx`:

```tsx
import React from "react";
import { GenreCount } from "../../interfaces/person/types";

interface GenreBreakdownProps {
  genres: GenreCount[];
  activeGenre: number | null;
  onSelect: (genreId: number | null) => void;
}

const MAX_GENRES = 8;

const GenreBreakdown: React.FC<GenreBreakdownProps> = ({
  genres,
  activeGenre,
  onSelect,
}) => {
  const visible = genres.slice(0, MAX_GENRES);
  if (!visible.length) return null;

  const maxCount = Math.max(...visible.map((genre) => genre.count));

  return (
    <section className="mt-10">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
        Gêneros · clique para filtrar
      </h2>
      <div className="mt-4 flex max-w-xl flex-col gap-2">
        {visible.map((genre) => {
          const isActive = genre.id === activeGenre;

          return (
            <button
              key={genre.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(isActive ? null : genre.id)}
              className="grid grid-cols-[88px_1fr_34px] items-center gap-3 rounded-md py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              <span
                className={`truncate text-xs transition-colors ${
                  isActive ? "font-bold text-white" : "text-white/60"
                }`}
              >
                {genre.name}
              </span>
              <span className="h-2 overflow-hidden rounded bg-white/7">
                <span
                  style={{ width: `${(genre.count / maxCount) * 100}%` }}
                  className={`block h-full rounded transition-colors ${
                    isActive ? "bg-indigo-400" : "bg-indigo-400/50"
                  }`}
                />
              </span>
              <span
                className={`text-right text-[11px] tabular-nums transition-colors ${
                  isActive ? "font-bold text-indigo-300" : "text-white/40"
                }`}
              >
                {genre.count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default GenreBreakdown;
```

- [ ] **Step 2: Montar na página**

Estado `const [activeGenre, setActiveGenre] = useState<number | null>(null)` na página, passado ao componente. Ainda não filtra nada — a lista chega na Task 10.

- [ ] **Step 3: Verificar**

Run: `npx prettier --write components/person pages/pessoa && npx tsc --noEmit && npx next build`
Expected: limpo. Em `/pessoa/31`, o topo deve ser **Drama** e depois **Comédia**. **Se "Documentário" ou "Talk" liderarem, o filtro de ruído da Task 1 não está sendo aplicado.**

- [ ] **Step 4: Commit**

```bash
git add components/person/genreBreakdown.tsx pages/pessoa
git commit -m "feat(person): add the clickable genre breakdown"
```

---

### Task 10: Abas, lista de créditos e paginação

**Files:**
- Create: `guys-movies-frontend/hooks/usePersonCredits.ts`
- Create: `guys-movies-frontend/components/person/departmentTabs.tsx`
- Create: `guys-movies-frontend/components/person/creditList.tsx`
- Modify: `guys-movies-frontend/pages/pessoa/[id].tsx`

**Interfaces:**
- Consumes: `PersonCredit`, `DepartmentSummary`, `PersonCreditsPage` da Task 7; `GET /person/:id/credits` da Task 5.
- Produces: `usePersonCredits({ personId, initialPage, defaultDepartment })` devolvendo `{ items, department, media, sort, genre, total, status, hasMore, setDepartment, setMedia, setSort, setGenre, loadMore, retry }`.
- Produces: `DepartmentTabs` com props `{ departments, active, onChange }`.
- Produces: `CreditList` com props `{ items, status, hasMore, activeGenreName, onLoadMore, onClearGenre, onRetry }`.

- [ ] **Step 1: Criar o hook**

Dois pontos que o implementador precisa respeitar, e que o código abaixo já resolve:
não disparar requisição no mount (a primeira página já veio no HTML da ISR), e usar
`shallow: true` no `router.replace` — sem ele o Next refaz a navegação de dados a
cada clique de filtro, que é exatamente o custo que os commits `2bff89f` e `16beb1a`
eliminaram.

`hooks/usePersonCredits.ts`:

```ts
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  MediaType,
  PersonCredit,
  PersonCreditsPage,
} from "../interfaces/person/types";

export type CreditSort = "relevance" | "year" | "rating";
export type MediaFilter = MediaType | "all";
type Status = "ready" | "loading" | "failed";

interface Options {
  personId: number;
  initialPage: PersonCreditsPage;
  defaultDepartment: string;
}

export const usePersonCredits = ({
  personId,
  initialPage,
  defaultDepartment,
}: Options) => {
  const router = useRouter();

  const [department, setDepartmentState] = useState(defaultDepartment);
  const [media, setMediaState] = useState<MediaFilter>("all");
  const [sort, setSortState] = useState<CreditSort>("relevance");
  const [genre, setGenreState] = useState<number | null>(null);

  const [items, setItems] = useState<PersonCredit[]>(initialPage.items);
  const [page, setPage] = useState(initialPage.page);
  const [totalPages, setTotalPages] = useState(initialPage.totalPages);
  const [total, setTotal] = useState(initialPage.total);
  const [status, setStatus] = useState<Status>("ready");

  const requestRef = useRef(0);
  const isFirstRun = useRef(true);

  const fetchPage = useCallback(
    async (nextPage: number, append: boolean) => {
      const requestId = requestRef.current + 1;
      requestRef.current = requestId;
      setStatus("loading");

      try {
        const params = new URLSearchParams({
          department,
          media,
          sort,
          page: String(nextPage),
        });
        if (genre !== null) params.set("genre", String(genre));

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/person/${personId}/credits?${params.toString()}`,
        );

        if (!response.ok) throw new Error("Falha ao carregar a filmografia");

        const data = (await response.json()) as PersonCreditsPage;
        if (requestRef.current !== requestId) return;

        setItems((current) =>
          append ? [...current, ...data.items] : data.items,
        );
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotal(data.total);
        setStatus("ready");
      } catch {
        if (requestRef.current !== requestId) return;
        setStatus("failed");
      }
    },
    [department, genre, media, personId, sort],
  );

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    fetchPage(1, false);

    const query: Record<string, string> = { id: String(personId) };
    if (department !== defaultDepartment) query.departamento = department;
    if (media !== "all") query.midia = media;
    if (sort !== "relevance") query.ordem = sort;
    if (genre !== null) query.genero = String(genre);

    router.replace({ pathname: "/pessoa/[id]", query }, undefined, {
      shallow: true,
    });
  }, [department, genre, media, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(() => {
    if (status === "loading" || page >= totalPages) return;
    fetchPage(page + 1, true);
  }, [fetchPage, page, status, totalPages]);

  return {
    items,
    department,
    media,
    sort,
    genre,
    total,
    status,
    hasMore: page < totalPages,
    setDepartment: setDepartmentState,
    setMedia: setMediaState,
    setSort: setSortState,
    setGenre: setGenreState,
    loadMore,
    retry: () => fetchPage(1, false),
  };
};
```

A dependência do efeito é intencionalmente só a dos filtros, com o lint desligado na
linha: incluir `router` e `fetchPage` provocaria um laço de `replace`.

- [ ] **Step 2: Criar as abas**

`components/person/departmentTabs.tsx`: props `{ departments: DepartmentSummary[]; active: string; onChange: (key: string) => void }`. Reaproveita o visual de `searchTypeFilter.tsx` — pílulas `rounded-full border min-h-[44px]`, ativa em `border-indigo-400/60 bg-indigo-500/20 text-indigo-100` —, com a contagem ao lado do rótulo em `tabular-nums text-white/40`. Com um departamento só, não renderiza as abas.

- [ ] **Step 3: Criar a lista**

`components/person/creditList.tsx`:

```tsx
import React from "react";
import Link from "next/link";
import { creditHref, PersonCredit } from "../../interfaces/person/types";

interface CreditListProps {
  items: PersonCredit[];
  status: "ready" | "loading" | "failed";
  hasMore: boolean;
  activeGenreName: string | null;
  onLoadMore: () => void;
  onClearGenre: () => void;
  onRetry: () => void;
}

const CreditList: React.FC<CreditListProps> = ({
  items,
  status,
  hasMore,
  activeGenreName,
  onLoadMore,
  onClearGenre,
  onRetry,
}) => {
  if (status === "failed" && !items.length) {
    return (
      <div className="mt-8 text-center">
        <p className="text-sm text-white/60">
          Não foi possível carregar a filmografia.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 min-h-[44px] rounded-full border border-white/15 px-6 text-sm font-semibold text-white"
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  if (status === "loading" && !items.length) {
    return (
      <div className="mt-5 flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton h-[72px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mt-8 text-center">
        <p className="text-sm text-white/50">
          {activeGenreName
            ? `Nenhum título de ${activeGenreName} neste departamento.`
            : "Nada por aqui ainda."}
        </p>
        {activeGenreName && (
          <button
            type="button"
            onClick={onClearGenre}
            className="mt-4 min-h-[44px] rounded-full border border-white/15 px-6 text-sm font-semibold text-white"
          >
            Limpar filtro
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-5 flex flex-col gap-2">
      {items.map((credit) => (
        <Link
          key={`${credit.department}-${credit.mediaType}-${credit.id}-${credit.role}`}
          href={creditHref(credit)}
          className="grid grid-cols-[38px_1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2.5 transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-indigo-400"
        >
          <div className="h-[54px] w-[38px] overflow-hidden rounded-md border border-white/10 bg-white/5">
            {credit.posterUrl && (
              <img
                src={credit.posterUrl}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {credit.title}
            </p>
            <p className="truncate text-xs text-white/40">
              {credit.department === "acting" ? "como " : ""}
              <span className="text-indigo-300">{credit.role}</span>
            </p>
          </div>
          <span className="whitespace-nowrap text-right text-xs tabular-nums text-white/40">
            {credit.year ?? "—"}
            {credit.voteAverage ? ` · ★ ${credit.voteAverage.toFixed(1)}` : ""}
          </span>
        </Link>
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={status === "loading"}
          className="mt-3 min-h-[44px] w-full rounded-2xl border border-white/10 text-sm font-semibold text-white/70 disabled:opacity-60"
        >
          {status === "loading" ? "Carregando..." : "Carregar mais"}
        </button>
      )}
    </div>
  );
};

export default CreditList;
```

- [ ] **Step 4: Montar na página**

A página passa `profile.credits` como `initialPage` e `profile.defaultDepartment` ao hook, liga `activeGenre` do `GenreBreakdown` ao `setGenre` do hook, e renderiza abas, barra de filtros (`Tudo · Filmes · Séries` e o seletor de ordenação) e a lista.

- [ ] **Step 5: Verificar**

Run: `npx prettier --write hooks components/person pages/pessoa && npx tsc --noEmit && npx next build`

Com backend e `next start` no ar, em `/pessoa/31`:
- trocar para a aba "Produção" muda a lista e a contagem
- clicar em "Comédia" filtra, e o contador da aba continua o total do departamento
- "Carregar mais" acrescenta 20 e não duplica itens
- a query string acompanha os filtros, e voltar pelo histórico devolve a mesma vista
- a navegação entre filtros **não** dispara requisição de `_next/data` (confirmar na aba Network)

- [ ] **Step 6: Commit**

```bash
git add hooks/usePersonCredits.ts components/person pages/pessoa
git commit -m "feat(person): paginate the filmography by department and genre"
```

---

### Task 11: Cruzamento com a biblioteca

**Files:**
- Create: `guys-movies-frontend/components/person/libraryCrossover.tsx`
- Modify: `guys-movies-frontend/pages/pessoa/[id].tsx`

**Interfaces:**
- Consumes: `useAuth` de `hooks/authContext`, `useUserLibrary` de `hooks/useUserLibrary`, `PersonCredit` da Task 7.
- Produces: `LibraryCrossover` com props `{ credits: PersonCredit[] }`.

- [ ] **Step 1: Criar o componente**

`useUserLibrary` já existe e devolve `{ watchedMovies, watchedSeries, watchlistMovies, watchlistSeries }` como `Set<number>`, mais `isReady`. **Não criar endpoint novo** — e note que ele não traz notas, por isso a média do usuário ficou fora (registrado na spec).

Conta apenas `mediaType === "movie"`: a biblioteca de séries tem granularidade de temporada, então o texto diz "filmes", não "títulos".

`components/person/libraryCrossover.tsx`:

```tsx
import React, { useMemo } from "react";
import { useAuth } from "../../hooks/authContext";
import { useUserLibrary } from "../../hooks/useUserLibrary";
import { PersonCredit } from "../../interfaces/person/types";

interface LibraryCrossoverProps {
  credits: PersonCredit[];
}

const LibraryCrossover: React.FC<LibraryCrossoverProps> = ({ credits }) => {
  const { isAuthenticated, authLoading } = useAuth();
  const { watchedMovies, isReady } = useUserLibrary();

  const movieIds = useMemo(
    () =>
      new Set(
        credits
          .filter((credit) => credit.mediaType === "movie")
          .map((credit) => credit.id),
      ),
    [credits],
  );

  const watchedCount = useMemo(() => {
    let count = 0;
    movieIds.forEach((id) => {
      if (watchedMovies.has(id)) count += 1;
    });
    return count;
  }, [movieIds, watchedMovies]);

  if (authLoading || (isAuthenticated && !isReady)) {
    return <div className="skeleton mt-8 h-[68px] w-full rounded-2xl" />;
  }

  if (!isAuthenticated) {
    return (
      <p className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/50">
        Entre na sua conta para ver quantos filmes dessa pessoa você já assistiu.
      </p>
    );
  }

  const total = movieIds.size;
  if (!total) return null;

  const percent = Math.round((watchedCount / total) * 100);

  return (
    <section className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/8 px-5 py-4">
      <span className="text-2xl font-extrabold tabular-nums leading-none text-emerald-300">
        {watchedCount}/{total}
      </span>
      <span className="text-sm text-white/60">
        filmes dessa pessoa que você já assistiu
      </span>
      <span className="h-2 min-w-[150px] flex-1 overflow-hidden rounded bg-white/9">
        <span
          style={{ width: `${percent}%` }}
          className="block h-full rounded bg-emerald-400"
        />
      </span>
    </section>
  );
};

export default LibraryCrossover;
```

- [ ] **Step 2: Montar na página**

Renderizar logo abaixo dos destaques, antes das barras de gênero.

- [ ] **Step 3: Verificar**

Run: `npx prettier --write components/person pages/pessoa && npx tsc --noEmit && npx next build`

Com `next start`: deslogado mostra o convite; logado mostra a contagem. **Conferir no HTML servido que nenhum dado de usuário aparece** — `curl -s http://localhost:3002/pessoa/31 | grep -i "você viu"` não pode retornar nada, porque o HTML estático é o mesmo para todos.

- [ ] **Step 4: Commit**

```bash
git add components/person/libraryCrossover.tsx pages/pessoa
git commit -m "feat(person): cross the filmography with the viewer library"
```

---

### Task 12: Links a partir do elenco e da direção

**Files:**
- Modify: `guys-movies-frontend/components/mediaDetails/castSection.tsx`
- Modify: `guys-movies-frontend/pages/movie/[id].tsx` (linha do diretor em "Detalhes rápidos")

**Interfaces:**
- Consumes: `CastMember.id` e `Director.id` da Task 6; a rota `/pessoa/[id]` da Task 7.
- Produces: nada que outra task consuma.

- [ ] **Step 1: Tornar o elenco clicável**

Em `castSection.tsx`, cada membro com `id` vira um `Link href={`/pessoa/${member.id}`}` envolvendo o cartão, com `transition-colors hover:bg-white/10` e `focus-visible:outline-2 focus-visible:outline-indigo-400`. **Sem `id`, continua sendo uma `div`** — títulos ainda em cache no backend não têm o campo e não podem virar link quebrado.

A `key` atual é `` `${member.name}-${member.character}` ``; trocar para `member.id ?? `${member.name}-${member.character}`` para evitar colisão quando o mesmo ator aparece duas vezes.

- [ ] **Step 2: Tornar o diretor clicável**

Em `pages/movie/[id].tsx`, a linha de "Diretor" em "Detalhes rápidos" hoje é `movie.director?.name ?? "Não informado"`. Quando houver `movie.director?.id`, o valor vira um `Link` para `/pessoa/${id}` em `text-indigo-300 hover:text-indigo-200`; sem id, segue texto puro.

- [ ] **Step 3: Verificar**

Run: `npx prettier --write components/mediaDetails pages/movie && npx tsc --noEmit && npx next build`

Com `next start`: abrir `/movie/13`, clicar num nome do elenco e no diretor, confirmar que ambos chegam à pessoa certa. Conferir que um título cujo cache do backend seja antigo (reiniciar o backend limpa) não quebra.

- [ ] **Step 4: Commit**

```bash
git add components/mediaDetails/castSection.tsx pages/movie
git commit -m "feat(credits): link cast and director to the person page"
```

---

### Task 13: Aba "Artistas" na busca

**Files:**
- Modify: `guys-movies-frontend/components/search/searchTypeFilter.tsx`
- Create: `guys-movies-frontend/hooks/useArtistSearch.ts`
- Create: `guys-movies-frontend/components/search/artistResults.tsx`
- Modify: `guys-movies-frontend/pages/busca.tsx`

**Interfaces:**
- Consumes: `GET /person/search?q=` da Task 5.
- Produces: `SearchTypeFilterValue` passa a incluir `"artists"`; `useArtistSearch(term: string, isEnabled: boolean)` devolvendo `{ artists: ArtistSearchResult[], status, retry }`, com `ArtistSearchResult` vindo de `interfaces/person/types` (Task 7).

- [ ] **Step 1: Renomear o rótulo e acrescentar a aba**

Em `searchTypeFilter.tsx`:

```ts
export type SearchTypeFilterValue =
  | "all"
  | "movie"
  | "serie"
  | "people"
  | "artists";

const OPTIONS: { value: SearchTypeFilterValue; label: string }[] = [
  { value: "all", label: "Tudo" },
  { value: "movie", label: "Filmes" },
  { value: "serie", label: "Séries" },
  { value: "artists", label: "Artistas" },
  { value: "people", label: "Usuários" },
];
```

O valor interno `people` **não muda** — só o rótulo. Trocar o valor quebraria o estado já persistido na URL da busca.

O tipo de `counts` ganha `artists: number | null`.

- [ ] **Step 2: Criar o hook**

`hooks/useArtistSearch.ts`: mesma estrutura de `usePeopleSearch` (debounce de 300ms, contador de requisição em `useRef`), mas chamando `fetch` simples — a busca de artistas é pública e **não** passa por `authFetch`. Sem paginação: o endpoint devolve até 20.

- [ ] **Step 3: Criar os resultados**

`components/search/artistResults.tsx`: lista de cartões, cada um um `Link` para `/pessoa/${id}`, com foto circular de 48px (ou iniciais), nome, o departamento traduzido e, abaixo, os títulos de `knownFor` separados por `·` em `text-white/40`. Estados `loading`, `idle`, vazio e `failed`, seguindo exatamente o vocabulário de `peopleResults.tsx`.

- [ ] **Step 4: Ligar na página**

Em `busca.tsx`, ligar o hook, acrescentar a contagem ao `counts` e renderizar `ArtistResults` quando a aba ativa for `artists`. Na aba "Tudo", **não** misturar artistas com títulos — a aba "Tudo" continua sendo filmes e séries, como hoje.

- [ ] **Step 5: Verificar**

Run: `npx prettier --write components/search hooks pages/busca.tsx && npx tsc --noEmit && npx next build`

Com `next start`: buscar "tom hanks" na aba Artistas e clicar no resultado; conferir que a aba "Usuários" continua funcionando com o comportamento de seguir intacto.

- [ ] **Step 6: Commit**

```bash
git add components/search hooks/useArtistSearch.ts pages/busca.tsx
git commit -m "feat(search): add the artists tab and rename the users one"
```

---

## Verificação final

Depois da última task, com backend e build de produção no ar:

- [ ] `cd guys-movies-backend && npx jest src/person` — todos verdes
- [ ] `cd guys-movies-frontend && npx tsc --noEmit` — limpo
- [ ] `npx prettier --check pages components hooks interfaces` — limpo
- [ ] `npx next build` — `/pessoa/[id]` aparece como `●` (SSG)
- [ ] `curl -s -o /dev/null -w "%{size_download}\n" http://localhost:3005/person/31` — dezenas de KB, não 247KB
- [ ] `/pessoa/31` abre com Drama no topo dos gêneros e Forrest Gump nos destaques
- [ ] `/pessoa/999999999` devolve 404
- [ ] Rodar a bancada de navegação usada nos commits `2bff89f` e `16beb1a` e confirmar que a tela nova não regride os tempos
- [ ] Screenshot de `/pessoa/31` em 1440px e em 390px

## Fora de escopo

Confirmado na spec: links externos (IMDb, Instagram), colaborador mais frequente, seguir um artista, e tradução de bio que o TMDB só tem em inglês.
