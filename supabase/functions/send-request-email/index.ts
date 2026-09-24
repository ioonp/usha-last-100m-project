// Edge Function: send-request-email
//
// Handles public request-form submissions from the landing page. It validates
// the payload, drops bot submissions (filled honeypot), inserts a row into
// guide_requests using the service-role key (so the table can deny all direct
// client access via RLS), and emails the notify address via Resend with a
// Google Maps link and reply-to set to the submitter.
//
// Secrets (set in the Edge Function environment, never in client code):
//   RESEND_API_KEY, NOTIFY_EMAIL, RESEND_FROM
// Auto-provided by the platform: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== "object") return json({ error: "Invalid payload" }, 400);

    const {
      formType = "video_guide",
      name = "",
      email = "",
      venue_name = "",
      address = "",
      note = "",
      honeypot = "",
    } = payload as Record<string, unknown>;

    // Bot trap: a filled honeypot is silently accepted so the bot sees success
    // but nothing is stored or emailed.
    if (typeof honeypot === "string" && honeypot.trim() !== "") return json({ ok: true });

    const clean = {
      formType: String(formType).trim() || "video_guide",
      name: String(name).trim(),
      email: String(email).trim(),
      venue_name: String(venue_name).trim(),
      address: String(address).trim(),
      note: String(note ?? "").trim(),
    };

    const invalid: string[] = [];
    if (!clean.name) invalid.push("name");
    if (!EMAIL_RE.test(clean.email)) invalid.push("email");
    if (!clean.venue_name) invalid.push("venue_name");
    if (!clean.address) invalid.push("address");
    if (invalid.length) return json({ error: "Invalid submission", fields: invalid }, 400);

    // Insert with the service role — the table's RLS denies direct client writes.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { error: insertErr } = await supabase.from("guide_requests").insert({
      form_type: clean.formType,
      name: clean.name,
      email: clean.email,
      venue_name: clean.venue_name,
      address: clean.address,
      note: clean.note || null,
    });
    if (insertErr) {
      console.error("insert failed", insertErr);
      return json({ error: "Could not save request" }, 500);
    }

    // Notify via Resend.
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notify = Deno.env.get("NOTIFY_EMAIL");
    const from = Deno.env.get("RESEND_FROM");
    if (!resendKey || !notify || !from) {
      console.error("missing email secrets");
      return json({ error: "Email not configured" }, 500);
    }

    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clean.address)}`;
    const subject = `New video guide request: ${clean.venue_name}`;
    const text =
      `Form: ${clean.formType}\n` +
      `Name: ${clean.name}\n` +
      `Email: ${clean.email}\n` +
      `Venue: ${clean.venue_name}\n` +
      `Address: ${clean.address}\n` +
      `Map: ${mapsLink}\n` +
      `Note: ${clean.note || "—"}\n`;
    const html =
      `<h2>New video guide request</h2>` +
      `<p><strong>Venue:</strong> ${esc(clean.venue_name)}</p>` +
      `<p><strong>Name:</strong> ${esc(clean.name)}</p>` +
      `<p><strong>Email:</strong> <a href="mailto:${esc(clean.email)}">${esc(clean.email)}</a></p>` +
      `<p><strong>Address:</strong> ${esc(clean.address)}<br>` +
      `<a href="${esc(mapsLink)}">Open in Google Maps</a></p>` +
      `<p><strong>Note:</strong> ${esc(clean.note) || "—"}</p>` +
      `<p style="color:#7A7268">Form: ${esc(clean.formType)}</p>`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [notify], reply_to: clean.email, subject, text, html }),
    });
    if (!emailRes.ok) {
      console.error("resend failed", emailRes.status, await emailRes.text());
      return json({ error: "Could not send notification" }, 502);
    }

    return json({ ok: true });
  } catch (e) {
    console.error("unhandled error", e);
    return json({ error: "Server error" }, 500);
  }
});
