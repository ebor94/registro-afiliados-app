<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import { useAuthStore } from '@/stores/useAuthStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const mostrarHeader = computed(() => route.name !== 'login')

// Visibilidad de secciones de nav según permisos del usuario
const puedeRegistrar  = computed(() =>
  authStore.hasPermiso('afiliaciones', 'crear') ||
  authStore.usuario?.es_super_admin
)
const puedeVerPropias = computed(() =>
  authStore.hasPermiso('afiliaciones', 'ver_propias') ||
  authStore.usuario?.es_super_admin
)
const puedeAprobar    = computed(() =>
  authStore.hasPermiso('afiliaciones', 'aprobar') ||
  authStore.hasPermiso('afiliaciones', 'ver_todas') ||
  authStore.usuario?.es_super_admin
)

function logout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Header principal (oculto en login) -->
    <header v-if="mostrarHeader" class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
        <img
          src="https://cucuta.losolivos.co/wp-content/uploads/2023/07/Logo-OLIVOS.webp"
          alt="Logo Los Olivos"
          class="h-12 w-auto object-contain"
        />

        <div class="h-10 w-px bg-gray-200 hidden sm:block"></div>

        <div class="flex-1">
          <h1 class="text-xl font-bold text-gray-800 leading-tight">Sistema de Registro de Afiliados</h1>
          <p class="text-sm text-gray-500">y grupo familiar</p>
        </div>

        <!-- Navegación + usuario (solo si está autenticado) -->
        <div v-if="authStore.isAuthenticated" class="flex items-center gap-3">

          <!-- Nav links — condicionales según permisos del rol -->
          <nav class="hidden md:flex items-center gap-1">
            <!-- Registro: visible para asesores y admin -->
            <router-link
              v-if="puedeRegistrar"
              :to="{ name: 'registro' }"
              class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
              :class="route.name === 'registro'
                ? 'bg-green-50 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'"
            >
              Registros
            </router-link>

            <!-- Mis afiliaciones: visible para asesores y admin -->
            <router-link
              v-if="puedeVerPropias"
              :to="{ name: 'misAfiliaciones' }"
              class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
              :class="['misAfiliaciones','corregirAfiliacion'].includes(route.name)
                ? 'bg-green-50 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'"
            >
              Mis afiliaciones
            </router-link>

            <!-- Aprobaciones: visible para aprobadores y admin -->
            <router-link
              v-if="puedeAprobar"
              :to="{ name: 'aprobaciones' }"
              class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
              :class="route.name === 'aprobaciones'
                ? 'bg-green-50 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'"
            >
              Aprobaciones
            </router-link>
          </nav>

          <div class="h-7 w-px bg-gray-200 hidden md:block"></div>

          <!-- Info del usuario -->
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {{ authStore.nombreCompleto.charAt(0).toUpperCase() }}
            </div>
            <div class="hidden sm:block">
              <p class="text-sm font-medium text-gray-800 leading-tight">{{ authStore.nombreCompleto }}</p>
              <p class="text-xs text-gray-400 leading-tight">{{ authStore.rol }}</p>
            </div>
          </div>

          <!-- Botón logout -->
          <button
            @click="logout"
            title="Cerrar sesión"
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <main :class="mostrarHeader ? 'max-w-5xl mx-auto px-4 py-6' : ''">
      <router-view />
    </main>

    <ToastContainer />
  </div>
</template>
