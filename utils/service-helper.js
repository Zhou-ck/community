import config from '@/config'

// ==================== 服务订单相关 ====================

export const ORDER_STATUS_MAP = {
  pending: { text: '待接单', class: 'status-pending' },
  accepted: { text: '已接单', class: 'status-accepted' },
  serving: { text: '服务中', class: 'status-serving' },
  completed: { text: '已完成', class: 'status-completed' },
  cancelled: { text: '已取消', class: 'status-cancelled' },
  rejected: { text: '已拒绝', class: 'status-rejected' },
  closed: { text: '已关闭', class: 'status-closed' },
  dispatching: { text: '待派单', class: 'status-dispatching' },
  verifying: { text: '待核销', class: 'status-verifying' }
}

export const ORDER_STATUS_CODE_MAP = {
  '0': 'pending',      // 待接单
  '1': 'accepted',     // 已接单
  '2': 'serving',      // 服务中
  '3': 'completed',    // 已完成
  '4': 'cancelled',    // 已取消
  '5': 'rejected',     // 已拒绝
  '6': 'closed',       // 已关闭
  '7': 'dispatching',  // 待派单
  '8': 'verifying'     // 待核销
}

export const ORDER_BG_CLASS_MAP = {
  pending: 'bg-pending',
  accepted: 'bg-accepted',
  serving: 'bg-serving',
  completed: 'bg-completed',
  cancelled: 'bg-cancelled',
  rejected: 'bg-rejected',
  closed: 'bg-cancelled'
}

// ==================== 套餐实例状态 ====================

const INSTANCE_STATUS_TEXT_MAP = {
  'PENDING_REVIEW': '待审核',
  'ACTIVE': '使用中',
  'REFUND_PENDING': '退订审核中',
  'EXPIRED': '已过期',
  'REFUNDED': '已退款',
  'REJECTED': '已拒绝',
  'CANCELLED': '已取消',
  'PENDING': '待生效'
}

const INSTANCE_STATUS_CLASS_MAP = {
  'PENDING_REVIEW': 'status-pending',
  'ACTIVE': 'status-using',
  'REFUND_PENDING': 'status-refund-pending',
  'EXPIRED': 'status-expired',
  'REFUNDED': 'status-refunded',
  'REJECTED': 'status-rejected',
  'CANCELLED': 'status-cancelled',
  'PENDING': 'status-pending'
}

export function getInstanceStatusText(status) {
  return INSTANCE_STATUS_TEXT_MAP[status] || status || '未知'
}

export function getInstanceStatusClass(status) {
  return INSTANCE_STATUS_CLASS_MAP[status] || ''
}

// ==================== 频率/有效期 ====================

const FREQUENCY_TYPE_MAP = {
  'DAILY': '每天',
  'WEEKLY': '每周',
  'MONTHLY': '每月',
  'TOTAL': '总计',
  'ON_DEMAND': '按需服务'
}

const FREQUENCY_TEXT_MAP = {
  'day': '每天',
  'week': '每周',
  'month': '每月',
  'total': '总计',
  'DAILY': '每天',
  'WEEKLY': '每周',
  'MONTHLY': '每月',
  'TOTAL': '总计'
}

const VALIDITY_TYPE_MAP = {
  'DAY': '天',
  'WEEK': '周',
  'MONTH': '个月',
  'YEAR': '年'
}

export function getFrequencyTypeText(frequencyType) {
  return FREQUENCY_TYPE_MAP[frequencyType] || frequencyType
}

export function getFrequencyText(frequency) {
  return FREQUENCY_TEXT_MAP[frequency] || frequency
}

export function getValidityText(item) {
  if (!item.validityType || !item.validityValue) {
    return '-'
  }
  const unit = VALIDITY_TYPE_MAP[item.validityType] || ''
  return `${item.validityValue}${unit}`
}

// ==================== 进度计算 ====================

export function getProgressWidth(service) {
  if (!service.totalCount || service.totalCount === 0) return '0%'
  const percent = (service.usedCount / service.totalCount) * 100
  return Math.min(percent, 100) + '%'
}

export function getProgressPercent(service) {
  if (!service.totalCount || service.totalCount === 0) return '0%'
  const percent = (service.usedCount / service.totalCount) * 100
  return Math.min(percent, 100).toFixed(0) + '%'
}

export function getProgressValue(service) {
  if (!service.totalCount || service.totalCount === 0) return 0
  return (service.usedCount / service.totalCount) * 100
}

// ==================== 通用工具 ====================

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  if (dateStr.includes(' ')) {
    return dateStr.split(' ')[0]
  }
  return dateStr
}

export function getServiceIcon(iconPath) {
  if (!iconPath) {
    return '/static/images/default-service.png'
  }
  if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
    return iconPath
  }
  if (iconPath.startsWith('/')) {
    return config.baseUrl + iconPath
  }
  return '/static/images/default-service.png'
}

export function formatServiceCount(service) {
  if (service.frequencyType === 'ON_DEMAND') {
    return '不限'
  }
  if (service.frequencyType === 'WEEKLY') {
    return `每周${service.frequencyLimit}次，共${service.totalCount}次`
  }
  
  // 当totalCount为null、undefined或0时，只显示频率类型
  if (!service.totalCount || service.totalCount === null || service.totalCount === 0) {
    return getFrequencyTypeText(service.frequencyType)
  }
  
  return `${getFrequencyTypeText(service.frequencyType)}${service.totalCount}次`
}
