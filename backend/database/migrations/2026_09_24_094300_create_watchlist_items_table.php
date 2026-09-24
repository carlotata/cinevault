<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('watchlist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('movie_id');
            $table->string('title');
            $table->string('poster_path')->nullable();
            $table->string('backdrop_path')->nullable();
            $table->text('overview')->nullable();
            $table->decimal('vote_average', 3, 1)->nullable();
            $table->decimal('popularity', 10, 3)->nullable();
            $table->date('release_date')->nullable();
            $table->json('genre_ids')->nullable();
            $table->string('status')->default('plan_to_watch');
            $table->timestamps();

            $table->unique(['user_id', 'movie_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('watchlist_items');
    }
};
