import { tmdbGet } from '../clients/tmdb.client.js';

export const CATEGORIES = ['popular', 'trending', 'top_rated', 'now_playing', 'upcoming'];

export const movieService = {
  byCategory(category, page) {
    const path = category === 'trending' ? '/trending/movie/day' : `/movie/${category}`;
    return tmdbGet(path, { page });
  },

  search(query, page) {
    return tmdbGet('/search/movie', { query, page, include_adult: 'false' });
  },

  details(id) {
    return tmdbGet(`/movie/${id}`, { append_to_response: 'credits,videos' });
  },

  genres() {
    return tmdbGet('/genre/movie/list');
  },
};
