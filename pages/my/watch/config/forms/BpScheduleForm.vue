<template>
  <view class="form-content">
    <view class="divider">测量时间点(最多48个)</view>
    <view class="form-tip">设置血压测量的具体时间点，设备将在指定时间自动测量血压</view>
    <view v-for="(schedule, index) in value.schedules" :key="index" class="schedule-item">
      <view class="schedule-header">时间点{{ index + 1 }}</view>
      <picker mode="date" :value="getDate(schedule.datetime)" @change="onDateChange($event, index)">
        <view class="picker-item">
          <text>日期：{{ getDate(schedule.datetime) }}</text>
        </view>
      </picker>
      <picker mode="time" :value="getTime(schedule.datetime)" @change="onTimeChange($event, index)">
        <view class="picker-item">
          <text>时间：{{ getTime(schedule.datetime) }}</text>
        </view>
      </picker>
      <button class="btn-remove" @click="removeSchedule(index)">删除</button>
    </view>
    <button v-if="value.schedules && value.schedules.length < 48" class="btn-add" @click="addSchedule">添加时间点</button>
  </view>
</template>

<script>
export default {
  name: 'BpScheduleForm',
  props: {
    value: { type: Object, required: true }
  },
  methods: {
    getDate(datetime) {
      return datetime ? datetime.split(' ')[0] : ''
    },
    getTime(datetime) {
      return datetime ? datetime.split(' ')[1] : ''
    },
    onDateChange(e, index) {
      const schedules = [...this.value.schedules]
      const time = this.getTime(schedules[index].datetime) || '08:00:00'
      schedules[index] = { datetime: `${e.detail.value} ${time}` }
      this.$emit('input', { ...this.value, schedules })
    },
    onTimeChange(e, index) {
      const schedules = [...this.value.schedules]
      const date = this.getDate(schedules[index].datetime)
      schedules[index] = { datetime: `${date} ${e.detail.value}:00` }
      this.$emit('input', { ...this.value, schedules })
    },
    addSchedule() {
      const schedules = [...(this.value.schedules || [])]
      if (schedules.length < 48) {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        schedules.push({ datetime: `${year}-${month}-${day} 08:00:00` })
        this.$emit('input', { ...this.value, schedules })
      }
    },
    removeSchedule(index) {
      const schedules = [...this.value.schedules]
      schedules.splice(index, 1)
      this.$emit('input', { ...this.value, schedules })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
