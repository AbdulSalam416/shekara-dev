'use client'


import { SidebarInset, useSidebar } from '@shekara-dev/ui';
import { cn } from '../../../../../libs/ui/src/components/utils';
import MindGraphSidebar from './AppSidebar';
import { AppHeader } from './AppHeader';

interface MindGraphResearchLayoutBodyProps {
  children?: React.ReactNode;
  generateGraphScreenshot: () => Promise<string | null>;
  graphImage: string | null;
}

function MindGraphResearchLayoutBody({ children, generateGraphScreenshot, graphImage }: MindGraphResearchLayoutBodyProps) {
  const { open } = useSidebar();
  return (
    <>
      <MindGraphSidebar />
      <SidebarInset className={cn("transition-all duration-300 ease-in-out h-screen", open ? "w-[calc(100%-18rem)] md:w-[calc(100%-25rem)]" : "w-full")}>
        <AppHeader generateGraphScreenshot={generateGraphScreenshot} graphImage={graphImage} />
        <main className="flex flex-1 flex-col gap-4 overflow-auto ">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}

interface MindGraphResearchLayoutProps {
  children?: React.ReactNode;
  generateGraphScreenshot: () => Promise<string | null>;
  graphImage: string | null;
}

export default function MindGraphResearchLayout({ children, generateGraphScreenshot, graphImage }: MindGraphResearchLayoutProps) {
  return <MindGraphResearchLayoutBody generateGraphScreenshot={generateGraphScreenshot} graphImage={graphImage}>{children}</MindGraphResearchLayoutBody>;
}