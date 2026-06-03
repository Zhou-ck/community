<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">{{ label }}</text>
      <switch :checked="value.open" @change="update('open', $event.detail.value)" />
    </view>
    <view v-if="tip" class="form-tip">{{ tip }}</view>
  </view>
</template>

<script>
export default {
  name: 'SwitchForm',
  props: {
    value: { type: Object, required: true },
    label: { type: String, default: '开关' },
    tip: { type: String, default: '' }
  },
  methods: {
    update(key, val) {
      this.$emit('input', { ...this.value, [key]: val })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
