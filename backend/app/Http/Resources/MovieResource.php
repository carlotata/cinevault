<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MovieResource extends JsonResource
{
    /**
     * Mirrors TMDB's movie shape (`id` is the TMDB id) so the frontend can render it unchanged.
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->movie_id,
            'title' => $this->title,
            'poster_path' => $this->poster_path,
            'backdrop_path' => $this->backdrop_path,
            'overview' => $this->overview,
            'vote_average' => $this->vote_average,
            'popularity' => $this->popularity,
            'release_date' => $this->release_date?->format('Y-m-d'),
            'genre_ids' => $this->genre_ids ?? [],
        ];

        if (isset($this->status)) {
            $data['status'] = $this->status;
        }

        return $data;
    }
}
