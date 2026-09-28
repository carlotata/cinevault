import { Router } from 'express';
import { createRateLimiter } from '../middlewares/rateLimit.js';
import { authRoutes } from './auth.routes.js';
import { favoriteRoutes } from './favorite.routes.js';
import { genreRoutes, movieRoutes } from './movie.routes.js';
import { recentSearchRoutes } from './recentSearch.routes.js';
import { settingsRoutes } from './settings.routes.js';
import { watchlistRoutes } from './watchlist.routes.js';

export function createApiRouter({ authLimit, tmdbLimit }) {
  const api = Router();

  api.get('/hello', (req, res) => {
    res.json({ message: 'Hello from Den!' });
  });

  api.post(['/register', '/login'], createRateLimiter(authLimit));
  api.use(authRoutes);

  const tmdbLimiter = createRateLimiter(tmdbLimit);
  api.use('/movies', tmdbLimiter, movieRoutes);
  api.use('/genres', tmdbLimiter, genreRoutes);

  api.use('/watchlist', watchlistRoutes);
  api.use('/favorites', favoriteRoutes);
  api.use('/recent-searches', recentSearchRoutes);
  api.use('/settings', settingsRoutes);

  return api;
}
