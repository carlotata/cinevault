import { recentSearchRepository } from '../repositories/recentSearch.repository.js';
import { HttpError } from '../utils/httpError.js';

const LIMIT = 6;

export const recentSearchService = {
  list(userId) {
    return recentSearchRepository.latest(userId, LIMIT);
  },

  async record(userId, term) {
    await recentSearchRepository.record(userId, term, LIMIT);
    return recentSearchRepository.latest(userId, LIMIT);
  },

  async remove(userId, id) {
    if (!(await recentSearchRepository.remove(userId, id))) throw new HttpError(404, 'Search not found.');
  },

  clear(userId) {
    return recentSearchRepository.removeAll(userId);
  },
};
