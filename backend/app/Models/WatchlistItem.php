<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id', 'movie_id', 'title', 'poster_path', 'backdrop_path', 'overview',
    'vote_average', 'popularity', 'release_date', 'genre_ids', 'status',
])]
class WatchlistItem extends Model
{
    public const STATUSES = ['plan_to_watch', 'watching', 'completed'];

    protected function casts(): array
    {
        return [
            'genre_ids' => 'array',
            'vote_average' => 'float',
            'popularity' => 'float',
            'release_date' => 'date:Y-m-d',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
