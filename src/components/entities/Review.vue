<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const review = ref({});

const entries = computed(() => Object.entries(review.value || {}));

async function fetchJSONfromReview(link) {
  const response = await fetch(link);
  if (!response.ok) {
    throw new Error(`API call for review details failed with status ${response.status}`);
  }
  return response.json();
}

async function load() {
  const link = decodeURIComponent(route.params.url);
  review.value = await fetchJSONfromReview(link);
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
            <RouterLink
              v-if="['user', 'audiobook'].includes(key)"
              :to="`/${key}s/${encodeURIComponent(value)}`"
            >
              {{ String(value) }}
            </RouterLink>

            <RouterLink v-else-if="key === 'url'" :to="`/reviews/${encodeURIComponent(value)}`">
              {{ String(value) }}
            </RouterLink>

            <RouterLink v-else-if="key === 'index'" to="/reviews">
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

