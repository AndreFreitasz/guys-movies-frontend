import { useAuth } from "../../hooks/authContext";
import { GetServerSideProps, NextPage } from "next";
import { SerieResponse } from "../../interfaces/series/types";
import Header from "../../components/_ui/header";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/_ui/loadingSpinner";
import Head from "next/head";
import Footer from "../../components/_ui/footer";
import ProvidersMovie from "../../components/movie/providers";
import ReactStars from "react-stars";
import { FaEye, FaClock } from "react-icons/fa";
import Modal from "../../components/_ui/modal";
import BodyModalForm from "../../components/movie/bodyModalForm";
import CircularVoteAverage from "../../components/home/movieCard/circularVoteAverage";
import { toast } from "react-toastify";

interface SerieProps {
  serie: SerieResponse;
}

const SeriePage: NextPage<SerieProps> = ({ serie }) => {
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
  }, [user, serie.id, authLoading]);

  const fetchData = async () => {
    if (!validateUser()) return;
    await Promise.all([checkIsWatched(), checkIsWaiting(), getRating()]);
  };

  const validateUser = (): boolean => {
    if (authLoading) return false;
    if (!user) {
      showToast("warn", "Entre em uma conta para fazer atualizações na série");
      return false;
    }
    return true;
  };

  const getRating = async () => {
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
      setRating(0);
    }
  };

  const checkIsWaiting = async () => {
    const isWaitingResponse = await fetch(
      `${process.env.NEXT_PUBLIC_URL_API}/waitingSerie/isWaiting?userid=${user!.id}&idTmdb=${serie.id}`,
    );
    const isWaiting = await isWaitingResponse.json();
    setIsWaiting(isWaiting.waiting);
  };

  const checkIsWatched = async () => {
    const isWatchedResponse = await fetch(
      `${process.env.NEXT_PUBLIC_URL_API}/watchedSerie/isWatched?userid=${user!.id}&idTmdb=${serie.id}`,
    );
    const watched = await isWatchedResponse.json();
    setIsWatched(watched.watched);
  };

  const formattedDate = new Date(serie.first_air_date).toLocaleDateString(
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

  const sendWatchedRequest = (serieData: any) => {
    try {
      const response = fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/watchedSerie`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(serieData),
        },
      );
      return response;
    } catch (error) {
      console.error(`Erro ao fazer requisição: ${error}`);
      showToast("error", "Erro ao marcar a série como assistida.");
      return null;
    }
  };

  const handleWatchedClick = async () => {
    if (!validateUser()) return;
    if (!isWatched) {
      openModal();
      return;
    }
    const serieData = {
      watchedAt: new Date().toISOString(),
      userId: user!.id,
      createSerieDto: {
        name: serie.name,
        overview: serie.overview,
        firstAirDate: serie.first_air_date,
        idTmdb: serie.id,
        posterPath: serie.poster_path,
        voteAverage: serie.vote_average,
        numberOfSeasons: serie.number_of_seasons,
      },
    };
    setWatchedLoading(true);
    const response = await sendWatchedRequest(serieData);
    setWatchedLoading(false);
    if (response?.status === 200) {
      setIsWatched(false);
      setRating(0);
    }
  };

  const handleWatchedSubmit = async () => {
    if (!validateUser()) return;
    setWatchedLoading(true);
    const serieData = {
      watchedAt: watchedDate,
      userId: user!.id,
      createSerieDto: {
        name: serie.name,
        overview: serie.overview,
        firstAirDate: serie.first_air_date,
        idTmdb: serie.id,
        posterPath: serie.poster_path,
        voteAverage: serie.vote_average,
        numberOfSeasons: serie.number_of_seasons,
      },
    };
    setIsModalOpen(false);
    const response = await sendWatchedRequest(serieData);
    setWatchedLoading(false);
    if (response?.status === 201) {
      setIsWatched(true);
      showToast("success", "Série marcada como assistida!");
    }
  };

  const handleWaitingClick = async () => {
    if (!validateUser()) return;
    setIsWaitingLoading(true);
    const serieData = {
      userId: user!.id,
      createSerieDto: {
        name: serie.name,
        overview: serie.overview,
        firstAirDate: serie.first_air_date,
        idTmdb: serie.id,
        posterPath: serie.poster_path,
        voteAverage: serie.vote_average,
        numberOfSeasons: serie.number_of_seasons,
      },
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

      setIsWaitingLoading(false);
      if (response.status === 200) setIsWaiting(false);
      if (response.status === 201) setIsWaiting(true);
    } catch (error) {
      showToast("error", "Erro ao adicionar a série na lista de espera.");
    }
  };

  const handleRating = (newRating: number) => {
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
    } catch {
      showToast("error", "Erro ao enviar a avaliação.");
    }
  };

  return (
    <>
      <Head>
        <title>GuysMovie: {serie.name}</title>
      </Head>
      <Header />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="relative text-white">
            <div className="absolute inset-0">
              <img
                src={serie.wallpaper_path}
                alt={serie.name}
                className="block w-full h-[350px] sm:h-[500px] md:h-[600px] lg:h-[700px] object-cover object-top opacity-40"
                style={{
                  maskImage:
                    "linear-gradient(to top, transparent 0%, black 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to top, transparent 0%, black 100%)",
                }}
              />
            </div>
            <div className="relative pt-8 w-full px-4 sm:px-6 md:px-8 lg:px-20 xl:px-40 overflow-x-hidden">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                <div className="w-full max-w-[220px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-sm flex-shrink-0">
                  <img
                    src={serie.poster_path}
                    alt={serie.name}
                    className="block mx-auto w-full rounded-lg shadow-lg"
                  />
                  <div className="mt-8 border-b-2 border-gray-600 pb-4">
                    <h3 className="text-lg font-bold text-gray-600 mb-2 text-center lg:text-left">
                      GÊNEROS
                    </h3>
                    <p className="text-gray-400 font-semibold text-md text-center lg:text-left">
                      {serie.genres.join(", ")}
                    </p>
                  </div>
                  <div className="mt-4 border-b-2 border-gray-600 pb-4">
                    <h3 className="text-lg font-bold text-gray-600 mb-2 text-center lg:text-left">
                      CRIADORES
                    </h3>
                    <p className="text-gray-400 font-semibold text-md text-center lg:text-left">
                      {serie.created_by.length > 0
                        ? serie.created_by
                            .map((creator) => creator.name)
                            .join(", ")
                        : "-"}
                    </p>
                  </div>
                  <div className="mt-4 border-b-2 border-gray-600 pb-4">
                    <h3 className="text-lg font-bold text-gray-600 mb-2 text-center lg:text-left">
                      TEMPORADAS
                    </h3>
                    <p className="text-gray-400 font-semibold text-md text-center lg:text-left">
                      {serie.number_of_seasons}{" "}
                      {serie.number_of_seasons > 1 ? "Temporadas" : "Temporada"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-start gap-6 w-full">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 items-center justify-center lg:justify-start">
                    <h1 className="w-fit text-xl sm:text-4xl font-extrabold pb-1 sm:pb-2 border-b-4 border-indigo-600 text-center sm:text-left">
                      {serie.name}
                    </h1>
                    {/* <p className="font-bold font-mono text-xl sm:text-2xl text-gray-300 text-center sm:text-left">
                      {formattedDate}
                    </p> */}
                  </div>
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-3/4 flex flex-col gap-6">
                      <p className="mt-4 text-gray-300 font-semibold text-lg text-center md:text-left">
                        {serie.overview}
                      </p>
                      {(serie.providers.flatrate ||
                        serie.providers.buy ||
                        serie.providers.rent) && (
                        <div className="px-0 md:px-4">
                          <ProvidersMovie
                            flatrate={serie.providers.flatrate}
                            buy={serie.providers.buy}
                            rent={serie.providers.rent}
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
                              half
                              value={rating}
                            />
                          )}
                        </div>
                        <div className="flex flex-col items-center border-b-4 border-gray-700 py-4">
                          <h2 className="text-lg font-bold text-white text-opacity-50 mb-4">
                            Avaliação TMDB
                          </h2>
                          <CircularVoteAverage
                            vote_average={serie.vote_average ?? 0}
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
    `${process.env.NEXT_PUBLIC_URL_API}/serie/${id}`,
  );
  const serie = await response.json();

  return {
    props: {
      serie: serie,
    },
  };
};

export default SeriePage;
