import { SignJWT, jwtVerify } from "jose";
import { createHash, createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const secretStr = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s === "change-me") {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is not set");
    return "dev-only-secret-not-for-production";
  }
  return s;
};
const key = () => new TextEncoder().encode(secretStr());

export const CODE_TTL_MIN = 10;
const SESSION_DAYS = 30;

export const generateCode = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

const codeHash = (email, code) =>
  createHmac("sha256", secretStr()).update(`${email}:${code}`).digest("hex");

// Stateless challenge: signed token carrying only a keyed hash of the code.
export async function createChallenge(email, code) {
  return new SignJWT({ email, h: codeHash(email, code) })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${CODE_TTL_MIN}m`)
    .sign(key());
}

export async function checkChallenge(token, code) {
  try {
    const { payload } = await jwtVerify(token, key());
    const expected = Buffer.from(payload.h, "hex");
    const given = Buffer.from(codeHash(payload.email, code), "hex");
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
    return payload.email;
  } catch {
    return null;
  }
}

export async function startSession(email, uid) {
  const token = await new SignJWT({ email, uid })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key());
  (await cookies()).set("session", token, cookieOpts(SESSION_DAYS * 86400));
}

export async function getSession() {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return { email: payload.email, uid: payload.uid };
  } catch {
    return null;
  }
}

export const cookieOpts = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge,
});

// Rate limit. Uses Upstash Redis (shared across serverless instances) when configured,
// otherwise falls back to a per-instance in-memory map (fine for local dev only).
const hits = new Map();
export async function rateLimit(id, max, windowMs) {
  const url = process.env.UPSTASH_REDIS_REST_URL, tok = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && tok) {
    try {
      const k = `rl:${id}`;
      const r = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tok}`, "content-type": "application/json" },
        body: JSON.stringify([["INCR", k], ["PEXPIRE", k, String(windowMs), "NX"]]),
      });
      const out = await r.json();
      if (typeof out?.[0]?.result === "number") return out[0].result <= max;
    } catch {}
  }
  const now = Date.now();
  const arr = (hits.get(id) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(id, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length <= max;
}

export const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 32);
