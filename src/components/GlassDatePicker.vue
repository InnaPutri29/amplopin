<script setup>
import { ref, computed } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const props = defineProps({
  modelValue: {
    type: [Date, String],
    default: null
  },
  placeholder: {
    type: String,
    default: 'Pilih Tanggal'
  }
})

const emit = defineEmits(['update:modelValue'])

const dateValue = computed({
  get: () => {
    if (!props.modelValue) return null
    const d = new Date(props.modelValue)
    if (isNaN(d.getTime())) return null
    return d
  },
  set: (val) => {
    if (!val) {
      emit('update:modelValue', '')
      return
    }
    // Return YYYY-MM-DD for database consistency
    const d = new Date(val)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    emit('update:modelValue', `${year}-${month}-${day}`)
  }
})

const format = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}
</script>

<template>
  <div class="glass-datepicker-wrapper w-full">
    <VueDatePicker 
      v-model="dateValue" 
      :format="format"
      locale="id-ID"
      :enable-time-picker="false"
      auto-apply
      :clearable="true"
      :placeholder="placeholder"
      class="glass-datepicker"
      menu-class-name="glass-datepicker-menu"
      :teleport="true"
    >
      <template #input-icon>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 ml-4 text-slate-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      </template>
    </VueDatePicker>
  </div>
</template>

<style>
.glass-datepicker {
  --dp-background-color: transparent;
  --dp-text-color: #1e293b;
  --dp-hover-color: rgba(134, 158, 201, 0.15);
  --dp-hover-text-color: #1e293b;
  --dp-hover-icon-color: #1e293b;
  --dp-primary-color: #869ec9;
  --dp-primary-text-color: #ffffff;
  --dp-secondary-color: #cbd5e1;
  --dp-border-color: transparent;
  --dp-menu-border-color: rgba(255, 255, 255, 0.8);
  --dp-border-color-hover: transparent;
  --dp-disabled-color: #f1f5f9;
  --dp-scroll-bar-background: transparent;
  --dp-scroll-bar-color: rgba(134, 158, 201, 0.35);
  --dp-success-color: #10b981;
  --dp-success-color-disabled: #6ee7b7;
  --dp-icon-color: #94a3b8;
  --dp-danger-color: #ef4444;
}

.glass-datepicker .dp__input {
  border: none;
  background-color: #f1f5f9;
  border-radius: 1rem;
  padding: 0.875rem 1.25rem 0.875rem 3rem;
  font-family: inherit;
  color: #1e293b;
  transition: all 0.3s;
  font-size: 0.875rem;
}

.glass-datepicker .dp__input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #a5b4fc;
  background-color: #ffffff;
}

/* Teleported menu styles */
.glass-datepicker-menu.dp__menu {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border: 1px solid rgba(255, 255, 255, 0.8) !important;
  border-radius: 1.25rem !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  padding: 0.5rem;
  overflow: hidden;
  z-index: 99999 !important;
}

.glass-datepicker-menu .dp__arrow_top {
  display: none;
}

.glass-datepicker-menu .dp__inner_nav {
  border-radius: 0.75rem;
}

.glass-datepicker-menu .dp__inner_nav:hover {
  background: rgba(134, 158, 201, 0.2);
}

.glass-datepicker-menu .dp__calendar_header_item {
  font-weight: 600;
  color: #64748b;
  text-transform: capitalize;
}

.glass-datepicker-menu .dp__cell_inner {
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.glass-datepicker-menu .dp__today {
  border: 1px solid #869ec9;
}
</style>
