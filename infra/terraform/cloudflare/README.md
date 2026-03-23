# Cloudflare Terraform Starter

This directory keeps Terraform intentionally small for v1.

- Wrangler is responsible for building and deploying the Worker code.
- Terraform is used for optional Cloudflare routing once the Worker already exists.

If you want `api.your-zone.example/*` to point at the deployed Worker, fill in `terraform.tfvars`, run `terraform init`, and apply the route resource.
