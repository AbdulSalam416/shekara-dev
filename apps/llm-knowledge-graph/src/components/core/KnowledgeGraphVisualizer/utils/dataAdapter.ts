import { KnowledgeGraph, Node } from '../../../lib/types';
import { ForceGraphData, ForceGraphLink, ForceGraphNode } from '../types';

/**
 * Core adapter — converts a KnowledgeGraph (API model) into ForceGraphData (react-force-graph model).
 * Optionally accepts a filter function to restrict which nodes are included.
 * Links are automatically filtered to only include edges where both endpoints are in the node set.
 * Computes __degree for each node so canvas drawing can size nodes proportionally.
 */
export function adaptToForceGraph(
  kg: KnowledgeGraph,
  filterFn?: (node: Node) => boolean
): ForceGraphData {
  const nodes = filterFn ? kg.nodes.filter(filterFn) : kg.nodes;
  const nodeIds = new Set(nodes.map((n) => n.id));

  const links: ForceGraphLink[] = kg.relationships
    .filter((r) => nodeIds.has(r.source) && nodeIds.has(r.target))
    .map((r) => ({
      source: r.source,
      target: r.target,
      type: r.type,
    }));

  // Compute degree (undirected) for each node
  const degreeMap = new Map<string, number>();
  links.forEach((l) => {
    const srcId = typeof l.source === 'string' ? l.source : l.source.id;
    const tgtId = typeof l.target === 'string' ? l.target : l.target.id;
    degreeMap.set(srcId, (degreeMap.get(srcId) ?? 0) + 1);
    degreeMap.set(tgtId, (degreeMap.get(tgtId) ?? 0) + 1);
  });

  const forceNodes: ForceGraphNode[] = nodes.map((n) => ({
    id: n.id,
    name: n.label,
    type: n.type,
    properties: n.properties,
    __degree: degreeMap.get(n.id) ?? 0,
  }));

  return { nodes: forceNodes, links };
}

/**
 * Filter to ResearchGap nodes and their direct neighbors.
 */
export function filterGapsOnly(kg: KnowledgeGraph): ForceGraphData {
  const gapIds = new Set(
    kg.nodes.filter((n) => n.type === 'ResearchGap').map((n) => n.id)
  );
  const visible = new Set<string>([...gapIds]);
  kg.relationships.forEach((r) => {
    if (gapIds.has(r.source)) visible.add(r.target);
    if (gapIds.has(r.target)) visible.add(r.source);
  });
  return adaptToForceGraph(kg, (n) => visible.has(n.id));
}

/**
 * Filter to a center node and its direct neighbors.
 */
export function filterFocusMode(
  kg: KnowledgeGraph,
  centerNodeId: string
): ForceGraphData {
  const visible = new Set<string>([centerNodeId]);
  kg.relationships.forEach((r) => {
    if (r.source === centerNodeId) visible.add(r.target);
    if (r.target === centerNodeId) visible.add(r.source);
  });
  return adaptToForceGraph(kg, (n) => visible.has(n.id));
}

/**
 * Filter to a specific set of node IDs (for centrality top-N view).
 */
export function filterCentralityMode(
  kg: KnowledgeGraph,
  topNodeIds: Set<string>
): ForceGraphData {
  return adaptToForceGraph(kg, (n) => topNodeIds.has(n.id));
}

/**
 * Remove nodes of hidden types from an already-adapted ForceGraphData.
 */
export function applyHiddenTypes(
  data: ForceGraphData,
  hiddenTypes: Set<string>
): ForceGraphData {
  if (hiddenTypes.size === 0) return data;
  const visibleNodes = data.nodes.filter((n) => !hiddenTypes.has(n.type));
  const visibleIds = new Set(visibleNodes.map((n) => n.id));
  const visibleLinks = data.links.filter((l) => {
    const srcId = typeof l.source === 'string' ? l.source : l.source.id;
    const tgtId = typeof l.target === 'string' ? l.target : l.target.id;
    return visibleIds.has(srcId) && visibleIds.has(tgtId);
  });
  return { nodes: visibleNodes, links: visibleLinks };
}

/**
 * Remove nodes whose name doesn't match the search query from a ForceGraphData.
 */
export function applySearchFilter(
  data: ForceGraphData,
  searchQuery: string
): ForceGraphData {
  if (!searchQuery.trim()) return data;
  const lower = searchQuery.toLowerCase();
  const matchingIds = new Set(
    data.nodes.filter((n) => n.name.toLowerCase().includes(lower)).map((n) => n.id)
  );
  const filteredNodes = data.nodes.filter((n) => matchingIds.has(n.id));
  const filteredLinks = data.links.filter((l) => {
    const srcId = typeof l.source === 'string' ? l.source : l.source.id;
    const tgtId = typeof l.target === 'string' ? l.target : l.target.id;
    return matchingIds.has(srcId) && matchingIds.has(tgtId);
  });
  return { nodes: filteredNodes, links: filteredLinks };
}
