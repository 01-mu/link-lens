# LinkLens

LinkLens is a small URL metadata viewer built as a monorepo. The web app accepts a URL, calls a Hono API running on Cloudflare Workers, and shows simple metadata extracted from the remote HTML.

## Stack

- Nuxt 4 + Vue 3 + Vite for the UI
- Hono on Cloudflare Workers for the API
- Valibot for request validation
- Vitest for tests
- Terraform in a private submodule for optional Cloudflare routing
- Nix Flakes for the local development shell
- Bun workspaces for monorepo management

## Repository structure

```text
linklens/
├─ apps/
│  ├─ api/                  # Hono app on Cloudflare Workers
│  │  ├─ src/
│  │  │  ├─ features/
│  │  │  ├─ lib/
│  │  │  ├─ middleware/
│  │  │  ├─ routes/
│  │  │  └─ index.ts
│  │  └─ tests/
│  │     ├─ e2e/
│  │     └─ unit/
│  └─ web/                  # Nuxt app
├─ infra/
│  └─ terraform/            # Private git submodule for Terraform
├─ flake.nix
├─ package.json
├─ bun.lock
├─ tsconfig.base.json
└─ README.md
```

## Development shell

Use `direnv` to load the flake automatically:

```bash
direnv allow
```

Or enter the reproducible shell manually with:

```bash
nix develop
```

The shell includes `bun`, `terraform`, `wrangler`, `git`, `curl`, and `jq`.

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

## Test

Run the test suite from the repository root:

```bash
bun run test
```

Run workspace typechecks:

```bash
bun run typecheck
```

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

Terraform lives in the private `infra/terraform` git submodule.

Clone submodules after cloning this repository:

```bash
git submodule update --init --recursive
```

The Cloudflare Terraform files live under:

```bash
infra/terraform/cloudflare
```

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
