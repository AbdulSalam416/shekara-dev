
import {NextResponse} from 'next/server';
import { GraphResponse } from '../../../lib/types';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const papers = body.papers;

    if (!papers || !Array.isArray(papers)) {
      return NextResponse.json({message: 'Invalid request body, "papers" array is required.'}, {status: 400});
    }

    const response = await fetch(`${AI_SERVICE_URL}/api/extract-graphs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({papers}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error from AI service:", errorData);
      return NextResponse.json({message: errorData.detail || 'An error occurred with the AI service.'}, {status: response.status});
    }

    const data: GraphResponse = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error in API route:", error);
    if (error instanceof Error) {
      return NextResponse.json({message: `An internal server error occurred: ${error.message}`}, {status: 500});
    }
    return NextResponse.json({message: 'An unknown internal server error occurred.'}, {status: 500});
  }
}
