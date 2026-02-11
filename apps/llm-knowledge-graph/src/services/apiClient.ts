import { GraphResponse, KnowledgeGraph } from '../lib/types';
import { CentralityAnalysis } from './centralityAnalysisService';

const API_BASE_URL = '';

export async function extractGraph(
  text: string,
  metadata?: Record<string, any>
): Promise<GraphResponse> {
  const response = await fetch(`${API_BASE_URL}/api/extract-graph`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, metadata }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail?.message || 'Extraction failed');
  }

  return response.json();
}

export async function extractGraphs(
  papers: Array<{ id: string; text: string }>
): Promise<GraphResponse> {
  const response = await fetch(`${API_BASE_URL}/api/extract-graphs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ papers }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail?.message || 'Extraction failed');
  }

  return response.json();
}

export async function fetchCentralityAnalysis(
  graph: KnowledgeGraph
): Promise<CentralityAnalysis> {
  const response = await fetch(`${API_BASE_URL}/api/centrality-analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ graph }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Centrality analysis failed');
  }

  return response.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`); // Assuming a local /api/health endpoint
    const data = await response.json();
    return data.status === 'healthy';
  } catch {
    return false;
  }
}
