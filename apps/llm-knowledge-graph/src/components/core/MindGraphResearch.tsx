'use client'


import { SidebarInset, SidebarProvider, useSidebar } from '@shekara-dev/ui';
import { cn } from '../../../../../libs/ui/src/components/utils';
import MindGraphSidebar from './AppSidebar';
import { AppHeader } from './AppHeader';

  function MindGraphResearchLayoutBody({ children }: { children?: React.ReactNode }) {
  const { open } = useSidebar();
  return <><MindGraphSidebar/>
    <SidebarInset className={cn("transition-all duration-300 ease-in-out h-screen", open ? "w-[calc(100%-18rem)] md:w-[calc(100%-24rem)]" : "w-full")}>
      <AppHeader/>
      <main className="flex flex-1 flex-col gap-4 overflow-auto ">
        {children}
      </main>
    </SidebarInset>
  </>
}


export default function MindGraphResearchLayout({children}:{children?:React.ReactNode}){
  return <SidebarProvider><MindGraphResearchLayoutBody>{children}</MindGraphResearchLayoutBody></SidebarProvider>;

}
