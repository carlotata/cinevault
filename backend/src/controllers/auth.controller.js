import { authService } from '../services/auth.service.js';
import { toUserDto } from '../utils/serializers.js';

export const authController = {
  async register(req, res) {
    res.status(201).json(await authService.register(req.validated.body));
  },

  async login(req, res) {
    res.json(await authService.login(req.validated.body));
  },

  // Tokens are stateless JWTs, so logging out is the client discarding its token.
  logout(req, res) {
    res.json({ message: 'Logged out.' });
  },

  me(req, res) {
    res.json(toUserDto(req.user));
  },
};
