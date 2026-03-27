// Node colors — academic knowledge graph domain
export const NODE_COLORS: Record<string, string> = {
  Method:      '#3b82f6',  // Blue-500
  Concept:     '#8a5cf6',  // Violet-500
  Dataset:     '#10b981',  // Emerald-500
  Metric:      '#be6e63',  // Rose-muted
  Finding:     '#06b6d4',  // Cyan-500
  ResearchGap: '#ec4899',  // Pink-500
  Technology:  '#6366f1',  // Indigo-500
  Default:     '#6b7280',  // Gray-500
};

// Edge colors
export const EDGE_COLORS = {
  default:     '#cbd5e1',  // Slate-300
  highlighted: '#60a5fa',  // Blue-400 — links connected to selected node
  gapEdge:     '#ec4899',  // Pink-500 — IDENTIFIES_GAP relationships
  particle:    '#60a5fa',  // Blue-400 — directional particles
} as const;

// Selection ring color
export const SELECTION_COLORS = {
  ring: '#22c55e',  // Green-500
} as const;

// Background and label colors by theme
export const BACKGROUND_COLORS = {
  dark: {
    graph: '#0a0a0a',
    label: '#ffffff',
  },
  light: {
    graph: '#f8fafc',  // Slate-50
    label: '#1e293b',  // Slate-800
  },
} as const;
