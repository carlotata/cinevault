import { z } from 'zod';
import { emptyToNull, requiredString } from './common.js';

export const WATCH_STATUSES = ['plan_to_watch', 'watching', 'completed'];
const statusSchema = z.enum(WATCH_STATUSES, { error: 'The selected status is invalid.' });

const optionalString = (label, max = 255) =>
  z.preprocess(emptyToNull, z.string({ error: `The ${label} field must be a string.` }).max(max).nullish());

// Accepts TMDB list items (`genre_ids`) and TMDB detail responses (`genres: [{ id }]`).
export const movieSchema = z
  .object({
    id: z
      .number({ error: 'The id field is required.' })
      .int('The id field must be an integer.')
      .min(1, 'The id field must be at least 1.'),
    title: requiredString('title'),
    poster_path: optionalString('poster path'),
    backdrop_path: optionalString('backdrop path'),
    overview: optionalString('overview', 65535),
    vote_average: z.preprocess(
      emptyToNull,
      z.number({ error: 'The vote average field must be a number.' }).min(0).max(10).nullish(),
    ),
    popularity: z.preprocess(
      emptyToNull,
      z.number({ error: 'The popularity field must be a number.' }).min(0).nullish(),
    ),
    release_date: z.preprocess(
      emptyToNull,
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'The release date field must be a valid date.')
        .refine((value) => !Number.isNaN(Date.parse(value)), 'The release date field must be a valid date.')
        .nullish(),
    ),
    genre_ids: z.array(z.number().int()).nullish(),
    genres: z.array(z.object({ id: z.number().int() })).nullish(),
  })
  .transform(({ genres, ...movie }) => ({
    ...movie,
    genre_ids: movie.genre_ids ?? genres?.map((genre) => genre.id) ?? [],
  }));

export const watchlistQuerySchema = z.object({ status: statusSchema.optional() });
export const watchlistStatusSchema = z.object({ status: statusSchema });
