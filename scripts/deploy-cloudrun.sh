#!/bin/bash
set -e

# Configuration
PROJECT_ID=${1:-"YOUR_GCP_PROJECT_ID"}
REGION="us-central1"
AI_SERVICE_NAME="ai-service"
FRONTEND_NAME="llm-knowledge-graph"

# Ensure gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed. Please install it first."
    exit 1
fi

if [ "$PROJECT_ID" = "YOUR_GCP_PROJECT_ID" ]; then
    echo "⚠️ GCP Project ID not provided. Usage: ./scripts/deploy-cloudrun.sh <gcp-project-id>"
    echo "Reading current configured project..."
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
    if [ -z "$PROJECT_ID" ]; then
        echo "❌ Error: No default GCP project found. Please provide a GCP Project ID."
        exit 1
    fi
fi

echo "🚀 Starting Google Cloud Run deployment for project: $PROJECT_ID..."

# 1. Enable APIs
echo "🔌 Enabling Google Cloud APIs (Cloud Build & Cloud Run)..."
gcloud services enable artifactregistry.googleapis.com run.googleapis.com cloudbuild.googleapis.com --project="$PROJECT_ID"

# 2. Build and Deploy AI Service
echo "📦 Building and deploying AI Service (FastAPI backend)..."
gcloud run deploy "$AI_SERVICE_NAME" \
  --source=./apps/ai-service \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --allow-unauthenticated \
  --set-env-vars="PORT=8080"

# Get AI Service URL
AI_SERVICE_URL=$(gcloud run services describe "$AI_SERVICE_NAME" --region="$REGION" --project="$PROJECT_ID" --format="value(status.url)")
echo "✅ AI Service deployed successfully at: $AI_SERVICE_URL"

# 3. Build and Deploy Frontend
echo "📦 Building and deploying Frontend (Next.js in Monorepo context)..."
gcloud run deploy "$FRONTEND_NAME" \
  --source=. \
  --dockerfile=apps/llm-knowledge-graph/Dockerfile \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --allow-unauthenticated \
  --set-env-vars="AI_SERVICE_URL=$AI_SERVICE_URL,PORT=8080"

FRONTEND_URL=$(gcloud run services describe "$FRONTEND_NAME" --region="$REGION" --project="$PROJECT_ID" --format="value(status.url)")

echo "========================================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "========================================================"
echo "Backend AI Service: $AI_SERVICE_URL"
echo "Frontend Web App:   $FRONTEND_URL"
echo "========================================================"
echo ""
echo "⚠️ IMPORTANT: Remember to set your GEMINI_API_KEY environment variable on the ai-service!"
echo "You can update it by running:"
echo "gcloud run services update $AI_SERVICE_NAME --update-env-vars=\"GEMINI_API_KEY=YOUR_GEMINI_API_KEY\" --region=$REGION --project=$PROJECT_ID"
echo ""
