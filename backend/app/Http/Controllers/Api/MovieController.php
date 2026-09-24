<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * Proxies TMDB so the API key stays on the server.
 */
class MovieController extends Controller
{
    private const CACHE_SECONDS = 300;

    public function category(Request $request, string $category): JsonResponse
    {
        $path = $category === 'trending' ? '/trending/movie/day' : "/movie/{$category}";

        return $this->tmdb($path, ['page' => $this->page($request)]);
    }

    public function search(Request $request): JsonResponse
    {
        $data = $request->validate(['query' => ['required', 'string', 'max:255']]);

        return $this->tmdb('/search/movie', [
            'query' => $data['query'],
            'page' => $this->page($request),
            'include_adult' => 'false',
        ]);
    }

    public function show(int $id): JsonResponse
    {
        return $this->tmdb("/movie/{$id}", ['append_to_response' => 'credits,videos']);
    }

    public function genres(): JsonResponse
    {
        return $this->tmdb('/genre/movie/list');
    }

    private function page(Request $request): int
    {
        return max(1, min(500, (int) $request->query('page', 1)));
    }

    private function tmdb(string $path, array $query = []): JsonResponse
    {
        $key = config('services.tmdb.key');

        abort_if(empty($key), 503, 'TMDB API key is not configured.');

        $query = ['api_key' => $key, 'language' => 'en-US'] + $query;
        $cacheKey = 'tmdb:'.md5($path.serialize($query));

        if (($cached = Cache::get($cacheKey)) !== null) {
            return response()->json($cached);
        }

        try {
            $response = Http::baseUrl(config('services.tmdb.base_url'))->timeout(10)->get($path, $query);
        } catch (ConnectionException) {
            abort(502, 'Unable to reach TMDB.');
        }

        if ($response->failed()) {
            abort($response->status() === 404 ? 404 : 502, 'TMDB request failed.');
        }

        Cache::put($cacheKey, $response->json(), self::CACHE_SECONDS);

        return response()->json($response->json());
    }
}
