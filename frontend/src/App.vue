<template>
  <div class="cineby-app">
    
    <!-- Top Header / Navbar -->
    <TheNavbar
      :active-tab="activeTab"
      :current-category="currentCategory"
      :active-search-query="activeSearchQuery"
      :watchlist-count="watchlistCount"
      :favorite-count="favoriteCount"
      :dark-mode="darkMode"
      :theme-mode="themeMode"
      :is-logged-in="isLoggedIn"
      :user="user"
      :user-initial="userInitial"
      @navigate="handleNavigate"
      @open-search="openSearchModal"
      @toggle-theme="toggleDarkMode"
      @set-theme-mode="setThemeMode"
      @open-auth="openAuthModal"
      @logout="confirmLogout"
    />

    <!-- Main Content Area -->
    <main class="cineby-main">

      <!-- Cineby Full-Bleed Hero Carousel (Discover mode) -->
      <HeroCarousel 
        v-if="activeTab === 'discover' && !activeSearchQuery && heroMovies.length > 0 && !error"
        :movies="heroMovies"
        :current-index="heroSlideIndex"
        :genres="genres"
        :is-in-watchlist="isInWatchlist"
        :is-favorite="isFavorite"
        :dark-mode="darkMode"
        @open-details="openMovieDetails"
        @toggle-watchlist="toggleWatchlist"
        @toggle-favorite="toggleFavorite"
        @set-index="setHeroSlide"
        @next="nextHeroSlide"
        @prev="prevHeroSlide"
        @pause-autoplay="stopHeroAutoplay"
        @resume-autoplay="startHeroAutoplay"
      />
      <HeroSkeleton 
        v-else-if="activeTab === 'discover' && !activeSearchQuery && loading && heroMovies.length === 0"
        :dark-mode="darkMode"
      />

      <div 
        class="container content-wrapper"
        :class="activeTab !== 'discover' || activeSearchQuery || heroMovies.length === 0 ? 'pt-24 sm:pt-28 lg:pt-32' : 'pt-4 sm:pt-6'"
      >

        <!-- Active Search Banner -->
        <div class="cineby-search-banner" v-if="activeSearchQuery">
          <div class="banner-text">
            <i class="fa-solid fa-magnifying-glass"></i>
            <span>Search results for <strong>"{{ activeSearchQuery }}"</strong> ({{ displayedMovies.length }} found)</span>
          </div>
          <button class="btn-clear-search" @click="clearSearch">
            <i class="fa-solid fa-xmark"></i> Clear Search
          </button>
        </div>

        <!-- Watchlist Header -->
        <section v-if="activeTab === 'watchlist'" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-5 border-b border-zinc-200 dark:border-white/5 mb-5">
          <div>
            <h1 class="font-display text-xl! sm:text-2xl! lg:text-3xl! font-extrabold! text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5 sm:gap-3 m-0!">
              <i class="fa-solid fa-bookmark text-amber-500 text-lg sm:text-xl"></i>
              <span>My Watchlist</span>
            </h1>
            <p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              {{ watchlistCount }} {{ watchlistCount === 1 ? 'movie' : 'movies' }} in queue
            </p>
          </div>
          <div class="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar whitespace-nowrap py-1 -mx-4 px-4 sm:mx-0 sm:px-0 w-full sm:w-auto min-w-0 max-w-full">
            <button 
              class="shrink-0 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap"
              :class="[
                watchlistFilter === 'all'
                  ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/25 font-extrabold'
                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-white/4 dark:hover:bg-white/8 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white border-zinc-200 dark:border-white/5'
              ]"
              @click="watchlistFilter = 'all'"
            >
              <i class="fa-solid fa-layer-group text-xs"></i>
              <span>All</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold" :class="watchlistFilter === 'all' ? 'bg-black/20 text-black' : (darkMode ? 'bg-white/10 text-zinc-300' : 'bg-zinc-200 text-zinc-700')">
                {{ watchlistCount }}
              </span>
            </button>
            <button 
              class="shrink-0 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap"
              :class="[
                watchlistFilter === 'plan_to_watch'
                  ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/25 font-extrabold'
                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-white/4 dark:hover:bg-white/8 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white border-zinc-200 dark:border-white/5'
              ]"
              @click="watchlistFilter = 'plan_to_watch'"
            >
              <i class="fa-regular fa-clock text-xs"></i>
              <span>Plan</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold" :class="watchlistFilter === 'plan_to_watch' ? 'bg-black/20 text-black' : (darkMode ? 'bg-white/10 text-zinc-300' : 'bg-zinc-200 text-zinc-700')">
                {{ planToWatchCount }}
              </span>
            </button>
            <button 
              class="shrink-0 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap"
              :class="[
                watchlistFilter === 'watching'
                  ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/25 font-extrabold'
                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-white/4 dark:hover:bg-white/8 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white border-zinc-200 dark:border-white/5'
              ]"
              @click="watchlistFilter = 'watching'"
            >
              <i class="fa-solid fa-play text-xs"></i>
              <span>Watching</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold" :class="watchlistFilter === 'watching' ? 'bg-black/20 text-white' : (darkMode ? 'bg-white/10 text-zinc-300' : 'bg-zinc-200 text-zinc-700')">
                {{ watchingCount }}
              </span>
            </button>
            <button 
              class="shrink-0 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap"
              :class="[
                watchlistFilter === 'completed'
                  ? 'bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/25 font-extrabold'
                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-white/4 dark:hover:bg-white/8 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white border-zinc-200 dark:border-white/5'
              ]"
              @click="watchlistFilter = 'completed'"
            >
              <i class="fa-solid fa-circle-check text-xs"></i>
              <span>Completed</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold" :class="watchlistFilter === 'completed' ? 'bg-black/20 text-black' : (darkMode ? 'bg-white/10 text-zinc-300' : 'bg-zinc-200 text-zinc-700')">
                {{ watchedCount }}
              </span>
            </button>
          </div>
        </section>

        <!-- Favorites Header -->
        <section v-if="activeTab === 'favorites'" class="py-5 border-b border-zinc-200 dark:border-white/5 mb-5">
          <div>
            <h1 class="font-display text-xl! sm:text-2xl! lg:text-3xl! font-extrabold! text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5 sm:gap-3 m-0!">
              <i class="fa-solid fa-heart text-rose-500 text-lg sm:text-xl"></i>
              <span>Favorite Movies</span>
            </h1>
            <p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              {{ favoriteCount }} {{ favoriteCount === 1 ? 'movie' : 'movies' }} pinned
            </p>
          </div>
        </section>

        <!-- Discover Controls (Category Strip & Filter Dropdowns) -->
        <FilterToolbar 
          v-if="activeTab === 'discover' && !activeSearchQuery"
          :categories="categories"
          :current-category="currentCategory"
          :active-search-query="activeSearchQuery"
          :genres="genres"
          :selected-genre="selectedGenre"
          :min-rating="minRating"
          :sort-by="sortBy"
          :active-dropdown="activeDropdown"
          :dark-mode="darkMode"
          @select-category="setCategory"
          @toggle-dropdown="toggleDropdown"
          @update:selected-genre="selectedGenre = $event"
          @update:min-rating="minRating = $event"
          @update:sort-by="sortBy = $event"
          @reset-filters="resetFilters"
          @close-dropdowns="closeDropdowns"
        />

        <!-- Main Movie Grid Section -->
        <MovieGrid
          :title="currentSectionTitle"
          :movies="displayedMovies"
          :genres="genres"
          :active-tab="activeTab"
          :active-search-query="activeSearchQuery"
          :loading="loading"
          :error="error"
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-results="totalResults"
          :dark-mode="darkMode"
          :is-logged-in="isLoggedIn"
          :is-in-watchlist="isInWatchlist"
          :is-favorite="isFavorite"
          :get-watch-status="getWatchStatus"
          @open-details="openMovieDetails"
          @toggle-watchlist="toggleWatchlist"
          @toggle-favorite="toggleFavorite"
          @cycle-status="cycleWatchStatus"
          @retry="() => fetchMovies(currentPage, true)"
          @change-page="handlePageChange"
          @empty-action="handleEmptyAction"
          @open-auth="openAuthModal('login')"
        />

      </div>
    </main>

    <!-- Modals -->
    <!-- Movie Details Modal -->
    <MovieDetailsModal
      :movie="selectedMovie"
      :credits="movieCredits"
      :videos="movieVideos"
      :details-loading="detailsLoading"
      :auto-play-trailer="isTrailerPlaying"
      :genres="genres"
      :is-in-watchlist="isInWatchlist"
      :is-favorite="isFavorite"
      :get-watch-status="getWatchStatus"
      :dark-mode="darkMode"
      @close="closeModal"
      @toggle-watchlist="toggleWatchlist"
      @toggle-favorite="toggleFavorite"
      @set-watch-status="setWatchStatus"
    />

    <!-- Search Modal -->
    <SearchModal
      :is-open="isSearchModalOpen"
      :recent-searches="recentSearches"
      :initial-query="searchQuery"
      :dark-mode="darkMode"
      @close="closeSearchModal"
      @submit-search="submitSearch"
      @remove-recent="removeRecentSearch"
      @clear-recent="confirmClearRecentSearches"
    />

    <!-- Auth Modal -->
    <AuthModal
      :is-open="isAuthModalOpen"
      :mode="authMode"
      :message="authMessage"
      :loading="authLoading"
      :errors="authErrors"
      :dark-mode="darkMode"
      @close="closeAuthModal"
      @submit="submitAuth"
      @switch-mode="authMode = $event"
      @update:mode="authMode = $event"
    />

    <!-- Footer -->
    <TheFooter :dark-mode="darkMode" @navigate="handleNavigate" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'

import TheNavbar from './components/TheNavbar.vue'
import HeroCarousel from './components/HeroCarousel.vue'
import HeroSkeleton from './components/HeroSkeleton.vue'
import FilterToolbar from './components/FilterToolbar.vue'
import MovieGrid from './components/MovieGrid.vue'
import MovieDetailsModal from './components/MovieDetailsModal.vue'
import SearchModal from './components/SearchModal.vue'
import AuthModal from './components/AuthModal.vue'
import TheFooter from './components/TheFooter.vue'

const $q = useQuasar()

const API_BASE = '/api'
const TOKEN_KEY = 'cinevault_token'
const DEFAULT_RECENT_SEARCHES = ['vincenzo', 'inception', 'interstellar']

// State
const movies = ref([])
const genres = ref([
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
])

const categories = ref([
  { id: 'popular', label: 'Popular', icon: 'fa-solid fa-fire', title: 'Popular Movies' },
  { id: 'trending', label: 'Trending', icon: 'fa-solid fa-arrow-trend-up', title: 'Trending Today' },
  { id: 'top_rated', label: 'Top Rated', icon: 'fa-solid fa-trophy', title: 'Top Rated Classics' },
  { id: 'now_playing', label: 'Now Playing', icon: 'fa-solid fa-film', title: 'In Theaters' },
  { id: 'upcoming', label: 'Upcoming', icon: 'fa-solid fa-calendar-days', title: 'Upcoming Releases' }
])

const currentCategory = ref('popular')
const selectedGenre = ref(null)
const sortBy = ref('popularity.desc')
const minRating = ref(0)
const activeDropdown = ref(null)

const searchQuery = ref('')
const activeSearchQuery = ref('')
const isSearchModalOpen = ref(false)
const recentSearches = ref(DEFAULT_RECENT_SEARCHES.map(query => ({ id: null, query })))

const authToken = ref(null)
const user = ref(null)
const isAuthModalOpen = ref(false)
const authMode = ref('login')
const authMessage = ref('')
const authErrors = ref({})
const authLoading = ref(false)
const pendingAction = ref(null)

const watchlist = ref([])
const favorites = ref([])
const watchStatusMap = ref({})
const watchlistFilter = ref('all')
const activeTab = ref('discover')

const selectedMovie = ref(null)
const movieCredits = ref(null)
const movieVideos = ref([])
const detailsLoading = ref(false)
const isTrailerPlaying = ref(false)

const loading = ref(false)
const error = ref(null)

// Theme System (3-Mode System: system / light / dark + Instant 0ms LocalStorage)
const THEME_STORAGE_KEY = 'cinevault_theme'
const THEME_MODE_KEY = 'cinevault_theme_mode'
const darkMode = ref(true)
const themeMode = ref('system')
let systemThemeMediaQuery = null

const updateThemeClass = () => {
  const isDark = darkMode.value
  if (isDark) {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light', 'light-theme')
    document.body.classList.add('dark')
    document.body.classList.remove('light', 'light-theme')
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light', 'light-theme')
    document.body.classList.remove('dark')
    document.body.classList.add('light', 'light-theme')
  }
  if ($q && $q.dark) {
    $q.dark.set(isDark)
  }
}

const applyThemeWithTransition = (fn) => {
  // Instant synchronous execution (0ms delay - surface transitions handled smoothly by CSS)
  fn()
}

const setThemeMode = (mode) => {
  themeMode.value = mode
  if (mode === 'system') {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    darkMode.value = prefersDark !== false
  } else {
    darkMode.value = (mode === 'dark')
  }
  updateThemeClass()
  saveLocalStorage()

  if (isLoggedIn.value) {
    api('/settings', { method: 'PUT', body: { dark_mode: darkMode.value } })
      .catch(err => console.warn('Could not sync theme with account settings:', err))
  }
}

const toggleDarkMode = () => {
  let nextMode = 'dark'
  if (themeMode.value === 'system') {
    nextMode = darkMode.value ? 'light' : 'dark'
  } else if (themeMode.value === 'dark') {
    nextMode = 'light'
  } else {
    nextMode = 'system'
  }
  setThemeMode(nextMode)
}

const handleSystemThemeChange = (e) => {
  if (themeMode.value === 'system') {
    darkMode.value = e.matches
    updateThemeClass()
  }
}

const currentPage = ref(1)
const totalPages = ref(1)
const totalResults = ref(0)

// In-Memory Stale-While-Revalidate Caches (Instant 0ms retrieval)
const categoryCache = new Map() // `${categoryId}_p${page}` -> { movies: Array, totalPages: number, totalResults: number, timestamp: number }
const movieDetailsCache = new Map() // movieId -> { details: Object, credits: Object, videos: Array }

// Slug Helper
const slugify = (text) => {
  if (!text) return ''
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

// URL Slug & Route State Synchronization
let isNavigatingFromHash = false

const updateUrlSlug = () => {
  if (isNavigatingFromHash) return

  if (selectedMovie.value && selectedMovie.value.id) {
    const slug = slugify(selectedMovie.value.title)
    const targetHash = `#/movie/${selectedMovie.value.id}${slug ? '-' + slug : ''}`
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetHash)
    }
    return
  }

  if (activeSearchQuery.value) {
    const targetHash = `#/search/${encodeURIComponent(activeSearchQuery.value)}`
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetHash)
    }
    return
  }

  if (activeTab.value === 'watchlist') {
    if (window.location.hash !== '#/watchlist') {
      window.history.pushState(null, '', '#/watchlist')
    }
    return
  }

  if (activeTab.value === 'favorites') {
    if (window.location.hash !== '#/favorites') {
      window.history.pushState(null, '', '#/favorites')
    }
    return
  }

  if (activeTab.value === 'discover') {
    const targetHash = currentCategory.value === 'popular' ? '#/' : `#/category/${currentCategory.value}`
    if (window.location.hash !== targetHash && (currentCategory.value !== 'popular' || (window.location.hash && window.location.hash !== '#/'))) {
      window.history.pushState(null, '', targetHash)
    }
  }
}

// Hero Carousel Autoplay
const heroSlideIndex = ref(0)
let heroSlideInterval = null

// Computed
const isLoggedIn = computed(() => !!user.value)

const userInitial = computed(() => {
  return user.value && user.value.name ? user.value.name.trim().charAt(0).toUpperCase() : '?'
})

const heroMovies = computed(() => {
  if (movies.value.length === 0) return []
  const withBackdrop = movies.value.filter(m => m.backdrop_path && m.overview)
  return withBackdrop.slice(0, 7)
})

const filteredMovies = computed(() => {
  let result = [...movies.value]

  if (selectedGenre.value !== null && selectedGenre.value !== '') {
    const targetId = Number(selectedGenre.value)
    result = result.filter(movie => {
      if (!movie.genre_ids) return false
      return movie.genre_ids.includes(targetId)
    })
  }

  if (minRating.value > 0) {
    result = result.filter(movie => (movie.vote_average || 0) >= minRating.value)
  }

  result.sort((a, b) => {
    if (sortBy.value === 'vote_average.desc') {
      return (b.vote_average || 0) - (a.vote_average || 0)
    } else if (sortBy.value === 'release_date.desc') {
      return new Date(b.release_date || 0) - new Date(a.release_date || 0)
    } else if (sortBy.value === 'title.asc') {
      return (a.title || '').localeCompare(b.title || '')
    }
    return (b.popularity || 0) - (a.popularity || 0)
  })

  return result
})

const displayedMovies = computed(() => {
  if (activeTab.value === 'watchlist') {
    if (watchlistFilter.value === 'all') {
      return watchlist.value
    }
    return watchlist.value.filter(m => (watchStatusMap.value[m.id] || 'plan_to_watch') === watchlistFilter.value)
  }

  if (activeTab.value === 'favorites') {
    return favorites.value
  }

  return filteredMovies.value
})

const favoriteCount = computed(() => favorites.value.length)
const watchlistCount = computed(() => watchlist.value.length)
const watchedCount = computed(() => watchlist.value.filter(m => watchStatusMap.value[m.id] === 'completed').length)
const watchingCount = computed(() => watchlist.value.filter(m => watchStatusMap.value[m.id] === 'watching').length)
const planToWatchCount = computed(() => watchlist.value.filter(m => !watchStatusMap.value[m.id] || watchStatusMap.value[m.id] === 'plan_to_watch').length)

const currentSectionTitle = computed(() => {
  if (activeTab.value === 'watchlist') return 'My Watchlist'
  if (activeTab.value === 'favorites') return 'Favorite Movies'
  if (activeSearchQuery.value) return `Search Results for "${activeSearchQuery.value}"`
  const cat = categories.value.find(c => c.id === currentCategory.value)
  return cat ? cat.title : 'Explore Movies'
})

// Methods: API Helper
const api = async (path, { method = 'GET', body } = {}) => {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (authToken.value) headers.Authorization = `Bearer ${authToken.value}`

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  })

  let data = null
  if (response.status !== 204) {
    try {
      data = await response.json()
    } catch (e) {
      data = null
    }
  }

  if (!response.ok) {
    if (response.status === 401 && authToken.value) {
      clearSession()
      showToastNotification('Your session expired. Please sign in again.', 'info')
    }
    const err = new Error((data && data.message) || `Request failed (${response.status})`)
    err.status = response.status
    err.data = data
    throw err
  }

  return data
}

// Movies Fetching with perceptual floor & in-memory cache
const fetchMovies = async (page = 1, forceRefresh = false) => {
  error.value = null
  activeSearchQuery.value = ''

  const targetPage = Math.max(1, Math.min(500, Number(page) || 1))
  currentPage.value = targetPage

  const catId = currentCategory.value
  const cacheKey = `${catId}_p${targetPage}`
  const cached = categoryCache.get(cacheKey)
  const isFresh = cached && (Date.now() - cached.timestamp < 300000) // 5 minutes fresh

  if (cached && !forceRefresh) {
    // Instant 0ms cache hit!
    movies.value = cached.movies
    totalPages.value = cached.totalPages || 1
    totalResults.value = cached.totalResults || cached.movies.length
    loading.value = false
    heroSlideIndex.value = 0
    startHeroAutoplay()
    updateUrlSlug()
    if (isFresh) return
  } else {
    loading.value = true
  }

  const startTime = Date.now()
  try {
    const data = await api(`/movies/category/${catId}?page=${targetPage}`)
    const elapsed = Date.now() - startTime
    if (!cached && elapsed < 150) {
      await new Promise(resolve => setTimeout(resolve, 150 - elapsed))
    }
    const results = data.results || []
    const maxPages = Math.min(data.total_pages || 1, 500)
    const total = data.total_results || results.length

    totalPages.value = maxPages
    totalResults.value = total
    movies.value = results

    categoryCache.set(cacheKey, { 
      movies: results, 
      totalPages: maxPages, 
      totalResults: total, 
      timestamp: Date.now() 
    })

    heroSlideIndex.value = 0
    startHeroAutoplay()
    updateUrlSlug()
  } catch (err) {
    console.error('Movie API Error:', err)
    if (!cached) {
      error.value = 'Could not load movies. Make sure the CineVault backend is running and try again.'
    }
  } finally {
    loading.value = false
  }
}

const searchMovies = async (page = 1, fromHash = false) => {
  const query = searchQuery.value.trim()
  if (!query) {
    clearSearch()
    return
  }

  const targetPage = Math.max(1, Math.min(500, Number(page) || 1))
  currentPage.value = targetPage

  loading.value = true
  error.value = null
  activeSearchQuery.value = query
  activeTab.value = 'discover'
  if (!fromHash) {
    updateUrlSlug()
  }

  const startTime = Date.now()
  try {
    const data = await api(`/movies/search?query=${encodeURIComponent(query)}&page=${targetPage}`)
    const elapsed = Date.now() - startTime
    if (elapsed < 150) {
      await new Promise(resolve => setTimeout(resolve, 150 - elapsed))
    }
    const results = data.results || []
    movies.value = results
    totalPages.value = Math.min(data.total_pages || 1, 500)
    totalResults.value = data.total_results || results.length
  } catch (err) {
    console.error('Movie Search Error:', err)
    error.value = 'Unable to complete search request. Please try again.'
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  const targetPage = Math.max(1, Math.min(totalPages.value, Number(page) || 1))
  if (targetPage === currentPage.value) return

  if (activeSearchQuery.value) {
    searchMovies(targetPage)
  } else {
    fetchMovies(targetPage)
  }

  // Smoothly scroll back to the top of the content/grid section
  const mainContent = document.querySelector('.content-wrapper') || document.querySelector('main')
  if (mainContent) {
    mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const fetchGenres = async () => {
  try {
    const data = await api('/genres')
    if (data.genres && Array.isArray(data.genres)) {
      genres.value = data.genres
    }
  } catch (err) {
    console.warn('Failed to load genres:', err)
  }
}

// Navigation & Category
const handleNavigate = (tab) => {
  currentPage.value = 1
  if (tab === 'discover') {
    activeTab.value = 'discover'
    if (activeSearchQuery.value || currentCategory.value !== 'popular') {
      currentCategory.value = 'popular'
      clearSearch()
    }
  } else {
    activeTab.value = tab
    activeSearchQuery.value = ''
  }
  closeDropdowns()
  updateUrlSlug()
  window.scrollTo({ top: 0, behavior: 'instant' })
}

const setCategory = (catId) => {
  currentCategory.value = catId
  activeTab.value = 'discover'
  searchQuery.value = ''
  activeSearchQuery.value = ''
  currentPage.value = 1
  heroSlideIndex.value = 0
  closeDropdowns()
  fetchMovies(1)
}

const resetFilters = () => {
  selectedGenre.value = null
  minRating.value = 0
  sortBy.value = 'popularity.desc'
  closeDropdowns()
}

const clearSearch = () => {
  searchQuery.value = ''
  activeSearchQuery.value = ''
  currentPage.value = 1
  fetchMovies(1)
}

const handleEmptyAction = () => {
  if (activeSearchQuery.value) {
    clearSearch()
  } else if (activeTab.value === 'watchlist' || activeTab.value === 'favorites') {
    handleNavigate('discover')
  } else {
    resetFilters()
  }
}

// Dropdown Handlers
const toggleDropdown = (name) => {
  activeDropdown.value = activeDropdown.value === name ? null : name
}

const closeDropdowns = () => {
  activeDropdown.value = null
}

// Hero Carousel Autoplay
const startHeroAutoplay = () => {
  stopHeroAutoplay()
  heroSlideInterval = setInterval(() => {
    nextHeroSlide()
  }, 6500)
}

const stopHeroAutoplay = () => {
  if (heroSlideInterval) {
    clearInterval(heroSlideInterval)
    heroSlideInterval = null
  }
}

const nextHeroSlide = () => {
  if (heroMovies.value.length === 0) return
  heroSlideIndex.value = (heroSlideIndex.value + 1) % heroMovies.value.length
}

const prevHeroSlide = () => {
  if (heroMovies.value.length === 0) return
  heroSlideIndex.value = (heroSlideIndex.value - 1 + heroMovies.value.length) % heroMovies.value.length
}

const setHeroSlide = (idx) => {
  heroSlideIndex.value = idx
  startHeroAutoplay()
}

// Movie Details Modal with 0ms In-Memory Cache
const openMovieDetails = async (movie, autoPlayTrailer = false) => {
  selectedMovie.value = { ...movie }
  detailsLoading.value = true
  isTrailerPlaying.value = autoPlayTrailer
  closeDropdowns()

  document.body.style.overflow = 'hidden'
  updateUrlSlug()

  // 0ms Cache hit check
  if (movieDetailsCache.has(movie.id)) {
    const cached = movieDetailsCache.get(movie.id)
    selectedMovie.value = cached.details
    movieCredits.value = cached.credits
    movieVideos.value = cached.videos
    detailsLoading.value = false
    return
  }

  movieCredits.value = null
  movieVideos.value = []

  try {
    const data = await api(`/movies/${movie.id}`)
    selectedMovie.value = data
    movieCredits.value = data.credits || null
    movieVideos.value = (data.videos && data.videos.results) ? data.videos.results : []

    // Store in cache for instant subsequent opens
    movieDetailsCache.set(movie.id, {
      details: data,
      credits: movieCredits.value,
      videos: movieVideos.value
    })
  } catch (err) {
    console.warn('Failed to fetch enriched movie details:', err)
  } finally {
    detailsLoading.value = false
  }
}

const closeModal = (syncUrl = true) => {
  selectedMovie.value = null
  movieCredits.value = null
  movieVideos.value = []
  isTrailerPlaying.value = false
  document.body.style.overflow = ''
  if (syncUrl) {
    updateUrlSlug()
  }
}

// Search Modal
const openSearchModal = () => {
  isSearchModalOpen.value = true
  document.body.style.overflow = 'hidden'
  closeDropdowns()
}

const closeSearchModal = () => {
  isSearchModalOpen.value = false
  if (!selectedMovie.value && !isAuthModalOpen.value) {
    document.body.style.overflow = ''
  }
}

const submitSearch = (query) => {
  searchQuery.value = query
  const filtered = recentSearches.value.filter(s => s.query.toLowerCase() !== query.toLowerCase())
  recentSearches.value = [{ id: null, query }, ...filtered].slice(0, 6)
  saveLocalStorage()

  if (isLoggedIn.value) {
    api('/recent-searches', { method: 'POST', body: { query } })
      .then(list => { recentSearches.value = list })
      .catch(err => console.warn('Failed to save recent search:', err))
  }

  closeSearchModal()
  searchMovies()
}

// Global URL Hash Router Event Handler
const handleHashChange = async () => {
  const hash = window.location.hash || '#/'
  isNavigatingFromHash = true
  try {
    // 1. Movie details route: #/movie/:id or #/movie/:id-:slug
    const movieMatch = hash.match(/^#\/movie\/(\d+)/)
    if (movieMatch) {
      const movieId = Number(movieMatch[1])
      if (!selectedMovie.value || selectedMovie.value.id !== movieId) {
        let existing = movies.value.find(m => m.id === movieId)
        if (!existing && movieDetailsCache.has(movieId)) {
          existing = movieDetailsCache.get(movieId).details
        }
        if (existing) {
          openMovieDetails(existing)
        } else {
          openMovieDetails({ id: movieId, title: 'Loading Film Details...' })
        }
      }
      if (movies.value.length === 0) {
        fetchMovies(1)
      }
      return
    }

    // If modal is open and URL hash changed away from movie, close modal
    if (selectedMovie.value) {
      closeModal(false)
    }

    // 2. Watchlist route: #/watchlist
    if (hash === '#/watchlist') {
      activeTab.value = 'watchlist'
      activeSearchQuery.value = ''
      searchQuery.value = ''
      return
    }

    // 3. Favorites route: #/favorites
    if (hash === '#/favorites') {
      activeTab.value = 'favorites'
      activeSearchQuery.value = ''
      searchQuery.value = ''
      return
    }

    // 4. Search route: #/search/:query
    const searchMatch = hash.match(/^#\/search\/(.+)/)
    if (searchMatch) {
      const query = decodeURIComponent(searchMatch[1])
      activeTab.value = 'discover'
      searchQuery.value = query
      activeSearchQuery.value = query
      searchMovies(true)
      return
    }

    // 5. Category route: #/category/:catId
    const catMatch = hash.match(/^#\/category\/([a-z0-9_-]+)/)
    if (catMatch) {
      const catId = catMatch[1]
      activeTab.value = 'discover'
      searchQuery.value = ''
      activeSearchQuery.value = ''
      if (currentCategory.value !== catId) {
        currentCategory.value = catId
        fetchMovies()
      } else if (movies.value.length === 0) {
        fetchMovies()
      }
      return
    }

    // 6. Default root #/
    if (hash === '#/' || !hash) {
      activeTab.value = 'discover'
      searchQuery.value = ''
      activeSearchQuery.value = ''
      if (currentCategory.value !== 'popular') {
        currentCategory.value = 'popular'
        fetchMovies()
      } else if (movies.value.length === 0) {
        fetchMovies()
      }
    }
  } finally {
    isNavigatingFromHash = false
  }
}

const removeRecentSearch = (item) => {
  recentSearches.value = recentSearches.value.filter(s => s !== item)
  saveLocalStorage()
  if (isLoggedIn.value && item.id) {
    api(`/recent-searches/${item.id}`, { method: 'DELETE' }).catch(() => {})
  }
}

const clearRecentSearches = () => {
  recentSearches.value = []
  saveLocalStorage()
  if (isLoggedIn.value) {
    api('/recent-searches', { method: 'DELETE' }).catch(() => {})
  }
}

// Watchlist & Favorites
const moviePayload = (movie) => ({
  id: movie.id,
  title: movie.title,
  poster_path: movie.poster_path || null,
  backdrop_path: movie.backdrop_path || null,
  overview: movie.overview || null,
  vote_average: typeof movie.vote_average === 'number' ? movie.vote_average : null,
  popularity: typeof movie.popularity === 'number' ? movie.popularity : null,
  release_date: movie.release_date || null,
  genre_ids: movie.genre_ids || (movie.genres || []).map(g => g.id)
})

const requireAuth = (action, message = 'Sign in to save movies to your account.') => {
  if (isLoggedIn.value) return true
  pendingAction.value = action
  openAuthModal('login', message)
  return false
}

const isInWatchlist = (movie) => {
  if (!movie) return false
  return watchlist.value.some(m => m.id === movie.id)
}

const isFavorite = (movie) => {
  if (!movie) return false
  return favorites.value.some(m => m.id === movie.id)
}

const getWatchStatus = (movieId) => {
  return watchStatusMap.value[movieId] || 'plan_to_watch'
}

const toggleWatchlist = async (movie) => {
  if (!requireAuth(() => toggleWatchlist(movie))) return

  if (isInWatchlist(movie)) {
    const idx = watchlist.value.findIndex(m => m.id === movie.id)
    if (idx === -1) return
    const [removed] = watchlist.value.splice(idx, 1)
    const prevStatus = watchStatusMap.value[movie.id]
    delete watchStatusMap.value[movie.id]
    showToastNotification(`"${movie.title}" removed from watchlist`, 'remove')

    try {
      await api(`/watchlist/${movie.id}`, { method: 'DELETE' })
    } catch (err) {
      if (err.status !== 404) {
        watchlist.value.splice(idx, 0, removed)
        watchStatusMap.value[movie.id] = prevStatus
        showToastNotification(`Could not remove "${movie.title}"`, 'error')
      }
    }
  } else {
    watchlist.value.push(movie)
    watchStatusMap.value[movie.id] = 'plan_to_watch'
    showToastNotification(`"${movie.title}" added to your watchlist`, 'success')

    try {
      await api('/watchlist', { method: 'POST', body: moviePayload(movie) })
    } catch (err) {
      watchlist.value = watchlist.value.filter(m => m.id !== movie.id)
      delete watchStatusMap.value[movie.id]
      showToastNotification(`Could not add "${movie.title}" to watchlist`, 'error')
    }
  }
}

const toggleFavorite = async (movie) => {
  if (!requireAuth(() => toggleFavorite(movie), 'Sign in to save your favorite movies.')) return

  const idx = favorites.value.findIndex(m => m.id === movie.id)
  if (idx !== -1) {
    const [removed] = favorites.value.splice(idx, 1)
    showToastNotification(`Removed "${movie.title}" from favorites`, 'remove')
    try {
      await api(`/favorites/${movie.id}`, { method: 'DELETE' })
    } catch (err) {
      if (err.status !== 404) {
        favorites.value.splice(idx, 0, removed)
        showToastNotification(`Could not remove "${movie.title}"`, 'error')
      }
    }
  } else {
    favorites.value.push(movie)
    showToastNotification(`Added "${movie.title}" to favorites`, 'favorite')
    try {
      await api('/favorites', { method: 'POST', body: moviePayload(movie) })
    } catch (err) {
      favorites.value = favorites.value.filter(m => m.id !== movie.id)
      showToastNotification(`Could not add "${movie.title}" to favorites`, 'error')
    }
  }
}

const setWatchStatus = async (movieId, status) => {
  const previous = watchStatusMap.value[movieId]
  watchStatusMap.value[movieId] = status
  showToastNotification(`Status updated`, 'info')

  try {
    await api(`/watchlist/${movieId}`, { method: 'PATCH', body: { status } })
  } catch (err) {
    watchStatusMap.value[movieId] = previous
    showToastNotification('Could not update status', 'error')
  }
}

const cycleWatchStatus = (movie, event) => {
  if (event) event.stopPropagation()
  const current = getWatchStatus(movie.id)
  let next = 'watching'
  if (current === 'plan_to_watch') next = 'watching'
  else if (current === 'watching') next = 'completed'
  else if (current === 'completed') next = 'plan_to_watch'
  setWatchStatus(movie.id, next)
}

// User Data Loading
const loadUserData = async () => {
  try {
    const [wlRes, favRes, srchRes] = await Promise.allSettled([
      api('/watchlist'),
      api('/favorites'),
      api('/recent-searches')
    ])
    if (wlRes.status === 'fulfilled' && wlRes.value && wlRes.value.data) {
      watchlist.value = wlRes.value.data
      watchStatusMap.value = Object.fromEntries(wlRes.value.data.map(m => [m.id, m.status]))
    }
    if (favRes.status === 'fulfilled' && favRes.value && favRes.value.data) {
      favorites.value = favRes.value.data
    }
    if (srchRes.status === 'fulfilled' && Array.isArray(srchRes.value)) {
      recentSearches.value = srchRes.value
    }
  } catch (err) {
    console.warn('Failed loading account data:', err)
  }
}

// Auth Flow
const openAuthModal = (mode = 'login', message = '') => {
  authMode.value = mode
  authMessage.value = message
  authErrors.value = {}
  isAuthModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeAuthModal = () => {
  isAuthModalOpen.value = false
  pendingAction.value = null
  if (!selectedMovie.value && !isSearchModalOpen.value) {
    document.body.style.overflow = ''
  }
}

const startSession = (token, userData) => {
  authToken.value = token
  user.value = userData
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (e) {
    console.warn('LocalStorage error:', e)
  }
}

const clearSession = () => {
  authToken.value = null
  user.value = null
  watchlist.value = []
  favorites.value = []
  watchStatusMap.value = {}
  recentSearches.value = readGuestRecentSearches()
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch (e) {
    console.warn('LocalStorage error:', e)
  }
}

const submitAuth = async (formData) => {
  if (authLoading.value) return
  authLoading.value = true
  authErrors.value = {}

  const isRegister = authMode.value === 'register'
  const endpoint = isRegister ? '/register' : '/login'

  try {
    const data = await api(endpoint, { method: 'POST', body: formData })
    startSession(data.token, data.user)
    syncUserTheme(data.user)
    closeAuthModal()
    showToastNotification(`Welcome${isRegister ? '' : ' back'}, ${data.user.name}!`, 'success')
    await loadUserData()

    if (pendingAction.value) {
      const act = pendingAction.value
      pendingAction.value = null
      act()
    }
  } catch (err) {
    if (err.status === 422 && err.data && err.data.errors) {
      authErrors.value = err.data.errors
    } else if (err.status === 502 || err.status === 503) {
      authErrors.value = { form: ['CineVault service is momentarily unreachable. Please check your connection or try again in a moment.'] }
    } else {
      authErrors.value = { form: [err.message || 'Authentication failed. Please try again.'] }
    }
  } finally {
    authLoading.value = false
  }
}

const logout = async () => {
  try {
    await api('/logout', { method: 'POST' })
  } catch (e) {
    console.warn('Logout error:', e)
  }
  clearSession()
  showToastNotification('You have signed out.', 'info')
}

const syncUserTheme = (userData) => {
  if (userData && typeof userData.dark_mode === 'boolean') {
    themeMode.value = userData.dark_mode ? 'dark' : 'light'
    darkMode.value = userData.dark_mode
    updateThemeClass()
    try {
      localStorage.setItem(THEME_MODE_KEY, themeMode.value)
      localStorage.setItem(THEME_STORAGE_KEY, darkMode.value ? 'dark' : 'light')
      localStorage.setItem('cinevault_dark_mode', darkMode.value.toString())
    } catch (e) {}
  }
}

const restoreSession = async () => {
  let token = null
  try {
    token = localStorage.getItem(TOKEN_KEY)
  } catch (e) {}
  if (!token) return

  authToken.value = token
  try {
    user.value = await api('/user')
    syncUserTheme(user.value)
    await loadUserData()
  } catch (err) {
    console.warn('Could not restore session:', err)
  }
}

// Notifications & Dialogs
const showToastNotification = (message, type = 'success') => {
  if ($q && $q.notify) {
    let icon = 'check_circle'
    let color = 'positive'
    if (type === 'error') {
      icon = 'error'
      color = 'negative'
    } else if (type === 'favorite') {
      icon = 'favorite'
      color = 'amber-9'
    } else if (type === 'remove') {
      icon = 'delete'
      color = 'blue-grey-8'
    } else if (type === 'info') {
      icon = 'info'
      color = 'info'
    }

    $q.notify({
      message,
      icon,
      color,
      position: 'bottom-right',
      timeout: 3000,
      progress: true,
      actions: [{ icon: 'close', color: 'white', round: true, flat: true, dense: true }]
    })
  }
}

const confirmLogout = () => {
  if ($q && $q.dialog) {
    $q.dialog({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of CineVault?',
      cancel: { flat: true, label: 'Cancel', color: darkMode.value ? 'grey-4' : 'grey-8' },
      ok: { unelevated: true, label: 'Sign Out', color: 'amber-9', textColor: 'white' },
      dark: darkMode.value
    }).onOk(() => {
      logout()
    })
  } else {
    logout()
  }
}

const confirmClearRecentSearches = () => {
  if (!recentSearches.value || recentSearches.value.length === 0) return
  if ($q && $q.dialog) {
    $q.dialog({
      title: 'Clear Search History',
      message: 'Are you sure you want to clear your recent searches?',
      cancel: { flat: true, label: 'Cancel', color: darkMode.value ? 'grey-4' : 'grey-8' },
      ok: { unelevated: true, label: 'Clear All', color: 'amber-9', textColor: 'white' },
      dark: darkMode.value
    }).onOk(() => {
      clearRecentSearches()
      showToastNotification('Search history cleared', 'info')
    })
  } else {
    clearRecentSearches()
  }
}

// Guest Recent Searches LocalStorage
const readGuestRecentSearches = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('cinevault_recent_searches'))
    if (Array.isArray(saved)) {
      return saved.filter(q => typeof q === 'string').map(query => ({ id: null, query }))
    }
  } catch (e) {}
  return DEFAULT_RECENT_SEARCHES.map(query => ({ id: null, query }))
}

const loadLocalStorage = () => {
  try {
    const savedMode = localStorage.getItem(THEME_MODE_KEY)
    if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
      themeMode.value = savedMode
    } else {
      const legacyTheme = localStorage.getItem(THEME_STORAGE_KEY)
      if (legacyTheme === 'light' || legacyTheme === 'dark') {
        themeMode.value = legacyTheme
      } else {
        themeMode.value = 'system'
      }
    }

    if (themeMode.value === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      darkMode.value = prefersDark !== false
    } else {
      darkMode.value = (themeMode.value === 'dark')
    }
  } catch (e) {
    darkMode.value = true
  }
  recentSearches.value = readGuestRecentSearches()
}

const saveLocalStorage = () => {
  try {
    localStorage.setItem(THEME_MODE_KEY, themeMode.value)
    localStorage.setItem(THEME_STORAGE_KEY, darkMode.value ? 'dark' : 'light')
    localStorage.setItem('cinevault_dark_mode', darkMode.value.toString())
    if (!isLoggedIn.value) {
      localStorage.setItem('cinevault_recent_searches', JSON.stringify(recentSearches.value.map(s => s.query)))
    }
  } catch (e) {}
}

// Global Key Listeners & Document Click Handlers
const handleGlobalKeydown = (e) => {
  if (e.key === 'Escape') {
    if (isAuthModalOpen.value) {
      closeAuthModal()
    } else if (activeDropdown.value) {
      closeDropdowns()
    } else if (isSearchModalOpen.value) {
      closeSearchModal()
    } else if (selectedMovie.value) {
      closeModal()
    }
  }
  if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && !selectedMovie.value && !isSearchModalOpen.value && !isAuthModalOpen.value) {
    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : ''
    if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
      e.preventDefault()
      openSearchModal()
    }
  }
}

const handleDocumentClick = (e) => {
  if (!e.target.closest('.custom-dropdown-container')) {
    closeDropdowns()
  }
}

onMounted(() => {
  loadLocalStorage()
  updateThemeClass()

  // Setup OS system theme listener
  if (window.matchMedia) {
    systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    if (systemThemeMediaQuery.addEventListener) {
      systemThemeMediaQuery.addEventListener('change', handleSystemThemeChange)
    } else if (systemThemeMediaQuery.addListener) {
      systemThemeMediaQuery.addListener(handleSystemThemeChange)
    }
  }

  fetchGenres()

  // Parse initial route from URL slug / hash
  if (window.location.hash && window.location.hash !== '#/') {
    handleHashChange()
  } else {
    fetchMovies()
  }

  restoreSession()

  window.addEventListener('hashchange', handleHashChange)
  window.addEventListener('keydown', handleGlobalKeydown)
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  stopHeroAutoplay()
  if (systemThemeMediaQuery) {
    if (systemThemeMediaQuery.removeEventListener) {
      systemThemeMediaQuery.removeEventListener('change', handleSystemThemeChange)
    } else if (systemThemeMediaQuery.removeListener) {
      systemThemeMediaQuery.removeListener(handleSystemThemeChange)
    }
  }
  window.removeEventListener('hashchange', handleHashChange)
  window.removeEventListener('keydown', handleGlobalKeydown)
  document.removeEventListener('click', handleDocumentClick)
})
</script>
