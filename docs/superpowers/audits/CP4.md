# CP4 — Editar a data

## Contexto de execução

Step 10 (prova do escopo com duas contas via `curl`) e Step 18 (verificação
no navegador) não foram executados: o Docker Desktop está parado nesta
máquina, sem Postgres e sem API no ar. A propriedade de segurança que o
Step 10 existe para provar está coberta por teste unitário — ver "Risco
principal" abaixo — mas a prova de ponta a ponta contra o banco real
continua pendente.

O `differential-review` foi conduzido sobre o commit `402a79c` do backend e
sobre o diff de frontend deste checkpoint. Cada achado foi verificado
individualmente antes de virar veredito.

## Alterações — backend (`guys-movies-backend`)

### `src/movie/watched-movie/watched-movie.service.spec.ts`

Novo `describe('WatchedMovieService.updateWatchedAt')` com quatro testes,
transcritos do brief. Escritos e rodados **antes** da implementação: falha
com `TS2339: Property 'updateWatchedAt' does not exist on type
'WatchedMovieService'`. Cobrem o `WHERE` escopado pelo usuário, a recusa de
editar registro alheio, `watchedAt: null` como valor de primeira classe e a
rejeição de data futura.

### `src/movie/watched-movie/watched-movie.service.ts`

- `toListItem(watched)` privado, extraído do `.map` inline de
  `listWatchedMovies` — que passa a chamá-lo. Refactor sem mudança de
  comportamento: o objeto montado é campo a campo o mesmo.
- `updateWatchedAt(userId, idTmdb, watchedAt)` novo. **Sem `try/catch`**, de
  propósito: os métodos vizinhos embrulham tudo em
  `INTERNAL_SERVER_ERROR`, o que converteria o 404 e o 400 deste método em
  500. As exceções levantadas aqui já carregam o status certo.
- `isWatchedMovie` passa de `Promise<boolean>` para
  `Promise<{ watched, watchedAt }>`.

### `src/movie/watched-movie/watched-movie.controller.ts`

`@Patch('watchedAt')` com `@HttpCode(HttpStatus.OK)`, recebendo
`@CurrentUser('id') userId` e `@Body() body: UpdateWatchedAtDto`.
`GET isWatched` passa a devolver o objeto do service em vez de reembrulhar
`{ watched }`.

### `src/movie/dto/update-watched-at.dto.ts` (novo)

`idTmdb` com `@IsInt() @Min(1)`; `watchedAt` com `@IsOptional()
@IsDateString()`. Nenhum campo de usuário — nem declarado, nem aceito.

### `src/serie/*`

Espelho literal: `watched-serie-list.dto.ts` e
`update-watched-at-serie.dto.ts` novos, `toListItem`/`updateWatchedAt`/
`isWatchedSerie` no service (usando as relações reais `user`/`serie`),
`@Patch('watchedAt')` no controller e o mesmo `describe` de quatro testes
no spec, com `idTmdb: 70523`.

Removido também um comentário `Garante que a série está cadastrada na base`
em `markAsWatched`, resquício pré-existente que viola a regra de "sem
comentários" do projeto. Fora da lista de arquivos do brief, mas no arquivo
já sendo editado.

## Alterações — frontend (`guys-movies-frontend`)

### `components/watched/watchedDateForm.tsx` (novo)

Substitui `BodyModalForm`. Três modos: criar, editar e limpar (botão
"Limpar data", só em `mode="edit"`). Guarda a data no próprio estado, com
`max` do input travado em hoje. Submit desabilitado com data vazia — é o
que substitui o antigo label `missingDate`.

### `components/movie/bodyModalForm/` (removido)

`grep -rn "bodyModalForm|BodyModalForm"` sem resultado após a remoção.

### `hooks/useWatchedMedia.ts`

Estado `watchedAt`, alimentado por `loadState` (do novo campo de
`isWatched`), por `toggleWatched` (nos dois ramos) e por
`updateWatchedDate`. O novo `updateWatchedDate` faz `PATCH .../watchedAt`
com atualização otimista e rollback para o valor anterior em caso de falha.
`WatchedMediaLabels` perde `missingDate` e ganha `dateUpdated`/`dateError`.

### `components/mediaDetails/experiencePanel.tsx`

`watchedDateConfig?: { watchedAt, onEdit }` opcional. Renderiza a linha
"Você assistiu em" com botão "Editar" apenas quando
`watchedConfig.isActive && watchedDateConfig`.

### `pages/movie/[id].tsx` e `pages/serie/[id].tsx`

Estado `dateMode`, `openDateEditor`, e o `Modal` passa a hospedar o
`WatchedDateForm` nos dois modos. `handleWatchedSubmit` sai — o formulário
guarda a própria data. A guarda `if (!requireUser()) return;` segue como
**primeira** instrução de `handleWatchedClick` (não tocada).

### `components/watched/watchedDetailSheet.tsx`

Prop `onWatchedAtChange` obrigatória. A linha "Você assistiu em" ganha
"Editar", que troca a linha pelo `WatchedDateForm` inline. `isEditingDate`
zera sempre que o sheet troca de filme; a `key={movie.watchedAt ?? "empty"}`
garante que reabrir a edição depois de salvar traga o valor novo.

### `pages/assistidos.tsx`

`updateWatchedAt` com atualização otimista em `data` e `selected`, troca
pelo item real da resposta, e rollback dos dois em caso de falha, seguido
de `fetchWatched()`.

## Risco principal — IDOR nos dois `PATCH`

**Veredito: ausente.** Cadeia verificada elo a elo:

1. `@UseGuards(JwtAuthGuard)` no nível da classe, nos dois controllers.
2. `JwtAuthGuard` (`src/auth/jwt-auth.guard.ts:44`) faz `jwtService.verify`
   e só então escreve `request.user = { id: payload.sub, email }`. Assinatura
   inválida ou token expirado → `UnauthorizedException`, sem chegar ao
   handler.
3. `@CurrentUser('id')` (`src/auth/current-user.decorator.ts:7`) lê
   `request.user.id` — derivado do JWT verificado, nunca do corpo.
4. `UpdateWatchedAtDto` / `UpdateWatchedAtSerieDto` declaram só `idTmdb` e
   `watchedAt`. Com `whitelist: true` **e** `forbidNonWhitelisted: true` no
   `ValidationPipe` global (`src/main.ts:34`), um body com `idUser`,
   `userId` ou similar é rejeitado com `400`, não silenciosamente ignorado.
5. `findOne({ where: { idUser: { id: userId }, idTmdb } })` — o registro só
   é encontrado se pertencer ao usuário autenticado. Não encontrado → `404`,
   antes de qualquer `save`.
6. `save(watchedMovie)` atualiza pela PK da entidade já carregada com o
   escopo acima. Nenhum caminho escreve numa linha não verificada.

Coberto por teste automatizado: o caso "busca sempre pelo usuario
autenticado, nunca so pelo idTmdb" afirma o objeto de `findOne` inteiro, e
"nao edita o registro de outro usuario" afirma que `save` não é chamado. Um
refactor que tire o `idUser` do `WHERE` quebra a suíte.

**Ainda pendente:** o Step 10 (duas contas reais contra o Postgres). Os
testes provam a construção do `WHERE`, não o comportamento do driver.

## Achados

### 1. Sheet exibia data não persistida após falha do `PATCH` — TRUE POSITIVE, corrigido

`pages/assistidos.tsx`. O `catch` restaurava `data` mas não `selected`, e
`fetchWatched()` só escreve em `data`. Com o sheet aberto, uma falha de rede
deixava a linha "Você assistiu em" exibindo indefinidamente a data otimista
que nunca chegou ao banco — contradita apenas por um toast que some. O
usuário fecharia o sheet convencido de ter salvo.

Corrigido: o `catch` reverte também `selected`, para o `watchedAt` lido da
lista antes da atualização otimista, e só quando o item selecionado é o que
falhou — assim um sheet já fechado não é ressuscitado.

### 2. Rollback da lista sobrescreve edições concorrentes — FALSE POSITIVE

O `previous = data` é uma fotografia do início da chamada. Duas edições em
voo, com a primeira falhando, fariam o rollback descartar a segunda. Mas o
`catch` chama `fetchWatched()` logo em seguida, que ressincroniza a lista
inteira do servidor. A janela é de um ciclo de request e se autocorrige.
Dispensado.

### 3. Duplo submit no formulário de data — FALSE POSITIVE

No sheet, `onSubmit` faz `setIsEditingDate(false)` antes de disparar a
requisição: o formulário desmonta no render seguinte. No modal das páginas
de detalhe o formulário fica visível durante os 450ms da animação de saída,
mas em `mode="create"` o `loading={watchedLoading}` desabilita o botão —
`toggleWatched` liga a flag de forma síncrona — e em `mode="edit"` o `PATCH`
é idempotente com o mesmo valor. Dispensado.

### 4. `new Date(watchedAt)` inválido chegando ao banco — FALSE POSITIVE

`updateWatchedAt` não valida o formato por conta própria. Só é alcançável
pelo controller, atrás do `@IsDateString()` do DTO e do `ValidationPipe`
global. Sem caminho de chamada que contorne a validação. Dispensado.

### 5. Frontend modificado sem teste — aceito conscientemente

Já registrado na spec §5: não existe harness de teste no frontend e criá-lo
seria uma tarefa 8. Verificação por navegador, quando houver stack no ar.

## Blast radius

`isWatchedMovie` e `isWatchedSerie` mudaram de tipo de retorno. Um chamador
cada, ambos o próprio controller, ambos atualizados. No frontend, um único
consumidor (`hooks/useWatchedMedia.ts:79`), atualizado. A mudança é aditiva
para quem só lia `watched`. Contida.

`toListItem` é chamado por `listWatchedMovies` e por `updateWatchedAt`; o
corpo é o mesmo `.map` de antes, campo a campo.

## Comandos executados

### Backend — teste falhando (antes da implementação)

```
$ npx jest src/movie/watched-movie/watched-movie.service.spec.ts
FAIL src/movie/watched-movie/watched-movie.service.spec.ts
  ● Test suite failed to run
    src/movie/watched-movie/watched-movie.service.spec.ts:123:15
      error TS2339: Property 'updateWatchedAt' does not exist on type 'WatchedMovieService'.
    (idem nas linhas 136, 159, 177)
Test Suites: 1 failed, 1 total
Tests:       0 total

$ npx jest src/serie/watched-serie/watched-serie.service.spec.ts
FAIL src/serie/watched-serie/watched-serie.service.spec.ts
    error TS2339: Property 'updateWatchedAt' does not exist on type 'WatchedSerieService'.
Test Suites: 1 failed, 1 total
Tests:       0 total
```

### Backend — teste passando (depois da implementação)

```
$ npm test
PASS src/movie/watched-movie/watched-movie.service.spec.ts
PASS src/serie/watched-serie/watched-serie.service.spec.ts
Test Suites: 2 passed, 2 total
Tests:       14 passed, 14 total

$ npm run build
> nest build
(sem erros)
```

### Backend — lint escopado

```
$ npx prettier --write src/movie/... src/serie/...
(5 arquivos reformatados; 4 já em conformidade)
$ npm test && npm run build
14 passed / build sem erros
```

### Frontend

```
$ npm run build
✓ Compiled successfully
✓ Generating static pages (3/3)
├ ○ /assistidos                            9.67 kB         181 kB
├ ƒ /movie/[id]                            2 kB            183 kB
├ ƒ /serie/[id]                            1.99 kB         183 kB

$ npx prettier --write components/... hooks/... pages/...
(6 arquivos reformatados; 1 já em conformidade)

$ npm run build   # depois da correção do achado 1
✓ Compiled successfully
```

## Pendências deste checkpoint

- **Step 10** — prova do escopo com duas contas reais (`curl` com o token de
  B contra o registro de A esperando `404`; token de A esperando `200`).
  Bloqueado por Docker parado.
- **Step 18** — roteiro de verificação no navegador, seis cenários.
  Bloqueado pelo mesmo motivo.
- Herdada do CP3: a migration `BackfillWatchedMediaLinks1790000000000`
  continua escrita e não executada.
