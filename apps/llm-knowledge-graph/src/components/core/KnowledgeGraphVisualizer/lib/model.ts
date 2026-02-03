export const defaultGraphData = {
  "nodes": [
    {
      "id": "lms",
      "type": "Concept",
      "label": "Learning Management System (LMS)"
    },
    {
      "id": "customized_lms_development",
      "type": "Method",
      "label": "Customized LMS Development"
    },
    {
      "id": "agile_methodology",
      "type": "Method",
      "label": "Agile Methodology"
    },
    {
      "id": "tam",
      "type": "Concept",
      "label": "Technology Acceptance Model (TAM)"
    },
    {
      "id": "utaut",
      "type": "Concept",
      "label": "Unified Theory of Acceptance and Use of Technology (UTAUT)"
    },
    {
      "id": "social_presence_theory",
      "type": "Concept",
      "label": "Social Presence Theory"
    },
    {
      "id": "coi_framework",
      "type": "Concept",
      "label": "Community of Inquiry (CoI) Framework"
    },
    {
      "id": "communication_collaboration",
      "type": "Concept",
      "label": "Communication and Collaboration"
    },
    {
      "id": "node_js",
      "type": "Technology",
      "label": "Node.js"
    },
    {
      "id": "react_js",
      "type": "Technology",
      "label": "React.js"
    },
    {
      "id": "mongodb",
      "type": "Technology",
      "label": "MongoDB"
    },
    {
      "id": "firebase",
      "type": "Technology",
      "label": "Firebase"
    },
    {
      "id": "learning_outcomes",
      "type": "Metric",
      "label": "Learning Outcomes"
    },
    {
      "id": "user_engagement",
      "type": "Metric",
      "label": "User Engagement"
    },
    {
      "id": "finding_lms_user_friendly",
      "type": "Finding",
      "label": "LMS is Intuitive and User-Friendly"
    },
    {
      "id": "finding_lms_improves_learning",
      "type": "Finding",
      "label": "LMS Improves Learning Outcomes"
    },
    {
      "id": "finding_lms_increases_interactions",
      "type": "Finding",
      "label": "LMS Increases User Interactions"
    },
    {
      "id": "gap_cost_effective_lms_studies",
      "type": "ResearchGap",
      "label": "Lack of Studies on Cost-Effective LMS Tailored to Individual School Needs"
    },
    {
      "id": "gap_oer_strategies",
      "type": "ResearchGap",
      "label": "Need for OER Strategies Aligned with Diverse Learning Styles"
    },
    {
      "id": "gap_ai_tools_research",
      "type": "ResearchGap",
      "label": "Need for Research on Personalized Learning and AI-Driven Educational Tools"
    }
  ],
  "relationships": [
    {
      "source": "customized_lms_development",
      "target": "agile_methodology",
      "type": "USES"
    },
    {
      "source": "customized_lms_development",
      "target": "tam",
      "type": "BASED_ON"
    },
    {
      "source": "customized_lms_development",
      "target": "utaut",
      "type": "BASED_ON"
    },
    {
      "source": "customized_lms_development",
      "target": "node_js",
      "type": "USES"
    },
    {
      "source": "customized_lms_development",
      "target": "react_js",
      "type": "USES"
    },
    {
      "source": "customized_lms_development",
      "target": "mongodb",
      "type": "USES"
    },
    {
      "source": "customized_lms_development",
      "target": "firebase",
      "type": "USES"
    },
    {
      "source": "customized_lms_development",
      "target": "learning_outcomes",
      "type": "EVALUATED_WITH"
    },
    {
      "source": "customized_lms_development",
      "target": "user_engagement",
      "type": "EVALUATED_WITH"
    },
    {
      "source": "customized_lms_development",
      "target": "finding_lms_user_friendly",
      "type": "ACHIEVES"
    },
    {
      "source": "customized_lms_development",
      "target": "finding_lms_improves_learning",
      "type": "ACHIEVES"
    },
    {
      "source": "customized_lms_development",
      "target": "finding_lms_increases_interactions",
      "type": "ACHIEVES"
    },
    {
      "source": "social_presence_theory",
      "target": "communication_collaboration",
      "type": "IMPROVES"
    },
    {
      "source": "coi_framework",
      "target": "communication_collaboration",
      "type": "IMPROVES"
    },
    {
      "source": "lms",
      "target": "gap_cost_effective_lms_studies",
      "type": "IDENTIFIES_GAP"
    },
    {
      "source": "lms",
      "target": "gap_oer_strategies",
      "type": "IDENTIFIES_GAP"
    },
    {
      "source": "lms",
      "target": "gap_ai_tools_research",
      "type": "IDENTIFIES_GAP"
    }
  ],
  "metadata": {
    "paper": "development of online learning management system for schools",
    "year": 2023,
    "extracted_at": "2026-02-03T10:23:04.551890",
    "paper_length": 63914
  }
}
