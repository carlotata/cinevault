import { Router } from 'express';
import { favoriteController } from '../controllers/favorite.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { numericParam } from '../middlewares/numericParam.js';
import { validate } from '../middlewares/validate.js';
import { movieSchema } from '../validators/movie.validator.js';

export const favoriteRoutes = Router();

favoriteRoutes.use(authenticate);
favoriteRoutes.param('movieId', numericParam);

favoriteRoutes.get('/', favoriteController.list);
favoriteRoutes.post('/', validate({ body: movieSchema }), favoriteController.add);
favoriteRoutes.delete('/:movieId', favoriteController.remove);
