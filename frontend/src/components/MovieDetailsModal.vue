<template>
  <Teleport to="body">
    <transition name="cineby-modal-fade">
      <div 
        v-if="movie" 
        class="fixed inset-0 z-50 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto" 
        :class="darkMode ? 'bg-black/85' : 'bg-black/60'"
        @click.self="$emit('close')"
        role="dialog"
        aria-modal="true"
        :aria-label="movie.title"
      >
        <div 
          class="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] border-t sm:border rounded-t-3xl sm:rounded-3xl overflow-y-auto block sm:my-auto no-scrollbar transition-all"
          :class="[
            darkMode
              ? 'bg-[#111622] border-white/10 text-white shadow-2xl shadow-black/90'
              : 'bg-white border-zinc-200 text-zinc-900 shadow-2xl shadow-zinc-400/20'
          ]"
        >
          
          <!-- Sticky Top Close Button Bar -->
          <div class="sticky top-3 sm:top-4 z-40 flex justify-end px-3 sm:px-4 pointer-events-none -mb-10 sm:-mb-12">
            <button 
              class="pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all hover:scale-110 active:scale-95 shadow-xl cursor-pointer" 
              :class="[
                darkMode
                  ? 'bg-black/75 hover:bg-black/95 text-white/90 hover:text-white border-white/20'
                  : 'bg-white/95 hover:bg-white text-zinc-700 hover:text-black border-zinc-300 shadow-md'
              ]"
              @click="$emit('close')" 
              aria-label="Close modal"
            >
              <i class="fa-solid fa-xmark text-base"></i>
            </button>
          </div>

          <!-- Video Trailer Player View or Backdrop Banner -->
          <div class="relative w-full aspect-video max-h-[380px] bg-black overflow-hidden flex items-center justify-center">
            <div v-if="activeTrailerKey" class="w-full h-full">
              <iframe 
                :src="`https://www.youtube.com/embed/${activeTrailerKey}?autoplay=${isTrailerPlaying ? 1 : 0}&rel=0`"
                title="Movie Trailer"
                class="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
            <div 
              v-else 
              class="w-full h-full bg-cover bg-center relative"
              :style="{ backgroundImage: `url('${getBackdropUrl(movie.backdrop_path)}')` }"
            >
              <div 
                class="absolute inset-0 bg-gradient-to-t to-transparent"
                :class="darkMode ? 'from-[#111622] via-[#111622]/40' : 'from-white via-white/50'"
              ></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="px-4 py-2 rounded-full bg-black/60 text-zinc-300 text-xs font-semibold backdrop-blur-md border border-white/10">
                  <i class="fa-solid fa-film mr-1.5 text-amber-400"></i> No official trailer available
                </span>
              </div>
            </div>
          </div>

          <!-- Modal Body Content -->
          <div class="p-5 sm:p-8">
            <div class="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-6 sm:gap-8 items-start min-w-0">
              
              <!-- Left Column: Poster & Quick Action Buttons -->
              <div class="flex flex-col items-center md:items-start gap-4">
                <!-- Poster Frame -->
                <div 
                  class="w-44 sm:w-52 md:w-full aspect-[2/3] rounded-2xl overflow-hidden border shadow-xl shadow-black/50"
                  :class="darkMode ? 'bg-[#182030] border-white/10' : 'bg-zinc-100 border-zinc-200'"
                >
                  <img 
                    v-if="movie.poster_path" 
                    :src="getPosterUrl(movie.poster_path, 'w500')" 
                    :alt="movie.title"
                    class="w-full h-full object-cover"
                  />
                  <div 
                    v-else 
                    class="w-full h-full flex items-center justify-center text-3xl"
                    :class="darkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-500'"
                  >
                    <i class="fa-solid fa-film"></i>
                  </div>
                </div>

                <!-- Action Buttons Row -->
                <div class="w-full flex flex-col gap-2.5">
                  <!-- Add to Watchlist -->
                  <button 
                    class="w-full h-11 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer shadow-md" 
                    :class="[
                      isInWatchlist(movie) 
                        ? 'bg-amber-500 text-black border-amber-500 font-extrabold shadow-amber-500/25' 
                        : (darkMode 
                            ? 'bg-white/10 hover:bg-white/15 text-white border-white/10' 
                            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-300')
                    ]"
                    @click="$emit('toggle-watchlist', movie)"
                  >
                    <i :class="isInWatchlist(movie) ? 'fa-solid fa-check' : 'fa-solid fa-plus'"></i>
                    <span>{{ isInWatchlist(movie) ? 'In Watchlist' : 'Add to Watchlist' }}</span>
                  </button>

                  <!-- Favorite -->
                  <button 
                    class="w-full h-11 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer shadow-md" 
                    :class="[
                      isFavorite(movie) 
                        ? 'bg-rose-500 text-white border-rose-500 shadow-rose-500/25' 
                        : (darkMode 
                            ? 'bg-white/10 hover:bg-white/15 text-white border-white/10' 
                            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-300')
                    ]"
                    @click="$emit('toggle-favorite', movie)"
                  >
                    <i :class="isFavorite(movie) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
                    <span>{{ isFavorite(movie) ? 'Favorited' : 'Add to Favorites' }}</span>
                  </button>

                  <!-- Watchlist Status Segmented Controls -->
                  <div 
                    v-if="isInWatchlist(movie)" 
                    class="w-full mt-2 p-2.5 rounded-2xl border space-y-2"
                    :class="darkMode ? 'bg-black/40 border-white/5' : 'bg-zinc-100 border-zinc-200'"
                  >
                    <div 
                      class="flex items-center justify-between text-[11px] font-bold"
                      :class="darkMode ? 'text-zinc-400' : 'text-zinc-600'"
                    >
                      <span>Watch Status:</span>
                      <span 
                        class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                        :class="[
                          currentWatchStatus === 'completed' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : (currentWatchStatus === 'watching' ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400')
                        ]"
                      >
                        {{ getWatchStatusLabel(currentWatchStatus) }}
                      </span>
                    </div>

                    <div 
                      class="grid grid-cols-3 gap-1 p-1 rounded-xl"
                      :class="darkMode ? 'bg-white/[0.04]' : 'bg-zinc-200/70'"
                    >
                      <button 
                        class="py-1.5 px-2 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer text-center" 
                        :class="currentWatchStatus === 'plan_to_watch' 
                          ? 'bg-amber-500 text-black shadow-sm' 
                          : (darkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950')"
                        @click="$emit('set-watch-status', movie.id, 'plan_to_watch')"
                      >
                        Plan
                      </button>
                      <button 
                        class="py-1.5 px-2 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer text-center" 
                        :class="currentWatchStatus === 'watching' 
                          ? 'bg-sky-500 text-white shadow-sm' 
                          : (darkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950')"
                        @click="$emit('set-watch-status', movie.id, 'watching')"
                      >
                        Watching
                      </button>
                      <button 
                        class="py-1.5 px-2 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer text-center" 
                        :class="currentWatchStatus === 'completed' 
                          ? 'bg-emerald-500 text-black shadow-sm' 
                          : (darkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950')"
                        @click="$emit('set-watch-status', movie.id, 'completed')"
                      >
                        Watched
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              <!-- Right Column: Details, Overview & Cast -->
              <div class="space-y-6 min-w-0 w-full overflow-hidden">
                
                <!-- Title & Tagline -->
                <div>
                  <h2 
                    class="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight !m-0"
                    :class="darkMode ? 'text-white' : 'text-zinc-900'"
                  >
                    {{ movie.title }}
                  </h2>
                  <p 
                    v-if="movie.tagline" 
                    class="text-xs sm:text-sm italic mt-1 font-medium"
                    :class="darkMode ? 'text-amber-400/90' : 'text-amber-700'"
                  >
                    "{{ movie.tagline }}"
                  </p>
                </div>

                <!-- Meta Specs Row -->
                <div 
                  class="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-semibold"
                  :class="darkMode ? 'text-zinc-300' : 'text-zinc-700'"
                >
                  <span 
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold"
                    :class="darkMode ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200 shadow-xs'"
                  >
                    <i class="fa-solid fa-star text-[11px]"></i>
                    {{ formatRating(movie.vote_average) }} / 10
                  </span>
                  <span class="text-zinc-400 font-bold">·</span>
                  <span>{{ formatYear(movie.release_date) }}</span>
                  <template v-if="movie.runtime">
                    <span class="text-zinc-400 font-bold">·</span>
                    <span>{{ movie.runtime }} min</span>
                  </template>
                  <span class="text-zinc-400 font-bold">·</span>
                  <span 
                    class="px-2 py-0.5 rounded text-[10px] font-black uppercase border"
                    :class="darkMode ? 'bg-black/60 text-zinc-300 border-white/10' : 'bg-zinc-200 text-zinc-800 border-zinc-300'"
                  >
                    HD
                  </span>
                </div>

                <!-- Genres Pills -->
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="genre in movieGenres" 
                    :key="genre"
                    class="px-3 py-1 rounded-full text-xs font-semibold border"
                    :class="darkMode ? 'bg-white/[0.05] text-zinc-300 border-white/10' : 'bg-zinc-100 text-zinc-800 border-zinc-200 shadow-xs'"
                  >
                    {{ genre }}
                  </span>
                </div>

                <!-- Overview Synopsis -->
                <div class="space-y-2 min-w-0 w-full">
                  <h4 
                    class="text-xs font-black uppercase tracking-wider !m-0"
                    :class="darkMode ? 'text-zinc-400' : 'text-zinc-500'"
                  >
                    Overview
                  </h4>
                  <p 
                    class="text-xs sm:text-sm leading-relaxed font-normal break-words"
                    :class="darkMode ? 'text-zinc-300' : 'text-zinc-700'"
                  >
                    {{ movie.overview || 'No synopsis available for this title.' }}
                  </p>
                </div>

                <!-- Meta Info Grid -->
                <div 
                  class="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl border text-xs min-w-0"
                  :class="darkMode ? 'bg-black/30 border-white/5' : 'bg-zinc-50 border-zinc-200'"
                >
                  <div class="min-w-0">
                    <span class="block font-semibold mb-0.5 truncate" :class="darkMode ? 'text-zinc-400' : 'text-zinc-500'">Director</span>
                    <span class="font-bold block truncate" :class="darkMode ? 'text-white' : 'text-zinc-900'" :title="directorName">{{ directorName }}</span>
                  </div>
                  <div class="min-w-0">
                    <span class="block font-semibold mb-0.5 truncate" :class="darkMode ? 'text-zinc-400' : 'text-zinc-500'">Release Date</span>
                    <span class="font-bold block truncate" :class="darkMode ? 'text-white' : 'text-zinc-900'">{{ formatDate(movie.release_date) }}</span>
                  </div>
                  <div v-if="movie.vote_count" class="min-w-0">
                    <span class="block font-semibold mb-0.5 truncate" :class="darkMode ? 'text-zinc-400' : 'text-zinc-500'">Votes</span>
                    <span class="font-bold block truncate" :class="darkMode ? 'text-white' : 'text-zinc-900'">{{ movie.vote_count.toLocaleString() }}</span>
                  </div>
                </div>

                <!-- Top Cast Rail with Enhanced Carousel Controls -->
                <div v-if="castList.length > 0" class="space-y-3 min-w-0 w-full">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <h4 
                        class="text-xs font-black uppercase tracking-wider !m-0"
                        :class="darkMode ? 'text-zinc-400' : 'text-zinc-500'"
                      >
                        Top Cast
                      </h4>
                      <span 
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                        :class="darkMode ? 'bg-white/[0.05] text-zinc-400 border-white/10' : 'bg-zinc-100 text-zinc-600 border-zinc-200'"
                      >
                        {{ castList.length }}
                      </span>
                    </div>

                    <!-- Header Carousel Navigation Buttons -->
                    <div class="flex items-center gap-1.5">
                      <button 
                        type="button"
                        class="w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all cursor-pointer border shadow-xs disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                        :disabled="isCastAtStart"
                        :class="darkMode ? 'bg-white/[0.08] hover:bg-white/[0.18] text-white border-white/15' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300'"
                        @click="scrollCast('left')"
                        aria-label="Scroll cast left"
                      >
                        <i class="fa-solid fa-chevron-left text-[11px]"></i>
                      </button>
                      <button 
                        type="button"
                        class="w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all cursor-pointer border shadow-xs disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                        :disabled="isCastAtEnd"
                        :class="darkMode ? 'bg-white/[0.08] hover:bg-white/[0.18] text-white border-white/15' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300'"
                        @click="scrollCast('right')"
                        aria-label="Scroll cast right"
                      >
                        <i class="fa-solid fa-chevron-right text-[11px]"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Cast Carousel Rail with Overlay Buttons and Visible Scrollbar -->
                  <div class="relative group/cast min-w-0 w-full">
                    <!-- Left Floating Arrow Button -->
                    <button
                      v-show="!isCastAtStart"
                      type="button"
                      class="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer opacity-90 hover:opacity-100"
                      :class="darkMode ? 'bg-black/80 text-white border-white/20 hover:bg-black' : 'bg-white/95 text-zinc-800 border-zinc-300 hover:bg-white shadow-zinc-400/30'"
                      @click="scrollCast('left')"
                      aria-label="Previous cast members"
                    >
                      <i class="fa-solid fa-chevron-left text-xs"></i>
                    </button>

                    <!-- Scrollable Container -->
                    <div 
                      ref="castRailRef"
                      class="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scroll-smooth cursor-grab active:cursor-grabbing select-none w-full min-w-0"
                      :class="darkMode ? 'custom-cast-scroll-dark' : 'custom-cast-scroll-light'"
                      @scroll="updateCastScrollState"
                      @wheel.passive="false"
                      @wheel="handleCastWheel"
                      @mousedown="startCastDrag"
                      @mouseleave="stopCastDrag"
                      @mouseup="stopCastDrag"
                      @mousemove="onCastDrag"
                    >
                      <div 
                        v-for="person in castList" 
                        :key="person.id"
                        class="flex-shrink-0 w-24 flex flex-col items-center text-center p-2 rounded-xl border transition-colors"
                        :class="darkMode ? 'bg-white/[0.02] border-white/5 hover:border-white/10' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'"
                      >
                        <div 
                          class="w-14 h-14 rounded-full overflow-hidden mb-2 border shrink-0"
                          :class="darkMode ? 'bg-zinc-800 border-white/10' : 'bg-zinc-200 border-zinc-300'"
                        >
                          <img 
                            v-if="person.profile_path" 
                            :src="getPosterUrl(person.profile_path, 'w185')" 
                            :alt="person.name" 
                            class="w-full h-full object-cover pointer-events-none"
                            loading="lazy" 
                          />
                          <div 
                            v-else 
                            class="w-full h-full flex items-center justify-center text-base"
                            :class="darkMode ? 'text-zinc-400' : 'text-zinc-500'"
                          >
                            <i class="fa-solid fa-user"></i>
                          </div>
                        </div>
                        <span 
                          class="text-[11px] font-bold truncate w-full"
                          :class="darkMode ? 'text-white' : 'text-zinc-900'"
                          :title="person.name"
                        >
                          {{ person.name }}
                        </span>
                        <span 
                          class="text-[10px] truncate w-full"
                          :class="darkMode ? 'text-zinc-400' : 'text-zinc-500'"
                          :title="person.character"
                        >
                          {{ person.character }}
                        </span>
                      </div>
                    </div>

                    <!-- Right Floating Arrow Button -->
                    <button
                      v-show="!isCastAtEnd"
                      type="button"
                      class="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer opacity-90 hover:opacity-100"
                      :class="darkMode ? 'bg-black/80 text-white border-white/20 hover:bg-black' : 'bg-white/95 text-zinc-800 border-zinc-300 hover:bg-white shadow-zinc-400/30'"
                      @click="scrollCast('right')"
                      aria-label="Next cast members"
                    >
                      <i class="fa-solid fa-chevron-right text-xs"></i>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  movie: { type: Object, default: null },
  credits: { type: Object, default: null },
  videos: { type: Array, default: () => [] },
  detailsLoading: { type: Boolean, default: false },
  autoPlayTrailer: { type: Boolean, default: false },
  genres: { type: Array, default: () => [] },
  isInWatchlist: { type: Function, required: true },
  isFavorite: { type: Function, required: true },
  getWatchStatus: { type: Function, required: true },
  darkMode: { type: Boolean, default: true }
})

const emit = defineEmits(['close', 'toggle-watchlist', 'toggle-favorite', 'set-watch-status'])

const isTrailerPlaying = ref(false)

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

watch(() => props.movie, (newMovie) => {
  if (newMovie) {
    isTrailerPlaying.value = props.autoPlayTrailer
    isCastAtStart.value = true
    isCastAtEnd.value = false
    if (castRailRef.value) {
      castRailRef.value.scrollLeft = 0
    }
  } else {
    isTrailerPlaying.value = false
  }
})

watch(() => props.credits, () => {
  isCastAtStart.value = true
  isCastAtEnd.value = false
  if (castRailRef.value) {
    castRailRef.value.scrollLeft = 0
    setTimeout(updateCastScrollState, 100)
  }
})

const activeTrailerKey = computed(() => {
  if (!props.videos || props.videos.length === 0) return null
  const trailer = props.videos.find(v => v.site === 'YouTube' && v.type === 'Trailer')
  if (trailer) return trailer.key
  const teaser = props.videos.find(v => v.site === 'YouTube' && v.type === 'Teaser')
  if (teaser) return teaser.key
  const clip = props.videos.find(v => v.site === 'YouTube')
  return clip ? clip.key : null
})

const movieGenres = computed(() => {
  if (!props.movie) return []
  if (props.movie.genres && props.movie.genres.length > 0) {
    return props.movie.genres.map(g => g.name)
  }
  if (props.movie.genre_ids && props.movie.genre_ids.length > 0) {
    return props.movie.genre_ids
      .map(id => {
        const found = props.genres.find(g => g.id === id)
        return found ? found.name : null
      })
      .filter(Boolean)
  }
  return []
})

const directorName = computed(() => {
  if (!props.credits || !props.credits.crew) return 'Unknown'
  const director = props.credits.crew.find(c => c.job === 'Director')
  return director ? director.name : 'Unknown'
})

const castList = computed(() => {
  if (!props.credits || !props.credits.cast) return []
  return props.credits.cast.slice(0, 18)
})

const castRailRef = ref(null)
const isCastAtStart = ref(true)
const isCastAtEnd = ref(false)
let isDragging = false
let startX = 0
let scrollLeftStart = 0

const updateCastScrollState = () => {
  if (!castRailRef.value) return
  const { scrollLeft, scrollWidth, clientWidth } = castRailRef.value
  isCastAtStart.value = scrollLeft <= 4
  isCastAtEnd.value = scrollLeft + clientWidth >= scrollWidth - 6
}

const scrollCast = (direction) => {
  if (!castRailRef.value) return
  const amount = 240
  castRailRef.value.scrollBy({
    left: direction === 'left' ? -amount : amount,
    behavior: 'smooth'
  })
  setTimeout(updateCastScrollState, 350)
}

const handleCastWheel = (e) => {
  if (!castRailRef.value) return
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault()
    castRailRef.value.scrollLeft += e.deltaY * 1.5
    updateCastScrollState()
  }
}

const startCastDrag = (e) => {
  if (!castRailRef.value) return
  isDragging = true
  startX = e.pageX - castRailRef.value.offsetLeft
  scrollLeftStart = castRailRef.value.scrollLeft
}

const stopCastDrag = () => {
  isDragging = false
  updateCastScrollState()
}

const onCastDrag = (e) => {
  if (!isDragging || !castRailRef.value) return
  e.preventDefault()
  const x = e.pageX - castRailRef.value.offsetLeft
  const walk = (x - startX) * 1.5
  castRailRef.value.scrollLeft = scrollLeftStart - walk
  updateCastScrollState()
}

const currentWatchStatus = computed(() => {
  if (!props.movie) return 'plan_to_watch'
  return props.getWatchStatus(props.movie.id)
})

const getWatchStatusLabel = (status) => {
  switch (status) {
    case 'completed': return 'Completed'
    case 'watching': return 'Watching'
    case 'plan_to_watch':
    default: return 'Plan to Watch'
  }
}

const getPosterUrl = (path, size = 'w500') => {
  if (!path) return ''
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

const getBackdropUrl = (path) => {
  if (!path) return ''
  return `${TMDB_IMAGE_BASE}/w1280${path}`
}

const formatRating = (val) => {
  if (typeof val !== 'number' || isNaN(val)) return 'N/A'
  return val.toFixed(1)
}

const formatYear = (dateStr) => {
  if (!dateStr) return 'TBA'
  return dateStr.substring(0, 4)
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'TBA'
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
