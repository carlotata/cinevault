import { query } from '../db/pool.js';
import { createMovieListRepository } from './movieList.repository.js';

const base = createMovieListRepository('watchlist_items');

export const watchlistRepository = {
  ...base,

  async findAllByUser(userId, status) {
    if (!status) return base.findAllByUser(userId);
    const { rows } = await query(
      'SELECT * FROM watchlist_items WHERE user_id = $1 AND status = $2 ORDER BY id DESC',
      [userId, status],
    );
    return rows;
  },

  async updateStatus(userId, movieId, status) {
    const { rows } = await query(
      'UPDATE watchlist_items SET status = $1, updated_at = now() WHERE user_id = $2 AND movie_id = $3 RETURNING *',
      [status, userId, movieId],
    );
    return rows[0] ?? null;
  },

  async removeCompleted(userId) {
    const { rowCount } = await query("DELETE FROM watchlist_items WHERE user_id = $1 AND status = 'completed'", [userId]);
    return rowCount;
  },
};
