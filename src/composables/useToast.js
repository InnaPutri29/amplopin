import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

export function useToast() {
  return { toasts }
}

export function addToast(message, type = 'success', duration = 3000) {
  const id = nextId++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    removeToast(id)
  }, duration)
}

export function removeToast(id) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}
