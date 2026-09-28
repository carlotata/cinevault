import { z } from 'zod';
import { requiredString } from './common.js';

export const registerSchema = z
  .object({
    name: requiredString('name'),
    email: requiredString('email').pipe(z.email('The email field must be a valid email address.')),
    password: z
      .string({ error: 'The password field is required.' })
      .min(8, 'The password field must be at least 8 characters.'),
    password_confirmation: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ['password'],
    message: 'The password field confirmation does not match.',
  });

export const loginSchema = z.object({
  email: requiredString('email'),
  password: z.string({ error: 'The password field is required.' }).min(1, 'The password field is required.'),
});
