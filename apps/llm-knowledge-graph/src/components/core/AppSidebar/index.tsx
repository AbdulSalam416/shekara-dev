"use client"

import * as React from "react"
import { useState } from 'react'
import { SidebarProvider } from '@shekara-dev/ui';
import MindGraphSidebarContent from './MindGraphSidebarContent';


export function MindGraphSidebar({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarProvider>
      <MindGraphSidebarContent />
      {children}
    </SidebarProvider>
  )
}
