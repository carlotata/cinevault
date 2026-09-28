import assert from 'node:assert/strict';
import { after, afterEach, before, describe, it, mock } from 'node:test';
import { clearTmdbCache } from '../src/clients/tmdb.client.js';
import { cleanup, registerUser, startServer, uniqueEmail } from './helpers.js';

describe('auth', () => {
  let server;
  let request;

  before(async () => {
    server = await startServer({ authLimit: 1000, tmdbLimit: 1000 });
    request = server.request;
  });
  after(async () => {
    await server.close();
    await cleanup();
  });
  afterEach(() => mock.restoreAll());

  it('serves the hello endpoint', async () => {
    const { status, body } = await request('GET', '/hello');
    assert.equal(status, 200);
    assert.deepEqual(body, { message: 'Hello from Den!' });
  });

  it('registers a user and returns a token', async () => {
    const email = uniqueEmail();
    const { status, body } = await request('POST', '/register', {
      body: { name: 'Den', email, password: 'password123', password_confirmation: 'password123' },
    });
    assert.equal(status, 201);
    assert.equal(body.user.email, email);
    assert.equal(body.user.dark_mode, true);
    assert.equal(body.user.password, undefined);
    assert.ok(body.token);
  });

  it('validates registration input', async () => {
    const { status, body } = await request('POST', '/register', { body: { email: 'nope' } });
    assert.equal(status, 422);
    assert.deepEqual(Object.keys(body.errors).sort(), ['email', 'name', 'password']);
  });

  it('rejects short and unconfirmed passwords', async () => {
    const short = await request('POST', '/register', {
      body: { name: 'A', email: uniqueEmail(), password: 'short', password_confirmation: 'short' },
    });
    assert.equal(short.status, 422);
    assert.ok(short.body.errors.password);

    const mismatch = await request('POST', '/register', {
      body: { name: 'A', email: uniqueEmail(), password: 'password123', password_confirmation: 'different1' },
    });
    assert.equal(mismatch.status, 422);
    assert.match(mismatch.body.errors.password[0], /confirmation/);
  });

  it('rejects a duplicate email, ignoring letter case', async () => {
    const { email } = await registerUser(request);
    const { status, body } = await request('POST', '/register', {
      body: { name: 'Dup', email: email.toUpperCase(), password: 'password123', password_confirmation: 'password123' },
    });
    assert.equal(status, 422);
    assert.match(body.errors.email[0], /already been taken/);
  });

  it('logs in with valid credentials', async () => {
    const { email } = await registerUser(request);
    const { status, body } = await request('POST', '/login', { body: { email, password: 'password123' } });
    assert.equal(status, 200);
    assert.ok(body.token);
    assert.equal(body.user.email, email);
  });

  it('rejects a wrong password', async () => {
    const { email } = await registerUser(request);
    const { status, body } = await request('POST', '/login', { body: { email, password: 'wrong' } });
    assert.equal(status, 422);
    assert.match(body.errors.email[0], /incorrect/);
  });

  it('authenticates with a token and exposes the current user', async () => {
    const { token, user } = await registerUser(request);
    const me = await request('GET', '/user', { token });
    assert.equal(me.status, 200);
    assert.equal(me.body.id, user.id);
    assert.equal((await request('POST', '/logout', { token })).status, 200);
  });

  it('requires authentication on protected routes', async () => {
    for (const path of ['/user', '/watchlist', '/favorites', '/recent-searches', '/settings']) {
      assert.equal((await request('GET', path)).status, 401, path);
    }
    assert.equal((await request('GET', '/user', { token: 'not-a-real-token' })).status, 401);
  });

  it('rejects malformed JSON with 400', async () => {
    const { status } = await request('POST', '/login', { rawBody: '{oops' });
    assert.equal(status, 400);
  });

  it('returns a JSON 404 for unknown routes', async () => {
    const { status, body } = await request('GET', '/nothing-here');
    assert.equal(status, 404);
    assert.equal(body.message, 'Not Found');
  });

  it('does not let movie browsing use up the login allowance', async () => {
    const limited = await startServer({ authLimit: 3, tmdbLimit: 1000 });
    mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ results: [] })));
    clearTmdbCache();

    for (let i = 0; i < 15; i += 1) {
      assert.equal((await limited.request('GET', `/movies/search?query=q${i}`)).status, 200);
    }
    const { email } = await registerUser(request);
    assert.equal((await limited.request('POST', '/login', { body: { email, password: 'password123' } })).status, 200);
    await limited.close();
  });

  it('rate limits repeated login attempts', async () => {
    const limited = await startServer({ authLimit: 3, tmdbLimit: 1000 });
    for (let i = 0; i < 3; i += 1) {
      const { status } = await limited.request('POST', '/login', { body: { email: 'nobody@example.test', password: 'x' } });
      assert.equal(status, 422);
    }
    const blocked = await limited.request('POST', '/login', { body: { email: 'nobody@example.test', password: 'x' } });
    assert.equal(blocked.status, 429);
    assert.equal(blocked.body.message, 'Too Many Attempts.');
    await limited.close();
  });
});
