<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RecentSearchAndSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_recent_searches_are_deduped_capped_and_newest_first(): void
    {
        Sanctum::actingAs(User::factory()->create());

        foreach (['a', 'b', 'c', 'd', 'e', 'f', 'g'] as $q) {
            $this->travel(1)->seconds();
            $this->postJson('/api/recent-searches', ['query' => $q])->assertCreated();
        }

        $this->travel(1)->seconds();
        $response = $this->postJson('/api/recent-searches', ['query' => 'D'])->assertCreated();

        $this->assertSame(['D', 'g', 'f', 'e', 'c', 'b'], array_column($response->json(), 'query'));
        $this->getJson('/api/recent-searches')->assertJsonCount(6);
    }

    public function test_recent_search_remove_one_and_clear_all(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $first = $this->postJson('/api/recent-searches', ['query' => 'inception'])->json('0.id');
        $this->postJson('/api/recent-searches', ['query' => 'interstellar']);

        $this->deleteJson("/api/recent-searches/{$first}")->assertNoContent();
        $this->deleteJson("/api/recent-searches/{$first}")->assertNotFound();
        $this->getJson('/api/recent-searches')->assertJsonCount(1);

        $this->deleteJson('/api/recent-searches')->assertNoContent();
        $this->getJson('/api/recent-searches')->assertJsonCount(0);
    }

    public function test_recent_search_requires_query(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/recent-searches', ['query' => '   '])->assertUnprocessable();
    }

    public function test_settings_default_and_update(): void
    {
        Sanctum::actingAs(User::factory()->create()->refresh());

        $this->getJson('/api/settings')->assertOk()->assertJsonPath('dark_mode', true);
        $this->putJson('/api/settings', ['dark_mode' => false])->assertOk()->assertJsonPath('dark_mode', false);
        $this->getJson('/api/settings')->assertJsonPath('dark_mode', false);
        $this->putJson('/api/settings', ['dark_mode' => 'maybe'])->assertUnprocessable();
    }
}
