<template>
  <view class="form-content">
    <view class="form-item">
      <text class="form-label">陌生来电拦截</text>
      <radio-group @change="update('forbid', $event.detail.value)">
        <label><radio value="1" :checked="value.forbid == 1" color="#E07A4F" />拦截</label>
        <label><radio value="2" :checked="value.forbid == 2" color="#E07A4F" />不拦截</label>
      </radio-group>
    </view>
    <view class="divider">联系人列表</view>
    <view v-for="(item, index) in value.phone_book" :key="index" class="phone-item">
      <view class="phone-header">联系人{{ index + 1 }}</view>
      <view class="form-item">
        <text class="form-label">姓名</text>
        <input class="form-input" :value="item.name" placeholder="请输入姓名" @input="updatePhone(index, 'name', $event.detail.value)" />
      </view>
      <view class="form-item">
        <text class="form-label">电话</text>
        <input class="form-input" :value="item.number" placeholder="请输入电话" @input="updatePhone(index, 'number', $event.detail.value)" />
      </view>
      <view class="form-item">
        <text class="form-label">SOS</text>
        <switch :checked="item.sos" @change="updatePhone(index, 'sos', $event.detail.value)" />
      </view>
      <button class="btn-remove" @click="removePhone(index)">删除</button>
    </view>
    <button v-if="value.phone_book && value.phone_book.length < 8" class="btn-add" @click="addPhone">添加联系人</button>
  </view>
</template>

<script>
export default {
  name: 'PhonebookForm',
  props: {
    value: { type: Object, required: true }
  },
  methods: {
    update(key, val) {
      const newVal = key === 'forbid' ? Number(val) : val
      this.$emit('input', { ...this.value, [key]: newVal })
    },
    updatePhone(index, key, val) {
      const phoneBook = [...this.value.phone_book]
      phoneBook[index] = { ...phoneBook[index], [key]: val }
      this.$emit('input', { ...this.value, phone_book: phoneBook })
    },
    addPhone() {
      const phoneBook = [...(this.value.phone_book || [])]
      if (phoneBook.length < 8) {
        phoneBook.push({ name: '', number: '', sos: false })
        this.$emit('input', { ...this.value, phone_book: phoneBook })
      }
    },
    removePhone(index) {
      const phoneBook = [...this.value.phone_book]
      phoneBook.splice(index, 1)
      this.$emit('input', { ...this.value, phone_book: phoneBook })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
