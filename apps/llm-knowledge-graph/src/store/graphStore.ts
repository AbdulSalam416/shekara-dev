import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { KnowledgeGraph } from '../lib/types';
import { CentralityAnalysis } from '../services/centralityAnalysisService'; // Assuming these types are defined here

// Define types for a historical graph entry
interface GraphHistoryEntry {
  id: string; // Unique ID for the history entry
  timestamp: number; // Timestamp of when the graph was saved
  graph: KnowledgeGraph;
  centralityAnalysis: CentralityAnalysis | null;
  name?: string; // Optional name for the history entry
}

// Define the state interface
interface GraphState {
  currentGraph: KnowledgeGraph | null;
  currentCentralityAnalysis: CentralityAnalysis | null;
  graphHistory: GraphHistoryEntry[];
  activeNodeId: string | null;
  isGraphExtractionPending: boolean; // New state variable
}

// Define the actions interface
interface GraphActions {
  setGraph: (graph: KnowledgeGraph | null, centralityAnalysis: CentralityAnalysis | null) => void;
  addGraphToHistory: (graph: KnowledgeGraph, centralityAnalysis: CentralityAnalysis | null, name?: string) => void;
  loadGraphFromHistory: (id: string) => void;
  removeGraphFromHistory: (id: string) => void;
  clearHistory: () => void;
  renameHistoryEntry: (id: string, newName: string) => void;
  setActiveNode: (nodeId: string | null) => void;
  setIsGraphExtractionPending: (isPending: boolean) => void; // New action
}

// Combine state and actions
type GraphStore = GraphState & GraphActions;

export const useGraphStore = create<GraphStore>()(
  immer(
    persist(
      (set, get) => ({
        currentGraph: null,
        currentCentralityAnalysis: null,
        graphHistory: [],
        activeNodeId: null,
        isGraphExtractionPending: false, // Initialize to false

        setGraph: (graph, centralityAnalysis) =>
          set((state) => {
            state.currentGraph = graph;
            state.currentCentralityAnalysis = centralityAnalysis;
            state.activeNodeId = null;
            state.isGraphExtractionPending = false; // Set to false when graph is set
          }),

        addGraphToHistory: (graph, centralityAnalysis, name) =>
          set((state) => {
            const newEntry: GraphHistoryEntry = {
              id: Date.now().toString(),
              timestamp: Date.now(),
              graph,
              centralityAnalysis,
              name: name || `Analysis ${new Date().toLocaleString()}`,
            };
            state.graphHistory.unshift(newEntry);
            if (state.graphHistory.length > 20) {
              state.graphHistory = state.graphHistory.slice(0, 20);
            }
          }),

        loadGraphFromHistory: (id) =>
          set((state) => {
            const entry = state.graphHistory.find((e) => e.id === id);
            if (entry) {
              state.currentGraph = entry.graph;
              state.currentCentralityAnalysis = entry.centralityAnalysis;
              state.activeNodeId = null;
            }
          }),

        removeGraphFromHistory: (id) =>
          set((state) => {
            state.graphHistory = state.graphHistory.filter((e) => e.id !== id);
          }),

        clearHistory: () =>
          set((state) => {
            state.graphHistory = [];
          }),

        renameHistoryEntry: (id, newName) =>
          set((state) => {
            const entry = state.graphHistory.find((e) => e.id === id);
            if (entry) {
              entry.name = newName;
            }
          }),

        setActiveNode: (nodeId) =>
          set((state) => {
            state.activeNodeId = nodeId;
          }),

        setIsGraphExtractionPending: (isPending) =>
          set((state) => {
            state.isGraphExtractionPending = isPending;
          })}),{
        name: 'mindgraph-history-storage', // unique name for localStorage
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ graphHistory: state.graphHistory }), // Only persist graphHistory
      }))
)



