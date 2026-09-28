import { recentSearchService } from '../services/recentSearch.service.js';

export const recentSearchController = {
  async list(req, res) {
    res.json(await recentSearchService.list(req.user.id));
  },

  async record(req, res) {
    res.status(201).json(await recentSearchService.record(req.user.id, req.validated.body.query));
  },

  async remove(req, res) {
    await recentSearchService.remove(req.user.id, Number(req.params.id));
    res.status(204).end();
  },

  async clear(req, res) {
    await recentSearchService.clear(req.user.id);
    res.status(204).end();
  },
};
