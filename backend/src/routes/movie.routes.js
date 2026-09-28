import { Router } from 'express';
import { movieController } from '../controllers/movie.controller.js';
import { numericParam } from '../middlewares/numericParam.js';
import { validate } from '../middlewares/validate.js';
import { movieSearchSchema } from '../validators/search.validator.js';

export const movieRoutes = Router();
export const genreRoutes = Router();

movieRoutes.param('id', numericParam);

movieRoutes.get('/category/:category', movieController.byCategory);
movieRoutes.get('/search', validate({ query: movieSearchSchema }), movieController.search);
movieRoutes.get('/:id', movieController.details);

genreRoutes.get('/', movieController.genres);
