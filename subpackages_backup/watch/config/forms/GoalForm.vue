<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">目标步数</text>
      <input class="form-input" type="number" :value="value.step" placeholder="1000-50000" @input="update('step', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">目标距离(米)</text>
      <input class="form-input" type="number" :value="value.distance" placeholder="500-50000" @input="update('distance', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">目标卡路里(千卡)</text>
      <input class="form-input" type="number" :value="value.calorie" placeholder="100-5000" @input="update('calorie', $event.detail.value)" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'GoalForm',
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
