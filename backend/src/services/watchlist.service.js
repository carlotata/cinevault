import { watchlistRepository } from '../repositories/watchlist.repository.js';
import { HttpError } from '../utils/httpError.js';
import { toMovieDto } from '../utils/serializers.js';
import { createMovieListService } from './movieList.service.js';

const base = createMovieListService(watchlistRepository, 'watchlist');

export const watchlistService = {
  ...base,

  async list(userId, status) {
    return (await watchlistRepository.findAllByUser(userId, status)).map(toMovieDto);
  },

  async updateStatus(userId, movieId, status) {
    const item = await watchlistRepository.updateStatus(userId, movieId, status);
    if (!item) throw new HttpError(404, 'Movie is not in your watchlist.');
    return toMovieDto(item);
  },

  async clearCompleted(userId) {
    return { removed: await watchlistRepository.removeCompleted(userId) };
  },
};
