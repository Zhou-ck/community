const TokenKey = 'App-Token'
const UserNameKey = 'App-UserName'
const PasswordKey = 'App-Password'

export function getToken() {
  return uni.getStorageSync(TokenKey)
}

export function setToken(token) {
  return uni.setStorageSync(TokenKey, token)
}

export function removeToken() {
  return uni.removeStorageSync(TokenKey)
}

export function getUserName() {
  return uni.getStorageSync(UserNameKey)
}

export function setUserName(userName) {
  return uni.setStorageSync(UserNameKey, userName)
}

export function removeUserName() {
  return uni.removeStorageSync(UserNameKey)
}

export function getPassWord() {
  return uni.getStorageSync(PasswordKey)
}

export function setPassWord(password) {
  return uni.setStorageSync(PasswordKey, password)
}

export function removePassWord() {
  return uni.removeStorageSync(PasswordKey)
}
