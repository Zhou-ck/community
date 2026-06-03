<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">开启血压报警</text>
      <switch :checked="value.open" @change="update('open', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">高压最高值</text>
      <input class="form-input" type="number" :value="value.sbp_high" placeholder="90-200" @input="update('sbp_high', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">高压最低值</text>
      <input class="form-input" type="number" :value="value.sbp_below" placeholder="60-150" @input="update('sbp_below', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">低压最高值</text>
      <input class="form-input" type="number" :value="value.dbp_high" placeholder="60-120" @input="update('dbp_high', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">低压最低值</text>
      <input class="form-input" type="number" :value="value.dbp_below" placeholder="40-100" @input="update('dbp_below', $event.detail.value)" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'BpAlarmForm',
  props: {
    value: { type: Object, required: true }
  },
  methods: {
    update(key, val) {
      const numFields = ['sbp_high', 'sbp_below', 'dbp_high', 'dbp_below']
      const newVal = numFields.includes(key) ? (Number(val) || 0) : val
      this.$emit('input', { ...this.value, [key]: newVal })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
