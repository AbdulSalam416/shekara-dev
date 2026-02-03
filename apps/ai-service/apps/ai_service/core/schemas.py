from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class NodePropertiesSchema(BaseModel):
    """Properties for a node in the knowledge graph."""
    frequency: int = Field(default=1, description="Number of papers mentioning this entity")
    importance: str = Field(default="medium", description="Importance level: high, medium, or low")
    context: Optional[str] = Field(default=None, description="Brief context of where this entity appears")
    paperId: Optional[str] = Field(default=None, description="ID of the paper this node came from")


class NodeSchema(BaseModel):
    """A node (entity) in the knowledge graph."""
    id: str = Field(description="Unique identifier (lowercase_underscore format)")
    type: str = Field(description="Entity type: Concept, Method, Dataset, Metric, Finding, Technology, or ResearchGap")
    label: str = Field(description="Human-readable display name")
    properties: NodePropertiesSchema = Field(default_factory=NodePropertiesSchema)


class RelationshipPropertiesSchema(BaseModel):
    """Properties for a relationship in the knowledge graph."""
    confidence: float = Field(default=0.8, ge=0.0, le=1.0, description="Confidence score (0.0-1.0)")
    evidence: Optional[str] = Field(default=None, description="Brief supporting evidence from the text")


class RelationshipSchema(BaseModel):
    """A relationship (edge) in the knowledge graph."""
    source: str = Field(description="Source node ID")
    target: str = Field(description="Target node ID")
    type: str = Field(description="Relationship type: USES, IMPROVES, EVALUATED_WITH, ACHIEVES, BASED_ON, OUTPERFORMS, IDENTIFIES_GAP")
    properties: RelationshipPropertiesSchema = Field(default_factory=RelationshipPropertiesSchema)


class GraphMetadataSchema(BaseModel):
    """Metadata about the knowledge graph."""
    num_papers: Optional[int] = Field(default=1, description="Number of papers in this graph")
    extracted_at: Optional[str] = Field(default=None, description="ISO timestamp of extraction")
    paper_id: Optional[str] = Field(default=None, description="ID of the paper (for single-paper extraction)")
    paper_length: Optional[int] = Field(default=None, description="Length of paper text in characters")
    truncated: Optional[bool] = Field(default=False, description="Whether the paper was truncated")


class GraphSchema(BaseModel):
    """Complete knowledge graph structure."""
    nodes: List[NodeSchema] = Field(default_factory=list, description="List of nodes/entities")
    relationships: List[RelationshipSchema] = Field(default_factory=list, description="List of relationships/edges")
    metadata: Optional[GraphMetadataSchema] = Field(default_factory=GraphMetadataSchema, description="Graph metadata")
