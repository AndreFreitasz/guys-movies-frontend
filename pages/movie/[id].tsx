import { useAuth } from "../../hooks/authContext";
import { GetServerSideProps, NextPage } from "next";
import { MovieResponse } from "../../interfaces/movie/types";
import Header from "../../components/_ui/header";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/_ui/loadingSpinner";
import Head from "next/head";
import Footer from "../../components/_ui/footer";
import ProvidersMovie from "../../components/movie/providers";
import ReactStars from "react-stars";
import { FaEye, FaClock, FaPlus } from "react-icons/fa";
import Modal from "../../components/_ui/modal";
import BodyModalForm from "../../components/movie/bodyModalForm";
import CircularVoteAverage from "../../components/home/movieCard/circularVoteAverage";
import { toast } from "react-toastify";

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

  useEffect(() => {
    if (!authLoading) {
      setIsClient(true);
      fetchData();
    }
  }, [user, movie.id, authLoading]);

  const fetchData = async () => {
    if (!validateUser()) return;
    await Promise.all([checkIsWatched(), checkIsWaiting(), getRating()]);
  };

  const validateUser = (): boolean => {
    if (authLoading) return false;
    if (!user) {
      showToast("warn", "Entre em uma conta para fazer atualizações no filme");
      return false;
    }
    return true;
  };

  const getRating = async () => {
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
  };

  const checkIsWaiting = async () => {
    const isWaitingResponse = await fetch(
      `${process.env.NEXT_PUBLIC_URL_API}/waitingMovie/isWaiting?userid=${user!.id}&idTmdb=${movie.id}`,
    );
    const isWaiting = await isWaitingResponse.json();
    setIsWaiting(isWaiting.waiting);
  };

  const checkIsWatched = async () => {
    const isWatchedResponse = await fetch(
      `${process.env.NEXT_PUBLIC_URL_API}/watchedMovie/isWatched?userid=${user!.id}&idTmdb=${movie.id}`,
    );
    const watched = await isWatchedResponse.json();
    setIsWatched(watched.watched);
  };

  const formattedDate = new Date(movie.release_date).toLocaleDateString(
    "pt-BR",
  );

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const showToast = (
    type: "success" | "error" | "warn" | "info",
    message: string,
  ) => {
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
  };

  const sendWatchedRequest = (movieData: any) => {
    try {
      const response = fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/watchedMovie`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(movieData),
        },
      );
      return response;
    } catch (error) {
      console.error(`Erro ao fazer requisição: ${error}`);
      showToast("error", "Erro ao marcar o filme como assistido.");
      return null;
    }
  };

  const handleWatchedClick = async () => {
    if (!validateUser()) return;
    if (!isWatched) {
      openModal();
      return;
    }
    const movieData = {
      watchedAt: new Date().toISOString(),
      userId: user!.id,
      createMovieDto: {
        title: movie.title,
        overview: movie.overview,
        releaseDate: movie.release_date,
        idTmdb: movie.id,
        posterPath: movie.poster_path,
        director: movie.director?.name,
        voteAverage: movie.vote_average,
      },
    };
    setWatchedLoading(true);
    const response = await sendWatchedRequest(movieData);
    setWatchedLoading(false);
    if (response!.status === 200) {
      setIsWatched(false);
      setRating(0);
    }
  };

  const handleWatchedSubmit = async () => {
    if (!validateUser()) return;
    setWatchedLoading(true);
    const movieData = {
      watchedAt: watchedDate,
      userId: user!.id,
      createMovieDto: {
        title: movie.title,
        overview: movie.overview,
        releaseDate: movie.release_date,
        idTmdb: movie.id,
        posterPath: movie.poster_path,
        director: movie.director?.name,
        voteAverage: movie.vote_average,
      },
    };
    setIsModalOpen(false);
    const response = await sendWatchedRequest(movieData);
    setWatchedLoading(false);
    if (response!.status === 201) {
      setIsWatched(true);
      showToast("success", "Filme marcado como assistido!");
    }
  };

  const handleWaitingClick = async () => {
    if (!validateUser()) return;
    setIsWaitingLoading(true);
    const movieData = {
      userId: user!.id,
      createMovieDto: {
        title: movie.title,
        overview: movie.overview,
        releaseDate: movie.release_date,
        idTmdb: movie.id,
        posterPath: movie.poster_path,
        director: movie.director?.name,
        voteAverage: movie.vote_average,
      },
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

      setIsWaitingLoading(false);
      if (response.status === 200) setIsWaiting(false);
      if (response.status === 201) setIsWaiting(true);
    } catch (error) {
      showToast("error", "Erro ao adicionar o filme na lista de espera.");
    }
  };

  const handleRating = (newRating: number) => {
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
  };

  return (
    <>
      <Head>
        <title>GuysMovie: {movie.title}</title>
      </Head>
      <Header />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <section className="relative isolate overflow-hidden bg-[#050812] text-white">
            <div className="absolute inset-0">
              <img
                src={movie.wallpaper_path}
                alt={movie.title}
                className="block w-full h-[350px] sm:h-[500px] md:h-[600px] lg:h-[700px] object-cover object-top opacity-40"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to top, transparent 0%, black 100%)",
                  maskImage:
                    "linear-gradient(to top, transparent 0%, black 100%)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#050812]" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-[#050812]" />
              <div className="absolute inset-0 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10 px-3 pb-14 pt-18 sm:px-5 lg:px-8">
              <div className="grid gap-12 lg:grid-cols-[minmax(0,300px)_1fr]">
                <aside className="flex flex-col gap-8">
                  <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 shadow-2xl shadow-indigo-900/40 backdrop-blur">
                    <img
                      src={movie.poster_path}
                      alt={movie.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <button
                      type="button"
                      onClick={handleWaitingClick}
                      disabled={isWaitingLoading}
                      className={`group/button absolute right-4 top-4 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide backdrop-blur transition ${
                        isWaiting
                          ? "bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-300/60 hover:bg-emerald-400/30"
                          : "bg-white/10 text-white hover:bg-white/20"
                      } ${isWaitingLoading ? "opacity-70" : ""}`}
                    >
                      <FaPlus
                        className={`text-base transition duration-300 ${
                          isWaiting ? "rotate-45 text-emerald-200" : ""
                        }`}
                      />
                      <span>{isWaiting ? "Na watchlist" : "Watchlist"}</span>
                    </button>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200">
                      Detalhes rápidos
                    </h3>
                    <div className="mt-5 grid gap-4 text-sm text-white/80">
                      <div className="rounded-2xl bg-white/5 p-3">
                        <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                          Lançamento
                        </span>
                        <p className="mt-2 text-base font-semibold text-white">
                          {formattedDate}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-3">
                        <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                          Diretor
                        </span>
                        <p className="mt-2 text-base font-semibold text-white">
                          {movie.director?.name ?? "Não informado"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-3">
                        <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                          Gêneros
                        </span>
                        <p className="mt-2 text-sm font-semibold leading-relaxed text-white">
                          {movie.genres.join(" • ")}
                        </p>
                      </div>
                      {movie.adult && (
                        <div className="flex items-center justify-center rounded-2xl border border-red-400/60 bg-red-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-red-200">
                          +18
                        </div>
                      )}
                    </div>
                  </div>
                </aside>

                <div className="flex flex-col gap-10">
                  <header className="space-y-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-200">
                          Filme
                        </p>
                        <h1 className="text-3xl font-black sm:text-5xl md:text-6xl">
                          {movie.title}
                        </h1>
                      </div>
                      <div className="flex items-center gap-4 rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                        <CircularVoteAverage
                          vote_average={movie.vote_average}
                        />
                        <div className="flex flex-col text-xs uppercase tracking-[0.3em] text-white/60">
                          <span>Score</span>
                          <span className="font-semibold text-white">TMDB</span>
                        </div>
                      </div>
                    </div>
                    <p className="max-w-3xl text-lg leading-relaxed text-white/75">
                      {movie.overview}
                    </p>
                  </header>

                  <div className="flex flex-col gap-6 xl:gap-8">
                    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/20 via-indigo-400/10 to-transparent p-5 md:p-6 xl:p-7 backdrop-blur">
                      <div className="flex flex-col gap-5 md:gap-6">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100">
                            Sua experiência
                          </h2>
                          <p className="text-xs text-white/60 md:max-w-sm">
                            Gerencie rapidamente o que já assistiu, o que quer
                            ver e registre sua nota personalizando suas
                            recomendações.
                          </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={handleWatchedClick}
                            disabled={watchedLoading}
                            className={`group flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-left transition ${
                              isWatched
                                ? "bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
                                : "bg-white/5 text-white hover:bg-white/10"
                            } ${watchedLoading ? "opacity-70" : ""}`}
                          >
                            {watchedLoading ? (
                              <LoadingSpinner small />
                            ) : (
                              <FaEye
                                className={`text-xl transition duration-300 ${
                                  isWatched
                                    ? "text-emerald-200"
                                    : "text-indigo-200"
                                }`}
                              />
                            )}
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                                Assistido
                              </p>
                              <p className="text-sm font-semibold">
                                {isWatched
                                  ? "Remover do assistido"
                                  : "Marcar como assistido"}
                              </p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={handleWaitingClick}
                            disabled={isWaitingLoading}
                            className={`group flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-left transition ${
                              isWaiting
                                ? "bg-amber-400/20 text-amber-100 hover:bg-amber-400/25"
                                : "bg-white/5 text-white hover:bg-white/10"
                            } ${isWaitingLoading ? "opacity-70" : ""}`}
                          >
                            {isWaitingLoading ? (
                              <LoadingSpinner small />
                            ) : (
                              <FaClock
                                className={`text-xl transition duration-300 ${
                                  isWaiting
                                    ? "text-amber-200"
                                    : "text-indigo-200"
                                }`}
                              />
                            )}
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                                Watchlist
                              </p>
                              <p className="text-sm font-semibold">
                                {isWaiting
                                  ? "Remover da watchlist"
                                  : "Adicionar à watchlist"}
                              </p>
                            </div>
                          </button>
                        </div>

                        <div className="rounded-2xl border border-white/5 bg-black/30 p-4 md:p-5 backdrop-blur">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-white">
                                Avalie este filme
                              </p>
                              <p className="text-xs text-white/60">
                                Compartilhe sua nota e melhore suas
                                recomendações.
                              </p>
                            </div>
                            {isClient && (
                              <div className="flex items-center">
                                <ReactStars
                                  count={5}
                                  onChange={handleRating}
                                  size={36}
                                  color2={"#F97316"}
                                  half={true}
                                  value={rating}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {(movie.providers.flatrate ||
                      movie.providers.buy ||
                      movie.providers.rent) && (
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 xl:p-7 backdrop-blur-sm">
                        <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100">
                          Onde assistir
                        </h2>
                        <div className="mt-6">
                          <ProvidersMovie
                            flatrate={movie.providers.flatrate}
                            buy={movie.providers.buy}
                            rent={movie.providers.rent}
                          />
                        </div>
                      </div>
                    )}

                    {movie.cast && movie.cast.length > 0 && (
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 xl:p-7 backdrop-blur-sm">
                        <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100">
                          Elenco principal
                        </h2>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                          {movie.cast.slice(0, 8).map((member) => (
                            <div
                              key={`${member.name}-${member.character}`}
                              className="flex items-start gap-3 rounded-2xl bg-white/5 p-3"
                            >
                              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-black/40 flex-shrink-0">
                                {member.profile_path ? (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                                    alt={member.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase text-white/60">
                                    {member.name.substring(0, 2)}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold leading-snug text-white break-words">
                                  {member.name}
                                </p>
                                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                                  {member.character}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
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
