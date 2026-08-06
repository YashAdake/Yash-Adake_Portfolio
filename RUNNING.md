# Running & Deploying — yashadake.com

Quick reference for previewing the portfolio locally and publishing it.
Hand-built **static site** (plain HTML/CSS/JS, no build step): one stylesheet
(`css/site.css`), two scripts (`js/app.js`, `js/analytics.js`). Hosted on
**GitHub Pages** behind **Cloudflare**; the contact form + visitor counter go
through a **Cloudflare Worker**.

---

## Run it locally

A local **web server** is required — do **not** open `index.html` by
double-clicking it. A `file://` URL breaks web fonts, `fetch`, and relative
paths. Always use the `http://localhost` address.

1. **Pick the branch** in GitHub Desktop → *Current Branch*
   (`V3.0.0.0` = current redesign, `V2.0.0.0` = previous version). The files on
   disk change to match the selected branch.
2. **Open a terminal in the project folder** (`d:\my\Yash-Adake_Portfolio`):
   - GitHub Desktop → menu **Repository → Open in Command Prompt** (or PowerShell), **or**
   - File Explorer → click the address bar → type `powershell` → Enter.
3. **Start a server** (Python is already installed):
   ```powershell
   cd d:\my\Yash-Adake_Portfolio
   python -m http.server 8080
   ```
4. **Open** http://localhost:8080
5. **Stop** the server: press `Ctrl + C` in that terminal.

**Alternatives**
- Node: `npx serve` (prints its URL, usually `http://localhost:3000`).
- Port already in use? Use another: `python -m http.server 8081` → `http://localhost:8081`.

**One-click launcher (optional).** Save this as `serve.bat` in the repo root,
then just double-click it:
```bat
@echo off
cd /d "%~dp0"
start "" http://localhost:8080
python -m http.server 8080
```

---

## Expected on localhost (NOT bugs)

These only work on the live domain because the Cloudflare Worker restricts CORS
to `https://yashadake.com`:
- **Visitor counter** shows a fallback number (~850).
- **Contact form** won't actually send.

Also: **project card screenshots** show a gradient + logotype fallback unless the
image files exist in `photos/projects/` (`myjson.webp`, `optiresume.webp`,
`airdraw.gif`).

---

## Deploy (GitHub Pages)

1. Commit + push the branch you want live (GitHub Desktop → **Publish/Push**).
2. GitHub repo → **Settings → Pages → Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **`V3.0.0.0`**, folder **`/ (root)`** → **Save**
3. The `CNAME` file (yashadake.com) is committed in the branch, so the custom
   domain carries over. Live ~1–2 min after the push.

Request path: **Visitor → Cloudflare (CDN/SSL/headers) → GitHub Pages.**
`V2.0.0.0` stays as a fallback — switch the Pages branch back to roll back.

After it's live, run **Lighthouse** on the real `yashadake.com` (the Worker +
project images resolve there, so the score is accurate).

---

## Project structure

```
index.html              single-page site (hero, products, work, about, writing, contact)
work/optiresume.html    case study — OptiResume (linked from the product card + ⌘K palette)
work/myjson.html        case study — MyJSON (carries the live demo widget, js/demo-json.js)
work/airdraw.html       case study — AirDraw
notes/*.html            engineering notes (3) — linked from Writing + ⌘K palette; same
                        page system as work/, generated once by a scratchpad script but
                        edited by hand since — treat the HTML as the source of truth
404.html                not-found page
coming-soon.html        per-product coming-soon (?product=optiresume|airdraw)
css/site.css            entire design system + all section styles (design tokens at top)
                        §24 holds the .cs-* case-study classes used by work/*.html
js/app.js               theme · nav · scroll · scroll-reveal · hero topology canvas ·
                        command palette (Ctrl/⌘+K) · custom cursor · form · carousel · counter
js/analytics.js         GA4 + Microsoft Clarity (consent-gated)
photos/                 images, certificates, resume PDF (+ photos/projects/ for card shots)
CNAME / .nojekyll       GitHub Pages config
cloudflare-worker-api.js  reference copy of the deployed Worker
```

> **No build step means the chrome is duplicated.** `work/*.html` and `notes/*.html`
> each carry their own copy of the SVG icon sprite, nav, mobile nav panel and footer.
> If you change any of those in `index.html`, change them in all six subpages too —
> nothing will warn you. Their asset paths are `../`-relative and their nav links point
> at `../index.html#section`, so they work both locally and on GitHub Pages.

---

## Design system (top of `css/site.css`, `:root`)

| Token group | Values |
|---|---|
| Surfaces | `--bg #0B0E14` · `--surface #11151E` · `--elevated #181D28` |
| Text | `--text #E7EAF0` · `--text-dim #98A2B3` · `--text-mute #7B8698` |
| Brand | `--accent #7C8CF8` (text/borders) · `--accent-solid #5660E4` (buttons w/ white text) |
| Status | `--ok #3DD68C` (live) · `--warn #F5B544` (soon) · `--danger #F2555A` |
| Fonts | Instrument Serif (display) · Inter (body) · JetBrains Mono (data/labels) |

- **Light mode:** `body.light-mode` overrides the tokens (toggle = sun/moon, top-right; persisted in `localStorage`).
- **Motion** respects `prefers-reduced-motion`; layout is mobile-first with desktop enhancements.
- Verified: 0 horizontal overflow, **axe-core 0 WCAG 2.2 A/AA violations**.
