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
import { send } from "process";

interface MovieProps {
  movie: MovieResponse;
}

const Movie: NextPage<MovieProps> = ({ movie }) => {
  const { user } = useAuth();
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
    setIsClient(true);
    checkIsWatched();
    checkIsWaiting();
  }, [user, movie.id]);

  const checkIsWaiting = async () => {
    if (!user) return;
    const isWaitingResponse = await fetch(
      `${process.env.NEXT_PUBLIC_URL_API}/waitingMovie/isWaiting?userid=${user.id}&idTmdb=${movie.id}`,
    );
    const isWaiting = await isWaitingResponse.json();
    setIsWaiting(isWaiting.waiting);
  };

  const checkIsWatched = async () => {
    if (!user) return;
    const isWatchedResponse = await fetch(
      `${process.env.NEXT_PUBLIC_URL_API}/watchedMovie/isWatched?userid=${user.id}&idTmdb=${movie.id}`,
    );
    const isWatched = await isWatchedResponse.json();
    setIsWatched(isWatched.watched);
  };

  const formattedDate = new Date(movie.release_date).toLocaleDateString(
    "pt-BR",
  );

  const validateUser = (): boolean => {
    if (!user) {
      showToast(
        "warn",
        "Entre em uma conta para marcar o filme como assistido.",
      );
      return false;
    }
    return true;
  };

  const handleRating = (newRating: number) => setRating(newRating);
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

    const response = await sendWatchedRequest(movieData);
    if (response) {
      if (response.status === 200) setIsWatched(false);
      if (response.status === 201) setIsWatched(true);
    }
  };

  const handleWatchedSubmit = async () => {
    if (!validateUser()) return;
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
    const response = await sendWatchedRequest(movieData);
    setIsModalOpen(false);
    if (response) {
      if (response.status === 201) setIsWatched(true);
      if (response.status === 200) setIsWatched(false);
    }
  };

  const handleWaitingClick = async () => {
    if (!user)
      return showToast(
        "warn",
        "Entre em uma conta para adicionar um filme na lista de espera.",
      );
    setIsWaitingLoading(true);
    const movieData = {
      userId: user.id,
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
          <div className="text-white">
            <img
              src={movie.wallpaper_path}
              alt={movie.title}
              className="hidden sm:block w-full h-[300px] sm:h-[500px] object-cover object-top opacity-40"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0, black 800px, black calc(100% - 800px), transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0, black 800px, black calc(100% - 800px), transparent 100%)",
              }}
            />
            <div className="mt-8 w-full px-4 sm:px-6 md:px-8 lg:px-40 overflow-x-hidden">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="sm:mx-0 mx-auto">
                  <img
                    src={movie.poster_path}
                    alt={movie.title}
                    className="block mx-auto w-[220px] sm:w-[420px] rounded-lg shadow-lg"
                  />
                  <div className="mt-8 border-b-2 border-gray-600 pb-4">
                    <h3 className="text-lg font-bold text-gray-600 mb-2">
                      GÊNEROS
                    </h3>
                    <p className="text-gray-400 font-semibold text-md">
                      {movie.genres.map((genre) => genre).join(", ")}
                    </p>
                  </div>
                  <div className="mt-4 border-b-2 border-gray-600 pb-4">
                    <h3 className="text-lg font-bold text-gray-600 mb-2">
                      DIRETOR
                    </h3>
                    <p className="text-gray-400 font-semibold text-md">
                      {movie.director?.name}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-start gap-4 w-full min-h-48 self-start">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 items-center">
                    <h1 className="w-fit text-2xl sm:text-4xl font-extrabold pb-1 sm:pb-2 border-b-4 border-indigo-600 text-center sm:text-left">
                      {movie.title}
                    </h1>
                    <p className="font-bold font-mono text-2xl text-gray-300 text-center sm:text-left">
                      {formattedDate}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-3/4">
                      <p className="mt-4 text-gray-300 font-semibold text-lg">
                        {movie.overview}
                      </p>
                      {(movie.providers.flatrate ||
                        movie.providers.buy ||
                        movie.providers.rent) && (
                        <div className="px-4">
                          <ProvidersMovie
                            flatrate={movie.providers.flatrate}
                            buy={movie.providers.buy}
                            rent={movie.providers.rent}
                          />
                        </div>
                      )}
                    </div>
                    <div className="w-full sm:w-1/4">
                      <div className="bg-defaultBackgroundSecond bg-opacity-40 pt-3 rounded-lg border-4 border-gray-600">
                        <div className="flex flex-col items-center border-b-4 border-gray-700 pb-4">
                          <h2 className="text-xl font-bold text-white text-opacity-50 mb-2">
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
                        <div className="flex justify-around py-4 border-b-4 border-gray-700">
                          <div className="relative group">
                            <FaHeart className="text-gray-500 text-3xl cursor-pointer hover:text-red-500" />
                            <span className="absolute bottom-full mb-2 bg-gray-700 text-white text-md rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              Favorito
                            </span>
                          </div>
                          <div className="relative group">
                            {watchedLoading ? (
                              <LoadingSpinner small />
                            ) : (
                              <FaEye
                                className={`text-3xl cursor-pointer ${isWatched ? "text-blue-500" : "text-gray-500"} hover:text-blue-500`}
                                onClick={handleWatchedClick}
                              />
                            )}
                            <span className="absolute bottom-full mb-2 bg-gray-700 text-white text-md rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              Assistido
                            </span>
                          </div>
                          <div className="relative group">
                            {isWaitingLoading ? (
                              <LoadingSpinner small />
                            ) : (
                              <FaClock
                                className={`text-3xl cursor-pointer ${isWaiting ? "text-yellow-500" : "text-gray-500"} hover:text-yellow-500`}
                                onClick={handleWaitingClick}
                              />
                            )}
                            <span className="absolute bottom-full mb-2 bg-gray-700 text-white text-md rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              Lista de Espera
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center border-b-4 border-gray-700 py-4">
                          <h2 className="text-lg font-bold text-white text-opacity-50 mb-4">
                            Avaliação TMDB
                          </h2>
                          <CircularVoteAverage
                            vote_average={movie.vote_average}
                          />
                        </div>
                        <div className="flex flex-col items-center py-4">
                          <h2 className="text-lg font-bold text-white text-opacity-50">
                            Avaliação
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
