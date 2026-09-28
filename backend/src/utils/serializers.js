export const toUserDto = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  dark_mode: row.dark_mode,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

// Mirrors TMDB's movie shape (`id` is the TMDB id) so the frontend can render it unchanged.
export const toMovieDto = (row) => ({
  id: row.movie_id,
  title: row.title,
  poster_path: row.poster_path,
  backdrop_path: row.backdrop_path,
  overview: row.overview,
  vote_average: row.vote_average,
  popularity: row.popularity,
  release_date: row.release_date,
  genre_ids: row.genre_ids ?? [],
  ...(row.status ? { status: row.status } : {}),
});
