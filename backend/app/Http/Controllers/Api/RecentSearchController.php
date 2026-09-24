<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecentSearchController extends Controller
{
    private const LIMIT = 6;

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->list($request));
    }

    public function store(Request $request): JsonResponse
    {
        $query = trim($request->validate(['query' => ['required', 'string', 'max:255']])['query']);

        abort_if($query === '', 422, 'The query field is required.');

        $existing = $request->user()->recentSearches()
            ->whereRaw('lower(query) = ?', [mb_strtolower($query)])
            ->first();

        if ($existing) {
            $existing->update(['query' => $query]);
            $existing->touch();
        } else {
            $request->user()->recentSearches()->create(['query' => $query]);
        }

        $stale = $request->user()->recentSearches()
            ->orderByDesc('updated_at')->orderByDesc('id')
            ->pluck('id')->slice(self::LIMIT);
        $request->user()->recentSearches()->whereKey($stale)->delete();

        return response()->json($this->list($request), 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $deleted = $request->user()->recentSearches()->whereKey($id)->delete();

        abort_if($deleted === 0, 404, 'Search not found.');

        return response()->json(null, 204);
    }

    public function clear(Request $request): JsonResponse
    {
        $request->user()->recentSearches()->delete();

        return response()->json(null, 204);
    }

    private function list(Request $request): array
    {
        return $request->user()->recentSearches()
            ->orderByDesc('updated_at')->orderByDesc('id')
            ->limit(self::LIMIT)
            ->get(['id', 'query'])
            ->toArray();
    }
}
