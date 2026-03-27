export interface ForceGraphNode {
  id: string;
  name: string;
  type: string;
  properties: Record<string, any>;
  // Populated by force simulation
  x?: number;
  y?: number;
  z?: number;
  // Computed during data adaptation
  __degree?: number;
}

export interface ForceGraphLink {
  source: string | ForceGraphNode;
  target: string | ForceGraphNode;
  type: string;
}

export interface ForceGraphData {
  nodes: ForceGraphNode[];
  links: ForceGraphLink[];
}

export type GlowLevel = 'critical' | 'high' | false;
