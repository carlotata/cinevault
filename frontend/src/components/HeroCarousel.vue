<template>
  <section 
    v-if="currentMovie"
    class="relative w-full overflow-hidden select-none group min-h-[460px] sm:min-h-[540px] md:min-h-[620px] lg:min-h-[700px] flex items-end transition-colors duration-200"
    :class="darkMode ? 'bg-[#080b11]' : 'bg-[#f4f6fa]'"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @mouseenter="$emit('pause-autoplay')"
    @mouseleave="$emit('resume-autoplay')"
  >
    <!-- Background Backdrop with Vignettes -->
    <div class="absolute inset-0 z-0">
      <div 
        class="w-full h-full bg-cover bg-center sm:bg-[center_15%] transition-all duration-700 transform group-hover:scale-105"
        :class="darkMode ? '' : 'brightness-[0.98] contrast-[1.03]'"
        :style="{ backgroundImage: `url(${getBackdropUrl(currentMovie.backdrop_path)})` }"
      ></div>

      <!-- Dark Mode Vignette Layer (Cross-fades smoothly via opacity) -->
      <div 
        class="absolute inset-0 transition-opacity duration-200 ease-out pointer-events-none"
        :class="darkMode ? 'opacity-100' : 'opacity-0'"
      >
        <div class="absolute inset-0 bg-gradient-to-t from-[#080b11] via-[#080b11]/70 via-45% to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-[#080b11]/95 via-[#080b11]/60 via-50% to-transparent hidden sm:block"></div>
        <div class="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#080b11]/85 to-transparent"></div>
      </div>

      <!-- Light Mode Vignette Layer (Vivid artwork with focused text scrim, never washed out) -->
      <div 
        class="absolute inset-0 transition-opacity duration-200 ease-out pointer-events-none"
        :class="!darkMode ? 'opacity-100' : 'opacity-0'"
      >
        <div class="absolute inset-0 bg-gradient-to-t from-[#f4f6fa] via-[#f4f6fa]/40 via-30% to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-[#f4f6fa]/90 via-[#f4f6fa]/35 via-45% to-transparent hidden sm:block"></div>
        <div class="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#f4f6fa]/70 to-transparent"></div>
      </div>
    </div>

    <!-- Desktop Arrow Controls -->
    <button 
      class="hidden md:flex absolute left-6 lg:left-10 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full backdrop-blur-md items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg border cursor-pointer"
      :class="darkMode
        ? 'bg-black/40 hover:bg-black/75 text-white/80 hover:text-white border-white/10'
        : 'bg-white/90 hover:bg-white text-zinc-800 hover:text-zinc-950 border-zinc-300/80 shadow-md'"
      @click="$emit('prev')"
      aria-label="Previous slide"
    >
      <i class="fa-solid fa-chevron-left text-sm"></i>
    </button>

    <button 
      class="hidden md:flex absolute right-6 lg:right-10 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full backdrop-blur-md items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg border cursor-pointer"
      :class="darkMode
        ? 'bg-black/40 hover:bg-black/75 text-white/80 hover:text-white border-white/10'
        : 'bg-white/90 hover:bg-white text-zinc-800 hover:text-zinc-950 border-zinc-300/80 shadow-md'"
      @click="$emit('next')"
      aria-label="Next slide"
    >
      <i class="fa-solid fa-chevron-right text-sm"></i>
    </button>

    <!-- Main Content Container -->
    <div class="relative z-10 w-full max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 pb-10 sm:pb-16 pt-24">
      <div class="max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        
        <!-- Big Bold Uppercase Title (Cinematic Display Typography) -->
        <h1 
          class="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem] font-black uppercase tracking-tight leading-[0.98] break-words line-clamp-3 mb-3.5 transition-colors"
          :class="darkMode ? 'text-white drop-shadow-2xl' : 'text-zinc-950 drop-shadow-sm'"
        >
          {{ currentMovie.title }}
        </h1>

        <!-- Meta Info Row -->
        <div 
          class="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-semibold mb-3.5 transition-colors"
          :class="darkMode ? 'text-zinc-300 drop-shadow' : 'text-zinc-700'"
        >
          <!-- Star Rating -->
          <span 
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md backdrop-blur-md font-bold transition-colors"
            :class="darkMode ? 'bg-black/50 text-amber-400 border border-white/10' : 'bg-white/95 text-amber-600 border border-zinc-200/90 shadow-xs'"
          >
            <i class="fa-solid fa-star text-[11px]"></i>
            {{ formatRating(currentMovie.vote_average) }}
          </span>

          <span :class="darkMode ? 'text-zinc-500' : 'text-zinc-400'" class="font-bold">·</span>
          <span>{{ formatYear(currentMovie.release_date) }}</span>
          
          <template v-for="name in getMovieGenres(currentMovie).slice(0, 2)" :key="name">
            <span :class="darkMode ? 'text-zinc-500' : 'text-zinc-400'" class="font-bold">·</span>
            <span>{{ name }}</span>
          </template>

          <span :class="darkMode ? 'text-zinc-500' : 'text-zinc-400'" class="font-bold">·</span>
          <span 
            class="px-2 py-0.5 rounded text-[10px] font-black uppercase transition-colors"
            :class="darkMode ? 'bg-black/50 text-zinc-300 border border-white/10' : 'bg-white/95 text-zinc-800 border border-zinc-300/80 shadow-xs'"
          >
            HD
          </span>
        </div>

        <!-- Synopsis -->
        <p 
          class="text-xs sm:text-sm lg:text-base leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-2xl mb-6 transition-colors"
          :class="darkMode ? 'text-zinc-300 drop-shadow' : 'text-zinc-700'"
        >
          {{ currentMovie.overview }}
        </p>

        <!-- CTA Action Buttons -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          <!-- Primary CTA: View Details & Trailer -->
          <button 
            class="h-12 px-7 rounded-full font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            :class="darkMode 
              ? 'bg-white hover:bg-zinc-200 text-black shadow-xl shadow-black/40' 
              : 'bg-zinc-950 hover:bg-black text-white shadow-xl shadow-zinc-950/20'"
            @click="$emit('open-details', currentMovie)"
          >
            <i class="fa-solid fa-circle-info text-base"></i>
            <span>View Details & Trailer</span>
          </button>

          <div class="flex items-center gap-2.5">
            <!-- Secondary CTA: Watchlist Button -->
            <button 
              class="flex-1 sm:flex-initial h-12 px-6 rounded-full font-bold text-sm backdrop-blur-md flex items-center justify-center gap-2 border transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              :class="[
                isInWatchlist(currentMovie)
                  ? 'bg-amber-500 text-black border-amber-500 font-extrabold shadow-lg shadow-amber-500/25'
                  : (darkMode 
                      ? 'bg-white/10 hover:bg-white/15 text-white border-white/10' 
                      : 'bg-white/95 hover:bg-white text-zinc-900 border-zinc-300 shadow-sm')
              ]"
              @click="$emit('toggle-watchlist', currentMovie)"
            >
              <i :class="isInWatchlist(currentMovie) ? 'fa-solid fa-check' : 'fa-solid fa-plus'"></i>
              <span>{{ isInWatchlist(currentMovie) ? 'In Watchlist' : 'Add to Watchlist' }}</span>
            </button>

            <!-- Favorite Button -->
            <button 
              class="h-12 w-12 rounded-full backdrop-blur-md flex items-center justify-center border transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              :class="[
                isFavorite(currentMovie)
                  ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/25'
                  : (darkMode 
                      ? 'bg-white/10 hover:bg-white/15 text-white border-white/10' 
                      : 'bg-white/95 hover:bg-white text-zinc-800 border-zinc-300 shadow-sm')
              ]"
              @click="$emit('toggle-favorite', currentMovie)"
              :aria-label="isFavorite(currentMovie) ? 'Remove Favorite' : 'Add Favorite'"
            >
              <i :class="isFavorite(currentMovie) ? 'fa-solid fa-heart text-black' : 'fa-regular fa-heart text-zinc-400 dark:text-zinc-200'"></i>
            </button>
          </div>

        </div>

        <!-- In-flow Mobile Pagination Dots -->
        <div class="sm:hidden flex items-center justify-center gap-1.5 mt-5" v-if="movies.length > 1">
          <button 
            v-for="(movie, idx) in movies" 
            :key="movie.id"
            class="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
            :class="[
              idx === currentIndex 
                ? 'w-6 bg-amber-500 shadow-md shadow-amber-500/50' 
                : (darkMode ? 'w-1.5 bg-white/30' : 'w-1.5 bg-zinc-400/50')
            ]"
            :aria-label="`Slide ${idx + 1}`"
            @click="$emit('set-index', idx)"
          ></button>
        </div>

      </div>

      <!-- Desktop Pagination Dots (Bottom Right) -->
      <div class="hidden sm:flex absolute right-6 lg:right-10 bottom-8 items-center gap-2">
        <button 
          v-for="(movie, idx) in movies" 
          :key="movie.id"
          class="h-2 rounded-full transition-all duration-300 cursor-pointer"
          :class="[
            idx === currentIndex 
              ? 'w-7 bg-amber-500 shadow-md shadow-amber-500/50' 
              : (darkMode ? 'w-2 bg-white/30 hover:bg-white/50' : 'w-2 bg-zinc-400/50 hover:bg-zinc-600')
          ]"
          :aria-label="`Slide ${idx + 1}`"
          @click="$emit('set-index', idx)"
        ></button>
      </div>

    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  movies: { type: Array, default: () => [] },
  currentIndex: { type: Number, default: 0 },
  genres: { type: Array, default: () => [] },
  darkMode: { type: Boolean, default: true },
  isInWatchlist: { type: Function, required: true },
  isFavorite: { type: Function, required: true }
})

const emit = defineEmits([
  'open-details', 
  'toggle-watchlist', 
  'toggle-favorite', 
  'set-index', 
  'next', 
  'prev',
  'pause-autoplay',
  'resume-autoplay'
])

const currentMovie = computed(() => {
  if (!props.movies || props.movies.length === 0) return null
  return props.movies[props.currentIndex] || props.movies[0]
})

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

const getBackdropUrl = (path) => {
  if (!path) return ''
  return `${TMDB_IMAGE_BASE}/w1280${path}`
}

const formatYear = (dateString) => {
  if (!dateString) return 'TBA'
  return dateString.substring(0, 4)
}

const formatRating = (voteAverage) => {
  if (typeof voteAverage !== 'number' || isNaN(voteAverage)) return 'N/A'
  return voteAverage.toFixed(1)
}

const getMovieGenres = (movie) => {
  if (!movie) return []
  if (movie.genres && Array.isArray(movie.genres)) {
    return movie.genres.map(g => g.name)
  }
  if (movie.genre_ids && Array.isArray(movie.genre_ids)) {
    return movie.genre_ids
      .map(id => {
        const found = props.genres.find(g => g.id === id)
        return found ? found.name : null
      })
      .filter(Boolean)
  }
  return []
}

// Touch swipe handling
const touchStartX = ref(0)
const touchStartY = ref(0)

const handleTouchStart = (e) => {
  if (!e.changedTouches || e.changedTouches.length === 0) return
  touchStartX.value = e.changedTouches[0].clientX
  touchStartY.value = e.changedTouches[0].clientY
}

const handleTouchEnd = (e) => {
  if (!e.changedTouches || e.changedTouches.length === 0) return
  const deltaX = e.changedTouches[0].clientX - touchStartX.value
  const deltaY = e.changedTouches[0].clientY - touchStartY.value
  if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
    if (deltaX < 0) {
      emit('next')
    } else {
      emit('prev')
    }
  }
}
</script>