<template>
  <div>
    <p v-if="deleteError" class="post-message post-error resource-feedback">{{ deleteError }}</p>
    <div class="resource-list">
      <div
        class="resource-card resource-card-row"
        v-for="user in users"
        :key="user.url"
      >
        <router-link
          class="resource-link"
          :to="{ path: buildResourcePath('users', user, getUserName), state: { resourceUrl: user.url } }"
        >
          {{ getUserName(user) }}
        </router-link>
        <DeleteButton
          :resourceUrl="user.url"
          :requestInfo="buildDeleteRequestInfo()"
          :payloadInfo="{ url: user.url, type: 'user' }"
          :onDeleted="handleDeletedUser"
          :onError="handleDeleteError"
        />
        <button
          class="post-btn post-btn-secondary"
          type="button"
          @click="editing = { ...user, mode: 'PUT' }"
        >
          PUT
        </button>
        <button
          class="post-btn post-btn-secondary"
          type="button"
          @click="editing = { ...user, mode: 'PATCH' }"
        >
          PATCH
        </button>
      </div>
    </div>
    <div class="post-button">
      <button class="post-btn post-btn-primary" type="button" @click="editing = { mode: 'POST' }">POST</button>
      <PostScreen
        v-if="editing"
        category="users"
        :mode="editing.mode || 'POST'"
        :initialData="editing.mode === 'POST' ? null : editing"
        :onClose="() => { editing = null }"
        :onSuccess="() => { editing = null; loadUsers() }"
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
import { buildResourcePath, getUserName } from '../../utils/resourceRouting.js'

const pageAmount = 100
const users = ref([])
const min = ref(0)
const max = ref(pageAmount)
const deleteError = ref('')
const editing = ref(null)

function handleDeletedUser(payload) {
  deleteError.value = ''
  users.value = users.value.filter((user) => user.url !== payload.url)
}

function handleDeleteError(message) {
  deleteError.value = message
}

function loadUsers() {
  let active = true

  const load = async () => {
    try {
      const links = await fetchUsersPage(min.value, max.value)
      const items = await fetchJSONSfromUsers(links)
      if (active) {
        users.value = items
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

watch([min, max], loadUsers, { immediate: true })

async function fetchUsersPage(minValue, maxValue) {
  const index = await fetchIndex()
  const response = await fetch(index['users'])
  if (!response.ok) {
    throw new Error('API call for users failed with status ' + response.status)
  }
  const data = await response.json()
  return data.users.slice(minValue, maxValue)
}

async function fetchUsersLength() {
  const index = await fetchIndex()
  const response = await fetch(index['users'])
  if (!response.ok) {
    throw new Error('API call for users failed with status ' + response.status)
  }
  return (await response.json()).users.length
}

async function fetchJSONSfromUsers(links) {
  const list = []
  for (const link of links) {
    list.push(await fetchJSONfromUser(link))
  }
  return list
}

async function fetchJSONfromUser(link) {
  const response = await fetch(link)
  if (!response.ok) {
    throw new Error('API call for user details failed with status ' + response.status)
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
  const length = await fetchUsersLength()
  const nextMin = min.value + pageAmount
  if (nextMin < length) {
    min.value = nextMin
    max.value = nextMin + pageAmount
  }
}
</script>
