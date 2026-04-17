<script setup>
import { onMounted, ref } from "vue";
import fetchIndex from "../../data/index.js";

const home = ref({});

onMounted(async () => {
  home.value = await fetchIndex();
});
</script>

<template>
  <div class="resource-list">
    <div v-for="key in Object.keys(home)" :key="key" class="resource-card">
      <span class="resource-label">{{ key }}: </span>
      <RouterLink class="resource-link" :to="`/${key}`">
        {{ home[key] }}
      </RouterLink>
    </div>
  </div>
</template>

