<script setup>
import { onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import fetchIndex from "../../data/index.js";
import { buildDeleteRequestInfo } from "../../data/apiConfig.js";
import DeleteButton from "../entities/DeleteButton.vue";
import PostScreen from "../pop-ups/post/PostScreen.vue";

const props = defineProps({
  category: { type: String, required: true },
  routeBase: { type: String, required: true },
  payloadType: { type: String, required: true }
});

const pageAmount = 100;
const resources = ref([]);
const min = ref(0);
const max = ref(pageAmount);
const deleteError = ref("");
const editing = ref(null);

function detailPath(url) {
  return `${props.routeBase}/${encodeURIComponent(url)}`;
}

async function fetchResourcePage(minValue, maxValue) {
  const index = await fetchIndex();
  const response = await fetch(index[props.category]);
  if (!response.ok) {
    throw new Error(`API call for ${props.category} failed with status ${response.status}`);
  }
  const data = await response.json();
  return (data[props.category] || []).slice(minValue, maxValue);
}

async function fetchResourceLength() {
  const index = await fetchIndex();
  const response = await fetch(index[props.category]);
  if (!response.ok) {
    throw new Error(`API call for ${props.category} failed with status ${response.status}`);
  }
  const data = await response.json();
  return (data[props.category] || []).length;
}

async function fetchJsonFromResource(link) {
  const response = await fetch(link);
  if (!response.ok) {
    throw new Error(`API call for ${props.payloadType} details failed with status ${response.status}`);
  }
  const data = await response.json();
  const etag = response.headers.get("ETag");
  return { ...data, etag };
}

async function fetchJsonsFromResources(links) {
  const list = [];
  for (const link of links) {
    list.push(await fetchJsonFromResource(link));
  }
  return list;
}

async function refreshPage() {
  const links = await fetchResourcePage(min.value, max.value);
  resources.value = await fetchJsonsFromResources(links);
}

function handleDeleted(payload) {
  deleteError.value = "";
  resources.value = resources.value.filter((resource) => resource.url !== payload.url);
}

function handleDeleteError(message) {
  deleteError.value = message;
}

function previousPage() {
  min.value = Math.max(min.value - pageAmount, 0);
  max.value = Math.max(max.value - pageAmount, pageAmount);
}

async function nextPage() {
  const length = await fetchResourceLength();
  const nextMin = min.value + pageAmount;
  if (nextMin < length) {
    min.value = nextMin;
    max.value = nextMin + pageAmount;
  }
}

watch([min, max, () => props.category], async () => {
  try {
    await refreshPage();
  } catch (error) {
    console.error(error);
  }
}, { immediate: true });

onMounted(async () => {
  try {
    await refreshPage();
  } catch (error) {
    console.error(error);
  }
});
</script>

<template>
  <p v-if="deleteError" class="post-message post-error resource-feedback">{{ deleteError }}</p>

  <div class="resource-list">
    <div v-for="resource in resources" :key="resource.url" class="resource-card resource-card-row">
      <RouterLink class="resource-link" :to="detailPath(resource.url)">
        {{ resource.url }}
      </RouterLink>

      <DeleteButton
        :resource-url="resource.url"
        :request-info="buildDeleteRequestInfo()"
        :payload-info="{ url: resource.url, type: payloadType }"
        :on-deleted="handleDeleted"
        :on-error="handleDeleteError"
      />

      <button class="post-btn post-btn-secondary" type="button" @click="editing = { ...resource, mode: 'PUT' }">
        PUT
      </button>
      <button class="post-btn post-btn-secondary" type="button" @click="editing = { ...resource, mode: 'PATCH' }">
        PATCH
      </button>
    </div>
  </div>

  <div class="post-button">
    <button class="post-btn post-btn-primary" type="button" @click="editing = { mode: 'POST' }">POST</button>

    <PostScreen
      v-if="editing"
      :category="category"
      :mode="editing.mode || 'POST'"
      :initial-data="editing.mode === 'POST' ? null : editing"
      @close="editing = null"
      @success="async () => {
        editing = null;
        await refreshPage();
      }"
    />
  </div>

  <button class="previousPage" type="button" @click="previousPage">Previous</button>
  <button class="nextPage" type="button" @click="nextPage">Next</button>
</template>

