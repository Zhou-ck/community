<template>
  <view class="register-container">
    <!-- 头部logo区域 -->
    <view class="logo-content">
      <image class="logo-image" :src="globalConfig.appInfo.logo" mode="widthFix"></image>
      <text class="title">安特社区六助注册页</text>
    </view>

    <!-- 注册表单 -->
    <view class="register-form">
      <!-- 手机号输入 -->
      <view class="input-wrapper">
        <view class="input-item" :class="{ 'error': errors.phone }">
          <uni-icons type="phone" size="20" color="#999" class="input-icon"></uni-icons>
          <input v-model="registerForm.phone" @input="clearPhoneError" @blur="validatePhone" class="input" type="number" placeholder="请输入手机号" maxlength="11" />
        </view>
        <view v-if="errors.phone" class="error-message">{{ errors.phone }}</view>
      </view>

      <!-- 账号输入 -->
      <view class="input-wrapper">
        <view class="input-item" :class="{ 'error': errors.username }">
          <uni-icons type="person" size="20" color="#999" class="input-icon"></uni-icons>
          <input v-model="registerForm.username" @input="clearUsernameError" @blur="validateUsername" class="input" type="text" placeholder="请输入账号" maxlength="30" />
        </view>
        <view v-if="errors.username" class="error-message">{{ errors.username }}</view>
      </view>

      <!-- 密码输入 -->
      <view class="input-wrapper">
        <view class="input-item" :class="{ 'error': errors.password }">
          <uni-icons type="locked" size="20" color="#999" class="input-icon"></uni-icons>
          <input v-model="registerForm.password" @input="clearPasswordError" @blur="validatePassword" type="password" class="input" placeholder="请输入密码" maxlength="20" />
        </view>
        <view v-if="errors.password" class="error-message">{{ errors.password }}</view>
      </view>

      <!-- 确认密码输入 -->
      <view class="input-wrapper">
        <view class="input-item" :class="{ 'error': errors.confirmPassword }">
          <uni-icons type="locked" size="20" color="#999" class="input-icon"></uni-icons>
          <input v-model="registerForm.confirmPassword" @input="clearConfirmPasswordError" @blur="validateConfirmPassword" type="password" class="input" placeholder="请输入确认密码" maxlength="20" />
        </view>
        <view v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</view>
      </view>

      <!-- 验证码输入 -->
      <view class="input-wrapper" v-if="captchaEnabled">
        <view class="captcha-container">
          <view class="input-item captcha-input-item" :class="{ 'error': errors.code }">
            <uni-icons type="chatboxes" size="20" color="#999" class="input-icon"></uni-icons>
            <input v-model="registerForm.code" @input="clearCodeError" @blur="validateCode" type="number" class="input" placeholder="请输入验证码" maxlength="4" />
          </view>
          <view class="captcha-image" @click="getCode">
            <image :src="codeUrl" class="captcha-img"></image>
          </view>
        </view>
        <view v-if="errors.code" class="error-message">{{ errors.code }}</view>
      </view>

      <!-- 注册按钮 -->
      <view class="action-btn">
        <button @click="handleRegister" class="register-btn">注册</button>
      </view>

      <!-- 登录链接 -->
      <view class="link-section">
        <text class="link-text">已有账号？</text>
        <text @click="handleUserLogin" class="link-text login-link">立即登录</text>
      </view>
    </view>
  </view>
</template>

<script>
  import { getCodeImg, register } from '@/api/login'

  export default {
    data() {
      return {
        codeUrl: "",
        captchaEnabled: true,
        globalConfig: getApp().globalData.config,
        registerForm: {
          username: "",
          phone: "",
          password: "",
          confirmPassword: "",
          code: "",
          uuid: "",
          katUserType: "2"
        },
        // 验证规则
        registerRules: {
          phone: [{
            required: true,
            pattern: /^1[3-9]\d{9}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
          }],
          username: [{
            required: true,
            trigger: "blur",
            message: "请输入您的账号"
          }],
          password: [{
            required: true,
            trigger: "blur",
            message: "请输入您的密码"
          }],
          confirmPassword: [{
            required: true,
            trigger: "blur",
            message: "请再次输入您的密码"
          }],
          code: [{
            required: true,
            trigger: "change",
            message: "请输入验证码"
          }]
        },
        // 错误状态
        errors: {
          phone: '',
          username: '',
          password: '',
          confirmPassword: '',
          code: ''
        }
      }
    },
    created() {
      this.getCode()
    },
    methods: {
      // 清除手机号错误状态
      clearPhoneError() {
        this.errors.phone = '';
      },

      // 清除账号错误状态
      clearUsernameError() {
        this.errors.username = '';
      },

      // 清除密码错误状态
      clearPasswordError() {
        this.errors.password = '';
      },

      // 清除确认密码错误状态
      clearConfirmPasswordError() {
        this.errors.confirmPassword = '';
      },

      // 清除验证码错误状态
      clearCodeError() {
        this.errors.code = '';
      },

      // 验证手机号
      validatePhone() {
        const phone = this.registerForm.phone;
        if (!phone) {
          this.errors.phone = '请输入手机号';
        } else if (!/^1[3-9]\d{9}$/.test(phone)) {
          this.errors.phone = '请输入正确的手机号码';
        } else {
          this.errors.phone = '';
        }
      },

      // 验证账号
      validateUsername() {
        const username = this.registerForm.username;
        if (!username) {
          this.errors.username = '请输入账号';
        } else if (username.length < 2) {
          this.errors.username = '账号长度不能少于2位';
        } else {
          this.errors.username = '';
        }
      },

      // 验证密码
      validatePassword() {
        const password = this.registerForm.password;
        if (!password) {
          this.errors.password = '请输入密码';
        } else if (password.length < 6) {
          this.errors.password = '密码长度不能少于6位';
        } else {
          this.errors.password = '';
        }
      },

      // 验证确认密码
      validateConfirmPassword() {
        const confirmPassword = this.registerForm.confirmPassword;
        const password = this.registerForm.password;
        if (!confirmPassword) {
          this.errors.confirmPassword = '请再次输入密码';
        } else if (confirmPassword !== password) {
          this.errors.confirmPassword = '两次输入的密码不一致';
        } else {
          this.errors.confirmPassword = '';
        }
      },

      // 验证验证码
      validateCode() {
        const code = this.registerForm.code;
        if (this.captchaEnabled && !code) {
          this.errors.code = '请输入验证码';
        }else {
          this.errors.code = '';
        }
      },

      // 用户登录
      handleUserLogin() {
        this.$tab.navigateTo(`/pages/login`)
      },
      // 获取图形验证码
      getCode() {
        getCodeImg().then(res => {
          this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled
          if (this.captchaEnabled) {
            this.codeUrl = 'data:image/gif;base64,' + res.img
            this.registerForm.uuid = res.uuid
          }
        })
      },
      // 注册方法
      async handleRegister() {
        // 首先执行所有输入框验证
        this.validatePhone();
        this.validateUsername();
        this.validatePassword();
        this.validateConfirmPassword();
        if (this.captchaEnabled) {
          this.validateCode();
        }

        // 检查是否有输入错误
        if (this.errors.phone || this.errors.username || this.errors.password || 
            this.errors.confirmPassword || (this.captchaEnabled && this.errors.code)) {
          return; // 有错误时不提交
        }

        this.$modal.loading("注册中，请耐心等待...")
        this.register()
      },
      // 用户注册
      async register() {
        register(this.registerForm).then(res => {
          this.$modal.closeLoading()
          
          // 注册成功后保存用户名和密码到缓存，以便登录页面显示
          try {
            uni.setStorageSync('user_username', this.registerForm.username)
            uni.setStorageSync('user_password_cache', this.registerForm.password)
            console.log('已保存新注册的用户名和密码到缓存')
          } catch (e) {
            console.error('保存用户名和密码失败:', e)
          }
          
          uni.showModal({
          	title: "系统提示",
          	content: "恭喜你，您的账号 " + this.registerForm.username + " 注册成功！",
          	success: function (res) {
          		if (res.confirm) {
                uni.redirectTo({ url: `/pages/login` });
          		}
          	}
          })
        }).catch(() => {
          if (this.captchaEnabled) {
            this.getCode()
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  page {
    background-color: #f8f9fa;
  }

  .register-container {
    min-height: 100vh;
    background: linear-gradient(180deg, #f6fcfd 60%, #eafcff 100%);
    padding: 0 40rpx;
    display: flex;
    flex-direction: column;
  }

  /* 头部logo区域 */
  .logo-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80rpx 0 60rpx;
    text-align: center;
  }

  .logo-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 20rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
  }

  .title {
    font-size: 48rpx;
    font-weight: bold;
    color: #4e4e4e;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  }

  /* 注册表单 */
  .register-form {
    background: #fff;
    border-radius: 24rpx;
    padding: 60rpx 40rpx;
    margin-bottom: 40rpx;
    box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.1);
  }

  /* 输入框样式 */
  .input-wrapper {
    position: relative;
    margin-bottom: 40rpx;
  }

  .input-item {
    display: flex;
    align-items: center;
    background: #f8f9fa;
    border-radius: 16rpx;
    padding: 0 30rpx;
    height: 100rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
  }

  .input-item:focus-within {
    border-color: #3FA9E7;
    background: #fff;
    box-shadow: 0 0 0 4rpx rgba(63, 169, 231, 0.1);
  }

  .input-item.error {
    border-color: #ff4757;
    background: #fff5f5;
  }

  .input-item.error:focus-within {
    border-color: #ff4757;
    box-shadow: 0 0 0 4rpx rgba(255, 71, 87, 0.1);
  }

  .error-message {
    position: absolute;
    top: 100rpx;
    left: 30rpx;
    color: #ff4757;
    font-size: 22rpx;
    line-height: 1.4;
    white-space: nowrap;
  }

  .input-icon {
    margin-right: 20rpx;
    flex-shrink: 0;
  }

  .input {
    flex: 1;
    font-size: 32rpx;
    color: #333;
    height: 100%;
    border: none;
    outline: none;
  }

  .input::placeholder {
    color: #999;
  }

  /* 验证码特殊样式 */
  .captcha-container {
    display: flex;
    align-items: center;
    gap: 25rpx;
  }

  .captcha-input-item {
    flex: 1;
    min-width: 0;
  }

  .captcha-image {
    flex-shrink: 0;
  }

  .captcha-img {
    width: 200rpx;
    height: 90rpx;
    border-radius: 8rpx;
    border: 2rpx solid #d0d0d0;
    background: #f8f9fa;
    cursor: pointer;
    display: block;
  }

  /* 注册按钮 */
  .action-btn {
    margin: 60rpx 0 40rpx;
  }

  .register-btn {
    width: 100%;
    height: 100rpx;
    background: #3FA9E7;
    color: #fff;
    border: none;
    border-radius: 50rpx;
    font-size: 32rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 20rpx rgba(63, 169, 231, 0.3);
    transition: all 0.3s ease;
  }

  .register-btn:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 12rpx rgba(63, 169, 231, 0.3);
  }

  .register-btn::after {
    border: none;
  }

  /* 链接区域 */
  .link-section {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 40rpx 0;
    gap: 10rpx;
  }

  .link-text {
    color: #666;
    font-size: 28rpx;
  }

  .login-link {
    color: #3FA9E7;
    text-decoration: underline;
  }

  /* 通用样式 */
  .flex {
    display: flex;
  }

  .align-center {
    align-items: center;
  }

  .justify-center {
    justify-content: center;
  }

  .text-center {
    text-align: center;
  }
</style>
