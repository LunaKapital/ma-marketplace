import "./globals.css";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export const metadata = {
  title: "Acquisition Square",
  description: "Everything for acquisition entrepreneurs — businesses and real estate for sale, events, communities, and M&A professionals.",
};

export default async function RootLayout({ children }) {
  const session = await getSession();
  return (
    <html lang="en">
      <body>
        <header className="nav">
          <Link href="/" className="brand">Acquisition Square</Link>
          <nav>
            <Link href="/businesses">Businesses</Link>
            <Link href="/real-estate">Real estate</Link>
            <Link href="/events">Events</Link>
            <Link href="/communities">Communities</Link>
            <Link href="/professionals">Professionals</Link>
            <Link href="/blog">Blog</Link>
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
        <footer className="foot">© {new Date().getFullYear()} Acquisition Square</footer>
      </body>
    </html>
  );
}
