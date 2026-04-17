<template>
  <div>
    <p v-if="deleteError" class="post-message post-error resource-feedback">{{ deleteError }}</p>
    <div class="resource-list">
      <div
        class="resource-card resource-card-row"
        v-for="audiobook in audiobooks"
        :key="audiobook.url"
      >
        <router-link
          class="resource-link"
          :to="{ path: buildResourcePath('audiobooks', audiobook, getAudiobookName), state: { resourceUrl: audiobook.url } }"
        >
          {{ getAudiobookName(audiobook) }}
        </router-link>
        <DeleteButton
          :resourceUrl="audiobook.url"
          :requestInfo="buildDeleteRequestInfo()"
          :payloadInfo="{ url: audiobook.url, type: 'audiobook' }"
          :onDeleted="handleDeletedAudiobook"
          :onError="handleDeleteError"
        />
        <button
          class="post-btn post-btn-secondary"
          type="button"
          @click="editing = { ...audiobook, mode: 'PUT' }"
        >
          PUT
        </button>
        <button
          class="post-btn post-btn-secondary"
          type="button"
          @click="editing = { ...audiobook, mode: 'PATCH' }"
        >
          PATCH
        </button>
      </div>
    </div>
    <div class="post-button">
      <button class="post-btn post-btn-primary" type="button" @click="editing = { mode: 'POST' }">POST</button>
      <PostScreen
        v-if="editing"
        category="audiobooks"
        :mode="editing.mode || 'POST'"
        :initialData="editing.mode === 'POST' ? null : editing"
        :onClose="() => { editing = null }"
        :onSuccess="() => { editing = null; loadAudiobooks() }"
      />
    </div>
    <button class="previousPage" type="button" @click="prevPage">Previous</button>
    <button class="nextPage" type="button" @click="nextPage">Next</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import fetchIndex from '../../data/index.jsx'
import PostScreen from '../pop-ups/post/PostScreen.vue'
import DeleteButton from '../entities/DeleteButton.vue'
import { buildDeleteRequestInfo } from '../../data/apiConfig.js'
import { buildResourcePath, getAudiobookName } from '../../utils/resourceRouting.js'

const pageAmount = 100
const audiobooks = ref([])
const min = ref(0)
const max = ref(pageAmount)
const deleteError = ref('')
const editing = ref(null)

function handleDeletedAudiobook(payload) {
  deleteError.value = ''
  audiobooks.value = audiobooks.value.filter((audiobook) => audiobook.url !== payload.url)
}

function handleDeleteError(message) {
  deleteError.value = message
}

function loadAudiobooks() {
  let active = true

  const load = async () => {
    try {
      const links = await fetchAudiobooksPage(min.value, max.value)
      const items = await fetchJSONSfromAudiobooks(links)
      if (active) {
        audiobooks.value = items
      }
    } catch (err) {
      console.error(err)
    }
  }

  void load()

  return () => {
    active = false
  }
}

watch([min, max], loadAudiobooks, { immediate: true })

async function fetchAudiobooksPage(minValue, maxValue) {
  const index = await fetchIndex()
  const response = await fetch(index['audiobooks'])
  if (!response.ok) {
    throw new Error('API call for audiobooks failed with status ' + response.status)
  }
  const data = await response.json()
  return data.audiobooks.slice(minValue, maxValue)
}

async function fetchAudiobooksLength() {
  const index = await fetchIndex()
  const response = await fetch(index['audiobooks'])
  if (!response.ok) {
    throw new Error('API call for audiobooks failed with status ' + response.status)
  }
  return (await response.json()).audiobooks.length
}

async function fetchJSONSfromAudiobooks(links) {
  const list = []
  for (const link of links) {
    list.push(await fetchJSONfromAudiobook(link))
  }
  return list
}

async function fetchJSONfromAudiobook(link) {
  const response = await fetch(link)
  if (!response.ok) {
    throw new Error('API call for audiobook details failed with status ' + response.status)
  }
  const data = await response.json()
  const etag = response.headers.get('ETag')
  return { ...data, etag }
}

function prevPage() {
  min.value = Math.max(min.value - pageAmount, 0)
  max.value = Math.max(max.value - pageAmount, pageAmount)
}

async function nextPage() {
  const length = await fetchAudiobooksLength()
  const nextMin = min.value + pageAmount
  if (nextMin < length) {
    min.value = nextMin
    max.value = nextMin + pageAmount
  }
}
</script>
