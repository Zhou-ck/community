<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">开启心率报警</text>
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
      <text class="form-label">异常次数阈值</text>
      <input class="form-input" type="number" :value="value.threshold" placeholder="1-10" @input="update('threshold', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">报警间隔(分钟)</text>
      <input class="form-input" type="number" :value="value.alarm_interval" placeholder="1-60" @input="update('alarm_interval', $event.detail.value)" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'HrAlarmForm',
  props: {
    value: { type: Object, required: true }
  },
  methods: {
    update(key, val) {
      const numFields = ['high', 'low', 'threshold', 'alarm_interval']
      const newVal = numFields.includes(key) ? (Number(val) || 0) : val
      this.$emit('input', { ...this.value, [key]: newVal })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
