import React, { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";
import { ProfileCounts } from "../../interfaces/profile/types";

interface ProfileCountersProps {
  counts: ProfileCounts;
  onOpenFollowers: () => void;
  onOpenFollowing: () => void;
}

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const animatedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (!isInView) {
      node.textContent = "0";
      return;
    }

    if (animatedRef.current) {
      node.textContent = String(value);
      return;
    }

    animatedRef.current = true;

    const controls = animate(0, value, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = String(Math.round(latest));
      },
      onComplete: () => {
        node.textContent = String(value);
      },
    });

    return () => controls.stop();
  }, [isInView, value]);

  return <span ref={ref} className="tabular-nums" />;
};

const ProfileCounters: React.FC<ProfileCountersProps> = ({
  counts,
  onOpenFollowers,
  onOpenFollowing,
}) => {
  const cardClass =
    "rounded-2xl border border-white/[0.09] bg-gradient-to-br from-white/[0.07] to-white/[0.02] px-4 py-3.5 text-left backdrop-blur-xl";
  const actionClass = `${cardClass} min-h-[44px] transition-colors duration-300 hover:border-white/20 hover:from-white/[0.11] active:scale-[0.97]`;
  const valueClass = "block text-xl font-black tracking-tight text-white";
  const labelClass =
    "mt-1.5 block text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/45";

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <button type="button" onClick={onOpenFollowers} className={actionClass}>
        <span className={valueClass}>
          <AnimatedNumber value={counts.followers} />
        </span>
        <span className={labelClass}>Seguidores</span>
      </button>
      <button type="button" onClick={onOpenFollowing} className={actionClass}>
        <span className={valueClass}>
          <AnimatedNumber value={counts.following} />
        </span>
        <span className={labelClass}>Seguindo</span>
      </button>
      <div
        className={`${cardClass} border-brand-400/20 from-brand-500/15 to-brand-500/[0.04]`}
      >
        <span className={valueClass}>
          <AnimatedNumber value={counts.movies} />
        </span>
        <span className={labelClass}>Filmes</span>
      </div>
      <div className={cardClass}>
        <span className={valueClass}>
          <AnimatedNumber value={counts.episodes} />
        </span>
        <span className={labelClass}>Episódios</span>
      </div>
    </div>
  );
};

export default ProfileCounters;
