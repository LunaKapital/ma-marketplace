import { Resend } from "resend";
import { CODE_TTL_MIN } from "./auth";

export async function sendLoginCode(email, code) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`\n[dev] Login code for ${email}: ${code}\n`);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "M&A Marketplace <onboarding@resend.dev>",
    to: email,
    subject: `Your login code: ${code}`,
    text: `Your login code is ${code}\n\nIt expires in ${CODE_TTL_MIN} minutes. If you didn't request it, you can ignore this email.`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:420px"><p>Your login code is</p><p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:8px 0">${code}</p><p style="color:#666">It expires in ${CODE_TTL_MIN} minutes. If you didn't request it, you can ignore this email.</p></div>`,
  });
  if (error) throw new Error(error.message);
}
