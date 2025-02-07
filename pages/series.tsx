import React, { useState, useEffect } from "react";
import Header from "../components/_ui/header";
import Title from "../components/_ui/title";
import Image from "next/image";
import Carousel from "../components/_ui/carousel";
import SeriesProvider from "../components/series/seriesProvider";
import SerieCard from "../components/series/seriesCard";
import { GetServerSideProps } from "next";
import Footer from "../components/_ui/footer";
import { SerieProps } from "../interfaces/series/types";
import LoadingSpinner from "../components/_ui/loadingSpinner";

const Serie = ({
  providerData,
  popularSeries,
  popularSeriesHorror,
  popularSeriesSciFi,
  popularSeriesFamily,
  topRatedSeries,
  popularSeriesDrama,
  popularSeriesSciFiDrama,
  popularSeriesComedy,
  error,
}: SerieProps) => {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setShowError(true);
    };
    setLoading(false);
  }, [error]);

  if (showError) {
    return (
      <>
        <Header />
        <div className="flex flex-col px-4 sm:px-6 md:px-8 lg:px-40 w-full mt-14">
          <h1 className="text-2xl font-bold text-center mt-24 text-white">
            Ocorreu um erro ao executar a página
          </h1>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      {loading && <LoadingSpinner />}
      <div className="flex flex-col px-4 sm:px-6 md:px-8 lg:px-40 w-full mt-14">
        <div className="flex items-center mb-4">
          <Image
            src="/icons/home/popular.png"
            alt="Ícone de uma estrela"
            className="mr-2 w-8 h-8"
            width={64}
            height={64}
          />
          <Title
            title="Filmes Populares Por Streamings"
            className="ml-2 text-left"
          />
        </div>
        <Carousel
          data={providerData || []}
          slidesToShow={3}
          renderItem={(providerData) => (
            <SeriesProvider
              providerData={providerData}
              key={providerData.provider.id}
            />
          )}
        />

        <div className="flex items-center mt-12 mb-4">
          <Image
            src="/icons/home/cinema.png"
            alt="Ícone de um cinema"
            className="mr-2 w-8 h-8"
            width={64}
            height={64}
          />
          <Title title="Filmes Populares" className="ml-2 text-left" />
        </div>
        <Carousel
          slidesToShow={6}
          infinite={true}
          data={popularSeries || []}
          className="ml-16"
          renderItem={(serie) => <SerieCard key={serie.id} {...serie} />}
        />

        <div className="flex items-center mt-24 mb-4">
          <Image
            src="/icons/home/horror.png"
            alt="Ícone de Terror"
            className="mr-2 w-8 h-8"
            width={64}
            height={64}
          />
          <Title title="Terror E Suspense" className="ml-2 text-left" />
        </div>
        <Carousel
          slidesToShow={6}
          infinite={true}
          data={popularSeriesHorror || []}
          className="ml-16"
          renderItem={(serie) => <SerieCard key={serie.id} {...serie} />}
        />

        <div className="flex items-center mt-24 mb-4">
          <Image
            src="/icons/home/scifi.png"
            alt="Ícone de tecnologia"
            className="mr-2 w-8 h-8"
            width={64}
            height={64}
          />
          <Title title="Ficção Cientí­fica" className="ml-2 text-left" />
        </div>
        <Carousel
          slidesToShow={6}
          infinite={true}
          data={popularSeriesSciFi || []}
          className="ml-16"
          renderItem={(serie) => <SerieCard key={serie.id} {...serie} />}
        />

        <div className="flex items-center mt-24 mb-4">
          <Image
            src="/icons/home/like.png"
            alt="Ícone de um curtir"
            className="mr-2 w-8 h-8"
            width={64}
            height={64}
          />
          <Title title="Aclamados pela Crí­tica" className="ml-2 text-left" />
        </div>
        <Carousel
          slidesToShow={6}
          infinite={true}
          data={topRatedSeries || []}
          className="ml-16"
          renderItem={(serie) => <SerieCard key={serie.id} {...serie} />}
        />

        <div className="flex items-center mt-24 mb-4">
          <Image
            src="/icons/home/family.png"
            alt="Ícone de uma família"
            className="mr-2 w-8 h-8"
            width={64}
            height={64}
          />
          <Title title="Famí­lia" className="ml-2 text-left" />
        </div>
        <Carousel
          slidesToShow={6}
          infinite={true}
          data={popularSeriesFamily || []}
          className="ml-16"
          renderItem={(serie) => <SerieCard key={serie.id} {...serie} />}
        />

        <div className="flex items-center mt-24 mb-4">
          <Image
            src="/icons/home/drama.png"
            alt="Ícone de drama"
            className="mr-2 w-8 h-8"
            width={64}
            height={64}
          />
          <Title title="Drama" className="ml-2 text-left" />
        </div>
        <Carousel
          slidesToShow={6}
          infinite={true}
          data={popularSeriesDrama || []}
          className="ml-16"
          renderItem={(serie) => <SerieCard key={serie.id} {...serie} />}
        />

        <div className="flex items-center mt-24 mb-4">
          <Image
            src="/icons/home/rocket.png"
            alt="Ícone de um foguete"
            className="mr-2 w-8 h-8"
            width={64}
            height={64}
          />
          <Title title="Sci-Fi Dramático" className="ml-2 text-left" />
        </div>
        <Carousel
          slidesToShow={6}
          infinite={true}
          data={popularSeriesSciFiDrama || []}
          className="ml-16"
          renderItem={(serie) => <SerieCard key={serie.id} {...serie} />}
        />

        <div className="flex items-center mt-24 mb-4">
          <Image
            src="/icons/home/comedy.png"
            alt="Ícone de comédia"
            className="mr-2 w-8 h-8"
            width={64}
            height={64}
          />
          <Title title="Comédia" className="ml-2 text-left" />
        </div>
        <Carousel
          slidesToShow={6}
          infinite={true}
          data={popularSeriesComedy || []}
          className="ml-16"
          renderItem={(serie) => <SerieCard key={serie.id} {...serie} />}
        />
      </div>
      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const [
      providerRes,
      popularRes,
      horrorRes,
      sciFiRes,
      familyRes,
      topRatedRes,
      dramaRes,
      sciFiDramaRes,
      comedyRes,
    ] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/series/popularByProviders`),
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/series/popular`),
      fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/series/popularByGenres/27,9648`,
      ),
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/series/popularByGenres/878`),
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/series/popularByGenres/10751`),
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/series/topRated`),
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/series/popularByGenres/18`),
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/series/popularByGenres/18,878`),
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/series/popularByGenres/35`),
    ]);

    if (
      !providerRes.ok ||
      !popularRes.ok ||
      !horrorRes.ok ||
      !sciFiRes.ok ||
      !familyRes.ok ||
      !topRatedRes.ok ||
      !dramaRes.ok ||
      !sciFiDramaRes.ok ||
      !comedyRes.ok
    ) {
      throw new Error(
        "Ocorreu um erro ao buscar os dados, tente novamente mais tarde!",
      );
    }

    const [
      providerData,
      popularSeries,
      popularSeriesHorror,
      popularSeriesSciFi,
      popularSeriesFamily,
      topRatedSeries,
      popularSeriesDrama,
      popularSeriesSciFiDrama,
      popularSeriesComedy,
    ] = await Promise.all([
      providerRes.json(),
      popularRes.json(),
      horrorRes.json(),
      sciFiRes.json(),
      familyRes.json(),
      topRatedRes.json(),
      dramaRes.json(),
      sciFiDramaRes.json(),
      comedyRes.json(),
    ]);

    return {
      props: {
        providerData,
        popularSeries,
        popularSeriesHorror,
        popularSeriesSciFi,
        popularSeriesFamily,
        topRatedSeries,
        popularSeriesDrama,
        popularSeriesSciFiDrama,
        popularSeriesComedy,
        error: null,
      },
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return {
      props: {
        providerData: [],
        popularSeries: [],
        popularSeriesHorror: [],
        popularSeriesSciFi: [],
        popularSeriesFamily: [],
        topRatedSeries: [],
        popularSeriesDrama: [],
        popularSeriesSciFiDrama: [],
        popularSeriesComedy: [],
        error: errorMessage,
      },
    };
  }
};

export default Serie;
