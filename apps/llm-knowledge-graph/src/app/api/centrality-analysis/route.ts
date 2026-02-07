import { NextResponse } from 'next/server';
import { KnowledgeGraph } from '../../../lib/types';
import {
  analyzeCentrality,
  CentralityAnalysis,
} from '../../../services/centralityAnalysisService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const graph: KnowledgeGraph = body.graph;

    if (!graph || !graph.nodes || !graph.relationships) {
      return NextResponse.json({ message: 'Invalid request body, "graph" object with "nodes" and "relationships" is required.' }, { status: 400 });
    }

    const centralityAnalysis: CentralityAnalysis = analyzeCentrality(graph);

    return NextResponse.json(centralityAnalysis);

  } catch (error) {
    console.error("Error in centrality analysis API route:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: `An internal server error occurred: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown internal server error occurred.' }, { status: 500 });
  }
}
