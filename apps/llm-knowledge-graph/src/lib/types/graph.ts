interface Node {
  id: string;
  type: string;
  label: string;
  properties: Record<string, any>;
}

interface Relationship {
  source: string;
  target: string;
  type: string;
  properties: Record<string, any>;
}

interface ResearchGap {
  id: string;
  concepts: string[];
  description: string;
  evidence: string[];
  potentialImpact: 'high' | 'medium' | 'low';
}
