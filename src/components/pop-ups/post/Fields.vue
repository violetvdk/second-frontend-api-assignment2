<script setup>
const props = defineProps({
  requiredFields: { type: Array, default: () => [] },
  optionalFields: { type: Array, default: () => [] },
  values: { type: Object, default: () => ({}) }
});

const emit = defineEmits(["fieldChange"]);

function fieldId(name) {
  return `field-${String(name).toLowerCase().replace(/\s+/g, "-")}`;
}

function handleInput(rowName, event) {
  emit("fieldChange", rowName, event.target.value);
}
</script>

<template>
  <p v-if="requiredFields.length + optionalFields.length === 0">No fields found for this category.</p>

  <div v-else class="post-fields-wrapper">
    <table class="post-fields-table">
      <thead>
        <tr>
          <th>Field</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in [
            ...requiredFields.map((field) => ({ name: String(field), required: true })),
            ...optionalFields.map((field) => ({ name: String(field), required: false }))
          ]"
          :key="`${row.required ? 'req' : 'opt'}-${row.name}`"
        >
          <td>
            {{ row.name }}
            <span v-if="row.required" class="required-star"> *</span>
          </td>
          <td>
            <label :for="fieldId(row.name)" class="sr-only">{{ row.name }}</label>
            <input
              :id="fieldId(row.name)"
              :name="row.name"
              type="text"
              :required="row.required"
              :value="values[row.name] || ''"
              @input="handleInput(row.name, $event)"
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

