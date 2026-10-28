<template>
  <footer class="w-full border-t border-zinc-200 dark:border-white/5 bg-white dark:bg-[#080b11] py-10 sm:py-12 text-xs transition-colors duration-200">
    <div class="w-full max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
      
      <!-- Brand Left -->
      <div class="flex flex-col items-center md:items-start gap-2">
        <div 
          class="flex items-center gap-2.5 cursor-pointer select-none group" 
          @click="$emit('navigate', 'discover')"
        >
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-extrabold text-sm shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
            <i class="fa-solid fa-film"></i>
          </div>
          <span class="text-lg font-black text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">
            CineVault
          </span>
          <span class="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/20">
            PLUS
          </span>
        </div>
        <p class="text-zinc-500 dark:text-zinc-400 max-w-sm text-xs leading-relaxed">
          Cinema belongs to the curious — stream trailers, curate your vault, and track great films without limits.
        </p>
      </div>

      <!-- Center Credits -->
      <div class="flex flex-col items-center gap-1.5">
        <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          VUE.JS 3 ACTIVITY BY
        </span>
        <div class="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
          <span>Aviso, John Carl</span>
          <span class="text-amber-500 font-extrabold">·</span>
          <span>Baydal, Lourden</span>
          <span class="text-amber-500 font-extrabold">·</span>
          <span>Patigas, John Paul</span>
        </div>
      </div>

      <!-- Right Disclaimer & Copy (No fabricated claims, honest data source) -->
      <div class="flex flex-col items-center md:items-end gap-1 text-zinc-500 dark:text-zinc-400 text-xs">
        <p class="flex items-center gap-1.5">
          <i class="fa-solid fa-database text-amber-500 text-[10px]"></i>
          <span>Verified film intel powered by TMDB API.</span>
        </p>
        <p class="text-zinc-400 dark:text-zinc-600 font-medium">© 2026 CineVault. All rights reserved.</p>
      </div>

    </div>
  </footer>
</template>

<script setup>
defineEmits(['navigate'])
</script>