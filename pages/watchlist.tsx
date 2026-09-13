import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Header from "../components/_ui/header";
import Footer from "../components/_ui/footer";
import CatalogErrorState from "../components/_ui/catalogErrorState";
import WatchlistGrid from "../components/watchlist/watchlistGrid";
import WatchlistToolbar from "../components/watchlist/watchlistToolbar";
import ShuffleDialog from "../components/watchlist/shuffleDialog";
import { useAuth } from "../hooks/authContext";
import { useWatchlist } from "../hooks/useWatchlist";
import { useWatchlistAvailability } from "../hooks/useWatchlistAvailability";
import {
  availabilityKey,
  AvailabilityStatus,
  resolveProvidersState,
  WatchlistItemType,
  WatchlistProvider,
  WatchlistSort,
  WATCHLIST_SORTS,
} from "../interfaces/watchlist/types";

type AvailabilityNotice = "filterPending" | "filterUnusable" | "partialFailure";

const isAvailabilityPending = (status: AvailabilityStatus) =>
  status === "idle" || status === "loading";

const hasAnyProvider = (providersByKey: Map<string, WatchlistProvider[]>) =>
  Array.from(providersByKey.values()).some((providers) => providers.length > 0);

const canFilterByProvider = (
  status: AvailabilityStatus,
  failed: boolean,
  providersByKey: Map<string, WatchlistProvider[]>,
) => {
  if (status !== "ready") return false;
  return !failed || hasAnyProvider(providersByKey);
};

const resolveAvailabilityNotice = (
  status: AvailabilityStatus,
  failed: boolean,
  isProviderFilterActive: boolean,
  isProviderFilterUsable: boolean,
): AvailabilityNotice | null => {
  if (isProviderFilterActive && !isProviderFilterUsable) {
    return isAvailabilityPending(status) ? "filterPending" : "filterUnusable";
  }
  if (failed) return "partialFailure";
  return null;
};

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

  const providersQuery = String(router.query.providers ?? "");

  const providerIds = useMemo(
    () =>
      providersQuery
        .split(",")
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0),
    [providersQuery],
  );

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

  const isProviderFilterActive = providerIds.length > 0;

  const isProviderFilterUsable = useMemo(
    () =>
      canFilterByProvider(
        availability.status,
        availability.failed,
        availability.providersByKey,
      ),
    [availability.failed, availability.providersByKey, availability.status],
  );

  const isEmptyFromIncompleteAvailability =
    isProviderFilterActive && isProviderFilterUsable && availability.failed;

  const notice = resolveAvailabilityNotice(
    availability.status,
    availability.failed,
    isProviderFilterActive,
    isProviderFilterUsable,
  );

  const visibleItems = useMemo(() => {
    const byType = typeFilter
      ? items.filter((item) => item.type === typeFilter)
      : items;

    const byProvider =
      !isProviderFilterActive || !isProviderFilterUsable
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
    isProviderFilterActive,
    isProviderFilterUsable,
    items,
    providerIds,
    sort,
    typeFilter,
  ]);

  const handleRemove = useCallback(
    async (type: WatchlistItemType, idTmdb: number) => {
      const removed = await removeItem(type, idTmdb);
      if (!removed) {
        toast.error(
          "Não foi possível remover o título da watchlist. Tente de novo.",
        );
      }
    },
    [removeItem],
  );

  const [shuffledKey, setShuffledKey] = useState<string | null>(null);

  const shuffle = useCallback(() => {
    if (visibleItems.length === 0) return;

    const candidates =
      visibleItems.length > 1
        ? visibleItems.filter(
            (item) => availabilityKey(item.type, item.idTmdb) !== shuffledKey,
          )
        : visibleItems;

    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    setShuffledKey(availabilityKey(picked.type, picked.idTmdb));
  }, [shuffledKey, visibleItems]);

  const shuffledItem =
    visibleItems.find(
      (item) => availabilityKey(item.type, item.idTmdb) === shuffledKey,
    ) ?? null;

  useEffect(() => {
    if (shuffledKey && !shuffledItem) setShuffledKey(null);
  }, [shuffledItem, shuffledKey]);

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

      {notice === "filterPending" && (
        <p className="mt-4 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100/90">
          Aplicando o filtro de streaming assim que a disponibilidade terminar
          de carregar.
        </p>
      )}

      {notice === "filterUnusable" && (
        <p className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
          Não foi possível verificar a disponibilidade dos streamings, então o
          filtro de streaming não pôde ser aplicado. Mostrando a watchlist
          completa.
        </p>
      )}

      {notice === "partialFailure" && (
        <p className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
          Não foi possível consultar corretamente a disponibilidade de
          streaming. As informações mostradas podem estar incompletas ou
          ausentes.
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
          isAvailabilityLoading={isAvailabilityPending(availability.status)}
          onClear={() =>
            replaceQuery({ sort: null, type: null, providers: null })
          }
          activeCount={
            (typeFilter ? 1 : 0) +
            (isProviderFilterActive ? 1 : 0) +
            (sort !== "recent" ? 1 : 0)
          }
          onShuffle={shuffle}
          canShuffle={visibleItems.length > 0}
        />
      </div>

      <div className="mt-8">
        {visibleItems.length === 0 ? (
          <p className="mt-10 text-center text-sm text-white/45">
            {isEmptyFromIncompleteAvailability
              ? "Não foi possível verificar a disponibilidade de todos os títulos, então não dá para dizer o que está nos streamings escolhidos. Tente de novo em instantes."
              : "Nenhum título da sua watchlist passa nos filtros escolhidos."}
          </p>
        ) : (
          <WatchlistGrid
            items={visibleItems}
            providersByKey={availability.providersByKey}
            availabilityStatus={availability.status}
            availabilityFailed={availability.failed}
            onRemove={handleRemove}
          />
        )}
      </div>

      <ShuffleDialog
        item={shuffledItem}
        providersState={resolveProvidersState(
          availability.status,
          availability.failed,
          shuffledItem
            ? availability.providersByKey.get(
                availabilityKey(shuffledItem.type, shuffledItem.idTmdb),
              )
            : undefined,
        )}
        onClose={() => setShuffledKey(null)}
        onShuffleAgain={shuffle}
        canShuffleAgain={visibleItems.length > 1}
      />
    </PageShell>
  );
};

export default WatchlistPage;
