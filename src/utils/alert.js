import Swal from 'sweetalert2'

const glassAlert = Swal.mixin({
  customClass: {
    popup: 'glass-swal-popup',
    title: 'glass-swal-title font-display',
    htmlContainer: 'glass-swal-html',
    confirmButton: 'btn-primary bg-serenity-500 hover:bg-serenity-600 shadow-serenity-500/30 font-semibold px-5 py-2.5 rounded-xl ml-2',
    cancelButton: 'btn-ghost border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold px-5 py-2.5 rounded-xl mr-2',
    actions: 'glass-swal-actions'
  },
  buttonsStyling: false
})

export const showAlert = (title, text = '', icon = 'info') => {
  return glassAlert.fire({
    title,
    text,
    icon
  })
}

export const showConfirm = async (title, text = '', confirmText = 'Ya, Lanjutkan') => {
  const result = await glassAlert.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal',
    reverseButtons: true
  })
  return result.isConfirmed
}
