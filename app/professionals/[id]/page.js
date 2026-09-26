import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export default async function Page({ params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const sql = db();
  const [p] = await sql`
    SELECT p.*, u.email FROM professionals p JOIN users u ON u.id = p.user_id WHERE p.id = ${Number(id)}`;
  if (!p) notFound();
  const session = await getSession();
  return (
    <div className="wrap narrow2">
      <Link href="/professionals" className="a">← Professionals</Link>
      <div className="card" style={{ marginTop: 16 }}>
        <span className="soon">{p.profession} · {p.location}</span>
        <h1>{p.name}</h1>
        {p.firm && <p className="muted">{p.firm}</p>}
        <p style={{ whiteSpace: "pre-wrap" }}>{p.bio}</p>
        <hr />
        {session ? <p>Contact: <a className="a" href={`mailto:${p.email}`}>{p.email}</a></p>
          : <p><Link href={`/login?next=/professionals/${p.id}`} className="a">Log in</Link> to see contact details.</p>}
      </div>
    </div>
  );
}
