import "./globals.css";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export const metadata = {
  title: "M&A Marketplace",
  description: "Businesses and real estate for sale, plus M&A lawyers, accountants and appraisers.",
};

export default async function RootLayout({ children }) {
  const session = await getSession();
  return (
    <html lang="en">
      <body>
        <header className="nav">
          <Link href="/" className="brand">M&amp;A Marketplace</Link>
          <nav>
            <Link href="/businesses">Businesses</Link>
            <Link href="/real-estate">Real estate</Link>
            <Link href="/events">Events</Link>
            <Link href="/communities">Communities</Link>
            <Link href="/professionals">Professionals</Link>
            {session ? (
              <>
                <Link href="/account">Account</Link>
                <LogoutButton />
              </>
            ) : (
              <Link href="/login" className="btn">Log in / Sign up</Link>
            )}
          </nav>
        </header>
        <main>{children}</main>
        <footer className="foot">© {new Date().getFullYear()} M&amp;A Marketplace</footer>
      </body>
    </html>
  );
}
