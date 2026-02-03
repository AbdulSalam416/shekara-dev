from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from .utils.research_graph_extractor import get_extractor

app = FastAPI(title="My API")


# -------------------------
# Schemas
# -------------------------
class PaperInput(BaseModel):
    text: str
    metadata: Dict[str, Any] | None = None
extractor = None

@app.on_event("startup")
async def startup_event():
    global extractor
    extractor = get_extractor()
    print("✅ API ready")
# -------------------------
# Routes
# -------------------------
@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/extract-graph")
async def extract_graph(payload: PaperInput):
  try:
    print("\n" + "=" * 60)
    print("🌐 API ENDPOINT: extract_graph")

    graph =  await extractor.extract_from_paper(
      payload.text, payload.metadata
    )


    return graph

  except Exception as e:
    print(f"\n❌ ERROR in extract_graph endpoint:")
    print(f"  - Type: {type(e).__name__}")
    print(f"  - Message: {str(e)}")
    import traceback
    traceback.print_exc()
    raise HTTPException(status_code=500, detail=str(e))@app.post("/extract-graph")

@app.post("/extract-graphs")
async def extract_graphs(payload:List[Dict[str, str]]):
  try:
    print("\n" + "=" * 60)
    print("🌐 API ENDPOINT: extract_graph")

    graph =  await extractor.extract_from_multiple_papers(
      payload
    )


    return graph

  except Exception as e:
    print(f"\n❌ ERROR in extract_graph endpoint:")
    print(f"  - Type: {type(e).__name__}")
    print(f"  - Message: {str(e)}")
    import traceback
    traceback.print_exc()
    raise HTTPException(status_code=500, detail=str(e))
