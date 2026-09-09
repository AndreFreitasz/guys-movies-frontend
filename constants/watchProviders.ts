export interface WatchProviderOption {
  id: number;
  name: string;
}

export const WATCH_PROVIDERS: WatchProviderOption[] = [
  { id: 8, name: "Netflix" },
  { id: 1899, name: "Max" },
  { id: 119, name: "Prime Video" },
  { id: 337, name: "Disney+" },
  { id: 350, name: "Apple TV+" },
  { id: 307, name: "Globoplay" },
  { id: 531, name: "Paramount+" },
];

export type WatchSourceValue = "streaming" | "cinema" | "physical" | "other";

export const WATCH_SOURCES_UI: { value: WatchSourceValue; label: string }[] = [
  { value: "cinema", label: "Cinema" },
  { value: "physical", label: "Mídia física" },
  { value: "other", label: "Outro" },
];
