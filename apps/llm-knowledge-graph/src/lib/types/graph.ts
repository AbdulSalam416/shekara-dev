
import {  Node, Relationship } from '@langchain/community/graphs/document';

export interface ResearchGap {
  id: string;
  concepts: string[];
  description: string;
  evidence: string[];
  potentialImpact: 'high' | 'medium' | 'low';
}

export interface GraphData {
  nodes: Node[];
  relationships: Relationship[];
  metadata?: Record<string, any>;
}

