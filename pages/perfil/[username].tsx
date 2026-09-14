import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../../components/_ui/header";
import Footer from "../../components/_ui/footer";
import ProfileHero from "../../components/profile/profileHero";
import ProfileEditor from "../../components/profile/profileEditor";
import FavoriteShelf from "../../components/profile/favoriteShelf";
import TimelineList from "../../components/profile/timelineList";
import UserListSheet from "../../components/profile/userListSheet";
import { useProfile } from "../../hooks/useProfile";
import { useTimeline } from "../../hooks/useTimeline";
import { useFollow } from "../../hooks/useFollow";
import { useAuth } from "../../hooks/authContext";

const Perfil: React.FC = () => {
  const router = useRouter();
  const { authLoading, isAuthenticated } = useAuth();
  const username =
    typeof router.query.username === "string"
      ? router.query.username
      : undefined;

  const { profile, status, setProfile, reload } = useProfile(
    authLoading || !isAuthenticated ? undefined : username,
  );
  const timeline = useTimeline(
    authLoading || !isAuthenticated ? undefined : username,
  );
  const { toggle, isPending } = useFollow(profile, setProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [sheetMode, setSheetMode] = useState<"followers" | "following" | null>(
    null,
  );

  const pageTitle = profile
    ? `${profile.name || profile.username} - GuysMovies`
    : "Perfil - GuysMovies";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Perfil de usuário no GuysMovies." />
      </Head>
      <Header />

      <main className="relative mx-auto w-full max-w-[1100px] px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        <div className="aurora" />

        {(authLoading ||
          (isAuthenticated && (status === "loading" || status === "idle"))) && (
          <div className="relative space-y-4">
            <div className="skeleton h-28 w-full rounded-3xl" />
            <div className="skeleton h-40 w-full rounded-3xl" />
          </div>
        )}

        {!authLoading && !isAuthenticated && (
          <div className="relative py-20 text-center">
            <h1 className="text-2xl font-black text-white">
              Entre para ver perfis
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Perfis do GuysMovies são visíveis para quem tem conta.
            </p>
          </div>
        )}

        {status === "notFound" && (
          <div className="relative py-20 text-center">
            <h1 className="text-2xl font-black text-white">
              Perfil não encontrado
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Não existe ninguém com o usuário{" "}
              <span className="font-bold text-white">@{username}</span>.
            </p>
            <Link
              href="/busca"
              className="mt-6 inline-flex min-h-[44px] items-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white"
            >
              Voltar para a busca
            </Link>
          </div>
        )}

        {status === "failed" && (
          <div className="relative py-20 text-center">
            <p className="text-sm text-white/60">
              Não foi possível carregar este perfil.
            </p>
            <button
              type="button"
              onClick={reload}
              className="mt-4 min-h-[44px] rounded-full border border-white/15 px-6 text-sm font-semibold text-white"
            >
              Tentar de novo
            </button>
          </div>
        )}

        {status === "ready" && profile && (
          <div className="relative">
            <ProfileHero
              profile={profile}
              isEditing={isEditing}
              isFollowPending={isPending}
              onToggleFollow={toggle}
              onStartEditing={() => setIsEditing(true)}
              onOpenFollowers={() => setSheetMode("followers")}
              onOpenFollowing={() => setSheetMode("following")}
            />

            {isEditing ? (
              <ProfileEditor
                bio={profile.bio}
                favorites={profile.favorites}
                onCancel={() => setIsEditing(false)}
                onSaved={(bio, favorites) => {
                  setProfile((current) =>
                    current ? { ...current, bio, favorites } : current,
                  );
                  setIsEditing(false);
                }}
              />
            ) : (
              <FavoriteShelf
                favorites={profile.favorites}
                isSelf={profile.isSelf}
                onEdit={() => setIsEditing(true)}
              />
            )}

            <section className="mt-12">
              <h2 className="mb-4 text-lg font-black tracking-tight text-white">
                Histórico
              </h2>
              <TimelineList
                events={timeline.events}
                status={timeline.status}
                isLoadingMore={timeline.isLoadingMore}
                hasMore={Boolean(timeline.nextCursor)}
                onLoadMore={timeline.loadMore}
                onRetry={timeline.retry}
                emptyMessage={
                  profile.isSelf
                    ? "Você ainda não marcou nada como assistido. Quando marcar, sua linha do tempo aparece aqui."
                    : "Este perfil ainda não tem nada no histórico."
                }
              />
            </section>
          </div>
        )}
      </main>

      {profile && (
        <UserListSheet
          isOpen={sheetMode !== null}
          onClose={() => setSheetMode(null)}
          username={profile.username}
          mode={sheetMode ?? "followers"}
        />
      )}

      <Footer />
    </>
  );
};

export default Perfil;
