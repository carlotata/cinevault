<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMovieRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // Movie detail responses from TMDB carry `genres` objects instead of `genre_ids`.
        if (! $this->has('genre_ids') && is_array($this->input('genres'))) {
            $this->merge([
                'genre_ids' => collect($this->input('genres'))->pluck('id')->filter()->values()->all(),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'id' => ['required', 'integer', 'min:1'],
            'title' => ['required', 'string', 'max:255'],
            'poster_path' => ['nullable', 'string', 'max:255'],
            'backdrop_path' => ['nullable', 'string', 'max:255'],
            'overview' => ['nullable', 'string'],
            'vote_average' => ['nullable', 'numeric', 'between:0,10'],
            'popularity' => ['nullable', 'numeric', 'min:0'],
            'release_date' => ['nullable', 'date'],
            'genre_ids' => ['nullable', 'array'],
            'genre_ids.*' => ['integer'],
        ];
    }

    public function movieAttributes(): array
    {
        $data = $this->validated();

        return [
            'title' => $data['title'],
            'poster_path' => $data['poster_path'] ?? null,
            'backdrop_path' => $data['backdrop_path'] ?? null,
            'overview' => $data['overview'] ?? null,
            'vote_average' => $data['vote_average'] ?? null,
            'popularity' => $data['popularity'] ?? null,
            'release_date' => $data['release_date'] ?? null,
            'genre_ids' => $data['genre_ids'] ?? [],
        ];
    }
}
