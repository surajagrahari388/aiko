# AIKO Cricket v2

## Table of Contents

1. [Tech Stack & Prerequisites](#tech-stack--prerequisites)
2. [Local Development](#local-development)
3. [High-Level Architecture](#high-level-architecture)
4. [Folder Map & Responsibilities](#folder-map--responsibilities)
5. [Application Flow](#application-flow)
6. [State & Context Layers](#state--context-layers)
7. [API Routes & Integrations](#api-routes--integrations)
8. [Feature Flags & Environment Variables](#feature-flags--environment-variables)
9. [Deployment & Observability](#deployment--observability)
10. [Contributor Tips](#contributor-tips)

---

## Tech Stack & Prerequisites

| Area           | Tooling                                                              |
| -------------- | -------------------------------------------------------------------- |
| Framework      | Next.js 15 (App Router, React 19, Server/Client components)          |
| Language       | TypeScript (strict)                                                  |
| Styling        | Tailwind CSS v4 + Shadcn UI (Radix + Lucide)                         |
| State          | React Query v5 for server data, custom contexts for client state     |
| Speech & Audio | Microsoft Cognitive Services SDK, custom audio playback context      |
| Analytics      | PostHog, CleverTap, Google Analytics, Microsoft Clarity              |
| Auth           | `next-auth` with Auth0 provider, middleware-enforced routing         |
| Build          | `pnpm`, Turbopack dev server, standalone `next build` for containers |

> **Prerequisites:** Node 20+, pnpm 10+, access to Entity Sports, Betfair, AI Tips, Azure APIM, Auth0, Datadog, and analytics keys.

---

## Local Development

```bash
pnpm install
pnpm run dev        # Next dev with Turbopack
pnpm run build      # Production build (standalone)
pnpm run start      # Runs with dd-trace init
pnpm run lint       # ESLint (Next config)
```

Note: If you're running locally, ensure your env variables match the canonical names expected by the runtime. Example: `AUTH_AUTH0_ID` / `AUTH_AUTH0_SECRET` and `SHOW_MAINTENANCE`. The `.env.example` in the repo has been updated accordingly.

Root routing redirects `/` → `/cricket` via `next.config.ts`. Datadog is injected at runtime when `ENABLE_DATADOG=true`.

---

## High-Level Architecture

- **Layout Root (`src/app/layout.tsx`)** wires providers: Auth session → Tenant (analytics) → PostHog → Analytics identity → Language → React Query → Audio playback → Theme → Sonner toaster.
- **Middleware (`src/middleware.ts`)** enforces maintenance mode, protects non-public routes, and handles Auth0 login redirects.
- **Data flow:** UI impacts React Query hooks (`src/hooks`) which call API route proxies (`src/app/api/**`). Routes forward to Azure APIM endpoints (Entity Sports, Betfair, internal AI tips) and trigger Teams notifications on failure.
- **Real-time tips:** `use-global-tips.ts` (SSE) listens to broadcast endpoints and patches React Query caches.
- **Speech & QnA:** Client components leverage Microsoft Speech SDK via `use-microsoft-speech-sdk.ts` and audio context for TTS playback.
- **Feature toggles:** Exposed through environment variables, passed from pages down the component tree for conditional rendering.

---

## Folder Map & Responsibilities

| Path                               | Summary                                                                                                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app`                          | Next.js routes. Includes `cricket`, `login`, `maintenance`, `service-down`, settings UX, and API routes under `app/api`. Each page composes UI sections + providers.                         |
| `src/app/api/*`                    | Edge/server handlers that proxy to Azure APIM (`/cricket`, `/tips`, `/players`, `/speechsdk`, etc.). Handle authentication, error translation, Teams alerts, and caching headers.            |
| `src/components`                   | All UI building blocks (Shadcn UI lives in `components/ui`). Subfolders for layout, match cards, tips sections, QnA, player insights, etc. Shared props live in `components.props.types.ts`. Note: the codebase includes a PostHog provider in `src/app/posthog-provider.tsx` which is wired into `src/app/layout.tsx`. |
| `src/contexts`                     | React context providers (language, analytics, audio playback, starred questions). These encapsulate client state and event emitters.                                                         |
| `src/hooks`                        | React Query hooks & utilities: tips/tip history, match summary, player data, multi-question chat, SSE tips, language + speech integration.                                                   |
| `src/lib`                          | Pure utilities: language adapters, API clients, schemas (Zod), safe actions, odds transformers, shared types, helper utilities, Teams notification sender.                                   |
| `src/server`                       | Server-side helpers for personalisation (favourite tips, votes, starred questions) executed via Next server actions.                                                                         |
| `public`                           | Static assets, icons, Lottie files. Banner referenced atop this README.                                                                                                                      |
| `dev-tools/betfair-entity-mapping` | Offline scripts to map Entity Sports odds to Betfair markets.                                                                                                                                |
| Root configs                       | `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `tsconfig.json`, `components.json` (Shadcn).                                                                                |

---

## Application Flow

1. **Routing & Layout**

   - `src/app/layout.tsx` seeds providers and loads fonts.
   - `next.config.ts` rewrites `/` to `/cricket`. Root page renders `Navbar`, `MatchesClient`, and `Footer`.
   - Middleware handles maintenance mode and Auth0 session enforcement.

2. **Authentication**

   - `src/auth.ts` configures `next-auth` with Auth0. (Note: `src/auth.ts` reads `AUTH_AUTH0_ID` and `AUTH_AUTH0_SECRET` — please make sure your environment config uses these names; older `.env` variables like `AUTH0_CLIENT_ID` may exist but are not the canonical names used by the runtime.)
   - `SessionProvider` wraps the tree; middleware redirects unauthenticated users to `/api/auth/signin` with `callbackUrl`.

3. **Match & Tips Data**

   - `src/hooks/use-tips.ts`, `use-player-tips.ts`, `use-match-summary.ts`, etc. fetch data through `/api` routes.
   - `src/components/match-card/**` renders match lists & skeletons; `match-details/**` handles tabbed content per match.

4. **Real-time Updates**

   - `src/hooks/use-global-tips.ts` opens an `EventSource` to tips broadcast endpoints with `user_id`, `match_id`, `language`. Incoming SSE payloads update React Query caches for seamless streaming tips.

5. **QnA & Speech**

   - `src/components/QnA` houses STT input, chat history, favourites, and analytics hooks.
   - `use-multi-question-chat.ts` sequences AI replies; `use-microsoft-speech-sdk.ts` orchestrates speech recognition and TTS audio via `AudioPlaybackProvider`.

6. **Language + Feature Toggle Flow**

   - `src/lib/language-adapter.ts` is the sole source for supported languages (production vs development). Language is stored in cookie + localStorage.
   - Feature toggle env vars are read within pages (`process.env.SHOW_VALUE`, etc.) and passed down as props to conditionally render UI segments.

7. **Error Handling & Fallbacks**

   - API wrappers bubble user-friendly `message` fields and raise Teams alerts via `src/lib/teams-notification.ts` when upstream services fail.
   - Dedicated `/maintenance` and `/service-down` pages provide safe fallbacks. Middleware ensures only those remain accessible in maintenance mode.

8. **Analytics & Observability**
   - `AnalyticsProvider` injects tenant info; `PosthogProvider` handles client tracking (with Clarity integration).
   - Datadog RUM is optionally initialised (`src/app/datadog-init.tsx`). Production start command preloads `dd-trace` for backend spans.

---

## State & Context Layers

| Provider / Hook                                             | Role                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `ReactQueryProvider`                                        | Central TanStack Query client; used in pages and components that request data.       |
| `LanguageProvider`                                          | Supplies `useLanguage` hook with current language, persistence, and SSR hydration.   |
| `AudioPlaybackProvider`                                     | Manages HTMLAudioElement refs, queueing, and playback status for TTS/voice features. |
| `TenantProvider` + `AnalyticsIdentityProvider`           | Consolidates tenant + user identity for PostHog, CleverTap, GA, etc. `TenantProvider` exists at `src/contexts/analytics-context.tsx` and `AnalyticsIdentityProvider` at `src/components/analytics/analytics-identity-provider.tsx`.                |
| `use-conversation-history.ts`, `use-multi-question-chat.ts` | Manage chat session state, message streams, and SSE interplay.                       |
| `use-favourite-tips.ts`, `use-player-tips.ts`               | Interact with server actions for personalisation, toggling favourites, and caching.  |

---

## API Routes & Integrations

All API routes live under `src/app/api`. Each proxies to APIM endpoints, standardising headers, auth tokens, and errors.

| Route                         | Purpose                                                             |
| ----------------------------- | ------------------------------------------------------------------- |
| `/api/cricket/*`              | Entity Sports match list, fixtures, odds. Calls `APIM_URL/FANTASY`. |
| `/api/tips/*`                 | Internal AI tips service (tips, favourites, SSE broadcast tokens).  |
| `/api/match-summary`          | Influencer summaries for matches.                                   |
| `/api/players/*`              | Player insights & stats (Entity/Betfair).                           |
| `/api/speechsdk` & `/api/tts` | Microsoft Cognitive Services token exchange + audio generation.     |
| `/api/health`                 | Liveness checks for uptime monitors.                                |
| `/api/auth/*`                 | NextAuth routes (signin, callback).                                 |

All routes follow this pattern:

1. Validate request payload with Zod schema from `src/lib/schemas/*`.
2. Call upstream APIM endpoint with tenant headers.
3. On error, capture `message` from backend, show toast via Sonner, trigger Teams alert, optionally fallback to static data.

---

## Feature Flags & Environment Variables

| Variable                                                                                                               | Effect                                                 |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `APIM_URL`, `TIPS`, `FANTASY`                                                                                          | Compose APIM endpoints for proxy routes.               |
| `AUTH_AUTH0_ID`, `AUTH0_ISSUER`                                                                                        | Auth0 config for `next-auth` provider.                 |
| `POSTHOG_KEY`, `POSTHOG_HOST`, `TENANT_ID`, `CLARITY_PROJECT_ID`                                                       | Analytics configuration.                               |
| `ENABLE_DATADOG`, `DATADOG_APPLICATION_ID`, `DATADOG_CLIENT_TOKEN`, `DATADOG_ENV`                                      | Toggle and configure Datadog RUM.                      |
| `ENABLE_TENANT`                                                                                                        | Toggle tenant-based tips functionality. When `false`, uses legacy `/tips` endpoint and `bet_type` instead of tenant variants. Passed as server-side prop to components. |
| `MATCHES_LIMIT`                                                                                                        | Configure number of matches shown before "See All Matches" link appears. Defaults to `3`. Passed as server-side prop to components. |
| `SHOW_VALUE`, `SHOW_OPINIO`, `SHOW_FEEDBACK`, `SHOW_FAVOURITE_TIPS`, `SHOW_DEBUG`, `SHOW_RELEASES`, `SHOW_MAINTENANCE` | UI feature toggles propagated via props. Please note that some example environment files in the repo contain a typo `SHOW_MAINTENCE` — make sure your env uses `SHOW_MAINTENANCE`.               |
| `SHOW_ALL_LANGUAGES`                                                                                                   | Forces exposure of development languages in selectors. |

Maintenance mode is enforced entirely in middleware: when `SHOW_MAINTENANCE="true"`, anything except `/maintenance`, static assets, and auth APIs is redirected.

---

## Deployment & Observability

- **Build**: `pnpm run build` produces a standalone `.next/standalone` bundle for containerisation.
- **Runtime**: `pnpm run start` executes `node --require dd-trace/init next start` so DataDog traces app lifecycle.
- **Monitoring**: PostHog, GA, CleverTap, and Clarity cover user analytics; Datadog RUM + dd-trace capture performance and backend traces; Teams notifications flag API degradation.
- **Service fallbacks**: `/service-down` page surfaces when upstream TIPS services fail; SSE clients auto retry.

---

## Contributor Tips

1. **Use Shadcn UI components** for any new UI (see `components.json`). Import from `@/components/ui/*`.
2. **Add languages only via `src/lib/language-adapter.ts`**; the rest of the app reads from this single source.
3. **Keep API routes thin** and push transformations into dedicated libs (`src/lib/entity-odds-transformer.ts`, etc.).
4. **Instrument new errors** with `TeamsNotificationService.sendEnhancedServiceDownAlert` and user-facing Sonner toasts.
5. **Guard features with env toggles** so tenants can enable/disable without redeploy.
6. **Document new flows** here whenever you add modules so the onboarding experience stays first-class.
7. **Provider and env notes**: Prefer `src/app/posthog-provider.tsx` for runtime analytics wiring (the app layout imports the PostHog provider from `src/app/posthog-provider.tsx`). Also, if you add or change env variables, update `.env.example` to reflect canonical runtime names (`AUTH_AUTH0_ID`, `AUTH_AUTH0_SECRET`, `SHOW_MAINTENANCE`, etc.).

---
