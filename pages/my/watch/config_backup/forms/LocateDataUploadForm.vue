<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">数据自动上传</text>
      <switch :checked="value.data_auto_upload" @change="update('data_auto_upload', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">上传间隔(分钟)</text>
      <input class="form-input" type="number" :value="value.data_upload_interval" placeholder="1-1440" @input="update('data_upload_interval', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">自动定位</text>
      <switch :checked="value.auto_locate" @change="update('auto_locate', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">定位间隔(分钟)</text>
      <input class="form-input" type="number" :value="value.locate_interval_time" placeholder="1-1440" @input="update('locate_interval_time', $event.detail.value)" />
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
  name: 'LocateDataUploadForm',
  props: {
    value: { type: Object, required: true }
  },
  methods: {
    update(key, val) {
      const numFields = ['data_upload_interval', 'locate_interval_time', 'power_mode']
      const newVal = numFields.includes(key) ? (Number(val) || 0) : val
      this.$emit('input', { ...this.value, [key]: newVal })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
