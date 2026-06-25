from unittest.mock import AsyncMock, patch
import pytest
from fastapi.testclient import TestClient
from apps.ai_service.main import app

client = TestClient(app)

@patch("apps.ai_service.main.extractor")
def test_extract_graph_gemini_error(mock_extractor):
    # Mock extract_from_paper to raise an exception
    mock_extractor.extract_from_paper = AsyncMock(side_effect=Exception("Gemini model is currently unavailable"))
    
    response = client.post(
        "/api/extract-graph",
        json={"text": "This is a test paper.", "metadata": {"paper_id": "test_1"}}
    )
    
    # Assertions
    assert response.status_code == 500
    data = response.json()
    assert data["success"] is False
    assert "error" in data


@patch("apps.ai_service.main.extractor")
def test_extract_graphs_gemini_error(mock_extractor):
    # Mock extract_from_multiple_papers to raise an exception
    mock_extractor.extract_from_multiple_papers = AsyncMock(side_effect=Exception("Gemini model is currently unavailable"))
    
    response = client.post(
        "/api/extract-graphs",
        json={"papers": [{"id": "test_1", "text": "This is a test paper."}]}
    )
    
    # Assertions
    assert response.status_code == 500
    data = response.json()
    assert data["success"] is False
    assert "error" in data
