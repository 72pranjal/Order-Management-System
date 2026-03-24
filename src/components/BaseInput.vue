<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  as: {
    type: String,
    default: 'input',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

function updateValue(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <input
    v-if="as === 'input'"
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    class="input-control"
    @input="updateValue"
  />

  <select
    v-else-if="as === 'select'"
    :value="modelValue"
    class="input-control"
    @change="updateValue"
  >
    <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
  </select>

  <textarea
    v-else
    :value="modelValue"
    :placeholder="placeholder"
    class="input-control textarea-control"
    @input="updateValue"
  />
</template>
