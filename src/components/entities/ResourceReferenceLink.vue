<template>
  <router-link
    v-if="resource"
    :to="{ path: buildResourcePath(resourceType, resource, getName), state: { resourceUrl: resourceUrl } }"
  >
    {{ getName(resource) }}
  </router-link>
  <span v-else>{{ fallbackLabel || resourceUrl }}</span>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  buildResourcePath,
  getAudiobookName,
  getGenreName,
  getUserName,
} from '../../utils/resourceRouting.js'

const props = defineProps({
  resourceType: { type: String, required: true },
  resourceUrl: { type: String, required: true },
  fallbackLabel: { type: String, default: '' }
})

const resource = ref(null)
const hasError = ref(false)

const RESOURCE_CONFIG = {
  audiobooks: { getName: getAudiobookName },
  genres: { getName: getGenreName },
  users: { getName: getUserName },
}

const resourceCache = new Map()

onMounted(async () => {
  const config = RESOURCE_CONFIG[props.resourceType]

  if (!props.resourceUrl || !config) {
    return
  }

  if (resourceCache.has(props.resourceUrl)) {
    resource.value = resourceCache.get(props.resourceUrl)
    return
  }

  try {
    const response = await fetch(props.resourceUrl)
    if (!response.ok) {
      throw new Error(`API call for ${props.resourceType} details failed with status ${response.status}`)
    }

    const data = await response.json()
    resourceCache.set(props.resourceUrl, data)
    resource.value = data
  } catch (error) {
    console.error(error)
    hasError.value = true
  }
})

function getName(resource) {
  const config = RESOURCE_CONFIG[props.resourceType]
  return config ? config.getName(resource) : String(resource)
}
</script>
