<script setup>
import { ref } from 'vue'
import { useAfiliadoStore } from '@/stores/useAfiliadoStore'

const store = useAfiliadoStore()

// Previews locales
const previewFrontal = ref(null)
const previewReverso = ref(null)
const inputFrontal   = ref(null)
const inputReverso   = ref(null)
const errorFrontal   = ref('')
const errorReverso   = ref('')

const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
const MAX_MB  = 5

function handleFile(e, lado) {
  const file = e.target.files[0]
  if (!file) return

  if (!ALLOWED.includes(file.type)) {
    if (lado === 'frontal') errorFrontal.value = 'Solo JPG, PNG o PDF'
    else                    errorReverso.value  = 'Solo JPG, PNG o PDF'
    return
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    if (lado === 'frontal') errorFrontal.value = `Máximo ${MAX_MB} MB`
    else                    errorReverso.value  = `Máximo ${MAX_MB} MB`
    return
  }

  if (lado === 'frontal') {
    store.cedulaFrontal = file
    errorFrontal.value  = ''
    if (file.type === 'application/pdf') previewFrontal.value = 'pdf'
    else readAsDataURL(file, previewFrontal)
  } else {
    store.cedulaReverso = file
    errorReverso.value  = ''
    if (file.type === 'application/pdf') previewReverso.value = 'pdf'
    else readAsDataURL(file, previewReverso)
  }
}

function readAsDataURL(file, previewRef) {
  const reader = new FileReader()
  reader.onload = (ev) => { previewRef.value = ev.target.result }
  reader.readAsDataURL(file)
}

function limpiar(lado) {
  if (lado === 'frontal') {
    store.cedulaFrontal = null
    previewFrontal.value = null
    errorFrontal.value   = ''
    if (inputFrontal.value) inputFrontal.value.value = ''
  } else {
    store.cedulaReverso = null
    previewReverso.value = null
    errorReverso.value   = ''
    if (inputReverso.value) inputReverso.value.value = ''
  }
}
</script>

<template>
  <fieldset class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
    <legend class="text-base font-bold text-gray-800 px-2">Foto de la Cédula</legend>

    <p class="text-sm text-gray-500 mt-1 mb-4">
      Adjunte una foto de la cédula del afiliado (cara frontal y reverso).
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

      <!-- Frontal -->
      <div>
        <p class="text-sm font-semibold text-gray-700 mb-2">Cara frontal</p>

        <!-- Preview imagen -->
        <div v-if="previewFrontal && previewFrontal !== 'pdf'" class="mb-3 relative inline-block">
          <img :src="previewFrontal" alt="Cédula frontal"
               class="max-h-44 max-w-full rounded-xl border border-gray-200 object-contain shadow-sm" />
          <button @click="limpiar('frontal')"
                  class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6
                         flex items-center justify-center shadow-md transition-colors">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Preview PDF -->
        <div v-else-if="previewFrontal === 'pdf'"
             class="mb-3 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <svg class="w-8 h-8 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p class="text-sm font-medium text-gray-700 truncate flex-1">{{ store.cedulaFrontal?.name }}</p>
          <button @click="limpiar('frontal')" class="text-red-500 hover:text-red-700 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Zona de carga -->
        <div v-if="!previewFrontal"
             class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
             :class="errorFrontal
               ? 'border-red-400 bg-red-50 hover:border-red-500'
               : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'"
             @click="inputFrontal?.click()">
          <svg class="mx-auto w-9 h-9 mb-2"
               :class="errorFrontal ? 'text-red-400' : 'text-gray-400'"
               fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
          </svg>
          <p class="text-sm font-semibold" :class="errorFrontal ? 'text-red-700' : 'text-gray-600'">
            Clic para adjuntar
          </p>
          <p class="text-xs text-gray-400 mt-1">JPG · PNG · PDF · Máx. 5 MB</p>
        </div>

        <input ref="inputFrontal" type="file" accept="image/jpeg,image/jpg,image/png,application/pdf"
               class="hidden" @change="e => handleFile(e, 'frontal')" />
        <p v-if="errorFrontal" class="mt-1 text-xs text-red-600">{{ errorFrontal }}</p>
      </div>

      <!-- Reverso -->
      <div>
        <p class="text-sm font-semibold text-gray-700 mb-2">Cara reverso</p>

        <!-- Preview imagen -->
        <div v-if="previewReverso && previewReverso !== 'pdf'" class="mb-3 relative inline-block">
          <img :src="previewReverso" alt="Cédula reverso"
               class="max-h-44 max-w-full rounded-xl border border-gray-200 object-contain shadow-sm" />
          <button @click="limpiar('reverso')"
                  class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6
                         flex items-center justify-center shadow-md transition-colors">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Preview PDF -->
        <div v-else-if="previewReverso === 'pdf'"
             class="mb-3 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <svg class="w-8 h-8 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p class="text-sm font-medium text-gray-700 truncate flex-1">{{ store.cedulaReverso?.name }}</p>
          <button @click="limpiar('reverso')" class="text-red-500 hover:text-red-700 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Zona de carga -->
        <div v-if="!previewReverso"
             class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
             :class="errorReverso
               ? 'border-red-400 bg-red-50 hover:border-red-500'
               : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'"
             @click="inputReverso?.click()">
          <svg class="mx-auto w-9 h-9 mb-2"
               :class="errorReverso ? 'text-red-400' : 'text-gray-400'"
               fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
          </svg>
          <p class="text-sm font-semibold" :class="errorReverso ? 'text-red-700' : 'text-gray-600'">
            Clic para adjuntar
          </p>
          <p class="text-xs text-gray-400 mt-1">JPG · PNG · PDF · Máx. 5 MB</p>
        </div>

        <input ref="inputReverso" type="file" accept="image/jpeg,image/jpg,image/png,application/pdf"
               class="hidden" @change="e => handleFile(e, 'reverso')" />
        <p v-if="errorReverso" class="mt-1 text-xs text-red-600">{{ errorReverso }}</p>
      </div>

    </div>
  </fieldset>
</template>
