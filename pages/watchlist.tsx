import React, { useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "../components/_ui/header";
import Footer from "../components/_ui/footer";
import CatalogErrorState from "../components/_ui/catalogErrorState";
import WatchlistGrid from "../components/watchlist/watchlistGrid";
import { useAuth } from "../hooks/authContext";
import { useWatchlist } from "../hooks/useWatchlist";
import { useWatchlistAvailability } from "../hooks/useWatchlistAvailability";
import { WatchlistItemType } from "../interfaces/watchlist/types";

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

      {availability.failed && (
        <p className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
          Não foi possível consultar a disponibilidade de alguns títulos. Os
          streamings mostrados podem estar incompletos.
        </p>
      )}

      <div className="mt-8">
        <WatchlistGrid
          items={items}
          providersByKey={availability.providersByKey}
          isAvailabilityLoading={availability.isLoading}
          onRemove={handleRemove}
        />
      </div>
    </PageShell>
  );
};

export default WatchlistPage;
