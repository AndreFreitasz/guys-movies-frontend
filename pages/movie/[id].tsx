import { GetServerSideProps, NextPage } from "next";
import { MovieResponse } from "../../interfaces/movie/types";
import Header from "../../components/_ui/header";
import { useState } from "react";
import LoadingSpinner from "../../components/_ui/loadingSpinner";

interface MovieProps {
  movie: MovieResponse;
}

const Movie: NextPage<MovieProps> = ({ movie }) => {
  const [loading, setLoading] = useState(false);
  console.log(movie);
  return (
    <>
      <Header />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="relative">
          <img
            src={movie.wallpaper_path}
            alt={movie.title}
            className="w-full h-96 object-cover object-top opacity-40"
          />
          <div className="absolute left-4 top-full transform -translate-y-2/3 flex flex-col px-4 sm:px-6 md:px-8 lg:px-56 mt-14">
            <img
              src={movie.poster_path}
              alt={movie.title}
              className="w-[300px] rounded-lg"
            />
          </div>
        </div>
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
