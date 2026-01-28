'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphData } from '../../../lib/types/graph';
import { defaultGraphData } from './lib/model';
import { Search, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { useSidebar } from '@shekara-dev/ui';

interface KnowledgeGraphVisualizerProps {
  graphData?: GraphData;
}

const KnowledgeGraphVisualizer: React.FC<KnowledgeGraphVisualizerProps> = ({ graphData: initialGraphData }) => {
  const graphRef = useRef<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const graphData = initialGraphData || defaultGraphData;
const {open} = useSidebar()
  const nodeColors = {
    Concept: '#60a5fa',
    Method: '#84cc16',
    Technology: '#84cc16',
    Finding: '#fbbf24',
    Metric: '#ef4444',
    ResearchGap: '#ec4899',
    Dataset: '#a78bfa',
    default: '#94a3b8'
  };

  const legendItems = [
    { label: 'Concept', color: '#60a5fa' },
    { label: 'Method', color: '#84cc16' },
    { label: 'Dataset', color: '#a78bfa' },
    { label: 'Finding', color: '#fbbf24' },
    { label: 'Metric', color: '#ef4444' },
    { label: 'ResearchGap', color: '#ec4899' },
    { label: 'Technology', color: '#84cc16' },
  ];

  // Transform data for react-force-graph
  const transformedData = {
    nodes: graphData.nodes.map(node => ({
      id: node.id,
      name: node.label || node.id,
      type: node.type,
      color: nodeColors[node.type] || nodeColors.default,
      val: 10
    })),
    links: graphData.relationships.map(rel => ({
      source: rel.source,
      target: rel.target,
      type: rel.type
    }))
  };

  // Filter nodes based on search and type
  const filteredData = {
    nodes: transformedData.nodes.filter(node => {
      const matchesSearch = searchQuery === '' ||
        node.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === null || node.type === selectedType;
      return matchesSearch && matchesType;
    }),
    links: transformedData.links.filter(link => {
      const sourceNode = transformedData.nodes.find(n => n.id === link.source);
      const targetNode = transformedData.nodes.find(n => n.id === link.target);
      const matchesSearch = searchQuery === '' ||
        sourceNode?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        targetNode?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === null ||
        sourceNode?.type === selectedType ||
        targetNode?.type === selectedType;
      return matchesSearch && matchesType;
    })
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query === '') {
      setHighlightNodes(new Set());
      return;
    }

    const matching = new Set(
      transformedData.nodes
        .filter(node => node.name.toLowerCase().includes(query.toLowerCase()))
        .map(node => node.id)
    );
    setHighlightNodes(matching);

    // Center on first matching node
    if (matching.size > 0 && graphRef.current) {
      const firstMatch = transformedData.nodes.find(n => matching.has(n.id));
      if (firstMatch) {
        graphRef.current.centerAt(firstMatch.x, firstMatch.y, 1000);
        graphRef.current.zoom(3, 1000);
      }
    }
  };

  const handleZoomIn = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom * 1.2, 300);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom / 1.2, 300);
    }
  };

  const handleFullscreen = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  };

  return (
    <div className="relative  bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-80 px-4 py-2.5 pr-20 bg-white rounded-lg shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <Search className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>
      <div className="absolute top-6 right-6 z-10 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2.5 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2.5 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={handleFullscreen}
          className="p-2.5 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
          title="Fit to Screen"
        >
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </button>
      </div>



      {/* Legend */}
      <div className="absolute bottom-8 left-8 z-10 bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Legend
        </div>
        <div className="space-y-2.5">
          {legendItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
              onClick={() => {
                if (graphRef.current) {
                  const currentZoom = graphRef.current.zoom();
                  graphRef.current.zoom(currentZoom * 1.2, 300);
                }
                setSelectedType(selectedType === item.label ? null : item.label)}
            }
            >
              <div className="relative">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: item.color }}
                >
                  <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
                    <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" />
                  </svg>
                </div>
                {selectedType === item.label && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
              <span className="text-sm text-gray-700 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Graph */}
      <ForceGraph2D
        ref={graphRef}
        graphData={filteredData}
        width={ open ?  window.innerWidth - 384 : window.innerWidth }
        height={920}
        backgroundColor="#f9fafb"
        nodeRelSize={6}
        nodeVal={node => highlightNodes.has(node.id) ? 15 : 10}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        linkWidth={link => {
          const sourceHighlight = highlightNodes.has(link.source);
          const targetHighlight = highlightNodes.has(link.target);
          return sourceHighlight || targetHighlight ? 3 : 1.5;
        }}
        linkColor={link => {
          const sourceHighlight = highlightNodes.has(link.source);
          const targetHighlight = highlightNodes.has(link.target);
          return sourceHighlight || targetHighlight ? '#3b82f6' : '#e5e7eb';
        }}
        linkLabel={link => link.type}
        linkCurvature={0.15}
        cooldownTicks={100}
        onEngineStop={() => {
          if (graphRef.current) {
            graphRef.current.zoomToFit(400, 50);
          }
        }}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 13 / globalScale;
          const isHighlighted = highlightNodes.has(node.id);
          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, isHighlighted ? 8 : 6, 0, 2 * Math.PI);
          ctx.fillStyle = node.color;
          ctx.fill();

          // Draw white icon in center
          ctx.fillStyle = '#fff';
          ctx.font = `bold ${fontSize * 0.8}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⚪️', node.x, node.y);

          // Draw label background
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const padding = fontSize * 0.4;
          const bckgDimensions = [textWidth + padding * 2, fontSize + padding];

          ctx.fillStyle = isHighlighted ? 'rgba(59, 130, 246, 0.1)' : 'white';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
          ctx.shadowBlur = isHighlighted ? 8 : 4;
          ctx.shadowOffsetY = 2;

          const labelY = node.y + 9;
          ctx.fillRect(
            node.x - bckgDimensions[0] / 2,
            labelY - bckgDimensions[1] / 2,
            bckgDimensions[0],
            bckgDimensions[1]
          );

          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;

          // Draw label text
          ctx.fillStyle = isHighlighted ? '#1e40af' : '#374151';
          ctx.font = `${isHighlighted ? 'bold' : ''} ${fontSize}px Sans-Serif`;
          ctx.fillText(label, node.x, labelY);

          node.__bckgDimensions = bckgDimensions;
        }}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          const bckgDimensions = node.__bckgDimensions;
          const labelY = node.y + 12;
          if (bckgDimensions) {
            ctx.fillRect(
              node.x - bckgDimensions[0] / 2,
              labelY - bckgDimensions[1] / 2,
              bckgDimensions[0],
              bckgDimensions[1]
            );
          }
        }}
      />
    </div>
  );
};

export default KnowledgeGraphVisualizer;
