import apiClient from './axios'

export const createAfiliado = (payload) => apiClient.post('/afiliados', payload)
export const getAfiliados = () => apiClient.get('/afiliados')
export const getAfiliado = (id) => apiClient.get(`/afiliados/${id}`)
