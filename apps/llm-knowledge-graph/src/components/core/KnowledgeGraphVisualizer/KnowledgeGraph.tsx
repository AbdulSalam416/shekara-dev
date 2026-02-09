'use client';

import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react';
import { Node } from '../../../lib/types';
//@ts-ignore
import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape from 'cytoscape';
// @ts-ignore
import cola from 'cytoscape-cola';

import { Button, Input, Badge } from '@shekara-dev/ui';
import {
  Search,
  Filter,
  Layers,
  MousePointer2,
  Info,
  X,
  Target,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Globe,
  Zap,
  Activity,
  Award,
  TrendingUp,
} from 'lucide-react';
import { KnowledgeGraph as GraphType } from '../../../lib/types';
import {
  CentralityAnalysis,
  NodeScore,
} from '../../../services/centralityAnalysisService';
import { useGraphStore } from '../../../store/graphStore'; // Import useGraphStore

// Register the Cola layout extension
if (typeof window !== 'undefined') {
  Cytoscape.use(cola);
}

interface SelectedNodeInfo extends Node {
  connectedNodes: number;
  incomingEdges: number;
  outgoingEdges: number;
  color: string;
  degreeCentrality?: number;
  pageRank?: number;
  centralityRank?: number;
}

type ViewMode = 'all' | 'gaps-only' | 'focus' | 'centrality';
type NodeType =
  | 'Method'
  | 'Concept'
  | 'Dataset'
  | 'Metric'
  | 'Finding'
  | 'ResearchGap'
  | 'Technology';

interface KnowledgeGraphProps {
  graphData: GraphType;
  centralityAnalysis?: CentralityAnalysis | null;
}

const KnowledgeGraph = ({
  graphData,
  centralityAnalysis,
}: KnowledgeGraphProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<SelectedNodeInfo | null>(
    null
  );
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [hiddenNodeTypes, setHiddenNodeTypes] = useState<Set<NodeType>>(
    new Set()
  );
  const [showCentralityMode, setShowCentralityMode] = useState(false);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const { activeNodeId, setActiveNode } = useGraphStore(); // Get activeNodeId and setActiveNode from store

  const nodeColors: Record<NodeType, string> = {
    Method: '#3b82f6',
    Concept: '#8a5cf6',
    Dataset: '#10b981',
    Metric: '#be6e63',
    Finding: '#06b6d4',
    ResearchGap: '#ec4899',
    Technology: '#6366f1',
  };

  const centralityScores = useMemo(() => {
    if (!centralityAnalysis) return new Map<string, NodeScore>();

    const map = new Map<string, NodeScore>();
    centralityAnalysis.nodeScores.forEach((score) => {
      map.set(score.nodeId, score);
    });
    return map;
  }, [centralityAnalysis]);

  const getNodeSize = useCallback(
    (nodeId: string, baseDegree: number): number => {
      if (!showCentralityMode || !centralityAnalysis) {
        return Math.min(90, 45 + baseDegree * 2.5);
      }

      const score = centralityScores.get(nodeId);
      if (!score) return 45;

      const combinedScore = score.degreeCentrality * 0.5 + score.pageRank * 0.5;
      return Math.min(120, 40 + combinedScore * 80);
    },
    [showCentralityMode, centralityAnalysis, centralityScores]
  );

  const getNodeColor = useCallback(
    (nodeId: string, type: NodeType): string => {
      const baseColor = nodeColors[type] || '#64748b';

      if (!showCentralityMode || !centralityAnalysis) {
        return baseColor;
      }

      const score = centralityScores.get(nodeId);
      if (!score) return baseColor;

      const isTopNode = centralityAnalysis.mostInfluential
        .slice(0, Math.ceil(centralityAnalysis.nodeScores.length * 0.1))
        .some((n) => n.nodeId === nodeId);

      if (isTopNode) {
        return '#f59e0b';
      }

      return baseColor;
    },
    [showCentralityMode, centralityAnalysis, centralityScores, nodeColors]
  );

  const getNodeBorderWidth = useCallback(
    (nodeId: string): number => {
      if (!showCentralityMode || !centralityAnalysis) return 2;

      const topNodes = centralityAnalysis.mostInfluential.slice(0, 10);
      const rank = topNodes.findIndex((n) => n.nodeId === nodeId);

      if (rank === 0) return 6;
      if (rank > 0 && rank < 3) return 5;
      if (rank >= 3 && rank < 10) return 4;

      return 2;
    },
    [showCentralityMode, centralityAnalysis]
  );

  const elements = useMemo(() => {
    let nodes = graphData.nodes;

    if (viewMode === 'centrality' && centralityAnalysis) {
      const topNodeIds = new Set(
        centralityAnalysis.mostInfluential.slice(0, 20).map((n) => n.nodeId)
      );
      nodes = nodes.filter((n) => topNodeIds.has(n.id));
    } else if (viewMode === 'gaps-only') {
      const gapIds = new Set(
        nodes.filter((n) => n.type === 'ResearchGap').map((n) => n.id)
      );
      const connectedToGaps = new Set<string>();
      graphData.relationships.forEach((rel) => {
        if (gapIds.has(rel.source)) connectedToGaps.add(rel.target);
        if (gapIds.has(rel.target)) connectedToGaps.add(rel.source);
      });
      gapIds.forEach((id) => connectedToGaps.add(id));
      nodes = nodes.filter((n) => connectedToGaps.has(n.id));
    } else if (viewMode === 'focus' && activeNodeId) { // Use activeNodeId here
      const connectedIds = new Set<string>([activeNodeId]);
      graphData.relationships.forEach((rel) => {
        if (rel.source === activeNodeId) connectedIds.add(rel.target);
        if (rel.target === activeNodeId) connectedIds.add(rel.source);
      });
      nodes = nodes.filter((n) => connectedIds.has(n.id));
    }

    nodes = nodes.filter((n) => !hiddenNodeTypes.has(n.type as NodeType));

    if (searchQuery) {
      nodes = nodes.filter((n) =>
        n.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const nodeIds = new Set(nodes.map((n) => n.id));

    return [
      ...nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          properties: node.properties,
          centralityScore: centralityScores.get(node.id),
        },
        classes: node.type.toLowerCase(),
      })),
      ...graphData.relationships
        .filter((rel) => nodeIds.has(rel.source) && nodeIds.has(rel.target))
        .map((rel, index) => ({
          data: {
            id: `e-${rel.source}-${rel.target}-${index}`,
            source: rel.source,
            target: rel.target,
            label: rel.type,
            properties: rel.properties,
          },
          classes: rel.type === 'IDENTIFIES_GAP' ? 'gap-edge' : 'normal-edge',
        })),
    ];
  }, [
    searchQuery,
    viewMode,
    activeNodeId, // Use activeNodeId here
    hiddenNodeTypes,
    centralityAnalysis,
    centralityScores,
    graphData,
  ]);

  const stylesheet: cytoscape.StylesheetCSS[] = [
    {
      selector: 'node',
      css: {
        'background-color': (ele: any) =>
          getNodeColor(ele.data('id'), ele.data('type')),
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
        width: (ele: any) => getNodeSize(ele.data('id'), ele.degree()) + 'px',
        height: (ele: any) => getNodeSize(ele.data('id'), ele.degree()) + 'px',
        'border-width': (ele: any) => getNodeBorderWidth(ele.data('id')) + 'px',
        'border-color': '#ffffff',
        'overlay-padding': '4px',
        'transition-property':
          'background-color, border-color, border-width, opacity',
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
        color: '#94a3b8',
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
  ];

  const layout = {
    name: 'cola',
    animate: true,
    refresh: 1,
    maxSimulationTime: 3000,
    ungrabifyWhileSimulating: false,
    fit: true,
    padding: 50,
    randomize: false,
    nodeSpacing: (ele: any) => 30,
    edgeLength: (edge: any) =>
      edge.data('relType') === 'IDENTIFIES_GAP' ? 100 : 180,
    edgeSymDiffLength: undefined,
    edgeJaccardLength: undefined,
    unconstrIter: 40,
    userConstIter: 20,
    allConstIter: 20,
    avoidOverlap: true,
    handleDisconnected: true,
    convergenceThreshold: 0.01,
  };

  const handleCyReady = useCallback(
    (cy: cytoscape.Core) => {
      cyRef.current = cy;

      cy.on('tap', 'node', (evt) => {
        const node = evt.target;
        const nodeData: Node = node.data();
        // Set activeNodeId in store
        setActiveNode(nodeData.id);
      });

      cy.on('tap', (evt) => {
        if (evt.target === cy) {
          // Clear activeNodeId in store
          setActiveNode(null);
        }
      });
    },
    [setActiveNode]
  );

  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;
    cy.elements().removeClass('highlighted dimmed');

    if (activeNodeId) {
      const node = cy.getElementById(activeNodeId);
      if (node.nonempty()) {
        const neighborhood = node.closedNeighborhood();
        neighborhood.addClass('highlighted');
        cy.elements().not(neighborhood).addClass('dimmed');
        cy.animate({
          fit: {
            eles: node,
            padding: 100,
          },
          duration: 300,
        });

        // Also update selectedNode if not already set or different
        if (!selectedNode || selectedNode.id !== activeNodeId) {
          const nodeData: Node = node.data();
          const type = nodeData.type as NodeType;
          const centralityData = centralityScores.get(nodeData.id);
          const rank = centralityAnalysis?.mostInfluential.findIndex(
            (n) => n.nodeId === nodeData.id
          );
          setSelectedNode({
            id: nodeData.id,
            label: nodeData.label,
            type: nodeData.type,
            connectedNodes: node.neighborhood().nodes().length,
            incomingEdges: node.incomers('edge').length,
            outgoingEdges: node.outgoers('edge').length,
            color: nodeColors[type] || '#64748b',
            properties: nodeData.properties,
            degreeCentrality: centralityData?.degreeCentrality,
            pageRank: centralityData?.pageRank,
            centralityRank:
              rank !== undefined && rank >= 0 ? rank + 1 : undefined,
          });
        }
      }
    } else {
      // If activeNodeId is null, ensure selectedNode is also null
      setSelectedNode(null);
    }
  }, [activeNodeId, centralityScores, centralityAnalysis, nodeColors, selectedNode, cyRef.current]);

  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.layout(layout).run();
    }
  }, [elements]);

  return (
    <div className="w-full h-full bg-slate-50/30 relative overflow-hidden">
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col md:flex-row gap-2 pointer-events-none">
        <div className="relative flex-1 max-w-md pointer-events-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search research nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/90 backdrop-blur shadow-sm border-muted/60 h-10"
          />
        </div>

        <div className="flex gap-2 pointer-events-auto">
          {/* 🆕 Centrality Toggle */}
          {centralityAnalysis && (
            <Button
              variant={showCentralityMode ? 'default' : 'secondary'}
              size="sm"
              className=" backdrop-blur shadow-sm border-muted/60 h-10"
              onClick={() => setShowCentralityMode(!showCentralityMode)}
            >
              <Award className="w-4 h-4 mr-2" />
              {showCentralityMode ? 'Hide' : 'Show'} Centrality
            </Button>
          )}

          {/* 🆕 View Mode: Top Nodes Only */}
          {centralityAnalysis && (
            <Button
              variant={viewMode === 'centrality' ? 'default' : 'secondary'}
              size="sm"
              className=" backdrop-blur shadow-sm border-muted/60 h-10"
              onClick={() =>
                setViewMode(viewMode === 'centrality' ? 'all' : 'centrality')
              }
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Top Nodes
            </Button>
          )}

          <div className="flex bg-white/90 backdrop-blur p-1 rounded-md shadow-sm border border-muted/60">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)}
              className="h-8 w-8"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)}
              className="h-8 w-8"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => cyRef.current?.fit(undefined, 50)}
              className="h-8 w-8"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 backdrop-blur shadow-sm border-muted/60 h-10"
            onClick={() => cyRef.current?.layout(layout).run()}
          >
            <Activity className="w-4 h-4 mr-2" />
            Re-Layout
          </Button>
        </div>
      </div>

      {/* 🆕 Centrality Mode Indicator */}
      {showCentralityMode && (
        <div className="absolute top-20 left-4 z-10 pointer-events-auto">
          <div className="bg-amber-500/90 backdrop-blur px-3 py-2 rounded-lg shadow-lg border border-amber-600/50">
            <div className="flex items-center gap-2 text-white">
              <Award className="w-4 h-4" />
              <span className="text-xs font-bold">Centrality Mode Active</span>
            </div>
            <p className="text-[10px] text-amber-50 mt-1">
              Node size = Importance • Gold = Top 10%
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur p-3 rounded-xl shadow-sm border border-muted/60 min-w-[140px]">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Layers className="w-3 h-3" />
            Knowledge Types
          </div>
          <div className="space-y-1.5">
            {Object.entries(nodeColors).map(([type, color]) => (
              <div
                key={type}
                className={`flex items-center gap-2 cursor-pointer hover:bg-accent/50 px-1.5 py-1 rounded-md transition-colors ${
                  hiddenNodeTypes.has(type as NodeType) ? 'opacity-30' : ''
                }`}
                onClick={() => {
                  const newSet = new Set(hiddenNodeTypes);
                  if (newSet.has(type as NodeType))
                    newSet.delete(type as NodeType);
                  else newSet.add(type as NodeType);
                  setHiddenNodeTypes(newSet);
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[11px] font-medium text-foreground/80">
                  {type}
                </span>
              </div>
            ))}
          </div>

          {/* 🆕 Centrality Legend */}
          {showCentralityMode && (
            <>
              <div className="border-t border-muted/60 my-2"></div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Centrality
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-[11px] font-medium text-foreground/80">
                    Top 10%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-4 border-white bg-slate-400" />
                  <span className="text-[11px] font-medium text-foreground/80">
                    High Rank
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 🆕 Enhanced Node Info Panel with Centrality */}
      {selectedNode && (
        <div className="absolute bottom-8 right-8 z-20 w-80 pointer-events-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: selectedNode.color }}
                >
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm leading-tight">
                    {selectedNode.label}
                  </h2>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    {selectedNode.type}
                  </span>

                  {/* 🆕 Centrality Rank Badge */}
                  {selectedNode.centralityRank &&
                    selectedNode.centralityRank <= 10 && (
                      <Badge
                        variant="secondary"
                        className="mt-1 text-[9px] h-4 px-1.5"
                      >
                        <Award className="w-2.5 h-2.5 mr-1" />
                        Rank #{selectedNode.centralityRank}
                      </Badge>
                    )}
                </div>
              </div>
              <button
                onClick={() => {

                  setSelectedNode(null)
                setActiveNode(null)

                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Properties */}
            {selectedNode.properties.frequency && (
              <p className="text-[10px] text-slate-500 mb-1">
                Frequency:{' '}
                <span className="font-semibold">
                  {selectedNode.properties.frequency}
                </span>
              </p>
            )}
            {selectedNode.properties.importance && (
              <p className="text-[10px] text-slate-500 mb-1 capitalize">
                Importance:{' '}
                <span className="font-semibold">
                  {selectedNode.properties.importance}
                </span>
              </p>
            )}

            {selectedNode.properties.context && (
              <div className="mt-2 mb-4">
                <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">
                  Context
                </p>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  {selectedNode.properties.context}
                </p>
              </div>
            )}

            {selectedNode.properties.paperId && (
              <div className="mt-2 mb-4">
                <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">
                  Source
                </p>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  {selectedNode.properties.paperId}
                </p>
              </div>
            )}

            {/* 🆕 Centrality Metrics */}
            {(selectedNode.degreeCentrality !== undefined ||
              selectedNode.pageRank !== undefined) && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-[9px] text-amber-700 uppercase font-bold mb-2 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Centrality Metrics
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedNode.degreeCentrality !== undefined && (
                    <div>
                      <div className="text-[9px] text-slate-500">
                        Connections
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {(selectedNode.degreeCentrality * 100).toFixed(0)}%
                      </div>
                    </div>
                  )}
                  {selectedNode.pageRank !== undefined && (
                    <div>
                      <div className="text-[9px] text-slate-500">Influence</div>
                      <div className="text-sm font-bold text-slate-900">
                        {(selectedNode.pageRank * 100).toFixed(0)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Edge counts */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">
                  Incoming
                </div>
                <div className="text-lg font-bold text-slate-700">
                  {selectedNode.incomingEdges}
                </div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">
                  Outgoing
                </div>
                <div className="text-lg font-bold text-slate-700">
                  {selectedNode.outgoingEdges}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 h-9 text-xs font-bold"
                onClick={() => {
                  setActiveNode(selectedNode.id); // Set activeNodeId in store
                  setViewMode('focus');
                }}
              >
                <Target className="w-3.5 h-3.5 mr-2" />
                Focus Path
              </Button>
              <Button
                variant="outline"
                className="h-9 px-3"
                onClick={() =>
                  window.open(
                    `https://scholar.google.com/scholar?q=${selectedNode.label}`,
                    '_blank'
                  )
                }
              >
                <Globe className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cytoscape Canvas */}
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '100%' }}
        stylesheet={stylesheet}
        layout={layout}
        cy={handleCyReady}
        wheelSensitivity={0.15}
      />
    </div>
  );
};

export default KnowledgeGraph;
