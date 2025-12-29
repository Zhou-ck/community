import config from '@/config'

const getters = {
  token: state => state.user.token,
  avatar: state => {
    let avatar = state.user.avatar
    if (!avatar) return ''
    // 如果是对象（import导入的模块），取default属性
    if (typeof avatar === 'object' && avatar.default) {
      return avatar.default
    }
    if (typeof avatar !== 'string') return ''
    // base64 直接返回
    if (avatar.startsWith('data:')) return avatar
    // 本地静态资源路径
    if (avatar.startsWith('/static')) return avatar
    // 替换任何 http(s)://xxx 开头的部分为当前 baseUrl
    if (avatar.match(/^https?:\/\/[^\/]+/)) {
      return avatar.replace(/^https?:\/\/[^\/]+/, config.baseUrl)
    }
    // 相对路径拼接 baseUrl
    return config.baseUrl + avatar
  },
  id: state => state.user.id,
  name: state => state.user.name,
  roles: state => state.user.roles,
  permissions: state => state.user.permissions,
  joinedCommunity: state => state.user.joinedCommunity,
  sleepReportItem: state => state.user.sleepReportItem,
  getSleepReportItem: state => () => state.user.sleepReportItem
}
export default getters
