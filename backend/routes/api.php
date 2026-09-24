<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\MovieController;
use App\Http\Controllers\Api\RecentSearchController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\WatchlistController;
use Illuminate\Support\Facades\Route;

Route::get('/hello', function () {
    return response()->json([
        'message' => 'Hello from Den!'
    ]);
});

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

// TMDB proxy (public)
Route::middleware('throttle:60,1')->prefix('movies')->group(function () {
    Route::get('/category/{category}', [MovieController::class, 'category'])
        ->whereIn('category', ['popular', 'trending', 'top_rated', 'now_playing', 'upcoming']);
    Route::get('/search', [MovieController::class, 'search']);
    Route::get('/{id}', [MovieController::class, 'show'])->whereNumber('id');
});
Route::get('/genres', [MovieController::class, 'genres'])->middleware('throttle:60,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/settings', [SettingsController::class, 'show']);
    Route::put('/settings', [SettingsController::class, 'update']);

    Route::get('/watchlist', [WatchlistController::class, 'index']);
    Route::post('/watchlist', [WatchlistController::class, 'store']);
    Route::delete('/watchlist/completed', [WatchlistController::class, 'clearCompleted']);
    Route::patch('/watchlist/{movieId}', [WatchlistController::class, 'update'])->whereNumber('movieId');
    Route::delete('/watchlist/{movieId}', [WatchlistController::class, 'destroy'])->whereNumber('movieId');

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{movieId}', [FavoriteController::class, 'destroy'])->whereNumber('movieId');

    Route::get('/recent-searches', [RecentSearchController::class, 'index']);
    Route::post('/recent-searches', [RecentSearchController::class, 'store']);
    Route::delete('/recent-searches', [RecentSearchController::class, 'clear']);
    Route::delete('/recent-searches/{id}', [RecentSearchController::class, 'destroy'])->whereNumber('id');
});
