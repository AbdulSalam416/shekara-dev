"use client"

import * as React from 'react';
import { Button, SidebarTrigger, useSidebar, Badge } from '@shekara-dev/ui';
import { Share, Download, Plus, FileText, Network, SearchCode } from 'lucide-react';

export function AppHeader() {
  const { state, isMobile } = useSidebar();
  const isSidebarCollapsed = state === "collapsed";

  return (
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
                5 papers analyzed
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="bg-muted/50 font-medium px-2 py-0.5 h-6">
                <Network className="w-3 h-3 mr-1.5 text-muted-foreground" />
                67 concepts
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-medium px-2 py-0.5 h-6">
                <SearchCode className="w-3 h-3 mr-1.5" />
                3 gaps found
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 mr-2">
          <Button variant="ghost" size="sm" className="h-9">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="ghost" size="sm" className="h-9">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <Button size="sm" className="h-9 shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          New Analysis
        </Button>
      </div>
    </header>
  );
}
