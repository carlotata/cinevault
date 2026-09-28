import { HttpError } from '../utils/httpError.js';
import { toMovieDto } from '../utils/serializers.js';

// Shared behaviour of the watchlist and favorites (`label` is used in error messages).
export function createMovieListService(repository, label) {
  return {
    async list(userId) {
      return (await repository.findAllByUser(userId)).map(toMovieDto);
    },

    async add(userId, movie) {
      const inserted = await repository.insert(userId, movie);
      if (inserted) return { movie: toMovieDto(inserted), created: true };

      return { movie: toMovieDto(await repository.find(userId, movie.id)), created: false };
    },

    async remove(userId, movieId) {
      const removed = await repository.remove(userId, movieId);
      if (!removed) throw new HttpError(404, `Movie is not in your ${label}.`);
    },
  };
}
