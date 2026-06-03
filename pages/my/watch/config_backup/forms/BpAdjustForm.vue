<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">手表测量收缩压</text>
      <input class="form-input" type="number" :value="value.sbp_band" placeholder="60-200" @input="update('sbp_band', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">手表测量舒张压</text>
      <input class="form-input" type="number" :value="value.dbp_band" placeholder="40-120" @input="update('dbp_band', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">血压计测量收缩压</text>
      <input class="form-input" type="number" :value="value.sbp_meter" placeholder="60-200" @input="update('sbp_meter', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">血压计测量舒张压</text>
      <input class="form-input" type="number" :value="value.dbp_meter" placeholder="40-120" @input="update('dbp_meter', $event.detail.value)" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'BpAdjustForm',
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
