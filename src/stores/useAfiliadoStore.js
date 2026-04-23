import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { createAfiliado, createAfiliadoVeolia, reenviarAfiliacionPublico as reenviarApi } from '@/api/afiliadoApi'
import { useToastStore } from './useToastStore'

export const useAfiliadoStore = defineStore('afiliado', () => {
  // Modo del formulario: 'standard' requiere info comercial, 'veolia' no
  const formMode = ref('standard')

  // Aceptación de tratamiento de datos — obligatorio para registrar
  const aceptaTratamiento = ref(false)

  const afiliado = reactive({
    // ── Datos de la solicitud ─────────────────────────────────
    sucursal: '',
    novedad: '',
    vigenciaDesde: '',
    vigenciaHasta: '',

    // ── Identificación ────────────────────────────────────────
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

    // ── Contacto ──────────────────────────────────────────────
    celular: '',
    celular2: '',
    email: '',

    // ── Ubicación ─────────────────────────────────────────────
    departamento: '',
    ciudad: '',
    barrio: '',
    direccion: '',

    // ── Empresa ───────────────────────────────────────────────
    nit: '',
    nombreEmpresa: '',
    empresaId: null,

    // ── Veolia ────────────────────────────────────────────────
    unidadNegocio: '',
    planVeolia: '',

    // ── Información comercial ─────────────────────────────────
    canal: '',
    producto: '',
    grupo: '',
    asistenciaFueraDeCasa: '',

    // ── Actividad económica ───────────────────────────────────
    actividadEconomica: '',
    ocupacion: '',
    codigoCiiu: '',

    // ── Campos CENS ───────────────────────────────────────────
    usuarioCens: '',
    cicloEstrato: '',
    relacionPredio: '',

    // ── Observaciones ─────────────────────────────────────────
    observaciones: '',

    // ── Afiliado diferente al contratante ─────────────────────
    diferenteAlContratante: false
  })

  const beneficiarios      = ref([])
  const beneficiariosFiles = ref([])   // File objects paralelos a beneficiarios[]
  const seguros = ref([])

  // Contrato / valor
  const contrato = reactive({
    tarifaId: null,
    valorPlanExequial: 0,
    valorAdicionales: 0,
    valorAsistencia: 0,
    valorSeguros: 0,
    valorTotal: 0,
    periodicidad: 'MENSUAL',
    nCuotas: 11,
    valorCuota: 0
  })

  // Tarifa activa compartida entre componentes (ValorContrato la asigna, BeneficiarioForm la lee)
  const tarifaActiva = ref(null)

  // ── Datos de la primera cuota / pago inicial ────────────────
  const pago = reactive({
    formaPago:          '',
    soporteFile:        null,   // File object — no se serializa al servidor como JSON
    valorRecibido:      '',
    referenciaPago1:    '',
    referenciaPago2:    '',
    referenciaPago3:    '',
    fechaPagoTentativa: ''
  })

  // ── Cédula del afiliado (frontal + reverso) ─────────────────
  const cedulaFrontal = ref(null)  // File object
  const cedulaReverso = ref(null)  // File object

  // ── Contrato de la competencia (novedad TRASLADO_COMPETENCIA) ─
  const contratoCompetenciaFile = ref(null)

  function setContratoCompetenciaFile(file) {
    contratoCompetenciaFile.value = file
  }

  // ── Modo corrección (editar afiliación rechazada) ───────────
  const modoCorreccion     = ref(false)
  const afiliadoEditandoId = ref(null)

  const isSubmitting = ref(false)
  const errors = ref({})

  // ── Computed ───────────────────────────────────────────────
  const beneficiariosDeLey = computed(() =>
    beneficiarios.value.filter(b => b.tipoBeneficiario === 'DE_LEY')
  )

  const beneficiariosAdicional = computed(() =>
    beneficiarios.value.filter(b => b.tipoBeneficiario === 'ADICIONAL')
  )

  const esCanalCens = computed(() => afiliado.canal === 'CENS')

  const isFormValid = computed(() => {
    const baseValid = Boolean(
      afiliado.tipoDocumento &&
      afiliado.numeroDocumento &&
      afiliado.primerApellido &&
      afiliado.primerNombre &&
      afiliado.fechaNacimiento &&
      afiliado.sexo &&
      afiliado.estadoCivil &&
      afiliado.celular
    )

    if (formMode.value === 'veolia') return baseValid && aceptaTratamiento.value

    const comercialValid = Boolean(afiliado.canal && afiliado.producto && afiliado.grupo)

    const censValid = afiliado.canal === 'CENS'
      ? Boolean(afiliado.usuarioCens && afiliado.cicloEstrato && afiliado.relacionPredio)
      : true

    return baseValid && comercialValid && censValid && aceptaTratamiento.value
  })

  // ── Métodos ────────────────────────────────────────────────
  function setFormMode(mode) {
    formMode.value = mode
  }

  function addBeneficiario(beneficiario) {
    // Extraer el archivo antes de guardar el objeto (no se serializa)
    const { _documentoFile, ...benData } = beneficiario
    const exists = beneficiarios.value.some(
      b => b.numeroDocumento === benData.numeroDocumento
    )
    if (exists) {
      const toast = useToastStore()
      toast.error('Este numero de documento ya fue agregado')
      return false
    }
    beneficiarios.value.push({ ...benData })
    beneficiariosFiles.value.push(_documentoFile || null)
    return true
  }

  function removeBeneficiario(index) {
    beneficiarios.value.splice(index, 1)
    beneficiariosFiles.value.splice(index, 1)
  }

  function updateBeneficiario(index, data) {
    if (index >= 0 && index < beneficiarios.value.length) {
      const { _documentoFile, ...benData } = data
      beneficiarios.value[index] = { ...beneficiarios.value[index], ...benData }
      // Solo actualizar el archivo si se proporcionó uno nuevo
      if (_documentoFile !== undefined) {
        beneficiariosFiles.value[index] = _documentoFile
      }
    }
  }

  function addSeguro(seguro) {
    seguros.value.push({ ...seguro })
  }

  function removeSeguro(index) {
    seguros.value.splice(index, 1)
  }

  function updateContrato(data) {
    Object.assign(contrato, data)
  }

  function setPago(datos) {
    Object.assign(pago, datos)
  }

  // ── Carga de afiliación rechazada para corrección ────────────
  function cargarParaCorregir(afiliadoData) {
    const a = afiliadoData
    Object.assign(afiliado, {
      sucursal:            a.sucursal            || '',
      novedad:             a.novedad             || '',
      vigenciaDesde:       a.vigenciaDesde?.split('T')[0] || '',
      vigenciaHasta:       a.vigenciaHasta?.split('T')[0] || '',
      tipoDocumento:       a.tipoDocumento       || '',
      numeroDocumento:     a.numeroDocumento     || '',
      primerApellido:      a.primerApellido      || '',
      segundoApellido:     a.segundoApellido     || '',
      primerNombre:        a.primerNombre        || '',
      segundoNombre:       a.segundoNombre       || '',
      fechaNacimiento:     a.fechaNacimiento?.split('T')[0] || '',
      edad:                a.edad               ?? 0,
      sexo:                a.sexo               || '',
      estadoCivil:         a.estadoCivil        || '',
      celular:             a.celular            || '',
      celular2:            a.celular2           || '',
      email:               a.email             || '',
      departamento:        a.departamento       || '',
      ciudad:              a.ciudad             || '',
      barrio:              a.barrio             || '',
      direccion:           a.direccion          || '',
      nit:                 a.nit               || '',
      nombreEmpresa:       a.nombreEmpresa      || '',
      empresaId:           a.empresaId          || null,
      unidadNegocio:       a.unidadNegocio      || '',
      planVeolia:          a.planVeolia         || '',
      canal:               a.canal             || '',
      producto:            a.producto          || '',
      grupo:               a.grupo             || '',
      asistenciaFueraDeCasa: a.asistenciaFueraDeCasa || '',
      actividadEconomica:  a.actividadEconomica || '',
      ocupacion:           a.ocupacion          || '',
      codigoCiiu:          a.codigoCiiu         || '',
      usuarioCens:         a.usuarioCens        || '',
      cicloEstrato:        a.cicloEstrato       || '',
      relacionPredio:      a.relacionPredio     || '',
      observaciones:       a.observaciones      || '',
      diferenteAlContratante: Boolean(a.diferenteAlContratante)
    })

    beneficiarios.value      = (a.beneficiarios || []).map(b => ({ ...b }))
    beneficiariosFiles.value = (a.beneficiarios || []).map(() => null)  // sin archivos al cargar
    seguros.value            = (a.seguros       || []).map(s => ({ ...s }))

    if (a.contrato) {
      Object.assign(contrato, {
        tarifaId:          a.contrato.tarifaId        || null,
        valorPlanExequial: a.contrato.valorPlanExequial || 0,
        valorAdicionales:  a.contrato.valorAdicionales  || 0,
        valorAsistencia:   a.contrato.valorAsistencia   || 0,
        valorSeguros:      a.contrato.valorSeguros       || 0,
        valorTotal:        a.contrato.valorTotal         || 0,
        periodicidad:      a.contrato.periodicidad       || 'MENSUAL',
        nCuotas:           a.contrato.nCuotas            || 11,
        valorCuota:        a.contrato.valorCuota         || 0
      })
    }

    // El afiliado ya aceptó el tratamiento al registrarse; en modo corrección
    // no se vuelve a mostrar el checkbox, así que se fuerza true para que
    // isFormValid no quede bloqueado.
    aceptaTratamiento.value = true

    // Determinar el modo de formulario según el origen del afiliado
    formMode.value = a.origen === 'VEOLIA' ? 'veolia' : 'standard'

    modoCorreccion.value     = true
    afiliadoEditandoId.value = a.id
  }

  async function submitCorreccion(otp = '') {
    const toast = useToastStore()
    isSubmitting.value = true
    errors.value = {}

    try {
      const payload = {
        ...afiliado,
        diferenteAlContratante: afiliado.diferenteAlContratante ? 1 : 0,
        beneficiarios: beneficiarios.value,
        seguros:       seguros.value,
        contrato:      { ...contrato },
        otp
      }

      let response
      const hayDocsBenef = beneficiariosFiles.value.some(f => f != null)
      if (hayDocsBenef) {
        const fd = new FormData()
        fd.append('data', JSON.stringify(payload))
        beneficiariosFiles.value.forEach((file, i) => {
          if (file) fd.append(`beneficiario_doc_${i}`, file)
        })
        response = await reenviarApi(afiliadoEditandoId.value, fd)
      } else {
        response = await reenviarApi(afiliadoEditandoId.value, payload)
      }
      const { data } = response
      toast.success('Afiliación corregida y reenviada para aprobación')
      resetForm()
      return data
    } catch (err) {
      if (err.response?.status === 400 && err.response.data?.errors) {
        const serverErrors = {}
        err.response.data.errors.forEach(e => { serverErrors[e.field] = e.message })
        errors.value = serverErrors
        toast.error('Por favor corrija los errores del formulario')
      } else {
        toast.error('Error al reenviar la afiliación. Intente de nuevo.')
      }
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  function resetForm() {
    Object.assign(afiliado, {
      sucursal: '',
      novedad: '',
      vigenciaDesde: '',
      vigenciaHasta: '',
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
      celular2: '',
      email: '',
      departamento: '',
      ciudad: '',
      barrio: '',
      direccion: '',
      nit: '',
      nombreEmpresa: '',
      empresaId: null,
      unidadNegocio: '',
      planVeolia: '',
      canal: '',
      producto: '',
      grupo: '',
      asistenciaFueraDeCasa: '',
      actividadEconomica: '',
      ocupacion: '',
      codigoCiiu: '',
      usuarioCens: '',
      cicloEstrato: '',
      relacionPredio: '',
      observaciones: '',
      diferenteAlContratante: false
    })
    beneficiarios.value      = []
    beneficiariosFiles.value = []
    seguros.value = []
    tarifaActiva.value = null
    cedulaFrontal.value = null
    cedulaReverso.value = null
    Object.assign(contrato, {
      tarifaId: null,
      valorPlanExequial: 0,
      valorAdicionales: 0,
      valorAsistencia: 0,
      valorSeguros: 0,
      valorTotal: 0,
      periodicidad: 'MENSUAL',
      nCuotas: 11,
      valorCuota: 0
    })
    contratoCompetenciaFile.value = null
    Object.assign(pago, {
      formaPago:          '',
      soporteFile:        null,
      valorRecibido:      '',
      referenciaPago1:    '',
      referenciaPago2:    '',
      referenciaPago3:    '',
      fechaPagoTentativa: ''
    })
    modoCorreccion.value     = false
    afiliadoEditandoId.value = null
    errors.value = {}
    aceptaTratamiento.value  = false
  }

  async function submitRegistro() {
    const toast = useToastStore()
    isSubmitting.value = true
    errors.value = {}

    try {
      const payload = {
        ...afiliado,
        diferenteAlContratante: afiliado.diferenteAlContratante ? 1 : 0,
        beneficiarios: beneficiarios.value,
        seguros: seguros.value,
        contrato: { ...contrato },
        formaPago:          pago.formaPago,
        valorRecibido:      pago.valorRecibido !== '' ? parseFloat(pago.valorRecibido) : null,
        referenciaPago1:    pago.referenciaPago1,
        referenciaPago2:    pago.referenciaPago2,
        referenciaPago3:    pago.referenciaPago3,
        fechaPagoTentativa: pago.fechaPagoTentativa || null
      }

      const apiFn = formMode.value === 'veolia' ? createAfiliadoVeolia : createAfiliado

      let response
      const hayDocsBenef = beneficiariosFiles.value.some(f => f != null)
      const hayContratoComp = !!contratoCompetenciaFile.value
      if (pago.soporteFile || cedulaFrontal.value || cedulaReverso.value || hayDocsBenef || hayContratoComp) {
        const fd = new FormData()
        fd.append('data', JSON.stringify(payload))
        if (pago.soporteFile)              fd.append('soporte',              pago.soporteFile)
        if (cedulaFrontal.value)           fd.append('cedulaFrontal',        cedulaFrontal.value)
        if (cedulaReverso.value)           fd.append('cedulaReverso',        cedulaReverso.value)
        if (contratoCompetenciaFile.value) fd.append('contratoCompetencia',  contratoCompetenciaFile.value)
        // Documentos adjuntos por beneficiario (opcionales)
        beneficiariosFiles.value.forEach((file, i) => {
          if (file) fd.append(`beneficiario_doc_${i}`, file)
        })
        response = await apiFn(fd)
      } else {
        response = await apiFn(payload)
      }

      const { data } = response
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
    formMode,
    aceptaTratamiento,
    beneficiarios,
    beneficiariosFiles,
    seguros,
    contrato,
    pago,
    cedulaFrontal,
    cedulaReverso,
    contratoCompetenciaFile,
    setContratoCompetenciaFile,
    tarifaActiva,
    modoCorreccion,
    afiliadoEditandoId,
    isSubmitting,
    errors,
    beneficiariosDeLey,
    beneficiariosAdicional,
    esCanalCens,
    isFormValid,
    setFormMode,
    addBeneficiario,
    removeBeneficiario,
    updateBeneficiario,
    addSeguro,
    removeSeguro,
    updateContrato,
    setPago,
    cargarParaCorregir,
    submitCorreccion,
    resetForm,
    submitRegistro
  }
})
