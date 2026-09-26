import Link from "next/link";
import { db } from "@/lib/db";

export default async function Home() {
  const sql = db();
  const posts = await sql`SELECT id, title, excerpt, created_at FROM posts ORDER BY created_at DESC LIMIT 3`;

  return (
    <div className="wrap">
      <section className="hero">
        <h1>Everything for Acquisition Entrepreneurs</h1>
        <Link href="/login" className="btn big">Create a free account</Link>
      </section>
      <section>
        <div className="section-head">
          <h2>Latest from the blog</h2>
          <Link href="/blog" className="a">View all</Link>
        </div>
        {posts.length === 0 ? (
          <p className="muted">No posts yet. Check back soon.</p>
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
      </section>
    </div>
  );
}
