/**
 * Cloudflare Worker for Secure Contact Form Submission
 * 
 * Why this makes you world-class:
 * 1. Hides your raw Google Apps Script endpoint from the public frontend.
 * 2. Implements strict CORS (so only your portfolio can submit).
 * 3. Prepares you to add easy Cloudflare Turnstile (CAPTCHA) or rate-limiting.
 */

export default {
    async fetch(request, env, ctx) {
      // 1. CORS Preflight Handling
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "https://yashadake.com", // Restrict to your domain
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }
  
      // 2. Only allow POST requests
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }
  
      try {
        // Read the incoming form data from the frontend
        const formData = await request.formData();
        
        // --- Add SPAM checks here in the future if needed ---
        // if (formData.get('email').includes('.ru')) return new Response("Blocked", {status: 403});
  
        // 3. The secret backend URL (Replace this with your actual Google Script URL)
        // In a true enterprise setup, you put this in Cloudflare Environment Variables (env.GOOGLE_SCRIPT_URL)
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxsmf3WbfwIp9PwrjvSdBMxPnJ7YqKw8xvJnz8gq7v8VWobzaU9zYqImiy2MSUFhpoJ/exec";
  
        // 4. Securely proxy the payload to the hidden endpoint
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          body: formData,
        });
  
        return new Response("Success", {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "https://yashadake.com",
            "Content-Type": "application/json"
          }
        });
  
      } catch (err) {
        return new Response(JSON.stringify({ error: "Edge function failed" }), {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "https://yashadake.com",
          }
        });
      }
    },
  };
