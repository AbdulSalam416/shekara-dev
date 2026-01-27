"use client"

import * as React from 'react';
import { Button, useSidebar } from '@shekara-dev/ui';
import { Share, Download } from 'lucide-react';

export function AppHeader() {
  const { state } = useSidebar();
  const isSidebarCollapsed = state === "collapsed";

  return (
    <header >
      <div className="flex items-center gap-2">
        {isSidebarCollapsed && <h1 className="text-xl font-bold">MindGraph AI</h1>}
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold">Papers Analyzed:</span> 5
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold">Gaps Identified:</span> 3
        </div>
      </div>
      <div className="flex  items-center space-x-4">
        <Button variant="outline" size="sm">
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Analyses
        </Button>
      </div>
    </header>
  );
}
