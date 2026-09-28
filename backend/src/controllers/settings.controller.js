import { settingsService } from '../services/settings.service.js';

export const settingsController = {
  show(req, res) {
    res.json(settingsService.get(req.user));
  },

  async update(req, res) {
    res.json(await settingsService.update(req.user.id, req.validated.body));
  },
};
