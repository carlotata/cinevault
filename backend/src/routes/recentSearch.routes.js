import { Router } from 'express';
import { recentSearchController } from '../controllers/recentSearch.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { numericParam } from '../middlewares/numericParam.js';
import { validate } from '../middlewares/validate.js';
import { recentSearchSchema } from '../validators/search.validator.js';

export const recentSearchRoutes = Router();

recentSearchRoutes.use(authenticate);
recentSearchRoutes.param('id', numericParam);

recentSearchRoutes.get('/', recentSearchController.list);
recentSearchRoutes.post('/', validate({ body: recentSearchSchema }), recentSearchController.record);
recentSearchRoutes.delete('/', recentSearchController.clear);
recentSearchRoutes.delete('/:id', recentSearchController.remove);
