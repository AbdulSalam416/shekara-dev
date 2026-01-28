export const defaultGraphData ={
  "nodes": [
    {
      "id": "climate_crisis",
      "type": "Concept",
      "label": "Climate Crisis"
    },
    {
      "id": "open_source_software",
      "type": "Concept",
      "label": "Open Source Software"
    },
    {
      "id": "opensustain_tech",
      "type": "Dataset",
      "label": "OpenSustain.tech Catalogue"
    },
    {
      "id": "open_source_ecosystem",
      "type": "Concept",
      "label": "Open Source Ecosystem"
    },
    {
      "id": "science_score",
      "type": "Concept",
      "label": "Science Score"
    },
    {
      "id": "human_curation",
      "type": "Method",
      "label": "Human Curation"
    },
    {
      "id": "transitive_dependency_analysis",
      "type": "Method",
      "label": "Transitive Dependency Analysis"
    },
    {
      "id": "llm_enabled_search",
      "type": "Method",
      "label": "LLM Enabled Search"
    },
    {
      "id": "ecosyste_ms",
      "type": "Technology",
      "label": "ecosyste.ms Platform"
    },
    {
      "id": "github",
      "type": "Technology",
      "label": "GitHub"
    },
    {
      "id": "python",
      "type": "Technology",
      "label": "Python"
    },
    {
      "id": "openalex",
      "type": "Technology",
      "label": "OpenAlex"
    },
    {
      "id": "open_source_ecosystem_is_growing",
      "type": "Finding",
      "label": "Open Source Ecosystem is Growing"
    },
    {
      "id": "discovery_saturation_point",
      "type": "Finding",
      "label": "Discovery of New Projects Reached Saturation"
    },
    {
      "id": "fragmented_proprietary_approaches_persist",
      "type": "ResearchGap",
      "label": "Fragmented Proprietary Approaches Persist in Climate Tech"
    },
    {
      "id": "lack_scientific_literature_open_sustainability",
      "type": "ResearchGap",
      "label": "Lack of Scientific Literature on Open Sustainability Landscape"
    },
    {
      "id": "need_systematic_analysis_scientific_papers",
      "type": "ResearchGap",
      "label": "Need for Systematic Analysis of Scientific Papers for Repositories"
    },
    {
      "id": "limited_time_energy_contributors",
      "type": "ResearchGap",
      "label": "Limited Time and Energy for Unpaid Community Contributors"
    },
    {
      "id": "lack_open_projects_nuclear_power",
      "type": "ResearchGap",
      "label": "Lack of Open Projects in Nuclear Power Due to Security Incentives"
    },
    {
      "id": "difficulty_finding_new_projects",
      "type": "ResearchGap",
      "label": "Difficulty Finding New Open Source Projects"
    }
  ],
  "relationships": [
    {
      "source": "opensustain_tech",
      "target": "human_curation",
      "type": "USES"
    },
    {
      "source": "opensustain_tech",
      "target": "transitive_dependency_analysis",
      "type": "USES"
    },
    {
      "source": "opensustain_tech",
      "target": "github",
      "type": "USES"
    },
    {
      "source": "transitive_dependency_analysis",
      "target": "ecosyste_ms",
      "type": "USES"
    },
    {
      "source": "open_source_software",
      "target": "climate_crisis",
      "type": "IMPROVES"
    },
    {
      "source": "open_source_ecosystem",
      "target": "fragmented_proprietary_approaches_persist",
      "type": "IDENTIFIES_GAP"
    },
    {
      "source": "open_source_ecosystem",
      "target": "lack_scientific_literature_open_sustainability",
      "type": "IDENTIFIES_GAP"
    },
    {
      "source": "opensustain_tech",
      "target": "open_source_ecosystem_is_growing",
      "type": "ACHIEVES"
    },
    {
      "source": "opensustain_tech",
      "target": "limited_time_energy_contributors",
      "type": "IDENTIFIES_GAP"
    },
    {
      "source": "opensustain_tech",
      "target": "lack_open_projects_nuclear_power",
      "type": "IDENTIFIES_GAP"
    },
    {
      "source": "discovery_saturation_point",
      "target": "difficulty_finding_new_projects",
      "type": "IDENTIFIES_GAP"
    },
    {
      "source": "need_systematic_analysis_scientific_papers",
      "target": "openalex",
      "type": "USES"
    },
    {
      "source": "need_systematic_analysis_scientific_papers",
      "target": "lack_scientific_literature_open_sustainability",
      "type": "BASED_ON"
    },
    {
      "source": "opensustain_tech",
      "target": "science_score",
      "type": "EVALUATED_WITH"
    },
    {
      "source": "open_source_software",
      "target": "python",
      "type": "USES"
    },
    {
      "source": "open_source_software",
      "target": "open_source_ecosystem_is_growing",
      "type": "ACHIEVES"
    },
    {
      "source": "difficulty_finding_new_projects",
      "target": "llm_enabled_search",
      "type": "USES"
    },
    {
      "source": "opensustain_tech",
      "target": "github",
      "type": "EVALUATED_WITH"
    }
  ],
  "metadata": {
    "paper": "Mapping the Open Source Ecosystem for Climate Science and Sustainable Technology",
    "year": 2026,
    "extracted_at": "2026-01-28T09:53:48.044849",
    "paper_length": 92392
  }
}
