<script setup>
import { computed, toRef } from "vue";
import usePostResource from "../../../composables/usePostResource.js";
import Fields from "./Fields.vue";

const props = defineProps({
  category: { type: String, required: true },
  mode: { type: String, default: "POST" },
  initialData: { type: Object, default: null }
});

const emit = defineEmits(["close", "success"]);

const categoryRef = toRef(props, "category");
const modeRef = toRef(props, "mode");
const initialDataRef = computed(() => props.initialData);

const {
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
} = usePostResource(categoryRef, modeRef, initialDataRef, (result) => {
  emit("success", result);
});

async function onSubmit(event) {
  await handleSubmit(event);
}
</script>

<template>
  <div class="post-screen" role="dialog" aria-modal="true">
    <div class="post-screen-card">
      <h4>Fill in the fields below! (* are required)</h4>
      <p v-if="isLoading" class="post-message">Loading fields...</p>
      <p v-if="loadError" class="post-message post-error">{{ loadError }}</p>
      <p v-if="submitError" class="post-message post-error">{{ submitError }}</p>
      <p v-if="submitSuccess" class="post-message post-success">{{ submitSuccess }}</p>

      <form v-if="!isLoading && !loadError" @submit="onSubmit">
        <Fields
          :required-fields="requiredFields"
          :optional-fields="optionalFields"
          :values="formValues"
          @field-change="handleFieldChange"
        />
        <div class="post-actions">
          <button class="post-btn post-btn-primary" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? "Saving..." : mode === "PUT" ? "Update" : mode === "PATCH" ? "Patch" : "Submit" }}
          </button>
          <button class="post-btn post-btn-secondary" type="button" @click="emit('close')">Close</button>
        </div>
      </form>

      <div v-if="loadError" class="post-actions">
        <button class="post-btn post-btn-secondary" type="button" @click="emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

