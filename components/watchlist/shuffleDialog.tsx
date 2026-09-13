import React from "react";
import Link from "next/link";
import Modal from "../_ui/modal";
import {
  resolvePosterUrl,
  WatchlistItem,
  WatchlistProvider,
} from "../../interfaces/watchlist/types";

interface ShuffleDialogProps {
  item: WatchlistItem | null;
  providers: WatchlistProvider[];
  onClose: () => void;
  onShuffleAgain: () => void;
  canShuffleAgain: boolean;
}

const ShuffleDialog: React.FC<ShuffleDialogProps> = ({
  item,
  providers,
  onClose,
  onShuffleAgain,
  canShuffleAgain,
}) => {
  if (!item) return null;

  const href =
    item.type === "movie" ? `/movie/${item.idTmdb}` : `/serie/${item.idTmdb}`;

  return (
    <Modal isOpen onClose={onClose} title="A escolha da noite">
      <div className="flex gap-4">
        <img
          src={resolvePosterUrl(item.posterPath)}
          alt={item.title}
          className="h-40 w-auto rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-black text-white">{item.title}</p>
          {item.releaseDate && (
            <p className="text-sm text-white/40">
              {item.releaseDate.slice(0, 4)}
            </p>
          )}

          {providers.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-white/35">
                Onde assistir
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {providers.map((provider) => (
                  <span
                    key={provider.id}
                    className="rounded-lg bg-white/[0.06] px-2 py-1 text-xs text-white/70"
                  >
                    {provider.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-white/35">
              Não está em nenhum streaming de assinatura agora.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Link
          href={href}
          className="flex-1 rounded-2xl bg-white px-4 py-3 text-center text-sm font-bold text-[#05050c] transition-colors hover:bg-white/90"
        >
          Ver detalhes
        </Link>
        <button
          type="button"
          onClick={onShuffleAgain}
          disabled={!canShuffleAgain}
          className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-white/70 transition-colors hover:bg-white/5 disabled:opacity-40"
        >
          Sortear de novo
        </button>
      </div>
    </Modal>
  );
};

export default ShuffleDialog;
