import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export const signToken = (userId) =>
  jwt.sign({}, config.jwtSecret, { subject: String(userId), expiresIn: config.jwtExpiresIn });

// Returns the user id from a valid token, or null.
export function verifyToken(token) {
  try {
    return Number(jwt.verify(token, config.jwtSecret).sub);
  } catch {
    return null;
  }
}
