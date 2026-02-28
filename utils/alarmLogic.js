/**
 * 报警通知逻辑工具函数
 * 规则：取交集（AND逻辑），设备配置和接警人配置都开启才发送
 */

/**
 * 判断是否应该发送通知（取交集）
 * @param {string} alarmType - 报警类型标识（如 "运动"、"跌倒"、"存在"等）
 * @param {string} notifyMethod - 通知方式（'phone'、'sms'、'wechat'）
 * @param {object} device - 设备信息
 * @param {string} device.defenseStatus - 设备布防状态 '1'=开启 '2'=关闭
 * @param {string} device.alarmSwitch - 报警配置JSON字符串
 * @param {object} receiver - 接警人信息
 * @param {string} receiver.phoneNotifySwitch - 电话通知开关 '1'=开启 '2'=关闭
 * @param {string} receiver.smsNotifySwitch - 短信通知开关 '1'=开启 '2'=关闭
 * @param {string} receiver.wechatNotifySwitch - 微信通知开关 '1'=开启 '2'=关闭
 * @returns {object} { shouldSend: boolean, reason: string }
 */
export function shouldSendNotification(alarmType, notifyMethod, device, receiver) {
  // 第1层：设备布防总开关
  if (!device || device.defenseStatus !== '1') {
    return {
      shouldSend: false,
      reason: '设备未布防'
    }
  }
  
  // 第2层：解析设备的报警配置
  let alarmSwitches = []
  try {
    alarmSwitches = JSON.parse(device.alarmSwitch || '[]')
  } catch (e) {
    console.error('解析报警配置失败:', e)
    return {
      shouldSend: false,
      reason: '报警配置解析失败'
    }
  }
  
  // 第3层：查找该报警类型的配置
  const alarmConfig = alarmSwitches.find(a => a.identifier === alarmType)
  if (!alarmConfig) {
    return {
      shouldSend: false,
      reason: `未找到报警类型 ${alarmType} 的配置`
    }
  }
  
  // 第4层：检查该报警类型是否开启
  if (!alarmConfig.open) {
    return {
      shouldSend: false,
      reason: `报警类型 ${alarmType} 未开启`
    }
  }
  
  // 第5层：检查该报警类型的通知方式是否开启（设备层面）
  const methodKey = `${notifyMethod}Alarm` // phoneAlarm/smsAlarm/wechatAlarm
  const deviceAllows = alarmConfig[methodKey] === true
  
  if (!deviceAllows) {
    return {
      shouldSend: false,
      reason: `设备配置：${alarmType} 不使用 ${notifyMethod} 通知`
    }
  }
  
  // 第6层：检查接警人是否接受该通知方式（取交集的关键）
  const receiverSwitchKey = `${notifyMethod}NotifySwitch` // phoneNotifySwitch/smsNotifySwitch/wechatNotifySwitch
  const receiverAllows = receiver[receiverSwitchKey] === '1'
  
  if (!receiverAllows) {
    return {
      shouldSend: false,
      reason: `接警人 ${receiver.receiverName || '未知'} 关闭了 ${notifyMethod} 通知`
    }
  }
  
  // 设备和接警人都允许，发送通知（取交集）
  return {
    shouldSend: true,
    reason: `设备和接警人都允许：${alarmType} 使用 ${notifyMethod} 通知给 ${receiver?.receiverName || '接警人'}`
  }
}

/**
 * 批量判断所有接警人应该接收哪些通知方式（取交集）
 * @param {string} alarmType - 报警类型标识
 * @param {object} device - 设备信息
 * @param {array} receivers - 接警人列表
 * @returns {array} 返回需要发送的通知列表
 * [
 *   { receiver: {...}, method: 'phone', contact: '13800138000' },
 *   { receiver: {...}, method: 'sms', contact: '13800138000' },
 *   { receiver: {...}, method: 'wechat', contact: 'openid_xxx' }
 * ]
 */
export function getNotificationList(alarmType, device, receivers) {
  const notificationList = []
  
  if (!receivers || receivers.length === 0) {
    console.warn('没有绑定的接警人')
    return notificationList
  }
  
  // 遍历所有接警人
  receivers.forEach(receiver => {
    // 检查三种通知方式
    const methods = ['phone', 'sms', 'wechat']
    
    methods.forEach(method => {
      const result = shouldSendNotification(alarmType, method, device, receiver)
      
      if (result.shouldSend) {
        // 获取联系方式
        let contact = ''
        if (method === 'phone') {
          contact = receiver.receiverPhone
        } else if (method === 'sms') {
          contact = receiver.receiverPhone
        } else if (method === 'wechat') {
          contact = receiver.wechatOpenid || receiver.receiverPhone
        }
        
        if (contact) {
          notificationList.push({
            receiver: receiver,
            method: method,
            contact: contact,
            reason: result.reason
          })
        }
      }
    })
  })
  
  return notificationList
}

/**
 * 获取报警配置摘要（用于日志记录）
 * @param {object} device - 设备信息
 * @returns {object} 报警配置摘要
 */
export function getAlarmConfigSummary(device) {
  if (!device || !device.alarmSwitch) {
    return {
      defenseStatus: device?.defenseStatus || '未知',
      alarmCount: 0,
      alarms: []
    }
  }
  
  let alarmSwitches = []
  try {
    alarmSwitches = JSON.parse(device.alarmSwitch || '[]')
  } catch (e) {
    console.error('解析报警配置失败:', e)
  }
  
  const summary = {
    defenseStatus: device.defenseStatus === '1' ? '已布防' : '未布防',
    alarmCount: alarmSwitches.length,
    alarms: alarmSwitches.map(alarm => ({
      name: alarm.name,
      identifier: alarm.identifier,
      enabled: alarm.open,
      methods: {
        phone: alarm.phoneAlarm || false,
        sms: alarm.smsAlarm || false,
        wechat: alarm.wechatAlarm || false
      }
    }))
  }
  
  return summary
}

/**
 * 验证报警配置的完整性
 * @param {object} device - 设备信息
 * @returns {object} { valid: boolean, errors: array }
 */
export function validateAlarmConfig(device) {
  const errors = []
  
  if (!device) {
    errors.push('设备信息为空')
    return { valid: false, errors }
  }
  
  if (!device.defenseStatus) {
    errors.push('缺少布防状态配置')
  }
  
  if (!device.alarmSwitch) {
    errors.push('缺少报警开关配置')
    return { valid: false, errors }
  }
  
  let alarmSwitches = []
  try {
    alarmSwitches = JSON.parse(device.alarmSwitch)
  } catch (e) {
    errors.push('报警配置JSON格式错误')
    return { valid: false, errors }
  }
  
  if (!Array.isArray(alarmSwitches)) {
    errors.push('报警配置不是数组格式')
    return { valid: false, errors }
  }
  
  // 验证每个报警项的完整性
  alarmSwitches.forEach((alarm, index) => {
    if (!alarm.identifier) {
      errors.push(`第${index + 1}项报警缺少identifier`)
    }
    if (!alarm.name) {
      errors.push(`第${index + 1}项报警缺少name`)
    }
    if (typeof alarm.open !== 'boolean') {
      errors.push(`第${index + 1}项报警的open字段类型错误`)
    }
    if (alarm.open) {
      // 如果报警开启，至少要有一种通知方式
      if (!alarm.phoneAlarm && !alarm.smsAlarm && !alarm.wechatAlarm) {
        errors.push(`第${index + 1}项报警(${alarm.name})已开启但未配置任何通知方式`)
      }
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export default {
  shouldSendNotification,
  getNotificationList,
  getAlarmConfigSummary,
  validateAlarmConfig
}
