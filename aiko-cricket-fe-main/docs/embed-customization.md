# Embed Customization Guide

## Available Embeds

| Embed | Route | Recommended Height | Description |
|-------|-------|---------------------|-------------|
| Match Pulse | `/embed/match-pulse/[matchId]` | 160px | Compact real-time tips with SSE, match summary fallback, TTS |
| Match Tips | `/embed/match-tips/[matchId]` | 500px | Single tips view (in-game when live, pre-game otherwise), SSE |
| Match Center | `/embed/match-center/[matchId]` | 700px | Match Pulse + single tips view combined |

## Query Parameters

### Required

| Param | Description | Example |
|-------|-------------|---------|
| `subscription-key` | APIM subscription key for API authentication | `abc123` |
| `user_id` | Unique user identifier for personalization and analytics | `user_42` |
| `channel` | URL of the host website where the embed is rendered. Included in all PostHog analytics events. | `https://example.com` |

> **Security note:** The `subscription-key` is exposed in the iframe URL. For production deployments, consider using a backend proxy or short-lived scoped tokens instead of passing long-lived APIM keys as query parameters.

### Optional

| Param | Description | Example |
|-------|-------------|---------|
| `language` | Language code for content | `en` |
| `theme` | Theme selection | `dark` |

### Branding / Styling

All branding params are optional. Invalid values are silently ignored and defaults are used.

| Param | Values | Default | Description |
|-------|--------|---------|-------------|
| `accent_color` | Hex color (`#FF5733` or `FF5733`) | Theme default | Primary accent color. Overrides the `--primary` CSS variable. Foreground color (black/white) is auto-computed based on luminance. |
| `font_family` | Any [Google Font](https://fonts.google.com/) name | `Space Grotesk` | Loads the font dynamically and applies it globally within the embed. |
| `border_radius` | `none` \| `sm` \| `md` \| `lg` | `md` | Controls corner rounding on all Shadcn UI components. |
| `heading_size` | `sm` \| `md` \| `lg` | `md` | Controls heading text size across embed components. |
| `body_size` | `sm` \| `md` \| `lg` | `md` | Controls body text size across embed components. |

#### Size Mappings

**Heading sizes:**
| Value | CSS Class |
|-------|-----------|
| `sm` | `text-sm` (14px) |
| `md` | `text-base` (16px) |
| `lg` | `text-lg` (18px) |

**Body sizes:**
| Value | CSS Class |
|-------|-----------|
| `sm` | `text-xs` (12px) |
| `md` | `text-sm` (14px) |
| `lg` | `text-base` (16px) |

#### Border Radius Mappings

| Value | Radius |
|-------|--------|
| `none` | `0` |
| `sm` | `0.25rem` (4px) |
| `md` | `0.5rem` (8px) |
| `lg` | `0.75rem` (12px) |

## Usage Examples

### Basic

```html
<iframe
  src="https://your-domain.com/embed/match-pulse/12345?subscription-key=abc123&user_id=user_42&channel=https://example.com"
  width="100%"
  height="160"
  frameborder="0"
/>
```

### Full Branding

```html
<iframe
  src="https://your-domain.com/embed/match-tips/12345?subscription-key=abc123&user_id=user_42&channel=https://example.com&accent_color=FF5733&font_family=Inter&border_radius=lg&heading_size=lg&body_size=md&theme=dark"
  width="100%"
  height="500"
  frameborder="0"
/>
```

### Match Center (Combined View)

```html
<iframe
  src="https://your-domain.com/embed/match-center/12345?subscription-key=abc123&user_id=user_42&channel=https://example.com&accent_color=1D4ED8&font_family=Roboto&border_radius=md"
  width="100%"
  height="700"
  frameborder="0"
/>
```

## Error States

If a required parameter is missing, the embed renders an error message instead of content:

- `Missing subscription-key parameter`
- `Missing user_id parameter`
- `Missing channel parameter`

If the `matchId` in the URL doesn't correspond to a valid match, a 404 page is shown.

## Analytics

All PostHog events fired within an embed automatically include the `channel` property, allowing you to segment analytics by host website. No additional instrumentation is needed — this is handled via PostHog super properties registered when the embed mounts.

## Notes

- Audio is always disabled in embeds (`disableAudio` is hardcoded to `true`).
- Favourite tips and feedback features are disabled in embed views.
- The embed background is transparent — the host page controls the background.
- **Match Tips and Match Center** embeds show a single tips view with no bottom navigation bar. Content is automatically selected based on match state:
  - **Match is live** — In-game tips are shown (with pre-game as fallback).
  - **Match is not live** — Pre-game tips are shown.
- Ask Aiko, My Tips, Insights, and other category tabs are not available in embeds.
