import apiClient from './axios'
import publicApiClient from './publicAxios'

// ── Afiliados ─────────────────────────────────────────────────
export const createAfiliadoVeolia = (payload) => {
  if (payload instanceof FormData) {
    return publicApiClient.post('/afiliados/veolia', payload, {
      headers: { 'Content-Type': undefined }
    })
  }
  return publicApiClient.post('/afiliados/veolia', payload)
}

export const createAfiliado = (payload) => {
  // Si el payload es FormData (viene con archivo adjunto), dejar que el
  // navegador establezca automáticamente el Content-Type multipart/form-data
  // (con el boundary correcto) eliminando el header JSON por defecto.
  if (payload instanceof FormData) {
    return apiClient.post('/afiliados', payload, {
      headers: { 'Content-Type': undefined }
    })
  }
  return apiClient.post('/afiliados', payload)
}
export const getAfiliados = () => apiClient.get('/afiliados')
export const getAfiliado = (id) => apiClient.get(`/afiliados/${id}`)
export const getAfiliadosPendientes    = ()             => apiClient.get('/afiliados/pendientes')
export const getAfiliacionesRechazadas = ()             => apiClient.get('/afiliados/rechazados')
export const aprobarAfiliado           = (id)           => apiClient.post(`/afiliados/${id}/aprobar`)
export const rechazarAfiliado          = (id, motivo)   => apiClient.post(`/afiliados/${id}/rechazar`, { motivo })
export const reenviarAfiliacion              = (id, payload)  => apiClient.put(`/afiliados/${id}/reenviar`, payload)
export const rechazarBeneficiariosAfiliado   = (id, payload)  => apiClient.post(`/afiliados/${id}/rechazar-parcial`, payload)
export const consultarAfiliado               = (numerodocumento) => publicApiClient.get(`/afiliados/consulta/${numerodocumento}`)
export const actualizarBeneficiariosConsulta = (id, beneficiarios) => publicApiClient.put(`/afiliados/${id}/actualizar-beneficiarios`, { beneficiarios })

// ── OTP Consulta pública ──────────────────────────────────────
export const solicitarOtpPublico       = (doc)       => publicApiClient.post('/afiliados/consulta/solicitar-otp', { numeroDocumento: doc })
export const verificarOtpPublico       = (doc, otp)  => publicApiClient.post('/afiliados/consulta/verificar-otp', { numeroDocumento: doc, otp })
export const actualizarContactoPublico = (id, datos) => publicApiClient.put(`/afiliados/${id}/datos-contacto`, datos)

// ── OTP Reenvío ───────────────────────────────────────────────
export const solicitarOtpReenvio = (id) => publicApiClient.post(`/afiliados/${id}/solicitar-otp-reenvio`)

// ── Corrección pública via hash ───────────────────────────────
export const getAfiliadoPorHash = (hash) => publicApiClient.get(`/afiliados/por-hash/${hash}`)
export const reenviarAfiliacionPublico = (id, payload) => {
  if (payload instanceof FormData) {
    return publicApiClient.put(`/afiliados/${id}/reenviar`, payload, {
      headers: { 'Content-Type': undefined }
    })
  }
  return publicApiClient.put(`/afiliados/${id}/reenviar`, payload)
}

// ── Trazabilidad ──────────────────────────────────────────────
export const getTrazabilidadAfiliado = (id) => apiClient.get(`/afiliados/${id}/trazabilidad`)

// ── Veolia — unidades de negocio ─────────────────────────────
export const getVeoliaUnidades = () => publicApiClient.get('/afiliados/veolia-unidades')

// ── Empresas ──────────────────────────────────────────────────
export const buscarEmpresaPorNit = (nit) => apiClient.get(`/empresas/${nit}`)
export const crearEmpresa = (payload) => apiClient.post('/empresas', payload)
export const listarEmpresas = (q = '') => apiClient.get('/empresas', { params: { q } })

// ── Tarifas ───────────────────────────────────────────────────
export const listarTarifas = () => apiClient.get('/tarifas')
export const buscarTarifa = (params) => apiClient.get('/tarifas/buscar', { params })
export const listarPrimasSeguro = (seguro) =>
  apiClient.get('/tarifas/primas', { params: seguro ? { seguro } : {} })
