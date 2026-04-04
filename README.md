# LinkLens

LinkLens is a small URL metadata viewer built as a monorepo. The web app accepts a URL, calls a Hono API running on Cloudflare Workers, and shows simple metadata extracted from the remote HTML.

## Stack

- Nuxt 4 + Vue 3 + Vite for the UI
- Hono on Cloudflare Workers for the API
- Zod for request validation
- Terraform for a small Cloudflare infrastructure slice
- Nix Flakes for the local development shell
- Bun workspaces for monorepo management

## Repository structure

```text
linklens/
├─ apps/
│  ├─ api/                  # Hono app on Cloudflare Workers
│  └─ web/                  # Nuxt app
├─ infra/
│  └─ terraform/
│     └─ cloudflare/        # Cloudflare-side Terraform starter
├─ flake.nix
├─ package.json
├─ bun.lock
├─ tsconfig.base.json
└─ README.md
```

## Development shell

Enter the reproducible shell with:

```bash
nix develop
```

The shell includes `nodejs`, `terraform`, `wrangler`, `git`, `curl`, and `jq`. Install Bun separately if it is not already available in your environment.

## Install dependencies

From the repository root:

```bash
bun install
```

## Run locally

Start the API:

```bash
bun run dev:api
```

Start the web app in another terminal:

```bash
bun run dev:web
```

Default local URLs:

- Web: `http://localhost:3000`
- API: `http://127.0.0.1:8787`

## Environment variables

### Web

Copy `apps/web/.env.example` to `apps/web/.env.local` and adjust if needed:

```bash
cp apps/web/.env.example apps/web/.env.local
```

`NUXT_PUBLIC_API_BASE_URL` points the frontend at the Hono API.

### API

For local Wrangler development, copy `apps/api/.dev.vars.example` to `apps/api/.dev.vars`:

```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
```

Variables:

- `CORS_ALLOW_ORIGIN`: allowed browser origin for local frontend requests
- `FETCH_TIMEOUT_MS`: timeout for upstream HTML fetches

## Terraform

Terraform is intentionally small for v1. Wrangler remains the better tool for building and deploying the Worker code itself, while Terraform is used for optional Cloudflare routing if you want to attach the deployed Worker to a zone route.

Example flow:

```bash
cd infra/terraform/cloudflare
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
```

Required inputs are documented in `terraform.tfvars.example`.

## v1 scope

Included:

- single-page UI
- URL submission
- loading and error states
- metadata display for title, description, site name, OG image, canonical URL, favicon, and final URL
- recent URL history in `localStorage`
- simple HTML-only metadata extraction with timeout and content-type checks

Intentionally out of scope:

- authentication
- database or caching
- JavaScript-rendered page support
- headless browsers
- queueing, scheduling, analytics, or admin tooling
- multi-environment deployment complexity
