<script setup>
import { useAfiliadoStore } from '@/stores/useAfiliadoStore'

const store = useAfiliadoStore()

function confirmarEliminar(index) {
  if (confirm('Esta seguro de eliminar este beneficiario?')) {
    store.removeBeneficiario(index)
  }
}

function globalIndex(tipo, localIdx) {
  if (tipo === 'DE_LEY') return localIdx
  return store.beneficiariosDeLey.length + localIdx
}

function fullName(b) {
  return [b.primerNombre, b.segundoNombre].filter(Boolean).join(' ')
}

function fullLast(b) {
  return [b.primerApellido, b.segundoApellido].filter(Boolean).join(' ')
}
</script>

<template>
  <div class="space-y-4">
    <!-- Beneficiarios de ley -->
    <div>
      <div class="flex items-center gap-2 mb-2">
        <h4 class="text-sm font-bold text-gray-700">Beneficiarios de ley</h4>
        <span class="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-semibold">
          {{ store.beneficiariosDeLey.length }}
        </span>
      </div>

      <div v-if="store.beneficiariosDeLey.length === 0"
           class="text-sm text-gray-400 italic py-3 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
        No se han agregado beneficiarios de ley
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-blue-50 text-blue-900">
              <th class="border border-blue-200 px-3 py-2 text-left">#</th>
              <th class="border border-blue-200 px-3 py-2 text-left">Parentesco</th>
              <th class="border border-blue-200 px-3 py-2 text-left">Tipo Doc</th>
              <th class="border border-blue-200 px-3 py-2 text-left">N. Doc</th>
              <th class="border border-blue-200 px-3 py-2 text-left">Apellidos</th>
              <th class="border border-blue-200 px-3 py-2 text-left">Nombres</th>
              <th class="border border-blue-200 px-3 py-2 text-left">F. Nacimiento</th>
              <th class="border border-blue-200 px-3 py-2 text-left">Edad</th>
              <th class="border border-blue-200 px-3 py-2 text-center">Accion</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(b, idx) in store.beneficiariosDeLey" :key="'ley-'+idx"
                class="hover:bg-blue-50/50 transition-colors">
              <td class="border border-gray-200 px-3 py-2">{{ idx + 1 }}</td>
              <td class="border border-gray-200 px-3 py-2">{{ b.parentesco }}</td>
              <td class="border border-gray-200 px-3 py-2">{{ b.tipoDocumento }}</td>
              <td class="border border-gray-200 px-3 py-2">{{ b.numeroDocumento }}</td>
              <td class="border border-gray-200 px-3 py-2">{{ fullLast(b) }}</td>
              <td class="border border-gray-200 px-3 py-2">{{ fullName(b) }}</td>
              <td class="border border-gray-200 px-3 py-2">{{ b.fechaNacimiento }}</td>
              <td class="border border-gray-200 px-3 py-2">{{ b.edad }}</td>
              <td class="border border-gray-200 px-3 py-2 text-center">
                <button
                  @click="confirmarEliminar(globalIndex('DE_LEY', idx))"
                  class="text-red-500 hover:text-red-700 transition-colors"
                  title="Eliminar"
                >
                  <svg class="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Beneficiarios adicionales -->
    <div>
      <div class="flex items-center gap-2 mb-2">
        <h4 class="text-sm font-bold text-gray-700">Beneficiarios adicionales</h4>
        <span class="inline-flex items-center rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-xs font-semibold">
          {{ store.beneficiariosAdicional.length }}
        </span>
      </div>

      <div v-if="store.beneficiariosAdicional.length === 0"
           class="text-sm text-gray-400 italic py-3 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
        No se han agregado beneficiarios adicionales
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-purple-50 text-purple-900">
              <th class="border border-purple-200 px-3 py-2 text-left">#</th>
              <th class="border border-purple-200 px-3 py-2 text-left">Parentesco</th>
              <th class="border border-purple-200 px-3 py-2 text-left">Tipo Doc</th>
              <th class="border border-purple-200 px-3 py-2 text-left">N. Doc</th>
              <th class="border border-purple-200 px-3 py-2 text-left">Apellidos</th>
              <th class="border border-purple-200 px-3 py-2 text-left">Nombres</th>
              <th class="border border-purple-200 px-3 py-2 text-left">F. Nacimiento</th>
              <th class="border border-purple-200 px-3 py-2 text-left">Edad</th>
              <th class="border border-purple-200 px-3 py-2 text-center">Accion</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(b, idx) in store.beneficiariosAdicional" :key="'adic-'+idx"
                class="hover:bg-purple-50/50 transition-colors">
              <td class="border border-gray-200 px-3 py-2">{{ idx + 1 }}</td>
              <td class="border border-gray-200 px-3 py-2">{{ b.parentesco }}</td>
              <td class="border border-gray-200 px-3 py-2">{{ b.tipoDocumento }}</td>
              <td class="border border-gray-200 px-3 py-2">{{ b.numeroDocumento }}</td>
              <td class="border border-gray-200 px-3 py-2">{{ fullLast(b) }}</td>
              <td class="border border-gray-200 px-3 py-2">{{ fullName(b) }}</td>
              <td class="border border-gray-200 px-3 py-2">{{ b.fechaNacimiento }}</td>
              <td class="border border-gray-200 px-3 py-2">{{ b.edad }}</td>
              <td class="border border-gray-200 px-3 py-2 text-center">
                <button
                  @click="confirmarEliminar(globalIndex('ADICIONAL', idx))"
                  class="text-red-500 hover:text-red-700 transition-colors"
                  title="Eliminar"
                >
                  <svg class="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
