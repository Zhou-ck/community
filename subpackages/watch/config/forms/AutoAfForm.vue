<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">开启自动房颤</text>
      <switch :checked="value.open" @change="update('open', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">测量持续时间(秒)</text>
      <input class="form-input" type="number" :value="value.interval" placeholder="30-120" @input="update('interval', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">按心率间隔测量</text>
      <switch :checked="value.rri_single_time" @change="update('rri_single_time', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">RRI类型</text>
      <radio-group @change="update('rri_type', $event.detail.value)">
        <label><radio value="0" :checked="value.rri_type == 0" color="#3ec6c6" />普通RRI</label>
        <label><radio value="1" :checked="value.rri_type == 1" color="#3ec6c6" />心情RRI</label>
      </radio-group>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AutoAfForm',
  props: {
    value: { type: Object, required: true }
  },
  methods: {
    update(key, val) {
      let newVal = val
      if (key === 'interval' || key === 'rri_type') newVal = Number(val) || 0
      this.$emit('input', { ...this.value, [key]: newVal })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
