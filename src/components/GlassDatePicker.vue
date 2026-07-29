<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

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

const isOpen = ref(false)
const showMonthYearSelect = ref(false)
const containerRef = ref(null)

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const currentDate = new Date()
const currentMonth = ref(currentDate.getMonth())
const currentYear = ref(currentDate.getFullYear())

// Sync internal state with v-model
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const d = new Date(newVal)
    if (!isNaN(d.getTime())) {
      currentMonth.value = d.getMonth()
      currentYear.value = d.getFullYear()
    }
  }
}, { immediate: true })

const formattedDate = computed(() => {
  if (!props.modelValue) return ''
  const d = new Date(props.modelValue)
  if (isNaN(d.getTime())) return ''
  
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
})

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const blankDays = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

const monthName = computed(() => months[currentMonth.value])

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const selectMonth = (index) => {
  currentMonth.value = index
  showMonthYearSelect.value = false
}

const selectDate = (day) => {
  const d = new Date(currentYear.value, currentMonth.value, day)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  emit('update:modelValue', `${yyyy}-${mm}-${dd}`)
  isOpen.value = false
}

const clearDate = () => {
  emit('update:modelValue', null)
  isOpen.value = false
}

const isToday = (day) => {
  const d = new Date()
  return day === d.getDate() && currentMonth.value === d.getMonth() && currentYear.value === d.getFullYear()
}

const isSelected = (day) => {
  if (!props.modelValue) return false
  const d = new Date(props.modelValue)
  return day === d.getDate() && currentMonth.value === d.getMonth() && currentYear.value === d.getFullYear()
}

// Close on outside click
const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false
    showMonthYearSelect.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div class="relative w-full" ref="containerRef">
    <!-- Input Field -->
    <div class="relative w-full">
      <div 
        @click="isOpen = !isOpen"
        class="flex items-center input-field cursor-pointer bg-white/70 backdrop-blur-md w-full"
        :class="{'ring-2 ring-serenity-300 bg-white': isOpen}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-slate-400 mr-2 flex-shrink-0">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        <span v-if="formattedDate" class="text-slate-700 flex-1 text-left">{{ formattedDate }}</span>
        <span v-else class="text-slate-400 flex-1 text-left">{{ placeholder }}</span>
      </div>
      
      <!-- Clear button -->
      <button 
        v-if="props.modelValue"
        @click.stop="clearDate"
        type="button"
        title="Hapus Tanggal"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Calendar Popover -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div v-if="isOpen" class="absolute z-50 mt-2 p-4 bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-2xl w-72 left-0">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <button @click="prevMonth" type="button" class="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button @click="showMonthYearSelect = !showMonthYearSelect" type="button" class="font-bold text-slate-700 text-sm hover:text-serenity-600 transition-colors px-3 py-1 rounded-lg hover:bg-slate-100">
            {{ monthName }} {{ currentYear }}
          </button>
          <button @click="nextMonth" type="button" class="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        <!-- Month/Year Quick Select -->
        <div v-if="showMonthYearSelect" class="py-2">
          <div class="flex items-center justify-between mb-4 px-2">
            <button @click="currentYear--" type="button" class="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <input type="number" v-model="currentYear" class="w-20 text-center font-bold text-slate-700 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-serenity-300 py-1" />
            <button @click="currentYear++" type="button" class="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button 
              v-for="(m, index) in months" 
              :key="m" 
              @click="selectMonth(index)"
              type="button"
              class="p-2 text-xs font-semibold rounded-xl transition-all duration-200"
              :class="currentMonth === index ? 'bg-serenity-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'"
            >
              {{ m.substring(0, 3) }}
            </button>
          </div>
        </div>

        <template v-else>
          <!-- Days of Week -->
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div v-for="day in days" :key="day" class="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {{ day }}
            </div>
          </div>

          <!-- Dates Grid -->
          <div class="grid grid-cols-7 gap-1">
            <div v-for="blank in blankDays" :key="'blank-' + blank" class="p-2 text-center text-sm"></div>
            <button 
              v-for="day in daysInMonth" 
              :key="day"
              type="button"
              @click="selectDate(day)"
              class="p-2 w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm transition-all duration-200 focus:outline-none"
              :class="[
                isSelected(day) 
                  ? 'bg-serenity-500 text-white shadow-md font-bold' 
                  : isToday(day)
                    ? 'bg-serenity-100 text-serenity-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
              ]"
            >
              {{ day }}
            </button>
          </div>
        </template>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Any additional specific styles if needed, though Tailwind covers everything */
</style>
