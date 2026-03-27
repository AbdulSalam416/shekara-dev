# Graph Migration Roadmap: Cytoscape → react-force-graph

## Purpose

This document is the **single source of truth** for migrating the graph visualization in `shekara-dev/apps/llm-knowledge-graph` from Cytoscape.js to `react-force-graph`, using the implementation in `redamon/webapp/src/app/graph/` as the reference. Any LLM or developer continuing this work must read this document in full before making changes.

---

## Context

### Source (Current State)
- **Location**: `shekara-dev/apps/llm-knowledge-graph/src/`
- **Graph Library**: Cytoscape.js + cytoscape-cola (force-directed layout)
- **State Management**: Zustand with immer + localStorage persistence
- **Main Graph Component**: `src/components/core/KnowledgeGraphVisualizer/KnowledgeGraph.tsx` (~771 lines)
- **Domain**: Academic research — nodes represent Methods, Concepts, Datasets, Metrics, Findings, ResearchGaps, Technologies
- **Node Types**: 7
- **Features**: View modes (all/gaps-only/focus/centrality), search, centrality analysis panel, node info drawer, history, export

### Target Reference (Pattern to Adopt)
- **Location**: `redamon/webapp/src/app/graph/`
- **Graph Libraries**: `react-force-graph-2d` v1.26.0 + `react-force-graph-3d` v1.25.0
- **State Management**: React Query + local component state
- **Main Components**: `GraphCanvas2D.tsx`, `GraphCanvas3D.tsx`
- **Domain**: Security threat intelligence (different domain, same rendering pattern)
- **Rendering**: Canvas (2D) / Three.js (3D), continuous force simulation, animated glow/pulse effects, directional particles on edges

### What We Are NOT Changing
- The **domain model** stays academic (Node/Relationship types remain the same)
- The **Zustand store** is kept (data fetching, graph history, centrality analysis are unaffected)
- The **API services** are untouched (`graphExtractionService`, `centralityAnalysisService`, `apiClient`)
- The **sidebar, header, input, chat, history** components are untouched
- The **page layout** (`src/app/page.tsx`) is minimally changed

### What We ARE Replacing
- `KnowledgeGraph.tsx` — the Cytoscape-based graph component is fully rewritten
- `react-cytoscapejs`, `cytoscape`, `cytoscape-cola` dependencies are removed
- New dependencies added: `react-force-graph-2d`, `react-force-graph-3d`, `d3-force`

---

## Architecture of the New Graph Module

The new graph module lives at `src/components/core/KnowledgeGraphVisualizer/` and mirrors the structure of `redamon/webapp/src/app/graph/`:

```
src/components/core/KnowledgeGraphVisualizer/
├── index.ts                        # Re-exports KnowledgeGraph
├── KnowledgeGraph.tsx              # Top-level wrapper (layout, toolbar, panels)
├── config/
│   ├── colors.ts                   # Node color map + edge colors
│   ├── sizes.ts                    # Node sizes (base + per-type)
│   ├── graph.ts                    # Force simulation config + animation config
│   └── index.ts
├── types/
│   ├── graph.ts                    # ForceGraphNode, ForceGraphLink, ForceGraphData
│   └── index.ts
├── utils/
│   ├── nodeHelpers.ts              # getNodeColor, getNodeSize, getGlowLevel
│   ├── linkHelpers.ts              # getLinkColor, getLinkWidth, particle helpers
│   ├── dataAdapter.ts              # Converts KnowledgeGraph → ForceGraphData
│   └── index.ts
├── hooks/
│   ├── useAnimationFrame.ts        # requestAnimationFrame wrapper
│   ├── useNodeSelection.ts         # Selected node state + highlight logic
│   ├── useDimensions.ts            # Responsive canvas sizing
│   └── index.ts
└── components/
    ├── GraphCanvas/
    │   ├── GraphCanvas.tsx         # Routes to 2D or 3D canvas
    │   ├── GraphCanvas2D.tsx       # react-force-graph-2d implementation
    │   ├── GraphCanvas3D.tsx       # react-force-graph-3d implementation
    │   └── index.ts
    ├── GraphToolbar.tsx            # Zoom controls, 2D/3D toggle, search, view mode
    ├── NodeInfoPanel.tsx           # Right-side selected node info (ported from current)
    ├── GraphLegend.tsx             # Bottom-left node type legend with toggles
    └── CentralityPanel.tsx        # Centrality analysis panel (currently in KeyInfluencerAnalysis)
```

---

## Data Model Mapping

### Current Types (`src/lib/types.ts`) — UNCHANGED
```typescript
interface Node {
  id: string;
  type: string;
  label: string;
  properties: { frequency?: number; importance?: string; paperId?: string; [key: string]: any };
}

interface Relationship {
  source: string;
  target: string;
  type: string;
  properties: { confidence?: number; evidence?: string; [key: string]: any };
}

interface KnowledgeGraph {
  nodes: Node[];
  relationships: Relationship[];
  metadata?: { num_papers?: number };
}
```

### New Force-Graph Types (`types/graph.ts`) — NEW
```typescript
interface ForceGraphNode {
  id: string;
  name: string;        // = Node.label
  type: string;        // = Node.type
  properties: Record<string, unknown>;  // = Node.properties
  x?: number;          // managed by force simulation
  y?: number;
  z?: number;
}

interface ForceGraphLink {
  source: string | ForceGraphNode;
  target: string | ForceGraphNode;
  type: string;        // = Relationship.type
}

interface ForceGraphData {
  nodes: ForceGraphNode[];
  links: ForceGraphLink[];
}
```

### Data Adapter (`utils/dataAdapter.ts`) — NEW
A pure function `adaptToForceGraph(kg: KnowledgeGraph): ForceGraphData` that:
1. Maps each `Node` → `ForceGraphNode` (rename `label` to `name`)
2. Maps each `Relationship` → `ForceGraphLink`
3. Filters out orphan nodes if needed for view modes (gaps-only, focus, centrality)

---

## Node Styling

### Color Map (`config/colors.ts`)
Port the academic domain colors from the current `nodeColors` in `KnowledgeGraph.tsx`:

```typescript
export const NODE_COLORS: Record<string, string> = {
  Method:      '#3b82f6',   // Blue-500
  Concept:     '#8a5cf6',   // Violet-500
  Dataset:     '#10b981',   // Emerald-500
  Metric:      '#be6e63',   // Rose-muted
  Finding:     '#06b6d4',   // Cyan-500
  ResearchGap: '#ec4899',   // Pink-500
  Technology:  '#6366f1',   // Indigo-500
  Default:     '#6b7280',   // Gray-500
};

export const EDGE_COLORS = {
  default:     '#cbd5e1',   // Slate-300
  highlighted: '#60a5fa',   // Blue-400
  gapEdge:     '#ec4899',   // Pink-500
  particle:    '#60a5fa',
};
```

### Size Map (`config/sizes.ts`)
```typescript
export const NODE_SIZES: Record<string, number> = {
  ResearchGap: 1.6,   // Larger for prominence
  Finding:     1.3,
  Concept:     1.2,
  Method:      1.2,
  Dataset:     1.1,
  Metric:      1.0,
  Technology:  1.0,
  Default:     1.0,
};

export const BASE_SIZES = {
  node2D: 6,
  node3D: 5,
};
```

Dynamic sizing based on node degree (number of connections) mirrors the current behavior:
```typescript
// In nodeHelpers.ts
export function getNodeSize(node: ForceGraphNode, degree: number, base: number): number {
  const typeMultiplier = NODE_SIZES[node.type] ?? NODE_SIZES.Default;
  return Math.min(18, base * typeMultiplier + degree * 0.5);
}
```

### Shapes
- **ResearchGap**: Hexagon (same as current + same as attack chain nodes in reference)
- **Finding**: Diamond (rotated square) — elevated importance
- **All others**: Circle

---

## Force Simulation Configuration (`config/graph.ts`)

Copy from the reference implementation with academic tuning:

```typescript
export const FORCE_CONFIG = {
  alphaDecay:          0.02,
  velocityDecay:       0.4,
  collisionRadius:     25,      // Slightly larger than reference for academic labels
  collisionStrength:   1,
  collisionIterations: 3,
  cooldownTime:        Infinity,
  cooldownTicks:       Infinity,
};

export const ANIMATION_CONFIG = {
  researchGapSpeed:  4,    // Pulse speed for ResearchGap glow
  findingSpeed:      2,
  glow2DPulseRange:  { min: 0, max: 0.8 },
  glow2DRadiusExtra: { base: 2, pulse: 3 },
  initDelay:         300,
};

export const ZOOM_CONFIG = {
  labelVisibilityThreshold: 0.5,
};
```

---

## View Mode Implementation

Current view modes must be preserved. They are implemented by filtering `ForceGraphData` before passing to `GraphCanvas`:

| Mode | Filter Logic |
|------|-------------|
| `all` | All nodes and links |
| `gaps-only` | Only `ResearchGap` nodes + their direct neighbors + connecting links |
| `focus` | Selected node + its direct neighbors + connecting links |
| `centrality` | Top 20 nodes by combined centrality score + connecting links |

The `dataAdapter.ts` or a `useFilteredGraph` hook should implement these filters.

---

## Glow / Pulse Effects

Adopt the `useAnimationFrame` hook pattern from the reference.

- **ResearchGap nodes**: Pulsing pink glow (priority nodes in academic context)
- **Finding nodes**: Subtle cyan pulse
- **Selected node**: Static bright selection ring (green `#22c55e`)

The glow is drawn using `ctx.shadowBlur`, `ctx.shadowColor`, and canvas radial gradients in the `nodeCanvasObject` callback, driven by a `animTime` value from `useAnimationFrame`.

---

## 2D Graph Canvas (`GraphCanvas2D.tsx`)

Key implementation details from the reference:

```typescript
import ForceGraph2D from 'react-force-graph-2d';

// Props
interface Props {
  data: ForceGraphData;
  width: number;
  height: number;
  showLabels: boolean;
  selectedNode: ForceGraphNode | null;
  isDark: boolean;
  onNodeClick: (node: ForceGraphNode) => void;
  degreeCentrality: Map<string, number>;  // For dynamic sizing
}
```

**Critical implementation notes**:
1. Use `nodeCanvasObject` for custom shape drawing (hexagons, diamonds, circles)
2. Use `nodeCanvasObjectMode` = `'replace'` so the library doesn't draw a default node
3. Use `dataFingerprint` memoization to prevent force simulation restart on position updates:
   ```typescript
   const dataFingerprint = useMemo(() => {
     return `${data.nodes.length}:${data.links.length}`;
   }, [data.nodes.length, data.links.length]);
   ```
4. Add D3 collision force in `onEngineStop` or via `d3Force` prop
5. Arrow heads via `linkDirectionalArrowLength={4}` and `linkDirectionalArrowRelPos={1}`
6. Labels drawn inside `nodeCanvasObject` only when `globalScale > ZOOM_CONFIG.labelVisibilityThreshold` or node is selected

---

## 3D Graph Canvas (`GraphCanvas3D.tsx`)

Optional phase — implement after 2D is stable.

```typescript
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
```

Node geometry:
- `ResearchGap`: `THREE.DodecahedronGeometry`
- `Finding`: `THREE.OctahedronGeometry` (diamond)
- Others: `THREE.SphereGeometry`

---

## Toolbar & Controls (`GraphToolbar.tsx`)

Preserve all current controls, migrate from Cytoscape-specific APIs to force-graph ref APIs:

| Control | Cytoscape API | react-force-graph API |
|---------|---------------|----------------------|
| Zoom In | `cy.zoom(cy.zoom() * 1.2)` | `graphRef.current.zoom(scale * 1.2)` |
| Zoom Out | `cy.zoom(cy.zoom() * 0.8)` | `graphRef.current.zoom(scale * 0.8)` |
| Fit/Reset | `cy.fit()` | `graphRef.current.zoomToFit()` |
| Center on Node | `cy.center(node)` | `graphRef.current.centerAt(x, y, duration)` |

New controls to add:
- `2D / 3D` toggle button

---

## Phased Implementation Plan

### Phase 1 — Package Setup
**Goal**: Add new dependencies, remove old ones.

**Steps**:
1. In `shekara-dev/apps/llm-knowledge-graph/`:
   ```bash
   npm install react-force-graph-2d react-force-graph-3d d3-force three three-spritetext
   npm uninstall react-cytoscapejs cytoscape cytoscape-cola
   ```
2. Add `three` types: `npm install -D @types/three`
3. Update `next.config.js` if needed for canvas/webgl

**Files changed**: `package.json`, `package-lock.json`

---

### Phase 2 — New Module Scaffold
**Goal**: Create the module structure without breaking the current graph.

**Steps**:
1. Create `src/components/core/KnowledgeGraphVisualizer/` subdirectory structure (see Architecture above)
2. Create `types/graph.ts` with `ForceGraphNode`, `ForceGraphLink`, `ForceGraphData`
3. Create `config/colors.ts`, `config/sizes.ts`, `config/graph.ts`
4. Create `utils/dataAdapter.ts` — implement `adaptToForceGraph()`
5. Create `utils/nodeHelpers.ts` — `getNodeColor`, `getNodeSize`, `getGlowLevel`
6. Create `utils/linkHelpers.ts` — `getLinkColor`, `getLinkWidth2D`, `isGapLink`
7. Create `hooks/useAnimationFrame.ts` — copy from reference
8. Create `hooks/useNodeSelection.ts`
9. Create `hooks/useDimensions.ts`

**Files changed**: All new files, nothing existing touched.

---

### Phase 3 — GraphCanvas2D
**Goal**: Build the 2D force graph canvas component.

**Steps**:
1. Create `components/GraphCanvas/GraphCanvas2D.tsx`
   - Import `ForceGraph2D` from `react-force-graph-2d`
   - Implement `nodeCanvasObject` for circles, hexagons, diamonds
   - Implement glow effects via `useAnimationFrame`
   - Implement selection ring
   - Draw labels when zoomed or selected
   - Configure force simulation via `d3Force` props
2. Create `components/GraphCanvas/GraphCanvas.tsx` (routes to 2D, stub 3D)
3. Write a minimal test page or Storybook story to validate rendering

**Key reference files**:
- `redamon/webapp/src/app/graph/components/GraphCanvas/GraphCanvas2D.tsx`
- `redamon/webapp/src/app/graph/hooks/useAnimationFrame.ts`

---

### Phase 4 — GraphCanvas3D (Optional)
**Goal**: Add 3D rendering mode.

**Steps**:
1. Create `components/GraphCanvas/GraphCanvas3D.tsx`
   - Import `ForceGraph3D` and `THREE`
   - Custom `nodeThreeObject` for sphere/dodecahedron/octahedron geometries
   - Selection ring as `THREE.RingGeometry`
   - Labels via `SpriteText`
2. Update `GraphCanvas.tsx` routing component to accept `is3D` prop

**Key reference files**:
- `redamon/webapp/src/app/graph/components/GraphCanvas/GraphCanvas3D.tsx`

---

### Phase 5 — Assemble KnowledgeGraph.tsx
**Goal**: Replace `KnowledgeGraph.tsx` with the new force-graph-based wrapper.

**Steps**:
1. Rewrite `KnowledgeGraph.tsx` to:
   - Accept `graph: KnowledgeGraph` and `centralityAnalysis: CentralityAnalysis | null` as props (same as current)
   - Use `useGraphStore` for `activeNodeId` / `setActiveNode`
   - Call `adaptToForceGraph(graph)` to get `ForceGraphData`
   - Apply view mode filters via `useMemo`
   - Render `<GraphCanvas>` + `<GraphToolbar>` + `<NodeInfoPanel>` + `<GraphLegend>`
   - Add `2D/3D` toggle state
2. Preserve all existing props and behavior contract so `page.tsx` is unaffected

**Current props contract** (must be preserved):
```typescript
interface KnowledgeGraphProps {
  graph: KnowledgeGraph;
  centralityAnalysis: CentralityAnalysis | null;
}
```

---

### Phase 6 — Migrate UI Panels
**Goal**: Port the node info panel, legend, and centrality display to work with the new node type.

**Steps**:
1. Extract `NodeInfoPanel` from current `KnowledgeGraph.tsx` into standalone component
   - Replace `cy.getElementById(id)` lookups with direct `ForceGraphNode` reference
   - Keep Google Scholar button, centrality rank badge, Focus Path button
2. Extract `GraphLegend` — update to work with new `ForceGraphNode.type` values
3. `CentralityPanel` — `KeyInfluencerAnalysis.tsx` already works with `CentralityAnalysis`, no changes needed

---

### Phase 7 — View Modes & Search
**Goal**: Restore all current graph filtering capabilities.

**Steps**:
1. In `utils/dataAdapter.ts`, add filter functions:
   - `filterGapsOnly(data, graph)`
   - `filterFocusMode(data, selectedNodeId)`
   - `filterCentralityMode(data, topNodeIds)`
2. Wire view mode buttons in `GraphToolbar` to state in `KnowledgeGraph.tsx`
3. Implement node search: filter `ForceGraphData.nodes` by label match, zoom to first match via `graphRef.current.centerAt()`

---

### Phase 8 — Cleanup & QA
**Goal**: Remove Cytoscape artifacts and validate all features.

**Steps**:
1. Delete old `KnowledgeGraph.tsx` (now replaced)
2. Remove `react-cytoscapejs`, `cytoscape`, `cytoscape-cola` imports from everywhere
3. Run `npm run build` — fix any type errors
4. Manual QA checklist (see below)
5. Update `package.json` scripts if needed

---

## QA Checklist

Before considering the migration complete, verify every item:

### Graph Rendering
- [ ] Graph renders with nodes and edges after PDF/text extraction
- [ ] All 7 node types render with correct colors
- [ ] ResearchGap nodes render as hexagons
- [ ] Finding nodes render as diamonds
- [ ] Other nodes render as circles
- [ ] Labels show when zoomed in past threshold
- [ ] Labels show when node is selected regardless of zoom

### View Modes
- [ ] `All` mode shows complete graph
- [ ] `Gaps Only` mode shows only ResearchGap nodes and their neighbors
- [ ] `Focus` mode shows selected node + direct neighbors
- [ ] `Centrality` mode shows top 20 nodes by combined centrality score

### Interactivity
- [ ] Click on node selects it, shows selection ring
- [ ] Click on empty canvas deselects
- [ ] Selected node's edges highlight in blue
- [ ] Node info panel opens on selection with correct data
- [ ] Search box filters and highlights matching nodes
- [ ] Zoom In / Zoom Out buttons work
- [ ] Fit button resets view to show all nodes
- [ ] Focus Path button centers on selected node's neighborhood

### Centrality
- [ ] Centrality mode shows top 20 nodes
- [ ] Node size scales with centrality score
- [ ] Top 10% nodes shown in gold
- [ ] Centrality panel shows correct rankings

### History & Persistence
- [ ] Graph history still loads from localStorage correctly
- [ ] Selecting a history entry renders graph correctly
- [ ] Renaming/deleting history entries still works

### Performance
- [ ] Force simulation settles smoothly without jitter
- [ ] No unnecessary re-renders (data fingerprinting prevents simulation restart)
- [ ] Glow animation runs at smooth framerate (60fps target)
- [ ] 3D mode renders without crashes (if implemented)

---

## Important Constraints

1. **Do not change the Zustand store** — `graphStore.ts` is consumed by sidebar, history, and page layout. The store interface is a contract.
2. **Do not change `src/lib/types.ts`** — The `KnowledgeGraph`, `Node`, `Relationship`, `CentralityAnalysis` types are produced by the API and consumed throughout.
3. **Preserve `KnowledgeGraphProps`** — The wrapper component must accept `graph` and `centralityAnalysis` as before.
4. **Keep centrality analysis service intact** — `centralityAnalysisService.ts` and `apiClient.ts` are unchanged.
5. **Match the reference animation pattern** — Use `useAnimationFrame` hook with `animTime` (seconds) driving `Math.sin()` pulse effects in `nodeCanvasObject`.
6. **Use `nodeCanvasObjectMode = 'replace'`** — This is required when doing fully custom node drawing in react-force-graph-2d.

---

## Reference File Index

### Source Files to Replace
| File | Lines | Notes |
|------|-------|-------|
| `src/components/core/KnowledgeGraphVisualizer/KnowledgeGraph.tsx` | 771 | Fully replaced |

### Source Files to Preserve Unchanged
| File | Notes |
|------|-------|
| `src/lib/types.ts` | Core domain types |
| `src/store/graphStore.ts` | Zustand store |
| `src/services/centralityAnalysisService.ts` | Analysis logic |
| `src/services/graphExtractionService.ts` | API integration |
| `src/services/apiClient.ts` | HTTP client |
| `src/app/page.tsx` | Minimal or no changes |
| `src/components/core/AppSidebar/` | Untouched |
| `src/components/core/AppHeader.tsx` | Untouched |
| `src/components/KeyInfluencerAnalysis.tsx` | Untouched |

### Reference Files (in redamon/webapp)
| File | Purpose |
|------|---------|
| `src/app/graph/components/GraphCanvas/GraphCanvas2D.tsx` | 2D implementation pattern |
| `src/app/graph/components/GraphCanvas/GraphCanvas3D.tsx` | 3D implementation pattern |
| `src/app/graph/hooks/useAnimationFrame.ts` | Animation loop hook |
| `src/app/graph/hooks/useNodeSelection.ts` | Selection state pattern |
| `src/app/graph/hooks/useDimensions.ts` | Responsive sizing pattern |
| `src/app/graph/config/colors.ts` | Color config structure |
| `src/app/graph/config/sizes.ts` | Size config structure |
| `src/app/graph/config/graph.ts` | Force simulation config |
| `src/app/graph/utils/nodeHelpers.ts` | Node helper function pattern |
| `src/app/graph/utils/linkHelpers.ts` | Link helper function pattern |
| `src/app/graph/types/graph.ts` | ForceGraph type definitions |

---

## Status Tracking

Update this section as phases complete.

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1 — Package Setup | ✅ Complete | react-force-graph-2d/3d + d3-force already in workspace |
| Phase 2 — New Module Scaffold | ✅ Complete | types/, config/, utils/, hooks/ created |
| Phase 3 — GraphCanvas2D | ✅ Complete | Custom canvas shapes, glow, selection ring |
| Phase 4 — GraphCanvas3D | ✅ Complete | Three.js geometries, glow rings, canvas-texture labels |
| Phase 4b — GraphCanvasCytoscape | ✅ Complete | Original Cytoscape renderer preserved alongside force graphs |
| Phase 4c — Renderer Toggle | ✅ Complete | 2D / 3D / Classic toggle in toolbar; renderer-aware zoom/fit/re-layout |
| Phase 5 — Assemble KnowledgeGraph.tsx | ✅ Complete | Props contract preserved; all renderers wired |
| Phase 6 — Migrate UI Panels | ✅ Complete | NodeInfoPanel, Legend, centrality mode all ported |
| Phase 7 — View Modes & Search | ✅ Complete | all/gaps-only/focus/centrality + search + hidden types |
| Phase 8 — Cleanup & QA | ⬜ Pending | Run build, fix type errors, manual QA checklist |

## Deviations from original roadmap

- **Cytoscape kept**: Rather than removing Cytoscape, a `GraphCanvasCytoscape` component was added so all three renderers are available via a toggle. Cytoscape deps remain in the workspace.
- **three-spritetext not installed**: 3D labels use a CanvasTexture sprite instead. Install `three-spritetext` and update `GraphCanvas3D.tsx` to use it for better label quality.
- **Renderer toggle added**: `GraphRenderer = 'force-2d' | 'force-3d' | 'cytoscape'` state controls which canvas is rendered. Each renderer has its own imperative API (zoom, fit, re-layout) dispatched through renderer-aware handlers in `KnowledgeGraph.tsx`.

---

*Last updated: 2026-03-27*
