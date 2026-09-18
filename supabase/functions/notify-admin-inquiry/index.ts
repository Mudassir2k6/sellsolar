import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_ADMIN_EMAIL = "mudassir2k6@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
    const configuredAdminEmail = Deno.env.get("ADMIN_EMAIL") ?? DEFAULT_ADMIN_EMAIL;

    const body = await req.json().catch(() => ({}));
    const senderName = String(body.name || body.senderName || "Website Visitor").trim();
    const senderEmail = String(body.email || body.senderEmail || "No email provided").trim();
    const senderPhone = String(body.phone || body.senderPhone || "Not provided").trim();
    const subject = String(body.subject || "New Customer Message via SellSolar").trim();
    const message = String(body.message || "").trim();
    const recipientEmail = String(body.recipientEmail || "info@sellsolar.pk").trim();
    const ticketNumber = String(body.ticketNumber || `SLR-${Math.floor(100000 + Math.random() * 900000)}`).trim();
    const dateStr = new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" });

    // Target notification recipients
    const adminEmails = new Set<string>();
    adminEmails.add(configuredAdminEmail);
    adminEmails.add(DEFAULT_ADMIN_EMAIL);
    if (recipientEmail && recipientEmail.includes("@")) {
      adminEmails.add(recipientEmail.toLowerCase());
    }

    // Try finding registered admin emails
    if (supabaseUrl && (serviceKey || anonKey)) {
      try {
        const client = createClient(supabaseUrl, serviceKey || anonKey);
        const { data: adminProfiles } = await client
          .from("profiles")
          .select("email")
          .eq("is_admin", true);

        if (adminProfiles && Array.isArray(adminProfiles)) {
          adminProfiles.forEach((p) => {
            if (p.email && typeof p.email === "string" && p.email.includes("@")) {
              adminEmails.add(p.email.trim().toLowerCase());
            }
          });
        }
      } catch (err) {
        console.warn("Could not query admin profiles:", err);
      }
    }

    const recipients = Array.from(adminEmails);

    const emailSubject = `📩 [${ticketNumber}] New message for ${recipientEmail}: ${senderName}`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Message</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .card { background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: linear-gradient(135deg, #0284c7, #0369a1); padding: 24px; color: #ffffff; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
          .badge { display: inline-block; background: rgba(255,255,255,0.25); padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-top: 8px; }
          .content { padding: 24px; }
          .msg-box { background: #f1f5f9; border-left: 4px solid #0284c7; padding: 16px; border-radius: 6px; margin: 18px 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
          .info-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          .info-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
          .info-table td.label { font-weight: 600; color: #64748b; width: 32%; background: #f8fafc; }
          .info-table td.value { font-weight: 500; color: #0f172a; }
          .actions { text-align: center; margin: 24px 0 8px 0; }
          .btn-reply { display: inline-block; background: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-right: 8px; }
          .btn-wa { display: inline-block; background: #25d366; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; }
          .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>📩 New Customer Contact Message</h1>
            <div class="badge">Ticket: ${ticketNumber} &bull; Target: ${recipientEmail}</div>
          </div>
          <div class="content">
            <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0;">A visitor has submitted an inquiry through the SellSolar contact form:</p>
            
            <div class="msg-box">
              <strong>Message:</strong><br>
              ${message || "(No message text provided)"}
            </div>

            <table class="info-table">
              <tr>
                <td class="label">Sender Name</td>
                <td class="value"><strong>${senderName}</strong></td>
              </tr>
              <tr>
                <td class="label">Sender Email</td>
                <td class="value">
                  <a href="mailto:${senderEmail}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${senderEmail}</a>
                </td>
              </tr>
              <tr>
                <td class="label">Contact Phone</td>
                <td class="value">
                  ${senderPhone !== "Not provided" ? `<a href="tel:${senderPhone}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${senderPhone}</a>` : "Not provided"}
                </td>
              </tr>
              <tr>
                <td class="label">Subject</td>
                <td class="value">${subject}</td>
              </tr>
              <tr>
                <td class="label">Date & Time</td>
                <td class="value">${dateStr} (PKT)</td>
              </tr>
            </table>

            <div class="actions">
              ${senderEmail.includes("@") ? `<a href="mailto:${senderEmail}?subject=Re: [${ticketNumber}] ${encodeURIComponent(subject)}" class="btn-reply">✉️ Reply via Email</a>` : ""}
              ${senderPhone && senderPhone !== "Not provided" ? `<a href="https://wa.me/${senderPhone.replace(/^0/, "92").replace(/[^0-9]/g, "")}" class="btn-wa">💬 Open WhatsApp</a>` : ""}
            </div>
          </div>
          <div class="footer">
            SellSolar Pakistan &bull; Unified Inbox Gateway<br>
            You can also view and reply to this inquiry in the SellSolar Admin Dashboard.
          </div>
        </div>
      </body>
      </html>
    `;

    let sentProvider = "none";
    if (resendKey) {
      try {
        const sent = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "SellSolar Messages <messages@resend.dev>",
            to: recipients,
            reply_to: senderEmail.includes("@") ? senderEmail : undefined,
            subject: emailSubject,
            html: emailHtml,
          }),
        });
        if (sent.ok) {
          sentProvider = "resend";
        }
      } catch (e) {
        console.warn("Resend email failed:", e);
      }
    }

    return Response.json({ ok: true, provider: sentProvider, ticketNumber }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process message notification";
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
});
