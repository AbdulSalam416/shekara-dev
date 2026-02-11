'use client';

import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  Sidebar,
  useSidebar,
} from '@shekara-dev/ui';
import { useState } from 'react';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@shekara-dev/ui';
import { Network, FileText, History, MessageCircleCode } from 'lucide-react';
import InputView from './InputView';
import ChatView from './ChatView';
import HistoryView from './HistoryView';
import { CONSTANTS } from '../../../lib/contants';
import { extractGraphs, fetchCentralityAnalysis } from '../../../services/apiClient';
import { useMutation } from '@tanstack/react-query';
import { useGraphStore } from '../../../store/graphStore';
import { CentralityAnalysis } from '../../../services/centralityAnalysisService';

type viewType = 'Input' | 'Chat' | 'History';

function MindGraphSidebar() {
  const [currentContentView, setCurrentContentView] =
    useState<viewType>('Input');
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const navItems = [
    { id: 'Input', label: 'Analysis', icon: FileText },
    { id: "Chat", label: "Chat", icon: MessageCircleCode },
    { id: 'History', label: 'History', icon: History },
  ] as const;

  const { setGraph, addGraphToHistory, setIsGraphExtractionPending, analysisCount, incrementAnalysisCount } = useGraphStore();

  const graphExtractionMutation = useMutation({
    mutationFn: extractGraphs,
    onMutate: () => {
      setIsGraphExtractionPending(true); // Set pending state to true when mutation starts
    },
    onSuccess: async (data) => {
      const fetchedGraphData = data.graph;
      const centralityAnalysis: CentralityAnalysis = await fetchCentralityAnalysis(fetchedGraphData);

      setGraph(fetchedGraphData, centralityAnalysis);
      addGraphToHistory(fetchedGraphData, centralityAnalysis);
      incrementAnalysisCount(); // Increment analysis count on success
      setIsGraphExtractionPending(false); // Set pending state to false on success
    },
    onError: (error: any) => {
      console.error('Graph extraction failed:', error);
      setIsGraphExtractionPending(false); // Set pending state to false on error
      // TODO: Implement a global error state to display to the user
    },
  });

  const loadGraphData = async (papers: Array<{ text: string; id: string; error?: string }>) => {
    if (analysisCount >= 3) { // Check for beta limit
      // TODO: Implement a way to show the user they've reached the limit, maybe a toast or a modal
      console.log("Beta limit reached!");
      return;
    }

    // Filter out papers with errors before sending to mutation
    const validPapers = papers.filter(p => !p.error);
    if (validPapers.length > 0) {
      await graphExtractionMutation.mutateAsync(validPapers);
    }
  };

  const renderContentView = (view: viewType) => {
    switch (view) {
      case 'Input':
        return (
          <InputView
            isGeneratingResponses={graphExtractionMutation.isPending}
            onGenerateAction={loadGraphData}
            analysisCount={analysisCount} // Pass analysisCount
          />
        );
      case 'Chat':
        return <ChatView />;
      case 'History':
        return <HistoryView />;
    }
  };

  return (
    <Sidebar
      collapsible="offcanvas"
      variant="floating"
      className="border-r bg-sidebar"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Network className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-base leading-none truncate">
                {CONSTANTS.AppName}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                Research Intelligence
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {!isCollapsed && (
          <div className="flex p-1 bg-muted/50 rounded-lg mb-4 mx-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentContentView(item.id)}
                className={`flex-1 flex flex-col items-center py-2 rounded-md transition-all ${
                  currentContentView === item.id
                    ? 'bg-background shadow-sm text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {renderContentView(currentContentView)}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t bg-muted/5">
        <div
          className={`flex items-center gap-3 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              BU
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-bold truncate">Beta User</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                  Beta
                </span>
              </div>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default MindGraphSidebar;
