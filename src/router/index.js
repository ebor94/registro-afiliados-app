import { createRouter, createWebHistory } from 'vue-router'
import RegistroView        from '@/views/RegistroView.vue'
import RegistroVeoliaView  from '../views/RegistroVeoliaView.vue'
import AprobacionesView    from '../views/AprobacionesView.vue'
import MisAfiliacionesView from '../views/MisAfiliacionesView.vue'
import CorregirView        from '../views/CorregirView.vue'
import LoginView           from '../views/LoginView.vue'

const routes = [
  // ── Rutas públicas ──────────────────────────────────────────────────────
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { publica: true }
  },
  // Registro Veolia es de acceso público (sin token)
  {
    path: '/veolia',
    name: 'registroVeolia',
    component: RegistroVeoliaView,
    meta: { publica: true }
  },

  // ── Rutas protegidas (requieren autenticación) ───────────────────────────
  // Registro de afiliados — solo ASESOR_AFILIACIONES y ADMIN
  {
    path: '/',
    name: 'registro',
    component: RegistroView,
    meta: { requiereAuth: true }
  },
  // Panel de aprobaciones — solo APROBADOR_AFILIACIONES y ADMIN
  {
    path: '/aprobaciones',
    name: 'aprobaciones',
    component: AprobacionesView,
    meta: { requiereAuth: true }
  },
  // Vista del asesor: sus afiliaciones pendientes y rechazadas
  {
    path: '/mis-afiliaciones',
    name: 'misAfiliaciones',
    component: MisAfiliacionesView,
    meta: { requiereAuth: true }
  },
  // Corrección de afiliación rechazada — solo el asesor dueño o admin
  {
    path: '/corregir/:id',
    name: 'corregirAfiliacion',
    component: CorregirView,
    meta: { requiereAuth: true }
  },
  // Consulta pública de afiliado por número de documento
  {
    path: '/afiliaciones/:numerodocumento',
    name: 'consultaAfiliado',
    component: () => import('@/views/ConsultaAfiliadoView.vue'),
    meta: { publica: true }
  }
]

const router = createRouter({
  history: createWebHistory('/afiliados/'),
  routes
})

// ── Navigation guard ─────────────────────────────────────────────────────
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('auth_token')
  const estaAutenticado = !!token

  if (to.meta.requiereAuth && !estaAutenticado) {
    // Ruta protegida sin sesión → redirigir al login
    next({ name: 'login' })
  } else if (to.name === 'login' && estaAutenticado) {
    // Ya autenticado intentando acceder al login → ir a inicio
    next({ name: 'registro' })
  } else {
    next()
  }
})

export default router
