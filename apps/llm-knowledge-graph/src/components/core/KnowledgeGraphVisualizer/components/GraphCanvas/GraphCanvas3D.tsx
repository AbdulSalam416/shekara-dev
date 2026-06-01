'use client';

import { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ForceGraphData, ForceGraphLink, ForceGraphNode } from '../../types';
import { getNodeColor, getNodeSize, getGlowLevel, hasGlowNodes } from '../../utils/nodeHelpers';
import {
  getLinkColor,
  getLinkWidth2D as getLinkWidth,
  getParticleCount,
  getParticleWidth,
  getParticleColor,
  getParticleSpeed,
} from '../../utils/linkHelpers';
import {
  LINK_SIZES,
  BASE_SIZES,
  BACKGROUND_COLORS,
  SELECTION_COLORS,
  FORCE_CONFIG,
  ANIMATION_CONFIG,
} from '../../config';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import type { NodeStyleOverride } from './GraphCanvas2D';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

interface GraphCanvas3DProps {
  data: ForceGraphData;
  width: number;
  height: number;
  showLabels: boolean;
  selectedNode: ForceGraphNode | null;
  onNodeClick: (node: ForceGraphNode) => void;
  onBackgroundClick?: () => void;
  isDark?: boolean;
  nodeStyleOverrides?: Map<string, NodeStyleOverride>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graphRef?: React.MutableRefObject<any>;
}

export function GraphCanvas3D({
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
}: GraphCanvas3DProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const internalRef = useRef<any>(null);
  const graphRef = externalGraphRef ?? internalRef;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const glowRingsRef = useRef<any[]>([]);

  // Clear glow ring refs when data changes so stale meshes aren't animated
  useEffect(() => {
    glowRingsRef.current = [];
  }, [data]);

  // Setup collision force after mount
  useEffect(() => {
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
      fg.d3ReheatSimulation();
    }, ANIMATION_CONFIG.initDelay);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Glow ring pulsing animation
  const needsAnimation = hasGlowNodes(data.nodes);

  useAnimationFrame(
    (time) => {
      glowRingsRef.current.forEach((ring) => {
        if (!ring) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const level: string = (ring as any).__glowLevel || 'high';
        const speed =
          level === 'critical' ? ANIMATION_CONFIG.criticalSpeed : ANIMATION_CONFIG.highSpeed;
        const pulse = Math.sin(time * speed) * 0.15 + 1;
        const opacity = Math.sin(time * speed) * 0.2 + 0.4;
        ring.scale.set(pulse, pulse, 1);
        if (ring.material) ring.material.opacity = opacity;
      });
    },
    needsAnimation
  );

  const selectedNodeId = selectedNode?.id;

  return (
    <ForceGraph3D
      ref={graphRef}
      graphData={data}
      nodeLabel={(node) => `${(node as ForceGraphNode).name} (${(node as ForceGraphNode).type})`}
      nodeRelSize={BASE_SIZES.node3D}
      nodeOpacity={0.9}
      linkLabel={(link) => (link as ForceGraphLink).type}
      linkColor={(link) => getLinkColor(link as ForceGraphLink, selectedNodeId)}
      linkWidth={(link) => getLinkWidth(link as ForceGraphLink, selectedNodeId)}
      linkDirectionalParticles={(link) => getParticleCount(link as ForceGraphLink, selectedNodeId)}
      linkDirectionalParticleWidth={(link) => getParticleWidth(link as ForceGraphLink, selectedNodeId)}
      linkDirectionalParticleColor={(link) => getParticleColor(link as ForceGraphLink)}
      linkDirectionalParticleSpeed={(link) => getParticleSpeed(link as ForceGraphLink)}
      linkDirectionalArrowLength={LINK_SIZES.arrowLength3D}
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
      nodeThreeObject={(node: object) => {
        const graphNode = node as ForceGraphNode & { x?: number; y?: number; z?: number };
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const THREE = require('three');

        const override = nodeStyleOverrides?.get(graphNode.id);
        const color = override?.color ?? getNodeColor(graphNode);
        const sizeMultiplier = override?.size ?? getNodeSize(graphNode);
        const sphereSize = BASE_SIZES.node3D * sizeMultiplier;
        const isSelected = selectedNodeId === graphNode.id;
        const isResearchGap = graphNode.type === 'ResearchGap';
        const isFinding = graphNode.type === 'Finding';

        const group = new THREE.Group();

        // ── Selection ring (green) ──────────────────────────────────
        if (isSelected) {
          const ringGeo = new THREE.RingGeometry(
            sphereSize * 1.4,
            sphereSize * 1.6,
            32
          );
          const ringMat = new THREE.MeshBasicMaterial({
            color: SELECTION_COLORS.ring,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
          });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.lookAt(0, 0, 1);
          group.add(ring);
        }

        // ── Glow ring (ResearchGap + Finding) ───────────────────────
        const glowLevel = getGlowLevel(graphNode);
        if (glowLevel) {
          const glowGeo = new THREE.RingGeometry(
            sphereSize * 1.15,
            sphereSize * 1.4,
            32
          );
          const glowMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
          });
          const glowRing = new THREE.Mesh(glowGeo, glowMat);
          glowRing.lookAt(0, 0, 1);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (glowRing as any).__glowLevel = glowLevel;
          glowRingsRef.current.push(glowRing);
          group.add(glowRing);
        }

        // ── Main geometry ───────────────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let geometry: any;
        if (isFinding) {
          geometry = new THREE.OctahedronGeometry(sphereSize * 1.2); // Diamond
        } else if (isResearchGap) {
          geometry = new THREE.DodecahedronGeometry(sphereSize * 1.1); // Faceted sphere → hexagonal feel
        } else {
          geometry = new THREE.SphereGeometry(
            sphereSize,
            16,
            16
          );
        }

        const isSpecial = isFinding || isResearchGap;
        const material = isSpecial
          ? new THREE.MeshLambertMaterial({
              color: color,
              transparent: true,
              opacity: 0.2,
              emissive: color,
              emissiveIntensity: 0.4,
              side: THREE.DoubleSide,
            })
          : new THREE.MeshLambertMaterial({
              color: color,
              transparent: true,
              opacity: 0.9,
            });

        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);

        // Wireframe + edge outline for special nodes
        if (isSpecial) {
          const wireMat = new THREE.MeshBasicMaterial({
            color: color,
            wireframe: true,
            transparent: true,
            opacity: 0.6,
          });
          group.add(new THREE.Mesh(geometry, wireMat));

          const edges = new THREE.EdgesGeometry(geometry, 15);
          const lineMat = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
          });
          group.add(new THREE.LineSegments(edges, lineMat));
        }

        // ── Labels via canvas texture ────────────────────────────────
        if (showLabels || isSelected) {
          const labelColor = isDark
            ? BACKGROUND_COLORS.dark.label
            : BACKGROUND_COLORS.light.label;
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          const fontSize = 48;
          ctx.font = `bold ${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(graphNode.name).width;
          const pad = 12;
          canvas.width = textWidth + pad * 2;
          canvas.height = fontSize * 1.4;
          ctx.font = `bold ${fontSize}px Sans-Serif`;
          ctx.fillStyle = labelColor;
          ctx.fillText(graphNode.name, pad, fontSize);
          const texture = new THREE.CanvasTexture(canvas);
          const spriteMat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
          });
          const sprite = new THREE.Sprite(spriteMat);
          const aspect = canvas.width / canvas.height;
          const labelScale = BASE_SIZES.label3D * 1.8;
          sprite.scale.set(aspect * labelScale, labelScale, 1);
          sprite.position.y = sphereSize + labelScale * 0.6;
          group.add(sprite);
        }

        return group;
      }}
    />
  );
}
