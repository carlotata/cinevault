<template>
  <transition name="cineby-modal-fade">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      @click.self="$emit('close')"
    >
      <div 
        class="w-full max-w-md rounded-3xl p-6 sm:p-8 relative transition-all border"
        :class="darkMode 
          ? 'bg-[#111622] border-white/10 text-white shadow-2xl shadow-black/80' 
          : 'bg-white border-zinc-200 text-zinc-900 shadow-2xl shadow-zinc-300/40'"
        role="dialog" 
        aria-modal="true" 
        :aria-label="isLogin ? 'Sign in' : 'Create account'"
      >
        <!-- Close Button -->
        <button 
          class="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer border"
          :class="darkMode 
            ? 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border-white/5' 
            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 border-zinc-200'"
          @click="$emit('close')" 
          aria-label="Close dialog"
        >
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>

        <!-- Brand Icon & Header -->
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-extrabold shadow-lg shadow-amber-500/25 shrink-0">
            <i class="fa-solid fa-film text-base"></i>
          </div>
          <div>
            <h3 
              class="font-display text-xl font-bold tracking-tight !m-0"
              :class="darkMode ? 'text-white' : 'text-zinc-900'"
            >
              {{ isLogin ? 'Welcome Back' : 'Create CineVault Account' }}
            </h3>
            <p 
              class="text-xs mt-0.5"
              :class="darkMode ? 'text-zinc-400' : 'text-zinc-500'"
            >
              {{ isLogin ? 'Access your synced watchlist and favorites' : 'Join CineVault to track and rate your favorite films' }}
            </p>
          </div>
        </div>

        <!-- Segmented Mode Toggle (Sign In / Create Account) -->
        <div 
          class="grid grid-cols-2 p-1 rounded-full mb-6 text-xs font-bold border"
          :class="darkMode ? 'bg-white/[0.04] border-white/5' : 'bg-zinc-100 border-zinc-200'"
        >
          <button 
            type="button"
            class="py-2.5 rounded-full transition-all cursor-pointer flex items-center justify-center gap-2"
            :class="[
              isLogin 
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 font-extrabold' 
                : (darkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950')
            ]"
            @click="switchMode('login')"
          >
            <i class="fa-solid fa-right-to-bracket text-xs"></i>
            <span>Sign In</span>
          </button>
          <button 
            type="button"
            class="py-2.5 rounded-full transition-all cursor-pointer flex items-center justify-center gap-2"
            :class="[
              !isLogin 
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 font-extrabold' 
                : (darkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950')
            ]"
            @click="switchMode('register')"
          >
            <i class="fa-solid fa-user-plus text-xs"></i>
            <span>Create Account</span>
          </button>
        </div>

        <!-- Contextual Notification Banner -->
        <div 
          v-if="message" 
          class="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-medium mb-5"
          :class="darkMode ? 'text-amber-300' : 'text-amber-700'"
        >
          <i class="fa-solid fa-circle-info mt-0.5 text-amber-500"></i>
          <span>{{ message }}</span>
        </div>

        <!-- General Form Error -->
        <div 
          v-if="formError" 
          class="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs font-medium mb-5"
          :class="darkMode ? 'text-rose-300' : 'text-rose-600'"
        >
          <i class="fa-solid fa-triangle-exclamation mt-0.5 text-rose-500"></i>
          <span>{{ formError }}</span>
        </div>

        <!-- Form Fields -->
        <form class="space-y-4" @submit.prevent="handleSubmit" novalidate>
          
          <!-- Name Field (Register Only) -->
          <div v-if="!isLogin">
            <label 
              for="auth-name" 
              class="block text-xs font-bold mb-1.5"
              :class="darkMode ? 'text-zinc-300' : 'text-zinc-700'"
            >
              Your Name
            </label>
            <div class="relative">
              <input 
                id="auth-name" 
                type="text" 
                class="w-full h-11 px-4 rounded-xl border text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                :class="darkMode 
                  ? 'bg-black/40 border-white/10 text-white placeholder-zinc-500' 
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'"
                v-model="form.name" 
                placeholder="e.g. Alex Hunter"
                autocomplete="name" 
              />
            </div>
            <span v-if="errors.name" class="text-rose-500 text-xs mt-1 block">
              {{ errors.name[0] }}
            </span>
          </div>

          <!-- Email Field -->
          <div>
            <label 
              for="auth-email" 
              class="block text-xs font-bold mb-1.5"
              :class="darkMode ? 'text-zinc-300' : 'text-zinc-700'"
            >
              Email Address
            </label>
            <div class="relative">
              <input 
                id="auth-email" 
                type="email" 
                class="w-full h-11 px-4 rounded-xl border text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                :class="darkMode 
                  ? 'bg-black/40 border-white/10 text-white placeholder-zinc-500' 
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'"
                v-model="form.email" 
                placeholder="name@example.com"
                autocomplete="email" 
              />
            </div>
            <span v-if="errors.email" class="text-rose-500 text-xs mt-1 block">
              {{ errors.email[0] }}
            </span>
          </div>

          <!-- Password Field with Visibility Toggle -->
          <div>
            <label 
              for="auth-password" 
              class="block text-xs font-bold mb-1.5"
              :class="darkMode ? 'text-zinc-300' : 'text-zinc-700'"
            >
              Password
            </label>
            <div class="relative">
              <input 
                id="auth-password" 
                :type="showPassword ? 'text' : 'password'" 
                class="w-full h-11 pl-4 pr-11 rounded-xl border text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                :class="darkMode 
                  ? 'bg-black/40 border-white/10 text-white placeholder-zinc-500' 
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'"
                v-model="form.password" 
                placeholder="••••••••"
                :autocomplete="isLogin ? 'current-password' : 'new-password'" 
              />
              <button 
                type="button" 
                class="absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer p-1"
                :class="darkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'"
                @click="showPassword = !showPassword"
                :title="showPassword ? 'Hide password' : 'Show password'"
              >
                <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" class="text-xs"></i>
              </button>
            </div>
            <span v-if="errors.password" class="text-rose-500 text-xs mt-1 block">
              {{ errors.password[0] }}
            </span>
          </div>

          <!-- Confirm Password (Register Only) -->
          <div v-if="!isLogin">
            <label 
              for="auth-password-confirm" 
              class="block text-xs font-bold mb-1.5"
              :class="darkMode ? 'text-zinc-300' : 'text-zinc-700'"
            >
              Confirm Password
            </label>
            <div class="relative">
              <input 
                id="auth-password-confirm" 
                :type="showPassword ? 'text' : 'password'" 
                class="w-full h-11 pl-4 pr-11 rounded-xl border text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                :class="darkMode 
                  ? 'bg-black/40 border-white/10 text-white placeholder-zinc-500' 
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'"
                v-model="form.password_confirmation" 
                placeholder="••••••••"
                autocomplete="new-password" 
              />
            </div>
            <span v-if="errors.password_confirmation" class="text-rose-500 text-xs mt-1 block">
              {{ errors.password_confirmation[0] }}
            </span>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="w-full h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:pointer-events-none" 
            :disabled="loading"
          >
            <i v-if="loading" class="fa-solid fa-circle-notch fa-spin text-sm"></i>
            <i v-else :class="isLogin ? 'fa-solid fa-right-to-bracket' : 'fa-solid fa-user-check'" class="text-xs"></i>
            <span>{{ loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account') }}</span>
          </button>
        </form>

        <!-- 1-Click Demo Fill -->
        <div 
          class="mt-5 pt-4 border-t text-center transition-colors"
          :class="darkMode ? 'border-white/5' : 'border-zinc-100'"
        >
          <button 
            type="button" 
            class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer"
            :class="darkMode 
              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20' 
              : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border-amber-500/30'"
            @click="fillDemo"
          >
            <i class="fa-solid fa-wand-magic-sparkles text-[11px]"></i>
            <span>Fill Demo Credentials</span>
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  mode: { type: String, default: 'login' },
  message: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
  darkMode: { type: Boolean, default: true }
})

const emit = defineEmits(['close', 'submit', 'switch-mode', 'update:mode'])

const showPassword = ref(false)
const localMode = ref(props.mode)

watch(() => props.mode, (newMode) => {
  localMode.value = newMode
})

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const isLogin = computed(() => localMode.value === 'login')

const formError = computed(() => {
  return props.errors && props.errors.form ? props.errors.form : null
})

const switchMode = (newMode) => {
  localMode.value = newMode
  emit('switch-mode', newMode)
  emit('update:mode', newMode)
}

const fillDemo = () => {
  form.value.email = 'demo@cinevault.local'
  form.value.password = 'password123'
}

const handleSubmit = () => {
  emit('submit', { ...form.value })
}
</script>
