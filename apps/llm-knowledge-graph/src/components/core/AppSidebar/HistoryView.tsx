'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle, Input
} from '@shekara-dev/ui';
import {
  Trash,
  Loader2,
  GitGraph,
  Clock,
  Edit,
  Check,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useGraphStore } from '../../../store/graphStore';

export default function HistoryView() {
  const {
    graphHistory,
    currentGraph,
    loadGraphFromHistory,
    removeGraphFromHistory,
    clearHistory,
    renameHistoryEntry
  } = useGraphStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>('');

  const handleEditClick = (id: string, currentName: string) => {
    setEditingId(id);
    setEditedName(currentName);
  };

  console.log("currentGraph", currentGraph);

  const handleSaveRename = (id: string) => {
    if (editedName.trim() !== '') {
      renameHistoryEntry(id, editedName.trim());
      setEditingId(null);
    }
  };

  if (graphHistory.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Clock className="w-8 h-8 mx-auto mb-2" />
        <p>No history yet. Analyze a paper to save your first graph!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-background/95 backdrop-blur z-10 flex justify-between items-center">
        <h2 className="text-sm font-bold tracking-tight uppercase text-muted-foreground">
          Analysis History ({graphHistory.length})
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive/80 h-8"
          onClick={() => clearHistory()}
          disabled={graphHistory.length === 0}
        >
          <Trash className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {graphHistory.map((entry) => (
          <Card
            key={entry.id}
            className={`relative overflow-hidden group transition-all duration-200 ${
              currentGraph?.metadata?.timestamp === entry.graph.metadata?.timestamp
                ? 'border-primary shadow-md'
                : 'border-muted/60 hover:shadow-md hover:border-primary/50'
            }`}
          >
            <CardHeader className="p-3 pb-2 flex-row items-center justify-between">
              {editingId === entry.id ? (
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename(entry.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="h-8 text-sm flex-1 mr-2"
                  autoFocus
                />
              ) : (
                <CardTitle className="text-sm font-semibold leading-tight flex-1">
                  {entry.name || `Graph from ${format(new Date(entry.timestamp), 'MMM do, yyyy HH:mm')}`}
                </CardTitle>
              )}

              <div className="flex items-center space-x-1">
                {editingId === entry.id ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-primary hover:text-primary/80"
                      onClick={() => handleSaveRename(entry.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => setEditingId(null)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100"
                    onClick={() => handleEditClick(entry.id, entry.name || '')}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeGraphFromHistory(entry.id);
                  }}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
              <p className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(entry.timestamp), 'PPP p')}
              </p>
              <p className="flex items-center gap-1 mt-1">
                <GitGraph className="w-3 h-3" />
                Nodes: {entry.graph.nodes.length}, Edges: {entry.graph.relationships.length}
              </p>
            </CardContent>

            <CardFooter className="p-3 pt-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => loadGraphFromHistory(entry.id)}
                // disabled={currentGraph?.metadata?.timestamp === entry.graph.metadata?.timestamp}
              >
                {currentGraph?.metadata?.timestamp === entry.graph.metadata?.timestamp ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-2" />
                    Active
                  </>
                ) : (
                  'View in Graph'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
