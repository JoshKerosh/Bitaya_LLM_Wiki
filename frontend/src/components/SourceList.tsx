import type { ChatSource } from "../types/chat";

interface SourceListProps {
  sources?: ChatSource[];
}

export default function SourceList({ sources }: SourceListProps) {
  if (!sources?.length) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-slate-200/80 pt-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Fuentes
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {sources.map((source) => (
          <a
            key={`${source.title}-${source.url}`}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
          >
            {source.title}
          </a>
        ))}
      </div>
    </div>
  );
}
