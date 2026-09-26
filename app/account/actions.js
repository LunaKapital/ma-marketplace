"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PROFESSIONS, TYPES } from "@/lib/format";

async function requireUser() {
  const s = await getSession();
  if (!s?.uid) redirect("/login");
  return s;
}
const str = (fd, k, max) => String(fd.get(k) ?? "").trim().slice(0, max);

export async function createListing(fd) {
  const s = await requireUser();
  const type = str(fd, "type", 20);
  const title = str(fd, "title", 120), description = str(fd, "description", 5000);
  const location = str(fd, "location", 120), category = str(fd, "category", 60) || null;
  const priceRaw = str(fd, "price", 15).replace(/[^\d]/g, "");
  const eventDateRaw = str(fd, "eventDate", 10);
  if (!TYPES[type] || !title || !description || !location) return;
  const price = priceRaw ? Number(priceRaw) : null;
  const eventDate = type === "event" && /^\d{4}-\d{2}-\d{2}$/.test(eventDateRaw) ? eventDateRaw : null;
  const sql = db();
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM listings WHERE owner_id = ${s.uid}`;
  if (n >= 50) return;
  await sql`INSERT INTO listings (owner_id, type, title, description, category, location, price_gbp, event_date)
            VALUES (${s.uid}, ${type}, ${title}, ${description}, ${category}, ${location}, ${price}, ${eventDate})`;
  revalidatePath("/account"); revalidatePath(TYPES[type].path);
}

export async function deleteListing(fd) {
  const s = await requireUser();
  const id = Number(fd.get("id"));
  if (!Number.isInteger(id)) return;
  await db()`DELETE FROM listings WHERE id = ${id} AND owner_id = ${s.uid}`;
  revalidatePath("/account"); revalidatePath("/businesses"); revalidatePath("/real-estate"); revalidatePath("/events"); revalidatePath("/communities");
}

export async function saveProfessional(fd) {
  const s = await requireUser();
  const profession = str(fd, "profession", 60);
  const name = str(fd, "name", 100), firm = str(fd, "firm", 100) || null;
  const location = str(fd, "location", 120), bio = str(fd, "bio", 3000);
  if (!PROFESSIONS.includes(profession) || !name || !location || !bio) return;
  await db()`
    INSERT INTO professionals (user_id, profession, name, firm, location, bio)
    VALUES (${s.uid}, ${profession}, ${name}, ${firm}, ${location}, ${bio})
    ON CONFLICT (user_id) DO UPDATE SET profession = EXCLUDED.profession, name = EXCLUDED.name,
      firm = EXCLUDED.firm, location = EXCLUDED.location, bio = EXCLUDED.bio`;
  revalidatePath("/account"); revalidatePath("/professionals");
}

export async function deleteProfessional() {
  const s = await requireUser();
  await db()`DELETE FROM professionals WHERE user_id = ${s.uid}`;
  revalidatePath("/account"); revalidatePath("/professionals");
}

export async function createPost(fd) {
  const s = await requireUser();
  const title = str(fd, "title", 150);
  const excerpt = str(fd, "excerpt", 300) || null;
  const body = str(fd, "body", 20000);
  if (!title || !body) return;
  const sql = db();
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM posts WHERE author_id = ${s.uid}`;
  if (n >= 100) return;
  await sql`INSERT INTO posts (author_id, title, excerpt, body) VALUES (${s.uid}, ${title}, ${excerpt}, ${body})`;
  revalidatePath("/account"); revalidatePath("/"); revalidatePath("/blog");
}

export async function deletePost(fd) {
  const s = await requireUser();
  const id = Number(fd.get("id"));
  if (!Number.isInteger(id)) return;
  await db()`DELETE FROM posts WHERE id = ${id} AND author_id = ${s.uid}`;
  revalidatePath("/account"); revalidatePath("/"); revalidatePath("/blog");
}
