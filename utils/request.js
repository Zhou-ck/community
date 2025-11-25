import store from '@/store'
import config from '@/config'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { toast, showConfirm, tansParams } from '@/utils/common'

let timeout = 10000
const baseUrl = config.baseUrl

// 是否开启调试模式
const DEBUG = true

export let isRelogin = { show: false };

const request = config => {
  // 生成请求ID用于调试追踪
  const requestId = Date.now() + Math.random().toString(36).substr(2, 9)
  const startTime = Date.now()
  
  // 是否需要设置 token
  const isToken = (config.headers || {}).isToken === false
  config.header = config.header || {}
  if (getToken() && !isToken) {
    config.header['Authorization'] = 'Bearer ' + getToken()
  }
  
  // get请求映射params参数
  if (config.params) {
    let url = config.url + '?' + tansParams(config.params)
    url = url.slice(0, -1)
    config.url = url
  }
  
  // 完整的请求URL
  const fullUrl = config.baseUrl || baseUrl + config.url
  
  // 调试信息：请求开始
  if (DEBUG) {
    console.group(`🚀API请求 [${requestId}]`)
    console.log('请求地址:', fullUrl)
    console.log('请求方法:', config.method || 'GET')
    console.log(' 请求参数:', config.data || config.params || '无')
    console.groupEnd()
  }
  
  return new Promise((resolve, reject) => {
    uni.request({
        method: config.method || 'get',
        timeout: config.timeout ||  timeout,
        url: config.baseUrl || baseUrl + config.url,
        data: config.data,
        header: config.header,
        dataType: 'json'
      }).then(response => {
        const endTime = Date.now()
        const duration = endTime - startTime
        
        let [error, res] = response
        if (error) {
          // 调试信息：网络错误
          if (DEBUG) {
            console.group(`❌API请求失败 [${requestId}]`)
            console.log('请求地址:', fullUrl)
            console.log('错误类型: 网络连接异常')
            console.log('请求耗时:', duration + 'ms')
            console.log('错误详情:', error)
            console.groupEnd()
          }
          toast('后端接口连接异常')
          reject('后端接口连接异常')
          return
        }
        
        const code = res.data.code || 200
        const msg = errorCode[code] || res.data.msg || errorCode['default']
        
        // 调试信息：响应数据
        if (DEBUG) {
          console.group(`✅ API响应 [${requestId}]`)
          console.log('请求地址:', fullUrl)
          console.log('响应状态:', res.statusCode)
          console.log('业务状态码:', code)
          console.log('响应数据:', res.data)
          console.log('请求耗时:', duration + 'ms')
          console.groupEnd()
        }
        
        if (code === 401) {
          // 调试信息：认证失败
          if (DEBUG) {
            console.group(`🔐 认证失败 [${requestId}]`)
            console.log('请求地址:', fullUrl)
            console.log('错误信息:', msg)
            console.log('即将跳转登录页面')
            console.groupEnd()
          }
          if (!isRelogin.show) {
            isRelogin.show = true;
            showConfirm('登录状态已过期，您可以继续留在该页面，或者重新登录?', '登录过期提示').then(res => {
              if (res.confirm) {
                store.dispatch('LogOut').then(() => {
                  uni.reLaunch({ url: '/pages/login' })
                }).catch(() => {
                  // 即使LogOut失败（如网络错误），本地Token已被清除（在store中处理），直接跳转
                  uni.reLaunch({ url: '/pages/login' })
                }).finally(() => {
                  isRelogin.show = false;
                })
              } else {
                isRelogin.show = false;
              }
            }).catch(() => {
              isRelogin.show = false;
            });
          }
          reject('无效的会话，或者会话已过期，请重新登录。')
        } else if (code === 500) {
          // 调试信息：服务器错误
          if (DEBUG) {
            console.group(`🔥 服务器错误 [${requestId}]`)
            console.log('请求地址:', fullUrl)
            console.log('错误信息:', msg)
            console.log('完整响应:', res.data)
            console.groupEnd()
          }
          toast(msg)
          reject('500')
        } else if (code !== 200) {
          // 调试信息：业务错误
          if (DEBUG) {
            console.group(`⚠️业务错误 [${requestId}]`)
            console.log('请求地址:', fullUrl)
            console.log('错误码:', code)
            console.log('错误信息:', msg)
            console.log('完整响应:', res.data)
            console.groupEnd()
          }
          toast(msg)
          reject(code)
        }
        resolve(res.data)
      })
      .catch(error => {
        const endTime = Date.now()
        const duration = endTime - startTime
        
        let { message } = error
        if (message === 'Network Error') {
          message = '后端接口连接异常'
        } else if (message.includes('timeout')) {
          message = '系统接口请求超时'
        } else if (message.includes('Request failed with status code')) {
          message = '系统接口' + message.substr(message.length - 3) + '异常'
        }
        
        // 调试信息：请求异常
        if (DEBUG) {
          console.group(`💥API请求异常 [${requestId}]`)
          console.log('请求地址:', fullUrl)
          console.log('异常类型:', error.name || '未知异常')
          console.log('异常信息:', message)
          console.log('完整错误:', error)
          console.groupEnd()
        }
        
        toast(message)
        reject(error)
      })
  })
}

export default request
