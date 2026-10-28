<template>
  <section class="py-6 sm:py-8">
    <!-- Section Heading Row (Only displayed for Discover and Search to avoid duplicate titles on Watchlist/Favorites) -->
    <div v-if="activeTab !== 'watchlist' && activeTab !== 'favorites'" class="flex items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        <span class="w-2 h-6 sm:h-7 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-md shadow-amber-500/30"></span>
        <h2 class="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight !m-0 !p-0">
          {{ title }}
        </h2>
      </div>
      <span 
        class="text-xs font-bold px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/[0.05] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 backdrop-blur-sm" 
        v-if="!loading && !error"
      >
        {{ movies.length }} {{ movies.length === 1 ? 'Title' : 'Titles' }}
      </span>
    </div>

    <!-- Loading State Skeleton -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
      <div v-for="i in 12" :key="i" class="flex flex-col">
        <div class="relative w-full aspect-[2/3] rounded-2xl bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-white/5 overflow-hidden animate-pulse">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.04] dark:via-white/[0.04] to-transparent skeleton-shimmer"></div>
        </div>
        <div class="pt-2.5 px-0.5 space-y-1.5">
          <div class="h-3.5 bg-zinc-300 dark:bg-zinc-800 rounded w-3/4 animate-pulse"></div>
          <div class="h-2.5 bg-zinc-200 dark:bg-zinc-800/60 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-8 sm:p-12 rounded-3xl bg-white dark:bg-zinc-900/60 border border-red-500/30 dark:border-red-500/20 backdrop-blur-xl text-center max-w-xl mx-auto my-8 shadow-2xl">
      <div class="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center mx-auto mb-4 text-2xl border border-red-500/20">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <h3 class="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-2">Connection Interrupted — Reconnecting to TMDB</h3>
      <p class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">{{ error }}</p>
      <button 
        class="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer" 
        @click="$emit('retry')"
      >
        <i class="fa-solid fa-rotate-right"></i>
        <span>Reload Live Catalog</span>
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="movies.length === 0" class="p-8 sm:p-14 rounded-3xl theme-card-surface backdrop-blur-xl text-center max-w-xl mx-auto my-8 shadow-2xl">
      <div class="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 text-3xl border border-amber-500/20">
        <i class="fa-solid fa-film"></i>
      </div>

      <h3 v-if="!isLoggedIn && activeTab === 'watchlist'" class="!text-lg sm:!text-xl !font-bold text-zinc-900 dark:text-white mb-2">
        Sign in to Use Your Watchlist
      </h3>
      <h3 v-else-if="!isLoggedIn && activeTab === 'favorites'" class="!text-lg sm:!text-xl !font-bold text-zinc-900 dark:text-white mb-2">
        Sign in to See Your Favorites
      </h3>
      <h3 v-else-if="activeTab === 'watchlist'" class="!text-lg sm:!text-xl !font-bold text-zinc-900 dark:text-white mb-2">
        Your Watchlist is Empty
      </h3>
      <h3 v-else-if="activeTab === 'favorites'" class="!text-lg sm:!text-xl !font-bold text-zinc-900 dark:text-white mb-2">
        No Favorite Movies Yet
      </h3>
      <h3 v-else class="!text-lg sm:!text-xl !font-bold text-zinc-900 dark:text-white mb-2">
        No Movies Found
      </h3>
      
      <p v-if="!isLoggedIn && activeTab !== 'discover'" class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
        Your watchlist and favorites are saved to your CineVault account, so they follow you on any device.
      </p>
      <p v-else-if="activeTab === 'watchlist'" class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
        Keep track of what you want to watch. Click the bookmark button on any movie card to add it here.
      </p>
      <p v-else-if="activeTab === 'favorites'" class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
        Save your all-time favorite movies here. Click the heart button on any movie card to add it.
      </p>
      <p v-else class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
        We couldn't find any movies matching your search or filters. Try adjusting your search query or reset the filters.
      </p>
      
      <button 
        v-if="!isLoggedIn && activeTab !== 'discover'" 
        class="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer" 
        @click="$emit('open-auth', 'login')"
      >
        <i class="fa-solid fa-right-to-bracket"></i> Sign in
      </button>
      <button 
        v-else-if="activeTab !== 'discover' || activeSearchQuery" 
        class="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/20 text-zinc-800 dark:text-white font-bold text-xs border border-zinc-200 dark:border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer" 
        @click="$emit('empty-action')"
      >
        <i class="fa-solid fa-compass"></i> Discover Movies
      </button>
    </div>

    <!-- Movies Grid (Adaptive 2-column mobile to 6-column widescreen) -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
      <MovieCard
        v-for="movie in movies"
        :key="movie.id"
        :movie="movie"
        :genres="genres"
        :is-in-watchlist="isInWatchlist(movie)"
        :is-favorite="isFavorite(movie)"
        :watch-status="getWatchStatus(movie.id)"
        :is-watchlist-tab="activeTab === 'watchlist'"
        @open-details="$emit('open-details', movie)"
        @toggle-watchlist="$emit('toggle-watchlist', movie)"
        @toggle-favorite="$emit('toggle-favorite', movie)"
        @cycle-status="$emit('cycle-status', movie)"
      />
    </div>
  </section>
</template>

<script setup>
import MovieCard from './MovieCard.vue'

defineProps({
  title: { type: String, required: true },
  movies: { type: Array, default: () => [] },
  genres: { type: Array, default: () => [] },
  activeTab: { type: String, default: 'discover' },
  activeSearchQuery: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
  isLoggedIn: { type: Boolean, default: false },
  isInWatchlist: { type: Function, required: true },
  isFavorite: { type: Function, required: true },
  getWatchStatus: { type: Function, required: true }
})

defineEmits([
  'open-details',
  'toggle-watchlist',
  'toggle-favorite',
  'cycle-status',
  'retry',
  'empty-action',
  'open-auth'
])
</script>