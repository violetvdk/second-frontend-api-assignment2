<template>
  <div class="entity-table-wrapper">
    <table class="entity-table">
      <tbody>
        <tr v-for="[key, value] in Object.entries(genre)" :key="key">
          <th>{{ key }}</th>
          <td>
            <!-- audiobooks -->
            <div v-if="key === 'audiobooks'">
              <div v-for="audiobookUrl in value" :key="'audiobooks-' + audiobookUrl">
                <ResourceReferenceLink
                  resourceType="audiobooks"
                  :resourceUrl="audiobookUrl"
                  :fallbackLabel="String(audiobookUrl)"
                />
              </div>
            </div>
            <!-- url -->
            <router-link
              v-else-if="key === 'url'"
              :to="{ path: buildResourcePath('genres', genre, getGenreName), state: { resourceUrl: value } }"
            >
              {{ String(value) }}
            </router-link>
            <!-- index -->
            <router-link v-else-if="key === 'index'" to="/genres">
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
import { useRoute, useRouter } from 'vue-router'
import ResourceReferenceLink from './ResourceReferenceLink.vue'
import {
  buildResourcePath,
  decodeResourceParam,
  findResourceBySlug,
  getGenreName,
  isEncodedApiUrl,
} from '../../utils/resourceRouting.js'

const route = useRoute()
const router = useRouter()
const genre = ref({})

onMounted(async () => {
  const slug = route.params.slug
  const stateUrl = route.query.resourceUrl || router.currentRoute.value.state?.resourceUrl

  if (stateUrl) {
    genre.value = await fetchJSONfromGenre(stateUrl)
    return
  }

  if (isEncodedApiUrl(slug)) {
    const link = decodeResourceParam(slug)
    genre.value = await fetchJSONfromGenre(link)
    return
  }

  genre.value = await findResourceBySlug('genres', slug, getGenreName)
})

async function fetchJSONfromGenre(link) {
  const response = await fetch(link)
  if (!response.ok) {
    throw new Error('API call for genre details failed with status ' + response.status)
  }
  return await response.json()
}
</script>
