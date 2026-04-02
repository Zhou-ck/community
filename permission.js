import { getToken } from '@/utils/auth'

// 登录页面
const loginPage = "/pages/login"
  
// 页面白名单（无需登录即可访问的页面）
const whiteList = [
  '/pages/login', 
  '/pages/register', 
  '/pages/forget',
  '/pages/common/privacy/index', 
  '/pages/common/protocol/index',
  '/pages/index',  // 首页
  '/pages/work/index',  // 服务分类（页面内部会检查登录）
  '/pages/order/index',  // 我的订单（页面内部会检查登录）
  '/pages/mine/index',  // 我的（页面内部会检查登录）
  // '/pages/server/index',  // 服务首页
  // '/pages/server/serviceDetail/index',  // 服务详情
  // '/pages/server/notice/index',  // 公告列表
  // '/pages/server/notice/detail',  // 公告详情
  // '/pages/server/volunteer/index',  // 志愿服务
  // '/pages/server/volunteer/detail',  // 志愿服务详情
  // '/pages/server/institution/index',  // 养老机构
  '/pages/my/about/index',  // 关于我们（公开信息）
]

// 必须登录才能访问的页面（黑名单）
const loginRequiredList = [
  '/pages/order/detail',  // 订单详情
  '/pages/server/booking/index',  // 预约服务
]

// 检查地址白名单
function checkWhite(url) {
  const path = url.split('?')[0]
  return whiteList.indexOf(path) !== -1
}

// 检查是否必须登录
function checkLoginRequired(url) {
  const path = url.split('?')[0]
  // 检查是否在必须登录列表中
  if (loginRequiredList.indexOf(path) !== -1) {
    return true
  }
  // 检查是否是 /pages/my/ 下的页面（个人中心相关页面都需要登录）
  if (path.startsWith('/pages/my/')) {
    return true
  }
  return false
}

// 页面跳转验证拦截器
let list = ["navigateTo", "redirectTo", "reLaunch", "switchTab"]
list.forEach(item => {
  uni.addInterceptor(item, {
    invoke(to) {
      const hasToken = getToken()
      
      // 已登录用户访问登录页，跳转到首页
      // 但如果是 reLaunch 方式（通常是登录过期后的跳转），则允许通过
      if (hasToken && to.url === loginPage && item !== 'reLaunch') {
        uni.reLaunch({ url: "/pages/index" })
        return false
      }
      
      // 未登录用户
      if (!hasToken) {
        // 白名单页面直接放行
        if (checkWhite(to.url)) {
          return true
        }
        
        // 必须登录的页面，跳转到登录页
        if (checkLoginRequired(to.url)) {
          uni.showToast({
            title: '请先登录',
            icon: 'none',
            duration: 2000
          })
          setTimeout(() => {
            uni.navigateTo({ url: loginPage })
          }, 500)
          return false
        }
        
        // 其他页面也放行（允许游客浏览）
        return true
      }
      
      // 已登录用户，所有页面都可以访问
      return true
    },
    fail(err) {
      console.log(err)
    }
  })
})
