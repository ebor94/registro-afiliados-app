<template>
  <!-- ═══════════════════════════════════════════════════════
       1. DATOS DE LA SOLICITUD
  ════════════════════════════════════════════════════════ -->
  <fieldset class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
    <legend class="text-base font-bold text-gray-800 px-2">Datos de la Solicitud</legend>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
      <BaseSelect
        v-model="store.afiliado.sucursal"
        label="Sucursal"
        :options="opcionesSucursal"
        :error="store.errors['sucursal']"
      />

      <BaseSelect
        v-model="store.afiliado.novedad"
        label="Novedad"
        :options="opcionesNovedad"
        :error="store.errors['novedad']"
      />

      <!-- Adjunto contrato competencia — solo cuando novedad = TRASLADO_COMPETENCIA -->
      <div v-if="store.afiliado.novedad === 'TRASLADO_COMPETENCIA'" class="md:col-span-2 lg:col-span-4">
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">
          Contrato de la competencia <span class="text-red-500">*</span>
          <span class="ml-1 text-xs text-gray-400 font-normal">(JPG, PNG o PDF · máx. 5 MB)</span>
        </label>
        <div class="flex items-center gap-3">
          <label class="flex-1 flex items-center gap-2 px-3 py-2.5 border border-dashed rounded-lg cursor-pointer transition-colors"
                 :class="contratoCompetenciaFile ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-white hover:border-green-400 hover:bg-green-50/30'">
            <svg class="w-4 h-4 flex-shrink-0 transition-colors"
                 :class="contratoCompetenciaFile ? 'text-green-600' : 'text-gray-400'"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            <span v-if="!contratoCompetenciaFile" class="text-sm text-gray-400">Seleccionar contrato...</span>
            <span v-else class="text-sm text-green-700 font-medium truncate">✓ {{ contratoCompetenciaFile.name }}</span>
            <input
              ref="contratoCompetenciaInputRef"
              type="file"
              accept="image/*,.pdf"
              class="sr-only"
              @change="onContratoCompetenciaChange"
            />
          </label>
          <button v-if="contratoCompetenciaFile"
                  @click="limpiarContratoCompetencia"
                  class="text-xs text-red-500 hover:text-red-700 whitespace-nowrap">
            ✕ Quitar
          </button>
        </div>
        <p class="mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          El soporte de pago de la competencia también será solicitado en el siguiente paso.
        </p>
      </div>

      <BaseInput
        v-model="store.afiliado.vigenciaDesde"
        label="Vigencia desde"
        type="date"
        :uppercase="true"
        :error="store.errors['vigenciaDesde']"
      />

      <BaseInput
        v-model="store.afiliado.vigenciaHasta"
        label="Vigencia hasta"
        type="date"
        :uppercase="true"
        :error="store.errors['vigenciaHasta']"
      />
    </div>
  </fieldset>

  <!-- ═══════════════════════════════════════════════════════
       2. DATOS DEL AFILIADO PRINCIPAL
  ════════════════════════════════════════════════════════ -->
  <fieldset class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mt-5">
    <legend class="text-base font-bold text-gray-800 px-2">Datos del Afiliado Principal</legend>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
      <BaseSelect
        v-model="store.afiliado.tipoDocumento"
        label="Tipo de documento"
        :options="tiposDocumento"
        :required="true"
        :error="store.errors['tipoDocumento']"
      />

      <BaseInput
        v-model="store.afiliado.numeroDocumento"
        label="Numero de documento"
        placeholder="Ej: 20906230"
        inputmode="numeric"
        :required="true"
        :uppercase="true"
        :error="store.errors['numeroDocumento']"
      />

      <BaseInput
        v-model="store.afiliado.primerApellido"
        label="Primer apellido"
        :required="true"
        :uppercase="true"
        :error="store.errors['primerApellido']"
      />

      <BaseInput
        v-model="store.afiliado.segundoApellido"
        label="Segundo apellido"
        :uppercase="true"
        :error="store.errors['segundoApellido']"
      />

      <BaseInput
        v-model="store.afiliado.primerNombre"
        label="Primer nombre"
        :required="true"
        :uppercase="true"
        :error="store.errors['primerNombre']"
      />

      <BaseInput
        v-model="store.afiliado.segundoNombre"
        label="Segundo nombre"
        :uppercase="true"
        :error="store.errors['segundoNombre']"
      />

      <BaseInput
        v-model="store.afiliado.fechaNacimiento"
        label="Fecha de nacimiento"
        type="date"
        :required="true"
        :uppercase="true"
        :error="store.errors['fechaNacimiento']"
      />

      <BaseInput
        :modelValue="edad"
        label="Edad"
        :readonly="true"
        :disabled="true"
        :uppercase="true"
      />

      <BaseSelect
        v-model="store.afiliado.sexo"
        label="Sexo"
        :options="opcionesSexo"
        :required="true"
        :uppercase="true"
        :error="store.errors['sexo']"
      />

      <BaseSelect
        v-model="store.afiliado.estadoCivil"
        label="Estado civil"
        :options="opcionesEstadoCivil"
        :required="true"
        :error="store.errors['estadoCivil']"
      />

      <BaseInput
        v-model="store.afiliado.celular"
        label="Celular"
        placeholder="Ej: 3217200388"
        inputmode="tel"
        :required="true"
        :uppercase="true"
        :error="store.errors['celular']"
      />

      <BaseInput
        v-model="store.afiliado.celular2"
        label="Celular 2"
        placeholder="Segundo telefono (opcional)"
        inputmode="tel"
        :uppercase="true"
        :error="store.errors['celular2']"
      />

      <BaseInput
        v-model="store.afiliado.email"
        label="Email"
        type="email"
        :uppercase="true"
        placeholder="correo@dominio.com"
        :error="store.errors['email']"
      />

      <!-- Checkbox: afiliado diferente al contratante -->
      <div class="md:col-span-2 lg:col-span-3">
        <label class="flex items-center gap-2.5 cursor-pointer select-none group w-fit">
          <input
            type="checkbox"
            v-model="store.afiliado.diferenteAlContratante"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <span class="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
            El afiliado es diferente al contratante
          </span>
        </label>
        <p v-if="store.afiliado.diferenteAlContratante" class="mt-1 text-xs text-blue-600 pl-6">
          El primer beneficiario se registrará como Asegurado Principal
        </p>
      </div>
    </div>
  </fieldset>

  <!-- ═══════════════════════════════════════════════════════
       3. UBICACION
  ════════════════════════════════════════════════════════ -->
  <fieldset class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mt-5">
    <legend class="text-base font-bold text-gray-800 px-2">Ubicacion</legend>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
      <BaseSelect
        v-model="store.afiliado.departamento"
        label="Departamento"
        :options="opcionesDepartamentos"
        :error="store.errors['departamento']"
      />

      <BaseSelect
        v-model="store.afiliado.ciudad"
        label="Ciudad"
        :options="opcionesCiudades"
        :disabled="!store.afiliado.departamento"
        :error="store.errors['ciudad']"
      />

      <BaseInput
        v-model="store.afiliado.barrio"
        label="Barrio"
        :uppercase="true"
        placeholder="Ej: Centro, La Esperanza"
        :error="store.errors['barrio']"
      />

      <div class="md:col-span-2 lg:col-span-3">
        <BaseInput
          v-model="store.afiliado.direccion"
          label="Direccion"
          :uppercase="true"
          placeholder="Ej: Avenida 16 Calle 14 N 30"
          :error="store.errors['direccion']"
        />
      </div>
        <div class="md:col-span-2 lg:col-span-3">
                <BaseInput
          v-model="store.afiliado.cicloEstrato"
          label="Ciclo / Estrato"
          placeholder="Ej: 2 o Estrato 3"
          :required="true"
          :uppercase="true"
          :error="store.errors['cicloEstrato']"
        />
       </div>   

    </div>
      
  </fieldset>

  <!-- ═══════════════════════════════════════════════════════
       4. EMPRESA
  ════════════════════════════════════════════════════════ -->
  <fieldset class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mt-5">
    <legend class="text-base font-bold text-gray-800 px-2">Empresa</legend>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
      <!-- NIT con boton buscar -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">NIT</label>
        <div class="flex gap-2">
          <input
            v-model="store.afiliado.nit"
            type="text"
            placeholder="Ej: 900123456"
            inputmode="numeric"
            @keyup.enter="buscarEmpresa"
            class="block w-full rounded-lg border border-gray-300 shadow-sm text-sm px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
          />
          <button
            @click="buscarEmpresa"
            :disabled="buscandoEmpresa || !store.afiliado.nit"
            class="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap flex items-center gap-1"
          >
            <svg v-if="!buscandoEmpresa" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Buscar
          </button>
        </div>
        <p v-if="estadoNit === 'encontrada'" class="mt-1 text-xs text-green-600 font-medium">✓ Empresa encontrada</p>
        <p v-if="estadoNit === 'nueva'" class="mt-1 text-xs text-amber-600 font-medium">⚠ Empresa no registrada — se creara al guardar</p>
        <p v-if="store.errors['nit']" class="mt-1 text-xs text-red-600">{{ store.errors['nit'] }}</p>
      </div>

      <div class="md:col-span-2">
        <BaseInput
          v-model="store.afiliado.nombreEmpresa"
          label="Nombre de la empresa"
          :uppercase="true"
          placeholder="Busque por NIT o ingrese manualmente"
          :readonly="estadoNit === 'encontrada'"
          :disabled="estadoNit === 'encontrada'"
          :error="store.errors['nombreEmpresa']"
        />
      </div>
    </div>
  </fieldset>

  <!-- ═══════════════════════════════════════════════════════
       5. INFORMACION COMERCIAL
  ════════════════════════════════════════════════════════ -->
  <fieldset class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mt-5">
    <legend class="text-base font-bold text-gray-800 px-2">Informacion Comercial</legend>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
      <BaseSelect
        v-model="store.afiliado.canal"
        label="Canal"
        :options="opcionesCanal"
        :required="true"
        :error="store.errors['canal']"
      />

      <BaseSelect
        v-model="store.afiliado.producto"
        label="Producto"
        :options="opcionesProducto"
        :required="true"
        :error="store.errors['producto']"
      />

      <BaseSelect
        v-model="store.afiliado.grupo"
        label="Grupo"
        :options="opcionesGrupo"
        :required="true"
        :error="store.errors['grupo']"
      />

      <BaseSelect
        v-model="store.afiliado.asistenciaFueraDeCasa"
        label="Asistencia fuera de casa"
        :options="opcionesSiNo"
        :error="store.errors['asistenciaFueraDeCasa']"
      />
    </div>
  </fieldset>

  <!-- ═══════════════════════════════════════════════════════
       6. DATOS CENS (solo visible si canal = CENS)
  ════════════════════════════════════════════════════════ -->
  <Transition name="slide-down">
    <fieldset
      v-if="store.esCanalCens"
      class="bg-amber-50 rounded-xl border border-amber-200 shadow-sm p-5 mt-5"
    >
      <legend class="text-base font-bold text-amber-800 px-2">
        Datos CENS <span class="text-amber-600 font-normal text-sm">(requeridos)</span>
      </legend>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <BaseInput
          v-model="store.afiliado.usuarioCens"
          label="Usuario CENS"
          placeholder="Ingrese el usuario"
          :required="true"
          :uppercase="true"
          :error="store.errors['usuarioCens']"
        />



        <BaseSelect
          v-model="store.afiliado.relacionPredio"
          label="Relacion con el predio"
          :options="opcionesRelacionPredio"
          :required="true"
          :uppercase="true"
          :error="store.errors['relacionPredio']"
        />
      </div>
    </fieldset>
  </Transition>

  <!-- ═══════════════════════════════════════════════════════
       7. ACTIVIDAD ECONOMICA
  ════════════════════════════════════════════════════════ -->
  <fieldset class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mt-5">
    <legend class="text-base font-bold text-gray-800 px-2">Actividad Economica</legend>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
      <BaseInput
        v-model="store.afiliado.actividadEconomica"
        label="Actividad economica"
        placeholder="Ej: Comercio al por menor"
        :uppercase="true"
        :error="store.errors['actividadEconomica']"
      />


     <BaseSelect
        v-model="store.afiliado.ocupacion"
        label="Ocupacion"
        :options="ocupaciones"
        :error="store.errors['ocupacion']"
      />

      <BaseSelect
        v-model="store.afiliado.codigoCiiu"
        label="Codigo CIIU"
        :options="opcionesCiiu"
        :error="store.errors['codigoCiiu']"
      />
    </div>
  </fieldset>

  <!-- ═══════════════════════════════════════════════════════
       8. OBSERVACIONES
  ════════════════════════════════════════════════════════ -->
  <fieldset class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mt-5">
    <legend class="text-base font-bold text-gray-800 px-2">Observaciones</legend>

    <div class="mt-2">
      <textarea
        v-model="store.afiliado.observaciones"
        rows="3"
        placeholder="Observaciones adicionales sobre el registro..."
        class="block w-full rounded-lg border border-gray-300 shadow-sm text-sm px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors resize-y"
      />
    </div>
  </fieldset>
</template>

<script setup>
import { computed, watch, onMounted, ref } from 'vue'
import { useAfiliadoStore } from '@/stores/useAfiliadoStore'
import { useAgeCalculator } from '@/composables/useAgeCalculator'
import { useToastStore } from '@/stores/useToastStore'
import { buscarEmpresaPorNit } from '@/api/afiliadoApi'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { departamentos, ciudadesPorDepartamento } from '@/data/colombiaLocations'

const store = useAfiliadoStore()
const toast = useToastStore()

onMounted(() => {
  store.setFormMode('standard')
})

// ── Edad calculada ─────────────────────────────────────────────
const { edad } = useAgeCalculator(computed(() => store.afiliado.fechaNacimiento))
watch(edad, (val) => { store.afiliado.edad = val })

// ── Ciudad se limpia al cambiar departamento ───────────────────
watch(() => store.afiliado.departamento, () => {
  store.afiliado.ciudad = ''
})

// ── Limpiar campos CENS si se cambia de canal ──────────────────
watch(() => store.afiliado.canal, (nuevo) => {
  if (nuevo !== 'CENS') {
    store.afiliado.usuarioCens = ''
    store.afiliado.cicloEstrato = ''
    store.afiliado.relacionPredio = ''
  }
  // Al cambiar canal, limpiar producto y grupo para forzar selección válida
  store.afiliado.producto = ''
  store.afiliado.grupo = ''
})

// ── Limpiar grupo al cambiar producto ──────────────────────────
watch(() => store.afiliado.producto, () => {
  store.afiliado.grupo = ''
})

// ── Búsqueda de empresa por NIT ────────────────────────────────
const buscandoEmpresa = ref(false)
const estadoNit = ref('') // '' | 'encontrada' | 'nueva'

watch(() => store.afiliado.nit, () => {
  estadoNit.value = ''
  store.afiliado.nombreEmpresa = ''
  store.afiliado.empresaId = null
})

async function buscarEmpresa() {
  const nit = store.afiliado.nit?.trim()
  if (!nit) return
  buscandoEmpresa.value = true
  try {
    const { data } = await buscarEmpresaPorNit(nit)
    if (data.success && data.data) {
      store.afiliado.nombreEmpresa = data.data.nombre
      store.afiliado.empresaId = data.data.id
      estadoNit.value = 'encontrada'
    }
  } catch (err) {
    if (err.response?.status === 404) {
      estadoNit.value = 'nueva'
      toast.info('Empresa no encontrada. Complete el nombre para registrarla.')
    } else {
      toast.error('Error al buscar la empresa')
    }
  } finally {
    buscandoEmpresa.value = false
  }
}

// ── Departamentos y ciudades ───────────────────────────────────
const opcionesDepartamentos = computed(() =>
  departamentos.map(d => ({ value: d, label: d }))
)
const opcionesCiudades = computed(() => {
  if (!store.afiliado.departamento) return []
  const ciudades = ciudadesPorDepartamento[store.afiliado.departamento] || []
  return ciudades.map(c => ({ value: c, label: c }))
})

// ── Listas estáticas ──────────────────────────────────────────
const opcionesSucursal = [
  { value: 'CUCUTA',     label: 'Cucuta' },
  { value: 'PAMPLONA',   label: 'Pamplona' },
  { value: 'OCAÑA',      label: 'Ocaña' },
  { value: 'SARAVENA',   label: 'Saravena' },
  { value: 'ARAUCA',     label: 'Arauca' },
  { value: 'TAME',       label: 'Tame' },
  { value: 'CRISTO REY', label: 'Cristo Rey' },
  { value: 'ARAUQUITA',  label: 'Arauquita' }
]

const opcionesNovedad = [
  { value: 'NUEVO',                label: 'Nuevo' },
  { value: 'CAMBIO',               label: 'Cambio' },
  { value: 'TRASLADO',             label: 'Traslado' },
  { value: 'ACTUALIZACION',        label: 'Actualizacion' },
  { value: 'TRASLADO_COMPETENCIA', label: 'Traslado Competencia' }
]

// ── Contrato de competencia (solo para TRASLADO_COMPETENCIA) ───
const contratoCompetenciaFile     = ref(null)
const contratoCompetenciaInputRef = ref(null)

function onContratoCompetenciaChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
  if (!allowed.includes(file.type)) {
    toast.warning('Solo se permiten imágenes JPG, PNG o PDF')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.warning('El archivo no debe superar 5 MB')
    return
  }
  contratoCompetenciaFile.value = file
  store.setContratoCompetenciaFile(file)
}

function limpiarContratoCompetencia() {
  contratoCompetenciaFile.value = null
  store.setContratoCompetenciaFile(null)
  if (contratoCompetenciaInputRef.value) contratoCompetenciaInputRef.value.value = ''
}

watch(() => store.afiliado.novedad, (val) => {
  if (val !== 'TRASLADO_COMPETENCIA') limpiarContratoCompetencia()
})

const tiposDocumento = [
  { value: 'CC',  label: 'CC - Cedula de ciudadania' },
  { value: 'TI',  label: 'TI - Tarjeta de identidad' },
  { value: 'CE',  label: 'CE - Cedula de extranjeria' },
  { value: 'PA',  label: 'PA - Pasaporte' },
  { value: 'PPT', label: 'PPT' },
  { value: 'NIT', label: 'NIT' }
]

const opcionesSexo = [
  { value: 'F', label: 'Femenino' },
  { value: 'M', label: 'Masculino' },
  { value: 'X', label: 'No especifica' }
]

const opcionesEstadoCivil = [
  { value: 'SOLTERO',     label: 'Soltero(a)' },
  { value: 'CASADO',      label: 'Casado(a)' },
  { value: 'UNION_LIBRE', label: 'Union libre' },
  { value: 'DIVORCIADO',  label: 'Divorciado(a)' },
  { value: 'VIUDO',       label: 'Viudo(a)' },
  { value: 'SEPARADO',    label: 'Separado(a)' }
]

const opcionesCanal = [
  { value: 'EMPRESARIAL', label: 'Empresarial' },
  { value: 'INDIVIDUAL',  label: 'Individual' },
  { value: 'CENS',        label: 'Cens' }
]

// Productos disponibles según canal seleccionado
const opcionesProducto = computed(() => {
  if (store.afiliado.canal === 'INDIVIDUAL') {
    return [{ value: 'INTEGRAL', label: 'Integral' }]
  }
  if (store.afiliado.canal === 'CENS') {
    return [{ value: 'CENS', label: 'Cens' }]
  }
  return [
    { value: 'VERDE',    label: 'Verde' },
    { value: 'INTEGRAL', label: 'Integral' }
  ]
})

// Grupos disponibles según canal + producto seleccionado
const opcionesGrupo = computed(() => {
  const { canal, producto } = store.afiliado
  if (canal === 'INDIVIDUAL' && producto === 'INTEGRAL') {
    return [
      { value: 'BASICO',       label: 'Integral Grupo Basico' },
      { value: 'UNIFAMILIAR',  label: 'Integral Unifamiliar' },
      { value: 'UNIPERSONAL',  label: 'Unipersonal (menores de 50 anos)' },
      { value: 'INDIVIDUAL',   label: 'Unipersonal (50 a 65 anos)' }
    ]
  }
  if (canal === 'CENS') {
    return [
      { value: 'CENS_II', label: 'CENS II' }
    ]
  }
  // Canal EMPRESARIAL u otros
  return [
    { value: 'UNIPERSONAL', label: 'Unipersonal' },
    { value: 'UNIFAMILIAR', label: 'Unifamiliar' },
    { value: 'BASICO',      label: 'Basico' },
    { value: 'TRADICIONAL', label: 'Tradicional' }
  ]
})

const opcionesSiNo = [
  { value: 'SI', label: 'Si' },
  { value: 'NO', label: 'No' }
]

const opcionesRelacionPredio = [
  { value: 'FAMILIAR',    label: 'Familiar' },
  { value: 'ARRENDADO',   label: 'Arrendado' },
  { value: 'PROPIETARIO', label: 'Propietario' }
]

  const ocupaciones = [
  { value: 'NO REGISTRA', label: 'No registra' },
  { value: 'INDEPENDIENTE', label: 'Independiente' },
  { value: 'EMPLEADO', label: 'Empleado' },
  { value: 'PENSIONADO', label: 'Pensionado' },
  { value: 'ESTUDIANTE', label: 'Estudiante' }
  ]

const opcionesCiiu = [
  { value: '0111', label: '0111 - Cultivo de cereales' },
  { value: '0121', label: '0121 - Cultivo de cafe' },
  { value: '0141', label: '0141 - Cria de ganado bovino' },
  { value: '1011', label: '1011 - Procesamiento de carnes' },
  { value: '1051', label: '1051 - Elaboracion de productos lacteos' },
  { value: '1081', label: '1081 - Panaderia y similares' },
  { value: '2011', label: '2011 - Fabricacion de sustancias quimicas' },
  { value: '3311', label: '3311 - Mantenimiento de maquinaria' },
  { value: '4111', label: '4111 - Construccion de edificios residenciales' },
  { value: '4511', label: '4511 - Comercio de vehiculos automotores' },
  { value: '4711', label: '4711 - Comercio al por menor en establecimientos' },
  { value: '4719', label: '4719 - Comercio al por menor de otros productos' },
  { value: '4721', label: '4721 - Comercio al por menor de alimentos' },
  { value: '4731', label: '4731 - Comercio al por menor de combustibles' },
  { value: '4771', label: '4771 - Comercio al por menor de prendas de vestir' },
  { value: '4921', label: '4921 - Transporte urbano de pasajeros' },
  { value: '5511', label: '5511 - Alojamiento en hoteles' },
  { value: '5611', label: '5611 - Expendio de comidas' },
  { value: '6201', label: '6201 - Actividades de programacion informatica' },
  { value: '6411', label: '6411 - Banco central' },
  { value: '6412', label: '6412 - Bancos comerciales' },
  { value: '6491', label: '6491 - Cooperativas financieras' },
  { value: '6512', label: '6512 - Seguros de vida' },
  { value: '6621', label: '6621 - Agentes de seguros' },
  { value: '7010', label: '7010 - Administracion empresarial' },
  { value: '7112', label: '7112 - Actividades de ingenieria' },
  { value: '7490', label: '7490 - Otras actividades profesionales' },
  { value: '8010', label: '8010 - Actividades de seguridad privada' },
  { value: '8110', label: '8110 - Servicios a edificios' },
  { value: '8511', label: '8511 - Educacion preescolar' },
  { value: '8521', label: '8521 - Educacion basica secundaria' },
  { value: '8541', label: '8541 - Educacion universitaria' },
  { value: '8610', label: '8610 - Hospitales y clinicas' },
  { value: '8621', label: '8621 - Actividades de medicos' },
  { value: '8622', label: '8622 - Actividades de odontologos' },
  { value: '8690', label: '8690 - Otras actividades de salud' },
  { value: '9311', label: '9311 - Instalaciones deportivas' },
  { value: '9411', label: '9411 - Asociaciones empresariales' },
  { value: '9491', label: '9491 - Organizaciones religiosas' },
  { value: '9601', label: '9601 - Lavado y limpieza de prendas' },
  { value: '9602', label: '9602 - Peluqueria y belleza' },
  { value: '9609', label: '9609 - Otros servicios personales' }
]
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}
</style>
