<template>
  <div 
    class="cineby-card group relative flex flex-col cursor-pointer select-none transition-all duration-300 hover:-translate-y-1.5"
    @click="$emit('open-details', movie)"
  >
    <!-- Poster Frame (Aspect 2:3) -->
    <div class="relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-[#182030] border border-zinc-200/80 dark:border-white/5 shadow-md shadow-zinc-300/40 dark:shadow-black/40 group-hover:shadow-2xl group-hover:shadow-amber-500/10 group-hover:border-amber-500/40 transition-all duration-300">
      
      <!-- Shimmer Placeholder Skeleton -->
      <div 
        v-if="!imageLoaded && posterUrl" 
        class="absolute inset-0 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 animate-pulse"
      ></div>

      <!-- Poster Image with Smooth Fade-in -->
      <img 
        v-if="posterUrl" 
        :src="posterUrl" 
        :alt="movie.title" 
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        decoding="async"
        :style="{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.4s ease, transform 0.5s ease' }"
        @load="imageLoaded = true"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 dark:text-zinc-600 text-3xl">
        <i class="fa-solid fa-film"></i>
      </div>

      <!-- HD Badge Top-Left -->
      <span class="absolute top-2.5 left-2.5 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/60 text-zinc-300 backdrop-blur-md border border-white/10 pointer-events-none">
        HD
      </span>

      <!-- Favorite Button Top-Right -->
      <button 
        class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md cursor-pointer z-10"
        :class="[
          isFavorite 
            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105' 
            : 'bg-black/50 text-white/70 hover:text-white hover:bg-black/80 hover:scale-110 border border-white/10'
        ]"
        @click.stop="$emit('toggle-favorite', movie)"
        :title="isFavorite ? 'Remove Favorite' : 'Add Favorite'"
        aria-label="Toggle Favorite"
      >
        <i :class="isFavorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart'" class="text-xs"></i>
      </button>

      <!-- Hover Overlay Actions (Centered in poster - Never covering bottom status pill) -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 z-20 backdrop-blur-[2px]">
        <button 
          class="group/btn w-10 h-10 rounded-full bg-black/70 hover:bg-amber-500 border border-white/20 hover:border-amber-500 flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl shadow-black/60 cursor-pointer"
          @click.stop="$emit('open-details', movie)" 
          title="View Details & Trailer"
          aria-label="View Details"
        >
          <i class="fa-solid fa-circle-info text-base text-white group-hover/btn:!text-black transition-colors"></i>
        </button>

        <button 
          class="group/btn w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl shadow-black/60 cursor-pointer"
          :class="[
            isInWatchlist 
              ? 'bg-amber-500 text-black border-amber-500 shadow-amber-500/30' 
              : 'bg-black/70 hover:bg-amber-500 border-white/20 hover:border-amber-500 text-white'
          ]"
          @click.stop="$emit('toggle-watchlist', movie)" 
          :title="isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'"
          aria-label="Toggle Watchlist"
        >
          <i 
            :class="[
              isInWatchlist ? 'fa-solid fa-check text-black' : 'fa-solid fa-plus text-white group-hover/btn:!text-black'
            ]" 
            class="text-base transition-colors"
          ></i>
        </button>
      </div>

      <!-- Interactive Status Pill for Watchlist Tab (Responsive, Unobstructed) -->
      <button 
        v-if="isWatchlistTab" 
        class="absolute bottom-2.5 left-2.5 right-2.5 h-7 px-2.5 sm:px-3 rounded-full text-[10px] sm:text-[11px] font-black flex items-center justify-between backdrop-blur-md transition-all cursor-pointer z-10 shadow-lg border select-none min-w-0"
        :class="statusBadgeClasses"
        @click.stop="$emit('cycle-status', movie)"
        :title="'Status: ' + statusLabel + ' (Click to cycle)'"
      >
        <span class="flex items-center gap-1.5 min-w-0 truncate">
          <i :class="statusIcon" class="text-[10px] shrink-0"></i>
          <span class="truncate">{{ statusLabel }}</span>
        </span>
        <i class="fa-solid fa-rotate text-[9px] shrink-0 opacity-75 ml-1"></i>
      </button>

    </div>

    <!-- Movie Details Below Poster -->
    <div class="pt-2.5 px-0.5 overflow-hidden w-full">
      <p 
        class="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors truncate tracking-tight leading-snug !m-0 !p-0"
        :title="movie.title"
      >
        {{ movie.title }}
      </p>
      <div class="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
        <span class="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold flex-shrink-0">
          <i class="fa-solid fa-star text-[10px]"></i>
          {{ formatRating(movie.vote_average) }}
        </span>
        <span class="text-zinc-400 dark:text-zinc-400 font-bold">·</span>
        <span class="flex-shrink-0">{{ formatYear(movie.release_date) }}</span>
        <span class="text-zinc-400 dark:text-zinc-400 font-bold">·</span>
        <span class="truncate text-zinc-500 dark:text-zinc-400">{{ primaryGenre }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  movie: { type: Object, required: true },
  isInWatchlist: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  watchStatus: { type: String, default: 'plan_to_watch' },
  isWatchlistTab: { type: Boolean, default: false },
  genres: { type: Array, default: () => [] }
})

defineEmits(['open-details', 'toggle-watchlist', 'toggle-favorite', 'cycle-status'])

const imageLoaded = ref(false)

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

const posterUrl = computed(() => {
  if (!props.movie || !props.movie.poster_path) return ''
  return `${TMDB_IMAGE_BASE}/w342${props.movie.poster_path}`
})

const formatRating = (voteAverage) => {
  if (typeof voteAverage !== 'number' || isNaN(voteAverage)) return 'N/A'
  return voteAverage.toFixed(1)
}

const formatYear = (dateString) => {
  if (!dateString) return 'TBA'
  return dateString.substring(0, 4)
}

const primaryGenre = computed(() => {
  if (props.movie.genres && props.movie.genres.length > 0) {
    return props.movie.genres[0].name
  }
  if (props.movie.genre_ids && props.movie.genre_ids.length > 0) {
    const id = props.movie.genre_ids[0]
    const found = props.genres.find(g => g.id === id)
    return found ? found.name : 'Movie'
  }
  return 'Movie'
})

const statusLabel = computed(() => {
  switch (props.watchStatus) {
    case 'completed': return 'Completed'
    case 'watching': return 'Watching'
    case 'plan_to_watch':
    default: return 'Plan to Watch'
  }
})

const statusIcon = computed(() => {
  switch (props.watchStatus) {
    case 'completed': return 'fa-solid fa-circle-check'
    case 'watching': return 'fa-solid fa-play'
    case 'plan_to_watch':
    default: return 'fa-regular fa-clock'
  }
})

const statusBadgeClasses = computed(() => {
  switch (props.watchStatus) {
    case 'completed':
      return 'bg-emerald-500/90 text-black border border-emerald-400'
    case 'watching':
      return 'bg-sky-500/90 text-white border border-sky-400'
    case 'plan_to_watch':
    default:
      return 'bg-amber-500/90 text-black border border-amber-400'
  }
})
</script>
