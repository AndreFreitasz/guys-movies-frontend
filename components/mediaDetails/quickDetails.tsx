import { memo, ReactNode } from "react";

export interface QuickDetailItem {
  label: string;
  value: ReactNode;
}

interface MediaQuickDetailsProps {
  title: string;
  items: QuickDetailItem[];
  extra?: ReactNode;
}

const MediaQuickDetails = memo(
  ({ title, items, extra }: MediaQuickDetailsProps) => {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200">
          {title}
        </h3>
        <div className="mt-5 grid gap-4 text-sm text-white/80">
          {items.map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/5 p-3">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                {item.label}
              </span>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-white">
                {item.value}
              </p>
            </div>
          ))}
          {extra}
        </div>
      </div>
    );
  },
);

MediaQuickDetails.displayName = "MediaQuickDetails";

export default MediaQuickDetails;
