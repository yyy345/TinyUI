<template>
  <div>
    <DatePicker v-model="selectedDate" placeholder="Select date"></DatePicker>
    <p>Selected Date: {{ selectedDate }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DatePicker from '@/components/DatePicker/DatePicker.vue'

defineOptions({
  name: 'DatePickerView'
})

const selectedDate = ref('')
</script>
