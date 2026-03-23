data "cloudflare_zones" "selected" {
  filter {
    name = var.zone_name
  }
}

locals {
  zone_id       = data.cloudflare_zones.selected.zones[0].id
  route_pattern = "${var.api_subdomain}.${var.zone_name}/*"
}

resource "cloudflare_worker_route" "api" {
  count = var.enable_route ? 1 : 0

  zone_id     = local.zone_id
  pattern     = local.route_pattern
  script_name = var.worker_name
}
