output "route_pattern" {
  description = "Route pattern that will be attached to the Worker when enabled."
  value       = local.route_pattern
}

output "zone_id" {
  description = "Resolved Cloudflare zone ID."
  value       = local.zone_id
}
