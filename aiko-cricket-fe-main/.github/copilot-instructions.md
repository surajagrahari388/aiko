# AIKO Cricket Betting Assistant - Copilot Instructions

## Project Overview
This is a Next.js 15 TypeScript application for cricket betting assistance, featuring AI-powered tips, real-time odds, QnA with speech recognition, and multi-language support. It integrates Entity Sports API for match data, Betfair for betting markets, and internal AI services for tips generation.

## Architecture
- **Frontend**: Next.js app router with React 19, TypeScript, Tailwind CSS v4
- **UI Library**: Shadcn UI (New York style) with Radix UI primitives and Lucide icons
- **State Management**: React Query for server state, custom contexts for client state (language, audio, analytics)
- **Data Flow**: API routes proxy requests to Azure APIM endpoints (`${APIM_URL}/${FANTASY|Tips}`), real-time updates via SSE
- **Authentication**: Auth0 with session-based routing. Note: the app's codebase uses `AUTH_AUTH0_ID` and `AUTH_AUTH0_SECRET` (see `src/auth.ts`); older example files may include `AUTH0_CLIENT_ID`/`AUTH0_CLIENT_SECRET`.
- **Analytics**: Posthog, CleverTap, Google Analytics with tenant-based segmentation
- **Speech**: Microsoft Cognitive Services SDK for STT/TTS in QnA

## Key Workflows
- **Development**: `pnpm run dev --turbopack` (uses Turbopack for fast HMR)
- **Build**: `pnpm run build` (outputs standalone for containerization)
- **Production Start**: `node --require dd-trace/init node_modules/next/dist/bin/next start` (DataDog tracing enabled)
- **Root Redirect**: `/` → `/cricket` (configured in `next.config.ts`)
  - **Providers in app/layout**: Layout wires providers from `src/app/layout.tsx`. The app-level PostHog provider lives in `src/app/posthog-provider.tsx`, and Datadog is initialised by `src/app/datadog-init.tsx`.
- **API Proxy Pattern**: All `/api/*` routes forward to backend services with error handling and Teams notifications
- **Add Shadcn Components**: `pnpm dlx shadcn@latest add [component-name]` (e.g., `pnpm dlx shadcn@latest add toast`)

## Shadcn UI Guidelines
**ALWAYS use Shadcn UI components instead of custom implementations:**
- **Available Components**: Button, Card, Dialog, DropdownMenu, Form, Input, Label, Select, Separator, Skeleton, Switch, Table, Tabs, Textarea, Alert, Avatar, Badge, Sonner (toast)
- **Import Pattern**: `import { Button } from "@/components/ui/button"`
- **Styling**: Use `className` with Tailwind classes, leverage `cn()` utility for conditional classes
- **Icons**: Use Lucide React icons (`import { Star } from "lucide-react"`)
- **New Components**: Run `pnpm dlx shadcn@latest add [component]` to add missing Shadcn components
- **Customization**: Modify component variants in `src/components/ui/[component].tsx` files

## Environment-Controlled Features
Feature flags control component visibility via environment variables:
- `SHOW_VALUE="true"` - Shows betting odds/value tabs
- `SHOW_OPINIO="true"` - Shows opinion polling features
- `SHOW_FEEDBACK="true"` - Shows QnA feedback buttons
- `SHOW_FAVOURITE_TIPS="true"` - Shows star/favorite functionality for tips and QnA
- `SHOW_DEBUG="true"` - Debug language options
- `SHOW_RELEASES="true"` - Release notes access

> NOTE: Some example environment files in the repo contain legacy or misspelled variable names (e.g. `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, and `SHOW_MAINTENCE`). The canonical variables the code expects are `AUTH_AUTH0_ID`, `AUTH_AUTH0_SECRET`, and `SHOW_MAINTENANCE`.

**Pattern**: Page components receive env vars as props → pass through component hierarchy → conditional JSX rendering.

## Conventions
- **Component Structure**: Heavy context usage (`useLanguage`, `useAudioPlayback`, `TenantContext`)
 - **Component Structure**: Heavy context usage (`useLanguage`, `useAudioPlayback`, `TenantContext` and `TenantProvider` in `src/contexts/analytics-context.tsx`).
- **Data Fetching**: React Query hooks in `/hooks/` with SSE for real-time tips (`use-global-tips.ts`)
- **Error Handling**: Teams notifications via `TeamsNotificationService` for API failures, extract `message` field from backend errors for user-facing toasts
- **Language Management**: Centralized in `language-adapter.ts` - modify only this file for language changes
- **Props Interfaces**: Defined in `components.props.types.ts` for reusability across QnA and Tips components
- **Odds Transformation**: `entity-odds-transformer.ts` converts Entity API to categorized betting format
- **Feature Toggles**: Environment variables passed down component hierarchy, conditional rendering with `{SHOW_FEATURE && <Component />}`
- **UI Components**: Always prefer Shadcn UI components over custom implementations

## Error Handling Patterns
- **API Routes**: Extract `message` field from backend responses for user-friendly error messages
- **Teams Alerts**: Use `TeamsNotificationService.sendEnhancedServiceDownAlert()` for backend failures
- **Toast Notifications**: `toast.error(message)` with specific backend error messages
- **Graceful Degradation**: Service-down page fallback, conditional feature rendering

## Integration Points
- **Entity Sports**: Match data and odds via APIM
- **Betfair**: Market catalogs and books (types in `betfair-types.ts`)
- **AI Tips**: POST to `/api/tips` → `${APIM_URL}/${TIPS}/tips`
- **TTS Audio**: POST to `/api/tts` → `${APIM_URL}/${TIPS}/tips/audio`
- **Match Summary**: POST to `/api/match-summary` → `${APIM_URL}/${TIPS}/influencer`
- **Speech SDK**: Configured in `use-microsoft-speech-sdk.ts` for QnA interactions
- **Favourite Tips**: `PersonalizedTipAction`, `GetFavouriteTipsAction` in `server/personalised-tip.ts`

## SSE Real-time Updates
Pattern in `use-global-tips.ts`:
```typescript
// Connect to tips broadcast endpoint
const eventSource = new EventSource(`${tips_broadcast}?user_id=${user_id}&match_id=${match_id}&language=${language}`);
eventSource.onmessage = (event) => {
  const sseData: SSEResponse = JSON.parse(event.data);
  // Update React Query cache with new tips
};
```

## Language Architecture
**Centralized in `language-adapter.ts`**:
- All language configs in `SUPPORTED_LANGUAGES` array
- Helper functions: `getLanguagesByCategory()`, `getLanguageDisplay()`, `isValidLanguage()`
- Categories: "production" | "debug" for environment-based filtering
- **To add language**: Only modify `language-adapter.ts`, everything else auto-updates

## Analytics Integration
**Multi-platform tracking**:
- PostHog: `posthog.capture(event, payload)` with tenant context from `TenantContext`
Note: the runtime PostHog provider used by the layout is `src/app/posthog-provider.tsx`. There is a similar helper under `src/components/PosthogProvider.tsx` which includes Clarity initialization; prefer the `src/app` provider for layout wiring.
- CleverTap: Tenant-based segmentation for user events
- DataDog: APM tracing with `dd-trace/init` in production start command

## Examples
- **Adding New Tip Category**: Extend `CategorizedOdds` in `types.ts`, update transformer in `entity-odds-transformer.ts`
- **New Feature Toggle**: Add env var in page component → pass through props → conditional rendering
- **Error with Teams Alert**: Use `TeamsNotificationService.sendEnhancedServiceDownAlert()` in catch blocks
- **Real-time Feature**: Use SSE pattern from `use-global-tips.ts`, emit from backend with tip_id correlation
- **Analytics Event**: Use `posthog.capture()` with tenant context from `TenantContext`
- **Adding Shadcn Component**: `pnpm dlx shadcn@latest add toast` then `import { toast } from "sonner"`
- **Custom Button Variant**: Modify `src/components/ui/button.tsx` to add new variants using `cva()`

## Key Files
- `src/lib/types.ts`: Core type definitions and Zod schemas
- `src/lib/language-adapter.ts`: Centralized language configuration
- `src/components/components.props.types.ts`: Reusable component interfaces
- `src/components/QnA/question-input.tsx`: Complex STT component with fuzzy search
- `src/hooks/use-global-tips.ts`: SSE-based real-time tips management
- `src/lib/entity-odds-transformer.ts`: Data transformation logic
- `src/lib/teams-notification.ts`: Error alerting service
- `components.json`: Shadcn UI configuration (New York style, RSC enabled)
- `src/app/posthog-provider.tsx`: The PostHog provider wired into layout; prefer this for runtime analytics wiring
- `src/components/ui/`: Shadcn UI components directory
 - `.env.example`: Example environment file; please keep it in sync with `src/auth.ts`/layout provider env variables such as `AUTH_AUTH0_ID`, `AUTH_AUTH0_SECRET`, and `SHOW_MAINTENANCE`.
- `dev-tools/betfair-entity-mapping/`: Integration utilities</content>
<parameter name="filePath">c:\Xansr\Fantasy\aiko-betassist-fe\.github\copilot-instructions.md
