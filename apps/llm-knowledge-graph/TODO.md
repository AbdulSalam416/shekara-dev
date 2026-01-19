# 🚀 MindGraph AI - MVP TODO

**Goal:** Validate that researchers will use pattern/gap identification for literature reviews  
**Timeline:** 4 weeks  
**Success Metric:** 5/10 beta users say "this found something I missed"

---

## 📅 WEEK 1: Foundation & Setup

### Day 1-2: Project Setup
- [ ] Initialize Next.js project with TypeScript
  ```bash
  npx create-next-app@latest mindgraph-ai --typescript --tailwind --app
  cd mindgraph-ai
  ```
- [ ] Install core dependencies
  ```bash
  npm install langchain @langchain/google-genai
  npm install d3 @types/d3
  npm install react-force-graph-2d  # For quick MVP graph
  npm install lucide-react
  npm install pdf-parse  # For PDF text extraction
  ```
- [ ] Set up environment variables
  ```bash
  # .env.local
  GOOGLE_API_KEY=your_gemini_api_key_here
  ```
- [ ] Create basic folder structure
  ```
  src/
  ├── app/
  │   ├── page.tsx (landing)
  │   └── analyze/
  │       └── page.tsx (main app)
  ├── components/
  │   ├── ui/ (shadcn components)
  │   ├── FileUpload.tsx
  │   ├── KnowledgeGraph.tsx
  │   └── GapAnalysis.tsx
  ├── services/
  │   ├── graphExtractionService.ts
  │   ├── gapDetectionService.ts
  │   └── pdfParser.ts
  └── types/
      └── graph.ts
  ```
- [ ] Set up Git repository
  ```bash
  git init
  git add .
  git commit -m "Initial setup"
  ```

### Day 3: PDF Processing Pipeline
- [ ] Create PDF text extraction utility
  ```typescript
  // src/services/pdfParser.ts
  export async function extractTextFromPDF(file: File): Promise<string>
  ```
- [ ] Test with 3 sample research papers
- [ ] Handle multi-page PDFs
- [ ] Extract metadata (title, authors if possible)
- [ ] Add error handling for corrupted PDFs

### Day 4: LangChain + Gemini Integration
- [ ] Create graph extraction service
  ```typescript
  // src/services/graphExtractionService.ts
  class ResearchGraphExtractor {
    async extractFromPaper(text: string): Promise<GraphData>
  }
  ```
- [ ] Configure LLMGraphTransformer with academic schema
  ```typescript
  allowedNodes: ["Concept", "Method", "Dataset", "Finding", "Theory"]
  allowedRelationships: ["USES", "EXTENDS", "CONTRADICTS", "EVALUATES_WITH"]
  ```
- [ ] Test extraction on 5 sample papers
- [ ] Verify JSON output format
- [ ] Add retry logic for API failures
- [ ] Log token usage and costs

### Day 5: Data Models & Types
- [ ] Define TypeScript interfaces
  ```typescript
  // src/types/graph.ts
  interface Node {
    id: string;
    type: string;
    label: string;
    properties: Record<string, any>;
  }
  
  interface Relationship {
    source: string;
    target: string;
    type: string;
    properties: Record<string, any>;
  }
  
  interface ResearchGap {
    id: string;
    concepts: string[];
    description: string;
    evidence: string[];
    potentialImpact: 'high' | 'medium' | 'low';
  }
  ```
- [ ] Create sample mock data for testing UI
- [ ] Set up state management (React Context or Zustand)

---

## 📅 WEEK 2: Core Features

### Day 6-7: Gap Detection Algorithm
- [ ] Create gap detection service
  ```typescript
  // src/services/gapDetectionService.ts
  export function detectResearchGaps(
    nodes: Node[], 
    relationships: Relationship[]
  ): ResearchGap[]
  ```
- [ ] Implement missing edge detection
  - Find concepts that appear frequently but never together
  - Calculate co-occurrence matrix
  - Identify statistically significant missing connections
- [ ] Rank gaps by potential impact
  ```typescript
  // High impact = both concepts appear frequently but never together
  impact = (frequencyA * frequencyB) / totalPapers
  ```
- [ ] Generate natural language descriptions
  ```typescript
  // Use Gemini to generate "why this matters" for each gap
  const description = await generateGapDescription(conceptA, conceptB, papers)
  ```
- [ ] Test with mock graph data (50 nodes, 100 edges)

### Day 8-9: Basic UI - File Upload
- [ ] Create landing page with value prop
  ```tsx
  // src/app/page.tsx
  "Upload research papers → Get gap analysis in minutes"
  ```
- [ ] Build file upload component
  ```tsx
  // src/components/FileUpload.tsx
  - Drag & drop zone
  - Multiple file support (max 10 PDFs for MVP)
  - File size validation (max 10MB per file)
  - Progress indicator during upload
  ```
- [ ] Add file list with remove option
- [ ] Show paper metadata (filename, size, page count)
- [ ] Add "Analyze" button (disabled until files uploaded)

### Day 10: Graph Visualization (Quick Version)
- [ ] Implement React Force Graph visualization
  ```tsx
  // src/components/KnowledgeGraph.tsx
  import ForceGraph2D from 'react-force-graph-2d';
  
  - Color nodes by type
  - Size nodes by frequency
  - Show relationship labels on hover
  - Click node to see details
  ```
- [ ] Add legend for node types
- [ ] Add zoom/pan controls
- [ ] Highlight connected nodes on hover
- [ ] Test with 20-50 nodes

---

## 📅 WEEK 3: Gap Analysis UI & Integration

### Day 11-12: Gap Analysis Display
- [ ] Create GapAnalysis component
  ```tsx
  // src/components/GapAnalysis.tsx
  
  Display for each gap:
  - Gap title (e.g., "Vision Transformers + Few-Shot Learning")
  - Impact badge (High/Medium/Low)
  - Evidence section (which papers mention each concept)
  - "Why this matters" description
  - Suggested research question
  - Related papers list
  ```
- [ ] Sort gaps by impact
- [ ] Add filter by impact level
- [ ] Add search/filter gaps
- [ ] Click gap to highlight on graph

### Day 13: Full Integration - Analysis Pipeline
- [ ] Connect all pieces together
  ```typescript
  User uploads PDFs
    ↓
  Extract text from PDFs
    ↓
  Send to Gemini for entity extraction
    ↓
  Build knowledge graph
    ↓
  Run gap detection algorithm
    ↓
  Display graph + gaps
  ```
- [ ] Add loading states
  ```tsx
  - "Extracting text from PDFs..." (0-20%)
  - "Analyzing paper 1 of 5..." (20-80%)
  - "Detecting research gaps..." (80-95%)
  - "Generating insights..." (95-100%)
  ```
- [ ] Add error handling and user feedback
- [ ] Show analysis summary
  ```
  ✓ 5 papers analyzed
  ✓ 67 concepts extracted
  ✓ 134 relationships mapped
  ✓ 3 research gaps identified
  ```

### Day 14: Dashboard Layout
- [ ] Create main analysis page layout
  ```
  ┌────────────────────────────────────────┐
  │ Header: MindGraph AI - Analysis        │
  ├────────────────────────────────────────┤
  │ ┌────────────┐ ┌──────────────────────┐│
  │ │            │ │                      ││
  │ │   Graph    │ │   Gap Analysis       ││
  │ │            │ │   (scrollable list)  ││
  │ │            │ │                      ││
  │ └────────────┘ └──────────────────────┘│
  │ ┌────────────────────────────────────┐ │
  │ │ Quick Stats & Insights             │ │
  │ └────────────────────────────────────┘ │
  └────────────────────────────────────────┘
  ```
- [ ] Add tab navigation (Graph / Gaps / Papers)
- [ ] Make responsive (mobile-friendly)
- [ ] Add export button (export gaps as PDF/Markdown)

---

## 📅 WEEK 4: Polish & User Testing

### Day 15-16: UI Polish & UX Improvements
- [ ] Improve graph visualization
  - Add better colors and styling
  - Improve label readability
  - Add mini-map for large graphs
  - Add search nodes feature
- [ ] Add onboarding/tutorial
  ```
  "Welcome to MindGraph! Here's how it works:
  1. Upload 5-10 research papers
  2. We'll extract concepts and relationships
  3. Get a list of research gaps you might have missed"
  ```
- [ ] Add example/demo with pre-loaded data
  - "Try with sample papers" button
  - Show analysis of 5 ML papers
- [ ] Improve loading experience
  - Animated progress bar
  - Show interesting facts while processing
  - "Did you know? The average literature review takes 40+ hours..."

### Day 17: Data Export Features
- [ ] Export gap analysis as Markdown
  ```markdown
  # Research Gap Analysis
  Generated by MindGraph AI on [date]
  
  ## Gap #1: Vision Transformers + Few-Shot Learning
  **Impact:** High
  ...
  ```
- [ ] Export graph as SVG/PNG
- [ ] Export node/edge data as JSON/CSV
- [ ] Add "Share analysis" link (optional, just copy shareable text for now)

### Day 18-19: Beta User Testing
- [ ] Find 10 PhD students (Reddit, Twitter, personal network)
  - r/PhD, r/GradSchool, r/AskAcademia
  - Academic Twitter
  - University forums
- [ ] Send them access (deploy to Vercel)
- [ ] Give them task:
  ```
  "Upload 5-10 papers from your current literature review.
   Tell us:
   1. Did we identify any gaps you hadn't thought of?
   2. Were the gaps relevant/useful?
   3. Would you use this for your next lit review?"
  ```
- [ ] Collect feedback in a spreadsheet
- [ ] Watch them use it (Loom recordings or live calls)
- [ ] Note where they get confused
- [ ] Track usage analytics (how many papers uploaded, time spent, etc.)

### Day 20: Iteration Based on Feedback
- [ ] Fix top 3 bugs/issues reported
- [ ] Improve top 2 UX pain points
- [ ] Adjust gap detection algorithm if needed
- [ ] Add any quick-win features users requested
- [ ] Prepare demo for next round of users

---

## 🎯 MVP LAUNCH CHECKLIST

### Technical
- [ ] Deploy to Vercel/Netlify
  ```bash
  vercel --prod
  ```
- [ ] Set up error tracking (Sentry or similar)
- [ ] Add basic analytics (Plausible or Posthog)
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Create backup of API keys
- [ ] Set usage limits on Gemini API (budget alerts)

### Content
- [ ] Write simple landing page copy
  ```
  "Find research gaps your competitors are missing
   Upload papers → Get insights in minutes"
  ```
- [ ] Create 1-minute demo video (Loom)
- [ ] Write brief documentation
  - "How to use MindGraph"
  - "What is a research gap?"
  - "How we detect gaps"
- [ ] Prepare FAQ
  ```
  - How accurate is the gap detection?
  - What file formats do you support?
  - How much does it cost?
  - Do you store my papers?
  ```

### Legal/Privacy
- [ ] Write simple privacy policy
  ```
  "We use Gemini API for analysis.
   Your papers are processed but not stored by Google.
   We don't train on your data."
  ```
- [ ] Add Terms of Service (use template)
- [ ] Add data deletion option

### Marketing/Outreach
- [ ] Create Twitter account (@MindGraphAI)
- [ ] Write launch tweet
  ```
  "Built MindGraph to solve my own problem: 
   finding research gaps in lit reviews takes forever.
   
   Now it takes 5 minutes.
   
   Upload papers → Get gap analysis
   
   Free beta: [link]"
  ```
- [ ] Post on Reddit
  - r/GradSchool: "I built a tool to automate lit review gap analysis"
  - r/PhD: "Free tool for finding research gaps"
  - r/MachineLearning: "Built an AI research assistant"
- [ ] Email 20 researchers you know
- [ ] Post on LinkedIn (if you have audience)

---

## 🎉 WEEK 4 END GOAL

**By end of Week 4, you should have:**

✅ Working MVP deployed and accessible
✅ 10+ beta users who have uploaded papers
✅ At least 3 users who said "this helped me find something new"
✅ Clear feedback on what to improve
✅ Decision point: continue building or pivot

**Success Criteria:**
- 5/10 users find at least 1 useful gap
- Users upload avg 5+ papers each
- Users spend avg 10+ minutes exploring results
- At least 2 users ask "when can I pay for this?"

**If these aren't met:**
- Pivot the feature set (maybe pattern detection instead?)
- Change target user (maybe industry researchers not PhD students?)
- Kill the project and move on

---

## 📊 METRICS TO TRACK

Create a simple spreadsheet to track:

| Metric | Target | Actual |
|--------|--------|--------|
| Beta users signed up | 10 | ? |
| Papers uploaded | 50+ | ? |
| Avg papers per user | 5+ | ? |
| Users who found useful gaps | 5/10 | ? |
| Time spent analyzing | 10+ min | ? |
| Would pay ($15/mo) | 3/10 | ? |
| Bugs reported | <10 | ? |
| Feature requests | - | ? |

---

## 🛠️ TECH STACK SUMMARY

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Force Graph (Week 1-3) → D3.js (later)

**Backend/API:**
- Next.js API routes
- LangChain
- Gemini 1.5 Flash API
- PDF-parse

**Deployment:**
- Vercel (frontend + API)
- Environment variables for API keys

**Analytics:**
- Plausible or Posthog (privacy-friendly)
- Simple custom event tracking

---

## 💰 ESTIMATED COSTS (MVP)

- Gemini API: ~$5-10 (100 papers × $0.0009)
- Vercel hosting: $0 (free tier)
- Domain (optional): $12/year
- **Total: ~$10-20 for 4 weeks**

---

## 🚨 ANTI-PATTERNS TO AVOID

❌ **Don't build:**
- User authentication (not needed for MVP)
- Payment system (validate first)
- Mobile app (web is fine)
- Advanced graph layouts (force-directed is enough)
- Pattern detection AND contradiction finder (just gaps for MVP)
- Multi-user collaboration (single user only)
- Database (store in memory/state for MVP)

✅ **Do build:**
- The absolute minimum to test the hypothesis
- One killer feature (gap detection) really well
- Something you can show users this week

---

## 📞 VALIDATION QUESTIONS FOR USERS

After they use it, ask:

1. **Did we find any gaps you hadn't noticed?** (Yes/No)
2. **Were those gaps actually useful/relevant?** (1-5 scale)
3. **Would you use this for your next lit review?** (Yes/Maybe/No)
4. **What would make this indispensable for you?** (Open)
5. **Would you pay $15/month for this?** (Yes/Maybe/No)

If 5+ users say Yes to #1 and #3 → **You have something. Keep building.**

If <5 users say Yes → **Pivot or kill.**

---

## 🎯 WEEK 5 DECISION TREE

**If MVP is successful:**
- [ ] Add payment (Stripe)
- [ ] Improve graph visualization (D3.js)
- [ ] Add pattern detection
- [ ] Build waiting list for public launch

**If MVP gets lukewarm response:**
- [ ] Interview users deeply - what's missing?
- [ ] Try different feature (contradiction finder?)
- [ ] Try different user segment (industry researchers?)

**If MVP fails:**
- [ ] Pivot to B2B (research teams)
- [ ] Pivot to different domain (legal docs, patents?)
- [ ] Move on to next idea

---

## 🔥 FIRST STEPS

**Day 1 - Start Here:**

```bash
# 1. Create project
npx create-next-app@latest mindgraph-ai --typescript --tailwind --app
cd mindgraph-ai

# 2. Install dependencies
npm install langchain @langchain/google-genai
npm install d3 @types/d3
npm install react-force-graph-2d
npm install lucide-react
npm install pdf-parse

# 3. Create .env.local
echo "GOOGLE_API_KEY=your_key_here" > .env.local

# 4. Create folder structure
mkdir -p src/components/ui
mkdir -p src/services
mkdir -p src/types
mkdir -p src/app/analyze

# 5. Initialize git
git init
git add .
git commit -m "Initial MindGraph AI setup"

# 6. Start dev server
npm run dev
```

**Then check off Day 1-2 tasks above!**

---

## 💪 MOTIVATION

Remember:
- **Ship fast, learn faster**
- **Talk to users constantly**
- **One killer feature beats ten mediocre ones**
- **If this doesn't work, you'll know in 4 weeks, not 6 months**

**LET'S FUCKING GO! 🚀**

---

*Last updated: [Today's date]*
*Current status: Ready to start Week 1*