<template>
  <header 
    class="fixed top-0 inset-x-0 z-40 w-full transition-all duration-300"
    :class="[
      isScrolled
        ? (darkMode
            ? 'bg-[#080b11]/92 backdrop-blur-xl border-b border-white/10 shadow-xl shadow-black/50 text-white'
            : 'bg-white/92 backdrop-blur-xl border-b border-zinc-200/90 shadow-sm text-zinc-900')
        : (isHeroBlended
            ? (darkMode
                ? 'bg-gradient-to-b from-[#080b11]/90 via-[#080b11]/40 to-transparent border-none text-white shadow-none'
                : 'bg-gradient-to-b from-[#f4f6fa]/95 via-[#f4f6fa]/50 to-transparent border-none text-zinc-900 shadow-none')
            : (darkMode
                ? 'bg-transparent border-none text-white shadow-none'
                : 'bg-transparent border-none text-zinc-900 shadow-none')
          )
    ]"
  >
    <div class="w-full max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 h-16 sm:h-20 flex items-center justify-between gap-4">
      
      <!-- Zone 1: Brand on Left -->
      <div 
        class="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group shrink-0"
        @click="$emit('navigate', 'discover')"
      >
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-extrabold shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform duration-200">
          <i class="fa-solid fa-film text-base sm:text-lg"></i>
        </div>
        <div class="flex items-center gap-1.5 sm:gap-2">
          <span 
            class="font-display text-lg sm:text-2xl font-black tracking-tight transition-colors"
            :class="darkMode ? 'text-white group-hover:text-amber-400' : 'text-zinc-950 group-hover:text-amber-500'"
          >
            CineVault
          </span>
          <span class="hidden sm:inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/20">
            PLUS
          </span>
        </div>
      </div>

      <!-- Zone 2: Balanced Center Navigation (Segmented Pill Island) -->
      <nav 
        class="hidden md:flex items-center gap-1 p-1.5 rounded-full border backdrop-blur-md transition-colors duration-200"
        :class="[
          darkMode
            ? 'bg-white/[0.05] border-white/10 shadow-inner shadow-black/40'
            : 'bg-white/80 border-zinc-200/80 shadow-xs'
        ]"
      >
        <button 
          class="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer"
          :class="[
            activeTab === 'discover' && !activeSearchQuery
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 font-extrabold'
              : (darkMode
                  ? 'text-zinc-300 hover:text-white hover:bg-white/[0.08]'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70')
          ]"
          @click="$emit('navigate', 'discover')"
        >
          <i class="fa-solid fa-house text-xs"></i>
          <span>Home</span>
        </button>

        <button 
          class="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer"
          :class="[
            activeTab === 'watchlist'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 font-extrabold'
              : (darkMode
                  ? 'text-zinc-300 hover:text-white hover:bg-white/[0.08]'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70')
          ]"
          @click="$emit('navigate', 'watchlist')"
        >
          <i class="fa-solid fa-bookmark text-xs"></i>
          <span>Watchlist</span>
          <span 
            v-if="watchlistCount > 0" 
            class="ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold"
            :class="activeTab === 'watchlist' ? 'bg-black/25 text-black' : (darkMode ? 'bg-white/10 text-zinc-300' : 'bg-zinc-200 text-zinc-700')"
          >
            {{ watchlistCount }}
          </span>
        </button>

        <button 
          class="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer"
          :class="[
            activeTab === 'favorites'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 font-extrabold'
              : (darkMode
                  ? 'text-zinc-300 hover:text-white hover:bg-white/[0.08]'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70')
          ]"
          @click="$emit('navigate', 'favorites')"
        >
          <i class="fa-solid fa-heart text-xs" :class="activeTab === 'favorites' ? 'text-black' : 'text-rose-500'"></i>
          <span>Favorites</span>
          <span 
            v-if="favoriteCount > 0" 
            class="ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold"
            :class="activeTab === 'favorites' ? 'bg-black/25 text-black' : 'bg-amber-500/20 text-amber-500'"
          >
            {{ favoriteCount }}
          </span>
        </button>
      </nav>

      <!-- Zone 3: Right Tools & Account -->
      <div class="flex items-center gap-1 sm:gap-2.5 shrink-0">
        
        <!-- Search Trigger Button -->
        <button 
          class="hidden sm:inline-flex items-center gap-2.5 h-10 px-4 rounded-full text-xs font-semibold transition-all border cursor-pointer"
          :class="[
            darkMode
              ? 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border-white/10'
              : 'bg-white/80 hover:bg-white text-zinc-700 hover:text-zinc-950 border-zinc-200/80 shadow-xs'
          ]"
          @click="$emit('open-search')"
          aria-label="Search movies"
        >
          <i class="fa-solid fa-magnifying-glass text-xs" :class="darkMode ? 'text-zinc-400' : 'text-zinc-500'"></i>
          <span>Search...</span>
          <kbd 
            class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
            :class="darkMode ? 'bg-white/10 text-zinc-300' : 'bg-zinc-200 text-zinc-700'"
          >/</kbd>
        </button>

        <!-- Compact Search Icon for Mobile -->
        <button 
          class="sm:hidden w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors border cursor-pointer"
          :class="[
            darkMode
              ? 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border-white/10'
              : 'bg-white/80 hover:bg-white text-zinc-700 hover:text-zinc-950 border-zinc-200/80 shadow-xs'
          ]"
          @click="$emit('open-search')"
          aria-label="Search"
        >
          <i class="fa-solid fa-magnifying-glass"></i>
        </button>

        <!-- Theme Toggle -->
        <button 
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm transition-all border cursor-pointer"
          :class="[
            darkMode
              ? 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-amber-400 border-white/10'
              : 'bg-white/80 hover:bg-white text-amber-600 hover:text-amber-700 border-zinc-200/80 shadow-xs'
          ]"
          @click="$emit('toggle-theme')" 
          :aria-label="darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <i :class="darkMode ? 'fa-solid fa-sun text-amber-400' : 'fa-solid fa-moon text-amber-600'"></i>
        </button>

        <!-- Guest: Sign In Button Only (No sign-up button) -->
        <div v-if="!isLoggedIn">
          <button 
            class="inline-flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-3.5 sm:px-5 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold tracking-wide shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            @click="$emit('open-auth', 'login')" 
            aria-label="Sign in"
          >
            <i class="fa-solid fa-right-to-bracket text-xs"></i>
            <span>Sign in</span>
          </button>
        </div>

        <!-- Logged In: User Profile Chip & Dropdown -->
        <div v-else class="relative" ref="userDropdownRef">
          <button 
            class="inline-flex items-center gap-2 h-10 pl-1 pr-3 rounded-full text-xs font-bold transition-all border cursor-pointer"
            :class="[
              darkMode
                ? 'bg-white/[0.04] hover:bg-white/[0.08] text-white border-white/5'
                : 'bg-white/80 hover:bg-white text-zinc-900 border-zinc-200/80 shadow-xs'
            ]"
            @click.stop="isUserMenuOpen = !isUserMenuOpen"
            aria-label="Account menu"
          >
            <span class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black font-extrabold flex items-center justify-center text-xs">
              {{ userInitial }}
            </span>
            <span class="max-w-[100px] truncate hidden sm:inline" :class="darkMode ? 'text-zinc-200' : 'text-zinc-800'">{{ user.name }}</span>
            <i class="fa-solid fa-chevron-down text-[10px] transition-transform duration-200" :class="[{ 'rotate-180': isUserMenuOpen }, darkMode ? 'text-zinc-400' : 'text-zinc-500']"></i>
          </button>

          <!-- User Dropdown Popover -->
          <transition name="dropdown-pop">
            <div 
              v-if="isUserMenuOpen" 
              class="absolute right-0 mt-2 w-60 rounded-2xl p-2 z-50 backdrop-blur-2xl shadow-2xl transition-all"
              :class="darkMode ? 'bg-[#111622] border border-white/10 shadow-black/80' : 'bg-white border border-zinc-200 shadow-zinc-400/20'"
            >
              <div class="px-3 py-2.5 border-b" :class="darkMode ? 'border-white/5' : 'border-zinc-100'">
                <p class="text-xs font-bold truncate" :class="darkMode ? 'text-white' : 'text-zinc-900'">{{ user.name }}</p>
                <p class="text-[11px] truncate" :class="darkMode ? 'text-zinc-400' : 'text-zinc-500'">{{ user.email }}</p>
              </div>

              <div class="pt-1.5 space-y-1">
                <button 
                  class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  :class="darkMode ? 'text-zinc-300 hover:text-white hover:bg-white/[0.06]' : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'"
                  @click="$emit('navigate', 'watchlist'); isUserMenuOpen = false"
                >
                  <span class="flex items-center gap-2.5">
                    <i class="fa-solid fa-bookmark text-amber-500"></i> My Watchlist
                  </span>
                  <span v-if="watchlistCount > 0" class="text-[10px] px-1.5 py-0.5 rounded-full" :class="darkMode ? 'bg-white/10 text-zinc-300' : 'bg-zinc-200 text-zinc-700'">{{ watchlistCount }}</span>
                </button>

                <button 
                  class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  :class="darkMode ? 'text-zinc-300 hover:text-white hover:bg-white/[0.06]' : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'"
                  @click="$emit('navigate', 'favorites'); isUserMenuOpen = false"
                >
                  <span class="flex items-center gap-2.5">
                    <i class="fa-solid fa-heart text-rose-500"></i> My Favorites
                  </span>
                  <span v-if="favoriteCount > 0" class="text-[10px] bg-rose-500/15 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full">{{ favoriteCount }}</span>
                </button>

                <div class="h-px my-1" :class="darkMode ? 'bg-white/5' : 'bg-zinc-100'"></div>

                <button 
                  class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  @click="$emit('logout'); isUserMenuOpen = false"
                >
                  <i class="fa-solid fa-arrow-right-from-bracket"></i>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </transition>
        </div>

        <!-- Mobile Menu Toggle Button -->
        <button 
          class="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-sm transition-colors border cursor-pointer"
          :class="darkMode 
            ? 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border-white/10' 
            : 'bg-white/80 hover:bg-white text-zinc-800 border-zinc-200/80 shadow-xs'"
          @click="isMobileDrawerOpen = true"
          aria-label="Open mobile menu"
        >
          <i class="fa-solid fa-bars"></i>
        </button>

      </div>

    </div>

    <!-- Mobile Drawer Overlay & Panel -->
    <transition name="mobile-menu-slide">
      <div 
        v-if="isMobileDrawerOpen" 
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end"
        @click.self="isMobileDrawerOpen = false"
      >
        <div 
          class="w-[82vw] max-w-xs h-full border-l p-5 flex flex-col justify-between shadow-2xl transition-colors"
          :class="darkMode ? 'bg-[#111622] border-white/10 text-white' : 'bg-white border-zinc-200 text-zinc-900'"
        >
          <div>
            <!-- Drawer Header -->
            <div class="flex items-center justify-between pb-4 border-b" :class="darkMode ? 'border-white/5' : 'border-zinc-100'">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black font-extrabold text-xs">
                  <i class="fa-solid fa-film"></i>
                </div>
                <span class="text-base font-bold" :class="darkMode ? 'text-white' : 'text-zinc-900'">CineVault</span>
                <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500">PLUS</span>
              </div>
              <button 
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors cursor-pointer"
                :class="darkMode ? 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'"
                @click="isMobileDrawerOpen = false"
                aria-label="Close menu"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <!-- Drawer Links -->
            <div class="mt-5 space-y-2">
              <button 
                class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                :class="activeTab === 'discover' && !activeSearchQuery 
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/25' 
                  : (darkMode ? 'text-zinc-300 hover:bg-white/[0.05]' : 'text-zinc-700 hover:bg-zinc-100')"
                @click="$emit('navigate', 'discover'); isMobileDrawerOpen = false"
              >
                <span class="flex items-center gap-3">
                  <i class="fa-solid fa-house"></i> Home
                </span>
              </button>

              <button 
                class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                :class="activeTab === 'watchlist' 
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/25' 
                  : (darkMode ? 'text-zinc-300 hover:bg-white/[0.05]' : 'text-zinc-700 hover:bg-zinc-100')"
                @click="$emit('navigate', 'watchlist'); isMobileDrawerOpen = false"
              >
                <span class="flex items-center gap-3">
                  <i class="fa-solid fa-bookmark"></i> Watchlist
                </span>
                <span v-if="watchlistCount > 0" class="text-xs px-2 py-0.5 rounded-full" :class="activeTab === 'watchlist' ? 'bg-black/20 text-black font-bold' : (darkMode ? 'bg-white/10 text-zinc-300' : 'bg-zinc-200 text-zinc-700')">
                  {{ watchlistCount }}
                </span>
              </button>

              <button 
                class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                :class="activeTab === 'favorites' 
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/25' 
                  : (darkMode ? 'text-zinc-300 hover:bg-white/[0.05]' : 'text-zinc-700 hover:bg-zinc-100')"
                @click="$emit('navigate', 'favorites'); isMobileDrawerOpen = false"
              >
                <span class="flex items-center gap-3">
                  <i class="fa-solid fa-heart" :class="activeTab === 'favorites' ? 'text-black' : 'text-rose-500'"></i> Favorites
                </span>
                <span v-if="favoriteCount > 0" class="text-xs px-2 py-0.5 rounded-full" :class="activeTab === 'favorites' ? 'bg-black/20 text-black font-bold' : 'bg-amber-500/20 text-amber-500'">
                  {{ favoriteCount }}
                </span>
              </button>

              <button 
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                :class="darkMode ? 'text-zinc-300 hover:bg-white/[0.05]' : 'text-zinc-700 hover:bg-zinc-100'"
                @click="$emit('open-search'); isMobileDrawerOpen = false"
              >
                <i class="fa-solid fa-magnifying-glass text-zinc-400"></i> Search Movies
              </button>
            </div>
          </div>

          <!-- Drawer Footer Auth -->
          <div class="pt-4 border-t" :class="darkMode ? 'border-white/5' : 'border-zinc-100'">
            <div v-if="!isLoggedIn">
              <button 
                class="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/25 cursor-pointer"
                @click="$emit('open-auth', 'login'); isMobileDrawerOpen = false"
              >
                <i class="fa-solid fa-right-to-bracket text-black"></i>
                <span>Sign In to CineVault</span>
              </button>
            </div>
            <div v-else class="space-y-2">
              <div class="flex items-center gap-3 p-2 rounded-xl" :class="darkMode ? 'bg-white/[0.03]' : 'bg-zinc-100'">
                <div class="w-8 h-8 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xs">
                  {{ userInitial }}
                </div>
                <div class="truncate">
                  <p class="text-xs font-bold truncate" :class="darkMode ? 'text-white' : 'text-zinc-900'">{{ user.name }}</p>
                  <p class="text-[10px] text-zinc-400 truncate">{{ user.email }}</p>
                </div>
              </div>
              <button 
                class="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-rose-500/10 text-rose-500 font-semibold text-xs hover:bg-rose-500/20 transition-colors cursor-pointer"
                @click="$emit('logout'); isMobileDrawerOpen = false"
              >
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>Log out</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  activeTab: { type: String, default: 'discover' },
  currentCategory: { type: String, default: 'popular' },
  activeSearchQuery: { type: String, default: '' },
  watchlistCount: { type: Number, default: 0 },
  favoriteCount: { type: Number, default: 0 },
  darkMode: { type: Boolean, default: true },
  isLoggedIn: { type: Boolean, default: false },
  user: { type: Object, default: () => ({ name: '', email: '' }) },
  userInitial: { type: String, default: 'U' }
})

defineEmits(['navigate', 'open-search', 'toggle-theme', 'open-auth', 'logout'])

const isScrolled = ref(false)
const isUserMenuOpen = ref(false)
const isMobileDrawerOpen = ref(false)

const isHeroBlended = computed(() => {
  return !isScrolled.value && props.activeTab === 'discover' && props.currentCategory === 'popular' && !props.activeSearchQuery
})

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

const handleDocumentClick = (e) => {
  if (!e.target.closest('.user-menu')) {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleDocumentClick)
})
</script>
