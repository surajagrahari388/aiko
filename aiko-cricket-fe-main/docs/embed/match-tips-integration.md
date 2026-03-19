# Match Tips Embed — Integration Guide

Embed the full AI-powered tips experience (Live Tips, Pre-Game Tips, Ask Aiko Q&A, Match Insights) directly into your website using an iframe.

---

## Quick Start

```html
<iframe
  src="https://your-aiko-domain.com/embed/match-tips/83798?user_id=user123&subscription-key=YOUR_APIM_KEY&language=english&theme=light"
  width="100%"
  height="500"
  frameborder="0"
  style="border: none; border-radius: 12px; overflow: hidden;"
  allow="autoplay; microphone"
  title="Match Tips"
></iframe>
```

---

## URL Format

```
/embed/match-tips/{matchId}?user_id={userId}&subscription-key={apiKey}&language={language}&theme={theme}
```

### Parameters

| Parameter          | Required | Description                                | Example           |
| ------------------ | -------- | ------------------------------------------ | ----------------- |
| `matchId`          | Yes      | The match ID (path parameter)              | `83798`           |
| `user_id`          | Yes      | Unique identifier for the end user         | `user_456`        |
| `subscription-key` | Yes      | Your APIM subscription key                 | `abc123def456...` |
| `language`         | No       | Language for tips (default: `english`)     | `hindi`           |
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

## Authentication

Each customer must provide their own Azure APIM subscription key via the `subscription-key` query parameter. This key is used for:

1. **Server-side match data fetch** — passed as `Ocp-Apim-Subscription-Key` header
2. **Client-side API proxy routes** (`/api/tips`, `/api/match-summary`, `/api/tts`, `/api/players`) — forwarded from client to server
3. **Direct SSE connection** — appended as `?subscription-key=xxx` query parameter
4. **Ask Aiko Q&A streaming** — passed as the APIM key for RAG chat requests

APIM validates the key server-side. Invalid or missing keys will result in 401/403 errors from the gateway.

**Error responses:**

- Missing `subscription-key` → "Missing subscription-key parameter" displayed in the iframe
- Missing `user_id` → "Missing user_id parameter" displayed in the iframe
- Invalid `matchId` or invalid key → "Match not found" displayed

---

## Included Tabs

The embed includes a subset of the full application tabs:

| Tab            | Description                                    |
| -------------- | ---------------------------------------------- |
| Live Tips      | In-game tips (visible only during live matches)|
| Pre-Game       | Pre-match betting tips grouped by market       |
| Ask Aiko       | Interactive Q&A — type or speak questions      |
| Match Insights | AI-generated match summary and analysis        |
| Category tabs  | Dynamic per-market tabs (e.g., Match Odds)     |

**Excluded tabs:** My Tips (favourites), Player Insights, Feedback.

A bottom navigation bar provides tab switching on mobile viewports.

---

## Features

### Real-Time Updates (SSE)

The embed automatically connects to the SSE stream for the specified match. Tips update in real-time with visual highlighting for new arrivals.

- Auto-reconnects with exponential backoff (up to 5 retries)
- 45-second heartbeat timeout detection

### Ask Aiko Q&A

Users can type questions or use voice input (microphone) to ask Aiko about the match. Responses stream in real-time with markdown formatting.

### Text-to-Speech

Each tip card and match insight includes a speaker icon for TTS audio playback in the selected language.

### Swipe Navigation

Tip carousels support touch swipe and keyboard navigation between tips within a market category.

---

## Iframe Sizing

### Recommended Dimensions

| Context          | Width  | Height |
| ---------------- | ------ | ------ |
| Full-width embed | 100%   | 500px  |
| Sidebar widget   | 350px+ | 600px  |
| Mobile           | 100%   | 100vh  |

The embed uses `bg-transparent` on the body, so it blends with your page background.

### Responsive Example

```html
<div style="max-width: 700px; margin: 0 auto;">
  <iframe
    src="https://your-aiko-domain.com/embed/match-tips/83798?user_id=user123&subscription-key=YOUR_APIM_KEY&language=english"
    width="100%"
    height="500"
    frameborder="0"
    style="border: none; border-radius: 12px;"
    allow="autoplay; microphone"
    title="Match Tips"
  ></iframe>
</div>
```

---

## Dynamic Match Switching

To switch matches without reloading the page, update the iframe `src` attribute:

```javascript
function loadMatch(matchId) {
  const iframe = document.getElementById("match-tips-embed");
  const baseUrl = "https://your-aiko-domain.com/embed/match-tips";
  iframe.src = `${baseUrl}/${matchId}?user_id=user123&subscription-key=YOUR_APIM_KEY&language=english&theme=light`;
}
```

---

## Security Notes

- The `user_id` parameter is used for analytics and personalization, not authentication
- Embed routes bypass the main application auth (Auth0) and maintenance mode
- `Content-Security-Policy: frame-ancestors *` allows embedding on any domain
- HTTPS is strongly recommended for production deployments
- The `allow="microphone"` attribute is needed for Ask Aiko voice input

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
  src="https://your-aiko-domain.com/embed/match-tips/83798?user_id=user123&subscription-key=YOUR_KEY&accent_color=%23FF5722&font_family=Inter&border_radius=sm&heading_size=lg&body_size=sm"
  width="100%"
  height="500"
  frameborder="0"
  style="border: none; border-radius: 12px; overflow: hidden;"
  allow="autoplay; microphone"
  title="Match Tips"
></iframe>
```

---

## Troubleshooting

| Issue                                | Solution                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| "Missing subscription-key parameter" | Add `subscription-key` query parameter with your APIM key                        |
| "Missing user_id parameter"          | Add `user_id` query parameter                                                   |
| "Match not found"                    | Verify the match ID exists and the APIM backend is reachable                     |
| Blank iframe                         | Check browser console for CSP or mixed-content errors; ensure HTTPS              |
| No real-time updates                 | Check DevTools Network tab for EventSource connection; verify SSE endpoint is up |
| Audio not playing                    | Ensure `allow="autoplay"` is set on the iframe element                           |
| Voice input not working              | Ensure `allow="microphone"` is set on the iframe element                         |
| Theme not applying                   | Only `light` and `dark` are valid values for the `theme` parameter               |
| Tabs not rendering                   | Verify the match has tips available; check console for API errors                |
