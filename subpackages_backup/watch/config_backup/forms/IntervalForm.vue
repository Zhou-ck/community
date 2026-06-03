<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">{{ label }}</text>
      <input 
        class="form-input" 
        type="number" 
        :value="value[field]" 
        :placeholder="placeholder"
        @input="update(field, $event.detail.value)"
      />
      <text v-if="tip" class="form-tip">{{ tip }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'IntervalForm',
  props: {
    value: { type: Object, required: true },
    label: { type: String, default: '间隔' },
    field: { type: String, default: 'interval' },
    placeholder: { type: String, default: '' },
    tip: { type: String, default: '' }
  },
  methods: {
    update(key, val) {
      this.$emit('input', { ...this.value, [key]: Number(val) || 0 })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
