import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WatchedTab = "movies" | "series";

interface CollectionTabsProps {
  activeTab: WatchedTab;
  movieCount: number | null;
  serieCount: number | null;
  onChange: (tab: WatchedTab) => void;
}

const TABS: { id: WatchedTab; label: string }[] = [
  { id: "movies", label: "Filmes" },
  { id: "series", label: "Séries" },
];

const CollectionTabs: React.FC<CollectionTabsProps> = ({
  activeTab,
  movieCount,
  serieCount,
  onChange,
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label="Alternar entre filmes e séries"
      className="flex items-baseline gap-7 border-b border-white/8 sm:gap-10"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        const count = tab.id === "movies" ? movieCount : serieCount;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative min-h-[44px] pb-3 text-2xl font-black tracking-tight transition-colors duration-300 ease-ios sm:text-3xl lg:text-4xl ${
              isActive ? "text-white" : "text-white/30 hover:text-white/60"
            }`}
          >
            {tab.label}
            {count !== null && (
              <span
                className={`ml-2 align-middle text-xs font-extrabold transition-colors duration-300 ${
                  isActive ? "text-white/45" : "text-white/25"
                }`}
              >
                {count}
              </span>
            )}
            {isActive && (
              <motion.span
                layoutId="collection-tab-underline"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 36 }
                }
                className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-linear-to-r from-brand-500 to-brand-400"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CollectionTabs;
