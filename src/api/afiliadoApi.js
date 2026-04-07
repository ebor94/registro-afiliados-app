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
export const reenviarAfiliacion        = (id, payload)  => apiClient.put(`/afiliados/${id}/reenviar`, payload)

// ── Empresas ──────────────────────────────────────────────────
export const buscarEmpresaPorNit = (nit) => apiClient.get(`/empresas/${nit}`)
export const crearEmpresa = (payload) => apiClient.post('/empresas', payload)
export const listarEmpresas = (q = '') => apiClient.get('/empresas', { params: { q } })

// ── Tarifas ───────────────────────────────────────────────────
export const listarTarifas = () => apiClient.get('/tarifas')
export const buscarTarifa = (params) => apiClient.get('/tarifas/buscar', { params })
export const listarPrimasSeguro = (seguro) =>
  apiClient.get('/tarifas/primas', { params: seguro ? { seguro } : {} })
