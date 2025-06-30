#!/bin/bash

# Skill Map App - Cloud Build & Deploy Script
# Usage: ./deploy.sh [--infra-only] [--build-only] [--deploy-only]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values (can be overridden)
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-""}
REGION=${REGION:-"asia-northeast1"}
APP_NAME=${APP_NAME:-"skill-map"}

# Parse command line arguments
BUILD_ONLY=false
DEPLOY_ONLY=false
INFRA_ONLY=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --build-only)
      BUILD_ONLY=true
      shift
      ;;
    --deploy-only)
      DEPLOY_ONLY=true
      shift
      ;;
    --infra-only)
      INFRA_ONLY=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--build-only] [--deploy-only] [--infra-only]"
      exit 1
      ;;
  esac
done

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if gcloud is installed and authenticated
check_gcloud() {
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi
    
    if [ -z "$PROJECT_ID" ]; then
        PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
        if [ -z "$PROJECT_ID" ]; then
            print_error "Google Cloud project not set. Please run: gcloud config set project YOUR_PROJECT_ID"
            exit 1
        fi
    fi
    
    # Get additional project information for confirmation
    print_status "=== Deployment Configuration ==="
    print_status "📋 Target Google Cloud Project: $PROJECT_ID"
    print_status "🌏 Region: $REGION"
    print_status "📱 App Name: $APP_NAME"
    
    # Get project name/description if available
    PROJECT_NAME=$(gcloud projects describe "$PROJECT_ID" --format="value(name)" 2>/dev/null || echo "Unable to fetch project name")
    if [ "$PROJECT_NAME" != "Unable to fetch project name" ]; then
        print_status "📝 Project Name: $PROJECT_NAME"
    fi
    
    echo
    print_warning "⚠️  Please confirm this is the correct project and configuration."
    print_warning "💰 This will create billable resources in Google Cloud."
    
    # Interactive confirmation
    while true; do
        echo -e "${YELLOW}Continue with project '$PROJECT_ID'? (Y/N):${NC} \c"
        read -r answer
        case $answer in
            [Yy]* ) 
                print_status "✅ Confirmed. Proceeding with deployment..."
                echo
                break
                ;;
            [Nn]* ) 
                print_error "❌ Deployment cancelled by user."
                print_status "To change project, run: gcloud config set project YOUR_PROJECT_ID"
                exit 1
                ;;
            * ) 
                echo "Please answer Y (yes) or N (no)."
                ;;
        esac
    done
}

# Build image using Cloud Build
build_image() {
    print_status "Building Docker image using Cloud Build..."
    print_status "This will take about 2-3 minutes (much faster than local ARM→AMD64 build)"
    
    gcloud builds submit \
        --config cloudbuild.yaml \
        --substitutions _REGION="$REGION",_REPOSITORY="${APP_NAME}-repo",_APP_NAME="$APP_NAME" \
        --project "$PROJECT_ID"
    
    if [ $? -eq 0 ]; then
        print_status "✅ Docker image built and pushed successfully!"
    else
        print_error "❌ Build failed"
        exit 1
    fi
}

# Deploy infrastructure using Terraform (with options)
deploy_infrastructure() {
    local target_resources=""
    
    if [ "$INFRA_ONLY" = true ]; then
        print_status "Deploying infrastructure only (excluding Cloud Run)..."
        target_resources="-target=google_project_service.required_apis -target=google_firestore_database.skill_map_db -target=google_service_account.cloud_run_sa -target=google_project_iam_member.firestore_user -target=google_project_iam_member.vertex_ai_user -target=google_artifact_registry_repository.skill_map_repo"
    else
        print_status "Deploying all infrastructure including Cloud Run..."
    fi
    
    cd infra/
    
    # Check if terraform.tfvars exists
    if [ ! -f terraform.tfvars ]; then
        print_warning "terraform.tfvars not found. Please create it based on terraform.tfvars.example"
        print_warning "Required variables: project_id, nextauth_secret, google_client_id, google_client_secret"
        exit 1
    fi
    
    # Initialize Terraform if needed
    if [ ! -d .terraform ]; then
        print_status "Initializing Terraform..."
        terraform init
    fi
    
    # Run terraform plan and capture output
    print_status "🔍 Running Terraform plan to preview changes..."
    echo "=================================="
    
    if [ -n "$target_resources" ]; then
        print_status "Planning Terraform deployment (infrastructure only)..."
        if ! terraform plan $target_resources; then
            print_error "❌ Terraform plan failed"
            cd ..
            exit 1
        fi
    else
        print_status "Planning Terraform deployment (all resources)..."
        if ! terraform plan; then
            print_error "❌ Terraform plan failed"
            cd ..
            exit 1
        fi
    fi
    
    echo "=================================="
    print_warning "📋 Please review the Terraform plan above."
    print_warning "🔧 This shows what resources will be created, modified, or destroyed."
    
    # Interactive confirmation for terraform apply
    while true; do
        echo -e "${YELLOW}Apply these Terraform changes? (Y/N):${NC} \c"
        read -r answer
        case $answer in
            [Yy]* ) 
                print_status "✅ Confirmed. Applying Terraform configuration..."
                echo
                break
                ;;
            [Nn]* ) 
                print_error "❌ Terraform apply cancelled by user."
                print_status "You can run the script again when ready to apply changes."
                cd ..
                exit 1
                ;;
            * ) 
                echo "Please answer Y (yes) or N (no)."
                ;;
        esac
    done
    
    # Apply terraform configuration
    if [ -n "$target_resources" ]; then
        print_status "Applying Terraform configuration (infrastructure only)..."
        terraform apply -auto-approve $target_resources
    else
        print_status "Applying Terraform configuration (all resources)..."
        terraform apply -auto-approve
    fi
    
    if [ $? -eq 0 ]; then
        print_status "✅ Infrastructure deployed successfully!"
        if [ "$INFRA_ONLY" = false ]; then
            print_status "Getting Cloud Run URL..."
            terraform output cloud_run_url 2>/dev/null || print_status "Cloud Run not yet deployed"
        else
            print_status "Artifact Registry repository created. You can now build and push images."
            terraform output artifact_registry_repo 2>/dev/null
        fi
    else
        print_error "❌ Terraform deployment failed"
        exit 1
    fi
    
    cd ..
}

# Main execution
main() {
    print_status "🚀 Starting Skill Map App deployment..."
    
    check_gcloud
    
    if [ "$INFRA_ONLY" = true ]; then
        deploy_infrastructure
        print_status "🎉 Infrastructure setup completed!"
        print_status "Next steps:"
        print_status "1. Run: ./deploy.sh --build-only"
        print_status "2. Run: ./deploy.sh --deploy-only"
        return
    fi
    
    if [ "$DEPLOY_ONLY" = false ]; then
        build_image
    fi
    
    if [ "$BUILD_ONLY" = false ]; then
        deploy_infrastructure
    fi
    
    print_status "🎉 Deployment completed!"
    
    if [ "$BUILD_ONLY" = false ] && [ "$DEPLOY_ONLY" = false ]; then
        print_status "Your app should be available at the URL shown above."
        print_status "Note: It may take a few minutes for the service to be fully available."
    fi
}

# Run main function
main
