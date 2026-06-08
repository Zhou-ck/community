<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">{{ label }}</text>
      <radio-group @change="update(field, $event.detail.value)">
        <label v-for="opt in options" :key="String(opt.value)">
          <radio :value="String(opt.value)" :checked="String(value[field]) === String(opt.value)" color="#E07A4F" />
          {{ opt.label }}
        </label>
      </radio-group>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RadioForm',
  props: {
    value: { type: Object, required: true },
    label: { type: String, default: '选择' },
    field: { type: String, required: true },
    options: { type: Array, required: true }
  },
  methods: {
    update(key, val) {
      // 处理布尔值
      let parsedVal = val
      if (val === 'true') parsedVal = true
      else if (val === 'false') parsedVal = false
      else if (!isNaN(Number(val))) parsedVal = Number(val)
      
      this.$emit('input', { ...this.value, [key]: parsedVal })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
