import { useEffect, useMemo, useRef, useState } from "react";
import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import Sigma from "sigma";
import { getWikiGraph } from "../api/graphApi";
import type { WikiGraphData, WikiGraphNode } from "../types/graph";

type GraphView = "wiki" | "rutas";

interface SectionStyle {
  label: string;
  shortLabel: string;
  color: string;
  priority: number;
}

const SECTION_STYLES: Record<string, SectionStyle> = {
  situaciones: {
    label: "Situaciones",
    shortLabel: "Casos",
    color: "#FF2D8D",
    priority: 0,
  },
  instituciones: {
    label: "Instituciones",
    shortLabel: "Ayuda",
    color: "#007A78",
    priority: 1,
  },
  procedimientos: {
    label: "Procedimientos",
    shortLabel: "Pasos",
    color: "#F2A900",
    priority: 2,
  },
  derechos: {
    label: "Derechos",
    shortLabel: "Derechos",
    color: "#7CFF6B",
    priority: 3,
  },
  leyes: {
    label: "Leyes",
    shortLabel: "Leyes",
    color: "#111111",
    priority: 4,
  },
  glosario: {
    label: "Glosario",
    shortLabel: "Términos",
    color: "#6B5BFF",
    priority: 5,
  },
  sources: {
    label: "Fuentes oficiales",
    shortLabel: "Fuentes",
    color: "#81818B",
    priority: 6,
  },
  synthesis: {
    label: "Síntesis",
    shortLabel: "Síntesis",
    color: "#DB2777",
    priority: 7,
  },
};

const DEFAULT_SECTION_STYLE: SectionStyle = {
  label: "Wiki",
  shortLabel: "Wiki",
  color: "#A1A1AA",
  priority: 99,
};
const ROUTE_SECTIONS = new Set([
  "situaciones",
  "instituciones",
  "procedimientos",
  "derechos",
  "leyes",
]);
const SECTION_ANCHORS: Record<string, { x: number; y: number }> = {
  situaciones: { x: -220, y: 10 },
  derechos: { x: -65, y: -150 },
  leyes: { x: 115, y: -160 },
  procedimientos: { x: -10, y: 135 },
  instituciones: { x: 190, y: 85 },
  glosario: { x: -205, y: -175 },
  sources: { x: 225, y: -190 },
  synthesis: { x: 18, y: -245 },
};
const EDGE_COLOR = "rgba(17, 17, 17, 0.11)";
const ACTIVE_EDGE_COLOR = "rgba(255, 45, 141, 0.8)";

const INSTITUTION_LABELS: Record<string, string> = {
  conapam: "CONAPAM",
  conapdis: "CONAPDIS",
  inamu: "INAMU",
  pani: "PANI",
  "poder-judicial": "Poder Judicial",
};

function sectionStyle(section: string) {
  return SECTION_STYLES[section] ?? DEFAULT_SECTION_STYLE;
}

function textWithoutParentheses(text: string) {
  return text.replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
}

function compactText(text: string, maxLength = 34) {
  const clean = textWithoutParentheses(text)
    .replace(/^Cómo\s+/i, "")
    .replace(/^Derecho a\s+(la\s+|el\s+)?/i, "")
    .trim();
  const capitalized = clean ? `${clean[0].toUpperCase()}${clean.slice(1)}` : clean;

  if (capitalized.length <= maxLength) return capitalized;

  const words = capitalized.split(" ");
  let out = "";
  for (const word of words) {
    const next = out ? `${out} ${word}` : word;
    if (next.length > maxLength - 1) break;
    out = next;
  }

  return `${out || capitalized.slice(0, maxLength - 1)}...`;
}

function leafId(node: WikiGraphNode) {
  return node.id.split("/").at(-1) ?? node.id;
}

function lawLabel(node: WikiGraphNode) {
  const number = node.title.match(/Ley\s+(\d{4,})/i)?.[1] ??
    leafId(node).match(/ley-(\d{4,})/)?.[1];
  if (number) return `Ley ${number}`;
  if (node.title.includes("Código")) return compactText(node.title, 25);
  return compactText(node.title, 28);
}

function graphLabel(node: WikiGraphNode) {
  const id = leafId(node);

  if (node.section === "instituciones") {
    return INSTITUTION_LABELS[id] ?? compactText(node.title, 24);
  }
  if (node.section === "leyes") return lawLabel(node);
  if (node.section === "sources") return `Fuente ${lawLabel(node)}`;
  if (node.section === "procedimientos") return compactText(node.title, 30);
  if (node.section === "derechos") return compactText(node.title, 31);
  if (node.section === "situaciones") return compactText(node.title, 33);
  return compactText(node.title, 28);
}

function hashSeed(text: string) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededOffset(text: string, salt: number) {
  const seed = hashSeed(`${salt}:${text}`) % 1000;
  return seed / 1000 - 0.5;
}

function nodeSize(node: WikiGraphNode) {
  const degree = node.backlinkCount + node.outgoingCount;
  const sectionBonus =
    node.section === "situaciones" ? 2.4 : node.section === "sources" ? -1.4 : 0;
  return Math.max(3, Math.min(17, 4.2 + Math.sqrt(degree) * 1.9 + sectionBonus));
}

function filterGraphData(data: WikiGraphData, view: GraphView): WikiGraphData {
  if (view === "wiki") return data;

  const nodes = data.nodes.filter((node) => ROUTE_SECTIONS.has(node.section));
  const visibleIds = new Set(nodes.map((node) => node.id));
  return {
    nodes,
    edges: data.edges.filter(
      (edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target),
    ),
  };
}

function buildGraph(data: WikiGraphData) {
  const graph = new Graph({ type: "undirected" });

  for (const node of data.nodes) {
    const anchor = SECTION_ANCHORS[node.section] ?? { x: 0, y: 0 };
    graph.addNode(node.id, {
      label: graphLabel(node),
      size: nodeSize(node),
      color: sectionStyle(node.section).color,
      section: node.section,
      x: anchor.x + seededOffset(node.id, 1) * 115,
      y: anchor.y + seededOffset(node.id, 2) * 115,
    });
  }

  for (const edge of data.edges) {
    if (!graph.hasNode(edge.source) || !graph.hasNode(edge.target)) continue;

    graph.addUndirectedEdgeWithKey(`${edge.source}<->${edge.target}`, edge.source, edge.target, {
      color: EDGE_COLOR,
      size: Math.min(1.6, 0.28 + edge.weight * 0.09),
    });
  }

  if (graph.order > 1) {
    forceAtlas2.assign(graph, {
      iterations: Math.max(180, Math.min(560, data.nodes.length * 12)),
      settings: {
        barnesHutOptimize: true,
        gravity: 1.25,
        linLogMode: true,
        outboundAttractionDistribution: false,
        scalingRatio: 9,
        slowDown: 5,
        strongGravityMode: true,
      },
    });
  }

  return graph;
}

function connectionIds(nodeId: string | null, data: WikiGraphData) {
  if (!nodeId) return new Set<string>();

  const connected = new Set<string>();
  for (const edge of data.edges) {
    if (edge.source === nodeId) connected.add(edge.target);
    if (edge.target === nodeId) connected.add(edge.source);
  }
  return connected;
}

function sortNodes(nodes: WikiGraphNode[]) {
  return [...nodes].sort((left, right) => {
    const sectionDelta =
      sectionStyle(left.section).priority - sectionStyle(right.section).priority;
    return sectionDelta || graphLabel(left).localeCompare(graphLabel(right), "es");
  });
}

function normalizeSearch(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export default function WikiGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const activeNodeRef = useRef<string | null>(null);
  const [data, setData] = useState<WikiGraphData | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<GraphView>("wiki");
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getWikiGraph()
      .then((graphData) => {
        if (active) setData(graphData);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "No pudimos cargar el mapa.");
      });

    return () => {
      active = false;
    };
  }, []);

  const visibleData = useMemo(
    () => (data ? filterGraphData(data, view) : null),
    [data, view],
  );
  const nodeMap = useMemo(
    () => new Map(visibleData?.nodes.map((node) => [node.id, node]) ?? []),
    [visibleData],
  );
  const sectionRows = useMemo(() => {
    if (!visibleData) return [];

    const countBySection = new Map<string, number>();
    for (const node of visibleData.nodes) {
      countBySection.set(node.section, (countBySection.get(node.section) ?? 0) + 1);
    }

    return [...countBySection].sort(
      ([left], [right]) => sectionStyle(left).priority - sectionStyle(right).priority,
    );
  }, [visibleData]);

  useEffect(() => {
    if (activeNodeId && !nodeMap.has(activeNodeId)) {
      setActiveNodeId(null);
    }
  }, [activeNodeId, nodeMap]);

  useEffect(() => {
    activeNodeRef.current = activeNodeId;
    sigmaRef.current?.refresh();
  }, [activeNodeId]);

  useEffect(() => {
    if (!visibleData || !containerRef.current) return;

    const graph = buildGraph(visibleData);
    const sigma = new Sigma(graph, containerRef.current, {
      allowInvalidContainer: true,
      defaultEdgeColor: EDGE_COLOR,
      labelColor: { color: "#111111" },
      labelFont: "inherit",
      labelRenderedSizeThreshold: 7.6,
      labelSize: 11,
      labelWeight: "600",
      renderEdgeLabels: false,
      renderLabels: true,
      stagePadding: 62,
      edgeReducer(edge, attributes) {
        const activeNode = activeNodeRef.current;
        if (!activeNode) return attributes;

        const source = graph.source(edge);
        const target = graph.target(edge);
        if (source === activeNode || target === activeNode) {
          return { ...attributes, color: ACTIVE_EDGE_COLOR, size: 1.5 };
        }

        return { ...attributes, hidden: true };
      },
      nodeReducer(nodeId, attributes) {
        const activeNode = activeNodeRef.current;
        const sourceNode = nodeMap.get(nodeId);
        if (!activeNode) {
          if (sourceNode?.section === "sources") {
            return { ...attributes, label: "" };
          }
          return attributes;
        }

        if (nodeId === activeNode) {
          return {
            ...attributes,
            forceLabel: true,
            highlighted: true,
            size: (attributes.size ?? 4) * 1.35,
            zIndex: 2,
          };
        }

        if (graph.areNeighbors(activeNode, nodeId)) {
          return { ...attributes, forceLabel: true, zIndex: 1 };
        }

        return { ...attributes, color: "#D4D4D8", label: "", zIndex: 0 };
      },
    });

    sigma.on("clickNode", ({ node }) => {
      setActiveNodeId(node);
      const display = sigma.getNodeDisplayData(node);
      if (display) {
        sigma.getCamera().animate(
          { x: display.x, y: display.y, ratio: 0.44 },
          { duration: 280 },
        );
      }
    });

    sigma.on("clickStage", () => setActiveNodeId(null));
    sigmaRef.current = sigma;

    return () => {
      sigma.kill();
      sigmaRef.current = null;
    };
  }, [nodeMap, visibleData]);

  const activeNode = activeNodeId ? nodeMap.get(activeNodeId) ?? null : null;
  const activeConnections = visibleData
    ? sortNodes(
        [...connectionIds(activeNodeId, visibleData)]
          .map((nodeId) => nodeMap.get(nodeId))
          .filter((node): node is WikiGraphNode => node !== undefined),
      )
    : [];
  const results = visibleData && query.trim()
    ? sortNodes(
        visibleData.nodes.filter((node) =>
          normalizeSearch(`${node.title} ${graphLabel(node)} ${node.section}`).includes(
            normalizeSearch(query.trim()),
          ),
        ),
      ).slice(0, 7)
    : [];

  function focusNode(nodeId: string) {
    setActiveNodeId(nodeId);
    setQuery("");

    const display = sigmaRef.current?.getNodeDisplayData(nodeId);
    if (display) {
      sigmaRef.current?.getCamera().animate(
        { x: display.x, y: display.y, ratio: 0.44 },
        { duration: 280 },
      );
    }
  }

  function resetView() {
    setActiveNodeId(null);
    setQuery("");
    sigmaRef.current?.getCamera().animatedReset({ duration: 280 });
  }

  return (
    <section className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm">
      <header className="grid gap-5 bg-black px-5 py-6 text-white md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <p className="text-xs font-bold uppercase text-[#7CFF6B]">Documentación BITAYA</p>
          <h2 className="mt-2 text-2xl font-semibold">Mapa de ayuda conectado</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/62">
            Situaciones reales unidas con derechos, leyes, pasos e instituciones de Costa Rica.
          </p>
        </div>
        {visibleData && (
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/15 bg-white/15 text-center">
            <div className="min-w-24 bg-black px-4 py-3">
              <strong className="block text-2xl font-semibold">{visibleData.nodes.length}</strong>
              <span className="text-xs text-white/55">Páginas</span>
            </div>
            <div className="min-w-24 bg-black px-4 py-3">
              <strong className="block text-2xl font-semibold">{visibleData.edges.length}</strong>
              <span className="text-xs text-white/55">Vínculos</span>
            </div>
          </div>
        )}
      </header>

      {error && <p className="px-5 py-6 text-sm text-[#FF2D8D]">{error}</p>}

      {!error && (
        <>
          <div className="grid gap-3 border-b border-black/8 px-4 py-4 md:grid-cols-[auto_minmax(16rem,22rem)] md:items-center md:justify-between">
            <div className="inline-flex w-fit rounded-lg bg-[#F4F4F4] p-1 text-sm">
              <button
                type="button"
                onClick={() => setView("wiki")}
                className={`rounded-md px-3 py-2 font-medium transition ${
                  view === "wiki" ? "bg-black text-white" : "text-black/55 hover:text-black"
                }`}
              >
                Wiki completo
              </button>
              <button
                type="button"
                onClick={() => setView("rutas")}
                className={`rounded-md px-3 py-2 font-medium transition ${
                  view === "rutas" ? "bg-[#FF2D8D] text-white" : "text-black/55 hover:text-black"
                }`}
              >
                Rutas de ayuda
              </button>
            </div>

            <div className="relative">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar ley, caso o institución"
                className="w-full rounded-lg border border-black/10 bg-[#F4F4F4] px-3 py-2.5 text-sm text-black outline-none placeholder:text-black/35 focus:border-[#FF2D8D] focus:bg-white"
              />
              {results.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-lg border border-black/10 bg-white shadow-lg">
                  {results.map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => focusNode(node.id)}
                      className="block w-full border-b border-black/5 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-[#F4F4F4]"
                    >
                      <span className="block truncate text-sm font-semibold text-black">
                        {graphLabel(node)}
                      </span>
                      <span className="block truncate text-xs text-black/45">
                        {sectionStyle(node.section).label} · {node.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="relative min-h-[34rem] bg-[#F4F4F4]">
              <button
                type="button"
                onClick={resetView}
                className="absolute bottom-4 left-4 z-10 rounded-md bg-black px-3 py-2 text-xs font-bold text-white transition hover:bg-black/80"
              >
                Ver mapa completo
              </button>

              {!visibleData && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-black/45">
                  Cargando nodos...
                </div>
              )}
              <div ref={containerRef} className="h-[34rem] w-full md:h-[42rem]" />
            </div>

            <aside className="border-t border-black/8 bg-white px-5 py-5 xl:border-l xl:border-t-0">
              {activeNode ? (
                <>
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase text-black/42">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: sectionStyle(activeNode.section).color }}
                    />
                    {sectionStyle(activeNode.section).label}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold text-black">{graphLabel(activeNode)}</h3>
                  {graphLabel(activeNode) !== activeNode.title && (
                    <p className="mt-2 text-sm leading-5 text-black/58">{activeNode.title}</p>
                  )}
                  <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-black/8 bg-black/8 text-center text-xs text-black/55">
                    <div className="bg-white px-2 py-3">
                      <strong className="block text-xl font-semibold text-black">
                        {activeNode.backlinkCount}
                      </strong>
                      Citas entrantes
                    </div>
                    <div className="bg-white px-2 py-3">
                      <strong className="block text-xl font-semibold text-black">
                        {activeNode.outgoingCount}
                      </strong>
                      Citas salientes
                    </div>
                  </div>
                  <p className="mt-6 text-xs font-bold uppercase text-black/38">
                    Conexiones directas
                  </p>
                  <div className="mt-2 max-h-[26rem] space-y-1.5 overflow-auto pr-1">
                    {activeConnections.length === 0 && (
                      <p className="text-sm text-black/50">No hay conexiones visibles en esta vista.</p>
                    )}
                    {activeConnections.map((node) => (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => focusNode(node.id)}
                        className="flex w-full items-start gap-2 rounded-md border border-black/10 px-3 py-2.5 text-left transition hover:border-[#FF2D8D]"
                      >
                        <span
                          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: sectionStyle(node.section).color }}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold leading-5 text-black">
                            {graphLabel(node)}
                          </span>
                          <span className="block text-xs text-black/45">
                            {sectionStyle(node.section).label}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase text-black/38">Capas visibles</p>
                  <div className="mt-3 space-y-2">
                    {sectionRows.map(([section, count]) => (
                      <div
                        key={section}
                        className="flex items-center justify-between gap-3 border-b border-black/6 pb-2 text-sm last:border-b-0"
                      >
                        <span className="inline-flex min-w-0 items-center gap-2 font-medium text-black">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: sectionStyle(section).color }}
                          />
                          <span className="truncate">{sectionStyle(section).label}</span>
                        </span>
                        <span className="font-semibold tabular-nums text-black/42">{count}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-black/8 pt-5">
                    <p className="text-sm leading-6 text-black/58">
                      Seleccioná un nodo para seguir su ruta documental.
                    </p>
                  </div>
                </>
              )}
            </aside>
          </div>
        </>
      )}
    </section>
  );
}
