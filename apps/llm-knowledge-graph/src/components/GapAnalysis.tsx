'use client'

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@shekara-dev/ui';
import { Zap, Info, BarChart3, Lightbulb, ExternalLink, Download } from 'lucide-react';

const GAPS_DATA = [
  {
    id: 1,
    impact: 'High',
    title: 'Vision Transformers + Few-Shot Learning',
    why: 'Both concepts appear frequently but have never been combined in research. This represents a novel research opportunity.',
    evidence: [
      { label: 'Vision Transformers', value: '12 papers' },
      { label: 'Few-Shot Learning', value: '8 papers' },
      { label: 'Combined', value: '0 papers', alert: true },
    ],
    question: 'Can vision transformers improve few-shot learning performance?',
  },
  {
    id: 2,
    impact: 'Medium',
    title: 'Self-Supervised Contrastive Learning in Medical Imaging',
    why: 'While contrastive learning is huge in general CV, its application to specific medical imaging benchmarks remains sparse.',
    evidence: [
      { label: 'Contrastive Learning', value: '15 papers' },
      { label: 'Medical Imaging', value: '22 papers' },
      { label: 'Intersection', value: '2 papers' },
    ],
    question: 'How does SimCLR scale to high-resolution MRI datasets?',
  }
];

const GapAnalysis = () => {
  return (
    <div className="flex flex-col h-full bg-background border-l">
      <div className="p-4 border-b sticky top-0 bg-background/95 backdrop-blur z-10 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Gap Analysis</h2>
          <p className="text-[10px] text-muted-foreground/70">Pattern-based identification</p>
        </div>
        <Select defaultValue="all" onValueChange={(value)=>console.log(value)}>
          <SelectTrigger className="w-[110px] h-7 text-[10px]">
            <SelectValue placeholder="Impact" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Impacts</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 md:pb-4">
        {GAPS_DATA.map((gap) => (
          <Card key={gap.id} className="overflow-hidden border-muted/60 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="p-3 pb-1">
              <div className="flex justify-between items-start mb-1">
                <Badge variant={gap.impact === 'High' ? 'destructive' : 'secondary'} className="text-[8px] px-1.5 py-0 h-4 uppercase font-bold">
                  <Zap className="w-2 h-2 mr-1 fill-current" />
                  {gap.impact} Impact
                </Badge>
              </div>
              <CardTitle className="text-xs font-bold leading-tight">{gap.title}</CardTitle>
            </CardHeader>

            <CardContent className="p-3 pt-1 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-primary text-[9px] font-bold uppercase tracking-wider">
                  <Info className="w-2.5 h-2.5" />
                  Context
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {gap.why}
                </p>
              </div>

              <div className="bg-slate-50 rounded-md p-2 space-y-1.5 border border-slate-100">
                <div className="flex items-center gap-1 text-slate-500 text-[9px] font-bold uppercase tracking-wider">
                  <BarChart3 className="w-2.5 h-2.5" />
                  Evidence
                </div>
                <div className="space-y-1">
                  {gap.evidence.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className={item.alert ? "font-bold text-pink-600" : "font-medium"}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-emerald-600 text-[9px] font-bold uppercase tracking-wider">
                  <Lightbulb className="w-2.5 h-2.5" />
                  Research Question
                </div>
                <p className="text-[11px] font-medium italic border-l-2 border-emerald-200 pl-2 py-0.5 text-slate-700">
                  "{gap.question}"
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px]">
                  <ExternalLink className="w-2.5 h-2.5 mr-1.5" />
                  Focus
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px]">
                  <Download className="w-2.5 h-2.5 mr-1.5" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GapAnalysis;
