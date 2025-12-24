<template>
	<view class="forget-password-container">
		<!-- 头部logo区域 -->
		<view class="logo-content">
            <image class="logo-image" :src="globalConfig.appInfo.logo200" mode="widthFix"></image>
            <text class="title">安特社区六助密码找回</text>
        </view>
		<view class="form-content">

		
			<!-- 账号输入 -->
			<view class="input-wrapper">
				<view class="input-item flex align-center" :class="{ 'error': errors.username }">
					<uni-icons type="person" size="20" color="#999" class="icon"></uni-icons>
					<input v-model="resetForm.username" @blur="validateUsername" class="input" type="text" placeholder="请输入账号" maxlength="30" />
				</view>
				<view v-if="errors.username" class="error-message">{{ errors.username }}</view>
			</view>

			<!-- 手机号输入 -->
			<view class="input-wrapper">
				<view class="input-item flex align-center" :class="{ 'error': errors.phone }">
					<uni-icons type="phone" size="20" color="#999" class="icon"></uni-icons>
					<input v-model="resetForm.phone" @input="handlePhoneInput" @blur="validatePhone" class="input" type="number" placeholder="请输入手机号"/>
				</view>
				<view v-if="errors.phone" class="error-message">{{ errors.phone }}</view>
			</view>

			<!-- 短信验证码 -->
			<view class="input-wrapper">
				<view class="input-item captcha-item flex align-center" :class="{ 'error': errors.smsCode }">
					<uni-icons type="chatboxes" size="20" color="#999" class="icon"></uni-icons>
					<input v-model="resetForm.smsCode" @blur="validateSmsCode" class="input captcha-input" type="number" placeholder="请输入短信验证码" maxlength="6" />
					<button @click="sendSmsCode" :disabled="smsCountdown > 0" class="sms-btn">
						{{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}
					</button>
				</view>
				<view v-if="errors.smsCode" class="error-message">{{ errors.smsCode }}</view>
			</view>

			<!-- 新密码 -->
			<view class="input-wrapper">
				<view class="input-item flex align-center" :class="{ 'error': errors.newPassword }">
					<uni-icons type="locked" size="20" color="#999" class="icon"></uni-icons>
					<input v-model="resetForm.newPassword" @blur="validateNewPassword" type="password" class="input" placeholder="请输入新密码" maxlength="20" />
				</view>
				<view v-if="errors.newPassword" class="error-message">{{ errors.newPassword }}</view>
			</view>

			<!-- 确认新密码 -->
			<view class="input-wrapper">
				<view class="input-item flex align-center" :class="{ 'error': errors.confirmNewPassword }">
					<uni-icons type="locked" size="20" color="#999" class="icon"></uni-icons>
					<input v-model="resetForm.confirmPassword" @blur="validateConfirmNewPassword" type="password" class="input" placeholder="请确认新密码" maxlength="20" />
				</view>
				<view v-if="errors.confirmNewPassword" class="error-message">{{ errors.confirmNewPassword }}</view>
			</view>

			<!-- 提交按钮 -->
			<view class="action-btn">
				<button @click="resetPassword" :loading="loading" class="next-btn cu-btn block bg-blue lg round">
					重置密码
				</button>
			</view>

			<!-- 返回登录链接 -->
			<view class="back-login text-center">
				<text @click="goToLogin" class="text-blue">返回登录</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { getCode, updatePassword } from '@/api/login'
	import { setUserName, removePassWord } from '@/utils/auth'

	export default {
		data() {
			return {
				globalConfig: getApp().globalData.config,
				loading: false,
				smsCountdown: 0, // 短信倒计时
				smsTimer: null,

				// 重置密码表单（合并所有字段）
				resetForm: {
					username: '',
					phone: '',
					smsCode: '',
					newPassword: '',
					confirmPassword: ''
				},

				// 错误信息
				errors: {
					username: '',
					phone: '',
					smsCode: '',
					newPassword: '',
					confirmNewPassword: ''
				}
			}
		},

		onUnload() {
			// 清除定时器
			if (this.smsTimer) {
				clearInterval(this.smsTimer)
			}
		},

		methods: {
			// 通用错误提示方法
			showError(title, content = '') {
				if (content) {
					uni.showModal({
						title,
						content,
						showCancel: false,
						confirmText: '确定'
					})
				} else {
					uni.showToast({
						title,
						icon: 'none'
					})
				}
			},

			// 手机号格式验证
			isValidPhone(phone) {
				return /^1[3-9]\d{9}$/.test(phone)
			},

			// 处理手机号输入，自动去除空格
			handlePhoneInput(e) {
				// 去除所有空格
				const cleanValue = e.detail.value.replace(/\s/g, '');
				this.resetForm.phone = cleanValue;
				// 清除错误状态
				this.errors.phone = '';
			},

			// 验证账号
			validateUsername() {
				const username = this.resetForm.username;
				if (!username) {
					this.errors.username = '请输入账号';
				} else if (username.length < 2) {
					this.errors.username = '账号长度不能少于2位';
				} else {
					this.errors.username = '';
				}
			},

			// 验证手机号
			validatePhone() {
				const phone = this.resetForm.phone;
				if (!phone) {
					this.errors.phone = '请输入手机号';
				} else if (!this.isValidPhone(phone)) {
					this.errors.phone = '请输入正确的手机号格式';
				} else {
					this.errors.phone = '';
				}
			},

			// 验证短信验证码
			validateSmsCode() {
				const smsCode = this.resetForm.smsCode;
				if (!smsCode) {
					this.errors.smsCode = '请输入短信验证码';
				} else if (smsCode.length !== 4) {
					this.errors.smsCode = '请输入4位验证码';
				} else {
					this.errors.smsCode = '';
				}
			},

			// 验证新密码
			validateNewPassword() {
				const newPassword = this.resetForm.newPassword;
				if (!newPassword) {
					this.errors.newPassword = '请输入新密码';
				} else if (newPassword.length < 6) {
					this.errors.newPassword = '密码长度不能少于6位';
				} else {
					this.errors.newPassword = '';
				}
				// 如果确认密码已输入，重新验证确认密码
				if (this.resetForm.confirmPassword) {
					this.validateConfirmNewPassword();
				}
			},

			// 验证确认新密码
			validateConfirmNewPassword() {
				const confirmPassword = this.resetForm.confirmPassword;
				const newPassword = this.resetForm.newPassword;
				if (!confirmPassword) {
					this.errors.confirmNewPassword = '请再次输入新密码';
				} else if (newPassword !== confirmPassword) {
					this.errors.confirmNewPassword = '两次输入的密码不一致';
				} else {
					this.errors.confirmNewPassword = '';
				}
			},

			// 统一验证所有字段
			validateAllFields() {
				this.validateUsername()
				this.validatePhone()
				this.validateSmsCode()
				this.validateNewPassword()
				this.validateConfirmNewPassword()

				// 检查是否有任何错误
				return !Object.values(this.errors).some(error => error !== '')
			},
			// 发送短信验证码
			async sendSmsCode() {
				// 验证必填字段
				if (!this.resetForm.username) {
					this.showError('请输入账号')
					return
				}

				if (!this.resetForm.phone) {
					this.showError('请输入手机号')
					return
				}

				if (!this.isValidPhone(this.resetForm.phone)) {
					this.showError('手机号格式错误', '请输入正确的11位手机号码')
					return
				}

				try {
					// 调用login.js中的getCode API，传递username和phone参数
					const response = await getCode({
						userName: this.resetForm.username,
						phonenumber: this.resetForm.phone
					})

					console.log('验证码API响应:', response)

					uni.showToast({
						title: '验证码已发送',
						icon: 'success'
					})

					// 开始倒计时
					this.startCountdown()
				} catch (error) {
					console.error('发送短信验证码失败:', error)
					this.showError('发送验证码失败', '发送短信验证码失败，请检查手机号是否为注册时的手机号')
				}
			},

			// 开始倒计时
			startCountdown() {
				this.smsCountdown = 60
				this.smsTimer = setInterval(() => {
					this.smsCountdown--
					if (this.smsCountdown <= 0) {
						clearInterval(this.smsTimer)
						this.smsTimer = null
					}
				}, 1000)
			},

			// 重置密码
			async resetPassword() {
				// 统一验证所有字段
				if (!this.validateAllFields()) {
					return
				}

				this.loading = true
				try {
					// 调用updatePassword API，传递captcha（验证码）和password（新密码）参数
					const response = await updatePassword({
						captcha: this.resetForm.smsCode,
						password: this.resetForm.newPassword,
						userName: this.resetForm.username,
						phonenumber: this.resetForm.phone
					})

					console.log('重置密码API响应:', response)

					// 更新缓存：保存用户名，清除密码
					this.updateCacheAfterReset()

					uni.showModal({
						title: '重置成功',
						content: '密码重置成功，即将跳转到登录页面',
						showCancel: false,
						confirmText: '确定',
						success: () => {
							// 用户点击确定后立即跳转
							this.goToLogin()
						}
					})

				} catch (error) {
					console.error('重置密码失败:', error)
					this.showError('重置失败', '密码重置失败，请检查验证码是否正确或重新获取验证码后重试')
				} finally {
					this.loading = false
				}
			},

			// 更新缓存：保存用户名，清除密码
			updateCacheAfterReset() {
				try {
					// 保存用户名到缓存，方便登录页面自动填充
					setUserName(this.resetForm.username)

					// 清除密码缓存，确保安全性
					removePassWord()

					console.log('缓存更新成功 - 用户名已保存，密码已清除')
				} catch (error) {
					console.error('更新缓存失败:', error)
				}
			},

			// 返回登录页面
			goToLogin() {
				uni.navigateTo({
                     url: '/pages/login'
                })
			}
		}
	}
</script>

<style lang="scss" scoped>
	.forget-password-container {
		min-height: 100vh;
		background: linear-gradient(180deg, #f6fcfd 60%, #eafcff 100%);
		padding: 0 40rpx;
		padding-bottom: 100rpx; /* 增加底部间距，确保弹窗有足够空间 */
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

	/* 表单内容区域 */
	.form-content {
		background: #fff;
		border-radius: 24rpx;
		padding: 60rpx 40rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.1);
	}
	
	/* 输入框动画 */
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.step-desc {
		font-size: 28rpx;
		color: #666;
		text-align: center;
		margin-bottom: 60rpx;
		line-height: 1.5;
	}

	/* 输入框样式 */
	.input-wrapper {
		position: relative;
		margin-bottom: 40rpx; /* 固定间距，为错误信息预留空间 */
	}

	.input-item {
		background: #f8f9fa;
		border-radius: 12rpx;
		padding: 0 30rpx;
		height: 100rpx;
		border: 2rpx solid transparent;
		transition: all 0.3s ease;
	}

	.input-item:focus-within {
		border-color: #3FA9E7;
		background: #fff;
		box-shadow: 0 0 0 4rpx rgba(62, 198, 198, 0.1);
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

	.icon {
		margin-right: 20rpx;
	}

	.input {
		flex: 1;
		font-size: 32rpx;
		color: #333;
		height: 100%;
	}

	.input::placeholder {
		color: #999;
	}

	/* 短信验证码按钮 */
	.sms-btn {
		background: #3FA9E7 !important;
		color: #fff !important;
		border: none !important;
		border-radius: 8rpx !important;
		padding: 16rpx 24rpx !important;
		font-size: 24rpx !important;
		white-space: nowrap !important;
		margin-left: 20rpx !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		text-align: center !important;
		line-height: normal !important;
	}

	.sms-btn::after {
		border: none !important;
	}

	.sms-btn:disabled {
		background: #ccc;
		color: #999;
	}

	/* 密码提示 */
	.password-tips {
		background: #f0f9ff;
		border: 2rpx solid #e0f2fe;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 40rpx;
	}

	.tips-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #3FA9E7;
		display: block;
		margin-bottom: 16rpx;
	}

	.tips-item {
		font-size: 26rpx;
		color: #3FA9E7;
		display: block;
		line-height: 1.6;
		margin-bottom: 8rpx;
	}

	/* 按钮样式 */
	.action-btn {
		margin: 60rpx 0 40rpx;
	}

	.next-btn {
		height: 100rpx !important;
		font-size: 32rpx !important;
		font-weight: bold !important;
		border-radius: 50rpx !important;
		background: #3FA9E7 !important;
		border: none !important;
		color: #fff !important;
		transition: all 0.3s ease !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		text-align: center !important;
		line-height: 100rpx !important;
	}

	.next-btn::after {
		border: none !important;
	}

	.next-btn:active {
		transform: translateY(2rpx);
		box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
	}

	/* 成功页面 */
	.success-content {
		text-align: center;
		padding: 60rpx 0;
	}

	.success-icon {
		margin-bottom: 40rpx;
	}

	.success-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #4cd964;
		margin-bottom: 20rpx;
	}

	.success-desc {
		font-size: 28rpx;
		color: #666;
		line-height: 1.5;
		margin-bottom: 40rpx;
	}

	/* 返回登录链接 */
	.back-login {
		margin-top: 40rpx;
		padding-bottom: 20rpx;
	}

	.text-blue {
		color: #3FA9E7;
		font-size: 28rpx;
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

	.block {
		display: block;
		width: 100%;
	}

	.cu-btn {
		border: none !important;
		outline: none !important;
		appearance: none !important;
		-webkit-appearance: none !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		text-align: center !important;
	}

	.cu-btn::after {
		border: none !important;
		background: none !important;
	}

	.bg-blue {
		background: #3FA9E7;
	}

	.lg {
		font-size: 32rpx;
	}

	.round {
		border-radius: 50rpx;
	}
</style>