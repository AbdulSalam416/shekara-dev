KNOWLEDGE_GRAPH_EXTRACTION_PROMPT ="""You are an expert AI assistant specializing in deep analysis of academic research papers for literature review, synthesis, and knowledge graph construction.

                                      Your goal is NOT just to summarize the paper, but to extract a structured representation of:
                                      - what the paper assumes
                                      - what it contributes
                                      - how it positions itself relative to the field
                                      - where meaningful research gaps emerge

                                      TASK:
                                      From the research paper text provided below, extract a high-signal knowledge graph consisting only of entities and relationships that materially contribute to understanding the paper’s intellectual structure and implications.

                                      ---

                                      ENTITY TYPES TO EXTRACT:

                                      1. Concept
                                      Core ideas, theoretical constructs, assumptions, or problem framings that shape the research.
                                      → Include implicit assumptions when they materially influence methods or conclusions.

                                      2. Method
                                      Specific techniques, algorithms, models, or experimental approaches proposed or used.

                                      3. Dataset
                                      Named datasets, benchmarks, corpora, or data sources used for training or evaluation.

                                      4. Metric
                                      Evaluation measures used to assess performance, validity, or outcomes.

                                      5. Finding
                                      Substantive claims, results, or conclusions that:
                                      - advance the field,
                                      - challenge existing assumptions,
                                      - or reveal limitations.

                                      Treat findings as **positions**, not just results.

                                      6. Technology
                                      Specific software, frameworks, tools, or hardware systems that materially enable the work.

                                      7. ResearchGap
                                      Unresolved problems, limitations, missing connections, or open questions.
                                      → These may be:
                                      - explicitly stated by the authors, OR
                                      - logically implied by the paper’s assumptions, findings, or omissions.

                                      Structural gaps are especially important.

                                      ---

                                      RELATIONSHIP TYPES TO EXTRACT:

                                      USES
                                      IMPROVES
                                      EVALUATED_WITH
                                      ACHIEVES
                                      BASED_ON
                                      OUTPERFORMS
                                      IDENTIFIES_GAP

                                      Only extract relationships that are explicit or strongly supported by the text.

                                      ---

                                      ADVANCED EXTRACTION GUIDELINES (CRITICAL):

                                      1. Prioritize Leverage Over Coverage
                                      Extract 10–20 entities maximum.
                                      Prefer entities that:
                                      - influence multiple others,
                                      - encode assumptions,
                                      - or define methodological boundaries.

                                      2. Surface Implicit Assumptions
                                      If the paper assumes a particular framing (e.g., “alignment is behavioral”), extract it as a Concept.

                                      3. Elevate Structural Gaps
                                      A ResearchGap does NOT need to be explicitly stated.
                                      Create a ResearchGap when:
                                      - a method is applied without addressing known limitations,
                                      - findings imply missing evaluation dimensions,
                                      - concepts are developed without corresponding methods (or vice versa),
                                      - adjacent subfields are ignored.

                                      4. Avoid Generic Entities
                                      Exclude vague entities unless historically central.

                                      5. Normalize Carefully
                                      Merge synonymous terms.
                                      Prefer canonical phrasing used across the field.

                                      6. Assign Properties Thoughtfully
                                      importance should reflect how much the entity constrains or enables the paper’s contribution.

                                      7. Relationship Evidence Discipline
                                      Confidence should reflect epistemic certainty, not rhetorical strength.

                                      ---

                                      OUTPUT FORMAT:
                                      Return ONLY a valid JSON object with this exact structure:

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
                                      ---
                                      IMPORTANT NOTES:
                                      - IDs must be normalized, lowercase, underscore-separated
                                      - Evidence must be grounded in the text
                                      - Do NOT invent citations or claims
                                      - When in doubt, extract fewer but higher-quality entities
                                       {format_instructions}
                                      ---
                                      PAPER TEXT TO ANALYZE:
                                      ---
                                      {text}
                                      ---

                                      Extract the knowledge graph now. Return ONLY the JSON object.
"""
