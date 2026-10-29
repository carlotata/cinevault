<template>
  <footer 
    class="w-full border-t py-10 sm:py-12 text-xs transition-colors duration-200"
    :class="darkMode ? 'border-white/5 bg-obsidian text-zinc-400' : 'border-zinc-200 bg-white text-zinc-600'"
  >
    <div class="w-full max-w-360 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
      
      <!-- Brand Left -->
      <div class="flex flex-col items-center md:items-start gap-2">
        <div 
          class="flex items-center gap-2.5 cursor-pointer select-none group" 
          @click="$emit('navigate', 'discover')"
        >
          <div class="w-8 h-8 rounded-lg bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-extrabold text-sm shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
            <i class="fa-solid fa-film"></i>
          </div>
          <span 
            class="text-lg font-black transition-colors"
            :class="darkMode ? 'text-white group-hover:text-amber-400' : 'text-zinc-950 group-hover:text-amber-500'"
          >
            CineVault
          </span>
        </div>
        <p 
          class="max-w-xs text-xs leading-relaxed transition-colors"
          :class="darkMode ? 'text-zinc-400' : 'text-zinc-600'"
        >
          Your ultimate cinematic discovery, personal watchlist, and tracking hub.
        </p>
      </div>

      <!-- Center Credits -->
      <div class="flex flex-col items-center gap-1.5">
        <span 
          class="text-[10px] font-black uppercase tracking-widest transition-colors"
          :class="darkMode ? 'text-zinc-500' : 'text-zinc-400'"
        >
          VUE.JS 3 ACTIVITY BY
        </span>
        <div 
          class="flex flex-wrap items-center justify-center gap-2 text-xs font-bold transition-colors"
          :class="darkMode ? 'text-zinc-300' : 'text-zinc-800'"
        >
          <span>Aviso, John Carl</span>
          <span :class="darkMode ? 'text-amber-400' : 'text-amber-700'" class="font-extrabold">·</span>
          <span>Baydal, Lourden</span>
          <span :class="darkMode ? 'text-amber-400' : 'text-amber-700'" class="font-extrabold">·</span>
          <span>Patigas, John Paul</span>
        </div>
      </div>

      <!-- Right Disclaimer & Copy -->
      <div 
        class="flex flex-col items-center md:items-end gap-1 text-xs transition-colors"
        :class="darkMode ? 'text-zinc-400' : 'text-zinc-600'"
      >
        <p>Data provided by TMDB API.</p>
        <p 
          class="font-medium transition-colors"
          :class="darkMode ? 'text-zinc-500' : 'text-zinc-500'"
        >
          © 2026 CineVault. All rights reserved.
        </p>
      </div>

    </div>
  </footer>
</template>

<script setup>
defineProps({
  darkMode: { type: Boolean, default: true }
})

defineEmits(['navigate'])
</script>