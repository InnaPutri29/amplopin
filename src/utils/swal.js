import Swal from 'sweetalert2'

const customSwal = Swal.mixin({
  customClass: {
    confirmButton: 'bg-serenity-500 hover:bg-serenity-600 text-white font-semibold py-2 px-6 rounded-xl mx-2 shadow-sm transition-colors',
    cancelButton: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-2 px-6 rounded-xl mx-2 shadow-sm transition-colors',
    popup: 'rounded-2xl shadow-xl border border-slate-100',
    title: 'text-xl font-bold text-slate-800 font-display',
    htmlContainer: 'text-slate-500 text-sm'
  },
  buttonsStyling: false
})

export const confirmDialog = async (title, text, confirmText = 'Ya, Hapus', cancelText = 'Batal', icon = 'warning') => {
  const result = await customSwal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true
  })
  return result.isConfirmed
}

export const showSuccess = (title, text = '') => {
  return customSwal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'Tutup'
  })
}

export const showError = (title, text = '') => {
  return customSwal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'Tutup'
  })
}

export const showInfo = (title, text = '') => {
  return customSwal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonText: 'Tutup'
  })
}

import { addToast } from '../composables/useToast'
export const showToast = (title, icon = 'success') => {
  addToast(title, icon)
}

export default customSwal
