<template>
  <button
    :class="className"
    type="button"
    @click="handleDelete"
    :disabled="isDeleting"
  >
    {{ isDeleting ? busyLabel : label }}
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { buildRequestHeaders } from '../../data/apiConfig.js'

const props = defineProps({
  resourceUrl: { type: String, required: true },
  requestInfo: { type: Object, default: () => ({}) },
  payloadInfo: { type: Object, default: () => ({}) },
  onDeleted: { type: Function, default: null },
  onError: { type: Function, default: null },
  className: { type: String, default: 'post-btn post-btn-secondary' },
  label: { type: String, default: 'Delete' },
  busyLabel: { type: String, default: 'Deleting...' }
})

const isDeleting = ref(false)

async function getETag() {
  const response = await fetch(props.resourceUrl, {
    method: 'GET',
    headers: buildRequestHeaders({
      authToken: props.requestInfo?.authToken,
      accept: props.requestInfo?.accept
    })
  })

  if (!response.ok) {
    throw new Error(`Could not fetch ETag (status ${response.status})`)
  }

  const etag = response.headers.get('ETag')
  if (!etag) {
    throw new Error('No ETag header in response')
  }

  return etag
}

async function handleDelete() {
  if (!props.resourceUrl || isDeleting.value) {
    return
  }

  isDeleting.value = true
  try {
    const etag = await getETag()
    const ifMatchValue = props.requestInfo?.ifMatch === 'auto'
      ? etag
      : (props.requestInfo?.ifMatch || etag)

    const response = await fetch(props.resourceUrl, {
      method: 'DELETE',
      headers: buildRequestHeaders({
        authToken: props.requestInfo?.authToken,
        accept: props.requestInfo?.accept,
        ifMatch: ifMatchValue
      })
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || `DELETE failed with status ${response.status}`)
    }

    props.onDeleted?.(props.payloadInfo ?? { url: props.resourceUrl })
  } catch (error) {
    props.onError?.(error?.message || 'Could not delete resource.')
  } finally {
    isDeleting.value = false
  }
}
</script>
