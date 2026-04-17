<template>
  <div class="entity-table-wrapper">
    <table class="entity-table">
      <tbody>
        <tr v-for="[key, value] in Object.entries(review)" :key="key">
          <th>{{ key }}</th>
          <td>
            <!-- user -->
            <ResourceReferenceLink
              v-if="key === 'user'"
              resourceType="users"
              :resourceUrl="value"
              :fallbackLabel="String(value)"
            />
            <!-- audiobook -->
            <ResourceReferenceLink
              v-else-if="key === 'audiobook'"
              resourceType="audiobooks"
              :resourceUrl="value"
              :fallbackLabel="String(value)"
            />
            <!-- url -->
            <router-link
              v-else-if="key === 'url'"
              :to="'/reviews/' + encodeURIComponent(value)"
            >
              {{ String(value) }}
            </router-link>
            <!-- index -->
            <router-link v-else-if="key === 'index'" to="/reviews">
              {{ String(value) }}
            </router-link>
            <!-- default -->
            <span v-else>{{ String(value) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ResourceReferenceLink from './ResourceReferenceLink.vue'

const route = useRoute()
const review = ref({})

onMounted(async () => {
  const url = route.params.url
  const link = decodeURIComponent(url)
  review.value = await fetchJSONfromReview(link)
})

async function fetchJSONfromReview(link) {
  const response = await fetch(link)
  if (!response.ok) {
    throw new Error('API call for review details failed with status ' + response.status)
  }
  return await response.json()
}
</script>
