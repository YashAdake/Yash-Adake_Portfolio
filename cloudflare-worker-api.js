/**
 * Cloudflare Worker — Secure Edge API for Portfolio
 *
 * Handles two responsibilities:
 * 1. POST  → Contact form submissions (proxied to Google Apps Script)
 * 2. GET   → Universal visitor counter (read + increment from Google Apps Script)
 *
 * Security:
 * - Strict CORS: the request Origin is *validated* against an allowlist and
 *   only an allowed origin is echoed back (no blind wildcard).
 * - Google Apps Script URL is read from env.GOOGLE_SCRIPT_URL (secret). There
 *   is intentionally NO hardcoded fallback — if the var is unset the Worker
 *   returns a 500 instead of leaking/depending on a baked-in deployment URL.
 * - Server-side field validation — the frontend checks are advisory only; the
 *   Worker re-validates so direct POSTs can't push junk to the backend.
 * - The upstream Apps Script response is awaited and checked; the Worker only
 *   reports success when the backend actually accepted the submission.
 * - Turnstile-ready: drop the token check in where marked.
 */

const ALLOWED_ORIGINS = new Set([
  "https://yashadake.com",
  "https://www.yashadake.com",
]);

// NOTE: The Google Apps Script URL MUST be provided as a Worker secret/env var:
//   wrangler secret put GOOGLE_SCRIPT_URL   (or set it in the dashboard)
// There is no hardcoded fallback — requests fail with a 500 if it is missing.

/** Build CORS headers for a given request origin (only echoes allowed ones). */
function corsHeadersFor(origin) {
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(body, status, cors) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Server-side validation mirroring the frontend rules. Returns an error string
 * or null if the submission is acceptable. Caps lengths to keep abusive
 * payloads from reaching the Apps Script / auto-reply.
 */
function validateContact(form) {
  const name = (form.get("name") || "").toString().trim();
  const email = (form.get("email") || "").toString().trim();
  const subject = (form.get("subject") || "").toString().trim();
  const message = (form.get("message") || "").toString().trim();

  if (name.length < 2 || name.length > 100) return "Invalid name.";
  if (!EMAIL_RE.test(email) || email.length > 254) return "Invalid email.";
  if (subject.length < 3 || subject.length > 200) return "Invalid subject.";
  if (message.length < 10 || message.length > 5000) return "Invalid message.";
  return null;
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin");
    const cors = corsHeadersFor(origin);
    const GOOGLE_SCRIPT_URL = env.GOOGLE_SCRIPT_URL;

    // ── CORS Preflight ─────────────────────────────
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    // ── GET — Visitor Counter ──────────────────────
    if (request.method === "GET") {
      if (!GOOGLE_SCRIPT_URL) {
        return json({ success: false, error: "backend not configured" }, 500, cors);
      }
      try {
        const url = new URL(request.url);
        const action = url.searchParams.get("action");

        if (action === "count" || action === "getCount") {
          const gasResponse = await fetch(
            `${GOOGLE_SCRIPT_URL}?action=${encodeURIComponent(action)}`,
            { method: "GET", redirect: "follow" }
          );
          const body = await gasResponse.text();
          return new Response(body, {
            status: 200,
            headers: {
              ...cors,
              "Content-Type": "application/json",
              "Cache-Control": "no-store", // always fresh count
            },
          });
        }

        return json({ success: false, error: "Invalid action parameter" }, 400, cors);
      } catch (err) {
        return json({ success: false, error: "Counter service unavailable" }, 502, cors);
      }
    }

    // ── POST — Contact Form ────────────────────────
    if (request.method === "POST") {
      // Reject cross-origin POSTs at the server (defense in depth — the browser
      // already blocks them, but a direct POST has no Origin restriction).
      if (!origin || !ALLOWED_ORIGINS.has(origin)) {
        return json({ success: false, error: "Forbidden origin" }, 403, cors);
      }

      if (!GOOGLE_SCRIPT_URL) {
        return json({ success: false, error: "backend not configured" }, 500, cors);
      }

      try {
        const formData = await request.formData();

        // --- Turnstile (CAPTCHA) hook — uncomment once a widget is added ----
        // const token = formData.get("cf-turnstile-response");
        // const ip = request.headers.get("CF-Connecting-IP");
        // const verify = await fetch(
        //   "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        //   { method: "POST", body: new URLSearchParams({
        //       secret: env.TURNSTILE_SECRET, response: token || "", remoteip: ip || "" }) }
        // ).then((r) => r.json());
        // if (!verify.success) return json({ success: false, error: "Failed challenge" }, 403, cors);

        // Server-side validation — the frontend checks are easily bypassed.
        const invalid = validateContact(formData);
        if (invalid) {
          return json({ success: false, error: invalid }, 400, cors);
        }

        // Await the upstream and only report success if it actually accepted.
        const gasResponse = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          body: formData,
        });
        if (!gasResponse.ok) {
          return json({ success: false, error: "Message could not be delivered" }, 502, cors);
        }

        return json({ success: true }, 200, cors);
      } catch (err) {
        return json({ success: false, error: "Edge function failed" }, 500, cors);
      }
    }

    // ── Anything else ──────────────────────────────
    return new Response("Method not allowed", { status: 405, headers: cors });
  },
};
