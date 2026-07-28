<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    default: () => [] // Array of { label: '...', value: '...' }
  },
  placeholder: {
    type: String,
    default: 'Pilih salah satu...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  customClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const dropdownRef = ref(null)

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => String(opt.value) === String(props.modelValue))
  return selected ? selected.label : props.placeholder
})

function selectOption(option) {
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
}

function closeDropdown(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', closeDropdown))
onUnmounted(() => document.removeEventListener('click', closeDropdown))
</script>

<template>
  <div class="relative" ref="dropdownRef" :class="customClass">
    <button 
      type="button" 
      @click="!disabled && (isOpen = !isOpen)" 
      class="input-field w-full flex justify-between items-center text-left transition-all duration-300"
      :class="[{'opacity-50 cursor-not-allowed': disabled, 'ring-2 ring-indigo-300 bg-white': isOpen}, customClass]"
    >
      <span class="truncate pr-4" :class="!modelValue ? 'text-slate-400' : 'text-slate-800'">
        {{ selectedLabel }}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0" :class="{'rotate-180': isOpen}">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>

    <transition 
      enter-active-class="transition duration-200 ease-out" 
      enter-from-class="transform scale-95 opacity-0 -translate-y-2" 
      enter-to-class="transform scale-100 opacity-100 translate-y-0" 
      leave-active-class="transition duration-150 ease-in" 
      leave-from-class="transform scale-100 opacity-100 translate-y-0" 
      leave-to-class="transform scale-95 opacity-0 -translate-y-2"
    >
      <div v-if="isOpen" class="absolute z-[100] w-full mt-2 bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xl overflow-hidden py-1">
        <div class="max-h-60 overflow-y-auto p-1 space-y-0.5">
          <div 
            v-for="option in options" 
            :key="option.value" 
            @click="selectOption(option)" 
            class="px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200"
            :class="String(option.value) === String(modelValue) ? 'bg-serenity-100/60 text-serenity-800 font-bold shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'"
          >
            {{ option.label }}
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
