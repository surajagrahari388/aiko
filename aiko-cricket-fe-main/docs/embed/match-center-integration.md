# Match Center Embed — Integration Guide

Embed the full Aiko Match Center experience — Match Pulse insights at the top with tabbed Live Tips, Pre-Game Tips, Ask Aiko Q&A, and Match Insights below — directly into your website using an iframe.

---

## Quick Start

```html
<iframe
  src="https://your-aiko-domain.com/embed/match-center/83798?user_id=user123&subscription-key=YOUR_APIM_KEY&language=english&theme=light"
  width="100%"
  height="700"
  frameborder="0"
  style="border: none; border-radius: 12px; overflow: hidden;"
  allow="autoplay; microphone"
  title="Match Center"
></iframe>
```

---

## URL Format

```
/embed/match-center/{matchId}?user_id={userId}&subscription-key={apiKey}&language={language}&theme={theme}
```

### Parameters

| Parameter          | Required | Description                                | Example           |
| ------------------ | -------- | ------------------------------------------ | ----------------- |
| `matchId`          | Yes      | The match ID (path parameter)              | `83798`           |
| `user_id`          | Yes      | Unique identifier for the end user         | `user_456`        |
| `subscription-key` | Yes      | Your APIM subscription key                 | `abc123def456...` |
| `language`         | No       | Language for insights (default: `english`) | `hindi`           |
| `theme`            | No       | Color theme (default: `light`)             | `dark`            |

### Supported Languages

| Value      | Language |
| ---------- | -------- |
| `english`  | English  |
| `hindi`    | Hindi    |
| `hinglish` | Hinglish |
| `tamil`    | Tamil    |
| `telugu`   | Telugu   |
| `kannada`  | Kannada  |
| `marathi`  | Marathi  |
| `gujarati` | Gujarati |
| `bengali`  | Bengali  |

### Supported Themes

| Value   | Description                |
| ------- | -------------------------- |
| `light` | Light background (default) |
| `dark`  | Dark background            |

---

## What's Included

### Match Pulse (top section)
- Real-time AI-generated headline insights
- Match summary fallback when no live tips are available
- Text-to-Speech playback per insight
- Swipeable carousel navigation

### Tabbed Tips (below Match Pulse)
- **Live Tips** — real-time betting tips with category filters
- **Pre-Game Tips** — pre-match analysis and predictions
- **Ask Aiko** — conversational Q&A with voice input
- **Match Insights** — AI-generated match summary and analysis

### What's Excluded
- Navbar / Scorecard header
- My Tips (favourites) — requires auth
- Player Insights tab
- Feedback collection

---

## Authentication

Each customer must provide their own Azure APIM subscription key via the `subscription-key` query parameter. This key is used for:

1. **Server-side match data fetch** — passed as `Ocp-Apim-Subscription-Key` header
2. **Client-side API proxy routes** (`/api/tips`, `/api/match-summary`, `/api/tts`) — forwarded from client to server
3. **Direct SSE connection** — appended as `?subscription-key=xxx` query parameter

APIM validates the key server-side. Invalid or missing keys will result in 401/403 errors from the gateway.

**Error responses:**
- Missing `subscription-key` → "Missing subscription-key parameter" message displayed in the iframe
- Missing `user_id` → "Missing user_id parameter" message displayed in the iframe
- Invalid `matchId` or invalid key → "Match not found" message displayed

---

## Real-Time Updates (SSE)

The embed maintains a single SSE connection for both Match Pulse and the tabbed tips view. When new tips arrive:

- Match Pulse cards update with a green flash animation
- Tab tip lists update in real-time
- Auto-reconnects with exponential backoff (up to 5 retries)
- 45-second heartbeat timeout detection

---

## Iframe Sizing

### Recommended Dimensions

| Context          | Width | Height |
| ---------------- | ----- | ------ |
| Full-width embed | 100%  | 700px  |
| Sidebar widget   | 400px+| 650px  |
| Mobile           | 100%  | 600px  |

### Responsive Example

```html
<div style="max-width: 800px; margin: 0 auto;">
  <iframe
    src="https://your-aiko-domain.com/embed/match-center/83798?user_id=user123&subscription-key=YOUR_APIM_KEY&language=english"
    width="100%"
    height="700"
    frameborder="0"
    style="border: none; border-radius: 12px;"
    allow="autoplay; microphone"
    title="Match Center"
  ></iframe>
</div>
```

### Important: `allow` Attribute

```html
allow="autoplay; microphone"
```

- **autoplay** — required for Text-to-Speech audio playback
- **microphone** — required for Ask Aiko voice input

---

## Dynamic Match Switching

To switch matches without reloading the page, update the iframe `src` attribute:

```javascript
function loadMatch(matchId) {
  const iframe = document.getElementById("match-center-embed");
  const baseUrl = "https://your-aiko-domain.com/embed/match-center";
  iframe.src = `${baseUrl}/${matchId}?user_id=user123&subscription-key=YOUR_APIM_KEY&language=english&theme=light`;
}
```

---

## Security Notes

- The `user_id` parameter is used for analytics and personalization, not authentication
- Embed routes bypass the main application auth (Auth0) and maintenance mode
- `Content-Security-Policy: frame-ancestors *` allows embedding on any domain
- HTTPS is strongly recommended for production deployments

---

## Branding & Typography

Customize the embed's visual appearance to match your site's brand.

| Parameter       | Type                         | Default        | Description                                          | Example                          |
| --------------- | ---------------------------- | -------------- | ---------------------------------------------------- | -------------------------------- |
| `accent_color`  | Hex color (`%23` for `#`)    | `#a6171b`      | Brand color for buttons, links, and active states    | `accent_color=%23FF5722`         |
| `font_family`   | String                       | Space Grotesk  | Google Font or system font name                      | `font_family=Inter`              |
| `border_radius` | `none` / `sm` / `md` / `lg` | `lg`           | Card corner rounding                                 | `border_radius=none`             |
| `heading_size`  | `sm` / `md` / `lg`          | `md`           | Title/heading text size (sm=13px, md=16px, lg=18px)  | `heading_size=lg`                |
| `body_size`     | `sm` / `md` / `lg`          | `md`           | Body/content text size (sm=12px, md=14px, lg=16px)   | `body_size=sm`                   |

All branding parameters are optional. Invalid values are silently ignored and defaults are used.

**Example with branding:**

```html
<iframe
  src="https://your-aiko-domain.com/embed/match-center/83798?user_id=user123&subscription-key=YOUR_KEY&accent_color=%23FF5722&font_family=Inter&border_radius=sm&heading_size=lg&body_size=sm"
  width="100%"
  height="700"
  frameborder="0"
  style="border: none; border-radius: 12px; overflow: hidden;"
  allow="autoplay; microphone"
  title="Match Center"
></iframe>
```

---

## Troubleshooting

| Issue                                 | Solution                                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| "Missing subscription-key parameter"  | Add `subscription-key` query parameter with your APIM key                        |
| "Missing user_id parameter"           | Add `user_id` query parameter                                                   |
| "Match not found"                     | Verify the match ID exists and the APIM backend is reachable                     |
| Blank iframe                          | Check browser console for CSP or mixed-content errors; ensure HTTPS              |
| No real-time updates                  | Check DevTools Network tab for EventSource connection; verify SSE endpoint is up |
| Audio not playing                     | Ensure `allow="autoplay"` is set on the iframe element                           |
| Voice input not working               | Ensure `allow="microphone"` is set on the iframe element                         |
| Theme not applying                    | Only `light` and `dark` are valid values for the `theme` parameter               |
| Duplicate SSE connections             | Should not happen — the embed uses a single SSE connection shared via React Query |
