KNOWLEDGE_GRAPH_EXTRACTION_PROMPT ="""You are an expert AI assistant specializing in deep analysis of academic research papers for literature review,                                       synthesis, and knowledge graph construction.

                                      Your goal is NOT just to summarize the paper, but to extract a structured representation of:
                                      - what the paper assumes
                                      - what it contributes
                                      - how it positions itself relative to the field
                                      - where meaningful research gaps emerge

                                      TASK:
                                      From the research paper text provided below, extract a high-signal knowledge graph consisting only of entities and relationships that materially contribute to understanding the paper’s intellectual structure and implications.
                                      Extract 20–30 entities per paper.


                                      ---

                                      ENTITY TYPES TO EXTRACT:

                                      1. Concept
                                      Core ideas, theoretical constructs, assumptions, or problem framings that shape the research.
                                      → Include implicit assumptions when they materially influence methods or conclusions. Treat generalizable claims as Concepts when they could apply beyond this paper.

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
                                      Specific software, frameworks, tools, or hardware systems that materially enable the work or are standard infrastructure assumed by the method.

                                      7. ResearchGap
                                      Unresolved problems, limitations, missing connections, or open questions.
                                      → These may be:
                                      - explicitly stated by the authors, OR
                                      - logically implied by the paper’s assumptions, findings, or omissions.

                                      Structural gaps are especially important.

                                      ---



                                      RELATIONSHIP EXTRACTION - MANDATORY MINIMUM
                                        RELATIONSHIP TYPES TO EXTRACT:

                                      USES
                                      IMPROVES
                                      EVALUATED_WITH
                                      ACHIEVES
                                      BASED_ON
                                      OUTPERFORMS
                                      IDENTIFIES_GAP
                                      ADDRESSES

                                      After extracting entities, you MUST connect them.
                                      Rules:
                                      - Every Method node MUST have at least 2 outgoing relationships
                                      - Every Finding node MUST have at least 1 incoming relationship
                                      - Every Dataset node MUST have at least 1 relationship
                                      - Every ResearchGap MUST be connected to what IDENTIFIES it

                                      BANNED: Extracting a node with zero relationships unless it is a
                                              standalone Concept with no clear connections.

                                      For the paper you just read, go through EVERY method you extracted
                                      and explicitly ask:
                                      1. What dataset was it evaluated on? → EVALUATED_WITH
                                      2. What concept is it based on? → BASED_ON
                                      3. What finding did it achieve? → ACHIEVES
                                      4. What prior method does it improve? → IMPROVES
                                      ---

                                      ADVANCED EXTRACTION GUIDELINES (CRITICAL):

                                      1. Prioritize Leverage Over Coverage
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

                                      4. Avoid vague or meaningless abstractions.
                                      DO NOT avoid field-defining canonical concepts that serve as shared anchors across papers.

                                      5. Normalize Carefully
                                      Merge synonymous terms.
                                      Prefer canonical phrasing used across the field.

                                      6. Assign Properties Thoughtfully
                                      importance should reflect how much the entity constrains or enables the paper’s contribution.

                                      7. Relationship Evidence Discipline
                                      Confidence should reflect epistemic certainty, not rhetorical strength.
                                      8. Canonical Awareness (Important)
                                      When extracting entities, prefer names that would be recognizable and reusable across multiple papers in the same subfield, even if the paper uses a more specific phrasing.
                                      9. Semantic Key Generation
                                      For each entity, generate a 'semantic_key' that represents the core, normalized concept, independent of specific phrasing or capitalization. This key should allow for deduplication of entities that are semantically identical but might appear with different labels or IDs across various papers. For example, "Deep Learning" and "deep learning algorithms" might both have a semantic_key of "deep_learning". This will help in merging entities across papers in the knowledge graph.
                                      Semantic Key Enforcement: If an entity corresponds to a well-known field concept (e.g., Transformer, Self-Attention, Attention Mechanism),
                                    you MUST use the canonical semantic_key used across the literature, even if the paper uses a variant phrasing.

                                    Example:
                                    - "Scaled Dot-Product Attention" → semantic_key: self_attention
                                    - "Channel Attention" → semantic_key: attention_mechanism
                                    - "Mobile Money Transactions → mobile_money

                                    ---
                                      CANONICAL ANCHOR REQUIREMENT (CRITICAL):
                                    Exactly one Concept node must be marked as the primary theoretical foundation (importance: high).
                                    - and reasonably appear in other works in this corpus.

                                    Examples include (but are not limited to):
                                    - "Attention Mechanism"
                                    - "Self-Attention"
                                    - "Transformer Architecture"
                                    - "Encoder-Decoder Framework"
                                    - "Sequence Modeling"

                                    These canonical entities MUST:
                                    - be extracted even if the paper’s main contribution is a specialization,
                                    - use a normalized, field-standard label,
                                    - share the SAME semantic_key across papers when applicable.

                                    Then, connect the paper-specific entities to these canonical anchors using BASED_ON or IMPROVES relationships.

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
                                          "context": "Brief description of where/how this entity appears in the paper",
                                          "semantic_key": "normalized_key_for_deduplication",
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
                                      - Each paper MUST include exactly one Concept node representing its primary theoretical foundation.
                                        This node should almost always be a canonical field-level concept.

                                       {format_instructions}

                                      ---
                                      PAPER TEXT TO ANALYZE:
                                      ---

                                      {text}

                                      ---

                                    Return JSON with 25-40 nodes and 15-30 relationships.
                                    VERY node must have semantic_key.
                                    EVERY relationship must have properties.
"""
