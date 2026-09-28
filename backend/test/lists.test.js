import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { cleanup, movie, registerUser, startServer } from './helpers.js';

describe('watchlist and favorites', () => {
  let server;
  let request;
  let token;

  before(async () => {
    server = await startServer({ authLimit: 1000, tmdbLimit: 1000 });
    request = server.request;
    ({ token } = await registerUser(request));
  });
  after(async () => {
    await server.close();
    await cleanup();
  });

  describe('watchlist', () => {
    it('adds a movie with the default status and is idempotent', async () => {
      const created = await request('POST', '/watchlist', { token, body: movie() });
      assert.equal(created.status, 201);
      assert.equal(created.body.data.id, 550);
      assert.equal(created.body.data.status, 'plan_to_watch');
      assert.deepEqual(created.body.data.genre_ids, [18, 53]);
      assert.equal(created.body.data.release_date, '1999-10-15');

      assert.equal((await request('POST', '/watchlist', { token, body: movie() })).status, 200);
      const list = await request('GET', '/watchlist', { token });
      assert.equal(list.body.data.length, 1);
    });

    it('accepts the TMDB detail shape with genres and rounds decimals', async () => {
      const { token: t } = await registerUser(request);
      const { genre_ids, ...detail } = movie({ vote_average: 8.352, popularity: 61.42119 });
      const res = await request('POST', '/watchlist', {
        token: t,
        body: { ...detail, genres: [{ id: 18, name: 'Drama' }], adult: false },
      });
      assert.equal(res.status, 201);
      assert.deepEqual(res.body.data.genre_ids, [18]);
      assert.equal(res.body.data.vote_average, 8.4);
      assert.equal(res.body.data.popularity, 61.421);
    });

    it('stores an empty release date as null', async () => {
      const { token: t } = await registerUser(request);
      const res = await request('POST', '/watchlist', { token: t, body: movie({ release_date: '' }) });
      assert.equal(res.status, 201);
      assert.equal(res.body.data.release_date, null);
    });

    it('updates the status, filters by it, and clears completed movies', async () => {
      const { token: t } = await registerUser(request);
      await request('POST', '/watchlist', { token: t, body: movie({ id: 1, title: 'One' }) });
      await request('POST', '/watchlist', { token: t, body: movie({ id: 2, title: 'Two' }) });

      const patched = await request('PATCH', '/watchlist/1', { token: t, body: { status: 'completed' } });
      assert.equal(patched.status, 200);
      assert.equal(patched.body.data.status, 'completed');
      assert.equal((await request('PATCH', '/watchlist/2', { token: t, body: { status: 'bogus' } })).status, 422);
      assert.equal((await request('PATCH', '/watchlist/999', { token: t, body: { status: 'watching' } })).status, 404);

      const completed = await request('GET', '/watchlist?status=completed', { token: t });
      assert.equal(completed.body.data.length, 1);
      assert.equal((await request('GET', '/watchlist?status=bogus', { token: t })).status, 422);

      const cleared = await request('DELETE', '/watchlist/completed', { token: t });
      assert.equal(cleared.body.removed, 1);
      const left = await request('GET', '/watchlist', { token: t });
      assert.deepEqual(left.body.data.map((m) => m.id), [2]);
    });

    it('removes a movie and 404s when it is missing', async () => {
      const { token: t } = await registerUser(request);
      await request('POST', '/watchlist', { token: t, body: movie() });
      assert.equal((await request('DELETE', '/watchlist/550', { token: t })).status, 204);
      assert.equal((await request('DELETE', '/watchlist/550', { token: t })).status, 404);
      assert.equal((await request('DELETE', '/watchlist/abc', { token: t })).status, 404);
    });

    it('validates the payload', async () => {
      const res = await request('POST', '/watchlist', { token, body: { title: 'No id' } });
      assert.equal(res.status, 422);
      assert.ok(res.body.errors.id);
    });

    it('lists the newest additions first', async () => {
      const { token: t } = await registerUser(request);
      await request('POST', '/watchlist', { token: t, body: movie({ id: 1, title: 'First' }) });
      await request('POST', '/watchlist', { token: t, body: movie({ id: 2, title: 'Second' }) });
      const list = await request('GET', '/watchlist', { token: t });
      assert.deepEqual(list.body.data.map((m) => m.id), [2, 1]);
    });
  });

  describe('favorites', () => {
    it('adds, lists and removes favorites without a status field', async () => {
      const { token: t } = await registerUser(request);
      const created = await request('POST', '/favorites', { token: t, body: movie() });
      assert.equal(created.status, 201);
      assert.equal('status' in created.body.data, false);
      assert.equal((await request('POST', '/favorites', { token: t, body: movie() })).status, 200);
      assert.equal((await request('GET', '/favorites', { token: t })).body.data.length, 1);

      assert.equal((await request('DELETE', '/favorites/550', { token: t })).status, 204);
      assert.equal((await request('DELETE', '/favorites/550', { token: t })).status, 404);
    });
  });

  it('keeps lists private per user', async () => {
    const alice = await registerUser(request);
    const bob = await registerUser(request);
    await request('POST', '/watchlist', { token: alice.token, body: movie() });
    await request('POST', '/favorites', { token: alice.token, body: movie() });

    assert.equal((await request('GET', '/watchlist', { token: bob.token })).body.data.length, 0);
    assert.equal((await request('GET', '/favorites', { token: bob.token })).body.data.length, 0);
    assert.equal((await request('DELETE', '/watchlist/550', { token: bob.token })).status, 404);
  });
});
