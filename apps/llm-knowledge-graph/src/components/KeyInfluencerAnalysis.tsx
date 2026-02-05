'use client';

import React, { useState } from 'react';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shekara-dev/ui';
import {
  Award,
  TrendingUp,
  Link as LinkIcon,
  ExternalLink,
  Lightbulb,
  GitFork,
  Database,
  FileText,
  Loader2,
  Info
} from 'lucide-react';
import { CentralityAnalysis, NodeScore } from '../services/centralityAnalysisService';

interface CentralityAnalysisProps {
  analysis: CentralityAnalysis | null;
  onNodeClick?: (nodeId: string) => void;
}

const CentralityAnalysisComponent = ({ analysis, onNodeClick }: CentralityAnalysisProps) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'connected' | 'influential' | 'frequent'>('connected');

  if (!analysis) {
    return (
      <div className="flex flex-col h-full bg-background border-l items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Analyzing research space...</p>
      </div>
    );
  }

  // Get current ranking based on active tab
  const getCurrentRanking = () => {
    switch (activeTab) {
      case 'connected':
        return analysis.mostCentral;
      case 'influential':
        return analysis.mostInfluential;
      case 'frequent':
        return analysis.mostFrequent;
      default:
        return analysis.mostCentral;
    }
  };

  // Filter by type
  const currentRanking = getCurrentRanking();
  const filteredNodes = currentRanking.filter(node =>
    filterType === 'all' ? true : node.type === filterType
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Concept': return <Lightbulb className="w-3 h-3" />;
      case 'Method': return <GitFork className="w-3 h-3" />;
      case 'Dataset': return <Database className="w-3 h-3" />;
      case 'Finding': return <Award className="w-3 h-3" />;
      case 'Technology': return <FileText className="w-3 h-3" />;
      default: return <Award className="w-3 h-3" />;
    }
  };

  const getBadgeVariant = (rank: number) => {
    if (rank === 0) return 'destructive'; // #1
    if (rank <= 2) return 'default'; // Top 3
    return 'secondary'; // Rest
  };

  const getMetricLabel = () => {
    switch (activeTab) {
      case 'connected':
        return 'Connection Score';
      case 'influential':
        return 'Influence Score';
      case 'frequent':
        return 'Paper Count';
      default:
        return 'Score';
    }
  };

  const getMetricValue = (node: NodeScore) => {
    switch (activeTab) {
      case 'connected':
        return `${(node.degreeCentrality * 100).toFixed(0)}%`;
      case 'influential':
        return `${(node.pageRank * 100).toFixed(0)}%`;
      case 'frequent':
        return `${node.frequency}`;
      default:
        return '0';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'connected':
        return 'Concepts with the most direct relationships';
      case 'influential':
        return 'Concepts connected to other important concepts';
      case 'frequent':
        return 'Concepts mentioned across multiple papers';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-l">
      {/* Header with Stats */}
      <div className="p-4 border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="mb-3">
          <h2 className="text-sm font-bold tracking-tight uppercase text-muted-foreground">
            Research Space Structure
          </h2>
          <p className="text-[10px] text-muted-foreground/70">
            {getTabDescription()}
          </p>
        </div>

        {/* Network Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-muted/30 rounded-md p-2">
            <div className="text-xs font-bold text-foreground">
              {analysis.stats.totalNodes}
            </div>
            <div className="text-[9px] text-muted-foreground">Concepts</div>
          </div>
          <div className="bg-muted/30 rounded-md p-2">
            <div className="text-xs font-bold text-foreground">
              {analysis.stats.totalEdges}
            </div>
            <div className="text-[9px] text-muted-foreground">Connections</div>
          </div>
          <div className="bg-muted/30 rounded-md p-2">
            <div className="text-xs font-bold text-foreground">
              {analysis.stats.avgDegree.toFixed(1)}
            </div>
            <div className="text-[9px] text-muted-foreground">Avg Links</div>
          </div>
          <div className="bg-muted/30 rounded-md p-2">
            <div className="text-xs font-bold text-foreground">
              {(analysis.stats.densityRatio * 100).toFixed(0)}%
            </div>
            <div className="text-[9px] text-muted-foreground">Density</div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="connected" className="text-[10px]">
              <LinkIcon className="w-3 h-3 mr-1" />
              Connected
            </TabsTrigger>
            <TabsTrigger value="influential" className="text-[10px]">
              <Award className="w-3 h-3 mr-1" />
              Influential
            </TabsTrigger>
            <TabsTrigger value="frequent" className="text-[10px]">
              <TrendingUp className="w-3 h-3 mr-1" />
              Frequent
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filter */}
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full h-7 text-[10px] mt-2">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Concept">Concepts</SelectItem>
            <SelectItem value="Method">Methods</SelectItem>
            <SelectItem value="Dataset">Datasets</SelectItem>
            <SelectItem value="Finding">Findings</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20 md:pb-4">
        {filteredNodes.length === 0 && (
          <div className="text-center py-8">
            <Info className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No {filterType === 'all' ? 'nodes' : filterType.toLowerCase() + 's'} found
            </p>
          </div>
        )}

        {filteredNodes.slice(0, 10).map((node, index) => (
          <Card
            key={node.nodeId}
            className="overflow-hidden border-muted/60 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary/50"
            onClick={() => onNodeClick?.(node.nodeId)}
          >
            <CardHeader className="p-3 pb-2">
              <div className="flex justify-between items-start mb-2">
                <Badge
                  variant={getBadgeVariant(index)}
                  className="text-[8px] px-1.5 py-0 h-4 uppercase font-bold"
                >
                  #{index + 1}
                </Badge>
                <div className="flex items-center gap-1.5">
                  {getTypeIcon(node.type)}
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wide">
                    {node.type}
                  </span>
                </div>
              </div>
              <CardTitle className="text-sm font-bold leading-tight">
                {node.label}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-3 pt-0">
              {/* Primary Metric (large) */}
              <div className="bg-muted/30 rounded-md p-2 mb-2">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">
                  {getMetricLabel()}
                </div>
                <div className="text-xl font-bold text-primary">
                  {getMetricValue(node)}
                </div>
              </div>

              {/* All Metrics (small) */}
              <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                <div className="bg-background rounded p-1.5 text-center border border-muted">
                  <div className="font-semibold text-foreground">
                    {(node.degreeCentrality * 100).toFixed(0)}%
                  </div>
                  <div className="text-muted-foreground text-[8px]">Links</div>
                </div>
                <div className="bg-background rounded p-1.5 text-center border border-muted">
                  <div className="font-semibold text-foreground">
                    {(node.pageRank * 100).toFixed(0)}%
                  </div>
                  <div className="text-muted-foreground text-[8px]">Influence</div>
                </div>
                <div className="bg-background rounded p-1.5 text-center border border-muted">
                  <div className="font-semibold text-foreground">
                    {node.frequency}
                  </div>
                  <div className="text-muted-foreground text-[8px]">Papers</div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full h-7 text-[10px] mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeClick?.(node.nodeId);
                }}
              >
                <ExternalLink className="w-2.5 h-2.5 mr-1.5" />
                View in Graph
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Categories (Optional) */}
      {filterType === 'all' && (
        <div className="border-t p-4 bg-muted/20">
          <h3 className="text-[10px] font-bold uppercase text-muted-foreground mb-2">
            By Type
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <TypePill
              label="Concepts"
              count={analysis.topConcepts.length}
              icon={<Lightbulb className="w-3 h-3" />}
              onClick={() => setFilterType('Concept')}
            />
            <TypePill
              label="Methods"
              count={analysis.topMethods.length}
              icon={<GitFork className="w-3 h-3" />}
              onClick={() => setFilterType('Method')}
            />
            <TypePill
              label="Datasets"
              count={analysis.topDatasets.length}
              icon={<Database className="w-3 h-3" />}
              onClick={() => setFilterType('Dataset')}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component
function TypePill({
                    label,
                    count,
                    icon,
                    onClick
                  }: {
  label: string;
  count: number;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 bg-background border border-muted rounded-md p-2 hover:border-primary/50 hover:bg-muted/30 transition-all"
    >
      {icon}
      <div className="flex-1 text-left">
        <div className="text-[9px] font-semibold text-foreground">{count}</div>
        <div className="text-[8px] text-muted-foreground">{label}</div>
      </div>
    </button>
  );
}

export default CentralityAnalysisComponent;
