import Head from "next/head";
import { GetServerSideProps, NextPage } from "next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import Footer from "../../components/_ui/footer";
import Header from "../../components/_ui/header";
import LoadingSpinner from "../../components/_ui/loadingSpinner";
import BodyModalForm from "../../components/movie/bodyModalForm";
import Modal from "../../components/_ui/modal";
import {
  MediaCastSection,
  MediaDetailLayout,
  MediaExperiencePanel,
  MediaHeroHeader,
  MediaPosterCard,
  MediaProvidersSection,
  MediaQuickDetails,
  QuickDetailItem,
} from "../../components/mediaDetails";
import { useAuth } from "../../hooks/authContext";
import { SerieResponse } from "../../interfaces/series/types";

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
    (serieData: any) => {
      try {
        return fetch(`${process.env.NEXT_PUBLIC_URL_API}/watchedSerie`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(serieData),
        });
      } catch (error) {
        console.error(`Erro ao fazer requisição: ${error}`);
        showToast("error", "Erro ao marcar a série como assistida.");
        return null;
      }
    },
    [showToast],
  );

  const getRating = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/watchedSerie/getRate?userId=${user!.id}&idTmdb=${serie.id}`,
        { credentials: "include" },
      );
      if (response.ok) {
        const data = await response.json();
        setRating(data.rate ?? 0);
      }
    } catch (error) {
      console.error("Erro ao buscar avaliação da série:", error);
      setRating(0);
    }
  }, [serie.id, user]);

  const checkIsWaiting = useCallback(async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL_API}/waitingSerie/isWaiting?userid=${user!.id}&idTmdb=${serie.id}`,
    );
    const data = await response.json();
    setIsWaiting(Boolean(data.waiting));
  }, [serie.id, user]);

  const checkIsWatched = useCallback(async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL_API}/watchedSerie/isWatched?userid=${user!.id}&idTmdb=${serie.id}`,
    );
    const data = await response.json();
    setIsWatched(Boolean(data.watched));
  }, [serie.id, user]);

  const fetchInitialData = useCallback(async () => {
    if (!validateUser()) return;
    await Promise.all([checkIsWatched(), checkIsWaiting(), getRating()]);
  }, [checkIsWaiting, checkIsWatched, getRating, validateUser]);

  useEffect(() => {
    if (!authLoading) {
      setIsClient(true);
      fetchInitialData();
    }
  }, [authLoading, fetchInitialData]);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleWatchedClick = useCallback(async () => {
    if (!validateUser()) return;

    if (!isWatched) {
      openModal();
      return;
    }

    const serieData = {
      watchedAt: new Date().toISOString(),
      userId: user!.id,
      createSerieDto: buildSeriePayload(),
    };

    setWatchedLoading(true);
    const response = await sendWatchedRequest(serieData);
    setWatchedLoading(false);

    if (response?.status === 200) {
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
    user,
    validateUser,
  ]);

  const handleWatchedSubmit = useCallback(async () => {
    if (!validateUser()) return;

    setWatchedLoading(true);
    const serieData = {
      watchedAt: watchedDate,
      userId: user!.id,
      createSerieDto: buildSeriePayload(),
    };

    setIsModalOpen(false);
    const response = await sendWatchedRequest(serieData);
    setWatchedLoading(false);

    if (response?.status === 201) {
      setIsWatched(true);
      showToast("success", "Série marcada como assistida!");
    }
  }, [
    buildSeriePayload,
    sendWatchedRequest,
    showToast,
    user,
    validateUser,
    watchedDate,
  ]);

  const handleWaitingClick = useCallback(async () => {
    if (!validateUser()) return;

    setIsWaitingLoading(true);
    const serieData = {
      userId: user!.id,
      createSerieDto: buildSeriePayload(),
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/waitingSerie`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(serieData),
        },
      );

      if (response.status === 200) {
        setIsWaiting(false);
        showToast("info", "Série removida da watchlist.");
      }
      if (response.status === 201) {
        setIsWaiting(true);
        showToast("success", "Série adicionada à watchlist!");
      }
    } catch (error) {
      console.error("Erro ao atualizar watchlist da série:", error);
      showToast("error", "Erro ao atualizar a watchlist.");
    } finally {
      setIsWaitingLoading(false);
    }
  }, [buildSeriePayload, showToast, user, validateUser]);

  const handleRating = useCallback(
    (newRating: number) => {
      if (!validateUser()) return;

      if (!isWatched) {
        showToast(
          "warn",
          "Você precisa marcar a série como assistida para avaliá-la.",
        );
        return;
      }

      setRating(newRating);
      const serieData = {
        userId: user!.id,
        idTmdb: serie.id,
        rating: newRating,
      };

      try {
        fetch(`${process.env.NEXT_PUBLIC_URL_API}/watchedSerie/rate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(serieData),
        });
      } catch (error) {
        console.error("Erro ao enviar avaliação da série:", error);
        showToast("error", "Erro ao enviar a avaliação.");
      }
    },
    [isWatched, serie.id, showToast, user, validateUser],
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
          aside={
            <>
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
              <MediaQuickDetails
                title="Detalhes rápidos"
                items={quickDetails}
              />
            </>
          }
        >
          <MediaHeroHeader
            badgeLabel="Série"
            title={serie.name}
            overview={serie.overview ?? ""}
            voteAverage={serie.vote_average ?? 0}
          />

          <div className="flex flex-col gap-6 xl:gap-8">
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

            <MediaProvidersSection
              title="Onde assistir"
              providers={serie.providers}
            />

            <MediaCastSection title="Elenco principal" cast={castMembers} />
          </div>
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

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_URL_API}/serie/${id}`,
  );
  const serie = await response.json();

  return {
    props: {
      serie,
    },
  };
};

export default SeriePage;
