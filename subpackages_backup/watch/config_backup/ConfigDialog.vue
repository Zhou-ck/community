<template>
  <uni-popup ref="popup" type="center" :mask-click="false" :animation="false">
    <view class="popup-container">
      <view class="popup-header">
        <text class="popup-title">{{ title }}</text>
        <text class="popup-close" @click="close">×</text>
      </view>
      <view class="popup-content">
        <!-- 使用 v-if 条件渲染替代动态组件 -->
        <SwitchForm v-if="formName === 'SwitchForm'" :value="formData" :label="formProps.label" :tip="formProps.tip" @input="onFormInput" />
        <RadioForm v-else-if="formName === 'RadioForm'" :value="formData" :label="formProps.label" :field="formProps.field" :options="formProps.options" @input="onFormInput" />
        <IntervalForm v-else-if="formName === 'IntervalForm'" :value="formData" :label="formProps.label" :tip="formProps.tip" @input="onFormInput" />
        <UserInfoForm v-else-if="formName === 'UserInfoForm'" :value="formData" @input="onFormInput" />
        <HrAlarmForm v-else-if="formName === 'HrAlarmForm'" :value="formData" @input="onFormInput" />
        <DynamicHrAlarmForm v-else-if="formName === 'DynamicHrAlarmForm'" :value="formData" @input="onFormInput" />
        <Spo2AlarmForm v-else-if="formName === 'Spo2AlarmForm'" :value="formData" @input="onFormInput" />
        <BpAlarmForm v-else-if="formName === 'BpAlarmForm'" :value="formData" @input="onFormInput" />
        <TemperatureAlarmForm v-else-if="formName === 'TemperatureAlarmForm'" :value="formData" @input="onFormInput" />
        <SugarAlarmForm v-else-if="formName === 'SugarAlarmForm'" :value="formData" @input="onFormInput" />
        <PotassiumAlarmForm v-else-if="formName === 'PotassiumAlarmForm'" :value="formData" @input="onFormInput" />
        <AutoAfForm v-else-if="formName === 'AutoAfForm'" :value="formData" @input="onFormInput" />
        <FallSensitivityForm v-else-if="formName === 'FallSensitivityForm'" :value="formData" @input="onFormInput" />
        <PhonebookForm v-else-if="formName === 'PhonebookForm'" :value="formData" @input="onFormInput" />
        <MessageForm v-else-if="formName === 'MessageForm'" :value="formData" @input="onFormInput" />
        <GoalForm v-else-if="formName === 'GoalForm'" :value="formData" @input="onFormInput" />
        <GpsLocateForm v-else-if="formName === 'GpsLocateForm'" :value="formData" @input="onFormInput" />
        <DataFreqForm v-else-if="formName === 'DataFreqForm'" :value="formData" @input="onFormInput" />
        <LocateDataUploadForm v-else-if="formName === 'LocateDataUploadForm'" :value="formData" @input="onFormInput" />
        <LanguageForm v-else-if="formName === 'LanguageForm'" :value="formData" @input="onFormInput" />
        <BpScheduleForm v-else-if="formName === 'BpScheduleForm'" :value="formData" @input="onFormInput" />
        <BpAdjustForm v-else-if="formName === 'BpAdjustForm'" :value="formData" @input="onFormInput" />
        <ClockAlarmForm v-else-if="formName === 'ClockAlarmForm'" :value="formData" @input="onFormInput" />
        <SedentaryForm v-else-if="formName === 'SedentaryForm'" :value="formData" @input="onFormInput" />
      </view>
      <view class="popup-footer">
        <button class="btn-cancel" @click="close">取消</button>
        <button class="btn-submit" @click="onSubmit" :loading="loading">确定</button>
      </view>
    </view>
  </uni-popup>
</template>

<script>
import SwitchForm from './forms/SwitchForm.vue'
import RadioForm from './forms/RadioForm.vue'
import IntervalForm from './forms/IntervalForm.vue'
import UserInfoForm from './forms/UserInfoForm.vue'
import HrAlarmForm from './forms/HrAlarmForm.vue'
import DynamicHrAlarmForm from './forms/DynamicHrAlarmForm.vue'
import Spo2AlarmForm from './forms/Spo2AlarmForm.vue'
import BpAlarmForm from './forms/BpAlarmForm.vue'
import TemperatureAlarmForm from './forms/TemperatureAlarmForm.vue'
import SugarAlarmForm from './forms/SugarAlarmForm.vue'
import PotassiumAlarmForm from './forms/PotassiumAlarmForm.vue'
import AutoAfForm from './forms/AutoAfForm.vue'
import FallSensitivityForm from './forms/FallSensitivityForm.vue'
import PhonebookForm from './forms/PhonebookForm.vue'
import MessageForm from './forms/MessageForm.vue'
import GoalForm from './forms/GoalForm.vue'
import GpsLocateForm from './forms/GpsLocateForm.vue'
import DataFreqForm from './forms/DataFreqForm.vue'
import LocateDataUploadForm from './forms/LocateDataUploadForm.vue'
import LanguageForm from './forms/LanguageForm.vue'
import BpScheduleForm from './forms/BpScheduleForm.vue'
import BpAdjustForm from './forms/BpAdjustForm.vue'
import ClockAlarmForm from './forms/ClockAlarmForm.vue'
import SedentaryForm from './forms/SedentaryForm.vue'

export default {
  name: 'ConfigDialog',
  components: {
    SwitchForm,
    RadioForm,
    IntervalForm,
    UserInfoForm,
    HrAlarmForm,
    DynamicHrAlarmForm,
    Spo2AlarmForm,
    BpAlarmForm,
    TemperatureAlarmForm,
    SugarAlarmForm,
    PotassiumAlarmForm,
    AutoAfForm,
    FallSensitivityForm,
    PhonebookForm,
    MessageForm,
    GoalForm,
    GpsLocateForm,
    DataFreqForm,
    LocateDataUploadForm,
    LanguageForm,
    BpScheduleForm,
    BpAdjustForm,
    ClockAlarmForm,
    SedentaryForm
  },
  props: {
    title: { type: String, default: '' },
    configType: { type: String, default: '' },
    formData: { type: Object, default: () => ({}) },
    formProps: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    formName: { type: String, default: '' }
  },
  methods: {
    open() {
      this.$refs.popup.open()
    },
    close() {
      this.$refs.popup.close()
      this.$emit('close')
    },
    onFormInput(val) {
      this.$emit('update:formData', val)
    },
    onSubmit() {
      this.$emit('submit')
    }
  }
}
</script>

<style scoped lang="scss">
.popup-container {
  width: 680rpx;
  max-height: 85vh;
  background: #fff;
  border-radius: 32rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
}

.popup-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx 32rpx 32rpx;
  position: relative;
  background: linear-gradient(135deg, #4dd9d9 0%, #3ec6c6 100%);
}

.popup-header .popup-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 2rpx;
}

.popup-header .popup-close {
  position: absolute;
  right: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
}

.popup-content {
  flex: 1;
  padding: 32rpx;
  max-height: 55vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #fafbfc;
}

.popup-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx 40rpx;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
}

.popup-footer .btn-cancel,
.popup-footer .btn-submit {
  flex: 1;
  height: 88rpx;
  border: none;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 2rpx;
}

.popup-footer .btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.popup-footer .btn-submit {
  background: linear-gradient(135deg, #4dd9d9 0%, #3ec6c6 100%);
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(62, 198, 198, 0.35);
}
</style>
