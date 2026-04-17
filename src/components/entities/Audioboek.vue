<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const audiobook = ref({});

const entries = computed(() => Object.entries(audiobook.value || {}));

async function fetchJSONfromAudiobook(link) {
  const response = await fetch(link);
  if (!response.ok) {
    throw new Error(`API call for audiobook details failed with status ${response.status}`);
  }
  return response.json();
}

async function load() {
  const link = decodeURIComponent(route.params.url);
  audiobook.value = await fetchJSONfromAudiobook(link);
}

function detailRouteForCollection(collection, value) {
  return `/${collection}/${encodeURIComponent(value)}`;
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
            <template v-if="['genres', 'reviews', 'positions'].includes(key) && Array.isArray(value)">
              <div v-for="v in value" :key="`${key}-${v}`">
                <RouterLink :to="detailRouteForCollection(key, v)">{{ String(v) }}</RouterLink>
              </div>
            </template>

            <RouterLink v-else-if="key === 'url'" :to="`/audiobooks/${encodeURIComponent(value)}`">
              {{ String(value) }}
            </RouterLink>

            <RouterLink v-else-if="key === 'index'" to="/audiobooks">
              {{ String(value) }}
            </RouterLink>

            <template v-else-if="key === 'authors' && Array.isArray(value)">
              <div v-for="v in value" :key="`${key}-${v}`">{{ String(v) }}</div>
            </template>

            <a v-else-if="key === 'link'" :href="String(value)" target="_blank" rel="noreferrer">
              {{ String(value) }}
            </a>

            <template v-else>
              {{ String(value) }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

