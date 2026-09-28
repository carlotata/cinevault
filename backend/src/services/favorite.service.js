import { favoriteRepository } from '../repositories/favorite.repository.js';
import { createMovieListService } from './movieList.service.js';

export const favoriteService = createMovieListService(favoriteRepository, 'favorites');
