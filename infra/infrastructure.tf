# Infrastructure resources that need to be created first
# (APIs, Artifact Registry, Firestore, Service Accounts, IAM)

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "firestore.googleapis.com",
    "cloudbuild.googleapis.com",
    "containerregistry.googleapis.com",
    "artifactregistry.googleapis.com",
    "iam.googleapis.com",
    "aiplatform.googleapis.com"
  ])

  project = var.project_id
  service = each.value

  disable_on_destroy = false
}

# Cloud Firestore Database
resource "google_firestore_database" "skill_map_db" {
  project     = var.project_id
  name        = "skill-map-db"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"

  depends_on = [google_project_service.required_apis]
}

# Service Account for Cloud Run
resource "google_service_account" "cloud_run_sa" {
  account_id   = "${var.app_name}-cloud-run"
  display_name = "Cloud Run Service Account for ${var.app_name}"
  project      = var.project_id

  depends_on = [google_project_service.required_apis]
}

# IAM binding for Firestore access
resource "google_project_iam_member" "firestore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# IAM binding for Vertex AI access
resource "google_project_iam_member" "vertex_ai_user" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Artifact Registry repository for container images
resource "google_artifact_registry_repository" "skill_map_repo" {
  location      = var.region
  repository_id = "${var.app_name}-repo"
  description   = "Container registry for ${var.app_name}"
  format        = "DOCKER"

  depends_on = [google_project_service.required_apis]
}
