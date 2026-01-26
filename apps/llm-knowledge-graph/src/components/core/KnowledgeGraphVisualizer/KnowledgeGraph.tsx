'use client'


import React, { useState, useCallback, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphData } from '../../../lib/types/graph';
import { defaultGraphData } from './lib/model';

interface KnowledgeGraphVisualizerProps {
  graphData?: GraphData;
}

const KnowledgeGraphVisualizer: React.FC<KnowledgeGraphVisualizerProps> = ({ graphData: initialGraphData }) => {

  const graphRef = useRef();

  const graphData = initialGraphData || defaultGraphData;

  const nodeColors = {
    Concept: '#3b82f6',
    Method: '#8b5cf6',
    Technology: '#10b981',
    Finding: '#f59e0b',
    Metric: '#ef4444',
    ResearchGap: '#ec4899',
    default: '#6b7280'
  };

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


  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
<ForceGraph2D
  ref={graphRef}
  graphData={transformedData}
  nodeAutoColorBy="group"
  linkDirectionalArrowLength={3}
  linkDirectionalArrowRelPos={1}
  linkLabel={(node=>{
    return node.type;
  })}
  linkCurvature={0.2}
  cooldownTicks={100}
  nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.name;
                const fontSize = 12/globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = node.color;
                ctx.fillText(label, node.x, node.y);
                node.__bckgDimensions = bckgDimensions;
              }}
  nodePointerAreaPaint={(node, color, ctx) => {
    ctx.fillStyle = color;
    const bckgDimensions = node.__bckgDimensions;
    bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
  }}/>
    </div>
  );
};

export default KnowledgeGraphVisualizer;
