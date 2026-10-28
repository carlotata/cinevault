<template>
  <transition name="cineby-modal-fade">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24 overflow-y-auto"
      :class="darkMode ? 'bg-black/80' : 'bg-black/40'"
      @click.self="$emit('close')"
    >
      <div 
        class="w-full max-w-xl rounded-3xl p-5 sm:p-6 relative transition-all border"
        :class="darkMode 
          ? 'bg-[#111622] border-white/10 text-white shadow-2xl shadow-black/80' 
          : 'bg-white border-zinc-200 text-zinc-900 shadow-2xl shadow-zinc-300/40'"
        role="dialog"
        aria-modal="true"
        aria-label="Search movies"
      >
        <!-- Modal Top Bar -->
        <div 
          class="flex items-center justify-between pb-4 border-b mb-4"
          :class="darkMode ? 'border-white/5' : 'border-zinc-100'"
        >
          <div class="flex items-center gap-2.5">
            <div 
              class="w-8 h-8 rounded-lg flex items-center justify-center border"
              :class="darkMode 
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                : 'bg-amber-50 text-amber-600 border-amber-200'"
            >
              <i class="fa-solid fa-magnifying-glass text-xs"></i>
            </div>
            <h3 
              class="font-display text-lg sm:text-xl font-black tracking-tight !m-0"
              :class="darkMode ? 'text-white' : 'text-zinc-900'"
            >
              Search Movies
            </h3>
          </div>

          <button 
            class="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border"
            :class="darkMode 
              ? 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border-white/5' 
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 border-zinc-200'"
            @click="$emit('close')" 
            aria-label="Close search"
          >
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <!-- Search Input Bar -->
        <form class="relative mb-5" @submit.prevent="handleSubmit">
          <div 
            class="flex items-center h-13 px-4 rounded-2xl border focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all"
            :class="darkMode 
              ? 'bg-black/50 border-white/10 shadow-inner' 
              : 'bg-zinc-50 border-zinc-300 shadow-xs'"
          >
            <i 
              class="fa-solid fa-magnifying-glass mr-3 text-base shrink-0 transition-colors"
              :class="darkMode ? 'text-zinc-500' : 'text-zinc-400'"
            ></i>
            <input 
              ref="searchInputRef"
              type="text" 
              class="flex-1 min-w-0 bg-transparent text-sm border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus:border-0 !border-none !outline-none" 
              :class="darkMode 
                ? 'text-white placeholder-zinc-500' 
                : 'text-zinc-900 placeholder-zinc-400'"
              placeholder="Search by movie title, character, or director..." 
              v-model="inputQuery" 
              @keyup.esc="$emit('close')"
            />
            
            <button 
              type="button" 
              v-if="inputQuery" 
              class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs transition-colors cursor-pointer" 
              :class="darkMode 
                ? 'bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white' 
                : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-600 hover:text-black'"
              @click="inputQuery = ''"
              title="Clear input"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>

            <button 
              type="submit" 
              class="shrink-0 h-8 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <span>Search</span>
              <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </form>

        <!-- Quick Trending Keywords -->
        <div class="mb-5">
          <div 
            class="text-[11px] font-black uppercase tracking-wider mb-2.5"
            :class="darkMode ? 'text-zinc-400' : 'text-zinc-500'"
          >
            Popular Searches
          </div>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="kw in ['Spider-Man', 'Oppenheimer', 'Dune', 'Batman', 'Interstellar']" 
              :key="kw"
              class="px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer"
              :class="darkMode 
                ? 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-amber-400 border-white/5' 
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-amber-600 border-zinc-200'"
              @click="quickSearch(kw)"
            >
              {{ kw }}
            </button>
          </div>
        </div>

        <!-- Recent Searches List -->
        <div 
          v-if="recentSearches.length > 0" 
          class="pt-4 border-t"
          :class="darkMode ? 'border-white/5' : 'border-zinc-100'"
        >
          <div class="flex items-center justify-between text-[11px] font-black uppercase tracking-wider mb-2">
            <span :class="darkMode ? 'text-zinc-400' : 'text-zinc-500'">Recent Queries</span>
            <button 
              class="normal-case font-semibold text-xs transition-colors cursor-pointer"
              :class="darkMode 
                ? 'text-zinc-400 hover:text-amber-400' 
                : 'text-zinc-500 hover:text-amber-600'"
              @click="$emit('clear-recent')"
            >
              Clear all
            </button>
          </div>

          <div class="space-y-1">
            <div 
              v-for="(item, idx) in recentSearches" 
              :key="item.id || idx"
              class="group flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer"
              :class="darkMode 
                ? 'bg-transparent hover:bg-white/[0.04]' 
                : 'bg-transparent hover:bg-zinc-100'"
              @click="quickSearch(item.query)"
            >
              <div 
                class="flex items-center gap-2.5 text-xs transition-colors"
                :class="darkMode 
                  ? 'text-zinc-300 group-hover:text-amber-400' 
                  : 'text-zinc-700 group-hover:text-amber-600'"
              >
                <i 
                  class="fa-regular fa-clock text-[11px]"
                  :class="darkMode ? 'text-zinc-500' : 'text-zinc-400'"
                ></i>
                <span class="font-medium">{{ item.query }}</span>
              </div>
              <button 
                class="w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer"
                :class="darkMode 
                  ? 'text-zinc-400 hover:text-rose-400 hover:bg-white/10' 
                  : 'text-zinc-400 hover:text-rose-500 hover:bg-zinc-200'"
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
  recentSearches: { type: Array, default: () => [] },
  initialQuery: { type: String, default: '' },
  darkMode: { type: Boolean, default: true }
})

const emit = defineEmits(['close', 'submit-search', 'clear-recent', 'remove-recent'])

const inputQuery = ref('')
const searchInputRef = ref(null)

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.initialQuery) {
      inputQuery.value = props.initialQuery
    }
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
