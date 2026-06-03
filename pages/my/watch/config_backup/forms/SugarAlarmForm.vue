<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">开启血糖报警</text>
      <switch :checked="value.open" @change="update('open', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">最低血糖值</text>
      <input class="form-input" type="number" :value="value.blood_sugar_low" placeholder="50-150" @input="update('blood_sugar_low', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">最高血糖值</text>
      <input class="form-input" type="number" :value="value.blood_sugar_high" placeholder="100-300" @input="update('blood_sugar_high', $event.detail.value)" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'SugarAlarmForm',
  props: {
    value: { type: Object, required: true }
  },
  methods: {
    update(key, val) {
      const numFields = ['blood_sugar_low', 'blood_sugar_high']
      const newVal = numFields.includes(key) ? (Number(val) || 0) : val
      this.$emit('input', { ...this.value, [key]: newVal })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
