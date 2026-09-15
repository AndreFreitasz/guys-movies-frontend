import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";
import FavoritePicker from "./favoritePicker";
import { authFetch } from "../../utils/authFetch";
import {
  Favorite,
  FavoriteType,
  resolvePosterUrl,
} from "../../interfaces/profile/types";

interface ProfileEditorProps {
  bio: string | null;
  favorites: Favorite[];
  onCancel: () => void;
  onSaved: (bio: string | null, favorites: Favorite[]) => void;
}

const BIO_LIMIT = 280;

interface DraftFavorite {
  type: FavoriteType;
  idTmdb: number;
  title: string;
  posterPath: string | null;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({
  bio,
  favorites,
  onCancel,
  onSaved,
}) => {
  const [draftBio, setDraftBio] = useState(bio ?? "");
  const [draft, setDraft] = useState<DraftFavorite[]>(
    favorites.map((favorite) => ({
      type: favorite.type,
      idTmdb: favorite.idTmdb,
      title: favorite.title,
      posterPath: favorite.posterPath,
    })),
  );
  const [pickerType, setPickerType] = useState<FavoriteType | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const remaining = BIO_LIMIT - draftBio.length;

  const save = async () => {
    setIsSaving(true);

    try {
      const [bioResponse, favoritesResponse] = await Promise.all([
        authFetch(`${process.env.NEXT_PUBLIC_URL_API}/me/profile`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bio: draftBio.trim() || null }),
        }),
        authFetch(`${process.env.NEXT_PUBLIC_URL_API}/me/profile/favorites`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            favorites: draft.map((item) => ({
              type: item.type,
              idTmdb: item.idTmdb,
            })),
          }),
        }),
      ]);

      if (!bioResponse.ok || !favoritesResponse.ok) {
        throw new Error("Falha ao salvar");
      }

      const savedBio = (await bioResponse.json()) as { bio: string | null };
      const savedFavorites = (await favoritesResponse.json()) as Favorite[];

      onSaved(savedBio.bio, savedFavorites);
      toast.success("Perfil atualizado!");
    } catch {
      toast.error("Não foi possível salvar. Tente de novo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <label
        htmlFor="profile-bio"
        className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-indigo-300"
      >
        Descrição
      </label>
      <textarea
        id="profile-bio"
        value={draftBio}
        maxLength={BIO_LIMIT}
        rows={3}
        onChange={(event) => setDraftBio(event.target.value)}
        placeholder="Conte em poucas linhas o que você gosta de assistir."
        className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-indigo-400/60 focus:outline-none"
      />
      <p className="mt-1 text-right text-xs tabular-nums text-white/35">
        {remaining}
      </p>

      <p className="mt-5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-indigo-300">
        Favoritos
      </p>
      <div className="mt-2 grid grid-cols-3 gap-3">
        {(["movie", "serie"] as FavoriteType[]).flatMap((type) => {
          const owned = draft.filter((item) => item.type === type);

          return Array.from({ length: 3 }).map((_, index) => {
            const item = owned[index];

            if (!item) {
              return (
                <button
                  key={`${type}-empty-${index}`}
                  type="button"
                  onClick={() => setPickerType(type)}
                  className="flex aspect-[2/3] w-full items-center justify-center rounded-2xl border-2 border-dashed border-white/15 px-2 text-center text-xs font-semibold text-white/40 hover:border-brand-400/50"
                >
                  {type === "movie" ? "Filme" : "Série"}
                </button>
              );
            }

            return (
              <div key={`${item.type}:${item.idTmdb}`} className="relative">
                <img
                  src={resolvePosterUrl(item.posterPath)}
                  alt={item.title}
                  className="aspect-[2/3] w-full rounded-2xl border border-white/10 object-cover"
                />
                <button
                  type="button"
                  aria-label={`Remover ${item.title}`}
                  onClick={() =>
                    setDraft((current) =>
                      current.filter(
                        (candidate) =>
                          !(
                            candidate.type === item.type &&
                            candidate.idTmdb === item.idTmdb
                          ),
                      ),
                    )
                  }
                  className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/80 text-white"
                >
                  <FaTimes size={11} />
                </button>
              </div>
            );
          });
        })}
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={save}
          disabled={isSaving}
          className="min-h-[44px] flex-1 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 text-sm font-bold text-white disabled:opacity-60"
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="min-h-[44px] rounded-full border border-white/15 px-6 text-sm font-semibold text-white/70"
        >
          Cancelar
        </button>
      </div>

      <FavoritePicker
        isOpen={pickerType !== null}
        type={pickerType ?? "movie"}
        onClose={() => setPickerType(null)}
        excludedKeys={draft.map((item) => `${item.type}:${item.idTmdb}`)}
        onSelect={(option) => {
          setDraft((current) =>
            current.filter((item) => item.type === option.type).length >= 3
              ? current
              : [...current, option],
          );
          setPickerType(null);
        }}
      />
    </div>
  );
};

export default ProfileEditor;
