import { neon } from "@neondatabase/serverless";

let rawClient;
function raw() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set (see .env.example)");
  return (rawClient ??= neon(process.env.DATABASE_URL));
}

// The app manages its own tables — nobody needs to run SQL by hand.
// This runs once per server instance (cached in migrationPromise) and brings
// an old database up to date automatically: it's safe to run repeatedly,
// and adding a new listing category (like Events or Communities) just means
// adding its name to the CHECK list below and redeploying.
let migrationPromise;
async function runMigration(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id serial PRIMARY KEY,
      email text UNIQUE NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      last_login timestamptz NOT NULL DEFAULT now()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS listings (
      id serial PRIMARY KEY,
      owner_id int NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type text NOT NULL,
      title text NOT NULL,
      description text NOT NULL,
      category text,
      location text NOT NULL,
      price_gbp bigint,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS listings_type_created ON listings (type, created_at DESC)`;
  // Columns/constraints added after the first release — IF NOT EXISTS / DROP+ADD makes these safe to repeat.
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS event_date date`;
  await sql`ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_type_check`;
  await sql`ALTER TABLE listings ADD CONSTRAINT listings_type_check
              CHECK (type IN ('business','realestate','event','community'))`;

  await sql`
    CREATE TABLE IF NOT EXISTS professionals (
      id serial PRIMARY KEY,
      user_id int UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      profession text NOT NULL,
      name text NOT NULL,
      firm text,
      location text NOT NULL,
      bio text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS professionals_profession ON professionals (profession)`;

  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id serial PRIMARY KEY,
      author_id int NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title text NOT NULL,
      excerpt text,
      body text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS posts_created ON posts (created_at DESC)`;
}

export function db() {
  const sql = raw();
  // A drop-in replacement for the plain neon `sql` tag: every query first waits
  // for the (cached, one-time-per-instance) migration to finish, then runs as normal.
  const wrapped = (strings, ...values) => {
    if (!migrationPromise) {
      migrationPromise = runMigration(sql).catch((err) => {
        migrationPromise = null; // let the next request retry instead of staying broken forever
        throw err;
      });
    }
    return migrationPromise.then(() => sql(strings, ...values));
  };
  return wrapped;
}
