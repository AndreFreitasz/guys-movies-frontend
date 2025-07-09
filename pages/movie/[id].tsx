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
import { FaHeart, FaEye, FaClock, FaPlus } from "react-icons/fa";
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
    console.log(isWatched);
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
          <div className="relative text-white">
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
            </div>
            <div className="relative pt-8 w-full px-4 sm:px-6 md:px-8 lg:px-20 xl:px-40 overflow-x-hidden">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                <div className="w-full max-w-[220px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-sm flex-shrink-0">
                  <img
                    src={movie.poster_path}
                    alt={movie.title}
                    className="block mx-auto w-full rounded-lg shadow-lg"
                  />
                  <div className="mt-8 border-b-2 border-gray-600 pb-4">
                    <h3 className="text-lg font-bold text-gray-600 mb-2 text-center lg:text-left">
                      GÊNEROS
                    </h3>
                    <p className="text-gray-400 font-semibold text-md text-center lg:text-left">
                      {movie.genres.map((genre) => genre).join(", ")}
                    </p>
                  </div>
                  <div className="mt-4 border-b-2 border-gray-600 pb-4">
                    <h3 className="text-lg font-bold text-gray-600 mb-2 text-center lg:text-left">
                      DIRETOR
                    </h3>
                    <p className="text-gray-400 font-semibold text-md text-center lg:text-left">
                      {movie.director?.name}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-start gap-4 w-full">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 items-center justify-center lg:justify-start">
                    <h1 className="w-fit text-xl sm:text-4xl font-extrabold pb-1 sm:pb-2 border-b-4 border-indigo-600 text-center sm:text-left">
                      {movie.title}
                    </h1>
                    <p className="font-bold font-mono text-xl sm:text-2xl text-gray-300 text-center sm:text-left">
                      {formattedDate}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-3/4 flex flex-col gap-4">
                      <p className="mt-4 text-gray-300 font-semibold text-lg text-center md:text-left">
                        {movie.overview}
                      </p>
                      {(movie.providers.flatrate ||
                        movie.providers.buy ||
                        movie.providers.rent) && (
                        <div className="px-0 md:px-4">
                          <ProvidersMovie
                            flatrate={movie.providers.flatrate}
                            buy={movie.providers.buy}
                            rent={movie.providers.rent}
                          />
                        </div>
                      )}
                    </div>
                    <div className="w-full md:w-1/4">
                      <div className="bg-defaultBackgroundSecond bg-opacity-40 pt-3 rounded-lg border-4 border-gray-600">
                        <div className="flex justify-around py-4 border-b-4 border-gray-700">
                          <div className="flex flex-col items-center">
                            {watchedLoading ? (
                              <LoadingSpinner small />
                            ) : (
                              <FaEye
                                className={`text-3xl cursor-pointer ${isWatched ? "text-blue-500" : "text-gray-500"} hover:text-blue-500`}
                                onClick={handleWatchedClick}
                              />
                            )}
                            <span className="text-gray-500 text-sm mt-2 font-semibold">
                              Assistido
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            {isWaitingLoading ? (
                              <LoadingSpinner small />
                            ) : (
                              <FaClock
                                className={`text-3xl cursor-pointer ${isWaiting ? "text-yellow-500" : "text-gray-500"} hover:text-yellow-500`}
                                onClick={handleWaitingClick}
                              />
                            )}
                            <span className="text-gray-500 text-sm mt-2 font-semibold">
                              Watchlist
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center border-b-4 border-gray-700 pb-4 pt-4">
                          <h2 className="text-xl font-bold text-white text-opacity-50">
                            Avaliar
                          </h2>
                          {isClient && (
                            <ReactStars
                              count={5}
                              onChange={handleRating}
                              size={40}
                              color2={"#4F46E5"}
                              half={true}
                              value={rating}
                            />
                          )}
                        </div>
                        <div className="flex flex-col items-center border-b-4 border-gray-700 py-4">
                          <h2 className="text-lg font-bold text-white text-opacity-50 mb-4">
                            Avaliação TMDB
                          </h2>
                          <CircularVoteAverage
                            vote_average={movie.vote_average}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
