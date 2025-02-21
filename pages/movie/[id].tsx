import { GetServerSideProps, NextPage } from "next";
import { MovieResponse } from "../../interfaces/movie/types";
import Header from "../../components/_ui/header";
import { useState } from "react";
import LoadingSpinner from "../../components/_ui/loadingSpinner";
import { FaCalendarAlt } from "react-icons/fa";
import Head from "next/head";

interface MovieProps {
  movie: MovieResponse;
}

const Movie: NextPage<MovieProps> = ({ movie }) => {
  const [loading, setLoading] = useState(false);
  const formattedDate = new Date(movie.release_date).toLocaleDateString(
    "pt-BR",
  );

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
          <div className="relative text-white">
            <img
              src={movie.wallpaper_path}
              alt={movie.title}
              className="w-full h-[300px] sm:h-[500px] object-cover object-top opacity-40"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0, black 800px, black calc(100% - 800px), transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0, black 800px, black calc(100% - 800px), transparent 100%)",
              }}
            />
            <div className="absolute top-full transform -translate-y-2/3 mt-20 w-full px-4 sm:px-6 md:px-8 lg:px-64">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={movie.poster_path}
                  alt={movie.title}
                  className="w-[140px] sm:w-[280px] rounded-lg shadow-lg"
                />
                <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 sm:mt-28">
                  <div className="flex-1">
                    <h1 className="inline-block text-white text-2xl sm:text-4xl font-extrabold border-b-2 sm:border-b-4 pb-1 sm:pb-2 border-indigo-600">
                      {movie.title}
                    </h1>
                    <p className="mt-4 text-gray-300 font-semibold text-sm sm:text-base">
                      {movie.overview}
                    </p>
                  </div>
                  <div className="flex-shrink-0 min-w-[220px] whitespace-nowrap flex items-center gap-2 bg-indigo-600 p-2 rounded-md">
                    <FaCalendarAlt className="text-white" size={20} />
                    <span className="text-white font-bold font-mono text-sm sm:text-lg">
                      Lançamento: {formattedDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_URL_API}/movie/${id}`,
  );
  const movie = await response.json();
  console.log(movie);

  return {
    props: {
      movie: movie,
    },
  };
};

export default Movie;
