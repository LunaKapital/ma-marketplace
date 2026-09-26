import Link from "next/link";

const sections = [
  ["Businesses for sale", "Browse companies listed by owners and brokers.", "/businesses"],
  ["Real estate for sale", "Commercial and residential properties.", "/real-estate"],
  ["Events", "Conferences, networking and industry meetups.", "/events"],
  ["Communities", "Groups, forums and networks worth joining.", "/communities"],
  ["Professionals", "M&A lawyers, real estate lawyers, accountants, appraisers.", "/professionals"],
];

export default function Home() {
  return (
    <div className="wrap">
      <section className="hero">
        <h1>Buy, sell and get expert help.</h1>
        <p>One place for businesses, real estate and the professionals who close the deal.</p>
        <Link href="/login" className="btn big">Create a free account</Link>
      </section>
      <section className="grid">
        {sections.map(([t, d, href]) => (
          <Link href={href} className="card hover" key={t}><h3>{t}</h3><p className="muted">{d}</p></Link>
        ))}
      </section>
    </div>
  );
}
