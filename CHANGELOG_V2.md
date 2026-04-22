# Portfolio V2.0.0.0 — Change Log & Restore Guide

**Period:** April 2026 deployment cycle
**Branch:** `V2.0.0.0`
**Baseline (before changes):** commit `526e3e5` (tag `V4.2`)
**Latest:** commit `a5cc3f7`

This document captures **every change** made to the portfolio during this upgrade cycle — code, infrastructure, DNS, and third-party services. Each change includes *what was done*, *why it was done*, *what existed before*, and **how to revert it**.

---

## Table of Contents

- [1. CI/CD & Repository Hygiene](#1-cicd--repository-hygiene)
- [2. SEO Improvements](#2-seo-improvements)
- [3. Code Quality Fixes](#3-code-quality-fixes)
- [4. UI / Visual Additions](#4-ui--visual-additions)
- [5. Contact Form Security (Cloudflare Worker)](#5-contact-form-security-cloudflare-worker)
- [6. Cloudflare CDN + Proxy for Domain](#6-cloudflare-cdn--proxy-for-domain)
- [7. Security Headers](#7-security-headers)
- [8. HTTPS Enforcement](#8-https-enforcement)
- [9. Google Search Console](#9-google-search-console)
- [10. Certifications Section](#10-certifications-section)
- [Quick Reference: Credentials & URLs](#quick-reference-credentials--urls)
- [Full Rollback Procedure](#full-rollback-procedure)

---

## 1. CI/CD & Repository Hygiene

### 1.1 Added `.nojekyll`

**What:** Created an empty `.nojekyll` file at the repo root.

**Why:** GitHub Pages runs Jekyll by default, which ignores files/folders starting with an underscore (`_`) and can mangle certain assets. This empty file tells Pages to skip Jekyll entirely and serve files as-is.

**Before:** No `.nojekyll` file. Pages was processing the site through Jekyll (harmless for now, but limits future flexibility with asset paths).

**Revert:**
```bash
git rm .nojekyll
git commit -m "revert: remove .nojekyll"
git push
```

---

### 1.2 Added GitHub Actions CI Pipeline

**What:** Created `.github/workflows/ci.yml` with a Quality Checks job that validates on every push:
- `CNAME` file exists and contains `yashadake.com`
- `.nojekyll` exists
- No accidental large files committed
- Critical HTML files (`index.html`, `404.html`) are present
- Sitemap fragment URLs match actual section IDs

**Why:** Catch broken deployments before they go live. A misconfigured `CNAME` or missing critical file would silently break the production domain — this gates it at the PR / push level.

**Before:** No CI. Broken commits would only be discovered by manually refreshing the live site.

**Revert:**
```bash
git rm -r .github/workflows
git commit -m "revert: remove CI pipeline"
git push
```

---

## 2. SEO Improvements

### 2.1 `sitemap.xml` cleanup

**What:** Removed `#projects` and `#blog` entries. Kept only the root URL and the résumé PDF.

**Why:** The fragment URLs used wrong IDs (actual IDs are `#work` and `#writing`), and search engines ignore `#fragment` URLs in sitemaps anyway. Submitting invalid URLs risks Google Search Console warnings.

**Before:** Sitemap had 4 entries including two invalid fragments.

**Revert:** Restore the two `<url>` blocks for `/#projects` and `/#blog` in `sitemap.xml`.

---

### 2.2 `robots.txt` simplification

**What:** Removed redundant `Googlebot` and `Bingbot`-specific `Allow: /` blocks.

**Why:** These were duplicates of the global `User-agent: *` rule. They added noise without functional benefit.

**Before:** `robots.txt` had 3 User-agent blocks (`*`, `Googlebot`, `Bingbot`) saying the same thing.

**Revert:** Re-add the bot-specific blocks to `robots.txt`.

---

### 2.3 `404.html` corrections

**What:**
- Fixed `theme-color` meta (`#19a7ce` → `#0A0A0A`) to match main page
- Changed favicon path from relative (`photos/...`) to absolute (`/photos/...`)
- Fixed quick-link anchors: `#projects` → `/#work`, `#blog` → `/#writing`, added `/#about`, `/#contact`

**Why:** The 404 page can be served from any path. Relative favicon paths break when the error occurs on a nested URL (e.g. `/some/deep/path/that/404s`). Anchor links pointing to non-existent IDs would silently fail.

**Before:** 404 page had broken favicon on deep URLs and dead anchor links.

**Revert:** Reset `404.html` via `git checkout 526e3e5 -- 404.html`.

---

## 3. Code Quality Fixes

### 3.1 Visitor counter — honesty fix

**What:** In [js/core.js](js/core.js):
- Removed the fake `BASE = 750` offset that inflated the counter
- Added `sessionStorage` guard so the counter increments **once per browser session** instead of every page load

**Why:** The old counter silently added 750 to the real number (misleading) and double-counted within a single visit. Honest metrics matter for a personal portfolio — inflated stats are easy to spot and damage credibility.

**Before:** `count = parseInt(localStorage...) + 750` with increment on every page load.

**Revert:** Reintroduce the `BASE = 750` constant and remove the `sessionStorage.getItem('visited')` guard in the `visitorCounter()` IIFE.

---

### 3.2 Duplicate parallax removal

**What:** Removed section 7 from [js/motion.js](js/motion.js) which duplicated the `#mypic` parallax already handled by `elite-improvements.js`. Also removed `#mypic` from `parallaxEls` selector in [js/core.js](js/core.js).

**Why:** Three separate scripts were animating the hero photo on scroll — fighting each other for GPU time and causing stutter on low-end devices.

**Before:** `motion.js` line 165-185 ran a parallax loop on `#mypic` that conflicted with `elite-improvements.js` and `core.js`.

**Revert:** Restore the parallax block in `motion.js` and re-add `#mypic, .about-image` to the `parallaxEls` selector.

---

### 3.3 Form message styling via CSS class

**What:** Replaced inline `style.cssText` writes with `.msg-success` and `.msg-error` CSS classes defined in [css/premium.css](css/premium.css).

**Why:** Inline styles are hard to override, violate CSP, and bypass the theme system (dark/light mode colors wouldn't apply).

**Before:** `msg.style.cssText = 'color: green; ...'` hardcoded in JS.

**Revert:** Replace `msg.className = 'message msg-success'` with the original inline style assignments.

---

### 3.4 Cache-bust on elite-improvements.js

**What:** Added `?v=11.2.0` query parameter to the `<script src="elite-improvements.js">` tag in [index.html](index.html).

**Why:** Browsers aggressively cache JS. When deploying a fix, visitors would still load the old version until their cache expired. Query-string versioning forces a fresh fetch.

**Before:** `<script src="js/elite-improvements.js"></script>`

**Revert:** Strip the `?v=` suffix.

---

## 4. UI / Visual Additions

### 4.1 GitHub icon in social links

**What:** Added a GitHub icon (`bxl-github`) to:
- Hero social icons
- Contact section social icons
- Footer social icons
- Schema.org `sameAs` JSON-LD array
- Command palette (Cmd+K) Links group

Also added a GitHub brand-color (`#24292F`) hover state in CSS.

**Why:** GitHub is the single most important link for a software engineer's portfolio. Its absence was a conspicuous gap.

**Before:** Social icons included LinkedIn, Twitter, Instagram, Email — no GitHub.

**Revert:** Remove all `bxl-github` icon blocks and the corresponding CSS, plus the `palette.js` entry.

---

### 4.2 Scroll hint element

**What:** Added a "Scroll" hint with animated line at the bottom of the hero section, styled in [css/premium.css](css/premium.css) with a drop animation. Auto-hides after scrolling 100px.

**Why:** First-time visitors on desktop often don't realize the page scrolls. A subtle hint reduces bounce rate.

**Before:** No scroll indicator.

**Revert:** Remove `.scroll-hint` div from `index.html` hero section, remove `.scroll-hint` styles from `premium.css`, and the scroll-hide logic from `core.js`.

---

### 4.3 Removed elite.css social link override

**What:** Deleted an entire `!important` social-link style block from [css/elite.css](css/elite.css).

**Why:** Those overrides were fighting against newer styles in `premium.css` v11.1. Two stylesheets competing for the same element is a CSS code smell and makes future changes unpredictable.

**Before:** `elite.css` had `.home-social-links a { color: ... !important; ... }` duplicating `premium.css` rules.

**Revert:** Restore via `git checkout 526e3e5 -- css/elite.css`.

---

### 4.4 Deleted stale files

**What:** Removed these files from the repo:
- `HOW_TO_COMBINE_PARTS.txt`
- `IMPROVEMENTS_SUMMARY.md`
- `photos/me1_bkup.jpg`
- `photos/me2_bkup.jpg`
- `photos/nav-brand2.png` (replaced by `.webp`)

**Why:** Clutter. Backup files belong in git history, not the working tree — the whole point of git is that you don't need `_bkup` suffixes.

**Before:** These files sat in the repo wasting bandwidth on every clone.

**Revert:** `git checkout 526e3e5 -- HOW_TO_COMBINE_PARTS.txt IMPROVEMENTS_SUMMARY.md photos/me1_bkup.jpg photos/me2_bkup.jpg photos/nav-brand2.png`

---

## 5. Contact Form Security (Cloudflare Worker)

### 5.1 Deployed Cloudflare Worker as form proxy

**What:** Created a Cloudflare Worker at `https://yashadake-form.yashadake91.workers.dev/` that:
- Accepts POST requests from the contact form
- Reads the secret Google Apps Script URL from an **encrypted environment variable** (`GOOGLE_SCRIPT_URL`)
- Forwards the payload to Google Apps Script
- Enforces CORS to only accept requests from `https://yashadake.com`

The source lives in [cloudflare-worker-api.js](cloudflare-worker-api.js) (reference copy — the live version on Cloudflare uses `env.GOOGLE_SCRIPT_URL` instead of hardcoding).

**Why:** Before this change, the raw Google Apps Script URL was hardcoded in [js/core.js](js/core.js) and visible to anyone who opened DevTools. That URL can be hit directly by spammers, bypassing the form entirely. The Worker hides it, enforces origin checks, and provides a place to add rate-limiting or Turnstile CAPTCHA later.

**Before:** `SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx.../exec'` — plaintext in the public JS bundle.

**After:** `SCRIPT_URL = 'https://yashadake-form.yashadake91.workers.dev/'` — Worker URL only; real endpoint is hidden behind an encrypted secret.

**Revert:**
1. Change [js/core.js](js/core.js) line 14 back to the direct Google Script URL:
   ```js
   const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxsmf3WbfwIp9PwrjvSdBMxPnJ7YqKw8xvJnz8gq7v8VWobzaU9zYqImiy2MSUFhpoJ/exec';
   ```
2. (Optional) Delete the Worker from Cloudflare dashboard → Workers & Pages → `yashadake-form` → Settings → Delete.

---

## 6. Cloudflare CDN + Proxy for Domain

### 6.1 Added `yashadake.com` to Cloudflare (Free plan)

**What:** Registered the domain on Cloudflare. All traffic to `yashadake.com` now flows:
```
Visitor → Cloudflare (proxy/CDN) → GitHub Pages
```

**Why:**
- **CDN caching** at 300+ global edge locations = faster load
- **DDoS protection** at the edge
- **Free SSL** managed by Cloudflare
- **Enables security headers** (see section 7) via Transform Rules — GitHub Pages alone cannot inject response headers

**Before:**
```
Visitor → Hostinger DNS → GitHub Pages
```
Direct traffic with no edge caching, no header injection capability.

**Revert:**
1. Go to Cloudflare dashboard → `yashadake.com` → bottom of Overview → **"Remove site from Cloudflare"**
2. Proceed to revert nameservers (next section)

---

### 6.2 Changed nameservers at Hostinger

**What:** At Hostinger (domain registrar), replaced the default nameservers with Cloudflare's:

| Before | After |
|--------|-------|
| `ns1.dns-parking.com` | `byron.ns.cloudflare.com` |
| `ns2.dns-parking.com` | `phoenix.ns.cloudflare.com` |

**Why:** Nameserver delegation transfers DNS authority to Cloudflare, which is what enables proxying and edge services.

**Before:** Hostinger was authoritative for DNS. DNS records (A, CNAME, TXT) were managed in Hostinger's DNS panel.

**Revert (full):**
1. Login to Hostinger → Domains → `yashadake.com` → DNS/Nameservers → **Change Nameservers**
2. Switch back to: `ns1.dns-parking.com`, `ns2.dns-parking.com` (or select "Use Hostinger nameservers")
3. Re-add DNS records manually in Hostinger panel:
   - `A @ 185.199.108.153`
   - `A @ 185.199.109.153`
   - `A @ 185.199.110.153`
   - `A @ 185.199.111.153`
   - `CNAME www yashadake.github.io`
   - `TXT @ google-site-verification=...` (check Cloudflare for exact value before switching)
4. Allow 24h for propagation.

---

### 6.3 Corrected `www` CNAME at Hostinger (pre-Cloudflare)

**What:** Before the Cloudflare migration, the `www` CNAME at Hostinger had the wrong name — it was `backup → yashadake.github.io` instead of `www → yashadake.github.io`. Corrected to `www`.

**Why:** GitHub Pages was flagging `www.yashadake.com` as improperly configured because the CNAME didn't exist. Visitors typing `www.yashadake.com` got errors.

**Before:** `CNAME backup yashadake.github.io` (unused, wrong name)

**After (pre-Cloudflare migration):** `CNAME www yashadake.github.io`

**Current state:** DNS is now managed in Cloudflare, where the CNAME was carried over correctly during the scan.

**Revert:** Not applicable — this was a bug fix. Do not re-introduce.

---

## 7. Security Headers

### 7.1 Deployed Cloudflare Transform Rule: "Security Headers"

**What:** Created a Cloudflare Rules → Transform Rules → **Response Header Transform Rule** that adds these 5 headers to **every HTTP response**:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `SAMEORIGIN` | Prevents clickjacking via iframe embedding |
| `X-Content-Type-Options` | `nosniff` | Stops browsers from guessing MIME types |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage to third parties |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Denies access to sensitive browser APIs |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter for older browsers |

**Why:** Security audit tools (Mozilla Observatory, Lighthouse, securityheaders.com) grade sites on these headers. Without them, the site scored D or F. Recruiters and security-conscious reviewers check portfolio security posture — missing headers signal carelessness.

**Before:** GitHub Pages served responses with no custom security headers.

**Revert:**
1. Cloudflare dashboard → `yashadake.com` → Rules → Overview
2. Find **"Security Headers"** rule → three-dot menu → **Delete**

---

## 8. HTTPS Enforcement

### 8.1 Enabled "Always Use HTTPS"

**What:** In Cloudflare → SSL/TLS → Edge Certificates, toggled **"Always Use HTTPS"** ON.

**Why:** Any visitor arriving via `http://yashadake.com` is now redirected to `https://` automatically. Prevents mixed-content warnings and ensures every page load is encrypted.

**Before:** HTTPS was available but not enforced. `http://` requests were served as-is.

**Revert:** Toggle OFF at Cloudflare → SSL/TLS → Edge Certificates → "Always Use HTTPS".

---

### 8.2 TLS 1.3 and Automatic HTTPS Rewrites

**What:** Confirmed TLS 1.3 and Automatic HTTPS Rewrites are enabled (default on Cloudflare Free).

**Why:** TLS 1.3 is faster and more secure than 1.2. Automatic HTTPS Rewrites fix any hardcoded `http://` asset URLs on the fly.

**Before:** Enabled by default; no action needed.

**Revert:** Toggle OFF in SSL/TLS → Edge Certificates (not recommended).

---

## 9. Google Search Console

### 9.1 Sitemap already submitted

**What:** Verified that `https://yashadake.com/sitemap.xml` is submitted to Google Search Console and showing **Success** status with 2 pages discovered.

**Why:** Accelerates Google indexing of the portfolio.

**Before:** Already configured on `Feb 11, 2026` — no change needed.

**Revert:** Search Console → Sitemaps → three-dot menu on the sitemap → **Remove**.

---

## 10. Certifications Section

### 10.1 Added Certifications carousel to About section

**What:** Added a horizontal scrolling carousel of 8 certificates inside [index.html](index.html) `#about` section:

| # | Title | Issuer | File |
|---|-------|--------|------|
| 1 | Claude AI Fundamentals | Anthropic | `photos/Claude101.webp` |
| 2 | Claude Code 101 | Anthropic | `photos/ClaudeCode101.webp` |
| 3 | Claude Code in Action | Anthropic | `photos/ClaudeCodeInAction.webp` |
| 4 | Career Essentials in Software Development | Microsoft & LinkedIn | `photos/certi-4.webp` |
| 5 | Full Stack Internship | IEEE Bombay Section | `photos/certi-1.webp` |
| 6 | Android Development Bootcamp | IITB TechFeast | `photos/certi-3.webp` |
| 7 | Networking Essentials | Cisco | `photos/certi-5.webp` |
| 8 | Industry Certificate | OneIT Solutions Pvt Ltd | `photos/certi-2.webp` |

**Features:**
- One-line horizontal row with `overflow-x: auto`
- ← → arrow buttons to scroll through
- "Let's View" overlay on hover
- Click opens a lightbox with the certificate enlarged
- ESC or backdrop click closes the lightbox

**Files modified:**
- [index.html](index.html) — carousel markup + lightbox modal inside `#about`
- [css/premium.css](css/premium.css) — `.certi-carousel-wrap`, `.certi-card`, `.certi-lightbox` styles (~170 lines appended)
- [js/core.js](js/core.js) — carousel arrow scroll + lightbox open/close logic (~50 lines appended)

**Why:** Certifications are a fast, scannable way to signal skill coverage and credibility. Anthropic Claude certifications in particular are a differentiator right now (AI skills in demand).

**Before:** No certifications section existed. Certificate image files sat in `photos/` unused.

**Revert:**
```bash
git checkout f26db9d -- index.html css/premium.css js/core.js
git commit -m "revert: remove certifications section"
git push
```

Or manually remove:
- The `<h3>Certifications</h3>` block and `.certi-carousel-wrap` + `.certi-lightbox` markup in `index.html`
- The "Certifications Carousel" CSS block in `premium.css`
- The "Certificate Carousel + Lightbox" IIFE in `core.js`

---

## Quick Reference: Credentials & URLs

| Resource | Value |
|----------|-------|
| GitHub repo | `YashAdake/Yash-Adake_Portfolio` |
| Active branch | `V2.0.0.0` |
| Cloudflare Worker URL | `https://yashadake-form.yashadake91.workers.dev/` |
| Cloudflare Worker secret | `GOOGLE_SCRIPT_URL` (encrypted, points to Google Apps Script) |
| Cloudflare nameservers | `byron.ns.cloudflare.com`, `phoenix.ns.cloudflare.com` |
| Cloudflare Zone ID | `3df63204c2a793486b6438fdb2024464` |
| Cloudflare Account ID | `95d13f35fd254866435d8e862c2affa1` |
| Domain registrar | Hostinger |
| Hosting | GitHub Pages (branch `V2.0.0.0`) |
| Search Console | `search.google.com/search-console` → property `yashadake.com` |

**Pre-change baseline commit:** `526e3e5` (tagged `V4.2`)
**Full rollback reference:** `git checkout 526e3e5` restores the entire codebase to pre-V2.0.0.0 state.

---

## Full Rollback Procedure

To revert **everything** to the state before V2.0.0.0:

### Step 1 — Code
```bash
git checkout main
git branch -D V2.0.0.0     # only if you want to delete the branch entirely
# or to keep V2.0.0.0 but switch hosting branch, update GitHub Pages settings
```

### Step 2 — Nameservers
Hostinger → Domains → `yashadake.com` → DNS/Nameservers:
- Switch to "Use Hostinger nameservers"
- Re-add the 4 GitHub A records and the `www` CNAME (see section 6.2)

### Step 3 — Cloudflare (optional)
- Delete the domain from Cloudflare dashboard
- Delete the `yashadake-form` Worker

### Step 4 — Restore direct Google Script URL
In [js/core.js](js/core.js), revert `SCRIPT_URL` to the Google Apps Script URL.

### Step 5 — GitHub Pages deployment branch
GitHub repo → Settings → Pages → Source → select `main` (or whatever branch you want live).

---

**Document version:** 1.0
**Last updated:** April 2026
**Author:** Yash Adake (with Claude Code assist)
