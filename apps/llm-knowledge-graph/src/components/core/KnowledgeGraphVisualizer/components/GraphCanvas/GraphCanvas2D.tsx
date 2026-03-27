'use client';

import { useRef, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ForceGraphData, ForceGraphLink, ForceGraphNode } from '../../types';
import { getNodeColor, getNodeSize, getGlowLevel, hasGlowNodes } from '../../utils/nodeHelpers';
import {
  getLinkColor,
  getLinkWidth2D,
  getParticleCount,
  getParticleWidth,
  getParticleColor,
  getParticleSpeed,
} from '../../utils/linkHelpers';
import {
  BASE_SIZES,
  LINK_SIZES,
  BACKGROUND_COLORS,
  SELECTION_COLORS,
  FORCE_CONFIG,
  ANIMATION_CONFIG,
  ZOOM_CONFIG,
} from '../../config';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';

// SSR-safe dynamic import — react-force-graph-2d requires browser canvas APIs
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export interface NodeStyleOverride {
  color?: string;
  size?: number;  // Overrides the type-based size multiplier
}

interface GraphCanvas2DProps {
  data: ForceGraphData;
  width: number;
  height: number;
  showLabels: boolean;
  selectedNode: ForceGraphNode | null;
  onNodeClick: (node: ForceGraphNode) => void;
  onBackgroundClick?: () => void;
  isDark?: boolean;
  /** Per-node style overrides — used for centrality mode (gold color + size by score). */
  nodeStyleOverrides?: Map<string, NodeStyleOverride>;
  /** Ref passed through to the internal ForceGraph2D instance for imperative control. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graphRef?: React.MutableRefObject<any>;
}

export function GraphCanvas2D({
  data,
  width,
  height,
  showLabels,
  selectedNode,
  onNodeClick,
  onBackgroundClick,
  isDark = false,
  nodeStyleOverrides,
  graphRef: externalGraphRef,
}: GraphCanvas2DProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const internalRef = useRef<any>(null);
  const graphRef = externalGraphRef ?? internalRef;
  const animationTimeRef = useRef<number>(0);
  const lastDataFingerprintRef = useRef<string>('');

  // Stable fingerprint — only changes when graph structure changes (not node positions)
  const dataFingerprint = useMemo(() => {
    const nodeIds = data.nodes.map((n) => n.id).sort().join(',');
    const linkIds = data.links
      .map((l) => {
        const srcId = typeof l.source === 'object' ? (l.source as ForceGraphNode).id : l.source;
        const tgtId = typeof l.target === 'object' ? (l.target as ForceGraphNode).id : l.target;
        return `${srcId}-${tgtId}`;
      })
      .sort()
      .join(',');
    return `${data.nodes.length}:${data.links.length}:${nodeIds}:${linkIds}`;
  }, [data]);

  // Apply collision force and reheat — only when structure actually changes
  useEffect(() => {
    const isFirstRender = lastDataFingerprintRef.current === '';
    const structureChanged = dataFingerprint !== lastDataFingerprintRef.current;
    lastDataFingerprintRef.current = dataFingerprint;

    if (!structureChanged) return;

    const timer = setTimeout(() => {
      const fg = graphRef.current;
      if (!fg) return;

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const d3 = require('d3-force');
      fg.d3Force(
        'collide',
        d3
          .forceCollide()
          .radius(FORCE_CONFIG.collisionRadius)
          .strength(FORCE_CONFIG.collisionStrength)
          .iterations(FORCE_CONFIG.collisionIterations)
      );

      if (isFirstRender || structureChanged) {
        fg.d3ReheatSimulation();
      }
    }, ANIMATION_CONFIG.initDelay);

    return () => clearTimeout(timer);
  }, [dataFingerprint, graphRef]);

  // Animation loop — runs only when there are nodes that need glow effects
  const needsAnimation = hasGlowNodes(data.nodes);

  useAnimationFrame(
    (time) => {
      animationTimeRef.current = time;
      const fg = graphRef.current;
      if (fg) {
        if (typeof fg._rerender === 'function') {
          fg._rerender();
        } else if (typeof fg.refresh === 'function') {
          fg.refresh();
        }
      }
    },
    needsAnimation
  );

  const selectedNodeId = selectedNode?.id;

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={data}
      nodeLabel={(node) => `${(node as ForceGraphNode).name} (${(node as ForceGraphNode).type})`}
      nodeRelSize={BASE_SIZES.node2D}
      linkLabel={(link) => (link as ForceGraphLink).type}
      linkColor={(link) => getLinkColor(link as ForceGraphLink, selectedNodeId)}
      linkDirectionalArrowColor={(link) => getLinkColor(link as ForceGraphLink, selectedNodeId)}
      linkWidth={(link) => getLinkWidth2D(link as ForceGraphLink, selectedNodeId)}
      linkDirectionalParticles={(link) => getParticleCount(link as ForceGraphLink, selectedNodeId)}
      linkDirectionalParticleWidth={(link) => getParticleWidth(link as ForceGraphLink, selectedNodeId)}
      linkDirectionalParticleColor={(link) => getParticleColor(link as ForceGraphLink)}
      linkDirectionalParticleSpeed={(link) => getParticleSpeed(link as ForceGraphLink)}
      linkDirectionalArrowLength={LINK_SIZES.arrowLength}
      linkDirectionalArrowRelPos={1}
      backgroundColor={isDark ? BACKGROUND_COLORS.dark.graph : BACKGROUND_COLORS.light.graph}
      width={width}
      height={height}
      d3AlphaDecay={FORCE_CONFIG.alphaDecay}
      d3VelocityDecay={FORCE_CONFIG.velocityDecay}
      cooldownTime={FORCE_CONFIG.cooldownTime}
      cooldownTicks={FORCE_CONFIG.cooldownTicks}
      onNodeClick={(node) => onNodeClick(node as ForceGraphNode)}
      onBackgroundClick={onBackgroundClick}
      nodeCanvasObject={(node, ctx, globalScale) => {
        const graphNode = node as ForceGraphNode & { x: number; y: number };

        // Guard: force simulation hasn't assigned positions yet — skip drawing
        if (!isFinite(graphNode.x) || !isFinite(graphNode.y)) return;

        // Resolve color and size — override map takes precedence for centrality mode
        const override = nodeStyleOverrides?.get(graphNode.id);
        const color = override?.color ?? getNodeColor(graphNode);
        const sizeMultiplier = override?.size ?? getNodeSize(graphNode);
        const nodeSize = BASE_SIZES.node2D * sizeMultiplier;

        const isSelected = selectedNodeId === graphNode.id;
        const isResearchGap = graphNode.type === 'ResearchGap';
        const isFinding = graphNode.type === 'Finding';

        // ── Helper: draw hexagon path ──────────────────────────────────────
        const drawHexagon = (cx: number, cy: number, r: number) => {
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const px = cx + r * Math.cos(angle);
            const py = cy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
        };

        // ── Selection ring ────────────────────────────────────────────────
        if (isSelected) {
          if (isFinding) {
            const sd = nodeSize * 1.2 + 6;
            ctx.beginPath();
            ctx.moveTo(graphNode.x, graphNode.y - sd);
            ctx.lineTo(graphNode.x + sd, graphNode.y);
            ctx.lineTo(graphNode.x, graphNode.y + sd);
            ctx.lineTo(graphNode.x - sd, graphNode.y);
            ctx.closePath();
          } else if (isResearchGap) {
            drawHexagon(graphNode.x, graphNode.y, nodeSize * 1.2 + 6);
          } else {
            ctx.beginPath();
            ctx.arc(graphNode.x, graphNode.y, nodeSize + 6, 0, 2 * Math.PI);
          }
          ctx.strokeStyle = SELECTION_COLORS.ring;
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // ── Glow effect (ResearchGap + Finding) ───────────────────────────
        const glowLevel = getGlowLevel(graphNode);
        if (glowLevel) {
          const time = animationTimeRef.current || Date.now() / 1000;
          const speed =
            glowLevel === 'critical'
              ? ANIMATION_CONFIG.criticalSpeed
              : ANIMATION_CONFIG.highSpeed;
          const pulse = Math.sin(time * speed) * 0.5 + 0.5;
          const glowRadius =
            nodeSize +
            ANIMATION_CONFIG.glow2DRadiusExtra.base +
            pulse * ANIMATION_CONFIG.glow2DRadiusExtra.pulse;

          const gradient = ctx.createRadialGradient(
            graphNode.x,
            graphNode.y,
            nodeSize,
            graphNode.x,
            graphNode.y,
            glowRadius
          );
          gradient.addColorStop(0, color);
          gradient.addColorStop(0.5, `${color}88`);
          gradient.addColorStop(1, `${color}00`);

          ctx.beginPath();
          ctx.arc(graphNode.x, graphNode.y, glowRadius, 0, 2 * Math.PI);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // ── Main shape ────────────────────────────────────────────────────
        if (isFinding) {
          // Diamond (rotated square) — like ExploitGvm in the reference
          const d = nodeSize * 1.2;
          ctx.beginPath();
          ctx.moveTo(graphNode.x, graphNode.y - d);
          ctx.lineTo(graphNode.x + d, graphNode.y);
          ctx.lineTo(graphNode.x, graphNode.y + d);
          ctx.lineTo(graphNode.x - d, graphNode.y);
          ctx.closePath();
          ctx.fillStyle = `${color}33`;  // 20% opacity fill
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (isResearchGap) {
          // Hexagon — for research gap nodes
          const r = nodeSize * 1.1;
          drawHexagon(graphNode.x, graphNode.y, r);
          ctx.fillStyle = `${color}26`;  // 15% opacity fill
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          // Standard filled circle for all other node types
          ctx.beginPath();
          ctx.arc(graphNode.x, graphNode.y, nodeSize, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }

        // ── Label ─────────────────────────────────────────────────────────
        if ((showLabels && globalScale > ZOOM_CONFIG.labelVisibilityThreshold) || isSelected) {
          const label = graphNode.name;
          const fontSize = Math.max(BASE_SIZES.label2D.min, 6 / globalScale);
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = isDark ? BACKGROUND_COLORS.dark.label : BACKGROUND_COLORS.light.label;
          ctx.fillText(label, graphNode.x, graphNode.y + nodeSize + 2);
        }
      }}
      // Pointer hit area — always a circle for consistent click detection
      nodePointerAreaPaint={(node, color, ctx) => {
        const graphNode = node as ForceGraphNode & { x: number; y: number };
        if (!isFinite(graphNode.x) || !isFinite(graphNode.y)) return;
        const nodeSize = BASE_SIZES.node2D * getNodeSize(graphNode);
        ctx.beginPath();
        ctx.arc(graphNode.x, graphNode.y, nodeSize + 4, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      }}
    />
  );
}
