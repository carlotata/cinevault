import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository.js';
import { HttpError, ValidationError } from '../utils/httpError.js';
import { toUserDto } from '../utils/serializers.js';
import { signToken, verifyToken } from '../utils/token.js';

const UNIQUE_VIOLATION = '23505';
const emailTaken = () => new ValidationError({ email: ['The email has already been taken.'] });

export const authService = {
  async register({ name, email, password }) {
    const normalizedEmail = email.toLowerCase();
    if (await userRepository.findByEmail(normalizedEmail)) throw emailTaken();

    let user;
    try {
      user = await userRepository.create({
        name,
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(password, 10),
      });
    } catch (error) {
      if (error.code === UNIQUE_VIOLATION) throw emailTaken();
      throw error;
    }

    return { user: toUserDto(user), token: signToken(user.id) };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email.toLowerCase());
    const valid = user && (await bcrypt.compare(password, user.password));
    if (!valid) throw new ValidationError({ email: ['The provided credentials are incorrect.'] });

    return { user: toUserDto(user), token: signToken(user.id) };
  },

  // Turns a bearer token into the current user row, or throws 401.
  async authenticate(token) {
    const userId = token ? verifyToken(token) : null;
    const user = userId ? await userRepository.findById(userId) : null;
    if (!user) throw new HttpError(401, 'Unauthenticated.');
    return user;
  },
};
