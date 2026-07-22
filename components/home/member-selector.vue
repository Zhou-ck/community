<template>
  <view class="member-selector" @click="openPicker">
    <text class="name">{{ currentName || '请选择' }}</text>
    <uni-icons type="arrowdown" size="14" color="#666"></uni-icons>
  </view>
</template>

<script>
export default {
  name: 'MemberSelector',
  props: {
    currentName: { type: String, default: '' },
    members: { type: Array, default: () => [] }
  },
  methods: {
    openPicker() {
      if (!this.members || this.members.length === 0) {
        uni.showToast({ title: '暂无家庭成员', icon: 'none' })
        return
      }
      const names = this.members.map(m => m.memberName || '未命名')
      uni.showActionSheet({
        itemList: names,
        success: (res) => {
          const picked = this.members[res.tapIndex]
          this.$emit('change', picked)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.member-selector {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
  background: #f5f5f5;

  .name {
    font-size: 26rpx;
    color: #333;
    max-width: 240rpx;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>
