import { ref } from "vue";
import { API_MEDIA_TYPE, API_BEARER_TOKEN, buildRequestHeaders } from "../data/apiConfig.js";

export default function useDeleteResource({ resourceUrlRef, requestInfoRef, payloadInfoRef, onDeleted, onError }) {
  const isDeleting = ref(false);

  async function getETag() {
    const response = await fetch(resourceUrlRef.value, {
      method: "GET",
      headers: buildRequestHeaders({
        authToken: requestInfoRef.value?.authToken || API_BEARER_TOKEN,
        accept: requestInfoRef.value?.accept || API_MEDIA_TYPE
      })
    });

    if (!response.ok) {
      throw new Error(`Could not fetch ETag (status ${response.status})`);
    }

    const etag = response.headers.get("ETag");
    if (!etag) {
      throw new Error("No ETag header in response");
    }

    return etag;
  }

  async function handleDelete() {
    if (!resourceUrlRef.value || isDeleting.value) {
      return;
    }

    isDeleting.value = true;

    try {
      const etag = await getETag();
      const response = await fetch(resourceUrlRef.value, {
        method: "DELETE",
        headers: buildRequestHeaders({
          authToken: requestInfoRef.value?.authToken || API_BEARER_TOKEN,
          accept: requestInfoRef.value?.accept || API_MEDIA_TYPE,
          ifMatch: requestInfoRef.value?.ifMatch === "auto" ? etag : (requestInfoRef.value?.ifMatch || etag)
        })
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `DELETE failed with status ${response.status}`);
      }

      onDeleted?.(payloadInfoRef.value ?? { url: resourceUrlRef.value });
    } catch (error) {
      onError?.(error.message || "Could not delete resource.");
    } finally {
      isDeleting.value = false;
    }
  }

  return {
    isDeleting,
    handleDelete
  };
}

