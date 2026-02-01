export const defaultGraphData ={
  "nodes": [
    {
      "id": "acculturation_theory",
      "type": "Concept",
      "label": "Acculturation Theory"
    },
    {
      "id": "islamic_influence",
      "type": "Concept",
      "label": "Islamic Influence"
    },
    {
      "id": "dagomba_culture",
      "type": "Concept",
      "label": "Dagomba Culture"
    },
    {
      "id": "traditional_dagomba_religion",
      "type": "Concept",
      "label": "Traditional Dagomba Religion"
    },
    {
      "id": "dagomba_rites_of_passage",
      "type": "Concept",
      "label": "Dagomba Rites of Passage"
    },
    {
      "id": "afa_muslim_cleric",
      "type": "Concept",
      "label": "Afa (Muslim Cleric)"
    },
    {
      "id": "participant_observation",
      "type": "Method",
      "label": "Participant Observation"
    },
    {
      "id": "interviews_with_elders",
      "type": "Method",
      "label": "Interviews with Dagomba Elders"
    },
    {
      "id": "na_zangina_conversion",
      "type": "Finding",
      "label": "Conversion of King Na Zangina to Islam"
    },
    {
      "id": "islam_dominates_culture",
      "type": "Finding",
      "label": "Islam Dominates Indigenous Dagomba Culture"
    },
    {
      "id": "afa_central_to_rites",
      "type": "Finding",
      "label": "Afa is Central to All Rites of Passage"
    },
    {
      "id": "damba_festival",
      "type": "Concept",
      "label": "Damba Festival"
    },
    {
      "id": "bugum_fire_festival",
      "type": "Concept",
      "label": "Bugum (Fire Festival)"
    },
    {
      "id": "islamo_dagomba_culture_gap",
      "type": "ResearchGap",
      "label": "Distinction between Synthesis and New Culture (Islamo-Dagomba Culture)"
    },
    {
      "id": "security_role_of_afa",
      "type": "Finding",
      "label": "Afa Provides Security and Divinatory Control for Dagbon State"
    },
    {
      "id": "dagomba_population_traditional_believers",
      "type": "Finding",
      "label": "Less than 10% of Dagomba Population are Traditional Believers"
    },
    {
      "id": "dyula_wangara_muslims",
      "type": "Concept",
      "label": "Dyula (Wangara) Settler Muslims"
    },
    {
      "id": "quran",
      "type": "Dataset",
      "label": "Qur'an"
    },
    {
      "id": "sabli_largibu_divination",
      "type": "Concept",
      "label": "Sabli Largibu (Divination Technique)"
    },
    {
      "id": "tindana_earth_spirit_priest",
      "type": "Concept",
      "label": "Tindana (Earth-Spirit Priest)"
    }
  ],
  "relationships": [
    {
      "source": "dagomba_culture",
      "target": "acculturation_theory",
      "type": "EVALUATED_WITH"
    },
    {
      "source": "participant_observation",
      "target": "dagomba_culture",
      "type": "EVALUATED_WITH"
    },
    {
      "source": "interviews_with_elders",
      "target": "dagomba_culture",
      "type": "EVALUATED_WITH"
    },
    {
      "source": "na_zangina_conversion",
      "target": "islamic_influence",
      "type": "ACHIEVES"
    },
    {
      "source": "islamic_influence",
      "target": "islam_dominates_culture",
      "type": "ACHIEVES"
    },
    {
      "source": "islam_dominates_culture",
      "target": "islamo_dagomba_culture_gap",
      "type": "IDENTIFIES_GAP"
    },
    {
      "source": "afa_muslim_cleric",
      "target": "afa_central_to_rites",
      "type": "ACHIEVES"
    },
    {
      "source": "afa_muslim_cleric",
      "target": "security_role_of_afa",
      "type": "ACHIEVES"
    },
    {
      "source": "afa_muslim_cleric",
      "target": "quran",
      "type": "USES"
    },
    {
      "source": "dagomba_rites_of_passage",
      "target": "islamic_influence",
      "type": "BASED_ON"
    },
    {
      "source": "damba_festival",
      "target": "islamic_influence",
      "type": "BASED_ON"
    },
    {
      "source": "bugum_fire_festival",
      "target": "islamic_influence",
      "type": "BASED_ON"
    },
    {
      "source": "traditional_dagomba_religion",
      "target": "dagomba_population_traditional_believers",
      "type": "ACHIEVES"
    },
    {
      "source": "islamic_influence",
      "target": "dyula_wangara_muslims",
      "type": "BASED_ON"
    },
    {
      "source": "afa_muslim_cleric",
      "target": "sabli_largibu_divination",
      "type": "USES"
    },
    {
      "source": "afa_muslim_cleric",
      "target": "tindana_earth_spirit_priest",
      "type": "OUTPERFORMS"
    }
  ],
  "metadata": {
    "paper": "",
    "year": 2023,
    "extracted_at": "2026-02-01T16:37:44.310388",
    "paper_length": 44473
  }
}
