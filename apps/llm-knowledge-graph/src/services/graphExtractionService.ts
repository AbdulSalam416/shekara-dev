
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Document } from '@langchain/core/documents';
import { LLMGraphTransformer } from '@langchain/community/experimental/graph_transformers/llm';
import { GraphData } from '../lib/types/graph';
import {
  GraphDocument,
  Relationship,Node
} from '@langchain/community/graphs/document';

interface PaperInput {
  text: string;
  metadata?: Record<string, any>;
}

class ResearchGraphExtractor {
  private readonly llm: ChatGoogleGenerativeAI;
  private readonly graphTransformer: LLMGraphTransformer;

  constructor() {
    this.llm = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash',
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0,
      maxOutputTokens: 2048,
    });

    this.graphTransformer = new LLMGraphTransformer({
      llm: this.llm,
      // allowedNodes: [
      //   'Concept',
      //   'Theory',
      //   'Method',
      //   'Finding',
      //   'Dataset',
      //   'Author',
      //   'Paper',
      //   'ResearchGap',
      //   'Metric',
      //   'Technology',
      // ],
      // allowedRelationships: [
      //   'USES',
      //   'IMPLEMENTS',
      //   'EXTENDS',
      //   'CONTRADICTS',
      //   'SUPPORTS',
      //   'EVALUATES_WITH',
      //   'IMPROVES_UPON',
      //   'ADDRESSES',
      //   'BASED_ON',
      //   'APPLIES_TO',
      // ],
      strictMode: true,
    });
  }

  async extractFromPaper(
    paperText: string,
    metadata: Record<string, any> = {}
  ): Promise<GraphData> {
    try {
      // Create document with metadata
      const document = new Document({
        pageContent: paperText,
        metadata: {
          ...metadata,
          extractedAt: new Date().toISOString(),
        },
      });

      console.log(document);
      // Extract graph
      const graphDocuments =
        await this.graphTransformer.convertToGraphDocuments([document]);

      console.log('Raw graphDocuments:', JSON.stringify(graphDocuments, null, 2));

      // Process and return structured data
      return this.processGraphDocuments(graphDocuments);
    } catch (error) {
      console.error('Graph extraction failed:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to extract graph: ${error.message}`);
      }
      throw new Error('An unknown error occurred during graph extraction.');
    }
  }

  processGraphDocuments(graphDocuments: GraphDocument[]): GraphData {
    if (!graphDocuments || graphDocuments.length === 0) {
      return { nodes: [], relationships: [] };
    }

    const graphDoc = graphDocuments[0];

    return {
      nodes: graphDoc.nodes,
      relationships: graphDoc.relationships,
      metadata: graphDoc.source.metadata || {},
    };
  }

  // Extract from multiple papers and merge graphs
  async extractFromMultiplePapers(papers: PaperInput[]): Promise<GraphData> {
    const graphs = await Promise.all(
      papers.map((paper) =>
        this.extractFromPaper(paper.text, paper.metadata)
      )
    );

    return this.mergeGraphs(graphs);
  }

  mergeGraphs(graphs: GraphData[]): GraphData {
    const mergedNodes = new Map<string, Node>();
    const mergedRelationships: Relationship[] = [];

    graphs.forEach((graph) => {
      // Merge nodes (deduplicate by ID)
      graph.nodes.forEach((node) => {
        if (!mergedNodes.has((node.id) )) {
          mergedNodes.set(node.id, node);
        } else {
          // Merge properties if node already exists
          const existing = mergedNodes.get(node.id) as Node;
          mergedNodes.set(node.id, {
            ...existing,
            properties: { ...existing.properties, ...node.properties },
          });
        }
      });

      // Add all relationships
      if (graph.relationships) {
        mergedRelationships.push(...graph.relationships);
      }
    });

    return {
      nodes: Array.from(mergedNodes.values()),
      relationships: mergedRelationships,
    };
  }
}

export default ResearchGraphExtractor;
