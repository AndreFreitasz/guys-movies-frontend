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
  const actionClass =
    "flex min-h-[44px] flex-col items-start rounded-2xl px-3 py-2 text-left transition-colors duration-300 hover:bg-white/[0.06] active:scale-95";
  const staticClass = "flex flex-col items-start px-3 py-2 text-left";
  const valueClass = "text-xl font-black text-white sm:text-2xl";
  const labelClass =
    "text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/45";

  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
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
      <div className={staticClass}>
        <span className={valueClass}>
          <AnimatedNumber value={counts.movies} />
        </span>
        <span className={labelClass}>Filmes</span>
      </div>
      <div className={staticClass}>
        <span className={valueClass}>
          <AnimatedNumber value={counts.episodes} />
        </span>
        <span className={labelClass}>Episódios</span>
      </div>
    </div>
  );
};

export default ProfileCounters;
