import Link from "next/link";
import { db } from "@/lib/db";
import { gbp, eventDate, TYPES } from "@/lib/format";

export default async function ListingsIndex({ type, q = "" }) {
  const t = TYPES[type];
  const sql = db();
  const like = `%${q.trim()}%`;
  const rows = await sql`
    SELECT id, title, category, location, price_gbp, event_date FROM listings
    WHERE type = ${type} AND (${q.trim()} = '' OR title ILIKE ${like} OR location ILIKE ${like} OR category ILIKE ${like})
    ORDER BY created_at DESC LIMIT 60`;
  return (
    <div className="wrap">
      <h1>{t.plural}</h1>
      <form className="search" action={t.path}>
        <input name="q" defaultValue={q} placeholder="Search title, location, category…" />
        <button className="btn">Search</button>
      </form>
      {rows.length === 0 ? (
        <p className="muted">No listings yet. <Link href="/account" className="a">Create the first one.</Link></p>
      ) : (
        <div className="grid">
          {rows.map((r) => (
            <Link key={r.id} href={`${t.path}/${r.id}`} className="card hover">
              <span className="soon">{r.category || t.label}</span>
              <h3>{r.title}</h3>
              <p className="muted">{r.location}</p>
              {type === "event" && <b>{eventDate(r.event_date) || "Date TBA"}</b>}
              {type === "business" || type === "realestate" ? <b>{gbp(r.price_gbp)}</b> : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
