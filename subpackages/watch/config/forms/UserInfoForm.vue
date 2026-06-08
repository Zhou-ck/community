<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">年龄</text>
      <input class="form-input" type="number" :value="value.age" placeholder="请输入年龄" @input="update('age', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">身高(cm)</text>
      <input class="form-input" type="number" :value="value.height" placeholder="请输入身高" @input="update('height', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">体重(kg)</text>
      <input class="form-input" type="number" :value="value.weight" placeholder="请输入体重" @input="update('weight', $event.detail.value)" />
    </view>
    <view class="form-item">
      <text class="form-label">性别</text>
      <radio-group @change="update('gender', $event.detail.value)">
        <label><radio value="1" :checked="value.gender == 1" color="#E07A4F" />男</label>
        <label><radio value="2" :checked="value.gender == 2" color="#E07A4F" />女</label>
      </radio-group>
    </view>
    <view class="form-item">
      <text class="form-label">腕围(mm)</text>
      <input class="form-input" type="number" :value="value.wrist_circle" placeholder="80-230" @input="update('wrist_circle', $event.detail.value)" />
      <text class="form-tip">范围80-230毫米，可选</text>
    </view>
    <view class="form-item">
      <text class="form-label">高血压史</text>
      <radio-group @change="update('hypertension', $event.detail.value)">
        <label><radio value="1" :checked="value.hypertension == 1" color="#E07A4F" />有</label>
        <label><radio value="2" :checked="value.hypertension == 2" color="#E07A4F" />没有</label>
      </radio-group>
    </view>
  </view>
</template>

<script>
export default {
  name: 'UserInfoForm',
  props: {
    value: { type: Object, required: true }
  },
  methods: {
    update(key, val) {
      const numVal = ['age', 'height', 'weight', 'wrist_circle', 'gender', 'hypertension'].includes(key) 
        ? (Number(val) || 0) 
        : val
      this.$emit('input', { ...this.value, [key]: numVal })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
