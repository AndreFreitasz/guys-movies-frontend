import React from "react";
import WatchlistCard from "./watchlistCard";
import {
  availabilityKey,
  WatchlistItem,
  WatchlistItemType,
  WatchlistProvider,
} from "../../interfaces/watchlist/types";

interface WatchlistGridProps {
  items: WatchlistItem[];
  providersByKey: Map<string, WatchlistProvider[]>;
  isAvailabilityLoading: boolean;
  onRemove: (type: WatchlistItemType, idTmdb: number) => void;
}

const WatchlistGrid: React.FC<WatchlistGridProps> = ({
  items,
  providersByKey,
  isAvailabilityLoading,
  onRemove,
}) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
    {items.map((item) => (
      <WatchlistCard
        key={availabilityKey(item.type, item.idTmdb)}
        item={item}
        providers={providersByKey.get(availabilityKey(item.type, item.idTmdb))}
        isAvailabilityLoading={isAvailabilityLoading}
        onRemove={() => onRemove(item.type, item.idTmdb)}
      />
    ))}
  </div>
);

export default WatchlistGrid;
