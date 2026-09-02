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
    const fullName = String(body.fullName || body.full_name || "Valued Customer").trim();
    const city = String(body.city || "Not specified").trim();
    const address = String(body.address || "Not specified").trim();
    const contactPhone = String(body.contactPhone || body.contact_phone || "Not specified").trim();
    const systemSize = String(body.systemSize || body.system_size || "Standard / Complete System").trim();
    const notes = String(body.notes || "").trim();
    const dateStr = new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" });

    // Collect all admin emails from database if available
    const adminEmails = new Set<string>();
    adminEmails.add(configuredAdminEmail);
    adminEmails.add(DEFAULT_ADMIN_EMAIL);

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

    // Email HTML Template
    const emailSubject = `⚡ New Complete Solar Installation Request: ${fullName} (${city})`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Installation Request</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .card { background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 24px; color: #ffffff; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
          .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-top: 8px; }
          .content { padding: 24px; }
          .info-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          .info-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .info-table td.label { font-weight: 600; color: #64748b; width: 35%; background: #f8fafc; }
          .info-table td.value { font-weight: 500; color: #0f172a; }
          .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          .btn-call { display: inline-block; background: #22c55e; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>⚡ New Complete Installation Request</h1>
            <div class="badge">SellSolar.pk Lead Alert</div>
          </div>
          <div class="content">
            <p>A customer has submitted a new turnkey solar installation request. Details are below:</p>
            <table class="info-table">
              <tr>
                <td class="label">Customer Name</td>
                <td class="value"><strong>${fullName}</strong></td>
              </tr>
              <tr>
                <td class="label">City</td>
                <td class="value"><span style="color: #d97706; font-weight: 700;">${city}</span></td>
              </tr>
              <tr>
                <td class="label">Contact Phone</td>
                <td class="value">
                  <a href="tel:${contactPhone}" style="color: #2563eb; text-decoration: none; font-weight: 700;">${contactPhone}</a>
                </td>
              </tr>
              <tr>
                <td class="label">Address</td>
                <td class="value">${address}</td>
              </tr>
              <tr>
                <td class="label">System Requirement</td>
                <td class="value">${systemSize}</td>
              </tr>
              ${notes ? `<tr><td class="label">Additional Notes</td><td class="value">${notes}</td></tr>` : ""}
              <tr>
                <td class="label">Submitted At</td>
                <td class="value">${dateStr} (PKT)</td>
              </tr>
            </table>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="tel:${contactPhone}" class="btn-call">📞 Call Customer Now</a>
              <a href="https://wa.me/${contactPhone.replace(/^0/, '92').replace(/[^0-9]/g, '')}" style="display: inline-block; background: #25d366; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-top: 16px; margin-left: 8px;">💬 Open WhatsApp</a>
            </div>
          </div>
          <div class="footer">
            SellSolar Marketplace — Admin Notification Engine<br>
            Sent automatically when a customer requests complete turnkey installation.
          </div>
        </div>
      </body>
      </html>
    `;

    let sentProvider = "none";

    // 1. If Resend API Key is set, send rich HTML email
    if (resendKey) {
      try {
        const sent = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "SellSolar Installation <installations@resend.dev>",
            to: recipients,
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

    // 2. Also log and store notification in notifications table for all admins if present
    if (supabaseUrl && serviceKey) {
      try {
        const client = createClient(supabaseUrl, serviceKey);
        const { data: adminUsers } = await client
          .from("profiles")
          .select("id")
          .eq("is_admin", true);

        if (adminUsers && adminUsers.length > 0) {
          const notifs = adminUsers.map((u) => ({
            user_id: u.id,
            title: `New Installation Request: ${fullName} (${city})`,
            message: `Contact: ${contactPhone}. Address: ${address}. Size: ${systemSize}`,
            is_read: false,
          }));
          await client.from("notifications").insert(notifs);
        }
      } catch (err) {
        console.warn("Error inserting notifications into db:", err);
      }
    }

    return Response.json(
      {
        ok: true,
        message: "Admin notified successfully",
        recipients,
        provider: sentProvider,
        timestamp: new Date().toISOString(),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to notify admin";
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
});
