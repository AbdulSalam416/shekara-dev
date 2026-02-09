"use client"

import * as React from 'react';
import {
  Button,
  SidebarTrigger,
  useSidebar,
  Badge,
  Label,
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
  Sheet,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Input
} from '@shekara-dev/ui';
import { useGraphStore } from '../../store/graphStore'; // Import useGraphStore


export function AppHeader() {
  const { state, isMobile } = useSidebar();
  const isSidebarCollapsed = state === "collapsed";
  const [showBetaFeatureDialog, setShowBetaFeatureDialog] = React.useState(false);
  const [showGuideSheet, setShowGuideSheet] = React.useState(true);
  const [email, setEmail] = React.useState('');

  const { graphHistory } = useGraphStore(); // Access graphHistory from store

  // Calculate cumulative statistics
  const totalAnalyses = graphHistory.length;
  const totalNodesAccumulated = graphHistory.reduce((sum, entry) => sum + entry.graph.nodes.length, 0);
  const totalEdgesAccumulated = graphHistory.reduce((sum, entry) => sum + entry.graph.relationships.length, 0);
  // Example for gaps, assuming a property for gaps exists in the analysis or nodes
  // For simplicity, we can count entries where centralityAnalysis exists and maybe has a gaps property
  const totalGapsFound = graphHistory.reduce((sum, entry) => {
    // This is a placeholder; actual gap counting logic depends on how gaps are structured
    // For now, let's just count graphs where centrality analysis was successful
    if (entry.centralityAnalysis) {
      // If we had a direct count of gaps in centralityAnalysis, we would use that.
      // For demonstration, let's assume each analysis might uncover some gaps.
      // Or we can count unique ResearchGap nodes across all histories
      const researchGaps = entry.graph.nodes.filter(node => node.type === 'ResearchGap').length;
      return sum + researchGaps;
    }
    return sum;
  }, 0);


  const handleEmailSubmit = () => {
    console.log("User submitted email for beta updates:", email);
    setShowBetaFeatureDialog(false);
    setEmail('');
  };

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
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-medium px-2 py-0.5 h-6">
                  <SearchCode className="w-3 h-3 mr-1.5" />
                  {totalGapsFound} Gaps
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
            <Button variant="ghost" size="sm" className="h-9" onClick={() => setShowBetaFeatureDialog(true)}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          {/* New Guide Button */}
        </div>

        <Dialog open={showBetaFeatureDialog} onOpenChange={setShowBetaFeatureDialog} >
          <DialogContent className="sm:max-w-[425px] mx-3" >
            <DialogHeader>
              <DialogTitle>Export Coming Soon</DialogTitle>
              <DialogDescription>
                Exporting and sharing graphs is not yet available in the beta version of MindGraph AI.
                <br /><br />
                If you’d like to be notified when export is ready, leave your email below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right" >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                
                  onChange={(e) => setEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="submit" onClick={handleEmailSubmit}>
                  Notify Me
                </Button>
              </DialogClose>
            </DialogFooter>
            <p className="text-xs text-muted-foreground">
              We’ll only use your email to notify you about this feature.
            </p>

          </DialogContent>
        </Dialog>
      </header>
    </>
  );
}
