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
import { MovieResponse } from "../../interfaces/movie/types";

interface MovieProps {
  movie: MovieResponse;
}

const Movie: NextPage<MovieProps> = ({ movie }) => {
  const { user, authLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
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
      showToast("warn", "Entre em uma conta para fazer atualizações no filme");
      return false;
    }
    return true;
  }, [authLoading, showToast, user]);

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

  const sendWatchedRequest = useCallback(
    (movieData: any) => {
      try {
        return fetch(`${process.env.NEXT_PUBLIC_URL_API}/watchedMovie`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(movieData),
        });
      } catch (error) {
        console.error(`Erro ao fazer requisição: ${error}`);
        showToast("error", "Erro ao marcar o filme como assistido.");
        return null;
      }
    },
    [showToast],
  );

  const getRating = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/watchedMovie/getRate?userId=${user!.id}&idTmdb=${movie.id}`,
        { credentials: "include" },
      );
      if (response.ok) {
        const data = await response.json();
        setRating(data.rate ?? 0);
      }
    } catch (error) {
      setRating(0);
    }
  }, [movie.id, user]);

  const checkIsWaiting = useCallback(async () => {
    const isWaitingResponse = await fetch(
      `${process.env.NEXT_PUBLIC_URL_API}/waitingMovie/isWaiting?userid=${user!.id}&idTmdb=${movie.id}`,
    );
    const isWaitingData = await isWaitingResponse.json();
    setIsWaiting(isWaitingData.waiting);
  }, [movie.id, user]);

  const checkIsWatched = useCallback(async () => {
    const isWatchedResponse = await fetch(
      `${process.env.NEXT_PUBLIC_URL_API}/watchedMovie/isWatched?userid=${user!.id}&idTmdb=${movie.id}`,
    );
    const watched = await isWatchedResponse.json();
    setIsWatched(watched.watched);
  }, [movie.id, user]);

  const fetchData = useCallback(async () => {
    if (!validateUser()) return;
    await Promise.all([checkIsWatched(), checkIsWaiting(), getRating()]);
  }, [checkIsWaiting, checkIsWatched, getRating, validateUser]);

  useEffect(() => {
    if (!authLoading) {
      setIsClient(true);
      fetchData();
    }
  }, [authLoading, fetchData]);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleWatchedClick = useCallback(async () => {
    if (!validateUser()) return;
    if (!isWatched) {
      openModal();
      return;
    }

    const movieData = {
      watchedAt: new Date().toISOString(),
      userId: user!.id,
      createMovieDto: buildMoviePayload(),
    };
    setWatchedLoading(true);
    const response = await sendWatchedRequest(movieData);
    setWatchedLoading(false);

    if (response?.status === 200) {
      setIsWatched(false);
      setRating(0);
    }
  }, [
    buildMoviePayload,
    isWatched,
    openModal,
    sendWatchedRequest,
    user,
    validateUser,
  ]);

  const handleWatchedSubmit = useCallback(async () => {
    if (!validateUser()) return;

    setWatchedLoading(true);
    const movieData = {
      watchedAt: watchedDate,
      userId: user!.id,
      createMovieDto: buildMoviePayload(),
    };

    setIsModalOpen(false);
    const response = await sendWatchedRequest(movieData);
    setWatchedLoading(false);

    if (response?.status === 201) {
      setIsWatched(true);
      showToast("success", "Filme marcado como assistido!");
    }
  }, [
    buildMoviePayload,
    sendWatchedRequest,
    showToast,
    user,
    validateUser,
    watchedDate,
  ]);

  const handleWaitingClick = useCallback(async () => {
    if (!validateUser()) return;

    setIsWaitingLoading(true);
    const movieData = {
      userId: user!.id,
      createMovieDto: buildMoviePayload(),
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/waitingMovie`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(movieData),
        },
      );

      if (response.status === 200) setIsWaiting(false);
      if (response.status === 201) setIsWaiting(true);
    } catch (error) {
      showToast("error", "Erro ao adicionar o filme na lista de espera.");
    } finally {
      setIsWaitingLoading(false);
    }
  }, [buildMoviePayload, showToast, user, validateUser]);

  const handleRating = useCallback(
    (newRating: number) => {
      if (!validateUser()) return;
      if (!isWatched) {
        showToast(
          "warn",
          "Você precisa marcar o filme como assistido para avaliá-lo.",
        );
        return;
      }

      setRating(newRating);
      const movieData = {
        userId: user!.id,
        idTmdb: movie.id,
        rating: newRating,
      };

      try {
        fetch(`${process.env.NEXT_PUBLIC_URL_API}/watchedMovie/rate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(movieData),
        });
      } catch {
        showToast("error", "Erro ao enviar a avaliação.");
      }
    },
    [isWatched, movie.id, showToast, user, validateUser],
  );

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
          aside={
            <>
              <MediaPosterCard
                posterUrl={movie.poster_path}
                title={movie.title}
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
                extra={adultBadge}
              />
            </>
          }
        >
          <MediaHeroHeader
            badgeLabel="Filme"
            title={movie.title}
            overview={movie.overview}
            voteAverage={movie.vote_average}
          />

          <div className="flex flex-col gap-6 xl:gap-8">
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
                onClick: handleWaitingClick,
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
                onChange: handleRating,
                isClient,
              }}
            />

            <MediaProvidersSection
              title="Onde assistir"
              providers={movie.providers}
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
    `${process.env.NEXT_PUBLIC_URL_API}/movie/${id}`,
  );
  const movie = await response.json();

  return {
    props: {
      movie: movie,
    },
  };
};

export default Movie;
