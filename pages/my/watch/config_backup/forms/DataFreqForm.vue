<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">数据上传开关</text>
      <switch :checked="value.gps_auto_check" @change="update('gps_auto_check', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">上传间隔(分钟)</text>
      <input class="form-input" type="number" :value="value.gps_interval_time" placeholder="1-1440" @input="update('gps_interval_time', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">省电模式</text>
      <radio-group @change="update('power_mode', $event.detail.value)">
        <label><radio value="0" :checked="value.power_mode == 0" color="#3ec6c6" />正常</label>
        <label><radio value="1" :checked="value.power_mode == 1" color="#3ec6c6" />省电</label>
      </radio-group>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DataFreqForm',
  props: {
    value: { type: Object, required: true }
  },
  methods: {
    update(key, val) {
      const numFields = ['gps_interval_time', 'power_mode']
      const newVal = numFields.includes(key) ? (Number(val) || 0) : val
      this.$emit('input', { ...this.value, [key]: newVal })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
