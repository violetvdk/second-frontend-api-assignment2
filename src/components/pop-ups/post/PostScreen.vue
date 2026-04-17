<template>
  <div class="post-screen" role="dialog" aria-modal="true">
    <div class="post-screen-card">
      <h4>Fill in the fields below! (* are required)</h4>

      <p v-if="isLoading" class="post-message">Loading fields...</p>
      <p v-if="loadError" class="post-message post-error">{{ loadError }}</p>
      <p v-if="submitError" class="post-message post-error">{{ submitError }}</p>
      <p v-if="submitSuccess" class="post-message post-success">{{ submitSuccess }}</p>

      <form v-if="!isLoading && !loadError" @submit.prevent="handleSubmit">
        <Fields
          :requiredFields="requiredFields"
          :optionalFields="optionalFields"
          :values="formValues"
          :onFieldChange="handleFieldChange"
        />
        <div class="post-actions">
          <button class="post-btn post-btn-primary" type="submit" :disabled="isSubmitting">
            {{ submitButtonLabel }}
          </button>
          <button class="post-btn post-btn-secondary" type="button" @click="props.onClose">Close</button>
        </div>
      </form>

      <div v-if="loadError" class="post-actions">
        <button class="post-btn post-btn-secondary" type="button" @click="props.onClose">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Fields from './Fields.vue'
import fetchIndex from '../../../data/index.jsx'
import {
  API_BEARER_TOKEN,
  getMediaTypeForCategory,
  buildRequestHeaders
} from '../../../data/apiConfig.jsx'

const props = defineProps({
  category: { type: String, required: true },
  onClose: { type: Function, required: true },
  mode: { type: String, default: 'POST' },
  initialData: { type: Object, default: null },
  onSuccess: { type: Function, default: null }
})

const requiredFields = ref([])
const optionalFields = ref([])
const formValues = ref({})
const isLoading = ref(true)
const loadError = ref('')
const submitError = ref('')
const submitSuccess = ref('')
const isSubmitting = ref(false)

onMounted(loadCategoryInfo)

async function loadCategoryInfo() {
  isLoading.value = true
  loadError.value = ''

  try {
    const index = await fetchIndex()
    const response = await fetch(index[props.category], {
      headers: buildRequestHeaders({
        accept: getMediaTypeForCategory(props.category)
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
      if (props.initialData && props.initialData[key] !== undefined) {
        nextValues[key] = props.initialData[key] !== undefined && props.initialData[key] !== null
          ? String(props.initialData[key])
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

function handleFieldChange(name, value) {
  formValues.value = {
    ...formValues.value,
    [name]: value
  }
}

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

const submitButtonLabel = computed(() => {
  if (isSubmitting.value) {
    return 'Saving...'
  }
  if (props.mode === 'PUT') {
    return 'Update'
  }
  if (props.mode === 'PATCH') {
    return 'Patch'
  }
  return 'Submit'
})

async function handleSubmit() {
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
    const original = props.initialData?.[key] !== undefined && props.initialData?.[key] !== null
      ? String(props.initialData[key])
      : ''

    if (props.mode === 'PATCH') {
      if (!(value === '' && original === '') && value !== original) {
        payload[key] = parseFieldValue(value)
      }
    } else {
      if (value !== '') {
        payload[key] = parseFieldValue(value)
      }
    }
  }

  if (props.mode === 'PATCH' && Object.keys(payload).length === 0) {
    submitSuccess.value = 'Nothing changed.'
    return
  }

  try {
    isSubmitting.value = true
    const index = await fetchIndex()
    const mediaType = getMediaTypeForCategory(props.category)
    const isUpdate = props.mode === 'PUT' || props.mode === 'PATCH'

    if (isUpdate && !props.initialData?.url) {
      throw new Error('Missing resource URL for update')
    }

    const url = isUpdate ? props.initialData.url : index[props.category]
    const headers = buildRequestHeaders({
      authToken: API_BEARER_TOKEN,
      accept: mediaType,
      contentType: mediaType,
      ifMatch: props.initialData?.etag
    })

    const response = await fetch(url, {
      method: props.mode,
      headers,
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const serverMessage = await response.text()
      throw new Error(serverMessage || `${props.mode} failed with status ${response.status}`)
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
        url: props.initialData?.url,
        etag: props.initialData?.etag
      }
    }

    const successMessage = props.mode === 'POST'
      ? 'Saved successfully.'
      : props.mode === 'PATCH'
        ? 'Patched successfully.'
        : 'Updated successfully.'

    submitSuccess.value = successMessage
    props.onSuccess?.(result)
  } catch (error) {
    submitError.value = error?.message || 'Could not submit this form'
  } finally {
    isSubmitting.value = false
  }
}
</script>
