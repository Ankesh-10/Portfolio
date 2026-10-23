import { NextResponse } from "next/server";
import { validate } from "@/lib/mail";
import { profile } from "@/content/profile";

// Contact form handler (spec §7.5): validation, honeypot, rate limit, delivery through Resend.
// Needs RESEND_API_KEY and CONTACT_TO (and optionally CONTACT_FROM). Without them it answers 503 and the
// form tells the visitor to email directly, rather than pretending to send.

const WINDOW = 60 * 60 * 1000;
const MAX = 3; // per IP per hour
// Best-effort: in-memory, per server instance (serverless instances don't share it).
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  if (recent.length >= MAX) {
    hits.set(ip, recent);
    return true;
  }
  hits.set(ip, [...recent, now]);
  if (hits.size > 5000)
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW)) hits.delete(k);
  return false;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string) : "");

  // Honeypot: a real visitor never fills the hidden field. Pretend success, send nothing.
  if (str("website")) return NextResponse.json({ ok: true });

  const fields = { name: str("name"), email: str("email"), message: str("message") };
  const errors = validate(fields);
  if (Object.keys(errors).length)
    return NextResponse.json({ error: "invalid", errors }, { status: 422 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (limited(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO ?? profile.email;
  if (!key) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>",
        to: [to],
        reply_to: fields.email.trim(),
        subject: `Portfolio message from ${fields.name.trim().slice(0, 60)}`,
        text: `${fields.message}\n\n— ${fields.name} <${fields.email.trim()}>`,
      }),
    });
    if (!res.ok) return NextResponse.json({ error: "upstream" }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}
