<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">语言</text>
      <picker mode="selector" :range="languageOptions" range-key="label" :value="languageIndex" @change="onLanguageChange">
        <view class="picker-item">
          <text>{{ languageOptions[languageIndex].label }}</text>
        </view>
      </picker>
    </view>
  </view>
</template>

<script>
export default {
  name: 'LanguageForm',
  props: {
    value: { type: Object, required: true }
  },
  data() {
    return {
      languageOptions: [
        { label: '中文', value: 1 },
        { label: '英文', value: 2 }
      ]
    }
  },
  computed: {
    languageIndex() {
      const idx = this.languageOptions.findIndex(item => item.value === this.value.language)
      return idx === -1 ? 0 : idx
    }
  },
  methods: {
    onLanguageChange(e) {
      const language = this.languageOptions[e.detail.value].value
      this.$emit('input', { ...this.value, language })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
