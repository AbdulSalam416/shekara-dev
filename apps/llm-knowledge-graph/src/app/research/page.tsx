'use client'

import React, { useState } from 'react';
import KnowledgeGraph from '../../components/core/KnowledgeGraphVisualizer/KnowledgeGraph';
import GapAnalysis from '../../components/GapAnalysis';
import MindGraphResearchLayout from '../../components/core/MindGraphResearch';
import { Tabs, TabsList, TabsTrigger, TabsContent, Button } from '@shekara-dev/ui';
import { Network, SearchCode, Maximize2, Minimize2 } from 'lucide-react';

export default function ResearchPage() {
  const [isSplitView, setIsSplitView] = useState(true);

  return (
    <MindGraphResearchLayout>
      <div className="flex flex-col h-full overflow-hidden bg-background">
        {/* Desktop View: Split or Single */}
        <div className="hidden md:flex flex-1 overflow-hidden relative">
          <div className={`transition-all duration-500 ease-in-out border-r border-muted/40 ${isSplitView ? 'w-[65%]' : 'w-full'}`}>
            <div className="h-full relative">
              <KnowledgeGraph />
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-4 right-4 z-20 bg-white/80 backdrop-blur shadow-sm border-muted/60"
                onClick={() => setIsSplitView(!isSplitView)}
              >
                {isSplitView ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {isSplitView && (
            <div className="w-[35%] h-full overflow-hidden bg-slate-50/30">
              <GapAnalysis />
            </div>
          )}
        </div>

        {/* Mobile View: Tabbed */}
        <div className="flex md:hidden flex-1 flex-col overflow-hidden">
          <Tabs defaultValue="graph" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-2 border-b bg-background/95 backdrop-blur">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="graph" className="flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Graph
                </TabsTrigger>
                <TabsTrigger value="gaps" className="flex items-center gap-2">
                  <SearchCode className="w-4 h-4" />
                  Gaps
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="graph" className="flex-1 m-0 p-0 overflow-hidden relative">
              <KnowledgeGraph />
            </TabsContent>

            <TabsContent value="gaps" className="flex-1 m-0 p-0 overflow-hidden">
              <GapAnalysis />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MindGraphResearchLayout>
  );
}
