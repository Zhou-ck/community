<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">开启动态心率报警</text>
      <switch :checked="value.open" @change="update('open', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">最高心率</text>
      <input class="form-input" type="number" :value="value.high" placeholder="60-200" @input="update('high', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">最低心率</text>
      <input class="form-input" type="number" :value="value.low" placeholder="30-100" @input="update('low', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">异常时长(秒)</text>
      <input class="form-input" type="number" :value="value.timeout" placeholder="10-300" @input="update('timeout', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">报警间隔(分钟)</text>
      <input class="form-input" type="number" :value="value.interval" placeholder="1-60" @input="update('interval', $event.detail.value)" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'DynamicHrAlarmForm',
  props: {
    value: { type: Object, required: true }
  },
  methods: {
    update(key, val) {
      const numFields = ['high', 'low', 'timeout', 'interval']
      const newVal = numFields.includes(key) ? (Number(val) || 0) : val
      this.$emit('input', { ...this.value, [key]: newVal })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
