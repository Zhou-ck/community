/**
 * Token 刷新工具
 * 用于在 token 即将过期时自动刷新，延长登录状态
 */

import { getToken, setToken } from '@/utils/auth'
import config from '@/config'

// Token 刷新间隔（毫秒）- 默认每30分钟刷新一次
const REFRESH_INTERVAL = 30 * 60 * 1000

// Token 过期前多久开始刷新（毫秒）- 默认提前5分钟
const REFRESH_BEFORE_EXPIRE = 5 * 60 * 1000

// 存储token的key
const TOKEN_TIMESTAMP_KEY = 'App-Token-Timestamp'

/**
 * 获取token的存储时间戳
 */
export function getTokenTimestamp() {
  return uni.getStorageSync(TOKEN_TIMESTAMP_KEY) || 0
}

/**
 * 设置token的存储时间戳
 */
export function setTokenTimestamp() {
  uni.setStorageSync(TOKEN_TIMESTAMP_KEY, Date.now())
}

/**
 * 检查token是否需要刷新
 * @param {number} tokenExpireTime - token有效期（毫秒），默认2小时
 * @returns {boolean} 是否需要刷新
 */
export function needRefreshToken(tokenExpireTime = 2 * 60 * 60 * 1000) {
  const token = getToken()
  if (!token) return false
  
  const timestamp = getTokenTimestamp()
  if (!timestamp) {
    // 没有时间戳，记录当前时间
    setTokenTimestamp()
    return false
  }
  
  const elapsed = Date.now() - timestamp
  const remaining = tokenExpireTime - elapsed
  
  // 如果剩余时间小于刷新阈值，需要刷新
  return remaining < REFRESH_BEFORE_EXPIRE
}

/**
 * 刷新token
 * @returns {Promise<boolean>} 是否刷新成功
 */
export async function refreshToken() {
  try {
    const token = getToken()
    if (!token) return false
    
    // 调用后端刷新接口（如果后端支持）
    // 这里使用一个通用的刷新接口路径，需要根据实际情况调整
    const response = await new Promise((resolve, reject) => {
      uni.request({
        url: config.baseUrl + '/refreshToken',
        method: 'post',
        header: {
          'Authorization': 'Bearer ' + token
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data && res.data.code === 200) {
            resolve(res.data)
          } else {
            reject(new Error('刷新失败'))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
    
    // 如果后端返回新token，更新存储
    if (response.token) {
      setToken(response.token)
      setTokenTimestamp()
      console.log('[Token刷新] 刷新成功')
      return true
    }
    
    // 如果没有返回新token，只更新时间戳（表示已"续期"）
    setTokenTimestamp()
    console.log('[Token刷新] 已续期')
    return true
  } catch (error) {
    console.warn('[Token刷新] 刷新失败:', error.message)
    return false
  }
}

/**
 * 启动token自动刷新定时器
 * @param {number} tokenExpireTime - token有效期（毫秒）
 * @returns {number} 定时器ID
 */
export function startAutoRefresh(tokenExpireTime = 2 * 60 * 60 * 1000) {
  // 每隔一段时间检查是否需要刷新
  const timerId = setInterval(() => {
    if (needRefreshToken(tokenExpireTime)) {
      refreshToken()
    }
  }, REFRESH_INTERVAL)
  
  console.log('[Token刷新] 自动刷新已启动，间隔:', REFRESH_INTERVAL / 1000 / 60, '分钟')
  return timerId
}

/**
 * 停止token自动刷新
 * @param {number} timerId - 定时器ID
 */
export function stopAutoRefresh(timerId) {
  if (timerId) {
    clearInterval(timerId)
    console.log('[Token刷新] 自动刷新已停止')
  }
}

/**
 * 初始化token时间戳
 * 在登录成功后调用
 */
export function initTokenTimestamp() {
  setTokenTimestamp()
  console.log('[Token刷新] 时间戳已初始化')
}
