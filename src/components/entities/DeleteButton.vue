<script setup>
import { toRef } from "vue";
import useDeleteResource from "../../composables/useDeleteResource.js";

const props = defineProps({
  resourceUrl: { type: String, required: true },
  requestInfo: { type: Object, default: null },
  payloadInfo: { type: Object, default: null },
  onDeleted: { type: Function, default: null },
  onError: { type: Function, default: null },
  className: { type: String, default: "post-btn post-btn-secondary" },
  label: { type: String, default: "Delete" },
  busyLabel: { type: String, default: "Deleting..." }
});

const { isDeleting, handleDelete } = useDeleteResource({
  resourceUrlRef: toRef(props, "resourceUrl"),
  requestInfoRef: toRef(props, "requestInfo"),
  payloadInfoRef: toRef(props, "payloadInfo"),
  onDeleted: props.onDeleted,
  onError: props.onError
});
</script>

<template>
  <button :class="className" type="button" :disabled="isDeleting" @click="handleDelete">
    {{ isDeleting ? busyLabel : label }}
  </button>
</template>

