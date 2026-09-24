<?php

namespace Tests\Feature;

use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TmdbProxyTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config(['services.tmdb.key' => 'test-key', 'services.tmdb.base_url' => 'https://tmdb.test/3']);
    }

    public function test_category_proxies_and_never_leaks_key(): void
    {
        Http::fake(['tmdb.test/*' => Http::response(['results' => [['id' => 1, 'title' => 'X']]])]);

        $this->getJson('/api/movies/category/popular')
            ->assertOk()->assertJsonPath('results.0.title', 'X')
            ->assertDontSee('test-key');

        Http::assertSent(fn (Request $r) => str_starts_with($r->url(), 'https://tmdb.test/3/movie/popular')
            && $r['api_key'] === 'test-key');
    }

    public function test_trending_uses_trending_endpoint(): void
    {
        Http::fake(['tmdb.test/*' => Http::response(['results' => []])]);

        $this->getJson('/api/movies/category/trending')->assertOk();

        Http::assertSent(fn (Request $r) => str_contains($r->url(), '/trending/movie/day'));
    }

    public function test_unknown_category_is_404(): void
    {
        Http::fake();

        $this->getJson('/api/movies/category/bogus')->assertNotFound();
        Http::assertNothingSent();
    }

    public function test_search_requires_query_and_forwards_it(): void
    {
        Http::fake(['tmdb.test/*' => Http::response(['results' => []])]);

        $this->getJson('/api/movies/search')->assertUnprocessable();
        $this->getJson('/api/movies/search?query=inception')->assertOk();

        Http::assertSent(fn (Request $r) => str_contains($r->url(), '/search/movie') && $r['query'] === 'inception');
    }

    public function test_show_requests_credits_and_videos(): void
    {
        Http::fake(['tmdb.test/*' => Http::response(['id' => 550, 'title' => 'Fight Club'])]);

        $this->getJson('/api/movies/550')->assertOk()->assertJsonPath('id', 550);

        Http::assertSent(fn (Request $r) => str_contains($r->url(), '/movie/550')
            && $r['append_to_response'] === 'credits,videos');
    }

    public function test_genres_endpoint(): void
    {
        Http::fake(['tmdb.test/*' => Http::response(['genres' => [['id' => 28, 'name' => 'Action']]])]);

        $this->getJson('/api/genres')->assertOk()->assertJsonPath('genres.0.name', 'Action');
    }

    public function test_upstream_errors_map_to_404_and_502(): void
    {
        Http::fake(['tmdb.test/3/movie/999*' => Http::response([], 404), 'tmdb.test/*' => Http::response([], 500)]);

        $this->getJson('/api/movies/999')->assertNotFound();
        $this->getJson('/api/genres')->assertStatus(502);
    }

    public function test_missing_key_returns_503(): void
    {
        config(['services.tmdb.key' => null]);

        $this->getJson('/api/genres')->assertStatus(503);
    }
}
