<template>
  <div>
    <p v-if="deleteError" class="post-message post-error resource-feedback">{{ deleteError }}</p>
    <div class="resource-list">
      <div
        class="resource-card resource-card-row"
        v-for="genre in genres"
        :key="genre.url"
      >
        <router-link
          class="resource-link"
          :to="{ path: buildResourcePath('genres', genre, getGenreName), state: { resourceUrl: genre.url } }"
        >
          {{ getGenreName(genre) }}
        </router-link>
        <DeleteButton
          :resourceUrl="genre.url"
          :requestInfo="buildDeleteRequestInfo()"
          :payloadInfo="{ url: genre.url, type: 'genre' }"
          :onDeleted="handleDeletedGenre"
          :onError="handleDeleteError"
        />
        <button
          class="post-btn post-btn-secondary"
          type="button"
          @click="editing = { ...genre, mode: 'PUT' }"
        >
          PUT
        </button>
        <button
          class="post-btn post-btn-secondary"
          type="button"
          @click="editing = { ...genre, mode: 'PATCH' }"
        >
          PATCH
        </button>
      </div>
    </div>
    <div class="post-button">
      <button class="post-btn post-btn-primary" type="button" @click="editing = { mode: 'POST' }">POST</button>
      <PostScreen
        v-if="editing"
        category="genres"
        :mode="editing.mode || 'POST'"
        :initialData="editing.mode === 'POST' ? null : editing"
        :onClose="() => { editing = null }"
        :onSuccess="() => { editing = null; loadGenres() }"
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
import { buildDeleteRequestInfo } from '../../data/apiConfig.jsx'
import { buildResourcePath, getGenreName } from '../../utils/resourceRouting.js'

const pageAmount = 100
const genres = ref([])
const min = ref(0)
const max = ref(pageAmount)
const deleteError = ref('')
const editing = ref(null)

function handleDeletedGenre(payload) {
  deleteError.value = ''
  genres.value = genres.value.filter((genre) => genre.url !== payload.url)
}

function handleDeleteError(message) {
  deleteError.value = message
}

function loadGenres() {
  let active = true

  const load = async () => {
    try {
      const links = await fetchGenresPage(min.value, max.value)
      const items = await fetchJSONSfromGenres(links)
      if (active) {
        genres.value = items
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

watch([min, max], loadGenres, { immediate: true })

async function fetchGenresPage(minValue, maxValue) {
  const index = await fetchIndex()
  const response = await fetch(index['genres'])
  if (!response.ok) {
    throw new Error('API call for genres failed with status ' + response.status)
  }
  const data = await response.json()
  return data.genres.slice(minValue, maxValue)
}

async function fetchGenresLength() {
  const index = await fetchIndex()
  const response = await fetch(index['genres'])
  if (!response.ok) {
    throw new Error('API call for genres failed with status ' + response.status)
  }
  return (await response.json()).genres.length
}

async function fetchJSONSfromGenres(links) {
  const list = []
  for (const link of links) {
    list.push(await fetchJSONfromGenre(link))
  }
  return list
}

async function fetchJSONfromGenre(link) {
  const response = await fetch(link)
  if (!response.ok) {
    throw new Error('API call for genre details failed with status ' + response.status)
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
  const length = await fetchGenresLength()
  const nextMin = min.value + pageAmount
  if (nextMin < length) {
    min.value = nextMin
    max.value = nextMin + pageAmount
  }
}
</script>
