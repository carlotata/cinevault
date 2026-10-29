<template>
  <div 
    class="relative w-full overflow-hidden min-h-95 sm:min-h-115 md:min-h-130 lg:min-h-145 flex items-end transition-colors duration-300"
    :class="darkMode ? 'bg-obsidian border-b border-white/5' : 'bg-[#f4f6fa] border-b border-zinc-200'"
  >
    <!-- Shimmer Background -->
    <div 
      class="absolute inset-0 bg-linear-to-r from-transparent to-transparent animate-[skeletonShimmer_1.8s_infinite] -translate-x-full"
      :class="darkMode ? 'via-white/4' : 'via-zinc-300/30'"
    ></div>

    <!-- Content Placeholder -->
    <div class="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14 pt-20">
      <div class="max-w-2xl space-y-4">
        <!-- Badge & Meta Pills -->
        <div class="flex items-center gap-2.5">
          <div class="h-6 w-24 rounded-full animate-pulse" :class="darkMode ? 'bg-white/10' : 'bg-zinc-200'"></div>
          <div class="h-6 w-16 rounded-full animate-pulse" :class="darkMode ? 'bg-white/10' : 'bg-zinc-200'"></div>
          <div class="h-6 w-20 rounded-full animate-pulse" :class="darkMode ? 'bg-white/10' : 'bg-zinc-200'"></div>
        </div>

        <!-- Big Title Placeholder -->
        <div class="space-y-2">
          <div class="h-8 sm:h-12 w-3/4 rounded-xl animate-pulse" :class="darkMode ? 'bg-white/10' : 'bg-zinc-300'"></div>
          <div class="h-8 sm:h-12 w-1/2 rounded-xl animate-pulse" :class="darkMode ? 'bg-white/10' : 'bg-zinc-300'"></div>
        </div>

        <!-- Synopsis Lines Placeholder -->
        <div class="space-y-2 pt-2">
          <div class="h-4 w-full rounded animate-pulse" :class="darkMode ? 'bg-white/5' : 'bg-zinc-200'"></div>
          <div class="h-4 w-5/6 rounded animate-pulse" :class="darkMode ? 'bg-white/5' : 'bg-zinc-200'"></div>
          <div class="h-4 w-2/3 rounded animate-pulse" :class="darkMode ? 'bg-white/5' : 'bg-zinc-200'"></div>
        </div>

        <!-- Button Placeholders -->
        <div class="flex flex-col sm:flex-row gap-3 pt-4">
          <div class="h-11 w-full sm:w-36 bg-amber-500/20 rounded-xl animate-pulse"></div>
          <div class="h-11 w-full sm:w-32 rounded-xl animate-pulse" :class="darkMode ? 'bg-white/10' : 'bg-zinc-200'"></div>
          <div class="h-11 w-full sm:w-12 rounded-xl animate-pulse" :class="darkMode ? 'bg-white/10' : 'bg-zinc-200'"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  darkMode: { type: Boolean, default: true }
})
</script>