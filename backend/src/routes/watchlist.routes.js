import { Router } from 'express';
import { watchlistController } from '../controllers/watchlist.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { numericParam } from '../middlewares/numericParam.js';
import { validate } from '../middlewares/validate.js';
import { movieSchema, watchlistQuerySchema, watchlistStatusSchema } from '../validators/movie.validator.js';

export const watchlistRoutes = Router();

watchlistRoutes.use(authenticate);
watchlistRoutes.param('movieId', numericParam);

watchlistRoutes.get('/', validate({ query: watchlistQuerySchema }), watchlistController.list);
watchlistRoutes.post('/', validate({ body: movieSchema }), watchlistController.add);
watchlistRoutes.delete('/completed', watchlistController.clearCompleted);
watchlistRoutes.patch('/:movieId', validate({ body: watchlistStatusSchema }), watchlistController.updateStatus);
watchlistRoutes.delete('/:movieId', watchlistController.remove);
