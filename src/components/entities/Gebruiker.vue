<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const user = ref({});

const entries = computed(() => Object.entries(user.value || {}));

async function fetchJSONfromUser(link) {
  const response = await fetch(link);
  if (!response.ok) {
    throw new Error(`API call for user details failed with status ${response.status}`);
  }
  return response.json();
}

async function load() {
  const link = decodeURIComponent(route.params.url);
  user.value = await fetchJSONfromUser(link);
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
            <template v-if="['reviews', 'positions'].includes(key) && Array.isArray(value)">
              <div v-for="v in value" :key="`${key}-${v}`">
                <RouterLink :to="detailRouteForCollection(key, v)">{{ String(v) }}</RouterLink>
              </div>
            </template>

            <RouterLink v-else-if="key === 'url'" :to="`/users/${encodeURIComponent(value)}`">
              {{ String(value) }}
            </RouterLink>

            <RouterLink v-else-if="key === 'index'" to="/users">
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

