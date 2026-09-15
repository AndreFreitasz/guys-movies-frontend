import React, { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  aside?: ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, aside }) => (
  <div className="mb-4">
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="text-lg font-black tracking-tight text-white">{title}</h2>
      {aside && (
        <span className="text-xs font-semibold text-white/45">{aside}</span>
      )}
    </div>
    <div className="mt-3 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
  </div>
);

export default SectionHeader;
