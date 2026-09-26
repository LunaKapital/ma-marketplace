import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export default async function Post({ params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const sql = db();
  const [p] = await sql`SELECT * FROM posts WHERE id = ${Number(id)}`;
  if (!p) notFound();
  return (
    <div className="wrap narrow2">
      <Link href="/blog" className="a">← Blog</Link>
      <div className="card" style={{ marginTop: 16 }}>
        <span className="soon">{new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
        <h1>{p.title}</h1>
        <p style={{ whiteSpace: "pre-wrap" }}>{p.body}</p>
      </div>
    </div>
  );
}
