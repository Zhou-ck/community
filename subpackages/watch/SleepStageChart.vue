<template>
  <view class="sleep-stage-chart">
    <!-- 睡眠信息展示 -->
    <view class="sleep-info" v-if="touchValue.sleepStateText">
      <view class="info-box" :style="{ backgroundColor: colors[touchValue.sleepState] }">
        <text class="time-text">{{ touchValue.startTime }} ~ {{ touchValue.endTime }}</text>
        <text class="state-text">睡眠状态：{{ touchValue.sleepStateText }}</text>
      </view>
    </view>
    <view class="sleep-info" v-else>
      <view class="info-box" style="background-color: #409eff">
        <text class="time-text">{{ formatDisplayTime(sleepStartTime) }} ~ {{ formatDisplayTime(sleepEndTime) }}</text>
        <text class="state-text">总睡眠时间</text>
      </view>
    </view>

    <!-- 图表区域（纯view实现） -->
    <view class="chart-area" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
      <!-- 4个层级行 -->
      <view class="chart-row" v-for="(rowState, rowIdx) in [0,1,2,3]" :key="rowIdx">
        <view 
          v-for="(item, idx) in sleepData" 
          :key="idx"
          class="chart-block"
          :class="{ highlight: currentSegmentIdx === idx }"
          :style="{
            width: item.widthPercent + '%',
            backgroundColor: item.state === rowState ? colors[item.state] : 'transparent',
            borderRadius: item.state === rowState ? '4rpx' : '0'
          }"
        ></view>
      </view>
      <!-- 高亮指示列 -->
      <view 
        v-if="currentSegmentIdx >= 0 && sleepData[currentSegmentIdx]"
        class="indicator-col"
        :style="{
          left: indicatorLeft + '%',
          width: indicatorWidth + '%',
          backgroundColor: getIndicatorColor(sleepData[currentSegmentIdx].state)
        }"
      ></view>
    </view>

    <!-- 睡眠统计信息 -->
    <view class="sleep-stats">
      <view class="stat-item" v-for="(statusName, index) in statusNames" :key="index">
        <view class="color-dot" :style="{ backgroundColor: colors[index] }"></view>
        <text class="label">{{ statusName }}:</text>
        <text class="time">{{ calculateDuration(index) }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    sections: {
      type: Array,
      required: true,
      default: () => []
    },
    sleepStartTime: {
      type: String,
      default: ''
    },
    sleepEndTime: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      typeToState: {
        6: 0,
        7: 1,
        4: 2,
        3: 3
      },
      colors: ['#fac858', '#ee6666', '#91cc75', '#5470c6'],
      statusNames: ['清醒', '快速眼动', '浅睡', '深睡'],
      sleepData: [],
      touchValue: {},
      currentSegmentIdx: -1,
      indicatorLeft: 0,
      indicatorWidth: 0,
      chartLeft: 0,
      chartWidth: 0
    }
  },
  watch: {
    sections: {
      handler() {
        this.formatSleepData()
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.measureChart()
      }, 200)
    })
  },
  methods: {
    measureChart() {
      const query = uni.createSelectorQuery().in(this)
      query.select('.chart-area').boundingClientRect(data => {
        if (data) {
          this.chartLeft = data.left
          this.chartWidth = data.width
        }
      }).exec()
    },

    formatSleepData() {
      if (!this.sections || this.sections.length === 0) {
        this.sleepData = []
        return
      }

      this.touchValue = {}
      this.currentSegmentIdx = -1

      const parsed = this.sections.map(section => {
        const startTime = new Date(section.start.replace(' ', 'T'))
        const endTime = new Date(section.end.replace(' ', 'T'))
        const state = this.typeToState[section.type] !== undefined ? this.typeToState[section.type] : 1
        const duration = endTime.getTime() - startTime.getTime()
        return {
          startTimestamp: startTime.getTime(),
          endTimestamp: endTime.getTime(),
          duration,
          state,
          type: section.type,
          startTime: section.start,
          endTime: section.end
        }
      })

      const totalDuration = parsed.reduce((sum, d) => sum + d.duration, 0)
      if (totalDuration <= 0) {
        this.sleepData = []
        return
      }

      // 计算每段的百分比宽度和累计偏移
      let accPercent = 0
      this.sleepData = parsed.map(item => {
        const pct = (item.duration / totalDuration) * 100
        const left = accPercent
        accPercent += pct
        return {
          ...item,
          widthPercent: pct,
          leftPercent: left
        }
      })
    },

    onTouchStart(e) {
      if (e.touches && e.touches.length > 0) {
        this.handleTouch(e.touches[0].clientX)
      }
    },
    onTouchMove(e) {
      if (e.touches && e.touches.length > 0) {
        this.handleTouch(e.touches[0].clientX)
      }
    },
    onTouchEnd() {},

    handleTouch(clientX) {
      if (!this.chartWidth) {
        this.measureChart()
        return
      }
      const touchPercent = ((clientX - this.chartLeft) / this.chartWidth) * 100

      let found = false
      for (let i = 0; i < this.sleepData.length; i++) {
        const item = this.sleepData[i]
        if (touchPercent >= item.leftPercent && touchPercent <= item.leftPercent + item.widthPercent) {
          this.currentSegmentIdx = i
          this.indicatorLeft = item.leftPercent
          this.indicatorWidth = item.widthPercent
          this.touchValue = {
            startTime: this.formatTime(item.startTime),
            endTime: this.formatTime(item.endTime),
            sleepState: item.state,
            sleepStateText: this.statusNames[item.state]
          }
          found = true
          break
        }
      }

      if (!found) {
        this.currentSegmentIdx = -1
        this.touchValue = {}
      }
    },

    formatTime(timeStr) {
      if (!timeStr) return ''
      const parts = timeStr.split(' ')
      return parts.length > 1 ? parts[1] : timeStr
    },

    formatDisplayTime(timeStr) {
      if (!timeStr) return ''
      const parts = timeStr.split(' ')
      if (parts.length > 1) {
        return parts[1].substring(0, 5)
      }
      return timeStr
    },

    calculateDuration(state) {
      const total = this.sleepData.reduce((acc, curr) => {
        if (curr.state === state) {
          return acc + curr.duration
        }
        return acc
      }, 0)
      const hours = Math.floor(total / 3600000)
      const minutes = Math.floor((total % 3600000) / 60000)
      if (hours > 0) {
        return `${hours}小时${minutes}分钟`
      }
      return `${minutes}分钟`
    },

    getIndicatorColor(state) {
      const hex = this.colors[state]
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, 0.2)`
    }
  }
}
</script>

<style lang="scss" scoped>
.sleep-stage-chart {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
}

.sleep-info {
  text-align: center;
  margin-bottom: 32rpx;
}

.info-box {
  padding: 24rpx 32rpx;
  border-radius: 32rpx;
  display: inline-block;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.time-text {
  display: block;
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.state-text {
  color: #fff;
  font-size: 24rpx;
}

/* 图表区域 */
.chart-area {
  position: relative;
  width: 100%;
  margin-bottom: 32rpx;
  padding: 16rpx 0;
}

.chart-row {
  display: flex;
  width: 100%;
  height: 50rpx;
  margin-bottom: 6rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.chart-block {
  height: 100%;
  flex-shrink: 0;
  transition: opacity 0.15s;
  
  &.highlight {
    opacity: 0.85;
  }
}

.indicator-col {
  position: absolute;
  top: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

/* 睡眠统计 */
.sleep-stats {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 16rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #f5f7fa;
  border-radius: 24rpx;
}

.color-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.label {
  font-size: 24rpx;
  color: #666;
  margin-right: 8rpx;
  white-space: nowrap;
}

.time {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}
</style>