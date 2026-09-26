import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkChallenge, startSession, rateLimit, sha } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req) {
  const { code: raw } = await req.json().catch(() => ({}));
  const code = String(raw || "").replace(/\s/g, "");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  const jar = await cookies();
  const token = jar.get("challenge")?.value;
  if (!token || !/^\d{6}$/.test(code))
    return NextResponse.json({ error: "Enter the 6-digit code from your email." }, { status: 400 });

  // Max 5 guesses per issued code, and a per-IP cap. This is what makes a 6-digit code safe.
  if (!(await rateLimit(`ver:tok:${sha(token)}`, 5, 10 * 60_000)) || !(await rateLimit(`ver:ip:${ip}`, 20, 10 * 60_000)))
    return NextResponse.json({ error: "Too many attempts. Request a new code." }, { status: 429 });

  const email = await checkChallenge(token, code);
  if (!email) return NextResponse.json({ error: "That code is invalid or has expired." }, { status: 401 });

  const sql = db();
  const [user] = await sql`
    INSERT INTO users (email) VALUES (${email})
    ON CONFLICT (email) DO UPDATE SET last_login = now()
    RETURNING id`;

  jar.delete("challenge");
  await startSession(email, user.id);
  return NextResponse.json({ ok: true });
}
