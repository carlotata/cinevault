<template>
  <transition name="cineby-modal-fade">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24 overflow-y-auto"
      @click.self="$emit('close')"
    >
      <div 
        class="w-full max-w-xl bg-white dark:bg-[#111622] border border-zinc-200 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-zinc-400/20 dark:shadow-black/80 relative transition-all"
        role="dialog"
        aria-modal="true"
        aria-label="Search movies"
      >
        <!-- Modal Top Bar -->
        <div class="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-white/5 mb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <i class="fa-solid fa-magnifying-glass text-xs"></i>
            </div>
            <h3 class="font-display text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight !m-0">Search Movies</h3>
          </div>

          <button 
            class="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-zinc-200 dark:border-white/5"
            @click="$emit('close')" 
            aria-label="Close search"
          >
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <!-- Search Input Bar -->
        <form class="relative mb-5" @submit.prevent="handleSubmit">
          <div class="flex items-center h-13 px-4 rounded-2xl bg-zinc-50 dark:bg-black/50 border border-zinc-300 dark:border-white/10 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all shadow-inner">
            <i class="fa-solid fa-magnifying-glass text-zinc-400 mr-3 text-base shrink-0"></i>
            <input 
              ref="searchInputRef"
              type="text" 
              class="flex-1 min-w-0 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 text-sm border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus:border-0 !border-none !outline-none" 
              placeholder="Search by movie title, character, or director..." 
              v-model="inputQuery" 
              @keyup.esc="$emit('close')"
            />
            
            <button 
              type="button" 
              v-if="inputQuery" 
              class="shrink-0 w-6 h-6 rounded-full bg-zinc-200 hover:bg-zinc-300 dark:bg-white/10 dark:hover:bg-white/20 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white flex items-center justify-center mr-2 text-xs transition-colors cursor-pointer" 
              @click="inputQuery = ''"
              title="Clear input"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>

            <button 
              type="submit" 
              class="shrink-0 h-8 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Search</span>
              <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </form>

        <!-- Quick Trending Keywords -->
        <div class="mb-5">
          <div class="text-[11px] font-black uppercase tracking-wider text-zinc-500 mb-2.5">
            Popular Searches
          </div>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="kw in ['Spider-Man', 'Oppenheimer', 'Dune', 'Batman', 'Interstellar']" 
              :key="kw"
              class="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-zinc-700 hover:text-amber-600 dark:text-zinc-300 dark:hover:text-amber-400 border border-zinc-200 dark:border-white/5 transition-all cursor-pointer"
              @click="quickSearch(kw)"
            >
              {{ kw }}
            </button>
          </div>
        </div>

        <!-- Recent Searches List -->
        <div v-if="recentSearches.length > 0" class="pt-4 border-t border-zinc-100 dark:border-white/5">
          <div class="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-zinc-500 mb-2">
            <span>Recent Queries</span>
            <button 
              class="text-zinc-500 hover:text-amber-500 dark:hover:text-amber-400 normal-case font-semibold text-xs transition-colors cursor-pointer"
              @click="$emit('clear-recent')"
            >
              Clear all
            </button>
          </div>

          <div class="space-y-1">
            <div 
              v-for="(item, idx) in recentSearches" 
              :key="item.id || idx"
              class="group flex items-center justify-between px-3 py-2 rounded-xl bg-transparent hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
              @click="quickSearch(item.query)"
            >
              <div class="flex items-center gap-2.5 text-xs text-zinc-700 group-hover:text-amber-600 dark:text-zinc-300 dark:group-hover:text-amber-400 transition-colors">
                <i class="fa-regular fa-clock text-zinc-400 dark:text-zinc-500 text-[11px]"></i>
                <span class="font-medium">{{ item.query }}</span>
              </div>
              <button 
                class="w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-rose-500 flex items-center justify-center transition-all cursor-pointer"
                @click.stop="$emit('remove-recent', item)" 
                title="Remove"
              >
                <i class="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  recentSearches: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'submit-search', 'clear-recent', 'remove-recent'])

const inputQuery = ref('')
const searchInputRef = ref(null)

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (searchInputRef.value) {
        searchInputRef.value.focus()
      }
    })
  } else {
    inputQuery.value = ''
  }
})

const quickSearch = (query) => {
  inputQuery.value = query
  handleSubmit()
}

const handleSubmit = () => {
  const q = inputQuery.value.trim()
  if (q) {
    emit('submit-search', q)
    emit('close')
  }
}
</script>
