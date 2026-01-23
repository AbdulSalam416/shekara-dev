from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from .utils.research_graph_extractor import (extractor)

app = FastAPI(title="My API")


# -------------------------
# Schemas
# -------------------------
class PaperInput(BaseModel):
    text: str
    metadata: Dict[str, Any] | None = None


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
    print("=" * 60)
    print(f"📥 Received payload:")
    print(f"  - Text length: {len(payload.text)} characters")
    print(f"  - Metadata: {payload.metadata}")

    graph = extractor.extract_from_paper(
      payload.text, payload.metadata
    )

    print(f"\n📊 Graph extraction result:")
    print(f"  - Type: {type(graph)}")
    print(f"  - Nodes count: {len(graph['nodes'])}")
    print(f"  - Relationships count: {len(graph['relationships'])}")

    # Debug: Check what methods are available
    if graph["nodes"]:
      print(f"\n🔍 First node type: {type(graph['nodes'][0])}")
      print(f"🔍 First node attributes: {dir(graph['nodes'][0])}")
      print(
        f"🔍 First node __dict__: {graph['nodes'][0].__dict__ if hasattr(graph['nodes'][0], '__dict__') else 'No __dict__'}")

    if graph["relationships"]:
      print(f"\n🔍 First relationship type: {type(graph['relationships'][0])}")
      print(f"🔍 First relationship attributes: {dir(graph['relationships'][0])}")

    # Try different serialization methods
    print("\n🔄 Attempting to serialize nodes...")
    serialized_nodes = []
    for i, node in enumerate(graph["nodes"]):
      try:
        # Try different serialization methods
        if hasattr(node, 'dict'):
          node_dict = node.dict()
          print(f"  ✅ Node {i} serialized with .dict()")
        elif hasattr(node, 'model_dump'):
          node_dict = node.model_dump()
          print(f"  ✅ Node {i} serialized with .model_dump()")
        elif hasattr(node, '__dict__'):
          node_dict = {
            'id': node.id,
            'type': node.type,
            'properties': node.properties if hasattr(node, 'properties') else {}
          }
          print(f"  ✅ Node {i} serialized manually")
        else:
          node_dict = str(node)
          print(f"  ⚠️  Node {i} converted to string")

        serialized_nodes.append(node_dict)
      except Exception as e:
        print(f"  ❌ Error serializing node {i}: {type(e).__name__}: {str(e)}")
        raise

    print("\n🔄 Attempting to serialize relationships...")
    serialized_relationships = []
    for i, rel in enumerate(graph["relationships"]):
      try:
        if hasattr(rel, 'dict'):
          rel_dict = rel.dict()
          print(f"  ✅ Relationship {i} serialized with .dict()")
        elif hasattr(rel, 'model_dump'):
          rel_dict = rel.model_dump()
          print(f"  ✅ Relationship {i} serialized with .model_dump()")
        elif hasattr(rel, '__dict__'):
          rel_dict = {
            'source': {'id': rel.source.id, 'type': rel.source.type} if hasattr(rel.source, 'id') else str(rel.source),
            'target': {'id': rel.target.id, 'type': rel.target.type} if hasattr(rel.target, 'id') else str(rel.target),
            'type': rel.type,
            'properties': rel.properties if hasattr(rel, 'properties') else {}
          }
          print(f"  ✅ Relationship {i} serialized manually")
        else:
          rel_dict = str(rel)
          print(f"  ⚠️  Relationship {i} converted to string")

        serialized_relationships.append(rel_dict)
      except Exception as e:
        print(f"  ❌ Error serializing relationship {i}: {type(e).__name__}: {str(e)}")
        raise

    result = {
      "nodes": serialized_nodes,
      "relationships": serialized_relationships,
      "metadata": graph.get("metadata", {}),
    }

    print(f"\n✅ Response prepared:")
    print(f"  - Nodes: {len(result['nodes'])}")
    print(f"  - Relationships: {len(result['relationships'])}")
    print(f"  - Result type: {type(result)}")

    return result

  except Exception as e:
    print(f"\n❌ ERROR in extract_graph endpoint:")
    print(f"  - Type: {type(e).__name__}")
    print(f"  - Message: {str(e)}")
    import traceback
    traceback.print_exc()
    raise HTTPException(status_code=500, detail=str(e))
