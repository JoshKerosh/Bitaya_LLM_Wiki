const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/$/,
  "",
);

export interface HealthStatus {
  ok: boolean;
  pages?: number;
  cli?: string;
  model?: string;
  cliReady?: boolean;
  cliVersion?: string | null;
  cliError?: string | null;
}

export async function fetchHealth(): Promise<HealthStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) {
      return { ok: false };
    }
    return (await response.json()) as HealthStatus;
  } catch {
    return { ok: false };
  }
}
