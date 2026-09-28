import { z } from 'zod';
import { requiredString } from './common.js';

export const recentSearchSchema = z.object({ query: requiredString('query') });
export const movieSearchSchema = z.object({ query: requiredString('query') });
