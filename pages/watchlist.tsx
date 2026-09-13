import React, { useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "../components/_ui/header";
import Footer from "../components/_ui/footer";
import CatalogErrorState from "../components/_ui/catalogErrorState";
import WatchlistGrid from "../components/watchlist/watchlistGrid";
import WatchlistToolbar from "../components/watchlist/watchlistToolbar";
import { useAuth } from "../hooks/authContext";
import { useWatchlist } from "../hooks/useWatchlist";
import { useWatchlistAvailability } from "../hooks/useWatchlistAvailability";
import {
  availabilityKey,
  WatchlistItemType,
  WatchlistSort,
  WATCHLIST_SORTS,
} from "../interfaces/watchlist/types";

const PageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Head>
      <title>GuysMovies - Watchlist</title>
    </Head>
    <Header />
    <main className="relative mx-auto w-full max-w-[1600px] px-4 pb-16 pt-8 sm:px-6 lg:px-10 xl:px-14">
      {children}
    </main>
    <Footer />
  </>
);

const WatchlistPage = () => {
  const { user, authLoading } = useAuth();
  const { items, stats, isLoading, hasError, reload, removeItem } =
    useWatchlist();
  const availability = useWatchlistAvailability(items.length > 0);
  const router = useRouter();

  const sort: WatchlistSort = WATCHLIST_SORTS.some(
    (option) => option.value === router.query.sort,
  )
    ? (router.query.sort as WatchlistSort)
    : "recent";

  const typeFilter: WatchlistItemType | null =
    router.query.type === "movie" || router.query.type === "serie"
      ? router.query.type
      : null;

  const providerIds = String(router.query.providers ?? "")
    .split(",")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  const replaceQuery = useCallback(
    (patch: Record<string, string | null>) => {
      const query = { ...router.query };

      Object.entries(patch).forEach(([key, value]) => {
        if (value === null) delete query[key];
        else query[key] = value;
      });

      router.replace({ query }, undefined, { shallow: true, scroll: false });
    },
    [router],
  );

  const isProviderFilterUnusable =
    providerIds.length > 0 &&
    availability.providersByKey.size === 0 &&
    (availability.isLoading || availability.failed);

  const visibleItems = useMemo(() => {
    const byType = typeFilter
      ? items.filter((item) => item.type === typeFilter)
      : items;

    const byProvider =
      providerIds.length === 0 || isProviderFilterUnusable
        ? byType
        : byType.filter((item) => {
            const providers =
              availability.providersByKey.get(
                availabilityKey(item.type, item.idTmdb),
              ) ?? [];
            return providers.some((provider) =>
              providerIds.includes(provider.id),
            );
          });

    const sorted = [...byProvider];

    if (sort === "recent") {
      sorted.sort((first, second) =>
        second.addedAt.localeCompare(first.addedAt),
      );
    } else if (sort === "oldest") {
      sorted.sort((first, second) =>
        first.addedAt.localeCompare(second.addedAt),
      );
    } else if (sort === "rating") {
      sorted.sort(
        (first, second) => (second.voteAverage ?? 0) - (first.voteAverage ?? 0),
      );
    } else {
      sorted.sort((first, second) =>
        first.title.localeCompare(second.title, "pt-BR"),
      );
    }

    return sorted;
  }, [
    availability.providersByKey,
    isProviderFilterUnusable,
    items,
    providerIds,
    sort,
    typeFilter,
  ]);

  const handleRemove = useCallback(
    (type: WatchlistItemType, idTmdb: number) => {
      removeItem(type, idTmdb);
    },
    [removeItem],
  );

  if (authLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-indigo-400" />
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-16 max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-xl"
        >
          <h1 className="text-2xl font-bold text-white">Sua watchlist</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Entre na sua conta para ver tudo o que você guardou para assistir
            depois, e onde cada título está disponível agora.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex rounded-2xl bg-white px-6 py-3 text-sm font-bold tracking-tight text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90"
          >
            Voltar para o início
          </Link>
        </motion.div>
      </PageShell>
    );
  }

  if (hasError) {
    return (
      <PageShell>
        <CatalogErrorState
          title="Não foi possível carregar sua watchlist"
          message="A conexão com o servidor falhou. Tente de novo em instantes."
          onRetry={reload}
        />
      </PageShell>
    );
  }

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-indigo-400" />
        </div>
      </PageShell>
    );
  }

  if (items.length === 0) {
    return (
      <PageShell>
        <div className="mx-auto mt-16 max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-xl">
          <h1 className="text-2xl font-bold text-white">
            Sua watchlist está vazia
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Guarde filmes e séries para assistir depois e eles aparecem aqui,
            com os streamings onde estão disponíveis.
          </p>
          <Link
            href="/busca"
            className="mt-7 inline-flex rounded-2xl bg-white px-6 py-3 text-sm font-bold tracking-tight text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90"
          >
            Buscar algo para ver
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <h1 className="text-3xl font-black tracking-tight text-white">
        Watchlist
      </h1>
      <p className="mt-1 text-sm text-white/45">
        {stats.total}{" "}
        {stats.total === 1 ? "título esperando" : "títulos esperando"}
      </p>

      {availability.failed && availability.providersByKey.size > 0 && (
        <p className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
          Não foi possível consultar a disponibilidade de alguns títulos. Os
          streamings mostrados podem estar incompletos.
        </p>
      )}

      {isProviderFilterUnusable && availability.isLoading && (
        <p className="mt-4 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100/90">
          Aplicando o filtro de streaming assim que a disponibilidade terminar
          de carregar.
        </p>
      )}

      {isProviderFilterUnusable && !availability.isLoading && (
        <p className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
          Não foi possível verificar a disponibilidade dos streamings, então o
          filtro de streaming não pôde ser aplicado. Mostrando a watchlist
          completa.
        </p>
      )}

      <div className="mt-6">
        <WatchlistToolbar
          stats={stats}
          sort={sort}
          onSortChange={(value) =>
            replaceQuery({ sort: value === "recent" ? null : value })
          }
          typeFilter={typeFilter}
          onTypeChange={(value) => replaceQuery({ type: value })}
          providerIds={providerIds}
          onProvidersChange={(ids) =>
            replaceQuery({ providers: ids.length ? ids.join(",") : null })
          }
          isAvailabilityLoading={availability.isLoading}
          onClear={() =>
            replaceQuery({ sort: null, type: null, providers: null })
          }
          activeCount={
            (typeFilter ? 1 : 0) +
            (providerIds.length ? 1 : 0) +
            (sort !== "recent" ? 1 : 0)
          }
        />
      </div>

      <div className="mt-8">
        {visibleItems.length === 0 ? (
          <p className="mt-10 text-center text-sm text-white/45">
            Nenhum título da sua watchlist passa nos filtros escolhidos.
          </p>
        ) : (
          <WatchlistGrid
            items={visibleItems}
            providersByKey={availability.providersByKey}
            isAvailabilityLoading={availability.isLoading}
            onRemove={handleRemove}
          />
        )}
      </div>
    </PageShell>
  );
};

export default WatchlistPage;
