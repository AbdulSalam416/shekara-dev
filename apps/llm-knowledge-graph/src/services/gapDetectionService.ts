import { KnowledgeGraph, Node } from '../lib/types/graph';
import { ResearchGap } from '../lib/types/gap';


export class GapDetectionService {
  private graph: KnowledgeGraph;
  private nodeMap: Map<string, Node>;
  private adjacencyList: Map<string, Set<string>>;
  private totalPapers: number;

  constructor(graph: KnowledgeGraph) {
    this.graph = graph;
    this.totalPapers = graph.metadata?.num_papers || 1;

    // Build efficient lookup structures
    this.nodeMap = new Map(graph.nodes.map(n => [n.id, n]));
    this.adjacencyList = this.buildAdjacencyList();
  }

  /**
   * Build adjacency list for fast neighbor lookup
   */
  private buildAdjacencyList(): Map<string, Set<string>> {
    const adj = new Map<string, Set<string>>();

    // Initialize
    this.graph.nodes.forEach(node => {
      adj.set(node.id, new Set());
    });

    // Add edges (undirected)
    this.graph.relationships.forEach(rel => {
      adj.get(rel.source)?.add(rel.target);
      adj.get(rel.target)?.add(rel.source);
    });

    return adj;
  }

  /**
   * Main entry point: Detect all research gaps
   */
  public detectGaps(options?: {
    minImpactScore?: number;
    maxGaps?: number;
    focusTypes?: string[];
  }): ResearchGap[] {
    const {
      minImpactScore = 5,
      maxGaps = 20,
      focusTypes = ['Concept', 'Method', 'Dataset']
    } = options || {};

    console.log('🔍 Detecting research gaps...');
    console.log(`   Nodes: ${this.graph.nodes.length}`);
    console.log(`   Relationships: ${this.graph.relationships.length}`);
    console.log(`   Papers analyzed: ${this.totalPapers}`);

    const gaps: ResearchGap[] = [];

    // 1. Find missing connections (primary gap type)
    const missingConnectionGaps = this.findMissingConnections(focusTypes);
    gaps.push(...missingConnectionGaps);

    // 2. Find methodological gaps (Methods never used with certain Datasets)
    const methodologicalGaps = this.findMethodologicalGaps();
    gaps.push(...methodologicalGaps);

    // 3. Find dataset opportunities (Datasets rarely used)
    const datasetGaps = this.findDatasetOpportunities();
    gaps.push(...datasetGaps);

    console.log("Gaps: ", gaps.length);
    // Filter by impact score and limit
    const filteredGaps = gaps
      .filter(gap => gap.impactScore >= minImpactScore)
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, maxGaps);

    console.log(`✅ Found ${filteredGaps.length} high-impact gaps;`);

    return filteredGaps;
  }
  /**
   * Find pairs of nodes that should be connected but aren't (or barely are)
   */
  private findMissingConnections(focusTypes: string[]): ResearchGap[] {
    const gaps: ResearchGap[] = [];
    const nodes = this.graph.nodes.filter(n => focusTypes.includes(n.type));

    // Check all pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];

        // Calculate frequencies
        const frequencyA = nodeA.properties.frequency || 1;
        const frequencyB = nodeB.properties.frequency || 1;

        // Only consider if both nodes appear in multiple papers
        if (frequencyA < 2 || frequencyB < 2) {
          continue;
        }

        console.log("nodeA", nodeA);
        console.log("nodeB", nodeB);
        // 🆕 Calculate ACTUAL co-occurrence
        const actualCoOccurrence = this.calculateCoOccurrence(nodeA.id, nodeB.id);
        console.log(`${actualCoOccurrence}: ${frequencyA}`);

        // Calculate EXPECTED co-occurrence (if random association)
        const expectedCoOccurrence = (frequencyA * frequencyB) / this.totalPapers;
        console.log(`${actualCoOccurrence}: ${expectedCoOccurrence}`);

        // 🆕 Detect gaps based on co-occurrence ratio
        const gapType = this.classifyGap(actualCoOccurrence, expectedCoOccurrence);

        if (gapType) {
          // Calculate impact score
          const impactScore = this.calculateImpactScore(
            frequencyA,
            frequencyB,
            actualCoOccurrence,
            expectedCoOccurrence
          );

          // Only create gap if impact is significant
          if (impactScore < 4) continue;

          const gap = this.createGap(
            gapType,
            nodeA,
            nodeB,
            actualCoOccurrence,
            expectedCoOccurrence,
            impactScore
          );

          gaps.push(gap);
        }
      }
    }

    return gaps;
  }

  /**
   * Find methods that haven't been tested on certain datasets
   */
  private findMethodologicalGaps(): ResearchGap[] {
    const gaps: ResearchGap[] = [];

    const methods = this.graph.nodes.filter(n => n.type === 'Method');
    const datasets = this.graph.nodes.filter(n => n.type === 'Dataset');
    console.log("Data sets",  datasets);

    for (const method of methods) {
      for (const dataset of datasets) {
        // Check if method has been evaluated with this dataset
        const hasEvaluation = this.hasRelationship(
          method.id,
          dataset.id,
          ['EVALUATED_WITH', 'USES']
        );

        if (!hasEvaluation) {
          const frequencyM = method.properties.frequency || 1;
          const frequencyD = dataset.properties.frequency || 1;

          if (frequencyM >= 2 && frequencyD >= 2) {
            const impactScore = frequencyM * frequencyD * 1.5; // Boost methodological gaps

            const gap = this.createGap(
              'methodological',
              method,
              dataset,
              0,
              (frequencyM * frequencyD) / this.totalPapers,
              impactScore
            );

            gaps.push(gap);
          }
        }
      }
    }

    return gaps;
  }

  /**
   * Find datasets that are underutilized
   */
  private findDatasetOpportunities(): ResearchGap[] {
    const gaps: ResearchGap[] = [];

    const datasets = this.graph.nodes.filter(n => n.type === 'Dataset');
    const methods = this.graph.nodes.filter(n => n.type === 'Method');

    for (const dataset of datasets) {
      const frequency = dataset.properties.frequency || 1;

      // Find how many methods use this dataset
      const methodsUsingDataset = methods.filter(method =>
        this.hasRelationship(method.id, dataset.id, ['EVALUATED_WITH', 'USES'])
      );

      const usageRatio = methodsUsingDataset.length / methods.length;

      // If dataset is mentioned but rarely used
      if (frequency >= 2 && usageRatio < 0.2) {
        // Find a popular method that doesn't use it
        const popularMethod = methods
          .filter(m => (m.properties.frequency || 0) >= 3)
          .find(m => !this.hasRelationship(m.id, dataset.id, ['EVALUATED_WITH', 'USES']));

        if (popularMethod) {
          const impactScore = frequency * (popularMethod.properties.frequency || 1);

          const gap = this.createGap(
            'dataset_opportunity',
            popularMethod,
            dataset,
            0,
            usageRatio * this.totalPapers,
            impactScore
          );

          gaps.push(gap);
        }
      }
    }

    return gaps;
  }



  /**
   * Check if two nodes are connected
   */
  private areConnected(nodeA: string, nodeB: string): boolean {
    return this.adjacencyList.get(nodeA)?.has(nodeB) || false;
  }

  /**
   * Check if specific relationship exists
   */
  private hasRelationship(source: string, target: string, types: string[]): boolean {
    return this.graph.relationships.some(rel =>
      ((rel.source === source && rel.target === target) ||
        (rel.source === target && rel.target === source)) &&
      types.includes(rel.type)
    );
  }

  /**
   * 🆕 Calculate how many papers mention both nodes
   */
  private calculateCoOccurrence(nodeAId: string, nodeBId: string): number {
    // Get papers for each node
    const nodeA = this.nodeMap.get(nodeAId);
    const nodeB = this.nodeMap.get(nodeBId);

    if (!nodeA || !nodeB) return 0;

    // If we have paper IDs, count overlap
    const papersA = this.getPapersForNode(nodeA);
    const papersB = this.getPapersForNode(nodeB);

    if (papersA.length === 0 || papersB.length === 0) {
      // Fallback: check if they're connected in graph
      return this.areConnected(nodeAId, nodeBId) ? 1 : 0;
    }

    // Count papers that mention both
    const overlap = papersA.filter(p => papersB.includes(p));
    return overlap.length;
  }

  /**
   * 🆕 Calculate impact score considering both absence AND rarity
   */
  private calculateImpactScore(
    freqA: number,
    freqB: number,
    actual: number,
    expected: number
  ): number {
    // Base impact: product of frequencies
    const baseImpact = freqA * freqB;

    // Gap severity: how much is it under-explored?
    const gapSeverity = actual === 0
      ? 1.0  // Complete absence
      : 1.0 - (actual / expected);  // Proportional to under-exploration

    // Final impact: base * severity
    return baseImpact * gapSeverity;
  }



  /**
   * 🆕 Classify gap type based on co-occurrence analysis
   */
  private classifyGap(
    actual: number,
    expected: number
  ): 'missing_connection' | 'underexplored' | null {
    // No connection at all → missing_connection
    if (actual === 0) {
      return 'missing_connection';
    }

    // Weak connection (< 30% of expected) → underexplored
    const ratio = actual / expected;
    if (ratio < 0.3 && expected >= 3) {
      return 'underexplored';
    }

    // Connection is about as expected or stronger → not a gap
    return null;
  }
  /**
   * Create a structured gap object
   */
  private createGap(
    type: ResearchGap['type'],
    nodeA: Node,
    nodeB: Node,
    coOccurrence: number,
    expectedCoOccurrence: number,
    impactScore: number
  ): ResearchGap {
    const frequencyA = nodeA.properties.frequency || 1;
    const frequencyB = nodeB.properties.frequency || 1;

    // Determine impact level
    let potentialImpact: 'high' | 'medium' | 'low';
    if (impactScore >= 20) potentialImpact = 'high';
    else if (impactScore >= 10) potentialImpact = 'medium';
    else potentialImpact = 'low';

    // Generate research question
    const question = this.generateResearchQuestion(type, nodeA, nodeB);

    // Generate description
    const description = this.generateDescription(
      type,
      nodeA,
      nodeB,
      frequencyA,
      frequencyB,
      coOccurrence
    );

    return {
      id: `gap_${nodeA.id}_${nodeB.id}`,
      type,
      concepts: [nodeA.id, nodeB.id],
      conceptLabels: [nodeA.label, nodeB.label],
      description,
      evidence: {
        nodeA: {
          id: nodeA.id,
          label: nodeA.label,
          frequency: frequencyA,
          papers: this.getPapersForNode(nodeA)
        },
        nodeB: {
          id: nodeB.id,
          label: nodeB.label,
          frequency: frequencyB,
          papers: this.getPapersForNode(nodeB)
        },
        coOccurrence,
        expectedCoOccurrence
      },
      potentialImpact,
      impactScore: Math.round(impactScore * 100) / 100,
      suggestedResearchQuestion: question,
      relatedPapers: [
        ...this.getPapersForNode(nodeA),
        ...this.getPapersForNode(nodeB)
      ].filter((v, i, a) => a.indexOf(v) === i) // Unique
    };
  }

  /**
   * Get papers that mention a node
   */
  private getPapersForNode(node: Node): string[] {
    const paperId = node.properties.paperId;
    return paperId ? [paperId] : [];
  }

  /**
   * Generate natural language description
   */
  private generateDescription(
    type: ResearchGap['type'],
    nodeA: Node,
    nodeB: Node,
    freqA: number,
    freqB: number,
    coOcc: number
  ): string {
    switch (type) {
      case 'missing_connection':
        return `${nodeA.label} and ${nodeB.label} are both frequently discussed concepts (appearing in ${freqA} and ${freqB} papers respectively), but they have never been explored together. This represents a significant research opportunity.`;

      case 'underexplored':
        const expected = Math.round((freqA * freqB) / this.totalPapers);
        return `${nodeA.label} (${freqA} papers) and ${nodeB.label} (${freqB} papers) appear together in only ${coOcc} paper${coOcc > 1 ? 's' : ''}, despite an expected co-occurrence of ~${expected} papers. This combination is significantly underexplored and represents a research gap.`;

      case 'methodological':
        return `${nodeA.label} is a well-established method (${freqA} papers), and ${nodeB.label} is a commonly used dataset (${freqB} papers), but this method has never been evaluated on this dataset.`;

      case 'dataset_opportunity':
        return `${nodeB.label} is mentioned in ${freqB} papers but is rarely used for evaluation. Testing ${nodeA.label} on this dataset could yield novel insights.`;

      default:
        return `Research gap identified between ${nodeA.label} and ${nodeB.label}.`;
    }
  }

  /**
   * Generate suggested research question
   */
  private generateResearchQuestion(
    type: ResearchGap['type'],
    nodeA: Node,
    nodeB: Node
  ): string {
    switch (type) {
      case 'missing_connection':
        if (nodeA.type === 'Method' && nodeB.type === 'Concept') {
          return `Can ${nodeA.label} be applied to ${nodeB.label}?`;
        }
        if (nodeA.type === 'Concept' && nodeB.type === 'Concept') {
          return `How does ${nodeA.label} relate to ${nodeB.label}?`;
        }
        return `What is the relationship between ${nodeA.label} and ${nodeB.label}?`;

      case 'methodological':
        return `How does ${nodeA.label} perform on ${nodeB.label} compared to existing approaches?`;

      case 'dataset_opportunity':
        return `Can ${nodeA.label} achieve better results when evaluated on ${nodeB.label}?`;

      default:
        return `How can ${nodeA.label} and ${nodeB.label} be combined for novel research?`;
    }
  }
}

/**
 * Convenience function for quick gap detection
 */
export function detectResearchGaps(
  graph: KnowledgeGraph,
  options?: {
    minImpactScore?: number;
    maxGaps?: number;
    focusTypes?: string[];
  }
): ResearchGap[] {
  const service = new GapDetectionService(graph);
  return service.detectGaps(options);
}
