<template>
  <div class="relative w-full overflow-hidden bg-[#0e131f] border-b border-white/5 min-h-[380px] sm:min-h-[460px] md:min-h-[520px] lg:min-h-[580px] flex items-end">
    <!-- Shimmer Background -->
    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[skeletonShimmer_1.8s_infinite] -translate-x-full"></div>

    <!-- Content Placeholder -->
    <div class="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14 pt-20">
      <div class="max-w-2xl space-y-4">
        <!-- Badge & Meta Pills -->
        <div class="flex items-center gap-2.5">
          <div class="h-6 w-24 bg-white/10 rounded-full animate-pulse"></div>
          <div class="h-6 w-16 bg-white/10 rounded-full animate-pulse"></div>
          <div class="h-6 w-20 bg-white/10 rounded-full animate-pulse"></div>
        </div>

        <!-- Big Title Placeholder -->
        <div class="space-y-2">
          <div class="h-8 sm:h-12 w-3/4 bg-white/10 rounded-xl animate-pulse"></div>
          <div class="h-8 sm:h-12 w-1/2 bg-white/10 rounded-xl animate-pulse"></div>
        </div>

        <!-- Synopsis Lines Placeholder -->
        <div class="space-y-2 pt-2">
          <div class="h-4 w-full bg-white/5 rounded animate-pulse"></div>
          <div class="h-4 w-5/6 bg-white/5 rounded animate-pulse"></div>
          <div class="h-4 w-2/3 bg-white/5 rounded animate-pulse"></div>
        </div>

        <!-- Button Placeholders -->
        <div class="flex flex-col sm:flex-row gap-3 pt-4">
          <div class="h-11 w-full sm:w-36 bg-amber-500/20 rounded-xl animate-pulse"></div>
          <div class="h-11 w-full sm:w-32 bg-white/10 rounded-xl animate-pulse"></div>
          <div class="h-11 w-full sm:w-12 bg-white/10 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
