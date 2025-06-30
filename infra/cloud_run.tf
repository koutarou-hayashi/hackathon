# Cloud Run Service and related resources
# Note: Infrastructure resources (APIs, Artifact Registry, etc.) are in infrastructure.tf

# Cloud Run Service
resource "google_cloud_run_v2_service" "skill_map_service" {
  name     = "${var.app_name}-service"
  location = var.region
  project  = var.project_id

  deletion_protection = false

  template {
    service_account = google_service_account.cloud_run_sa.email

    containers {
      # This will be updated when we build and push the image
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.skill_map_repo.repository_id}/${var.app_name}:latest"

      ports {
        container_port = 3000
      }

      env {
        name  = "NEXTAUTH_URL"
        value = "https://skill-map-service-598323735177.asia-northeast1.run.app"
      }

      env {
        name  = "NEXTAUTH_SECRET"
        value = var.nextauth_secret
      }

      env {
        name  = "GOOGLE_CLIENT_ID"
        value = var.google_client_id
      }

      env {
        name  = "GOOGLE_CLIENT_SECRET"
        value = var.google_client_secret
      }

      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.project_id
      }

      env {
        name  = "FIRESTORE_DATABASE_ID"
        value = google_firestore_database.skill_map_db.name
      }

      env {
        name  = "VERTEX_AI_LOCATION"
        value = var.vertex_ai_location
      }

      env {
        name  = "VERTEX_AI_MODEL"
        value = var.vertex_ai_model
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }

  depends_on = [
    google_firestore_database.skill_map_db,
    google_artifact_registry_repository.skill_map_repo
  ]
}

# Random suffix for service URL
resource "random_id" "service_suffix" {
  byte_length = 4
}

# Data source for current client config
data "google_client_config" "current" {}

# Allow unauthenticated access to Cloud Run service
resource "google_cloud_run_service_iam_binding" "public_access" {
  location = google_cloud_run_v2_service.skill_map_service.location
  project  = google_cloud_run_v2_service.skill_map_service.project
  service  = google_cloud_run_v2_service.skill_map_service.name
  role     = "roles/run.invoker"

  members = [
    "allUsers",
  ]
}
