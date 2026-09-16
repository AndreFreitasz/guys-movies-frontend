export interface PendingCompanion {
  id: number;
  type: "movie" | "serie";
  idTmdb: number;
  seasonNumber: number | null;
  title: string;
  posterPath: string | null;
  watchedAt: string | null;
  requester: {
    username: string;
    name: string;
    avatarUpdatedAt: string | null;
  };
}

export interface CompanionTag {
  type: "movie" | "serie";
  idTmdb: number;
  seasonNumber?: number | null;
  companionUsername: string;
}
