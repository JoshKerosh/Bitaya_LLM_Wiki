import type { WikiGraphData } from "../types/graph";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/$/,
  "",
);

export async function getWikiGraph(): Promise<WikiGraphData> {
  const response = await fetch(`${API_BASE_URL}/api/graph`);
  if (!response.ok) {
    throw new Error("No pudimos cargar el mapa del wiki.");
  }

  return (await response.json()) as WikiGraphData;
}
