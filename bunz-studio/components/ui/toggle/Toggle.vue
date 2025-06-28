<template>
  <button
    type="button"
    :class="[
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-color focus:ring-offset-2',
      modelValue ? 'bg-primary-color' : 'bg-gray-200',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    ]"
    :disabled="disabled"
    @click="toggle"
    :aria-pressed="modelValue"
    :aria-labelledby="labelId"
  >
    <span
      :class="[
        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-lg',
        modelValue ? 'translate-x-6' : 'translate-x-1'
      ]"
    />
  </button>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  labelId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const toggle = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>