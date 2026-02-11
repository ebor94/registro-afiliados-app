import { createRouter, createWebHistory } from 'vue-router'
import RegistroView from '@/views/RegistroView.vue'

const routes = [
  {
    path: '/',
    name: 'registro',
    component: RegistroView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
