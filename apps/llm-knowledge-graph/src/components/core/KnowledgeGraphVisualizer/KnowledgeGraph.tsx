'use client'

import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
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
  Activity
} from 'lucide-react';
import { KnowledgeGraph as GraphType } from '../../../lib/types/graph';

// Register the Cola layout extension
if (typeof window !== 'undefined') {
  Cytoscape.use(cola);
}

// Type definitions
interface NodeData {
  id: string;
  label: string;
  type: string;
}

interface SelectedNodeInfo extends NodeData {
  connectedNodes: number;
  incomingEdges: number;
  outgoingEdges: number;
  color: string;
}

type ViewMode = 'all' | 'gaps-only' | 'methods-only' | 'focus';
type NodeType = 'Method' | 'Concept' | 'Dataset' | 'Metric' | 'Finding' | 'ResearchGap' | 'Technology';



const KnowledgeGraph = ({graphData}:{graphData:GraphType}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<SelectedNodeInfo | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [hiddenNodeTypes, setHiddenNodeTypes] = useState<Set<NodeType>>(new Set());
  const cyRef = useRef<cytoscape.Core | null>(null);

  const nodeColors: Record<NodeType, string> = {
    Method: '#3b82f6',
    Concept: '#8b5cf6',
    Dataset: '#10b981',
    Metric: '#f59e0b',
    Finding: '#06b6d4',
    ResearchGap: '#ec4899',
    Technology: '#6366f1',
  };

  const elements = useMemo(() => {
    let nodes = graphData.nodes;

    if (viewMode === 'gaps-only') {
      const gapIds = new Set(nodes.filter(n => n.type === 'ResearchGap').map(n => n.id));
      const connectedToGaps = new Set<string>();
      graphData.relationships.forEach(rel => {
        if (gapIds.has(rel.source)) connectedToGaps.add(rel.target);
        if (gapIds.has(rel.target)) connectedToGaps.add(rel.source);
      });
      gapIds.forEach(id => connectedToGaps.add(id));
      nodes = nodes.filter(n => connectedToGaps.has(n.id));
    } else if (viewMode === 'focus' && focusedNodeId) {
      const connectedIds = new Set<string>([focusedNodeId]);
      graphData.relationships.forEach(rel => {
        if (rel.source === focusedNodeId) connectedIds.add(rel.target);
        if (rel.target === focusedNodeId) connectedIds.add(rel.source);
      });
      nodes = nodes.filter(n => connectedIds.has(n.id));
    }

    nodes = nodes.filter(n => !hiddenNodeTypes.has(n.type as NodeType));

    if (searchQuery) {
      nodes = nodes.filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    const nodeIds = new Set(nodes.map(n => n.id));

    return [
      ...nodes.map(node => ({
        data: { id: node.id, label: node.label, type: node.type },
        classes: node.type.toLowerCase(),
      })),
      ...graphData.relationships
        .filter(rel => nodeIds.has(rel.source) && nodeIds.has(rel.target))
        .map((rel, index) => ({
          data: {
            id: `e-${rel.source}-${rel.target}-${index}`,
            source: rel.source,
            target: rel.target,
            label: rel.type,
          },
          classes: rel.type === 'IDENTIFIES_GAP' ? 'gap-edge' : 'normal-edge',
        })),
    ];
  }, [searchQuery, viewMode, focusedNodeId, hiddenNodeTypes]);

  const stylesheet: cytoscape.StylesheetCSS[] = [
    {
      selector: 'node',
      css: {
        'background-color': (ele: any) => nodeColors[ele.data('type') as NodeType] || '#64748b',
        'label': 'data(label)',
        'text-wrap': 'wrap',
        'text-max-width': '100px',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': '10px',
        'font-weight': '700',
        'color': '#1e293b',
        'text-outline-color': '#ffffff',
        'text-outline-width': '2px',
        'width': (ele: any) => Math.min(90, 45 + ele.degree() * 2.5) + 'px',
        'height': (ele: any) => Math.min(90, 45 + ele.degree() * 2.5) + 'px',
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
        'shape': 'hexagon',
        'border-width': '3px',
        'border-color': '#be185d',
      } as any,
    },
    {
      selector: 'edge',
      css: {
        'width': 1.5,
        'line-color': '#cbd5e1',
        'target-arrow-color': '#cbd5e1',
        'target-arrow-shape': 'vee',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '8px',
        'text-rotation': 'autorotate',
        'color': '#94a3b8',
        'text-outline-color': '#ffffff',
        'text-outline-width': '1px',
        'opacity': 0.6,
      } as any,
    },
    {
      selector: 'edge.gap-edge',
      css: {
        'line-color': '#ec4899',
        'target-arrow-color': '#ec4899',
        'width': 2.5,
        'line-style': 'dashed',
      } as any,
    },
    {
      selector: 'node.highlighted',
      css: {
        'border-width': '4px',
        'border-color': '#f59e0b',
        'opacity': 1,
        'z-index': 10,
      } as any,
    },
    {
      selector: 'node.dimmed',
       css: { 'opacity': 0.15 } as any,
    },
    {
      selector: 'edge.dimmed',
      css  : { 'opacity': 0.05 } as any,
    },
  ];

  // Professional Cola Layout Configuration
  const layout = {
    name: 'cola',
    animate: true,
    refresh: 1,
    maxSimulationTime: 3000,
    ungrabifyWhileSimulating: false,
    fit: true,
    padding: 50,
    randomize: false,

    // Cola specific parameters
    nodeSpacing: (ele: any) => 30,
    edgeLength: (edge: any) => edge.data('relType') === 'IDENTIFIES_GAP' ? 100 : 180,
    edgeSymDiffLength: undefined,
    edgeJaccardLength: undefined,
    unconstrIter: 40,
    userConstIter: 20,
    allConstIter: 20,

    // Constraints
    avoidOverlap: true,
    handleDisconnected: true,
    convergenceThreshold: 0.01,
  };

  const handleCyReady = useCallback((cy: cytoscape.Core) => {
    cyRef.current = cy;

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const nodeData = node.data();
      const type = nodeData.type as NodeType;

      setSelectedNode({
        id: nodeData.id,
        label: nodeData.label,
        type: nodeData.type,
        connectedNodes: node.neighborhood().nodes().length,
        incomingEdges: node.incomers('edge').length,
        outgoingEdges: node.outgoers('edge').length,
        color: nodeColors[type] || '#64748b',
      });

      cy.elements().removeClass('highlighted dimmed');
      const neighborhood = node.closedNeighborhood();
      neighborhood.addClass('highlighted');
      cy.elements().not(neighborhood).addClass('dimmed');
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        cy.elements().removeClass('highlighted dimmed');
      }
    });
  }, []);

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
          <div className="flex bg-white/90 backdrop-blur p-1 rounded-md shadow-sm border border-muted/60">
            <Button variant="ghost" size="icon" onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)} className="h-8 w-8"><ZoomIn className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)} className="h-8 w-8"><ZoomOut className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => cyRef.current?.fit(undefined, 50)} className="h-8 w-8"><Maximize2 className="w-4 h-4" /></Button>
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
                className={`flex items-center gap-2 cursor-pointer hover:bg-accent/50 px-1.5 py-1 rounded-md transition-colors ${hiddenNodeTypes.has(type as NodeType) ? 'opacity-30' : ''}`}
                onClick={() => {
                  const newSet = new Set(hiddenNodeTypes);
                  if (newSet.has(type as NodeType)) newSet.delete(type as NodeType);
                  else newSet.add(type as NodeType);
                  setHiddenNodeTypes(newSet);
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[11px] font-medium text-foreground/80">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Node Info Panel */}
      {selectedNode && (
        <div className="absolute bottom-8 right-8 z-20 w-80 pointer-events-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md" style={{ backgroundColor: selectedNode.color }}>
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm leading-tight">{selectedNode.label}</h2>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{selectedNode.type}</span>
                </div>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Incoming</div>
                <div className="text-lg font-bold text-slate-700">{selectedNode.incomingEdges}</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Outgoing</div>
                <div className="text-lg font-bold text-slate-700">{selectedNode.outgoingEdges}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 h-9 text-xs font-bold"
                onClick={() => {
                  setFocusedNodeId(selectedNode.id);
                  setViewMode('focus');
                }}
              >
                <Target className="w-3.5 h-3.5 mr-2" />
                Focus Path
              </Button>
              <Button variant="outline" className="h-9 px-3" onClick={() => window.open(`https://scholar.google.com/scholar?q=${selectedNode.label}`, '_blank')}>
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
