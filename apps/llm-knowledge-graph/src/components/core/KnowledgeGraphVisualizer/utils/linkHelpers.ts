import { ForceGraphLink, ForceGraphNode } from '../types';
import { EDGE_COLORS, LINK_SIZES } from '../config';

/**
 * Extract node ID from a link endpoint (handles both string and ForceGraphNode).
 */
export const getNodeId = (node: string | ForceGraphNode): string =>
  typeof node === 'string' ? node : node.id;

/**
 * Check if a link is connected to a specific node.
 */
export const isLinkConnectedToNode = (link: ForceGraphLink, nodeId: string): boolean => {
  const sourceId = getNodeId(link.source);
  const targetId = getNodeId(link.target);
  return sourceId === nodeId || targetId === nodeId;
};

/**
 * Get link color.
 * IDENTIFIES_GAP edges are always pink. Other edges highlight when connected to selected node.
 */
export const getLinkColor = (link: ForceGraphLink, selectedNodeId?: string): string => {
  if (link.type === 'IDENTIFIES_GAP') return EDGE_COLORS.gapEdge;
  if (!selectedNodeId) return EDGE_COLORS.default;
  return isLinkConnectedToNode(link, selectedNodeId)
    ? EDGE_COLORS.highlighted
    : EDGE_COLORS.default;
};

/**
 * Get link width for 2D canvas.
 * Gap edges are thicker. Selected node's edges are highlighted.
 */
export const getLinkWidth2D = (link: ForceGraphLink, selectedNodeId?: string): number => {
  if (link.type === 'IDENTIFIES_GAP') return LINK_SIZES.gapEdgeWidth2D;
  if (!selectedNodeId) return LINK_SIZES.defaultWidth2D;
  return isLinkConnectedToNode(link, selectedNodeId)
    ? LINK_SIZES.highlightedWidth2D
    : LINK_SIZES.defaultWidth2D;
};

/**
 * Get directional particle count.
 * Gap edges always show 2 particles; selected node's links show 4.
 */
export const getParticleCount = (link: ForceGraphLink, selectedNodeId?: string): number => {
  if (link.type === 'IDENTIFIES_GAP') return 2;
  if (!selectedNodeId) return 0;
  return isLinkConnectedToNode(link, selectedNodeId) ? LINK_SIZES.particleCount : 0;
};

/**
 * Get particle width.
 * Gap edge particles are slightly smaller than selected-link particles.
 */
export const getParticleWidth = (link: ForceGraphLink, selectedNodeId?: string): number => {
  if (link.type === 'IDENTIFIES_GAP') return 3;
  if (!selectedNodeId) return 0;
  return isLinkConnectedToNode(link, selectedNodeId) ? LINK_SIZES.particleWidth : 0;
};

/**
 * Get particle color.
 */
export const getParticleColor = (link: ForceGraphLink): string => {
  if (link.type === 'IDENTIFIES_GAP') return EDGE_COLORS.gapEdge;
  return EDGE_COLORS.particle;
};

/**
 * Get particle speed — gap edges move slightly faster.
 */
export const getParticleSpeed = (link: ForceGraphLink): number =>
  link.type === 'IDENTIFIES_GAP' ? 0.008 : 0.004;
