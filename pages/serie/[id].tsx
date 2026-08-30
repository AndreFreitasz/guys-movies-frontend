import Head from "next/head";
import { GetServerSideProps, NextPage } from "next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import Footer from "../../components/_ui/footer";
import Header from "../../components/_ui/header";
import LoadingSpinner from "../../components/_ui/loadingSpinner";
import BodyModalForm from "../../components/movie/bodyModalForm";
import Modal from "../../components/_ui/modal";
import { authFetch } from "../../utils/authFetch";
import {
  MediaCastSection,
  MediaDetailLayout,
  MediaExperiencePanel,
  MediaHeroHeader,
  MediaPosterCard,
  MediaProvidersSection,
  MediaQuickDetails,
  MediaSynopsis,
  QuickDetailItem,
} from "../../components/mediaDetails";
import { useAuth } from "../../hooks/authContext";
import { SerieResponse } from "../../interfaces/series/types";
import { setPublicCache } from "../../utils/httpCache";

interface SerieProps {
  serie: SerieResponse;
}

const SeriePage: NextPage<SerieProps> = ({ serie }) => {
  const { user, authLoading } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loading] = useState(false);

  const [rating, setRating] = useState(0);
  const [isWatched, setIsWatched] = useState(false);
  const [watchedLoading, setWatchedLoading] = useState(false);

  const [isWaiting, setIsWaiting] = useState(false);
  const [isWaitingLoading, setIsWaitingLoading] = useState(false);

  const [watchedDate, setWatchedDate] = useState("");

  const showToast = useCallback(
    (type: "success" | "error" | "warn" | "info", message: string) => {
      switch (type) {
        case "success":
          toast.success(message);
          break;
        case "error":
          toast.error(message);
          break;
        case "warn":
          toast.warn(message);
          break;
        case "info":
          toast.info(message);
          break;
        default:
          toast(message);
      }
    },
    [],
  );

  const validateUser = useCallback((): boolean => {
    if (authLoading) return false;
    if (!user) {
      showToast("warn", "Entre em uma conta para fazer atualizações na série");
      return false;
    }
    return true;
  }, [authLoading, showToast, user]);

  const buildSeriePayload = useCallback(
    () => ({
      name: serie.name,
      overview: serie.overview,
      firstAirDate: serie.first_air_date,
      idTmdb: serie.id,
      posterPath: serie.poster_path,
      voteAverage: serie.vote_average,
      numberOfSeasons: serie.number_of_seasons,
    }),
    [
      serie.first_air_date,
      serie.id,
      serie.name,
      serie.number_of_seasons,
      serie.overview,
      serie.poster_path,
      serie.vote_average,
    ],
  );

  const sendWatchedRequest = useCallback(
    async (serieData: unknown) => {
      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_URL_API}/watchedSerie`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(serieData),
          },
        );

        if (!response.ok) throw new Error("Requisição rejeitada");

        return (await response.json()) as { unmarked?: boolean };
      } catch (error) {
        showToast("error", "Erro ao atualizar a série como assistida.");
        return null;
      }
    },
    [showToast],
  );

  const getRating = useCallback(async () => {
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/watchedSerie/getRate?idTmdb=${serie.id}`,
      );
      if (response.ok) {
        const data = await response.json();
        setRating(data.rate ?? 0);
      }
    } catch (error) {
      console.error("Erro ao buscar avaliação da série:", error);
      setRating(0);
    }
  }, [serie.id]);

  const checkIsWaiting = useCallback(async () => {
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/waitingSerie/isWaiting?idTmdb=${serie.id}`,
      );
      if (!response.ok) return;
      const data = await response.json();
      setIsWaiting(Boolean(data.waiting));
    } catch {
      setIsWaiting(false);
    }
  }, [serie.id]);

  const checkIsWatched = useCallback(async () => {
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/watchedSerie/isWatched?idTmdb=${serie.id}`,
      );
      if (!response.ok) return;
      const data = await response.json();
      setIsWatched(Boolean(data.watched));
    } catch {
      setIsWatched(false);
    }
  }, [serie.id]);

  const fetchInitialData = useCallback(async () => {
    if (!validateUser()) return;
    await Promise.all([checkIsWatched(), checkIsWaiting(), getRating()]);
  }, [checkIsWaiting, checkIsWatched, getRating, validateUser]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!authLoading && user) fetchInitialData();
  }, [authLoading, fetchInitialData, user]);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleWatchedClick = useCallback(async () => {
    if (!validateUser()) return;

    if (!isWatched) {
      openModal();
      return;
    }

    setWatchedLoading(true);
    const result = await sendWatchedRequest({
      watchedAt: new Date().toISOString(),
      createSerieDto: buildSeriePayload(),
    });
    setWatchedLoading(false);

    if (result?.unmarked) {
      setIsWatched(false);
      setRating(0);
      showToast("info", "Série removida da lista de assistidos.");
    }
  }, [
    buildSeriePayload,
    isWatched,
    openModal,
    sendWatchedRequest,
    showToast,
    validateUser,
  ]);

  const handleWatchedSubmit = useCallback(async () => {
    if (!validateUser()) return;

    if (!watchedDate) {
      showToast("warn", "Informe a data em que você assistiu.");
      return;
    }

    setWatchedLoading(true);
    setIsModalOpen(false);

    const result = await sendWatchedRequest({
      watchedAt: new Date(watchedDate).toISOString(),
      createSerieDto: buildSeriePayload(),
    });
    setWatchedLoading(false);

    if (result && !result.unmarked) {
      setIsWatched(true);
      showToast("success", "Série marcada como assistida!");
    }
  }, [
    buildSeriePayload,
    sendWatchedRequest,
    showToast,
    validateUser,
    watchedDate,
  ]);

  const handleWaitingClick = useCallback(async () => {
    if (!validateUser()) return;

    setIsWaitingLoading(true);

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/waitingSerie`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ createSerieDto: buildSeriePayload() }),
        },
      );

      if (!response.ok) throw new Error("Requisição rejeitada");

      const data = await response.json();
      setIsWaiting(!data.unmarked);
      showToast(
        data.unmarked ? "info" : "success",
        data.unmarked
          ? "Série removida da watchlist."
          : "Série adicionada à watchlist!",
      );
    } catch (error) {
      showToast("error", "Erro ao atualizar a watchlist.");
    } finally {
      setIsWaitingLoading(false);
    }
  }, [buildSeriePayload, showToast, validateUser]);

  const handleRating = useCallback(
    async (newRating: number) => {
      if (!validateUser()) return;

      if (!isWatched) {
        showToast(
          "warn",
          "Você precisa marcar a série como assistida para avaliá-la.",
        );
        return;
      }

      const previousRating = rating;
      setRating(newRating);

      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_URL_API}/watchedSerie/rate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idTmdb: serie.id, rating: newRating }),
          },
        );

        if (!response.ok) throw new Error("Requisição rejeitada");
      } catch (error) {
        setRating(previousRating);
        showToast("error", "Erro ao enviar a avaliação.");
      }
    },
    [isWatched, rating, serie.id, showToast, validateUser],
  );

  const formattedDate = useMemo(() => {
    if (!serie.first_air_date) {
      return "Data não informada";
    }
    const date = new Date(serie.first_air_date);
    if (Number.isNaN(date.getTime())) {
      return "Data não informada";
    }
    return date.toLocaleDateString("pt-BR");
  }, [serie.first_air_date]);

  const creators = useMemo(() => {
    if (!serie.created_by || serie.created_by.length === 0) {
      return "Não informado";
    }
    return serie.created_by.map((creator) => creator.name).join(" • ");
  }, [serie.created_by]);

  const seasonsLabel = useMemo(() => {
    if (!serie.number_of_seasons) return "Não informado";
    return `${serie.number_of_seasons} ${
      serie.number_of_seasons > 1 ? "temporadas" : "temporada"
    }`;
  }, [serie.number_of_seasons]);

  const genresLabel = useMemo(() => {
    if (!serie.genres?.length) return "Não informado";
    return serie.genres.join(" • ");
  }, [serie.genres]);

  const quickDetails = useMemo<QuickDetailItem[]>(
    () => [
      { label: "Lançamento", value: formattedDate },
      { label: "Criadores", value: creators },
      { label: "Temporadas", value: seasonsLabel },
      { label: "Gêneros", value: genresLabel },
    ],
    [creators, formattedDate, genresLabel, seasonsLabel],
  );

  const castMembers = useMemo(() => serie.cast ?? [], [serie.cast]);

  return (
    <>
      <Head>
        <title>GuysMovie: {serie.name}</title>
      </Head>
      <Header />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <MediaDetailLayout
          backdropUrl={serie.wallpaper_path}
          backdropAlt={serie.name}
          poster={
            <MediaPosterCard
              posterUrl={serie.poster_path}
              title={serie.name}
              onWatchlistToggle={handleWaitingClick}
              isInWatchlist={isWaiting}
              isLoading={isWaitingLoading}
              watchlistLabels={{
                active: "Na watchlist",
                inactive: "Watchlist",
              }}
            />
          }
          header={
            <MediaHeroHeader
              badgeLabel="Série"
              title={serie.name}
              voteAverage={serie.vote_average ?? 0}
            />
          }
          actions={
            <MediaExperiencePanel
              heading="Sua experiência"
              description="Gerencie o que você já assistiu, organize sua watchlist e registre sua avaliação personalizada."
              watchedConfig={{
                isActive: isWatched,
                isLoading: watchedLoading,
                onClick: handleWatchedClick,
                title: "Assistido",
                activeLabel: "Remover do assistido",
                inactiveLabel: "Marcar como assistido",
                icon: "eye",
              }}
              waitingConfig={{
                isActive: isWaiting,
                isLoading: isWaitingLoading,
                onClick: handleWaitingClick,
                title: "Watchlist",
                activeLabel: "Remover da watchlist",
                inactiveLabel: "Adicionar à watchlist",
                icon: "clock",
              }}
              ratingConfig={{
                title: "Avalie esta série",
                description:
                  "Compartilhe sua nota e melhore suas recomendações.",
                value: rating,
                onChange: handleRating,
                isClient,
              }}
            />
          }
          details={
            <MediaQuickDetails title="Detalhes rápidos" items={quickDetails} />
          }
        >
          <MediaSynopsis title="Sinopse" overview={serie.overview ?? ""} />

          <MediaProvidersSection
            title="Onde assistir"
            providers={serie.providers}
          />

          <MediaCastSection title="Elenco principal" cast={castMembers} />
        </MediaDetailLayout>
      )}
      <Footer />
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Quando você assistiu?"
      >
        <BodyModalForm
          watchedDate={watchedDate}
          setWatchedDate={setWatchedDate}
          onSubmit={handleWatchedSubmit}
          loading={watchedLoading}
        />
      </Modal>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL_API}/serie/${id}`,
    );

    if (!response.ok) {
      return { notFound: true };
    }

    const serie = await response.json();

    if (!serie?.id) {
      return { notFound: true };
    }

    setPublicCache(context.res, 3600, 86400);

    return { props: { serie } };
  } catch {
    return { notFound: true };
  }
};

export default SeriePage;
