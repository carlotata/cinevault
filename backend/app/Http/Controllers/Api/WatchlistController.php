<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMovieRequest;
use App\Http\Resources\MovieResource;
use App\Models\WatchlistItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class WatchlistController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate(['status' => ['nullable', Rule::in(WatchlistItem::STATUSES)]]);

        $items = $request->user()->watchlistItems()
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->get();

        return MovieResource::collection($items);
    }

    public function store(StoreMovieRequest $request): JsonResponse
    {
        $item = $request->user()->watchlistItems()->firstOrCreate(
            ['movie_id' => $request->validated('id')],
            $request->movieAttributes() + ['status' => 'plan_to_watch'],
        );

        return (new MovieResource($item))->response()->setStatusCode($item->wasRecentlyCreated ? 201 : 200);
    }

    public function update(Request $request, int $movieId): MovieResource
    {
        $data = $request->validate(['status' => ['required', Rule::in(WatchlistItem::STATUSES)]]);

        $item = $request->user()->watchlistItems()->where('movie_id', $movieId)->firstOrFail();
        $item->update($data);

        return new MovieResource($item);
    }

    public function destroy(Request $request, int $movieId): JsonResponse
    {
        $deleted = $request->user()->watchlistItems()->where('movie_id', $movieId)->delete();

        abort_if($deleted === 0, 404, 'Movie is not in your watchlist.');

        return response()->json(null, 204);
    }

    public function clearCompleted(Request $request): JsonResponse
    {
        $removed = $request->user()->watchlistItems()->where('status', 'completed')->delete();

        return response()->json(['removed' => $removed]);
    }
}
