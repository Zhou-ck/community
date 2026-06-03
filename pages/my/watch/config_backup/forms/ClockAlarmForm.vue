<template>
  <view class="form-content">
    <view class="divider">闹钟列表(最多5个)</view>
    <view v-for="(alarm, index) in value.alarms" :key="index" class="alarm-item">
      <view class="alarm-header">
        <text>闹钟{{ index + 1 }}</text>
        <text class="icon-delete" @click="removeAlarm(index)">×</text>
      </view>
      <view class="form-item">
        <text class="form-label">启用</text>
        <switch :checked="alarm.enabled" @change="updateAlarm(index, 'enabled', $event.detail.value)" />
      </view>
      <view class="form-item">
        <text class="form-label">时间</text>
        <picker mode="time" :value="alarm.time" @change="updateAlarm(index, 'time', $event.detail.value)">
          <view class="picker-item">{{ alarm.time }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">重复模式</text>
        <picker mode="selector" :range="repeatModes" range-key="label" :value="getRepeatModeIndex(alarm.repeatMode)" @change="onRepeatModeChange($event, index)">
          <view class="picker-item">{{ getRepeatModeLabel(alarm.repeatMode) }}</view>
        </picker>
      </view>
      <view v-if="alarm.repeatMode === 'custom'" class="form-item">
        <text class="form-label">重复日期</text>
        <view class="checkbox-group">
          <label v-for="day in weekDays" :key="day.value">
            <checkbox :value="day.value" :checked="alarm.days && alarm.days.includes(day.value)" @change="onDayChange($event, index)" />
            {{ day.label }}
          </label>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">标题</text>
        <input class="form-input" :value="alarm.title" placeholder="闹钟标题" maxlength="20" @input="updateAlarm(index, 'title', $event.detail.value)" />
      </view>
    </view>
    <button v-if="value.alarms && value.alarms.length < 5" class="btn-add" @click="addAlarm">添加闹钟</button>
  </view>
</template>

<script>
export default {
  name: 'ClockAlarmForm',
  props: {
    value: { type: Object, required: true }
  },
  data() {
    return {
      repeatModes: [
        { label: '只响一次', value: 'once' },
        { label: '周一至周五', value: 'weekdays' },
        { label: '每天', value: 'everyday' },
        { label: '自定义', value: 'custom' }
      ],
      weekDays: [
        { label: '周一', value: 'monday' },
        { label: '周二', value: 'tuesday' },
        { label: '周三', value: 'wednesday' },
        { label: '周四', value: 'thursday' },
        { label: '周五', value: 'friday' },
        { label: '周六', value: 'saturday' },
        { label: '周日', value: 'sunday' }
      ]
    }
  },
  methods: {
    updateAlarm(index, key, val) {
      const alarms = [...this.value.alarms]
      alarms[index] = { ...alarms[index], [key]: val }
      this.$emit('input', { ...this.value, alarms })
    },
    getRepeatModeIndex(mode) {
      return this.repeatModes.findIndex(item => item.value === mode)
    },
    getRepeatModeLabel(mode) {
      const item = this.repeatModes.find(item => item.value === mode)
      return item ? item.label : '自定义'
    },
    onRepeatModeChange(e, index) {
      const mode = this.repeatModes[e.detail.value].value
      const alarms = [...this.value.alarms]
      const today = new Date().getDay()
      const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      const todayName = dayMap[today]
      
      let days = alarms[index].days || []
      switch (mode) {
        case 'once':
          days = [todayName]
          break
        case 'weekdays':
          days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
          break
        case 'everyday':
          days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
          break
      }
      
      alarms[index] = { ...alarms[index], repeatMode: mode, days }
      this.$emit('input', { ...this.value, alarms })
    },
    onDayChange(e, index) {
      const alarms = [...this.value.alarms]
      const days = [...(alarms[index].days || [])]
      const dayValue = e.detail.value
      
      if (e.detail.checked) {
        if (!days.includes(dayValue)) days.push(dayValue)
      } else {
        const idx = days.indexOf(dayValue)
        if (idx > -1) days.splice(idx, 1)
      }
      
      alarms[index] = { ...alarms[index], days }
      this.$emit('input', { ...this.value, alarms })
    },
    addAlarm() {
      const alarms = [...(this.value.alarms || [])]
      if (alarms.length < 5) {
        const today = new Date().getDay()
        const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        alarms.push({
          time: '07:00',
          enabled: true,
          repeatMode: 'once',
          days: [dayMap[today]],
          title: ''
        })
        this.$emit('input', { ...this.value, alarms })
      }
    },
    removeAlarm(index) {
      const alarms = [...this.value.alarms]
      alarms.splice(index, 1)
      this.$emit('input', { ...this.value, alarms })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../formStyles.scss';
</style>
