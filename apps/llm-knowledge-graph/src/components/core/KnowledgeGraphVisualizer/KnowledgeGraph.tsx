'use client';

import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useImperativeHandle,
} from 'react';

import { Button, Input, Badge } from '@shekara-dev/ui';
import {
  Search,
  Layers,
  Info,
  X,
  Target,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Globe,
  Activity,
  Award,
  TrendingUp,
  Circle,
  Box,
  Network,
} from 'lucide-react';

import { KnowledgeGraph as GraphType } from '../../../lib/types';
import {
  CentralityAnalysis,
  NodeScore,
} from '../../../services/centralityAnalysisService';
import { useGraphStore } from '../../../store/graphStore';

import { ForceGraphNode } from './types';
import { NODE_COLORS } from './config';
import {
  adaptToForceGraph,
  filterGapsOnly,
  filterFocusMode,
  filterCentralityMode,
  applyHiddenTypes,
  applySearchFilter,
} from './utils/dataAdapter';
import { useDimensions } from './hooks/useDimensions';
import { useNodeSelection } from './hooks/useNodeSelection';
import { GraphCanvas, GraphRenderer } from './components/GraphCanvas';
import type { NodeStyleOverride } from './components/GraphCanvas';

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = 'all' | 'gaps-only' | 'focus' | 'centrality';

type NodeType =
  | 'Method'
  | 'Concept'
  | 'Dataset'
  | 'Metric'
  | 'Finding'
  | 'ResearchGap'
  | 'Technology';

export interface KnowledgeGraphRef {
  toImage: () => Promise<string | null>;
}

interface KnowledgeGraphProps {
  graphData: GraphType;
  centralityAnalysis?: CentralityAnalysis | null;
}

// Renderer options for the toggle bar
const RENDERER_OPTIONS: { value: GraphRenderer; label: string; title: string; icon: React.ReactNode }[] = [
  { value: 'force-2d', label: '2D', title: 'Force Graph 2D (Canvas)', icon: <Circle className="w-3.5 h-3.5" /> },
  { value: 'force-3d', label: '3D', title: 'Force Graph 3D (Three.js)', icon: <Box className="w-3.5 h-3.5" /> },
  { value: 'cytoscape', label: 'Classic', title: 'Cytoscape (Cola layout)', icon: <Network className="w-3.5 h-3.5" /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

const KnowledgeGraph = React.forwardRef<KnowledgeGraphRef, KnowledgeGraphProps>(
  ({ graphData, centralityAnalysis }, ref) => {
    // ── UI state ──────────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('all');
    const [hiddenNodeTypes, setHiddenNodeTypes] = useState<Set<NodeType>>(new Set());
    const [showCentralityMode, setShowCentralityMode] = useState(false);
    const [showLabels, setShowLabels] = useState(true);
    const [renderer, setRenderer] = useState<GraphRenderer>('force-2d');

    // ── Refs ──────────────────────────────────────────────────────────────
    const containerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const graphRef = useRef<any>(null);

    // ── Store ─────────────────────────────────────────────────────────────
    const { activeNodeId, setActiveNode } = useGraphStore();

    // ── Dimensions (tracks container size for canvas) ─────────────────────
    const { width, height } = useDimensions(containerRef);

    // ── Centrality data ───────────────────────────────────────────────────
    const centralityScores = useMemo(() => {
      const map = new Map<string, NodeScore>();
      centralityAnalysis?.nodeScores.forEach((s) => map.set(s.nodeId, s));
      return map;
    }, [centralityAnalysis]);

    const topCentralityIds = useMemo(() => {
      if (!centralityAnalysis) return new Set<string>();
      const topCount = Math.ceil(centralityAnalysis.nodeScores.length * 0.1);
      return new Set(
        centralityAnalysis.mostInfluential.slice(0, topCount).map((n) => n.nodeId)
      );
    }, [centralityAnalysis]);

    // ── Full (unfiltered) graph data — used for edge-count in node info panel
    const fullData = useMemo(
      () => adaptToForceGraph(graphData),
      [graphData]
    );

    // ── Filtered + adapted graph data shown in the canvas ────────────────
    const displayData = useMemo(() => {
      let data;

      if (viewMode === 'gaps-only') {
        data = filterGapsOnly(graphData);
      } else if (viewMode === 'focus' && activeNodeId) {
        data = filterFocusMode(graphData, activeNodeId);
      } else if (viewMode === 'centrality' && centralityAnalysis) {
        const topIds = new Set(
          centralityAnalysis.mostInfluential.slice(0, 20).map((n) => n.nodeId)
        );
        data = filterCentralityMode(graphData, topIds);
      } else {
        data = adaptToForceGraph(graphData);
      }

      data = applyHiddenTypes(data, hiddenNodeTypes as Set<string>);
      data = applySearchFilter(data, searchQuery);

      return data;
    }, [
      graphData,
      viewMode,
      activeNodeId,
      hiddenNodeTypes,
      searchQuery,
      centralityAnalysis,
    ]);

    // ── Per-node style overrides for centrality mode ──────────────────────
    const nodeStyleOverrides = useMemo((): Map<string, NodeStyleOverride> | undefined => {
      if (!showCentralityMode || !centralityAnalysis) return undefined;

      const map = new Map<string, NodeStyleOverride>();
      displayData.nodes.forEach((node) => {
        const score = centralityScores.get(node.id);
        if (!score) return;

        const isTop = topCentralityIds.has(node.id);
        const combined = score.degreeCentrality * 0.5 + score.pageRank * 0.5;

        map.set(node.id, {
          color: isTop ? '#f59e0b' : undefined,
          size: Math.min(3, 0.8 + combined * 4),
        });
      });
      return map;
    }, [
      showCentralityMode,
      centralityAnalysis,
      displayData.nodes,
      centralityScores,
      topCentralityIds,
    ]);

    // ── Node selection ────────────────────────────────────────────────────
    const { selectedNode, selectedNodeInfo } = useNodeSelection(
      displayData,
      fullData,
      centralityAnalysis ?? null,
      centralityScores
    );

    // ── Event handlers ────────────────────────────────────────────────────
    const handleNodeClick = useCallback(
      (node: ForceGraphNode) => {
        setActiveNode(node.id);
      },
      [setActiveNode]
    );

    const handleBackgroundClick = useCallback(() => {
      setActiveNode(null);
    }, [setActiveNode]);

    const handleFocusPath = useCallback(
      (nodeId: string) => {
        setActiveNode(nodeId);
        setViewMode('focus');
        if (renderer !== 'cytoscape' && graphRef.current) {
          const node = fullData.nodes.find((n) => n.id === nodeId);
          if (node?.x !== undefined && node?.y !== undefined) {
            graphRef.current.centerAt(node.x, node.y, 500);
            graphRef.current.zoom(2.5, 500);
          }
        }
      },
      [setActiveNode, renderer, fullData.nodes]
    );

    const handleToggleNodeType = useCallback((type: NodeType) => {
      setHiddenNodeTypes((prev) => {
        const next = new Set(prev);
        if (next.has(type)) next.delete(type);
        else next.add(type);
        return next;
      });
    }, []);

    // ── Renderer-aware imperative controls ────────────────────────────────
    const handleZoomIn = useCallback(() => {
      if (!graphRef.current) return;
      if (renderer === 'cytoscape') {
        graphRef.current.zoom(graphRef.current.zoom() * 1.2);
        graphRef.current.center();
      } else {
        graphRef.current.zoom(graphRef.current.zoom() * 1.2, 200);
      }
    }, [renderer]);

    const handleZoomOut = useCallback(() => {
      if (!graphRef.current) return;
      if (renderer === 'cytoscape') {
        graphRef.current.zoom(graphRef.current.zoom() * 0.8);
        graphRef.current.center();
      } else {
        graphRef.current.zoom(graphRef.current.zoom() * 0.8, 200);
      }
    }, [renderer]);

    const handleFit = useCallback(() => {
      if (!graphRef.current) return;
      if (renderer === 'cytoscape') {
        graphRef.current.fit(undefined, 50);
      } else {
        graphRef.current.zoomToFit(400, 50);
      }
    }, [renderer]);

    const handleReLayout = useCallback(() => {
      if (!graphRef.current) return;
      if (renderer === 'cytoscape') {
        graphRef.current.layout({
          name: 'cola',
          animate: true,
          maxSimulationTime: 3000,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          nodeSpacing: () => 30,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          edgeLength: (e: any) => (e.data('relType') === 'IDENTIFIES_GAP' ? 100 : 180),
        }).run();
      } else {
        graphRef.current.d3ReheatSimulation();
      }
    }, [renderer]);

    const handleSetRenderer = useCallback((r: GraphRenderer) => {
      graphRef.current = null;
      setRenderer(r);
    }, []);

    // ── Exposed ref API ───────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      toImage: async () => {
        const canvas = containerRef.current?.querySelector('canvas');
        if (!canvas) return null;
        return (canvas as HTMLCanvasElement)
          .toDataURL('image/png')
          .replace(/^data:image\/png;base64,/, '');
      },
    }));

    // ── Node types for the legend ─────────────────────────────────────────
    const nodeTypeEntries = Object.entries(NODE_COLORS).filter(
      ([type]) => type !== 'Default'
    ) as [NodeType, string][];

    // ─────────────────────────────────────────────────────────────────────────
    return (
      <div className="w-full h-full bg-slate-50/30 relative overflow-hidden">

        {/* ── Top controls ──────────────────────────────────────────── */}
        <div className="absolute top-4 left-4 right-4 z-10 flex flex-col md:flex-row gap-2 pointer-events-none">

          {/* Search */}
          <div className="relative  flex-1 max-w-md pointer-events-auto">
            {/*<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />*/}
            <Input
              placeholder="Search research nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9  backdrop-blur shadow-sm border-muted/60 h-10"
            />
          </div>

          <div className="flex gap-2 pointer-events-auto flex-wrap">

            {/* ── Renderer toggle ──────────────────────────────────── */}
            <div className="flex backdrop-blur rounded-md shadow-sm border border-muted/60 overflow-hidden">
              {RENDERER_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={renderer === opt.value ? 'default' : 'ghost'}
                  size="sm"
                  className="h-10 rounded-none border-0 px-3 gap-1.5"
                  title={opt.title}
                  onClick={() => handleSetRenderer(opt.value)}
                >
                  {opt.icon}
                  <span className="text-xs">{opt.label}</span>
                </Button>
              ))}
            </div>

            {/* Centrality toggle */}
            {centralityAnalysis && (
              <Button
                variant={showCentralityMode ? 'default' : 'secondary'}
                size="sm"
                className="backdrop-blur shadow-sm border-muted/60 h-10"
                onClick={() => setShowCentralityMode((v) => !v)}
              >
                <Award className="w-4 h-4 mr-2" />
                {showCentralityMode ? 'Hide' : 'Show'} Centrality
              </Button>
            )}

            {/* Top nodes (centrality view mode) */}
            {centralityAnalysis && (
              <Button
                variant={viewMode === 'centrality' ? 'default' : 'secondary'}
                size="sm"
                className="backdrop-blur shadow-sm border-muted/60 h-10"
                onClick={() =>
                  setViewMode((v) => (v === 'centrality' ? 'all' : 'centrality'))
                }
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Top Nodes
              </Button>
            )}

            {/* Gaps only view */}
            <Button
              variant={viewMode === 'gaps-only' ? 'default' : 'secondary'}
              size="sm"
              className="backdrop-blur shadow-sm border-muted/60 h-10"
              onClick={() =>
                setViewMode((v) => (v === 'gaps-only' ? 'all' : 'gaps-only'))
              }
            >
              Gaps Only
            </Button>

            {/* Zoom controls */}
            <div className="flex backdrop-blur p-1 rounded-md shadow-sm border border-muted/60">
              <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8" title="Zoom in">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8" title="Zoom out">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleFit} className="h-8 w-8" title="Fit to view">
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Re-layout */}
            <Button
              variant="secondary"
              size="sm"
              className="backdrop-blur shadow-sm border-muted/60 h-10"
              onClick={handleReLayout}
            >
              <Activity className="w-4 h-4 mr-2" />
              Re-Layout
            </Button>
          </div>
        </div>

        {/* ── Centrality mode indicator ──────────────────────────────── */}
        {showCentralityMode && (
          <div className="absolute top-20 left-4 z-10 pointer-events-auto">
            <div className="bg-amber-500/90 backdrop-blur px-3 py-2 rounded-lg shadow-lg border border-amber-600/50">
              <div className="flex items-center gap-2 ">
                <Award className="w-4 h-4" />
                <span className="text-xs font-bold">Centrality Mode Active</span>
              </div>
              <p className="text-[10px] text-amber-50 mt-1">
                Node size = Importance • Gold = Top 10%
              </p>
            </div>
          </div>
        )}

        {/* ── Legend ────────────────────────────────────────────────── */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-auto">
          <div className="backdrop-blur p-3 rounded-xl shadow-sm border border-muted/60 min-w-[140px]">
            <div className="text-[10px] font-bold
             uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Layers className="w-3 h-3" />
              Knowledge Types
            </div>
            <div className="space-y-1.5">
              {nodeTypeEntries.map(([type, color]) => (
                <div
                  key={type}
                  className={`flex items-center gap-2 cursor-pointer hover:bg-accent/50 px-1.5 py-1 rounded-md transition-colors ${
                    hiddenNodeTypes.has(type) ? 'opacity-30' : ''
                  }`}
                  onClick={() => handleToggleNodeType(type)}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[11px] font-medium ">{type}</span>
                </div>
              ))}
            </div>

            {showCentralityMode && (
              <>
                <div className="border-t border-muted/60 my-2" />
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Centrality
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
                    <span className="text-[11px] font-medium text-foreground/80">Top 10%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-4 border-white bg-slate-400 flex-shrink-0" />
                    <span className="text-[11px] font-medium text-foreground/80">High Rank</span>
                  </div>
                </div>
              </>
            )}
            {/* Active renderer indicator */}
            <div className="border-t border-muted/60 mt-2 pt-2">
              <div className="text-[10px] text-muted-foreground">
                Renderer:{' '}
                <span className="font-semibold">
                  {RENDERER_OPTIONS.find((r) => r.value === renderer)?.title ?? renderer}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Node info panel ────────────────────────────────────────── */}
        {selectedNodeInfo && (
          <div className="absolute bottom-8 right-8 z-20 w-80 pointer-events-auto">
            <div className=" rounded-2xl shadow-2xl border border-slate-200 p-5 animate-in slide-in-from-bottom-4 duration-300">

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md flex-shrink-0"
                    style={{ backgroundColor: selectedNodeInfo.color }}
                  >
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm leading-tight">
                      {selectedNodeInfo.label}
                    </h2>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {selectedNodeInfo.type}
                    </span>
                    {selectedNodeInfo.centralityRank &&
                      selectedNodeInfo.centralityRank <= 10 && (
                        <Badge
                          variant="secondary"
                          className="mt-1 text-[9px] h-4 px-1.5 ml-1"
                        >
                          <Award className="w-2.5 h-2.5 mr-1" />
                          Rank #{selectedNodeInfo.centralityRank}
                        </Badge>
                      )}
                  </div>
                </div>
                <button
                  onClick={() => setActiveNode(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Properties */}
              {selectedNodeInfo.properties.frequency && (
                <p className="text-[10px] text-slate-500 mb-1">
                  Frequency:{' '}
                  <span className="font-semibold">{selectedNodeInfo.properties.frequency}</span>
                </p>
              )}
              {selectedNodeInfo.properties.importance && (
                <p className="text-[10px] text-slate-500 mb-1 capitalize">
                  Importance:{' '}
                  <span className="font-semibold">{selectedNodeInfo.properties.importance}</span>
                </p>
              )}
              {selectedNodeInfo.properties.context && (
                <div className="mt-2 mb-4">
                  <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Context</p>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {selectedNodeInfo.properties.context}
                  </p>
                </div>
              )}
              {selectedNodeInfo.properties.paperId && (
                <div className="mt-2 mb-4">
                  <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Source</p>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {selectedNodeInfo.properties.paperId}
                  </p>
                </div>
              )}

              {/* Centrality metrics */}
              {(selectedNodeInfo.degreeCentrality !== undefined ||
                selectedNodeInfo.pageRank !== undefined) && (
                <div className="mb-4 p-3  border border-amber-200 rounded-lg">
                  <div className="text-[9px] text-amber-700 uppercase font-bold mb-2 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Centrality Metrics
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedNodeInfo.degreeCentrality !== undefined && (
                      <div>
                        <div className="text-[9px] text-slate-500">Connections</div>
                        <div className="text-sm font-bold text-slate-900">
                          {(selectedNodeInfo.degreeCentrality * 100).toFixed(0)}%
                        </div>
                      </div>
                    )}
                    {selectedNodeInfo.pageRank !== undefined && (
                      <div>
                        <div className="text-[9px] text-slate-500">Influence</div>
                        <div className="text-sm font-bold text-slate-900">
                          {(selectedNodeInfo.pageRank * 100).toFixed(0)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Edge counts */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className=" p-2 rounded-lg border border-slate-100">
                  <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">
                    Incoming
                  </div>
                  <div className="text-lg font-bold text-slate-700">
                    {selectedNodeInfo.incomingEdges}
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">
                    Outgoing
                  </div>
                  <div className="text-lg font-bold text-slate-700">
                    {selectedNodeInfo.outgoingEdges}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  className="flex-1 h-9 text-xs font-bold"
                  onClick={() => handleFocusPath(selectedNodeInfo.node.id)}
                >
                  <Target className="w-3.5 h-3.5 mr-2" />
                  Focus Path
                </Button>
                <Button
                  variant="outline"
                  className="h-9 px-3"
                  onClick={() =>
                    window.open(
                      `https://scholar.google.com/scholar?q=${encodeURIComponent(selectedNodeInfo.label)}`,
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

        {/* ── Graph canvas ────────────────────────────────────────── */}
        <div ref={containerRef} className="w-full h-full">
          {/* Force renderers need measured dimensions; Cytoscape fills container naturally */}
          {(renderer !== 'cytoscape' ? width > 0 && height > 0 : true) && (
            <GraphCanvas
              renderer={renderer}
              data={displayData}
              width={width}
              height={height}
              showLabels={showLabels}
              selectedNode={selectedNode}
              activeNodeId={activeNodeId}
              onNodeClick={handleNodeClick}
              onBackgroundClick={handleBackgroundClick}
              isDark={false}
              nodeStyleOverrides={nodeStyleOverrides}
              graphRef={graphRef}
            />
          )}
        </div>
      </div>
    );
  }
);

KnowledgeGraph.displayName = 'KnowledgeGraph';

export default KnowledgeGraph;
