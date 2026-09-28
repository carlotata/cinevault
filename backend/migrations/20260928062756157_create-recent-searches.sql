-- Up Migration
CREATE TABLE recent_searches (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  query varchar(255) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT current_timestamp,
  updated_at timestamptz NOT NULL DEFAULT current_timestamp,
  UNIQUE (user_id, query)
);

-- Down Migration
DROP TABLE recent_searches;
