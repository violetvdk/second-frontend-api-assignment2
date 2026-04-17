<template>
  <div>
    <p v-if="deleteError" class="post-message post-error resource-feedback">{{ deleteError }}</p>
    <div class="resource-list">
      <div
        class="resource-card resource-card-row"
        v-for="position in positions"
        :key="position.url"
      >
        <router-link
          class="resource-link"
          :to="`/positions/${encodeURIComponent(position.url)}`"
        >
          {{ position.url }}
        </router-link>
        <DeleteButton
          :resourceUrl="position.url"
          :requestInfo="buildDeleteRequestInfo()"
          :payloadInfo="{ url: position.url, type: 'position' }"
          :onDeleted="handleDeletedPosition"
          :onError="handleDeleteError"
        />
        <button
          class="post-btn post-btn-secondary"
          type="button"
          @click="editing = { ...position, mode: 'PUT' }"
        >
          PUT
        </button>
        <button
          class="post-btn post-btn-secondary"
          type="button"
          @click="editing = { ...position, mode: 'PATCH' }"
        >
          PATCH
        </button>
      </div>
    </div>
    <div class="post-button">
      <button class="post-btn post-btn-primary" type="button" @click="editing = { mode: 'POST' }">POST</button>
      <PostScreen
        v-if="editing"
        category="positions"
        :mode="editing.mode || 'POST'"
        :initialData="editing.mode === 'POST' ? null : editing"
        :onClose="() => { editing = null }"
        :onSuccess="() => { editing = null; loadPositions() }"
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

const pageAmount = 100
const positions = ref([])
const min = ref(0)
const max = ref(pageAmount)
const deleteError = ref('')
const editing = ref(null)

function handleDeletedPosition(payload) {
  deleteError.value = ''
  positions.value = positions.value.filter((position) => position.url !== payload.url)
}

function handleDeleteError(message) {
  deleteError.value = message
}

function loadPositions() {
  let active = true

  const load = async () => {
    try {
      const links = await fetchPositionsPage(min.value, max.value)
      const items = await fetchJSONSfromPositions(links)
      if (active) {
        positions.value = items
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

watch([min, max], loadPositions, { immediate: true })

async function fetchPositionsPage(minValue, maxValue) {
  const index = await fetchIndex()
  const response = await fetch(index['positions'])
  if (!response.ok) {
    throw new Error('API call for positions failed with status ' + response.status)
  }
  const data = await response.json()
  return data.positions.slice(minValue, maxValue)
}

async function fetchPositionsLength() {
  const index = await fetchIndex()
  const response = await fetch(index['positions'])
  if (!response.ok) {
    throw new Error('API call for positions failed with status ' + response.status)
  }
  return (await response.json()).positions.length
}

async function fetchJSONSfromPositions(links) {
  const list = []
  for (const link of links) {
    list.push(await fetchJSONfromPosition(link))
  }
  return list
}

async function fetchJSONfromPosition(link) {
  const response = await fetch(link)
  if (!response.ok) {
    throw new Error('API call for position details failed with status ' + response.status)
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
  const length = await fetchPositionsLength()
  const nextMin = min.value + pageAmount
  if (nextMin < length) {
    min.value = nextMin
    max.value = nextMin + pageAmount
  }
}
</script>
