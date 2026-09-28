import { favoriteService } from '../services/favorite.service.js';

export const favoriteController = {
  async list(req, res) {
    res.json({ data: await favoriteService.list(req.user.id) });
  },

  async add(req, res) {
    const { movie, created } = await favoriteService.add(req.user.id, req.validated.body);
    res.status(created ? 201 : 200).json({ data: movie });
  },

  async remove(req, res) {
    await favoriteService.remove(req.user.id, Number(req.params.movieId));
    res.status(204).end();
  },
};
