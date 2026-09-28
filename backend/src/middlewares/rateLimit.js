import rateLimit from 'express-rate-limit';

// Each call creates its own counter, so login attempts and movie browsing never share a limit.
export const createRateLimiter = (limit) =>
  rateLimit({
    windowMs: 60_000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ message: 'Too Many Attempts.' }),
  });
