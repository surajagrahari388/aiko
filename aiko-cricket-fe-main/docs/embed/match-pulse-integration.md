# Match Pulse Embed — Integration Guide

Embed real-time AI-powered Match Pulse insights directly into your website using an iframe.

---

## Quick Start

```html
<iframe
  src="https://your-aiko-domain.com/embed/match-pulse/83798?user_id=user123&subscription-key=YOUR_APIM_KEY&language=english&theme=light"
  width="100%"
  height="160"
  frameborder="0"
  style="border: none; border-radius: 12px; overflow: hidden;"
  allow="autoplay"
  title="Match Pulse"
></iframe>
```

---

## URL Format

```
/embed/match-pulse/{matchId}?user_id={userId}&subscription-key={apiKey}&language={language}&theme={theme}
```

### Parameters

| Parameter          | Required | Description                                | Example            |
| ------------------ | -------- | ------------------------------------------ | ------------------ |
| `matchId`          | Yes      | The match ID (path parameter)              | `83798`            |
| `user_id`          | Yes      | Unique identifier for the end user         | `user_456`         |
| `subscription-key` | Yes      | Your APIM subscription key                 | `abc123def456...`  |
| `language`         | No       | Language for insights (default: `english`) | `hindi`            |
| `theme`            | No       | Color theme (default: `light`)             | `dark`             |

### Supported Languages

| Value      | Language  |
| ---------- | --------- |
| `english`  | English   |
| `hindi`    | Hindi     |
| `hinglish` | Hinglish  |
| `tamil`    | Tamil     |
| `telugu`   | Telugu    |
| `kannada`  | Kannada   |
| `marathi`  | Marathi   |
| `gujarati` | Gujarati  |
| `bengali`  | Bengali   |

### Supported Themes

| Value   | Description              |
| ------- | ------------------------ |
| `light` | Light background (default) |
| `dark`  | Dark background          |

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

## Features

### Real-Time Updates (SSE)

The embed automatically connects to the SSE (Server-Sent Events) stream for the specified match. When new Match Pulse insights arrive, they replace existing content with a green flash animation.

- Auto-reconnects with exponential backoff (up to 5 retries)
- 45-second heartbeat timeout detection
- No additional configuration needed

### Match Summary Fallback

If no real-time Match Pulse tips are available yet, the embed displays AI-generated match summary insights from the Match Summary API.

### Text-to-Speech

Each insight card includes a speaker icon. Clicking it fetches and plays TTS audio for the current insight in the selected language.

### Navigation

When multiple insights are available:
- Click the chevron (arrow) button to navigate between insights
- Swipe left/right on mobile devices
- Long insights (15+ words) have an expand/collapse button

---

## Iframe Sizing

### Recommended Dimensions

| Context          | Width  | Height  |
| ---------------- | ------ | ------- |
| Sidebar widget   | 300px+ | 140px   |
| Full-width embed | 100%   | 160px   |
| Mobile           | 100%   | 140px   |

The embed uses `bg-transparent` on the body, so it blends with your page background. Wrap the iframe in a container with your desired background if needed.

### Responsive Example

```html
<div style="max-width: 600px; margin: 0 auto;">
  <iframe
    src="https://your-aiko-domain.com/embed/match-pulse/83798?user_id=user123&subscription-key=YOUR_APIM_KEY&language=english"
    width="100%"
    height="160"
    frameborder="0"
    style="border: none; border-radius: 12px;"
    allow="autoplay"
    title="Match Pulse"
  ></iframe>
</div>
```

---

## Dynamic Match Switching

To switch matches without reloading the page, update the iframe `src` attribute:

```javascript
function loadMatch(matchId) {
  const iframe = document.getElementById("match-pulse-embed");
  const baseUrl = "https://your-aiko-domain.com/embed/match-pulse";
  iframe.src = `${baseUrl}/${matchId}?user_id=user123&subscription-key=YOUR_APIM_KEY&language=english&theme=light`;
}
```

---

## Auto-Resize (Optional)

The embed has a fixed-height layout, but if you want to handle dynamic sizing, you can listen for `message` events from the iframe (not currently implemented server-side, but the iframe allows `*` frame-ancestors for full flexibility).

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
  src="https://your-aiko-domain.com/embed/match-pulse/83798?user_id=user123&subscription-key=YOUR_KEY&accent_color=%23FF5722&font_family=Inter&border_radius=sm&heading_size=lg&body_size=sm"
  width="100%"
  height="160"
  frameborder="0"
  style="border: none; border-radius: 12px; overflow: hidden;"
  allow="autoplay"
  title="Match Pulse"
></iframe>
```

---

## Troubleshooting

| Issue                               | Solution                                                                           |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| "Missing subscription-key parameter"| Add `subscription-key` query parameter with your APIM key                          |
| "Missing user_id parameter"         | Add `user_id` query parameter                                                     |
| "Match not found"            | Verify the match ID exists and the APIM backend is reachable                       |
| Blank iframe                 | Check browser console for CSP or mixed-content errors; ensure HTTPS                |
| No real-time updates         | Check DevTools Network tab for EventSource connection; verify SSE endpoint is up   |
| Audio not playing            | Ensure `allow="autoplay"` is set on the iframe element                             |
| Theme not applying           | Only `light` and `dark` are valid values for the `theme` parameter                 |
