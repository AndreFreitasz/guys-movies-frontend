import React from "react";
import Link from "next/link";
import Modal from "../_ui/modal";
import {
  ProvidersState,
  resolvePosterUrl,
  WatchlistItem,
} from "../../interfaces/watchlist/types";

interface ShuffleDialogProps {
  item: WatchlistItem | null;
  providersState: ProvidersState;
  onClose: () => void;
  onShuffleAgain: () => void;
  canShuffleAgain: boolean;
}

const sectionLabelClass =
  "text-xs font-bold uppercase tracking-wide text-white/35";

const ProvidersSection: React.FC<{ providersState: ProvidersState }> = ({
  providersState,
}) => {
  if (providersState.kind === "pending") {
    return (
      <div className="mt-4">
        <p className={sectionLabelClass}>Onde assistir</p>
        <div className="mt-2 flex gap-2">
          <span className="h-6 w-20 animate-pulse rounded-lg bg-white/[0.08]" />
          <span className="h-6 w-16 animate-pulse rounded-lg bg-white/[0.08]" />
        </div>
      </div>
    );
  }

  if (providersState.kind === "unknown") {
    return (
      <p className="mt-4 text-xs text-white/35">
        Não foi possível verificar em quais streamings está disponível.
      </p>
    );
  }

  if (providersState.kind === "empty") {
    return (
      <p className="mt-4 text-xs text-white/35">
        Não está em nenhum streaming de assinatura agora.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <p className={sectionLabelClass}>Onde assistir</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {providersState.providers.map((provider) => (
          <span
            key={provider.id}
            className="rounded-lg bg-white/[0.06] px-2 py-1 text-xs text-white/70"
          >
            {provider.name}
          </span>
        ))}
      </div>
    </div>
  );
};

const ShuffleDialog: React.FC<ShuffleDialogProps> = ({
  item,
  providersState,
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

          <ProvidersSection providersState={providersState} />
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
