<template>
  <div class="resource-list">
    <div v-for="key in Object.keys(indexData)" :key="key" class="resource-card">
      <span class="resource-label">{{ key }}: </span>
      <router-link class="resource-link" :to="`/${key}`">
        {{ indexData[key] }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import fetchIndex from '../../data/index.jsx'

const indexData = ref({})

onMounted(async () => {
  try {
    indexData.value = await fetchIndex()
  } catch (error) {
    console.error(error)
  }
})
</script>
