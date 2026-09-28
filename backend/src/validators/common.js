import { z } from 'zod';

export const requiredString = (label, max = 255) =>
  z
    .string({ error: `The ${label} field is required.` })
    .trim()
    .min(1, `The ${label} field is required.`)
    .max(max, `The ${label} field must not be greater than ${max} characters.`);

export const emptyToNull = (value) => (value === '' ? null : value);
