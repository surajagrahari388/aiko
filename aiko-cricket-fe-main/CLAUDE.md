# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install              # Install dependencies (pnpm 10+, Node 20+)
pnpm run dev              # Dev server with Turbopack
pnpm run build            # Production standalone build
pnpm run start            # Production start with Datadog tracing
pnpm run lint             # ESLint with Next.js + TypeScript rules
pnpm dlx shadcn@latest add [component]  # Add new Shadcn UI component
```

No test runner is configured.

## Architecture

**Next.js 15 App Router** with React 19, TypeScript (strict), Tailwind CSS v4, and Shadcn UI (New York style, RSC enabled).

**Provider stack** (wired in `src/app/layout.tsx`): SessionProvider (auth) → TenantProvider → PostHogProvider (`src/app/posthog-provider.tsx`) → AnalyticsIdentityProvider → LanguageProvider → ReactQueryProvider → AudioPlaybackProvider → ThemeProvider → PreloaderWrapper.

**Data flow**: Components → React Query hooks (`src/hooks/`) → API route proxies (`src/app/api/`) → Azure APIM endpoints. Real-time tips arrive via SSE (`use-global-tips.ts`) and patch the React Query cache.

**Routing**: `/` redirects to `/cricket` (in `next.config.ts`). Middleware enforces Auth0 login for protected routes and maintenance mode when `SHOW_MAINTENANCE=true`.

**Auth**: next-auth with Auth0 provider. Env vars are `AUTH_AUTH0_ID`, `AUTH_AUTH0_SECRET`, `AUTH0_ISSUER` (not the legacy `AUTH0_CLIENT_ID`/`AUTH0_CLIENT_SECRET`).

## Key Conventions

- **Always use Shadcn UI** (`@/components/ui/*`) over custom implementations. Icons from `lucide-react`.
- **Path alias**: `@/*` maps to `./src/*`.
- **Feature toggles**: `SHOW_VALUE`, `SHOW_OPINIO`, `SHOW_FEEDBACK`, `SHOW_FAVOURITE_TIPS`, `SHOW_DEBUG`, `SHOW_RELEASES`, `SHOW_MAINTENANCE`, `SHOW_MAINTENANCE_BANNER` (with `MAINTENANCE_BANNER_MESSAGE`). Pages read `process.env.SHOW_*` and pass booleans as props down the component tree.
- **Language config**: `src/lib/language-adapter.ts` manages available languages (selection, labels, audio support) — not translations. UI strings are hardcoded in components.
- **Shared props interfaces**: Defined in `src/components/components.props.types.ts` for reuse across QnA and Tips components.
- **API route pattern**: Validate with Zod schema (`src/lib/schemas/`), proxy to APIM, extract `message` from backend errors for user-facing Sonner toasts, alert via `TeamsNotificationService` on failure. Note: `response.ok` is true for all 2xx — check specific status codes (e.g. 202) explicitly when needed.
- **GitHub labels**: Use `enhancement` (not `feature`) for new features; also available: `bug`, `refactor`, `documentation`, `dependencies`, `javascript`.
- **Odds transformation**: `src/lib/entity-odds-transformer.ts` converts Entity API responses to categorized betting format.
- **Multi-tenant**: Optional via `ENABLE_TENANT` env var for the main app. When enabled, includes `tenant_id` in tip requests and SSE URLs. **Embed routes always require `tenant_id`** as a mandatory query parameter — they don't rely on `ENABLE_TENANT` or `TENANT_ID_MAPPING` env vars.

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/types.ts` | Core type definitions and Zod schemas |
| `src/lib/language-adapter.ts` | Centralized language configuration (singleton) |
| `src/hooks/use-global-tips.ts` | SSE real-time tips with auto-reconnect (exponential backoff, max 5 attempts) |
| `src/lib/entity-odds-transformer.ts` | Entity Sports → categorized odds transformation |
| `src/lib/teams-notification.ts` | Teams webhook error alerting |
| `src/components/components.props.types.ts` | Shared component prop interfaces |
| `src/auth.ts` | next-auth Auth0 configuration |
| `src/middleware.ts` | Auth enforcement + maintenance mode routing |
| `components.json` | Shadcn UI config (New York style, RSC enabled) |

## Deployment

Deployments are automated via GitHub Actions workflows in `.github/workflows/`. All environments deploy Docker images to Azure Web Apps.

| Environment | Trigger | Tag format | Workflow file |
|---|---|---|---|
| **Dev** | Push to `main` | Automatic (commit SHA) | `dev-webapp-deploy.yml` |
| **Test** | Git tag | `t*.*.*` (e.g., `t2.2.16`) | `test-webapp-deploy.yml` |
| **Prod** | Git tag | `v*.*.*` (e.g., `v2.2.10`) | `prod-webapp-deploy.yml` |

**Creating a release:**
1. Create a GitHub release with the appropriate tag (`t*.*.*` for test, `v*.*.*` for prod)
2. The workflow triggers automatically: test → build Docker image → deploy to Azure Web App
3. Always include PR/issue references in release notes

**Pipeline steps** (all environments): Test (build + lint) → Build (Docker image push to registry) → Deploy (Azure Web App)

## Environment Variables

See `.env.example` for the full list. Note: some example files contain legacy/misspelled names — the canonical runtime names are `AUTH_AUTH0_ID`, `AUTH_AUTH0_SECRET`, and `SHOW_MAINTENANCE` (not `SHOW_MAINTENCE`).

Key groups: `APIM_URL`/`TIPS`/`FANTASY` (backend endpoints), `ENABLE_TENANT` (multi-tenant toggle), `ENABLE_DATADOG` (Datadog RUM), `MATCHES_LIMIT` (defaults to 3), `SHOW_ALL_LANGUAGES` (exposes dev languages).
