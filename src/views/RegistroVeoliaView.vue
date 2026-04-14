<template>
  <div class="space-y-6">
    <!-- Banner de actualización de datos -->
    <div class="relative w-full overflow-hidden rounded-xl shadow-md">
      <img
        src="@/assets/images/ActualizacionVeolia.jpeg"
        alt="Actualizar tus datos - La mejor forma de estar en contacto contigo"
        class="w-full h-auto object-cover"
      />
    </div>

    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Registro de Afiliado / Grupo Familiar</h2>
        <p class="text-sm text-gray-500 mt-1">Complete los datos del afiliado y agregue los beneficiarios</p>
      </div>

      <!-- Botón para re-abrir el modal informativo -->
      <button
        @click="showInfo = true"
        class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-colors flex-shrink-0"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Grupos asegurables y tarifas
      </button>
    </div>

    <!-- Formulario del afiliado -->
    <AfiliadoForm />

    <!-- Seccion de beneficiarios -->
    <fieldset class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <legend class="text-base font-bold text-gray-800 px-2">Grupo Familiar</legend>

      <div class="space-y-5 mt-2">
        <!-- Formulario para agregar beneficiario -->
        <BeneficiarioForm ref="beneficiarioFormRef" @add="handleAddBeneficiario" />

        <!-- Lista de beneficiarios -->
        <BeneficiarioList @edit="handleEditBeneficiario" />
      </div>
    </fieldset>

    <!-- Botones de accion -->
    <div class="flex flex-wrap gap-3 pb-8">
      <BaseButton
        variant="primary"
        :loading="store.isSubmitting"
        :disabled="!store.isFormValid"
        @click="handleSubmitClick"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Registrar Afiliado
      </BaseButton>

      <BaseButton variant="secondary" @click="handleReset">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
        </svg>
        Limpiar formulario
      </BaseButton>
    </div>

    <!-- Modal informativo: grupos asegurables y tarifas (se abre automáticamente al cargar) -->
    <InfoGruposModal
      :visible="showInfo"
      @close="showInfo = false"
    />

    <!-- Modal captcha matematico -->
    <CaptchaModal
      :visible="showCaptcha"
      @verified="handleCaptchaVerified"
      @cancel="handleCaptchaCancel"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAfiliadoStore } from '@/stores/useAfiliadoStore'
import { useToastStore } from '@/stores/useToastStore'
import AfiliadoForm from '@/components/afiliado/AfiliadoVeoliaForm.vue'
import BeneficiarioForm from '@/components/beneficiario/BeneficiarioForm.vue'
import BeneficiarioList from '@/components/beneficiario/BeneficiarioList.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import CaptchaModal from '@/components/ui/CaptchaModal.vue'
import InfoGruposModal from '@/components/ui/InfoGruposModal.vue'

const store  = useAfiliadoStore()
const toast  = useToastStore()

const showCaptcha = ref(false)
const showInfo    = ref(true)   // Se abre automáticamente al cargar la página

const beneficiarioFormRef = ref(null)

onMounted(() => {
  store.setFormMode('veolia')
})

function handleAddBeneficiario(beneficiario) {
  const added = store.addBeneficiario(beneficiario)
  if (added) toast.success('Beneficiario agregado')
}

function handleEditBeneficiario(beneficiario, index) {
  beneficiarioFormRef.value?.editarBeneficiario(beneficiario, index)
  beneficiarioFormRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleSubmitClick() {
  if (!store.isFormValid) {
    toast.warning('Complete todos los campos obligatorios del afiliado')
    return
  }
  showCaptcha.value = true
}

async function handleCaptchaVerified() {
  showCaptcha.value = false
  try {
    await store.submitRegistro()
  } catch {
    // Error ya manejado en el store
  }
}

function handleCaptchaCancel() {
  showCaptcha.value = false
  toast.info('Registro cancelado')
}

function handleReset() {
  if (confirm('Esta seguro de limpiar todo el formulario?')) {
    store.resetForm()
    toast.info('Formulario limpiado')
  }
}
</script>
