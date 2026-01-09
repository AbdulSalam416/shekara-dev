# Knowledge Graph Builder - Project TODO

## Core Features

### Phase 1: Setup & Dependencies
- [ ] Install Google Generative AI SDK (@google/generative-ai)
- [ ] Install LangGraph and dependencies
- [ ] Install document processing libraries (pdf-parse, docx, mammoth)
- [ ] Install graph visualization library (react-force-graph)
- [ ] Configure Google Generative AI API key

### Phase 2: Database Schema
- [ ] Create documents table (id, userId, filename, content, uploadedAt, status)
- [ ] Create entities table (id, documentId, name, type, description, metadata)
- [ ] Create relationships table (id, documentId, sourceEntityId, targetEntityId, relationshipType, description)
- [ ] Create graph_states table (id, documentId, nodes, edges, createdAt)
- [ ] Create processing_jobs table (id, documentId, status, progress, error, startedAt, completedAt)
- [ ] Run database migrations

### Phase 3: Document Processing Pipeline
- [ ] Implement document chunking logic (recursive text splitting)
- [ ] Create LLM entity extraction function with structured output
- [ ] Implement relationship extraction from chunks
- [ ] Create batch processing for large documents
- [ ] Add error handling and retry logic
- [ ] Implement processing status tracking

### Phase 4: LangGraph Integration
- [ ] Design knowledge graph state structure
- [ ] Create LangGraph workflow for entity extraction
- [ ] Implement relationship mapping in graph
- [ ] Create graph construction from extracted data
- [ ] Add deduplication and entity linking

### Phase 5: Document Upload Interface
- [ ] Create upload component with drag-and-drop
- [ ] Implement file validation (type, size)
- [ ] Add file preview and metadata display
- [ ] Create upload progress indicator
- [ ] Implement error handling and user feedback

### Phase 6: Knowledge Graph Visualization
- [ ] Create graph visualization component with react-force-graph
- [ ] Implement zoom and pan functionality
- [ ] Add node selection and highlighting
- [ ] Implement edge rendering with labels
- [ ] Add physics simulation controls
- [ ] Create responsive canvas sizing

### Phase 7: Entity Detail Panel & Export
- [ ] Create entity detail panel component
- [ ] Display entity metadata and relationships
- [ ] Implement node click handlers
- [ ] Create graph export to JSON functionality
- [ ] Implement graph export to image (PNG/SVG)
- [ ] Add download functionality

### Phase 8: Integration & Testing
- [ ] Create main dashboard layout
- [ ] Integrate all components
- [ ] Add processing status indicators with real-time updates
- [ ] Implement error boundaries and error handling
- [ ] Test document upload flow
- [ ] Test entity extraction pipeline
- [ ] Test graph visualization
- [ ] Performance optimization

### Phase 9: Delivery
- [ ] Final testing and bug fixes
- [ ] Create checkpoint
- [ ] Deliver to user

## Technical Decisions
- Using react-force-graph for visualization (force-directed layout)
- Using Google Generative AI for entity and relationship extraction
- Using LangGraph for structured knowledge graph processing
- Using Drizzle ORM for database management
- Using tRPC for type-safe API communication
