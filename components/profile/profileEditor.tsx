import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { FaCamera, FaTimes } from "react-icons/fa";
import FavoritePicker from "./favoritePicker";
import Avatar from "./avatar";
import { authFetch } from "../../utils/authFetch";
import {
  Favorite,
  FavoriteType,
  resolveAvatarUrl,
  resolvePosterUrl,
} from "../../interfaces/profile/types";

export interface SavedIdentity {
  bio: string | null;
  name: string;
  username: string;
}

interface ProfileEditorProps {
  bio: string | null;
  name: string;
  username: string;
  avatarUpdatedAt: string | null;
  favorites: Favorite[];
  onCancel: () => void;
  onSaved: (identity: SavedIdentity, favorites: Favorite[]) => void;
  onAvatarChanged: (avatarUpdatedAt: string | null) => void;
}

const MAX_AVATAR_BYTES = 8 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const BIO_LIMIT = 280;
const NAME_LIMIT = 120;
const USERNAME_LIMIT = 40;
const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/;

interface DraftFavorite {
  type: FavoriteType;
  idTmdb: number;
  title: string;
  posterPath: string | null;
}

const firstMessage = (payload: unknown): string | null => {
  const message = (payload as { message?: string | string[] })?.message;
  if (Array.isArray(message)) return message[0] ?? null;
  return typeof message === "string" ? message : null;
};

const ProfileEditor: React.FC<ProfileEditorProps> = ({
  bio,
  name,
  username,
  avatarUpdatedAt,
  favorites,
  onCancel,
  onSaved,
  onAvatarChanged,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const savedAvatarUrl = resolveAvatarUrl(username, avatarUpdatedAt);
  const shownAvatarUrl = avatarPreview ?? savedAvatarUrl;

  const uploadAvatar = async (file: File) => {
    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      toast.error("Use uma imagem JPG, PNG, WebP ou AVIF.");
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("A imagem passa de 8MB. Escolha uma menor.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);
    setIsUploadingAvatar(true);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/me/avatar`,
        { method: "POST", body },
      );

      if (!response.ok) throw new Error("Falha ao enviar a foto");

      const saved = (await response.json()) as { avatarUpdatedAt: string };
      onAvatarChanged(saved.avatarUpdatedAt);
      toast.success("Foto atualizada!");
    } catch {
      setAvatarPreview(null);
      toast.error("Não foi possível enviar a foto. Tente de novo.");
    } finally {
      URL.revokeObjectURL(localPreview);
      setIsUploadingAvatar(false);
    }
  };

  const removeAvatar = async () => {
    setIsUploadingAvatar(true);

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/me/avatar`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Falha ao remover a foto");

      setAvatarPreview(null);
      onAvatarChanged(null);
      toast.success("Foto removida.");
    } catch {
      toast.error("Não foi possível remover a foto.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const [draftBio, setDraftBio] = useState(bio ?? "");
  const [draftName, setDraftName] = useState(name);
  const [draftUsername, setDraftUsername] = useState(username);
  const [nameError, setNameError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
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

  const validate = (): boolean => {
    const trimmedName = draftName.trim();
    const trimmedUsername = draftUsername.trim();
    let isValid = true;

    setNameError(null);
    setUsernameError(null);

    if (trimmedName.length === 0) {
      setNameError("Escreva um nome.");
      isValid = false;
    }

    if (trimmedUsername.length < 3) {
      setUsernameError("Use ao menos 3 caracteres.");
      isValid = false;
    } else if (!USERNAME_PATTERN.test(trimmedUsername)) {
      setUsernameError("Use apenas letras, números, ponto, hífen e underline.");
      isValid = false;
    }

    return isValid;
  };

  const save = async () => {
    if (!validate()) return;

    setIsSaving(true);

    try {
      const profileResponse = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/me/profile`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bio: draftBio.trim() || null,
            name: draftName.trim(),
            username: draftUsername.trim(),
          }),
        },
      );

      if (profileResponse.status === 409) {
        setUsernameError("Esse nome de usuário já está em uso.");
        return;
      }

      if (profileResponse.status === 400) {
        const detail = await profileResponse.json().catch(() => null);
        setUsernameError(firstMessage(detail) ?? "Confira os campos.");
        return;
      }

      if (!profileResponse.ok) throw new Error("Falha ao salvar");

      const favoritesResponse = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/me/profile/favorites`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            favorites: draft.map((item) => ({
              type: item.type,
              idTmdb: item.idTmdb,
            })),
          }),
        },
      );

      if (!favoritesResponse.ok) throw new Error("Falha ao salvar");

      const saved = (await profileResponse.json()) as Partial<SavedIdentity>;
      const savedFavorites = (await favoritesResponse.json()) as Favorite[];

      onSaved(
        {
          bio: saved.bio ?? null,
          name: saved.name ?? draftName.trim(),
          username: saved.username ?? draftUsername.trim(),
        },
        savedFavorites,
      );
      toast.success("Perfil atualizado!");
    } catch {
      toast.error("Não foi possível salvar. Tente de novo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-300">
        Foto
      </p>
      <div className="mb-5 mt-2 flex items-center gap-4">
        <span
          className={`relative shrink-0 rounded-full ring-2 ring-white/10 transition-opacity duration-300 ${
            isUploadingAvatar ? "opacity-60" : ""
          }`}
        >
          <Avatar
            name={name}
            username={username}
            size="lg"
            imageUrl={shownAvatarUrl}
          />
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-[44px] items-center gap-2 rounded-full border border-brand-400/50 px-5 text-sm font-bold text-brand-200 transition-colors duration-300 hover:bg-brand-500/15 disabled:opacity-60"
            >
              <FaCamera size={12} />
              {shownAvatarUrl ? "Trocar foto" : "Enviar foto"}
            </button>
            {savedAvatarUrl && (
              <button
                type="button"
                disabled={isUploadingAvatar}
                onClick={removeAvatar}
                className="min-h-[44px] rounded-full border border-white/15 px-5 text-sm font-semibold text-white/70 transition-colors duration-300 hover:text-white disabled:opacity-60"
              >
                Remover
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-white/35">
            JPG, PNG, WebP ou AVIF, até 8MB. Recortamos o centro em um quadrado.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_AVATAR_TYPES.join(",")}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) uploadAvatar(file);
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="profile-name"
            className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-300"
          >
            Nome
          </label>
          <input
            id="profile-name"
            type="text"
            value={draftName}
            maxLength={NAME_LIMIT}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Como você quer ser chamado"
            aria-invalid={nameError !== null}
            aria-describedby={nameError ? "profile-name-error" : undefined}
            className={`mt-2 w-full rounded-2xl border bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none ${
              nameError
                ? "border-rose-400/70"
                : "border-white/10 focus:border-brand-400/60"
            }`}
          />
          {nameError && (
            <p id="profile-name-error" className="mt-1.5 text-xs text-rose-300">
              {nameError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="profile-username"
            className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-300"
          >
            Nome de usuário
          </label>
          <div className="relative mt-2">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-white/35">
              @
            </span>
            <input
              id="profile-username"
              type="text"
              value={draftUsername}
              maxLength={USERNAME_LIMIT}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              onChange={(event) => {
                setDraftUsername(event.target.value);
                setUsernameError(null);
              }}
              placeholder="seu.usuario"
              aria-invalid={usernameError !== null}
              aria-describedby={
                usernameError
                  ? "profile-username-error"
                  : "profile-username-help"
              }
              className={`w-full rounded-2xl border bg-white/[0.04] py-3 pl-7 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none ${
                usernameError
                  ? "border-rose-400/70"
                  : "border-white/10 focus:border-brand-400/60"
              }`}
            />
          </div>
          {usernameError ? (
            <p
              id="profile-username-error"
              className="mt-1.5 text-xs text-rose-300"
            >
              {usernameError}
            </p>
          ) : (
            <p
              id="profile-username-help"
              className="mt-1.5 text-xs text-white/35"
            >
              Muda o endereço do seu perfil.
            </p>
          )}
        </div>
      </div>

      <label
        htmlFor="profile-bio"
        className="mt-5 block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-300"
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
        className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-brand-400/60 focus:outline-none"
      />
      <p className="mt-1 text-right text-xs tabular-nums text-white/35">
        {remaining}
      </p>

      <p className="mt-5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-300">
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
