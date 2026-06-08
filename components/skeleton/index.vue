<template>
  <view class="skeleton" :class="[`skeleton--${type}`, customClass]">
    <!-- card 变体：图片 + 标题 + 描述 -->
    <view v-if="type === 'card'" class="skeleton-card">
      <view class="skeleton-img" :style="imgStyle"></view>
      <view class="skeleton-body">
        <view class="skeleton-line skeleton-line--title" :style="{ width: titleWidth }"></view>
        <view class="skeleton-line" :style="{ width: descWidth }"></view>
        <view class="skeleton-line skeleton-line--short" :style="{ width: '60%' }"></view>
      </view>
    </view>

    <!-- list 变体：图标 + 多行文字 -->
    <view v-if="type === 'list'" class="skeleton-list">
      <view class="skeleton-avatar"></view>
      <view class="skeleton-body">
        <view class="skeleton-line skeleton-line--title" :style="{ width: titleWidth }"></view>
        <view class="skeleton-line"></view>
      </view>
    </view>

    <!-- chart 变体：大矩形块 -->
    <view v-if="type === 'chart'" class="skeleton-chart">
      <view class="skeleton-chart-block" :style="{ height: chartHeight }"></view>
      <view class="skeleton-chart-axis"></view>
    </view>

    <!-- text 变体：多行纯文字 -->
    <view v-if="type === 'text'" class="skeleton-text">
      <view
        v-for="i in rows"
        :key="i"
        class="skeleton-line"
        :class="{ 'skeleton-line--short': i === rows }"
        :style="{ width: i === rows ? '60%' : '100%' }"
      ></view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SkeletonLoader',
  props: {
    type: {
      type: String,
      default: 'card',
      validator: v => ['card', 'list', 'chart', 'text'].includes(v)
    },
    rows: {
      type: Number,
      default: 3
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: ''
    },
    titleWidth: {
      type: String,
      default: '70%'
    },
    descWidth: {
      type: String,
      default: '90%'
    },
    customClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    imgStyle() {
      const style = {}
      if (this.height) style.height = this.height
      return style
    },
    chartHeight() {
      return this.height || '300rpx'
    }
  }
}
</script>

<style lang="scss" scoped>
.skeleton {
  width: 100%;
  padding: 20rpx 0;
}

/* ===== shimmer 动画 ===== */
.skeleton-line,
.skeleton-avatar,
.skeleton-img,
.skeleton-chart-block {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e8e8e8 37%,
    #f0f0f0 63%
  );
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
  border-radius: 6rpx;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

/* ===== card ===== */
.skeleton-card {
  display: flex;
  gap: 20rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}

.skeleton-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.skeleton-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding-top: 8rpx;
}

.skeleton-line {
  height: 24rpx;
  border-radius: 6rpx;
}

.skeleton-line--title {
  height: 28rpx;
  border-radius: 6rpx;
}

.skeleton-line--short {
  height: 24rpx;
  border-radius: 6rpx;
}

/* ===== list ===== */
.skeleton-list {
  display: flex;
  gap: 20rpx;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}

.skeleton-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-list .skeleton-body {
  gap: 12rpx;
  padding-top: 0;
}

/* ===== chart ===== */
.skeleton-chart {
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}

.skeleton-chart-block {
  width: 100%;
  min-height: 200rpx;
  border-radius: 8rpx;
}

.skeleton-chart-axis {
  width: 80%;
  height: 16rpx;
  margin: 20rpx auto 0;
  background: #f0f0f0;
  border-radius: 4rpx;
}

/* ===== text ===== */
.skeleton-text {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}
</style>
