import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, describe, it, mock } from 'node:test';
import { clearTmdbCache } from '../src/clients/tmdb.client.js';
import { config } from '../src/config/index.js';
import { cleanup, startServer } from './helpers.js';

const json = (data, status = 200) => new Response(JSON.stringify(data), { status });

describe('TMDB proxy', () => {
  let server;
  let request;
  let originalKey;

  before(async () => {
    server = await startServer({ authLimit: 1000, tmdbLimit: 1000 });
    request = server.request;
    originalKey = config.tmdb.key;
  });
  after(async () => {
    await server.close();
    await cleanup();
  });
  beforeEach(() => {
    config.tmdb.key = 'test-key';
    clearTmdbCache();
  });
  afterEach(() => {
    mock.restoreAll();
    config.tmdb.key = originalKey;
  });

  const mockTmdb = (handler) => mock.method(globalThis, 'fetch', async (url) => handler(new URL(url)));

  it('proxies a category and sends the key upstream only', async () => {
    const fetchMock = mockTmdb(() => json({ results: [{ id: 1, title: 'X' }] }));
    const res = await request('GET', '/movies/category/popular');

    assert.equal(res.status, 200);
    assert.equal(res.body.results[0].title, 'X');
    assert.equal(JSON.stringify(res.body).includes('test-key'), false);

    const url = fetchMock.mock.calls[0].arguments[0];
    assert.ok(String(url).includes('/movie/popular'));
    assert.equal(new URL(url).searchParams.get('api_key'), 'test-key');
  });

  it('uses the trending endpoint for the trending category', async () => {
    const fetchMock = mockTmdb(() => json({ results: [] }));
    assert.equal((await request('GET', '/movies/category/trending')).status, 200);
    assert.ok(String(fetchMock.mock.calls[0].arguments[0]).includes('/trending/movie/day'));
  });

  it('404s for an unknown category without calling TMDB', async () => {
    const fetchMock = mockTmdb(() => json({}));
    assert.equal((await request('GET', '/movies/category/bogus')).status, 404);
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  it('requires a search query and forwards it', async () => {
    const fetchMock = mockTmdb(() => json({ results: [] }));
    assert.equal((await request('GET', '/movies/search')).status, 422);
    assert.equal((await request('GET', '/movies/search?query=inception')).status, 200);
    const url = new URL(fetchMock.mock.calls[0].arguments[0]);
    assert.equal(url.pathname.endsWith('/search/movie'), true);
    assert.equal(url.searchParams.get('query'), 'inception');
  });

  it('requests credits and videos for movie details', async () => {
    const fetchMock = mockTmdb(() => json({ id: 550, title: 'Fight Club' }));
    const res = await request('GET', '/movies/550');
    assert.equal(res.status, 200);
    assert.equal(res.body.id, 550);
    assert.equal(new URL(fetchMock.mock.calls[0].arguments[0]).searchParams.get('append_to_response'), 'credits,videos');
    assert.equal((await request('GET', '/movies/abc')).status, 404);
  });

  it('returns genres', async () => {
    mockTmdb(() => json({ genres: [{ id: 28, name: 'Action' }] }));
    const res = await request('GET', '/genres');
    assert.equal(res.body.genres[0].name, 'Action');
  });

  it('caches identical requests', async () => {
    const fetchMock = mockTmdb(() => json({ genres: [] }));
    await request('GET', '/genres');
    await request('GET', '/genres');
    assert.equal(fetchMock.mock.callCount(), 1);
  });

  it('maps upstream failures to 404 and 502', async () => {
    mockTmdb((url) => (url.pathname.includes('/movie/999') ? json({}, 404) : json({}, 500)));
    assert.equal((await request('GET', '/movies/999')).status, 404);
    assert.equal((await request('GET', '/genres')).status, 502);
  });

  it('returns 502 when TMDB is unreachable', async () => {
    mock.method(globalThis, 'fetch', async () => {
      throw new TypeError('fetch failed');
    });
    assert.equal((await request('GET', '/genres')).status, 502);
  });

  it('returns 503 when the API key is missing', async () => {
    config.tmdb.key = undefined;
    assert.equal((await request('GET', '/genres')).status, 503);
  });
});
