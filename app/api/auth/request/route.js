import { NextResponse } from "next/server";
import { generateCode, createChallenge, cookieOpts, rateLimit, CODE_TTL_MIN } from "@/lib/auth";
import { sendLoginCode } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req) {
  const { email: raw } = await req.json().catch(() => ({}));
  const email = String(raw || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254)
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  if (!(await rateLimit(`req:${email}`, 3, 10 * 60_000)) || !(await rateLimit(`reqip:${ip}`, 10, 10 * 60_000)))
    return NextResponse.json({ error: "Too many requests. Try again in a few minutes." }, { status: 429 });

  const code = generateCode();
  try {
    await sendLoginCode(email, code);
  } catch (e) {
    console.error("Email send failed:", e);
    return NextResponse.json({ error: "Could not send the email. Please try again." }, { status: 502 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("challenge", await createChallenge(email, code), cookieOpts(CODE_TTL_MIN * 60));
  return res;
}
