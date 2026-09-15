import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { FaPen } from "react-icons/fa";
import Avatar from "./avatar";
import { authFetch } from "../../utils/authFetch";
import { resolveAvatarUrl } from "../../interfaces/profile/types";

export const MAX_AVATAR_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

interface EditableAvatarProps {
  name: string;
  username: string;
  avatarUpdatedAt: string | null;
  isSelf: boolean;
  onChanged: (avatarUpdatedAt: string | null) => void;
}

const EditableAvatar: React.FC<EditableAvatarProps> = ({
  name,
  username,
  avatarUpdatedAt,
  isSelf,
  onChanged,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const imageUrl = preview ?? resolveAvatarUrl(username, avatarUpdatedAt);

  const upload = async (file: File) => {
    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      toast.error("Use uma imagem JPG, PNG, WebP ou AVIF.");
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("A imagem passa de 8MB. Escolha uma menor.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setIsUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/me/avatar`,
        { method: "POST", body },
      );

      if (!response.ok) throw new Error("Falha ao enviar a foto");

      const saved = (await response.json()) as { avatarUpdatedAt: string };
      onChanged(saved.avatarUpdatedAt);
      toast.success("Foto atualizada!");
    } catch {
      setPreview(null);
      toast.error("Não foi possível enviar a foto. Tente de novo.");
    } finally {
      URL.revokeObjectURL(localPreview);
      setIsUploading(false);
    }
  };

  if (!isSelf) {
    return (
      <Avatar name={name} username={username} size="xl" imageUrl={imageUrl} />
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        aria-label="Trocar foto do perfil"
        className="group relative block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05050c]"
      >
        <span
          className={`block overflow-hidden rounded-full transition-opacity duration-300 ease-ios group-hover:opacity-40 group-focus-visible:opacity-40 ${
            isUploading ? "opacity-40" : ""
          }`}
        >
          <Avatar
            name={name}
            username={username}
            size="xl"
            imageUrl={imageUrl}
          />
        </span>

        <span className="pointer-events-none absolute inset-0 hidden items-center justify-center opacity-0 transition-opacity duration-300 ease-ios group-hover:opacity-100 group-focus-visible:opacity-100 sm:flex">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
            <FaPen size={16} />
          </span>
        </span>

        <span className="pointer-events-none absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white ring-4 ring-[#05050c] sm:hidden">
          <FaPen size={12} />
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_AVATAR_TYPES.join(",")}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) upload(file);
        }}
      />
    </>
  );
};

export default EditableAvatar;
