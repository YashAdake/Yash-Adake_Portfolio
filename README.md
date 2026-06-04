# Yash Adake — Portfolio

Personal portfolio and brand site for Yash Adake, Software Engineer.
Live at **[yashadake.com](https://yashadake.com)**.

A hand-built static site (no framework, no build step) hosted on GitHub Pages
and served through Cloudflare for CDN, SSL, and security headers. The contact
form and visitor counter are backed by a small Cloudflare Worker that proxies a
Google Apps Script — the script URL is never exposed to the browser.

## Stack

- **Plain HTML / CSS / JS** — zero build step, deploys as-is
- **Bootstrap 5** (grid + collapse only), **Boxicons**, **AOS** (scroll reveals)
- **Three.js** (lazy-loaded) for the hero shader canvas, with a CSS gradient-mesh fallback on mobile / reduced-motion
- **Cloudflare Worker** — contact-form proxy + visitor counter ([cloudflare-worker-api.js](cloudflare-worker-api.js))
- **Google Apps Script** — form storage + counter backend (hidden behind the Worker)

## Project layout

```
index.html              Single-page portfolio (hero, products, work, about, writing, contact)
coming-soon.html        Per-product "coming soon" page (?product=optiresume|airdraw)
404.html                Custom not-found page
css/
  premium.css           Design system + all section styles (design tokens at top)
  elite.css             Custom cursor, light-mode tuning, reduced-motion, fluid type
js/
  core.js               Form, theme toggle, nav, scroll handler, visitor counter, cert lightbox
  elite-improvements.js Custom cursor, hero eyebrow typing, hero parallax
  palette.js            ⌘K / Ctrl+K command palette
  hero3d.js             Three.js hero canvas (desktop, motion-allowed only)
  effects.js / motion.js / delights.js   Scroll/visual flourishes + easter egg
photos/                 Images, certificates, résumé PDF
cloudflare-worker-api.js  Reference copy of the deployed Worker
google-apps-script/     Backend script source + notes
```

## Architecture notes

- **Design tokens** live at the top of [css/premium.css](css/premium.css) (`:root`).
  The primary brand color is `--primary: #19a7ce`.
- **The contact form posts to the Worker, not Google directly.** The Worker
  enforces an origin allowlist (`https://yashadake.com`) and returns a real
  `{ success }` JSON body, so the frontend reports genuine success/failure
  rather than assuming success on an opaque response.
- **The visitor counter** is server-truthed: it shows a cached value instantly,
  then reconciles with the Worker's count in the background. No fake offset.
- **Motion is gated.** `prefers-reduced-motion` disables the Three.js hero,
  the hero parallax, and the eyebrow typing loop, and collapses CSS animation
  durations.
- **Accessibility.** Certificate cards are keyboard-operable (`role="button"`,
  `tabindex`, Enter/Space); the lightbox traps focus and restores it on close.

## Local development

It's a static site — no install required. Serve the folder with any static
server so relative paths and `fetch` behave:

```bash
# Python
python -m http.server 5500

# or Node
npx serve .
```

Then open http://localhost:5500.

## Deployment

```
Visitor → Cloudflare (CDN, SSL, security headers) → GitHub Pages
```

- **Hosting:** GitHub Pages, served from the configured Pages branch. `CNAME`
  pins `yashadake.com`; `.nojekyll` disables Jekyll processing.
- **DNS / edge:** Cloudflare (nameservers delegated from the registrar). Security
  headers and HTTPS enforcement are applied via Cloudflare rules.
- **Worker:** deploy [cloudflare-worker-api.js](cloudflare-worker-api.js) to
  Cloudflare Workers and set `GOOGLE_SCRIPT_URL` as an **encrypted** environment
  variable (the committed reference copy inlines it for readability — production
  reads `env.GOOGLE_SCRIPT_URL`).

A detailed history of infrastructure and SEO changes (with rationale and rollback
steps) is kept in [CHANGELOG_V2.md](CHANGELOG_V2.md).

## License

© Yash Adake. All rights reserved. Code is shared for reference; the brand,
copy, photography, and certificate images are not licensed for reuse.
