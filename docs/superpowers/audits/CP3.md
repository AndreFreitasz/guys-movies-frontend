# CP3 — Marcar como assistido ao dar nota

## Contexto de execução

Steps 15 e 17 do brief (verificação no navegador logado e a auditoria via
`differential-review`/`fp-check`) foram pulados por decisão do controller:
não há harness de browser disponível nesta máquina e a revisão diferencial é
disparada pelo controller depois deste report. Step 10 (`npm run
migration:run` e a checagem `psql`) também foi pulado: o Docker está parado
nesta máquina, Postgres indisponível — a migration do Step 9 foi escrita mas
não foi executada aqui.

## Alterações — backend (`guys-movies-backend`)

### `src/movie/watched-movie/watched-movie.service.spec.ts` (novo)

### `src/serie/watched-serie/watched-serie.service.spec.ts` (novo)

Testes transcritos literalmente do brief, com mocks de repositório e de
`CreatedMovieService`/`CreatedSerieService`. Cobrem: criação do registro
vinculado à mídia quando ainda não existe, atualização apenas da nota quando
já existe, e escopo da busca pelo usuário autenticado.

Rodados antes da implementação (Step 2/Step 7 primeira metade): falharam por
erro de compilação TypeScript, `rateMovie`/`rateSerie` aceitavam 3
argumentos e devolviam `string`, não `{ message, created }` — exatamente o
esperado pelo brief. Ver "Comandos executados" abaixo para o output real.

Ao rodar pela primeira vez foi descoberto um problema de infraestrutura de
teste pré-existente e não coberto pelo brief: `src/users/entities/user.entity.ts`
importa via `from 'src/movie/entities/waiting-movie.entity'` (caminho
absoluto a partir da raiz do repo, resolvido pelo `baseUrl` do
`tsconfig.json` para o build normal). O `jest` do `package.json` não tinha
`moduleNameMapper` para esse padrão, então qualquer teste que importe
(direta ou transitivamente) `user.entity.ts` falhava com `Cannot find
module 'src/...'`. Como estes eram os dois primeiros arquivos `.spec.ts` do
backend, o problema nunca havia sido exercitado antes. Corrigido adicionando
`"moduleNameMapper": { "^src/(.*)$": "<rootDir>/$1" }` à config `jest` em
`package.json` — confirmado via config isolada antes de aplicar no arquivo
real (ver seção Comandos). Sem essa correção os 6 testes pedidos pelo brief
não rodam.

### `src/movie/watched-movie/watched-movie.service.ts`

`rateMovie` reescrito por inteiro conforme o brief: quando já existe
registro para `idUser`/`idTmdb`, só atualiza `rating` e devolve
`{ message, created: false }`. Quando não existe, cadastra a mídia via
`createdMovieService.createMovie` (se `createMovieDto` foi enviado), busca o
`Movies` por `idTmdb`, e insere o `WatchedMovie` já com `idMovie: { id }`
vinculado, `watchedAt: null`, devolvendo `{ message, created: true }`.
Assinatura muda de `Promise<string>` para
`Promise<{ message: string; created: boolean }>`.

### `src/movie/watched-movie/watched-movie.controller.ts`

`POST rate` passa a repassar `body.createMovieDto` ao service e devolve
diretamente o objeto retornado pelo service (`{ message, created }`) em vez
de reembrulhar `{ message }`.

### `src/movie/dto/rate-movie.dto.ts`

Ganhou `createMovieDto?: CreatedMovieDto` com
`@IsOptional() @IsObject() @ValidateNested() @Type(() => CreatedMovieDto)`.
Os dois decorators de validação aninhada (`@ValidateNested()` e
`@Type()`) estão presentes juntos — checado porque com apenas um o
class-validator pula a validação do objeto aninhado em silêncio.
`CreatedMovieDto` (não alterado neste checkpoint) mantém os `@MaxLength` em
todos os campos de texto e o `@Matches(/^(https:\/\/image\.tmdb\.org\/|\/)/)`
em `posterPath`, preso à CDN da TMDB.

### `src/serie/watched-serie/watched-serie.service.ts`

`rateSerie` espelha `rateMovie`, trocando `idUser`/`idMovie` por
`user`/`serie` (nomes reais das relações na entidade `WatchedSerie`) e as
chamadas por `createdSerieService.createSerie`/`.findSerieByIdTmdb`.
Mensagens: `'Avaliação atualizada com sucesso'` e `'Série marcada como
assistida com sucesso'`.

### `src/serie/watched-serie/watched-serie.controller.ts`

Mesma mudança do controller de filme: repassa `body.createSerieDto` e
devolve o objeto do service.

### `src/serie/dto/rate-serie.dto.ts`

Ganhou `createSerieDto?: CreatedSerieDto` com os mesmos quatro decorators.
`CreatedSerieDto` mantém `@MaxLength` e o `@Matches` da CDN da TMDB em
`posterPath` — conferido, nada relaxado.

### `src/migrations/1790000000000-BackfillWatchedMediaLinks.ts` (novo, NÃO EXECUTADA)

Transcrita literalmente do brief. `up` faz dois `UPDATE ... FROM` para
vincular `watched_movie.idMovieId`/`watched_serie.serieId` a registros já
cadastrados em `movies`/`series` com o mesmo `idTmdb`, cobrindo os registros
órfãos criados pelo `rate` antigo (que nunca vinculava a mídia). `down` é
vazio de propósito — reconciliar um vínculo correto não tem inverso
desejável. Docker parado nesta máquina: a migration não foi rodada nem
verificada contra um banco real. Precisa ser executada em ambiente com
Postgres disponível antes de considerar o backfill concluído.

### `package.json`

`moduleNameMapper` adicionado à config `jest` — ver nota acima. Fora da
lista de arquivos do brief, mas necessário para os testes pedidos
executarem.

## Alterações — frontend (`guys-movies-frontend`)

### `hooks/useWatchedMedia.ts`

`WatchedMediaLabels` perde `ratingBlocked: string`, ganha
`ratingCreated: string`. `setRating` mantém `if (!requireUser()) return;`
como primeira instrução (guarda já existente, não tocada). Remove o bloco
`if (!isWatched) { toast.warn(labels.ratingBlocked); return; }` que vinha
logo em seguida — dar nota deixa de exigir que a mídia já esteja marcada
como assistida. O corpo passa a enviar `[resource.payloadKey]:
buildPayload()` junto de `idTmdb`/`rating` no `POST .../rate`, lê `created`
da resposta e, quando `true`, chama `setIsWatched(true)` e
`toast.success(labels.ratingCreated)`. `isWatched` sai do array de
dependências de `setRating`; `buildPayload` e `resource.payloadKey` entram.
`handleWatchedClick`/`handleWatchedSubmit` (em ambas as páginas) não foram
tocados.

### `pages/movie/[id].tsx`

Label `ratingBlocked` trocada por
`ratingCreated: "Nota salva e filme marcado como assistido!"`.

### `pages/serie/[id].tsx`

Label `ratingBlocked` trocada por
`ratingCreated: "Nota salva e série marcada como assistida!"`.

## Comandos executados

### Backend — teste falhando (antes da implementação)

```
$ npx jest src/movie/watched-movie/watched-movie.service.spec.ts
FAIL src/movie/watched-movie/watched-movie.service.spec.ts
  ● Test suite failed to run
    src/movie/watched-movie/watched-movie.service.spec.ts:57:55
      error TS2554: Expected 3 arguments, but got 4.
    src/movie/watched-movie/watched-movie.service.spec.ts:69:19
      error TS2339: Property 'created' does not exist on type 'string'.
    (idem nas linhas 75, 81, 87)
Test Suites: 1 failed, 1 total
Tests:       0 total

$ npx jest src/serie/watched-serie/watched-serie.service.spec.ts
FAIL src/serie/watched-serie/watched-serie.service.spec.ts
  ● Test suite failed to run
    src/serie/watched-serie/watched-serie.service.spec.ts:57:57
      error TS2554: Expected 3 arguments, but got 4.
    (mesmo padrão da suíte de filme)
Test Suites: 1 failed, 1 total
Tests:       0 total
```

### Backend — teste passando (depois da implementação)

```
$ npm test
PASS src/serie/watched-serie/watched-serie.service.spec.ts
PASS src/movie/watched-movie/watched-movie.service.spec.ts
Test Suites: 2 passed, 2 total
Tests:       6 passed, 6 total

$ npm run build
> nest build
(sem erros)
```

### Backend — lint escopado

```
$ npx prettier --check src/movie/dto/rate-movie.dto.ts src/movie/watched-movie/watched-movie.service.ts src/movie/watched-movie/watched-movie.controller.ts src/movie/watched-movie/watched-movie.service.spec.ts src/serie/dto/rate-serie.dto.ts src/serie/watched-serie/watched-serie.service.ts src/serie/watched-serie/watched-serie.controller.ts src/serie/watched-serie/watched-serie.service.spec.ts src/migrations/1790000000000-BackfillWatchedMediaLinks.ts package.json
All matched files use Prettier code style!
```

(`watched-movie.service.ts` e `package.json` precisaram de `--write` antes
de passar; reexecutados os testes e o build depois, sem regressão.)

### Frontend

```
$ npm run build
✓ Compiled successfully
✓ Generating static pages (3/3)
Route (pages)                              Size     First Load JS
├ ƒ /movie/[id]                            1.96 kB         181 kB
├ ƒ /serie/[id]                            1.94 kB         181 kB

$ npx prettier --check hooks/useWatchedMedia.ts "pages/movie/[id].tsx" "pages/serie/[id].tsx"
All matched files use Prettier code style!
```

## Achados

Achado esperado e aceito, sem correção necessária: frontend modificado sem
teste automatizado; harness de teste de frontend fora do escopo (spec §5).

Achado de infraestrutura corrigido durante a leva (registrado acima, não é
um "aceito sem correção"): `jest` sem `moduleNameMapper` para o padrão
`src/*` usado por `user.entity.ts`, o que impedia qualquer teste que
importasse essa entidade — direta ou transitivamente — de rodar. Corrigido
em `package.json`; sem impacto em runtime (só afeta a resolução de módulos
do `jest`).

Pendência explícita: a migration `BackfillWatchedMediaLinks1790000000000`
está escrita mas não executada — Docker parado nesta máquina. Precisa
rodar `npm run migration:run` (e conferir a contagem de órfãos via `psql`)
assim que houver Postgres disponível.
