import axios from 'axios'

// Cliente axios para endpoints públicos (sin autenticación).
// No adjunta token ni redirige al login en caso de error.
const publicApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
})

export default publicApiClient
