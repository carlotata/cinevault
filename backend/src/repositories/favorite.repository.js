import { createMovieListRepository } from './movieList.repository.js';

export const favoriteRepository = createMovieListRepository('favorites');
