'use client'

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from '@shekara-dev/ui';
import { Zap, AlertCircle } from 'lucide-react';

const GapNode = ({ data, selected }: NodeProps) => {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <Card className={`min-w-[180px] border-2 border-dashed border-pink-400 bg-pink-50/50 shadow-lg transition-all ${selected ? 'ring-2 ring-pink-500' : ''}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-pink-600">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Research Gap</span>
            </div>
            <div className="px-1.5 py-0.5 rounded bg-pink-500 text-[8px] font-bold text-white uppercase">
              High Impact
            </div>
          </div>
          <h3 className="text-xs font-bold text-pink-900 leading-tight mb-1">
            {data.label}
          </h3>
          <p className="text-[9px] text-pink-700/70 leading-relaxed italic">
            "No existing literature combines these concepts."
          </p>
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />

      {/* Decorative pulse effect */}
      <div className="absolute -inset-1 bg-pink-400/20 rounded-xl animate-pulse -z-10" />
    </div>
  );
};

export default memo(GapNode);
