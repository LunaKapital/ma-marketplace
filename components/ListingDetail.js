import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { gbp, eventDate, TYPES } from "@/lib/format";

export default async function ListingDetail({ type, id }) {
  const t = TYPES[type];
  if (!/^\d+$/.test(id)) notFound();
  const sql = db();
  const [l] = await sql`
    SELECT l.*, u.email AS owner_email FROM listings l JOIN users u ON u.id = l.owner_id
    WHERE l.id = ${Number(id)} AND l.type = ${type}`;
  if (!l) notFound();
  const session = await getSession();
  return (
    <div className="wrap narrow2">
      <Link href={t.path} className="a">← {t.plural}</Link>
      <div className="card" style={{ marginTop: 16 }}>
        <span className="soon">{l.category || t.label} · {l.location}</span>
        <h1>{l.title}</h1>
        {type === "event" && (
          <h2>{eventDate(l.event_date) || "Date to be announced"}{l.price_gbp != null && ` · ${gbp(l.price_gbp)}`}</h2>
        )}
        {(type === "business" || type === "realestate") && <h2>{gbp(l.price_gbp)}</h2>}
        {type === "community" && l.price_gbp != null && <h2>{gbp(l.price_gbp)}</h2>}
        <p style={{ whiteSpace: "pre-wrap" }}>{l.description}</p>
        <hr />
        {session ? (
          <p>Contact the seller: <a className="a" href={`mailto:${l.owner_email}`}>{l.owner_email}</a></p>
        ) : (
          <p><Link href={`/login?next=${t.path}/${l.id}`} className="a">Log in</Link> to see the seller's contact details.</p>
        )}
      </div>
    </div>
  );
}
