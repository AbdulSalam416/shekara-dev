from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import sys
from datetime import datetime
from .utils.research_graph_extractor import get_extractor

app = FastAPI(
  title="MindGraph AI API",
  description="Research paper analysis and knowledge graph extraction API",
  version="1.0.0"
)

# -------------------------
# CORS Configuration
# -------------------------
app.add_middleware(
  CORSMiddleware,
  allow_origins=[
    "http://localhost:3000",  # Next.js dev
    "http://localhost:3001",  # Alternative port
    "https://mindgraph.app",  # Production (add your domain)
  ],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


# -------------------------
# Schemas
# -------------------------
class PaperInput(BaseModel):
  """Single paper input for extraction."""
  text: str
  metadata: Optional[Dict[str, Any]] = None

  class Config:
    json_schema_extra = {
      "example": {
        "text": "Abstract: We introduce BERT...",
        "metadata": {
          "paper_id": "paper_1",
          "title": "BERT Paper",
          "authors": "Devlin et al."
        }
      }
    }


class MultiplePapersInput(BaseModel):
  """Multiple papers input for batch extraction."""
  papers: List[Dict[str, str]]

  class Config:
    json_schema_extra = {
      "example": {
        "papers": [
          {
            "id": "paper_1",
            "text": "Abstract: We introduce BERT..."
          },
          {
            "id": "paper_2",
            "text": "Abstract: RoBERTa improves BERT..."
          }
        ]
      }
    }


class GraphResponse(BaseModel):
  """Response containing extracted knowledge graph."""
  success: bool
  graph: Dict[str, Any]
  summary: Dict[str, Any]


class ErrorResponse(BaseModel):
  """Error response."""
  success: bool = False
  error: str
  detail: Optional[str] = None


# -------------------------
# Global State
# -------------------------
extractor = None


# -------------------------
# Lifecycle Events
# -------------------------
@app.on_event("startup")
async def startup_event():
  """Initialize services on startup."""
  global extractor
  # Ensure stdout uses UTF-8 (avoid Windows cp1252 UnicodeEncodeError)
  try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
  except Exception:
    # If reconfigure isn't available, continue without raising so startup can proceed
    pass
  print("\n" + "=" * 60)
  print("🚀 STARTING MINDGRAPH AI API")
  print("=" * 60)

  try:
    extractor = get_extractor()
    print("✅ Graph extractor initialized")
    print("✅ API ready to accept requests")
    print("=" * 60 + "\n")
  except Exception as e:
    print(f"❌ Failed to initialize: {e}")
    raise


@app.on_event("shutdown")
async def shutdown_event():
  """Cleanup on shutdown."""
  print("\n👋 Shutting down MindGraph AI API...")


# -------------------------
# Health & Info Routes
# -------------------------
@app.get("/")
async def root():
  """API root endpoint."""
  return {
    "message": "MindGraph AI API",
    "version": "1.0.0",
    "status": "running",
    "docs": "/docs",
    "health": "/health"
  }


@app.get("/health")
async def health():
  """Health check endpoint."""
  return {
    "status": "healthy",
    "timestamp": datetime.utcnow().isoformat(),
    "extractor_ready": extractor is not None
  }


# -------------------------
# Extraction Routes
# -------------------------
@app.post("/api/extract-graph", response_model=GraphResponse)
async def extract_graph(payload: PaperInput):
  """
  Extract knowledge graph from a single research paper.

  Args:
      payload: Paper text and optional metadata

  Returns:
      Extracted knowledge graph with nodes and relationships
  """
  try:
    print("\n" + "=" * 60)
    print("🌐 API ENDPOINT: /api/extract-graph")
    print(f"📝 Text length: {len(payload.text)} chars")
    print(f"📋 Metadata: {payload.metadata}")

    # Extract graph
    graph = await extractor.extract_from_paper(
      payload.text,
      payload.metadata or {}
    )

    # Build response
    response = {
      "success": True,
      "graph": graph,
      "summary": {
        "nodes_extracted": len(graph.get("nodes", [])),
        "relationships_found": len(graph.get("relationships", [])),
        "papers_analyzed": 1,
        "extraction_time": graph.get("metadata", {}).get("extracted_at"),
        "truncated": graph.get("metadata", {}).get("truncated", False)
      }
    }

    print(f"✅ Success: {response['summary']}")
    print("=" * 60 + "\n")

    return response

  except Exception as e:
    print(f"\n❌ ERROR in /api/extract-graph:")
    print(f"  - Type: {type(e).__name__}")
    print(f"  - Message: {str(e)}")
    import traceback
    traceback.print_exc()
    print("=" * 60 + "\n")

    raise HTTPException(
      status_code=500,
      detail={
        "error": "Graph extraction failed",
        "message": str(e),
        "type": type(e).__name__
      }
    )


@app.post("/api/extract-graphs", response_model=GraphResponse)
async def extract_graphs(payload: MultiplePapersInput):
  """
  Extract and merge knowledge graphs from multiple research papers.

  Args:
      payload: List of papers with text and IDs

  Returns:
      Merged knowledge graph with aggregated nodes and relationships
  """
  try:
    print("\n" + "=" * 60)
    print("🌐 API ENDPOINT: /api/extract-graphs")
    print(f"📚 Number of papers: {len(payload.papers)}")

    # Validate input
    if not payload.papers:
      raise HTTPException(
        status_code=400,
        detail="No papers provided"
      )

    if len(payload.papers) > 20:
      raise HTTPException(
        status_code=400,
        detail="Maximum 20 papers allowed per request"
      )

    # Extract and merge graphs
    graph = await extractor.extract_from_multiple_papers(payload.papers)

    # Build response
    response = {
      "success": True,
      "graph": graph,
      "summary": {
        "papers_analyzed": len(payload.papers),
        "nodes_extracted": len(graph.get("nodes", [])),
        "relationships_found": len(graph.get("relationships", [])),
        "unique_concepts": len([
          n for n in graph.get("nodes", [])
          if n.get("type") == "Concept"
        ]),
        "unique_methods": len([
          n for n in graph.get("nodes", [])
          if n.get("type") == "Method"
        ]),
        "research_gaps_identified": len([
          n for n in graph.get("nodes", [])
          if n.get("type") == "ResearchGap"
        ]),
        "merged_at": graph.get("metadata", {}).get("merged_at")
      }
    }

    print(f"✅ Success: {response['summary']}")
    print("=" * 60 + "\n")

    return response

  except HTTPException:
    raise
  except Exception as e:
    print(f"\n❌ ERROR in /api/extract-graphs:")
    print(f"  - Type: {type(e).__name__}")
    print(f"  - Message: {str(e)}")
    import traceback
    traceback.print_exc()
    print("=" * 60 + "\n")

    raise HTTPException(
      status_code=500,
      detail={
        "error": "Batch extraction failed",
        "message": str(e),
        "type": type(e).__name__
      }
    )


# -------------------------
# Utility Routes
# -------------------------
@app.get("/api/stats")
async def get_stats():
  """Get API usage statistics (mock for now)."""
  return {
    "total_extractions": 0,  # Track in production with DB
    "total_papers_analyzed": 0,
    "average_nodes_per_paper": 0,
    "uptime": "N/A"
  }


# -------------------------
# Error Handlers
# -------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
  """Custom HTTP exception handler."""
  return {
    "success": False,
    "error": exc.detail,
    "status_code": exc.status_code
  }


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
  """Catch-all exception handler."""
  print(f"\n❌ UNHANDLED EXCEPTION:")
  import traceback
  traceback.print_exc()

  return {
    "success": False,
    "error": "Internal server error",
    "detail": str(exc),
    "type": type(exc).__name__
  }


# -------------------------
# Run with: uvicorn main:app --reload
# -------------------------
if __name__ == "__main__":
  import uvicorn

  uvicorn.run(
    "main:app",
    host="0.0.0.0",
    port=8000,
    reload=True,
    log_level="info"
  )
