import { useEffect, useState } from "react";
import { fetchHealth, type HealthStatus } from "../api/healthApi";

export default function StatusBadge() {
  const [status, setStatus] = useState<HealthStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const s = await fetchHealth();
      if (!cancelled) setStatus(s);
    };
    load();
    const id = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!status) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-500">
        <span className="h-2 w-2 animate-pulse rounded-full bg-slate-300" />
        Conectando…
      </div>
    );
  }

  const allOk = status.ok && status.cliReady !== false;
  const dotColor = allOk
    ? "bg-emerald-500"
    : status.ok
      ? "bg-amber-500"
      : "bg-red-500";
  const label = allOk
    ? `${status.pages ?? 0} páginas · ${status.model ?? "claude"} listo`
    : status.ok
      ? `Backend ok · Claude CLI no responde`
      : "Backend offline";

  const tooltip = !allOk
    ? status.cliError ??
      "Instalá Claude Code: npm install -g @anthropic-ai/claude-code && claude"
    : `Backend OK · CLI ${status.cliVersion ?? "?"} · ${status.pages ?? 0} páginas indexadas`;

  return (
    <div
      title={tooltip}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
        allOk
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : status.ok
            ? "border-amber-200 bg-amber-50 text-amber-900"
            : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
      {label}
    </div>
  );
}
