from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import re
import asyncio

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

import os


class NodeSchema(BaseModel):
  id: str = Field(description="Unique identifier for the node")
  type: str = Field(description="Type/category of the node")
  label: str = Field(description="Display name for the node")
  properties: Dict[str, Any] = Field(default_factory=dict)


class RelationshipSchema(BaseModel):
  source: str = Field(description="Source node ID")
  target: str = Field(description="Target node ID")
  type: str = Field(description="Relationship type")
  properties: Dict[str, Any] = Field(default_factory=dict)


class GraphSchema(BaseModel):
  nodes: List[NodeSchema] = Field(default_factory=list)
  relationships: List[RelationshipSchema] = Field(default_factory=list)


from ..prompts.knowledge_graph_extraction import KNOWLEDGE_GRAPH_EXTRACTION_PROMPT


def create_prompt_template() -> ChatPromptTemplate:
  """the prompt template for knowledge graph extraction."""
  return ChatPromptTemplate.from_template(KNOWLEDGE_GRAPH_EXTRACTION_PROMPT)


class ResearchGraphExtractor:
  def __init__(self, llm_model: str = "gemini-flash-latest"):
    print(f"🔧 Initializing ResearchGraphExtractor with model {llm_model}...")
    self.llm = ChatGoogleGenerativeAI(
      model=llm_model,
      google_api_key=os.getenv("GEMINI_API_KEY"),
      temperature=0,
      max_output_tokens=8192,
    )
    self.parser = JsonOutputParser(pydantic_object=GraphSchema)
    self.prompt = create_prompt_template()
    self.chain = self.prompt | self.llm | self.parser

    print("✅ Custom extractor initialized")

  async def extract_from_paper(
    self,
    paper_text: str,
    metadata: Optional[Dict[str, Any]] = None
  ) -> Dict[str, Any]:
    """Extract knowledge graph from a single paper."""

    print("\n" + "=" * 60)
    print("📄 EXTRACTING FROM PAPER (CUSTOM)")
    print("=" * 60)

    metadata = metadata or {}

    print(f"📝 Processing {len(paper_text)} characters")
    print("\n🤖 Extracting knowledge graph...")

    try:
      result = await self.chain.ainvoke({
        "text": paper_text,
        "format_instructions": self.parser.get_format_instructions()
      })

      print(f"✅ Extraction complete")
      print(f"📊 Nodes: {len(result.get('nodes', []))}")
      print(f"📊 Relationships: {len(result.get('relationships', []))}")

      # Add metadata
      result['metadata'] = {
        **metadata,
        "extracted_at": datetime.utcnow().isoformat(),
        "paper_length": len(paper_text),
        # "truncated": len(paper_text) == max_chars
      }

      # Show samples
      if result.get('nodes'):
        print(f"\n  Sample Nodes:")
        for node in result['nodes'][:3]:  # 👈 Show fewer in logs
          print(f"    - [{node['type']}] {node.get('label', node['id'])}")

      if result.get('relationships'):
        print(f"\n  Sample Relationships:")
        for rel in result['relationships'][:3]:
          print(f"    - {rel['source']} --[{rel['type']}]--> {rel['target']}")

      return result

    except Exception as e:
      print(f"❌ ERROR: {type(e).__name__}: {str(e)}")
      import traceback
      traceback.print_exc()

      # Return empty graph with error info
      return {
        "nodes": [],
        "relationships": [],
        "metadata": {
          **metadata,
          "error": str(e),
          "extracted_at": datetime.utcnow().isoformat()
        }
      }

  # 👇 NEW: Extract from multiple papers and merge
  async def extract_from_multiple_papers(
    self,
    papers: List[Dict[str, str]]  # [{"text": "...", "id": "paper1"}, ...]
  ) -> Dict[str, Any]:
    """Extract from multiple papers and merge into single graph."""

    print(f"\n🔄 Extracting from {len(papers)} papers...")

    # Extract in parallel
    tasks = [
      self.extract_from_paper(
        paper["text"],
        {"paper_id": paper.get("id", f"paper_{i}")}
      )
      for i, paper in enumerate(papers)
    ]

    results = await asyncio.gather(*tasks)

    # Merge graphs
    merged = self._merge_graphs(results)

    print(f"\n✅ Merged graph:")
    print(f"   - Total nodes: {len(merged['nodes'])}")
    print(f"   - Total relationships: {len(merged['relationships'])}")

    return merged

  def _merge_graphs(self, graphs: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Merge multiple graphs into one, deduplicating nodes."""

    node_map = {}  # id -> node
    relationship_set = set()  # (source, type, target)
    merged_relationships = []

    for graph in graphs:
      # Merge nodes
      for node in graph.get('nodes', []):
        node_id = node['id']

        if node_id not in node_map:
          # First time seeing this node
          node_map[node_id] = dict(node)
          node_map[node_id]['properties']['frequency'] = 1
        else:
          # Node seen before - increment frequency
          node_map[node_id]['properties']['frequency'] += 1

          # Upgrade importance if any instance is high
          if node.get('properties', {}).get('importance') == 'high':
            node_map[node_id]['properties']['importance'] = 'high'

      # Merge relationships (deduplicate)
      for rel in graph.get('relationships', []):
        rel_key = (rel['source'], rel['type'], rel['target'])

        if rel_key not in relationship_set:
          relationship_set.add(rel_key)
          merged_relationships.append(rel)

    return {
      'nodes': list(node_map.values()),
      'relationships': merged_relationships,
      'metadata': {
        'num_papers': len(graphs),
        'merged_at': datetime.utcnow().isoformat()
      }
    }

  # 👇 NEW: Validation helper
  def validate_graph(self, graph: Dict[str, Any]) -> bool:
    """Validate graph structure and node references."""

    try:
      # Check all relationship nodes exist
      node_ids = {node['id'] for node in graph.get('nodes', [])}

      for rel in graph.get('relationships', []):
        if rel['source'] not in node_ids:
          print(f"⚠️  Warning: Relationship references unknown source: {rel['source']}")
          return False
        if rel['target'] not in node_ids:
          print(f"⚠️  Warning: Relationship references unknown target: {rel['target']}")
          return False

      return True

    except Exception as e:
      print(f"❌ Validation error: {e}")
      return False


# 👇 IMPORTANT: Only create instance when imported, not at module level
def get_extractor() -> ResearchGraphExtractor:
  """Factory function to get extractor instance."""
  return ResearchGraphExtractor()


# For backward compatibility
extractor = None


def init_extractor():
  """Initialize the global extractor instance."""
  global extractor
  if extractor is None:
    print("🚀 Creating custom extractor instance...")
    extractor = ResearchGraphExtractor()
    print("✅ Extractor ready!\n")
  return extractor
