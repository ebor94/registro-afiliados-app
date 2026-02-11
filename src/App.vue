<script setup>
import ToastContainer from '@/components/ui/ToastContainer.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-4 py-4">
        <h1 class="text-xl font-bold text-gray-800">Sistema de Registro de Afiliados</h1>
        <p class="text-sm text-gray-500 mt-1">SERFU - Registro de afiliados y grupo familiar</p>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-4 py-6">
      <router-view />
    </main>

    <ToastContainer />
  </div>
</template>
