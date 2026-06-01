'use client';

import React, { useCallback, useEffect, useRef } from 'react';
// @ts-expect-error react-cytoscapejs does not have types
import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape from 'cytoscape';
// @ts-expect-error cytoscape-cola does not have types
import cola from 'cytoscape-cola';
import { ForceGraphData, ForceGraphNode } from '../../types';
import { NODE_COLORS } from '../../config/colors';
import type { NodeStyleOverride } from './GraphCanvas2D';

if (typeof window !== 'undefined') {
  Cytoscape.use(cola); // eslint-disable-line react-hooks/rules-of-hooks
}

// Cola layout — same config as the original implementation
const COLA_LAYOUT = {
  name: 'cola',
  animate: true,
  refresh: 1,
  maxSimulationTime: 3000,
  ungrabifyWhileSimulating: false,
  fit: true,
  padding: 50,
  randomize: false,
  nodeSpacing: () => 30,
  edgeLength: (edge: any) =>
    edge.data('relType') === 'IDENTIFIES_GAP' ? 100 : 180,
  unconstrIter: 40,
  userConstIter: 20,
  allConstIter: 20,
  avoidOverlap: true,
  handleDisconnected: true,
  convergenceThreshold: 0.01,
};

interface GraphCanvasCytoscapeProps {
  displayData: ForceGraphData;
  /** Pre-computed per-node color/size overrides (centrality mode). */
  nodeStyleOverrides?: Map<string, NodeStyleOverride>;
  activeNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
  onBackgroundClick: () => void;
  /** Ref is set to the cytoscape Core instance for imperative control from the toolbar. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graphRef: React.MutableRefObject<any>;
}

export function GraphCanvasCytoscape({
  displayData,
  nodeStyleOverrides,
  activeNodeId,
  onNodeClick,
  onBackgroundClick,
  graphRef,
}: GraphCanvasCytoscapeProps) {
  // Keep overrides in a ref so stylesheet functions always read the latest value
  // without triggering a stylesheet re-creation on every render
  const overridesRef = useRef(nodeStyleOverrides);
  useEffect(() => {
    overridesRef.current = nodeStyleOverrides;
    // Force Cytoscape to re-apply styles when overrides change
    graphRef.current?.style().update();
  }, [nodeStyleOverrides, graphRef]);

  // Convert ForceGraphData → Cytoscape elements
  const elements = React.useMemo(() => {
    const nodeEls = displayData.nodes.map((n) => ({
      data: {
        id: n.id,
        label: n.name,
        type: n.type,
        properties: n.properties,
        degree: n.__degree ?? 0,
      },
      classes: n.type.toLowerCase().replace(/\s/g, '-'),
    }));

    const edgeEls = displayData.links.map((l, i) => {
      const srcId =
        typeof l.source === 'string' ? l.source : (l.source as ForceGraphNode).id;
      const tgtId =
        typeof l.target === 'string' ? l.target : (l.target as ForceGraphNode).id;
      return {
        data: {
          id: `e-${srcId}-${tgtId}-${i}`,
          source: srcId,
          target: tgtId,
          label: l.type,
          relType: l.type,
        },
        classes: l.type === 'IDENTIFIES_GAP' ? 'gap-edge' : 'normal-edge',
      };
    });

    return [...nodeEls, ...edgeEls];
  }, [displayData]);

  // Stylesheet — references overridesRef so functions stay current without recreation
  const stylesheet: Cytoscape.StylesheetCSS[] = React.useMemo(
    () => [
      {
        selector: 'node',
        css: {
          'background-color': (ele: any) => {
            const override = overridesRef.current?.get(ele.data('id'));
            return override?.color ?? (NODE_COLORS[ele.data('type')] || NODE_COLORS.Default);
          },
          label: 'data(label)',
          'text-wrap': 'wrap',
          'text-max-width': '100px',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '10px',
          'font-weight': '700',
          color: '#1e293b',
          'text-outline-color': '#ffffff',
          'text-outline-width': '2px',
          width: (ele: any) => {
            const override = overridesRef.current?.get(ele.data('id'));
            if (override?.size !== undefined) {
              return `${Math.min(120, 40 + override.size * 20)}px`;
            }
            return `${Math.min(90, 45 + ele.data('degree') * 2.5)}px`;
          },
          height: (ele: any) => {
            const override = overridesRef.current?.get(ele.data('id'));
            if (override?.size !== undefined) {
              return `${Math.min(120, 40 + override.size * 20)}px`;
            }
            return `${Math.min(90, 45 + ele.data('degree') * 2.5)}px`;
          },
          'border-width': '2px',
          'border-color': '#ffffff',
          'overlay-padding': '4px',
          'transition-property': 'background-color, border-color, border-width, opacity',
          'transition-duration': '0.2s',
        } as any,
      },
      {
        selector: 'node.researchgap',
        css: {
          shape: 'hexagon',
          'border-width': '3px',
          'border-color': '#be185d',
        } as any,
      },
      {
        selector: 'edge',
        css: {
          width: 1.5,
          'line-color': '#cbd5e1',
          'target-arrow-color': '#cbd5e1',
          'target-arrow-shape': 'vee',
          'curve-style': 'bezier',
          label: 'data(label)',
          'font-size': '8px',
          'text-rotation': 'autorotate',
          'text-outline-color': '#ffffff',
          'text-outline-width': '1px',
          opacity: 0.6,
        } as any,
      },
      {
        selector: 'edge.gap-edge',
        css: {
          'line-color': '#ec4899',
          'target-arrow-color': '#ec4899',
          width: 2.5,
          'line-style': 'dashed',
        } as any,
      },
      {
        selector: 'node.highlighted',
        css: {
          'border-width': '4px',
          'border-color': '#f59e0b',
          opacity: 1,
          'z-index': 10,
        } as any,
      },
      {
        selector: 'node.dimmed',
        css: { opacity: 0.15 } as any,
      },
      {
        selector: 'edge.dimmed',
        css: { opacity: 0.05 } as any,
      },
    ],
    // Stylesheet itself is stable — overridesRef updates the functions in place
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Wire up Cytoscape event handlers on mount
  const handleCyReady = useCallback(
    (cy: Cytoscape.Core) => {
      graphRef.current = cy;

      cy.on('tap', 'node', (evt) => {
        onNodeClick(evt.target.data('id'));
      });

      cy.on('tap', (evt) => {
        if (evt.target === cy) {
          onBackgroundClick();
        }
      });
    },
    [graphRef, onNodeClick, onBackgroundClick]
  );

  // Highlight selected node neighborhood
  useEffect(() => {
    const cy = graphRef.current;
    if (!cy) return;

    cy.elements().removeClass('highlighted dimmed');

    if (activeNodeId) {
      const node = cy.getElementById(activeNodeId);
      if (node.nonempty()) {
        const neighborhood = node.closedNeighborhood();
        neighborhood.addClass('highlighted');
        cy.elements().not(neighborhood).addClass('dimmed');
        cy.animate({ fit: { eles: node, padding: 100 }, duration: 200 });
      }
    }
  }, [activeNodeId, graphRef]);

  // Re-run layout when displayed elements change
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.layout(COLA_LAYOUT).run();
    }
  }, [elements, graphRef]);

  return (
    <CytoscapeComponent
      elements={elements}
      style={{ width: '100%', height: '100%' }}
      stylesheet={stylesheet}
      layout={COLA_LAYOUT}
      cy={handleCyReady}
      wheelSensitivity={0.15}
    />
  );
}
