variable "cloudflare_api_token" {
  description = "Cloudflare API token with permissions to read the zone and manage Worker routes."
  type        = string
  sensitive   = true
}

variable "zone_name" {
  description = "Existing Cloudflare zone name, for example example.com."
  type        = string
}

variable "worker_name" {
  description = "Name of the Worker deployed by Wrangler."
  type        = string
  default     = "linklens-api"
}

variable "api_subdomain" {
  description = "Subdomain to route to the Worker."
  type        = string
  default     = "api"
}

variable "enable_route" {
  description = "Set to true to create a Worker route inside the configured zone."
  type        = bool
  default     = false
}
