import { watchlistService } from '../services/watchlist.service.js';

export const watchlistController = {
  async list(req, res) {
    res.json({ data: await watchlistService.list(req.user.id, req.validated.query.status) });
  },

  async add(req, res) {
    const { movie, created } = await watchlistService.add(req.user.id, req.validated.body);
    res.status(created ? 201 : 200).json({ data: movie });
  },

  async updateStatus(req, res) {
    const movie = await watchlistService.updateStatus(req.user.id, Number(req.params.movieId), req.validated.body.status);
    res.json({ data: movie });
  },

  async remove(req, res) {
    await watchlistService.remove(req.user.id, Number(req.params.movieId));
    res.status(204).end();
  },

  async clearCompleted(req, res) {
    res.json(await watchlistService.clearCompleted(req.user.id));
  },
};
