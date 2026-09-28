import { query } from '../db/pool.js';

const TABLES = new Set(['watchlist_items', 'favorites']);

// Watchlist and favorites store the same movie columns, so they share these queries.
// `table` is only ever one of the constants above, never user input.
export function createMovieListRepository(table) {
  if (!TABLES.has(table)) throw new Error(`Unknown movie list table: ${table}`);

  return {
    async findAllByUser(userId) {
      const { rows } = await query(`SELECT * FROM ${table} WHERE user_id = $1 ORDER BY id DESC`, [userId]);
      return rows;
    },

    async find(userId, movieId) {
      const { rows } = await query(`SELECT * FROM ${table} WHERE user_id = $1 AND movie_id = $2`, [userId, movieId]);
      return rows[0] ?? null;
    },

    // Returns the new row, or null when the movie was already saved.
    async insert(userId, movie) {
      const { rows } = await query(
        `INSERT INTO ${table}
           (user_id, movie_id, title, poster_path, backdrop_path, overview, vote_average, popularity, release_date, genre_ids)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
         ON CONFLICT (user_id, movie_id) DO NOTHING
         RETURNING *`,
        [
          userId,
          movie.id,
          movie.title,
          movie.poster_path ?? null,
          movie.backdrop_path ?? null,
          movie.overview ?? null,
          movie.vote_average ?? null,
          movie.popularity ?? null,
          movie.release_date ?? null,
          JSON.stringify(movie.genre_ids),
        ],
      );
      return rows[0] ?? null;
    },

    async remove(userId, movieId) {
      const { rowCount } = await query(`DELETE FROM ${table} WHERE user_id = $1 AND movie_id = $2`, [userId, movieId]);
      return rowCount;
    },
  };
}
