export interface Node {
  id: string;
  type: string;
  label: string;
  properties: {
    frequency?: number;
    importance?: string;
    paperId?: string;
    [key: string]: any;
  };
}

export interface Relationship {
  source: string;
  target: string;
  type: string;
  properties: {
    confidence?: number;
    evidence?: string;
    [key: string]: any;
  };
}

export interface KnowledgeGraph {
  nodes: Node[];
  relationships: Relationship[];
  metadata?: {
    num_papers?: number;
    [key: string]: any;
  };
}

export interface GraphSummary
{
  papers_analyzed: number;
  nodes_extracted: number;
  relationships_found: number;
  unique_concepts?: number;
  unique_methods?: number;
  research_gaps_identified?: number;
}

export interface GraphResponse {
  success: boolean;
  graph: KnowledgeGraph;
  summary:GraphSummary;
}
