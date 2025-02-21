import React, { useState, useEffect } from "react";
import Header from "../components/_ui/header";
import Title from "../components/_ui/title";
import { GetServerSideProps } from "next";
import Footer from "../components/_ui/footer";
import { SerieProps } from "../interfaces/series/types";
import SerieCard from "../components/series/seriesCard";
import Carousel from "../components/_ui/carousel";
import Head from "next/head";

const Serie = ({ providerData, error }: SerieProps) => {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setShowError(true);
    }
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
              renderItem={(serie) => <SerieCard key={serie.id} {...serie} />}
            />
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
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

    return {
      props: {
        providerData,
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
