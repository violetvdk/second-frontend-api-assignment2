<template>
  <div class="entity-table-wrapper">
    <table class="entity-table">
      <tbody>
        <tr v-for="[key, value] in Object.entries(audiobook)" :key="key">
          <th>{{ key }}</th>
          <td>
            <!-- genres -->
            <div v-if="key === 'genres'">
              <ResourceReferenceLink
                v-for="genreUrl in value"
                :key="'genres-' + genreUrl"
                resourceType="genres"
                :resourceUrl="genreUrl"
                :fallbackLabel="String(genreUrl)"
              />
            </div>
            <!-- reviews and positions -->
            <div v-else-if="['reviews', 'positions'].includes(key)">
              <router-link
                v-for="v in value"
                :key="key + '-' + v"
                :to="'/' + key + '/' + encodeURIComponent(v)"
              >
                {{ String(v) }}
              </router-link>
            </div>
            <!-- url -->
            <router-link
              v-else-if="key === 'url'"
              :to="{ path: buildResourcePath('audiobooks', audiobook, getAudiobookName), state: { resourceUrl: value } }"
            >
              {{ String(value) }}
            </router-link>
            <!-- index -->
            <router-link v-else-if="key === 'index'" to="/audiobooks">
              {{ String(value) }}
            </router-link>
            <!-- authors -->
            <div v-else-if="key === 'authors'">
              <div v-for="v in value" :key="'authors-' + v">{{ String(v) }}</div>
            </div>
            <!-- link -->
            <a v-else-if="key === 'link'" :href="value" target="_blank" rel="noopener noreferrer">
              {{ String(value) }}
            </a>
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
  getAudiobookName,
  isEncodedApiUrl,
} from '../../utils/resourceRouting.js'

const route = useRoute()
const router = useRouter()
const audiobook = ref({})

onMounted(async () => {
  const slug = route.params.slug
  const stateUrl = route.query.resourceUrl || router.currentRoute.value.state?.resourceUrl

  if (stateUrl) {
    audiobook.value = await fetchJSONfromAudiobook(stateUrl)
    return
  }

  if (isEncodedApiUrl(slug)) {
    const link = decodeResourceParam(slug)
    audiobook.value = await fetchJSONfromAudiobook(link)
    return
  }

  audiobook.value = await findResourceBySlug('audiobooks', slug, getAudiobookName)
})

async function fetchJSONfromAudiobook(link) {
  const response = await fetch(link)
  if (!response.ok) {
    throw new Error('API call for audiobook details failed with status ' + response.status)
  }
  return await response.json()
}
</script>
