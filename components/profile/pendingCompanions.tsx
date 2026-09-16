import React, { useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import SectionHeader from "./sectionHeader";
import Avatar from "./avatar";
import {
  resolveAvatarUrl,
  resolvePosterUrl,
} from "../../interfaces/profile/types";
import { PendingCompanion } from "../../interfaces/profile/watchTogether";

interface PendingCompanionsProps {
  pending: PendingCompanion[];
  onRespond: (
    id: number,
    action: "accept" | "reject",
    rating?: number,
  ) => Promise<void>;
}

const RATINGS = [6, 7, 8, 9, 10];

const PendingCompanions: React.FC<PendingCompanionsProps> = ({
  pending,
  onRespond,
}) => {
  const [rating, setRating] = useState<PendingCompanion | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  if (pending.length === 0 && !rating) return null;

  const respond = async (
    item: PendingCompanion,
    action: "accept" | "reject",
    value?: number,
  ) => {
    setBusyId(item.id);

    try {
      await onRespond(item.id, action, value);
      if (action === "accept") {
        toast.success(
          `Marcado como assistido com ${item.requester.name || item.requester.username}.`,
        );
      }
      setRating(null);
    } catch {
      toast.error("Não foi possível responder. Tente de novo.");
    } finally {
      setBusyId(null);
    }
  };

  if (rating) {
    return (
      <section className="relative mt-10">
        <SectionHeader title="Que nota você dá?" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center"
        >
          <img
            src={resolvePosterUrl(rating.posterPath)}
            alt={rating.title}
            className="h-40 w-28 shrink-0 rounded-2xl border border-white/10 object-cover"
          />

          <div className="min-w-0 flex-1">
            <p className="text-lg font-black tracking-tight text-white">
              {rating.title}
            </p>
            <p className="mt-1 text-sm text-white/45">
              Assistido com {rating.requester.name || rating.requester.username}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {RATINGS.map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => respond(rating, "accept", value)}
                  className="min-h-[44px] min-w-[44px] rounded-full border border-brand-400/50 px-4 text-sm font-bold text-brand-200 transition-colors duration-300 hover:bg-brand-500/20 disabled:opacity-60"
                >
                  {value}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={busyId !== null}
              onClick={() => respond(rating, "accept")}
              className="mt-4 text-xs font-semibold text-white/45 underline-offset-4 transition-colors duration-300 hover:text-white/70 hover:underline disabled:opacity-60"
            >
              Pular e salvar sem nota
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="relative mt-10">
      <SectionHeader
        title="Assistiram com você"
        aside={`${pending.length} para responder`}
      />

      <div className="space-y-2">
        {pending.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
          >
            <img
              src={resolvePosterUrl(item.posterPath)}
              alt={item.title}
              className="h-20 w-14 shrink-0 rounded-xl border border-white/10 object-cover"
            />

            <div className="min-w-0 flex-1 basis-48">
              <p className="truncate text-sm font-bold text-white">
                {item.title}
              </p>
              <span className="mt-1 flex items-center gap-2">
                <Avatar
                  name={item.requester.name}
                  username={item.requester.username}
                  size="sm"
                  imageUrl={resolveAvatarUrl(
                    item.requester.username,
                    item.requester.avatarUpdatedAt,
                  )}
                />
                <span className="truncate text-xs text-white/50">
                  {item.requester.name || item.requester.username} marcou que
                  assistiu com você
                </span>
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={busyId === item.id}
                onClick={() => setRating(item)}
                className="min-h-[44px] rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-5 text-sm font-bold text-white disabled:opacity-60"
              >
                Confirmar
              </button>
              <button
                type="button"
                disabled={busyId === item.id}
                onClick={() => respond(item, "reject")}
                className="min-h-[44px] rounded-full border border-white/15 px-5 text-sm font-semibold text-white/70 transition-colors duration-300 hover:text-white disabled:opacity-60"
              >
                Recusar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PendingCompanions;
