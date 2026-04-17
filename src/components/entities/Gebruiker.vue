<template>
  <div class="entity-table-wrapper">
    <table class="entity-table">
      <tbody>
        <tr v-for="[key, value] in Object.entries(user)" :key="key">
          <th>{{ key }}</th>
          <td>
            <!-- reviews and positions -->
            <div v-if="['reviews', 'positions'].includes(key)">
              <div v-for="v in value" :key="key + '-' + v">
                <router-link :to="'/' + key + '/' + encodeURIComponent(v)">
                  {{ String(v) }}
                </router-link>
              </div>
            </div>
            <!-- url -->
            <router-link
              v-else-if="key === 'url'"
              :to="{ path: buildResourcePath('users', user, getUserName), state: { resourceUrl: value } }"
            >
              {{ String(value) }}
            </router-link>
            <!-- index -->
            <router-link v-else-if="key === 'index'" to="/users">
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
import {
  buildResourcePath,
  decodeResourceParam,
  findResourceBySlug,
  getUserName,
  isEncodedApiUrl,
} from '../../utils/resourceRouting.js'

const route = useRoute()
const router = useRouter()
const user = ref({})

onMounted(async () => {
  const slug = route.params.slug
  const stateUrl = route.query.resourceUrl || router.currentRoute.value.state?.resourceUrl

  if (stateUrl) {
    user.value = await fetchJSONfromUser(stateUrl)
    return
  }

  if (isEncodedApiUrl(slug)) {
    const link = decodeResourceParam(slug)
    user.value = await fetchJSONfromUser(link)
    return
  }

  user.value = await findResourceBySlug('users', slug, getUserName)
})

async function fetchJSONfromUser(link) {
  const response = await fetch(link)
  if (!response.ok) {
    throw new Error('API call for user details failed with status ' + response.status)
  }
  return await response.json()
}
</script>
