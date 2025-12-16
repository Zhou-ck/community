<template>
  <view class="login-container">
    <!-- 头部logo区域 -->
    <view class="logo-content">
      <image class="logo-image" :src="globalConfig.appInfo.logo" mode="widthFix"></image>
      <text class="title">安特社区六助登录页</text>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <!-- 账号输入 -->
      <view class="input-wrapper">
        <view class="input-item" :class="{ 'error': errors.username }">
          <uni-icons type="person" size="20" color="#999" class="input-icon"></uni-icons>
          <input v-model="loginForm.username" @input="clearUsernameError" @blur="validateUsername" class="input" type="text" placeholder="请输入账号" maxlength="30" />
        </view>
        <view v-if="errors.username" class="error-message">{{ errors.username }}</view>
      </view>

      <!-- 密码输入 -->
      <view class="input-wrapper">
        <view class="input-item" :class="{ 'error': errors.password }">
          <uni-icons type="locked" size="20" color="#999" class="input-icon"></uni-icons>
          <input v-model="loginForm.password" @input="clearPasswordError" @blur="validatePassword" type="password" class="input" placeholder="请输入密码" maxlength="20" />
        </view>
        <view v-if="errors.password" class="error-message">{{ errors.password }}</view>
      </view>

      <!-- 验证码输入 -->
      <view class="input-wrapper" v-if="captchaEnabled">
        <view class="captcha-container">
          <view class="input-item captcha-input-item" :class="{ 'error': errors.code }">
            <uni-icons type="chatboxes" size="20" color="#999" class="input-icon"></uni-icons>
            <input v-model="loginForm.code" @input="clearCodeError" @blur="validateCode" type="number" class="input" placeholder="请输入验证码" maxlength="4" />
          </view>
          <view class="captcha-image" @click="getCode">
            <image :src="codeUrl" class="captcha-img"></image>
          </view>
        </view>
        <view v-if="errors.code" class="error-message">{{ errors.code }}</view>
      </view>

      <!-- 登录按钮 -->
      <view class="action-btn">
        <button @click="handleLogin" class="login-btn">登录</button>
      </view>

       <!-- 忘记密码和注册链接 -->
      <view class="link-section">
        <text @click="handleUserForget" class="link-text">忘记密码</text>
        <text v-if="register" class="separator">|</text>
        <text v-if="register" @click="handleUserRegister" class="link-text">立即注册</text>
      </view>

      <!-- 用户协议 -->
      <view class="agreement-section">
        <view class="checkbox-wrapper">
          <uni-data-checkbox multiple :value="ruleValue" :localdata="aaa" @change="change"></uni-data-checkbox>
        </view>
        <view class="agreement-links">
          <text @click="handleUserAgrement" class="agreement-link">《用户协议》</text>
          <text @click="handlePrivacy" class="agreement-link">《隐私协议》</text>
        </view>
      </view>
    </view>
    
    <!-- 同意协议提示弹窗 -->
    <view v-if="showRule" class="modal-overlay" @click="closeRule">
      <view class="modal-container" @click.stop>
        <view class="modal-header">
          <text class="modal-title">用户协议及隐私协议提示</text>
        </view>
        <view class="modal-content">
          <text>为了更好地保障您的合法权益，请您阅读并同意以下协议</text>
          <text @click="handleUserAgrement" class="modal-link">《用户协议》</text>
          <text>和</text>
          <text @click="handlePrivacy" class="modal-link">《隐私协议》</text>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeRule">放弃登录</button>
          <button class="modal-btn confirm-btn" @click="confirmRule">同意并继续</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import { getCodeImg } from '@/api/login'
  import { getToken } from '@/utils/auth'

  export default {
    data() {
      return {
        aaa:[{"value": 0,"text": "我已阅读并同意"	}],
		    ruleValue:[],
        codeUrl: "",
        captchaEnabled: true,
        // 用户注册开关
        register: true,
        globalConfig: getApp().globalData.config,
        loginForm: {
          username: "",
          password: "",
          code: "",
          uuid: ""
        },
			showRule:false,
        // 验证规则
        loginRules: {
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
          code: [{
            required: true,
            trigger: "change",
            message: "请输入验证码"
          }]
        },
        // 错误状态
        errors: {
          username: '',
          password: '',
          code: ''
        }
      }
    },
    created() {
      this.getCode()
      this.getRuleValue()
      this.loadSavedCredentials()
    },
    onLoad() {
      //#ifdef H5
      if (getToken()) {
        this.$tab.switchTab('/pages/index')
      }
      //#endif
    },
    methods: {
      // 清除账号错误状态
      clearUsernameError() {
        this.errors.username = '';
      },

      // 清除密码错误状态
      clearPasswordError() {
        this.errors.password = '';
      },

      // 清除验证码错误状态
      clearCodeError() {
        this.errors.code = '';
      },

      // 验证账号
      validateUsername() {
        const username = this.loginForm.username;
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
        const password = this.loginForm.password;
        if (!password) {
          this.errors.password = '请输入密码';
        } else if (password.length < 6) {
          this.errors.password = '密码长度不能少于6位';
        } else {
          this.errors.password = '';
        }
      },

      // 验证验证码
      validateCode() {
        const code = this.loginForm.code;
        if (this.captchaEnabled && !code) {
          this.errors.code = '请输入验证码';
        }else {
          this.errors.code = '';
        }
      },

      // 加载已保存的用户名和密码
      loadSavedCredentials() {
        try {
          const savedUsername = uni.getStorageSync('user_username')
          const savedPassword = uni.getStorageSync('user_password_cache')
          
          // 只有当用户名和密码都存在时才加载，确保数据一致性
          if (savedUsername && savedPassword) {
            this.loginForm.username = savedUsername
            this.loginForm.password = savedPassword
            console.log('已加载保存的用户名:', savedUsername)
          } else {
            // 如果数据不完整，清除所有缓存凭据
            if (savedUsername || savedPassword) {
              uni.removeStorageSync('user_username')
              uni.removeStorageSync('user_password_cache')
              console.log('检测到缓存数据不完整，已清除')
            }
          }
        } catch (e) {
          console.error('加载保存的凭据失败:', e)
        }
      },
      
      // 获取规则值
      getRuleValue(){
        this.ruleValue = [];
      },
      
      // 打开规则弹窗
      openRule(){
        this.showRule = true;
      },
      
      // 关闭规则弹窗
      closeRule(){
        this.showRule = false;
      },
      
      // 确认规则
      confirmRule(){
        this.showRule = false;
        this.ruleValue = [0]; // 设置为已同意
        this.handleLogin();
      },
      
      // 复选框变化事件
      change(e){
        console.log('checkbox change:', e);
        // 处理复选框状态变化
      },
      
      //忘记密码
	  handleUserForget() {
		this.$tab.redirectTo(`/pages/forget`)
		  },
      // 用户注册
      handleUserRegister() {
        this.$tab.redirectTo(`/pages/register`)
      },
      // 隐私协议
      handlePrivacy() {
        this.$tab.navigateTo('/pages/common/privacy/index')
      },
      // 用户协议
      handleUserAgrement() {
        this.$tab.navigateTo('/pages/common/protocol/index')
      },
      // 获取图形验证码
      getCode() {
        getCodeImg().then(res => {
          this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled
          if (this.captchaEnabled) {
            this.codeUrl = 'data:image/gif;base64,' + res.img
            this.loginForm.uuid = res.uuid
          }
        })
      },
      // 登录方法
      async handleLogin() {
        // 首先执行所有输入框验证
        this.validateUsername();
        this.validatePassword();
        if (this.captchaEnabled) {
          this.validateCode();
        }

        // 检查是否有输入错误
        if (this.errors.username || this.errors.password || (this.captchaEnabled && this.errors.code)) {
          return; // 有错误时不提交
        }

        // 检查是否同意用户协议
        if (this.ruleValue.length === 0) {
          // 如果没有同意协议，弹出提示
          this.openRule();
          return;
        }

        this.$modal.loading("登录中，请耐心等待...")
        this.pwdLogin()
      },
      // 密码登录
      async pwdLogin() {
        this.$store.dispatch('Login', this.loginForm).then(() => {
          this.$modal.closeLoading()
          this.loginSuccess()
        }).catch(() => {
          if (this.captchaEnabled) {
            this.getCode()
          }
        })
      },
      // 登录成功后，处理函数
      loginSuccess(result) {
        // 保存用户名和密码到缓存
        try {
          // 保存用户名
          uni.setStorageSync('user_username', this.loginForm.username)
          // 保存密码
          uni.setStorageSync('user_password_cache', this.loginForm.password)
          
          console.log('用户名和密码已保存到本地')
        } catch (e) {
          console.error('保存凭据失败:', e)
        }
        
        // 设置用户信息
        this.$store.dispatch('GetInfo').then(res => {
          // 获取用户信息成功后，立即获取已加入的社区信息
          this.$store.dispatch('CheckTokenAndRefreshCommunity').then(() => {
            console.log('已加载社区信息')
            this.$tab.switchTab('/pages/index')
          }).catch(err => {
            console.error('获取社区信息失败:', err)
            // 即使获取社区信息失败，也跳转到首页
            this.$tab.switchTab('/pages/index')
          })
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  page {
    background-color: #f8f9fa;
  }

  .login-container {
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
    padding: 120rpx 0 80rpx;
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

  /* 登录表单 */
  .login-form {
    background: #fff;
    border-radius: 24rpx;
    padding: 60rpx 40rpx;
    margin-bottom: 40rpx;
    box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.1);
  }

  /* 输入框样式 */
  .input-wrapper {
    position: relative;
    margin-bottom: 40rpx; /* 固定间距，为错误信息预留空间 */
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
    top: 100rpx; /* 紧贴输入框下方 */
    left: 30rpx;
    color: #ff4757;
    font-size: 22rpx;
    line-height: 1.4;
    white-space: nowrap; /* 防止换行 */
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
    min-width: 0; /* 确保可以正常缩放 */
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

  /* 登录按钮 */
  .action-btn {
    margin: 60rpx 0 40rpx;
  }

  .login-btn {
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

  .login-btn:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 12rpx rgba(63, 169, 231, 0.3);
  }

  .login-btn::after {
    border: none;
  }

   /* 链接区域 */
  .link-section {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 40rpx 0;
    gap: 20rpx;
  }

  .link-text {
    color: #3FA9E7;
    font-size: 28rpx;
    text-decoration: underline;
  }

  .separator {
    color: #ccc;
    font-size: 28rpx;
  }
  /* 用户协议区域 */
  .agreement-section {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 40rpx;
    gap: 10rpx;
  }

  .checkbox-wrapper {
    flex-shrink: 0;
  }

  /* 复选框样式自定义 */
  .checkbox-wrapper ::v-deep .uni-data-checklist {
    flex-direction: row;
    align-items: center;
  }

  .checkbox-wrapper ::v-deep .checklist-group {
    flex-direction: row;
    align-items: center;
  }

  .checkbox-wrapper ::v-deep .checklist-box {
    margin-right: 8rpx;
  }

  .checkbox-wrapper ::v-deep .checkbox__inner {
    border-color: #3FA9E7 !important;
  }

  .checkbox-wrapper ::v-deep .checkbox__inner.checkbox__inner--checked {
    background-color: #3FA9E7 !important;
    border-color: #3FA9E7 !important;
  }

  .checkbox-wrapper ::v-deep .checkbox__inner-icon {
    border-right-color: #3FA9E7 !important;
    border-bottom-color: #3FA9E7 !important;
  }

  .checkbox-wrapper ::v-deep .checklist-text {
    color: #666 !important;
    font-size: 28rpx !important;
  }


  .agreement-link {
    color: #3FA9E7;
    font-size: 26rpx;
    text-decoration: underline;
  }

  .agreement-links {
    display: flex;
    align-items: center;
    gap: 10rpx;
  }


  /* 原生弹窗样式 */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .modal-container {
    background: #fff;
    border-radius: 16rpx;
    width: 620rpx;
    max-width: 90%;
    overflow: hidden;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
  }

  .modal-header {
    padding: 40rpx 40rpx 20rpx;
    text-align: center;
    border-bottom: 1rpx solid #f0f0f0;
  }

  .modal-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
  }

  .modal-content {
    padding: 40rpx;
    line-height: 1.6;
    font-size: 28rpx;
    color: #666;
    text-align: left;
  }

  .modal-link {
    color: #3FA9E7;
    text-decoration: underline;
    margin: 0 8rpx;
  }

  .modal-footer {
    display: flex;
    border-top: 1rpx solid #f0f0f0;
  }

  .modal-btn {
    flex: 1;
    height: 100rpx;
    line-height: 100rpx;
    border: none;
    font-size: 32rpx;
    background: transparent;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-btn::after {
    border: none;
  }

  .cancel-btn {
    color: #666;
    border-right: 1rpx solid #f0f0f0;
  }

  .confirm-btn {
    color: #3FA9E7;
    font-weight: bold;
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
