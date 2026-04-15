<script setup>
import { ref } from 'vue'
import { useAfiliadoStore } from '@/stores/useAfiliadoStore'
import { useToastStore } from '@/stores/useToastStore'
import AfiliadoForm from '@/components/afiliado/AfiliadoForm.vue'
import SegurosForm from '@/components/afiliado/SegurosForm.vue'
import ValorContrato from '@/components/afiliado/ValorContrato.vue'
import BeneficiarioForm from '@/components/beneficiario/BeneficiarioForm.vue'
import BeneficiarioList from '@/components/beneficiario/BeneficiarioList.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import CaptchaModal from '@/components/ui/CaptchaModal.vue'
import PagoInicialModal from '@/components/ui/PagoInicialModal.vue'
import CedulaUpload from '@/components/ui/CedulaUpload.vue'
import AceptacionDatosCheck from '@/components/ui/AceptacionDatosCheck.vue'

const store = useAfiliadoStore()
const toast = useToastStore()
const showPago   = ref(false)
const showCaptcha = ref(false)

// Ref al componente BeneficiarioForm para llamar editarBeneficiario
const beneficiarioFormRef = ref(null)

function handleAddBeneficiario(beneficiario) {
  const added = store.addBeneficiario(beneficiario)
  if (added) toast.success('Beneficiario agregado')
}

// Recibe el evento @edit de BeneficiarioList y carga los datos en el form
function handleEditBeneficiario(beneficiario, index) {
  beneficiarioFormRef.value?.editarBeneficiario(beneficiario, index)
  // Hacer scroll al formulario de beneficiario para que el usuario lo vea
  beneficiarioFormRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleSubmitClick() {
  if (!store.isFormValid) {
    toast.warning('Complete todos los campos obligatorios del afiliado')
    return
  }
  // Paso 1: mostrar modal de pago inicial antes del captcha
  showPago.value = true
}

function handlePagoConfirmado(pagoData) {
  // Guardar datos de pago en el store y abrir captcha
  store.setPago(pagoData)
  showPago.value = false
  showCaptcha.value = true
}

function handlePagoCancel() {
  showPago.value = false
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

<template>
  <div class="space-y-6">

    <!-- Titulo -->
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Registro de Afiliado / Grupo Familiar</h2>
      <p class="text-sm text-gray-500 mt-1">Complete los datos del afiliado y agregue los beneficiarios</p>
    </div>

    <!-- Secciones 1-8: AfiliadoForm contiene solicitud, datos personales,
         ubicacion, empresa, comercial, CENS, actividad economica y observaciones -->
    <AfiliadoForm />

    <!-- Seccion 9: Grupo familiar -->
    <fieldset class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <legend class="text-base font-bold text-gray-800 px-2">Grupo Familiar</legend>
      <div class="space-y-5 mt-2">
        <BeneficiarioForm
          ref="beneficiarioFormRef"
          @add="handleAddBeneficiario"
        />
        <BeneficiarioList @edit="handleEditBeneficiario" />
      </div>
    </fieldset>

    <!-- Seccion 10: Seguros -->
    <SegurosForm />

    <!-- Seccion 11: Valor del contrato -->
    <ValorContrato />

    <!-- Seccion 12: Foto de la cédula -->
    <CedulaUpload />

    <!-- Aceptación de tratamiento de datos -->
    <AceptacionDatosCheck v-model="store.aceptaTratamiento" />

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

    <!-- Modal: registro de primera cuota / soporte de pago -->
    <PagoInicialModal
      :visible="showPago"
      :valor-cuota="store.contrato.valorCuota"
      @confirmar="handlePagoConfirmado"
      @cancel="handlePagoCancel"
    />

    <!-- Modal captcha matematico (se abre tras confirmar el pago) -->
    <CaptchaModal
      :visible="showCaptcha"
      @verified="handleCaptchaVerified"
      @cancel="handleCaptchaCancel"
    />

  </div>
</template>
