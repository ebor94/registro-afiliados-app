<template>
  <!-- Datos personales -->
  <fieldset class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
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
        :error="store.errors['fechaNacimiento']"
      />

      <BaseInput
        :modelValue="edad"
        label="Edad"
        :readonly="true"
        :disabled="true"
      />

      <BaseSelect
        v-model="store.afiliado.sexo"
        label="Sexo"
        :options="opcionesSexo"
        :required="true"
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
        :error="store.errors['celular']"
      />

      <BaseInput
        v-model="store.afiliado.email"
        label="Email"
        type="email"
        placeholder="correo@dominio.com"
        :error="store.errors['email']"
      />
    </div>
  </fieldset>

  <!-- Ubicacion -->
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
        placeholder="Ej: Centro, La Esperanza"
        :uppercase="true"
        :error="store.errors['barrio']"
      />

      <div class="md:col-span-2 lg:col-span-3">
        <BaseInput
          v-model="store.afiliado.direccion"
          label="Direccion"
          placeholder="Ej: Avenida 16 Calle 14 N 30"
          :uppercase="true"
          :error="store.errors['direccion']"
        />
      </div>
    </div>
  </fieldset>

  <!-- Asistencia fuera de casa -->
  <fieldset class="bg-white rounded-xl border border-teal-200 shadow-sm p-5 mt-5">
    <legend class="flex items-center gap-2 text-base font-bold text-gray-800 px-2">
     Asistencia fuera de casa (Opcional)
      <button
        type="button"
        @click="showAsistenciaInfo = true"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
               bg-teal-100 hover:bg-teal-200 text-teal-700 border border-teal-300
               cursor-pointer transition-colors shadow-sm"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        Ver beneficios
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </legend>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      <BaseSelect
        v-model="store.afiliado.asistenciaFueraDeCasa"
        label="¿Desea incluir asistencia fuera de casa por solo $ 2.100 mes?"
        :options="opcionesSiNo"
        :error="store.errors['asistenciaFueraDeCasa']"
      />
    </div>
  </fieldset>

  <AsistenciaInfoModal :visible="showAsistenciaInfo" @close="showAsistenciaInfo = false" />
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAfiliadoStore } from '@/stores/useAfiliadoStore'
import { useAgeCalculator } from '@/composables/useAgeCalculator'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import AsistenciaInfoModal from '@/components/ui/AsistenciaInfoModal.vue'
import { departamentos, ciudadesPorDepartamento } from '@/data/colombiaLocations'

const store = useAfiliadoStore()

const showAsistenciaInfo = ref(false)

const opcionesSiNo = [
  { value: 'SI', label: 'Sí, deseo la asistencia' },
  { value: 'NO', label: 'No deseo la asistencia' }
]

// Activar modo veolia al montar el componente
onMounted(() => {
  store.setFormMode('veolia')
  // Defaults comerciales solo en registro nuevo (no en corrección)
  if (!store.modoCorreccion) {
    store.afiliado.canal    = 'EMPRESARIAL'
    store.afiliado.producto = 'INTEGRAL'
    store.afiliado.grupo    = 'BASICO'
  }
})

const { edad } = useAgeCalculator(computed(() => store.afiliado.fechaNacimiento))

watch(edad, (val) => {
  store.afiliado.edad = val
})

// Cuando cambia el departamento, limpiar la ciudad seleccionada
watch(() => store.afiliado.departamento, () => {
  store.afiliado.ciudad = ''
})

// Opciones de departamentos para el select
const opcionesDepartamentos = computed(() =>
  departamentos.map(d => ({ value: d, label: d }))
)

// Ciudades filtradas segun el departamento seleccionado
const opcionesCiudades = computed(() => {
  if (!store.afiliado.departamento) return []
  const ciudades = ciudadesPorDepartamento[store.afiliado.departamento] || []
  return ciudades.map(c => ({ value: c, label: c }))
})

const tiposDocumento = [
  { value: 'CC',  label: 'CC - Cédula de ciudadanía' },
  { value: 'TI',  label: 'TI - Tarjeta de identidad' },
  { value: 'CE',  label: 'CE - Cédula de extranjería' },
  { value: 'PA',  label: 'PA - Pasaporte' },
  { value: 'PPT', label: 'PPT - Permiso por Protección Temporal' }
]

const opcionesSexo = [
  { value: 'F', label: 'Femenino' },
  { value: 'M', label: 'Masculino' },
  { value: 'X', label: 'No especifica' }
]

const opcionesEstadoCivil = [
  { value: 'SOLTERO', label: 'Soltero(a)' },
  { value: 'CASADO', label: 'Casado(a)' },
  { value: 'UNION_LIBRE', label: 'Union libre' },
  { value: 'DIVORCIADO', label: 'Divorciado(a)' },
  { value: 'VIUDO', label: 'Viudo(a)' },
  { value: 'SEPARADO', label: 'Separado(a)' }
]
</script>
