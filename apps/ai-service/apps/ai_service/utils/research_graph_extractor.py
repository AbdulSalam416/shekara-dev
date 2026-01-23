from typing import Dict, Any, List
from datetime import datetime
import json

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.documents import Document
from LLMGraphTransformer import LLMGraphTransformer
from langchain_community.graphs.graph_document import (
  GraphDocument,
  Node,
  Relationship,
)

import os


class GraphData(Dict):
  nodes: List[Node]
  relationships: List[Relationship]
  metadata: Dict[str, Any]


class ResearchGraphExtractor:
  def __init__(self):
    print("🔧 Initializing ResearchGraphExtractor...")

    self.llm = ChatGoogleGenerativeAI(
      model="gemini-flash-latest",
      google_api_key=os.getenv("GEMINI_API_KEY"),
      temperature=0,
      max_output_tokens=2048,
    )
    print("✅ LLM initialized")

    self.graph_transformer = LLMGraphTransformer(
      llm=self.llm,
    )
    print("✅ Graph transformer initialized")

  # -------------------------
  # Single paper extraction
  # -------------------------
  def extract_from_paper(
    self, paper_text: str, metadata: Dict[str, Any] | None = None
  ) -> GraphData:
    print("\n" + "=" * 60)
    print("📄 EXTRACTING FROM PAPER")
    print("=" * 60)

    metadata = metadata or {}
    print(f"📊 Input metadata: {metadata}")
    print(f"📝 Paper text length: {len(paper_text)} characters")

    document = Document(
      page_content=paper_text,
      metadata={
        **metadata,
        "extracted_at": datetime.utcnow().isoformat(),
      },
    )
    print(f"✅ Document created with metadata: {document.metadata}")

    print("\n🤖 Calling LLM Graph Transformer...")
    try:
      graph_documents = (
        self.graph_transformer.convert_to_graph_documents([document])
      )
      print(f"✅ Graph transformation complete")
      print(f"📊 Number of graph documents returned: {len(graph_documents)}")
    except Exception as e:
      print(f"❌ ERROR during graph transformation: {type(e).__name__}")
      print(f"❌ Error message: {str(e)}")
      import traceback
      traceback.print_exc()
      raise

    if not graph_documents:
      print("⚠️  No graph documents returned, returning empty graph")
      return {"nodes": [], "relationships": [], "metadata": {}}

    graph_doc = graph_documents[0]
    print(f"\n📊 Graph Document Analysis:")
    print(f"  - Nodes: {len(graph_doc.nodes)}")
    print(f"  - Relationships: {len(graph_doc.relationships)}")

    # Print node details
    print(f"\n🔵 Nodes:")
    for i, node in enumerate(graph_doc.nodes, 1):
      print(f"  {i}. {node.id} (type: {node.type})")
      print(f"     Properties: {node.properties}")

    # Print relationship details
    print(f"\n🔗 Relationships:")
    for i, rel in enumerate(graph_doc.relationships, 1):
      print(f"  {i}. {rel.source.id} --[{rel.type}]--> {rel.target.id}")
      print(f"     Properties: {rel.properties}")

    result = {
      "nodes": graph_doc.nodes,
      "relationships": graph_doc.relationships,
      "metadata": graph_doc.source.metadata,
    }

    print(f"\n📦 Returning result:")
    print(f"  - Type: {type(result)}")
    print(f"  - Keys: {result.keys()}")
    print(f"  - Nodes type: {type(result['nodes'])}")
    print(f"  - Relationships type: {type(result['relationships'])}")

    return result

  # -------------------------
  # Multiple paper extraction
  # -------------------------
  def extract_from_multiple_papers(
    self, papers: List[Dict[str, Any]]
  ) -> GraphData:
    print("\n" + "=" * 60)
    print("📚 EXTRACTING FROM MULTIPLE PAPERS")
    print("=" * 60)
    print(f"📊 Number of papers: {len(papers)}")

    graphs = []
    for i, p in enumerate(papers, 1):
      print(f"\n--- Processing paper {i}/{len(papers)} ---")
      graph = self.extract_from_paper(p["text"], p.get("metadata"))
      graphs.append(graph)
      print(f"✅ Paper {i} processed: {len(graph['nodes'])} nodes, {len(graph['relationships'])} relationships")

    print("\n🔀 Merging graphs...")
    merged = self.merge_graphs(graphs)
    print(f"✅ Merge complete: {len(merged['nodes'])} total nodes, {len(merged['relationships'])} total relationships")

    return merged

  # -------------------------
  # Graph merging
  # -------------------------
  def merge_graphs(self, graphs: List[GraphData]) -> GraphData:
    print(f"\n🔀 Merging {len(graphs)} graphs...")

    merged_nodes: Dict[str, Node] = {}
    merged_relationships: List[Relationship] = []

    for i, graph in enumerate(graphs, 1):
      print(f"  Processing graph {i}: {len(graph['nodes'])} nodes, {len(graph['relationships'])} relationships")

      for node in graph["nodes"]:
        if node.id not in merged_nodes:
          merged_nodes[node.id] = node
          print(f"    ➕ Added new node: {node.id}")
        else:
          existing = merged_nodes[node.id]
          existing.properties.update(node.properties)
          print(f"    🔄 Updated existing node: {node.id}")

      merged_relationships.extend(graph["relationships"])

    result = {
      "nodes": list(merged_nodes.values()),
      "relationships": merged_relationships,
      "metadata": {},
    }

    print(f"✅ Merge result: {len(result['nodes'])} unique nodes, {len(result['relationships'])} relationships")
    return result


print("🚀 Creating extractor instance...")
extractor = ResearchGraphExtractor()
print("✅ Extractor ready!\n")
