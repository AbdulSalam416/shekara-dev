'use client';

import React, { useState, useRef, useCallback } from 'react';
import MindGraphResearchLayout from '../components/core/MindGraphResearch';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
} from '@shekara-dev/ui';
import { Network, SearchCode, Maximize2, Minimize2, Loader2, AlertCircle, GitGraph } from 'lucide-react';
import { CentralityAnalysis } from '../services/centralityAnalysisService';
import KnowledgeGraph, { KnowledgeGraphRef } from '../components/core/KnowledgeGraphVisualizer/KnowledgeGraph'; // Import KnowledgeGraphRef
import KeyInfluencerAnalysis from '../components/KeyInfluencerAnalysis';
import { KnowledgeGraph as GraphType } from '../lib/types';
import { useGraphStore } from '../store/graphStore';


export default function ResearchPage() {
  const [isSplitView, setIsSplitView] = useState(true);
  const knowledgeGraphRef = useRef<KnowledgeGraphRef>(null); // Ref for KnowledgeGraph
  const [graphImage, setGraphImage] = useState<string | null>(null); // State to store graph screenshot

  const { currentGraph, currentCentralityAnalysis, isGraphExtractionPending } = useGraphStore();

  const generateGraphScreenshot = useCallback(async () => {
    if (knowledgeGraphRef.current) {
      const imageData = await knowledgeGraphRef.current.toImage();
      setGraphImage(imageData);
      return imageData;
    }
    return null;
  }, []);

  if (isGraphExtractionPending) {
    return (
      <MindGraphResearchLayout generateGraphScreenshot={generateGraphScreenshot} graphImage={graphImage}>
        <div className="flex flex-col h-full items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Generating graph data and performing centrality analysis...</p>
          <p className="text-sm text-muted-foreground/70">This may take a few moments.</p>
        </div>
      </MindGraphResearchLayout>
    );
  }

  if (!currentGraph || !currentCentralityAnalysis) {
    return (
      <MindGraphResearchLayout generateGraphScreenshot={generateGraphScreenshot} graphImage={graphImage}>
        <div className="flex flex-col h-full items-center justify-center bg-background">
          <GitGraph className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">No Graph Loaded</h2>
          <p className="text-lg text-muted-foreground mb-4 text-center">Upload a PDF or paste text to begin your research analysis.</p>
          <p className="text-sm text-muted-foreground/70">Your generated graphs will appear here.</p>
        </div>
      </MindGraphResearchLayout>
    );
  }

  return (
    <MindGraphResearchLayout generateGraphScreenshot={generateGraphScreenshot} graphImage={graphImage}>
      <div className="flex flex-col h-full overflow-hidden bg-background">
        <div className="hidden md:flex flex-1 overflow-hidden relative">
          <div
            className={`transition-all duration-500 ease-in-out border-r border-muted/40 ${
              isSplitView ? 'w-[65%]' : 'w-full'
            }`}
          >
            <div className="h-full relative">
              {currentGraph && (
                <KnowledgeGraph
                  ref={knowledgeGraphRef} // Pass ref here
                  graphData={currentGraph}
                  centralityAnalysis={currentCentralityAnalysis}
                />
              )}

              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-4 right-4 z-20 bg-white/80 backdrop-blur shadow-sm border-muted/60"
                onClick={() => setIsSplitView(!isSplitView)}
              >
                {isSplitView ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {isSplitView && (
            <div className="w-[35%] h-full overflow-hidden bg-slate-50/30">
              {currentCentralityAnalysis && (
                <KeyInfluencerAnalysis analysis={currentCentralityAnalysis} />
              )}
            </div>
          )}
        </div>

        {/* Mobile View: Tabbed */}
        <div className="flex md:hidden flex-1 flex-col overflow-hidden">
          <Tabs
            defaultValue="graph"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-4 py-2 border-b bg-background/95 backdrop-blur">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="graph" className="flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Graph
                </TabsTrigger>
                <TabsTrigger value="gaps" className="flex items-center gap-2">
                  <SearchCode className="w-4 h-4" />
                  Analysis
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="graph"
              className="flex-1 m-0 p-0 overflow-hidden relative"
            >
              {currentGraph && (
                <KnowledgeGraph
                  ref={knowledgeGraphRef} // Pass ref here
                  graphData={currentGraph}
                  centralityAnalysis={currentCentralityAnalysis}
                />
              )}{' '}
            </TabsContent>

            <TabsContent
              value="gaps"
              className="flex-1 m-0 p-0 overflow-hidden"
            >
              {currentCentralityAnalysis && (
                <KeyInfluencerAnalysis analysis={currentCentralityAnalysis} />
              )}{' '}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MindGraphResearchLayout>
  );
}
