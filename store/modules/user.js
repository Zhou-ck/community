import config from '@/config'
import storage from '@/utils/storage'
import constant from '@/utils/constant'
import { isHttp, isEmpty } from "@/utils/validate"
import { login, logout, getInfo } from '@/api/login'
import { listDeptCommunity } from '@/api/joinCommunity'
import { getToken, setToken, removeToken } from '@/utils/auth'
import defAva from '@/static/images/profile.jpg'

const baseUrl = config.baseUrl

const user = {
  state: {
    token: getToken(),
    id: storage.get(constant.id),
    name: storage.get(constant.name),
    avatar: storage.get(constant.avatar),
    roles: storage.get(constant.roles),
    permissions: storage.get(constant.permissions),
    joinedCommunity: uni.getStorageSync('joined_community') || null,
    sleepReportItem: null // 添加睡眠报告数据存储
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_ID: (state, id) => {
      state.id = id
      storage.set(constant.id, id)
    },
    SET_NAME: (state, name) => {
      state.name = name
      storage.set(constant.name, name)
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
      storage.set(constant.avatar, avatar)
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
      storage.set(constant.roles, roles)
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
      storage.set(constant.permissions, permissions)
    },
    SET_JOINED_COMMUNITY: (state, community) => {
      state.joinedCommunity = community
      if (community) {
        uni.setStorageSync('joined_community', community)
      } else {
        uni.removeStorageSync('joined_community')
      }
    },
    SET_SLEEP_REPORT_ITEM: (state, sleepReportItem) => {
      state.sleepReportItem = sleepReportItem
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      const phone = userInfo.phone
      return new Promise((resolve, reject) => {
        login(username, password, code, uuid, phone).then(res => {
          setToken(res.token)
          commit('SET_TOKEN', res.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo().then(res => {
          const user = res.user
		  let avatar = user.avatar || ""
		  if (!isHttp(avatar)) {
            avatar = (isEmpty(avatar)) ? defAva : baseUrl + avatar
          }
          const userid = (isEmpty(user) || isEmpty(user.userId)) ? "" : user.userId
		  const username = (isEmpty(user) || isEmpty(user.userName)) ? "" : user.userName
		  if (res.roles && res.roles.length > 0) {
            commit('SET_ROLES', res.roles)
            commit('SET_PERMISSIONS', res.permissions)
          } else {
            commit('SET_ROLES', ['ROLE_DEFAULT'])
          }
          commit('SET_ID', userid)
          commit('SET_NAME', username)
          commit('SET_AVATAR', avatar)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 退出系统
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          resolve()
        }).catch(error => {
          reject(error)
        }).finally(() => {
          // 无论后端接口是否成功，前端都必须执行清除逻辑
          // 保存用户名和密码，以便下次登录时自动填充
          const savedUsername = uni.getStorageSync('user_username')
          const savedPassword = uni.getStorageSync('user_password_cache')
          
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_PERMISSIONS', [])
          // 清除社区信息状态
          commit('SET_JOINED_COMMUNITY', null)
          
          removeToken()
          storage.clean()
          
          // 清除社区信息
          uni.removeStorageSync('joined_community')
          
          // 恢复保存的用户名（始终保留，方便下次登录）
          if (savedUsername) {
            uni.setStorageSync('user_username', savedUsername)
          }
          // 恢复保存的密码（如果存在）
          if (savedPassword) {
            uni.setStorageSync('user_password_cache', savedPassword)
          }
        })
      })
    },

    // 检查Token并刷新社区信息
    CheckTokenAndRefreshCommunity({ commit }) {
      return new Promise((resolve, reject) => {
        listDeptCommunity({
          pageNum: 1,
          pageSize: 20
        }).then(response => {
          if (response.code === 200 && response.rows && response.rows.length > 0) {
            // 查找已加入的社区
            const joinedCommunity = response.rows.find(community => community.throughStatus === "1")
            if (joinedCommunity) {
              const communityInfo = {
                name: joinedCommunity.deptName || joinedCommunity.name,
                communityName: joinedCommunity.deptName || joinedCommunity.name,
                deptId: joinedCommunity.deptId || joinedCommunity.id,
                applyId: joinedCommunity.applyId || joinedCommunity.id
              }
              commit('SET_JOINED_COMMUNITY', communityInfo)
            } else {
              // 如果没有找到已加入的社区，可能被移出，清除缓存
              commit('SET_JOINED_COMMUNITY', null)
            }
          } else {
             commit('SET_JOINED_COMMUNITY', null)
          }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default user
