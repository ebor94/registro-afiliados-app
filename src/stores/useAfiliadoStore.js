import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { createAfiliado } from '@/api/afiliadoApi'
import { useToastStore } from './useToastStore'

export const useAfiliadoStore = defineStore('afiliado', () => {
  const afiliado = reactive({
    tipoDocumento: '',
    numeroDocumento: '',
    primerApellido: '',
    segundoApellido: '',
    primerNombre: '',
    segundoNombre: '',
    fechaNacimiento: '',
    edad: 0,
    sexo: '',
    estadoCivil: '',
    celular: '',
    email: '',
    direccion: '',
    canal: '',
    producto: '',
    grupo: ''
  })

  const beneficiarios = ref([])
  const isSubmitting = ref(false)
  const errors = ref({})

  const beneficiariosDeLey = computed(() =>
    beneficiarios.value.filter(b => b.tipoBeneficiario === 'DE_LEY')
  )

  const beneficiariosAdicional = computed(() =>
    beneficiarios.value.filter(b => b.tipoBeneficiario === 'ADICIONAL')
  )

  const isFormValid = computed(() => {
    return (
      afiliado.tipoDocumento &&
      afiliado.numeroDocumento &&
      afiliado.primerApellido &&
      afiliado.primerNombre &&
      afiliado.fechaNacimiento &&
      afiliado.sexo &&
      afiliado.estadoCivil &&
      afiliado.celular &&
      afiliado.canal &&
      afiliado.producto &&
      afiliado.grupo
    )
  })

  function addBeneficiario(beneficiario) {
    // Verificar documento duplicado
    const exists = beneficiarios.value.some(
      b => b.numeroDocumento === beneficiario.numeroDocumento
    )
    if (exists) {
      const toast = useToastStore()
      toast.error('Este numero de documento ya fue agregado')
      return false
    }
    beneficiarios.value.push({ ...beneficiario })
    return true
  }

  function removeBeneficiario(index) {
    beneficiarios.value.splice(index, 1)
  }

  function resetForm() {
    Object.assign(afiliado, {
      tipoDocumento: '',
      numeroDocumento: '',
      primerApellido: '',
      segundoApellido: '',
      primerNombre: '',
      segundoNombre: '',
      fechaNacimiento: '',
      edad: 0,
      sexo: '',
      estadoCivil: '',
      celular: '',
      email: '',
      direccion: '',
      canal: '',
      producto: '',
      grupo: ''
    })
    beneficiarios.value = []
    errors.value = {}
  }

  async function submitRegistro() {
    const toast = useToastStore()
    isSubmitting.value = true
    errors.value = {}

    try {
      const payload = {
        ...afiliado,
        beneficiarios: beneficiarios.value
      }
      const { data } = await createAfiliado(payload)
      toast.success('Afiliado registrado exitosamente')
      resetForm()
      return data
    } catch (err) {
      if (err.response?.status === 400 && err.response.data?.errors) {
        const serverErrors = {}
        err.response.data.errors.forEach(e => {
          serverErrors[e.field] = e.message
        })
        errors.value = serverErrors
        toast.error('Por favor corrija los errores del formulario')
      } else if (err.response?.status === 409) {
        toast.error('Ya existe un afiliado con ese tipo y numero de documento')
      } else {
        toast.error('Error al registrar. Intente de nuevo.')
      }
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    afiliado,
    beneficiarios,
    isSubmitting,
    errors,
    beneficiariosDeLey,
    beneficiariosAdicional,
    isFormValid,
    addBeneficiario,
    removeBeneficiario,
    resetForm,
    submitRegistro
  }
})
