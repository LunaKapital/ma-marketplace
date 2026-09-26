import Link from "next/link";
import { db } from "@/lib/db";
import { PROFESSIONS } from "@/lib/format";

export const metadata = { title: "Professionals" };

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  const prof = PROFESSIONS.includes(sp.profession) ? sp.profession : "";
  const sql = db();
  const rows = await sql`
    SELECT id, name, firm, profession, location FROM professionals
    WHERE (${prof} = '' OR profession = ${prof}) ORDER BY created_at DESC LIMIT 100`;
  return (
    <div className="wrap">
      <h1>Professionals</h1>
      <div className="chips">
        <Link href="/professionals" className={`chip ${!prof ? "on" : ""}`}>All</Link>
        {PROFESSIONS.map((p) => (
          <Link key={p} href={`/professionals?profession=${encodeURIComponent(p)}`} className={`chip ${prof === p ? "on" : ""}`}>{p}</Link>
        ))}
      </div>
      {rows.length === 0 ? <p className="muted">No professionals listed yet.</p> : (
        <div className="grid">
          {rows.map((r) => (
            <Link key={r.id} href={`/professionals/${r.id}`} className="card hover">
              <span className="soon">{r.profession}</span>
              <h3>{r.name}</h3>
              <p className="muted">{[r.firm, r.location].filter(Boolean).join(" · ")}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
