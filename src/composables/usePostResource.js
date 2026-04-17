import { ref } from 'vue'
import fetchIndex from '../data/index.jsx'
import {
  API_BEARER_TOKEN,
  getMediaTypeForCategory,
  buildRequestHeaders
} from '../data/apiConfig.js'

function parseFieldValue(value) {
  if (value === undefined || value === null || value === '') {
    return value
  }

  if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }

  return value
}

export function usePostResource(category, mode = 'POST', initialData = null, onSuccess) {
  const requiredFields = ref([])
  const optionalFields = ref([])
  const formValues = ref({})
  const isLoading = ref(true)
  const loadError = ref('')
  const submitError = ref('')
  const submitSuccess = ref('')
  const isSubmitting = ref(false)

  async function loadCategoryInfo() {
    isLoading.value = true
    loadError.value = ''

    try {
      const index = await fetchIndex()
      const response = await fetch(index[category], {
        headers: buildRequestHeaders({
          accept: getMediaTypeForCategory(category)
        })
      })

      if (!response.ok) {
        throw new Error(`API call failed with status ${response.status}`)
      }

      const info = await response.json()
      const req = info.requiredFields || []
      const opt = info.optionalFields || []

      requiredFields.value = req
      optionalFields.value = opt

      const nextValues = {}
      ;[...req, ...opt].forEach((field) => {
        const key = String(field)
        if (initialData && initialData[key] !== undefined) {
          nextValues[key] = initialData[key] !== undefined && initialData[key] !== null
            ? String(initialData[key])
            : ''
        } else {
          nextValues[key] = formValues.value[key] ?? ''
        }
      })

      formValues.value = nextValues
    } catch (error) {
      loadError.value = error?.message || 'Could not load fields'
    } finally {
      isLoading.value = false
    }
  }

  loadCategoryInfo()

  function handleFieldChange(name, value) {
    formValues.value = {
      ...formValues.value,
      [name]: value
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    submitError.value = ''
    submitSuccess.value = ''

    const payload = {}

    for (const field of requiredFields.value) {
      const key = String(field)
      const value = (formValues.value[key] || '').trim()
      if (!value) {
        submitError.value = `Please fill in required field: ${key}`
        return
      }
    }

    for (const field of [...requiredFields.value, ...optionalFields.value]) {
      const key = String(field)
      const value = (formValues.value[key] || '').trim()
      const original = initialData?.[key] !== undefined && initialData?.[key] !== null
        ? String(initialData[key])
        : ''

      if (mode === 'PATCH') {
        if (!(value === '' && original === '') && value !== original) {
          payload[key] = parseFieldValue(value)
        }
      } else {
        if (value !== '') {
          payload[key] = parseFieldValue(value)
        }
      }
    }

    if (mode === 'PATCH' && Object.keys(payload).length === 0) {
      submitSuccess.value = 'Nothing changed.'
      return
    }

    try {
      isSubmitting.value = true
      const index = await fetchIndex()
      const mediaType = getMediaTypeForCategory(category)
      const isUpdate = mode === 'PUT' || mode === 'PATCH'

      if (isUpdate && !initialData?.url) {
        throw new Error('Missing resource URL for update')
      }

      const url = isUpdate ? initialData.url : index[category]
      const headers = buildRequestHeaders({
        authToken: API_BEARER_TOKEN,
        accept: mediaType,
        contentType: mediaType,
        ifMatch: initialData?.etag
      })

      const response = await fetch(url, {
        method: mode,
        headers,
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const serverMessage = await response.text()
        throw new Error(serverMessage || `${mode} failed with status ${response.status}`)
      }

      let result = null
      try {
        result = await response.json()
      } catch {
        result = null
      }

      if (!result) {
        result = {
          ...payload,
          url: initialData?.url,
          etag: initialData?.etag
        }
      }

      const successMessage = mode === 'POST'
        ? 'Saved successfully.'
        : mode === 'PATCH'
          ? 'Patched successfully.'
          : 'Updated successfully.'

      submitSuccess.value = successMessage
      onSuccess?.(result)
    } catch (error) {
      submitError.value = error?.message || 'Could not submit this form'
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    requiredFields,
    optionalFields,
    formValues,
    isLoading,
    loadError,
    submitError,
    submitSuccess,
    isSubmitting,
    handleFieldChange,
    handleSubmit
  }
}
