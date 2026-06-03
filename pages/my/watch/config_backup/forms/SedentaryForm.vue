<template>
  <view class="form-content">
    <view class="divider">久坐提醒列表(最多3个)</view>
    <view v-for="(sedentary, index) in value.sedentaries" :key="index" class="sedentary-item">
      <view class="sedentary-header">
        <text>提醒{{ index + 1 }}</text>
        <text class="icon-delete" @click="removeSedentary(index)">×</text>
      </view>
      <view class="form-item">
        <text class="form-label">重复日期</text>
        <view class="checkbox-group">
          <view 
            v-for="day in weekDays" 
            :key="day.value" 
            class="checkbox-item"
            @click="toggleDay(index, day.value)"
          >
            <view class="custom-checkbox" :class="{ checked: sedentary.days && sedentary.days.includes(day.value) }">
              <text v-if="sedentary.days && sedentary.days.includes(day.value)" class="check-icon">✓</text>
            </view>
            <text class="checkbox-label">{{ day.label }}</text>
          </view>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">开始时间</text>
        <picker mode="selector" :range="hourOptions" :value="getHourIndex(sedentary.timeRange[0])" @change="updateTime(index, 0, $event.detail.value)">
          <view class="picker-item">{{ sedentary.timeRange[0] }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">结束时间</text>
        <picker mode="selector" :range="hourOptions" :value="getHourIndex(sedentary.timeRange[1])" @change="updateTime(index, 1, $event.detail.value)">
          <view class="picker-item">{{ sedentary.timeRange[1] }}</view>
        </picker>
      </view>
      <view class="form-tip">只能选择整点时间（如：09:00、18:00）</view>
    </view>
    <button v-if="value.sedentaries && value.sedentaries.length < 3" class="btn-add" @click="addSedentary">添加久坐提醒</button>
  </view>
</template>

<script>
export default {
  name: 'SedentaryForm',
  props: {
    value: { type: Object, required: true }
  },
  data() {
    return {
      weekDays: [
        { label: '周一', value: 'monday' },
        { label: '周二', value: 'tuesday' },
        { label: '周三', value: 'wednesday' },
        { label: '周四', value: 'thursday' },
        { label: '周五', value: 'friday' },
        { label: '周六', value: 'saturday' },
        { label: '周日', value: 'sunday' }
      ],
      hourOptions: [
        '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
        '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
        '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
      ]
    }
  },
  methods: {
    getHourIndex(timeStr) {
      const idx = this.hourOptions.indexOf(timeStr)
      return idx >= 0 ? idx : 0
    },
    updateTime(index, timeIndex, pickerIndex) {
      const sedentaries = [...this.value.sedentaries]
      const timeRange = [...sedentaries[index].timeRange]
      timeRange[timeIndex] = this.hourOptions[pickerIndex]
      sedentaries[index] = { ...sedentaries[index], timeRange }
      this.$emit('input', { ...this.value, sedentaries })
    },
    toggleDay(index, dayValue) {
      const sedentaries = [...this.value.sedentaries]
      const days = [...(sedentaries[index].days || [])]
      
      const idx = days.indexOf(dayValue)
      if (idx > -1) {
        days.splice(idx, 1)
      } else {
        days.push(dayValue)
      }
      
      sedentaries[index] = { ...sedentaries[index], days }
      this.$emit('input', { ...this.value, sedentaries })
    },
    addSedentary() {
      const sedentaries = [...(this.value.sedentaries || [])]
      if (sedentaries.length < 3) {
        sedentaries.push({
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          timeRange: ['09:00', '18:00'],
          duration: 12,
          threshold: 40
        })
        this.$emit('input', { ...this.value, sedentaries })
      }
    },
    removeSedentary(index) {
      const sedentaries = [...this.value.sedentaries]
      sedentaries.splice(index, 1)
      this.$emit('input', { ...this.value, sedentaries })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.checkbox-item {
  display: flex;
  align-items: center;
  padding: 12rpx 16rpx;
  background: #f5f6fa;
  border-radius: 8rpx;
}

.custom-checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #ddd;
  border-radius: 6rpx;
  margin-right: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.custom-checkbox.checked {
  background: #3ec6c6;
  border-color: #3ec6c6;
}

.check-icon {
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
}

.checkbox-label {
  font-size: 26rpx;
  color: #333;
}
</style>
