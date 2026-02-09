"use client"

import * as React from 'react';
import {
  Button,
  SidebarTrigger,
  useSidebar,
  Badge,
  Label,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetHeader,
} from '@shekara-dev/ui';
import {
  Share,
  Download,
  Plus,
  FileText,
  Network,
  SearchCode,
  HelpCircle,
} from 'lucide-react';
import { useGraphStore } from '../../store/graphStore'; // Import useGraphStore
import { ThemeToggle } from './ThemeToggle';
import { ExportDialog } from './ExportDialog'; // Import ThemeToggle


export function AppHeader({ generateGraphScreenshot, graphImage }: {
  generateGraphScreenshot: () => Promise<string | null>;
  graphImage: string | null;
}) {
  const { state, isMobile } = useSidebar();
  const isSidebarCollapsed = state === "collapsed";
  const [showExportDialog, setShowExportDialog] = React.useState(false);
  const [showGuideSheet, setShowGuideSheet] = React.useState(false);


  const { graphHistory } = useGraphStore(); // Access graphHistory from store

  // Calculate cumulative statistics
  const totalAnalyses = graphHistory.length;
  const totalNodesAccumulated = graphHistory.reduce((sum, entry) => sum + entry.graph.nodes.length, 0);





  return (
    <>
      <header className="flex sticky top-0 z-30 justify-between h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur px-4" >
        <div className="flex items-center gap-3" >
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-4">
            {(isSidebarCollapsed || isMobile) && (
              <div className="flex items-center gap-2 mr-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Network className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-lg font-bold hidden sm:block">MindGraph AI</h1>
              </div>
            )}

            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="bg-muted/50 font-medium px-2 py-0.5 h-6">
                  <FileText className="w-3 h-3 mr-1.5 text-muted-foreground" />
                  {totalAnalyses} Analyses
                </Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="bg-muted/50 font-medium px-2 py-0.5 h-6">
                  <Network className="w-3 h-3 mr-1.5 text-muted-foreground" />
                  {totalNodesAccumulated} Nodes
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className=" sm:flex items-center gap-2 mr-2">
            {/*<Button variant="ghost" size="sm" className="h-9" onClick={() => setShowBetaFeatureDialog(true)}>*/}
            {/*  <Share className="w-4 h-4 mr-2" />*/}
            {/*  Share*/}
            {/*</Button>*/}
            <Button variant="ghost" size="sm" className="h-9" onClick={() => setShowExportDialog(true)}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <ThemeToggle />
            {/* New Guide Button */}
            <Sheet open={showGuideSheet} onOpenChange={setShowGuideSheet}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <HelpCircle className="h-4 w-4" />
                  <span className="sr-only">User Guide</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>MindGraph AI User Guide</SheetTitle>
                </SheetHeader>
                <div className="py-4 text-sm text-muted-foreground space-y-4">
                  <h3 className="font-bold text-foreground">1. Uploading Papers</h3>
                  <p>
                    Use the "Upload PDFs" tab in the sidebar to drag and drop or select PDF research papers.
                    You can also paste raw text into the "Paste Text" tab.
                    Click "Generate Graph" to begin the analysis.
                  </p>

                  <h3 className="font-bold text-foreground">2. Understanding the Graph</h3>
                  <p>
                    The main view displays your knowledge graph. Nodes represent concepts, methods, authors, etc.,
                    and edges show relationships between them.
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Node Size & Color:</strong> Reflects importance and type (e.g., gold nodes are highly influential).</li>
                    <li><strong>Clicking Nodes:</strong> Focuses the graph on the selected node and its connections,
                      and displays detailed information in the right panel.</li>
                    <li><strong>Filtering:</strong> Use the legend at the bottom left to hide/show specific node types.</li>
                  </ul>

                  <h3 className="font-bold text-foreground">3. Key Influencer Analysis</h3>
                  <p>
                    The right-hand panel (or "Gaps" tab on mobile) shows ranked lists of influential
                    papers, authors, and concepts based on various centrality metrics.
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Connected:</strong> Concepts with many direct links.</li>
                    <li><strong>Influential:</strong> Concepts that act as important bridges.</li>
                    <li><strong>Frequent:</strong> Concepts mentioned most often.</li>
                  </ul>

                  <h3 className="font-bold text-foreground">4. History & Saving</h3>
                  <p>
                    All your analyses are automatically saved in the "History" tab in the sidebar.
                    You can revisit past graphs, rename them, or delete them.
                  </p>

                  <h3 className="font-bold text-foreground">5. Coming Soon!</h3>
                  <p>
                    Keep an eye out for features like Temporal & Thematic Analysis, Opportunity Discovery,
                    and AI-powered Synthesis to truly unlock the full potential of your research.
                  </p>
                </div>
              </SheetContent>
            </Sheet>
        </div>

        <ExportDialog open={showExportDialog} onOpenChange={setShowExportDialog} generateGraphScreenshot={generateGraphScreenshot} graphImage={graphImage} /></div>
      </header>
    </>
  );
}
