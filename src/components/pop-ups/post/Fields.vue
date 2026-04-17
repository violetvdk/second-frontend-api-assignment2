<template>
  <div class="post-fields-wrapper">
    <p v-if="rows.length === 0">No fields found for this category.</p>
    <table v-else class="post-fields-table">
      <thead>
        <tr>
          <th>Field</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="`${row.required ? 'req' : 'opt'}-${row.name}`">
          <td>
            {{ row.name }}
            <span v-if="row.required" class="required-star"> *</span>
          </td>
          <td>
            <label :for="row.id" class="sr-only">{{ row.name }}</label>
            <input
              :id="row.id"
              :name="row.name"
              type="text"
              :required="row.required"
              :value="values[row.name] || ''"
              @input="(event) => onFieldChange(row.name, event.target.value)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  requiredFields: { type: Array, default: () => [] },
  optionalFields: { type: Array, default: () => [] },
  values: { type: Object, default: () => ({}) },
  onFieldChange: { type: Function, required: true }
})

const rows = computed(() => {
  const required = props.requiredFields.map((field) => ({
    name: String(field),
    required: true
  }))

  const optional = props.optionalFields.map((field) => ({
    name: String(field),
    required: false
  }))

  return [...required, ...optional].map((row) => ({
    ...row,
    id: `field-${row.name.toLowerCase().replace(/\s+/g, '-')}`
  }))
})
</script>
