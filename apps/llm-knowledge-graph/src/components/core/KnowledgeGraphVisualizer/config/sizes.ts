// Node size multipliers by type (1x = default base size)
export const NODE_SIZES: Record<string, number> = {
  ResearchGap: 1.6,  // Most prominent — hexagon shape
  Finding:     1.3,  // Diamond shape
  Concept:     1.2,
  Method:      1.2,
  Dataset:     1.1,
  Metric:      1.0,
  Technology:  1.0,
  Default:     1.0,
};

// Base pixel sizes for rendering
export const BASE_SIZES = {
  node2D: 6,                     // Radius base for 2D canvas nodes
  node3D: 5,
  label2D: { min: 2, divisor: 1 },
  label3D: 3,
} as const;

// Link dimensions
export const LINK_SIZES = {
  defaultWidth2D:    1.5,
  highlightedWidth2D: 3,
  gapEdgeWidth2D:    2.5,  // IDENTIFIES_GAP links are thicker
  defaultWidth3D:    1.5,
  highlightedWidth3D: 3.5,
  arrowLength:       4,
  arrowLength3D:     3,
  particleWidth:     4,
  particleCount:     4,
} as const;
