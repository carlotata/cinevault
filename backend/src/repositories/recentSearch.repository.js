import { query, withTransaction } from '../db/pool.js';

export const recentSearchRepository = {
  async latest(userId, limit) {
    const { rows } = await query(
      'SELECT id, query FROM recent_searches WHERE user_id = $1 ORDER BY id DESC LIMIT $2',
      [userId, limit],
    );
    return rows;
  },

  // Re-searching a term deletes and re-inserts it, so the highest id is always the most recent search.
  // Older searches beyond `limit` are trimmed.
  record(userId, term, limit) {
    return withTransaction(async (client) => {
      await client.query('DELETE FROM recent_searches WHERE user_id = $1 AND lower(query) = lower($2)', [userId, term]);
      await client.query('INSERT INTO recent_searches (user_id, query) VALUES ($1, $2)', [userId, term]);
      await client.query(
        `DELETE FROM recent_searches
         WHERE user_id = $1
           AND id NOT IN (SELECT id FROM recent_searches WHERE user_id = $1 ORDER BY id DESC LIMIT $2)`,
        [userId, limit],
      );
    });
  },

  async remove(userId, id) {
    const { rowCount } = await query('DELETE FROM recent_searches WHERE user_id = $1 AND id = $2', [userId, id]);
    return rowCount;
  },

  async removeAll(userId) {
    await query('DELETE FROM recent_searches WHERE user_id = $1', [userId]);
  },
};
