import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Blog" };

export default async function BlogIndex() {
  const sql = db();
  const posts = await sql`SELECT id, title, excerpt, created_at FROM posts ORDER BY created_at DESC LIMIT 60`;
  return (
    <div className="wrap">
      <h1>Blog</h1>
      {posts.length === 0 ? (
        <p className="muted">No posts yet.</p>
      ) : (
        <div className="grid">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.id}`} className="card hover">
              <span className="soon">{new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
              <h3>{p.title}</h3>
              {p.excerpt && <p className="muted">{p.excerpt}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
