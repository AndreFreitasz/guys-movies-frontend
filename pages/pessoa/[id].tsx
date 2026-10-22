import Head from "next/head";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useState } from "react";

import CareerHighlights from "../../components/person/careerHighlights";
import CreditList from "../../components/person/creditList";
import DepartmentTabs from "../../components/person/departmentTabs";
import GenreBreakdown from "../../components/person/genreBreakdown";
import PersonHero from "../../components/person/personHero";
import { PersonProfile } from "../../interfaces/person/types";
import {
  CreditSort,
  MediaFilter,
  usePersonCredits,
} from "../../hooks/usePersonCredits";

interface PersonPageProps {
  profile: PersonProfile;
}

const MEDIA_OPTIONS: { value: MediaFilter; label: string }[] = [
  { value: "all", label: "Tudo" },
  { value: "movie", label: "Filmes" },
  { value: "tv", label: "Séries" },
];

const SORT_OPTIONS: { value: CreditSort; label: string }[] = [
  { value: "relevance", label: "Relevância" },
  { value: "year", label: "Ano" },
  { value: "rating", label: "Nota" },
];

const PersonPage: NextPage<PersonPageProps> = ({ profile }) => {
  const [activeGenre, setActiveGenre] = useState<number | null>(null);

  const credits = usePersonCredits({
    personId: profile.id,
    initialPage: profile.credits,
    defaultDepartment: profile.defaultDepartment,
  });

  const handleGenreChange = (genreId: number | null) => {
    setActiveGenre(genreId);
    credits.setGenre(genreId);
  };

  const activeGenreName =
    profile.genres.find((genre) => genre.id === activeGenre)?.name ?? null;

  return (
    <>
      <Head>
        <title>{profile.name} - GuysMovies</title>
      </Head>
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.34),#05050c_60%)] px-4 py-12 sm:px-8 lg:py-16">
        <PersonHero profile={profile} />
        <CareerHighlights credits={profile.highlights} />
      </section>
      <div className="px-4 pb-12 sm:px-8 lg:pb-16">
        <GenreBreakdown
          genres={profile.genres}
          activeGenre={activeGenre}
          onSelect={handleGenreChange}
        />

        <section className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
            Filmografia
          </h2>

          <div className="mt-4">
            <DepartmentTabs
              departments={profile.departments}
              active={credits.department}
              onChange={credits.setDepartment}
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="hide-scrollbar flex gap-2 overflow-x-auto">
              {MEDIA_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={credits.media === option.value}
                  onClick={() => credits.setMedia(option.value)}
                  className={`min-h-[44px] shrink-0 rounded-full border px-4 text-sm font-medium transition ${
                    credits.media === option.value
                      ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-100"
                      : "border-white/10 bg-white/3 text-white/60 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="hide-scrollbar flex gap-2 overflow-x-auto">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={credits.sort === option.value}
                  onClick={() => credits.setSort(option.value)}
                  className={`min-h-[44px] shrink-0 rounded-full border px-4 text-sm font-medium transition ${
                    credits.sort === option.value
                      ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-100"
                      : "border-white/10 bg-white/3 text-white/60 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <CreditList
            items={credits.items}
            status={credits.status}
            hasMore={credits.hasMore}
            activeGenreName={activeGenreName}
            onLoadMore={credits.loadMore}
            onClearGenre={() => handleGenreChange(null)}
            onRetry={credits.retry}
          />
        </section>
      </div>
    </>
  );
};

const PERSON_REVALIDATE_SECONDS = 86400;
const PERSON_RETRY_SECONDS = 60;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: "blocking",
});

export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params!;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL_API}/person/${id}`,
    );

    if (!response.ok) {
      return { notFound: true, revalidate: PERSON_RETRY_SECONDS };
    }

    const profile = await response.json();

    if (!profile?.id) {
      return { notFound: true, revalidate: PERSON_RETRY_SECONDS };
    }

    return {
      revalidate: PERSON_REVALIDATE_SECONDS,
      props: { profile },
    };
  } catch {
    return { notFound: true, revalidate: PERSON_RETRY_SECONDS };
  }
};

export default PersonPage;
