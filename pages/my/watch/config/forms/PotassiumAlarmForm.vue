<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">开启血钾报警</text>
      <switch :checked="value.open" @change="update('open', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">最低血钾值</text>
      <input class="form-input" type="number" :value="value.blood_potassium_low" placeholder="20-50" @input="update('blood_potassium_low', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">最高血钾值</text>
      <input class="form-input" type="number" :value="value.blood_potassium_high" placeholder="40-80" @input="update('blood_potassium_high', $event.detail.value)" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'PotassiumAlarmForm',
  props: {
    value: { type: Object, required: true }
  },
  methods: {
    update(key, val) {
      const numFields = ['blood_potassium_low', 'blood_potassium_high']
      const newVal = numFields.includes(key) ? (Number(val) || 0) : val
      this.$emit('input', { ...this.value, [key]: newVal })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
