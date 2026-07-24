<template>
  <view class="page-container">
    <!-- 自定义确认弹窗 -->
    <view class="modal-mask" v-if="showConfirmModal" @click="closeConfirmModal">
      <view class="modal-container" @click.stop>
        <view class="modal-header">
          <text class="modal-title">注销账号</text>
        </view>
        <view class="modal-body confirm-body">
          <text class="confirm-text">确定要注销账号吗？</text>
          <text class="confirm-warning">注销后账号将无法恢复，所有数据将被清除！</text>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel-btn" @click="closeConfirmModal">取消</view>
          <view class="modal-btn confirm-btn danger-btn" @click="confirmCancelAction">确定</view>
        </view>
      </view>
    </view>

    <!-- 自定义密码输入弹窗 -->
    <view class="modal-mask" v-if="showPasswordModal" @click="closePasswordModal">
      <view class="modal-container" @click.stop>
        <view class="modal-header">
          <text class="modal-title">身份验证</text>
          <text class="modal-subtitle">请输入登录密码以确认注销</text>
        </view>
        <view class="modal-body">
          <view class="input-wrapper">
            <input 
              class="password-input" 
              type="password" 
              v-model="inputPassword" 
              placeholder="请输入密码"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel-btn" @click="closePasswordModal">取消</view>
          <view class="modal-btn confirm-btn" @click="submitPassword">确定</view>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content-section">
      <!-- 设置卡片列表 -->
      <view class="setting-cards">
        <!-- 修改密码 -->
        <view class="setting-card clickable-card" @click="handleToPwd">
          <view class="card-icon password-icon">
            <uni-icons type="locked-filled" size="24" color="#fff"></uni-icons>
          </view>
          <view class="card-content">
            <text class="card-label">账户安全</text>
            <text class="card-value">修改密码</text>
          </view>
          <view class="card-arrow">
            <uni-icons type="arrowright" size="16" color="#ccc"></uni-icons>
          </view>
        </view>

        <!-- 清理缓存 -->
        <view class="setting-card clickable-card" @click="handleCleanTmp">
          <view class="card-icon clean-icon">
            <uni-icons type="trash-filled" size="24" color="#fff"></uni-icons>
          </view>
          <view class="card-content">
            <text class="card-label">存储管理</text>
            <text class="card-value">清理缓存</text>
          </view>
          <view class="card-arrow">
            <uni-icons type="arrowright" size="16" color="#ccc"></uni-icons>
          </view>
        </view>

        <!-- 注销账号 -->
        <view class="setting-card clickable-card" @click="handleCancelAccount">
          <view class="card-icon cancel-icon">
            <uni-icons type="minus-filled" size="24" color="#fff"></uni-icons>
          </view>
          <view class="card-content">
            <text class="card-label">账号管理</text>
            <text class="card-value">注销账号</text>
          </view>
          <view class="card-arrow">
            <uni-icons type="arrowright" size="16" color="#ccc"></uni-icons>
          </view>
        </view>
      </view>

      <!-- 退出登录按钮 -->
      <view class="logout-section">
        <view class="logout-card" @click="handleLogout">
          <view class="logout-content">
            <text class="logout-text">退出登录</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import { cancelAccount } from '@/api/system/user'
  
  export default {
    data() {
      return {
        showConfirmModal: false,
        showPasswordModal: false,
        inputPassword: ''
      }
    },
    methods: {
      handleToPwd() {
        this.$tab.navigateTo('/pages/my/pwd/index')
      },
      handleCleanTmp() {
        this.$modal.confirm('确定要清理缓存吗？\n将保留登录信息，清理其他临时数据').then(() => {
          this.cleanCache()
        })
      },
      
      // 清理缓存方法
      cleanCache() {
        this.$modal.loading('正在清理缓存...')
        
        try {
          // 需要保留的重要缓存键名
          const preserveKeys = [
            'App-Token',           // 用户token
            'user_password_cache',    // 用户密码缓存
            'user_username',         // 用户名缓存
            'user_info',              // 用户信息
            'storage_data',           // 存储数据
          ]
          
          // 获取所有存储的数据
          const storageInfo = uni.getStorageInfoSync()
          const allKeys = storageInfo.keys || []
          
          // 备份需要保留的数据
          const preserveData = {}
          preserveKeys.forEach(key => {
            try {
              const value = uni.getStorageSync(key)
              if (value) {
                preserveData[key] = value
              }
            } catch (e) {
              console.log(`备份缓存 ${key} 失败:`, e)
            }
          })
          
          // 清理所有缓存
          uni.clearStorageSync()
          
          // 恢复重要数据
          Object.keys(preserveData).forEach(key => {
            try {
              uni.setStorageSync(key, preserveData[key])
            } catch (e) {
              console.log(`恢复缓存 ${key} 失败:`, e)
            }
          })
          
          // 计算清理的缓存数量
          const cleanedCount = allKeys.length - Object.keys(preserveData).length
          
          this.$modal.closeLoading()
          this.$modal.msgSuccess(`缓存清理完成！\n清理了 ${cleanedCount} 项临时数据`)
          
        } catch (error) {
          this.$modal.closeLoading()
          console.error('清理缓存失败:', error)
          this.$modal.msgError('缓存清理失败，请稍后重试')
        }
      },
      handleLogout() {
        this.$modal.confirm('确定注销并退出系统吗？').then(() => {
          this.$store.dispatch('LogOut').then(() => {}).finally(()=>{
            this.$tab.reLaunch('/pages/auth/login')
          })
        })
      },
      
      // 注销账号
      handleCancelAccount() {
        this.showConfirmModal = true
      },
      
      // 关闭确认弹窗
      closeConfirmModal() {
        this.showConfirmModal = false
      },
      
      // 确认注销操作
      confirmCancelAction() {
        this.showConfirmModal = false
        this.showPasswordInput()
      },
      
      // 显示密码输入框
      showPasswordInput() {
        this.inputPassword = ''
        this.showPasswordModal = true
      },
      
      // 关闭密码弹窗
      closePasswordModal() {
        this.showPasswordModal = false
        this.inputPassword = ''
      },
      
      // 提交密码
      submitPassword() {
        if (!this.inputPassword) {
          this.$modal.msgError('请输入密码')
          return
        }
        const password = this.inputPassword
        this.closePasswordModal()
        this.confirmCancelAccount(password)
      },
      
      // 确认注销账号
      confirmCancelAccount(password) {
        this.$modal.loading('正在注销账号...')
        cancelAccount(password).then(() => {
          this.$modal.closeLoading()
          this.$modal.msgSuccess('账号已注销')
          // 清除所有缓存并跳转到登录页
          uni.clearStorageSync()
          this.$tab.reLaunch('/pages/auth/login')
        }).catch((err) => {
          this.$modal.closeLoading()
          this.$modal.msgError(err.msg || '注销失败，请检查密码是否正确')
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
  padding: 30rpx;
}

/* 设置卡片 */
.setting-cards {
  margin-bottom: 40rpx;
}

.setting-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
}

.clickable-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.clickable-card:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
}

.card-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
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

.card-arrow {
  margin-left: auto;
  padding-left: 20rpx;
}

/* 退出登录区域 */
.logout-section {
  margin-top: 100rpx;
}

.logout-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.logout-card:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
}

.logout-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.logout-text {
  font-size: 36rpx;
  color: #ff4757;
  font-weight: 500;
 
}

/* 图标主题色 */
.password-icon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
}

.clean-icon {
  background: linear-gradient(135deg, #A8E6CF 0%, #88D8A3 100%);
}

.cancel-icon {
  background: linear-gradient(135deg, #ffa502 0%, #ff7f50 100%);
}

/* 自定义弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-container {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  padding: 40rpx 30rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffa502 0%, #ff7f50 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
}

.modal-subtitle {
  font-size: 26rpx;
  color: #999;
}

.modal-body {
  padding: 20rpx 40rpx 40rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f5f6f7;
  border-radius: 16rpx;
  padding: 24rpx 30rpx;
  border: 2rpx solid #eee;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #ffa502;
  background: #fff;
}

.password-input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.input-placeholder {
  color: #ccc;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #eee;
}

.modal-btn {
  flex: 1;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  transition: all 0.3s ease;
}

.modal-btn:active {
  background: #f5f5f5;
}

.cancel-btn {
  color: #666;
  border-right: 1rpx solid #eee;
}

.confirm-btn {
  color: #ffa502;
  font-weight: 500;
}

.danger-btn {
  color: #ff4757;
}

.warning-icon {
  background: linear-gradient(135deg, #ffa502 0%, #ff7f50 100%);
}

.confirm-body {
  text-align: center;
}

.confirm-text {
  display: block;
  font-size: 32rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.confirm-warning {
  display: block;
  font-size: 30rpx;
  color: #ff4757;
  line-height: 1.5;
}

.warning-icon {
  background: linear-gradient(135deg, #ffa502 0%, #ff7f50 100%);
}

.danger-btn {
  color: #ff4757;
}
</style>
