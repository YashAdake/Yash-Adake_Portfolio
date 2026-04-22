/**
 * Cloudflare Worker — Secure Edge API for Portfolio
 * 
 * Handles two responsibilities:
 * 1. POST  → Contact form submissions (proxied to Google Apps Script)
 * 2. GET   → Universal visitor counter (read + increment from Google Apps Script)
 * 
 * Security:
 * - Strict CORS: only yashadake.com can call these endpoints
 * - Google Apps Script URL is hidden from the public frontend
 * - Ready for Cloudflare Turnstile (CAPTCHA) or rate-limiting additions
 */

export default {
    async fetch(request, env, ctx) {
        const ALLOWED_ORIGIN = "https://yashadake.com";
        const corsHeaders = {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        // ── CORS Preflight ─────────────────────────────
        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        // The secret backend URL (hidden from the browser)
        // In production, move to env.GOOGLE_SCRIPT_URL for extra safety
        const GOOGLE_SCRIPT_URL =
            "https://script.google.com/macros/s/AKfycbxsmf3WbfwIp9PwrjvSdBMxPnJ7YqKw8xvJnz8gq7v8VWobzaU9zYqImiy2MSUFhpoJ/exec";

        // ── GET — Visitor Counter ──────────────────────
        if (request.method === "GET") {
            try {
                const url = new URL(request.url);
                const action = url.searchParams.get("action");

                if (action === "count" || action === "getCount") {
                    // Proxy to Google Apps Script; follow its 302 redirect
                    const gasResponse = await fetch(
                        `${GOOGLE_SCRIPT_URL}?action=${action}`,
                        { method: "GET", redirect: "follow" }
                    );
                    const body = await gasResponse.text();

                    return new Response(body, {
                        status: 200,
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                            "Cache-Control": "no-store", // always fresh count
                        },
                    });
                }

                return new Response(
                    JSON.stringify({ success: false, error: "Invalid action parameter" }),
                    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            } catch (err) {
                return new Response(
                    JSON.stringify({ success: false, error: "Counter service unavailable" }),
                    { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }
        }

        // ── POST — Contact Form ────────────────────────
        if (request.method === "POST") {
            try {
                const formData = await request.formData();

                // --- Add SPAM checks here in the future if needed ---
                // if (formData.get('email').includes('.ru')) return new Response("Blocked", {status: 403});

                await fetch(GOOGLE_SCRIPT_URL, {
                    method: "POST",
                    body: formData,
                });

                return new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            } catch (err) {
                return new Response(
                    JSON.stringify({ success: false, error: "Edge function failed" }),
                    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }
        }

        // ── Anything else ──────────────────────────────
        return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    },
};
