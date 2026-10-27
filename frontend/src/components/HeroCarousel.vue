<template>
  <section 
    v-if="currentMovie"
    class="relative w-full overflow-hidden bg-[#080b11] select-none group min-h-[460px] sm:min-h-[540px] md:min-h-[620px] lg:min-h-[700px] flex items-end"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @mouseenter="$emit('pause-autoplay')"
    @mouseleave="$emit('resume-autoplay')"
  >
    <!-- Background Backdrop with Vignettes -->
    <div class="absolute inset-0 z-0">
      <div 
        class="w-full h-full bg-cover bg-center sm:bg-[center_15%] transition-all duration-700 transform group-hover:scale-105"
        :style="{ backgroundImage: `url(${getBackdropUrl(currentMovie.backdrop_path)})` }"
      ></div>

      <!-- Vignettes -->
      <div class="absolute inset-0 bg-gradient-to-t from-[#080b11] via-[#080b11]/70 via-45% to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-[#080b11]/95 via-[#080b11]/60 via-50% to-transparent hidden sm:block"></div>
      <div class="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#080b11]/80 to-transparent"></div>
    </div>

    <!-- Desktop Arrow Controls -->
    <button 
      class="hidden md:flex absolute left-6 lg:left-10 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/75 backdrop-blur-md text-white/80 hover:text-white items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg border border-white/10 cursor-pointer"
      @click="$emit('prev')"
      aria-label="Previous slide"
    >
      <i class="fa-solid fa-chevron-left text-sm"></i>
    </button>

    <button 
      class="hidden md:flex absolute right-6 lg:right-10 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/75 backdrop-blur-md text-white/80 hover:text-white items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg border border-white/10 cursor-pointer"
      @click="$emit('next')"
      aria-label="Next slide"
    >
      <i class="fa-solid fa-chevron-right text-sm"></i>
    </button>

    <!-- Main Content Container -->
    <div class="relative z-10 w-full max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 pb-10 sm:pb-16 pt-24">
      <div class="max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        
        <!-- Big Bold Uppercase Title (Cinematic Display Typography) -->
        <h1 class="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[5.5rem] font-black text-white uppercase tracking-tight leading-[0.95] drop-shadow-2xl mb-4">
          {{ currentMovie.title }}
        </h1>

        <!-- Meta Info Row -->
        <div class="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-semibold text-zinc-300 mb-4 drop-shadow">
          <!-- Star Rating -->
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black/40 backdrop-blur-md text-amber-400 font-bold">
            <i class="fa-solid fa-star text-[11px]"></i>
            {{ formatRating(currentMovie.vote_average) }}
          </span>

          <span class="text-zinc-500 font-bold">·</span>
          <span>{{ formatYear(currentMovie.release_date) }}</span>
          
          <template v-for="name in getMovieGenres(currentMovie).slice(0, 2)" :key="name">
            <span class="text-zinc-500 font-bold">·</span>
            <span>{{ name }}</span>
          </template>

          <span class="text-zinc-500 font-bold">·</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-black/50 text-zinc-300 border border-white/10">
            HD
          </span>
        </div>

        <!-- Synopsis -->
        <p class="text-xs sm:text-sm lg:text-base text-zinc-300 leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-2xl mb-7 drop-shadow">
          {{ currentMovie.overview }}
        </p>

        <!-- CTA Action Buttons (Iconic White Pill + Dark Pill) -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          <!-- Primary CTA: Prominent White Pill Button -->
          <button 
            class="h-12 px-7 rounded-full bg-white hover:bg-zinc-200 text-black font-extrabold text-sm shadow-xl shadow-black/40 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            @click="$emit('open-details', currentMovie)"
          >
            <i class="fa-solid fa-circle-info text-base"></i>
            <span>View Details & Trailer</span>
          </button>

          <div class="flex items-center gap-2.5">
            <!-- Secondary CTA: Dark Frosted Pill Button -->
            <button 
              class="flex-1 sm:flex-initial h-12 px-6 rounded-full font-bold text-sm backdrop-blur-md flex items-center justify-center gap-2 border transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              :class="[
                isInWatchlist(currentMovie)
                  ? 'bg-amber-500 text-black border-amber-500 font-extrabold shadow-lg shadow-amber-500/25'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
              ]"
              @click="$emit('toggle-watchlist', currentMovie)"
            >
              <i :class="isInWatchlist(currentMovie) ? 'fa-solid fa-check' : 'fa-solid fa-plus'"></i>
              <span>{{ isInWatchlist(currentMovie) ? 'In Watchlist' : 'Add to Watchlist' }}</span>
            </button>

            <!-- Favorite Button: Round Frosted Heart Button -->
            <button 
              class="h-12 w-12 rounded-full backdrop-blur-md flex items-center justify-center border transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              :class="[
                isFavorite(currentMovie)
                  ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/25'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
              ]"
              @click="$emit('toggle-favorite', currentMovie)"
              :aria-label="isFavorite(currentMovie) ? 'Remove Favorite' : 'Add Favorite'"
            >
              <i :class="isFavorite(currentMovie) ? 'fa-solid fa-heart text-black' : 'fa-regular fa-heart text-zinc-200'"></i>
            </button>
          </div>

        </div>

        <!-- In-flow Mobile Pagination Dots (Fixes Collision in Screenshot 102031 & 103417) -->
        <div class="sm:hidden flex items-center justify-center gap-1.5 mt-5" v-if="movies.length > 1">
          <button 
            v-for="(movie, idx) in movies" 
            :key="movie.id"
            class="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
            :class="[
              idx === currentIndex 
                ? 'w-6 bg-amber-500 shadow-md shadow-amber-500/50' 
                : 'w-1.5 bg-white/30'
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
              : 'w-2 bg-white/30 hover:bg-white/50'
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
  return `${TMDB_IMAGE_BASE}/original${path}`
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
