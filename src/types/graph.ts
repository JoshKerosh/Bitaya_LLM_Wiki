export interface WikiGraphNode {
  id: string;
  title: string;
  relPath: string;
  section: string;
  outgoingCount: number;
  backlinkCount: number;
}

export interface WikiGraphEdge {
  source: string;
  target: string;
  weight: number;
}

export interface WikiGraphData {
  nodes: WikiGraphNode[];
  edges: WikiGraphEdge[];
}
