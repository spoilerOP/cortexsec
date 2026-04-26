# Deployment script for CortexSec on Google Cloud Run

$PROJECT_ID = "cortexsec"
$REGION = "us-central1"
$SERVICE_NAME = "cortexsec-app"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"
$API_KEY = "AIzaSyAjHaoxIkHZTKB54bDr6ziRvFor_4_9UR0"

Write-Host "Starting deployment for project: $PROJECT_ID" -ForegroundColor Cyan

# 1. Enable Services
Write-Host "Enabling necessary APIs..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com containerregistry.googleapis.com cloudbuild.googleapis.com --quiet

# 2. Build and Push Image
Write-Host "Building and pushing Docker image..." -ForegroundColor Yellow
gcloud builds submit --tag $IMAGE_NAME . --quiet

# 3. Deploy to Cloud Run
Write-Host "Deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $SERVICE_NAME `
    --image $IMAGE_NAME `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --set-env-vars "GEMINI_API_KEY=$API_KEY" `
    --quiet

Write-Host "Deployment complete!" -ForegroundColor Green
