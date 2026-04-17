<template>
  <div>
    <p v-if="deleteError" class="post-message post-error resource-feedback">{{ deleteError }}</p>
    <div class="resource-list">
      <div
        class="resource-card resource-card-row"
        v-for="review in reviews"
        :key="review.url"
      >
        <router-link
          class="resource-link"
          :to="`/reviews/${encodeURIComponent(review.url)}`"
        >
          {{ review.url }}
        </router-link>
        <DeleteButton
          :resourceUrl="review.url"
          :requestInfo="buildDeleteRequestInfo()"
          :payloadInfo="{ url: review.url, type: 'review' }"
          :onDeleted="handleDeletedReview"
          :onError="handleDeleteError"
        />
        <button
          class="post-btn post-btn-secondary"
          type="button"
          @click="editing = { ...review, mode: 'PUT' }"
        >
          PUT
        </button>
        <button
          class="post-btn post-btn-secondary"
          type="button"
          @click="editing = { ...review, mode: 'PATCH' }"
        >
          PATCH
        </button>
      </div>
    </div>
    <div class="post-button">
      <button class="post-btn post-btn-primary" type="button" @click="editing = { mode: 'POST' }">POST</button>
      <PostScreen
        v-if="editing"
        category="reviews"
        :mode="editing.mode || 'POST'"
        :initialData="editing.mode === 'POST' ? null : editing"
        :onClose="() => { editing = null }"
        :onSuccess="() => { editing = null; loadReviews() }"
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
const reviews = ref([])
const min = ref(0)
const max = ref(pageAmount)
const deleteError = ref('')
const editing = ref(null)

function handleDeletedReview(payload) {
  deleteError.value = ''
  reviews.value = reviews.value.filter((review) => review.url !== payload.url)
}

function handleDeleteError(message) {
  deleteError.value = message
}

function loadReviews() {
  let active = true

  const load = async () => {
    try {
      const links = await fetchReviewsPage(min.value, max.value)
      const items = await fetchJSONSfromReviews(links)
      if (active) {
        reviews.value = items
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

watch([min, max], loadReviews, { immediate: true })

async function fetchReviewsPage(minValue, maxValue) {
  const index = await fetchIndex()
  const response = await fetch(index['reviews'])
  if (!response.ok) {
    throw new Error('API call for reviews failed with status ' + response.status)
  }
  const data = await response.json()
  return data.reviews.slice(minValue, maxValue)
}

async function fetchReviewsLength() {
  const index = await fetchIndex()
  const response = await fetch(index['reviews'])
  if (!response.ok) {
    throw new Error('API call for reviews failed with status ' + response.status)
  }
  return (await response.json()).reviews.length
}

async function fetchJSONSfromReviews(links) {
  const list = []
  for (const link of links) {
    list.push(await fetchJSONfromReview(link))
  }
  return list
}

async function fetchJSONfromReview(link) {
  const response = await fetch(link)
  if (!response.ok) {
    throw new Error('API call for review details failed with status ' + response.status)
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
  const length = await fetchReviewsLength()
  const nextMin = min.value + pageAmount
  if (nextMin < length) {
    min.value = nextMin
    max.value = nextMin + pageAmount
  }
}
</script>
