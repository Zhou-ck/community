<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">开启温度报警</text>
      <switch :checked="value.open" @change="update('open', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">最高温度(°C)</text>
      <input class="form-input" type="digit" :value="value.high" placeholder="35-42" @input="update('high', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">最低温度(°C)</text>
      <input class="form-input" type="digit" :value="value.low" placeholder="34-40" @input="update('low', $event.detail.value)" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'TemperatureAlarmForm',
  props: {
    value: { type: Object, required: true }
  },
  methods: {
    update(key, val) {
      const numFields = ['high', 'low']
      const newVal = numFields.includes(key) ? (parseFloat(val) || 0) : val
      this.$emit('input', { ...this.value, [key]: newVal })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
