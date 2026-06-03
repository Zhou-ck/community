<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">消息标题</text>
      <input class="form-input" :value="value.title" placeholder="最多15字节" maxlength="15" @input="update('title', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">消息内容</text>
      <textarea class="form-textarea" :value="value.description" placeholder="最多240字节" maxlength="240" @input="update('description', $event.detail.value)" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'MessageForm',
  props: {
    value: { type: Object, required: true }
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
