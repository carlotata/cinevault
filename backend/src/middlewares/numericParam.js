import { HttpError } from '../utils/httpError.js';

// Use with router.param('movieId', numericParam) so non-numeric ids are a plain 404.
export function numericParam(req, res, next, value) {
  if (!/^\d+$/.test(value)) return next(new HttpError(404, 'Not Found'));
  next();
}
