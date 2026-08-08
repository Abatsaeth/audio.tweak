<div align="center">

<img src="./public/logo-banner.svg" alt="Audio Tweak Logo" width="500" style="max-width: 100%;" />

**A free, open-source, private-by-design audio player and editor — entirely in your browser.**

[![License](https://img.shields.io/badge/license-MIT%20%2F%20ISC-blue.svg)](./LICENSE.md)
[![Built with Vite](https://img.shields.io/badge/built%20with-Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![PWA Ready](https://img.shields.io/badge/PWA-offline%20ready-5A0FC8?logo=pwa&logoColor=white)](#privacy--security)
[![No Tracking](https://img.shields.io/badge/tracking-none-success.svg)](#privacy--security)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-222222?logo=githubpages&logoColor=white)](https://abatsaeth.github.io/audio.tweak/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare%20Workers-live-F38020?logo=cloudflare&logoColor=white)](https://audio-tweak.abatsaeth.workers.dev/)
[![Netlify](https://img.shields.io/badge/Netlify-live-00C7B7?logo=netlify&logoColor=white)](https://audiotweak.netlify.app/)
[![Last Commit](https://img.shields.io/github/last-commit/Abatsaeth/audio.tweak)](../../commits/main)

[Live Demo](https://abatsaeth.github.io/audio.tweak/) · [Report a Bug](../../issues) · [Request a Feature](../../issues)

</div>

<!--
  📸 Add a screenshot or short GIF of the app here once you have one, e.g.:
  ![Audio Tweak screenshot](./docs/screenshot.png)
-->

---

## About

**Audio Tweak** gives you full control over your audio files, entirely client-side — no uploads, no accounts, no server round-trip. Drop in a file, and it stays exactly where it's supposed to: on your machine.

Right now, Audio Tweak functions as a fast, polished **audio player**: drag-and-drop your library, reorder and pin tracks, rename and search, shuffle and repeat, all wrapped in a custom UI built from scratch. The current focus is on getting that foundation completely solid — smooth playback, a responsive interface, zero glitches — before layering on the audio manipulation tools (volume, pitch, bass/treble, distortion, speed) that give the project its name.

## Features

- 🎵 **Drag-and-drop library** — add, reorder, rename, search, and pin your local audio files
- 🔀 **Shuffle & repeat** — repeat-all, repeat-one, or shuffle playback
- 📶 **Sortable library** — by name, type, size, or duration
- 📴 **Fully offline-capable** — installs as a PWA and works with no internet connection after the first load
- 🎨 **Custom-built interface** — hand-crafted UI and interactions, not a component-library template
- 🔧 **In progress:** volume, pitch, bass/treble, distortion, and speed controls, with export back to your device

## Privacy & Security

Privacy isn't a bullet point bolted on afterward here — it's enforced at every layer:

- **No tracking, ever.** No analytics, no telemetry, no third-party scripts of any kind.
- **Nothing leaves your device.** Your audio files are processed and played entirely in-browser; nothing is ever uploaded anywhere.
- **Strict Content-Security-Policy.** The site enforces a same-origin-only CSP — the browser itself refuses to let the page load a script, font, or resource from anywhere but this domain.
- **Hardened response headers** (on Netlify/Cloudflare): `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and a locked-down `Permissions-Policy` that explicitly disables camera, microphone, geolocation, and other device APIs the app has no use for.
- **Zero third-party fonts.** All fonts are self-hosted and subset — nothing ever pings Google Fonts or any other CDN.
- **No dependency bloat.** Every dependency in `package.json` is actually used in the shipped app — nothing is pulled in "just in case."

## Tech Stack

- **Build tool:** [Vite](https://vitejs.dev) — bundling, dev server, and production minification (Terser + LightningCSS)
- **Language:** Vanilla JavaScript (ES modules) — no framework, no runtime dependencies
- **PWA:** [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for offline support and installability
- **Styling:** Hand-written CSS with self-hosted, unicode-range-subsetted web fonts

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)

### Installation

```bash
git clone https://github.com/Abatsaeth/audio.tweak.git
cd audio.tweak
npm install
```

### Development

Starts a local dev server with hot reload:

```bash
npm run dev
```

### Production build

Outputs an optimized, minified build to `dist/`:

```bash
npm run build
```

## Deployment

Audio Tweak is deployed simultaneously to three independent hosts, so it stays available even if one has an outage:

| Host | URL |
|---|---|
| GitHub Pages | [abatsaeth.github.io/audio.tweak](https://abatsaeth.github.io/audio.tweak/) |
| Cloudflare Workers | [audio-tweak.abatsaeth.workers.dev](https://audio-tweak.abatsaeth.workers.dev/) |
| Netlify | [audiotweak.netlify.app](https://audiotweak.netlify.app/) |

GitHub Pages deploys automatically via GitHub Actions on every push to `main`. Netlify and Cloudflare read their configuration from `netlify.toml` and `wrangler.jsonc` respectively.

> **Note:** GitHub Pages can't serve custom HTTP response headers (a platform limitation, not a project one), so the hardened security headers above are only served by the Netlify and Cloudflare deployments. A same-origin CSP is still enforced on GitHub Pages via a `<meta>` tag.

## Contributing

Issues and pull requests are welcome. If you're planning a larger change, consider opening an issue first to discuss the approach.

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request

## License

Dual-licensed under your choice of the MIT License or the ISC License — see [`LICENSE.md`](./LICENSE.md) for the full text of both (or [`LICENSE`](./LICENSE) for the plain-text version).
