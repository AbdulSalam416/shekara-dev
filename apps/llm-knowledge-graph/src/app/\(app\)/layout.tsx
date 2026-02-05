'use client'

import { SidebarInset, SidebarProvider, useSidebar } from '@shekara-dev/ui';
import { cn } from '../../../../libs/ui/src/components/utils'; // Relative path will be updated later
import MindGraphSidebar from '../../components/layout/AppSidebar'; // Will be moved here
import { AppHeader } from '../../components/layout/AppHeader'; // Will be moved here

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();
  return (
    <>
      <MindGraphSidebar/>
      <SidebarInset className={cn("transition-all duration-300 ease-in-out h-screen", open ? "w-[calc(100%-18rem)] md:w-[calc(100%-24rem)]" : "w-full")}>
        <AppHeader/>
        <main className="flex flex-1 flex-col gap-4 overflow-auto ">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}
