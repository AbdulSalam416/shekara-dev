'use client'

import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  Sidebar,
  useSidebar,
  Button,
} from '@shekara-dev/ui';
import { useState } from 'react';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@shekara-dev/ui';
import { Network, Settings, FileText, History, Database, ChevronRight } from 'lucide-react';
import InputView from './InputView';
import NodesView from './NodesView';
import HistoryView from './HistoryView';
import { CONSTANTS } from '../../../lib/contants';

type viewType = "Input" | "Nodes" | "History"

function MindGraphSidebar() {
  const [currentContentView, setCurrentContentView] = useState<viewType>("Input")
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const navItems = [
    { id: "Input", label: "Analysis", icon: FileText },
    { id: "Nodes", label: "Knowledge", icon: Database },
    { id: "History", label: "History", icon: History },
  ] as const;

  const renderContentView = (view: viewType) => {
    switch (view) {
      case "Input": return <InputView />
      case "Nodes": return <NodesView />
      case "History": return <HistoryView />
    }
  }

  return (
    <Sidebar collapsible='icon' variant='inset' className="border-r bg-sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Network className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-base leading-none truncate">{CONSTANTS.AppName}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Research Intelligence</span>
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
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">JD</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-bold truncate">John Doe</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                  Premium • 2.4k Nodes
                </span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                <Settings className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default MindGraphSidebar;
