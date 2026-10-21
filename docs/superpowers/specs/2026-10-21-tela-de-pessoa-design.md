# Tela de pessoa: ator, diretor e equipe

Data: 2026-10-21
Escopo: `guys-movies-frontend` e `guys-movies-backend`

Tela nova em `/pessoa/[id]` com filmografia, estatísticas de carreira e
cruzamento com a biblioteca do usuário. Dois pontos de entrada: a aba nova
"Artistas" na busca e os nomes de elenco e direção na página de um título.

## Decisões já fechadas

| Item | Decisão | Validado |
|---|---|---|
| Colisão de nomenclatura | Aba atual vira "Usuários"; entra "Artistas" | usuário |
| Curiosidades | Stats derivadas + bio do TMDB + cruzamento com a biblioteca | usuário |
| Links externos (IMDb, Instagram) | Fora de escopo | usuário |
| Organização da filmografia | Abas por departamento real, com paginação server-side | usuário |
| Papel na obra | Explícito por item: personagem quando atua, `job` quando é equipe | usuário |
| Contagem de gêneros | Interativa: clicar filtra a filmografia | usuário |
| Onde agrega | Backend, uma chamada TMDB cacheada | terminal |
| Renderização | ISR, igual a `/movie/[id]` e `/serie/[id]` | terminal |

---

## Fatos apurados no TMDB

Medidos contra a API real com a chave do projeto, em `/person/31` (Tom Hanks):

- `combined_credits` traz **284 `cast` + 88 `crew` = 372 créditos**, e o payload
  completo pesa **247KB**. Mandar isso ao cliente está fora de questão — é o que
  obriga a paginação server-side.
- O TMDB **não pagina** `combined_credits`: ou se busca tudo, ou nada. A paginação
  é responsabilidade nossa, sobre o agregado em cache.
- Cada crédito já carrega `genre_ids`, `media_type`, `popularity`, `vote_average`
  e a data. A contagem de gêneros não custa chamada extra, só o mapa de nomes.
- Departamentos reais encontrados no `crew`: `Production`, `Writing`, `Directing`,
  `Crew`, `Creator`. São eles que viram abas.
- `biography` em pt-BR veio preenchida (500 caracteres), mas não há garantia para
  gente menos conhecida — exige fallback.

## 1. Backend: módulo `src/person`

Uma chamada por pessoa, com tudo que a tela precisa:

```
GET /person/{id}?language=pt-BR&append_to_response=combined_credits,external_ids
```

O resultado **agregado** (não o payload cru) vai para um `TtlCache` de 6h,
seguindo o padrão já usado em `MoviesService`. Chaves separadas para o agregado
e para o mapa de gêneros.

### Mapa de gêneros

`/genre/movie/list` e `/genre/tv/list` em pt-BR, fundidos num `Map<number, string>`
e cacheados por 24h. Carregado sob demanda na primeira pessoa consultada.

Os dois conjuntos de IDs do TMDB se sobrepõem parcialmente (ex.: 18 é Drama nos
dois; 10759 só existe em TV). A fusão resolve por `media_type` do crédito: um
crédito `movie` consulta o mapa de filmes, um `tv` o de séries. Fundir num mapa
único sem essa distinção renomearia gêneros errados.

### Normalização dos créditos

Cada entrada de `cast` e `crew` vira:

```ts
interface PersonCredit {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  posterUrl: string | null;
  year: number | null;
  voteAverage: number | null;
  popularity: number;
  genreIds: number[];
  role: string;          // personagem (cast) ou job (crew)
  department: string;    // "acting" | "directing" | "writing" | ...
}
```

Um mesmo título pode aparecer em mais de um departamento (dirigiu e atuou) — é
intencional e aparece em ambas as abas. Dentro de **um mesmo** departamento,
créditos duplicados do TMDB (mesmo `id` e mesmo `job`) são deduplicados.

### Derivações

- **`departments`** — `acting` a partir do `cast`, mais um por `department` do
  `crew`, cada um com rótulo em pt-BR e contagem. Só entram os não vazios,
  ordenados por contagem decrescente.
- **`genres`** — `[{ id, name, count }]` sobre todos os créditos, ordenado por
  contagem. Alimenta o gráfico interativo.
- **`stats`** — total de títulos, intervalo de décadas ativas, gênero predominante,
  título melhor avaliado, primeiro e último ano em atividade.

**Colaborador mais frequente foi cortado.** Ele estava no design aprovado, mas a
apuração mostrou que não sai do payload de `/person`: exigiria buscar o elenco de
cada título da pessoa, 372 chamadas extras ao TMDB no caso do Tom Hanks. Entra
"primeiro e último ano em atividade" no lugar, que sai de graça do agregado.

### Endpoints

| Método | Rota | Devolve |
|---|---|---|
| `GET` | `/person/:id` | Cabeçalho, bio, stats, gêneros, abas e a **primeira página** de créditos do departamento padrão |
| `GET` | `/person/:id/credits` | Uma página de créditos |
| `GET` | `/search/person?q=` | Artistas para a aba nova da busca |

Query de `/person/:id/credits`: `department`, `media` (`all`/`movie`/`tv`),
`genre` (id), `sort` (`popularity`/`year`/`rating`), `page`. Página de 20.
Filtro e ordenação rodam sobre o agregado em cache, sem nova ida ao TMDB.

O departamento padrão é o `known_for_department` da pessoa quando ele existe entre
as abas derivadas; senão, o de maior contagem.

### Fallback de biografia

Se `biography` vier vazia em pt-BR, uma segunda chamada busca apenas a bio em
en-US e a resposta marca `biographyLanguage: "en"`, para a interface poder sinalizar.

## 2. Frontend: `/pessoa/[id]`

`getStaticProps` com `revalidate: 86400` e `getStaticPaths` com `paths: []` e
`fallback: "blocking"` — o mesmo regime adotado em `/movie/[id]` no commit
`2bff89f`.

**Consequência que dita a arquitetura da tela:** a página é estática e
compartilhada entre todos os visitantes. Nada específico do usuário pode sair do
`getStaticProps`, ou o HTML de um usuário vazaria para outro. O cruzamento com a
biblioteca carrega **no cliente**, após a autenticação resolver.

A rota usa `/pessoa/` e não `/perfil/`, que já pertence aos usuários do app.

### Componentes (`components/person/`)

| Arquivo | Responsabilidade |
|---|---|
| `personHero.tsx` | Foto, nome, departamento principal, nascimento/idade, bio com "ler mais" |
| `careerStats.tsx` | Tiles de números da carreira |
| `genreBreakdown.tsx` | Distribuição de gêneros, clicável, controla o filtro |
| `departmentTabs.tsx` | Abas derivadas dos departamentos |
| `creditList.tsx` | Lista paginada, com o papel explícito em cada item |
| `libraryCrossover.tsx` | "Você viu 7 de 42", pendentes e sua nota média |

Hook `hooks/usePersonCredits.ts` concentra paginação e os filtros (departamento,
mídia, gênero, ordenação), espelhando o padrão de `useWatchedFilters`.

O estado dos filtros vive na URL (query string) para que voltar pelo histórico
devolva a mesma vista. O `_app` já descarta a query ao compor `routeKey`, então
mudar filtro não remonta a página.

### Design

Moderno e minimalista, seguindo o sistema visual existente: superfícies
`rounded-3xl border border-white/10 bg-white/5`, tipografia Figtree, acentos em
índigo. O gráfico de gêneros segue a skill `dataviz`; o conjunto da tela passa
pela skill `frontend-design` antes de fechar.

## 3. Pontos de entrada

### Busca

`SearchTypeFilterValue` ganha `artists`. O rótulo de `people` passa de "Pessoas"
para "Usuários" — o valor interno segue `people` para não mexer no que já funciona.
A aba nova consome `/search/person`.

### Página de filme e série

Hoje `CastDto` e `director` expõem só nome e foto. Ambos passam a expor o `id`
do TMDB, em `movie.service.ts` e no equivalente de série, e as interfaces
`CastMember` e `Director` acompanham.

`castSection.tsx` e a linha de diretor em "Detalhes rápidos" passam a renderizar
um `Link` para `/pessoa/{id}`. Quando o `id` não vier, o nome continua como texto
— sem link quebrado.

## 4. Erros e bordas

| Caso | Comportamento |
|---|---|
| Id inexistente | `notFound` com `revalidate` curto, como nos detalhes |
| TMDB fora do ar | `notFound` com `revalidate` curto; recupera sozinho |
| Pessoa sem créditos | Tela renderiza com hero e bio; filmografia mostra estado vazio |
| Sem foto | Iniciais, como `castSection.tsx` já faz |
| Sem data de nascimento | Campo some, não mostra "Não informado" |
| Bio vazia nos dois idiomas | Seção de bio não é renderizada |
| Usuário deslogado | Seção de biblioteca convida a entrar, sem bloquear o resto |

## 5. Verificação

**Backend (Jest, já configurado).** A agregação é função pura e vai por TDD:
contagem de gêneros respeitando `media_type`, derivação e ordenação de
departamentos, deduplicação dentro do departamento, stats, e paginação com
filtros combinados. Mais um teste de contrato por endpoint.

**Frontend (sem runner).** Build e typecheck limpos; a bancada CDP usada nos
commits `2bff89f` e `16beb1a` para confirmar que a tela nova não regride a
navegação; conferência visual por screenshot; e verificação explícita de que o
payload de `/person/:id` fica na ordem de dezenas de KB, não dos 247KB do TMDB.

## 6. Ordem de construção

1. Módulo `person` no backend, a tela e o link a partir da página de título
2. Aba "Artistas" na busca
3. Cruzamento com a biblioteca

Cada etapa entrega valor sozinha e pode ser revisada em separado.

## Fora de escopo

- Links externos (IMDb, Instagram, redes sociais)
- Colaborador mais frequente, pelo custo apurado acima
- Seguir um artista ou receber notificação sobre ele
- Página de pessoa para usuários do app — `/perfil/[username]` já cobre
- Tradução da bio quando o TMDB só tem em inglês
