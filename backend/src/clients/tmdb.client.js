import { config } from '../config/index.js';
import { HttpError } from '../utils/httpError.js';

const CACHE_MS = 5 * 60 * 1000;
const CACHE_MAX_ENTRIES = 500;
const cache = new Map();

export const clearTmdbCache = () => cache.clear();

// Talks to TMDB on behalf of the app so the API key never reaches the browser.
export async function tmdbGet(path, params = {}) {
  const { key, baseUrl } = config.tmdb;
  if (!key) throw new HttpError(503, 'TMDB API key is not configured.');

  const url = new URL(baseUrl + path);
  url.search = new URLSearchParams({ api_key: key, language: 'en-US', ...params }).toString();

  const cacheKey = url.toString();
  const hit = cache.get(cacheKey);
  if (hit && hit.expires > Date.now()) return hit.data;

  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  } catch {
    throw new HttpError(502, 'Unable to reach TMDB.');
  }

  if (!response.ok) {
    throw new HttpError(response.status === 404 ? 404 : 502, 'TMDB request failed.');
  }

  const data = await response.json();
  if (cache.size >= CACHE_MAX_ENTRIES) cache.delete(cache.keys().next().value);
  cache.set(cacheKey, { data, expires: Date.now() + CACHE_MS });
  return data;
}
