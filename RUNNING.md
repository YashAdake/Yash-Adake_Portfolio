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
- **Visitor counter** hides itself when the count service is unreachable.
- **Contact form** won't actually send.

Also: **project card screenshots** show a gradient + logotype fallback unless the
image files exist in `photos/projects/` (`myjson.webp`, `optiresume.webp`,
`airdraw.gif`).

---

## Deploy (GitHub Pages)

**Branch workflow.** `prod` is the release branch and the only one Pages deploys.
1. `git checkout prod && git checkout -b feat/<name>`: every change starts here.
2. Commit, then `git checkout prod && git merge --no-ff feat/<name>`.
3. `git push origin prod`. Live about 1-2 minutes later.

One-time setting: GitHub repo → **Settings → Pages** → Source **Deploy from a branch**,
branch **`prod`**, folder **`/ (root)`**. The `CNAME` file (yashadake.com) is committed
in the branch, so the custom domain carries over.

Request path: **Visitor → Cloudflare (CDN/SSL/headers) → GitHub Pages.**
Rollback: switch the Pages branch back to `V3.0.0.0` (the pre-`prod` state), or revert the merge on `prod`.
