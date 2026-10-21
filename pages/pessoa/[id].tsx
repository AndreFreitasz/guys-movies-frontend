import Head from "next/head";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";

import PersonHero from "../../components/person/personHero";
import { PersonProfile } from "../../interfaces/person/types";

interface PersonPageProps {
  profile: PersonProfile;
}

const PersonPage: NextPage<PersonPageProps> = ({ profile }) => {
  return (
    <>
      <Head>
        <title>{profile.name} - GuysMovies</title>
      </Head>
      <PersonHero profile={profile} />
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
