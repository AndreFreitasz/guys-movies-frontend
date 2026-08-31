# CP4 — Editar a data

## Contexto de execução

Step 10 (prova do escopo com duas contas via `curl`) foi **executado contra
o stack real** depois que o Docker subiu — ver "Step 10 — execução contra o
stack real" abaixo. Step 18 (verificação no navegador) também foi
**executado**, com os seis cenários rodados no Chrome — ver "Step 18 —
verificação no navegador".

A migration de backfill herdada do CP3 também foi conferida e está aplicada.

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

**Confirmado contra o stack real** — ver a seção seguinte.

## Step 10 — execução contra o stack real

Duas contas criadas via `POST /users`: `idortest_a` (id 5) e `idortest_b`
(id 6). A marcou o filme 550 e a série 70523 como assistidos. Oito casos,
todos com o resultado esperado:

| # | Caso | Esperado | Obtido |
|---|---|---|---|
| 1 | B faz `PATCH` no registro de A | `404` | `404 "Filme assistido não encontrado"` |
| 2 | Registro de A depois da tentativa de B | intacto | `{"watched":true,"watchedAt":"2024-05-01T00:00:00.000Z"}` |
| 3 | A edita o próprio registro | `200` + item | `200`, `watchedAt` `2023-03-15`, item completo |
| 4 | `watchedAt: null` | limpa a data, mantém assistido | `{"watched":true,"watchedAt":null}` |
| 5 | Data futura (`2030-01-01`) | `400` | `400 "A data de assistido não pode estar no futuro"` |
| 6 | Body com `idUser`/`userId` | `400` | `400 ["property idUser should not exist","property userId should not exist"]` |
| 7 | Sem token | `401` | `401` |
| 8 | `watchedAt: "nao-e-data"` | `400` | `400 ["watchedAt must be a valid ISO 8601 date string"]` |

O caso 6 é a prova prática do `forbidNonWhitelisted`: a tentativa de
injetar o usuário pelo corpo não é ignorada em silêncio, é rejeitada.

Conferência no banco depois da bateria — só a linha de `idortest_a` mudou,
e `idortest_b` não tem nenhuma linha em `watched_movie`:

```
 id | idUserId | idTmdb  | watchedAt  |   username
 10 |        1 | 1195506 | 2026-08-19 | qabot
 ...
 20 |        3 |  969681 | 2026-08-20 | andrefreitas
 21 |        5 |     550 |            | idortest_a
(10 rows)
```

Série, mesmos casos: B → `404`; A → `200` com o `WatchedSerieListItemDto`
completo; `null` → `200` e `{"watched":true,"watchedAt":null}`; futuro →
`400`.

**Veredito final do risco principal: IDOR ausente**, provado por leitura de
código, por teste unitário e por requisição real contra o Postgres.

## Step 18 — verificação no navegador

Rodado no Chrome contra o stack local, logado como `idortest_a`. Os seis
cenários do brief:

**1. Painel com data e edição em `/movie/550`.** O painel exibe "VOCÊ
ASSISTIU EM / Data não registrada" com botão "Editar" — e só quando o filme
está marcado como assistido. "Editar" abre o modal com título "Editar a
data", o texto do modo de edição, o campo vazio (a data estava `null`),
"Salvar momento" desabilitado e "Limpar data" presente. Salvando
`10/06/2023`: modal fecha, o painel passa a "10 de jun. de 2023" na hora e
sai o toast "Data atualizada!". Reabrindo, o campo vem preenchido com
`10/06/2023` — o `initialDate` reflete o valor novo.

**2. Limpar data.** "Limpar data" devolve "Data não registrada" e o filme
continua assistido ("Remover do assistido"), com toast de confirmação.

**3. Data futura.** Lido do DOM: `input.max === "2026-08-31"`, igual a hoje.
O seletor nativo não deixa escolher além disso. Com o campo vazio,
`button.disabled === true`.

**4. `/serie/70523`.** Painel idêntico. Salvando `22/03/2024`: atualiza para
"22 de mar. de 2024" com toast, série segue assistida.

**5. `/assistidos` — sheet e rollback.** Caminho feliz: o card abre o sheet,
"Editar" troca a linha pelo formulário inline sem fechar o sheet, e salvar
`05/01/2025` atualiza o sheet **e** o card da lista atrás, sem recarregar a
página.

Caminho de falha, que é o achado 1 desta auditoria: com
`docker stop guys-movies-backend` e o sheet aberto, editar para `19/07/2022`
e salvar produz o toast vermelho "Erro ao atualizar a data." e o sheet
**volta a exibir "05 de jan. de 2025"** — o valor persistido. Antes da
correção ele continuaria mostrando `19/07/2022`, uma data que nunca chegou
ao banco. Confirmado no Postgres depois de religar a API:
`550 | 2025-01-05`.

**6. Filme criado por nota.** Em `/movie/27205` (A Origem), não assistido, o
painel não mostra linha de data alguma. Clicar na 4ª estrela dispara o
caminho do CP3: toast "Nota salva e filme marcado como assistido!", o botão
vira "Remover do assistido" e a linha "Você assistiu em / Data não
registrada" aparece. Em `/assistidos`, o registro criado por nota vem
completo — pôster, sinopse, direção, nota TMDB — provando o vínculo
`idMovie` do CP3. Datar pelo sheet com `14/02/2026` funciona normalmente.

Estado final no banco, coerente com tudo que a tela mostrou:

```
 idTmdb |     title     | rating | watchedAt  | vinculado
    550 | Clube da Luta |        | 2025-01-05 | t
  27205 | A Origem      |      4 | 2026-02-14 | t

 idTmdb | watchedAt      (watched_serie)
  70523 | 2024-03-22
```

Nenhum desvio de fuso nas datas de assistido: o que foi digitado é o que
aparece e o que persiste.

### Achado colateral, fora do escopo do CP4

As três páginas de detalhe visitadas quebram a hidratação com
`Text content did not match`:

| Página | Servidor | Cliente |
|---|---|---|
| `/movie/550` | `15/10/1999` | `14/10/1999` |
| `/serie/70523` | `01/12/2017` | `30/11/2017` |
| `/movie/27205` | `15/07/2010` | `14/07/2010` |

A origem é o `formattedDate` das duas páginas —
`new Date(release_date).toLocaleDateString("pt-BR")` — renderizado em UTC no
container e em UTC-3 no navegador. O React descarta o HTML do servidor e
re-renderiza a árvore inteira no cliente, o que na prática anula o SSR
dessas rotas e deixa uma janela em que cliques não têm handler (o primeiro
clique em "Editar" foi engolido por isso durante esta verificação).

Não é regressão do CP4: o `formattedDate` está na lista de "permanece em
cada página" da spec §3.1 e não foi tocado em nenhum commit desta leva.
Registrado aqui por ter sido descoberto durante o Step 18. Correção natural
seria formatar a data com fuso fixo (`timeZone: "UTC"`) em vez do fuso
ambiente.

## Backfill do CP3 — conferido

```
$ docker exec guys-movies-db psql -U postgres -d postgres -c "SELECT name FROM migrations ORDER BY id;"
 InitialSchema1787542371825
 BackfillWatchedMediaLinks1790000000000

$ ... COUNT(*) FROM watched_movie WHERE "idMovieId" IS NULL  -> 0
$ ... COUNT(*) FROM watched_serie WHERE "serieId"   IS NULL  -> 0
$ ... totais: watched_movie 9, watched_serie 0, movies 9, series 0
```

A migration foi aplicada no boot do container e os 9 registros de
`watched_movie` estão todos vinculados. Pendência do CP3 fechada.

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

Nenhuma. Todos os 20 steps do brief foram executados: Step 10 contra o
Postgres real, Step 18 no Chrome, e o backfill herdado do CP3 conferido.

Fica registrado, **fora do escopo desta leva**, o mismatch de fuso na
hidratação das páginas de detalhe (seção "Achado colateral" acima) e o aviso
`A title element received an array with more than 1 element as children`,
vindo de `<title>GuysMovie: {movie.title}</title>`
(`pages/movie/[id].tsx:147` e `pages/serie/[id].tsx:156`) — linhas não
tocadas pelo CP4.

Dados de teste mantidos no banco por decisão do autor: usuários
`idortest_a` (id 5) e `idortest_b` (id 6), com os registros listados acima.
