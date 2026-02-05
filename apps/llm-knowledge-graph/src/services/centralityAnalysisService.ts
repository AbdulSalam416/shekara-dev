
import { KnowledgeGraph, Node } from '../lib/types/graph';

export interface NodeScore {
  nodeId: string;
  label: string;
  type: string;
  degreeCentrality: number;  // Raw: number of connections
  pageRank: number;          // Raw: importance score
  frequency: number;         // Raw: paper count
}

export interface CentralityAnalysis {
  // Raw rankings (no interpretation)
  nodeScores: NodeScore[];

  // Simple categories (top N)
  mostCentral: NodeScore[];        // Top 10 by degree
  mostInfluential: NodeScore[];    // Top 10 by PageRank
  mostFrequent: NodeScore[];       // Top 10 by frequency

  // By type
  topConcepts: NodeScore[];
  topMethods: NodeScore[];
  topDatasets: NodeScore[];

  // Raw stats (factual, no judgment)
  stats: {
    totalNodes: number;
    totalEdges: number;
    avgDegree: number;
    maxDegree: number;
    densityRatio: number;  // edges / possible_edges
  };
}

export class CentralityAnalysisService {
  private graph: KnowledgeGraph;
  private nodeMap: Map<string, Node>;
  private adjacencyList: Map<string, Set<string>>;

  constructor(graph: KnowledgeGraph) {
    this.graph = graph;
    this.nodeMap = new Map(graph.nodes.map(n => [n.id, n]));
    this.adjacencyList = this.buildAdjacencyList();
  }

  private buildAdjacencyList(): Map<string, Set<string>> {
    const adj = new Map<string, Set<string>>();

    this.graph.nodes.forEach(node => {
      adj.set(node.id, new Set());
    });

    this.graph.relationships.forEach(rel => {
      adj.get(rel.source)?.add(rel.target);
      adj.get(rel.target)?.add(rel.source);
    });

    return adj;
  }

  /**
   * Main analysis: Calculate all metrics once
   */
  public analyze(): CentralityAnalysis {
    console.log('🔍 Computing centrality metrics...');

    const pageRankScores = this.computePageRankAll();

    const nodeScores: NodeScore[] = this.graph.nodes.map(node => {
      const degree = this.adjacencyList.get(node.id)?.size || 0;
      const totalNodes = this.graph.nodes.length;

      return {
        nodeId: node.id,
        label: node.label,
        type: node.type,
        degreeCentrality: totalNodes > 1 ? degree / (totalNodes - 1) : 0,
        pageRank: pageRankScores.get(node.id) || 0,
        frequency: node.properties.frequency || 1
      };
    });

    // 3. Sort and categorize (no interpretation, just rankings)
    const byDegree = [...nodeScores].sort((a, b) => b.degreeCentrality - a.degreeCentrality);
    const byPageRank = [...nodeScores].sort((a, b) => b.pageRank - a.pageRank);
    const byFrequency = [...nodeScores].sort((a, b) => b.frequency - a.frequency);

    // 4. Filter by type
    const concepts = nodeScores.filter(n => n.type === 'Concept');
    const methods = nodeScores.filter(n => n.type === 'Method');
    const datasets = nodeScores.filter(n => n.type === 'Dataset');

    // 5. Calculate stats
    const stats = this.calculateStats();

    return {
      nodeScores,
      mostCentral: byDegree.slice(0, 10),
      mostInfluential: byPageRank.slice(0, 10),
      mostFrequent: byFrequency.slice(0, 10),
      topConcepts: concepts.sort((a, b) => b.degreeCentrality - a.degreeCentrality).slice(0, 5),
      topMethods: methods.sort((a, b) => b.degreeCentrality - a.degreeCentrality).slice(0, 5),
      topDatasets: datasets.sort((a, b) => b.degreeCentrality - a.degreeCentrality).slice(0, 5),
      stats
    };
  }

  /**
   * Compute PageRank for ALL nodes at once
   */
  private computePageRankAll(): Map<string, number> {
    const dampingFactor = 0.85;
    const iterations = 20;
    const nodeCount = this.graph.nodes.length;

    if (nodeCount === 0) return new Map();

    // Initialize all nodes with equal rank
    let ranks = new Map<string, number>();
    this.graph.nodes.forEach(node => {
      ranks.set(node.id, 1.0 / nodeCount);
    });

    // Iterate to convergence
    for (let iter = 0; iter < iterations; iter++) {
      const newRanks = new Map<string, number>();

      this.graph.nodes.forEach(node => {
        let sum = 0;

        // Get incoming neighbors (who points to this node)
        const incomingNeighbors = this.getIncomingNeighbors(node.id);

        incomingNeighbors.forEach(neighborId => {
          const neighborRank = ranks.get(neighborId) || 0;
          const neighborOutDegree = this.adjacencyList.get(neighborId)?.size || 1;
          sum += neighborRank / neighborOutDegree;
        });

        // PageRank formula
        const newRank = (1 - dampingFactor) / nodeCount + dampingFactor * sum;
        newRanks.set(node.id, newRank);
      });

      ranks = newRanks;
    }

    return ranks;
  }

  /**
   * Get nodes that point TO this node
   */
  private getIncomingNeighbors(nodeId: string): string[] {
    const incoming: string[] = [];

    this.graph.relationships.forEach(rel => {
      // In undirected graph, both directions count
      if (rel.target === nodeId) {
        incoming.push(rel.source);
      }
      if (rel.source === nodeId) {
        incoming.push(rel.target);
      }
    });

    return [...new Set(incoming)]; // Deduplicate
  }

  /**
   * Calculate basic graph statistics
   */
  private calculateStats() {
    const totalNodes = this.graph.nodes.length;
    const totalEdges = this.graph.relationships.length;

    const degrees = Array.from(this.adjacencyList.values()).map(s => s.size);
    const avgDegree = degrees.length > 0
      ? degrees.reduce((a, b) => a + b, 0) / degrees.length
      : 0;
    const maxDegree = degrees.length > 0 ? Math.max(...degrees) : 0;

    // Network density: actual edges / possible edges
    const possibleEdges = totalNodes > 1 ? (totalNodes * (totalNodes - 1)) / 2 : 1;
    const densityRatio = totalEdges / possibleEdges;

    return {
      totalNodes,
      totalEdges,
      avgDegree: Math.round(avgDegree * 10) / 10,
      maxDegree,
      densityRatio: Math.round(densityRatio * 1000) / 1000
    };
  }
}

/**
 * Convenience function
 */
export function analyzeCentrality(graph: KnowledgeGraph): CentralityAnalysis {
  const service = new CentralityAnalysisService(graph);
  return service.analyze();
}
