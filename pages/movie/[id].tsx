import { GetServerSideProps, NextPage } from "next";
import { MovieResponse } from "../../interfaces/movie/types";
import Header from "../../components/_ui/header";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/_ui/loadingSpinner";
import Head from "next/head";
import Footer from "../../components/_ui/footer";
import ProvidersMovie from "../../components/movie/providers";
import ReactStars from 'react-stars'
import { FaHeart, FaEye, FaClock, FaPlus } from 'react-icons/fa';
import Modal from "../../components/_ui/modal";
import BodyModalForm from "../../components/movie/bodyModalForm";
import CircularVoteAverage from "../../components/home/movieCard/circularVoteAverage";

interface MovieProps {
  movie: MovieResponse;
}

const Movie: NextPage<MovieProps> = ({ movie }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formattedDate = new Date(movie.release_date).toLocaleDateString(
    "pt-BR",
  );

  const handleRating = (newRating: number) => setRating(newRating);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
                          <h2 className="text-xl font-bold text-white text-opacity-50 mb-2">Avaliar</h2>
                          {isClient && (
                            <ReactStars
                              count={5}
                              onChange={handleRating}
                              size={40}
                              color2={'#4F46E5'}
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
                            <FaEye className="text-gray-500 text-3xl cursor-pointer hover:text-blue-500" />
                            <span className="absolute bottom-full mb-2 bg-gray-700 text-white text-md rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              Assistido
                            </span>
                          </div>
                          <div className="relative group">
                            <FaClock className="text-gray-500 text-3xl cursor-pointer hover:text-yellow-300" />
                            <span className="absolute bottom-full mb-2 bg-gray-700 text-white text-md rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              Lista de Espera
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-center pt-2 border-b-4 border-gray-700">
                          <button onClick={openModal} className="flex items-center text-md font-bold text-white text-opacity-50 mb-2 hover:text-indigo-600 focus:outline-none">
                            <FaPlus className="text-md mr-2" />
                            Adicionar Informações
                          </button>
                        </div>
                        <div className="flex flex-col items-center border-b-4 border-gray-700 py-4">
                          <h2 className="text-lg font-bold text-white text-opacity-50 mb-4">Avaliação TMDB</h2>
                          <CircularVoteAverage vote_average={movie.vote_average}/>
                        </div>
                        <div className="flex flex-col items-center py-4">
                          <h2 className="text-lg font-bold text-white text-opacity-50">Avaliação</h2>
                          <ReactStars
                              count={5}
                              onChange={handleRating}
                              size={40}
                              color2={'#4F46E5'}
                              half={true}
                              value={rating}
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
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Informações adicionais">
        <BodyModalForm />
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