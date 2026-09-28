import { z } from 'zod';

export const settingsSchema = z.object({
  dark_mode: z
    .union([z.boolean(), z.literal(0), z.literal(1), z.literal('0'), z.literal('1')], {
      error: 'The dark mode field must be true or false.',
    })
    .transform((value) => value === true || value === 1 || value === '1'),
});
