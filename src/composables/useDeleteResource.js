import { ref } from 'vue'
import fetchIndex from '../data/index.jsx'
import {
  API_BEARER_TOKEN,
  getMediaTypeForCategory,
  buildRequestHeaders
} from '../data/apiConfig.js'

export function useDeleteResource({ resourceUrl, requestInfo, payloadInfo, onDeleted, onError }) {
  const isDeleting = ref(false)

  async function getETag() {
    const response = await fetch(resourceUrl, {
      method: 'GET',
      headers: buildRequestHeaders({
        authToken: requestInfo?.authToken,
        accept: requestInfo?.accept
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
    if (!resourceUrl || isDeleting.value) {
      return
    }

    isDeleting.value = true
    try {
      const etag = await getETag()
      const ifMatchValue = requestInfo?.ifMatch === 'auto'
        ? etag
        : (requestInfo?.ifMatch || etag)

      const response = await fetch(resourceUrl, {
        method: 'DELETE',
        headers: buildRequestHeaders({
          authToken: requestInfo?.authToken,
          accept: requestInfo?.accept,
          ifMatch: ifMatchValue
        })
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `DELETE failed with status ${response.status}`)
      }

      onDeleted?.(payloadInfo ?? { url: resourceUrl })
    } catch (error) {
      onError?.(error?.message || 'Could not delete resource.')
    } finally {
      isDeleting.value = false
    }
  }

  return {
    isDeleting,
    handleDelete
  }
}
