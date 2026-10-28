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
      <div v-if="!loading && !error" class="flex items-center gap-2">
        <span 
          v-if="totalPages > 1"
          class="text-xs font-bold px-3 py-1 rounded-full border backdrop-blur-sm transition-colors"
          :class="darkMode 
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
            : 'bg-amber-50 text-amber-700 border-amber-200'"
        >
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <span 
          class="text-xs font-bold px-3 py-1 rounded-full border backdrop-blur-sm transition-colors" 
          :class="darkMode
            ? 'bg-white/[0.05] text-zinc-300 border-white/10'
            : 'bg-zinc-100 text-zinc-700 border-zinc-200'"
        >
          {{ totalResults > 0 ? totalResults.toLocaleString() + ' Titles' : movies.length + ' Titles' }}
        </span>
      </div>
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

    <!-- Catalog Pagination Bar -->
    <div 
      v-if="totalPages > 1 && !loading && !error && movies.length > 0 && (activeTab === 'discover' || activeSearchQuery)"
      class="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t"
      :class="darkMode ? 'border-white/10' : 'border-zinc-200'"
    >
      <!-- Page Summary Info -->
      <div class="text-xs sm:text-sm font-medium" :class="darkMode ? 'text-zinc-400' : 'text-zinc-600'">
        Showing page <span class="font-extrabold text-amber-700 dark:text-amber-400">{{ currentPage }}</span> of <span class="font-extrabold" :class="darkMode ? 'text-white' : 'text-zinc-900'">{{ totalPages }}</span>
        <span v-if="totalResults > 0" class="hidden sm:inline"> ({{ totalResults.toLocaleString() }} total titles)</span>
      </div>

      <!-- Mobile Truncated Pagination (< sm, zero horizontal blowout) -->
      <nav class="flex sm:hidden items-center justify-between w-full max-w-xs mx-auto gap-1 select-none" aria-label="Mobile Catalog Pagination">
        <button
          type="button"
          :disabled="currentPage <= 1"
          @click="$emit('change-page', currentPage - 1)"
          class="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all border cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          :class="darkMode 
            ? 'bg-white/[0.04] hover:bg-white/[0.09] text-zinc-300 hover:text-white border-white/10' 
            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border-zinc-200'"
          aria-label="Previous Page"
        >
          <i class="fa-solid fa-chevron-left text-xs"></i>
        </button>

        <div class="flex items-center gap-1">
          <template v-for="(p, idx) in mobileVisiblePages" :key="'mob-' + idx">
            <span 
              v-if="p === '...'" 
              class="w-5 text-center text-xs font-bold"
              :class="darkMode ? 'text-zinc-500' : 'text-zinc-400'"
            >
              ···
            </span>
            <button
              v-else
              type="button"
              @click="$emit('change-page', p)"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold transition-all border cursor-pointer"
              :class="p === currentPage 
                ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/30' 
                : darkMode 
                  ? 'bg-white/[0.04] text-zinc-300 border-white/10' 
                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'"
              :aria-current="p === currentPage ? 'page' : undefined"
            >
              {{ p }}
            </button>
          </template>
        </div>

        <button
          type="button"
          :disabled="currentPage >= totalPages"
          @click="$emit('change-page', currentPage + 1)"
          class="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all border cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          :class="darkMode 
            ? 'bg-white/[0.04] hover:bg-white/[0.09] text-zinc-300 hover:text-white border-white/10' 
            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border-zinc-200'"
          aria-label="Next Page"
        >
          <i class="fa-solid fa-chevron-right text-xs"></i>
        </button>
      </nav>

      <!-- Desktop Pagination Buttons (>= sm) -->
      <nav class="hidden sm:flex items-center gap-1.5 sm:gap-2 select-none" aria-label="Desktop Catalog Pagination">
        <!-- First Page Button -->
        <button
          type="button"
          :disabled="currentPage <= 1"
          @click="$emit('change-page', 1)"
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all border cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          :class="darkMode 
            ? 'bg-white/[0.04] hover:bg-white/[0.09] text-zinc-300 hover:text-white border-white/10 hover:border-white/20' 
            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border-zinc-200'"
          title="First Page"
          aria-label="First Page"
        >
          <i class="fa-solid fa-angles-left"></i>
        </button>

        <!-- Previous Button -->
        <button
          type="button"
          :disabled="currentPage <= 1"
          @click="$emit('change-page', currentPage - 1)"
          class="px-3 sm:px-3.5 h-9 sm:h-10 rounded-xl flex items-center gap-2 text-xs font-bold transition-all border cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          :class="darkMode 
            ? 'bg-white/[0.04] hover:bg-white/[0.09] text-zinc-300 hover:text-white border-white/10 hover:border-white/20' 
            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border-zinc-200'"
          aria-label="Previous Page"
        >
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span class="hidden sm:inline">Prev</span>
        </button>

        <!-- Numbered Page Pills -->
        <template v-for="(p, idx) in visiblePages" :key="idx">
          <span 
            v-if="p === '...'" 
            class="w-7 sm:w-8 h-9 sm:h-10 flex items-center justify-center text-xs font-bold"
            :class="darkMode ? 'text-zinc-500' : 'text-zinc-400'"
          >
            ···
          </span>
          <button
            v-else
            type="button"
            @click="$emit('change-page', p)"
            class="min-w-[36px] sm:min-w-[40px] h-9 sm:h-10 px-2 rounded-xl flex items-center justify-center text-xs font-extrabold transition-all border cursor-pointer"
            :class="p === currentPage 
              ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/30' 
              : darkMode 
                ? 'bg-white/[0.04] hover:bg-white/[0.09] text-zinc-300 hover:text-white border-white/10 hover:border-white/20' 
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border-zinc-200'"
            :aria-current="p === currentPage ? 'page' : undefined"
          >
            {{ p }}
          </button>
        </template>

        <!-- Next Button -->
        <button
          type="button"
          :disabled="currentPage >= totalPages"
          @click="$emit('change-page', currentPage + 1)"
          class="px-3 sm:px-3.5 h-9 sm:h-10 rounded-xl flex items-center gap-2 text-xs font-bold transition-all border cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          :class="darkMode 
            ? 'bg-white/[0.04] hover:bg-white/[0.09] text-zinc-300 hover:text-white border-white/10 hover:border-white/20' 
            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border-zinc-200'"
          aria-label="Next Page"
        >
          <span class="hidden sm:inline">Next</span>
          <i class="fa-solid fa-chevron-right text-[10px]"></i>
        </button>

        <!-- Last Page Button -->
        <button
          type="button"
          :disabled="currentPage >= totalPages"
          @click="$emit('change-page', totalPages)"
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all border cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          :class="darkMode 
            ? 'bg-white/[0.04] hover:bg-white/[0.09] text-zinc-300 hover:text-white border-white/10 hover:border-white/20' 
            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border-zinc-200'"
          title="Last Page"
          aria-label="Last Page"
        >
          <i class="fa-solid fa-angles-right"></i>
        </button>
      </nav>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import MovieCard from './MovieCard.vue'

const props = defineProps({
  title: { type: String, required: true },
  movies: { type: Array, default: () => [] },
  genres: { type: Array, default: () => [] },
  activeTab: { type: String, default: 'discover' },
  activeSearchQuery: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  totalResults: { type: Number, default: 0 },
  darkMode: { type: Boolean, default: true },
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
  'open-auth',
  'change-page'
])

const mobileVisiblePages = computed(() => {
  const current = props.currentPage
  const total = props.totalPages
  if (total <= 4) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 2) {
    return [1, 2, '...', total]
  }
  if (current >= total - 1) {
    return [1, '...', total - 1, total]
  }
  return [1, '...', current, '...', total]
})

const visiblePages = computed(() => {
  const current = props.currentPage
  const total = props.totalPages
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  // Near the start: [1, 2, 3, 4, 5, '...', total]
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  // Near the end: [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  // Middle: [1, '...', current - 1, current, current + 1, '...', total]
  return [1, '...', current - 1, current, current + 1, '...', total]
})
</script>
