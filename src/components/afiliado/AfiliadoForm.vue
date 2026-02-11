<script setup>
import { computed, watch } from 'vue'
import { useAfiliadoStore } from '@/stores/useAfiliadoStore'
import { useAgeCalculator } from '@/composables/useAgeCalculator'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const store = useAfiliadoStore()

const { edad } = useAgeCalculator(computed(() => store.afiliado.fechaNacimiento))

watch(edad, (val) => {
  store.afiliado.edad = val
})

const tiposDocumento = [
  { value: 'CC', label: 'CC - Cedula de ciudadania' },
  { value: 'TI', label: 'TI - Tarjeta de identidad' },
  { value: 'CE', label: 'CE - Cedula de extranjeria' },
  { value: 'PA', label: 'PA - Pasaporte' },
  { value: 'NIT', label: 'NIT' }
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

const opcionesCanal = [
  { value: 'BANCARIO', label: 'Bancario' },
  { value: 'LIBRANZA', label: 'Libranza' },
  { value: 'CAJA', label: 'Caja / Punto fisico' },
  { value: 'PSE', label: 'PSE' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'OTRO', label: 'Otro' }
]

const opcionesProducto = [
  { value: 'INTEGRAL', label: 'Integral' },
  { value: 'BASICO', label: 'Basico' },
  { value: 'OTRO', label: 'Otro' }
]

const opcionesGrupo = [
  { value: 'BASICO', label: 'Basico' },
  { value: 'PLUS', label: 'Plus' },
  { value: 'PREMIUM', label: 'Premium' },
  { value: 'OTRO', label: 'Otro' }
]
</script>

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
        :error="store.errors['numeroDocumento']"
      />

      <BaseInput
        v-model="store.afiliado.primerApellido"
        label="Primer apellido"
        :required="true"
        :error="store.errors['primerApellido']"
      />

      <BaseInput
        v-model="store.afiliado.segundoApellido"
        label="Segundo apellido"
        :error="store.errors['segundoApellido']"
      />

      <BaseInput
        v-model="store.afiliado.primerNombre"
        label="Primer nombre"
        :required="true"
        :error="store.errors['primerNombre']"
      />

      <BaseInput
        v-model="store.afiliado.segundoNombre"
        label="Segundo nombre"
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

      <div class="md:col-span-2 lg:col-span-3">
        <BaseInput
          v-model="store.afiliado.direccion"
          label="Direccion"
          placeholder="Ej: Avenida 16 Calle 14 N 30"
          :error="store.errors['direccion']"
        />
      </div>
    </div>
  </fieldset>

  <!-- Informacion comercial -->
  <fieldset class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mt-5">
    <legend class="text-base font-bold text-gray-800 px-2">Informacion Comercial</legend>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
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
    </div>
  </fieldset>
</template>
