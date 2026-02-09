import upload from '@/utils/upload'
import request from '@/utils/request'

// 发送忘记密码验证码
export function sendForgetCode(userName, phonenumber) {
  return request({
    url: '/forget/sendCode',
    headers: {
      isToken: false
    },
    method: 'post',
    data: { userName, phonenumber }
  })
}

// 重置密码
export function resetPassword(data) {
  return request({
    url: '/forget/resetPassword',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

// 注销账号
export function cancelAccount(password) {
  return request({
    url: '/system/user/profile/cancel',
    method: 'delete',
    data: { password }
  })
}

// 查询用户个人信息
export function getUserProfile() {
  return request({
    url: '/system/user/profile',
    method: 'get'
  })
}

// 修改用户个人信息
export function updateUserProfile(data) {
  return request({
    url: '/system/user/profile',
    method: 'put',
    data: data
  })
}

// 用户头像上传
export function uploadAvatar(data) {
  return upload({
    url: '/system/user/profile/avatar',
    name: data.name,
    filePath: data.filePath
  })
}
