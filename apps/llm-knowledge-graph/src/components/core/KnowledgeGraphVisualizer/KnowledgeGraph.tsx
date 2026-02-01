'use client'

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Panel,
  MarkerType,
  ReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button, Input, useSidebar } from '@shekara-dev/ui';
import { Search, Filter, Maximize2, Layers, MousePointer2 } from 'lucide-react';
import ResearchNode from './nodes/ResearchNode';
import GapNode from './nodes/GapNode';
import { defaultGraphData } from './lib/model';

const nodeTypes = {
  research: ResearchNode,
  gap: GapNode,
};

const KnowledgeGraph = () => {
  const { open, isMobile } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');

  // Initial transformation of your data to React Flow format
  const initialNodes = useMemo(() => {
    return defaultGraphData.nodes.map((node, index) => ({
      id: node.id,
      type: node.type === 'ResearchGap' ? 'gap' : 'research',
      data: { label: node.label, type: node.type },
      // Simple grid layout for initial render
      position: { x: (index % 4) * 250, y: Math.floor(index / 4) * 150 },
    }));
  }, []);

  const initialEdges = useMemo(() => {
    return defaultGraphData.relationships.map((rel, index) => ({
      id: `e-${index}`,
      source: rel.source,
      target: rel.target,
      label: rel.type,
      animated: rel.type === 'IDENTIFIES_GAP',
      style: { stroke: rel.type === 'IDENTIFIES_GAP' ? '#ec4899' : '#94a3b8' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: rel.type === 'IDENTIFIES_GAP' ? '#ec4899' : '#94a3b8',
      },
    }));
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    //@ts-ignore
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Filter nodes based on search
  useEffect(() => {
    if (!searchQuery) {
      setNodes((nds) => nds.map((n) => ({ ...n, hidden: false })));
      return;
    }
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        hidden: !n.data.label.toLowerCase().includes(searchQuery.toLowerCase()),
      }))
    );
  }, [searchQuery, setNodes]);

  return (
    <div className="w-full h-full bg-slate-50/30 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={(event, node)=>console.log("Node:", node)}
        fitView
        className="bg-slate-50/50"
      >
        <Background color="#cbd5e1" gap={20} />
        <Controls showInteractive={false} className="bg-white border-muted shadow-sm" />
        <MiniMap
          nodeStrokeColor={(n) => (n.type === 'gap' ? '#ec4899' : '#3b82f6')}
          nodeColor={(n) => (n.type === 'gap' ? '#fdf2f8' : '#eff6ff')}
          className="bg-white border-muted shadow-sm rounded-lg"
        />

        {/* Custom Controls Panel */}
        <Panel position="top-left" className="flex flex-col md:flex-row gap-2 w-[calc(100vw-40px)] md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/80 backdrop-blur shadow-sm border-muted/60 h-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="bg-white/80 backdrop-blur shadow-sm border-muted/60 h-10">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="secondary" size="sm" className="bg-white/80 backdrop-blur shadow-sm border-muted/60 h-10">
              <Layers className="w-4 h-4 mr-2" />
              Auto-Layout
            </Button>
          </div>
        </Panel>

        {/* Legend Panel */}
        <Panel position="bottom-left" className="hidden md:block">
          <div className="bg-white/80 backdrop-blur p-3 rounded-xl shadow-sm border border-muted/60 min-w-[140px]">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <MousePointer2 className="w-3 h-3" />
              Interactive Map
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-foreground/80">Concept</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-foreground/80">Method</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                <span className="text-xs font-medium text-foreground/80">Research Gap</span>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default KnowledgeGraph;
