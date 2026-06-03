// 配置分组定义
export const configSections = [
  {
    title: '基础设置',
    items: [
      { key: 'userinfo', label: '下发用户设置', type: 'primary', form: 'UserInfoForm' },
      { key: 'datasync', label: '数据一键同步', type: 'primary', confirm: '确定要同步设备数据吗？' },
      { key: 'status', label: '查看设备状态', type: 'primary', isGet: true },
      { key: 'factoryReset', label: '恢复出厂设置', type: 'danger', confirm: '确定要恢复出厂设置吗？此操作将清除所有数据，不可恢复！' }
    ]
  },
  {
    title: '定位设置',
    items: [
      { key: 'realtimeLocation', label: '实时定位', type: 'success', confirm: '确定要获取实时定位吗？' },
      { key: 'gps_locate', label: 'GPS定位设置', type: 'success', form: 'GpsLocateForm' },
      { key: 'datafreq', label: '数据上传间隔', type: 'success', form: 'DataFreqForm' },
      { key: 'locate_dataupload_freq', label: '定位数据上传间隔', type: 'success', form: 'LocateDataUploadForm' }
    ]
  },
  {
    title: '安全报警',
    items: [
      { key: 'fallcheck', label: '跌倒检测开关', type: 'warning', form: 'SwitchForm', formProps: { label: '跌倒检测' } },
      { key: 'fallcheck_sensitivity', label: '跌倒检测灵敏度', type: 'warning', form: 'FallSensitivityForm' }
    ]
  },
  {
    title: '健康报警',
    items: [
      { key: 'hralarm', label: '心率报警', type: 'warning', form: 'HrAlarmForm' },
      { key: 'dynamic_hralarm', label: '动态心率报警', type: 'warning', form: 'DynamicHrAlarmForm' },
      { key: 'spo2alarm', label: '血氧报警', type: 'warning', form: 'Spo2AlarmForm' },
      { key: 'bpalarm', label: '血压报警', type: 'warning', form: 'BpAlarmForm' },
      { key: 'temperature_alarm', label: '温度报警', type: 'warning', form: 'TemperatureAlarmForm' },
      { key: 'sugaralarm', label: '血糖报警', type: 'warning', form: 'SugarAlarmForm' },
      { key: 'potassiumalarm', label: '血钾报警', type: 'warning', form: 'PotassiumAlarmForm' },
      { key: 'autoaf', label: '自动房颤', type: 'warning', form: 'AutoAfForm' }
    ]
  },
  {
    title: '通讯录管理',
    items: [
      { key: 'phonebook', label: '下发通讯录', type: 'info', form: 'PhonebookForm' },
      { key: 'phonebookClear', label: '清空通讯录', type: 'danger', confirm: '确定要清空通讯录吗？此操作不可恢复！' }
    ]
  },
  {
    title: '提醒设置',
    items: [
      { key: 'clockalarm', label: '设置闹钟', type: 'info', form: 'ClockAlarmForm' },
      { key: 'clockalarmClear', label: '清除闹钟', type: 'danger', confirm: '确定要清除所有闹钟吗？' },
      { key: 'sedentary', label: '设置久坐提醒', type: 'info', form: 'SedentaryForm' },
      { key: 'sedentaryClear', label: '清除久坐提醒', type: 'danger', confirm: '确定要清除所有久坐提醒吗？' }
    ]
  },
  {
    title: '显示设置',
    items: [
      { key: 'lcdgesture', label: '翻腕亮屏', type: 'info', form: 'SwitchForm', formProps: { label: '翻腕亮屏' } },
      { key: 'timeformat', label: '时间格式', type: 'info', form: 'RadioForm', formProps: { label: '时间格式', field: 'hour_format', options: [{ label: '24小时制', value: 0 }, { label: '12小时制', value: 1 }] } },
      { key: 'dateformat', label: '日期格式', type: 'info', form: 'RadioForm', formProps: { label: '日期格式', field: 'date_format', options: [{ label: '月/日', value: 0 }, { label: '日/月', value: 1 }] } },
      { key: 'language', label: '语言设置', type: 'info', form: 'LanguageForm' }
    ]
  },
  {
    title: '单位设置',
    items: [
      { key: 'distanceunit', label: '距离单位', type: 'info', form: 'RadioForm', formProps: { label: '距离单位', field: 'distance_unit', options: [{ label: '公制', value: 0 }, { label: '英制', value: 1 }] } },
      { key: 'temperatureunit', label: '温度单位', type: 'info', form: 'RadioForm', formProps: { label: '温度单位', field: 'temperature_unit', options: [{ label: '摄氏度', value: 0 }, { label: '华氏度', value: 1 }] } }
    ]
  },
  {
    title: '运动健康',
    items: [
      { key: 'goal', label: '目标设置', type: 'success', form: 'GoalForm' },
      { key: 'wearhand', label: '佩戴手设置', type: 'success', form: 'RadioForm', formProps: { label: '佩戴手', field: 'right', options: [{ label: '左手', value: false }, { label: '右手', value: true }] } }
    ]
  },
  {
    title: '测量设置',
    items: [
      { key: 'hr_measure_interval', label: '心率测量间隔', type: 'success', form: 'IntervalForm', formProps: { label: '测量间隔(分钟)', field: 'interval', placeholder: '1-60' } },
      { key: 'other_measure_interval', label: '其他测量间隔', type: 'success', form: 'IntervalForm', formProps: { label: '测量间隔(分钟)', field: 'interval', placeholder: '5-60', tip: '最小5分钟' } },
      { key: 'bp_measure_schedule', label: '血压测量计划', type: 'success', form: 'BpScheduleForm' },
      { key: 'bpadjust', label: '血压校准', type: 'success', form: 'BpAdjustForm' }
    ]
  },
  {
    title: '其他功能',
    items: [
      { key: 'message', label: '发送消息', type: 'primary', form: 'MessageForm' }
    ]
  }
]


// API映射
export const apiMap = {
  userinfo: '/api/iwown/device/userinfo',
  fallcheck: '/api/iwown/device/fallcheck',
  fallcheck_sensitivity: '/api/iwown/device/fallcheck/sensitivity',
  hralarm: '/api/iwown/device/hralarm',
  dynamic_hralarm: '/api/iwown/device/dynamic/hralarm',
  spo2alarm: '/api/iwown/device/spo2alarm',
  bpalarm: '/api/iwown/device/bpalarm',
  temperature_alarm: '/api/iwown/device/temperature/alarm',
  sugaralarm: '/api/iwown/device/sugaralarm',
  potassiumalarm: '/api/iwown/device/potassiumalarm',
  autoaf: '/api/iwown/device/autoaf',
  phonebook: '/api/iwown/device/phonebook/sync',
  phonebookClear: '/api/iwown/device/phonebook/clear',
  message: '/api/iwown/device/message',
  goal: '/api/iwown/device/goal',
  gps_locate: '/api/iwown/device/gps/locate',
  datafreq: '/api/iwown/device/datafreq',
  locate_dataupload_freq: '/api/iwown/device/locate/dataupload/freq',
  lcdgesture: '/api/iwown/device/lcdgesture',
  timeformat: '/api/iwown/device/timeformat',
  dateformat: '/api/iwown/device/dateformat',
  language: '/api/iwown/device/language/set',
  distanceunit: '/api/iwown/device/distanceunit',
  temperatureunit: '/api/iwown/device/temperatureunit',
  wearhand: '/api/iwown/device/wearhand',
  hr_measure_interval: '/api/iwown/device/measure/interval/hr',
  other_measure_interval: '/api/iwown/device/measure/interval/other',
  bp_measure_schedule: '/api/iwown/device/bp/measure/schedule',
  bpadjust: '/api/iwown/device/bpadjust',
  clockalarm: '/api/iwown/device/clockalarm/set',
  clockalarmClear: '/api/iwown/device/clockalarm/clear',
  sedentary: '/api/iwown/device/sedentary/set',
  sedentaryClear: '/api/iwown/device/sedentary/clear',
  datasync: '/api/iwown/device/datasync',
  status: '/api/iwown/device/status',
  realtimeLocation: '/api/iwown/device/realtime/location',
  factoryReset: '/api/iwown/device/factory/reset'
}

// 默认表单数据
export const defaultFormData = {
  userinfo: { age: 30, height: 170, weight: 65, gender: 1, wrist_circle: 150, hypertension: 2 },
  fallcheck: { open: true },
  fallcheck_sensitivity: { fall_threshold: 14000 },
  hralarm: { open: true, high: 120, low: 60, threshold: 3, alarm_interval: 5 },
  dynamic_hralarm: { open: true, high: 150, low: 50, timeout: 60, interval: 5 },
  spo2alarm: { open: true, low: 90 },
  bpalarm: { open: true, sbp_high: 140, sbp_below: 90, dbp_high: 90, dbp_below: 60 },
  temperature_alarm: { open: true, high: 37.5, low: 36.0 },
  sugaralarm: { open: true, blood_sugar_low: 70, blood_sugar_high: 140 },
  potassiumalarm: { open: true, blood_potassium_low: 35, blood_potassium_high: 55 },
  autoaf: { open: true, interval: 60, rri_single_time: false, rri_type: 0 },
  phonebook: { forbid: 1, phone_book: [{ name: '', number: '', sos: true }] },
  message: { title: '', description: '' },
  goal: { step: 10000, distance: 8000, calorie: 300 },
  gps_locate: { gps_auto_check: true, gps_interval_time: 30, run_gps: true },
  datafreq: { gps_auto_check: true, gps_interval_time: 30, power_mode: 0 },
  locate_dataupload_freq: { data_auto_upload: true, data_upload_interval: 30, auto_locate: true, locate_interval_time: 30, power_mode: 0 },
  lcdgesture: { open: true, start_hour: 0, end_hour: 24 },
  timeformat: { hour_format: 0 },
  dateformat: { date_format: 0 },
  language: { language: 1 },
  distanceunit: { distance_unit: 0 },
  temperatureunit: { temperature_unit: 0 },
  wearhand: { right: false },
  hr_measure_interval: { interval: 5 },
  other_measure_interval: { interval: 10 },
  bp_measure_schedule: { schedules: [] },
  bpadjust: { sbp_band: 120, dbp_band: 80, sbp_meter: 125, dbp_meter: 82 },
  clockalarm: { alarms: [] },
  sedentary: { sedentaries: [] }
}

// 配置标题映射
export const configTitles = {
  userinfo: '下发用户设置',
  fallcheck: '跌倒检测开关',
  fallcheck_sensitivity: '跌倒检测灵敏度',
  hralarm: '心率报警设置',
  dynamic_hralarm: '动态心率报警设置',
  spo2alarm: '血氧报警设置',
  bpalarm: '血压报警设置',
  temperature_alarm: '温度报警设置',
  sugaralarm: '血糖报警设置',
  potassiumalarm: '血钾报警设置',
  autoaf: '自动房颤设置',
  phonebook: '下发通讯录',
  message: '发送设备消息',
  goal: '目标设置',
  gps_locate: 'GPS定位设置',
  datafreq: '数据上传间隔设置',
  locate_dataupload_freq: '定位数据上传间隔设置',
  lcdgesture: '翻腕亮屏设置',
  timeformat: '时间格式设置',
  dateformat: '日期格式设置',
  language: '语言设置',
  distanceunit: '距离单位设置',
  temperatureunit: '温度单位设置',
  wearhand: '佩戴手设置',
  hr_measure_interval: '心率测量间隔设置',
  other_measure_interval: '其他测量间隔设置',
  bp_measure_schedule: '血压测量计划设置',
  bpadjust: '血压校准设置',
  clockalarm: '设置闹钟',
  sedentary: '设置久坐提醒'
}
