import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PROFESSIONS, TYPES, gbp, eventDate } from "@/lib/format";
import { createListing, deleteListing, saveProfessional, deleteProfessional } from "./actions";

export const metadata = { title: "Your account" };

export default async function Account() {
  const session = await getSession();
  const sql = db();
  const mine = await sql`SELECT id, type, title, price_gbp, event_date FROM listings WHERE owner_id = ${session.uid} ORDER BY created_at DESC`;
  const [pro] = await sql`SELECT * FROM professionals WHERE user_id = ${session.uid}`;

  return (
    <div className="wrap narrow2">
      <h1>Your account</h1>
      <p className="muted">Signed in as {session.email}</p>

      <div className="card">
        <h3>Your listings</h3>
        {mine.length === 0 ? <p className="muted">Nothing listed yet.</p> : mine.map((l) => (
          <form key={l.id} action={deleteListing} className="row">
            <input type="hidden" name="id" value={l.id} />
            <Link href={`${TYPES[l.type].path}/${l.id}`} className="a">{l.title}</Link>
            <span className="muted">
              {TYPES[l.type].label} ·{" "}
              {l.type === "event" ? (eventDate(l.event_date) || "Date TBA")
                : l.type === "community" ? (l.price_gbp != null ? gbp(l.price_gbp) : "Free to join")
                : gbp(l.price_gbp)}
            </span>
            <button className="link danger">Delete</button>
          </form>
        ))}
      </div>

      <div className="card">
        <h3>Add a listing</h3>
        <form action={createListing}>
          <label>Type</label>
          <select name="type" required>
            <option value="business">Business for sale</option>
            <option value="realestate">Real estate for sale</option>
            <option value="event">Event</option>
            <option value="community">Community</option>
          </select>
          <label>Title</label><input name="title" required maxLength={120} />
          <label>Category (optional)</label><input name="category" maxLength={60} placeholder="e.g. Retail, SaaS, Office building, Networking, Founders" />
          <label>Location</label><input name="location" required maxLength={120} placeholder="City, or 'Online'" />
          <label>Price / membership fee in GBP (optional)</label><input name="price" inputMode="numeric" placeholder="250000" />
          <label>Event date (optional, events only)</label><input name="eventDate" type="date" />
          <label>Description</label><textarea name="description" required rows={6} maxLength={5000} />
          <button className="btn big">Publish listing</button>
        </form>
      </div>

      <div className="card">
        <h3>{pro ? "Your professional profile" : "List yourself as a professional"}</h3>
        <form action={saveProfessional}>
          <label>Profession</label>
          <select name="profession" defaultValue={pro?.profession} required>
            {PROFESSIONS.map((p) => <option key={p}>{p}</option>)}
          </select>
          <label>Name</label><input name="name" required maxLength={100} defaultValue={pro?.name} />
          <label>Firm (optional)</label><input name="firm" maxLength={100} defaultValue={pro?.firm ?? ""} />
          <label>Location</label><input name="location" required maxLength={120} defaultValue={pro?.location} />
          <label>About you</label><textarea name="bio" required rows={5} maxLength={3000} defaultValue={pro?.bio} />
          <button className="btn big">{pro ? "Save profile" : "Create profile"}</button>
        </form>
        {pro && <form action={deleteProfessional}><button className="link danger">Remove my profile</button></form>}
      </div>
    </div>
  );
}
