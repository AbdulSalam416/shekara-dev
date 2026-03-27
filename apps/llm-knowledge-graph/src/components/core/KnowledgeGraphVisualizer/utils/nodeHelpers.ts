import { ForceGraphNode, GlowLevel } from '../types';
import { NODE_COLORS, NODE_SIZES, BASE_SIZES } from '../config';

/**
 * Get node color based on type.
 */
export const getNodeColor = (node: ForceGraphNode): string => {
  return NODE_COLORS[node.type] ?? NODE_COLORS.Default;
};

/**
 * Get node size multiplier.
 * Incorporates the type-based multiplier plus a small bonus for highly-connected nodes.
 */
export const getNodeSize = (node: ForceGraphNode): number => {
  const typeMultiplier = NODE_SIZES[node.type] ?? NODE_SIZES.Default;
  const degree = node.__degree ?? 0;
  // Small degree bonus — max +0.6 for very connected nodes
  const degreeBonus = Math.min(0.6, degree * 0.04);
  return typeMultiplier + degreeBonus;
};

/**
 * Compute actual canvas radius for a 2D node.
 */
export const getNodeRadius2D = (node: ForceGraphNode): number =>
  BASE_SIZES.node2D * getNodeSize(node);

/**
 * Get glow level for animated pulsing effect.
 * ResearchGap → fast pulse ('critical'), Finding → slow pulse ('high').
 */
export const getGlowLevel = (node: ForceGraphNode): GlowLevel => {
  if (node.type === 'ResearchGap') return 'critical';
  if (node.type === 'Finding') return 'high';
  return false;
};

/**
 * Returns true if any node in the graph should have a glow animation.
 * Used to conditionally enable the animation loop.
 */
export const hasGlowNodes = (nodes: ForceGraphNode[]): boolean =>
  nodes.some((n) => n.type === 'ResearchGap' || n.type === 'Finding');
