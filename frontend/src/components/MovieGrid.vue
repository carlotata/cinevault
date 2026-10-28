<template>
  <section class="py-6 sm:py-8">
    <!-- Section Heading Row -->
    <div class="flex items-center justify-between gap-4 mb-6">
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

    <!-- Empty State (High-Conversion, Objection-Handling, Two-Beat Antithesis) -->
    <div v-else-if="movies.length === 0" class="p-8 sm:p-12 rounded-3xl theme-card-surface backdrop-blur-xl text-center max-w-xl mx-auto my-8 shadow-2xl">
      
      <!-- Dynamic Theatrical Icon -->
      <div class="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto mb-5 text-2xl sm:text-3xl border border-amber-500/20 shadow-md shadow-amber-500/10">
        <i v-if="!isLoggedIn && (activeTab === 'watchlist' || activeTab === 'favorites')" class="fa-solid fa-cloud-arrow-up"></i>
        <i v-else-if="activeTab === 'watchlist'" class="fa-solid fa-bookmark"></i>
        <i v-else-if="activeTab === 'favorites'" class="fa-solid fa-heart"></i>
        <i v-else class="fa-solid fa-magnifying-glass"></i>
      </div>

      <!-- Specific Headlines (Two-beat antithesis / Em dashes) -->
      <h3 v-if="!isLoggedIn && activeTab === 'watchlist'" class="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-2">
        Never lose a recommendation — build your private queue.
      </h3>
      <h3 v-else-if="!isLoggedIn && activeTab === 'favorites'" class="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-2">
        Curate your personal hall of fame — accessible anywhere.
      </h3>
      <h3 v-else-if="activeTab === 'watchlist'" class="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-2">
        Your queue is clear — find tonight’s next obsession.
      </h3>
      <h3 v-else-if="activeTab === 'favorites'" class="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-2">
        No classics pinned yet — start your private collection.
      </h3>
      <h3 v-else class="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-2">
        No exact title match — widen your search filters.
      </h3>
      
      <!-- Body Text (Benefit before feature / Punchy / Scannable) -->
      <p v-if="!isLoggedIn && activeTab !== 'discover'" class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5 max-w-md mx-auto">
        Stop writing movie titles in forgotten notes. Sign in to sync your personal watchlist and viewing progress across every device.
      </p>
      <p v-else-if="activeTab === 'watchlist'" class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5 max-w-md mx-auto">
        Never waste 30 minutes deciding what to stream on movie night. Bookmark any film in a single tap to queue your weekend marathon.
      </p>
      <p v-else-if="activeTab === 'favorites'" class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5 max-w-md mx-auto">
        Great stories deserve a permanent spot. Tap the heart on films you would rewatch anytime to preserve your all-time favorites.
      </p>
      <p v-else class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5 max-w-md mx-auto">
        We searched TMDB’s entire film library but found zero matching records. Clear your search or explore top genres to discover new titles.
      </p>

      <!-- 1-3 Key Bullets (Scannable, Em dashes, Benefit first) -->
      <div class="mb-6 p-4 rounded-2xl bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 text-left max-w-md mx-auto text-xs space-y-2.5">
        <template v-if="!isLoggedIn && activeTab !== 'discover'">
          <div class="flex items-start gap-2.5">
            <i class="fa-solid fa-circle-check text-amber-500 mt-0.5 text-[11px]"></i>
            <span class="text-zinc-700 dark:text-zinc-300"><strong>Cloud Sync</strong> — Access your watchlist seamlessly on any phone or desktop</span>
          </div>
          <div class="flex items-start gap-2.5">
            <i class="fa-solid fa-circle-check text-amber-500 mt-0.5 text-[11px]"></i>
            <span class="text-zinc-700 dark:text-zinc-300"><strong>Progress Tracking</strong> — Organize titles into Plan, Watching, and Completed</span>
          </div>
        </template>

        <template v-else-if="activeTab === 'watchlist'">
          <div class="flex items-start gap-2.5">
            <i class="fa-solid fa-circle-check text-amber-500 mt-0.5 text-[11px]"></i>
            <span class="text-zinc-700 dark:text-zinc-300"><strong>1-Click Bookmark</strong> — Save any trending title directly from the poster</span>
          </div>
          <div class="flex items-start gap-2.5">
            <i class="fa-solid fa-circle-check text-amber-500 mt-0.5 text-[11px]"></i>
            <span class="text-zinc-700 dark:text-zinc-300"><strong>Offline Reliability</strong> — Queue is cached on your device for instant access</span>
          </div>
        </template>

        <template v-else-if="activeTab === 'favorites'">
          <div class="flex items-start gap-2.5">
            <i class="fa-solid fa-circle-check text-amber-500 mt-0.5 text-[11px]"></i>
            <span class="text-zinc-700 dark:text-zinc-300"><strong>Instant Access</strong> — Jump straight to your highest-rated comfort films</span>
          </div>
          <div class="flex items-start gap-2.5">
            <i class="fa-solid fa-circle-check text-amber-500 mt-0.5 text-[11px]"></i>
            <span class="text-zinc-700 dark:text-zinc-300"><strong>Theatrical Posters</strong> — High-definition visual cards for your top picks</span>
          </div>
        </template>

        <template v-else>
          <div class="flex items-start gap-2.5">
            <i class="fa-solid fa-circle-check text-amber-500 mt-0.5 text-[11px]"></i>
            <span class="text-zinc-700 dark:text-zinc-300"><strong>Spelling Check</strong> — Verify actor names, keywords, or alternative titles</span>
          </div>
          <div class="flex items-start gap-2.5">
            <i class="fa-solid fa-circle-check text-amber-500 mt-0.5 text-[11px]"></i>
            <span class="text-zinc-700 dark:text-zinc-300"><strong>Reset Filters</strong> — Explore top-rated releases across all categories</span>
          </div>
        </template>
      </div>

      <!-- Objection Handling Before CTA -->
      <p class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-4 flex items-center justify-center gap-2">
        <i class="fa-solid fa-shield-halved text-emerald-500"></i>
        <span>100% Free · No Credit Card Required · Zero Spam</span>
      </p>
      
      <!-- Primary CTA: Clear Verb + Outcome -->
      <button 
        v-if="!isLoggedIn && activeTab !== 'discover'" 
        class="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer" 
        @click="$emit('open-auth', 'login')"
      >
        <i class="fa-solid fa-right-to-bracket"></i>
        <span>Sign In or Create Free Account</span>
      </button>

      <button 
        v-else-if="activeTab === 'watchlist'" 
        class="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer" 
        @click="$emit('empty-action')"
      >
        <i class="fa-solid fa-compass"></i>
        <span>Explore Trending Movies Now</span>
      </button>

      <button 
        v-else-if="activeTab === 'favorites'" 
        class="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer" 
        @click="$emit('empty-action')"
      >
        <i class="fa-solid fa-star"></i>
        <span>Discover Top-Rated Classics</span>
      </button>

      <button 
        v-else 
        class="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-full bg-zinc-900 hover:bg-black dark:bg-white/10 dark:hover:bg-white/20 text-white font-extrabold text-xs border border-zinc-800 dark:border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer" 
        @click="$emit('empty-action')"
      >
        <i class="fa-solid fa-rotate-left"></i>
        <span>Reset All Search Filters</span>
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