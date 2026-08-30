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
import { MovieResponse } from "../../interfaces/movie/types";
import { setPublicCache } from "../../utils/httpCache";

interface MovieProps {
  movie: MovieResponse;
}

const Movie: NextPage<MovieProps> = ({ movie }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [watchedDate, setWatchedDate] = useState("");

  const buildMoviePayload = useCallback(
    () => ({
      title: movie.title,
      overview: movie.overview,
      releaseDate: movie.release_date,
      idTmdb: movie.id,
      posterPath: movie.poster_path,
      director: movie.director?.name,
      voteAverage: movie.vote_average,
    }),
    [
      movie.director?.name,
      movie.id,
      movie.overview,
      movie.poster_path,
      movie.release_date,
      movie.title,
      movie.vote_average,
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
    kind: "movie",
    idTmdb: movie.id,
    buildPayload: buildMoviePayload,
    labels: {
      authRequired: "Entre em uma conta para fazer atualizações no filme",
      watchedSuccess: "Filme marcado como assistido!",
      watchedError: "Erro ao atualizar o filme como assistido.",
      missingDate: "Informe a data em que você assistiu.",
      waitingError: "Erro ao atualizar a lista de espera.",
      ratingCreated: "Nota salva e filme marcado como assistido!",
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
    const date = new Date(movie.release_date);
    if (Number.isNaN(date.getTime())) {
      return "Data não informada";
    }
    return date.toLocaleDateString("pt-BR");
  }, [movie.release_date]);

  const genresLabel = useMemo(() => {
    if (!movie.genres?.length) return "Não informado";
    return movie.genres.join(" • ");
  }, [movie.genres]);

  const quickDetails = useMemo<QuickDetailItem[]>(
    () => [
      { label: "Lançamento", value: formattedDate },
      {
        label: "Diretor",
        value: movie.director?.name ?? "Não informado",
      },
      { label: "Gêneros", value: genresLabel },
    ],
    [formattedDate, genresLabel, movie.director?.name],
  );

  const adultBadge = useMemo(() => {
    if (!movie.adult) return null;
    return (
      <div className="flex items-center justify-center rounded-2xl border border-red-400/60 bg-red-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-red-200">
        +18
      </div>
    );
  }, [movie.adult]);

  const castMembers = useMemo(() => movie.cast ?? [], [movie.cast]);

  return (
    <>
      <Head>
        <title>GuysMovie: {movie.title}</title>
      </Head>
      <Header />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <MediaDetailLayout
          backdropUrl={movie.wallpaper_path}
          backdropAlt={movie.title}
          poster={
            <MediaPosterCard
              posterUrl={movie.poster_path}
              title={movie.title}
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
              badgeLabel="Filme"
              title={movie.title}
              voteAverage={movie.vote_average}
            />
          }
          actions={
            <MediaExperiencePanel
              heading="Sua experiência"
              description="Gerencie rapidamente o que já assistiu, o que quer ver e registre sua nota personalizando suas recomendações."
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
                title: "Avalie este filme",
                description:
                  "Compartilhe sua nota e melhore suas recomendações.",
                value: rating,
                onChange: setRating,
                isClient,
              }}
            />
          }
          details={
            <MediaQuickDetails
              title="Detalhes rápidos"
              items={quickDetails}
              extra={adultBadge}
            />
          }
        >
          <MediaSynopsis title="Sinopse" overview={movie.overview} />

          <MediaProvidersSection
            title="Onde assistir"
            providers={movie.providers}
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
      `${process.env.NEXT_PUBLIC_URL_API}/movie/${id}`,
    );

    if (!response.ok) {
      return { notFound: true };
    }

    const movie = await response.json();

    if (!movie?.id) {
      return { notFound: true };
    }

    setPublicCache(context.res, 3600, 86400);

    return { props: { movie } };
  } catch {
    return { notFound: true };
  }
};

export default Movie;
