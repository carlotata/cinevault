import { CATEGORIES, movieService } from '../services/movie.service.js';
import { HttpError } from '../utils/httpError.js';

const page = (req) => Math.max(1, Math.min(500, Number.parseInt(req.query.page, 10) || 1));

export const movieController = {
  async byCategory(req, res) {
    const { category } = req.params;
    if (!CATEGORIES.includes(category)) throw new HttpError(404, 'Not Found');
    res.json(await movieService.byCategory(category, page(req)));
  },

  async search(req, res) {
    res.json(await movieService.search(req.validated.query.query, page(req)));
  },

  async details(req, res) {
    res.json(await movieService.details(Number(req.params.id)));
  },

  async genres(req, res) {
    res.json(await movieService.genres());
  },
};
