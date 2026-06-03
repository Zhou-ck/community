<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">GPS自动定位</text>
      <switch :checked="value.gps_auto_check" @change="update('gps_auto_check', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">定位间隔(分钟)</text>
      <input class="form-input" type="number" :value="value.gps_interval_time" placeholder="1-1440" @input="update('gps_interval_time', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">每次GPS定位</text>
      <switch :checked="value.run_gps" @change="update('run_gps', $event.detail.value)" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'GpsLocateForm',
  props: {
    value: { type: Object, required: true }
  },
  methods: {
    update(key, val) {
      const newVal = key === 'gps_interval_time' ? (Number(val) || 0) : val
      this.$emit('input', { ...this.value, [key]: newVal })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
