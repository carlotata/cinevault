<template>
  <section class="py-4 select-none min-w-0 w-full relative z-30">
    <!-- Click-outside Backdrop Overlay (Dismisses dropdowns, prevents movie click-through) -->
    <div 
      v-if="activeDropdown" 
      class="fixed inset-0 z-40 bg-black/40 md:bg-transparent backdrop-blur-[1px] md:backdrop-blur-none"
      @click="$emit('close-dropdowns')"
      aria-hidden="true"
    ></div>
    <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 min-w-0 w-full">
      
      <!-- Category Pills Strip (smooth horizontal scroll on mobile & tablet) -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar whitespace-nowrap min-w-0 max-w-full">
        <button 
          v-for="cat in categories" 
          :key="cat.id"
          class="shrink-0 flex items-center gap-2 h-10 px-4 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer border"
          :class="[
            currentCategory === cat.id && !activeSearchQuery
              ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/25 font-extrabold'
              : (darkMode 
                  ? 'bg-white/4 hover:bg-white/8 text-zinc-300 hover:text-white border-white/5' 
                  : 'bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 border-zinc-200/90 shadow-xs')
          ]"
          @click="$emit('select-category', cat.id)"
        >
          <i :class="cat.icon" class="text-xs"></i>
          <span>{{ cat.label }}</span>
        </button>
      </div>

      <!-- Custom Dropdowns: 3 Symmetrical Columns on mobile/tablet, Flex on Desktop -->
      <div class="grid grid-cols-3 lg:flex items-center gap-1.5 sm:gap-2 min-w-0 w-full lg:w-auto relative z-40">
        
        <!-- Custom Genre Dropdown -->
        <div class="custom-dropdown-container relative min-w-0" :class="{ 'z-50': activeDropdown === 'genre' }">
          <button 
            class="w-full md:w-auto h-10 px-3 sm:px-4 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-between md:justify-start gap-1.5 border cursor-pointer"
            :class="[
              activeDropdown === 'genre' || selectedGenre !== null
                ? (darkMode 
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-extrabold' 
                    : 'bg-amber-50 text-amber-700 border-amber-400 font-extrabold shadow-xs')
                : (darkMode 
                    ? 'bg-white/4 hover:bg-white/8 text-zinc-300 hover:text-white border-white/5' 
                    : 'bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 border-zinc-200/90 shadow-xs')
            ]"
            @click.stop="toggleDropdown('genre')"
          >
            <i class="fa-solid fa-masks-theater text-xs opacity-75"></i>
            <span class="truncate max-w-[70px] sm:max-w-none">{{ selectedGenreName }}</span>
            <i class="fa-solid fa-chevron-down text-[10px] opacity-75 transition-transform" :class="{ 'rotate-180': activeDropdown === 'genre' }"></i>
          </button>

          <transition name="dropdown-pop">
            <div 
              v-if="activeDropdown === 'genre'" 
              class="absolute left-0 top-full mt-2 w-56 sm:w-64 max-h-72 overflow-y-auto rounded-2xl p-1.5 z-50 backdrop-blur-xl no-scrollbar border shadow-2xl transition-colors"
              :class="darkMode ? 'bg-surface-dark border-white/10 text-white shadow-black/80' : 'bg-white border-zinc-200 text-zinc-900 shadow-xl shadow-zinc-300/40'"
            >
              <div 
                class="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                :class="selectedGenre === null 
                  ? 'bg-amber-500 text-black font-extrabold' 
                  : (darkMode ? 'text-zinc-300 hover:bg-white/8 hover:text-white' : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950')"
                @click.stop="selectGenre(null)"
              >
                <span>All Genres</span>
                <i v-if="selectedGenre === null" class="fa-solid fa-check text-xs"></i>
              </div>
              <div 
                v-for="genre in genres" 
                :key="genre.id"
                class="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                :class="selectedGenre === genre.id 
                  ? 'bg-amber-500 text-black font-extrabold' 
                  : (darkMode ? 'text-zinc-300 hover:bg-white/8 hover:text-white' : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950')"
                @click.stop="selectGenre(genre.id)"
              >
                <span>{{ genre.name }}</span>
                <i v-if="selectedGenre === genre.id" class="fa-solid fa-check text-xs"></i>
              </div>
            </div>
          </transition>
        </div>

        <!-- Custom Rating Dropdown -->
        <div class="custom-dropdown-container relative min-w-0" :class="{ 'z-50': activeDropdown === 'rating' }">
          <button 
            class="w-full md:w-auto h-10 px-3 sm:px-4 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-between md:justify-start gap-1.5 border cursor-pointer"
            :class="[
              activeDropdown === 'rating' || minRating > 0
                ? (darkMode 
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-extrabold' 
                    : 'bg-amber-50 text-amber-700 border-amber-400 font-extrabold shadow-xs')
                : (darkMode 
                    ? 'bg-white/4 hover:bg-white/8 text-zinc-300 hover:text-white border-white/5' 
                    : 'bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 border-zinc-200/90 shadow-xs')
            ]"
            @click.stop="toggleDropdown('rating')"
          >
            <i class="fa-solid fa-star text-amber-400 text-xs"></i>
            <span class="truncate max-w-[70px] sm:max-w-none">{{ selectedRatingLabel }}</span>
            <i class="fa-solid fa-chevron-down text-[10px] opacity-75 transition-transform" :class="{ 'rotate-180': activeDropdown === 'rating' }"></i>
          </button>

          <transition name="dropdown-pop">
            <div 
              v-if="activeDropdown === 'rating'" 
              class="absolute left-1/2 -translate-x-1/2 md:translate-x-0 md:left-0 top-full mt-2 w-48 rounded-2xl p-1.5 z-50 backdrop-blur-xl border shadow-2xl transition-colors"
              :class="darkMode ? 'bg-surface-dark border-white/10 text-white shadow-black/80' : 'bg-white border-zinc-200 text-zinc-900 shadow-xl shadow-zinc-300/40'"
            >
              <div 
                v-for="opt in [
                  { val: 0, label: 'All Ratings' },
                  { val: 6, label: '6.0+ ★ Good' },
                  { val: 7, label: '7.0+ ★ Great' },
                  { val: 8, label: '8.0+ ★ Masterpiece' }
                ]"
                :key="opt.val"
                class="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                :class="minRating === opt.val 
                  ? 'bg-amber-500 text-black font-extrabold' 
                  : (darkMode ? 'text-zinc-300 hover:bg-white/8 hover:text-white' : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950')"
                @click.stop="selectRating(opt.val)"
              >
                <span>{{ opt.label }}</span>
                <i v-if="minRating === opt.val" class="fa-solid fa-check text-xs"></i>
              </div>
            </div>
          </transition>
        </div>

        <!-- Custom Sort Dropdown -->
        <div class="custom-dropdown-container relative min-w-0" :class="{ 'z-50': activeDropdown === 'sort' }">
          <button 
            class="w-full md:w-auto h-10 px-3 sm:px-4 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-between md:justify-start gap-1.5 border cursor-pointer"
            :class="[
              activeDropdown === 'sort' || sortBy !== 'popularity.desc'
                ? (darkMode 
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-extrabold' 
                    : 'bg-amber-50 text-amber-700 border-amber-400 font-extrabold shadow-xs')
                : (darkMode 
                    ? 'bg-white/4 hover:bg-white/8 text-zinc-300 hover:text-white border-white/5' 
                    : 'bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 border-zinc-200/90 shadow-xs')
            ]"
            @click.stop="toggleDropdown('sort')"
          >
            <i class="fa-solid fa-arrow-down-wide-short text-xs opacity-75"></i>
            <span class="truncate max-w-[70px] sm:max-w-none">{{ selectedSortLabel }}</span>
            <i class="fa-solid fa-chevron-down text-[10px] opacity-75 transition-transform" :class="{ 'rotate-180': activeDropdown === 'sort' }"></i>
          </button>

          <transition name="dropdown-pop">
            <div 
              v-if="activeDropdown === 'sort'" 
              class="absolute right-0 top-full mt-2 w-52 rounded-2xl p-1.5 z-50 backdrop-blur-xl border shadow-2xl transition-colors"
              :class="darkMode ? 'bg-surface-dark border-white/10 text-white shadow-black/80' : 'bg-white border-zinc-200 text-zinc-900 shadow-xl shadow-zinc-300/40'"
            >
              <div 
                v-for="opt in [
                  { key: 'popularity.desc', icon: 'fa-solid fa-fire', label: 'Most Popular' },
                  { key: 'vote_average.desc', icon: 'fa-solid fa-star', label: 'Highest Rated' },
                  { key: 'release_date.desc', icon: 'fa-solid fa-calendar-days', label: 'Newest Releases' },
                  { key: 'title.asc', icon: 'fa-solid fa-arrow-down-a-z', label: 'Alphabetical (A-Z)' }
                ]"
                :key="opt.key"
                class="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                :class="sortBy === opt.key 
                  ? 'bg-amber-500 text-black font-extrabold' 
                  : (darkMode ? 'text-zinc-300 hover:bg-white/8 hover:text-white' : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950')"
                @click.stop="selectSort(opt.key)"
              >
                <span class="flex items-center gap-2">
                  <i :class="opt.icon" class="text-xs"></i>
                  <span>{{ opt.label }}</span>
                </span>
                <i v-if="sortBy === opt.key" class="fa-solid fa-check text-xs"></i>
              </div>
            </div>
          </transition>
        </div>

      </div>

    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  currentCategory: { type: String, default: 'popular' },
  activeSearchQuery: { type: String, default: '' },
  genres: { type: Array, default: () => [] },
  selectedGenre: { type: [Number, String], default: null },
  minRating: { type: Number, default: 0 },
  sortBy: { type: String, default: 'popularity.desc' },
  activeDropdown: { type: String, default: null },
  darkMode: { type: Boolean, default: true }
})

const emit = defineEmits([
  'select-category',
  'toggle-dropdown',
  'update:selectedGenre',
  'update:minRating',
  'update:sortBy',
  'reset-filters',
  'close-dropdowns'
])

const selectedGenreName = computed(() => {
  if (!props.selectedGenre) return 'All Genres'
  const found = props.genres.find(g => g.id === Number(props.selectedGenre))
  return found ? found.name : 'All Genres'
})

const selectedRatingLabel = computed(() => {
  if (!props.minRating) return 'All Ratings'
  return `${props.minRating}.0+ ★`
})

const selectedSortLabel = computed(() => {
  switch (props.sortBy) {
    case 'vote_average.desc': return 'Highest Rated'
    case 'release_date.desc': return 'Newest'
    case 'title.asc': return 'A-Z'
    case 'popularity.desc':
    default: return 'Most Popular'
  }
})

const toggleDropdown = (name) => {
  emit('toggle-dropdown', name)
}

const selectGenre = (genreId) => {
  emit('update:selectedGenre', genreId)
  emit('close-dropdowns')
}

const selectRating = (rating) => {
  emit('update:minRating', rating)
  emit('close-dropdowns')
}

const selectSort = (sortKey) => {
  emit('update:sortBy', sortKey)
  emit('close-dropdowns')
}
</script>
