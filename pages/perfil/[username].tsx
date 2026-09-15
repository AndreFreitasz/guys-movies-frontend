import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Header from "../../components/_ui/header";
import Footer from "../../components/_ui/footer";
import ProfileCover from "../../components/profile/profileCover";
import ProfileHero from "../../components/profile/profileHero";
import ProfileEditor from "../../components/profile/profileEditor";
import FavoriteShelf from "../../components/profile/favoriteShelf";
import SectionHeader from "../../components/profile/sectionHeader";
import TimelineList from "../../components/profile/timelineList";
import UserListSheet from "../../components/profile/userListSheet";
import CoverPicker from "../../components/profile/coverPicker";
import { useProfile } from "../../hooks/useProfile";
import { useTimeline } from "../../hooks/useTimeline";
import { useFollow } from "../../hooks/useFollow";
import { useAuth } from "../../hooks/authContext";
import { authFetch } from "../../utils/authFetch";
import { Cover, CoverOption } from "../../interfaces/profile/types";

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
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);

  const pageTitle = profile
    ? `${profile.name || profile.username} - GuysMovies`
    : "Perfil - GuysMovies";

  const saveCover = async (cover: CoverOption | null) => {
    setIsCoverPickerOpen(false);

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/me/profile/cover`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cover: cover ? { type: cover.type, idTmdb: cover.idTmdb } : null,
          }),
        },
      );

      if (!response.ok) throw new Error("Falha ao salvar a capa");

      const saved = (await response.json()) as Cover | null;
      setProfile((current) =>
        current ? { ...current, cover: saved } : current,
      );
    } catch {
      toast.error("Não foi possível salvar a capa.");
    }
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Perfil de usuário no GuysMovies." />
      </Head>
      <Header />

      <main className="relative w-full pb-16">
        {(authLoading ||
          (isAuthenticated && (status === "loading" || status === "idle"))) && (
          <div className="mx-auto w-full max-w-[1100px] space-y-4 px-4 pt-24 sm:px-6 lg:px-10">
            <div className="skeleton h-40 w-full rounded-3xl" />
            <div className="skeleton h-28 w-full rounded-3xl" />
          </div>
        )}

        {!authLoading && !isAuthenticated && (
          <div className="mx-auto w-full max-w-[1100px] px-4 py-24 text-center sm:px-6 lg:px-10">
            <h1 className="text-2xl font-black text-white">
              Entre para ver perfis
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Perfis do GuysMovies são visíveis para quem tem conta.
            </p>
          </div>
        )}

        {status === "notFound" && (
          <div className="mx-auto w-full max-w-[1100px] px-4 py-24 text-center sm:px-6 lg:px-10">
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
          <div className="mx-auto w-full max-w-[1100px] px-4 py-24 text-center sm:px-6 lg:px-10">
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
          <>
            <ProfileCover
              cover={profile.cover}
              isSelf={profile.isSelf}
              onChangeCover={() => setIsCoverPickerOpen(true)}
            />

            <div className="relative mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-10">
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
                <SectionHeader title="Histórico" />
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
          </>
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

      {profile?.isSelf && (
        <CoverPicker
          isOpen={isCoverPickerOpen}
          selectedKey={
            profile.cover
              ? `${profile.cover.type}:${profile.cover.idTmdb}`
              : null
          }
          onClose={() => setIsCoverPickerOpen(false)}
          onSelect={saveCover}
          onRemove={() => saveCover(null)}
        />
      )}

      <Footer />
    </>
  );
};

export default Perfil;
