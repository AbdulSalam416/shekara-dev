'use client'

import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  Sidebar,
  useSidebar,
  Button,
  SidebarInset, SidebarProvider,
} from '@shekara-dev/ui';
import { useState } from 'react';
import * as React from 'react';
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import { Network, SettingsIcon } from 'lucide-react';
import InputView from './InputView';
import NodesView from './NodesView';
import HistoryView from './HistoryView';
import { CONSTANTS } from '../../../lib/contants';
import { AppHeader } from '../ResearchLayout/AppHeader';

export default function MindGraphSidebarContent({ children }: { children?: React.ReactNode }) {
  type viewType = "Input"|"Nodes"|"History"
  const [currentContentView, setCurrentContentView] = useState<viewType>("Input")

  const contentViews: viewType[] = ["Input", "Nodes", "History"]

  const renderContentView = (currentContentView: viewType) => {
    switch (currentContentView) {
      case "Input":
        return <InputView/>
      case "Nodes":
        return <NodesView/>
      case "History":
        return <HistoryView/>
    }
  }

  return (

<SidebarProvider>
  <Sidebar collapsible="offcanvas" variant='floating'>
  <SidebarHeader className="border-b border-sidebar-border">
    <div className="flex items-center gap-2 px-2 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Network className="h-6 w-6" />
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-lg">{CONSTANTS.AppName}</span>
      </div>

    </div>
  </SidebarHeader>
  <SidebarContent>
    <div className="flex gap-2 justify-between border-b border-sidebar-border">
      {contentViews.map((view) => (
        <div
          key={view}
          onClick={() => setCurrentContentView(view)}
          className={`${view === currentContentView ? 'border-b border-b-blue-500' : ''} p-2 w-full`}
        >
          {view}
        </div>
      ))}
    </div>

    {renderContentView(currentContentView)}
  </SidebarContent>

  <SidebarFooter className="border-t border-sidebar-border">
    <div className="flex items-center gap-3 px-2 py-4">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary text-primary-foreground">
          JD
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-semibold truncate">John Doe</span>
        <span className="text-xs text-muted-foreground truncate">
                Premium Plan • 2.4k Nodes
              </span>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <SettingsIcon className="h-4 w-4" />
      </Button>
    </div>
  </SidebarFooter>
  <SidebarInset>
    <header className="text-sm font-semibold truncate"></header>
  <main>
      {children}
  </main>
  </SidebarInset>
</Sidebar>
  <SidebarTrigger className="ml-1 z-10" />
</SidebarProvider>



  )
}
