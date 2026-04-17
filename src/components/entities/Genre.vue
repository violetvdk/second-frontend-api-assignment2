<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const genre = ref({});

const entries = computed(() => Object.entries(genre.value || {}));

async function fetchJSONfromGenre(link) {
  const response = await fetch(link);
  if (!response.ok) {
    throw new Error(`API call for genre details failed with status ${response.status}`);
  }
  return response.json();
}

async function load() {
  const link = decodeURIComponent(route.params.url);
  genre.value = await fetchJSONfromGenre(link);
}

watch(() => route.params.url, load, { immediate: true });
onMounted(load);
</script>

<template>
  <div class="entity-table-wrapper">
    <table class="entity-table">
      <tbody>
        <tr v-for="[key, value] in entries" :key="key">
          <th>{{ key }}</th>
          <td>
            <template v-if="key === 'audiobooks' && Array.isArray(value)">
              <div v-for="v in value" :key="`${key}-${v}`">
                <RouterLink :to="`/audiobooks/${encodeURIComponent(v)}`">{{ String(v) }}</RouterLink>
              </div>
            </template>

            <RouterLink v-else-if="key === 'url'" :to="`/genres/${encodeURIComponent(value)}`">
              {{ String(value) }}
            </RouterLink>

            <RouterLink v-else-if="key === 'index'" to="/genres">
              {{ String(value) }}
            </RouterLink>

            <template v-else>
              {{ String(value) }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

