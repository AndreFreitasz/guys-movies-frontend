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
  MediaSynopsis,
  QuickDetailItem,
} from "../../components/mediaDetails";
import { useWatchedMedia } from "../../hooks/useWatchedMedia";
import { SerieResponse } from "../../interfaces/series/types";
import { setPublicCache } from "../../utils/httpCache";

interface SerieProps {
  serie: SerieResponse;
}

const SeriePage: NextPage<SerieProps> = ({ serie }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loading] = useState(false);
  const [watchedDate, setWatchedDate] = useState("");

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

  const {
    isWatched,
    rating,
    isWaiting,
    watchedLoading,
    isWaitingLoading,
    toggleWatched,
    setRating,
    toggleWaiting,
    requireUser,
  } = useWatchedMedia({
    kind: "serie",
    idTmdb: serie.id,
    buildPayload: buildSeriePayload,
    labels: {
      authRequired: "Entre em uma conta para fazer atualizações na série",
      watchedSuccess: "Série marcada como assistida!",
      watchedRemoved: "Série removida da lista de assistidos.",
      watchedError: "Erro ao atualizar a série como assistida.",
      missingDate: "Informe a data em que você assistiu.",
      waitingAdded: "Série adicionada à watchlist!",
      waitingRemoved: "Série removida da watchlist.",
      waitingError: "Erro ao atualizar a watchlist.",
      ratingCreated: "Nota salva e série marcada como assistida!",
      ratingError: "Erro ao enviar a avaliação.",
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleWatchedClick = useCallback(() => {
    if (!requireUser()) return;
    if (!isWatched) {
      openModal();
      return;
    }
    toggleWatched(new Date().toISOString());
  }, [isWatched, openModal, requireUser, toggleWatched]);

  const handleWatchedSubmit = useCallback(() => {
    if (!requireUser()) return;
    if (!watchedDate) {
      toast.warn("Informe a data em que você assistiu.");
      return;
    }
    setIsModalOpen(false);
    toggleWatched(new Date(watchedDate).toISOString());
  }, [requireUser, toggleWatched, watchedDate]);

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
              onWatchlistToggle={toggleWaiting}
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
                onClick: toggleWaiting,
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
                onChange: setRating,
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
