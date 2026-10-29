<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
    <div 
      v-for="i in count" 
      :key="i"
      class="flex flex-col gap-2 rounded-2xl bg-white/2 p-2 overflow-hidden border border-white/5"
    >
      <!-- Poster Skeleton with Shimmer -->
      <div class="relative w-full aspect-2/3 rounded-xl overflow-hidden bg-surface-dark">
        <div class="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent animate-[skeletonShimmer_1.8s_infinite] -translate-x-full"></div>
        <!-- Badge placeholders -->
        <div class="absolute top-2 left-2 w-10 h-5 rounded-md bg-white/10 animate-pulse"></div>
        <div class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/10 animate-pulse"></div>
      </div>

      <!-- Info Skeleton -->
      <div class="space-y-1.5 px-1 py-1">
        <div class="h-3.5 w-4/5 rounded bg-white/10 animate-pulse"></div>
        <div class="flex items-center justify-between">
          <div class="h-3 w-1/3 rounded bg-white/5 animate-pulse"></div>
          <div class="h-3 w-1/4 rounded bg-white/5 animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 12 }
})
</script>
