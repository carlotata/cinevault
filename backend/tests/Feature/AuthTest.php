<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receives_token(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Den',
            'email' => 'den@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated()->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);

        $this->assertDatabaseHas('users', ['email' => 'den@example.com']);
    }

    public function test_register_validates_input(): void
    {
        $this->postJson('/api/register', ['email' => 'nope'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        User::factory()->create(['email' => 'den@example.com', 'password' => 'password123']);

        $this->postJson('/api/login', ['email' => 'den@example.com', 'password' => 'password123'])
            ->assertOk()->assertJsonStructure(['user', 'token']);
    }

    public function test_login_rejects_wrong_password(): void
    {
        User::factory()->create(['email' => 'den@example.com', 'password' => 'password123']);

        $this->postJson('/api/login', ['email' => 'den@example.com', 'password' => 'wrong'])
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);
    }

    public function test_token_authenticates_and_logout_revokes_it(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->getJson('/api/user')->assertOk()->assertJsonPath('id', $user->id);
        $this->withToken($token)->postJson('/api/logout')->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_protected_routes_require_authentication(): void
    {
        foreach (['/api/user', '/api/watchlist', '/api/favorites', '/api/recent-searches', '/api/settings'] as $url) {
            $this->getJson($url)->assertUnauthorized();
        }
    }
}
