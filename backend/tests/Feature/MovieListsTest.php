<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MovieListsTest extends TestCase
{
    use RefreshDatabase;

    private function movie(array $overrides = []): array
    {
        return array_merge([
            'id' => 550,
            'title' => 'Fight Club',
            'poster_path' => '/poster.jpg',
            'backdrop_path' => '/backdrop.jpg',
            'overview' => 'An insomniac...',
            'vote_average' => 8.4,
            'popularity' => 61.4,
            'release_date' => '1999-10-15',
            'genre_ids' => [18, 53],
        ], $overrides);
    }

    public function test_watchlist_add_list_and_idempotent_add(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/watchlist', $this->movie())
            ->assertCreated()
            ->assertJsonPath('data.id', 550)
            ->assertJsonPath('data.status', 'plan_to_watch')
            ->assertJsonPath('data.genre_ids', [18, 53]);

        $this->postJson('/api/watchlist', $this->movie())->assertOk();

        $this->getJson('/api/watchlist')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_watchlist_accepts_tmdb_detail_shape_with_genres(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $payload = $this->movie(['genres' => [['id' => 18, 'name' => 'Drama']]]);
        unset($payload['genre_ids']);

        $this->postJson('/api/watchlist', $payload)->assertCreated()->assertJsonPath('data.genre_ids', [18]);
    }

    public function test_watchlist_status_update_filter_and_clear_completed(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $this->postJson('/api/watchlist', $this->movie(['id' => 1, 'title' => 'One']));
        $this->postJson('/api/watchlist', $this->movie(['id' => 2, 'title' => 'Two']));

        $this->patchJson('/api/watchlist/1', ['status' => 'completed'])->assertOk()->assertJsonPath('data.status', 'completed');
        $this->patchJson('/api/watchlist/2', ['status' => 'bogus'])->assertUnprocessable();
        $this->patchJson('/api/watchlist/999', ['status' => 'watching'])->assertNotFound();

        $this->getJson('/api/watchlist?status=completed')->assertJsonCount(1, 'data');

        $this->deleteJson('/api/watchlist/completed')->assertOk()->assertJsonPath('removed', 1);
        $this->getJson('/api/watchlist')->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', 2);
    }

    public function test_watchlist_remove_and_missing_movie(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $this->postJson('/api/watchlist', $this->movie());

        $this->deleteJson('/api/watchlist/550')->assertNoContent();
        $this->deleteJson('/api/watchlist/550')->assertNotFound();
    }

    public function test_watchlist_validates_payload(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/watchlist', ['title' => 'No id'])->assertUnprocessable()->assertJsonValidationErrors(['id']);
    }

    public function test_lists_are_scoped_per_user(): void
    {
        $alice = User::factory()->create();
        $bob = User::factory()->create();

        Sanctum::actingAs($alice);
        $this->postJson('/api/watchlist', $this->movie());
        $this->postJson('/api/favorites', $this->movie());

        Sanctum::actingAs($bob);
        $this->getJson('/api/watchlist')->assertJsonCount(0, 'data');
        $this->getJson('/api/favorites')->assertJsonCount(0, 'data');
        $this->deleteJson('/api/watchlist/550')->assertNotFound();
    }

    public function test_favorites_add_list_and_remove(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/favorites', $this->movie())->assertCreated()->assertJsonMissingPath('data.status');
        $this->postJson('/api/favorites', $this->movie())->assertOk();
        $this->getJson('/api/favorites')->assertJsonCount(1, 'data');

        $this->deleteJson('/api/favorites/550')->assertNoContent();
        $this->deleteJson('/api/favorites/550')->assertNotFound();
    }
}
