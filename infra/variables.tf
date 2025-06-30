# Project Configuration
variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "Google Cloud Region"
  type        = string
  default     = "asia-northeast1" # Tokyo region
}

variable "zone" {
  description = "Google Cloud Zone"
  type        = string
  default     = "asia-northeast1-a"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "skill-map"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

# NextAuth Configuration
variable "nextauth_secret" {
  description = "NextAuth secret key"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
}

# Vertex AI Configuration
variable "vertex_ai_location" {
  description = "Vertex AI location"
  type        = string
  default     = "asia-northeast1"
}

variable "vertex_ai_model" {
  description = "Vertex AI model name"
  type        = string
  default     = "gemini-1.5-flash"
}
