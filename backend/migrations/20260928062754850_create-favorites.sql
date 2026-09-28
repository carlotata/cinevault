-- Up Migration
CREATE TABLE favorites (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  movie_id integer NOT NULL,
  title varchar(255) NOT NULL,
  poster_path varchar(255),
  backdrop_path varchar(255),
  overview text,
  vote_average numeric(3, 1),
  popularity numeric(10, 3),
  release_date date,
  genre_ids jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT current_timestamp,
  updated_at timestamptz NOT NULL DEFAULT current_timestamp,
  UNIQUE (user_id, movie_id)
);

-- Down Migration
DROP TABLE favorites;
