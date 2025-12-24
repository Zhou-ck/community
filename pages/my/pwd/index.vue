<template>
  <view class="page-container">
    <!-- 表单内容区域 -->
    <view class="content-section">
      <view class="form-card">
        <uni-forms ref="form" :value="user" :rules="rules">
          <!-- 旧密码 -->
          <view class="form-item">
            <view class="form-label">
              <uni-icons type="locked-filled" size="20" color="#666"></uni-icons>
              <text class="label-text">当前密码</text>
            </view>
            <uni-easyinput 
              type="password" 
              v-model="user.oldPassword" 
              placeholder="请输入当前密码" 
              class="custom-input"
              :styles="inputStyles"
              @blur="validateOldPassword"
              @input="clearOldPasswordError"
            />
            <view class="error-message">
              <text v-if="oldPasswordError" class="error-text">{{ oldPasswordError }}</text>
            </view>
          </view>

          <!-- 新密码 -->
          <view class="form-item">
            <view class="form-label">
              <uni-icons type="locked-filled" size="20" color="#666"></uni-icons>
              <text class="label-text">新密码</text>
            </view>
            <uni-easyinput 
              type="password" 
              v-model="user.newPassword" 
              placeholder="请输入新密码（6-20位字符）" 
              class="custom-input"
              :styles="inputStyles"
              @blur="validateNewPassword"
              @input="clearNewPasswordError"
            />
            <view class="error-message">
              <text v-if="newPasswordError" class="error-text">{{ newPasswordError }}</text>
            </view>
          </view>

          <!-- 确认密码 -->
          <view class="form-item">
            <view class="form-label">
              <uni-icons type="checkmarkempty" size="20" color="#666"></uni-icons>
              <text class="label-text">确认密码</text>
            </view>
            <uni-easyinput 
              type="password" 
              v-model="user.confirmPassword" 
              placeholder="请再次输入新密码" 
              class="custom-input"
              :styles="inputStyles"
              @blur="validateConfirmPassword"
              @input="clearConfirmPasswordError"
            />
            <view class="error-message">
              <text v-if="confirmPasswordError" class="error-text">{{ confirmPasswordError }}</text>
            </view>
          </view>
        </uni-forms>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <view class="submit-btn" :class="{ disabled: !isFormValid }" @click="submit">
          <text class="submit-text">确认修改</text>
        </view>
      </view>

      <!-- 安全提示 -->
      <view class="tips-card">
        <view class="tips-header">
          <uni-icons type="info-filled" size="18" color="#a8e6cf"></uni-icons>
          <text class="tips-title">安全提示</text>
        </view>
        <view class="tips-content">
          <text class="tip-item">• 密码长度为6-20个字符</text>
          <text class="tip-item">• 建议包含字母、数字和特殊字符</text>
          <text class="tip-item">• 请勿使用过于简单的密码</text>
          <text class="tip-item">• 定期更换密码以保障账户安全</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import { updateUserPwd } from "@/api/system/user"

  export default {
    computed: {
      // 表单是否有效
      isFormValid() {
        const { oldPassword, newPassword, confirmPassword } = this.user
        // 所有字段都有值
        if (!oldPassword || !newPassword || !confirmPassword) {
          return false
        }
        // 新密码长度符合要求
        if (newPassword.length < 6 || newPassword.length > 20) {
          return false
        }
        // 两次密码一致
        if (newPassword !== confirmPassword) {
          return false
        }
        // 没有错误信息
        if (this.oldPasswordError || this.newPasswordError || this.confirmPasswordError) {
          return false
        }
        return true
      }
    },
    data() {
      return {
        user: {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        },
        oldPasswordError: '',
        newPasswordError: '',
        confirmPasswordError: '',
        cachedPassword: '',
        inputStyles: {
          borderRadius: '12rpx',
          backgroundColor: '#f8f9fa',
          border: '2rpx solid #e9ecef',
          padding: '24rpx 20rpx',
          fontSize: '30rpx'
        },
        rules: {
          oldPassword: {
            rules: [{
              required: true,
              errorMessage: '旧密码不能为空'
            }, {
              validateFunction: (rule, value, data) => {
                return this.validateOldPasswordRule(value);
              },
              errorMessage: '旧密码不正确'
            }]
          },
          newPassword: {
            rules: [{
                required: true,
                errorMessage: '新密码不能为空',
              },
              {
                validateFunction: (rule, value, data) => {
                  return this.validateNewPasswordRule(value);
                },
                errorMessage: '密码长度必须在6-20个字符之间'
              }
            ]
          },
          confirmPassword: {
            rules: [{
                required: true,
                errorMessage: '确认密码不能为空'
              }, {
                validateFunction: (rule, value, data) => {
                  return this.validateConfirmPasswordRule(value);
                },
                errorMessage: '两次输入的密码不一致'
              }
            ]
          }
        }
      }
    },
    onReady() {
      this.$refs.form.setRules(this.rules)
      this.loadCachedPassword()
    },
    mounted() {
      this.loadCachedPassword()
    },
    methods: {
      // 加载缓存的密码
      loadCachedPassword() {
        try {
          this.cachedPassword = uni.getStorageSync('user_password_cache') || '';
        } catch (e) {
          console.error('读取密码缓存失败:', e);
          this.cachedPassword = '';
        }
      },
      
      // 清除旧密码错误状态
      clearOldPasswordError() {
        this.oldPasswordError = '';
      },
      
      // 清除新密码错误状态
      clearNewPasswordError() {
        this.newPasswordError = '';
        // 如果确认密码已经输入，需要重新验证一致性
        if (this.user.confirmPassword) {
          this.validateConfirmPassword();
        }
      },
      
      // 清除确认密码错误状态
      clearConfirmPasswordError() {
        this.confirmPasswordError = '';
      },
      
      // 验证旧密码
      validateOldPassword() {
        const oldPassword = this.user.oldPassword;
        if (!oldPassword) {
          this.oldPasswordError = '请输入当前密码';
          return false;
        }
        
        if (this.cachedPassword && oldPassword !== this.cachedPassword) {
          this.oldPasswordError = '当前密码不正确';
          return false;
        }
        
        this.oldPasswordError = '';
        return true;
      },
      
      // 用于表单验证规则的旧密码验证
      validateOldPasswordRule(value) {
        if (!value) {
          return false;
        }
        
        if (this.cachedPassword && value !== this.cachedPassword) {
          return false;
        }
        
        return true;
      },
      
      // 验证新密码
      validateNewPassword() {
        const newPassword = this.user.newPassword;
        if (!newPassword) {
          this.newPasswordError = '请输入新密码';
          return false;
        }
        
        if (newPassword.length < 6) {
          this.newPasswordError = '密码长度不能少于6位';
          return false;
        }
        
        if (newPassword.length > 20) {
          this.newPasswordError = '密码长度不能超过20位';
          return false;
        }
        
        this.newPasswordError = '';
        
        // 如果确认密码已经输入，需要重新验证一致性
        if (this.user.confirmPassword) {
          this.validateConfirmPassword();
        }
        
        return true;
      },
      
      // 用于表单验证规则的新密码验证
      validateNewPasswordRule(value) {
        if (!value) {
          return false;
        }
        
        if (value.length < 6 || value.length > 20) {
          return false;
        }
        
        return true;
      },
      
      // 验证确认密码
      validateConfirmPassword() {
        const confirmPassword = this.user.confirmPassword;
        const newPassword = this.user.newPassword;
        
        if (!confirmPassword) {
          this.confirmPasswordError = '请确认新密码';
          return false;
        }
        
        if (confirmPassword !== newPassword) {
          this.confirmPasswordError = '两次输入的密码不一致';
          return false;
        }
        
        this.confirmPasswordError = '';
        return true;
      },
      
      // 用于表单验证规则的确认密码验证
      validateConfirmPasswordRule(value) {
        if (!value) {
          return false;
        }
        
        if (value !== this.user.newPassword) {
          return false;
        }
        
        return true;
      },
      
      submit() {
        // 如果表单无效，不执行提交
        if (!this.isFormValid) {
          return;
        }
        
        // 先进行所有字段的验证
        const isOldPasswordValid = this.validateOldPassword();
        const isNewPasswordValid = this.validateNewPassword();
        const isConfirmPasswordValid = this.validateConfirmPassword();
        
        if (!isOldPasswordValid || !isNewPasswordValid || !isConfirmPasswordValid) {
          return;
        }
        
        this.$refs.form.validate().then(res => {
          updateUserPwd(this.user.oldPassword, this.user.newPassword).then(response => {
            this.$modal.msgSuccess("修改成功，请重新登录")
            
            // 保存用户名，以便登录页面自动填充
            const savedUsername = uni.getStorageSync('user_username')
            
            // 删除密码缓存
            try {
              uni.removeStorageSync('user_password_cache');
            } catch (e) {
              console.error('删除密码缓存失败:', e);
            }
            
            // 清空表单
            this.user.oldPassword = '';
            this.user.newPassword = '';
            this.user.confirmPassword = '';
            this.oldPasswordError = '';
            this.newPasswordError = '';
            this.confirmPasswordError = '';
            
            // 延迟跳转到登录页面
            setTimeout(() => {
              // 退出登录并跳转到登录页面
              this.$store.dispatch('LogOut').then(() => {
                // 恢复用户名缓存
                if (savedUsername) {
                  uni.setStorageSync('user_username', savedUsername)
                }
                this.$tab.reLaunch('/pages/login')
              }).catch(() => {
                // 如果退出登录失败，恢复用户名并跳转
                if (savedUsername) {
                  uni.setStorageSync('user_username', savedUsername)
                }
                this.$tab.reLaunch('/pages/login')
              })
            }, 1500)
          })
        }).catch(err => {
          console.error('表单验证失败:', err);
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

/* 内容区域 */
.content-section {
  padding: 0 30rpx 30rpx;
}

/* 表单卡片 */
.form-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-top: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.form-item {
  margin-bottom: 45rpx;
  position: relative;
}

.form-item:last-child {
  margin-bottom: 10rpx;
}

.form-label {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.label-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-left: 12rpx;
}

.custom-input {
  border-radius: 12rpx !important;
}

/* 提交按钮区域 */
.submit-section {
  margin-bottom: 30rpx;
}

.submit-btn {
  background: #88d8a3;
  border-radius: 16rpx;
  padding: 32rpx;
  text-align: center;
  box-shadow: 0 6rpx 20rpx rgba(168, 230, 207, 0.4);
  transition: all 0.3s ease;
  
  &.disabled {
    background: #ccc;
    box-shadow: none;
    
    .submit-text {
      color: #999;
    }
  }
}

.submit-btn:active:not(.disabled) {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(168, 230, 207, 0.6);
}

.submit-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
}

/* 安全提示卡片 */
.tips-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.tips-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.tips-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-left: 12rpx;
}

.tips-content {
  padding-left: 30rpx;
}

.tip-item {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 2;
  margin-bottom: 8rpx;
}

.tip-item:last-child {
  margin-bottom: 0;
}

/* 错误信息样式 */
.error-message {
  padding-left: 20rpx;
  display: flex;
  align-items: center;
  position: absolute;
  margin-top: 3rpx;
}

.error-text {
  font-size: 24rpx;
  color: #ff4757;
}
</style>
