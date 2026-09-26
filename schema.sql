-- You do NOT need to run this file. The app now creates and updates its own
-- tables automatically the first time it talks to the database (see lib/db.js) —
-- just set DATABASE_URL and deploy. This file is kept only as a reference for
-- what the schema looks like; it is not used by the app itself.
CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS listings (
  id serial PRIMARY KEY,
  owner_id int NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('business','realestate','event','community')),
  title text NOT NULL,
  description text NOT NULL,
  category text,
  location text NOT NULL,
  price_gbp bigint,
  event_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS listings_type_created ON listings (type, created_at DESC);

CREATE TABLE IF NOT EXISTS professionals (
  id serial PRIMARY KEY,
  user_id int UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profession text NOT NULL,
  name text NOT NULL,
  firm text,
  location text NOT NULL,
  bio text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS professionals_profession ON professionals (profession);
