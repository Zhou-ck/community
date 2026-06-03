<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">开启血氧报警</text>
      <switch :checked="value.open" @change="update('open', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">最低血氧值</text>
      <input class="form-input" type="number" :value="value.low" placeholder="50-100" @input="update('low', $event.detail.value)" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'Spo2AlarmForm',
  props: {
    value: { type: Object, required: true }
  },
  methods: {
    update(key, val) {
      const newVal = key === 'low' ? (Number(val) || 0) : val
      this.$emit('input', { ...this.value, [key]: newVal })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
