<script setup>
import { reactive, computed, watch } from 'vue'
import { useAgeCalculator } from '@/composables/useAgeCalculator'
import { useToastStore } from '@/stores/useToastStore'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const emit = defineEmits(['add'])

const form = reactive({
  tipoBeneficiario: '',
  parentesco: '',
  tipoDocumento: '',
  numeroDocumento: '',
  primerApellido: '',
  segundoApellido: '',
  primerNombre: '',
  segundoNombre: '',
  fechaNacimiento: '',
  edad: 0
})

const { edad } = useAgeCalculator(computed(() => form.fechaNacimiento))

watch(edad, (val) => {
  form.edad = val
})

const tiposBeneficiario = [
  { value: 'DE_LEY', label: 'Beneficiario de ley' },
  { value: 'ADICIONAL', label: 'Beneficiario adicional' }
]

const parentescos = [
  { value: 'CONYUGE', label: 'Conyuge' },
  { value: 'HIJO(A)', label: 'Hijo(a)' },
  { value: 'PADRE', label: 'Padre' },
  { value: 'MADRE', label: 'Madre' },
  { value: 'HERMANO(A)', label: 'Hermano(a)' },
  { value: 'ABUELO(A)', label: 'Abuelo(a)' },
  { value: 'OTRO', label: 'Otro' }
]

const tiposDocumento = [
  { value: 'CC', label: 'CC' },
  { value: 'TI', label: 'TI' },
  { value: 'CE', label: 'CE' },
  { value: 'PA', label: 'PA' },
  { value: 'NIT', label: 'NIT' }
]

function resetForm() {
  Object.assign(form, {
    tipoBeneficiario: '',
    parentesco: '',
    tipoDocumento: '',
    numeroDocumento: '',
    primerApellido: '',
    segundoApellido: '',
    primerNombre: '',
    segundoNombre: '',
    fechaNacimiento: '',
    edad: 0
  })
}

function handleAdd() {
  const toast = useToastStore()

  if (!form.tipoBeneficiario || !form.parentesco || !form.tipoDocumento ||
      !form.numeroDocumento || !form.primerApellido || !form.primerNombre ||
      !form.fechaNacimiento) {
    toast.warning('Complete los campos obligatorios del beneficiario')
    return
  }

  if (!/^\d{5,15}$/.test(form.numeroDocumento)) {
    toast.warning('Numero de documento del beneficiario invalido (5 a 15 digitos)')
    return
  }

  emit('add', { ...form })
  resetForm()
}
</script>

<template>
  <div class="bg-gray-50 rounded-lg border border-gray-200 p-4">
    <h4 class="text-sm font-bold text-gray-700 mb-3">Agregar beneficiario</h4>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <BaseSelect
        v-model="form.tipoBeneficiario"
        label="Tipo de beneficiario"
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
        v-model="form.tipoDocumento"
        label="Tipo documento"
        :options="tiposDocumento"
        :required="true"
      />

      <BaseInput
        v-model="form.numeroDocumento"
        label="Numero documento"
        placeholder="Solo numeros"
        inputmode="numeric"
        :required="true"
      />

      <BaseInput
        v-model="form.primerApellido"
        label="Primer apellido"
        :required="true"
      />

      <BaseInput
        v-model="form.segundoApellido"
        label="Segundo apellido"
      />

      <BaseInput
        v-model="form.primerNombre"
        label="Primer nombre"
        :required="true"
      />

      <BaseInput
        v-model="form.segundoNombre"
        label="Segundo nombre"
      />

      <BaseInput
        v-model="form.fechaNacimiento"
        label="Fecha nacimiento"
        type="date"
        :required="true"
      />

      <BaseInput
        :modelValue="edad"
        label="Edad"
        :readonly="true"
        :disabled="true"
      />
    </div>

    <div class="flex gap-3 mt-4">
      <BaseButton variant="success" @click="handleAdd">
        + Agregar beneficiario
      </BaseButton>
      <BaseButton variant="secondary" @click="resetForm">
        Limpiar campos
      </BaseButton>
    </div>
  </div>
</template>
