<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">灵敏度阈值</text>
      <input class="form-input" type="number" :value="value.fall_threshold" placeholder="默认14000" @input="update('fall_threshold', $event.detail.value)" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'FallSensitivityForm',
  props: {
    value: { type: Object, required: true }
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
