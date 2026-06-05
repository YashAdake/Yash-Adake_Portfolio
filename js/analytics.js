// ============================================
// ANALYTICS — GA4 + Microsoft Clarity
// ============================================
// Detailed visitor analytics for the portfolio:
//   - GA4   → traffic sources, geo, device, engagement + custom events
//   - Clarity → session recordings + heatmaps (watch real visitors)
//
// SETUP (one-time): paste your two IDs below. Until then, nothing loads.
//   1. GA4: analytics.google.com → Admin → Data Streams → Web → copy the
//      "Measurement ID" (looks like G-XXXXXXXXXX).
//   2. Clarity: clarity.microsoft.com → new project → copy the Project ID
//      (a short alphanumeric string like "abcd1234ef").
//
// Privacy: GA4 uses cookies, so we gate it behind a small consent banner.
// Clarity is loaded alongside it once the visitor accepts. Decline = nothing
// loads and we remember the choice.
// ============================================

const ANALYTICS = {
  GA4_ID: 'G-XXXXXXXXXX',        // ← paste your GA4 Measurement ID
  CLARITY_ID: 'XXXXXXXXXX',      // ← paste your Clarity Project ID
};

const CONSENT_KEY = 'analytics_consent'; // 'granted' | 'denied'

(function analytics() {
  const ga4Ready = ANALYTICS.GA4_ID && !ANALYTICS.GA4_ID.includes('XXXX');
  const clarityReady = ANALYTICS.CLARITY_ID && !ANALYTICS.CLARITY_ID.includes('XXXX');
  if (!ga4Ready && !clarityReady) return; // nothing configured yet

  const consent = localStorage.getItem(CONSENT_KEY);

  if (consent === 'granted') {
    loadTrackers();
  } else if (consent !== 'denied') {
    showConsentBanner();
  }

  // ---- Loaders ----------------------------------------------------------
  function loadTrackers() {
    if (ga4Ready) loadGA4();
    if (clarityReady) loadClarity();
    wireEvents();
  }

  function loadGA4() {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.GA4_ID}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS.GA4_ID, { anonymize_ip: true });
  }

  function loadClarity() {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', ANALYTICS.CLARITY_ID);
  }

  // ---- Custom event tracking -------------------------------------------
  // Fires GA4 events on the actions that matter for a portfolio, so you can
  // see not just "who visited" but "what they did" (résumé downloads, which
  // projects they clicked, contact submits, command-palette use).
  function track(name, params) {
    if (window.gtag) window.gtag('event', name, params || {});
  }

  function wireEvents() {
    // Résumé downloads (hero + about section)
    document.querySelectorAll('a[href$="Resume.pdf"]').forEach((el) => {
      el.addEventListener('click', () => track('resume_download', { location: 'portfolio' }));
    });

    // Project / work card clicks — capture which product and whether live
    document.querySelectorAll('.work-card').forEach((el) => {
      el.addEventListener('click', () => {
        const title = el.querySelector('.work-title')?.textContent?.trim() || 'unknown';
        const href = el.getAttribute('href') || '';
        track('project_click', { project: title, href });
      });
    });

    // Contact form submit
    const form = document.forms['submit-to-google-sheet'];
    if (form) form.addEventListener('submit', () => track('contact_submit'));

    // Social link clicks
    document.querySelectorAll('a[href*="linkedin.com"], a[href*="github.com"], a[href*="wa.me"]').forEach((el) => {
      el.addEventListener('click', () => {
        const href = el.getAttribute('href') || '';
        const net = href.includes('linkedin') ? 'linkedin' : href.includes('github') ? 'github' : 'whatsapp';
        track('social_click', { network: net });
      });
    });

    // Command palette opened (Cmd/Ctrl+K) — signals an engaged power user
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') track('command_palette_open');
    });
  }

  // ---- Consent banner ---------------------------------------------------
  function showConsentBanner() {
    const bar = document.createElement('div');
    bar.className = 'consent-banner';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookie consent');
    bar.innerHTML = `
      <span class="consent-text">
        This site uses analytics (Google Analytics &amp; Microsoft Clarity) to understand
        how visitors use it. No data is sold. You can decline.
      </span>
      <span class="consent-actions">
        <button class="consent-btn consent-decline" type="button">Decline</button>
        <button class="consent-btn consent-accept" type="button">Accept</button>
      </span>`;
    document.body.appendChild(bar);
    requestAnimationFrame(() => bar.classList.add('visible'));

    bar.querySelector('.consent-accept').addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'granted');
      bar.remove();
      loadTrackers();
    });
    bar.querySelector('.consent-decline').addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'denied');
      bar.remove();
    });
  }
})();
