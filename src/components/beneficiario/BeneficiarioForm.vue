<script setup>
import { reactive, computed, watch, ref, nextTick } from 'vue'
import { useAfiliadoStore } from '@/stores/useAfiliadoStore'
import { useAgeCalculator } from '@/composables/useAgeCalculator'
import { useToastStore } from '@/stores/useToastStore'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const emit = defineEmits(['add'])
const store = useAfiliadoStore()
const toast = useToastStore()

// ── Estado de edición ─────────────────────────────────────────
const editingIndex  = ref(null)
const isLoadingEdit = ref(false)

// ── Documento adjunto por beneficiario (opcional) ─────────────
const documentoFile      = ref(null)   // File seleccionado
const documentoActualUrl = ref('')     // Nombre del archivo ya guardado (modo edición)
const fileInputRef       = ref(null)

// Para construir la URL de previsualización del doc existente
const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '')
function fileUrl(filename) { return `${BASE_URL}/uploads/${filename}` }

function onDocumentoChange(e) {
  documentoFile.value = e.target.files[0] || null
  if (documentoFile.value) documentoActualUrl.value = ''
}

function limpiarDocumento() {
  documentoFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// ── Formulario ────────────────────────────────────────────────
const form = reactive({
  tipoBeneficiario: '',
  parentesco:       '',
  genero:           '',
  valorPorPersona:  '',
  tipoDocumento:    '',
  numeroDocumento:  '',
  primerApellido:   '',
  segundoApellido:  '',
  primerNombre:     '',
  segundoNombre:    '',
  fechaNacimiento:  '',
  edad:             0,
  estado:           ''
})

const { edad } = useAgeCalculator(computed(() => form.fechaNacimiento))
watch(edad, (val) => { form.edad = val })

// ── Auto-calcular valorPorPersona para adicionales ────────────
watch(
  () => [form.tipoBeneficiario, form.fechaNacimiento, form.estado],
  () => {
    if (form.tipoBeneficiario !== 'ADICIONAL') {
      form.valorPorPersona = ''
      return
    }
    if (form.estado === 'RETIRO') {
      form.valorPorPersona = 0
      return
    }
    if (!form.fechaNacimiento) return

    const edadActual = edad.value
    if (edadActual < 50) {
      form.valorPorPersona = store.tarifaActiva?.valorAdicional
        ? parseFloat(store.tarifaActiva.valorAdicional)
        : 75900
    } else if (edadActual >= 50 && edadActual < 65) {
      form.valorPorPersona = store.tarifaActiva?.valorAdicionalMayor50
        ? parseFloat(store.tarifaActiva.valorAdicionalMayor50)
        : 86900
    } else {
      form.valorPorPersona = 0
      toast.warning('Edad del beneficiario fuera del rango cubierto por el plan (0 a 64 años)')
    }
  }
)

// ── Auto-asignar parentesco cuando es diferente al contratante ─
watch(() => store.afiliado.diferenteAlContratante, (val) => {
  if (val && store.beneficiarios.length === 0 && !form.parentesco) {
    form.parentesco = 'ASEGURADO PRINCIPAL'
  }
})

// ── Documento tipo ADT ────────────────────────────────────────
const isDocumentoReadonly = computed(() => form.tipoDocumento === 'ADT')

watch(() => form.tipoDocumento, (nuevoTipo) => {
  if (isLoadingEdit.value) return
  if (nuevoTipo === 'ADT') {
    generarNumeroADT()
  } else {
    form.numeroDocumento = ''
  }
})

function generarNumeroADT() {
  const docPrincipal = store.afiliado.numeroDocumento
  if (!docPrincipal) {
    toast.warning('Ingrese primero el numero de documento del afiliado principal')
    form.tipoDocumento = ''
    return
  }
  const prefijo = docPrincipal
  const consecutivos = store.beneficiarios
    .filter((b, i) => b.tipoDocumento === 'ADT' && i !== editingIndex.value && b.numeroDocumento.startsWith(prefijo))
    .map(b => parseInt(b.numeroDocumento.slice(prefijo.length)))
    .filter(n => !isNaN(n))

  const maxConsecutivo = consecutivos.length > 0 ? Math.max(...consecutivos) : 0
  form.numeroDocumento = prefijo + String(maxConsecutivo + 1).padStart(2, '0')
}

// ── Computeds ─────────────────────────────────────────────────
const isValorReadonly = computed(() => form.tipoBeneficiario === 'ADICIONAL')
const modoEdicion     = computed(() => editingIndex.value !== null)

// ── Validación de restricciones por grupo ─────────────────────
const HIJOS    = ['HIJO (A)', 'HIJO ADOPTIVO', 'HIJO CON INCAPACIDAD', 'HIJASTRO (A)']
const HERMANOS = ['HERMANO (A)', 'HERMANO CON INCAPACIDAD', 'HERMANASTRO (A)']
const SUEGROS  = ['SUEGRO (A)', 'SUEGRASTRO']
const CONYUGE  = ['CONYUGE', 'COMPAÑERO (A)']
const EC_NO_SOLTERO = ['CASADO', 'UNION_LIBRE', 'SEPARADO']

function validarRestriccionesGrupo() {
  const grupo      = store.afiliado.grupo
  const parentesco = form.parentesco
  const edadActual = edad.value

  // ─ Integral Grupo Básico ──────────────────────────────────────
  if (grupo === 'BASICO') {
    if (parentesco === 'PADRE' || parentesco === 'MADRE') {
      if (edadActual >= 75) {
        toast.error(
          `En Integral Grupo Básico, Padre o Madre debe tener menos de 75 años ` +
          `(edad actual: ${edadActual} años)`
        )
        return false
      }
    }
    if (parentesco === 'CONYUGE' || parentesco === 'COMPAÑERO (A)') {
      if (edadActual >= 65) {
        toast.error(
          `En Integral Grupo Básico, Cónyuge o Compañero(a) debe tener menos de 65 años ` +
          `(edad actual: ${edadActual} años)`
        )
        return false
      }
    }

    // Solo aplican para beneficiarios DE_LEY
    if (form.tipoBeneficiario === 'DE_LEY') {
      const deLey = store.beneficiariosDeLey.filter((_, i) => i !== editingIndex.value)
      const estadoCivil = store.afiliado.estadoCivil

      const tieneHijos    = deLey.some(b => HIJOS.includes(b.parentesco))
      const tieneHermanos = deLey.some(b => HERMANOS.includes(b.parentesco))
      const tienePadre    = deLey.some(b => b.parentesco === 'PADRE')
      const tieneMadre    = deLey.some(b => b.parentesco === 'MADRE')

      // Regla 1 — Hijos ≤ 30 años, exclusión mutua con hermanos
      if (HIJOS.includes(parentesco)) {
        if (edadActual > 30) {
          toast.error(`En Integral Grupo Básico, los hijos deben tener máximo 30 años (edad: ${edadActual})`)
          return false
        }
        if (tieneHermanos) {
          toast.error('En Integral Grupo Básico no se pueden registrar hijos si ya hay hermanos')
          return false
        }
      }

      // Regla 2 — Hermanos ≤ 30 años, exclusión mutua con hijos/cónyuge/suegros
      if (HERMANOS.includes(parentesco)) {
        if (edadActual > 30) {
          toast.error(`En Integral Grupo Básico, los hermanos deben tener máximo 30 años (edad: ${edadActual})`)
          return false
        }
        if (tieneHijos) {
          toast.error('En Integral Grupo Básico no se pueden registrar hermanos si ya hay hijos')
          return false
        }
        const tieneConyugeOSuegro = deLey.some(b => CONYUGE.includes(b.parentesco) || SUEGROS.includes(b.parentesco))
        if (tieneConyugeOSuegro) {
          toast.error('En Integral Grupo Básico no se pueden registrar hermanos si hay cónyuge o suegros')
          return false
        }
        // Regla 6 — Casado/Separado/Unión libre no puede hermanos
        if (EC_NO_SOLTERO.includes(estadoCivil)) {
          toast.error('Con estado civil casado, separado o unión libre no se pueden registrar hermanos')
          return false
        }
      }

      // Regla 3/4/5 — Suegros según estado civil y padre/madre
      if (SUEGROS.includes(parentesco)) {
        if (estadoCivil === 'SOLTERO') {
          toast.error('Los solteros no pueden registrar suegros en Integral Grupo Básico')
          return false
        }
        if (tienePadre && tieneMadre) {
          toast.error('No se puede registrar suegro si ya están registrados padre y madre')
          return false
        }
      }
    }
  }

  // ─ Integral Unifamiliar ───────────────────────────────────────
  if (grupo === 'UNIFAMILIAR') {
    // Límite total DE_LEY
    const maxBenef = store.afiliado.novedad === 'TRASLADO_COMPETENCIA' ? 10 : 6
    const totalDeLey = store.beneficiariosDeLey.filter((_, i) => i !== editingIndex.value).length
    if (form.tipoBeneficiario === 'DE_LEY' && totalDeLey >= maxBenef) {
      toast.error(`Integral Unifamiliar permite máximo ${maxBenef} beneficiarios (sin incluir titular)`)
      return false
    }

    // Máximo 2 beneficiarios entre 61 y 75 años
    const enRango = edadActual > 60 && edadActual < 76
    if (enRango) {
      const yaEnRango = store.beneficiarios.filter(
        (b, i) => i !== editingIndex.value && b.edad > 60 && b.edad < 76
      ).length
      if (yaEnRango >= 2) {
        toast.error(
          `En Integral Unifamiliar solo se permiten máximo 2 beneficiarios con ` +
          `edad entre 61 y 75 años. Ya hay ${yaEnRango}.`
        )
        return false
      }
    }
  }

  return true
}

// ── Acciones ──────────────────────────────────────────────────
function resetForm() {
  editingIndex.value      = null
  documentoFile.value     = null
  documentoActualUrl.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
  Object.assign(form, {
    tipoBeneficiario: '',
    parentesco:       '',
    genero:           '',
    valorPorPersona:  '',
    tipoDocumento:    '',
    numeroDocumento:  '',
    primerApellido:   '',
    segundoApellido:  '',
    primerNombre:     '',
    segundoNombre:    '',
    fechaNacimiento:  '',
    edad:             0,
    estado:           ''
  })
}

async function editarBeneficiario(beneficiario, index) {
  isLoadingEdit.value      = true
  editingIndex.value       = index
  documentoFile.value      = null
  documentoActualUrl.value = beneficiario.documentoUrl || ''
  if (fileInputRef.value) fileInputRef.value.value = ''

  Object.assign(form, {
    tipoBeneficiario: beneficiario.tipoBeneficiario || '',
    parentesco:       beneficiario.parentesco       || '',
    genero:           beneficiario.genero           || '',
    valorPorPersona:  beneficiario.valorPorPersona  ?? '',
    tipoDocumento:    beneficiario.tipoDocumento    || '',
    numeroDocumento:  beneficiario.numeroDocumento  || '',
    primerApellido:   beneficiario.primerApellido   || '',
    segundoApellido:  beneficiario.segundoApellido  || '',
    primerNombre:     beneficiario.primerNombre     || '',
    segundoNombre:    beneficiario.segundoNombre    || '',
    fechaNacimiento:  beneficiario.fechaNacimiento  || '',
    edad:             beneficiario.edad             || 0,
    estado:           beneficiario.estado           || ''
  })
  await nextTick()
  isLoadingEdit.value = false
}

function handleAdd() {
  if (!form.tipoBeneficiario || !form.parentesco || !form.tipoDocumento ||
      !form.numeroDocumento  || !form.primerApellido || !form.primerNombre ||
      !form.fechaNacimiento  || !form.estado) {
    toast.warning('Complete los campos obligatorios del beneficiario')
    return
  }
  if (form.tipoDocumento !== 'ADT' && !/^\d{5,20}$/.test(form.numeroDocumento)) {
    toast.warning('Numero de documento invalido (5 a 20 digitos)')
    return
  }

  // ── Validaciones por grupo/plan ────────────────────────────
  if (!validarRestriccionesGrupo()) return

  const datos = {
    ...form,
    valorPorPersona: form.valorPorPersona !== '' ? parseFloat(form.valorPorPersona) : null,
    _documentoFile:  documentoFile.value || null   // el store extrae y guarda en beneficiariosFiles
  }

  if (modoEdicion.value) {
    store.updateBeneficiario(editingIndex.value, datos)
    toast.success('Beneficiario actualizado')
    resetForm()
  } else {
    emit('add', datos)
    resetForm()
  }
}

// Exponer para que RegistroView pueda llamar desde BeneficiarioList
defineExpose({ editarBeneficiario })

// ── Listas ────────────────────────────────────────────────────
const tiposBeneficiario = [
  { value: 'DE_LEY',    label: 'Beneficiario' },
  { value: 'ADICIONAL', label: 'Beneficiario adicional' }
]

const opcionesEstado = [
  { value: 'INGRESO',       label: 'Ingreso' },
  { value: 'ACTUALIZACION', label: 'Actualizacion' },
  { value: 'RETIRO',        label: 'Retiro' }
]

const opcionesGenero = [
  { value: 'M', label: 'M - Masculino' },
  { value: 'F', label: 'F - Femenino' }
]

const parentescos = [
  'ABUELASTRO (A)', 'ABUELO (A)', 'AHIJADO (A)', 'ASEGURADO PRINCIPAL',
  'BISABUELO (A)', 'BISNIETO (A)', 'COMPAÑERO (A)', 'CONYUGE',
  'CUÑADO (A)', 'EX-ESPOSO (A)', 'HERMANASTRO (A)', 'HERMANO (A)',
  'HERMANO CON INCAPACIDAD', 'HIJASTRO (A)', 'HIJO (A)', 'HIJO ADOPTIVO',
  'HIJO CON INCAPACIDAD', 'MADRASTRA', 'MADRE', 'MADRINA',
  'NIETO (A)', 'OTRO', 'PADRASTRO', 'PADRE', 'PADRINO',
  'PRIMO (A)', 'PROTEGIDO (A)', 'SERVICIO DOMESTICO (A)', 'SOBRINO (A)',
  'SUEGRASTRO', 'SUEGRO (A)', 'TIO (A)', 'YERNO/NUERA'
].map(p => ({ value: p, label: p.charAt(0) + p.slice(1).toLowerCase() }))

const tiposDocumento = [
  { value: 'CC',  label: 'CC'  },
  { value: 'TI',  label: 'TI'  },
  { value: 'CE',  label: 'CE'  },
  { value: 'PPT', label: 'PPT' },
  { value: 'RC',  label: 'RC'  },
  { value: 'ADT', label: 'ADT' }
]
</script>

<template>
  <div :class="[
    'rounded-lg border p-4 transition-colors',
    modoEdicion
      ? 'bg-amber-50 border-amber-300'
      : 'bg-gray-50 border-gray-200'
  ]">
    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-bold" :class="modoEdicion ? 'text-amber-800' : 'text-gray-700'">
        <span v-if="modoEdicion">✏️ Editando beneficiario</span>
        <span v-else>Agregar miembro del grupo familiar</span>
      </h4>
      <button
        v-if="modoEdicion"
        @click="resetForm"
        class="text-xs text-amber-700 hover:text-amber-900 underline"
      >
        Cancelar edición
      </button>
    </div>

    <!-- Aviso de restricción según grupo seleccionado -->
    <div
      v-if="store.afiliado.grupo === 'BASICO' && store.formMode !== 'veolia'"
      class="mb-3 flex items-start gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
    >
      <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>
        <strong>Integral Grupo Básico — Beneficiarios:</strong>
        Padre/Madre → máx. 74 años ·
        Cónyuge/Compañero(a) → máx. 64 años ·
        Hijos/Hermanos → máx. 30 años (no pueden coexistir) ·
        Casado/Unión libre/Separado → no hermanos ·
        Soltero → no suegros
      </span>
    </div>

    <div
      v-else-if="store.afiliado.grupo === 'UNIFAMILIAR'"
      class="mb-3 flex items-start gap-2 text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2"
    >
      <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>
        <strong>Integral Unifamiliar:</strong>
        Máximo 2 beneficiarios con edad entre 61 y 75 años
        (actualmente:
        <strong>{{ store.beneficiarios.filter(b => b.edad > 60 && b.edad < 76).length }}/2</strong>)
      </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <!-- Tipo, parentesco, género, estado -->
      <BaseSelect
        v-model="form.tipoBeneficiario"
        label="Tipo"
        :options="tiposBeneficiario"
        :required="true"
      />

      <BaseSelect
        v-model="form.parentesco"
        label="Parentesco"
        :options="parentescos"
        :required="true"
      />

      <BaseSelect
        v-model="form.genero"
        label="Genero"
        :options="opcionesGenero"
      />

      <BaseSelect
        v-model="form.estado"
        label="Tipo de solicitud"
        :options="opcionesEstado"
        :required="true"
      />

      <!-- Documento -->
      <BaseSelect
        v-model="form.tipoDocumento"
        label="Tipo de documento"
        :options="tiposDocumento"
        :required="true"
      />

      <!-- Leyenda ADT -->
      <p class="col-span-full flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
        <svg class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>
          ¿No conoces el número de documento del beneficiario? Selecciona
          <strong class="font-semibold">ADT</strong> como tipo — el sistema asignará
          un código automáticamente usando el documento del titular.
        </span>
      </p>

      <BaseInput
        v-model="form.numeroDocumento"
        label="Numero de documento"
        :placeholder="isDocumentoReadonly ? '' : 'Solo numeros'"
        inputmode="numeric"
        :required="true"
        :readonly="isDocumentoReadonly"
        :disabled="isDocumentoReadonly"
        :uppercase="true"
      />

      <!-- Nombres -->
      <BaseInput
        v-model="form.primerApellido"
        label="Primer apellido"
        :required="true"
        :uppercase="true"
      />

      <BaseInput
        v-model="form.segundoApellido"
        label="Segundo apellido"
        :uppercase="true"
      />

      <BaseInput
        v-model="form.primerNombre"
        label="Primer nombre"
        :required="true"
        :uppercase="true"
      />

      <BaseInput
        v-model="form.segundoNombre"
        label="Segundo nombre"
        :uppercase="true"
      />

      <!-- Fecha y edad -->
      <BaseInput
        v-model="form.fechaNacimiento"
        label="Fecha de nacimiento"
        type="date"
        :required="true"
        :uppercase="true"
      />

      <BaseInput
        :modelValue="edad"
        label="Edad"
        :readonly="true"
        :disabled="true"
        :uppercase="true"
      />

      <!-- Valor por persona (automático para adicionales, manual para de ley) — oculto en Veolia -->
      <div v-if="store.formMode !== 'veolia'">
        <BaseInput
          v-model="form.valorPorPersona"
          label="Valor por persona"
          :placeholder="isValorReadonly ? '' : 'Ej: 8000'"
          inputmode="numeric"
          type="number"
          min="0"
          :readonly="isValorReadonly"
          :disabled="isValorReadonly"
        />
        <p v-if="form.tipoBeneficiario === 'ADICIONAL' && form.estado === 'RETIRO'"
           class="mt-1 text-xs text-amber-600 font-medium">
          Retiro: no suma al valor del contrato
        </p>
      </div>

      <!-- ── Documento adjunto (opcional) ─────────────────────── -->
      <div class="md:col-span-2 lg:col-span-3">
        <label class="block text-sm font-medium text-gray-700 mb-1.5">
          Documento adjunto
          <span class="ml-1 text-xs text-gray-400 font-normal">(opcional — imagen o PDF)</span>
        </label>

        <!-- Enlace al documento ya guardado (modo edición desde servidor) -->
        <div
          v-if="documentoActualUrl && !documentoFile"
          class="flex items-center gap-2 mb-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
          </svg>
          <a :href="fileUrl(documentoActualUrl)" target="_blank"
             class="text-sm text-blue-600 hover:underline flex-1 truncate">
            Ver documento actual
          </a>
          <button
            @click="documentoActualUrl = ''"
            class="text-xs text-red-500 hover:text-red-700 whitespace-nowrap"
          >
            Reemplazar
          </button>
        </div>

        <!-- Input de archivo (oculto cuando ya hay doc guardado y no se quiere reemplazar) -->
        <div v-if="!documentoActualUrl || documentoFile">
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="flex-1 flex items-center gap-2 px-3 py-2.5 border border-dashed border-gray-300 rounded-lg bg-white hover:border-green-400 hover:bg-green-50/30 transition-colors">
              <svg class="w-4 h-4 text-gray-400 group-hover:text-green-600 flex-shrink-0 transition-colors"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              <span v-if="!documentoFile" class="text-sm text-gray-400">
                Seleccionar archivo...
              </span>
              <span v-else class="text-sm text-green-700 font-medium truncate">
                ✓ {{ documentoFile.name }}
              </span>
            </div>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*,.pdf"
              class="sr-only"
              @change="onDocumentoChange"
            />
          </label>
          <button
            v-if="documentoFile"
            @click="limpiarDocumento"
            class="mt-1 text-xs text-red-500 hover:text-red-700"
          >
            ✕ Quitar archivo
          </button>
        </div>
      </div>
    </div>

    <div class="flex gap-3 mt-4">
      <BaseButton
        :variant="modoEdicion ? 'warning' : 'success'"
        @click="handleAdd"
      >
        <span v-if="modoEdicion">✓ Actualizar beneficiario</span>
        <span v-else>+ Agregar beneficiario</span>
      </BaseButton>
      <BaseButton variant="secondary" @click="resetForm">
        {{ modoEdicion ? 'Cancelar' : 'Limpiar campos' }}
      </BaseButton>
    </div>
  </div>
</template>
