import React from "react";
import Header from "../components/_ui/header";
import Title from "../components/_ui/title";
import { GetServerSideProps } from "next";
import Footer from "../components/_ui/footer";
import { SerieProps } from "../interfaces/series/types";
import SerieCard from "../components/series/seriesCard";
import Carousel from "../components/_ui/carousel";
import Head from "next/head";
import { setPublicCache } from "../utils/httpCache";

const Serie = ({ providerData, error }: SerieProps) => {
  if (error) {
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
      <Head>
        <title>GuysMovies - Séries</title>
      </Head>
      <Header />
      <div className="flex flex-col px-4 sm:px-6 md:px-8 lg:px-40 w-full mt-14">
        {providerData.map((provider) => (
          <div key={provider.provider.id} className="mb-16">
            <div className="flex items-center mb-4">
              <img
                src={provider.provider.logoUrl}
                alt={`Logo da ${provider.provider.name}`}
                width={56}
                height={56}
                loading="lazy"
                decoding="async"
                className="mr-2 w-14 h-14 rounded-lg"
              />
              <Title
                title={`Séries Populares Da ${provider.provider.name}`}
                className="ml-2 text-left"
              />
            </div>
            <Carousel
              slidesToShow={6}
              infinite={true}
              data={provider.series}
              renderItem={(serie) => (
                <SerieCard
                  key={serie.id}
                  id={serie.id}
                  name={serie.name}
                  poster_path={serie.poster_path}
                  overview={serie.overview}
                  vote_average={serie.vote_average}
                />
              )}
            />
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
};

const pickProviderSeries = (providers: any) =>
  Array.isArray(providers)
    ? providers.map((entry: any) => ({
        provider: {
          id: entry.provider?.id,
          name: entry.provider?.name,
          logoUrl: entry.provider?.logoUrl,
        },
        series: (Array.isArray(entry.series) ? entry.series : []).map(
          (serie: any) => ({
            id: serie.id,
            name: serie.name,
            poster_path: serie.poster_path,
            overview: serie.overview,
            vote_average: serie.vote_average,
          }),
        ),
      }))
    : [];

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const [providerRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/series/popularByProviders`),
    ]);

    if (!providerRes.ok) {
      throw new Error(
        "Ocorreu um erro ao buscar os dados, tente novamente mais tarde!",
      );
    }

    const [providerData] = await Promise.all([providerRes.json()]);

    setPublicCache(res, 300, 1800);

    return {
      props: {
        providerData: pickProviderSeries(providerData),
        error: null,
      },
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return {
      props: {
        providerData: [],
        error: errorMessage,
      },
    };
  }
};

export default Serie;
