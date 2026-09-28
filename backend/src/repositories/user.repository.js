import { query } from '../db/pool.js';

export const userRepository = {
  async findById(id) {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] ?? null;
  },

  async findByEmail(email) {
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] ?? null;
  },

  async create({ name, email, passwordHash }) {
    const { rows } = await query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, passwordHash],
    );
    return rows[0];
  },

  async updateDarkMode(id, darkMode) {
    const { rows } = await query(
      'UPDATE users SET dark_mode = $1, updated_at = now() WHERE id = $2 RETURNING *',
      [darkMode, id],
    );
    return rows[0] ?? null;
  },
};
