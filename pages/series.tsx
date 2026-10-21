import React, { useCallback, useMemo } from "react";
import Head from "next/head";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

import SerieCard from "../components/series/seriesCard";
import Carousel from "../components/_ui/carousel";
import MediaHero, { HeroItem } from "../components/_ui/mediaHero";
import CatalogErrorState from "../components/_ui/catalogErrorState";
import { SerieProps } from "../interfaces/series/types";

const posterResponsive = [
  { breakpoint: 1536, settings: { slidesToShow: 6, slidesToScroll: 4 } },
  { breakpoint: 1280, settings: { slidesToShow: 5, slidesToScroll: 4 } },
  { breakpoint: 1024, settings: { slidesToShow: 4, slidesToScroll: 3 } },
  { breakpoint: 768, settings: { slidesToShow: 3, slidesToScroll: 2 } },
  { breakpoint: 540, settings: { slidesToShow: 2, slidesToScroll: 2 } },
];

const Serie = ({ providerData, popularSeries, error }: SerieProps) => {
  const router = useRouter();
  const retry = useCallback(() => router.reload(), [router]);

  const heroItems = useMemo<HeroItem[]>(
    () =>
      popularSeries.map((serie) => ({
        id: serie.id,
        href: `/serie/${serie.id}`,
        title: serie.name,
        overview: serie.overview,
        voteAverage: serie.vote_average,
        backdropPath: serie.backdrop_path,
        posterPath: serie.poster_path,
        date: serie.first_air_date,
        badge: "Em alta",
      })),
    [popularSeries],
  );

  if (error) {
    return (
      <>
        <Head>
          <title>GuysMovies - Séries</title>
        </Head>
        <CatalogErrorState
          title="Não conseguimos carregar as séries"
          message="Tente novamente em alguns instantes."
          onRetry={retry}
        />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>GuysMovies - Séries</title>
        <meta
          name="description"
          content="As séries mais populares de cada plataforma de streaming."
        />
      </Head>

      <main className="relative overflow-x-hidden">
        <MediaHero items={heroItems} />

        <div
          id="catalogo"
          className="relative mx-auto w-full max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-10 xl:px-14"
        >
          <div className="aurora" />

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="relative mb-4"
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-indigo-300">
              Catálogo
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Séries em <span className="brand-text">alta agora</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/45">
              O que está bombando em cada plataforma, reunido em um lugar só.
            </p>
          </motion.header>

          {providerData.map((provider, index) => (
            <motion.section
              key={provider.provider.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.65,
                delay: Math.min(index, 3) * 0.06,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="relative mt-14 lg:mt-20"
            >
              <Carousel
                header={
                  <div className="flex items-center gap-3">
                    <img
                      src={provider.provider.logoUrl}
                      alt={`Logo da ${provider.provider.name}`}
                      width={44}
                      height={44}
                      loading="lazy"
                      decoding="async"
                      className="h-11 w-11 shrink-0 rounded-xl border border-white/10 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-indigo-300">
                        Populares
                      </p>
                      <h2 className="truncate text-lg font-black tracking-tight text-white sm:text-xl lg:text-2xl">
                        {provider.provider.name}
                      </h2>
                    </div>
                  </div>
                }
                slidesToShow={7}
                infinite
                data={provider.series}
                responsive={posterResponsive}
                renderItem={(serie) => (
                  <SerieCard
                    key={serie.id}
                    id={serie.id}
                    name={serie.name}
                    poster_path={serie.poster_path}
                    overview={serie.overview}
                    vote_average={serie.vote_average}
                    first_air_date={serie.first_air_date}
                  />
                )}
              />
            </motion.section>
          ))}
        </div>
      </main>
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
            first_air_date: serie.first_air_date ?? null,
          }),
        ),
      }))
    : [];

const HERO_SERIES_LIMIT = 5;

const pickHeroSeries = (series: any) =>
  Array.isArray(series)
    ? series.slice(0, HERO_SERIES_LIMIT).map((serie: any) => ({
        id: serie.id,
        name: serie.name,
        overview: serie.overview ?? "",
        vote_average: serie.vote_average ?? 0,
        backdrop_path: serie.backdrop_path ?? null,
        poster_path: serie.poster_path ?? null,
        first_air_date: serie.first_air_date ?? null,
      }))
    : [];

const CATALOG_REVALIDATE_SECONDS = 300;
const CATALOG_RETRY_SECONDS = 30;

export const getStaticProps: GetStaticProps = async () => {
  try {
    const [providerRes, popularRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/series/popularByProviders`),
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/series/popular`),
    ]);

    if (!providerRes.ok || !popularRes.ok) {
      throw new Error(
        "Ocorreu um erro ao buscar os dados, tente novamente mais tarde!",
      );
    }

    const [providerData, popularSeries] = await Promise.all([
      providerRes.json(),
      popularRes.json(),
    ]);

    return {
      revalidate: CATALOG_REVALIDATE_SECONDS,
      props: {
        providerData: pickProviderSeries(providerData),
        popularSeries: pickHeroSeries(popularSeries),
        error: null,
      },
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return {
      revalidate: CATALOG_RETRY_SECONDS,
      props: {
        providerData: [],
        popularSeries: [],
        error: errorMessage,
      },
    };
  }
};

export default Serie;
