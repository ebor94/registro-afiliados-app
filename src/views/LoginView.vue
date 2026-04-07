<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

        <!-- Header de la card -->
        <div class="bg-gradient-to-br from-green-700 to-green-900 px-8 py-8 text-center">
          <img
            src="https://cucuta.losolivos.co/wp-content/uploads/2023/07/Logo-OLIVOS.webp"
            alt="Logo Los Olivos"
            class="h-14 w-auto object-contain mx-auto mb-4 brightness-0 invert"
          />
          <h1 class="text-white font-bold text-lg leading-tight">Sistema de Registro</h1>
          <p class="text-green-200 text-sm mt-0.5">de Afiliados y Grupo Familiar</p>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="handleLogin" class="px-8 py-7 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Usuario</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                v-model="form.email"
                type="text"
                autocomplete="username"
                placeholder="Ingresa tu usuario"
                :disabled="cargando"
                class="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 transition"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                v-model="form.password"
                :type="mostrarPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
                :disabled="cargando"
                class="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 transition"
              />
              <button
                type="button"
                @click="mostrarPassword = !mostrarPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg v-if="!mostrarPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Error -->
          <transition name="fade">
            <div
              v-if="errorMsg"
              class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg"
            >
              <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {{ errorMsg }}
            </div>
          </transition>

          <!-- Botón -->
          <button
            type="submit"
            :disabled="cargando || !form.email || !form.password"
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-semibold text-sm rounded-lg transition-colors"
          >
            <svg v-if="cargando" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ cargando ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>

      </div>

      <p class="text-center text-xs text-gray-400 mt-5">
        © {{ new Date().getFullYear() }} Los Olivos · Sistema de Afiliados
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ email: '', password: '' })
const cargando = ref(false)
const errorMsg = ref('')
const mostrarPassword = ref(false)

async function handleLogin() {
  errorMsg.value = ''
  cargando.value = true
  try {
    await authStore.login(form.email, form.password)
    // Redirigir según rol: aprobador/admin → aprobaciones, asesor → registro
    router.push(authStore.rutaInicio())
  } catch (err) {
    const status = err.response?.status
    if (status === 401 || status === 400) {
      errorMsg.value = 'Usuario o contraseña incorrectos.'
    } else {
      errorMsg.value = 'Error de conexión. Intenta de nuevo.'
    }
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
