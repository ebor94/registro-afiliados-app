import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  let nextId = 0

  function addToast(message, type = 'info', duration = 4000) {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => removeToast(id), duration)
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const success = (msg) => addToast(msg, 'success')
  const error = (msg) => addToast(msg, 'error', 6000)
  const warning = (msg) => addToast(msg, 'warning')
  const info = (msg) => addToast(msg, 'info')

  return { toasts, success, error, warning, info, removeToast }
})
