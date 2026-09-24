<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMovieRequest;
use App\Http\Resources\MovieResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FavoriteController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return MovieResource::collection($request->user()->favorites()->latest()->get());
    }

    public function store(StoreMovieRequest $request): JsonResponse
    {
        $favorite = $request->user()->favorites()->firstOrCreate(
            ['movie_id' => $request->validated('id')],
            $request->movieAttributes(),
        );

        return (new MovieResource($favorite))->response()->setStatusCode($favorite->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(Request $request, int $movieId): JsonResponse
    {
        $deleted = $request->user()->favorites()->where('movie_id', $movieId)->delete();

        abort_if($deleted === 0, 404, 'Movie is not in your favorites.');

        return response()->json(null, 204);
    }
}
