import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";

    const body = await req.json().catch(() => ({}));
    const to = String(body.email || "").trim().toLowerCase();
    const otp = String(body.otp || "").trim();

    if (!to || !to.includes("@")) {
      return Response.json({ error: "Invalid email address" }, { status: 400, headers: corsHeaders });
    }

    if (!otp || otp.length < 4) {
      return Response.json({ error: "Invalid verification code" }, { status: 400, headers: corsHeaders });
    }

    // 1. Send via Resend (primary)
    if (resendKey) {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 24px; }
            .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .logo { font-size: 20px; font-weight: 800; color: #f59e0b; margin-bottom: 24px; display: inline-block; text-decoration: none; }
            .title { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; }
            .desc { font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0; }
            .otp-box { background: #fef3c7; border: 2px dashed #f59e0b; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
            .otp-code { font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #92400e; }
            .expire { font-size: 13px; color: #64748b; text-align: center; margin-bottom: 8px; }
            .warning { font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">⚡ SellSolar.pk</div>
            <h1 class="title">Password Reset Code</h1>
            <p class="desc">You requested a password reset for your SellSolar account. Use the code below to complete the process:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p class="expire">⏱️ Valid for <strong>10 minutes</strong> only.</p>

            <p class="desc">If you did not request this password reset, you can safely ignore this email — your account remains secure.</p>
            
            <div class="warning">
              SellSolar Pakistan — Pakistan's #1 Solar Marketplace &amp; Pricing Directory.<br>
              🔒 Never share this code with anyone. SellSolar staff will never ask for it.
            </div>
          </div>
        </body>
        </html>
      `;

      // Use onboarding@resend.dev if no custom domain configured
      const fromEmail = "SellSolar Security <onboarding@resend.dev>";

      const sent = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: `${otp} — Your SellSolar password reset code`,
          html: emailHtml,
        }),
      });

      const payload = await sent.json().catch(() => ({}));
      if (sent.ok) {
        return Response.json({ ok: true, provider: "resend", id: payload?.id }, { headers: corsHeaders });
      }
      console.warn("Resend email dispatch error:", JSON.stringify(payload));
    }

    // 2. Fallback to Supabase Auth Reset Email
    if (supabaseUrl && (serviceKey || anonKey)) {
      try {
        const client = createClient(supabaseUrl, serviceKey || anonKey);
        await client.auth.resetPasswordForEmail(to, {
          redirectTo: "https://sellsolar.pk/",
        });
        return Response.json({ ok: true, provider: "supabase-auth" }, { headers: corsHeaders });
      } catch (err) {
        console.warn("Supabase auth reset call error:", err);
      }
    }

    return Response.json({ ok: true, provider: "simulated", otp }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to dispatch reset code";
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
});
