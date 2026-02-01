'use client'

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from '@shekara-dev/ui';
import { Network, Zap, FileText, Lightbulb } from 'lucide-react';

const ResearchNode = ({ data, selected }: NodeProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Concept': return <Network className="w-3 h-3" />;
      case 'Method': return <Zap className="w-3 h-3" />;
      case 'ResearchGap': return <Lightbulb className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'Concept': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'Method': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'ResearchGap': return 'bg-pink-500/10 text-pink-600 border-pink-200 border-dashed';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="group">
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-slate-300 border-none" />
      <Card className={`min-w-[150px] max-w-[200px] shadow-sm transition-all duration-200 ${selected ? 'ring-2 ring-primary border-primary' : 'border-muted/60'} ${data.type === 'ResearchGap' ? 'border-dashed' : ''}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-md ${getTypeStyles(data.type)}`}>
              {getTypeIcon(data.type)}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {data.type}
            </span>
          </div>
          <h3 className="text-xs font-semibold leading-tight text-foreground">
            {data.label}
          </h3>
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-slate-300 border-none" />
    </div>
  );
};

export default memo(ResearchNode);
