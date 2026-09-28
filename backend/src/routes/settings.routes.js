import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { settingsSchema } from '../validators/settings.validator.js';

export const settingsRoutes = Router();

settingsRoutes.use(authenticate);

settingsRoutes.get('/', settingsController.show);
settingsRoutes.put('/', validate({ body: settingsSchema }), settingsController.update);
