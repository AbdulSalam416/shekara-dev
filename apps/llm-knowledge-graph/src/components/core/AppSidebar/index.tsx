"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@shekara-dev/ui"
import { Button } from "@shekara-dev/ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shekara-dev/ui"
import { 
  Play, 
  Upload, 
  Settings, 
  Network,
  FileText,
  History,
  User,
  Settings as SettingsIcon
} from "lucide-react"
import { cn } from "libs/ui/src/components/utils"

import { Avatar, AvatarFallback } from "libs/ui/src/components/ui/avatar"

export function MindGraphSidebar({ children }: { children?: React.ReactNode }) {
  const [activeTab, setActiveTab] = React.useState<"input" | "nodes" | "history">("input")

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Network className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg">MindGraph AI</span>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeTab === "input"}
                onClick={() => setActiveTab("input")}
                tooltip="Input"
              >
                <FileText />
                <span>Input</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeTab === "nodes"}
                onClick={() => setActiveTab("nodes")}
                tooltip="Nodes"
              >
                <Network />
                <span>Nodes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeTab === "history"}
                onClick={() => setActiveTab("history")}
                tooltip="History"
              >
                <History />
                <span>History</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
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
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Network className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-primary">MindGraph AI</h1>
          </div>
          
          {/* Navigation Tabs */}
          <div className="ml-8 flex gap-1 border-b">
            <button
              onClick={() => setActiveTab("input")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === "input"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Input
            </button>
            <button
              onClick={() => setActiveTab("nodes")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === "nodes"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Nodes
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === "history"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              History
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-6 overflow-auto">
          {activeTab === "input" && (
            <>
              {/* Knowledge Input Section */}
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  KNOWLEDGE INPUT
                </h2>
                <textarea
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Paste text, technical documentation, or research papers here to extract entities..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                  <Play className="mr-2 h-4 w-4" />
                  Generate
                </Button>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </div>

              {/* Extraction Settings Card */}
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Settings className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-primary">Extraction Settings</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Using GPT-4o optimized schema for semantic relationship extraction. 
                        Confidence threshold set to 0.85.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </>
          )}

          {activeTab === "nodes" && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Nodes view coming soon...</p>
            </div>
          )}

          {activeTab === "history" && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">History view coming soon...</p>
            </div>
          )}

          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}