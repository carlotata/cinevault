import { authService } from '../services/auth.service.js';

export async function authenticate(req, res, next) {
  const header = req.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  req.user = await authService.authenticate(token);
  next();
}
