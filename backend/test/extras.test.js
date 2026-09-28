import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { cleanup, registerUser, startServer } from './helpers.js';

describe('recent searches and settings', () => {
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

  it('dedupes case-insensitively, caps at six and lists newest first', async () => {
    const { token } = await registerUser(request);
    for (const query of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
      const res = await request('POST', '/recent-searches', { token, body: { query } });
      assert.equal(res.status, 201);
    }
    const res = await request('POST', '/recent-searches', { token, body: { query: 'D' } });
    assert.deepEqual(res.body.map((s) => s.query), ['D', 'g', 'f', 'e', 'c', 'b']);
    assert.equal((await request('GET', '/recent-searches', { token })).body.length, 6);
  });

  it('removes one search and clears them all', async () => {
    const { token } = await registerUser(request);
    const first = (await request('POST', '/recent-searches', { token, body: { query: 'inception' } })).body[0].id;
    await request('POST', '/recent-searches', { token, body: { query: 'interstellar' } });

    assert.equal((await request('DELETE', `/recent-searches/${first}`, { token })).status, 204);
    assert.equal((await request('DELETE', `/recent-searches/${first}`, { token })).status, 404);
    assert.equal((await request('GET', '/recent-searches', { token })).body.length, 1);

    assert.equal((await request('DELETE', '/recent-searches', { token })).status, 204);
    assert.equal((await request('GET', '/recent-searches', { token })).body.length, 0);
  });

  it('keeps recent searches private per user', async () => {
    const alice = await registerUser(request);
    const bob = await registerUser(request);
    const id = (await request('POST', '/recent-searches', { token: alice.token, body: { query: 'secret' } })).body[0].id;

    assert.equal((await request('GET', '/recent-searches', { token: bob.token })).body.length, 0);
    assert.equal((await request('DELETE', `/recent-searches/${id}`, { token: bob.token })).status, 404);
  });

  it('requires a query', async () => {
    const { token } = await registerUser(request);
    assert.equal((await request('POST', '/recent-searches', { token, body: { query: '   ' } })).status, 422);
    assert.equal((await request('POST', '/recent-searches', { token, body: {} })).status, 422);
  });

  it('reads and updates the dark mode setting', async () => {
    const { token } = await registerUser(request);
    assert.deepEqual((await request('GET', '/settings', { token })).body, { dark_mode: true });

    const updated = await request('PUT', '/settings', { token, body: { dark_mode: false } });
    assert.deepEqual(updated.body, { dark_mode: false });
    assert.deepEqual((await request('GET', '/settings', { token })).body, { dark_mode: false });
    assert.equal((await request('GET', '/user', { token })).body.dark_mode, false);

    assert.equal((await request('PUT', '/settings', { token, body: { dark_mode: 'maybe' } })).status, 422);
  });
});
