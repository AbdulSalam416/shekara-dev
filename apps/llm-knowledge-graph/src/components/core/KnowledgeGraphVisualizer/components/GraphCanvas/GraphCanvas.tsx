'use client';

import { ForceGraphData, ForceGraphNode } from '../../types';
import { GraphCanvas2D, NodeStyleOverride } from './GraphCanvas2D';
import { GraphCanvas3D } from './GraphCanvas3D';
import { GraphCanvasCytoscape } from './GraphCanvasCytoscape';

export type GraphRenderer = 'force-2d' | 'force-3d' | 'cytoscape';

interface GraphCanvasProps {
  renderer: GraphRenderer;

  // Force-graph data (force-2d and force-3d)
  data: ForceGraphData;

  width: number;
  height: number;
  showLabels: boolean;
  selectedNode: ForceGraphNode | null;
  activeNodeId: string | null;
  onNodeClick: (node: ForceGraphNode) => void;
  onBackgroundClick?: () => void;
  isDark?: boolean;
  nodeStyleOverrides?: Map<string, NodeStyleOverride>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graphRef?: React.MutableRefObject<any>;
}

/**
 * Routes between the three available graph renderers:
 *  - 'force-2d'   → react-force-graph-2d (Canvas, D3 force simulation)
 *  - 'force-3d'   → react-force-graph-3d (Three.js, D3 force simulation)
 *  - 'cytoscape'  → Cytoscape.js + Cola layout (classic vector graph)
 */
export function GraphCanvas({
  renderer,
  data,
  width,
  height,
  showLabels,
  selectedNode,
  activeNodeId,
  onNodeClick,
  onBackgroundClick,
  isDark,
  nodeStyleOverrides,
  graphRef,
}: GraphCanvasProps) {
  if (renderer === 'cytoscape') {
    return (
      <GraphCanvasCytoscape
        displayData={data}
        nodeStyleOverrides={nodeStyleOverrides}
        activeNodeId={activeNodeId}
        onNodeClick={(nodeId) => {
          // Wrap the nodeId into a minimal ForceGraphNode for a unified parent API
          const node = data.nodes.find((n) => n.id === nodeId) ?? { id: nodeId, name: nodeId, type: '', properties: {} };
          onNodeClick(node as ForceGraphNode);
        }}
        onBackgroundClick={onBackgroundClick ?? (() => { /* noop */ })}
        graphRef={graphRef!}
      />
    );
  }

  if (renderer === 'force-3d') {
    return (
      <GraphCanvas3D
        data={data}
        width={width}
        height={height}
        showLabels={showLabels}
        selectedNode={selectedNode}
        onNodeClick={onNodeClick}
        onBackgroundClick={onBackgroundClick}
        isDark={isDark}
        nodeStyleOverrides={nodeStyleOverrides}
        graphRef={graphRef!}
      />
    );
  }

  return (
    <GraphCanvas2D
      data={data}
      width={width}
      height={height}
      showLabels={showLabels}
      selectedNode={selectedNode}
      onNodeClick={onNodeClick}
      onBackgroundClick={onBackgroundClick}
      isDark={isDark}
      nodeStyleOverrides={nodeStyleOverrides}
      graphRef={graphRef!}
    />
  );
}
