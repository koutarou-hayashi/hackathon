# Cloud Run Service URL
output "cloud_run_url" {
  description = "URL of the deployed Cloud Run service"
  value       = try(google_cloud_run_v2_service.skill_map_service.uri, "Cloud Run not deployed yet")
}

# Firestore Database ID
output "firestore_database_id" {
  description = "Firestore database ID"
  value       = google_firestore_database.skill_map_db.name
}

# Project ID
output "project_id" {
  description = "Google Cloud Project ID"
  value       = var.project_id
}

# Service Account Email
output "service_account_email" {
  description = "Service account email for Cloud Run"
  value       = google_service_account.cloud_run_sa.email
}

# Artifact Registry Repository
output "artifact_registry_repo" {
  description = "Artifact Registry repository URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.skill_map_repo.repository_id}"
}
