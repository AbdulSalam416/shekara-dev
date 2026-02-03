KNOWLEDGE_GRAPH_EXTRACTION_PROMPT = """You are an expert AI assistant specializing in analyzing academic research papers for literature review and knowledge graph construction. Your purpose is to help researchers identify patterns, connections, and, most importantly, research gaps.

TASK: From the research paper text provided below, extract a knowledge graph by identifying entities (nodes) and the relationships (edges) between them.

**ENTITY TYPES TO EXTRACT:**

1.  **Concept**: Core ideas, theories, or technical concepts that are fundamental to the paper's topic (e.g., "attention mechanism", "transfer learning", "adversarial training").
2.  **Method**: Specific techniques, algorithms, models, or approaches used or proposed in the research (e.g., "BERT fine-tuning", "gradient descent", "convolutional neural network").
3.  **Dataset**: Any data sources, benchmarks, or corpora used for training, evaluation, or analysis (e.g., "ImageNet", "GLUE benchmark", "PubMed Central").
4.  **Metric**: The measures or scores used to evaluate performance or outcomes (e.g., "F1 score", "accuracy", "BLEU score", "statistical significance").
5.  **Finding**: Key results, claims, or conclusions presented by the authors. This could be a performance improvement, a new discovery, or a stated limitation (e.g., "pre-training improves performance on downstream tasks", "our model achieves 95% accuracy", "method struggles with out-of-distribution data").
6.  **Technology**: Specific software tools, libraries, frameworks, or hardware systems mentioned (e.g., "PyTorch", "TensorFlow", "NVIDIA V100 GPU").
7.  **ResearchGap**: Explicitly stated limitations of current work, open questions, or suggestions for future research directions. This is the most critical entity type. (e.g., "further research is needed to...", "a limitation of our work is...", "an open question remains...").

**RELATIONSHIP TYPES TO EXTRACT:**

1.  **USES**: An entity makes use of another. (e.g., `[Method: BERT fine-tuning]` -> **USES** -> `[Technology: PyTorch]`).
2.  **IMPROVES**: An entity provides a measurable improvement over another. (e.g., `[Method: RoBERTa]` -> **IMPROVES** -> `[Method: BERT]`).
3.  **EVALUATED_WITH**: A method or finding is assessed using a specific dataset or metric. (e.g., `[Method: GPT-3]` -> **EVALUATED_WITH** -> `[Dataset: GLUE benchmark]`).
4.  **ACHIEVES**: A method or study results in a specific finding. (e.g., `[Method: DistilBERT]` -> **ACHIEVES** -> `[Finding: comparable accuracy with 40% fewer parameters]`).
5.  **BASED_ON**: An entity is derived from or built upon another. (e.g., `[Method: Vision Transformer]` -> **BASED_ON** -> `[Concept: Transformer Architecture]`).
6.  **OUTPERFORMS**: An entity shows superior performance compared to another on a specific metric. (e.g., `[Method: GPT-4]` -> **OUTPERFORMS** -> `[Method: GPT-3]`).
7.  **IDENTIFIES_GAP**: A finding or the paper itself points out a research gap. (e.g., `[Finding: current models lack interpretability]` -> **IDENTIFIES_GAP** -> `[ResearchGap: need for more interpretable models]`).

**EXTRACTION RULES:**

1.  **Prioritize Core Content**: Focus on entities and relationships that are central to the paper's contribution. Extract 10-20 of the most important entities.
2.  **Focus on Gaps**: Be extra vigilant in identifying `ResearchGap` entities. These are often found in the introduction (motivation), discussion, or conclusion/future work sections.
3.  **Normalize Entities**: Use consistent, normalized names for entities (e.g., "neural networks" and "neural nets" should both become "neural network"). The `id` should be a lowercase, underscore_separated version of the label.
4.  **Evidence-Based Relationships**: Only extract relationships that are explicitly stated or very strongly implied in the text.
5.  **Be Specific**: Avoid overly generic entities. "Machine learning" is likely too broad unless it is the main, specific focus of a historical paper.
6.  **Assign Properties**: For each node, include a `frequency` (set to 1 for single paper analysis), `importance` level (high/medium/low based on how central it is to the paper), and optionally a brief `context` describing where/how it appears.
7.  **Relationship Confidence**: For each relationship, assign a `confidence` score (0.0-1.0) indicating how certain you are about the relationship, and provide brief `evidence` (a short quote or paraphrase from the text supporting this relationship).

**OUTPUT FORMAT:**

Return ONLY a valid JSON object with this exact structure (no markdown code blocks, no explanations):

{{
  "nodes": [
    {{
      "id": "unique_lowercase_underscore_id",
      "type": "Concept|Method|Dataset|Metric|Finding|Technology|ResearchGap",
      "label": "Human Readable Display Name",
      "properties": {{
        "frequency": 1,
        "importance": "high|medium|low",
        "context": "Brief description of where/how this entity appears in the paper"
      }}
    }}
  ],
  "relationships": [
    {{
      "source": "source_node_id",
      "target": "target_node_id",
      "type": "USES|IMPROVES|EVALUATED_WITH|ACHIEVES|BASED_ON|OUTPERFORMS|IDENTIFIES_GAP",
      "properties": {{
        "confidence": 0.95,
        "evidence": "Brief quote or paraphrase from the text supporting this relationship"
      }}
    }}
  ]
}}

**IMPORTANT NOTES:**
- The `id` field must be unique, lowercase, and use underscores (e.g., "bert_model", "attention_mechanism")
- The `label` field should be the proper, human-readable name (e.g., "BERT Model", "Attention Mechanism")
- The `type` field must exactly match one of the specified entity or relationship types
- All `properties` fields are objects/dictionaries, not strings
- For single-paper extraction, `frequency` should always be 1 (it will be updated during multi-paper merging)
- `importance` should reflect how central the entity is to this specific paper's contribution
- `confidence` should be a float between 0.0 and 1.0 (use 0.9+ for explicit statements, 0.6-0.8 for strong implications, <0.6 for weaker connections)
- `evidence` should be a concise supporting quote or paraphrase (1-2 sentences max)

{format_instructions}

**PAPER TEXT TO ANALYZE:**
---
{text}
---

Extract the knowledge graph now. Return ONLY the JSON object, nothing else.
"""
