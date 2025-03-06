import { GetServerSideProps, NextPage } from "next";
import { MovieResponse } from "../../interfaces/movie/types";
import Header from "../../components/_ui/header";
import { useState } from "react";
import LoadingSpinner from "../../components/_ui/loadingSpinner";
import Head from "next/head";
import Footer from "../../components/_ui/footer";
import ProvidersMovie from "../../components/movie/providers";
import ReactStars from 'react-stars'

interface MovieProps {
  movie: MovieResponse;
}

const Movie: NextPage<MovieProps> = ({ movie }) => {
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);

  const formattedDate = new Date(movie.release_date).toLocaleDateString(
    "pt-BR",
  );
  const handleRating = (newRating: number) => {
    setRating(newRating);
  };

  return (
    <>
      <Head>
        <title>{movie.title}</title>
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
            <div className="mt-8 w-full px-4 sm:px-6 md:px-8 lg:px-40">
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
                <div className="flex flex-col justify-start gap-4 w-full min-h-48 overflow-y-auto self-start">
                  <div className="flex gap-4 items-end">
                    <h1 className="w-fit text-2xl sm:text-4xl font-extrabold pb-1 sm:pb-2 border-b-4 border-indigo-600 text-center mx-auto sm:text-left sm:mx-0">
                      {movie.title}
                    </h1>
                    <p className="font-bold font-mono text-2xl text-gray-300">
                      {" "}
                      {formattedDate}{" "}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-3/5">
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
                    <div className="w-full sm:w-2/5">
                      <div className="bg-defaultBackgroundSecond bg-opacity-40 p-4 rounded-lg">
                        <ReactStars
                          count={5}
                          onChange={handleRating}
                          size={32}
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
        </>
      )}
      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_URL_API}/movie/${id}`,
  );
  console.log("erro");
  const movie = await response.json();
  console.log(movie);

  return {
    props: {
      movie: movie,
    },
  };
};

export default Movie;