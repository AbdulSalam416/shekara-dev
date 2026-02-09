from datetime import datetime
from typing import Optional, Dict, Any, List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from ..prompts.knowledge_graph_extraction import KNOWLEDGE_GRAPH_EXTRACTION_PROMPT
from ..core.schemas import (GraphSchema, GraphMetadataSchema)
import os


class ResearchGraphExtractor:
  def __init__(self):
    print("🔧 Initializing Custom ResearchGraphExtractor...")

    self.llm = ChatGoogleGenerativeAI(
      model="gemini-flash-latest",
      google_api_key=os.getenv("GEMINI_API_KEY"),
      temperature=0,
      max_output_tokens=8192,
    )

    self.parser = JsonOutputParser(pydantic_object=GraphSchema)

    self.prompt = ChatPromptTemplate.from_template(
      template=KNOWLEDGE_GRAPH_EXTRACTION_PROMPT
    )

    self.chain = self.prompt | self.llm | self.parser

    print("✅ Custom extractor initialized")

  async def extract_from_paper(
    self,
    paper_text: str,
    metadata: Optional[Dict[str, Any]] = None
  ) -> Dict[str, Any]:
    """Extract knowledge graph from a single paper."""

    print("\n" + "=" * 60)
    print("📄 EXTRACTING FROM PAPER")
    print("=" * 60)

    metadata = metadata or {}

    # Limit input
    # max_chars = 15000  # ~4k tokens
    # truncated = len(paper_text) > max_chars
    # if truncated:
    #   print(f"⚠️  Truncating from {len(paper_text)} to {max_chars} chars")
    #   paper_text = paper_text[:max_chars]

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

      # Ensure metadata structure matches schema
      if 'metadata' not in result:
        result['metadata'] = {}

      # Merge provided metadata with extraction metadata
      result['metadata'].update({
        **metadata,
        "extracted_at": datetime.utcnow().isoformat(),
        "paper_length": len(paper_text),
        # "truncated": truncated,
        "num_papers": 1
      })

      # Add paperId to all nodes if provided
      paper_id = metadata.get("paper_id")
      if paper_id:
        for node in result.get('nodes', []):
          if 'properties' not in node:
            node['properties'] = {}
          node['properties']['paperId'] = paper_id

      # Show samples
      if result.get('nodes'):
        print(f"\n  Sample Nodes:")
        for node in result['nodes'][:3]:
          importance = node.get('properties', {}).get('importance', 'N/A')
          print(f"    - [{node['type']}] {node['label']} (importance: {importance})")

      if result.get('relationships'):
        print(f"\n  Sample Relationships:")
        for rel in result['relationships'][:3]:
          confidence = rel.get('properties', {}).get('confidence', 'N/A')
          print(f"    - {rel['source']} --[{rel['type']}]--> {rel['target']} (conf: {confidence})")

      # Validate structure
      self._validate_graph(result)

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
          "extracted_at": datetime.utcnow().isoformat(),
          "num_papers": 1
        }
      }

  def _validate_graph(self, graph: Dict[str, Any]) -> None:
    """Validate graph structure matches TypeScript interface."""

    # Check all nodes have required fields
    for node in graph.get('nodes', []):
      assert 'id' in node, f"Node missing 'id': {node}"
      assert 'type' in node, f"Node missing 'type': {node}"
      assert 'label' in node, f"Node missing 'label': {node}"
      assert 'properties' in node, f"Node missing 'properties': {node}"

      props = node['properties']
      assert isinstance(props, dict), f"Node properties must be dict: {node}"

      # Validate property types if present
      if 'frequency' in props:
        assert isinstance(props['frequency'], int), f"frequency must be int: {node}"
      if 'importance' in props:
        assert props['importance'] in ['high', 'medium', 'low'], f"Invalid importance: {node}"

    # Check all relationships have required fields
    for rel in graph.get('relationships', []):
      assert 'source' in rel, f"Relationship missing 'source': {rel}"
      assert 'target' in rel, f"Relationship missing 'target': {rel}"
      assert 'type' in rel, f"Relationship missing 'type': {rel}"
      assert 'properties' in rel, f"Relationship missing 'properties': {rel}"

      props = rel['properties']
      assert isinstance(props, dict), f"Relationship properties must be dict: {rel}"

      # Validate property types if present
      if 'confidence' in props:
        assert isinstance(props['confidence'], (int, float)), f"confidence must be number: {rel}"
        assert 0.0 <= props['confidence'] <= 1.0, f"confidence must be 0-1: {rel}"

    # Check metadata structure
    if 'metadata' in graph:
      assert isinstance(graph['metadata'], dict), "metadata must be dict"

    print("✅ Graph validation passed")

  async def extract_from_multiple_papers(
    self,
    papers: List[Dict[str, str]]  # [{"text": "...", "id": "paper1"}, ...]
  ) -> Dict[str, Any]:
    """Extract from multiple papers and merge into single graph."""

    print(f"\n🔄 Extracting from {len(papers)} papers...")

    # Extract in parallel
    import asyncio
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
    print(f"   - Papers analyzed: {merged['metadata']['num_papers']}")

    return merged

  def _merge_graphs(self, graphs: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Merge multiple graphs, incrementing frequency for duplicate nodes,
    and considering nodes with the same semantic_key as the same.
    """

    # Stores canonical node (by its original ID, or first encountered ID if semantic key is used)
    node_map = {}  # deduplication_key -> canonical_node
    # Map original node ID to its canonical node ID (after merging)
    id_to_canonical_id_map = {}

    relationship_set = set()  # (source_id, type, target_id)
    merged_relationships = []

    # Helper to get the key for deduplication
    def get_deduplication_key(node):
        semantic_key = node.get('properties', {}).get('semantic_key')
        if semantic_key:
            return f"semantic_{semantic_key}"
        return f"id_{node['id']}"

    for graph in graphs:
      for node in graph.get('nodes', []):
        deduplication_key = get_deduplication_key(node)
        original_node_id = node['id']

        if deduplication_key not in node_map:
          # This is the first time we see a node with this deduplication_key
          # Make a copy and initialize its aggregated properties
          node_copy = {
            'id': original_node_id, # This becomes the canonical ID for this semantic group
            'type': node['type'],
            'label': node['label'],
            'properties': {
              'frequency': 1,
              'importance': node.get('properties', {}).get('importance', 'medium'),
              'context': node.get('properties', {}).get('context'),
              'paperId': node.get('properties', {}).get('paperId'),
              'semantic_key': node.get('properties', {}).get('semantic_key')
            }
          }
          node_map[deduplication_key] = node_copy
          id_to_canonical_id_map[original_node_id] = original_node_id
        else:
          # A node with this deduplication_key has been seen before. Merge this node's info.
          existing_node = node_map[deduplication_key]
          id_to_canonical_id_map[original_node_id] = existing_node['id'] # Map current node's ID to the canonical ID

          existing_node['properties']['frequency'] += 1

          # Update importance
          current_importance = existing_node['properties'].get('importance', 'medium')
          new_importance = node.get('properties', {}).get('importance', 'medium')
          if new_importance == 'high' or current_importance == 'high':
            existing_node['properties']['importance'] = 'high'
          elif new_importance == 'medium' and current_importance == 'low':
            existing_node['properties']['importance'] = 'medium'

          # Update context (e.g., take the longest or first non-empty)
          new_context = node.get('properties', {}).get('context')
          if new_context and (not existing_node['properties'].get('context') or \
                              len(new_context) > len(existing_node['properties']['context'])):
            existing_node['properties']['context'] = new_context
          
          # Update paperId to be a comma-separated string of all unique paperIds
          existing_paper_ids_str = existing_node['properties'].get('paperId')
          new_paper_id = node.get('properties', {}).get('paperId')

          combined_paper_ids = set()
          if existing_paper_ids_str:
              combined_paper_ids.update(existing_paper_ids_str.split(','))
          if new_paper_id:
              combined_paper_ids.add(new_paper_id)

          if combined_paper_ids:
              existing_node['properties']['paperId'] = ','.join(sorted(list(combined_paper_ids)))
          else:
              existing_node['properties']['paperId'] = None


    # Now that nodes are merged and ID mappings are created, merge relationships
    for graph in graphs:
      for rel in graph.get('relationships', []):
        # Resolve source and target IDs to their canonical IDs
        canonical_source_id = id_to_canonical_id_map.get(rel['source'], rel['source'])
        canonical_target_id = id_to_canonical_id_map.get(rel['target'], rel['target'])

        rel_key = (canonical_source_id, rel['type'], canonical_target_id)

        if rel_key not in relationship_set:
          relationship_set.add(rel_key)
          merged_relationships.append({
            'source': canonical_source_id,
            'target': canonical_target_id,
            'type': rel['type'],
            'properties': {
              'confidence': rel.get('properties', {}).get('confidence', 0.8),
              'evidence': rel.get('properties', {}).get('evidence')
            }
          })
        else:
          # Relationship exists - boost confidence slightly
          for existing_rel in merged_relationships:
            if (existing_rel['source'] == canonical_source_id and
              existing_rel['type'] == rel['type'] and
              existing_rel['target'] == canonical_target_id):
              current_conf = existing_rel['properties'].get('confidence', 0.8)
              existing_rel['properties']['confidence'] = min(1.0, current_conf + 0.1)
              break

    return {
      'nodes': list(node_map.values()),
      'relationships': merged_relationships,
      'metadata': {
        'num_papers': len(graphs),
        'merged_at': datetime.utcnow().isoformat()
      }
    }


# Factory function
def get_extractor() -> ResearchGraphExtractor:
  """Get extractor instance."""
  return ResearchGraphExtractor()
