import { randomUUID } from 'node:crypto';
import { createApp } from '../src/app.js';
import { pool, query } from '../src/db/pool.js';

// Captured before any test mocks global fetch, so the test client keeps talking to the real server.
const realFetch = globalThis.fetch;
const createdEmails = [];

export async function startServer(options) {
  const server = await new Promise((resolve) => {
    const instance = createApp(options).listen(0, '127.0.0.1', () => resolve(instance));
  });

  return {
    request: makeClient(`http://127.0.0.1:${server.address().port}/api`),
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

function makeClient(base) {
  return async (method, path, { body, token, rawBody } = {}) => {
    const headers = { Accept: 'application/json' };
    if (body !== undefined || rawBody !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await realFetch(base + path, {
      method,
      headers,
      body: rawBody ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : null };
  };
}

export const uniqueEmail = () => {
  const email = `test-${randomUUID()}@example.test`;
  createdEmails.push(email);
  return email;
};

export async function registerUser(request, overrides = {}) {
  const email = overrides.email ?? uniqueEmail();
  const { status, body } = await request('POST', '/register', {
    body: { name: 'Test User', email, password: 'password123', password_confirmation: 'password123', ...overrides },
  });
  if (status !== 201) throw new Error(`register failed: ${status} ${JSON.stringify(body)}`);
  return { email, token: body.token, user: body.user };
}

// Deletes the users created by this test file (their rows cascade) and closes the pool.
export async function cleanup() {
  if (createdEmails.length) await query('DELETE FROM users WHERE email = ANY($1)', [createdEmails]);
  await pool.end();
}

export const movie = (overrides = {}) => ({
  id: 550,
  title: 'Fight Club',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  overview: 'An insomniac...',
  vote_average: 8.4,
  popularity: 61.4,
  release_date: '1999-10-15',
  genre_ids: [18, 53],
  ...overrides,
});
