<template>
  <view class="page-container">
    <!-- 头部区域 -->
    <view class="header-section">
      <view class="status-bar"></view>
      <view class="header-content">
        <view class="header-title">
          <text class="title-text">个人资料</text>
          <text class="subtitle-text">Personal Information</text>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content-section">
      <!-- 头像显示卡片 -->
      <view class="avatar-display-card">
        <view class="avatar-wrapper">
          <view v-if="!user.avatar" class="default-avatar">
            <uni-icons type="person-filled" size="60" color="#a8e6cf"></uni-icons>
          </view>
          <image v-if="user.avatar" :src="user.avatar" class="user-avatar" mode="aspectFill"></image>
        </view>
        <view class="avatar-info">
          <text class="user-name">{{ user.nickName || '未设置昵称' }}</text>
          <text class="user-role">{{ roleGroup || '智慧养老服务用户' }}</text>
        </view>
      </view>

      <!-- 表单区域 -->
      <view class="form-container">
        <uni-forms ref="form" :model="user" :rules="rules">
          <!-- 账号 - 只读 -->
          <view class="form-card readonly-card">
            <view class="form-icon account-icon">
              <uni-icons type="contact-filled" size="24" color="#fff"></uni-icons>
            </view>
            <view class="form-content">
              <text class="form-label">用户账号</text>
              <view class="readonly-value">
                <text class="readonly-text">{{ user.userName || '未设置' }}</text>
              </view>
            </view>
          </view>
          <!-- 昵称 - 可编辑 -->
          <view class="form-card">
            <view class="form-icon person-icon">
              <uni-icons type="person-filled" size="24" color="#fff"></uni-icons>
            </view>
            <view class="form-content">
              <text class="form-label">用户昵称</text>
              <uni-easyinput 
                v-model="user.nickName" 
                placeholder="请输入昵称" 
                class="custom-input"
                :styles="inputStyles"
                @blur="validateNickName"
              />
              <view v-if="nickNameError" class="error-message">
                <text class="error-text">{{ nickNameError }}</text>
              </view>
            </view>
          </view>

          
          <!-- 手机号 - 可编辑 -->
          <view class="form-card">
            <view class="form-icon phone-icon">
              <uni-icons type="phone-filled" size="24" color="#fff"></uni-icons>
            </view>
            <view class="form-content">
              <text class="form-label">手机号码</text>
              <uni-easyinput 
                v-model="user.phonenumber" 
                placeholder="请输入手机号码" 
                class="custom-input"
                :styles="inputStyles"
                type="number"
                maxlength="11"
                @blur="validatePhoneNumber"
              />
              <view v-if="phoneNumberError" class="error-message">
                <text class="error-text">{{ phoneNumberError }}</text>
              </view>
            </view>
          </view>

          <!-- 邮箱 - 可编辑 -->
          <view class="form-card">
            <view class="form-icon email-icon">
              <uni-icons type="email-filled" size="24" color="#fff"></uni-icons>
            </view>
            <view class="form-content">
              <text class="form-label">邮箱地址</text>
              <uni-easyinput 
                v-model="user.email" 
                placeholder="请输入邮箱地址" 
                class="custom-input"
                :styles="inputStyles"
                @blur="validateEmail"
              />
              <view v-if="emailError" class="error-message">
                <text class="error-text">{{ emailError }}</text>
              </view>
            </view>
          </view>

          <!-- 性别 - 可编辑 -->
          <view class="form-card">
            <view class="form-icon gender-icon">
              <uni-icons type="auth-filled" size="24" color="#fff"></uni-icons>
            </view>
            <view class="form-content">
              <text class="form-label">性别</text>
              <view class="gender-selector">
                <uni-data-checkbox 
                  v-model="user.sex" 
                  :localdata="sexs" 
                  mode="button"
                  selectedColor="#a8e6cf"
                />
              </view>
            </view>
          </view>

          <!-- 角色 - 只读 -->
          <view class="form-card readonly-card">
            <view class="form-icon role-icon">
              <uni-icons type="staff-filled" size="24" color="#fff"></uni-icons>
            </view>
            <view class="form-content">
              <text class="form-label">角色</text>
              <view class="readonly-value">
                <text class="readonly-text">{{ roleGroup || '智慧养老服务用户' }}</text>
              </view>
            </view>
          </view>

          <!-- 创建日期 - 只读 -->
          <view class="form-card readonly-card">
            <view class="form-icon time-icon">
              <uni-icons type="calendar-filled" size="24" color="#fff"></uni-icons>
            </view>
            <view class="form-content">
              <text class="form-label">创建日期</text>
              <view class="readonly-value">
                <text class="readonly-text">{{ user.createTime || '未知' }}</text>
              </view>
            </view>
          </view>
        </uni-forms>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-container">
        <button 
          class="submit-btn" 
          :class="{ 'disabled': !hasChanges }"
          :disabled="!hasChanges"
          @click="submit"
        >
          <text class="submit-text">{{ hasChanges ? '保存修改' : '暂无修改' }}</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
  import { getUserProfile, updateUserProfile } from "@/api/system/user"

  export default {
    data() {
      return {
        user: {
          nickName: "",
          userName: "",
          phonenumber: "",
          email: "",
          sex: "",
          avatar: "",
          createTime: ""
        },
        roleGroup: "",
        postGroup: "",
        originalUser: {}, // 保存原始数据用于对比
        nickNameError: "", // 昵称错误信息
        phoneNumberError: "", // 手机号错误信息
        emailError: "", // 邮箱错误信息
        sexs: [{
          text: '男',
          value: "0"
        }, {
          text: '女',
          value: "1"
        }],
        rules: {
          nickName: {
            rules: [{
              required: true,
              errorMessage: '用户昵称不能为空'
            }, {
              minLength: 2,
              errorMessage: '用户昵称不能少于2个字符'
            }]
          },
          phonenumber: {
            rules: [{
              required: true,
              errorMessage: '手机号码不能为空'
            }, {
              minLength: 1,
              errorMessage: '手机号码不能为空'
            }, {
              pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
              errorMessage: '请输入正确的手机号码'
            }]
          },
          email: {
            rules: [{
              format: 'email',
              errorMessage: '请输入正确的邮箱地址'
            }]
          }
        },
        inputStyles: {
          borderColor: 'transparent',
          backgroundColor: '#f8f9fa',
          borderRadius: '12rpx',
          padding: '24rpx'
        }
      }
    },
    onLoad() {
      this.getUser()
    },
    onReady() {
      this.$refs.form.setRules(this.rules)
    },
    computed: {
      hasChanges() {
        // 检查可编辑字段是否发生变化
        const editableFields = ['nickName', 'phonenumber', 'email', 'sex']
        const hasFieldChanges = editableFields.some(field => {
          return this.user[field] !== this.originalUser[field]
        })
        
        // 检查必填字段是否为空且符合要求
        const hasRequiredFields = this.user.nickName && this.user.nickName.trim().length >= 2 &&
                                 this.user.phonenumber && this.user.phonenumber.trim() !== ''
        
        // 检查是否有验证错误
        const hasNoErrors = !this.nickNameError && !this.phoneNumberError && !this.emailError
        
        return hasFieldChanges && hasRequiredFields && hasNoErrors
      }
    },
    methods: {
      getUser() {
        getUserProfile().then(response => {
          this.user = response.data
          this.roleGroup = response.roleGroup
          this.postGroup = response.postGroup
          // 保存原始数据的深拷贝
          this.originalUser = JSON.parse(JSON.stringify(response.data))
        })
      },
      validateNickName() {
        const nickName = this.user.nickName
        if (!nickName || nickName.trim() === '') {
          this.nickNameError = '用户昵称不能为空'
        } else if (nickName.trim().length < 2) {
          this.nickNameError = '用户昵称不能少于2个字符'
        } else {
          this.nickNameError = ''
        }
      },
      validatePhoneNumber() {
        const phoneNumber = this.user.phonenumber
        const phoneRegex = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/
        
        if (!phoneNumber || phoneNumber.trim() === '') {
          this.phoneNumberError = '手机号码不能为空'
        } else if (phoneNumber.length !== 11) {
          this.phoneNumberError = '手机号码必须为11位'
        } else if (!phoneRegex.test(phoneNumber)) {
          this.phoneNumberError = '请输入正确的手机号码格式'
        } else {
          this.phoneNumberError = ''
        }
      },
      validateEmail() {
        const email = this.user.email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        
        if (email && email.trim() !== '') {
          if (!emailRegex.test(email)) {
            this.emailError = '请输入正确的邮箱格式'
          } else {
            this.emailError = ''
          }
        } else {
          this.emailError = ''
        }
      },
      submit() {
        // 检查是否有数据变化
        if (!this.hasChanges) {
          uni.showToast({
            title: '暂无修改内容',
            icon: 'none'
          })
          return
        }

        // 检查必填字段
        if (!this.user.nickName || this.user.nickName.trim() === '') {
          uni.showToast({
            title: '用户昵称不能为空',
            icon: 'none'
          })
          return
        }

        if (this.user.nickName.trim().length < 2) {
          uni.showToast({
            title: '用户昵称不能少于2个字符',
            icon: 'none'
          })
          return
        }

        if (!this.user.phonenumber || this.user.phonenumber.trim() === '') {
          uni.showToast({
            title: '手机号码不能为空',
            icon: 'none'
          })
          return
        }

        const phoneRegex = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/
        if (!phoneRegex.test(this.user.phonenumber)) {
          uni.showToast({
            title: '请输入正确的手机号码格式',
            icon: 'none'
          })
          return
        }

        // 检查邮箱格式（如果填写了邮箱）
        if (this.user.email && this.user.email.trim() !== '') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(this.user.email)) {
            uni.showToast({
              title: '请输入正确的邮箱格式',
              icon: 'none'
            })
            return
          }
        }

        this.$refs.form.validate().then(res => {
          updateUserProfile(this.user).then(response => {
            uni.showToast({
              title: '修改成功',
              icon: 'success'
            })
            // 更新原始数据
            this.originalUser = JSON.parse(JSON.stringify(this.user))
          }).catch(error => {
            uni.showToast({
              title: '修改失败',
              icon: 'error'
            })
          })
        }).catch(error => {
          console.log('表单验证失败:', error)
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
page {
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

/* 头部区域 */
.header-section {
  background: linear-gradient(135deg, #a8e6cf 0%, #88d8a3 100%);
  padding-bottom: 40rpx;
  position: relative;
  overflow: hidden;
}

.header-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  transform: rotate(15deg);
}

.status-bar {
  height: var(--status-bar-height, 44rpx);
}

.header-content {
  padding: 40rpx 30rpx;
  position: relative;
  z-index: 2;
}

.header-title {
  text-align: center;
}

.title-text {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8rpx;
}

.subtitle-text {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
}

/* 内容区域 */
.content-section {
  margin-top: -20rpx;
  padding: 0 30rpx;
  position: relative;
  z-index: 3;
}

/* 头像显示卡片 */
.avatar-display-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  margin-right: 30rpx;
}

.default-avatar, .user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(168, 230, 207, 0.3);
}

.user-avatar {
  border: 4rpx solid rgba(168, 230, 207, 0.3);
}

.avatar-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.user-role {
  font-size: 26rpx;
  color: #666;
}

/* 表单容器 */
.form-container {
  margin-bottom: 40rpx;
}

/* 表单卡片 */
.form-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: flex-start;
}

.readonly-card {
  opacity: 0.6;
}

.form-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.custom-input {
  margin-top: 8rpx;
}

.gender-selector {
  margin-top: 8rpx;
}

.readonly-value {
  margin-top: 8rpx;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.readonly-text {
  font-size: 28rpx;
  color: #666;
}

/* 错误提示样式 */
.error-message {
  margin-top: 12rpx;
  padding-left: 4rpx;
}

.error-text {
  font-size: 24rpx;
  color: #ff4757;
  line-height: 1.2;
}

/* 提交按钮 */
.submit-container {
  padding: 20rpx 0 40rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: #88d8a3;
  border-radius: 44rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(168, 230, 207, 0.4);
  transition: all 0.3s ease;
}

.submit-btn:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(168, 230, 207, 0.6);
}

.submit-btn.disabled {
  background: #e0e0e0 !important;
  box-shadow: none !important;
  cursor: not-allowed;
}

.submit-btn.disabled:active {
  transform: none !important;
}

.submit-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  letter-spacing: 2rpx;
}

.submit-btn.disabled .submit-text {
  color: #999 !important;
}

/* 图标颜色主题 - 统一背景色 */
.person-icon,
.account-icon,
.phone-icon,
.email-icon,
.job-icon,
.time-icon,
.gender-icon,
.role-icon {
  background: #65d289;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-label {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.card-value {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

/* 覆盖uni-forms默认样式 */
::v-deep .uni-forms-item {
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

::v-deep .uni-forms-item__label {
  display: none !important;
}

::v-deep .uni-forms-item__content {
  padding: 0 !important;
}

::v-deep .uni-easyinput__content {
  background-color: #f8f9fa !important;
  border: none !important;
  border-radius: 12rpx !important;
}

::v-deep .uni-easyinput__content-input {
  font-size: 28rpx !important;
  color: #333 !important;
}

::v-deep .uni-data-checklist {
  flex-direction: row !important;
  gap: 20rpx !important;
}

::v-deep .checklist-group {
  flex-direction: row !important;
}

::v-deep .uni-data-checklist .checklist-box {
  margin-right: 20rpx !important;
}
</style>
