import { useMemo } from 'react';
import { ForceGraphData, ForceGraphNode } from '../types';
import { NODE_COLORS } from '../config';
import {
  CentralityAnalysis,
  NodeScore,
} from '../../../../services/centralityAnalysisService';
import { useGraphStore } from '../../../../store/graphStore';

export interface SelectedNodeInfo {
  node: ForceGraphNode;
  label: string;
  type: string;
  color: string;
  incomingEdges: number;
  outgoingEdges: number;
  connectedNodes: number;
  properties: Record<string, any>;
  degreeCentrality?: number;
  pageRank?: number;
  centralityRank?: number;
}

/**
 * Derives selected node state and computes the info panel data from the current active node ID.
 *
 * Note: edge counts use `fullData` (the unfiltered graph) so they reflect the true degree,
 * not just what's visible in the current view mode.
 */
export function useNodeSelection(
  displayData: ForceGraphData,
  fullData: ForceGraphData,
  centralityAnalysis: CentralityAnalysis | null,
  centralityScores: Map<string, NodeScore>
) {
  const { activeNodeId, setActiveNode } = useGraphStore();

  const selectedNode = useMemo(
    () => displayData.nodes.find((n) => n.id === activeNodeId) ?? null,
    [activeNodeId, displayData.nodes]
  );

  const selectedNodeInfo = useMemo((): SelectedNodeInfo | null => {
    if (!selectedNode) return null;

    const nodeId = selectedNode.id;
    let incomingEdges = 0;
    let outgoingEdges = 0;
    const connectedIds = new Set<string>();

    fullData.links.forEach((l) => {
      const srcId = typeof l.source === 'string' ? l.source : (l.source as ForceGraphNode).id;
      const tgtId = typeof l.target === 'string' ? l.target : (l.target as ForceGraphNode).id;
      if (srcId === nodeId) {
        outgoingEdges++;
        connectedIds.add(tgtId);
      }
      if (tgtId === nodeId) {
        incomingEdges++;
        connectedIds.add(srcId);
      }
    });

    const centralityData = centralityScores.get(nodeId);
    const rank = centralityAnalysis?.mostInfluential.findIndex((n) => n.nodeId === nodeId);

    return {
      node: selectedNode,
      label: selectedNode.name,
      type: selectedNode.type,
      color: NODE_COLORS[selectedNode.type] ?? NODE_COLORS.Default,
      incomingEdges,
      outgoingEdges,
      connectedNodes: connectedIds.size,
      properties: selectedNode.properties,
      degreeCentrality: centralityData?.degreeCentrality,
      pageRank: centralityData?.pageRank,
      centralityRank: rank !== undefined && rank >= 0 ? rank + 1 : undefined,
    };
  }, [selectedNode, fullData.links, centralityScores, centralityAnalysis]);

  return { selectedNode, selectedNodeInfo, setActiveNode };
}
