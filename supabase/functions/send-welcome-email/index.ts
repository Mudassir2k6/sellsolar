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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    const body = await req.json().catch(() => ({}));
    const to = String(body.email || user.email).trim().toLowerCase();
    const fullName = String(body.fullName || user.user_metadata?.full_name || "").trim();
    if (to !== user.email.toLowerCase()) {
      return Response.json({ error: "Email mismatch" }, { status: 403, headers: corsHeaders });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const greeting = fullName ? `Hi ${fullName},` : "Hi,";
      const sent = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SellSolar <onboarding@resend.dev>",
          to: [to],
          subject: "Welcome to SellSolar",
          html: `<p>${greeting}</p><p>Your SellSolar account was created successfully.</p><p>You can now post ads, browse listings, and manage your profile.</p><p>— SellSolar</p>`,
        }),
      });
      const payload = await sent.json();
      if (!sent.ok) {
        throw new Error(payload?.message || "Failed to send email");
      }
      return Response.json({ ok: true, provider: "resend" }, { headers: corsHeaders });
    }

    const mailHeaders = {
      apikey: serviceKey || anonKey,
      Authorization: `Bearer ${serviceKey || anonKey}`,
      "Content-Type": "application/json",
    };

    let mailRes = await fetch(`${supabaseUrl}/auth/v1/resend`, {
      method: "POST",
      headers: mailHeaders,
      body: JSON.stringify({ type: "signup", email: to }),
    });
    if (!mailRes.ok) {
      mailRes = await fetch(`${supabaseUrl}/auth/v1/otp`, {
        method: "POST",
        headers: mailHeaders,
        body: JSON.stringify({
          email: to,
          create_user: false,
        }),
      });
    }
    if (!mailRes.ok) {
      const payload = await mailRes.json().catch(() => ({}));
      throw new Error(payload?.msg || payload?.message || "Failed to send notification email");
    }

    return Response.json({ ok: true, provider: "supabase" }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
});
