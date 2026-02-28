import store from '@/store'
import config from '@/config'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { toast, showConfirm, tansParams } from '@/utils/common'

let timeout = 10000
const baseUrl = config.baseUrl

const upload = config => {
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
  return new Promise((resolve, reject) => {
      uni.uploadFile({
        timeout: config.timeout || timeout,
        url: baseUrl + config.url,
        filePath: config.filePath,
        name: config.name || 'file',
        header: config.header,
        formData: config.formData,
        success: (res) => {
          let result = JSON.parse(res.data)
          const code = result.code || 200
          const msg = errorCode[code] || result.msg || errorCode['default']
          if (code === 200) {
            resolve(result)
          } else if (code == 401) {
            // 检查是否有缓存的账号密码（说明之前登录过）
            // 兼容多种缓存key
            const cachedUsername = uni.getStorageSync('user_username') || uni.getStorageSync('App-UserName')
            const cachedPassword = uni.getStorageSync('user_password_cache') || uni.getStorageSync('App-Password')
            const hasLoginCache = cachedUsername || cachedPassword
            
            // 只有存在登录缓存时才弹窗提示
            if (hasLoginCache) {
              uni.showModal({
                title: '登录过期提示',
                content: '当前登录状态已过期，请重新登录',
                showCancel: false,
                confirmText: '确定',
                success: (res) => {
                  if (res.confirm) {
                    store.dispatch('LogOut').then(res => {
                      uni.reLaunch({ url: '/pages/login' })
                    })
                  }
                }
              })
            } else {
              // 没有登录缓存，静默清除token
              store.dispatch('LogOut').catch(() => {})
            }
            reject('无效的会话，或者会话已过期，请重新登录。')
          } else if (code === 500) {
            toast(msg)
            reject('500')
          } else if (code !== 200) {
            toast(msg)
            reject(code)
          }
        },
        fail: (error) => {
          let { message } = error
          if (message == 'Network Error') {
            message = '后端接口连接异常'
          } else if (message.includes('timeout')) {
            message = '系统接口请求超时'
          } else if (message.includes('Request failed with status code')) {
            message = '系统接口' + message.substr(message.length - 3) + '异常'
          }
          toast(message)
          reject(error)
        }
      })
  })
}

export default upload
