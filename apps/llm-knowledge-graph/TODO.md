# 🧠 MindGraph AI - The Ultimate Research Co-Pilot

**Mission:** To build an indispensable tool for researchers that transforms the literature review process from a manual chore into an accelerated journey of discovery. We are not just summarizing papers; we are building an AI that reveals the hidden architecture of knowledge, pinpoints research frontiers, and actively assists in creating new insights.

**Success Metric:** Researchers report a >50% reduction in the time it takes to get up to speed in a new field and can identify at least 3 novel research questions they wouldn't have found otherwise.

---

## 🏛️ Core Pillars

MindGraph AI is built on four powerful pillars of analysis:

1.  **Knowledge Foundation:** Automatically constructs a rich, interconnected knowledge graph from a corpus of research papers, extracting not just citations but concepts, methods, authors, and their relationships.
2.  **Influence Mapping:** Goes beyond simple citation counts to identify true intellectual influence using sophisticated network analysis algorithms (e.g., PageRank, Betweenness Centrality) to pinpoint seminal works, key authors, and foundational concepts.
3.  **Temporal & Thematic Analysis:** Visualizes the evolution of the research field over time. It identifies emerging trends, hot topics, and paradigm shifts by clustering themes and tracking their prominence chronologically.
4.  **Opportunity Discovery & Synthesis:** The core of the "monster" tool. This pillar actively identifies research gaps, unexplored connections between concepts, and conflicting findings. It then uses this structured insight to help generate summaries and draft "Related Work" sections.

---

## 🗺️ Development Roadmap

### Phase 1: MVP - Influence & Centrality Engine (4 Weeks)

**Goal:** Launch a core product that delivers immediate value by identifying key influencers and seminal works. This validates our core graph extraction and analysis pipeline.

---

#### **WEEK 1: Foundation & Data Ingestion**

*   [ ] **Project Scaffolding:**
    *   [ ] Initialize Next.js 14+ project (App Router) with TypeScript, Tailwind CSS.
    *   [ ] Set up `eslint.config.mjs` and `.prettierrc` for code quality.
    *   [ ] Establish folder structure with clear separation for `app`, `components`, `services`, `lib`, and `types`.
*   [ ] **Core Dependencies:**
    ```bash
    pnpm add langchain @langchain/google-genai
    pnpm add graphology graphology-metrics
    pnpm add pdf-parse
    pnpm add d3 @types/d3 react-force-graph-2d
    pnpm add lucide-react
    pnpm add zustand # For state management
    pnpm add class-variance-authority clsx tailwind-merge # For UI components
    ```
*   [ ] **PDF Processing Pipeline:**
    *   [ ] Create a robust `pdfParserService` that extracts text and metadata (Title, Authors, Year, DOI).
    *   [ ] Implement error handling for password-protected, corrupted, or text-less (image-only) PDFs.
    *   [ ] Use a web worker to offload PDF parsing from the main thread to prevent UI freezing.
*   [ ] **State Management:**
    *   [ ] Set up a Zustand store to manage application state: file uploads, analysis status (idle, processing, success, error), graph data, and analysis results.

---

#### **WEEK 2: Graph Extraction & Analysis Core**

*   [ ] **LangChain + Gemini Integration:**
    *   [ ] Develop a `graphExtractionService` that takes text from multiple documents.
    *   [ ] Engineer a sophisticated prompt for the Gemini model to extract entities and relationships based on a defined schema (e.g., `Paper`, `Author`, `Concept`, `Method`, `Cites`, `UsesMethod`, `ExploresConcept`).
    *   [ ] Implement the `LLMGraphTransformer` to reliably convert the LLM's JSON output into a `graphology` instance.
*   [ ] **Centrality Analysis Service:**
    *   [ ] Create `centralityAnalysisService.ts`.
    *   [ ] Implement multiple centrality metrics for a more nuanced understanding of influence:
        *   **Degree Centrality:** For direct connections.
        *   **PageRank:** For transitive influence (the "Google" algorithm).
        *   **Betweenness Centrality:** To find nodes that bridge different clusters of knowledge.
    *   [ ] Write a function to normalize and combine these scores into a single "Influence Score".
*   [ ] **Data Models (TypeScript):**
    *   [ ] Define strict TypeScript interfaces for `NodeData`, `EdgeData`, `GraphData`, and `AnalysisResult`. Ensure types are consistent from the API to the UI.

---

#### **WEEK 3: UI - Visualization & Influence Ranking**

*   [ ] **Main Dashboard Layout:**
    *   [ ] Design a clean, modern dashboard using a two-panel layout: Graph Visualization on one side, Analysis & Insights on the other.
    *   [ ] Implement a multi-step analysis process UI: 1. Upload -> 2. Analyzing -> 3. Dashboard.
*   [ ] **Graph Visualization (`KnowledgeGraph.tsx`):**
    *   [ ] Use `react-force-graph-2d` for the initial version.
    *   [ ] **Crucial UX:**
        *   Size nodes by **Influence Score**.
        *   Color nodes by type (Paper, Concept, Author, etc.).
        *   Implement click-to-focus on a node, highlighting its 1st and 2nd-degree connections.
        *   Show detailed node info in a sidebar/popover on click.
        *   Optimize for performance with large graphs (>500 nodes).
*   [ ] **Influence Dashboard (`InfluencePanel.tsx`):**
    *   [ ] Create ranked, sortable, and filterable lists for:
        *   "Seminal Papers"
        *   "Key Authors"
        *   "Core Concepts"
        *   "Bridge Concepts" (from Betweenness Centrality).
    *   [ ] Clicking an item in the list should focus the corresponding node on the graph.
    *   [ ] For each item, show a "Why it's influential" justification (e.g., "High PageRank, connects 3 major topic clusters").

---

#### **WEEK 4: Integration, Polish & Feedback**

*   [ ] **End-to-End Pipeline Integration:**
    *   [ ] Connect the full flow: File Upload -> PDF Parsing -> Graph Extraction -> Centrality Analysis -> UI Update.
    *   [ ] Implement comprehensive loading states, progress indicators, and user-friendly error messages throughout the app.
*   [ ] **Onboarding & Polish:**
    *   [ ] Add a "Load Demo" button with a pre-analyzed dataset (e.g., famous papers in AI) to instantly showcase the tool's value.
    *   [ ] Write clear, concise UI copy that explains what the user is seeing.
    *   [ ] Add a simple settings panel to tweak graph physics or display.
*   [ ] **Deployment & User Testing:**
    *   [ ] Deploy the app to Vercel or Netlify.
    *   [ ] Recruit 10-15 PhD students or researchers for a closed beta.
    *   [ ] Create a structured feedback form focusing on the "Aha!" moment, usability, and perceived value of the influence analysis.
    *   [ ] **Goal:** Get at least 50% of testers to say, "This would have saved me days/weeks on my last literature review."

---

### Phase 2: Temporal & Thematic Intelligence (Post-MVP)

*   **Thematic Clustering:** Use embedding models (like `text-embedding-ada-002` or Gemini's equivalent) on paper abstracts/concepts to perform clustering (e.g., K-Means, HDBSCAN). This will automatically group papers into thematic clusters.
*   **Trend Analysis View:** Create a new dashboard view that plots the prominence of themes, concepts, and authors over time (using publication year). Visualize the rise and fall of research trends.
*   **UI - Timeline View:** Implement an interactive timeline that allows users to slide through time and see how the knowledge graph evolves.

---

### Phase 3: Opportunity Discovery & AI Synthesis (The "Monster")

*   **Gap Analysis Algorithm:** Develop an algorithm that traverses the graph to find:
    *   **Structural Gaps:** Pairs or groups of concepts that are highly connected within their own clusters but have few or no connections between them (potential for interdisciplinary research).
    *   **Contradiction Detection:** Use an LLM to review papers that cite each other and prompt it to look for conflicting claims or findings. Flag these on the graph.
*   **"Research Questions" Generator:** Based on identified gaps, use a generative model to propose novel research questions. E.g., "Concept A and Concept B are rarely studied together. A possible research question is: How does A influence B in the context of C?".
*   **Automated Synthesis:**
    *   Allow users to select a set of nodes (papers, concepts).
    *   Use an LLM, primed with the structured information from the graph, to generate a coherent narrative summary, a "Related Work" section draft, or a compare-and-contrast analysis.

---

### Phase 4: Collaboration, Scale & Enterprise

*   **User Accounts & Persistent Storage:** Move from transient, session-based analysis to saved projects. Implement user authentication and use a proper database (e.g., Neon for Postgres or a dedicated Graph DB like Neo4j) to store user projects and graphs.
*   **Collaboration Features:** Allow users to share their analysis, collaboratively annotate graphs, and build shared knowledge libraries for their research groups.
*   **API & Integrations:** Expose an API for power users and integrate with tools like Zotero, Mendeley, and Notion.

---

## 🤖 Technology & Architecture Principles

*   **Frontend:**
    *   **Framework:** Next.js (App Router)
    *   **Styling:** Tailwind CSS
    *   **Components:** shadcn/ui - Radix UI for accessibility and custom styling.
    *   **State Management:** Zustand for simple, powerful global state.
    *   **Graph Viz:** Start with `react-force-graph-2d`. Be prepared to migrate to direct D3 or `vis-network` if more customizability is needed for advanced interactions in later phases.
*   **Backend & AI:**
    *   **Server:** Next.js API Routes are sufficient for the MVP. Consider a dedicated backend (e.g., FastAPI with Python for heavy data science) in Phase 3/4 if needed.
    *   **LLM Orchestration:** LangChain.js to chain prompts and manage interactions with the Gemini API.
    *   **Graph Engine:** `graphology` is excellent for in-memory graph manipulation and metrics.
*   **Architecture:**
    *   **Performant by Default:** Offload heavy computations (PDF parsing, complex graph algorithms) to Web Workers to keep the UI responsive.
    *   **Modular Services:** Keep logic encapsulated in services (`pdfParserService`, `graphExtractionService`, etc.) for testability and maintainability.
    *   **Start Simple, Scale Gracefully:** Begin with file/session-based processing. Abstract data access so it can be easily swapped with a database backend later without major refactoring.

---

## ✨ Design & UX Principles

*   **Clarity from Complexity:** The primary goal is to make a complex web of information instantly understandable. The UI must be clean, intuitive, and guide the user's focus to what's important.
*   **Interactive Discovery:** The user should feel like they are actively exploring a landscape of knowledge, not just viewing a static report. Clicks, hovers, and filters should reveal deeper layers of insight.
*   **Insight, Not Just Data:** Don't just show numbers and lists. Tell a story. Explain *why* a paper is influential. Suggest *what* a research gap might mean.

---

## 💪 MOTIVATION

Remember:
- **Ship fast, learn faster**
- **Talk to users constantly**
- **One killer feature beats ten mediocre ones**
- **If this doesn't work, we'll know in 4 weeks, not 6 months**

**Let's build a monster. 🚀**