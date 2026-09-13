import React from "react";
import WatchlistCard from "./watchlistCard";
import {
  availabilityKey,
  AvailabilityStatus,
  resolveProvidersState,
  WatchlistItem,
  WatchlistItemType,
  WatchlistProvider,
} from "../../interfaces/watchlist/types";

interface WatchlistGridProps {
  items: WatchlistItem[];
  providersByKey: Map<string, WatchlistProvider[]>;
  availabilityStatus: AvailabilityStatus;
  availabilityFailed: boolean;
  onRemove: (type: WatchlistItemType, idTmdb: number) => void;
}

const WatchlistGrid: React.FC<WatchlistGridProps> = ({
  items,
  providersByKey,
  availabilityStatus,
  availabilityFailed,
  onRemove,
}) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
    {items.map((item) => (
      <WatchlistCard
        key={availabilityKey(item.type, item.idTmdb)}
        item={item}
        providersState={resolveProvidersState(
          availabilityStatus,
          availabilityFailed,
          providersByKey.get(availabilityKey(item.type, item.idTmdb)),
        )}
        onRemove={() => onRemove(item.type, item.idTmdb)}
      />
    ))}
  </div>
);

export default WatchlistGrid;
